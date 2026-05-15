import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../CartContext';
import ReportModal from '../components/ReportModal';

const CATEGORIES = ['Electronics', 'Smart Home', 'Computers', 'Fashion', 'Beauty', 'Footwear', 'Office'];
const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Best Rating', 'Newest'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const catParam = searchParams.get('category');

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(queryParam);
  const [reportProduct, setReportProduct] = useState(null);
  const { addToCart } = useCart();

  // Filters
  const [selectedCats, setSelectedCats] = useState(catParam ? [catParam] : []);

  useEffect(() => {
    if (catParam) {
      setSelectedCats([catParam]);
    }
  }, [catParam]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort] = useState('Relevance');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9; // 9 results per page
  const GRID_PER_PAGE = 8;

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/products${queryParam ? `?q=${encodeURIComponent(queryParam)}` : ''}`)
      .then(r => r.json())
      .then(data => { setAllProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [queryParam]);

  // Apply client-side filters & sort
  const filtered = allProducts
    .filter(p => selectedCats.length === 0 || selectedCats.includes(p.category))
    .filter(p => p.price >= minPrice && p.price <= maxPrice)
    .sort((a, b) => {
      if (sort === 'Price: Low to High') return a.price - b.price;
      if (sort === 'Price: High to Low') return b.price - a.price;
      if (sort === 'Best Rating') return b.rating - a.rating;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil((filtered.length > 1 ? filtered.length - 1 : 0) / GRID_PER_PAGE) + 1);
  const featured = filtered[0] || null;
  const gridProducts = filtered.slice(1 + (page - 1) * GRID_PER_PAGE, 1 + page * GRID_PER_PAGE);

  const handleSearch = e => {
    e.preventDefault();
    setPage(1);
    setSearchParams(searchInput.trim() ? { q: searchInput.trim() } : {});
  };

  const toggleCat = cat => {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedCats([]);
    setMinPrice(0);
    setMaxPrice(1000);
    setSort('Relevance');
    setPage(1);
  };

  return (
    <div className="search-page">
      <div className="search-body">

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="search-sidebar">
          {/* Categories */}
          <div>
            <div className="filter-section-title">Categories</div>
            {CATEGORIES.map(cat => (
              <label key={cat} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat)}
                  onChange={() => toggleCat(cat)}
                />
                {cat}
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div>
            <div className="filter-section-title">Price Range</div>
            <div className="price-inputs">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Min</div>
                <input
                  className="price-input"
                  type="number"
                  value={minPrice}
                  min={0}
                  max={maxPrice}
                  onChange={e => { setMinPrice(Number(e.target.value)); setPage(1); }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Max</div>
                <input
                  className="price-input"
                  type="number"
                  value={maxPrice}
                  min={minPrice}
                  onChange={e => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                />
              </div>
            </div>
            <input
              className="price-range-slider"
              type="range"
              min={0}
              max={2000}
              value={maxPrice}
              onChange={e => { setMaxPrice(Number(e.target.value)); setPage(1); }}
            />
          </div>

          {/* Customer Rating */}
          <div>
            <div className="filter-section-title">Customer Rating</div>
            {[4, 3, 2, 1].map(r => (
              <div key={r} className="rating-filter" style={{ marginBottom: 10 }}>
                <span className="star-row">{'★'.repeat(r)}{'☆'.repeat(4 - r)}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>& Up</span>
              </div>
            ))}
          </div>

          <button className="reset-btn" onClick={resetFilters}>Reset All Filters</button>
        </aside>

        {/* ── Main Content ──────────────────────────────────── */}
        <div className="search-main">

          {/* Search bar + header */}
          <div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div className="nav-search" style={{ maxWidth: '100%', flex: 1, borderRadius: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search electronics, fashion, home..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', whiteSpace: 'nowrap' }}>Search</button>
            </form>

            <div className="search-results-header">
              <div>
                <div className="search-results-title">
                  Search Results{queryParam ? ` for "${queryParam}"` : ''}
                </div>
                <div className="search-results-count">
                  Showing {filtered.length.toLocaleString()} items
                </div>
              </div>
              <div className="sort-select">
                <span>Sort by:</span>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                  {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="skeleton" style={{ height: 280, borderRadius: 16 }} />
              <div className="search-grid">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="search-card">
                    <div className="skeleton" style={{ height: 180 }} />
                    <div style={{ padding: 14 }}>
                      <div className="skeleton" style={{ height: 12, marginBottom: 8, width: '60%' }} />
                      <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No products found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try a different keyword or reset the filters</p>
            </div>
          ) : (
            <>
              {/* Featured Product */}
              {featured && page === 1 && (
                <Link to={`/product/${featured._id}`} style={{ textDecoration: 'none' }}>
                  <div className="search-featured-card">
                    <div className="search-featured-img">
                      <img src={featured.image} alt={featured.title} loading="lazy" />
                      <span className="featured-badge">Best Seller</span>
                    </div>
                    <div className="search-featured-info">
                      <div className="search-featured-rating">
                        <span className="star">★</span>
                        <strong>{featured.rating}</strong>
                        <span>({(featured.rating * 200).toLocaleString()} reviews)</span>
                      </div>
                      <h2 className="search-featured-title">{featured.title}</h2>
                      <p className="search-featured-desc">
                        {featured.description?.slice(0, 120)}...
                      </p>
                      <div className="search-featured-price">₹{featured.price.toLocaleString('en-IN')}</div>
                      <button
                        className="add-to-cart-btn"
                        onClick={e => { e.preventDefault(); addToCart(featured); }}
                        style={{ marginRight: 8 }}
                      >
                        🛒 Add to Cart
                      </button>
                      <button
                        className="add-to-cart-btn"
                        onClick={e => { e.preventDefault(); setReportProduct(featured); }}
                        style={{ background: '#FEE2E2', color: '#EF4444' }}
                      >
                        🚩 Report
                      </button>
                    </div>
                  </div>
                </Link>
              )}

              {/* Product Grid */}
              {gridProducts.length > 0 && (
                <div className="search-grid">
                  {gridProducts.map(p => (
                    <Link key={p._id} to={`/product/${p._id}`} style={{ textDecoration: 'none' }}>
                      <div className="search-card">
                        <div className="search-card-img">
                          <img src={p.image} alt={p.title} loading="lazy" />
                        </div>
                        <div className="search-card-body">
                          <div className="search-card-vendor">{p.vendor}</div>
                          <div className="search-card-title">{p.title}</div>
                          <div className="search-card-rating">
                            <span style={{ color: '#F59E0B' }}>★</span>
                            {p.rating}
                          </div>
                          <div className="search-card-footer">
                            <span className="search-card-price">₹{p.price.toLocaleString('en-IN')}</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                               <button className="plus-btn" onClick={e => { e.preventDefault(); setReportProduct(p); }} style={{ background: '#FEE2E2', color: '#EF4444' }}>🚩</button>
                               <button className="plus-btn" onClick={e => { e.preventDefault(); addToCart(p); }}>+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      className={`page-btn ${page === pg ? 'active' : ''}`}
                      onClick={() => setPage(pg)}
                    >
                      {pg}
                    </button>
                  );
                })}
                {totalPages > 5 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
                {totalPages > 5 && (
                  <button className="page-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>
                )}
                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  ›
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {reportProduct && <ReportModal product={reportProduct} onClose={() => setReportProduct(null)} />}

      {/* ── Search Footer ─────────────────────────────────────── */}
      <footer className="search-footer">
        <div className="container">
          <div className="search-footer-main">
            <div>
              <div className="search-footer-brand">VendorVerse</div>
              <p className="search-footer-desc">The leading multi-vendor marketplace for high-performance gear and professional supplies. Trusted by over 2 million customers worldwide.</p>
            </div>
            <div className="search-footer-col">
              <h5>Marketplace</h5>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div className="search-footer-col">
              <h5>For Sellers</h5>
              <ul>
                <li><Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Vendor Portal</Link></li>
                <li><Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Sell on VendorVerse</Link></li>
              </ul>
            </div>
            <div className="search-footer-col">
              <h5>Help & Support</h5>
              <ul>
                <li><a href="#">Contact Support</a></li>
                <li><a href="#">Shipping Info</a></li>
              </ul>
            </div>
          </div>
          <div className="search-footer-bottom">
            <span className="search-footer-copy">© 2024 VendorVerse. All rights reserved.</span>
            <div className="search-footer-icons">
              <span>🌐</span>
              <span>🛡️</span>
              <span>🔒</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
