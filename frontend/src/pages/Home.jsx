import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShoppingCart, 
  Percent, 
  Zap, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard, 
  Sparkles,
  TrendingUp,
  Flame,
  Award
} from 'lucide-react';
import { api } from '../utils/api';

export default function Home({ onAddToCart, onBuyNow }) {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // Load Home Data
  useEffect(() => {
    // Banners
    api.getBanners().then(data => {
      if (data && data.length > 0) {
        setBanners(data);
      } else {
        // Fallback banners
        setBanners([
          { id: 1, title: 'Siêu Phẩm Công Nghệ - Giá Sốc Hè 2026', subtitle: 'Trải nghiệm đỉnh cao công nghệ thế hệ mới với ưu đãi đặc quyền.', imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&auto=format&fit=crop&q=80', targetUrl: '/shop?category=Electronics' },
          { id: 2, title: 'Thiết Bị Âm Thanh Đỉnh Cao - Giảm Đến 30%', subtitle: 'Âm thanh chân thực, sống động từng khoảnh khắc.', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80', targetUrl: '/shop?category=Audio' },
          { id: 3, title: 'Thời Trang Giày Thể Thao Mới Nhất', subtitle: 'Khởi đầu phong cách năng động và bứt phá giới hạn.', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80', targetUrl: '/shop?category=Footwear' }
        ]);
      }
    }).catch(() => {});

    // Categories
    api.getCategories().then(data => {
      if (data && data.length > 0) setCategories(data);
      else setCategories([
        { id: 1, name: 'Electronics', slug: 'electronics' },
        { id: 2, name: 'Audio', slug: 'audio' },
        { id: 3, name: 'Footwear', slug: 'footwear' },
        { id: 4, name: 'Accessories', slug: 'accessories' }
      ]);
    }).catch(() => {});

    // Products
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  // Auto transition banners
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % banners.length);
  };

  const getDiscountPercent = (price, promoPrice) => {
    if (!promoPrice) return 0;
    const p = parseFloat(price);
    const pp = parseFloat(promoPrice);
    if (p <= pp) return 0;
    return Math.round(((p - pp) / p) * 100);
  };

  const discountedProducts = products.filter(p => p.promoPrice != null).slice(0, 4);
  const latestProducts = [...products].reverse().slice(0, 4);

  return (
    <div style={{ paddingBottom: '4rem', overflowX: 'hidden' }} className="animate-fade-in">
      {/* Dynamic CSS Styling Injector for Hover & Keyframe Animations */}
      <style>{`
        .hero-banner-zoom {
          transform: scale(1.03);
          transition: transform 6s ease;
        }
        .slide-active .hero-banner-zoom {
          transform: scale(1);
        }
        .glass-btn-arrow {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-btn-arrow:hover {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
          transform: translateY(-50%) scale(1.1);
        }
        .promo-pill {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 0.75rem;
          box-shadow: 0 4px 10px rgba(139, 92, 246, 0.25);
        }
        .feature-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--border-color);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent-primary);
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.06);
        }
        .cat-chip {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cat-chip:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(244, 114, 182, 0.05));
          border-color: var(--accent-primary);
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.08);
        }
        .premium-product-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-product-card:hover {
          transform: translateY(-8px);
          border-color: var(--accent-primary);
          box-shadow: 0 15px 35px rgba(139, 92, 246, 0.12);
        }
        .premium-product-card:hover .product-img {
          transform: scale(1.06);
        }
        .product-img {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .add-to-cart-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        .add-to-cart-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: all 0.5s;
        }
        .add-to-cart-btn:hover::before {
          left: 100%;
        }
        .glow-title {
          background: linear-gradient(to right, var(--text-primary) 30%, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* 1. HERO SLIDER */}
      {banners.length > 0 && (
        <section className="container" style={{ margin: '1rem auto 2.5rem' }}>
          <div style={{
            position: 'relative',
            height: '480px',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {banners.map((banner, index) => {
              const isActive = index === currentSlide;
              return (
                <div 
                  key={banner.id}
                  className={isActive ? "slide-active" : ""}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: isActive ? 1 : 0,
                    visibility: isActive ? 'visible' : 'hidden',
                    transition: 'opacity 0.8s ease-in-out, visibility 0.8s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start',
                    padding: '4.5rem 3.5rem',
                    color: 'white',
                    zIndex: isActive ? 2 : 1
                  }}
                >
                  {/* Zoom background cover image with fallback */}
                  <div 
                    className="hero-banner-zoom"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: -1,
                      backgroundImage: `linear-gradient(to top, rgba(11, 15, 25, 0.95) 15%, rgba(11, 15, 25, 0.3) 60%, rgba(11, 15, 25, 0.15) 100%), url(${banner.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  {isActive && (
                    <div style={{ maxWidth: '650px', zIndex: 5 }}>
                      <span className="promo-pill">
                        <Sparkles size={12} /> Special Edition
                      </span>
                      <h1 style={{ 
                        fontSize: '3rem', 
                        fontWeight: 800, 
                        marginBottom: '1rem', 
                        fontFamily: 'var(--font-heading)',
                        lineHeight: 1.15,
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                      }}>
                        {banner.title}
                      </h1>
                      <p style={{ 
                        fontSize: '1.1rem', 
                        color: 'rgba(255,255,255,0.85)', 
                        marginBottom: '2rem',
                        lineHeight: 1.5,
                        fontWeight: 400
                      }}>
                        {banner.subtitle || 'Khám phá thế giới sản phẩm cao cấp, chính hãng với giá cả tốt nhất thị trường.'}
                      </p>
                      <button 
                        onClick={() => navigate(banner.targetUrl || '/shop')}
                        className="btn btn-primary add-to-cart-btn"
                        style={{ 
                          borderRadius: '12px', 
                          padding: '0.85rem 2.25rem',
                          fontSize: '0.95rem',
                          boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)'
                        }}
                      >
                        Khám Phá Ngay <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Slider Controls */}
            <button 
              onClick={handlePrevSlide}
              className="glass-btn-arrow"
              style={{
                position: 'absolute',
                left: '1.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <ArrowLeft size={22} />
            </button>

            <button 
              onClick={handleNextSlide}
              className="glass-btn-arrow"
              style={{
                position: 'absolute',
                right: '1.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <ArrowRight size={22} />
            </button>

            {/* High-end Line Indicators */}
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              right: '3.5rem',
              display: 'flex',
              gap: '0.75rem',
              zIndex: 10
            }}>
              {banners.map((_, idx) => (
                <span 
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: idx === currentSlide ? '40px' : '15px',
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: idx === currentSlide ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. VALUE PROPOSITIONS BAR */}
      <section className="container" style={{ margin: '1rem auto 3rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}>
          <div className="feature-card" style={{
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              padding: '0.75rem',
              borderRadius: '14px',
              color: 'var(--accent-primary)'
            }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>Giao Hàng Miễn Phí</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cho mọi đơn từ 500.000 đ</p>
            </div>
          </div>

          <div className="feature-card" style={{
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(244, 114, 182, 0.1)',
              padding: '0.75rem',
              borderRadius: '14px',
              color: 'var(--accent-secondary)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>Bảo Hành Chính Hãng</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cam kết 100% chính hãng</p>
            </div>
          </div>

          <div className="feature-card" style={{
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '0.75rem',
              borderRadius: '14px',
              color: '#10b981'
            }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>Đổi Trả Dễ Dàng</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hoàn trả trong vòng 7 ngày</p>
            </div>
          </div>

          <div className="feature-card" style={{
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '0.75rem',
              borderRadius: '14px',
              color: '#3b82f6'
            }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>Thanh Toán Tiện Lợi</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hỗ trợ VNPay & Thẻ nội địa</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="container" style={{ margin: '3.5rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="glow-title" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Khám Phá Theo Danh Mục
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Tìm kiếm nhanh sản phẩm bạn cần theo phân loại phù hợp</p>
        </div>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          {categories.map(cat => (
            <Link 
              key={cat.id} 
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="cat-chip"
              style={{
                padding: '0.9rem 1.8rem',
                borderRadius: '16px',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Award size={16} style={{ color: 'var(--accent-primary)' }} />
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FLASH SALE */}
      {discountedProducts.length > 0 && (
        <section className="container" style={{ margin: '4rem auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-end', 
            marginBottom: '2rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                padding: '0.5rem',
                borderRadius: '12px'
              }}>
                <Flame size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Flash Sale Cuối Tuần</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nhanh tay sở hữu các sản phẩm giảm giá cực đậm!</p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.08)',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px'
            }}>
              <span style={{ animation: 'pulse 1.5s infinite' }}>●</span> Đang diễn ra
            </div>
          </div>

          <div className="product-grid">
            {discountedProducts.map(p => {
              const discount = getDiscountPercent(p.price, p.promoPrice);
              const isAvailable = p.availability > 0;
              // Stock progress percentage
              const stockPercent = Math.min(100, Math.max(0, Math.round((p.availability / 50) * 100)));

              return (
                <div 
                  key={p.id} 
                  className="premium-product-card" 
                  style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  {/* Discount Badge */}
                  <span 
                    className="badge badge-discount" 
                    style={{ 
                      position: 'absolute', 
                      top: '1.25rem', 
                      left: '1.25rem', 
                      zIndex: 10,
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      boxShadow: '0 4px 10px rgba(219, 39, 119, 0.15)'
                    }}
                  >
                    <Percent size={12} /> -{discount}%
                  </span>

                  <Link to={`/product/${p.id}`} style={{ overflow: 'hidden', borderRadius: '14px', marginBottom: '1.25rem' }}>
                    <img 
                      src={p.imageUrl} 
                      alt={p.productName} 
                      className="product-img"
                      style={{ 
                        width: '100%', 
                        height: '220px', 
                        objectFit: 'cover', 
                      }}
                    />
                  </Link>

                  <div style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/product/${p.id}`} style={{ 
                      fontWeight: 700, 
                      fontSize: '1.1rem', 
                      marginBottom: '0.35rem', 
                      color: 'var(--text-primary)',
                      lineHeight: 1.3
                    }}>
                      {p.productName}
                    </Link>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{p.category}</div>
                    
                    {/* Stock status indicator bar */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        <span>Sẵn có</span>
                        <span>{p.availability} sản phẩm</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${stockPercent}%`, 
                          height: '100%', 
                          background: isAvailable ? 'linear-gradient(90deg, #f43f5e, #10b981)' : '#ef4444', 
                          borderRadius: '99px',
                          transition: 'width 0.5s ease-in-out'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                        {parseFloat(p.promoPrice).toLocaleString('vi-VN')} đ
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {parseFloat(p.price).toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button 
                        disabled={!isAvailable}
                        onClick={() => onAddToCart(p)}
                        className="btn btn-secondary"
                        style={{ 
                          flex: 1,
                          borderRadius: '12px',
                          padding: '0.6rem 0.5rem',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          border: '1px solid var(--border-color)',
                          opacity: isAvailable ? 1 : 0.6,
                          cursor: isAvailable ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <ShoppingCart size={14} /> Thêm Giỏ
                      </button>
                      
                      <button 
                        disabled={!isAvailable}
                        onClick={() => onBuyNow(p)}
                        className="btn btn-primary"
                        style={{ 
                          flex: 1,
                          borderRadius: '12px',
                          padding: '0.6rem 0.5rem',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          opacity: isAvailable ? 1 : 0.6,
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          background: isAvailable ? 'var(--accent-primary)' : 'var(--text-muted)',
                          border: 'none'
                        }}
                      >
                        💳 Mua Ngay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. LATEST PRODUCTS */}
      <section className="container" style={{ margin: '4rem auto 2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--accent-primary)',
              padding: '0.5rem',
              borderRadius: '12px'
            }}>
              <TrendingUp size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Bộ Sưu Tập Mới Nhất</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cập nhật các sản phẩm công nghệ đón đầu xu hướng</p>
            </div>
          </div>

          <Link 
            to="/shop" 
            style={{ 
              fontSize: '0.875rem', 
              fontWeight: 700, 
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            Xem Tất Cả <ArrowRight size={16} />
          </Link>
        </div>

        <div className="product-grid">
          {latestProducts.map(p => {
            const isAvailable = p.availability > 0;
            return (
              <div 
                key={p.id} 
                className="premium-product-card" 
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <Link to={`/product/${p.id}`} style={{ overflow: 'hidden', borderRadius: '14px', marginBottom: '1.25rem' }}>
                  <img 
                    src={p.imageUrl} 
                    alt={p.productName} 
                    className="product-img"
                    style={{ 
                      width: '100%', 
                      height: '220px', 
                      objectFit: 'cover', 
                    }}
                  />
                </Link>

                <div style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Link to={`/product/${p.id}`} style={{ 
                    fontWeight: 700, 
                    fontSize: '1.1rem', 
                    marginBottom: '0.35rem', 
                    color: 'var(--text-primary)',
                    lineHeight: 1.3
                  }}>
                    {p.productName}
                  </Link>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{p.category}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {isAvailable ? (
                      <span className="badge badge-stock" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                        Còn hàng ({p.availability})
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#ef4444', 
                        backgroundColor: 'rgba(239, 68, 68, 0.12)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px', 
                        fontWeight: 600 
                      }}>
                        Hết hàng
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', marginBottom: '1.25rem' }}>
                    {p.promoPrice ? (
                      <>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                          {parseFloat(p.promoPrice).toLocaleString('vi-VN')} đ
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {parseFloat(p.price).toLocaleString('vi-VN')} đ
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                        {parseFloat(p.price).toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <button 
                      disabled={!isAvailable}
                      onClick={() => onAddToCart(p)}
                      className="btn btn-secondary"
                      style={{ 
                        flex: 1,
                        borderRadius: '12px',
                        padding: '0.6rem 0.5rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        border: '1px solid var(--border-color)',
                        opacity: isAvailable ? 1 : 0.6,
                        cursor: isAvailable ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <ShoppingCart size={14} /> Thêm Giỏ
                    </button>
                    
                    <button 
                      disabled={!isAvailable}
                      onClick={() => onBuyNow(p)}
                      className="btn btn-primary"
                      style={{ 
                        flex: 1,
                        borderRadius: '12px',
                        padding: '0.6rem 0.5rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        opacity: isAvailable ? 1 : 0.6,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        background: isAvailable ? 'var(--accent-primary)' : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      💳 Mua Ngay
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. PRODUCTS BY CATEGORY */}
      {categories.map(cat => {
        const catProducts = products.filter(p => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).slice(0, 4);
        if (catProducts.length === 0) return null;

        return (
          <section key={cat.id} className="container" style={{ margin: '4rem auto' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center', 
              marginBottom: '2rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: 'var(--accent-primary)',
                  padding: '0.5rem',
                  borderRadius: '12px'
                }}>
                  <Award size={26} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{cat.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bộ sưu tập các sản phẩm thuộc nhóm {cat.name}</p>
                </div>
              </div>

              <Link 
                to={`/shop?category=${encodeURIComponent(cat.name)}`} 
                style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 700, 
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                Xem Tất Cả <ArrowRight size={16} />
              </Link>
            </div>

            <div className="product-grid">
              {catProducts.map(p => {
                const isAvailable = p.availability > 0;
                const discount = getDiscountPercent(p.price, p.promoPrice);
                return (
                  <div 
                    key={p.id} 
                    className="premium-product-card" 
                    style={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative'
                    }}
                  >
                    {discount > 0 && (
                      <span 
                        className="badge badge-discount" 
                        style={{ 
                          position: 'absolute', 
                          top: '1.25rem', 
                          left: '1.25rem', 
                          zIndex: 10,
                          padding: '0.35rem 0.65rem',
                          borderRadius: '8px',
                          boxShadow: '0 4px 10px rgba(219, 39, 119, 0.15)'
                        }}
                      >
                        <Percent size={12} /> -{discount}%
                      </span>
                    )}

                    <Link to={`/product/${p.id}`} style={{ overflow: 'hidden', borderRadius: '14px', marginBottom: '1.25rem' }}>
                      <img 
                        src={p.imageUrl} 
                        alt={p.productName} 
                        className="product-img"
                        style={{ 
                          width: '100%', 
                          height: '220px', 
                          objectFit: 'cover', 
                        }}
                      />
                    </Link>

                    <div style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Link to={`/product/${p.id}`} style={{ 
                        fontWeight: 700, 
                        fontSize: '1.1rem', 
                        marginBottom: '0.35rem', 
                        color: 'var(--text-primary)',
                        lineHeight: 1.3
                      }}>
                        {p.productName}
                      </Link>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{p.category}</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {isAvailable ? (
                          <span className="badge badge-stock" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                            Còn hàng ({p.availability})
                          </span>
                        ) : (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#ef4444', 
                            backgroundColor: 'rgba(239, 68, 68, 0.12)', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '6px', 
                            fontWeight: 600 
                          }}>
                            Hết hàng
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', marginBottom: '1.25rem' }}>
                        {p.promoPrice ? (
                          <>
                            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                              {parseFloat(p.promoPrice).toLocaleString('vi-VN')} đ
                            </span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              {parseFloat(p.price).toLocaleString('vi-VN')} đ
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                            {parseFloat(p.price).toLocaleString('vi-VN')} đ
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <button 
                          disabled={!isAvailable}
                          onClick={() => onAddToCart(p)}
                          className="btn btn-secondary"
                          style={{ 
                            flex: 1,
                            borderRadius: '12px',
                            padding: '0.6rem 0.5rem',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            border: '1px solid var(--border-color)',
                            opacity: isAvailable ? 1 : 0.6,
                            cursor: isAvailable ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <ShoppingCart size={14} /> Thêm Giỏ
                        </button>
                        
                        <button 
                          disabled={!isAvailable}
                          onClick={() => onBuyNow(p)}
                          className="btn btn-primary"
                          style={{ 
                            flex: 1,
                            borderRadius: '12px',
                            padding: '0.6rem 0.5rem',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            opacity: isAvailable ? 1 : 0.6,
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            background: isAvailable ? 'var(--accent-primary)' : 'var(--text-muted)',
                            border: 'none'
                          }}
                        >
                          💳 Mua Ngay
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

