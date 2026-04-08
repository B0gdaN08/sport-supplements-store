/**
 * routes/categories.js
 * Express router for Category endpoints.
 * Base path: /api/categories
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');

// GET    /api/categories        → list all categories
// POST   /api/categories        → create a new category
router.route('/')
  .get(ctrl.getAllCategories)
  .post(ctrl.createCategory);

// GET    /api/categories/:id    → get one category
// PUT    /api/categories/:id    → full update
// PATCH  /api/categories/:id    → partial update
// DELETE /api/categories/:id    → delete
router.route('/:id')
  .get(ctrl.getCategoryById)
  .put(ctrl.updateCategory)
  .patch(ctrl.patchCategory)
  .delete(ctrl.deleteCategory);

module.exports = router;
