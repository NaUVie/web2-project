import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Login({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const navigate = useNavigate();

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // Feedback State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // VN Phone Validation Helper
  const validateVnPhone = (phone) => {
    const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;
    return vnPhoneRegex.test(phone);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const data = await api.login(loginUsername, loginPassword);
      setSuccessMsg('Đăng nhập thành công!');
      onLoginSuccess(data);
      setTimeout(() => {
        if (data.role === 'ROLE_ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Sai tên đăng nhập hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu phải dài tối thiểu 6 ký tự');
      return;
    }
    if (!validateVnPhone(regPhone)) {
      setErrorMsg('Số điện thoại Việt Nam không đúng định dạng (VD: 0987654321)');
      return;
    }

    setLoading(true);
    try {
      // 1. Check duplicate username
      const userCheck = await api.checkUsername(regUsername);
      if (userCheck.exists) {
        setErrorMsg('Tên đăng nhập đã tồn tại');
        setLoading(false);
        return;
      }

      // 2. Check duplicate email
      const emailCheck = await api.checkEmail(regEmail);
      if (emailCheck.exists) {
        setErrorMsg('Email đã được đăng ký bởi tài khoản khác');
        setLoading(false);
        return;
      }

      // 3. Register
      const payload = {
        userName: regUsername,
        userPassword: regPassword,
        userDetails: {
          firstName: regFirstName || 'Khách',
          lastName: regLastName || 'Hàng',
          email: regEmail,
          phoneNumber: regPhone
        }
      };

      await api.register(payload);
      setSuccessMsg('Đăng ký tài khoản thành công! Hãy đăng nhập.');
      setActiveTab('login');
      // Clear inputs
      setRegUsername('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegFirstName('');
      setRegLastName('');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi đăng ký tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      setSuccessMsg(res.message || 'Mã khôi phục đã được gửi tới email của bạn.');
      setForgotEmail('');
    } catch (err) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi gửi yêu cầu khôi phục mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at 10% 20%, var(--bg-secondary) 0%, var(--bg-primary) 90.2%)'
    }}>
      <div className="glass-panel" style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1000px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {/* Left Side: Brand Promo (Hidden on mobile) */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'white',
          position: 'relative'
        }} className="hide-on-mobile">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
              NEXUS SHOP
            </h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6, maxWidth: '340px' }}>
              Khám phá trải nghiệm mua sắm thế hệ mới tích hợp Trợ lý Trí tuệ Nhân tạo thông minh.
            </p>
          </div>

          <div style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginTop: '2rem'
          }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>✨ Điểm nổi bật hệ thống</div>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', opacity: 0.9, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Kiến trúc Microservices hiện đại, tối ưu hiệu năng.</li>
              <li>Hệ thống gợi ý sản phẩm cá nhân hóa thông minh.</li>
              <li>AI Chatbot hỗ trợ tư vấn 24/7 trực tiếp trên trang.</li>
              <li>Bảo mật thông tin & thanh toán VNPay tiện lợi.</li>
            </ul>
          </div>

          <div style={{ opacity: 0.7, fontSize: '0.75rem', position: 'relative', zIndex: 2 }}>
            © 2026 Nexus Shop. All rights reserved.
          </div>

          {/* Decorative shapes */}
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'var(--accent-secondary)',
            filter: 'blur(50px)',
            opacity: 0.6
          }} />
        </div>

        {/* Right Side: Forms */}
        <div style={{
          flex: 1,
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          {/* Tab Selector */}
          {activeTab !== 'forgot' && (
            <div style={{
              display: 'flex',
              borderBottom: '2px solid var(--glass-border)',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  flex: 1,
                  paddingBottom: '0.75rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  background: 'none',
                  color: activeTab === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'login' ? '3px solid var(--accent-primary)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  flex: 1,
                  paddingBottom: '0.75rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  background: 'none',
                  color: activeTab === 'register' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'register' ? '3px solid var(--accent-primary)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Đăng Ký
              </button>
            </div>
          )}

          {activeTab === 'forgot' && (
            <div style={{ marginBottom: '2rem' }}>
              <button
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: 0
                }}
              >
                ← Quay lại đăng nhập
              </button>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.5rem' }}>Khôi phục mật khẩu</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nhập email đã đăng ký để nhận mã khôi phục.</p>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              ✅ {successMsg}
            </div>
          )}

          {/* 1. Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tên đăng nhập</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Nhập tên đăng nhập..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mật khẩu</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Nhập mật khẩu..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => { setActiveTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', marginTop: '0.5rem' }}
              >
                {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
              </button>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Cần đăng nhập quản trị?{' '}
                <Link to="/admin/login" style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>
                  Truy cập Cổng Admin →
                </Link>
              </div>
            </form>
          )}

          {/* 2. Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Họ</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="VD: Nguyễn"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tên</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="VD: An"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tên đăng nhập</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Nhập tên đăng nhập đăng ký..."
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="VD: an.nguyen@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Số điện thoại</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  placeholder="VD: 0987654321"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Mật khẩu (tối thiểu 6 ký tự)</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Nhập mật khẩu..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', marginTop: '0.5rem' }}
              >
                {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
              </button>
            </form>
          )}

          {/* 3. Forgot Password Form */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email liên kết</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="Nhập địa chỉ email của bạn..."
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', marginTop: '0.5rem' }}
              >
                {loading ? 'Đang gửi yêu cầu...' : 'Gửi mã khôi phục'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
