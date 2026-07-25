import { useState } from 'react';
import { Droplets, LogOut, Menu, X, LayoutDashboard, FileText, Bell, Phone } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const username = localStorage.getItem('username') || 'User';
  const userId = localStorage.getItem('userId');

  const initials = username
    .split(' ')
    .map(word => word[0]?.toUpperCase())
    .join('')
    .slice(0, 2) || 'U';

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/requests', label: 'My Requests', icon: <FileText size={18} /> },
    { to: '/notification', label: 'Notification', icon: <Bell size={18} /> },
    { to: '/contact', label: 'Contact Us', icon: <Phone size={18} /> },
  ];

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-brand-icon">
            <Droplets size={20} />
          </div>
          <div className="navbar-brand-text">
            <h1>Urban Drainage Network</h1>
            <span>Maintenance &amp; Clearance Tracking Portal</span>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="navbar-links">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side: user info + hamburger */}
        <div className="navbar-user">
          <div className="navbar-user-info navbar-user-info--desktop">
            <div className="name">{username}</div>
            <div className="role">User ID: {userId}</div>
          </div>
          <div className="navbar-avatar">{initials}</div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="navbar-logout-btn navbar-logout-btn--desktop"
          >
            <LogOut size={18} />
          </button>

          {/* Hamburger — only on mobile */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Slide-in Drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'mobile-drawer--open' : ''}`}>
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="navbar-avatar" style={{ background: 'rgba(255,255,255,0.25)' }}>{initials}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{username}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.75 }}>User ID: {userId}</div>
            </div>
          </div>
          <button className="mobile-drawer-close" onClick={() => setMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="mobile-drawer-nav">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `mobile-drawer-link ${isActive ? 'mobile-drawer-link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="mobile-drawer-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Drawer Logout */}
        <button className="mobile-drawer-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );
}
