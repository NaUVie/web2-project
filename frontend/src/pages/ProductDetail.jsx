import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';

export default function ProductDetail({ onAddToCart, onBuyNow }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedAlert, setAddedAlert] = useState(false);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

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

  // Set default variants on product load
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
      const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
      if (colors.length > 0) setSelectedColor(colors[0]);
      if (sizes.length > 0) setSelectedSize(sizes[0]);
    } else {
      setSelectedColor(null);
      setSelectedSize(null);
    }
  }, [product]);

  // Determine active variant
  const activeVariant = product?.variants?.find(v => 
    (selectedColor ? v.color === selectedColor : true) &&
    (selectedSize ? v.size === selectedSize : true)
  );

  const displayPrice = activeVariant && activeVariant.price ? activeVariant.price : (product?.promoPrice || product?.price);
  const hasPromoPrice = product?.promoPrice && !(activeVariant && activeVariant.price);
  const displayAvailability = activeVariant ? activeVariant.availability : (product ? product.availability : 0);
  const isAvailable = displayAvailability > 0;

  const handleAddToCart = () => {
    if (product) {
      onAddToCart(product, quantity, selectedColor, selectedSize);
      setAddedAlert(true);
      setTimeout(() => setAddedAlert(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      onBuyNow(product, quantity, selectedColor, selectedSize);
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

  const colors = product.variants ? [...new Set(product.variants.map(v => v.color).filter(Boolean))] : [];
  const sizes = product.variants ? [...new Set(product.variants.map(v => v.size).filter(Boolean))] : [];

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
              src={activeVariant?.imageUrl || product.imageUrl} 
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
                <Check size={14} /> Còn hàng ({displayAvailability} sản phẩm)
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
            {hasPromoPrice ? (
              <>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{parseFloat(product.promoPrice).toLocaleString('vi-VN')} đ</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{parseFloat(product.price).toLocaleString('vi-VN')} đ</span>
                <span className="badge badge-discount" style={{ fontWeight: 700 }}>
                  GIẢM {Math.round(((parseFloat(product.price) - parseFloat(product.promoPrice)) / parseFloat(product.price)) * 100)}%
                </span>
              </>
            ) : (
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{parseFloat(displayPrice).toLocaleString('vi-VN')} đ</span>
            )}
          </div>

          {/* Color Selector */}
          {colors.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Chọn màu sắc:</h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '8px',
                      border: selectedColor === color ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      backgroundColor: selectedColor === color ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                      color: selectedColor === color ? 'var(--accent-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Chọn kích thước / dung lượng:</h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {sizes.map(size => {
                  const isAvailableForColor = product.variants?.some(v => 
                    v.size === size && (selectedColor ? v.color === selectedColor : true) && v.availability > 0
                  );
                  return (
                    <button
                      key={size}
                      disabled={!isAvailableForColor}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '8px',
                        border: selectedSize === size ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: selectedSize === size ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                        color: selectedSize === size ? 'var(--accent-primary)' : 'var(--text-primary)',
                        cursor: isAvailableForColor ? 'pointer' : 'not-allowed',
                        opacity: isAvailableForColor ? 1 : 0.5,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
                  onClick={() => setQuantity(q => Math.min(displayAvailability, q + 1))}
                  style={{ width: '40px', height: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button 
                onClick={handleAddToCart}
                className="btn btn-secondary"
                style={{ height: '46px', padding: '0 1.5rem', borderRadius: '8px', flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}
              >
                <ShoppingCart size={18} /> Thêm Vào Giỏ
              </button>

              {/* Buy now */}
              <button 
                onClick={handleBuyNow}
                className="btn btn-primary"
                style={{ height: '46px', padding: '0 1.5rem', borderRadius: '8px', flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                💳 Mua Ngay
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
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <button 
                      disabled={p.availability <= 0}
                      onClick={() => onAddToCart(p)}
                      className="btn btn-secondary"
                      style={{ 
                        flex: 1,
                        borderRadius: '8px',
                        padding: '0.6rem 0.5rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        border: '1px solid var(--border-color)',
                        opacity: p.availability <= 0 ? 0.6 : 1,
                        cursor: p.availability <= 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ShoppingCart size={14} /> Thêm Giỏ
                    </button>
                    
                    <button 
                      disabled={p.availability <= 0}
                      onClick={() => onBuyNow(p)}
                      className="btn btn-primary"
                      style={{ 
                        flex: 1,
                        borderRadius: '8px',
                        padding: '0.6rem 0.5rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        opacity: p.availability <= 0 ? 0.6 : 1,
                        cursor: p.availability <= 0 ? 'not-allowed' : 'pointer',
                        background: p.availability > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                        border: 'none'
                      }}
                    >
                      💳 Mua Ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
