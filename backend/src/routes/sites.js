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
const { protect } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId } = require('../middleware/validation');
const { siteValidation, commonValidation } = require('../middleware/validationRules');

const router = express.Router();

// OAuth provider handles authentication - no middleware needed
// Routes
router.route('/')
  .get(siteValidation.query, handleValidationErrors, getSites)
  .post(siteValidation.create, handleValidationErrors, createSite);

router.route('/:id')
  .get(...commonValidation.objectId('id'), handleValidationErrors, getSite)
  .put(...commonValidation.objectId('id'), siteValidation.update, handleValidationErrors, updateSite)
  .delete(...commonValidation.objectId('id'), handleValidationErrors, deleteSite);

router.post('/:id/publish', ...commonValidation.objectId('id'), siteValidation.publish, handleValidationErrors, publishSite);
router.post('/:id/unpublish', ...commonValidation.objectId('id'), handleValidationErrors, unpublishSite);
router.post('/:id/duplicate', ...commonValidation.objectId('id'), handleValidationErrors, duplicateSite);

module.exports = router;
