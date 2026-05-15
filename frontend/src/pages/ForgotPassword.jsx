import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { sendOTP, resetPassword } = useAuth();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await sendOTP(email, 'forgot');
      setOtpSent(true);
      alert('OTP sent to your email!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      alert('Please fill in both OTP and new password.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      alert('Password reset successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ marginTop: '40px' }}>
        
        {/* Brand Header */}
        <div className="auth-header-inside">
          <Link to="/" className="auth-brand" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#2563EB" />
              <path d="M7 9.5L12 14.5L17 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="auth-brand-text">Vendor<span>Verse</span></span>
          </Link>
          <h1 className="auth-title-inside">Reset Your Password</h1>
          <p className="auth-sub-inside" style={{ maxWidth: 300, margin: '0 auto' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={otpSent ? handleReset : handleSendOTP} className="auth-form" style={{ marginTop: '24px' }}>
          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <div className="input-with-icon">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={otpSent}
              />
            </div>
          </div>

          {otpSent && (
            <>
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
              <div className="form-group">
                <label className="auth-label">New Password</label>
                <div className="input-with-icon">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : otpSent ? 'Reset Password & Login' : 'Send OTP &rarr;'}
          </button>
        </form>

        <div className="auth-line-divider"></div>

        <div className="auth-back-link">
          <Link to="/login">&larr; Back to Login</Link>
        </div>

      </div>

      <div className="auth-secure-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        Secure identity verification by VendorVerse
      </div>
    </div>
  );
}
