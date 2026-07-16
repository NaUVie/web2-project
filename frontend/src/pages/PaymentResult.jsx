import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

export default function PaymentResult({ onClearCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PROCESSING'); // 'SUCCESS', 'FAILED', 'ERROR'
  const [message, setMessage] = useState('Đang xác thực giao dịch...');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const responseCode = queryParams.get('vnp_ResponseCode');
        const orderId = queryParams.get('vnp_TxnRef');
        const amount = queryParams.get('vnp_Amount');
        const bankCode = queryParams.get('vnp_BankCode');
        const transactionNo = queryParams.get('vnp_TransactionNo');

        setOrderDetails({
          orderId,
          amount: amount ? (parseFloat(amount) / 100).toLocaleString('vi-VN') + ' VND' : '',
          bankCode,
          transactionNo
        });

        const res = await api.confirmPayment(location.search);
        if (responseCode === '00' && res.status === 'SUCCESS') {
          setStatus('SUCCESS');
          setMessage('Thanh toán đơn hàng thành công qua cổng VNPAY!');
          if (onClearCart) {
            onClearCart();
          }
        } else {
          setStatus('FAILED');
          setMessage(res.message || `Giao dịch bị hủy hoặc thất bại (Mã lỗi VNPAY: ${responseCode})`);
        }
      } catch (err) {
        console.error('Lỗi khi xác thực thanh toán:', err);
        setStatus('ERROR');
        setMessage(err.message || 'Không thể xác thực giao dịch, vui lòng liên hệ admin.');
      } finally {
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [location]);

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
        gap: '1.5rem',
        color: 'var(--text-primary)'
      }}>
        {loading ? (
          <>
            <Loader2 size={72} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Đang Xác Thực...</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Vui lòng giữ kết nối, chúng tôi đang xử lý giao dịch với VNPAY.</p>
            </div>
          </>
        ) : status === 'SUCCESS' ? (
          <>
            <CheckCircle2 size={72} style={{ color: '#10b981' }} />
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Thanh Toán Thành Công!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
            </div>

            {orderDetails && (
              <div style={{
                padding: '1rem 2rem',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                width: '100%',
                textAlign: 'left'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>Mã đơn hàng: <strong style={{ color: '#10b981' }}>#{orderDetails.orderId}</strong></div>
                <div style={{ marginBottom: '0.5rem' }}>Số tiền thanh toán: <strong>{orderDetails.amount}</strong></div>
                <div style={{ marginBottom: '0.5rem' }}>Ngân hàng: <strong>{orderDetails.bankCode}</strong></div>
                <div>Mã giao dịch VNPAY: <strong>{orderDetails.transactionNo}</strong></div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/shop')}>Tiếp tục mua sắm</button>
              <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => navigate('/profile')}>
                Xem đơn hàng <ArrowRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <XCircle size={72} style={{ color: '#ef4444' }} />
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f87171' }}>Thanh Toán Thất Bại</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
            </div>

            {orderDetails && (
              <div style={{
                padding: '1rem 2rem',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                width: '100%',
                textAlign: 'left'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>Mã đơn hàng: <strong>#{orderDetails.orderId}</strong></div>
                <div style={{ marginBottom: '0.5rem' }}>Ngân hàng: <strong>{orderDetails.bankCode}</strong></div>
                {orderDetails.transactionNo && <div>Mã giao dịch VNPAY: <strong>{orderDetails.transactionNo}</strong></div>}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/shop')}>Quay lại cửa hàng</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/checkout')}>Thử thanh toán lại</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
