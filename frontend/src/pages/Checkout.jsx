import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';

export default function Checkout() {
  const navigate = useNavigate();
  
  const { cartItems: items, removeFromCart: removeItem, updateQty, cartTotal: subtotal } = useCart();
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  
  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: 'California',
    zip: ''
  });
  const tax = subtotal * 0.08; // 8% estimated tax
  const total = Math.max(0, subtotal + tax - discount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promo.toUpperCase() === 'SAVE20') {
      setDiscount(500);
      alert('Promo code applied: ₹500 off!');
    } else {
      alert('Invalid promo code. Try SAVE20');
    }
  };

  const handleConfirmPay = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      // 1. Create Razorpay Order on Backend
      const res = await fetch('http://localhost:5000/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' })
      });
      const order = await res.json();

      if (!order.id) throw new Error('Failed to create order');

      // 2. Configure Razorpay Options
      const options = {
        key: 'rzp_test_SpfRe8CzNnTD4g', 
        amount: order.amount,
        currency: order.currency,
        name: 'VendorVerse',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify Payment on Backend
          const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json();

          if (verifyData.message) {
            alert('Payment successful! 🎉 Thank you for your order.');
            // Clear cart logic would go here if available via context
            navigate('/');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: 'customer@example.com', // In a real app, use auth user email
        },
        theme: {
          color: '#2563EB',
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert('Error initializing payment. Check your Razorpay keys.');
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        
        {/* Header */}
        <div className="checkout-header">
          <h1 className="checkout-title">Secure Checkout</h1>
          <p className="checkout-sub">Review your items and complete your purchase securely.</p>
        </div>

        <div className="checkout-grid">
          
          {/* Left Column: Cart + Shipping Form */}
          <div className="checkout-left">
            
            {/* Cart Box */}
            <div className="checkout-box">
              <h2 className="checkout-box-title">Your Cart ({items.reduce((s, i) => s + i.qty, 0)} items)</h2>
              
              {items.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Your cart is empty. <Link to="/search" style={{ color: 'var(--blue)' }}>Continue shopping</Link>
                </div>
              ) : (
                <div className="checkout-items">
                  {items.map(item => (
                    <div key={item._id} className="checkout-item">
                      <img src={item.image} alt={item.title} className="checkout-item-img" />
                      
                      <div className="checkout-item-info">
                        <div className="checkout-item-title">{item.title}</div>
                        <div className="checkout-item-specs">{item.vendor}</div>
                        
                        <div className="checkout-item-controls">
                          <div className="pd-quantity-box" style={{ marginBottom: 0, padding: '4px 12px', width: '110px' }}>
                            <button className="pd-qty-btn" style={{ width: 20, height: 20 }} onClick={() => updateQty(item._id, -1)}>-</button>
                            <span className="pd-qty-num" style={{ fontSize: '0.875rem' }}>{item.qty}</span>
                            <button className="pd-qty-btn" style={{ width: 20, height: 20 }} onClick={() => updateQty(item._id, 1)}>+</button>
                          </div>
                          
                          <button className="checkout-remove-btn" onClick={() => removeItem(item._id)}>
                            🗑️ Remove
                          </button>
                        </div>
                      </div>

                      <div className="checkout-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping Info Form */}
            <div className="checkout-box">
              <h2 className="checkout-box-title">Shipping Information</h2>
              
              <form className="checkout-form" onSubmit={handleConfirmPay}>
                <div className="form-row-2">
                  <div>
                    <label className="form-label">First Name</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      value={form.firstName}
                      onChange={e => setForm({...form, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      value={form.lastName}
                      onChange={e => setForm({...form, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Address Line 1</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row-3">
                  <div>
                    <label className="form-label">City</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      value={form.city}
                      onChange={e => setForm({...form, city: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">State</label>
                    <select 
                      className="form-input"
                      value={form.state}
                      onChange={e => setForm({...form, state: e.target.value})}
                    >
                      <option>California</option>
                      <option>New York</option>
                      <option>Texas</option>
                      <option>Florida</option>
                      <option>Illinois</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">ZIP Code</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      value={form.zip}
                      onChange={e => setForm({...form, zip: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

          </div>

          {/* Right Column: Order Summary + Protection Box */}
          <div className="checkout-right">
            
            {/* Summary Box */}
            <div className="checkout-summary-box">
              <h2 className="checkout-summary-title">Order Summary</h2>
              
              <div className="summary-rows">
                <div className="summary-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-val">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Shipping</span>
                  <span className="summary-val-green">FREE</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row">
                    <span className="summary-label">Promo Discount</span>
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span className="summary-label">Taxes (Estimated)</span>
                  <span className="summary-val">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-total-row">
                  <span>Total</span>
                  <span className="summary-total-val">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Promo input */}
              <form onSubmit={handleApplyPromo} className="promo-row">
                <input 
                  className="promo-input" 
                  type="text" 
                  placeholder="Promo Code" 
                  value={promo}
                  onChange={e => setPromo(e.target.value)}
                />
                <button type="submit" className="promo-btn">Apply</button>
              </form>

              {/* Confirm & Pay Button */}
              <button className="confirm-pay-btn" onClick={handleConfirmPay}>
                Confirm & Pay
              </button>

              <div className="ssl-lock">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                SSL Encrypted Payment
              </div>
            </div>

            {/* Buyer Protection Box */}
            <div className="protection-box">
              <svg className="protection-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              <div>
                <div className="protection-title">Buyer Protection</div>
                <div className="protection-desc">Get a full refund if your item isn't delivered as described.</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
