/**
 * public/js/categories.js
 * Categories page:
 *   Admin → full CRUD management
 *   User / Guest → read-only list
 */

document.addEventListener('DOMContentLoaded', async () => {
  renderNavAuth();
  applyRoleUI();
  await loadCategories();

  if (isAdmin()) {
    document.getElementById('createForm').addEventListener('submit', handleCreate);
  }
});

// ─── Load & render ────────────────────────────────────────────────────────────

async function loadCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;"><span class="spinner"></span></td></tr>`;

  const { ok, data } = await apiFetch('/api/categories');
  if (!ok) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--red);">${escHtml(data.error)}</td></tr>`;
    return;
  }

  const categories = data.data || [];
  if (!categories.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🗂️</div><h3>No categories yet</h3></div></td></tr>`;
    return;
  }

  const admin = isAdmin();
  tbody.innerHTML = categories.map(c => `
    <tr>
      <td><span class="id-chip">#${c.id}</span></td>
      <td style="font-size:22px;">${escHtml(c.icon || '📦')}</td>
      <td><strong>${escHtml(c.name)}</strong></td>
      <td><code>${escHtml(c.slug || '—')}</code></td>
      <td>${escHtml(c.description || '—')}</td>
      <td>${formatDate(c.createdAt)}</td>
      <td>
        ${admin ? `
          <div class="td-actions">
            <button class="btn btn-secondary btn-sm" onclick="openEdit(${c.id}, 'put')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">Delete</button>
          </div>
        ` : '—'}
      </td>
    </tr>
  `).join('');
}

// ─── Create ───────────────────────────────────────────────────────────────────

async function handleCreate(e) {
  e.preventDefault();
  clearFormErrors('createForm');

  const name = document.getElementById('createName').value.trim();
  if (!name) { markError('createName', 'createNameError'); return; }

  const body = {
    name,
    slug: document.getElementById('createSlug').value.trim() || undefined,
    description: document.getElementById('createDescription').value.trim() || undefined,
    icon: document.getElementById('createIcon').value.trim() || undefined,
  };

  const { ok, data } = await apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(body) });
  if (ok) {
    showToast(`Category "${data.data.name}" created!`, 'success');
    resetCreate();
    loadCategories();
  } else {
    showToast(data.error || 'Failed to create category.', 'error');
  }
}

function resetCreate() {
  document.getElementById('createForm').reset();
  clearFormErrors('createForm');
}

// ─── Delete ───────────────────────────────────────────────────────────────────

async function deleteCategory(id) {
  if (!confirm(`Delete category #${id}?`)) return;
  const { ok, data } = await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
  if (ok) {
    showToast('Category deleted.', 'success');
    loadCategories();
  } else {
    showToast(data.error || 'Delete failed.', 'error');
  }
}

// ─── Find by ID ───────────────────────────────────────────────────────────────

async function findById() {
  const id = document.getElementById('searchId').value;
  const result = document.getElementById('findResult');
  if (!id) return;

  const { ok, data } = await apiFetch(`/api/categories/${id}`);
  if (!ok) { result.innerHTML = `<p style="color:var(--red);">${escHtml(data.error)}</p>`; return; }
  const c = data.data;
  result.innerHTML = `
    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;">
      <p><strong>${escHtml(c.icon || '📦')} ${escHtml(c.name)}</strong></p>
      <p style="font-size:13px;color:var(--text-muted);">Slug: <code>${escHtml(c.slug || '—')}</code></p>
      <p style="font-size:13px;color:var(--text-muted);">${escHtml(c.description || 'No description')}</p>
      <p style="font-size:12px;color:var(--text-faint);">Created: ${formatDate(c.createdAt)}</p>
    </div>
  `;
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

async function patchCategory() {
  const id = document.getElementById('patchId').value;
  const field = document.getElementById('patchField').value;
  const value = document.getElementById('patchValue').value;
  if (!id || !value) { showToast('ID and value are required.', 'error'); return; }

  const { ok, data } = await apiFetch(`/api/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ [field]: value }),
  });
  if (ok) {
    showToast(`Category #${id} updated!`, 'success');
    loadCategories();
  } else {
    showToast(data.error || 'Patch failed.', 'error');
  }
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

async function openEdit(id, mode) {
  const { ok, data } = await apiFetch(`/api/categories/${id}`);
  if (!ok) { showToast('Could not load category.', 'error'); return; }
  const c = data.data;

  document.getElementById('editId').value = c.id;
  document.getElementById('editMode').value = mode;
  document.getElementById('modalTitle').textContent = mode === 'put' ? 'Edit Category (PUT)' : 'Patch Category (PATCH)';
  document.getElementById('editName').value = c.name || '';
  document.getElementById('editSlug').value = c.slug || '';
  document.getElementById('editDescription').value = c.description || '';
  document.getElementById('editIcon').value = c.icon || '';
  document.getElementById('saveBtn').textContent = mode === 'put' ? 'Save changes' : 'Apply PATCH';
  document.getElementById('editModal').classList.add('open');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
}

async function saveModal() {
  const id = document.getElementById('editId').value;
  const mode = document.getElementById('editMode').value;
  const name = document.getElementById('editName').value.trim();
  if (!name) { markError('editName', 'editNameError'); return; }

  const body = {
    name,
    slug: document.getElementById('editSlug').value.trim() || undefined,
    description: document.getElementById('editDescription').value.trim() || undefined,
    icon: document.getElementById('editIcon').value.trim() || undefined,
  };

  const method = mode === 'put' ? 'PUT' : 'PATCH';
  const { ok, data } = await apiFetch(`/api/categories/${id}`, { method, body: JSON.stringify(body) });
  if (ok) {
    showToast('Category updated!', 'success');
    closeModal();
    loadCategories();
  } else {
    showToast(data.error || 'Update failed.', 'error');
  }
}
