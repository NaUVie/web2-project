import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { api } from '../utils/api';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getBlogById(id)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ padding: '6rem 0', fontSize: '1.2rem', fontWeight: 600 }}>Đang tải nội dung bài viết...</div>;
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <h3>Không tìm thấy bài viết</h3>
          <p style={{ margin: '1rem 0' }}>Bài viết bạn đang tìm kiếm có thể không tồn tại hoặc đã bị gỡ bỏ.</p>
          <button className="btn btn-primary" onClick={() => navigate('/blog')}>Quay lại trang tin tức</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0 4rem 0', textAlign: 'left', maxWidth: '800px' }}>
      
      {/* Back button & Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
            {post.categoryName}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
            <Calendar size={12} /> {post.createdDate || 'June 2026'}
          </span>
        </div>
        <button 
          onClick={() => navigate('/blog')} 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}
        >
          <ArrowLeft size={14} /> Quay lại tin tức
        </button>
      </div>

      {/* Main content */}
      <article>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: '1.2' }}>
          {post.title}
        </h1>

        {/* Cover image */}
        <div className="glass-panel" style={{
          padding: '0.5rem',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '2.5rem'
        }}>
          <img 
            src={post.coverImageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80'} 
            alt={post.title} 
            style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '12px' }}
          />
        </div>

        {/* Article text content */}
        <div style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          whiteSpace: 'pre-line'
        }}>
          {post.content}
        </div>
      </article>

    </div>
  );
}
