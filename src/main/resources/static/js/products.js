/**
 * public/js/products.js
 * Products page:
 *   Admin    → full CRUD management UI
 *   User     → shop with cart + checkout
 *   Guest    → browse-only shop (no cart, prompt to login)
 */

let cart = {};
let allProducts = [];
let allCategories = [];

document.addEventListener('DOMContentLoaded', async () => {
  renderNavAuth();

  if (isAdmin()) {
    // Show admin management view
    document.querySelector('.admin-only').style.display = '';
    applyRoleUI();
    await Promise.all([loadCategories(), loadProducts()]);
    document.getElementById('createForm').addEventListener('submit', handleCreate);
  } else {
    // Show shop view for both users and guests
    document.getElementById('shopView').style.display = '';
    applyRoleUI();
    await Promise.all([loadCategories(), loadShop()]);
  }
});

// ─── Shared: load categories ──────────────────────────────────────────────────

async function loadCategories() {
  const { ok, data } = await apiFetch('/api/categories');
  if (!ok) return;
  allCategories = data.data || [];

  const filterAdmin = document.getElementById('filterCategory');
  if (filterAdmin) {
    filterAdmin.innerHTML = '<option value="">All categories</option>' +
      allCategories.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
  }

  const filterShop = document.getElementById('shopFilterCategory');
  if (filterShop) {
    filterShop.innerHTML = '<option value="">All categories</option>' +
      allCategories.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
  }

  ['createCategoryId', 'editCategoryId'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) {
      sel.innerHTML = '<option value="">Select category</option>' +
        allCategories.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
    }
  });
}

