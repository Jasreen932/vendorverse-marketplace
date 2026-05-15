import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vv_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('vv_user');
    }
    setLoading(false);
  }, []);

  const sendOTP = async (email, type = 'login', password = null, role = null) => {
    const res = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  };

  const verifyOTP = async (email, otp, role, name, password) => {
    const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, role, name, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid OTP');
    
    const userData = data.user;
    setUser(userData);
    localStorage.setItem('vv_user', JSON.stringify(userData));
    return userData;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  };

  const loginWithPassword = async (email, password, role) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    
    const userData = data.user;
    setUser(userData);
    localStorage.setItem('vv_user', JSON.stringify(userData));
    return userData;
  };

  const login = async (role, email, name) => {
    // Legacy fallback, but now we require password for real login.
    // If used without password, it might fail unless we mock it.
    // For now, let's keep it as is for backward compatibility if needed, but we shouldn't use it.
    const userData = { role, email, name: name || email.split('@')[0] };
    setUser(userData);
    localStorage.setItem('vv_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vv_user');
  };

  return (
    <AuthContext.Provider value={{ user, sendOTP, verifyOTP, resetPassword, loginWithPassword, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
