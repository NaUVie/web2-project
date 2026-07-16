import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Lock, FileText, CheckCircle, Eye } from 'lucide-react';

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

  const location = useLocation();
  // User orders
  const [orders, setOrders] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [activeTab, setActiveTab] = useState('info'); // 'info', 'password', 'orders'
  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Sync tab with URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');
    if (tab && ['info', 'password', 'orders'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const [currentPage, setCurrentPage] = useState(1);

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
      case 'PAID': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
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
              onClick={() => { setActiveTab('orders'); setInfoMsg({ type: '', text: '' }); setCurrentPage(1); }}
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
          {activeTab === 'orders' && (() => {
            const ordersPerPage = 5;
            const totalPages = Math.ceil(orders.length / ordersPerPage);
            const indexOfLastOrder = currentPage * ordersPerPage;
            const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
            const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

            return (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  Lịch Sử Đơn Hàng ({orders.length})
                </h3>

                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                    Bạn chưa đặt đơn hàng nào tại Nexus Shop.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {currentOrders.map(order => {
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
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                  Phương thức: <strong>{order.paymentMethod === 'BANK' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng'}</strong>
                                  {order.paymentMethod === 'BANK' && (
                                    <>
                                      {' | Thanh toán: '}
                                      <span style={{ 
                                        fontWeight: 700, 
                                        color: order.paymentStatus === 'PAID' ? '#10b981' : order.paymentStatus === 'FAILED' ? '#ef4444' : '#f59e0b' 
                                      }}>
                                        {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : order.paymentStatus === 'FAILED' ? 'Thất bại' : 'Chờ thanh toán'}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <span 
                                className="badge" 
                                style={{
                                  backgroundColor: statusColor.bg,
                                  color: statusColor.text,
                                  fontWeight: 700
                                }}
                              >
                                {order.status === 'PENDING' ? 'Chờ xử lý' :
                                 order.status === 'CONFIRMED' ? 'Đã nhận' :
                                 order.status === 'SHIPPED' ? 'Đang vận chuyển' :
                                 order.status === 'DELIVERED' ? 'Đã giao' :
                                 order.status === 'CANCELLED' ? 'Đã hủy' : order.status}
                              </span>
                            </div>

                            {/* Item summary + view detail button */}
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                               <span style={{ color: 'var(--text-secondary)' }}>
                                 <strong>{order.items ? order.items.length : 0}</strong> loại &nbsp;·&nbsp; <strong>{order.items ? order.items.reduce((s, i) => s + i.quantity, 0) : 0}</strong> sản phẩm
                               </span>
                               <button
                                 onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                                 className="btn btn-secondary"
                                 style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                               >
                                 <Eye size={14} /> Xem chi tiết
                               </button>
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                        <button 
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', height: 'auto', fontSize: '0.85rem' }}
                        >
                          Trước
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`btn ${currentPage === p ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ 
                              padding: '0.4rem 0.8rem', 
                              height: 'auto', 
                              fontSize: '0.85rem',
                              minWidth: '32px'
                            }}
                          >
                            {p}
                          </button>
                        ))}
                        
                        <button 
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', height: 'auto', fontSize: '0.85rem' }}
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

        </div>

      </div>

      {/* ===== Order Detail Modal ===== */}
      {showOrderModal && selectedOrder && (
        <div
          onClick={() => setShowOrderModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass-panel animate-fade-in"
            style={{
              width: '100%', maxWidth: '680px',
              padding: '2rem', borderRadius: '16px',
              maxHeight: '90vh', overflowY: 'auto'
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Chi Tiết Đơn Hàng #{selectedOrder.id}</h3>
              <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.3rem', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* General info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <div>
                <div style={{ marginBottom: '0.4rem' }}>Mã đơn: <strong style={{ color: 'var(--accent-primary)' }}>#{selectedOrder.id}</strong></div>
                <div style={{ marginBottom: '0.4rem' }}>Ngày đặt: <strong>{selectedOrder.orderedDate || '-'}</strong></div>
                <div>Trạng thái:
                  <span style={{
                    marginLeft: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                    backgroundColor: selectedOrder.status === 'DELIVERED' ? 'rgba(16,185,129,0.15)' : selectedOrder.status === 'CANCELLED' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: selectedOrder.status === 'DELIVERED' ? '#34d399' : selectedOrder.status === 'CANCELLED' ? '#f87171' : '#fbbf24'
                  }}>
                    {selectedOrder.status === 'PENDING' ? 'Chờ xử lý' : selectedOrder.status === 'CONFIRMED' ? 'Đã nhận' : selectedOrder.status === 'SHIPPED' ? 'Đang vận chuyển' : selectedOrder.status === 'DELIVERED' ? 'Đã giao' : 'Đã hủy'}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '0.4rem' }}>Phương thức: <strong>{selectedOrder.paymentMethod === 'BANK' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng'}</strong></div>
                <div style={{ marginBottom: '0.4rem' }}>Thanh toán:
                  <span style={{
                    marginLeft: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                    backgroundColor: selectedOrder.paymentStatus === 'PAID' ? 'rgba(16,185,129,0.15)' : selectedOrder.paymentStatus === 'FAILED' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: selectedOrder.paymentStatus === 'PAID' ? '#34d399' : selectedOrder.paymentStatus === 'FAILED' ? '#f87171' : '#fbbf24'
                  }}>
                    {selectedOrder.paymentStatus === 'PAID' ? 'Đã thanh toán' : selectedOrder.paymentStatus === 'FAILED' ? 'Thất bại' : 'Chờ thanh toán'}
                  </span>
                </div>
                <div>🚚 Giao đến: <strong>{selectedOrder.shippingAddress || 'Chưa cung cấp'}</strong></div>
              </div>
            </div>

            {/* Items list */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>Danh Sách Sản Phẩm</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {selectedOrder.items && selectedOrder.items.map(item => {
                const unitPrice = item.product ? (item.product.promoPrice || item.product.price) : 0;
                const subTotal = item.subTotal || item.subtotal || (unitPrice * item.quantity);
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.productName} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <div style={{ width: '52px', height: '52px', backgroundColor: 'var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>No image</div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.product?.productName || 'Sản phẩm'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Đơn giá: {parseFloat(unitPrice).toLocaleString('vi-VN')} đ</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>Số lượng: <strong>x{item.quantity}</strong></div>
                      <strong style={{ color: 'var(--accent-primary)' }}>{parseFloat(subTotal).toLocaleString('vi-VN')} đ</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                Tổng tiền: {parseFloat(selectedOrder.total || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setShowOrderModal(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', height: 'auto' }}>Đóng</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
