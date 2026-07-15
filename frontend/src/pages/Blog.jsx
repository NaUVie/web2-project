import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getBlogs(), api.getBlogCategories()])
      .then(([postsData, catsData]) => {
        setPosts(postsData);
        if (catsData && catsData.length > 0) {
          setCategories(catsData);
        } else {
          setCategories([
            { id: 1, name: 'Technology News' },
            { id: 2, name: 'Buying Guides' }
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.categoryName?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0 4rem 0', textAlign: 'left' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Tin Tức Công Nghệ</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px' }}>
        Cập nhật những xu hướng công nghệ mới nhất, hướng dẫn chọn mua linh kiện máy tính, điện thoại di động và các mẹo tối ưu hóa thiết bị từ đội ngũ chuyên gia Nexus Shop.
      </p>

      {/* Blog Categories Filter Bar */}
      <div className="glass-panel" style={{
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setSelectedCategory('All')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '20px',
            border: 'none',
            background: selectedCategory === 'All' ? 'var(--accent-primary)' : 'transparent',
            color: selectedCategory === 'All' ? 'white' : 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Tất Cả
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '20px',
              border: 'none',
              background: selectedCategory === cat.name ? 'var(--accent-primary)' : 'transparent',
              color: selectedCategory === cat.name ? 'white' : 'var(--text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', fontSize: '1.1rem', fontWeight: 600 }}>
          Đang tải bài viết...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 0', textAlign: 'center', borderRadius: '12px' }}>
          Chưa có bài viết nào thuộc danh mục này.
        </div>
      ) : (
        /* Blog grid list */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {filteredPosts.map(post => (
            <article key={post.id} className="glass-panel" style={{
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform var(--transition-normal)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Link to={`/blog/${post.id}`}>
                <img 
                  src={post.coverImageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60'} 
                  alt={post.title} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              </Link>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Meta info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {post.categoryName}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {post.createdDate || 'June 2026'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: '1.3' }}>
                  <Link to={`/blog/${post.id}`} style={{ color: 'var(--text-primary)' }}>
                    {post.title}
                  </Link>
                </h3>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.25rem',
                  lineHeight: '1.5',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {post.content}
                </p>

                <Link 
                  to={`/blog/${post.id}`} 
                  style={{
                    marginTop: 'auto',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  Đọc thêm <ChevronRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
