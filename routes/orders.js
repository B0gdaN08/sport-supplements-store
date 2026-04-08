/**
 * routes/orders.js
 * Express router for Order endpoints.
 * Base path: /api/orders
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// GET    /api/orders            → optionalAuth (admin sees all, user sees own, guest sees [])
// POST   /api/orders            → must be logged in
router.route('/')
  .get(optionalAuth, ctrl.getAllOrders)
  .post(authenticate, ctrl.createOrder);

// GET    /api/orders/:id        → must be logged in
// PUT    /api/orders/:id        → admin only
// PATCH  /api/orders/:id        → admin only
// DELETE /api/orders/:id        → admin only
router.route('/:id')
  .get(authenticate, ctrl.getOrderById)
  .put(requireAdmin, ctrl.updateOrder)
  .patch(requireAdmin, ctrl.patchOrder)
  .delete(requireAdmin, ctrl.deleteOrder);

module.exports = router;
