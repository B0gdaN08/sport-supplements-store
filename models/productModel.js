/**
 * models/productModel.js
 * In-memory data store for Product entities.
 * Data is held in a Map keyed by product ID.
 */

let nextId = 7;

/**
 * Product entity shape:
 * {
 *   id:          number  - unique identifier
 *   name:        string  - product name
 *   description: string  - detailed description
 *   price:       number  - price in EUR
 *   stock:       number  - units available
 *   categoryId:  number  - foreign key → Category
 *   brand:       string  - manufacturer brand
 *   weight:      number  - grams per container
 *   flavors:     string[] - available flavors
 *   createdAt:   string  - ISO timestamp
 * }
 */

// ─── Seed Data ────────────────────────────────────────────────────────────────

const products = new Map([
  [1, {
    id: 1,
    name: 'Whey Protein Gold Standard',
    description: 'Premium whey protein isolate with 24g of protein per serving. Ideal for post-workout recovery.',
    price: 59.99,
    stock: 150,
    categoryId: 1,
    brand: 'Optimum Nutrition',
    weight: 907,
    flavors: ['Chocolate', 'Vanilla', 'Strawberry'],
    createdAt: new Date('2024-01-15').toISOString(),
  }],
  [2, {
    id: 2,
    name: 'Plant Protein Vegan Blend',
    description: 'Complete plant-based protein from pea, rice and hemp. 20g of protein per serving.',
    price: 44.99,
    stock: 80,
    categoryId: 1,
    brand: 'MyProtein',
    weight: 1000,
    flavors: ['Natural', 'Chocolate', 'Vanilla'],
    createdAt: new Date('2024-01-20').toISOString(),
  }],
  [3, {
    id: 3,
    name: 'Creatine Monohydrate Pure',
    description: 'Micronized creatine monohydrate for maximum absorption. 5g per serving.',
    price: 19.99,
    stock: 200,
    categoryId: 2,
    brand: 'Bulk Powders',
    weight: 500,
    flavors: ['Unflavored'],
    createdAt: new Date('2024-02-01').toISOString(),
  }],
  [4, {
    id: 4,
    name: 'Creatine HCL Advanced',
    description: 'Creatine hydrochloride for superior solubility and faster uptake with no bloating.',
    price: 29.99,
    stock: 90,
    categoryId: 2,
    brand: 'Scitec',
    weight: 300,
    flavors: ['Fruit Punch', 'Watermelon'],
    createdAt: new Date('2024-02-10').toISOString(),
  }],
  [5, {
    id: 5,
    name: 'Pre-Workout Explosion',
    description: 'Intense energy matrix with caffeine, beta-alanine and citrulline for explosive workouts.',
    price: 34.99,
    stock: 60,
    categoryId: 3,
    brand: 'MuscleTech',
    weight: 300,
    flavors: ['Blue Raspberry', 'Watermelon', 'Green Apple'],
    createdAt: new Date('2024-03-01').toISOString(),
  }],
  [6, {
    id: 6,
    name: 'Clean Energy Pre-Workout',
    description: 'Natural caffeine from green tea with adaptogens for clean sustained energy.',
    price: 39.99,
    stock: 45,
    categoryId: 3,
    brand: 'Transparent Labs',
    weight: 250,
    flavors: ['Lemon Lime', 'Orange'],
    createdAt: new Date('2024-03-15').toISOString(),
  }],
]);

// ─── Model Methods ────────────────────────────────────────────────────────────

const getAll = (filters = {}) => {
  let result = Array.from(products.values());
  if (filters.categoryId) {
    result = result.filter(p => p.categoryId === Number(filters.categoryId));
  }
  return result;
};

const getById = (id) => products.get(Number(id));

const create = ({ name, description, price, stock, categoryId, brand, weight, flavors }) => {
  const newProduct = {
    id: nextId++,
    name,
    description: description || '',
    price: Number(price),
    stock: Number(stock) || 0,
    categoryId: Number(categoryId),
    brand: brand || '',
    weight: Number(weight) || 0,
    flavors: Array.isArray(flavors) ? flavors : (flavors ? flavors.split(',').map(f => f.trim()) : []),
    createdAt: new Date().toISOString(),
  };
  products.set(newProduct.id, newProduct);
  return newProduct;
};

const update = (id, { name, description, price, stock, categoryId, brand, weight, flavors }) => {
  const existing = products.get(Number(id));
  if (!existing) return null;

  const updated = {
    ...existing,
    name,
    description: description || '',
    price: Number(price),
    stock: Number(stock) || 0,
    categoryId: Number(categoryId),
    brand: brand || '',
    weight: Number(weight) || 0,
    flavors: Array.isArray(flavors) ? flavors : (flavors ? flavors.split(',').map(f => f.trim()) : []),
  };
  products.set(Number(id), updated);
  return updated;
};

const patch = (id, fields) => {
  const existing = products.get(Number(id));
  if (!existing) return null;

  // Handle flavors parsing if provided as string
  if (fields.flavors && !Array.isArray(fields.flavors)) {
    fields.flavors = fields.flavors.split(',').map(f => f.trim());
  }
  if (fields.price !== undefined) fields.price = Number(fields.price);
  if (fields.stock !== undefined) fields.stock = Number(fields.stock);
  if (fields.categoryId !== undefined) fields.categoryId = Number(fields.categoryId);

  const patched = { ...existing, ...fields };
  products.set(Number(id), patched);
  return patched;
};

const remove = (id) => products.delete(Number(id));

module.exports = { getAll, getById, create, update, patch, remove };
