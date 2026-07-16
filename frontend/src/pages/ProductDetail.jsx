import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';

export default function ProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedAlert, setAddedAlert] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProductById(id)
      .then(data => {
        setProduct(data);
        setQuantity(1);
        
        // Fetch similar products (same category)
        api.getProducts().then(allProds => {
          const filtered = allProds.filter(p => p.category === data.category && p.id !== data.id).slice(0, 4);
          setSimilarProducts(filtered);
        });
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity);
      setAddedAlert(true);
      setTimeout(() => setAddedAlert(false), 2000);
    }
  };

  if (loading) {
    return <div style={{ padding: '6rem 0', fontSize: '1.2rem', fontWeight: 600 }}>Đang tải thông tin sản phẩm...</div>;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '12px' }}>
          <h3>Không tìm thấy sản phẩm</h3>
          <p style={{ margin: '1rem 0' }}>Sản phẩm bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Quay lại cửa hàng</button>
        </div>
      </div>
    );
  }

  const isAvailable = product.availability > 0;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0 4rem 0', textAlign: 'left' }}>
      
      {/* Breadcrumbs & Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Link to="/">Trang chủ</Link> / <Link to="/shop">Cửa hàng</Link> / <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.productName}</span>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}
        >
          <ArrowLeft size={14} /> Quay lại
        </button>
      </div>

      {/* Main product display */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        marginBottom: '4rem'
      }}>
        
        {/* Product image */}
        <div>
          <div className="glass-panel" style={{
            padding: '1rem',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '420px',
            backgroundColor: 'white'
          }}>
            <img 
              src={product.imageUrl} 
              alt={product.productName} 
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>

        {/* Product info details */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {product.category}
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1rem' }}>
            {product.productName}
          </h1>

          {/* Availability badge */}
          <div style={{ marginBottom: '1.5rem' }}>
            {isAvailable ? (
              <span className="badge badge-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Check size={14} /> Còn hàng ({product.availability} sản phẩm)
              </span>
            ) : (
              <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={14} /> Hết hàng
              </span>
            )}
          </div>

          {/* Pricing */}
          <div style={{
            padding: '1.25rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-tertiary)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {product.promoPrice ? (
              <>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{parseFloat(product.promoPrice).toLocaleString('vi-VN')} đ</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{parseFloat(product.price).toLocaleString('vi-VN')} đ</span>
                <span className="badge badge-discount" style={{ fontWeight: 700 }}>
                  GIẢM {Math.round(((parseFloat(product.price) - parseFloat(product.promoPrice)) / parseFloat(product.price)) * 100)}%
                </span>
              </>
            ) : (
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{parseFloat(product.price).toLocaleString('vi-VN')} đ</span>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Mô tả sản phẩm</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {product.discription}
            </p>
          </div>

          {/* Action buttons */}
          {isAvailable && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              {/* Quantity Selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                height: '46px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: '40px', height: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}
                >
                  -
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontSize: '0.95rem', fontWeight: 700 }}>
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.availability, q + 1))}
                  style={{ width: '40px', height: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button 
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ height: '46px', padding: '0 2rem', borderRadius: '8px', flex: 1, minWidth: '180px' }}
              >
                <ShoppingCart size={18} /> Thêm Vào Giỏ Hàng
              </button>
            </div>
          )}

          {/* Added successfully alert */}
          {addedAlert && (
            <div style={{
              marginTop: '1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              padding: '0.75rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              ✓ Đã thêm sản phẩm vào giỏ hàng thành công!
            </div>
          )}

        </div>

      </div>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Sản Phẩm Tương Tự</h2>
          <div className="product-grid">
            {similarProducts.map(p => (
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
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                  />
                </Link>
                 <div style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Link to={`/product/${p.id}`} style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                    {p.productName}
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{p.category}</div>
                  
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
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{parseFloat(p.promoPrice).toLocaleString('vi-VN')} đ</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{parseFloat(p.price).toLocaleString('vi-VN')} đ</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{parseFloat(p.price).toLocaleString('vi-VN')} đ</span>
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
      )}

    </div>
  );
}
