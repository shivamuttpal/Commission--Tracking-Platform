import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sidebarConfig = {
  brand: [
    { path: '/brand/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/brand/products', label: 'Products', icon: '📦' },
    { path: '/brand/applications', label: 'Applications', icon: '📋' },
  ],
  creator: [
    { path: '/creator/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/creator/products', label: 'Browse Products', icon: '🛍️' },
    { path: '/creator/links', label: 'Referral Links', icon: '🔗' },
    { path: '/creator/wallet', label: 'Wallet', icon: '💰' },
    { path: '/creator/payouts', label: 'Payouts', icon: '💸' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/payouts', label: 'Manage Payouts', icon: '💸' },
    { path: '/admin/brands', label: 'Brands', icon: '🏢' },
    { path: '/admin/creators', label: 'Creators', icon: '👤' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links = sidebarConfig[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">P</div>
        <h1>PopCom</h1>
      </div>

      <div className="sidebar-role">{user.role} panel</div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
