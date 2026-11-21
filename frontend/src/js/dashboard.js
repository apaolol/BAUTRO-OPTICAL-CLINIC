let dashboardLoading = false;
const dashboardCountFields = ['total_patients', 'total_prescriptions', 'total_inventory_items', 'low_stock_count'];
const dashboardRevenueFields = ['today_revenue', 'total_revenue'];

function renderDashboard(data) {
  if (!data || !dashboardCountFields.every(key => Number.isInteger(data[key]) && data[key] >= 0) ||
    !dashboardRevenueFields.every(key => Number.isFinite(data[key])) || !Array.isArray(data.low_stock_items) ||
    data.low_stock_items.length !== data.low_stock_count) {
    throw new Error('Unexpected dashboard response. Please retry.');
  }
  for (const key of dashboardCountFields) document.getElementById(`dashboard_${key}`).textContent = String(data[key]);
  for (const key of dashboardRevenueFields) document.getElementById(`dashboard_${key}`).textContent = formatPeso(data[key]);
  const body = document.getElementById('dashboardStockBody');
  body.replaceChildren();
  for (const item of data.low_stock_items) {
    const row = document.createElement('tr');
    for (const key of ['item_code', 'brand', 'model', 'quantity', 'reorder_level']) {
      const cell = document.createElement('td');
      cell.textContent = item[key] == null || item[key] === '' ? '—' : String(item[key]);
      row.append(cell);
    }
    body.append(row);
  }
  const count = data.low_stock_count;
  setStatus(document.getElementById('dashboardStockMessage'), count ?
    `${count} ${count === 1 ? 'item is' : 'items are'} at or below reorder level.` :
    'No items are at or below reorder level.', count ? 'warning' : 'success');
  document.getElementById('dashboardStockTable').hidden = count === 0;
}

async function loadDashboard() {
  if (dashboardLoading) return;
  dashboardLoading = true;
  setButtonBusy(document.getElementById('refreshDashboardButton'), true);
  setButtonBusy(document.getElementById('retryDashboardButton'), true);
  document.getElementById('retryDashboardButton').hidden = true;
  document.getElementById('dashboardContent').hidden = true;
  setStatus(document.getElementById('dashboardStatus'), 'Loading dashboard…', 'loading');
  try {
    renderDashboard(await apiRequest('/dashboard/'));
    document.getElementById('dashboardContent').hidden = false;
    setStatus(document.getElementById('dashboardStatus'), 'Dashboard updated.', 'success');
  } catch (error) {
    setStatus(document.getElementById('dashboardStatus'), `Could not load dashboard. ${error.message}`, 'error');
    document.getElementById('retryDashboardButton').hidden = false;
  } finally {
    dashboardLoading = false;
    setButtonBusy(document.getElementById('refreshDashboardButton'), false);
    setButtonBusy(document.getElementById('retryDashboardButton'), false);
  }
}

document.getElementById('refreshDashboardButton').addEventListener('click', loadDashboard);
document.getElementById('retryDashboardButton').addEventListener('click', loadDashboard);
loadDashboard();
