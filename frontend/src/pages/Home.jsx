import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingCart, Percent, Zap } from 'lucide-react';
import { api } from '../utils/api';

export default function Home({ onAddToCart }) {
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
        // Mock fallback if empty
        setBanners([
          { id: 1, title: 'Siêu Phẩm Công Nghệ - Giá Sốc Hè 2026', imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&auto=format&fit=crop&q=80', targetUrl: '/shop?category=Electronics' },
          { id: 2, title: 'Thiết Bị Âm Thanh Đỉnh Cao - Giảm Đến 30%', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&auto=format&fit=crop&q=80', targetUrl: '/shop?category=Audio' },
          { id: 3, title: 'Thời Trang Giày Thể Thao Mới Nhất', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80', targetUrl: '/shop?category=Footwear' }
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

  // Auto transition banners every 5 seconds
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % banners.length);
  };

  // Calculate discount percentage
  const getDiscountPercent = (price, promoPrice) => {
    if (!promoPrice) return 0;
    const p = parseFloat(price);
    const pp = parseFloat(promoPrice);
    if (p <= pp) return 0;
    return Math.round(((p - pp) / p) * 100);
  };

  const discountedProducts = products.filter(p => p.promoPrice != null);
  const latestProducts = [...products].reverse().slice(0, 4);

  return (
    <div style={{ paddingBottom: '3rem' }} className="animate-fade-in">
      
      {/* 1. Slider Banner (Hero Banner) */}
      {banners.length > 0 && (
        <section style={{
          position: 'relative',
          height: '420px',
          width: '100%',
          overflow: 'hidden',
          borderRadius: '16px',
          margin: '1.5rem 0',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out',
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%), url(${banner.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                padding: '3.5rem',
                color: 'white',
                textAlign: 'left'
              }}
            >
              {index === currentSlide && (
                <div className="animate-fade-in">
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                    {banner.title}
                  </h1>
                  <button 
                    onClick={() => navigate(banner.targetUrl || '/shop')}
                    className="btn btn-primary"
                    style={{ borderRadius: '25px', padding: '0.75rem 1.75rem' }}
                  >
                    Xem Ngay
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Slider Controls - Glassmorphism */}
          <button 
            onClick={handlePrevSlide}
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
          >
            <ArrowLeft size={20} />
          </button>

          <button 
            onClick={handleNextSlide}
            style={{
              position: 'absolute',
              right: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
          >
            <ArrowRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem'
          }}>
            {banners.map((_, idx) => (
              <span 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: idx === currentSlide ? 'var(--accent-primary)' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Popular Categories menu */}
      <section className="container" style={{ margin: '3rem 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Danh Mục Phổ Biến</h2>
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
              className="glass-panel"
              style={{
                padding: '1rem 2rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale Section */}
      {discountedProducts.length > 0 && (
        <section className="container" style={{ margin: '3rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Zap size={24} style={{ color: 'var(--accent-secondary)' }} />
            <h2>Sản Phẩm Giảm Giá Sốc</h2>
          </div>
          <div className="product-grid">
            {discountedProducts.map(p => {
              const discount = getDiscountPercent(p.price, p.promoPrice);
              return (
                <div key={p.id} className="glass-panel" style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform var(--transition-normal)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* Discount Badge */}
                  <span className="badge badge-discount" style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                    <Percent size={12} /> {discount}% OFF
                  </span>

                  <Link to={`/product/${p.id}`}>
                    <img 
                      src={p.imageUrl} 
                      alt={p.productName} 
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                    />
                  </Link>
                  <div style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/product/${p.id}`} style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                      {p.productName}
                    </Link>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{p.category}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {p.availability > 0 ? (
                        <span style={{ fontSize: '0.75rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                          Còn {p.availability} sp
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.12)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                          Hết hàng
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{parseFloat(p.promoPrice).toLocaleString('vi-VN')} đ</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{parseFloat(p.price).toLocaleString('vi-VN')} đ</span>
                    </div>

                    <button 
                      disabled={p.availability <= 0}
                      onClick={() => onAddToCart(p)}
                      className="btn btn-primary"
                      style={{ width: '100%', gap: '0.5rem', opacity: p.availability <= 0 ? 0.6 : 1, cursor: p.availability <= 0 ? 'not-allowed' : 'pointer' }}
                    >
                      <ShoppingCart size={16} /> {p.availability > 0 ? 'Thêm Vào Giỏ' : 'Hết Hàng'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Latest Products */}
      <section className="container" style={{ margin: '3rem 0' }}>
        <h2 style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Sản Phẩm Mới Nhất</h2>
        <div className="product-grid">
          {latestProducts.map(p => (
            <div key={p.id} className="glass-panel" style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform var(--transition-normal)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Link to={`/product/${p.id}`}>
                <img 
                  src={p.imageUrl} 
                  alt={p.productName} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                />
              </Link>
              <div style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Link to={`/product/${p.id}`} style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  {p.productName}
                </Link>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{p.category}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {p.availability > 0 ? (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                      Còn {p.availability} sp
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.12)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                      Hết hàng
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', marginBottom: '1rem' }}>
                  {p.promoPrice ? (
                    <>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{parseFloat(p.promoPrice).toLocaleString('vi-VN')} đ</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{parseFloat(p.price).toLocaleString('vi-VN')} đ</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{parseFloat(p.price).toLocaleString('vi-VN')} đ</span>
                  )}
                </div>

                <button 
                  disabled={p.availability <= 0}
                  onClick={() => onAddToCart(p)}
                  className="btn btn-primary"
                  style={{ width: '100%', gap: '0.5rem', opacity: p.availability <= 0 ? 0.6 : 1, cursor: p.availability <= 0 ? 'not-allowed' : 'pointer' }}
                >
                  <ShoppingCart size={16} /> {p.availability > 0 ? 'Thêm Vào Giỏ' : 'Hết Hàng'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
