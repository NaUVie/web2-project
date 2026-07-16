import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';

export default function Checkout({ cart, user, onClearCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutItems = location.state?.checkoutItems || cart;

  // Shipping details form
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'BANK'

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  // Auto pre-fill from user profile
  useEffect(() => {
    if (user && user.userId) {
      api.getUserProfile(user.userId).then(profile => {
        if (profile && profile.userDetails) {
          const det = profile.userDetails;
          setFullName(`${det.lastName || ''} ${det.firstName || ''}`.trim());
          setPhoneNumber(det.phoneNumber || '');
          const addr = [det.streetNumber, det.street, det.locality, det.locality, det.country]
            .filter(Boolean)
            .join(', ');
          setShippingAddress(addr || '');
        }
      }).catch(() => {});
    }
  }, [user]);

  // VN Phone Validation
  const validateVnPhone = (phone) => {
    const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;
    return vnPhoneRegex.test(phone);
  };

  const getSubtotal = () => {
    return checkoutItems.reduce((total, item) => {
      const price = item.product.promoPrice ? parseFloat(item.product.promoPrice) : parseFloat(item.product.price);
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng điền họ tên người nhận');
      return;
    }
    if (!validateVnPhone(phoneNumber)) {
      setErrorMsg('Số điện thoại Việt Nam không đúng định dạng (VD: 0987654321)');
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setLoading(true);

    try {
      const shippingPayload = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod,
        returnUrl: window.location.origin + '/payment-result',
        productIds: checkoutItems.map(item => item.product.id).join(',')
      };

      const response = await api.placeOrder(user.userId, checkoutItems, shippingPayload);
      if (response.paymentUrl) {
        localStorage.setItem('nexus_checkout_items', JSON.stringify(checkoutItems.map(item => item.product.id)));
        window.location.href = response.paymentUrl;
        return;
      }
      
      const resultOrder = response.order;
      setPlacedOrderId(resultOrder.id);
      setOrderSuccess(true);
      onClearCart(checkoutItems.map(item => item.product.id));
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi hệ thống khi thanh toán đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getSubtotal();

  // If order was successfully completed
  if (orderSuccess) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="glass-panel animate-fade-in" style={{
          padding: '4rem 2rem',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <CheckCircle2 size={72} style={{ color: '#10b981' }} />
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Đặt Hàng Thành Công!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Cảm ơn bạn đã lựa chọn mua sắm sản phẩm công nghệ tại Nexus Shop.</p>
          </div>

          <div style={{
            padding: '1rem 2rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            width: '100%',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>Mã đơn hàng: <strong style={{ color: 'var(--accent-primary)' }}>#{placedOrderId}</strong></div>
            <div style={{ marginBottom: '0.5rem' }}>Người nhận: <strong>{fullName}</strong></div>
            <div style={{ marginBottom: '0.5rem' }}>Số điện thoại: <strong>{phoneNumber}</strong></div>
            <div>Địa chỉ giao: <strong>{shippingAddress}</strong></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/shop')}>Tiếp tục mua sắm</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/profile?tab=orders')}>Xem đơn hàng</button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and page was refreshed
  if (checkoutItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <h3>Không có gì để thanh toán</h3>
          <p style={{ margin: '1rem 0' }}>Giỏ hàng của bạn đang trống.</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Quay lại cửa hàng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0 4rem 0', textAlign: 'left' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Thanh Toán Đơn Hàng</h1>

      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          padding: '0.75rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          fontWeight: 600
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        
        {/* Checkout Shipping Form */}
        <form onSubmit={handleCheckoutSubmit}>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Thông Tin Giao Hàng
            </h3>

            <div className="form-group">
              <label className="form-label">Họ tên người nhận</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="Nguyễn Văn A" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại liên hệ</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="VD: 0987654321" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ nhận hàng chi tiết</label>
              <textarea 
                className="form-input" 
                required 
                rows="3" 
                placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành..." 
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            {/* Payment method selection */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Phương thức thanh toán</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: `2px solid ${paymentMethod === 'COD' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    backgroundColor: 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="COD" 
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Thanh toán COD</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Thanh toán khi nhận hàng</div>
                  </div>
                </label>

                <label 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: `2px solid ${paymentMethod === 'BANK' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    backgroundColor: 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="BANK" 
                    checked={paymentMethod === 'BANK'}
                    onChange={() => setPaymentMethod('BANK')}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Chuyển khoản</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Qua cổng ngân hàng</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </form>

        {/* Right side summary panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Đơn hàng của bạn</h3>
          
          {/* List items mini preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {checkoutItems.map(item => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {item.product.productName} <strong style={{ color: 'var(--text-primary)' }}>x{item.quantity}</strong>
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {((item.product.promoPrice ? parseFloat(item.product.promoPrice) : parseFloat(item.product.price)) * item.quantity).toLocaleString('vi-VN')} đ
                </strong>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.85rem' }}>
            <span>Phí giao hàng:</span>
            <strong>Miễn phí</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '1.1rem', fontWeight: 800 }}>
            <span>Tổng số tiền:</span>
            <span style={{ color: 'var(--accent-primary)' }}>{subtotal.toLocaleString('vi-VN')} đ</span>
          </div>

          <button 
            onClick={handleCheckoutSubmit}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', height: '46px', borderRadius: '8px', fontSize: '0.95rem' }}
          >
            {loading ? 'Đang hoàn tất đơn hàng...' : 'Xác Nhận Đặt Hàng'}
          </button>
        </div>

      </div>

    </div>
  );
}
