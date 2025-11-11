const express = require('express');
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
const { protect, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId } = require('../middleware/validation');
const { siteValidation, commonValidation } = require('../middleware/validationRules');

const router = express.Router();

// OAuth authentication via protect middleware
// GET routes use optionalAuth to allow public access for published sites by subdomain
// Routes
router.route('/')
  .get(optionalAuth, siteValidation.query, handleValidationErrors, getSites)
  .post(protect, siteValidation.create, handleValidationErrors, createSite);

router.route('/:id')
  .get(protect, ...commonValidation.objectId('id'), handleValidationErrors, getSite)
  .put(protect, ...commonValidation.objectId('id'), siteValidation.update, handleValidationErrors, updateSite)
  .delete(protect, ...commonValidation.objectId('id'), handleValidationErrors, deleteSite);

router.post('/:id/publish', protect, ...commonValidation.objectId('id'), siteValidation.publish, handleValidationErrors, publishSite);
router.post('/:id/unpublish', protect, ...commonValidation.objectId('id'), handleValidationErrors, unpublishSite);
router.post('/:id/duplicate', protect, ...commonValidation.objectId('id'), handleValidationErrors, duplicateSite);

module.exports = router;
