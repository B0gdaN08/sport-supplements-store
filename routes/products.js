/**
 * routes/products.js
 * Express router for Product endpoints.
 * Base path: /api/products
 *
 * GET  (read)  → public
 * POST/PUT/PATCH/DELETE (write) → admin only
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { requireAdmin } = require('../middleware/auth');

// GET    /api/products          → public
// POST   /api/products          → admin only
router.route('/')
  .get(ctrl.getAllProducts)
  .post(requireAdmin, ctrl.createProduct);

// GET    /api/products/:id      → public
// PUT    /api/products/:id      → admin only
// PATCH  /api/products/:id      → admin only
// DELETE /api/products/:id      → admin only
router.route('/:id')
  .get(ctrl.getProductById)
  .put(requireAdmin, ctrl.updateProduct)
  .patch(requireAdmin, ctrl.patchProduct)
  .delete(requireAdmin, ctrl.deleteProduct);

module.exports = router;
