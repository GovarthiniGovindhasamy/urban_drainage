import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';
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

    // Intercept Admin Login credentials from the User Portal
    if (email === 'admin@example.com' && password === 'admin@1234') {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', email);
      navigate('/admin/dashboard');
      setLoading(false);
      return;
    }

    try {
      const endpoint = role === 'Worker' ? `${API_BASE}/api/worker/login` : `${API_BASE}/api/login`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        if (role === 'Worker') {
          localStorage.setItem('workerId', data.workerId);
          localStorage.setItem('workerName', data.name);
          localStorage.setItem('workerPhone', data.phone);
          navigate('/worker/dashboard');
        } else {
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('username', data.username);
          navigate('/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
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
