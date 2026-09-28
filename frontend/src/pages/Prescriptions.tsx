import { useEffect, useState } from 'react';
import { Plus, Search, X, Printer } from 'lucide-react';
import { apiFetch } from '../api';
import type { Toast } from '../hooks/useToast';

interface Prescription {
  id: number;
  prescription_number: string;
  patient_number: string;
  date: string | null;
  od_sphere: string | null;
  od_cylinder: string | null;
  od_axis: string | null;
  od_add: string | null;
  od_pd: string | null;
  os_sphere: string | null;
  os_cylinder: string | null;
  os_axis: string | null;
  os_add: string | null;
  os_pd: string | null;
  lens_type: string | null;
  lens_brand: string | null;
  lens_coating: string | null;
  frame_brand: string | null;
  frame_model: string | null;
  notes: string | null;
}

const dash = (v: unknown) => (v == null || v === '' ? '—' : String(v));

interface Props { addToast: (msg: string, type: Toast['type']) => void; }

/* ── Refraction table row ── */
function RxRow({ eye, prefix }: { eye: 'OD' | 'OS'; prefix: string }) {
  return (
    <tr>
      <td className="rx-eye-label">{eye}</td>
      {['sphere','cylinder','axis','add','pd'].map(f => (
        <td key={f}>
          <input
            name={`${prefix}_${f}`}
            className="form-input"
            placeholder="—"
            style={{ textAlign: 'center' }}
          />
        </td>
      ))}
    </tr>
  );
}

