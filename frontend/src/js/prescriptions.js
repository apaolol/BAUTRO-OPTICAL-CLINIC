let prescriptions = [];
let prescriptionsLoading = false;
let prescriptionsLoadFailed = false;
let prescriptionSaving = false;
let detailsReturnButton = null;
const prescriptionFields = [
  [
    "prescription_number",
    "Prescription number"
  ],
  [
    "date",
    "Date"
  ],
  [
    "patient_number",
    "Patient number"
  ],
  [
    "od_sphere",
    "OD Sphere"
  ],
  [
    "od_cylinder",
    "OD Cylinder"
  ],
  [
    "od_axis",
    "OD Axis"
  ],
  [
    "od_add",
    "OD Add"
  ],
  [
    "od_pd",
    "OD PD"
  ],
  [
    "os_sphere",
    "OS Sphere"
  ],
  [
    "os_cylinder",
    "OS Cylinder"
  ],
  [
    "os_axis",
    "OS Axis"
  ],
  [
    "os_add",
    "OS Add"
  ],
  [
    "os_pd",
    "OS PD"
  ],
  [
    "lens_type",
    "Lens type"
  ],
  [
    "lens_brand",
    "Lens brand"
  ],
  [
    "lens_coating",
    "Lens coating"
  ],
  [
    "frame_brand",
    "Frame brand"
  ],
  [
    "frame_model",
    "Frame model"
  ],
  [
    "notes",
    "Notes / special instructions"
  ]
];
function prescriptionValue(value) {
 return value === null || value === undefined || value === '' ? '—' : String(value);
}
function renderPrescriptions() {
 if (prescriptionsLoadFailed) return;
 const query = document.getElementById('prescriptionSearch').value.trim().toLowerCase();
 const filtered = prescriptions.filter(prescription => ['prescription_number','patient_number']
  .some(key => String(prescription[key] ?? '').toLowerCase().includes(query)));
 const body = document.getElementById('prescriptionTableBody');
 body.replaceChildren();
 document.getElementById('prescriptionCount').textContent = `${filtered.length} of ${prescriptions.length} prescriptions`;
 document.getElementById('prescriptionTable').hidden = filtered.length === 0;
 setStatus(document.getElementById('prescriptionListStatus'), filtered.length ? '' :
  (prescriptions.length ? 'No prescriptions match your search.' : 'No prescriptions on record.'));
 for (const prescription of filtered) {
  const row = document.createElement('tr');
  for (const key of ['prescription_number','patient_number','date','od_sphere','od_cylinder','od_axis','os_sphere','os_cylinder','os_axis','lens_type','frame_brand','frame_model']) {
   const cell = document.createElement('td');
   cell.textContent = prescriptionValue(prescription[key]);
   row.append(cell);
  }
  const cell = document.createElement('td');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'View';
  button.setAttribute('aria-label', `View prescription ${prescriptionValue(prescription.prescription_number)}`);
  button.addEventListener('click', () => showPrescriptionDetails(prescription, button));
  cell.append(button); row.append(cell); body.append(row);
 }
}
async function loadPrescriptions() {
 if (prescriptionsLoading) return;
 prescriptionsLoading = true;
 setButtonBusy(document.getElementById('refreshPrescriptionsButton'), true);
 document.getElementById('prescriptionTable').hidden = true;
 document.getElementById('prescriptionCount').textContent = '';
 document.getElementById('prescriptionSearch').disabled = true;
 document.getElementById('clearPrescriptionSearchButton').disabled = true;
 setStatus(document.getElementById('prescriptionListStatus'), 'Loading prescriptions…', 'loading');
 try {
  const data = await apiRequest('/prescriptions/');
  if (!Array.isArray(data)) throw new Error('Unexpected prescription list response. Please refresh.');
  prescriptionsLoadFailed = false;
  prescriptions = data; renderPrescriptions();
 } catch (error) {
  prescriptionsLoadFailed = true;
  setStatus(document.getElementById('prescriptionListStatus'), `Unable to load prescriptions. ${error.message} Use Refresh prescriptions to retry.`, 'error');
 } finally {
  prescriptionsLoading = false;
  setButtonBusy(document.getElementById('refreshPrescriptionsButton'), false);
  document.getElementById('prescriptionSearch').disabled = false;
  document.getElementById('clearPrescriptionSearchButton').disabled = false;
 }
}
function showPrescriptionForm() {
 document.getElementById('prescriptionForm').reset();
 setStatus(document.getElementById('prescriptionSaveStatus'), '');
 document.getElementById('prescriptionFormSection').hidden = false;
 document.getElementById('addPrescriptionButton').disabled = true;
 document.getElementById('prescriptionDetailsSection').hidden = true;
 document.getElementById('prescription_patient_number').focus();
}
function closePrescriptionForm() {
 if (prescriptionSaving) return;
 document.getElementById('prescriptionFormSection').hidden = true;
 document.getElementById('prescriptionForm').reset();
 document.getElementById('addPrescriptionButton').disabled = false;
 document.getElementById('addPrescriptionButton').focus();
}
function readPrescriptionForm() {
 const payload = {};
 for (const [key] of prescriptionFields) {
  if (key === 'prescription_number' || key === 'date') continue;
  payload[key] = document.getElementById(`prescription_${key}`).value.trim() || null;
 }
 if (!payload.patient_number) throw new Error('Patient number is required.');
 return payload;
}
async function savePrescription(event) {
 event.preventDefault();
 if (prescriptionSaving) return;
 const status = document.getElementById('prescriptionSaveStatus');
 let payload;
 try { payload = readPrescriptionForm(); }
 catch (error) { setStatus(status, error.message, 'error'); return; }
 prescriptionSaving = true;
 setButtonBusy(document.getElementById('savePrescriptionButton'), true);
 document.getElementById('prescriptionFormFields').disabled = true;
 document.getElementById('cancelPrescriptionButton').disabled = true;
 setStatus(status, 'Saving prescription…', 'loading');
 let saved = false;
 try {
  const result = await apiSend('/prescriptions/', 'POST', payload);
  if (typeof result?.prescription_number !== 'string' || !result.prescription_number) throw new Error('Unexpected save response. Refresh before saving again.');
  saved = true;
  setStatus(document.getElementById('prescriptionFeedback'), `Prescription ${result.prescription_number} created.`, 'success');
 } catch (error) {
  setStatus(status, `Save failed. ${error.message} Your entries are retained. If the request timed out or disconnected, refresh before retrying to avoid a duplicate.`, 'error');
 } finally {
  prescriptionSaving = false;
  setButtonBusy(document.getElementById('savePrescriptionButton'), false);
  document.getElementById('prescriptionFormFields').disabled = false;
  document.getElementById('cancelPrescriptionButton').disabled = false;
 }
 if (saved) {
  closePrescriptionForm();
  document.getElementById('prescriptionSearch').value = '';
  await loadPrescriptions();
 }
}
function showPrescriptionDetails(prescription, returnButton) {
 const details = document.getElementById('prescriptionDetails');
 details.replaceChildren();
 for (const [key,label] of prescriptionFields) {
  const item = document.createElement('div');
  const term = document.createElement('dt'); term.textContent = label;
  const value = document.createElement('dd'); value.textContent = prescriptionValue(prescription[key]);
  item.append(term, value); details.append(item);
 }
 detailsReturnButton = returnButton;
 document.getElementById('prescriptionDetailsSection').hidden = false;
 document.getElementById('prescriptionDetailsHeading').focus();
}
document.getElementById('addPrescriptionButton').addEventListener('click', showPrescriptionForm);
document.getElementById('cancelPrescriptionButton').addEventListener('click', closePrescriptionForm);
document.getElementById('prescriptionForm').addEventListener('submit', savePrescription);
document.getElementById('refreshPrescriptionsButton').addEventListener('click', loadPrescriptions);
document.getElementById('prescriptionSearch').addEventListener('input', () => { if (!prescriptionsLoading) renderPrescriptions(); });
document.getElementById('clearPrescriptionSearchButton').addEventListener('click', () => {
 document.getElementById('prescriptionSearch').value = ''; renderPrescriptions(); document.getElementById('prescriptionSearch').focus();
});
document.getElementById('closePrescriptionDetailsButton').addEventListener('click', () => {
 document.getElementById('prescriptionDetailsSection').hidden = true;
 if (detailsReturnButton?.isConnected) detailsReturnButton.focus();
 else document.getElementById('prescriptionSearch').focus();
});
loadPrescriptions();

function printPrescription() {
 if (!document.getElementById('prescriptionDetailsSection').hidden) window.print();
}
document.getElementById('printPrescriptionButton').addEventListener('click', printPrescription);
