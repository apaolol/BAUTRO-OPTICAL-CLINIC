import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  CreditCard,
} from 'lucide-react';
import { useToast } from './hooks/useToast';
import { ToastStack } from './components/ToastStack';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Prescriptions from './pages/Prescriptions';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard',     exact: true },
  { to: '/patients',     icon: Users,           label: 'Patients',      exact: false },
  { to: '/prescriptions',icon: FileText,        label: 'Prescriptions', exact: false },
  { to: '/inventory',    icon: Package,         label: 'Inventory',     exact: false },
  { to: '/billing',      icon: CreditCard,      label: 'Billing',       exact: false },
];

function PageTitle() {
  const loc = useLocation();
  const map: Record<string, string> = {
    '/':              'Dashboard',
    '/patients':      'Patients',
    '/prescriptions': 'Prescriptions',
    '/inventory':     'Inventory',
    '/billing':       'Billing',
  };
  return <span className="topbar-title">{map[loc.pathname] ?? 'Bautro Optical Clinic'}</span>;
}

interface LayoutProps {
  toasts: ReturnType<typeof useToast>['toasts'];
}

function AppLayout({ toasts, children }: LayoutProps & { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/brand/bautro-optical-logo.svg" alt="Bautro Optical Clinic" />
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <item.icon aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <PageTitle />
          <div className="topbar-user">
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Admin</span>
            <div className="user-avatar" aria-hidden="true">A</div>
          </div>
        </header>

        <main className="page">
          {children}
        </main>
      </div>

      <ToastStack toasts={toasts} />
    </div>
  );
}

export default function App() {
  const { toasts, addToast } = useToast();

  return (
    <Router>
      <AppLayout toasts={toasts}>
        <Routes>
          <Route path="/"              element={<Dashboard   addToast={addToast} />} />
          <Route path="/patients"      element={<Patients    addToast={addToast} />} />
          <Route path="/prescriptions" element={<Prescriptions addToast={addToast} />} />
          <Route path="/inventory"     element={<Inventory   addToast={addToast} />} />
          <Route path="/billing"       element={<Billing     addToast={addToast} />} />
          <Route path="*" element={
            <div className="state-box">
              <p>Page not found.</p>
            </div>
          } />
        </Routes>
      </AppLayout>
    </Router>
  );
}
