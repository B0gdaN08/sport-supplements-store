/**
 * public/js/categories.js
 * Categories page:
 *   Admin → full CRUD management (table view)
 *   User / Guest → card grid view (read-only)
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
  const { ok, data } = await apiFetch('/api/categories');
  const categories = ok ? (data.data || []) : [];

  if (isAdmin()) {
    renderTable(categories, ok, data);
  } else {
    const grid = document.getElementById('categoriesGrid');
    if (grid) grid.style.display = '';
    renderCards(categories, ok, data);
  }
}

function renderTable(categories, ok, data) {
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;

  if (!ok) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--red);">${escHtml(data.error)}</td></tr>`;
    return;
  }
  if (!categories.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🗂️</div><h3>No categories yet</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = categories.map(c => `
    <tr>
      <td><span class="id-chip">#${c.id}</span></td>
      <td style="font-size:22px;">${escHtml(c.icon || '📦')}</td>
      <td>
        ${c.imageUrl ? `<img src="${escHtml(c.imageUrl)}" alt="" style="width:60px;height:36px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:8px;">` : ''}
        <strong>${escHtml(c.name)}</strong>
      </td>
      <td><code>${escHtml(c.slug || '—')}</code></td>
      <td>${escHtml(c.description || '—')}</td>
      <td>${formatDate(c.createdAt)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-secondary btn-sm" onclick="openEdit(${c.id}, 'put')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderCards(categories, ok, data) {
  const grid = document.getElementById('categoriesCardBody');
  if (!grid) return;

  if (!ok) {
    grid.innerHTML = `<p style="color:var(--red);grid-column:1/-1;">${escHtml(data.error)}</p>`;
    return;
  }
  if (!categories.length) {
    grid.innerHTML = `<div style="text-align:center;padding:60px;grid-column:1/-1;"><div style="font-size:48px;margin-bottom:16px;">🗂️</div><h3>No categories yet</h3></div>`;
    return;
  }

  grid.innerHTML = categories.map(c => `
    <a href="/products.html" style="text-decoration:none;display:block;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;transition:var(--transition);"
       onmouseover="this.style.borderColor='rgba(180,255,60,0.25)'" onmouseout="this.style.borderColor='var(--border)'">
      ${c.imageUrl
        ? `<img src="${escHtml(c.imageUrl)}" alt="${escHtml(c.name)}" style="width:100%;height:160px;object-fit:cover;display:block;">`
        : `<div style="height:160px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;font-size:48px;">${escHtml(c.icon || '📦')}</div>`
      }
      <div style="padding:16px 20px;">
        <div class="shop-card-name">${escHtml(c.icon || '')} ${escHtml(c.name)}</div>
        <div class="shop-card-desc" style="margin-top:6px;">${escHtml(c.description || '')}</div>
      </div>
    </a>
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
    imageUrl: document.getElementById('createImageUrl').value.trim() || undefined,
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
      ${c.imageUrl ? `<img src="${escHtml(c.imageUrl)}" alt="" style="width:100%;height:80px;object-fit:cover;border-radius:4px;margin-bottom:10px;">` : ''}
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
  document.getElementById('editImageUrl').value = c.imageUrl || '';
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
    imageUrl: document.getElementById('editImageUrl').value.trim() || undefined,
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
