import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const INPUT = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit' };
const CARD = { background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };
const LABEL = { display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginBottom: 8 };

const TRACKING_STEPS = ['Order Placed', 'Processing', 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [trackingOrder, setTrackingOrder] = useState(null);

  // Real-time empty states
  const [addressList, setAddressList] = useState([]);
  const [savedProducts, setSavedProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', phone: '', notifications: true });
  const [loading, setLoading] = useState(true);

  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ type: 'Home', name: '', street: '', city: '', state: '', zip: '', phone: '' });

  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:5000/api/profile?email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || '')}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setAddressList(data.user.addresses || []);
            setSavedProducts(data.user.savedProducts || []);
            setProfileData(prev => ({ ...prev, phone: data.user.phone || prev.phone, notifications: data.user.notifications ?? prev.notifications }));
          }
          if (data.orders) setOrders(data.orders);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const saveAddress = () => {
    if (!newAddr.name || !newAddr.street || !newAddr.city) return alert('Please fill all required fields.');
    const addressToSave = { ...newAddr, isDefault: addressList.length === 0 };
    
    fetch('http://localhost:5000/api/profile/address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, address: addressToSave })
    })
    .then(res => res.json())
    .then(updatedAddresses => {
      setAddressList(updatedAddresses);
      setNewAddr({ type: 'Home', name: '', street: '', city: '', state: '', zip: '', phone: '' });
      setShowAddAddr(false);
    })
    .catch(err => alert('Error saving address'));
  };

  const setDefault = id => setAddressList(addressList.map(a => ({ ...a, isDefault: a._id === id })));
  const deleteAddr = id => setAddressList(addressList.filter(a => a._id !== id));

  const handleLogout = () => { if (confirm('Are you sure you want to log out?')) { logout(); navigate('/'); } };

  const NAV_ITEMS = [
    { id: 'Overview', label: 'Account Overview', icon: '👤' },
    { id: 'Orders', label: `My Orders (${orders.length})`, icon: '📦' },
    { id: 'Saved', label: `Saved (${savedProducts.length})`, icon: '❤️' },
    { id: 'Addresses', label: `Addresses (${addressList.length})`, icon: '📍' },
    { id: 'Settings', label: 'Settings', icon: '⚙️' }
  ];

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}>Loading your profile...</div>;

  return (
    <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 60px)', padding: '40px 0' }}>
      <div style={{ width: '100%', padding: '0 48px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1E293B' }}>🛍️ Buyer Central</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Welcome back, <strong>{user?.name || 'Shopper'}</strong>! Manage your shopping account, saved items, orders and addresses.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }}>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Profile Badge */}
            <div style={{ ...CARD, padding: 24, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff', fontSize: '2.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                {(profileData.name || 'U')[0].toUpperCase()}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1E293B' }}>{profileData.name || 'User'}</h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 2 }}>{profileData.email}</p>
              <div style={{ background: '#EFF6FF', borderRadius: 100, padding: '5px 14px', display: 'inline-block', fontSize: '0.75rem', fontWeight: 700, color: '#1D4ED8', marginTop: 12 }}>New Member</div>
            </div>

            {/* Nav */}
            <div style={{ ...CARD, padding: 10 }}>
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: 'none', background: activeTab === item.id ? '#2563EB' : 'transparent', color: activeTab === item.id ? '#fff' : '#475569', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left', marginBottom: 4, transition: 'all .15s' }}>
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 8, paddingTop: 8 }}>
                <button onClick={handleLogout}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: '#EF4444', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  🚪 Log Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main>

            {/* ── Overview ── */}
            {activeTab === 'Overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                  {[
                    { label: 'TOTAL ORDERS', val: orders.length, sub: 'Lifetime purchases', c: '#10B981' },
                    { label: 'SAVED ITEMS', val: savedProducts.length, sub: 'Ready for checkout', c: '#2563EB' },
                    { label: 'REWARD POINTS', val: '0', sub: '✨ Start shopping to earn', c: '#F59E0B' }
                  ].map(s => (
                    <div key={s.label} style={CARD}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: 8 }}>{s.label}</div>
                      <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1E293B' }}>{s.val}</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: s.c, marginTop: 4 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div style={CARD}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1E293B' }}>Recent Orders</h3>
                    <button style={{ border: 'none', background: 'none', color: '#2563EB', fontWeight: 700, cursor: 'pointer' }} onClick={() => setActiveTab('Orders')}>View All →</button>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div style={{ padding: '32px 0', textAlign: 'center', color: '#64748B' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 12 }}>📦</div>
                      <p>You haven't placed any orders yet.</p>
                      <Link to="/home" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>Start Shopping</Link>
                    </div>
                  ) : (
                    orders.slice(0, 2).map(o => (
                      <div key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <div style={{ width: 56, height: 56, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛍️</div>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB' }}>{o.trackingNumber}</div>
                            <div style={{ fontWeight: 700, color: '#1E293B', marginTop: 2 }}>Order with {o.products?.length || 0} items</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800 }}>${(o.totalAmount || 0).toFixed(2)}</div>
                            <span style={{ background: o.status === 'Delivered' ? '#D1FAE5' : '#DBEAFE', color: o.status === 'Delivered' ? '#065F46' : '#1E40AF', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 100 }}>{o.status.toUpperCase()}</span>
                          </div>
                          <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => { setTrackingOrder(o); setActiveTab('Orders'); }}>Track</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Orders + Live Tracking ── */}
            {activeTab === 'Orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={CARD}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>My Orders</h3>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 24 }}>Click "Track Live" to see real-time shipment progress.</p>

                  {orders.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B' }}>
                      <p>No orders found.</p>
                    </div>
                  ) : orders.map(order => (
                    <div key={order._id} style={{ border: '1px solid #E2E8F0', borderRadius: 14, marginBottom: 20, overflow: 'hidden' }}>
                      {/* Order header */}
                      <div style={{ background: '#F8FAFC', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', gap: 36 }}>
                          {[['ORDER ID', order.trackingNumber], ['DATE', new Date(order.createdAt).toLocaleDateString()], ['TOTAL', `$${(order.totalAmount || 0).toFixed(2)}`]].map(([k, v]) => (
                            <div key={k}><div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B' }}>{k}</div><div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B', marginTop: 2 }}>{v}</div></div>
                          ))}
                        </div>
                        <span style={{ background: order.status === 'Delivered' ? '#D1FAE5' : '#DBEAFE', color: order.status === 'Delivered' ? '#065F46' : '#1E40AF', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: 100 }}>{order.status === 'Shipped' ? '🚚 IN TRANSIT' : '✅ DELIVERED'}</span>
                      </div>

                      {/* Order body */}
                      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <div style={{ width: 72, height: 72, borderRadius: 10, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📦</div>
                          <div>
                            <h4 style={{ fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>Order containing {order.products?.length || 0} items</h4>
                            <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>Tracking: <strong>{order.trackingNumber}</strong></p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem' }}
                            onClick={() => setTrackingOrder(trackingOrder?._id === order._id ? null : order)}>
                            {trackingOrder?._id === order._id ? '✕ Close' : '📍 Track Live'}
                          </button>
                        </div>
                      </div>

                      {/* Live Tracking Timeline */}
                      {trackingOrder?._id === order._id && (
                        <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', background: '#FAFBFF' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>📦 Live Shipment Tracker — {order.trackingNumber}</div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                            {TRACKING_STEPS.map((step, i) => {
                              const done = i <= order.step;
                              const active = i === order.step;
                              return (
                                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                  {/* Connector line */}
                                  {i < TRACKING_STEPS.length - 1 && (
                                    <div style={{ position: 'absolute', top: 16, left: '50%', width: '100%', height: 3, background: done ? '#2563EB' : '#E2E8F0', zIndex: 0 }} />
                                  )}
                                  {/* Circle */}
                                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: done ? '#2563EB' : '#E2E8F0', border: active ? '3px solid #93C5FD' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: active ? '0 0 0 6px rgba(37,99,235,.15)' : 'none', transition: 'all .3s' }}>
                                    {done ? <span style={{ color: '#fff', fontSize: '0.75rem' }}>✓</span> : <span style={{ color: '#94A3B8', fontSize: '0.65rem' }}>{i + 1}</span>}
                                  </div>
                                  <div style={{ marginTop: 10, fontSize: '0.7rem', fontWeight: active ? 800 : 600, color: done ? '#1E40AF' : '#94A3B8', textAlign: 'center', lineHeight: 1.3 }}>{step}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Saved ── */}
            {activeTab === 'Saved' && (
              <div style={CARD}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', marginBottom: 24 }}>❤️ Saved Products ({savedProducts.length})</h3>
                {savedProducts.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B' }}>
                    <p>You haven't saved any items yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                    {savedProducts.map(item => (
                      <div key={item._id} style={{ border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
                        <img src={item.image} alt={item.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                        <div style={{ padding: 16 }}>
                          <h4 style={{ fontWeight: 700, color: '#1E293B', marginBottom: 6, fontSize: '0.9rem' }}>{item.title}</h4>
                          <div style={{ color: '#F59E0B', marginBottom: 12, fontSize: '0.85rem' }}>★ {item.rating}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#2563EB' }}>${item.price.toFixed(2)}</span>
                            <Link to={`/product/${item._id}`} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', textDecoration: 'none' }}>View</Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Addresses ── */}
            {activeTab === 'Addresses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={CARD}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>📍 Saved Addresses</h3>
                    <button className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '0.875rem' }} onClick={() => setShowAddAddr(!showAddAddr)}>
                      {showAddAddr ? '✕ Cancel' : '+ Add New Address'}
                    </button>
                  </div>

                  {/* Add Address Form */}
                  {showAddAddr && (
                    <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 24, border: '1px solid #E2E8F0', marginBottom: 28 }}>
                      <h4 style={{ fontWeight: 800, color: '#1E293B', marginBottom: 20 }}>Enter New Address</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[
                          { ph: 'Full Name *', key: 'name' },
                          { ph: 'Phone Number', key: 'phone' },
                          { ph: 'Street Address *', key: 'street', full: true },
                          { ph: 'City *', key: 'city' },
                          { ph: 'State', key: 'state' },
                          { ph: 'ZIP Code', key: 'zip' }
                        ].map(({ ph, key, full }) => (
                          <input key={key} placeholder={ph} value={newAddr[key]} onChange={e => setNewAddr({ ...newAddr, [key]: e.target.value })}
                            style={{ ...INPUT, gridColumn: full ? '1 / -1' : undefined }} />
                        ))}
                        <select value={newAddr.type} onChange={e => setNewAddr({ ...newAddr, type: e.target.value })} style={{ ...INPUT }}>
                          <option>Home</option><option>Work</option><option>Other</option>
                        </select>
                      </div>
                      <button className="btn btn-primary" style={{ marginTop: 20, padding: '12px 24px' }} onClick={saveAddress}>💾 Save Address</button>
                    </div>
                  )}

                  {addressList.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B' }}>
                      <p>You haven't added any addresses yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
                      {addressList.map((addr, idx) => (
                        <div key={idx} style={{ border: addr.isDefault ? '2px solid #2563EB' : '1px solid #E2E8F0', borderRadius: 14, padding: 20, background: addr.isDefault ? '#EFF6FF' : '#fff', position: 'relative' }}>
                          {addr.isDefault && <span style={{ position: 'absolute', top: 16, right: 16, background: '#2563EB', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: 100 }}>DEFAULT</span>}
                          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: 10 }}>{(addr.type || 'HOME').toUpperCase()}</div>
                          <h4 style={{ fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>{addr.name}</h4>
                          <p style={{ fontSize: '0.9rem', color: '#475569' }}>{addr.street}</p>
                          <p style={{ fontSize: '0.9rem', color: '#475569' }}>{addr.city}, {addr.state} {addr.zip}</p>
                          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 6, marginBottom: 16 }}>📞 {addr.phone}</p>
                          <div style={{ display: 'flex', gap: 10 }}>
                            {!addr.isDefault && <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setDefault(addr._id)}>Set Default</button>}
                            <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#EF4444', borderColor: '#EF4444' }} onClick={() => deleteAddr(addr._id)}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Settings ── */}
            {activeTab === 'Settings' && (
              <div style={CARD}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>Profile Settings</h3>
                <p style={{ color: '#64748B', marginBottom: 28 }}>Update your personal details and preferences.</p>
                <form onSubmit={e => { e.preventDefault(); alert('✅ Profile saved!'); }} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 520 }}>
                  {[['Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Phone Number', 'phone', 'text']].map(([lbl, k, t]) => (
                    <div key={k}>
                      <label style={LABEL}>{lbl}</label>
                      <input type={t} value={profileData[k]} onChange={e => setProfileData({ ...profileData, [k]: e.target.value })} style={INPUT} disabled={k==='email'} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid #F1F5F9' }}>
                    <input type="checkbox" id="notif" checked={profileData.notifications} onChange={e => setProfileData({ ...profileData, notifications: e.target.checked })} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                    <label htmlFor="notif" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}>Receive SMS & Email shipment notifications</label>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Save Changes</button>
                    <button type="button" className="btn btn-outline" style={{ padding: '12px 24px', color: '#EF4444', borderColor: '#EF4444' }} onClick={handleLogout}>🚪 Log Out</button>
                  </div>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
