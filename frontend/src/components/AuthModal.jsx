import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Eye, EyeOff } from 'lucide-react';
import { api } from '../utils/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  if (!isOpen) return null;

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

  // VN Phone Validation
  const validateVnPhone = (phone) => {
    const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;
    return vnPhoneRegex.test(phone);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const data = await api.login(loginUsername, loginPassword);
      setSuccessMsg('Đăng nhập thành công!');
      setTimeout(() => {
        onLoginSuccess(data);
        onClose();
        setSuccessMsg('');
        setLoginUsername('');
        setLoginPassword('');
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Sai tài khoản hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
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

      // 3. Perform registration
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-panel animate-fade-in" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem',
        borderRadius: '20px',
        textAlign: 'center',
        color: 'var(--text-primary)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Forgot Password Header */}
        {activeTab === 'forgot' && (
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>Khôi Phục Mật Khẩu</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nhập email liên kết với tài khoản để nhận link khôi phục mật khẩu.</p>
          </div>
        )}

        {/* Tab Selection */}
        {activeTab !== 'forgot' && (
          <div style={{
            display: 'flex',
            borderBottom: '2px solid var(--border-color)',
            marginBottom: '2rem'
          }}>
            <button 
              onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              style={{
                flex: 1,
                paddingBottom: '0.75rem',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                background: 'none',
                color: activeTab === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'login' ? '3px solid var(--accent-primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              Đăng Nhập
            </button>
            <button 
              onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
              style={{
                flex: 1,
                paddingBottom: '0.75rem',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                background: 'none',
                color: activeTab === 'register' ? 'var(--accent-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'register' ? '3px solid var(--accent-primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              Đăng Ký
            </button>
          </div>
        )}

        {/* Messages */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            fontWeight: 600,
            textAlign: 'left'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            fontWeight: 600,
            textAlign: 'left'
          }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Tab Forms */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Tên đăng nhập</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Tên tài khoản"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              <button 
                type="button" 
                onClick={() => { setActiveTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', height: '45px' }}>
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>
        ) : activeTab === 'register' ? (
          <form onSubmit={handleRegisterSubmit} style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Họ</label>
                <input type="text" required placeholder="Họ" className="form-input" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} />
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Tên</label>
                <input type="text" required placeholder="Tên" className="form-input" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Tên đăng nhập</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Ít nhất 4 ký tự"
                  className="form-input"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="form-input"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Số điện thoại</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 0987654321"
                  className="form-input"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Phone size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="form-input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '45px' }}>
              {loading ? 'Đang kiểm tra...' : 'Đăng Ký Tài Khoản'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Email tài khoản</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="form-input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '45px' }}>
              {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu Khôi Phục'}
            </button>

            <div style={{ marginTop: '1.25rem' }}>
              <button 
                type="button" 
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Quay lại đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
