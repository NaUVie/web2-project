import React, { useState, useEffect } from 'react';
import { User, Lock, FileText, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function Profile({ user }) {
  // Profile details state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [locality, setLocality] = useState('');
  const [country, setCountry] = useState('');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // User orders
  const [orders, setOrders] = useState([]);

  const [activeTab, setActiveTab] = useState('info'); // 'info', 'password', 'orders'
  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Load user data
  useEffect(() => {
    if (user && user.userId) {
      // Profile Info
      api.getUserProfile(user.userId).then(profile => {
        if (profile && profile.userDetails) {
          const det = profile.userDetails;
          setFirstName(det.firstName || '');
          setLastName(det.lastName || '');
          setEmail(det.email || '');
          setPhoneNumber(det.phoneNumber || '');
          setStreet(det.street || '');
          setStreetNumber(det.streetNumber || '');
          setZipCode(det.zipCode || '');
          setLocality(det.locality || '');
          setCountry(det.country || '');
        }
      }).catch(() => {});

      // User Orders
      api.getUserOrders(user.userId).then(data => {
        setOrders(data || []);
      }).catch(() => {});
    }
  }, [user]);

  // VN Phone Validation
  const validateVnPhone = (phone) => {
    const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;
    return vnPhoneRegex.test(phone);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setInfoMsg({ type: '', text: '' });

    if (phoneNumber && !validateVnPhone(phoneNumber)) {
      setInfoMsg({ type: 'error', text: 'Số điện thoại Việt Nam không đúng định dạng (VD: 0987654321)' });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userDetails: {
          firstName,
          lastName,
          email,
          phoneNumber,
          street,
          streetNumber,
          zipCode,
          locality,
          country
        }
      };
      await api.updateUserProfile(user.userId, payload);
      setInfoMsg({ type: 'success', text: 'Cập nhật thông tin hồ sơ thành công!' });
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.message || 'Lỗi khi cập nhật thông tin' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setInfoMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setInfoMsg({ type: 'error', text: 'Mật khẩu phải dài tối thiểu 6 ký tự' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setInfoMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setLoading(true);

    try {
      await api.changePassword(user.userId, newPassword);
      setInfoMsg({ type: 'success', text: 'Cập nhật mật khẩu mới thành công!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.message || 'Lỗi khi thay đổi mật khẩu' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
      case 'CONFIRMED': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
      case 'SHIPPED': return { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6' };
      case 'DELIVERED': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
      case 'CANCELLED': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
      default: return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af' };
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <h3>Yêu cầu đăng nhập</h3>
          <p style={{ margin: '1rem 0' }}>Vui lòng đăng nhập tài khoản để xem thông tin hồ sơ và đơn hàng cá nhân.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0 4rem 0', textAlign: 'left' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Hồ Sơ Cá Nhân</h1>

      {infoMsg.text && (
        <div style={{
          backgroundColor: infoMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: infoMsg.type === 'success' ? '#34d399' : '#f87171',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          fontWeight: 600
        }}>
          {infoMsg.type === 'success' ? '✓' : '⚠️'} {infoMsg.text}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        
        {/* Navigation Sidebar */}
        <aside className="glass-panel" style={{ padding: '1rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => { setActiveTab('info'); setInfoMsg({ type: '', text: '' }); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'info' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'info' ? 'white' : 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <User size={18} /> Thông tin cá nhân
            </button>

            <button 
              onClick={() => { setActiveTab('password'); setInfoMsg({ type: '', text: '' }); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'password' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'password' ? 'white' : 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Lock size={18} /> Đổi mật khẩu
            </button>

            <button 
              onClick={() => { setActiveTab('orders'); setInfoMsg({ type: '', text: '' }); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'orders' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'orders' ? 'white' : 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <FileText size={18} /> Đơn hàng của tôi
            </button>
          </div>
        </aside>

        {/* Tab Content Display */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
          
          {/* Tab 1: Profile Info Form */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Thông Tin Hồ Sơ
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Họ</label>
                  <input type="text" placeholder="Họ" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên</label>
                  <input type="text" placeholder="Tên" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email liên hệ</label>
                  <input type="email" placeholder="example@gmail.com" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input type="text" placeholder="0987654321" className="form-input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                Địa Chỉ Giao Hàng
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Số nhà</label>
                  <input type="text" placeholder="Số 10" className="form-input" value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Đường</label>
                  <input type="text" placeholder="Đường 3/2" className="form-input" value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tỉnh / Thành phố</label>
                  <input type="text" placeholder="TP. Hồ Chí Minh" className="form-input" value={locality} onChange={(e) => setLocality(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Quốc gia</label>
                  <input type="text" placeholder="Việt Nam" className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mã Zip</label>
                  <input type="text" placeholder="700000" className="form-input" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '1.5rem', height: '42px' }}>
                {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </form>
          )}

          {/* Tab 2: Change Password Form */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Thay Đổi Mật Khẩu
              </h3>

              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label className="form-label">Mật khẩu mới</label>
                <input 
                  type="password" 
                  required 
                  placeholder="Tối thiểu 6 ký tự" 
                  className="form-input" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  className="form-input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem', height: '42px' }}>
                {loading ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
              </button>
            </form>
          )}

          {/* Tab 3: Order History Panel */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Lịch Sử Đơn Hàng ({orders.length})
              </h3>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  Bạn chưa đặt đơn hàng nào tại Nexus Shop.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {orders.map(order => {
                    const statusColor = getStatusColor(order.status);
                    return (
                      <div 
                        key={order.id}
                        style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          backgroundColor: 'var(--bg-secondary)'
                        }}
                      >
                        {/* Order info header */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid var(--border-color)',
                          paddingBottom: '0.75rem',
                          marginBottom: '0.75rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Đơn hàng #{order.id}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                              Ngày đặt: {order.orderedDate}
                            </span>
                          </div>
                          
                          <span 
                            className="badge" 
                            style={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              fontWeight: 700
                            }}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Order items list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          {order.items && order.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {item.product ? item.product.productName : 'Sản phẩm'} <strong style={{ color: 'var(--text-primary)' }}>x{item.quantity}</strong>
                              </span>
                              <strong style={{ color: 'var(--text-primary)' }}>
                                {(item.product ? parseFloat(item.product.price) * item.quantity : 0).toLocaleString('vi-VN')} đ
                              </strong>
                            </div>
                          ))}
                        </div>

                        {/* Order Delivery & Total footer */}
                        <div style={{
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          <div>
                            🚚 Địa chỉ giao: <strong>{order.shippingAddress || 'Chưa cung cấp'}</strong>
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            Tổng tiền: {parseFloat(order.total || 0).toLocaleString('vi-VN')} đ
                          </div>
                        </div>

                        {order.status?.toUpperCase() === 'PENDING' && order.paymentMethod?.toUpperCase() === 'BANK' && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                            <button
                              onClick={async () => {
                                try {
                                  setInfoMsg({ type: '', text: '' });
                                  const response = await api.getOrderPaymentUrl(order.id);
                                  if (response.paymentUrl) {
                                    window.location.href = response.paymentUrl;
                                  }
                                } catch (err) {
                                  setInfoMsg({ type: 'error', text: err.message || 'Lỗi khi tạo link thanh toán' });
                                }
                              }}
                              className="btn btn-primary"
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.85rem',
                                height: 'auto',
                                cursor: 'pointer'
                              }}
                            >
                              💳 Thanh toán lại qua VNPay
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
