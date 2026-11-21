let inventoryItems = [];
let inventoryLoading = false;
let inventoryLoadFailed = false;
let inventorySaving = false;
let restockItem = null;
let restockReturnButton = null;

function inventoryValue(value) {
  return value == null || value === '' ? '—' : String(value);
}

function isLowStock(item) {
  return item.quantity != null && item.reorder_level != null && item.quantity <= item.reorder_level;
}

function renderInventory() {
  if (inventoryLoadFailed) return;
  const query = document.getElementById('inventorySearch').value.trim().toLowerCase();
  const filtered = inventoryItems.filter(item => ['brand', 'model', 'item_code', 'category']
    .some(key => String(item[key] ?? '').toLowerCase().includes(query)));
  const body = document.getElementById('inventoryTableBody');
  body.replaceChildren();
  document.getElementById('inventoryCount').textContent = `${filtered.length} of ${inventoryItems.length} items`;
  const lowCount = inventoryItems.filter(isLowStock).length;
  document.getElementById('lowStockCount').textContent = `${lowCount} ${lowCount === 1 ? 'item' : 'items'} at or below reorder level.`;
  document.getElementById('inventoryTable').hidden = filtered.length === 0;
  setStatus(document.getElementById('inventoryListStatus'), filtered.length ? '' :
    (inventoryItems.length ? 'No items match your search.' : 'No items in inventory yet.'));
  for (const item of filtered) {
    const row = document.createElement('tr');
    for (const key of ['item_code', 'category', 'brand', 'model', 'supplier', 'quantity', 'reorder_level', 'cost', 'selling_price']) {
      const cell = document.createElement('td');
      cell.textContent = ['cost', 'selling_price'].includes(key) && item[key] != null ? formatPeso(item[key]) : inventoryValue(item[key]);
      row.append(cell);
    }
    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = isLowStock(item) ? 'stock-badge low-stock' : 'stock-badge';
    badge.textContent = item.quantity == null || item.reorder_level == null ? 'Unknown' : (isLowStock(item) ? 'Low stock' : 'In stock');
    statusCell.append(badge);
    row.append(statusCell);
    const cell = document.createElement('td');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Restock';
    button.setAttribute('aria-label', `Restock ${inventoryValue(item.item_code)}`);
    button.disabled = inventorySaving || !item.item_code;
    button.addEventListener('click', () => showRestock(item, button));
    cell.append(button);
    row.append(cell);
    body.append(row);
  }
}

async function loadInventory() {
  if (inventoryLoading) return;
  inventoryLoading = true;
  setButtonBusy(document.getElementById('refreshInventoryButton'), true);
  document.getElementById('inventoryTable').hidden = true;
  document.getElementById('inventoryCount').textContent = '';
  document.getElementById('lowStockCount').textContent = '';
  document.getElementById('inventorySearch').disabled = true;
  document.getElementById('clearInventorySearchButton').disabled = true;
  setStatus(document.getElementById('inventoryListStatus'), 'Loading inventory…', 'loading');
  try {
    const data = await apiRequest('/inventory/');
    if (!Array.isArray(data)) throw new Error('Unexpected inventory response. Please refresh.');
    inventoryItems = data;
    inventoryLoadFailed = false;
    renderInventory();
  } catch (error) {
    inventoryLoadFailed = true;
    setStatus(document.getElementById('inventoryListStatus'), `Unable to load inventory. ${error.message} Use Refresh inventory to retry.`, 'error');
  } finally {
    inventoryLoading = false;
    setButtonBusy(document.getElementById('refreshInventoryButton'), false);
    document.getElementById('inventorySearch').disabled = false;
    document.getElementById('clearInventorySearchButton').disabled = false;
  }
}

function readInventoryForm() {
  const payload = {};
  for (const key of ['brand', 'model', 'category', 'supplier']) {
    payload[key] = document.getElementById(`inventory_${key}`).value.trim() || null;
  }
  for (const key of ['cost', 'selling_price', 'quantity', 'reorder_level']) {
    const value = document.getElementById(`inventory_${key}`).value.trim();
    const number = value === '' ? ({ quantity: 0, reorder_level: 5 }[key] ?? null) : Number(value);
    if (number !== null && (!Number.isFinite(number) || number < 0 ||
      (['quantity', 'reorder_level'].includes(key) && !Number.isSafeInteger(number)))) {
      throw new Error('Use non-negative prices and whole non-negative quantities/reorder levels.');
    }
    payload[key] = number;
  }
  return payload;
}

function closeInventoryForm() {
  if (inventorySaving) return;
  document.getElementById('inventoryFormSection').hidden = true;
  document.getElementById('inventoryForm').reset();
  document.getElementById('addInventoryButton').disabled = false;
  document.getElementById('addInventoryButton').focus();
}

