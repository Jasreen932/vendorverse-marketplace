import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import logoImg from '../assets/hero.png';
import '../landing.css';

const FEATURES = [
  {
    icon: '🛍️',
    title: 'For Buyers',
    desc: 'Discover thousands of products from verified sellers. Track orders in real-time, manage wishlists, and enjoy secure checkout.',
    bullets: ['Real-time order tracking', 'Verified seller badges', 'Buyer protection guarantee'],
    gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
    lightBg: '#EFF6FF',
    lightText: '#1D4ED8',
    cta: 'Start Shopping',
    role: 'Buyer',
  },
  {
    icon: '🏪',
    title: 'For Sellers',
    desc: 'Launch your store in minutes. Manage inventory, fulfill orders, and grow your business with powerful analytics.',
    bullets: ['Analytics dashboard', 'Inventory management', 'Multi-product catalog'],
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    lightBg: '#F5F3FF',
    lightText: '#6D28D9',
    cta: 'Open Your Store',
    role: 'Seller',
  },
  {
    icon: '⚙️',
    title: 'For Admins',
    desc: 'Full platform visibility. Monitor users, manage disputes, oversee revenue flows and maintain marketplace integrity.',
    bullets: ['User & role management', 'Revenue oversight', 'Platform health metrics'],
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    lightBg: '#F1F5F9',
    lightText: '#334155',
    cta: 'Admin Portal',
    role: 'Admin',
  },
];

