import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DUMMY_USERS, DUMMY_WORKERS } from '../dummyData';
import {
  Droplets,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('User');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Simulate a small delay for realism
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Admin login
    if (email === 'admin@example.com' && password === 'admin@1234') {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', email);
      setLoading(false);
      navigate('/admin/dashboard');
      return;
    }

    // Worker login
    if (role === 'Worker') {
      const worker = DUMMY_WORKERS.find(
        (w) => w.email === email && w.password === password
      );
      if (worker) {
        localStorage.setItem('workerId', worker.worker_id);
        localStorage.setItem('workerName', worker.name);
        localStorage.setItem('workerPhone', worker.phone);
        setLoading(false);
        navigate('/worker/dashboard');
      } else {
        setError('Invalid credentials. Try worker@example.com / worker1234');
        setLoading(false);
      }
      return;
    }

    // User login
    const user = DUMMY_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      localStorage.setItem('userId', user.userId);
      localStorage.setItem('username', user.username);
      setLoading(false);
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Try user@example.com / user1234');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative background elements */}
      <div className="auth-bg-shape auth-bg-shape-1"></div>
      <div className="auth-bg-shape auth-bg-shape-2"></div>
      <div className="auth-bg-shape auth-bg-shape-3"></div>

      <div className="auth-container">
        {/* Left Panel - Branding */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-icon">
              <Droplets size={36} />
            </div>
            <h1>Urban Drainage<br />Network</h1>
            <p className="auth-brand-tagline">
              Maintenance &amp; Clearance Tracking Portal
            </p>
            <div className="auth-brand-features">
              <div className="auth-feature">
                <div className="auth-feature-dot"></div>
                <span>Real-time GPS-based issue reporting</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-dot"></div>
                <span>Track maintenance request status</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-dot"></div>
                <span>Zone-wise clearance management</span>
              </div>
            </div>

            {/* Demo credentials hint */}
            <div style={{ marginTop: '28px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
              <strong style={{ color: '#fff' }}>Demo Credentials</strong><br />
              👤 User: <code style={{ color: '#93c5fd' }}>user@example.com</code> / <code style={{ color: '#93c5fd' }}>user1234</code><br />
              🔧 Worker: <code style={{ color: '#6ee7b7' }}>worker@example.com</code> / <code style={{ color: '#6ee7b7' }}>worker1234</code><br />
              🛡️ Admin: <code style={{ color: '#fca5a5' }}>admin@example.com</code> / <code style={{ color: '#fca5a5' }}>admin@1234</code>
            </div>
          </div>

        </div>

        {/* Right Panel - Form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('User')}
                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: role === 'User' ? '#fff' : 'transparent', fontWeight: role === 'User' ? 600 : 400, boxShadow: role === 'User' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: '#1f2937' }}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setRole('Worker')}
                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: role === 'Worker' ? '#fff' : 'transparent', fontWeight: role === 'Worker' ? 600 : 400, boxShadow: role === 'Worker' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: '#1f2937' }}
              >
                Worker
              </button>
            </div>

            {error && (
              <div className="auth-error">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>
                  <a href="#" className="auth-forgot-link">Forgot password?</a>
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-remember">
                <label className="auth-checkbox-label">
                  <input type="checkbox" />
                  <span className="auth-checkmark"></span>
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-spinner"></span>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register">
                Create account <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
