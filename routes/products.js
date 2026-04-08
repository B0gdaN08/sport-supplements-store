/**
 * routes/products.js
 * Express router for Product endpoints.
 * Base path: /api/products
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

// GET    /api/products          → list all (supports ?categoryId= filter)
// POST   /api/products          → create
router.route('/')
  .get(ctrl.getAllProducts)
  .post(ctrl.createProduct);

// GET    /api/products/:id      → get one
// PUT    /api/products/:id      → full update
// PATCH  /api/products/:id      → partial update
// DELETE /api/products/:id      → delete
router.route('/:id')
  .get(ctrl.getProductById)
  .put(ctrl.updateProduct)
  .patch(ctrl.patchProduct)
  .delete(ctrl.deleteProduct);

module.exports = router;