function categoryName(id) {
  return allCategories.find(c => c.id === id)?.name || '—';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MODE
// ═══════════════════════════════════════════════════════════════════════════════

async function loadProducts() {
  const categoryId = document.getElementById('filterCategory')?.value || '';
  const url = '/api/products' + (categoryId ? `?categoryId=${categoryId}` : '');
  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;"><span class="spinner"></span></td></tr>`;

  const { ok, data } = await apiFetch(url);
  if (!ok) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--red);">${escHtml(data.error)}</td></tr>`;
    return;
  }

  allProducts = data.data || [];
  if (!allProducts.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📦</div><h3>No products found</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = allProducts.map(p => `
    <tr>
      <td><span class="id-chip">#${p.id}</span></td>
      <td><strong>${escHtml(p.name)}</strong></td>
      <td>${escHtml(p.brand || '—')}</td>
      <td>${escHtml(categoryName(p.categoryId))}</td>
      <td><span class="price">€${Number(p.price).toFixed(2)}</span></td>
      <td>${stockBadge(p.stock)}</td>
      <td>${p.weight ? p.weight + 'g' : '—'}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-secondary btn-sm" onclick="openEdit(${p.id}, 'put')">Edit</button>
          <button class="btn btn-secondary btn-sm" onclick="openEdit(${p.id}, 'patch')">Patch</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function handleCreate(e) {
  e.preventDefault();
  clearFormErrors('createForm');

  const name = document.getElementById('createName').value.trim();
  const price = document.getElementById('createPrice').value;
  const categoryId = document.getElementById('createCategoryId').value;

  let valid = true;
  if (!name) { markError('createName', 'createNameError'); valid = false; }
  if (!price || Number(price) < 0) { markError('createPrice', 'createPriceError'); valid = false; }
  if (!categoryId) { markError('createCategoryId', 'createCategoryError'); valid = false; }
  if (!valid) return;

  const body = {
    name,
    price: Number(price),
    categoryId: Number(categoryId),
    brand: document.getElementById('createBrand').value.trim() || undefined,
    description: document.getElementById('createDescription').value.trim() || undefined,
    stock: document.getElementById('createStock').value ? Number(document.getElementById('createStock').value) : undefined,
    weight: document.getElementById('createWeight').value ? Number(document.getElementById('createWeight').value) : undefined,
    flavors: document.getElementById('createFlavors').value.trim() || undefined,
    imageUrl: document.getElementById('createImageUrl').value.trim() || undefined,
  };

  const { ok, data } = await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(body) });
  if (ok) {
    showToast(`Product "${data.data.name}" created!`, 'success');
    resetCreate();
    switchTab('list', document.querySelector('.tab-btn'));
    loadProducts();
  } else {
    showToast(data.error || 'Failed to create product.', 'error');
  }
}

function resetCreate() {
  document.getElementById('createForm').reset();
  clearFormErrors('createForm');
}

async function deleteProduct(id) {
  if (!confirm(`Delete product #${id}?`)) return;
  const { ok, data } = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
  if (ok) {
    showToast('Product deleted.', 'success');
    loadProducts();
  } else {
    showToast(data.error || 'Delete failed.', 'error');
  }
}

async function openEdit(id, mode) {
  const { ok, data } = await apiFetch(`/api/products/${id}`);
  if (!ok) { showToast('Could not load product.', 'error'); return; }
  const p = data.data;

  document.getElementById('editId').value = p.id;
  document.getElementById('editMode').value = mode;
  document.getElementById('modalTitle').textContent = mode === 'put' ? 'Edit Product (PUT)' : 'Patch Product (PATCH)';
  document.getElementById('editName').value = p.name || '';
  document.getElementById('editBrand').value = p.brand || '';
  document.getElementById('editDescription').value = p.description || '';
  document.getElementById('editPrice').value = p.price ?? '';
  document.getElementById('editStock').value = p.stock ?? '';
  document.getElementById('editCategoryId').value = p.categoryId || '';
  document.getElementById('editWeight').value = p.weight ?? '';
  document.getElementById('editFlavors').value = Array.isArray(p.flavors) ? p.flavors.join(', ') : (p.flavors || '');
  document.getElementById('editImageUrl').value = p.imageUrl || '';
  document.getElementById('editModal').classList.add('open');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
}

async function saveModal() {
  const id = document.getElementById('editId').value;
  const mode = document.getElementById('editMode').value;
  const name = document.getElementById('editName').value.trim();
  const price = document.getElementById('editPrice').value;

  if (!name) { markError('editName', 'editNameError'); return; }
  if (!price || Number(price) < 0) { markError('editPrice', 'editPriceError'); return; }

  const body = {
    name,
    price: Number(price),
    categoryId: Number(document.getElementById('editCategoryId').value),
    brand: document.getElementById('editBrand').value.trim() || undefined,
    description: document.getElementById('editDescription').value.trim() || undefined,
    stock: document.getElementById('editStock').value !== '' ? Number(document.getElementById('editStock').value) : undefined,
    weight: document.getElementById('editWeight').value !== '' ? Number(document.getElementById('editWeight').value) : undefined,
    flavors: document.getElementById('editFlavors').value.trim() || undefined,
    imageUrl: document.getElementById('editImageUrl').value.trim() || undefined,
  };

  const method = mode === 'put' ? 'PUT' : 'PATCH';
  const { ok, data } = await apiFetch(`/api/products/${id}`, { method, body: JSON.stringify(body) });
  if (ok) {
    showToast('Product updated!', 'success');
    closeModal();
    loadProducts();
  } else {
    showToast(data.error || 'Update failed.', 'error');
  }
}

function onPatchFieldChange() {
  const field = document.getElementById('patchField').value;
  document.getElementById('patchValue').type = (field === 'price' || field === 'stock') ? 'number' : 'text';
}

async function patchProduct() {
  const id = document.getElementById('patchId').value;
  const field = document.getElementById('patchField').value;
  const value = document.getElementById('patchValue').value;
  if (!id || !value) { showToast('ID and value are required.', 'error'); return; }

  const body = { [field]: (field === 'price' || field === 'stock') ? Number(value) : value };
  const { ok, data } = await apiFetch(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  if (ok) {
    showToast(`Product #${id} patched!`, 'success');
    loadProducts();
  } else {
    showToast(data.error || 'Patch failed.', 'error');
  }
}

async function findById() {
  const id = document.getElementById('searchId').value;
  const result = document.getElementById('findResult');
  if (!id) return;

  const { ok, data } = await apiFetch(`/api/products/${id}`);
  if (!ok) { result.innerHTML = `<p style="color:var(--red);">${escHtml(data.error)}</p>`; return; }
  const p = data.data;
  result.innerHTML = `
    <div class="panel"><div class="panel-body">
      <p><strong>Name:</strong> ${escHtml(p.name)}</p>
      <p><strong>Brand:</strong> ${escHtml(p.brand || '—')}</p>
      <p><strong>Price:</strong> €${Number(p.price).toFixed(2)}</p>
      <p><strong>Stock:</strong> ${p.stock ?? '—'}</p>
      <p><strong>Category:</strong> ${escHtml(categoryName(p.categoryId))}</p>
      <p><strong>Description:</strong> ${escHtml(p.description || '—')}</p>
      <p><strong>Created:</strong> ${formatDate(p.createdAt)}</p>
    </div></div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHOP MODE (user + guest)
// ═══════════════════════════════════════════════════════════════════════════════

async function loadShop() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;
  grid.innerHTML = `<div style="text-align:center;padding:60px;"><span class="spinner"></span></div>`;

  const { ok, data } = await apiFetch('/api/products');
  if (!ok) {
    grid.innerHTML = `<p style="color:var(--red);padding:20px;">${escHtml(data.error)}</p>`;
    return;
  }
  allProducts = data.data || [];
  renderShop();
}

function renderShop() {
  const grid = document.getElementById('shopGrid');
  const filterCat = document.getElementById('shopFilterCategory')?.value || '';
  const loggedIn = isAuthenticated();

  let products = allProducts;
  if (filterCat) products = products.filter(p => String(p.categoryId) === filterCat);

  if (!products.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No products found</h3></div>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const inCart = cart[p.id]?.quantity || 0;
    const outOfStock = p.stock === 0;

    let actionHtml;
    if (outOfStock) {
      actionHtml = `<span style="color:var(--red);font-size:13px;">Out of stock</span>`;
    } else if (!loggedIn) {
      // Guest: show login prompt
      actionHtml = `<a href="/login.html" class="btn btn-ghost btn-sm" style="font-size:12px;">Login to buy</a>`;
    } else {
      // Logged-in user: cart controls
      actionHtml = `
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty(${p.id}, -1)" ${inCart === 0 ? 'disabled' : ''}>−</button>
          <span class="qty-value" id="qty-${p.id}">${inCart}</span>
          <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
        </div>
        <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})" ${inCart > 0 ? 'style="background:var(--accent-dim)"' : ''}>
          ${inCart > 0 ? '✓ In Cart' : 'Add'}
        </button>`;
    }

    return `
      <div class="shop-card shop-card-img-wrap">
        ${p.imageUrl
          ? `<img src="${escHtml(p.imageUrl)}" alt="${escHtml(p.name)}" class="shop-card-img">`
          : `<div class="shop-card-img-placeholder">📦</div>`
        }
        <div class="shop-card-content">
          <div class="shop-card-header">
            <div>
              <div class="shop-card-name">${escHtml(p.name)}</div>
              <div class="shop-card-brand">${escHtml(p.brand || '')}</div>
            </div>
            <span class="badge badge-muted">${escHtml(categoryName(p.categoryId))}</span>
          </div>
          ${p.description ? `<div class="shop-card-desc">${escHtml(p.description)}</div>` : ''}
          <div class="shop-card-meta">
            <span>${stockBadge(p.stock)} in stock</span>
            ${p.weight ? `<span>⚖️ ${p.weight}g</span>` : ''}
          </div>
          <div class="shop-card-footer">
            <span class="price">€${Number(p.price).toFixed(2)}</span>
            ${actionHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function changeQty(productId, delta) {
  const current = cart[productId]?.quantity || 0;
  const newQty = Math.max(0, current + delta);
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  if (newQty === 0) delete cart[productId];
  else cart[productId] = { product, quantity: newQty };

  updateCartBar();
  renderShop();
}

function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  if (!cart[productId]) cart[productId] = { product, quantity: 1 };
  updateCartBar();
  renderShop();
}

function updateCartBar() {
  const items = Object.values(cart);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.product.price, 0);

  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  const bar = document.getElementById('cartBar');
  const btn = document.getElementById('checkoutBtn');

  if (countEl) countEl.textContent = count;
  if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
  if (bar) bar.style.display = count > 0 ? 'flex' : 'none';
  if (btn) btn.disabled = count === 0;
}

