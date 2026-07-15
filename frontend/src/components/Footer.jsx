import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="glass-panel" style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 0 2rem 0',
      backgroundColor: 'var(--bg-secondary)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2rem',
        textAlign: 'left'
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NEXUS SHOP
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Hệ thống cửa hàng công nghệ hiện đại cung cấp linh kiện máy tính, điện thoại di động và phụ kiện âm thanh cao cấp nhất thị trường.
          </p>
        </div>
        
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Liên Kết Nhanh</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/shop">Cửa hàng</Link></li>
            <li><Link to="/blog">Tin tức công nghệ</Link></li>
            <li><Link to="/support">Trung tâm hỗ trợ</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Chính Sách Cửa Hàng</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <li><Link to="/support#warranty">Chính sách bảo hành</Link></li>
            <li><Link to="/support#delivery">Chính sách giao hàng</Link></li>
            <li><Link to="/support#refund">Chính sách đổi trả</Link></li>
            <li><Link to="/support#privacy">Bảo mật thông tin</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Thông Tin Liên Hệ</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>📍 Địa chỉ: 123 Đường Ba Tháng Hai, Quận 10, TP.HCM</span>
            <span>📞 Điện thoại: 1900 6789</span>
            <span>✉️ Email: support@nexusshop.vn</span>
          </p>
        </div>
      </div>
      
      <div className="container" style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        © 2026 Nexus Shop. Built with Spring Boot Java Microservices & ReactJS.
      </div>
    </footer>
  );
}
