/**
 * controllers/categoryController.js
 * Business logic for Category CRUD operations.
 * Validates input and delegates to the model layer.
 */

const Category = require('../models/categoryModel');

// ─── GET /api/categories ──────────────────────────────────────────────────────

const getAllCategories = (req, res) => {
  const categories = Category.getAll();
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
};

// ─── GET /api/categories/:id ──────────────────────────────────────────────────

const getCategoryById = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const category = Category.getById(id);
  if (!category) {
    return res.status(404).json({ success: false, error: `Category with id ${id} not found.` });
  }

  res.status(200).json({ success: true, data: category });
};

// ─── POST /api/categories ─────────────────────────────────────────────────────

const createCategory = (req, res) => {
  const { name, slug, description, icon } = req.body;

  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Field "name" is required.' });
  }

  // Check for duplicate slug
  const existing = Category.getAll().find(c => c.slug === (slug || name.toLowerCase().replace(/\s+/g, '-')));
  if (existing) {
    return res.status(400).json({ success: false, error: 'A category with this name/slug already exists.' });
  }

  const newCategory = Category.create({ name: name.trim(), slug, description, icon });
  res.status(201).json({ success: true, message: 'Category created successfully.', data: newCategory });
};

// ─── PUT /api/categories/:id ──────────────────────────────────────────────────

const updateCategory = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const { name, slug, description, icon } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Field "name" is required for full update.' });
  }

  const updated = Category.update(id, { name: name.trim(), slug, description, icon });
  if (!updated) {
    return res.status(404).json({ success: false, error: `Category with id ${id} not found.` });
  }

  res.status(200).json({ success: true, message: 'Category updated successfully.', data: updated });
};

// ─── PATCH /api/categories/:id ────────────────────────────────────────────────

const patchCategory = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const allowedFields = ['name', 'slug', 'description', 'icon'];
  const fields = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  }

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ success: false, error: 'No valid fields provided for partial update.' });
  }

  const patched = Category.patch(id, fields);
  if (!patched) {
    return res.status(404).json({ success: false, error: `Category with id ${id} not found.` });
  }

  res.status(200).json({ success: true, message: 'Category partially updated.', data: patched });
};

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────

const deleteCategory = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid ID — must be a number.' });
  }

  const deleted = Category.remove(id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: `Category with id ${id} not found.` });
  }

  res.status(200).json({ success: true, message: `Category ${id} deleted successfully.` });
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  patchCategory,
  deleteCategory,
};
