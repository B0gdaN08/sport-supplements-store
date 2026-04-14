/**
 * auth.js
 * Frontend authentication management.
 * Handles JWT storage, user info, role-based UI, and guest mode.
 */

const AUTH_KEY = 'sportsupps_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem(AUTH_KEY);
}

function setToken(token) {
  localStorage.setItem(AUTH_KEY, token);
}

function removeToken() {
  localStorage.removeItem(AUTH_KEY);
}

// ─── User helpers ─────────────────────────────────────────────────────────────

function getUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      removeToken();
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function isAdmin() {
  return getUser()?.role === 'admin';
}

function isAuthenticated() {
  return !!getUser();
}

// ─── Auth guards ──────────────────────────────────────────────────────────────

/**
 * Redirect to login only if NOT authenticated.
 * Returns true if authenticated, false otherwise.
 * Use ONLY for pages that should be fully private (e.g. admin-only pages).
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

/**
 * Redirect to home if not admin.
 * Use for admin-only pages like users.html.
 */
function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = '/';
    return false;
  }
  return true;
}

function logout() {
  removeToken();
  window.location.href = '/';
}

// ─── Navbar rendering ─────────────────────────────────────────────────────────

/**
 * Renders the #navUser area depending on auth state:
 * - Guest: Login + Register buttons
 * - Logged in: username, role badge, logout button
 */
function renderNavAuth() {
  const el = document.getElementById('navUser');
  if (!el) return;

  const user = getUser();
  if (!user) {
    el.innerHTML = `
      <a href="/login.html" class="btn btn-ghost btn-sm">Login</a>
      <a href="/login.html?mode=register" class="btn btn-primary btn-sm">Register</a>
    `;
    return;
  }

  el.innerHTML = `
    <span class="nav-username">${escHtml(user.name)}</span>
    <span class="badge ${user.role === 'admin' ? 'badge-green' : 'badge-blue'} nav-role-badge">${user.role}</span>
    <button class="btn btn-ghost btn-sm" onclick="logout()">Logout</button>
  `;
}

// ─── Role-based element visibility ───────────────────────────────────────────

/**
 * Shows .admin-only only for admins.
 * Shows .user-only only for logged-in regular users.
 * Shows .guest-only only for guests (not logged in).
 * Shows .auth-only for any logged-in user (admin or user).
 */
function applyRoleUI() {
  const user = getUser();
  const admin = user?.role === 'admin';
  const loggedIn = !!user;

  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = admin ? '' : 'none';
  });
  document.querySelectorAll('.user-only').forEach(el => {
    el.style.display = (!admin && loggedIn) ? '' : 'none';
  });
  document.querySelectorAll('.guest-only').forEach(el => {
    el.style.display = loggedIn ? 'none' : '';
  });
  document.querySelectorAll('.auth-only').forEach(el => {
    el.style.display = loggedIn ? '' : 'none';
  });
}