function openCheckout() {
  if (!isAuthenticated()) { window.location.href = '/login.html'; return; }
  const items = Object.values(cart);
  if (!items.length) { showToast('Add some products first!', 'info'); return; }

  const list = document.getElementById('checkoutItemsList');
  list.innerHTML = items.map(({ product, quantity }) => `
    <div class="checkout-item">
      <span class="checkout-item-name">${escHtml(product.name)} × ${quantity}</span>
      <span class="checkout-item-price">€${(product.price * quantity).toFixed(2)}</span>
    </div>
  `).join('');

  const total = items.reduce((s, i) => s + i.quantity * i.product.price, 0);
  document.getElementById('checkoutTotal').textContent = `Total: €${total.toFixed(2)}`;

  const user = getUser();
  if (user) document.getElementById('checkoutName').value = user.name;

  document.getElementById('checkoutModal').classList.add('open');
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
}

async function submitCheckout() {
  const name = document.getElementById('checkoutName').value.trim();
  const email = document.getElementById('checkoutEmail').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();

  if (!name || !email) { showToast('Name and email are required.', 'error'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email.', 'error'); return; }

  const items = Object.values(cart).map(({ product, quantity }) => ({
    productId: product.id,
    quantity,
    unitPrice: product.price,
  }));

  const { ok, data } = await apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ customerName: name, customerEmail: email, shippingAddress: address, items }),
  });

  if (ok) {
    showToast(`Order #${data.data.id} placed! Total: €${data.data.total.toFixed(2)}`, 'success', 5000);
    cart = {};
    updateCartBar();
    renderShop();
    closeCheckout();
    document.getElementById('checkoutForm').reset();
  } else {
    showToast(data.error || 'Failed to place order.', 'error');
  }
}
