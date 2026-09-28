import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../api';
import type { Toast } from '../hooks/useToast';

interface DashboardData {
  total_patients: number;
  total_prescriptions: number;
  total_inventory_items: number;
  today_revenue: number;
  total_revenue: number;
  low_stock_count: number;
  low_stock_items: Array<{
    id: number;
    item_code: string;
    brand: string | null;
    model: string | null;
    quantity: number;
    reorder_level: number;
  }>;
}

const fmtMoney = (n: number) =>
  '₱\u202f' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

interface Props { addToast: (msg: string, type: Toast['type']) => void; }

export default function Dashboard({ addToast }: Props) {
  const [data, setData]     = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const d = await apiFetch<DashboardData>('/dashboard/');
      setData(d);
    } catch (e: any) {
      addToast('Could not load dashboard: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="state-box">
        <p>Could not load dashboard. Is the backend running?</p>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw /> Retry
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Patients',    value: data.total_patients,        sub: 'registered' },
    { label: 'Prescriptions',     value: data.total_prescriptions,   sub: 'on record' },
    { label: 'Inventory Items',   value: data.total_inventory_items, sub: 'catalogued' },
    { label: "Today's Revenue",   value: fmtMoney(data.today_revenue),   sub: 'collected today',    mono: true },
    { label: 'Total Revenue',     value: fmtMoney(data.total_revenue),   sub: 'all-time',           mono: true },
    { label: 'Low-Stock Items',   value: data.low_stock_count,           sub: 'at or below reorder' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <button className="btn btn-secondary btn-sm" onClick={load} title="Refresh">
          <RefreshCw /> Refresh
        </button>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div
              className="stat-card-value"
              style={s.mono ? { fontSize: 20, fontWeight: 600, letterSpacing: '-0.5px' } : undefined}
            >
              {s.value}
            </div>
            <div className="stat-card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {data.low_stock_count > 0 && (
        <>
          <div className="alert alert-amber">
            <AlertTriangle aria-hidden="true" />
            <span>
              <strong>{data.low_stock_count} item{data.low_stock_count > 1 ? 's are' : ' is'}</strong>{' '}
              at or below reorder level — visit Inventory to restock.
            </span>
          </div>

          <div className="table-wrap">
            <div className="table-toolbar">
              <span style={{ fontWeight: 600, fontSize: 13 }}>Low-Stock Items</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Qty</th>
                    <th>Reorder Level</th>
                  </tr>
                </thead>
                <tbody>
                  {data.low_stock_items.map(item => (
                    <tr key={item.id}>
                      <td><span className="badge badge-gray">{item.item_code}</span></td>
                      <td>{item.brand ?? '—'}</td>
                      <td>{item.model ?? '—'}</td>
                      <td><span className="badge badge-red">{item.quantity}</span></td>
                      <td>{item.reorder_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
