import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

export default function Support() {
  const [activeTab, setActiveTab] = useState('warranty');

  const policies = {
    warranty: {
      title: 'Chính Sách Bảo Hành',
      icon: <ShieldCheck size={28} />,
      content: [
        '1. Phạm vi áp dụng: Tất cả các sản phẩm thiết bị điện tử, máy tính, điện thoại di động và phụ kiện âm thanh mua tại Nexus Shop.',
        '2. Thời hạn bảo hành: 12 tháng kể từ ngày nhận hàng được in trên hóa đơn mua hàng.',
        '3. Điều kiện bảo hành hợp lệ:',
        '   - Sản phẩm còn nguyên tem bảo hành của hãng hoặc tem của Nexus Shop.',
        '   - Sản phẩm không bị tác động vật lý gây trầy xước, nứt vỡ, rơi nước, cháy nổ chip do nguồn điện không ổn định.',
        '   - Số seri, mã vạch IMEI trên thiết bị phải khớp với hóa đơn mua hàng.',
        '4. Thời gian xử lý: Từ 3 đến 7 ngày làm việc (không tính Thứ 7, Chủ Nhật).'
      ]
    },
    delivery: {
      title: 'Chính Sách Giao Hàng',
      icon: <Truck size={28} />,
      content: [
        '1. Phạm vi giao hàng: Toàn quốc qua các đơn vị vận chuyển đối tác (Giao Hàng Nhanh, Viettel Post, J&T Express).',
        '2. Thời gian giao nhận hàng dự kiến:',
        '   - Nội thành TP.HCM: 24h - 48h làm việc.',
        '   - Các tỉnh miền Nam / Miền Trung: 2 - 3 ngày làm việc.',
        '   - Các tỉnh miền Bắc: 3 - 5 ngày làm việc.',
        '3. Chi phí vận chuyển:',
        '   - Miễn phí giao hàng toàn quốc đối với tất cả đơn hàng có giá trị trên $500.',
        '   - Đối với đơn hàng dưới $500, áp dụng mức phí cố định là $15 toàn quốc.',
        '4. Đồng kiểm hàng: Khách hàng được phép mở gói hàng kiểm tra ngoại quan sản phẩm trước khi ký nhận và thanh toán.'
      ]
    },
    refund: {
      title: 'Chính Sách Đổi Trả',
      icon: <RotateCcw size={28} />,
      content: [
        '1. Đổi trả do lỗi nhà sản xuất: Hỗ trợ 1 đổi 1 miễn phí trong vòng 7 ngày đầu tiên nếu thiết bị phát sinh lỗi phần cứng từ nhà sản xuất.',
        '2. Đổi trả theo nhu cầu khách hàng: Hỗ trợ đổi sản phẩm khác có giá trị tương đương hoặc cao hơn trong vòng 3 ngày kể từ khi nhận hàng. Phí vận chuyển phát sinh do khách hàng tự chi trả.',
        '3. Tình trạng sản phẩm khi đổi trả:',
        '   - Sản phẩm phải còn mới 100%, không trầy xước, dơ bẩn.',
        '   - Đầy đủ vỏ hộp, phụ kiện đi kèm (cáp sạc, tai nghe, hướng dẫn sử dụng) và quà tặng khuyến mãi kèm theo.',
        '4. Hoàn tiền: Trong trường hợp đổi trả hợp lệ và shop hết sản phẩm thay thế, chúng tôi sẽ hoàn trả 100% giá trị sản phẩm qua số tài khoản ngân hàng của quý khách trong vòng 48h.'
      ]
    },
    privacy: {
      title: 'Chính Sách Bảo Mật',
      icon: <Lock size={28} />,
      content: [
        '1. Mục đích thu thập thông tin: Nexus Shop thu thập thông tin cá nhân (Họ tên, Số điện thoại, Email, Địa chỉ giao hàng) nhằm mục đích xử lý đơn hàng, giao hàng và nâng cấp trải nghiệm hỗ trợ khách hàng tốt nhất.',
        '2. Bảo mật dữ liệu: Dữ liệu người dùng được lưu trữ an toàn trong cơ sở dữ liệu hệ thống microservices và chỉ nhân viên được ủy quyền mới có quyền truy cập.',
        '3. Chia sẻ thông tin: Chúng tôi tuyệt đối không mua bán hay chia sẻ thông tin cá nhân của quý khách cho bên thứ ba ngoại trừ đơn vị vận chuyển trực tiếp xử lý đơn hàng.',
        '4. Quyền của khách hàng: Quý khách có quyền chỉnh sửa thông tin cá nhân trực tiếp tại trang Hồ sơ cá nhân của website hoặc yêu cầu xóa vĩnh viễn tài khoản khỏi hệ thống bằng cách liên hệ với bộ phận hỗ trợ.'
      ]
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0 4rem 0', textAlign: 'left' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Hỗ Trợ & Chính Sách</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px' }}>
        Chúng tôi cam kết mang lại trải nghiệm mua sắm tuyệt vời nhất cho quý khách với những dịch vụ hậu mãi uy tín và chính sách minh bạch.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        
        {/* Policy tabs sidebar */}
        <aside className="glass-panel" style={{ padding: '1rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.keys(policies).map(key => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === key ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === key ? 'white' : 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {key === 'warranty' && <ShieldCheck size={18} />}
                {key === 'delivery' && <Truck size={18} />}
                {key === 'refund' && <RotateCcw size={18} />}
                {key === 'privacy' && <Lock size={18} />}
                {policies[key].title}
              </button>
            ))}
          </div>
        </aside>

        {/* Tab Detail View */}
        <main className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
            {policies[activeTab].icon}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {policies[activeTab].title}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {policies[activeTab].content.map((item, idx) => (
              <p 
                key={idx} 
                style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.95rem', 
                  lineHeight: '1.7',
                  paddingLeft: item.startsWith(' ') ? '1.5rem' : '0' 
                }}
              >
                {item}
              </p>
            ))}
          </div>
        </main>

      </div>
    </div>
  );
}
