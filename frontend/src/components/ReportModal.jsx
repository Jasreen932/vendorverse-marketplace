import { useState } from 'react';
import API_BASE_URL from '../config';

export default function ReportModal({ product, onClose }) {
  const [reason, setReason] = useState('Suspicious Price');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('vv_user') || '{}');
      const res = await fetch(`${API_BASE_URL}/api/products/${product._id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email || 'guest@example.com',
          reason,
          details
        })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(onClose, 2000);
      } else {
        alert('Failed to submit report');
      }
    } catch (error) {
      alert('Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ background: 'white', padding: 32, borderRadius: 16, width: 400, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
        
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <h3>Report Submitted</h3>
            <p style={{ color: '#64748B' }}>Thank you for helping us maintain marketplace quality.</p>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: 8 }}>Report Product</h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 24 }}>{product.title}</p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8 }}>REASON</label>
                <select 
                  value={reason} 
                  onChange={e => setReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}
                >
                  <option>Suspicious Price</option>
                  <option>Counterfeit Item</option>
                  <option>Misleading Description</option>
                  <option>Prohibited Item</option>
                  <option>Inappropriate Content</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8 }}>ADDITIONAL DETAILS</label>
                <textarea 
                  value={details} 
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Tell us more about the issue..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', height: 100, resize: 'none' }}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="admin-btn admin-btn-primary" 
                style={{ width: '100%', background: '#EF4444', border: 'none' }}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
