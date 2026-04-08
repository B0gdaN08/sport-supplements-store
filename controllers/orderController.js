/**
 * controllers/orderController.js
 * Business logic for Order CRUD operations.
 */

const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// ─── GET /api/orders ──────────────────────────────────────────────────────────

const getAllOrders = (req, res) => {
  const filters = {};
  if (req.query.status) filters.status = req.query.status;

  const orders = Order.getAll(filters);
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────

const getOrderById = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const order = Order.getById(id);
  if (!order) {
    return res.status(404).json({ success: false, error: `Order with id ${id} not found.` });
  }

  res.status(200).json({ success: true, data: order });
};

// ─── POST /api/orders ─────────────────────────────────────────────────────────

const createOrder = (req, res) => {
  const { customerName, customerEmail, items, shippingAddress, notes } = req.body;

  const errors = [];
  if (!customerName || customerName.trim() === '') errors.push('"customerName" is required.');
  if (!customerEmail || customerEmail.trim() === '') errors.push('"customerEmail" is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) errors.push('"customerEmail" must be a valid email.');
  if (!items || !Array.isArray(items) || items.length === 0) errors.push('"items" must be a non-empty array.');

  if (errors.length) {
    return res.status(400).json({ success: false, error: 'Validation failed.', details: errors });
  }

  // Validate each item and its product reference
  const itemErrors = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId) itemErrors.push(`items[${i}]: "productId" is required.`);
    if (!item.quantity || Number(item.quantity) < 1) itemErrors.push(`items[${i}]: "quantity" must be >= 1.`);
    if (item.unitPrice === undefined || Number(item.unitPrice) < 0) itemErrors.push(`items[${i}]: "unitPrice" must be >= 0.`);

    const product = Product.getById(Number(item.productId));
    if (!product) itemErrors.push(`items[${i}]: Product with id ${item.productId} does not exist.`);
  }

  if (itemErrors.length) {
    return res.status(400).json({ success: false, error: 'Item validation failed.', details: itemErrors });
  }

  const newOrder = Order.create({ customerName: customerName.trim(), customerEmail: customerEmail.trim(), items, shippingAddress, notes });
  res.status(201).json({ success: true, message: 'Order created successfully.', data: newOrder });
};

// ─── PUT /api/orders/:id ──────────────────────────────────────────────────────

const updateOrder = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const { customerName, customerEmail, items, status, shippingAddress, notes } = req.body;

  const errors = [];
  if (!customerName || customerName.trim() === '') errors.push('"customerName" is required.');
  if (!customerEmail || customerEmail.trim() === '') errors.push('"customerEmail" is required.');
  if (!items || !Array.isArray(items) || items.length === 0) errors.push('"items" must be a non-empty array.');

  if (errors.length) {
    return res.status(400).json({ success: false, error: 'Validation failed.', details: errors });
  }

  const updated = Order.update(id, { customerName, customerEmail, items, status, shippingAddress, notes });
  if (!updated) {
    return res.status(404).json({ success: false, error: `Order with id ${id} not found.` });
  }

  res.status(200).json({ success: true, message: 'Order updated successfully.', data: updated });
};

// ─── PATCH /api/orders/:id ────────────────────────────────────────────────────

const patchOrder = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const allowedFields = ['customerName', 'customerEmail', 'items', 'status', 'shippingAddress', 'notes'];
  const fields = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ success: false, error: 'No valid fields provided for partial update.' });
  }

  const patched = Order.patch(id, fields);
  if (!patched) {
    return res.status(404).json({ success: false, error: `Order with id ${id} not found.` });
  }

  if (patched.error) {
    return res.status(400).json({ success: false, error: patched.error });
  }

  res.status(200).json({ success: true, message: 'Order partially updated.', data: patched });
};

// ─── DELETE /api/orders/:id ───────────────────────────────────────────────────

const deleteOrder = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const deleted = Order.remove(id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: `Order with id ${id} not found.` });
  }

  res.status(200).json({ success: true, message: `Order ${id} deleted successfully.` });
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  patchOrder,
  deleteOrder,
};
