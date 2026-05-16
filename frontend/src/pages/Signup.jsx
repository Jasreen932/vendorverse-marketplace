import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Signup() {
  const [role, setRole] = useState('Buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const navigate = useNavigate();
  const { sendOTP, verifyOTP } = useAuth();

  const privacyText = `
    Your privacy is important to us.
    1. Data Collection: We collect your name, email, and password to provide account access.
    2. Usage: Your information is used for authentication, order processing, and seller metrics.
    3. Security: We use modern encryption and secure SMTP for your protection.
    4. Disclosure: We do not sell or trade your personal information to third parties.
    5. Cookies: We use local storage to keep you logged in and maintain your shopping cart.
  `;

  const termsText = `
    Welcome to VendorVerse! By using our platform, you agree to:
    1. Accuracy: You must provide truthful and accurate registration details.
    2. Prohibited Items: You will not list or sell illegal, stolen, or counterfeit goods.
    3. Payments: Buyers agree to pay for orders in full. Sellers agree to platform commission fees.
    4. Conduct: Harassment or fraudulent behavior towards other users is strictly prohibited.
    5. Privacy: Your data will be managed as per our Privacy Policy to ensure security.
    6. Termination: We reserve the right to suspend any account violating these terms.
  `;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please enter your name, email, and password.');
      return;
    }
    if (!acceptedTerms) {
      alert('You must accept the Terms and Conditions to proceed.');
      return;
    }
    setLoading(true);
    try {
      await sendOTP(email, 'register', password, role);
      setOtpSent(true);
      alert('OTP sent to your email!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert('Please enter the OTP.');
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(email, otp, role, name, password);
      alert(`Account created successfully as ${role}! 🎉 Welcome to VendorVerse.`);
      navigate('/');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ marginTop: '20px' }}>
        
        {/* Brand Header */}
        <div className="auth-header-inside">
          <Link to="/" className="auth-brand" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#2563EB" />
              <path d="M7 9.5L12 14.5L17 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="auth-brand-text">Vendor<span>Verse</span></span>
          </Link>
          <h1 className="auth-title-inside">Create Your Account</h1>
          <p className="auth-sub-inside">Join the VendorVerse marketplace today.</p>
        </div>

        {/* Role Switcher */}
        <div className="auth-tabs">
          {['Buyer', 'Seller'].map((r) => (
            <button
              key={r}
              className={`auth-tab ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={otpSent ? handleSignup : handleSendOTP} className="auth-form">
          <div className="form-group">
            <label className="auth-label">Full Name</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={otpSent}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={otpSent}
              />
            </div>
          </div>

          {otpSent ? (
            <div className="form-group">
              <label className="auth-label">Enter 6-Digit OTP</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength="6"
                />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="auth-label">Password</label>
              <div className="input-with-icon">
                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group checkbox-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="terms" 
              checked={acceptedTerms} 
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-light)', cursor: 'pointer' }}>
              I agree to the <span style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'underline' }} onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>Terms and Conditions</span> and <span style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'underline' }} onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>Privacy Policy</span>
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading || !acceptedTerms}>
            {loading ? 'Processing...' : otpSent ? 'Verify & Create Account' : 'Send OTP to Register'}
          </button>
        </form>

        {/* Terms Modal */}
        {showTerms && (
          <div className="modal-overlay" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div className="modal-card" style={{
              background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Terms and Conditions</h2>
              <div style={{ 
                maxHeight: '300px', overflowY: 'auto', marginBottom: '24px', 
                whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6 
              }}>
                {termsText}
              </div>
              <button 
                className="auth-submit-btn" 
                onClick={() => setShowTerms(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacy && (
          <div className="modal-overlay" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div className="modal-card" style={{
              background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Privacy Policy</h2>
              <div style={{ 
                maxHeight: '300px', overflowY: 'auto', marginBottom: '24px', 
                whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6 
              }}>
                {privacyText}
              </div>
              <button 
                className="auth-submit-btn" 
                onClick={() => setShowPrivacy(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Social Login */}
        <div className="social-grid">
          <button className="social-btn" onClick={() => alert('Social Login is Coming Soon! 🚀')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" color="#EA4335"><path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.495 0 2.86.55 3.91 1.46l2.35-2.35C16.85 3.515 14.71 2.665 12.24 2.665 7.08 2.665 2.9 6.845 2.9 12s4.18 9.335 9.34 9.335c5.38 0 8.94-3.78 8.94-9.095 0-.615-.055-1.205-.16-1.955H12.24z"/></svg>
            Google
          </button>
          <button className="social-btn" onClick={() => alert('SSO Authentication is Coming Soon! 🔐')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
            SSO
          </button>
        </div>

        <div className="auth-footer-link-inside">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
