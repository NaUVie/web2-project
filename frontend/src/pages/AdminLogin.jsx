import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminLogin({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await api.login(username, password);

      // Verify if the logged-in user is indeed an admin
      const roleName = typeof data.role === 'object' ? data.role?.roleName : data.role;
      if (roleName !== 'ROLE_ADMIN') {
        throw new Error('Từ chối truy cập: Tài khoản này không có quyền quản trị viên!');
      }

      setSuccessMsg('Xác thực quản trị viên thành công!');
      onLoginSuccess(data);

      setTimeout(() => {
        navigate('/admin');
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Tên đăng nhập hoặc mật khẩu quản trị không chính xác.');
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
      backgroundColor: '#0a0a0f',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #15102a 0%, #0a0a0f 100%)',
      color: '#f3f4f6'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        backgroundColor: 'rgba(17, 17, 27, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1)',
        textAlign: 'center'
      }}>
        {/* Header Icon */}
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          color: '#a78bfa',
          marginBottom: '1.5rem',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
        }}>
          <ShieldCheck size={40} />
        </div>

        <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em', color: '#fff' }}>
          ADMIN PORTAL
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Đăng nhập bằng tài khoản quản trị để truy cập hệ thống quản lý.
        </p>

        {/* Feedback Messages */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
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
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            🔑 {successMsg}
          </div>
        )}

        <form onSubmit={handleAdminLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Username Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d1d5db' }}>Tên đăng nhập quản trị</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="admin_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  backgroundColor: 'rgba(10, 10, 15, 0.8)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.9rem',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'}
              />
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d1d5db' }}>Mật khẩu bảo mật</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  backgroundColor: 'rgba(10, 10, 15, 0.8)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.9rem',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              transition: 'transform 0.2s, opacity 0.2s',
              marginTop: '0.75rem'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP HỆ THỐNG'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.25rem' }}>
          <Link to="/login" style={{ color: '#9ca3af', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#fff'}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
            ← Quay lại đăng nhập của Khách hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
