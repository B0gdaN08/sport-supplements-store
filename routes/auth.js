/**
 * routes/auth.js
 * Authentication endpoints.
 * Base path: /api/auth
 */

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// POST /api/auth/login     → returns JWT token
router.post('/login', ctrl.login);

// POST /api/auth/register  → create new user account, returns JWT token
router.post('/register', ctrl.register);

// GET  /api/auth/me        → current user info (requires auth)
router.get('/me', authenticate, ctrl.me);

// GET  /api/auth/users     → list all users (admin only)
router.get('/users', requireAdmin, ctrl.getUsers);

module.exports = router;
