/**
 * models/categoryModel.js
 * In-memory data store for Category entities.
 * No database — data is held in a Map keyed by category ID.
 */

// Auto-incrementing ID counter
let nextId = 12;

/**
 * Category entity shape:
 * {
 *   id:          number  - unique identifier
 *   name:        string  - category name (e.g. "Protein")
 *   slug:        string  - URL-safe identifier (e.g. "protein")
 *   description: string  - short description
 *   icon:        string  - emoji icon for display
 *   imageUrl:    string  - category banner image URL
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
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [2, {
    id: 2,
    name: 'Creatine',
    slug: 'creatine',
    description: 'Creatine supplements to boost strength and power output.',
    icon: '⚡',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [3, {
    id: 3,
    name: 'Pre-Workout',
    slug: 'pre-workout',
    description: 'Energy and focus formulas for peak training performance.',
    icon: '🔥',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [4, {
    id: 4,
    name: 'BCAA & Amino Acids',
    slug: 'bcaa-amino-acids',
    description: 'Essential amino acids for muscle endurance, recovery and lean muscle retention.',
    icon: '🧬',
    imageUrl: 'https://images.unsplash.com/photo-1546519638405-a9f5d37a6a2e?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [5, {
    id: 5,
    name: 'Vitamins & Minerals',
    slug: 'vitamins-minerals',
    description: 'Micronutrients and vitamin complexes to support overall health and immunity.',
    icon: '🌿',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [6, {
    id: 6,
    name: 'Fat Burners',
    slug: 'fat-burners',
    description: 'Thermogenic supplements to accelerate metabolism and support weight loss.',
    icon: '🔆',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [7, {
    id: 7,
    name: 'Mass Gainers',
    slug: 'mass-gainers',
    description: 'High-calorie protein and carb blends for bulking and serious size gains.',
    icon: '🏋️',
    imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [8, {
    id: 8,
    name: 'Recovery',
    slug: 'recovery',
    description: 'Post-workout recovery formulas to reduce soreness and speed up muscle repair.',
    icon: '🛌',
    imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [9, {
    id: 9,
    name: 'Protein Bars & Snacks',
    slug: 'protein-bars-snacks',
    description: 'Convenient high-protein bars, cookies and snacks for on-the-go nutrition.',
    icon: '🍫',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [10, {
    id: 10,
    name: 'Joint & Mobility',
    slug: 'joint-mobility',
    description: 'Glucosamine, chondroitin and collagen supplements for joint health and flexibility.',
    icon: '🦴',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [11, {
    id: 11,
    name: 'Hydration & Electrolytes',
    slug: 'hydration-electrolytes',
    description: 'Sports drinks, electrolyte tablets and hydration mixes for peak performance and recovery.',
    icon: '💧',
    imageUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=200&fit=crop',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
]);

// ─── Model Methods ────────────────────────────────────────────────────────────

/** Return all categories as an array */
const getAll = () => Array.from(categories.values());

/** Find a category by numeric ID; returns undefined if not found */
const getById = (id) => categories.get(Number(id));

/** Create a new category and return it */
const create = ({ name, slug, description, icon, imageUrl }) => {
  const newCategory = {
    id: nextId++,
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description: description || '',
    icon: icon || '📦',
    imageUrl: imageUrl || '',
    createdAt: new Date().toISOString(),
  };
  categories.set(newCategory.id, newCategory);
  return newCategory;
};

/** Full replacement update (PUT); returns updated category or null */
const update = (id, { name, slug, description, icon, imageUrl }) => {
  const existing = categories.get(Number(id));
  if (!existing) return null;

  const updated = {
    ...existing,
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description: description || '',
    icon: icon || existing.icon,
    imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
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
