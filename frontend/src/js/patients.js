let patients = [];
let patientsLoading = false;
let patientsLoadFailed = false;
let patientSaving = false;
let detailsReturnButton = null;
const patientFields = [
 ['patient_number','Patient number'], ['date_created','Registered'],
 ['full_name','Full name'], ['contact_number','Contact number'], ['date_of_birth','Date of birth'],
 ['age','Age'], ['sex','Sex'], ['address','Address'], ['occupation','Occupation'],
 ['emergency_contact','Emergency contact'], ['chief_complaint','Chief complaint'],
 ['medical_history','Medical history'], ['ocular_history','Ocular history'], ['allergies','Allergies'],
 ['current_medications','Current medications'], ['visual_acuity_od','VA OD (unaided)'],
 ['visual_acuity_os','VA OS (unaided)'], ['bcva_od','BCVA OD'], ['bcva_os','BCVA OS'],
 ['iop','IOP'], ['diagnosis','Diagnosis'], ['clinical_notes','Clinical notes'], ['other_tests','Other tests']
];
function patientValue(value) {
 return value === null || value === undefined || value === '' ? '—' : String(value);
}
function renderPatients() {
 if (patientsLoadFailed) return;
 const query = document.getElementById('patientSearch').value.trim().toLowerCase();
 const filtered = patients.filter(patient => ['full_name','patient_number','contact_number']
  .some(key => String(patient[key] ?? '').toLowerCase().includes(query)));
 const body = document.getElementById('patientTableBody');
 body.replaceChildren();
 document.getElementById('patientCount').textContent = `${filtered.length} of ${patients.length} patients`;
 document.getElementById('patientTable').hidden = filtered.length === 0;
 setStatus(document.getElementById('patientListStatus'), filtered.length ? '' :
  (patients.length ? 'No patients match your search.' : 'No patients registered yet.'));
 for (const patient of filtered) {
  const row = document.createElement('tr');
  for (const key of ['patient_number','full_name','age','sex','contact_number','diagnosis','date_created']) {
   const cell = document.createElement('td');
   cell.textContent = patientValue(patient[key]);
   row.append(cell);
  }
  const cell = document.createElement('td');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'View';
  button.setAttribute('aria-label', `View patient ${patientValue(patient.patient_number)}`);
  button.addEventListener('click', () => showPatientDetails(patient, button));
  cell.append(button); row.append(cell); body.append(row);
 }
}
async function loadPatients() {
 if (patientsLoading) return;
 patientsLoading = true;
 setButtonBusy(document.getElementById('refreshPatientsButton'), true);
 document.getElementById('patientTable').hidden = true;
 document.getElementById('patientCount').textContent = '';
 document.getElementById('patientSearch').disabled = true;
 document.getElementById('clearPatientSearchButton').disabled = true;
 setStatus(document.getElementById('patientListStatus'), 'Loading patients…', 'loading');
 try {
  const data = await apiRequest('/patients/');
  if (!Array.isArray(data)) throw new Error('Unexpected patient list response. Please refresh.');
  patientsLoadFailed = false;
  patients = data; renderPatients();
 } catch (error) {
  patientsLoadFailed = true;
  setStatus(document.getElementById('patientListStatus'), `Unable to load patients. ${error.message} Use Refresh patients to retry.`, 'error');
 } finally {
  patientsLoading = false;
  setButtonBusy(document.getElementById('refreshPatientsButton'), false);
  document.getElementById('patientSearch').disabled = false;
  document.getElementById('clearPatientSearchButton').disabled = false;
 }
}
function showPatientForm() {
 document.getElementById('patientForm').reset();
 setStatus(document.getElementById('patientSaveStatus'), '');
 document.getElementById('patientFormSection').hidden = false;
 document.getElementById('addPatientButton').disabled = true;
 document.getElementById('patientDetailsSection').hidden = true;
 document.getElementById('patient_full_name').focus();
}
function closePatientForm() {
 if (patientSaving) return;
 document.getElementById('patientFormSection').hidden = true;
 document.getElementById('patientForm').reset();
 document.getElementById('addPatientButton').disabled = false;
 document.getElementById('addPatientButton').focus();
}
function readPatientForm() {
 const payload = {};
 for (const [key] of patientFields) {
  if (key === 'patient_number' || key === 'date_created') continue;
  payload[key] = document.getElementById(`patient_${key}`).value.trim() || null;
 }
 if (!payload.full_name || !payload.contact_number) throw new Error('Full name and contact number are required.');
 if (payload.age !== null) {
  const age = Number(payload.age);
  if (!Number.isInteger(age) || age < 0 || age > 150) throw new Error('Age must be a whole number from 0 to 150.');
  payload.age = age;
 }
 return payload;
}
async function savePatient(event) {
 event.preventDefault();
 if (patientSaving) return;
 const status = document.getElementById('patientSaveStatus');
 let payload;
 try { payload = readPatientForm(); }
 catch (error) { setStatus(status, error.message, 'error'); return; }
 patientSaving = true;
 setButtonBusy(document.getElementById('savePatientButton'), true);
 document.getElementById('patientFormFields').disabled = true;
 document.getElementById('cancelPatientButton').disabled = true;
 setStatus(status, 'Saving patient…', 'loading');
 let saved = false;
 try {
  const result = await apiSend('/patients/', 'POST', payload);
  if (typeof result?.patient_number !== 'string' || !result.patient_number) throw new Error('Unexpected save response. Refresh before saving again.');
  saved = true;
  setStatus(document.getElementById('patientFeedback'), `Patient ${result.patient_number} created.`, 'success');
 } catch (error) {
  setStatus(status, `Save failed. ${error.message} Your entries are retained. If the request timed out or disconnected, refresh before retrying to avoid a duplicate.`, 'error');
 } finally {
  patientSaving = false;
  setButtonBusy(document.getElementById('savePatientButton'), false);
  document.getElementById('patientFormFields').disabled = false;
  document.getElementById('cancelPatientButton').disabled = false;
 }
 if (saved) {
  closePatientForm();
  document.getElementById('patientSearch').value = '';
  await loadPatients();
 }
}
function showPatientDetails(patient, returnButton) {
 const details = document.getElementById('patientDetails');
 details.replaceChildren();
 for (const [key,label] of patientFields) {
  const item = document.createElement('div');
  const term = document.createElement('dt'); term.textContent = label;
  const value = document.createElement('dd'); value.textContent = patientValue(patient[key]);
  item.append(term, value); details.append(item);
 }
 detailsReturnButton = returnButton;
 document.getElementById('patientDetailsSection').hidden = false;
 document.getElementById('patientDetailsHeading').focus();
}
document.getElementById('addPatientButton').addEventListener('click', showPatientForm);
document.getElementById('cancelPatientButton').addEventListener('click', closePatientForm);
document.getElementById('patientForm').addEventListener('submit', savePatient);
document.getElementById('refreshPatientsButton').addEventListener('click', loadPatients);
document.getElementById('patientSearch').addEventListener('input', () => { if (!patientsLoading) renderPatients(); });
document.getElementById('clearPatientSearchButton').addEventListener('click', () => {
 document.getElementById('patientSearch').value = ''; renderPatients(); document.getElementById('patientSearch').focus();
});
document.getElementById('closePatientDetailsButton').addEventListener('click', () => {
 document.getElementById('patientDetailsSection').hidden = true;
 if (detailsReturnButton?.isConnected) detailsReturnButton.focus();
 else document.getElementById('patientSearch').focus();
});
loadPatients();
