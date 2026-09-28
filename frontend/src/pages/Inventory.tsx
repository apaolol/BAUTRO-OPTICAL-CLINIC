import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/inventory/')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2>Inventory</h2>
        <button className="btn btn-primary">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td><span className="badge">{i.item_code}</span></td>
                  <td>{i.category || '—'}</td>
                  <td style={{ fontWeight: 500 }}>{i.brand}</td>
                  <td>{i.model}</td>
                  <td>
                    {i.quantity <= i.reorder_level ? (
                      <span className="badge" style={{ backgroundColor: '#fca5a5', color: '#7f1d1d' }}>{i.quantity}</span>
                    ) : (
                      <span>{i.quantity}</span>
                    )}
                  </td>
                  <td>₱ {i.selling_price?.toFixed(2)}</td>
                  <td>{i.supplier || '—'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--bautro-text-muted)' }}>
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
