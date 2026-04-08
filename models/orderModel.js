/**
 * models/orderModel.js
 * In-memory data store for Order entities.
 */

let nextId = 4;

/**
 * Order entity shape:
 * {
 *   id:           number  - unique identifier
 *   customerName: string  - full name of the customer
 *   customerEmail:string  - customer email
 *   items:        Array<{ productId: number, quantity: number, unitPrice: number }>
 *   status:       string  - 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
 *   total:        number  - total order amount in EUR
 *   shippingAddress: string - delivery address
 *   notes:        string  - optional order notes
 *   createdAt:    string  - ISO timestamp
 * }
 */

const STATUS_VALUES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// ─── Seed Data ────────────────────────────────────────────────────────────────

const orders = new Map([
  [1, {
    id: 1,
    customerName: 'Carlos García',
    customerEmail: 'carlos.garcia@email.com',
    items: [
      { productId: 1, quantity: 2, unitPrice: 59.99 },
      { productId: 3, quantity: 1, unitPrice: 19.99 },
    ],
    status: 'delivered',
    total: 139.97,
    shippingAddress: 'Calle Mayor 15, 28001 Madrid, Spain',
    notes: 'Please leave at the door',
    createdAt: new Date('2024-03-01').toISOString(),
  }],
  [2, {
    id: 2,
    customerName: 'Laura Martínez',
    customerEmail: 'laura.martinez@email.com',
    items: [
      { productId: 5, quantity: 1, unitPrice: 34.99 },
      { productId: 2, quantity: 1, unitPrice: 44.99 },
    ],
    status: 'shipped',
    total: 79.98,
    shippingAddress: 'Avenida Diagonal 200, 08013 Barcelona, Spain',
    notes: '',
    createdAt: new Date('2024-03-10').toISOString(),
  }],
  [3, {
    id: 3,
    customerName: 'Miguel Torres',
    customerEmail: 'miguel.torres@email.com',
    items: [
      { productId: 4, quantity: 2, unitPrice: 29.99 },
    ],
    status: 'pending',
    total: 59.98,
    shippingAddress: 'Plaza España 1, 41001 Sevilla, Spain',
    notes: 'Call before delivery',
    createdAt: new Date('2024-03-20').toISOString(),
  }],
]);

// ─── Model Methods ────────────────────────────────────────────────────────────

const getAll = (filters = {}) => {
  let result = Array.from(orders.values());
  if (filters.status) {
    result = result.filter(o => o.status === filters.status);
  }
  if (filters.userId) {
    result = result.filter(o => o.userId === filters.userId);
  }
  return result;
};

const getById = (id) => orders.get(Number(id));

const create = ({ customerName, customerEmail, items, shippingAddress, notes, userId }) => {
  // Calculate total from items
  const parsedItems = (Array.isArray(items) ? items : []).map(item => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  }));

  const total = parsedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const newOrder = {
    id: nextId++,
    userId: userId || null,
    customerName,
    customerEmail,
    items: parsedItems,
    status: 'pending',
    total: Math.round(total * 100) / 100,
    shippingAddress: shippingAddress || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
  orders.set(newOrder.id, newOrder);
  return newOrder;
};

const update = (id, { customerName, customerEmail, items, status, shippingAddress, notes }) => {
  const existing = orders.get(Number(id));
  if (!existing) return null;

  const parsedItems = (Array.isArray(items) ? items : []).map(item => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  }));
  const total = parsedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const updated = {
    ...existing,
    customerName,
    customerEmail,
    items: parsedItems,
    status: STATUS_VALUES.includes(status) ? status : existing.status,
    total: Math.round(total * 100) / 100,
    shippingAddress: shippingAddress || '',
    notes: notes || '',
  };
  orders.set(Number(id), updated);
  return updated;
};

const patch = (id, fields) => {
  const existing = orders.get(Number(id));
  if (!existing) return null;

  if (fields.status && !STATUS_VALUES.includes(fields.status)) {
    return { error: `Invalid status. Must be one of: ${STATUS_VALUES.join(', ')}` };
  }
  if (fields.items) {
    fields.items = fields.items.map(item => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));
    fields.total = Math.round(fields.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * 100) / 100;
  }

  const patched = { ...existing, ...fields };
  orders.set(Number(id), patched);
  return patched;
};

const remove = (id) => orders.delete(Number(id));

module.exports = { getAll, getById, create, update, patch, remove, STATUS_VALUES };
