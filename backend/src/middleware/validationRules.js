const { body, param, query } = require('express-validator');

/**
 * Validation rules for authentication endpoints
 */
const authValidation = {
  register: [
    body('email')
      .trim()
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail()
      .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters'),
    
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
      .isLength({ max: 128 }).withMessage('Password must not exceed 128 characters'),
    
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, hyphens, and apostrophes')
      .escape(),
    
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes')
      .escape(),
  ],

  login: [
    body('email')
      .trim()
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],

  updatePassword: [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
      .isLength({ max: 128 }).withMessage('Password must not exceed 128 characters'),
  ],

  forgotPassword: [
    body('email')
      .trim()
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
  ],

  resetPassword: [
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ],

  oauthLogin: [
    body('userInfo')
      .notEmpty().withMessage('User information is required'),
    
    body('userInfo.uid')
      .optional()
      .isLength({ max: 255 }).withMessage('User ID must not exceed 255 characters'),
    
    body('userInfo.email')
      .optional()
      .trim()
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    
    body('userInfo.role')
      .optional()
      .isIn(['user', 'admin', 'super_admin']).withMessage('Invalid role specified'),
  ],
};

/**
 * Validation rules for site endpoints
 */
const siteValidation = {
  create: [
    body('siteName')
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Site name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_']+$/).withMessage('Site name can only contain letters, numbers, spaces, hyphens, underscores, and apostrophes')
      .escape(),
    
    body('subdomain')
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Subdomain must be between 3 and 50 characters')
      .matches(/^[a-z0-9-]+$/).withMessage('Subdomain can only contain lowercase letters, numbers, and hyphens')
      .not().matches(/^-|-$/).withMessage('Subdomain cannot start or end with a hyphen')
      .not().matches(/--/).withMessage('Subdomain cannot contain consecutive hyphens')
      .toLowerCase(),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
      .escape(),
    
    body('customDomain')
      .optional()
      .trim()
      .matches(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/).withMessage('Invalid domain format')
      .isLength({ max: 253 }).withMessage('Domain cannot exceed 253 characters'),
  ],

  update: [
    body('siteName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Site name must be between 2 and 100 characters')
      .escape(),
    
    body('subdomain')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Subdomain must be between 3 and 50 characters')
      .matches(/^[a-z0-9-]+$/).withMessage('Subdomain can only contain lowercase letters, numbers, and hyphens')
      .toLowerCase(),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
      .escape(),
    
    body('logoWidth')
      .optional()
      .matches(/^\d+(px|%|rem|em)$/).withMessage('Logo width must be a valid CSS size (e.g., 120px, 50%, 5rem)'),

    body('seo.title')
      .optional()
      .trim()
      .isLength({ max: 70 }).withMessage('SEO title cannot exceed 70 characters')
      .escape(),
    
    body('seo.description')
      .optional()
      .trim()
      .isLength({ max: 160 }).withMessage('SEO description cannot exceed 160 characters')
      .escape(),
    
    body('seo.keywords')
      .optional()
      .isArray().withMessage('SEO keywords must be an array'),
    
    body('seo.keywords.*')
      .optional()
      .trim()
      .isLength({ max: 50 }).withMessage('Each keyword cannot exceed 50 characters')
      .escape(),
  ],

  publish: [
    body('siteName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Site name must be between 2 and 100 characters')
      .escape(),
    
    body('subdomain')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Subdomain must be between 3 and 50 characters')
      .matches(/^[a-z0-9-]+$/).withMessage('Subdomain can only contain lowercase letters, numbers, and hyphens')
      .toLowerCase(),
  ],

  query: [
    query('subdomain')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Subdomain must be between 3 and 50 characters')
      .matches(/^[a-z0-9-]+$/).withMessage('Invalid subdomain format')
      .toLowerCase(),
  ],
};

/**
 * Validation rules for page endpoints
 */
const pageValidation = {
  create: [
    body('pageName')
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('Page name must be between 1 and 100 characters')
      .escape(),
    
    body('slug')
      .optional()
      .trim()
      .custom((value, { req }) => {
        // Allow empty string or "/" for home pages
        if (req.body.isHome && (value === '' || value === '/')) {
          return true;
        }
        // For non-home pages, validate slug format
        if (value && !/^[a-z0-9-]+$/.test(value)) {
          throw new Error('Slug can only contain lowercase letters, numbers, and hyphens');
        }
        return true;
      }),
    
    body('order')
      .optional()
      .isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  ],

  update: [
    body('pageName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('Page name must be between 1 and 100 characters')
      .escape(),
    
    body('slug')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('Slug must be between 1 and 100 characters')
      .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
      .toLowerCase(),
    
    body('content')
      .optional()
      .isArray().withMessage('Content must be an array'),
    
    body('sections')
      .optional()
      .isArray().withMessage('Sections must be an array'),
  ],

  reorder: [
    body('pages')
      .isArray({ min: 1 }).withMessage('Pages array is required and must not be empty'),
    
    body('pages.*.pageId')
      .notEmpty().withMessage('Page ID is required'),
    
    body('pages.*.order')
      .isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  ],
};

/**
 * Validation rules for theme endpoints
 */
const themeValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Theme name must be between 2 and 50 characters')
      .escape(),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters')
      .escape(),
    
    body('category')
      .optional()
      .isIn(['Business', 'Portfolio', 'Blog', 'E-commerce', 'Education', 'Landing Page', 'Other'])
      .withMessage('Invalid category'),
    
    body('colors.primary')
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Primary color must be a valid hex color'),
    
    body('colors.secondary')
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Secondary color must be a valid hex color'),
    
    body('colors.background')
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Background color must be a valid hex color'),
    
    body('colors.text')
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Text color must be a valid hex color'),
  ],
};

/**
 * Validation rules for asset endpoints
 */
const assetValidation = {
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters')
      .escape(),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
      .escape(),
  ],
};

/**
 * Common parameter validation
 */
const commonValidation = {
  objectId: (paramName = 'id') => [
    param(paramName)
      .matches(/^[0-9a-fA-F]{24}$/).withMessage(`Invalid ${paramName} format`),
  ],

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    query('sort')
      .optional()
      .matches(/^[a-zA-Z_]+$/).withMessage('Invalid sort field'),
    
    query('order')
      .optional()
      .isIn(['asc', 'desc', 'ascending', 'descending', '1', '-1']).withMessage('Order must be asc or desc'),
  ],
};

module.exports = {
  authValidation,
  siteValidation,
  pageValidation,
  themeValidation,
  assetValidation,
  commonValidation,
};
