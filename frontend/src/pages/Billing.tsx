import { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { apiFetch } from '../api';
import type { Toast } from '../hooks/useToast';

interface Invoice {
  id: number;
  invoice_number: string;
  patient_number: string;
  date: string | null;
  subtotal: number;
  discount: number;
  total: number;
  amount_paid: number;
  balance: number;
  payment_method: string | null;
  status: string | null;
}

const dash    = (v: unknown) => (v == null || v === '' ? '—' : String(v));
const fmtMoney = (n: number) =>
  '₱\u202f' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

interface Props { addToast: (msg: string, type: Toast['type']) => void; }

const STATUS_COLORS: Record<string, string> = {
  Paid:    'badge-green',
  Partial: 'badge-amber',
  Pending: 'badge-red',
};

/* ── Add Invoice Modal ── */
function AddInvoiceModal({
  onClose,
  onCreated,
  addToast,
}: {
  onClose: () => void;
  onCreated: () => void;
  addToast: Props['addToast'];
}) {
  const [saving, setSaving]     = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid]         = useState(0);

  const total   = Math.max(0, subtotal - discount);
  const balance = Math.max(0, total - paid);

  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const g  = (k: string) => (fd.get(k) as string | null)?.trim() || null;

    const patient_number = g('patient_number');
    if (!patient_number) { addToast('Patient Number is required.', 'error'); return; }

    const status = balance <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';

    const payload = {
      patient_number,
      subtotal,
      discount,
      total,
      amount_paid: paid,
      balance,
      payment_method: g('payment_method'),
      status,
    };

    setSaving(true);
    try {
      const res = await apiFetch<{ invoice_number: string }>('/billing/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      addToast(`Invoice ${res.invoice_number} created.`, 'success');
      onCreated();
    } catch (err: any) {
      addToast('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="inv-modal-title">
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-head-title" id="inv-modal-title">New Invoice</div>
            <div className="modal-head-sub">Create a billing record for a patient</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>

        <form onSubmit={handle}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="bil_patnum">Patient Number <span aria-hidden>*</span></label>
              <input
                id="bil_patnum"
                name="patient_number"
                className="form-input"
                placeholder="P-00001"
                required
                autoFocus
                style={{ maxWidth: 200 }}
              />
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="bil_sub">Subtotal (₱)</label>
                <input
                  id="bil_sub"
                  name="subtotal"
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-input"
                  value={subtotal}
                  onChange={e => setSubtotal(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="bil_disc">Discount (₱)</label>
                <input
                  id="bil_disc"
                  name="discount"
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-input"
                  value={discount}
                  onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Computed totals */}
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 20px',
                fontSize: 13,
              }}
            >
              <div><span style={{ color: 'var(--muted)' }}>Total</span></div>
              <div style={{ fontWeight: 600, textAlign: 'right' }}>{fmtMoney(total)}</div>

              <div>
                <label className="form-label" htmlFor="bil_paid" style={{ display: 'inline', textTransform: 'none', fontSize: 13 }}>
                  Amount Paid (₱)
                </label>
              </div>
              <div>
                <input
                  id="bil_paid"
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-input"
                  value={paid}
                  style={{ textAlign: 'right', padding: '4px 8px' }}
                  onChange={e => setPaid(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div><span style={{ color: 'var(--muted)' }}>Balance</span></div>
              <div style={{ fontWeight: 600, textAlign: 'right', color: balance > 0 ? 'var(--red)' : 'var(--green)' }}>
                {fmtMoney(balance)}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bil_method">Payment Method</label>
              <select id="bil_method" name="payment_method" className="form-select">
                <option value="">—</option>
                <option>Cash</option>
                <option>GCash</option>
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── View Invoice Modal ── */
function ViewInvoiceModal({ inv, onClose }: { inv: Invoice; onClose: () => void }) {
  const D = ({ label, val }: { label: string; val: unknown }) => (
    <div className="detail-item">
      <label>{label}</label>
      <span className={val == null || val === '' ? 'empty' : ''}>{dash(val)}</span>
    </div>
  );

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-head-title">{inv.invoice_number}</div>
            <div className="modal-head-sub">Patient {inv.patient_number} · {inv.date ?? '—'}</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <div className="modal-body">
          <div className="detail-grid detail-grid-2">
            <D label="Status"         val={inv.status} />
            <D label="Payment Method" val={inv.payment_method} />
          </div>
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              padding: '14px 18px',
              marginTop: 16,
            }}
          >
            {[
              ['Subtotal',     fmtMoney(inv.subtotal)],
              ['Discount',     fmtMoney(inv.discount)],
              ['Total',        fmtMoney(inv.total)],
              ['Amount Paid',  fmtMoney(inv.amount_paid)],
              ['Balance',      fmtMoney(inv.balance)],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '5px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13.5,
                }}
              >
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Billing({ addToast }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [viewing, setViewing]   = useState<Invoice | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Invoice[]>('/billing/');
      setInvoices(data);
    } catch (e: any) {
      addToast('Failed to load billing records: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const q = search.toLowerCase();
  const filtered = invoices.filter(i =>
    !q ||
    i.invoice_number.toLowerCase().includes(q) ||
    i.patient_number.toLowerCase().includes(q)
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Billing</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus /> New Invoice
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box">
              <Search aria-hidden="true" />
              <input
                className="search-input"
                placeholder="Search by invoice # or patient #…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search billing"
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
              {!loading && `${filtered.length} of ${invoices.length}`}
            </span>
          </div>
        </div>

        <div className="table-scroll">
          {loading ? (
            <div className="state-box"><div className="spinner" /><p>Loading billing records…</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Patient #</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th style={{ width: 1 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={9}>
                      {invoices.length === 0 ? 'No billing records yet.' : 'No records match your search.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(inv => (
                    <tr key={inv.id} className="clickable" onClick={() => setViewing(inv)}>
                      <td><span className="badge badge-cyan">{inv.invoice_number}</span></td>
                      <td><span className="badge badge-gray">{inv.patient_number}</span></td>
                      <td style={{ color: 'var(--muted)' }}>{dash(inv.date)}</td>
                      <td style={{ fontWeight: 500 }}>{fmtMoney(inv.total)}</td>
                      <td style={{ color: 'var(--muted)' }}>{fmtMoney(inv.amount_paid)}</td>
                      <td style={{ color: inv.balance > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 500 }}>
                        {fmtMoney(inv.balance)}
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{dash(inv.payment_method)}</td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[inv.status ?? ''] ?? 'badge-gray'}`}>
                          {dash(inv.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={e => { e.stopPropagation(); setViewing(inv); }}
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
        <AddInvoiceModal
          addToast={addToast}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}

      {viewing && (
        <ViewInvoiceModal inv={viewing} onClose={() => setViewing(null)} />
      )}
    </>
  );
}
