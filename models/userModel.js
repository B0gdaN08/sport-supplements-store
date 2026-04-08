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
    createdAt: new Date('2024-01-01').toISOString(),
  }],
  [2, {
    id: 2,
    username: 'user',
    password: 'user123',
    role: 'user',
    name: 'John Doe',
    createdAt: new Date('2024-01-01').toISOString(),
  }],
]);

const findByUsername = (username) =>
  Array.from(users.values()).find(u => u.username === username) || null;

const findById = (id) => users.get(Number(id)) || null;

const getAll = () =>
  Array.from(users.values()).map(({ password, ...rest }) => rest); // never expose passwords

const create = ({ username, password, name }) => {
  const newUser = {
    id: nextId++,
    username: username.trim(),
    password,
    role: 'user',
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  users.set(newUser.id, newUser);
  const { password: _pw, ...publicUser } = newUser;
  return publicUser;
};

module.exports = { findByUsername, findById, getAll, create };
