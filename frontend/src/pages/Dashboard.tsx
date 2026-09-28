import { useState, useEffect } from 'react';
import { Package, Users, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/dashboard/')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Error loading dashboard.</div>;

  return (
    <div>
      <h2 className="mb-6">Dashboard Overview</h2>
      
      <div className="stat-grid">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="stat-card-title">Total Patients</h3>
            <Users size={20} color="var(--bautro-text-muted)" />
          </div>
          <div className="stat-card-value">{data.total_patients}</div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="stat-card-title">Prescriptions</h3>
            <FileText size={20} color="var(--bautro-text-muted)" />
          </div>
          <div className="stat-card-value">{data.total_prescriptions}</div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="stat-card-title">Inventory Items</h3>
            <Package size={20} color="var(--bautro-text-muted)" />
          </div>
          <div className="stat-card-value">{data.total_inventory_items}</div>
        </div>
        
        <div className="stat-card" style={{ backgroundColor: 'var(--bautro-bg)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="stat-card-title">Total Revenue</h3>
            <TrendingUp size={20} color="var(--bautro-text-muted)" />
          </div>
          <div className="stat-card-value">₱ {data.total_revenue.toFixed(2)}</div>
        </div>
      </div>

      {data.low_stock_count > 0 && (
        <div className="card mb-6" style={{ borderColor: '#fcd34d', backgroundColor: '#fef3c7' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle color="#d97706" />
            <h3 style={{ color: '#b45309' }}>Low Stock Alert ({data.low_stock_count} Items)</h3>
          </div>
          <div className="table-container">
            <table className="table">
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
                {data.low_stock_items.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.item_code}</td>
                    <td>{item.brand}</td>
                    <td>{item.model}</td>
                    <td><span className="badge" style={{ backgroundColor: '#fca5a5', color: '#7f1d1d' }}>{item.quantity}</span></td>
                    <td>{item.reorder_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
