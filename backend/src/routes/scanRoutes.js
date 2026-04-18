/**
 * Scan Routes
 *
 * POST /api/scan/image         - Acknowledge image upload (OCR done client-side)
 * POST /api/scan/ocr-fallback  - Server-side OCR via ocr.space (low-confidence fallback)
 * POST /api/scan/validate      - Validate extracted data
 * GET  /api/scan/categories    - Available categories
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  processReceiptImage,
  ocrFallback,
  validateImageData,
  getCategories,
} = require('../controllers/scanController');

router.use(protect);

router.post('/image',        upload.single('receipt'), handleUploadError, processReceiptImage);
router.post('/ocr-fallback', upload.single('receipt'), handleUploadError, ocrFallback);
router.post('/validate',     validateImageData);
router.get('/categories',    getCategories);

module.exports = router;
