/**
 * Category Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteAllCategories
} = require('../controllers/categoryController');

// All routes require authentication
router.use(protect);

// GET /api/categories - Get all user categories
router.get('/', getCategories);

// POST /api/categories - Create new category
router.post('/', createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', updateCategory);

// DELETE /api/categories/all - Delete ALL custom categories (MUST be before /:id)
router.delete('/all', deleteAllCategories);

// DELETE /api/categories/:id - Delete single category
router.delete('/:id', deleteCategory);

module.exports = router;
