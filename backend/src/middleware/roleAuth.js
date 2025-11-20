const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

/**
 * Check if user has admin role
 */
const requireAdmin = asyncHandler(async (req, res, next) => {
  // First check if user is authenticated
  if (!req.user) {
    throw new ApiError('Access denied. Authentication required.', 401);
  }

  // Check if user has admin role
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'access_denied',
      message: 'You do not have permission to access this resource. Administrator access required.',
      userRole: req.user.role
    });
  }

  next();
});

/**
 * Check user role (flexible middleware)
 */
const requireRole = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError('Access denied. Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'access_denied',
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  });
};

/**
 * Check if current user is admin or accessing their own resources
 */
const requireAdminOrOwner = (userIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError('Access denied. Authentication required.', 401);
    }

    // Allow if user is admin
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    // Allow if user is accessing their own resource
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    if (resourceUserId && resourceUserId === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'access_denied',
      message: 'You can only access your own resources or you need administrator privileges.',
      userRole: req.user.role
    });
  });
};

module.exports = {
  requireAdmin,
  requireRole,
  requireAdminOrOwner
};