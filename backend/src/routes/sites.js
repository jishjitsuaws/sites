const express = require('express');
const { body } = require('express-validator');
const {
  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
  publishSite,
  unpublishSite,
  duplicateSite
} = require('../controllers/siteController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Middleware to conditionally apply authentication
const optionalAuth = (req, res, next) => {
  // If subdomain query param exists, skip authentication (public access)
  if (req.query.subdomain) {
    return next();
  }
  // Otherwise require authentication
  return protect(req, res, next);
};

// Validation rules
const createSiteValidation = [
  body('siteName')
    .trim()
    .notEmpty().withMessage('Site name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Site name must be between 2 and 100 characters'),
  body('subdomain')
    .trim()
    .notEmpty().withMessage('Subdomain is required')
    .isLength({ min: 3, max: 50 }).withMessage('Subdomain must be between 3 and 50 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Subdomain can only contain lowercase letters, numbers, and hyphens')
    .not().matches(/^-|-$/).withMessage('Subdomain cannot start or end with a hyphen'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

// Routes
router.route('/')
  .get(optionalAuth, getSites)
  .post(protect, createSiteValidation, handleValidationErrors, createSite);

router.route('/:id')
  .get(protect, validateObjectId('id'), getSite)
  .put(protect, validateObjectId('id'), updateSite)
  .delete(protect, validateObjectId('id'), deleteSite);

router.post('/:id/publish', protect, validateObjectId('id'), publishSite);
router.post('/:id/unpublish', protect, validateObjectId('id'), unpublishSite);
router.post('/:id/duplicate', protect, validateObjectId('id'), duplicateSite);

module.exports = router;
