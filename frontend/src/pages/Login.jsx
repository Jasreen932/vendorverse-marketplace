import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import logoImg from '../assets/hero.png';

export default function Login() {
  const [role, setRole] = useState('Buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithPassword, user } = useAuth();

  // Pre-select role if navigated from landing page CTA
  useEffect(() => {
    if (location.state?.preRole) {
      setRole(location.state.preRole);
    }
  }, [location.state]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Seller') navigate('/dashboard');
      else if (user.role === 'Admin') navigate('/admin');
      else navigate('/home');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginWithPassword(email, password, role);
      // The user useEffect will handle redirection once AuthContext updates
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleSubtitles = {
    Buyer: 'Shop your favorite vendors.',
    Seller: 'Manage your store and inventory.',
    Admin: 'Platform administration portal.',
  };

  const roleColors = { Buyer: '#2563EB', Seller: '#7C3AED', Admin: '#0F172A' };

  return (
    <div className="auth-page">
      <div className="auth-header-top">
        <Link to="/" className="auth-brand">
          <img src={logoImg} alt="VendorVerse" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span className="auth-brand-text">Vendor<span>Verse</span></span>
        </Link>
        <h1 className="auth-page-title">Welcome Back</h1>
      </div>

      <div className="auth-card">
        {/* Role Switcher */}
        <div className="auth-tabs">
          {['Buyer', 'Seller', 'Admin'].map((r) => (
            <button
              key={r}
              className={`auth-tab ${role === r ? 'active' : ''}`}
              style={role === r ? { background: roleColors[r], borderColor: roleColors[r] } : {}}
              onClick={() => setRole(r)}
            >
              {r === 'Buyer' && '🛍️ '}
              {r === 'Seller' && '🏪 '}
              {r === 'Admin' && '⚙️ '}
              {r}
            </button>
          ))}
        </div>

        <p className="auth-subtitle">{roleSubtitles[role]}</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <div className="password-label-row">
              <label className="auth-label">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            style={{ background: roleColors[role] }}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Sign In as ${role}`}
          </button>
        </form>

        <div className="auth-divider"><span>OR CONTINUE WITH</span></div>

        <div className="social-grid">
          <button className="social-btn" onClick={() => alert('Signing in with Google...')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" color="#EA4335"><path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.495 0 2.86.55 3.91 1.46l2.35-2.35C16.85 3.515 14.71 2.665 12.24 2.665 7.08 2.665 2.9 6.845 2.9 12s4.18 9.335 9.34 9.335c5.38 0 8.94-3.78 8.94-9.095 0-.615-.055-1.205-.16-1.955H12.24z"/></svg>
            Google
          </button>
          <button className="social-btn" onClick={() => alert('Signing in with SSO...')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
            SSO
          </button>
        </div>
      </div>

      <div className="auth-footer-link">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}
