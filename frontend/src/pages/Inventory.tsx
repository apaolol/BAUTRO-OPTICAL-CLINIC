import { useEffect, useState } from 'react';
import { Plus, Search, X, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../api';
import type { Toast } from '../hooks/useToast';

interface InventoryItem {
  id: number;
  item_code: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  quantity: number;
  reorder_level: number;
  cost: number | null;
  selling_price: number | null;
  supplier: string | null;
}

const dash = (v: unknown) => (v == null || v === '' ? '—' : String(v));
const fmtMoney = (n: number | null) =>
  n == null ? '—' : '₱\u202f' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

interface Props { addToast: (msg: string, type: Toast['type']) => void; }

/* ── Add Item Modal ── */
function AddItemModal({
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
    const g  = (k: string) => (fd.get(k) as string | null)?.trim() || null;
    const gf = (k: string) => { const v = g(k); return v ? parseFloat(v) : null; };
    const gi = (k: string) => { const v = g(k); return v ? parseInt(v) : null; };

    const payload = {
      brand:         g('brand'),
      model:         g('model'),
      category:      g('category'),
      supplier:      g('supplier'),
      cost:          gf('cost'),
      selling_price: gf('selling_price'),
      quantity:      gi('quantity') ?? 0,
      reorder_level: gi('reorder_level') ?? 5,
    };

    setSaving(true);
    try {
      const res = await apiFetch<{ item_code: string }>('/inventory/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      addToast(`Item ${res.item_code} added to inventory.`, 'success');
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
            <div className="modal-head-title" id="inv-modal-title">Add Inventory Item</div>
            <div className="modal-head-sub">Register a new product or frame</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>

        <form onSubmit={handle}>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="inv_brand">Brand</label>
                <input id="inv_brand" name="brand" className="form-input" autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="inv_model">Model</label>
                <input id="inv_model" name="model" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="inv_cat">Category</label>
                <input id="inv_cat" name="category" className="form-input" placeholder="Frames, Lenses, Contact…" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="inv_supplier">Supplier</label>
                <input id="inv_supplier" name="supplier" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="inv_cost">Cost (₱)</label>
                <input id="inv_cost" name="cost" type="number" min="0" step="0.01" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="inv_price">Selling Price (₱)</label>
                <input id="inv_price" name="selling_price" type="number" min="0" step="0.01" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="inv_qty">Quantity</label>
                <input id="inv_qty" name="quantity" type="number" min="0" className="form-input" defaultValue={0} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="inv_reorder">Reorder Level</label>
                <input id="inv_reorder" name="reorder_level" type="number" min="0" className="form-input" defaultValue={5} />
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Restock Modal ── */
function RestockModal({
  item,
  onClose,
  onRestocked,
  addToast,
}: {
  item: InventoryItem;
  onClose: () => void;
  onRestocked: () => void;
  addToast: Props['addToast'];
}) {
  const [qty, setQty]     = useState(1);
  const [saving, setSaving] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qty < 1) { addToast('Enter a quantity greater than 0.', 'error'); return; }
    setSaving(true);
    try {
      await apiFetch(`/inventory/${item.item_code}?quantity=${qty}`, { method: 'PUT' });
      addToast(`Added ${qty} unit(s) to ${item.item_code}.`, 'success');
      onRestocked();
    } catch (err: any) {
      addToast('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-head">
          <div>
            <div className="modal-head-title">Restock Item</div>
            <div className="modal-head-sub">{item.item_code} — current qty: {item.quantity}</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <form onSubmit={handle}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="restock_qty">Units to Add</label>
              <input
                id="restock_qty"
                type="number"
                min={1}
                className="form-input"
                value={qty}
                onChange={e => setQty(parseInt(e.target.value) || 1)}
                autoFocus
              />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Inventory({ addToast }: Props) {
  const [items, setItems]     = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [restock, setRestock] = useState<InventoryItem | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<InventoryItem[]>('/inventory/');
      setItems(data);
    } catch (e: any) {
      addToast('Failed to load inventory: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const q = search.toLowerCase();
  const filtered = items.filter(i =>
    !q ||
    (i.brand ?? '').toLowerCase().includes(q) ||
    (i.model ?? '').toLowerCase().includes(q) ||
    i.item_code.toLowerCase().includes(q) ||
    (i.category ?? '').toLowerCase().includes(q)
  );

  const lowCount = items.filter(i => i.quantity <= i.reorder_level).length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus /> Add Item
        </button>
      </div>

      {lowCount > 0 && !loading && (
        <div className="alert alert-amber">
          <AlertTriangle aria-hidden="true" />
          <span>
            <strong>{lowCount} item{lowCount > 1 ? 's' : ''}</strong> at or below reorder level.
          </span>
        </div>
      )}

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box">
              <Search aria-hidden="true" />
              <input
                className="search-input"
                placeholder="Search items…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search inventory"
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
              {!loading && `${filtered.length} of ${items.length}`}
            </span>
          </div>
        </div>

        <div className="table-scroll">
          {loading ? (
            <div className="state-box"><div className="spinner" /><p>Loading inventory…</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Brand / Model</th>
                  <th>Supplier</th>
                  <th>Qty</th>
                  <th>Reorder</th>
                  <th>Cost</th>
                  <th>Price</th>
                  <th style={{ width: 1 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={9}>
                      {items.length === 0 ? 'No items in inventory yet.' : 'No items match your search.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(item => {
                    const isLow = item.quantity <= item.reorder_level;
                    return (
                      <tr key={item.id}>
                        <td><span className="badge badge-gray">{item.item_code}</span></td>
                        <td style={{ color: 'var(--muted)' }}>{dash(item.category)}</td>
                        <td style={{ fontWeight: 500 }}>
                          {[item.brand, item.model].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{dash(item.supplier)}</td>
                        <td>
                          {isLow
                            ? <span className="badge badge-red">{item.quantity}</span>
                            : item.quantity
                          }
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{item.reorder_level}</td>
                        <td style={{ color: 'var(--muted)' }}>{fmtMoney(item.cost)}</td>
                        <td style={{ fontWeight: 500 }}>{fmtMoney(item.selling_price)}</td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setRestock(item)}
                            title="Add stock"
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <AddItemModal
          addToast={addToast}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}

      {restock && (
        <RestockModal
          item={restock}
          addToast={addToast}
          onClose={() => setRestock(null)}
          onRestocked={() => { setRestock(null); load(); }}
        />
      )}
    </>
  );
}
