/**
 * models/userModel.js
 * In-memory user storage.
 * Seeded with admin and a default user; new users can register at runtime.
 */

let nextId = 3;

const users = new Map([
  [1, {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrator',
    avatarUrl: '',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [2, {
    id: 2,
    username: 'user',
    password: 'user123',
    role: 'user',
    name: 'John Doe',
    avatarUrl: '',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
]);

const findByUsername = (username) =>
  Array.from(users.values()).find(u => u.username === username) || null;

const findById = (id) => users.get(Number(id)) || null;

const getAll = () =>
  Array.from(users.values()).map(({ password, ...rest }) => rest); // never expose passwords

const create = ({ username, password, name, avatarUrl }) => {
  const newUser = {
    id: nextId++,
    username: username.trim(),
    password,
    role: 'user',
    name: name.trim(),
    avatarUrl: avatarUrl || '',
    createdAt: new Date().toISOString(),
  };
  users.set(newUser.id, newUser);
  const { password: _pw, ...publicUser } = newUser;
  return publicUser;
};

/** Full update (PUT) — overwrites name, username, password, role */
const update = (id, { name, username, password, role }) => {
  const existing = users.get(Number(id));
  if (!existing) return null;
  const updated = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    username: username !== undefined ? username.trim() : existing.username,
    password: password !== undefined ? password : existing.password,
    role: role !== undefined ? role : existing.role,
  };
  users.set(Number(id), updated);
  const { password: _pw, ...publicUser } = updated;
  return publicUser;
};

/** Partial update (PATCH) — only provided fields change */
const patch = (id, fields) => {
  const existing = users.get(Number(id));
  if (!existing) return null;
  if (fields.name) fields.name = fields.name.trim();
  if (fields.username) fields.username = fields.username.trim();
  const patched = { ...existing, ...fields };
  users.set(Number(id), patched);
  const { password: _pw, ...publicUser } = patched;
  return publicUser;
};

/** Delete a user by ID */
const remove = (id) => users.delete(Number(id));

module.exports = { findByUsername, findById, getAll, create, update, patch, remove };
