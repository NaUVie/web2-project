import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Sun, Moon, Settings } from 'lucide-react';
import { api } from '../utils/api';

export default function Header({ cartCount, user, onLogout, openAuthModal, theme, toggleTheme }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Load all products once for live search filtering
  useEffect(() => {
    api.getProducts().then(setAllProducts).catch(() => {});
  }, []);

  // Live Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = allProducts.filter(p => 
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5); // Limit 5 suggestions
    setSuggestions(filtered);
  }, [searchQuery, allProducts]);

  // Click outside listener for search suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '1rem 0',
      borderBottom: '1px solid var(--glass-border)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.5rem',
          fontWeight: 800,
          background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          NEXUS SHOP
        </Link>

        {/* Navigation Links */}
        <nav style={{
          display: 'flex',
          gap: '1.5rem',
          fontWeight: 500,
          fontSize: '0.9rem'
        }}>
          <Link to="/" style={{ opacity: 0.95, transition: 'color var(--transition-fast)' }}>Trang Chủ</Link>
          <Link to="/shop" style={{ opacity: 0.95, transition: 'color var(--transition-fast)' }}>Cửa Hàng</Link>
          <Link to="/blog" style={{ opacity: 0.95, transition: 'color var(--transition-fast)' }}>Tin Tức</Link>
          <Link to="/support" style={{ opacity: 0.95, transition: 'color var(--transition-fast)' }}>Hỗ Trợ</Link>
        </nav>

        {/* Live Search Bar */}
        <div ref={searchRef} style={{
          position: 'relative',
          flex: '1',
          maxWidth: '400px'
        }}>
          <form onSubmit={handleSearchSubmit}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                style={{
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  height: '40px',
                  borderRadius: '20px'
                }}
              />
              <Search size={18} style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              borderRadius: '12px',
              padding: '0.5rem',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {suggestions.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleSuggestionClick(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <img 
                    src={p.imageUrl} 
                    alt={p.productName} 
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    ${p.promoPrice ? p.promoPrice : p.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cart link */}
          <Link to="/cart" style={{
            position: 'relative',
            color: 'var(--text-primary)',
            display: 'inline-flex'
          }}>
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: 'var(--accent-secondary)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                <User size={18} />
                <span>{user.username}</span>
              </Link>

              {/* Admin Panel Access Link */}
              {user.role === 'ROLE_ADMIN' && (
                <Link to="/admin" title="Bảng quản trị" style={{
                  color: 'var(--accent-primary)'
                }}>
                  <Settings size={18} />
                </Link>
              )}

              <button 
                onClick={onLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={openAuthModal}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.8rem',
                borderRadius: '20px'
              }}
            >
              Đăng Nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
