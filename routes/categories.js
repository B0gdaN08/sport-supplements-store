/**
 * routes/categories.js
 * Express router for Category endpoints.
 * Base path: /api/categories
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { requireAdmin } = require('../middleware/auth');

// GET    /api/categories        → public
// POST   /api/categories        → admin only
router.route('/')
  .get(ctrl.getAllCategories)
  .post(requireAdmin, ctrl.createCategory);

// GET    /api/categories/:id    → public
// PUT    /api/categories/:id    → admin only
// PATCH  /api/categories/:id    → admin only
// DELETE /api/categories/:id    → admin only
router.route('/:id')
  .get(ctrl.getCategoryById)
  .put(requireAdmin, ctrl.updateCategory)
  .patch(requireAdmin, ctrl.patchCategory)
  .delete(requireAdmin, ctrl.deleteCategory);

module.exports = router;
