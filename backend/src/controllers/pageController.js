const Page = require('../models/Page');
const Site = require('../models/Site');
const { asyncHandler, ApiError, slugify } = require('../utils/helpers');

/**
 * @desc    Get all pages for a site
 * @route   GET /api/sites/:siteId/pages
 * @access  Private/Public (if site is published)
 */
exports.getPages = asyncHandler(async (req, res, next) => {
  const { siteId } = req.params;

  // Verify site exists
  const site = await Site.findById(siteId);
  if (!site) {
    throw new ApiError('Site not found', 404);
  }
  
  // If user is authenticated, check ownership
  if (req.user) {
    if (site.userId.toString() !== req.user._id.toString()) {
      throw new ApiError('Not authorized to access these pages', 403);
    }
  } else {
    // For public access, site must be published
    if (!site.isPublished) {
      throw new ApiError('Not authorized to access these pages', 403);
    }
  }

  const pages = await Page.find({ siteId }).sort({ order: 1 });

  res.status(200).json({
    success: true,
    count: pages.length,
    data: pages
  });
});

/**
 * @desc    Get single page
 * @route   GET /api/pages/:id
 * @access  Private
 */
exports.getPage = asyncHandler(async (req, res, next) => {
  const page = await Page.findById(req.params.id).populate('siteId', 'userId siteName');

  if (!page) {
    throw new ApiError('Page not found', 404);
  }

  // Check ownership via site
  if (page.siteId.userId.toString() !== req.user._id.toString()) {
    throw new ApiError('Not authorized to access this page', 403);
  }

  res.status(200).json({
    success: true,
    data: page
  });
});

/**
 * @desc    Create new page
 * @route   POST /api/sites/:siteId/pages
 * @access  Private
 */
exports.createPage = asyncHandler(async (req, res, next) => {
  const { siteId } = req.params;
  const { pageName, slug, content, isHome, settings } = req.body;

  // Verify site exists and user owns it
  const site = await Site.findById(siteId);
  if (!site) {
    throw new ApiError('Site not found', 404);
  }
  
  if (site.userId.toString() !== req.user._id.toString()) {
    throw new ApiError('Not authorized to create pages for this site', 403);
  }

  // Generate unique slug if not provided
  let finalSlug = slug || slugify(pageName);
  
  // Check if slug already exists
  const existingPage = await Page.findOne({ siteId, slug: finalSlug });
  if (existingPage) {
    finalSlug = await Page.generateUniqueSlug(siteId, finalSlug);
  }

  // Get the highest order number
  const lastPage = await Page.findOne({ siteId }).sort({ order: -1 });
  const order = lastPage ? lastPage.order + 1 : 0;

  // Create page
  const page = await Page.create({
    siteId,
    pageName,
    slug: finalSlug,
    content: content || [],
    isHome: isHome || false,
    order,
    settings: settings || {}
  });

  // Update site's lastEditedAt
  site.lastEditedAt = Date.now();
  await site.save();

  res.status(201).json({
    success: true,
    message: 'Page created successfully',
    data: page
  });
});

/**
 * @desc    Update page
 * @route   PUT /api/pages/:id
 * @access  Private
 */
exports.updatePage = asyncHandler(async (req, res, next) => {
  let page = await Page.findById(req.params.id).populate('siteId', 'userId');

  if (!page) {
    throw new ApiError('Page not found', 404);
  }

  // Check ownership via site
  if (page.siteId.userId.toString() !== req.user._id.toString()) {
    throw new ApiError('Not authorized to update this page', 403);
  }

  // If slug is being changed, check uniqueness
  if (req.body.slug && req.body.slug !== page.slug) {
    const existingPage = await Page.findOne({
      siteId: page.siteId._id,
      slug: req.body.slug,
      _id: { $ne: page._id }
    });
    
    if (existingPage) {
      throw new ApiError('Slug already exists for this site', 400);
    }
  }

  // Update page
  page = await Page.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Update site's lastEditedAt
  await Site.findByIdAndUpdate(page.siteId, { lastEditedAt: Date.now() });

  res.status(200).json({
    success: true,
    message: 'Page updated successfully',
    data: page
  });
});

/**
 * @desc    Delete page
 * @route   DELETE /api/pages/:id
 * @access  Private
 */
