const Asset = require('../models/Asset');
const User = require('../models/User');
const { asyncHandler, ApiError, paginatedResponse, formatFileSize } = require('../utils/helpers');
const { uploadToLocalStorage, deleteFromLocalStorage } = require('../config/cloudinary');

/**
 * @desc    Upload asset
 * @route   POST /api/assets/upload
 * @access  Private (requires OAuth token)
 */
exports.uploadAsset = asyncHandler(async (req, res, next) => {
  // Require authentication to upload assets
  if (!req.user || !req.user._id) {
    throw new ApiError('Please log in to upload assets', 401);
  }

  if (!req.file) {
    throw new ApiError('Please upload a file', 400);
  }

  const { siteId, alt, tags, folder } = req.body;

  // Additional security validation
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg'
  ];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw new ApiError(`File type ${req.file.mimetype} is not allowed`, 400);
  }

  // Validate file size (already done by multer, but double-check)
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    throw new ApiError(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`, 400);
  }

  // Sanitize filename to prevent path traversal
  const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (sanitizedFilename !== req.file.originalname) {
    console.warn(`Sanitized filename: ${req.file.originalname} -> ${sanitizedFilename}`);
  }

  // Note: We skip storage limit check since we don't have User model with OAuth
  // OAuth users are assumed to have sufficient storage
  const currentStorage = await Asset.calculateUserStorage(req.user._id);

  // Determine asset type
  const assetType = req.file.mimetype.startsWith('image/') ? 'image' :
                   req.file.mimetype.startsWith('video/') ? 'video' :
                   req.file.mimetype.includes('pdf') || req.file.mimetype.includes('document') ? 'document' :
                   'other';

  try {
    // Upload to local storage
    const result = await uploadToLocalStorage(req.file, {
      folder: folder || 'cms-uploads'
    });

    // Create asset record with sanitized data
    const asset = await Asset.create({
      userId: req.user._id,
      siteId: siteId || null,
      filename: result.public_id,
      originalName: sanitizedFilename,
      url: result.secure_url,
      publicId: result.public_id,
      type: assetType,
      mimeType: req.file.mimetype,
      size: req.file.size,
      dimensions: result.width && result.height ? {
        width: result.width,
        height: result.height
      } : undefined,
      alt: (alt || '').replace(/[<>\"']/g, ''), // Sanitize alt text
      tags: tags ? tags.split(',').map(tag => tag.trim().replace(/[<>\"']/g, '')) : [],
      folder: (folder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '_')
    });

    // Update user storage
    user.storageUsed = currentStorage + req.file.size;

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: asset
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw new ApiError('Failed to upload file. Please try again.', 500);
  }
});

/**
 * @desc    Get all assets for authenticated user
 * @route   GET /api/assets
 * @access  Private (requires OAuth token)
 */
exports.getAssets = asyncHandler(async (req, res, next) => {
  // Require authentication to view assets
  if (!req.user || !req.user._id) {
    throw new ApiError('Please log in to view assets', 401);
  }

  const { page = 1, limit = 20, type, siteId, search } = req.query;

  // Filter by user's OAuth sub field
  const query = { userId: req.user._id };

  if (type) {
    query.type = type;
  }

  if (siteId) {
    query.siteId = siteId;
  }

  if (search) {
    query.$or = [
      { originalName: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip = (page - 1) * limit;

  const [assets, total] = await Promise.all([
    Asset.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Asset.countDocuments(query)
  ]);

  paginatedResponse(res, assets, parseInt(page), parseInt(limit), total, 'Assets retrieved successfully');
});

/**
 * @desc    Get single asset
 * @route   GET /api/assets/:id
 * @access  Private
 */
exports.getAsset = asyncHandler(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    throw new ApiError('Asset not found', 404);
  }

  // Check ownership
  if (asset.userId !== req.user._id) {
    throw new ApiError('Not authorized to access this asset', 403);
  }

  res.status(200).json({
    success: true,
    data: asset
  });
});

/**
 * @desc    Update asset
 * @route   PUT /api/assets/:id
 * @access  Private
 */
exports.updateAsset = asyncHandler(async (req, res, next) => {
  let asset = await Asset.findById(req.params.id);

  if (!asset) {
    throw new ApiError('Asset not found', 404);
  }

  // Check ownership
  if (asset.userId !== req.user._id) {
    throw new ApiError('Not authorized to update this asset', 403);
  }

  // Update allowed fields
  const { alt, tags, isPublic } = req.body;
  
  if (alt !== undefined) asset.alt = alt;
  if (tags !== undefined) asset.tags = tags;
  if (isPublic !== undefined) asset.isPublic = isPublic;

  await asset.save();

  res.status(200).json({
    success: true,
    message: 'Asset updated successfully',
    data: asset
  });
});

/**
 * @desc    Delete asset
 * @route   DELETE /api/assets/:id
 * @access  Private
 */
exports.deleteAsset = asyncHandler(async (req, res, next) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    throw new ApiError('Asset not found', 404);
  }

  // Check ownership
  if (asset.userId !== req.user._id) {
    throw new ApiError('Not authorized to delete this asset', 403);
  }

  try {
    // Delete from local storage
    if (asset.publicId) {
      await deleteFromLocalStorage(asset.publicId);
    }

    // Delete from database
    await asset.deleteOne();

    // Update user storage
    // OAuth: Skip User model lookup - no storage limits
    // OAuth: Skip storage tracking

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    throw new ApiError('Failed to delete asset. Please try again.', 500);
  }
});

/**
 * @desc    Get user storage info
 * @route   GET /api/assets/storage/info
 * @access  Private
 */
exports.getStorageInfo = asyncHandler(async (req, res, next) => {
  // OAuth: Skip User model lookup - no storage limits
  const currentStorage = await Asset.calculateUserStorage(req.user._id);
  
  // For OAuth users, use a generous default limit (10GB)
  const defaultLimit = 10 * 1024 * 1024 * 1024; // 10GB

  const storageInfo = {
    used: currentStorage,
    limit: defaultLimit,
    available: defaultLimit - currentStorage,
    percentage: (currentStorage / defaultLimit) * 100,
    usedFormatted: formatFileSize(currentStorage),
    limitFormatted: formatFileSize(defaultLimit),
    availableFormatted: formatFileSize(defaultLimit - currentStorage)
  };

  res.status(200).json({
    success: true,
    data: storageInfo
  });
});

/**
 * @desc    Bulk delete assets
 * @route   DELETE /api/assets/bulk-delete
 * @access  Private
 */
exports.bulkDeleteAssets = asyncHandler(async (req, res, next) => {
  const { assetIds } = req.body;

  if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
    throw new ApiError('Please provide asset IDs to delete', 400);
  }

  // Get assets and verify ownership
  const assets = await Asset.find({
    _id: { $in: assetIds },
    userId: req.user._id
  });

  if (assets.length === 0) {
    throw new ApiError('No assets found to delete', 404);
  }

  let totalSize = 0;
  const deletePromises = assets.map(async (asset) => {
    totalSize += asset.size;
    
    // Delete from local storage
    if (asset.publicId) {
      await deleteFromLocalStorage(asset.publicId);
    }
    
    return asset.deleteOne();
  });

  await Promise.all(deletePromises);

  // Update user storage
  // OAuth: Skip User model lookup - no storage limits
  // OAuth: Skip storage tracking

  res.status(200).json({
    success: true,
    message: `${assets.length} asset(s) deleted successfully`,
    deletedCount: assets.length
  });
});
