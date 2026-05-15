import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import API_BASE_URL from '../config';
import ReportModal from '../components/ReportModal';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Loading product details...</div>;
  if (!product) return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Product not found.</div>;

  const galleryImages = [
    product.image,
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
  ];

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/search" style={{ color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '28px', display: 'inline-block', fontWeight: 600, fontSize: '0.875rem' }}>
          &larr; Back to Search
        </Link>
        
        <div className="pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <img 
              src={galleryImages[activeThumb]} 
              alt={product.title} 
              className="pd-main-img"
            />
            <div className="pd-thumbs">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`pd-thumb-wrap ${activeThumb === idx ? 'active' : ''}`}
                  onClick={() => setActiveThumb(idx)}
                >
                  <img src={img} alt={`thumb ${idx}`} />
                  {idx === 3 && (
                    <div className="pd-thumb-overlay">+2</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pd-info">
            <div className="pd-badge-row">
              <span className="pd-badge">Top Rated</span>
              <div className="pd-rating">
                <span style={{ color: '#F59E0B' }}>★</span> {product.rating} <span>({(product.reviews || 124)} reviews)</span>
              </div>
            </div>

            <h1 className="pd-title">{product.title}</h1>
            <div className="pd-price">₹{product.price.toLocaleString('en-IN')}</div>

            {/* Vendor Box */}
            <div className="pd-vendor-box">
              <div className="pd-vendor-left">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80" 
                  alt="vendor" 
                  className="pd-vendor-avatar" 
                />
                <div>
                  <div className="pd-vendor-name">SoundMaster Pro Audio</div>
                  <div className="pd-vendor-meta">Verified Vendor • 4.8 Rating</div>
                </div>
              </div>
              <button className="pd-shop-btn" onClick={() => alert("Redirecting to shop...")}>View Shop</button>
            </div>

            {/* Description */}
            <p className="pd-desc">
              Experience unparalleled sound quality with the Pro-Acoustic series. Featuring advanced active noise cancellation, 40-hour battery life, and high-fidelity drivers designed for professional audio engineering.
            </p>

            {/* Features */}
            <div className="pd-features">
              <div className="pd-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Industry-leading ANC technology
              </div>
              <div className="pd-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Multi-point Bluetooth connectivity
              </div>
              <div className="pd-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Lightweight ergonomic design
              </div>
            </div>

            {/* Quantity */}
            <div className="pd-quantity-label">Quantity</div>
            <div className="pd-quantity-box">
              <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
              <span className="pd-qty-num">{qty}</span>
              <button className="pd-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
            </div>

            {/* Actions */}
            <div className="pd-actions">
              <button className="pd-cart-btn" onClick={() => { 
                for(let i=0; i<qty; i++) addToCart(product); 
                alert("Added to cart! 🛒");
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Add to Cart
              </button>
              <button className="pd-fav-btn" onClick={async () => {
                if (!localStorage.getItem('vv_user')) return alert("Please login to save products!");
                const user = JSON.parse(localStorage.getItem('vv_user'));
                try {
                  const res = await fetch(`${API_BASE_URL}/api/profile/save-product`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, productId: product._id })
                  });
                  if(res.ok) alert("Added to favorites! ❤️");
                  else alert("Failed to save product.");
                } catch(err) {
                  alert("Error saving product.");
                }
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <button className="pd-fav-btn" onClick={() => setShowReport(true)} title="Report Product" style={{ color: '#EF4444', borderColor: '#EF4444' }}>
                🚩
              </button>
            </div>

            {/* Guarantees */}
            <div className="pd-guarantees">
              <div className="pd-guarantee-item">
                <svg className="pd-guarantee-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <div>
                  <div className="pd-guarantee-title">Free Shipping</div>
                  <div className="pd-guarantee-sub">Delivery in 3-5 days</div>
                </div>
              </div>
              <div className="pd-guarantee-item">
                <svg className="pd-guarantee-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                <div>
                  <div className="pd-guarantee-title">2-Year Warranty</div>
                  <div className="pd-guarantee-sub">Full coverage included</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {showReport && <ReportModal product={product} onClose={() => setShowReport(false)} />}
    </div>
  );
}

export default ProductDetails;
