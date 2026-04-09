/**
 * models/productModel.js
 * In-memory data store for Product entities.
 * Data is held in a Map keyed by product ID.
 */

let nextId = 25;

/**
 * Product entity shape:
 * {
 *   id:          number    - unique identifier
 *   name:        string    - product name
 *   description: string    - detailed description
 *   price:       number    - price in EUR
 *   stock:       number    - units available
 *   categoryId:  number    - foreign key → Category
 *   brand:       string    - manufacturer brand
 *   weight:      number    - grams per container
 *   flavors:     string[]  - available flavors
 *   imageUrl:    string    - product image URL
 *   createdAt:   string    - ISO timestamp
 * }
 */

// ─── Seed Data ────────────────────────────────────────────────────────────────

const products = new Map([
  // ── Protein (categoryId: 1) ───────────────────────────────────────────────
  [1, {
    id: 1,
    name: 'Whey Protein Gold Standard',
    description: 'Premium whey protein isolate with 24g of protein per serving. Ideal for post-workout recovery.',
    price: 59.99, stock: 150, categoryId: 1,
    brand: 'Optimum Nutrition', weight: 907,
    flavors: ['Chocolate', 'Vanilla', 'Strawberry'],
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop',
    createdAt: new Date('2024-01-15').toISOString(),
  }],
  [2, {
    id: 2,
    name: 'Plant Protein Vegan Blend',
    description: 'Complete plant-based protein from pea, rice and hemp. 20g of protein per serving.',
    price: 44.99, stock: 80, categoryId: 1,
    brand: 'MyProtein', weight: 1000,
    flavors: ['Natural', 'Chocolate', 'Vanilla'],
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
    createdAt: new Date('2024-01-20').toISOString(),
  }],
  [3, {
    id: 3,
    name: 'Casein Slow-Release Protein',
    description: 'Micellar casein for overnight recovery. Releases amino acids steadily over 7 hours.',
    price: 52.99, stock: 65, categoryId: 1,
    brand: 'Dymatize', weight: 907,
    flavors: ['Cookies & Cream', 'Vanilla'],
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    createdAt: new Date('2024-01-25').toISOString(),
  }],

  // ── Creatine (categoryId: 2) ──────────────────────────────────────────────
  [4, {
    id: 4,
    name: 'Creatine Monohydrate Pure',
    description: 'Micronized creatine monohydrate for maximum absorption. 5g per serving.',
    price: 19.99, stock: 200, categoryId: 2,
    brand: 'Bulk Powders', weight: 500,
    flavors: ['Unflavored'],
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    createdAt: new Date('2024-02-01').toISOString(),
  }],
  [5, {
    id: 5,
    name: 'Creatine HCL Advanced',
    description: 'Creatine hydrochloride for superior solubility and faster uptake with no bloating.',
    price: 29.99, stock: 90, categoryId: 2,
    brand: 'Scitec', weight: 300,
    flavors: ['Fruit Punch', 'Watermelon'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    createdAt: new Date('2024-02-10').toISOString(),
  }],

  // ── Pre-Workout (categoryId: 3) ───────────────────────────────────────────
  [6, {
    id: 6,
    name: 'Pre-Workout Explosion',
    description: 'Intense energy matrix with caffeine, beta-alanine and citrulline for explosive workouts.',
    price: 34.99, stock: 60, categoryId: 3,
    brand: 'MuscleTech', weight: 300,
    flavors: ['Blue Raspberry', 'Watermelon', 'Green Apple'],
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    createdAt: new Date('2024-03-01').toISOString(),
  }],
  [7, {
    id: 7,
    name: 'Clean Energy Pre-Workout',
    description: 'Natural caffeine from green tea with adaptogens for clean sustained energy.',
    price: 39.99, stock: 45, categoryId: 3,
    brand: 'Transparent Labs', weight: 250,
    flavors: ['Lemon Lime', 'Orange'],
    imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop',
    createdAt: new Date('2024-03-15').toISOString(),
  }],
  [8, {
    id: 8,
    name: 'Stim-Free Pre-Workout',
    description: 'Caffeine-free formula with pump-enhancing nitrates and focus nootropics.',
    price: 37.99, stock: 35, categoryId: 3,
    brand: 'Legion', weight: 280,
    flavors: ['Grape', 'Strawberry Kiwi'],
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop',
    createdAt: new Date('2024-03-20').toISOString(),
  }],

  // ── BCAA & Amino Acids (categoryId: 4) ───────────────────────────────────
  [9, {
    id: 9,
    name: 'BCAA 2:1:1 Instantized',
    description: 'Branched-chain amino acids in the optimal 2:1:1 ratio. Prevents catabolism during training.',
    price: 24.99, stock: 120, categoryId: 4,
    brand: 'Scitec', weight: 400,
    flavors: ['Tropical', 'Cola', 'Unflavored'],
    imageUrl: 'https://images.unsplash.com/photo-1546519638405-a9f5d37a6a2e?w=400&h=300&fit=crop',
    createdAt: new Date('2024-04-01').toISOString(),
  }],
  [10, {
    id: 10,
    name: 'EAA Essential Amino Matrix',
    description: 'All 9 essential amino acids including BCAAs for complete muscle protein synthesis support.',
    price: 32.99, stock: 75, categoryId: 4,
    brand: 'Kaged Muscle', weight: 350,
    flavors: ['Cherry Limeade', 'Watermelon'],
    imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop',
    createdAt: new Date('2024-04-10').toISOString(),
  }],
  [11, {
    id: 11,
    name: 'L-Glutamine Recovery',
    description: 'Pure L-glutamine powder to support gut health, immune function and muscle recovery.',
    price: 17.99, stock: 180, categoryId: 4,
    brand: 'NOW Sports', weight: 500,
    flavors: ['Unflavored'],
    imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop',
    createdAt: new Date('2024-04-15').toISOString(),
  }],

  // ── Vitamins & Minerals (categoryId: 5) ──────────────────────────────────
  [12, {
    id: 12,
    name: 'Athlete Multivitamin Complex',
    description: 'Complete daily multivitamin with 25+ vitamins and minerals tailored for high-performance athletes.',
    price: 22.99, stock: 200, categoryId: 5,
    brand: 'Optimum Nutrition', weight: 150,
    flavors: ['Tablets'],
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
    createdAt: new Date('2024-05-01').toISOString(),
  }],
  [13, {
    id: 13,
    name: 'Vitamin D3 + K2 5000 IU',
    description: 'High-potency vitamin D3 combined with K2 MK-7 for optimal bone health and immune support.',
    price: 14.99, stock: 300, categoryId: 5,
    brand: 'Life Extension', weight: 50,
    flavors: ['Softgels'],
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop',
    createdAt: new Date('2024-05-10').toISOString(),
  }],
  [14, {
    id: 14,
    name: 'Omega-3 Fish Oil Triple Strength',
    description: '3000mg of EPA and DHA per serving for heart, brain and joint health.',
    price: 18.99, stock: 160, categoryId: 5,
    brand: 'Nordic Naturals', weight: 120,
    flavors: ['Lemon', 'Unflavored'],
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
    createdAt: new Date('2024-05-15').toISOString(),
  }],

  // ── Fat Burners (categoryId: 6) ───────────────────────────────────────────
  [15, {
    id: 15,
    name: 'Thermogenic Fat Burner X',
    description: 'Advanced thermogenic blend with green tea extract, caffeine and CLA to maximize fat oxidation.',
    price: 42.99, stock: 55, categoryId: 6,
    brand: 'MuscleTech', weight: 180,
    flavors: ['Capsules'],
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    createdAt: new Date('2024-06-01').toISOString(),
  }],
  [16, {
    id: 16,
    name: 'L-Carnitine 3000 Liquid',
    description: 'Liquid L-Carnitine for enhanced fat transport into mitochondria during cardio sessions.',
    price: 26.99, stock: 80, categoryId: 6,
    brand: 'Scitec', weight: 500,
    flavors: ['Tropical', 'Cherry'],
    imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop',
    createdAt: new Date('2024-06-15').toISOString(),
  }],

  // ── Mass Gainers (categoryId: 7) ──────────────────────────────────────────
  [17, {
    id: 17,
    name: 'Serious Mass 12 lbs',
    description: '1250 calories per serving with 50g of protein and complex carbohydrates for extreme muscle growth.',
    price: 79.99, stock: 40, categoryId: 7,
    brand: 'Optimum Nutrition', weight: 5443,
    flavors: ['Chocolate', 'Vanilla', 'Banana'],
    imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop',
    createdAt: new Date('2024-07-01').toISOString(),
  }],
  [18, {
    id: 18,
    name: 'True Mass 1200',
    description: 'Ultra-premium mass gainer with 215g of carbs and 50g of protein for hard gainers.',
    price: 69.99, stock: 30, categoryId: 7,
    brand: 'BSN', weight: 4730,
    flavors: ['Chocolate Milkshake', 'Cookies & Cream'],
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop',
    createdAt: new Date('2024-07-10').toISOString(),
  }],

  // ── Recovery (categoryId: 8) ──────────────────────────────────────────────
  [19, {
    id: 19,
    name: 'ZMA Sleep & Recovery',
    description: 'Zinc, magnesium and vitamin B6 complex for deep sleep, testosterone support and muscle recovery.',
    price: 21.99, stock: 130, categoryId: 8,
    brand: 'NOW Sports', weight: 90,
    flavors: ['Capsules'],
    imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop',
    createdAt: new Date('2024-08-01').toISOString(),
  }],
  [20, {
    id: 20,
    name: 'Electrolyte Recovery Drink',
    description: 'Rapid rehydration formula with sodium, potassium, magnesium and coconut water powder.',
    price: 28.99, stock: 100, categoryId: 8,
    brand: 'Nuun', weight: 360,
    flavors: ['Lemon Ginger', 'Berry', 'Orange'],
    imageUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop',
    createdAt: new Date('2024-08-10').toISOString(),
  }],
  [21, {
    id: 21,
    name: 'Collagen Peptides Sport',
    description: 'Hydrolyzed collagen peptides for joint health, tendon strength and skin elasticity.',
    price: 35.99, stock: 85, categoryId: 8,
    brand: 'Vital Proteins', weight: 567,
    flavors: ['Unflavored', 'Vanilla Coconut'],
    imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop',
    createdAt: new Date('2024-08-20').toISOString(),
  }],
  [22, {
    id: 22,
    name: 'Tart Cherry Extract',
    description: 'Natural anti-inflammatory from tart cherry concentrate. Reduces DOMS and speeds recovery.',
    price: 19.99, stock: 110, categoryId: 8,
    brand: 'Swanson', weight: 120,
    flavors: ['Capsules'],
    imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop',
    createdAt: new Date('2024-08-25').toISOString(),
  }],

  // ── Extra Protein products ────────────────────────────────────────────────
  [23, {
    id: 23,
    name: 'Whey Isolate CFM 90%',
    description: 'Cross-flow micro-filtered whey isolate. 90% protein, virtually zero fat and lactose.',
    price: 74.99, stock: 50, categoryId: 1,
    brand: 'Scitec', weight: 900,
    flavors: ['White Chocolate', 'Pistachio', 'Chocolate'],
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
    createdAt: new Date('2024-09-01').toISOString(),
  }],
  [24, {
    id: 24,
    name: 'Protein Bar Box (12 units)',
    description: 'High-protein bars with 20g of protein, low sugar and real chocolate coating.',
    price: 29.99, stock: 200, categoryId: 1,
    brand: 'Quest', weight: 600,
    flavors: ['Cookies & Cream', 'Birthday Cake', 'Chocolate Brownie'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    createdAt: new Date('2024-09-10').toISOString(),
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

const create = ({ name, description, price, stock, categoryId, brand, weight, flavors, imageUrl }) => {
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
    imageUrl: imageUrl || '',
    createdAt: new Date().toISOString(),
  };
  products.set(newProduct.id, newProduct);
  return newProduct;
};

const update = (id, { name, description, price, stock, categoryId, brand, weight, flavors, imageUrl }) => {
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
    imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
  };
  products.set(Number(id), updated);
  return updated;
};

const patch = (id, fields) => {
  const existing = products.get(Number(id));
  if (!existing) return null;

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
