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

// No authentication middleware - OAuth handled client-side
router.route('/')
  .get(getAssets);

router.post('/upload', uploadSingle, handleMulterError, uploadAsset);
router.get('/storage/info', getStorageInfo);
router.delete('/bulk-delete', bulkDeleteAssets);

router.route('/:id')
  .get(validateObjectId('id'), getAsset)
  .put(validateObjectId('id'), updateAsset)
  .delete(validateObjectId('id'), deleteAsset);

module.exports = router;
