let invoices = [];
let invoicesLoading = false;
let invoicesLoadFailed = false;
let invoiceSaving = false;
let detailsReturnButton = null;
const invoiceFields = [["invoice_number", "Invoice number"], ["patient_number", "Patient number"], ["date", "Date"], ["subtotal", "Subtotal"], ["discount", "Discount"], ["total", "Total"], ["amount_paid", "Amount paid"], ["balance", "Balance"], ["payment_method", "Payment method"], ["status", "Status"]];
const moneyFields = ["subtotal", "discount", "total", "amount_paid", "balance"];
function invoiceValue(value) {
 return value === null || value === undefined || value === '' ? '—' : String(value);
}
function renderInvoices() {
 if (invoicesLoadFailed) return;
 const query = document.getElementById('invoiceSearch').value.trim().toLowerCase();
 const filtered = invoices.filter(invoice => ['invoice_number','patient_number']
  .some(key => String(invoice[key] ?? '').toLowerCase().includes(query)));
 const body = document.getElementById('invoiceTableBody');
 body.replaceChildren();
 document.getElementById('invoiceCount').textContent = `${filtered.length} of ${invoices.length} invoices`;
 document.getElementById('invoiceTable').hidden = filtered.length === 0;
 setStatus(document.getElementById('invoiceListStatus'), filtered.length ? '' :
  (invoices.length ? 'No invoices match your search.' : 'No billing records yet.'));
 for (const invoice of filtered) {
  const row = document.createElement('tr');
  for (const key of ['invoice_number','patient_number','date','total','amount_paid','balance','payment_method','status']) {
   const cell = document.createElement('td');
   cell.textContent = moneyFields.includes(key) && invoice[key] != null ? formatPeso(invoice[key]) : invoiceValue(invoice[key]);
   if (key === "status") { cell.dataset.status = invoice[key] ?? ""; }
   row.append(cell);
  }
  const cell = document.createElement('td');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'View';
  button.setAttribute('aria-label', `View invoice ${invoiceValue(invoice.invoice_number)}`);
  button.addEventListener('click', () => showInvoiceDetails(invoice, button));
  cell.append(button); row.append(cell); body.append(row);
 }
}
async function loadInvoices() {
 if (invoicesLoading) return;
 invoicesLoading = true;
 setButtonBusy(document.getElementById('refreshInvoicesButton'), true);
 document.getElementById('invoiceTable').hidden = true;
 document.getElementById('invoiceCount').textContent = '';
 document.getElementById('invoiceSearch').disabled = true;
 document.getElementById('clearInvoiceSearchButton').disabled = true;
 setStatus(document.getElementById('invoiceListStatus'), 'Loading invoices…', 'loading');
 try {
  const data = await apiRequest('/billing/');
  if (!Array.isArray(data)) throw new Error('Unexpected invoice list response. Please refresh.');
  invoicesLoadFailed = false;
  invoices = data; renderInvoices();
 } catch (error) {
  invoicesLoadFailed = true;
  setStatus(document.getElementById('invoiceListStatus'), `Unable to load invoices. ${error.message} Use Refresh invoices to retry.`, 'error');
 } finally {
  invoicesLoading = false;
  setButtonBusy(document.getElementById('refreshInvoicesButton'), false);
  document.getElementById('invoiceSearch').disabled = false;
  document.getElementById('clearInvoiceSearchButton').disabled = false;
 }
}
function showInvoiceForm() {
 document.getElementById('invoiceForm').reset();
 updateInvoiceTotals();
 setStatus(document.getElementById('invoiceSaveStatus'), '');
 document.getElementById('invoiceFormSection').hidden = false;
 document.getElementById('addInvoiceButton').disabled = true;
 document.getElementById('invoiceDetailsSection').hidden = true;
 document.getElementById('invoice_patient_number').focus();
}
function closeInvoiceForm() {
 if (invoiceSaving) return;
 document.getElementById('invoiceFormSection').hidden = true;
 document.getElementById('invoiceForm').reset();
 updateInvoiceTotals();
 document.getElementById('addInvoiceButton').disabled = false;
 document.getElementById('addInvoiceButton').focus();
}
function calculateInvoice(subtotal, discount, paid) {
 const total = Math.max(0, subtotal - discount);
 const balance = Math.max(0, total - paid);
 return { total, balance, status: balance <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending' };
}
function readInvoiceAmounts() {
 const values = {};
 for (const key of ['subtotal', 'discount', 'amount_paid']) {
  const raw = document.getElementById(`invoice_${key}`).value.trim();
  const value = raw === '' ? 0 : Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new Error('Enter valid non-negative monetary amounts.');
  values[key] = value;
 }
 return values;
}
function updateInvoiceTotals() {
 try {
  const amounts = readInvoiceAmounts();
  const calculated = calculateInvoice(amounts.subtotal, amounts.discount, amounts.amount_paid);
  document.getElementById('invoiceTotal').textContent = formatPeso(calculated.total);
  document.getElementById('invoiceBalance').textContent = formatPeso(calculated.balance);
  document.getElementById('invoiceStatus').textContent = calculated.status;
 } catch {
  document.getElementById('invoiceTotal').textContent = 'Invalid amount';
  document.getElementById('invoiceBalance').textContent = 'Invalid amount';
  document.getElementById('invoiceStatus').textContent = 'Check amounts';
 }
}
function readInvoiceForm() {
 const patient_number = document.getElementById('invoice_patient_number').value.trim();
 if (!patient_number) throw new Error('Patient number is required.');
 const amounts = readInvoiceAmounts();
 return { patient_number, ...amounts,
  ...calculateInvoice(amounts.subtotal, amounts.discount, amounts.amount_paid),
  payment_method: document.getElementById('invoice_payment_method').value.trim() || null };
}
async function saveInvoice(event) {
 event.preventDefault();
 if (invoiceSaving) return;
 const status = document.getElementById('invoiceSaveStatus');
 let payload;
 try { payload = readInvoiceForm(); }
 catch (error) { setStatus(status, error.message, 'error'); return; }
 invoiceSaving = true;
 setButtonBusy(document.getElementById('saveInvoiceButton'), true);
 document.getElementById('invoiceFormFields').disabled = true;
 document.getElementById('cancelInvoiceButton').disabled = true;
 setStatus(status, 'Saving invoice…', 'loading');
 let saved = false;
 try {
  const result = await apiSend('/billing/', 'POST', payload);
  if (typeof result?.invoice_number !== 'string' || !result.invoice_number) throw new Error('Unexpected save response. Refresh before saving again.');
  saved = true;
  setStatus(document.getElementById('invoiceFeedback'), `Invoice ${result.invoice_number} created.`, 'success');
 } catch (error) {
  setStatus(status, `Save failed. ${error.message} Your entries are retained. If the request timed out or disconnected, refresh before retrying to avoid a duplicate.`, 'error');
 } finally {
  invoiceSaving = false;
  setButtonBusy(document.getElementById('saveInvoiceButton'), false);
  document.getElementById('invoiceFormFields').disabled = false;
  document.getElementById('cancelInvoiceButton').disabled = false;
 }
 if (saved) {
  closeInvoiceForm();
  document.getElementById('invoiceSearch').value = '';
  await loadInvoices();
 }
}
function showInvoiceDetails(invoice, returnButton) {
 const details = document.getElementById('invoiceDetails');
 details.replaceChildren();
 for (const [key,label] of invoiceFields) {
  const item = document.createElement('div');
  const term = document.createElement('dt'); term.textContent = label;
  const value = document.createElement('dd'); value.textContent = moneyFields.includes(key) && invoice[key] != null ? formatPeso(invoice[key]) : invoiceValue(invoice[key]);
  item.append(term, value); details.append(item);
 }
 detailsReturnButton = returnButton;
 document.getElementById('invoiceDetailsSection').hidden = false;
 document.getElementById('invoiceDetailsHeading').focus();
}
document.getElementById('addInvoiceButton').addEventListener('click', showInvoiceForm);
document.getElementById('cancelInvoiceButton').addEventListener('click', closeInvoiceForm);
document.getElementById('invoiceForm').addEventListener('submit', saveInvoice);
document.getElementById('refreshInvoicesButton').addEventListener('click', loadInvoices);
document.getElementById('invoiceSearch').addEventListener('input', () => { if (!invoicesLoading) renderInvoices(); });
document.getElementById('clearInvoiceSearchButton').addEventListener('click', () => {
 document.getElementById('invoiceSearch').value = ''; renderInvoices(); document.getElementById('invoiceSearch').focus();
});
document.getElementById('closeInvoiceDetailsButton').addEventListener('click', () => {
 document.getElementById('invoiceDetailsSection').hidden = true;
 if (detailsReturnButton?.isConnected) detailsReturnButton.focus();
 else document.getElementById('invoiceSearch').focus();
});
loadInvoices();

for (const key of ["subtotal", "discount", "amount_paid"]) document.getElementById(`invoice_${key}`).addEventListener("input", updateInvoiceTotals);
updateInvoiceTotals();
