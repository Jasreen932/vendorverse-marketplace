import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useAuth } from '../AuthContext';
import '../admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [flaggedProducts, setFlaggedProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      if (activeTab === 'User Management') {
        const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`);
        setUsers(await usersRes.json());
      } else if (activeTab === 'Vendor Approval') {
        const vendorsRes = await fetch(`${API_BASE_URL}/api/admin/vendors`);
        setVendors(await vendorsRes.json());
      } else if (activeTab === 'Product Moderation') {
        const productsRes = await fetch(`${API_BASE_URL}/api/admin/products/flagged`);
        setFlaggedProducts(await productsRes.json());
      } else if (activeTab === 'Reports') {
        const reportsRes = await fetch(`${API_BASE_URL}/api/admin/reports`);
        setReports(await reportsRes.json());
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleVendorStatus = async (vendorId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/vendors/${vendorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  const handleProductModerate = async (productId, action) => {
    if (action === 'takedown') {
      if (!confirm('Are you sure you want to PERMANENTLY DELETE this product?')) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, { method: 'DELETE' });
        if (res.ok) {
          alert('Product deleted successfully');
          fetchData();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    } else {
      alert(`Product ${productId} kept`);
      setFlaggedProducts(prev => prev.filter(p => p._id !== productId));
    }
  };

  const handleReportAction = async (reportId, action, productId) => {
    if (action === 'delete') {
      await handleProductModerate(productId, 'takedown');
      // Update report status to Resolved
      await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
    } else {
      await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Dismissed' })
      });
    }
    fetchData();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderDashboard = () => (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>System Overview</h1>
        <p>Real-time performance monitoring and vendor activity tracking.</p>
      </div>

      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Revenue</div>
          <div className="admin-stat-value">₹{stats?.totalRevenue?.toLocaleString('en-IN')}</div>
          <div style={{ color: '#10B981', fontSize: '0.8rem', marginTop: 4 }}>+12.4% from last month</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Active Vendors</div>
          <div className="admin-stat-value">{stats?.activeVendors}</div>
          <div style={{ color: '#10B981', fontSize: '0.8rem', marginTop: 4 }}>+5.2% new vendors</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">New Users</div>
          <div className="admin-stat-value">{stats?.newUsers}</div>
          <div style={{ color: '#6366F1', fontSize: '0.8rem', marginTop: 4 }}>This Week</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Moderation</div>
          <div className="admin-stat-value">{stats?.pendingModeration} Items</div>
          <div style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: 4 }}>Urgent review needed</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3>Sales Performance</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="admin-btn admin-btn-outline">Last 30 Days</button>
              <button className="admin-btn admin-btn-primary">Export Data</button>
            </div>
          </div>
          <div style={{ height: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 40px 40px' }}>
            {[40, 60, 35, 75, 55, 90, 65].map((h, i) => (
              <div key={i} style={{ width: 40, background: 'var(--admin-primary)', height: `${h}%`, borderRadius: '4px 4px 0 0' }} />
            ))}
          </div>
        </div>
        
        <div className="admin-table-card">
          <div className="admin-table-header"><h3>Recent Activity</h3></div>
          <div style={{ padding: 20 }}>
            {[
              { text: 'EcoCraft Ceramics joined as a vendor', time: '2 hours ago', icon: '👤', color: '#10B981' },
              { text: 'Wireless Earbuds X1 reported for counterfeit', time: '5 hours ago', icon: '⚠️', color: '#EF4444' },
              { text: 'Bulk order #9283 confirmed by Urban Retailers', time: '8 hours ago', icon: '🛒', color: '#3B82F6' },
              { text: 'Minimalist Threads approved as Premium Vendor', time: 'Yesterday', icon: '✨', color: '#8B5CF6' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: item.color + '20', color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.text}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)' }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>User Management</h1>
        <p>Manage and monitor all platform users.</p>
      </div>
      
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div className="admin-search-bar" style={{ width: 300 }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
             <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button className="admin-btn admin-btn-primary">+ Invite New User</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
              <tr key={u._id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'Seller' ? 'badge-pending' : 'badge-active'}`}>{u.role}</span></td>
                <td><span className={`badge ${u.status === 'Suspended' ? 'badge-suspended' : 'badge-active'}`}>{u.status || 'Active'}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="admin-btn admin-btn-outline" 
                    onClick={() => handleUserStatus(u._id, u.status || 'Active')}
                    style={{ color: (u.status === 'Suspended' ? 'var(--admin-accent)' : 'var(--admin-danger)') }}
                  >
                    {u.status === 'Suspended' ? 'Restore' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVendorApproval = () => (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>Vendor Approval Queue</h1>
        <p>Review and manage pending store applications.</p>
      </div>
      
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Owner Name</th>
              <th>Category</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v._id}>
                <td style={{ fontWeight: 600 }}>{v.storeName || 'New Store'}</td>
                <td>{v.name}</td>
                <td>Fashion & Apparel</td>
                <td>Oct 24, 2023</td>
                <td><span className={`badge ${v.vendorStatus === 'Approved' ? 'badge-active' : v.vendorStatus === 'Rejected' ? 'badge-suspended' : 'badge-pending'}`}>{v.vendorStatus || 'Pending'}</span></td>
                <td>
                   <div style={{ display: 'flex', gap: 8 }}>
                     <button className="admin-btn admin-btn-primary" style={{ background: '#2563EB' }} onClick={() => handleVendorStatus(v._id, 'Approved')}>Approve</button>
                     <button className="admin-btn admin-btn-outline" style={{ color: '#EF4444' }} onClick={() => handleVendorStatus(v._id, 'Rejected')}>Reject</button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProductModeration = () => (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>Product Moderation</h1>
        <p>Review flagged items and maintain marketplace quality.</p>
      </div>

      <div className="moderation-grid">
        {flaggedProducts.map(p => (
          <div key={p._id} className="moderation-card">
            <img src={p.image} className="moderation-image" alt={p.title} />
            <div className="moderation-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                 <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase' }}>Suspicious Price</span>
                 <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444' }}>CRITICAL</span>
              </div>
              <h3 style={{ marginBottom: 4 }}>{p.title}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-light)', marginBottom: 16 }}>Vendor: {p.vendor}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                 <button className="admin-btn admin-btn-primary" style={{ flex: 1, background: '#2563EB' }} onClick={() => handleProductModerate(p._id, 'keep')}>Keep</button>
                 <button className="admin-btn admin-btn-primary" style={{ flex: 1, background: '#EF4444' }} onClick={() => handleProductModerate(p._id, 'takedown')}>Take Down</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>User Reports</h1>
        <p>Review products flagged by users for violations.</p>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Reported By</th>
              <th>Reason</th>
              <th>Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r._id}>
                <td style={{ fontWeight: 600 }}>{r.productId?.title || 'Unknown Product'}</td>
                <td>{r.userEmail}</td>
                <td><span className="badge badge-suspended">{r.reason}</span></td>
                <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{r.details || 'No details provided'}</td>
                <td><span className={`badge ${r.status === 'Pending' ? 'badge-pending' : r.status === 'Resolved' ? 'badge-active' : 'badge-suspended'}`}>{r.status}</span></td>
                <td>
                   <div style={{ display: 'flex', gap: 8 }}>
                     <button className="admin-btn admin-btn-primary" style={{ background: '#EF4444' }} onClick={() => handleReportAction(r._id, 'delete', r.productId?._id)}>Take Down</button>
                     <button className="admin-btn admin-btn-outline" onClick={() => handleReportAction(r._id, 'dismiss')}>Dismiss</button>
                   </div>
                </td>
              </tr>
            ))}
            {reports.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No active reports.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const sidebarItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'User Management', icon: '👥' },
    { name: 'Vendor Approval', icon: '🛡️' },
    { name: 'Product Moderation', icon: '📦' },
    { name: 'Reports', icon: '📈' },
    { name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="admin-portal-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-logo">VV</div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Marketplace<br/><span style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)' }}>Admin Portal</span></span>
        </div>

        <nav className="admin-nav">
          {sidebarItems.map(item => (
            <button 
              key={item.name}
              className={`admin-nav-link ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-link" style={{ color: '#EF4444' }} onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-search-bar">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
             <input type="text" placeholder="Search anything..." />
          </div>

          <div className="admin-topbar-right">
             <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
               <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#EF4444', borderRadius: '50%' }}></span>
             </button>
             <div className="admin-user-profile">
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Jasreen Kaur'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', textTransform: 'uppercase' }}>Administrator</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {(user?.name || 'J')[0].toUpperCase()}
                </div>
             </div>
          </div>
        </header>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
        ) : (
          <>
            {activeTab === 'Dashboard' && renderDashboard()}
            {activeTab === 'User Management' && renderUserManagement()}
            {activeTab === 'Vendor Approval' && renderVendorApproval()}
            {activeTab === 'Product Moderation' && renderProductModeration()}
            {activeTab === 'Reports' && renderReports()}
            {activeTab === 'Settings' && (
              <div className="admin-content">
                <h1>{activeTab}</h1>
                <p>This module is coming soon with more advanced analytics and configuration options.</p>
              </div>
            )}
          </>
        )}

        <div style={{ padding: '0 32px 32px' }}>
          <div style={{ background: '#E0E7FF', padding: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ color: '#1E293B', marginBottom: 4 }}>Need to audit recent activity?</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Review detailed transaction logs and support ticket history for these users in the Activity Monitoring module.</p>
              <button className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>Open Audit Logs</button>
            </div>
            <div style={{ width: 100, height: 100, background: 'rgba(255,255,255,0.5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🛡️</div>
          </div>
        </div>
      </main>
    </div>
  );
}
