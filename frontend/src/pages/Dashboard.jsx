import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useAuth } from '../AuthContext';
import './seller.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Public Profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    storeName: '',
    storeBio: '',
    storeUrl: '',
    social: { instagram: '', twitter: '', facebook: '' },
    businessInfo: { legalName: '', taxId: '', address: '' },
    phone: '',
    email: user?.email || '',
    financial: { availableBalance: 0, pendingPayouts: 0, methods: [], history: [] },
    alerts: []
  });

  const [newProduct, setNewProduct] = useState({ title: '', price: '', image: '', description: '' });

  const fetchProfile = () => {
    if (!user?.email) return setLoading(false);
    fetch(`${API_BASE_URL}/api/profile?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setProfile({
            storeName: data.user.storeName || '',
            storeBio: data.user.storeBio || '',
            storeUrl: data.user.storeUrl || '',
            social: data.user.social || { instagram: '', twitter: '', facebook: '' },
            businessInfo: data.user.businessInfo || { legalName: '', taxId: '', address: '' },
            phone: data.user.phone || '',
            email: data.user.email || user.email,
            financial: data.user.financial || { availableBalance: 0, pendingPayouts: 0, methods: [], history: [] },
            alerts: data.user.alerts || []
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const requestPayout = async () => {
    const amount = prompt(`Available balance: ₹${profile.financial.availableBalance.toLocaleString('en-IN')}\nEnter amount to withdraw:`);
    if (!amount) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/payout/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, amount })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      alert('Payout requested successfully!');
      fetchProfile();
    } catch (err) {
      alert(err.message);
    }
  };

  const markRead = async (alertId = null, markAll = false) => {
    try {
      await fetch(`${API_BASE_URL}/api/seller/notifications/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, alertId, markAll })
      });
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field, value, subfield = null) => {
    if (subfield) {
      setProfile(prev => ({
        ...prev,
        [field]: { ...prev[field], [subfield]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/seller/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...profile })
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Changes saved successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProduct, vendor: profile.storeName || user.name })
      });
      if (!res.ok) throw new Error('Failed to add product');
      alert('Product added successfully to marketplace!');
      setNewProduct({ title: '', price: '', image: '', description: '' });
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Log out of Seller Center?')) {
      logout();
      navigate('/');
    }
  };

  const profileStrength = () => {
    let score = 0;
    if (profile.storeName) score += 20;
    if (profile.storeBio) score += 20;
    if (profile.storeUrl) score += 10;
    if (profile.businessInfo.legalName) score += 20;
    if (profile.businessInfo.taxId) score += 15;
    if (profile.phone) score += 15;
    return score;
  };

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}>Loading Seller Center...</div>;

  return (
    <div className="sc-layout">
      {/* Sidebar */}
      <aside className="sc-sidebar">
        <div className="sc-brand">
          <h2>Seller Center</h2>
          <p>Managing Global Sales</p>
        </div>

        <div className="sc-user-info">
          <div className="sc-avatar">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Avatar" />
          </div>
          <div className="sc-user-details">
            <div className="sc-name">{user?.name || 'Seller'}</div>
            <div className="sc-role">Premium Seller</div>
          </div>
        </div>

        <nav className="sc-nav">
          {['Public Profile', 'Inventory', 'Account Settings', 'Payouts', 'Notifications'].map(tab => (
            <button
              key={tab}
              className={`sc-nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Public Profile' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>}
              {tab === 'Inventory' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
              {tab === 'Account Settings' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
              {tab === 'Payouts' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
              {tab === 'Notifications' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
              {tab}
            </button>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '20px 0' }}>
           <button className="sc-logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="sc-main">
        <div className="sc-content-wrapper">
          
          {/* Banner Section (Persistent across Profile and Settings) */}
          {(activeTab === 'Public Profile' || activeTab === 'Account Settings') && (
            <div className="sc-header-container">
              <div className="sc-banner-section">
                <img src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80" alt="Banner" className="sc-banner-img" />
                <div className="sc-profile-overlap">
                  <div className="sc-store-logo">
                    <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=150&q=80" alt="Store Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                </div>
              </div>
              <div className="sc-store-title-bar">
                <div className="sc-store-title">
                  <h1>{profile.storeName || 'Your Store Name'} <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563EB" stroke="#fff" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></h1>
                  <p>{profile.storeBio || 'Electronics & Gadgets Specialist'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Public Profile' && (
            <>
              {/* Content Grid */}
              <div className="sc-grid">
              
              {/* Left Column */}
              <div className="sc-col-main">
                
                {/* Store Details */}
                <div className="sc-card">
                  <h3 className="sc-card-title">Store Details</h3>
                  
                  <div className="sc-form-group">
                    <label>Store Name</label>
                    <input type="text" value={profile.storeName} onChange={(e) => handleChange('storeName', e.target.value)} placeholder="e.g. Aura Electronics" />
                  </div>
                  
                  <div className="sc-form-group">
                    <label>Store Description (Bio)</label>
                    <textarea value={profile.storeBio} onChange={(e) => handleChange('storeBio', e.target.value)} placeholder="Tell customers about your brand..." rows="4"></textarea>
                  </div>
                  
                  <div className="sc-form-group">
                    <label>Store URL</label>
                    <div className="sc-input-addon">
                      <span className="sc-addon">vendorverse.com/</span>
                      <input type="text" value={profile.storeUrl} onChange={(e) => handleChange('storeUrl', e.target.value)} placeholder="aura-electronics" />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="sc-card mt-6">
                  <h3 className="sc-card-title">Business Information</h3>
                  
                  <div className="sc-form-row">
                    <div className="sc-form-group half">
                      <label>Legal Business Name</label>
                      <input type="text" value={profile.businessInfo.legalName} onChange={(e) => handleChange('businessInfo', e.target.value, 'legalName')} placeholder="Aura Systems LLC" />
                    </div>
                    <div className="sc-form-group half">
                      <label>Tax ID / VAT Number</label>
                      <input type="text" value={profile.businessInfo.taxId} onChange={(e) => handleChange('businessInfo', e.target.value, 'taxId')} placeholder="US-998877665" />
                    </div>
                  </div>
                  
                  <div className="sc-form-group">
                    <label>Business Address</label>
                    <input type="text" value={profile.businessInfo.address} onChange={(e) => handleChange('businessInfo', e.target.value, 'address')} placeholder="123 Innovation Drive, Silicon Valley, CA 94025" />
                  </div>
                  
                  <h3 className="sc-card-title mt-6">Contact Information</h3>
                  
                  <div className="sc-form-row">
                    <div className="sc-form-group half">
                      <label>Email Address</label>
                      <div className="sc-input-verified">
                        <input type="email" value={profile.email} disabled />
                        <span className="sc-verified-badge">VERIFIED</span>
                      </div>
                    </div>
                    <div className="sc-form-group half">
                      <label>Phone Number</label>
                      <input type="text" value={profile.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+1 (555) 012-3456" />
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Right Column */}
              <div className="sc-col-side">
                
                {/* Social Presence */}
                <div className="sc-card">
                  <h3 className="sc-card-title">Social Presence</h3>
                  
                  <div className="sc-social-input">
                    <div className="sc-social-icon">📷</div>
                    <input type="text" placeholder="Instagram Username" value={profile.social.instagram} onChange={(e) => handleChange('social', e.target.value, 'instagram')} />
                  </div>
                  
                  <div className="sc-social-input">
                    <div className="sc-social-icon">🐦</div>
                    <input type="text" placeholder="Twitter / X Handle" value={profile.social.twitter} onChange={(e) => handleChange('social', e.target.value, 'twitter')} />
                  </div>
                  
                  <div className="sc-social-input">
                    <div className="sc-social-icon">📘</div>
                    <input type="text" placeholder="Facebook Page URL" value={profile.social.facebook} onChange={(e) => handleChange('social', e.target.value, 'facebook')} />
                  </div>
                </div>

                {/* Profile Strength */}
                <div className="sc-strength-card mt-6">
                  <div className="sc-strength-header">
                    <span>Profile Strength</span>
                    <span>{profileStrength()}%</span>
                  </div>
                  <div className="sc-strength-bar-bg">
                    <div className="sc-strength-bar-fill" style={{ width: `${profileStrength()}%` }}></div>
                  </div>
                  <p className="sc-strength-text">Complete your tax interview to reach 100% and unlock faster payouts.</p>
                </div>
                
              </div>
              </div>
            </>
          )}

          {activeTab === 'Account Settings' && (
            <>
              <div className="sc-grid">
                <div className="sc-col-main">
                  
                  {/* Security & Account Access */}
                  <div className="sc-card">
                    <h3 className="sc-card-title">Security & Account Access</h3>
                    
                    <div className="sc-settings-section-title">CHANGE PASSWORD</div>
                    <div className="sc-form-group">
                      <label>Current Password</label>
                      <input type="password" placeholder="••••••••" />
                    </div>
                    
                    <div className="sc-form-row">
                      <div className="sc-form-group half">
                        <label>New Password</label>
                        <input type="password" placeholder="••••••••" />
                      </div>
                      <div className="sc-form-group half">
                        <label>Confirm New Password</label>
                        <input type="password" placeholder="••••••••" />
                      </div>
                    </div>

                    <div className="sc-settings-section-title" style={{ marginTop: 32 }}>TWO-FACTOR AUTHENTICATION</div>
                    <div className="sc-preference-item">
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>Two-Factor Authentication</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 4 }}>Add an extra layer of security to your account.</div>
                      </div>
                      <label className="sc-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="sc-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="sc-settings-section-title" style={{ marginTop: 32 }}>ACTIVE SESSIONS</div>
                    <div className="sc-session-item">
                      <div className="sc-session-info">
                        <div className="sc-session-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        </div>
                        <div className="sc-session-text">
                          <h4>Chrome on MacOS (Current)</h4>
                          <p>San Francisco, USA • Active now</p>
                        </div>
                      </div>
                      <button className="sc-session-logout">Logout</button>
                    </div>
                    <div className="sc-session-item">
                      <div className="sc-session-info">
                        <div className="sc-session-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                        </div>
                        <div className="sc-session-text">
                          <h4>iPhone 15 Pro</h4>
                          <p>London, UK • 2 days ago</p>
                        </div>
                      </div>
                      <button className="sc-session-logout">Logout</button>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="sc-card mt-6">
                    <h3 className="sc-card-title">Notification Preferences</h3>
                    
                    <div className="sc-settings-section-title">EMAIL NOTIFICATIONS</div>
                    <div className="sc-preference-item">
                      <span>Order updates & shipping</span>
                      <label className="sc-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="sc-toggle-slider"></span>
                      </label>
                    </div>
                    <div className="sc-preference-item">
                      <span>Marketing & promotions</span>
                      <label className="sc-toggle">
                        <input type="checkbox" />
                        <span className="sc-toggle-slider"></span>
                      </label>
                    </div>
                    <div className="sc-preference-item">
                      <span>Security alerts</span>
                      <label className="sc-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="sc-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="sc-settings-section-title" style={{ marginTop: 24 }}>PUSH NOTIFICATIONS</div>
                    <div className="sc-preference-item">
                      <span>New order notifications</span>
                      <label className="sc-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="sc-toggle-slider"></span>
                      </label>
                    </div>
                    <div className="sc-preference-item">
                      <span>Direct messages</span>
                      <label className="sc-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="sc-toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Reused from Public Profile */}
                <div className="sc-col-side">
                  {/* Social Presence */}
                  <div className="sc-card">
                    <h3 className="sc-card-title">Social Presence</h3>
                    
                    <div className="sc-social-input">
                      <div className="sc-social-icon">📷</div>
                      <input type="text" placeholder="Instagram Username" value={profile.social.instagram} onChange={(e) => handleChange('social', e.target.value, 'instagram')} />
                    </div>
                    
                    <div className="sc-social-input">
                      <div className="sc-social-icon">🐦</div>
                      <input type="text" placeholder="Twitter / X Handle" value={profile.social.twitter} onChange={(e) => handleChange('social', e.target.value, 'twitter')} />
                    </div>
                    
                    <div className="sc-social-input">
                      <div className="sc-social-icon">📘</div>
                      <input type="text" placeholder="Facebook Page URL" value={profile.social.facebook} onChange={(e) => handleChange('social', e.target.value, 'facebook')} />
                    </div>
                  </div>

                  {/* Profile Strength */}
                  <div className="sc-strength-card mt-6">
                    <div className="sc-strength-header">
                      <span>Profile Strength</span>
                      <span>{profileStrength()}%</span>
                    </div>
                    <div className="sc-strength-bar-bg">
                      <div className="sc-strength-bar-fill" style={{ width: `${profileStrength()}%` }}></div>
                    </div>
                    <p className="sc-strength-text">Complete your tax interview to reach 100% and unlock faster payouts.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Inventory' && (
            <div style={{ padding: '40px' }}>
              <div className="sc-header-row" style={{ marginBottom: 24 }}>
                <div>
                  <h2>Inventory Management</h2>
                  <p>Add new products to your marketplace listing.</p>
                </div>
              </div>
              
              <div className="sc-card">
                <h3 className="sc-card-title">Add New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <div className="sc-form-group">
                    <label>Product Title</label>
                    <input 
                      type="text" 
                      required 
                      value={newProduct.title} 
                      onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} 
                      placeholder="e.g. Wireless Noise-Cancelling Headphones" 
                    />
                  </div>
                  
                  <div className="sc-form-row">
                    <div className="sc-form-group half">
                      <label>Price (₹)</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        step="1"
                        value={newProduct.price} 
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                        placeholder="14999" 
                      />
                    </div>
                    <div className="sc-form-group half">
                      <label>Image URL</label>
                      <input 
                        type="url" 
                        required 
                        value={newProduct.image} 
                        onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} 
                        placeholder="https://images.unsplash.com/photo-..." 
                      />
                    </div>
                  </div>
                  
                  <div className="sc-form-group">
                    <label>Product Description</label>
                    <textarea 
                      required 
                      rows="4" 
                      value={newProduct.description} 
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                      placeholder="Detailed description of your product..."
                    ></textarea>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <button type="submit" className="sc-btn-save" disabled={saving}>
                      {saving ? 'Adding...' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {(activeTab === 'Public Profile' || activeTab === 'Account Settings') && (
            <>
              {/* Action Buttons */}
              <div className="sc-actions-bar">
                <button className="sc-btn-cancel">Cancel</button>
                <button className="sc-btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
              
              {/* Footer */}
              <footer className="sc-footer">
                <div className="sc-footer-brand">
                  <h3>MarketHub</h3>
                  <p>Empowering global vendors with premium marketplace infrastructure.</p>
                </div>
                
                <div className="sc-footer-links">
                  <div className="sc-footer-col">
                    <h4>Resources</h4>
                    <a href="#">Vendor Portal</a>
                    <a href="#">Contact Support</a>
                  </div>
                  <div className="sc-footer-col">
                    <h4>Legal</h4>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                  </div>
                </div>
                
                <div className="sc-footer-copy">
                  © 2026 MarketHub. All rights reserved.
                </div>
              </footer>
            </>
          )}

        </div>

        {activeTab === 'Payouts' && (
          <div style={{ padding: '40px' }}>
            <div className="sc-header-row">
              <div>
                <h2>Payout Management</h2>
                <p>Monitor your earnings and manage withdrawal methods.</p>
              </div>
              <button className="sc-btn-save" onClick={requestPayout}>Request Payout</button>
            </div>

            <div className="sc-balance-grid">
              <div className="sc-balance-box" style={{ flex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h3 className="sc-card-title" style={{ margin: 0 }}>Balance Overview</h3>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/></svg>
                </div>
                <div style={{ display: 'flex', gap: 40 }}>
                  <div>
                    <h4>AVAILABLE BALANCE</h4>
                    <div className="sc-amt">₹{(profile.financial?.availableBalance || 0).toLocaleString('en-IN')}</div>
                    <div className="sc-sub">↗ +12% from last week</div>
                  </div>
                  <div>
                    <h4>PENDING PAYOUTS</h4>
                    <div className="sc-amt" style={{ color: '#475569' }}>₹{(profile.financial?.pendingPayouts || 0).toLocaleString('en-IN')}</div>
                    <div className="sc-sub gray">Next scheduled: Oct 24, 2026</div>
                  </div>
                </div>
              </div>

              <div className="sc-balance-box" style={{ flex: 1, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 className="sc-card-title" style={{ margin: 0 }}>Payout Methods</h3>
                  <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>+ Add Method</button>
                </div>
                {profile.financial?.methods?.map((m, i) => (
                  <div key={i} className="sc-payout-method">
                    <div className="sc-payout-icon">
                      {m.bankName.includes('Bank') ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
                      ) : (
                        <span style={{ fontWeight: 800 }}>P</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{m.bankName}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{m.accountMask}<br/>{m.isPrimary ? 'Primary Method' : 'Backup Method'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sc-card">
              <div className="sc-header-row" style={{ marginBottom: 16 }}>
                <h3 className="sc-card-title" style={{ margin: 0 }}>Transaction History</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="sc-btn-cancel">Filter</button>
                  <button className="sc-btn-cancel">Export CSV</button>
                </div>
              </div>
              <table className="sc-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>PAYOUT ID</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.financial?.history?.map((h, i) => (
                    <tr key={i}>
                      <td>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ fontWeight: 800 }}>₹{h.amount.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`sc-badge ${h.status.toLowerCase()}`}>{h.status}</span>
                      </td>
                      <td style={{ color: '#64748b' }}>{h.payoutId}</td>
                      <td><button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Details</button></td>
                    </tr>
                  ))}
                  {(!profile.financial?.history || profile.financial.history.length === 0) && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>No transactions found.</td></tr>
                  )}
                </tbody>
              </table>
              <div style={{ padding: '16px 0', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0', marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span>Showing {profile.financial?.history?.length || 0} of {profile.financial?.history?.length || 0} transactions</span>
                <span style={{ display: 'flex', gap: 16 }}>
                  <span style={{ cursor: 'pointer' }}>&lt;</span>
                  <span style={{ cursor: 'pointer' }}>&gt;</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div style={{ padding: '40px' }}>
            <div className="sc-header-row" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 24 }}>
              <h2>Notifications</h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <button className="sc-btn-cancel" style={{ background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>
                  All Notifications <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 6 }}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button onClick={() => markRead(null, true)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>Mark all as read</button>
              </div>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Showing {profile.alerts?.length || 0} recent updates</span>
            </div>

            <div className="sc-alert-group-title">Orders & Logistics</div>
            {profile.alerts?.filter(a => a.type === 'Order').map((alert, i) => (
              <div key={i} className={`sc-alert-card ${alert.read ? 'read' : ''}`}>
                <div className={`sc-alert-icon ${alert.title.includes('Shipment') ? 'truck' : 'order'}`}>
                  {alert.title.includes('Shipment') ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  )}
                </div>
                <div className="sc-alert-content">
                  <div className="sc-alert-header">
                    <h4>{alert.title}</h4>
                    <span className="sc-alert-time">{!alert.read && <div className="sc-alert-dot"></div>} {new Date(alert.date).toLocaleDateString()}</span>
                  </div>
                  <p className="sc-alert-text">{alert.message}</p>
                  {!alert.read && (
                    <div className="sc-alert-actions">
                      {alert.title.includes('order') ? (
                        <button className="sc-alert-btn primary" onClick={() => markRead(alert._id)}>Manage Order</button>
                      ) : null}
                      <button className="sc-alert-btn secondary" onClick={() => markRead(alert._id)}>Dismiss</button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="sc-alert-group-title security">Security & Privacy</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {profile.alerts?.filter(a => a.type === 'Security').map((alert, i) => (
                <div key={i} className={`sc-alert-card ${alert.title.includes('Login') ? 'critical' : ''} ${alert.read ? 'read' : ''}`} style={{ marginBottom: 0 }}>
                  <div className={`sc-alert-icon ${alert.title.includes('Login') ? 'security' : 'truck'}`} style={alert.title.includes('Login') ? {} : {background: '#eff6ff', color: '#2563eb'}}>
                    {alert.title.includes('Login') ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    )}
                  </div>
                  <div className="sc-alert-content">
                    <div className="sc-alert-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {alert.title.includes('Login') && <span className="sc-badge failed" style={{ margin: 0 }}>CRITICAL</span>}
                      </div>
                      <span className="sc-alert-time">{!alert.read && <div className="sc-alert-dot"></div>} {new Date(alert.date).toLocaleDateString()}</span>
                    </div>
                    <p className="sc-alert-text" style={{ marginTop: 8, color: alert.title.includes('Login') ? '#7f1d1d' : '#475569', fontWeight: alert.title.includes('Login') ? 600 : 400 }}>{alert.title}<br/><span style={{ fontWeight: 400 }}>{alert.message}</span></p>
                    {!alert.read && (
                      <div className="sc-alert-actions">
                        <button className={`sc-alert-btn ${alert.title.includes('Login') ? 'danger-outline' : 'secondary'}`} style={{ width: '100%' }} onClick={() => markRead(alert._id)}>
                          {alert.title.includes('Login') ? 'Review Security Activity' : 'Dismiss'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        )}

        {activeTab !== 'Public Profile' && activeTab !== 'Account Settings' && activeTab !== 'Payouts' && activeTab !== 'Notifications' && activeTab !== 'Inventory' && (
          <div style={{ padding: 40, color: '#64748B' }}>
            <h2>{activeTab}</h2>
            <p>This module is currently under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}
