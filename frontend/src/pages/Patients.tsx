import { useEffect, useState, useRef } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { apiFetch } from '../api';
import type { Toast } from '../hooks/useToast';

/* ── Types ── */
interface Patient {
  id: number;
  patient_number: string;
  date_created: string | null;
  full_name: string;
  address: string | null;
  contact_number: string | null;
  date_of_birth: string | null;
  age: number | null;
  sex: string | null;
  occupation: string | null;
  emergency_contact: string | null;
  chief_complaint: string | null;
  medical_history: string | null;
  ocular_history: string | null;
  allergies: string | null;
  current_medications: string | null;
  visual_acuity_od: string | null;
  visual_acuity_os: string | null;
  bcva_od: string | null;
  bcva_os: string | null;
  iop: string | null;
  diagnosis: string | null;
  clinical_notes: string | null;
  other_tests: string | null;
}

const dash = (v: unknown) => (v == null || v === '' ? '—' : String(v));

interface Props { addToast: (msg: string, type: Toast['type']) => void; }

/* ── Add Patient Modal ── */
function AddPatientModal({
  onClose,
  onCreated,
  addToast,
}: {
  onClose: () => void;
  onCreated: () => void;
  addToast: Props['addToast'];
}) {
  const [saving, setSaving] = useState(false);

  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const g = (k: string) => (fd.get(k) as string | null)?.trim() || null;
    const gn = (k: string) => { const v = g(k); return v ? parseInt(v) : null; };

    const full_name     = g('full_name');
    const contact_number = g('contact_number');
    if (!full_name || !contact_number) {
      addToast('Full name and contact number are required.', 'error');
      return;
    }

    const payload = {
      full_name,
      contact_number,
      address:             g('address'),
      date_of_birth:       g('date_of_birth'),
      age:                 gn('age'),
      sex:                 g('sex'),
      occupation:          g('occupation'),
      emergency_contact:   g('emergency_contact'),
      chief_complaint:     g('chief_complaint'),
      medical_history:     g('medical_history'),
      ocular_history:      g('ocular_history'),
      allergies:           g('allergies'),
      current_medications: g('current_medications'),
      visual_acuity_od:    g('visual_acuity_od'),
      visual_acuity_os:    g('visual_acuity_os'),
      bcva_od:             g('bcva_od'),
      bcva_os:             g('bcva_os'),
      iop:                 g('iop'),
      diagnosis:           g('diagnosis'),
      clinical_notes:      g('clinical_notes'),
      other_tests:         g('other_tests'),
    };

    setSaving(true);
    try {
      const res = await apiFetch<{ patient_number: string }>('/patients/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      addToast(`Patient ${res.patient_number} created.`, 'success');
      onCreated();
    } catch (err: any) {
      addToast('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal modal-lg">
        <div className="modal-head">
          <div>
            <div className="modal-head-title" id="modal-title">Add New Patient</div>
            <div className="modal-head-sub">Register a new patient record</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>

        <form onSubmit={handle}>
          <div className="modal-body">

            {/* Personal */}
            <div className="form-section">
              <span className="form-section-title">Personal Information</span>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group col-span-2">
                <label className="form-label" htmlFor="p_full_name">Full Name <span aria-hidden>*</span></label>
                <input id="p_full_name" name="full_name" className="form-input" placeholder="Juan Dela Cruz" required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_contact">Contact Number <span aria-hidden>*</span></label>
                <input id="p_contact" name="contact_number" className="form-input" placeholder="09XX-XXX-XXXX" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_dob">Date of Birth</label>
                <input id="p_dob" name="date_of_birth" type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_age">Age</label>
                <input id="p_age" name="age" type="number" min="0" max="150" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_sex">Sex</label>
                <select id="p_sex" name="sex" className="form-select">
                  <option value="">—</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group col-span-2">
                <label className="form-label" htmlFor="p_address">Address</label>
                <input id="p_address" name="address" className="form-input" placeholder="City, Province" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_occupation">Occupation</label>
                <input id="p_occupation" name="occupation" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_emergency">Emergency Contact</label>
                <input id="p_emergency" name="emergency_contact" className="form-input" placeholder="Name / Number" />
              </div>
            </div>

            {/* Medical History */}
            <div className="form-section">
              <span className="form-section-title">Medical History</span>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="p_complaint">Chief Complaint</label>
                <input id="p_complaint" name="chief_complaint" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_allergies">Allergies</label>
                <input id="p_allergies" name="allergies" className="form-input" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label" htmlFor="p_medhist">Medical History</label>
                <textarea id="p_medhist" name="medical_history" className="form-textarea" rows={2} />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label" htmlFor="p_ochist">Ocular History</label>
                <textarea id="p_ochist" name="ocular_history" className="form-textarea" rows={2} />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label" htmlFor="p_meds">Current Medications</label>
                <input id="p_meds" name="current_medications" className="form-input" />
              </div>
            </div>

            {/* Clinical Examination */}
            <div className="form-section">
              <span className="form-section-title">Clinical Examination</span>
            </div>
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="p_vaod">VA OD (unaided)</label>
                <input id="p_vaod" name="visual_acuity_od" className="form-input" placeholder="20/200" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_vaos">VA OS (unaided)</label>
                <input id="p_vaos" name="visual_acuity_os" className="form-input" placeholder="20/200" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_iop">IOP</label>
                <input id="p_iop" name="iop" className="form-input" placeholder="14/15 mmHg" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_bcvaod">BCVA OD</label>
                <input id="p_bcvaod" name="bcva_od" className="form-input" placeholder="20/20" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_bcvaos">BCVA OS</label>
                <input id="p_bcvaos" name="bcva_os" className="form-input" placeholder="20/20" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_diagnosis">Diagnosis</label>
                <input id="p_diagnosis" name="diagnosis" className="form-input" />
              </div>
              <div className="form-group col-span-3">
                <label className="form-label" htmlFor="p_notes">Clinical Notes</label>
                <textarea id="p_notes" name="clinical_notes" className="form-textarea" />
              </div>
              <div className="form-group col-span-3">
                <label className="form-label" htmlFor="p_other">Other Tests</label>
                <textarea id="p_other" name="other_tests" className="form-textarea" rows={2} />
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── View Patient Modal ── */
function ViewPatientModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const D = ({ label, val }: { label: string; val: unknown }) => (
    <div className="detail-item">
      <label>{label}</label>
      <span className={val == null || val === '' ? 'empty' : ''}>{dash(val)}</span>
    </div>
  );

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="view-modal-title">
      <div className="modal modal-lg">
        <div className="modal-head">
          <div>
            <div className="modal-head-title" id="view-modal-title">{patient.full_name}</div>
            <div className="modal-head-sub">
              {patient.patient_number}
              {patient.date_created ? ` · Registered ${patient.date_created}` : ''}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>

        <div className="modal-body">
          <div className="detail-section-title">Personal Information</div>
          <div className="detail-grid detail-grid-3">
            <D label="Age"      val={patient.age} />
            <D label="Sex"      val={patient.sex} />
            <D label="Date of Birth" val={patient.date_of_birth} />
            <D label="Contact"  val={patient.contact_number} />
            <D label="Emergency Contact" val={patient.emergency_contact} />
            <D label="Occupation" val={patient.occupation} />
          </div>
          <div className="detail-grid" style={{ gridTemplateColumns: '1fr', marginTop: 6 }}>
            <D label="Address" val={patient.address} />
          </div>

          <hr className="divider" />
          <div className="detail-section-title">Medical History</div>
          <div className="detail-grid detail-grid-2">
            <D label="Chief Complaint"     val={patient.chief_complaint} />
            <D label="Allergies"           val={patient.allergies} />
            <D label="Medical History"     val={patient.medical_history} />
            <D label="Ocular History"      val={patient.ocular_history} />
            <D label="Current Medications" val={patient.current_medications} />
            <D label="Other Tests"         val={patient.other_tests} />
          </div>

          <hr className="divider" />
          <div className="detail-section-title">Clinical Examination</div>
          <div className="detail-grid detail-grid-3">
            <D label="VA OD (unaided)"  val={patient.visual_acuity_od} />
            <D label="VA OS (unaided)"  val={patient.visual_acuity_os} />
            <D label="IOP"              val={patient.iop} />
            <D label="BCVA OD"          val={patient.bcva_od} />
            <D label="BCVA OS"          val={patient.bcva_os} />
            <D label="Diagnosis"        val={patient.diagnosis} />
          </div>
          {patient.clinical_notes && (
            <div className="detail-grid" style={{ gridTemplateColumns: '1fr', marginTop: 6 }}>
              <D label="Clinical Notes" val={patient.clinical_notes} />
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Patients({ addToast }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [viewing, setViewing]   = useState<Patient | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Patient[]>('/patients/');
      setPatients(data);
    } catch (e: any) {
      addToast('Failed to load patients: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const q = search.toLowerCase();
  const filtered = patients.filter(p =>
    !q ||
    p.full_name.toLowerCase().includes(q) ||
    p.patient_number.toLowerCase().includes(q) ||
    (p.contact_number ?? '').includes(q)
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAdd(true)}
          aria-label="Add new patient"
        >
          <Plus /> Add Patient
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box" role="search">
              <Search aria-hidden="true" />
              <input
                ref={searchRef}
                className="search-input"
                placeholder="Search name, ID, or contact…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search patients"
              />
            </div>
            {search && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearch(''); searchRef.current?.focus(); }}
              >
                <X /> Clear
              </button>
            )}
          </div>
          <div className="table-toolbar-right">
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {loading ? '…' : `${filtered.length} of ${patients.length}`}
            </span>
          </div>
        </div>

        <div className="table-scroll">
          {loading ? (
            <div className="state-box"><div className="spinner" /><p>Loading patients…</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Patient #</th>
                  <th>Full Name</th>
                  <th>Age</th>
                  <th>Sex</th>
                  <th>Contact</th>
                  <th>Diagnosis</th>
                  <th>Registered</th>
                  <th style={{ width: 1 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={8}>
                      {patients.length === 0
                        ? 'No patients registered yet.'
                        : 'No patients match your search.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr
                      key={p.id}
                      className="clickable"
                      onClick={() => setViewing(p)}
                    >
                      <td><span className="badge badge-cyan">{p.patient_number}</span></td>
                      <td style={{ fontWeight: 500 }}>{p.full_name}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(p.age)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(p.sex)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(p.contact_number)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(p.diagnosis)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(p.date_created)}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={e => { e.stopPropagation(); setViewing(p); }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <AddPatientModal
          addToast={addToast}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}

      {viewing && (
        <ViewPatientModal
          patient={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
