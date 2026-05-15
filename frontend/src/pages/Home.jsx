import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import ReportModal from '../components/ReportModal';

// ── Countdown Timer ───────────────────────────────────────────────────────────
function CountdownTimer({ initialSeconds = 46501 }) {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return (
    <span className="timer-badge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ENDS IN {h}:{m}:{s}
    </span>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span className="deal-rating">
      <span className="star">★</span>
      {rating} ({(rating * 200).toLocaleString()})
    </span>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function DealCard({ product }) {
  const { addToCart } = useCart();
  const [showReport, setShowReport] = useState(false);
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReport(true);
  };

  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
      <div className="deal-card">
        <div className="deal-img-wrap">
          <img src={product.image} alt={product.title} loading="lazy" />
          {product.badge && (
            <span className={`deal-badge ${product.isNew ? 'new' : ''}`}>{product.badge}</span>
          )}
        </div>
        <div className="deal-info">
          <div className="deal-vendor">{product.vendor}</div>
          <h3 className="deal-title" title={product.title}>{product.title}</h3>
          <Stars rating={product.rating} />
          <div className="deal-footer">
            <span className="deal-price">₹{product.price.toLocaleString('en-IN')}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="cart-btn" onClick={handleReport} title="Report Product" style={{ background: '#FEE2E2', color: '#EF4444' }}>🚩</button>
              <button className="cart-btn" onClick={handleAddToCart} title="Add to Cart">🛒</button>
            </div>
          </div>
        </div>
      </div>
      {showReport && <ReportModal product={product} onClose={() => setShowReport(false)} />}
    </Link>
  );
}

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'electronics', label: 'Electronics', sub: 'Audio, wearables & pro gear',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'computers', label: 'Computers', sub: 'Monitors, mechanical keyboards & mice',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'smarthome', label: 'Smart Home', sub: 'Hubs, lighting & automation',
    image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'fashion', label: 'Fashion', sub: 'Outerwear, sunglasses & luxury cashmere',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'beauty', label: 'Beauty', sub: 'Skincare sets, lipsticks & botanical oils',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'footwear', label: 'Footwear', sub: 'High-performance running & hiking boots',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'office', label: 'Office', sub: 'Ergonomic seating & minimal desk decor',
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d972b?auto=format&fit=crop&w=600&q=80'
  }
];

// ── Home Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/products/featured')
      .then(r => r.json())
      .then(data => { setFeaturedProducts(Array.isArray(data) ? data : []); setLoadingProducts(false); })
      .catch(() => setLoadingProducts(false));

    fetch('http://localhost:5000/api/sellers')
      .then(r => r.json())
      .then(data => { setSellers(Array.isArray(data) ? data : []); setLoadingSellers(false); })
      .catch(() => setLoadingSellers(false));
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="container hero-inner">
          <div>
            <div className="hero-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Summer Flash Sale
            </div>
            <h1 className="hero-title">Elevate Your<br />Lifestyle with<br />VendorVerse</h1>
            <p className="hero-sub">Discover a curated collection of premium goods from verified global sellers. Operational clarity, institutional trust, and seamless delivery.</p>
            <div className="hero-actions">
              <Link to="/search" className="btn btn-primary">Shop Now</Link>
              <Link to="/dashboard" className="btn btn-outline">Learn More</Link>
            </div>
          </div>
          <div className="hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
              alt="Premium products"
            />
          </div>
        </div>
      </section>

      <div style={{ background: 'var(--bg)' }}>

        {/* ── Featured Deals ────────────────────────────────────── */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 className="section-title">Featured Deals</h2>
                <CountdownTimer />
              </div>
              <Link to="/search" className="section-link">View All →</Link>
            </div>

            {loadingProducts ? (
              <div className="deals-grid">
                {[1,2,3,4].map(i => (
                  <div key={i} className="deal-card">
                    <div className="skeleton" style={{ height: 200 }} />
                    <div style={{ padding: 16 }}>
                      <div className="skeleton" style={{ height: 12, marginBottom: 8, width: '60%' }} />
                      <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="deals-grid">
                {featuredProducts.map(p => <DealCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── Shop by Category ──────────────────────────────────── */}
        <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Shop by Category</h2>
              <Link to="/search" className="section-link">View All →</Link>
            </div>
            <div className="category-grid">
              {CATEGORIES.map(cat => (
                <Link key={cat.id} to={`/search?category=${encodeURIComponent(cat.label)}`} style={{ textDecoration: 'none' }}>
                  <div className="cat-card">
                    <img src={cat.image} alt={cat.label} />
                    <div className="cat-overlay" />
                    <div className="cat-label">
                      <h3>{cat.label}</h3>
                      {cat.sub && <p>{cat.sub}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Verified Power Sellers ───────────────────────────── */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Verified Power Sellers</h2>
              <a href="#" className="section-link">Explore Sellers →</a>
            </div>

            {loadingSellers ? (
              <div className="sellers-grid">
                {[1,2,3].map(i => (
                  <div key={i} className="seller-card">
                    <div className="skeleton" style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 16, marginBottom: 8, width: '70%' }} />
                      <div className="skeleton" style={{ height: 12, marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 12, width: '50%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sellers-grid">
                {sellers.map(s => (
                  <div key={s._id} className="seller-card">
                    <img src={s.avatar} alt={s.name} className="seller-avatar" />
                    <div>
                      <div className="seller-name">
                        {s.name}
                        <span className="verified-icon">✓</span>
                      </div>
                      <p className="seller-tagline">{s.tagline}</p>
                      <div className="seller-meta">
                        <span className="seller-rating"><span style={{ color: '#F59E0B' }}>★</span> {s.rating} Rating</span>
                        <span className="seller-orders">{s.orders} Orders</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────── */}
        <div className="container">
          <div className="cta-banner">
            <div className="cta-text">
              <h2>Secure Your Next Advantage</h2>
              <p>Join 500,000+ professionals who receive exclusive deals and operational insights directly in their inbox weekly.</p>
            </div>
            <form className="cta-form" onSubmit={e => { e.preventDefault(); setEmail(''); alert('Subscribed! ✓'); }}>
              <input
                className="cta-input"
                type="email"
                placeholder="Enter your business email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="cta-submit">Subscribe</button>
            </form>
          </div>
        </div>

      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div>
              <div className="footer-brand-name">VendorVerse</div>
              <p className="footer-brand-desc">Defining the standard for global multi-vendor commerce through institutional trust and clarity.</p>
              <div className="footer-social">
                <div className="social-icon">🌐</div>
                <div className="social-icon">✦</div>
                <div className="social-icon">🌍</div>
              </div>
            </div>
            <div className="footer-col">
              <h4>Marketplace</h4>
              <ul>
                <li><a href="#">Browse Categories</a></li>
                <li><a href="#">Featured Deals</a></li>
                <li><a href="#">Top Sellers</a></li>
                <li><a href="#">New Arrivals</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Seller Portal</h4>
              <ul>
                <li><Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Vendor Portal</Link></li>
                <li><Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Seller Dashboard</Link></li>
                <li><a href="#">Fulfillment Services</a></li>
                <li><a href="#">Seller Protection</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Contact Support</a></li>
                <li><a href="#">Our Story</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2024 VendorVerse. All rights reserved.</span>
            <div className="footer-badges">
              <span className="footer-badge">🔒 Secure Checkout</span>
              <span className="footer-badge">🌐 Global Shipping</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
