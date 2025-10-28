const express = require('express');
const { body } = require('express-validator');
const {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  duplicatePage,
  updatePageContent
} = require('../controllers/pageController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId } = require('../middleware/validation');

const router = express.Router({ mergeParams: true });

// Middleware to conditionally apply authentication
const optionalAuth = (req, res, next) => {
  // If accessing pages without authentication (public site viewing), skip authentication
  // The controller will verify if the site is published
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  // No auth header, skip to controller (will be handled there)
  return next();
};

// Validation rules
const createPageValidation = [
  body('pageName')
    .trim()
    .notEmpty().withMessage('Page name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Page name must be between 1 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-/]+$/).withMessage('Slug can only contain lowercase letters, numbers, hyphens, and slashes'),
  body('content')
    .optional()
    .isArray().withMessage('Content must be an array'),
  body('isHome')
    .optional()
    .isBoolean().withMessage('isHome must be a boolean')
];

const reorderPagesValidation = [
  body('pageOrders')
    .isArray().withMessage('pageOrders must be an array')
    .notEmpty().withMessage('pageOrders cannot be empty')
];

// Routes for pages within a site
router.route('/')
  .get(optionalAuth, getPages)
  .post(protect, createPageValidation, handleValidationErrors, createPage);

router.put('/reorder', protect, reorderPagesValidation, handleValidationErrors, reorderPages);

// Routes for individual pages
router.route('/:id')
  .get(protect, validateObjectId('id'), getPage)
  .put(protect, validateObjectId('id'), updatePage)
  .delete(protect, validateObjectId('id'), deletePage);

router.post('/:id/duplicate', protect, validateObjectId('id'), duplicatePage);
router.patch('/:id/content', protect, validateObjectId('id'), updatePageContent);

module.exports = router;
