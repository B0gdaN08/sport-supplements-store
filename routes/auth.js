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

// GET    /api/auth/users     → list all users (admin only)
router.get('/users', requireAdmin, ctrl.getUsers);

// PUT    /api/auth/users/:id → full update of a user (admin only)
router.put('/users/:id', requireAdmin, ctrl.updateUser);

// PATCH  /api/auth/users/:id → partial update (admin or own profile)
router.patch('/users/:id', authenticate, ctrl.patchUser);

// DELETE /api/auth/users/:id → delete a user (admin only)
router.delete('/users/:id', requireAdmin, ctrl.deleteUser);

module.exports = router;
