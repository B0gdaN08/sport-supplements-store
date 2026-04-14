/**
 * public/js/orders.js
 * Orders page:
 *   Admin  → all orders, full management
 *   User   → own orders only + create new
 *   Guest  → login prompt (handled in HTML)
 */

let orderProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  renderNavAuth();
  applyRoleUI();

  // Guests see the login prompt rendered in HTML; nothing else to do
  if (!isAuthenticated()) return;

  await loadProducts();
  await loadOrders();

  document.getElementById('createForm').addEventListener('submit', handleCreate);
  addItem();

  if (!isAdmin()) {
    const h = document.querySelector('.page-header h1');
    if (h) h.innerHTML = 'My <span>Orders</span>';
  }
});

// ─── Load products for item builder ──────────────────────────────────────────

async function loadProducts() {
  const { ok, data } = await apiFetch('/api/products');
  if (ok) orderProducts = data.data || [];
}

// ─── Load & render orders ─────────────────────────────────────────────────────

async function loadOrders() {
  const status = document.getElementById('filterStatus')?.value || '';
  const url = '/api/orders' + (status ? `?status=${status}` : '');
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;"><span class="spinner"></span></td></tr>`;

  const { ok, data } = await apiFetch(url);
  if (!ok) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--red);">${escHtml(data.error)}</td></tr>`;
    return;
  }

  const orders = data.data || [];
  if (!orders.length) {
    const msg = isAdmin() ? 'No orders found.' : 'You have no orders yet. Place your first one!';
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🛒</div><h3>${msg}</h3></div></td></tr>`;
    return;
  }

  const admin = isAdmin();
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><span class="id-chip">#${o.id}</span></td>
      <td>${escHtml(o.customerName)}</td>
      <td style="font-size:13px;color:var(--text-muted);">${escHtml(o.customerEmail)}</td>
      <td>${o.items?.length || 0} item${(o.items?.length || 0) !== 1 ? 's' : ''}</td>
      <td><span class="price">€${Number(o.total).toFixed(2)}</span></td>
      <td>${statusBadge(o.status)}</td>
      <td>${formatDate(o.createdAt)}</td>
      <td>
        <div class="td-actions">
          ${admin ? `
            <button class="btn btn-secondary btn-sm" onclick="openStatusModal(${o.id}, '${o.status}')">Status</button>
            <button class="btn btn-secondary btn-sm" onclick="openEditModal(${o.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteOrder(${o.id})">Delete</button>
          ` : `
            <button class="btn btn-ghost btn-sm" onclick="viewOrder(${o.id})">View</button>
          `}
        </div>
      </td>
    </tr>
  `).join('');
}

// ─── Create order ─────────────────────────────────────────────────────────────

async function handleCreate(e) {
  e.preventDefault();

  const name = document.getElementById('createName').value.trim();
  const email = document.getElementById('createEmail').value.trim();

  let valid = true;
  ['createNameError','createEmailError'].forEach(id => document.getElementById(id).classList.remove('show'));
  ['createName','createEmail'].forEach(id => document.getElementById(id).classList.remove('error'));
  document.getElementById('createItemsError').style.display = 'none';

  if (!name) { document.getElementById('createName').classList.add('error'); document.getElementById('createNameError').classList.add('show'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('createEmail').classList.add('error'); document.getElementById('createEmailError').classList.add('show'); valid = false; }

  const items = collectItems();
  if (!items.length) { document.getElementById('createItemsError').style.display = 'block'; valid = false; }
  if (!valid) return;

  const body = {
    customerName: name,
    customerEmail: email,
    shippingAddress: document.getElementById('createAddress').value.trim(),
    notes: document.getElementById('createNotes').value.trim(),
    items,
  };

  const { ok, data } = await apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(body) });
  if (ok) {
    showToast(`Order #${data.data.id} placed! Total: €${data.data.total.toFixed(2)}`, 'success', 5000);
    resetCreate();
    switchTab('list', document.querySelector('.tab-btn'));
    loadOrders();
  } else {
    showToast(data.details?.join(' · ') || data.error || 'Failed to create order.', 'error');
  }
}

function resetCreate() {
  document.getElementById('createForm').reset();
  document.getElementById('orderItems').innerHTML = '';
  document.getElementById('orderTotal').textContent = '';
  addItem();
}

// ─── Pre-fill user info ───────────────────────────────────────────────────────

function prefillUserInfo() {
  const user = getUser();
  if (!user || isAdmin()) return;
  const nameEl = document.getElementById('createName');
  if (nameEl && !nameEl.value) nameEl.value = user.name;
}

// ─── Order item builder ───────────────────────────────────────────────────────

function addItem() {
  const container = document.getElementById('orderItems');
  const opts = orderProducts.map(p =>
    `<option value="${p.id}" data-price="${p.price}">${escHtml(p.name)} — €${Number(p.price).toFixed(2)}</option>`
  ).join('');

  const row = document.createElement('div');
  row.className = 'item-row';
  row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px;';
  row.innerHTML = `
    <select class="form-control item-product" style="flex:2;" onchange="recalcTotal()">
      <option value="">Select product</option>${opts}
    </select>
    <input type="number" class="form-control item-qty" min="1" value="1" style="flex:0 0 70px;" onchange="recalcTotal()" />
    <button type="button" class="btn btn-danger btn-sm btn-icon" onclick="removeItem(this)" title="Remove">✕</button>
  `;
  container.appendChild(row);
  recalcTotal();
}

function removeItem(btn) {
  btn.closest('.item-row').remove();
  recalcTotal();
}

