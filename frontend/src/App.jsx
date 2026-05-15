import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import Chatbot from './components/Chatbot';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider, useCart } from './CartContext';
import logoImg from './assets/hero.png';
import './index.css';

/* ─────────────────────────────────────────────────────────── */
/*  Protected Route — redirects unauthenticated users         */
/* ─────────────────────────────────────────────────────────── */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Wrong role — redirect to their correct home
    if (user.role === 'Seller') return <Navigate to="/dashboard" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}

/* ─────────────────────────────────────────────────────────── */
/*  Navbar — role-aware profile dropdown                      */
/* ─────────────────────────────────────────────────────────── */
function Navbar() {
  const [query, setQuery] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate('/');
  };

  // Role-specific dropdown items
  const roleMenuItems = () => {
    if (!user) {
      return (
        <>
          <Link to="/login" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Sign In
          </Link>
          <Link to="/signup" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
            Sign Up
          </Link>
        </>
      );
    }
    if (user.role === 'Buyer') {
      return (
        <>
          <div className="nav-dropdown-user-info">
            <div className="nav-dropdown-name">{user.name}</div>
            <div className="nav-dropdown-role-badge buyer">🛍️ Buyer</div>
          </div>
          <div className="nav-dropdown-divider" />
          <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </Link>
          <Link to="/checkout" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            My Cart
          </Link>
          <div className="nav-dropdown-divider" />
          <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </>
      );
    }
    if (user.role === 'Seller') {
      return (
        <>
          <div className="nav-dropdown-user-info">
            <div className="nav-dropdown-name">{user.name}</div>
            <div className="nav-dropdown-role-badge seller">🏪 Seller</div>
          </div>
          <div className="nav-dropdown-divider" />
          <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </Link>
          <Link to="/dashboard" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 17v-4m5 4v-6m5 6V9"/></svg>
            Seller Dashboard
          </Link>
          <div className="nav-dropdown-divider" />
          <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </>
      );
    }
    if (user.role === 'Admin') {
      return (
        <>
          <div className="nav-dropdown-user-info">
            <div className="nav-dropdown-name">{user.name}</div>
            <div className="nav-dropdown-role-badge admin">⚙️ Admin</div>
          </div>
          <div className="nav-dropdown-divider" />
          <Link to="/admin" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Admin Panel
          </Link>
          <Link to="/home" className="nav-dropdown-item" onClick={() => setDropOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            View Marketplace
          </Link>
          <div className="nav-dropdown-divider" />
          <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </>
      );
    }
  };

  return (
    <nav className="navbar glass sticky">
      <div className="container nav-inner">

        {/* Brand */}
        <Link to={user ? '/home' : '/'} className="nav-brand">
          <img src={logoImg} alt="VendorVerse" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span className="nav-brand-text">Vendor<span>Verse</span></span>
        </Link>

        {/* Links */}
        <div className="nav-links">
          <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Shop</NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Deals</NavLink>
          {!user && <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="nav-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search products, brands, sellers..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="submit" style={{ display: 'none' }}>Search</button>
        </form>

        {/* Actions */}
        <div className="nav-actions">
          {/* Cart — only for buyers or guests */}
          {(!user || user.role === 'Buyer') && (
            <Link to="/checkout" className="nav-icon-btn" title="Cart" style={{ position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: -5, 
                  right: -5, 
                  background: 'var(--red)', 
                  color: 'white', 
                  fontSize: '10px', 
                  fontWeight: 800, 
                  padding: '2px 5px', 
                  borderRadius: '10px',
                  minWidth: '15px',
                  textAlign: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Profile Dropdown */}
          <div className="nav-profile-container" style={{ position: 'relative' }}>
            <button
              className="nav-icon-btn nav-profile-trigger"
              onClick={() => setDropOpen(!dropOpen)}
              title="Account"
              style={user ? { background: 'var(--blue)', color: '#fff', border: 'none' } : {}}
            >
              {user ? (
                <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{(user.name || 'U')[0].toUpperCase()}</span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
            </button>

            {dropOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setDropOpen(false)} />
                <div className="nav-profile-dropdown" style={{ display: 'flex', flexDirection: 'column' }}>
                  {roleMenuItems()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  App Shell                                                 */
/* ─────────────────────────────────────────────────────────── */
import { useLocation as useAppLocation } from 'react-router-dom';

function AppShell() {
  const { user } = useAuth();
  const location = useAppLocation();
  const hideNavbar = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  return (
    <div className={user?.role === 'Seller' ? 'theme-seller' : ''} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideNavbar && <Navbar />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={user?.role === 'Seller' ? <Navigate to="/dashboard" replace /> : <Home />} />
          <Route path="/search" element={user?.role === 'Seller' ? <Navigate to="/dashboard" replace /> : <SearchPage />} />
          <Route path="/product/:id" element={user?.role === 'Seller' ? <Navigate to="/dashboard" replace /> : <ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/checkout" element={user?.role === 'Seller' ? <Navigate to="/dashboard" replace /> : <Checkout />} />

          {/* Protected by role */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['Buyer', 'Seller']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['Seller']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
