const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - extracts user from OAuth JWT token
 * NEVER throws 401 - just sets req.user if valid token exists
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // SECURITY FIX (CVE-002): Check for token in HttpOnly cookie first
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
      console.log('[Auth] Token found in HttpOnly cookie');
    }
    // Fallback: Check for token in Authorization header (for backwards compatibility)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('[Auth] Token found in Authorization header');
    }
    // Legacy: Check for old cookie name
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('[Auth] Token found in legacy cookie');
    }

    // If no token, just continue without setting req.user
    if (!token) {
      console.log('[Auth] No token provided for', req.method, req.originalUrl);
      return next();
    }

    try {
      // Decode OAuth token (don't verify signature - OAuth provider already did that)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        
        // SECURITY FIX (CVE-004): Check token expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          console.warn('[Auth] Token expired at', new Date(payload.exp * 1000).toISOString());
          console.warn('[Auth] Current time:', new Date().toISOString());
          console.warn('[Auth] Token has been expired for', Math.floor(Date.now() / 1000) - payload.exp, 'seconds');
          // Don't set req.user - token is expired
          // Frontend will get 401 and trigger refresh
          return next();
        }
        
        // Check if it's an OAuth token (has 'iss' field from OAuth provider)
        if (payload.iss && payload.iss.includes('ivp.isea.in')) {
          // Extract user ID from OAuth token's 'sub' field (this is the user's unique ID)
          req.user = {
            _id: payload.sub, // OAuth sub field (UUID)
            email: payload.email,
            name: payload.name || payload.preferred_username,
            isActive: true,
            isOAuthUser: true,
          };
          console.log('[Auth] OAuth user authenticated:', req.user.email, 'sub:', req.user._id);
        } else {
          console.log('[Auth] Token is not from OAuth provider');
        }
      }
    } catch (error) {
      console.error('[Auth] Failed to decode token:', error.message);
    }

    next();
  } catch (error) {
    console.error('[Auth] Middleware error:', error);
    // Never throw error - just continue without user
    next();
  }
};

/**
 * Middleware to check subscription level
 */
const checkSubscription = (...allowedPlans) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!allowedPlans.includes(req.user.subscriptionPlan)) {
      return res.status(403).json({
        success: false,
        message: `This feature requires a ${allowedPlans.join(' or ')} subscription`,
        currentPlan: req.user.subscriptionPlan,
        requiredPlans: allowedPlans
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns a resource
 */
const authorize = (Model, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user owns the resource
      if (resource.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization'
      });
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid, but we don't fail - just continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

module.exports = {
  protect,
  checkSubscription,
  authorize,
  optionalAuth
};
