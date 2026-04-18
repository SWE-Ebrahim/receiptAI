/**
 * Receipt Routes
 * 
 * Defines all receipt-related endpoints:
 * - Get user's receipts
 * - Get weekly spending summary
 * - Get recent activity
 * - Upload and process receipts
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserReceipts,
  getSpendingSummary,
  getReceiptHistory,
  getCategoryBreakdown,
  getWeeklySpending,
  getRecentActivity,
  uploadReceipt,
  updateReceipt,
  deleteReceipt,
  deleteAllReceipts,
  exportReceiptsPDF
} = require('../controllers/receiptController');

// All routes are protected (require authentication)
router.use(protect);

// GET routes
router.get('/', getUserReceipts);
router.get('/spending-summary', getSpendingSummary);
router.get('/history', getReceiptHistory);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/weekly-summary', getWeeklySpending); // Legacy endpoint
router.get('/recent-activity', getRecentActivity);

// POST routes
router.post('/upload', uploadReceipt);

// PUT routes
router.put('/:id', updateReceipt);

// DELETE routes
router.delete('/delete-all', deleteAllReceipts);
router.delete('/:id', deleteReceipt);

// POST route for PDF export
router.post('/export-pdf', exportReceiptsPDF);

module.exports = router;
