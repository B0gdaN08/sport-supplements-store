/**
 * middleware/auth.js
 * JWT verification and role-based access control middleware.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sportsupps-secret-2024';

/**
 * Verifies the Bearer token and attaches the decoded user to req.user.
 * Returns 401 if no token or invalid token.
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

/**
 * Verifies the token AND requires the user to have role 'admin'.
 * Returns 403 if the user is authenticated but not an admin.
 */
const requireAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required.' });
    }
    next();
  });
};

/**
 * Attaches req.user if a valid token is present, but does NOT block
 * unauthenticated requests. Use for endpoints accessible to guests.
 */
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET);
    } catch {
      // invalid token → treat as guest, don't block
    }
  }
  next();
};

module.exports = { authenticate, requireAdmin, optionalAuth, JWT_SECRET };
