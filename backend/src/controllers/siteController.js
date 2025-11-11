const Site = require('../models/Site');
const Page = require('../models/Page');
const { asyncHandler, ApiError, paginatedResponse, slugify } = require('../utils/helpers');

/**
 * @desc    Get all sites (no auth required - OAuth provider handles it)
 * @route   GET /api/sites
 * @access  Public
 */
exports.getSites = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search, isPublished, subdomain } = req.query;
  
  const query = {};
  
  // If subdomain is provided, search by subdomain (public access)
  if (subdomain) {
    query.subdomain = subdomain;
    // For public subdomain access, only return published sites
    query.isPublished = true;
  }
  // No user filtering - OAuth handles auth on client side
  
  if (search) {
    query.siteName = { $regex: search, $options: 'i' };
  }
  
  if (isPublished !== undefined) {
    query.isPublished = isPublished === 'true';
  }

  const skip = (page - 1) * limit;
  
  const [sites, total] = await Promise.all([
    Site.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('themeId', 'name colors fonts'),
    Site.countDocuments(query)
  ]);

  paginatedResponse(res, sites, parseInt(page), parseInt(limit), total, 'Sites retrieved successfully');
});

/**
 * @desc    Get single site
 * @route   GET /api/sites/:id
 * @access  Private
 */
exports.getSite = asyncHandler(async (req, res, next) => {
  const site = await Site.findById(req.params.id)
    .populate('themeId', 'name description colors fonts effects')
    .populate({
      path: 'pages',
      options: { sort: { order: 1 } }
    });

  if (!site) {
    throw new ApiError('Site not found', 404);
  }

  // OAuth provider handles authorization

  res.status(200).json({
    success: true,
    data: site
  });
});

/**
 * @desc    Create new site
 * @route   POST /api/sites
 * @access  Private
 */
exports.createSite = asyncHandler(async (req, res, next) => {
  const { siteName, subdomain, description } = req.body;

  // Check if subdomain is available
  const existingSubdomain = await Site.findOne({ subdomain: subdomain.toLowerCase() });
  if (existingSubdomain) {
    throw new ApiError('Subdomain already taken', 400);
  }

  // Create site - use 'default-user' if no OAuth user available
  const site = await Site.create({
    userId: req.user?._id || 'default-user',
    siteName,
    subdomain: subdomain.toLowerCase(),
    description: description || ''
  });

  // Create default home page
  await Page.create({
    siteId: site._id,
    pageName: 'Home',
    slug: '/',
    content: [],
    isHome: true,
    order: 0
  });

  const populatedSite = await Site.findById(site._id).populate('pages');

  res.status(201).json({
    success: true,
    message: 'Site created successfully',
    data: populatedSite
  });
});

/**
 * @desc    Update site
 * @route   PUT /api/sites/:id
 * @access  Private
 */
exports.updateSite = asyncHandler(async (req, res, next) => {
  let site = await Site.findById(req.params.id);

  if (!site) {
    throw new ApiError('Site not found', 404);
  }

  // Check ownership (OAuth user ID is a string)

  // Check if subdomain is being changed
  if (req.body.subdomain && req.body.subdomain !== site.subdomain) {
    const existingSubdomain = await Site.findOne({ 
      subdomain: req.body.subdomain.toLowerCase(),
      _id: { $ne: site._id }
    });
    
    if (existingSubdomain) {
      throw new ApiError('Subdomain already taken', 400);
    }
    
    req.body.subdomain = req.body.subdomain.toLowerCase();
  }

  // Update site
  site = await Site.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('pages');

  res.status(200).json({
    success: true,
    message: 'Site updated successfully',
    data: site
  });
});

/**
 * @desc    Delete site
 * @route   DELETE /api/sites/:id
 * @access  Private
 */
exports.deleteSite = asyncHandler(async (req, res, next) => {
  const site = await Site.findById(req.params.id);

  if (!site) {
    throw new ApiError('Site not found', 404);
  }

  // Check ownership (OAuth user ID is a string)

  // Delete all pages associated with site
  await Page.deleteMany({ siteId: site._id });

  // Delete site
  await site.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Site and all associated pages deleted successfully'
  });
});

/**
 * @desc    Publish site
 * @route   POST /api/sites/:id/publish
 * @access  Private
 */
exports.publishSite = asyncHandler(async (req, res, next) => {
  const site = await Site.findById(req.params.id);

  if (!site) {
    throw new ApiError('Site not found', 404);
  }

  // Check ownership (OAuth user ID is a string)

  // Check if site has at least one page
  const pageCount = await Page.countDocuments({ siteId: site._id });
  if (pageCount === 0) {
    throw new ApiError('Cannot publish site without pages', 400);
  }

  // Update site
  site.isPublished = true;
  site.publishedAt = Date.now();
  await site.save();

  res.status(200).json({
    success: true,
    message: 'Site published successfully',
    data: site
  });
});

/**
 * @desc    Unpublish site
 * @route   POST /api/sites/:id/unpublish
 * @access  Private
 */
exports.unpublishSite = asyncHandler(async (req, res, next) => {
  const site = await Site.findById(req.params.id);

  if (!site) {
    throw new ApiError('Site not found', 404);
  }

  // Check ownership (OAuth user ID is a string)

  site.isPublished = false;
  await site.save();

  res.status(200).json({
    success: true,
    message: 'Site unpublished successfully',
    data: site
  });
});

/**
 * @desc    Duplicate site
 * @route   POST /api/sites/:id/duplicate
 * @access  Private
 */
exports.duplicateSite = asyncHandler(async (req, res, next) => {
  const originalSite = await Site.findById(req.params.id);

  if (!originalSite) {
    throw new ApiError('Site not found', 404);
  }

  // Check ownership (OAuth user ID is a string)

  // Generate unique subdomain
  const baseSubdomain = `${originalSite.subdomain}-copy`;
  const uniqueSubdomain = await Site.generateUniqueSubdomain(baseSubdomain);

  // Create duplicate site
  const siteData = originalSite.toObject();
  delete siteData._id;
  delete siteData.createdAt;
  delete siteData.updatedAt;
  
  const duplicatedSite = await Site.create({
    ...siteData,
    siteName: `${originalSite.siteName} (Copy)`,
    subdomain: uniqueSubdomain,
    isPublished: false,
    publishedAt: null
  });

  // Duplicate all pages
  const originalPages = await Page.find({ siteId: originalSite._id });
  
  const duplicatedPages = originalPages.map(page => {
    const pageData = page.toObject();
    delete pageData._id;
    delete pageData.createdAt;
    delete pageData.updatedAt;
    
    return {
      ...pageData,
      siteId: duplicatedSite._id
    };
  });

  await Page.insertMany(duplicatedPages);

  const populatedSite = await Site.findById(duplicatedSite._id).populate('pages');

  res.status(201).json({
    success: true,
    message: 'Site duplicated successfully',
    data: populatedSite
  });
});
