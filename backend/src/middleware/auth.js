const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - requires valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      console.warn('[Auth] Missing Authorization token for', req.method, req.originalUrl);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please log in.'
      });
    }

    try {
      // First, try to verify as OAuth token (Keycloak/IVP ISEA JWT)
      // OAuth tokens are NOT signed with our JWT_SECRET, so we decode without verification
      let decoded;
      let isOAuthToken = false;
      
      try {
        // Try to decode as OAuth token (just decode, don't verify signature)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          
          // Check if it's an OAuth token (has 'iss' field from OAuth provider)
          if (payload.iss && payload.iss.includes('ivp.isea.in')) {
            decoded = payload;
            isOAuthToken = true;
            console.log('[Auth] OAuth token detected from IVP ISEA, sub:', payload.sub);
          }
        }
      } catch (oauthError) {
        // Not an OAuth token, will try regular JWT next
      }

      // If not OAuth, verify as regular JWT token
      if (!isOAuthToken) {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database for regular JWT tokens
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'User not found. Token is invalid.'
          });
        }

        // Check if user is active
        if (!req.user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Your account has been deactivated. Please contact support.'
          });
        }
      } else {
        // For OAuth tokens, create a mock user object from the token payload
        req.user = {
          _id: decoded.sub, // Keycloak uses 'sub' for user ID
          email: decoded.email,
          name: decoded.name || decoded.preferred_username,
          isActive: true,
          isOAuthUser: true,
        };
        console.log('[Auth] OAuth user authenticated:', req.user.email);
      }

      next();
    } catch (error) {
      console.error('[Auth] Token validation failed:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
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
