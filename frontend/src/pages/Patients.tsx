import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPatients = () => {
    setLoading(true);
    fetch('http://localhost:8000/patients/')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filtered = patients.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.patient_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2>Patients</h2>
        <button className="btn btn-primary">
          <Plus size={16} /> Add Patient
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2">
          <Search size={18} color="var(--bautro-text-muted)" />
          <input 
            type="text" 
            placeholder="Search patients by name or ID..." 
            className="form-input" 
            style={{ maxWidth: '300px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Contact</th>
                <th>Age / Sex</th>
                <th>Date Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="badge">{p.patient_number}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.full_name}</td>
                  <td>{p.contact_number || '—'}</td>
                  <td>{p.age ? `${p.age} / ${p.sex || '-'}` : '—'}</td>
                  <td>{p.date_created}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--bautro-text-muted)' }}>
                    No patients found.
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
