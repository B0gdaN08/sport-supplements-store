/**
 * utils.js
 * Shared utility functions used across all pages.
 * Handles: toasts, tabs, modal helpers, fetch wrappers.
 */

// ─── Toast Notifications ──────────────────────────────────────────────────────

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration - ms before auto-dismiss
 */
function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Tab Switcher ─────────────────────────────────────────────────────────────

/**
 * Switch visible tab panel.
 * @param {string} tabId - matches id="tab-{tabId}"
 * @param {HTMLElement} btn - the button that was clicked
 */
function switchTab(tabId, btn) {
  // Deactivate all
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  // Activate selected
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');
}

// ─── Form Validation Helpers ──────────────────────────────────────────────────

/**
 * Mark a form control as invalid and show its error span.
 * @param {string} inputId
 * @param {string} errorId
 */
function markError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) error.classList.add('show');
}

/**
 * Clear error state from a form control.
 */
function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.remove('error');
  if (error) error.classList.remove('show');
}

/**
 * Clear all error states in a form.
 * @param {string} formId
 */
function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
}

// ─── API Fetch Wrapper ────────────────────────────────────────────────────────

/**
 * Generic fetch wrapper that always parses JSON and handles errors.
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function apiFetch(url, options = {}) {
  try {
    // Automatically attach the JWT from localStorage if present
    const token = localStorage.getItem('sportsupps_token');
    const authHeader = token ? { 'Authorization': 'Bearer ' + token } : {};

    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...authHeader, ...(options.headers || {}) },
      ...options,
    });

    // If 401, redirect to login
    if (res.status === 401) {
      localStorage.removeItem('sportsupps_token');
      window.location.href = '/login.html';
      return { ok: false, status: 401, data: { error: 'Session expired.' } };
    }

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: { error: 'Network error: ' + err.message } };
  }
}

// ─── Date Formatter ───────────────────────────────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Stock Badge ──────────────────────────────────────────────────────────────

function stockBadge(stock) {
  if (stock === undefined) return '—';
  if (stock === 0)  return `<span class="stock-low">0 (out)</span>`;
  if (stock < 20)   return `<span class="stock-low">${stock}</span>`;
  if (stock < 50)   return `<span class="stock-mid">${stock}</span>`;
  return `<span class="stock-high">${stock}</span>`;
}

// ─── Order Status Badge ────────────────────────────────────────────────────────

function statusBadge(status) {
  const map = {
    pending:   'badge-orange',
    confirmed: 'badge-blue',
    shipped:   'badge-blue',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  };
  const icons = {
    pending: '⏳', confirmed: '✅', shipped: '🚚', delivered: '📦', cancelled: '❌'
  };
  const cls = map[status] || 'badge-muted';
  return `<span class="badge ${cls}">${icons[status] || ''} ${status}</span>`;
}

// ─── Escape HTML ──────────────────────────────────────────────────────────────

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
