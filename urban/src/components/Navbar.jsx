import { Droplets, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  // Read username saved to localStorage during login
  const username = localStorage.getItem('username') || 'User';
  const userId = localStorage.getItem('userId');

  // Generate initials from username (e.g. "johndoe" → "J", "John Doe" → "JD")
  const initials = username
    .split(' ')
    .map(word => word[0]?.toUpperCase())
    .join('')
    .slice(0, 2) || 'U';

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">
          <Droplets size={20} />
        </div>
        <div className="navbar-brand-text">
          <h1>Urban Drainage Network</h1>
          <span>Maintenance &amp; Clearance Tracking Portal</span>
        </div>
      </div>

      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/requests" className={({ isActive }) => isActive ? 'active' : ''}>My Requests</NavLink>
        <NavLink to="/notification" className={({ isActive }) => isActive ? 'active' : ''}>Notification</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact Us</NavLink>
      </div>

      <div className="navbar-user">
        <div className="navbar-user-info">
          <div className="name">{username}</div>
          <div className="role">User ID: {userId}</div>
        </div>
        <div className="navbar-avatar">{initials}</div>
        <button
          onClick={handleLogout}
          title="Logout"
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', color: 'inherit' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
