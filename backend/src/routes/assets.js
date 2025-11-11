const express = require('express');
const {
  uploadAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
  getStorageInfo,
  bulkDeleteAssets
} = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { uploadSingle, handleMulterError } = require('../middleware/upload');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Routes - OAuth authentication via protect middleware
router.route('/')
  .get(protect, getAssets);

router.post('/upload', protect, uploadSingle, handleMulterError, uploadAsset);
router.get('/storage/info', protect, getStorageInfo);
router.delete('/bulk-delete', protect, bulkDeleteAssets);

router.route('/:id')
  .get(protect, validateObjectId('id'), getAsset)
  .put(protect, validateObjectId('id'), updateAsset)
  .delete(protect, validateObjectId('id'), deleteAsset);

module.exports = router;
