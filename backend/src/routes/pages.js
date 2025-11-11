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

// No authentication middleware - OAuth handled client-side

// Routes for pages within a site
router.route('/')
  .get(getPages)
  .post(pageValidation.create, handleValidationErrors, createPage);

router.put('/reorder', pageValidation.reorder, handleValidationErrors, reorderPages);

// Routes for individual pages
router.route('/:id')
  .get(...commonValidation.objectId('id'), handleValidationErrors, getPage)
  .put(...commonValidation.objectId('id'), pageValidation.update, handleValidationErrors, updatePage)
  .delete(...commonValidation.objectId('id'), handleValidationErrors, deletePage);

router.post('/:id/duplicate', ...commonValidation.objectId('id'), handleValidationErrors, duplicatePage);
router.patch('/:id/content', ...commonValidation.objectId('id'), pageValidation.update, handleValidationErrors, updatePageContent);

module.exports = router;
