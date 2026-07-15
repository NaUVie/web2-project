import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { api } from '../utils/api';

export default function Shop({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(200000000);
  const [minPrice, setMinPrice] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('name-asc'); // 'price-asc', 'price-desc', 'name-asc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const location = useLocation();

  // Load URL query parameters (e.g. ?category=Electronics or ?search=MacBook)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    const searchParam = params.get('search');

    if (catParam) setSelectedCategory(catParam);
    if (searchParam) setSearchKeyword(searchParam);
  }, [location.search]);

  // Fetch products & categories
  useEffect(() => {
    setLoading(true);
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([prodData, catData]) => {
        setProducts(prodData);
        if (catData && catData.length > 0) {
          setCategories(catData);
        } else {
          setCategories([
            { id: 1, name: 'Electronics' },
            { id: 2, name: 'Audio' },
            { id: 3, name: 'Footwear' },
            { id: 4, name: 'Accessories' }
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter & Sort Logic
  const getFilteredProducts = () => {
    let result = [...products];

    // Filter by Search Keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(p => 
        p.productName.toLowerCase().includes(keyword) || 
        p.discription.toLowerCase().includes(keyword)
      );
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Price range
    result = result.filter(p => {
      const actualPrice = p.promoPrice ? parseFloat(p.promoPrice) : parseFloat(p.price);
      return actualPrice >= minPrice && actualPrice <= maxPrice;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const pa = a.promoPrice ? parseFloat(a.promoPrice) : parseFloat(a.price);
        const pb = b.promoPrice ? parseFloat(b.promoPrice) : parseFloat(b.price);
        return pa - pb;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const pa = a.promoPrice ? parseFloat(a.promoPrice) : parseFloat(a.price);
        const pb = b.promoPrice ? parseFloat(b.promoPrice) : parseFloat(b.price);
        return pb - pa;
      });
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    return result;
  };

  const filteredProducts = getFilteredProducts();

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, minPrice, maxPrice, searchKeyword, sortBy]);

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0 4rem 0' }}>
      <h1 style={{ textAlign: 'left', marginBottom: '2rem', fontSize: '2rem' }}>Cửa Hàng Công Nghệ</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* Sidebar Filters */}
        <aside className="glass-panel" style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <SlidersHorizontal size={18} />
            <h3 style={{ fontSize: '1.1rem' }}>Bộ Lọc Sản Phẩm</h3>
          </div>

          {/* Search Box */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Từ khóa tìm kiếm</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Nhập từ khóa..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Danh mục</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button 
                onClick={() => setSelectedCategory('All')}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: selectedCategory === 'All' ? 'var(--accent-primary)' : 'transparent',
                  color: selectedCategory === 'All' ? 'white' : 'var(--text-primary)',
                  fontWeight: selectedCategory === 'All' ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Tất Cả Sản Phẩm
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: selectedCategory === cat.name ? 'var(--accent-primary)' : 'transparent',
                    color: selectedCategory === cat.name ? 'white' : 'var(--text-primary)',
                    fontWeight: selectedCategory === cat.name ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Khoảng giá (đến: {maxPrice.toLocaleString('vi-VN')} đ)
            </label>
            <input 
              type="range" 
              min="0" 
              max="200000000" 
              step="500000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>0 đ</span>
              <span>200.000.000 đ</span>
            </div>
          </div>
        </aside>

        {/* Products Grid & Sorting */}
        <div>
          {/* Toolbar */}
          <div className="glass-panel" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Hiển thị <strong>{currentProducts.length}</strong> trong tổng số <strong>{filteredProducts.length}</strong> sản phẩm
            </div>

            {/* Sắp xếp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="name-asc">Tên: A - Z</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div style={{ padding: '4rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Đang tải sản phẩm...</div>
          ) : currentProducts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem 0', borderRadius: '12px' }}>
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="product-grid">
                {currentProducts.map(p => (
                  <div key={p.id} className="glass-panel" style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-normal)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Link to={`/product/${p.id}`}>
                      <img 
                        src={p.imageUrl} 
                        alt={p.productName} 
                        style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                      />
                    </Link>
                    <div style={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Link to={`/product/${p.id}`} style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                        {p.productName}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{p.category}</div>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', marginBottom: '1rem' }}>
                        {p.promoPrice ? (
                          <>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{parseFloat(p.promoPrice).toLocaleString('vi-VN')} đ</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{parseFloat(p.price).toLocaleString('vi-VN')} đ</span>
                          </>
                        ) : (
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{parseFloat(p.price).toLocaleString('vi-VN')} đ</span>
                        )}
                      </div>

                      <button 
                        onClick={() => onAddToCart(p)}
                        className="btn btn-primary"
                        style={{ width: '100%', gap: '0.5rem' }}
                      >
                        <ShoppingCart size={16} /> Thêm Vào Giỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className="btn"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        padding: 0,
                        backgroundColor: currentPage === idx + 1 ? 'var(--accent-primary)' : 'transparent',
                        color: currentPage === idx + 1 ? 'white' : 'var(--text-primary)',
                        borderColor: currentPage === idx + 1 ? 'var(--accent-primary)' : 'var(--border-color)',
                        fontWeight: 700
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
