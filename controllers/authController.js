/**
 * controllers/authController.js
 * Handles login, registration, current-user info, and user registry.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/auth');

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  const user = User.findByUsername(username.trim());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: 'Invalid credentials.' });
  }

  const payload = { id: user.id, username: user.username, name: user.name, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  res.json({ success: true, token, user: payload });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────

const register = (req, res) => {
  const { username, password, name } = req.body;

  const errors = [];
  if (!username || username.trim().length < 3) errors.push('"username" must be at least 3 characters.');
  if (!password || password.length < 4) errors.push('"password" must be at least 4 characters.');
  if (!name || name.trim().length < 2) errors.push('"name" must be at least 2 characters.');
  if (errors.length) {
    return res.status(400).json({ success: false, error: 'Validation failed.', details: errors });
  }

  if (User.findByUsername(username.trim())) {
    return res.status(409).json({ success: false, error: `Username "${username.trim()}" is already taken.` });
  }

  const newUser = User.create({ username, password, name });

  const payload = { id: newUser.id, username: newUser.username, name: newUser.name, role: newUser.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  res.status(201).json({ success: true, token, user: payload });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

const me = (req, res) => {
  // Return full user data (not just JWT payload) so avatarUrl etc. are included
  const full = User.findById(req.user.id);
  if (!full) return res.status(404).json({ success: false, error: 'User not found.' });
  const { password: _pw, ...publicUser } = full;
  res.json({ success: true, user: publicUser });
};

// ─── GET /api/auth/users ─────────────────────────────────────────────────────
// Admin only — returns all registered users (no passwords)

const getUsers = (_req, res) => {
  const users = User.getAll();
  res.json({ success: true, count: users.length, data: users });
};

// ─── PUT /api/auth/users/:id ──────────────────────────────────────────────────
// Admin only — full update of a user

const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, username, password, role } = req.body;

  const existing = User.findById(id);
  if (!existing) return res.status(404).json({ success: false, error: `User #${id} not found.` });

  const errors = [];
  if (name !== undefined && name.trim().length < 2) errors.push('"name" must be at least 2 characters.');
  if (username !== undefined && username.trim().length < 3) errors.push('"username" must be at least 3 characters.');
  if (password !== undefined && password.length < 4) errors.push('"password" must be at least 4 characters.');
  if (role !== undefined && !['admin', 'user'].includes(role)) errors.push('"role" must be "admin" or "user".');
  if (errors.length) return res.status(400).json({ success: false, error: 'Validation failed.', details: errors });

  // Check username uniqueness if changing it
  if (username && username.trim() !== existing.username) {
    const taken = User.findByUsername(username.trim());
    if (taken) return res.status(409).json({ success: false, error: `Username "${username.trim()}" is already taken.` });
  }

  const updated = User.update(id, { name, username, password, role });
  res.json({ success: true, data: updated });
};

// ─── PATCH /api/auth/users/:id ────────────────────────────────────────────────
// Admin only — partial update; also allows a user to edit their own profile

const patchUser = (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const existing = User.findById(id);
  if (!existing) return res.status(404).json({ success: false, error: `User #${id} not found.` });

  // Non-admins can only edit themselves, and cannot change their role
  if (req.user.role !== 'admin') {
    if (req.user.id !== Number(id)) {
      return res.status(403).json({ success: false, error: 'You can only edit your own profile.' });
    }
    delete fields.role; // users cannot elevate their own role
  }

  const errors = [];
  if (fields.name !== undefined && fields.name.trim().length < 2) errors.push('"name" must be at least 2 characters.');
  if (fields.username !== undefined && fields.username.trim().length < 3) errors.push('"username" must be at least 3 characters.');
  if (fields.password !== undefined && fields.password.length < 4) errors.push('"password" must be at least 4 characters.');
  if (fields.role !== undefined && !['admin', 'user'].includes(fields.role)) errors.push('"role" must be "admin" or "user".');
  if (errors.length) return res.status(400).json({ success: false, error: 'Validation failed.', details: errors });

  if (fields.username && fields.username.trim() !== existing.username) {
    const taken = User.findByUsername(fields.username.trim());
    if (taken) return res.status(409).json({ success: false, error: `Username "${fields.username.trim()}" is already taken.` });
  }

  const patched = User.patch(id, fields);
  res.json({ success: true, data: patched });
};

// ─── DELETE /api/auth/users/:id ───────────────────────────────────────────────
// Admin only — remove a user account

const deleteUser = (req, res) => {
  const { id } = req.params;

  if (!User.findById(id)) {
    return res.status(404).json({ success: false, error: `User #${id} not found.` });
  }
  if (req.user.id === Number(id)) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own account.' });
  }

  User.remove(id);
  res.json({ success: true, message: `User #${id} deleted.` });
};

module.exports = { login, register, me, getUsers, updateUser, patchUser, deleteUser };