function recalcTotal() {
  let total = 0;
  document.querySelectorAll('.item-row').forEach(row => {
    const sel = row.querySelector('.item-product');
    const qty = Number(row.querySelector('.item-qty').value) || 0;
    const price = Number(sel.options[sel.selectedIndex]?.getAttribute('data-price')) || 0;
    total += price * qty;
  });
  document.getElementById('orderTotal').textContent = total > 0 ? `Total: €${total.toFixed(2)}` : '';
}

function collectItems() {
  const items = [];
  document.querySelectorAll('.item-row').forEach(row => {
    const sel = row.querySelector('.item-product');
    const productId = Number(sel.value);
    const quantity = Number(row.querySelector('.item-qty').value);
    const unitPrice = Number(sel.options[sel.selectedIndex]?.getAttribute('data-price')) || 0;
    if (productId && quantity >= 1) items.push({ productId, quantity, unitPrice });
  });
  return items;
}

// ─── View order (user) ────────────────────────────────────────────────────────

async function viewOrder(id) {
  const { ok, data } = await apiFetch(`/api/orders/${id}`);
  if (!ok) { showToast('Could not load order.', 'error'); return; }
  const o = data.data;

  const itemsHtml = (o.items || []).map(item => {
    const product = orderProducts.find(p => p.id === item.productId);
    return `<div class="checkout-item">
      <span class="checkout-item-name">${escHtml(product?.name || `Product #${item.productId}`)} × ${item.quantity}</span>
      <span class="checkout-item-price">€${(item.unitPrice * item.quantity).toFixed(2)}</span>
    </div>`;
  }).join('');

  document.getElementById('findResult').innerHTML = `
    <div class="panel"><div class="panel-body">
      <p style="margin-bottom:8px;">${statusBadge(o.status)} <span class="id-chip">#${o.id}</span></p>
      <div class="checkout-items-list">${itemsHtml}</div>
      <p style="font-size:20px;font-family:'Barlow Condensed',sans-serif;color:var(--accent);font-weight:700;">
        Total: €${Number(o.total).toFixed(2)}
      </p>
      <p style="font-size:13px;color:var(--text-muted);margin-top:8px;">
        Placed on ${formatDate(o.createdAt)}<br>
        ${o.shippingAddress ? `Ship to: ${escHtml(o.shippingAddress)}` : ''}
      </p>
    </div></div>
  `;
  switchTab('find', document.querySelectorAll('.tab-btn')[2]);
}

// ─── Status modal (admin) ─────────────────────────────────────────────────────

function openStatusModal(id, currentStatus) {
  document.getElementById('statusOrderId').value = id;
  document.getElementById('statusOrderIdDisplay').value = `Order #${id}`;
  document.getElementById('newStatus').value = currentStatus;
  document.getElementById('statusModal').classList.add('open');
}

function closeStatusModal() {
  document.getElementById('statusModal').classList.remove('open');
}

async function applyStatusPatch() {
  const id = document.getElementById('statusOrderId').value;
  const status = document.getElementById('newStatus').value;
  const { ok, data } = await apiFetch(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  if (ok) {
    showToast(`Order #${id} → "${status}".`, 'success');
    closeStatusModal();
    loadOrders();
  } else {
    showToast(data.error || 'Update failed.', 'error');
  }
}

// ─── Edit modal (admin) ───────────────────────────────────────────────────────

async function openEditModal(id) {
  const { ok, data } = await apiFetch(`/api/orders/${id}`);
  if (!ok) { showToast('Could not load order.', 'error'); return; }
  const o = data.data;

  document.getElementById('editId').value = o.id;
  document.getElementById('editCustomerName').value = o.customerName || '';
  document.getElementById('editCustomerEmail').value = o.customerEmail || '';
  document.getElementById('editShippingAddress').value = o.shippingAddress || '';
  document.getElementById('editStatus').value = o.status || 'pending';
  document.getElementById('editNotes').value = o.notes || '';
  document.getElementById('editModal').classList.add('open');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
}

async function saveEdit() {
  const id = document.getElementById('editId').value;
  const body = {
    customerName: document.getElementById('editCustomerName').value.trim(),
    customerEmail: document.getElementById('editCustomerEmail').value.trim(),
    shippingAddress: document.getElementById('editShippingAddress').value.trim(),
    status: document.getElementById('editStatus').value,
    notes: document.getElementById('editNotes').value.trim(),
  };
  if (!body.customerName || !body.customerEmail) { showToast('Name and email are required.', 'error'); return; }

  const { ok: getOk, data: getData } = await apiFetch(`/api/orders/${id}`);
  if (!getOk) { showToast('Could not load order.', 'error'); return; }
  body.items = getData.data.items;

  const { ok, data } = await apiFetch(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  if (ok) {
    showToast('Order updated!', 'success');
    closeEditModal();
    loadOrders();
  } else {
    showToast(data.error || 'Update failed.', 'error');
  }
}

// ─── Delete (admin) ───────────────────────────────────────────────────────────

async function deleteOrder(id) {
  if (!confirm(`Delete order #${id}?`)) return;
  const { ok, data } = await apiFetch(`/api/orders/${id}`, { method: 'DELETE' });
  if (ok) { showToast('Order deleted.', 'success'); loadOrders(); }
  else showToast(data.error || 'Delete failed.', 'error');
}

// ─── PATCH tab (admin) ────────────────────────────────────────────────────────

async function patchOrder() {
  const id = document.getElementById('patchId').value;
  const status = document.getElementById('patchStatus').value;
  if (!id) { showToast('Order ID is required.', 'error'); return; }

  const { ok, data } = await apiFetch(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  if (ok) { showToast(`Order #${id} → "${status}".`, 'success'); loadOrders(); }
  else showToast(data.error || 'Patch failed.', 'error');
}

// ─── Find by ID ───────────────────────────────────────────────────────────────

async function findById() {
  const id = document.getElementById('searchId').value;
  if (!id) return;
  await viewOrder(Number(id));
}
