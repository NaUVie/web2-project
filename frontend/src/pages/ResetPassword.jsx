import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tkn = queryParams.get('token');
    if (tkn) {
      setToken(tkn);
    } else {
      setErrorMsg('Đường dẫn khôi phục mật khẩu không hợp lệ. Vui lòng kiểm tra lại email.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!token) {
      setErrorMsg('Thiếu mã xác thực khôi phục mật khẩu.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải dài tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.resetPassword(token, newPassword);
      setSuccessMsg(res.message || 'Mật khẩu đã được thay đổi thành công!');
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 0' }}>
      <div className="glass-panel animate-fade-in" style={{
        padding: '3rem 2rem',
        borderRadius: '16px',
        maxWidth: '460px',
        margin: '0 auto',
        color: 'var(--text-primary)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Thiết Lập Mật Khẩu</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
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
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            fontWeight: 600,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={32} />
            {successMsg}
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Đang chuyển hướng về trang chủ...</span>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Mật khẩu mới</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  disabled={!token}
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

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  disabled={!token}
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Đặt Lại Mật Khẩu
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