const STATS = [
  { value: '50K+', label: 'Active Buyers' },
  { value: '8,200', label: 'Verified Sellers' },
  { value: '1.2M+', label: 'Products Listed' },
  { value: '99.8%', label: 'Uptime SLA' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Buyer', text: 'VendorVerse changed how I shop online. The tracking feature is incredibly detailed!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80' },
  { name: 'James R.', role: 'Seller', text: 'My sales tripled in 3 months. The analytics dashboard gives me insights I never had before.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80' },
  { name: 'Elena K.', role: 'Buyer', text: 'Buyer protection is real here. Had an issue and it was resolved in 24 hours. Exceptional!', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef(null);

  // If already logged in, redirect to correct area
  useEffect(() => {
    if (user) {
      if (user.role === 'Seller') navigate('/dashboard');
      else if (user.role === 'Admin') navigate('/admin');
      else navigate('/home');
    }
  }, [user, navigate]);

  // Parallax float animation for logo
  useEffect(() => {
    let frame;
    let t = 0;
    const animate = () => {
      t += 0.02;
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${Math.sin(t) * 12}px) rotate(${Math.sin(t * 0.5) * 2}deg)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleRoleClick = (role) => {
    navigate('/login', { state: { preRole: role } });
  };

  return (
    <div className="landing-root">

      {/* ── Top Nav ──────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <img src={logoImg} alt="VendorVerse" className="landing-brand-logo" />
            <span className="landing-brand-text">Vendor<span>Verse</span></span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#stats">Why Us</a>
            <a href="#testimonials">Reviews</a>
          </div>
          <div className="landing-nav-actions">
            <button className="landing-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="landing-btn-primary" onClick={() => navigate('/signup')}>Get Started →</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid-pattern" />
        </div>
        <div className="landing-hero-inner">
          <div className="landing-hero-content">
            <div className="landing-pill-badge">
              <span className="badge-dot" />
              🚀 The Next-Gen Multi-Vendor Marketplace
            </div>
            <h1 className="landing-headline">
              One Platform.<br />
              <span className="headline-gradient">Every Role. </span><br />
              Infinite Possibilities.
            </h1>
            <p className="landing-subline">
              VendorVerse unites buyers, sellers, and admins in a single seamless ecosystem. 
              Shop smarter, sell faster, and manage everything from one powerful hub.
            </p>
            <div className="landing-hero-ctas">
              <button className="landing-cta-primary" onClick={() => handleRoleClick('Buyer')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Start Shopping
              </button>
              <button className="landing-cta-secondary" onClick={() => handleRoleClick('Seller')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 17v-4m5 4v-6m5 6V9"/></svg>
                Become a Seller
              </button>
            </div>
            <div className="landing-trust-row">
              <div className="trust-avatars">
                {['photo-1507003211169-0a1dd7228f2d','photo-1494790108377-be9c29b29330','photo-1500648767791-00dcc994a43e'].map(id => (
                  <img key={id} src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=40&q=80`} alt="User" />
                ))}
              </div>
              <span className="trust-text">Trusted by <strong>50,000+</strong> members worldwide</span>
            </div>
          </div>

          {/* Logo Showcase */}
          <div className="landing-hero-visual">
            <div className="hero-logo-glow" />
            <div className="hero-logo-card" ref={heroRef}>
              <img src={logoImg} alt="VendorVerse Logo" className="hero-logo-img" />
              <div className="hero-logo-label">
                <span>VendorVerse</span>
                <div className="hero-logo-sublabel">Multi-Vendor Platform</div>
              </div>
            </div>
            {/* Floating stat cards */}
            <div className="hero-float-card hero-float-card-1">
              <div className="float-card-icon">📦</div>
              <div>
                <div className="float-card-val">1.2M+</div>
                <div className="float-card-sub">Products</div>
              </div>
            </div>
            <div className="hero-float-card hero-float-card-2">
              <div className="float-card-icon">⭐</div>
              <div>
                <div className="float-card-val">4.9/5</div>
                <div className="float-card-sub">Avg Rating</div>
              </div>
            </div>
            <div className="hero-float-card hero-float-card-3">
              <div className="float-card-icon">✅</div>
              <div>
                <div className="float-card-val">8,200+</div>
                <div className="float-card-sub">Sellers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <section id="stats" className="landing-stats-bar">
        <div className="landing-container">
          <div className="stats-bar-inner">
            {STATS.map((s, i) => (
              <div key={i} className="stat-bar-item">
                <div className="stat-bar-val">{s.value}</div>
                <div className="stat-bar-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Cards ───────────────────────────────────────────── */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="section-eyebrow">WHO IT'S FOR</div>
          <h2 className="landing-section-title">Built for Every Role in the Marketplace</h2>
          <p className="landing-section-sub">Whether you're buying, selling, or managing — VendorVerse gives you exactly the tools you need, tailored to your role.</p>

          <div className="role-cards-grid">
            {FEATURES.map((f) => (
              <div key={f.role} className="role-card" style={{ '--role-gradient': f.gradient, '--role-light': f.lightBg, '--role-light-text': f.lightText }}>
                <div className="role-card-icon">{f.icon}</div>
                <h3 className="role-card-title">{f.title}</h3>
                <p className="role-card-desc">{f.desc}</p>
                <ul className="role-card-bullets">
                  {f.bullets.map(b => (
                    <li key={b}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <button className="role-card-btn" onClick={() => handleRoleClick(f.role)}>
                  {f.cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section id="testimonials" className="landing-testimonials">
        <div className="landing-container">
          <div className="section-eyebrow">COMMUNITY LOVE</div>
          <h2 className="landing-section-title">What Our Members Say</h2>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <img src={t.avatar} alt={t.name} />
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role} · VendorVerse</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="landing-final-cta">
        <div className="landing-container">
          <div className="final-cta-card">
            <div className="final-cta-orb-1" />
            <div className="final-cta-orb-2" />
            <img src={logoImg} alt="VendorVerse" className="final-cta-logo" />
            <h2 className="final-cta-title">Ready to join VendorVerse?</h2>
            <p className="final-cta-sub">Join thousands of buyers and sellers already thriving on our platform.</p>
            <div className="final-cta-btns">
              <button className="landing-cta-primary" onClick={() => navigate('/signup')}>Create Free Account →</button>
              <button className="landing-btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => navigate('/login')}>Sign In</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-inner">
            <div className="landing-brand">
              <img src={logoImg} alt="VendorVerse" className="landing-brand-logo" />
              <span className="landing-brand-text">Vendor<span>Verse</span></span>
            </div>
            <p className="landing-footer-copy">© 2026 VendorVerse. All rights reserved. Built for every role in the marketplace.</p>
            <div className="landing-footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