exports.deletePage = asyncHandler(async (req, res, next) => {
  const page = await Page.findById(req.params.id).populate('siteId', 'userId');

  if (!page) {
    throw new ApiError('Page not found', 404);
  }

  // Check ownership via site
  if (page.siteId.userId.toString() !== req.user._id.toString()) {
    throw new ApiError('Not authorized to delete this page', 403);
  }

  // Prevent deleting the only page
  const pageCount = await Page.countDocuments({ siteId: page.siteId._id });
  if (pageCount === 1) {
    throw new ApiError('Cannot delete the only page of a site', 400);
  }

  // If deleting home page, set another page as home
  if (page.isHome) {
    const nextPage = await Page.findOne({
      siteId: page.siteId._id,
      _id: { $ne: page._id }
    }).sort({ order: 1 });
    
    if (nextPage) {
      nextPage.isHome = true;
      await nextPage.save();
    }
  }

  await page.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Page deleted successfully'
  });
});

/**
 * @desc    Reorder pages
 * @route   PUT /api/sites/:siteId/pages/reorder
 * @access  Private
 */
exports.reorderPages = asyncHandler(async (req, res, next) => {
  const { siteId } = req.params;
  const { pageOrders } = req.body; // Array of { pageId, order }

  // Verify site exists and user owns it
  const site = await Site.findById(siteId);
  if (!site) {
    throw new ApiError('Site not found', 404);
  }
  
  if (site.userId.toString() !== req.user._id.toString()) {
    throw new ApiError('Not authorized to reorder pages for this site', 403);
  }

  // Update page orders
  const updatePromises = pageOrders.map(({ pageId, order }) =>
    Page.findOneAndUpdate(
      { _id: pageId, siteId },
      { order },
      { new: true }
    )
  );

  await Promise.all(updatePromises);

  const pages = await Page.find({ siteId }).sort({ order: 1 });

  res.status(200).json({
    success: true,
    message: 'Pages reordered successfully',
    data: pages
  });
});

/**
 * @desc    Duplicate page
 * @route   POST /api/pages/:id/duplicate
 * @access  Private
 */
exports.duplicatePage = asyncHandler(async (req, res, next) => {
  const originalPage = await Page.findById(req.params.id).populate('siteId', 'userId');

  if (!originalPage) {
    throw new ApiError('Page not found', 404);
  }

  // Check ownership via site
  if (originalPage.siteId.userId.toString() !== req.user._id.toString()) {
    throw new ApiError('Not authorized to duplicate this page', 403);
  }

  // Generate unique slug
  const baseSlug = `${originalPage.slug}-copy`;
  const uniqueSlug = await Page.generateUniqueSlug(originalPage.siteId._id, baseSlug);

  // Get the highest order number
  const lastPage = await Page.findOne({ siteId: originalPage.siteId._id }).sort({ order: -1 });
  const order = lastPage ? lastPage.order + 1 : 0;

  // Create duplicate page
  const pageData = originalPage.toObject();
  delete pageData._id;
  delete pageData.createdAt;
  delete pageData.updatedAt;

  const duplicatedPage = await Page.create({
    ...pageData,
    pageName: `${originalPage.pageName} (Copy)`,
    slug: uniqueSlug,
    isHome: false,
    order
  });

  res.status(201).json({
    success: true,
    message: 'Page duplicated successfully',
    data: duplicatedPage
  });
});

/**
 * @desc    Update page content (for editor)
 * @route   PATCH /api/pages/:id/content
 * @access  Private
 */
exports.updatePageContent = asyncHandler(async (req, res, next) => {
  const { content } = req.body;

  const page = await Page.findById(req.params.id).populate('siteId', 'userId');

  if (!page) {
    throw new ApiError('Page not found', 404);
  }

  // Check ownership via site
  if (page.siteId.userId.toString() !== req.user._id.toString()) {
    throw new ApiError('Not authorized to update this page', 403);
  }

  page.content = content;
  await page.save();

  // Update site's lastEditedAt
  await Site.findByIdAndUpdate(page.siteId._id, { lastEditedAt: Date.now() });

  res.status(200).json({
    success: true,
    message: 'Page content updated successfully',
    data: page
  });
});
