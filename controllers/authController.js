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
  res.json({ success: true, user: req.user });
};

// ─── GET /api/auth/users ─────────────────────────────────────────────────────
// Admin only — returns all registered users (no passwords)

const getUsers = (req, res) => {
  const users = User.getAll();
  res.json({ success: true, count: users.length, data: users });
};

module.exports = { login, register, me, getUsers };
