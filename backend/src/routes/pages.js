const express = require('express');
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
const { pageValidation, commonValidation } = require('../middleware/validationRules');

const router = express.Router({ mergeParams: true });

// All routes require authentication to protect user isolation

// Routes for pages within a site
router.route('/')
  .get(protect, getPages)
  .post(protect, pageValidation.create, handleValidationErrors, createPage);

router.put('/reorder', protect, pageValidation.reorder, handleValidationErrors, reorderPages);

// Routes for individual pages
router.route('/:id')
  .get(protect, ...commonValidation.objectId('id'), handleValidationErrors, getPage)
  .put(protect, ...commonValidation.objectId('id'), pageValidation.update, handleValidationErrors, updatePage)
  .delete(protect, ...commonValidation.objectId('id'), handleValidationErrors, deletePage);

router.post('/:id/duplicate', protect, ...commonValidation.objectId('id'), handleValidationErrors, duplicatePage);
router.patch('/:id/content', protect, ...commonValidation.objectId('id'), pageValidation.update, handleValidationErrors, updatePageContent);

module.exports = router;