/* ── Add Prescription Modal ── */
function AddPrescriptionModal({
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

    const patient_number = g('patient_number');
    if (!patient_number) {
      addToast('Patient Number is required.', 'error');
      return;
    }

    const payload = {
      patient_number,
      od_sphere:   g('od_sphere'),
      od_cylinder: g('od_cylinder'),
      od_axis:     g('od_axis'),
      od_add:      g('od_add'),
      od_pd:       g('od_pd'),
      os_sphere:   g('os_sphere'),
      os_cylinder: g('os_cylinder'),
      os_axis:     g('os_axis'),
      os_add:      g('os_add'),
      os_pd:       g('os_pd'),
      lens_type:   g('lens_type'),
      lens_brand:  g('lens_brand'),
      lens_coating:g('lens_coating'),
      frame_brand: g('frame_brand'),
      frame_model: g('frame_model'),
      notes:       g('notes'),
    };

    setSaving(true);
    try {
      const res = await apiFetch<{ prescription_number: string }>('/prescriptions/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      addToast(`Prescription ${res.prescription_number} created.`, 'success');
      onCreated();
    } catch (err: any) {
      addToast('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rx-modal-title">
      <div className="modal modal-lg">
        <div className="modal-head">
          <div>
            <div className="modal-head-title" id="rx-modal-title">New Prescription</div>
            <div className="modal-head-sub">Enter refraction and lens details</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>

        <form onSubmit={handle}>
          <div className="modal-body">

            <div className="form-section">
              <span className="form-section-title">Patient</span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="rx_patnum">Patient Number <span aria-hidden>*</span></label>
              <input
                id="rx_patnum"
                name="patient_number"
                className="form-input"
                placeholder="P-00001"
                required
                autoFocus
                style={{ maxWidth: 200 }}
              />
            </div>

            <div className="form-section">
              <span className="form-section-title">Refraction</span>
            </div>
            <table className="rx-grid">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>Eye</th>
                  <th>Sphere</th>
                  <th>Cylinder</th>
                  <th>Axis</th>
                  <th>Add</th>
                  <th>PD</th>
                </tr>
              </thead>
              <tbody>
                <RxRow eye="OD" prefix="od" />
                <RxRow eye="OS" prefix="os" />
              </tbody>
            </table>

            <div className="form-section">
              <span className="form-section-title">Lens &amp; Frame</span>
            </div>
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="rx_lens_type">Lens Type</label>
                <input id="rx_lens_type" name="lens_type" className="form-input" placeholder="e.g. Progressive" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rx_lens_brand">Lens Brand</label>
                <input id="rx_lens_brand" name="lens_brand" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rx_coating">Coating</label>
                <input id="rx_coating" name="lens_coating" className="form-input" placeholder="e.g. Anti-reflective" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rx_frame_brand">Frame Brand</label>
                <input id="rx_frame_brand" name="frame_brand" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rx_frame_model">Frame Model</label>
                <input id="rx_frame_model" name="frame_model" className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rx_notes">Notes / Special Instructions</label>
              <textarea id="rx_notes" name="notes" className="form-textarea" />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── View Prescription Modal ── */
function ViewPrescriptionModal({ rx, onClose }: { rx: Prescription; onClose: () => void }) {
  const D = ({ label, val }: { label: string; val: unknown }) => (
    <div className="detail-item">
      <label>{label}</label>
      <span className={val == null || val === '' ? 'empty' : ''}>{dash(val)}</span>
    </div>
  );

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="view-rx-title">
      <div className="modal modal-lg">
        <div className="modal-head">
          <div>
            <div className="modal-head-title" id="view-rx-title">{rx.prescription_number}</div>
            <div className="modal-head-sub">Patient {rx.patient_number} · {rx.date ?? '—'}</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>

        <div className="modal-body">
          <div className="detail-section-title">Refraction</div>
          <table className="rx-grid" style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                <th style={{ width: 48 }}>Eye</th>
                <th>Sphere</th>
                <th>Cylinder</th>
                <th>Axis</th>
                <th>Add</th>
                <th>PD</th>
              </tr>
            </thead>
            <tbody>
              {(['OD','OS'] as const).map(eye => {
                const p = eye === 'OD' ? 'od' : 'os';
                return (
                  <tr key={eye}>
                    <td className="rx-eye-label">{eye}</td>
                    {(['sphere','cylinder','axis','add','pd'] as const).map(f => (
                      <td key={f} style={{ textAlign:'center', padding:'8px 12px' }}>
                        {dash((rx as any)[`${p}_${f}`])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="detail-section-title">Lens &amp; Frame</div>
          <div className="detail-grid detail-grid-3">
            <D label="Lens Type"   val={rx.lens_type} />
            <D label="Lens Brand"  val={rx.lens_brand} />
            <D label="Coating"     val={rx.lens_coating} />
            <D label="Frame Brand" val={rx.frame_brand} />
            <D label="Frame Model" val={rx.frame_model} />
          </div>

          {rx.notes && (
            <>
              <div className="detail-section-title" style={{ marginTop: 12 }}>Notes</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>{rx.notes}</p>
            </>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer /> Print
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Prescriptions({ addToast }: Props) {
  const [rxList, setRxList]   = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState<Prescription | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Prescription[]>('/prescriptions/');
      setRxList(data);
    } catch (e: any) {
      addToast('Failed to load prescriptions: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const q = search.toLowerCase();
  const filtered = rxList.filter(r =>
    !q ||
    r.prescription_number.toLowerCase().includes(q) ||
    r.patient_number.toLowerCase().includes(q)
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Prescriptions</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus /> New Prescription
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box">
              <Search aria-hidden="true" />
              <input
                className="search-input"
                placeholder="Search by Rx # or Patient #…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search prescriptions"
              />
            </div>
            {search && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSearch('')}>
                <X /> Clear
              </button>
            )}
          </div>
          <div className="table-toolbar-right">
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {!loading && `${filtered.length} of ${rxList.length}`}
            </span>
          </div>
        </div>

        <div className="table-scroll">
          {loading ? (
            <div className="state-box"><div className="spinner" /><p>Loading prescriptions…</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Rx #</th>
                  <th>Patient #</th>
                  <th>Date</th>
                  <th>OD Sphere</th>
                  <th>OD Cyl</th>
                  <th>OD Axis</th>
                  <th>OS Sphere</th>
                  <th>OS Cyl</th>
                  <th>OS Axis</th>
                  <th>Lens</th>
                  <th>Frame</th>
                  <th style={{ width: 1 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={12}>
                      {rxList.length === 0 ? 'No prescriptions on record.' : 'No prescriptions match your search.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(rx => (
                    <tr key={rx.id} className="clickable" onClick={() => setViewing(rx)}>
                      <td><span className="badge badge-cyan">{rx.prescription_number}</span></td>
                      <td><span className="badge badge-gray">{rx.patient_number}</span></td>
                      <td style={{ color: 'var(--muted)' }}>{dash(rx.date)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(rx.od_sphere)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(rx.od_cylinder)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(rx.od_axis)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(rx.os_sphere)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(rx.os_cylinder)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(rx.os_axis)}</td>
                      <td style={{ color: 'var(--muted)' }}>{dash(rx.lens_type)}</td>
                      <td style={{ color: 'var(--muted)' }}>
                        {[rx.frame_brand, rx.frame_model].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={e => { e.stopPropagation(); setViewing(rx); }}
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
        <AddPrescriptionModal
          addToast={addToast}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}

      {viewing && (
        <ViewPrescriptionModal
          rx={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
