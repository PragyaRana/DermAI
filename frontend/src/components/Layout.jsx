import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path:'/dashboard', label:'Dashboard',  icon:'⊞' },
  { path:'/scan',      label:'New Scan',   icon:'◎' },
  { path:'/history',   label:'History',    icon:'◷' },
  { path:'/profile',   label:'Profile',    icon:'◉' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="layout">
      {/* ── Sidebar ───────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="dot" />
          <span>DermAI</span>
        </div>

        <nav>
          {NAV.map(({ path, label, icon }) => (
            <button key={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 8 }}>
            <span>⎋</span> Log out
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
