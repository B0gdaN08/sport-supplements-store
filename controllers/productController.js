/**
 * controllers/productController.js
 * Business logic for Product CRUD operations.
 */

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

// ─── GET /api/products ────────────────────────────────────────────────────────

const getAllProducts = (req, res) => {
  const filters = {};
  if (req.query.categoryId) filters.categoryId = req.query.categoryId;

  const products = Product.getAll(filters);
  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
};

// ─── GET /api/products/:id ────────────────────────────────────────────────────

const getProductById = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const product = Product.getById(id);
  if (!product) {
    return res.status(404).json({ success: false, error: `Product with id ${id} not found.` });
  }

  res.status(200).json({ success: true, data: product });
};

// ─── POST /api/products ───────────────────────────────────────────────────────

const createProduct = (req, res) => {
  const { name, description, price, stock, categoryId, brand, weight, flavors } = req.body;

  // Required field validation
  const errors = [];
  if (!name || name.trim() === '')       errors.push('"name" is required.');
  if (price === undefined || price === '') errors.push('"price" is required.');
  if (isNaN(Number(price)) || Number(price) < 0) errors.push('"price" must be a non-negative number.');
  if (!categoryId)                        errors.push('"categoryId" is required.');

  if (errors.length) {
    return res.status(400).json({ success: false, error: 'Validation failed.', details: errors });
  }

  // Verify category exists
  const category = Category.getById(Number(categoryId));
  if (!category) {
    return res.status(400).json({ success: false, error: `Category with id ${categoryId} does not exist.` });
  }

  const newProduct = Product.create({ name: name.trim(), description, price, stock, categoryId, brand, weight, flavors });
  res.status(201).json({ success: true, message: 'Product created successfully.', data: newProduct });
};

// ─── PUT /api/products/:id ────────────────────────────────────────────────────

const updateProduct = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const { name, description, price, stock, categoryId, brand, weight, flavors } = req.body;

  const errors = [];
  if (!name || name.trim() === '')        errors.push('"name" is required.');
  if (price === undefined || price === '') errors.push('"price" is required.');
  if (isNaN(Number(price)) || Number(price) < 0) errors.push('"price" must be a non-negative number.');
  if (!categoryId)                         errors.push('"categoryId" is required.');

  if (errors.length) {
    return res.status(400).json({ success: false, error: 'Validation failed.', details: errors });
  }

  const category = Category.getById(Number(categoryId));
  if (!category) {
    return res.status(400).json({ success: false, error: `Category with id ${categoryId} does not exist.` });
  }

  const updated = Product.update(id, { name: name.trim(), description, price, stock, categoryId, brand, weight, flavors });
  if (!updated) {
    return res.status(404).json({ success: false, error: `Product with id ${id} not found.` });
  }

  res.status(200).json({ success: true, message: 'Product updated successfully.', data: updated });
};

// ─── PATCH /api/products/:id ──────────────────────────────────────────────────

const patchProduct = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const allowedFields = ['name', 'description', 'price', 'stock', 'categoryId', 'brand', 'weight', 'flavors'];
  const fields = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ success: false, error: 'No valid fields provided for partial update.' });
  }

  if (fields.price !== undefined && (isNaN(Number(fields.price)) || Number(fields.price) < 0)) {
    return res.status(400).json({ success: false, error: '"price" must be a non-negative number.' });
  }

  if (fields.categoryId) {
    const category = Category.getById(Number(fields.categoryId));
    if (!category) {
      return res.status(400).json({ success: false, error: `Category with id ${fields.categoryId} does not exist.` });
    }
  }

  const patched = Product.patch(id, fields);
  if (!patched) {
    return res.status(404).json({ success: false, error: `Product with id ${id} not found.` });
  }

  res.status(200).json({ success: true, message: 'Product partially updated.', data: patched });
};

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────

const deleteProduct = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const deleted = Product.remove(id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: `Product with id ${id} not found.` });
  }

  res.status(200).json({ success: true, message: `Product ${id} deleted successfully.` });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
};
