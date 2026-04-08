/**
 * models/categoryModel.js
 * In-memory data store for Category entities.
 * No database — data is held in a Map keyed by category ID.
 */

// Auto-incrementing ID counter
let nextId = 4;

/**
 * Category entity shape:
 * {
 *   id:          number  - unique identifier
 *   name:        string  - category name (e.g. "Protein")
 *   slug:        string  - URL-safe identifier (e.g. "protein")
 *   description: string  - short description
 *   icon:        string  - emoji icon for display
 *   createdAt:   string  - ISO timestamp
 * }
 */

// ─── Seed Data ────────────────────────────────────────────────────────────────

const categories = new Map([
  [1, {
    id: 1,
    name: 'Protein',
    slug: 'protein',
    description: 'Protein supplements to support muscle growth and recovery.',
    icon: '💪',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [2, {
    id: 2,
    name: 'Creatine',
    slug: 'creatine',
    description: 'Creatine supplements to boost strength and power output.',
    icon: '⚡',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [3, {
    id: 3,
    name: 'Pre-Workout',
    slug: 'pre-workout',
    description: 'Energy and focus formulas for peak training performance.',
    icon: '🔥',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
]);

// ─── Model Methods ────────────────────────────────────────────────────────────

/** Return all categories as an array */
const getAll = () => Array.from(categories.values());

/** Find a category by numeric ID; returns undefined if not found */
const getById = (id) => categories.get(Number(id));

/** Create a new category and return it */
const create = ({ name, slug, description, icon }) => {
  const newCategory = {
    id: nextId++,
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description: description || '',
    icon: icon || '📦',
    createdAt: new Date().toISOString(),
  };
  categories.set(newCategory.id, newCategory);
  return newCategory;
};

/** Full replacement update (PUT); returns updated category or null */
const update = (id, { name, slug, description, icon }) => {
  const existing = categories.get(Number(id));
  if (!existing) return null;

  const updated = {
    ...existing,
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description: description || '',
    icon: icon || existing.icon,
  };
  categories.set(Number(id), updated);
  return updated;
};

/** Partial update (PATCH); only provided fields are changed */
const patch = (id, fields) => {
  const existing = categories.get(Number(id));
  if (!existing) return null;

  const patched = { ...existing, ...fields };
  categories.set(Number(id), patched);
  return patched;
};

/** Delete a category by ID; returns true if deleted, false if not found */
const remove = (id) => categories.delete(Number(id));

module.exports = { getAll, getById, create, update, patch, remove };
