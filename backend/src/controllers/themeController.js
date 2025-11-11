const Theme = require('../models/Theme');
const { asyncHandler, ApiError, paginatedResponse } = require('../utils/helpers');

/**
 * @desc    Get all themes
 * @route   GET /api/themes
 * @access  Public
 */
exports.getThemes = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, category, isPremium, search } = req.query;

  const query = { isPublic: true };

  if (category) {
    query.category = category;
  }

  if (isPremium !== undefined) {
    query.isPremium = isPremium === 'true';
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [themes, total] = await Promise.all([
    Theme.find(query)
      .select('-customCSS')
      .sort({ usageCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Theme.countDocuments(query)
  ]);

  paginatedResponse(res, themes, parseInt(page), parseInt(limit), total, 'Themes retrieved successfully');
});

/**
 * @desc    Get single theme
 * @route   GET /api/themes/:id
 * @access  Public
 */
exports.getTheme = asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    throw new ApiError('Theme not found', 404);
  }

  if (!theme.isPublic && (!req.user || theme.createdBy !== req.user._id)) {
    throw new ApiError('Not authorized to access this theme', 403);
  }

  res.status(200).json({
    success: true,
    data: theme
  });
});

/**
 * @desc    Create new theme
 * @route   POST /api/themes
 * @access  Private (Admin or Pro users)
 */
exports.createTheme = asyncHandler(async (req, res, next) => {
  const themeData = {
    ...req.body,
    createdBy: req.user._id
  };

  const theme = await Theme.create(themeData);

  res.status(201).json({
    success: true,
    message: 'Theme created successfully',
    data: theme
  });
});

/**
 * @desc    Update theme
 * @route   PUT /api/themes/:id
 * @access  Private (Owner only)
 */
exports.updateTheme = asyncHandler(async (req, res, next) => {
  let theme = await Theme.findById(req.params.id);

  if (!theme) {
    throw new ApiError('Theme not found', 404);
  }

  // Check ownership
  if (theme.createdBy && theme.createdBy !== req.user._id) {
    throw new ApiError('Not authorized to update this theme', 403);
  }

  theme = await Theme.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Theme updated successfully',
    data: theme
  });
});

/**
 * @desc    Delete theme
 * @route   DELETE /api/themes/:id
 * @access  Private (Owner only)
 */
exports.deleteTheme = asyncHandler(async (req, res, next) => {
  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    throw new ApiError('Theme not found', 404);
  }

  // Check ownership
  if (theme.createdBy && theme.createdBy !== req.user._id) {
    throw new ApiError('Not authorized to delete this theme', 403);
  }

  await theme.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Theme deleted successfully'
  });
});

/**
 * @desc    Get themes by category
 * @route   GET /api/themes/category/:category
 * @access  Public
 */
exports.getThemesByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;

  const themes = await Theme.find({
    category,
    isPublic: true
  })
    .select('-customCSS')
    .sort({ usageCount: -1 });

  res.status(200).json({
    success: true,
    count: themes.length,
    data: themes
  });
});

/**
 * @desc    Increment theme usage count
 * @route   POST /api/themes/:id/use
 * @access  Private
 */
exports.useTheme = asyncHandler(async (req, res, next) => {
  const theme = await Theme.findByIdAndUpdate(
    req.params.id,
    { $inc: { usageCount: 1 } },
    { new: true }
  );

  if (!theme) {
    throw new ApiError('Theme not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Theme usage recorded',
    data: theme
  });
});

/**
 * @desc    Get user's custom themes
 * @route   GET /api/themes/my-themes
 * @access  Private
 */
exports.getMyThemes = asyncHandler(async (req, res, next) => {
  const themes = await Theme.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: themes.length,
    data: themes
  });
});
