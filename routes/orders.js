/**
 * routes/orders.js
 * Express router for Order endpoints.
 * Base path: /api/orders
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

// GET    /api/orders            → list all (supports ?status= filter)
// POST   /api/orders            → create
router.route('/')
  .get(ctrl.getAllOrders)
  .post(ctrl.createOrder);

// GET    /api/orders/:id        → get one
// PUT    /api/orders/:id        → full update
// PATCH  /api/orders/:id        → partial update
// DELETE /api/orders/:id        → delete
router.route('/:id')
  .get(ctrl.getOrderById)
  .put(ctrl.updateOrder)
  .patch(ctrl.patchOrder)
  .delete(ctrl.deleteOrder);

module.exports = router;
