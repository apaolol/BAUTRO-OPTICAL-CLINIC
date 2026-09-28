import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, ClipboardPlus, Package, Calculator, Wallet, BarChart3 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Inventory from './pages/Inventory';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/brand/bautro-optical-logo.svg" alt="Bautro Optical Clinic" />
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/patients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={18} /> Patients
          </NavLink>
          <NavLink to="/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Calendar size={18} /> Appointments
          </NavLink>
          <NavLink to="/clinical-records" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ClipboardPlus size={18} /> Clinical Records
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Package size={18} /> Inventory
          </NavLink>
          <NavLink to="/sales" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Calculator size={18} /> Sales / POS
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Wallet size={18} /> Expenses
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} /> Reports
          </NavLink>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="topbar">
          <h2 style={{ fontSize: '18px', fontWeight: 500 }}>Clinic Management System</h2>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '13px', color: 'var(--bautro-text-muted)' }}>Admin User</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bautro-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>A</div>
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="*" element={<div className="card"><h2>Module in Development</h2><p>This module is currently being built.</p></div>} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