function closeRestock() {
  if (inventorySaving) return;
  document.getElementById('restockSection').hidden = true;
  restockItem = null;
  if (restockReturnButton?.isConnected) restockReturnButton.focus();
  else document.getElementById('inventorySearch').focus();
}

function showRestock(item, button) {
  if (inventorySaving) return;
  closeInventoryForm();
  restockItem = item;
  restockReturnButton = button;
  document.getElementById('restockItemSummary').textContent = `${inventoryValue(item.item_code)} · Current quantity: ${inventoryValue(item.quantity)}`;
  document.getElementById('restockQuantity').value = '1';
  setStatus(document.getElementById('restockStatus'), '');
  document.getElementById('restockSection').hidden = false;
  document.getElementById('restockQuantity').focus();
}

function setInventorySaving(busy, restocking) {
  inventorySaving = busy;
  document.getElementById('addInventoryButton').disabled = busy || !document.getElementById('inventoryFormSection').hidden;
  document.getElementById('inventoryFormFields').disabled = busy;
  document.getElementById('cancelInventoryButton').disabled = busy;
  document.getElementById('cancelRestockButton').disabled = busy;
  document.getElementById('restockQuantity').disabled = busy;
  setButtonBusy(document.getElementById(restocking ? 'saveRestockButton' : 'saveInventoryButton'), busy);
  // Rebuild row actions so another restock cannot replace the active item while saving.
  if (!inventoryLoading) renderInventory();
}

async function saveInventory(event) {
  event.preventDefault();
  if (inventorySaving) return;
  const status = document.getElementById('inventorySaveStatus');
  let payload;
  try { payload = readInventoryForm(); }
  catch (error) { setStatus(status, error.message, 'error'); return; }
  setInventorySaving(true, false);
  setStatus(status, 'Saving item…', 'loading');
  let saved = false;
  try {
    const result = await apiSend('/inventory/', 'POST', payload);
    if (!result?.item_code) throw new Error('Unexpected save response. Refresh before saving again.');
    saved = true;
    setStatus(document.getElementById('inventoryFeedback'), `Item ${result.item_code} added to inventory.`, 'success');
  } catch (error) {
    setStatus(status, `Save failed. ${error.message} Entries retained. Refresh before retrying after a timeout/disconnect to avoid duplicates.`, 'error');
  } finally {
    setInventorySaving(false, false);
  }
  if (saved) {
    closeInventoryForm();
    document.getElementById('inventorySearch').value = '';
    await loadInventory();
  }
}

async function saveRestock(event) {
  event.preventDefault();
  if (inventorySaving || !restockItem) return;
  const status = document.getElementById('restockStatus');
  const quantity = Number(document.getElementById('restockQuantity').value);
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    setStatus(status, 'Enter a positive whole number of units.', 'error');
    return;
  }
  const code = restockItem.item_code;
  setInventorySaving(true, true);
  setStatus(status, 'Adding stock…', 'loading');
  let saved = false;
  try {
    const result = await apiRequest(`/inventory/${encodeURIComponent(code)}?quantity=${encodeURIComponent(quantity)}`, { method: 'PUT' });
    if (result?.error) throw new Error(result.error);
    if (result?.item_code !== code || !Number.isFinite(result.new_quantity)) throw new Error('Unexpected restock response. Refresh before retrying.');
    saved = true;
    setStatus(document.getElementById('inventoryFeedback'), `Added ${quantity} units to ${code}. New quantity: ${result.new_quantity}.`, 'success');
  } catch (error) {
    setStatus(status, `Restock failed. ${error.message} Refresh before retrying after a timeout/disconnect to avoid adding stock twice.`, 'error');
  } finally {
    setInventorySaving(false, true);
  }
  if (saved) {
    closeRestock();
    await loadInventory();
  }
}

document.getElementById('addInventoryButton').addEventListener('click', () => {
  if (inventorySaving) return;
  closeRestock();
  document.getElementById('inventoryForm').reset();
  setStatus(document.getElementById('inventorySaveStatus'), '');
  document.getElementById('inventoryFormSection').hidden = false;
  document.getElementById('addInventoryButton').disabled = true;
  document.getElementById('inventory_brand').focus();
});
document.getElementById('inventoryForm').addEventListener('submit', saveInventory);
document.getElementById('restockForm').addEventListener('submit', saveRestock);
document.getElementById('cancelInventoryButton').addEventListener('click', closeInventoryForm);
document.getElementById('cancelRestockButton').addEventListener('click', closeRestock);
document.getElementById('refreshInventoryButton').addEventListener('click', loadInventory);
document.getElementById('inventorySearch').addEventListener('input', () => { if (!inventoryLoading) renderInventory(); });
document.getElementById('clearInventorySearchButton').addEventListener('click', () => {
  document.getElementById('inventorySearch').value = '';
  renderInventory();
  document.getElementById('inventorySearch').focus();
});
loadInventory();
