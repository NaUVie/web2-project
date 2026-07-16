import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart({ cart, onUpdateQuantity, onRemoveFromCart, user, openAuthModal }) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);

  // Select all items in cart by default on mount or when cart size changes
  useEffect(() => {
    setSelectedIds(cart.map(item => item.product.id));
  }, [cart.length]);

  const handleToggleSelect = (productId) => {
    setSelectedIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map(item => item.product.id));
    }
  };

  const getSelectedItems = () => {
    return cart.filter(item => selectedIds.includes(item.product.id));
  };

  const getSubtotal = () => {
    return getSelectedItems().reduce((total, item) => {
      const price = item.product.promoPrice ? parseFloat(item.product.promoPrice) : parseFloat(item.product.price);
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckoutClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập trước khi tiến hành thanh toán.');
      openAuthModal();
    } else {
      const selectedItems = getSelectedItems();
      if (selectedItems.length === 0) {
        alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
        return;
      }
      navigate('/checkout', { state: { checkoutItems: selectedItems } });
    }
  };

  const subtotal = getSubtotal();
  const selectedCount = getSelectedItems().reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0 4rem 0', textAlign: 'left' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Giỏ Hàng Của Bạn</h1>

      {cart.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '4rem 2rem',
          borderRadius: '16px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <ShoppingBag size={64} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h3>Giỏ hàng đang trống</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Hãy chọn những sản phẩm công nghệ tuyệt vời và thêm vào giỏ hàng của bạn!</p>
          </div>
          <Link to="/shop" className="btn btn-primary">
            Quay lại cửa hàng
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '2rem',
          alignItems: 'start'
        }}>
          
          {/* Cart list items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Select All Bar */}
            <div className="glass-panel" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleAll}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer'
                }}
              />
              <span>Chọn tất cả ({cart.length} sản phẩm)</span>
            </div>

            {cart.map(item => {
              const actualPrice = item.product.promoPrice ? parseFloat(item.product.promoPrice) : parseFloat(item.product.price);
              const isSelected = selectedIds.includes(item.product.id);
              return (
                <div 
                  key={item.product.id}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    opacity: isSelected ? 1 : 0.65,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(item.product.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--accent-primary)',
                      cursor: 'pointer'
                    }}
                  />
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.productName} 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', backgroundColor: 'white' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                      <Link to={`/product/${item.product.id}`} style={{ color: 'var(--text-primary)' }}>
                        {item.product.productName}
                      </Link>
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.product.category}</span>
                  </div>

                  {/* Quantity controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-secondary)',
                    height: '34px'
                  }}>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      style={{ width: '30px', height: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                      -
                    </button>
                    <span style={{ width: '32px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      style={{ width: '30px', height: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Pricing */}
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {(actualPrice * item.quantity).toLocaleString('vi-VN')} đ
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {actualPrice.toLocaleString('vi-VN')} đ / cái
                    </div>
                  </div>

                  {/* Remove button */}
                  <button 
                    onClick={() => onRemoveFromCart(item.product.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '0.5rem'
                    }}
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            borderRadius: '16px',
            position: 'sticky',
            top: '100px'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Tóm Tắt Đơn Hàng
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Tổng số lượng:</span>
              <strong>{selectedCount} cái</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Giao hàng:</span>
              <strong>Miễn phí</strong>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '2rem', 
              borderTop: '1px solid var(--border-color)', 
              paddingTop: '1rem' 
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tổng tiền:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {subtotal.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="btn btn-primary"
              style={{ width: '100%', gap: '0.5rem', height: '46px', borderRadius: '8px' }}
            >
              Thanh Toán Ngay <ArrowRight size={16} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
