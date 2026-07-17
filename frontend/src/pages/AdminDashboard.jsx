import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FolderTree, FileText, Image, Users, ShoppingCart, Plus, Edit, Trash2, Check, X, RefreshCw, Eye, TrendingUp, LayoutDashboard, AlertTriangle, BarChart3 } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminDashboard({ user, openAuthModal }) {
  const navigate = useNavigate();

  // Tabs: 'dashboard', 'products', 'categories', 'blog-cats', 'blogs', 'banners', 'users', 'orders'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Entities lists state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [revenueStats, setRevenueStats] = useState({ totalRevenue: 0, completedOrdersCount: 0, pendingOrdersCount: 0, failedOrdersCount: 0, totalOrdersCount: 0 });

  // Create/Edit Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create-prod', 'edit-prod', 'create-cat', 'edit-cat', 'create-bcat', 'edit-bcat', 'create-post', 'edit-post', 'create-banner', 'edit-banner'
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Form inputs
  const [prodForm, setProdForm] = useState({ productName: '', price: '', promoPrice: '', category: '', availability: 10, imageUrl: '', discription: '', variants: [] });
  const [catForm, setCatForm] = useState({ name: '', slug: '' });
  const [bcatForm, setBcatForm] = useState({ name: '', slug: '' });
  const [postForm, setPostForm] = useState({ title: '', content: '', coverImageUrl: '', categoryName: '' });
  const [bannerForm, setBannerForm] = useState({ title: '', imageUrl: '', targetUrl: '', active: true });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [orderPage, setOrderPage] = useState(1);

  const handleFileUpload = async (e, formType, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await api.uploadImage(file);
      if (formType === 'prod') {
        setProdForm(prev => ({ ...prev, [fieldName]: data.url }));
      } else if (formType === 'post') {
        setPostForm(prev => ({ ...prev, [fieldName]: data.url }));
      } else if (formType === 'banner') {
        setBannerForm(prev => ({ ...prev, [fieldName]: data.url }));
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi tải ảnh lên Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  const handleVariantFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await api.uploadImage(file);
      setProdForm(prev => {
        const updatedVariants = [...prev.variants];
        updatedVariants[index] = { ...updatedVariants[index], imageUrl: data.url };
        return { ...prev, variants: updatedVariants };
      });
    } catch (err) {
      alert(err.message || 'Lỗi khi tải ảnh lên Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  // Auth Guard
  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else if (user.role !== 'ROLE_ADMIN') {
      alert('Từ chối truy cập: Trang này chỉ dành cho quản trị viên!');
      navigate('/');
    }
  }, [user]);

  // Load all admin data
  useEffect(() => {
    if (!user || user.role !== 'ROLE_ADMIN') return;

    setLoading(true);
    Promise.all([
      api.getProducts().catch(() => []),
      api.getCategories().catch(() => []),
      api.getBlogCategories().catch(() => []),
      api.getBlogs().catch(() => []),
      api.getAllBannersAdmin().catch(() => []),
      api.getUsersList().catch(() => []),
      api.getAllOrdersAdmin().catch(() => []),
      api.getRevenueStatistics().catch(() => ({ totalRevenue: 0, completedOrdersCount: 0, pendingOrdersCount: 0, failedOrdersCount: 0, totalOrdersCount: 0 }))
    ]).then(([prods, cats, bcats, posts, bns, usrs, ords, stats]) => {
      setProducts(prods);
      setCategories(cats);
      setBlogCategories(bcats);
      setBlogs(posts);
      setBanners(bns);
      setUsers(usrs);
      setOrders(ords);
      setRevenueStats(stats);
    }).finally(() => setLoading(false));
  }, [user, refreshTrigger]);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Forms actions handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...prodForm,
        price: parseFloat(prodForm.price),
        promoPrice: prodForm.promoPrice ? parseFloat(prodForm.promoPrice) : null,
        availability: parseInt(prodForm.availability),
        variants: (prodForm.variants || []).map(v => ({
          id: v.id || null,
          color: v.color || '',
          size: v.size || '',
          price: v.price ? parseFloat(v.price) : null,
          availability: v.availability ? parseInt(v.availability) : 0,
          imageUrl: v.imageUrl || ''
        }))
      };

      if (modalType === 'create-prod') {
        await api.addProduct(payload);
      } else {
        await api.updateProduct(selectedEntity.id, payload);
      }
      setShowModal(false);
      triggerRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create-cat') {
        await api.addCategory(catForm);
      } else {
        await api.updateCategory(selectedEntity.id, catForm);
      }
      setShowModal(false);
      triggerRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleBlogCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create-bcat') {
        await api.addBlogCategory(bcatForm);
      } else {
        await api.updateBlogCategory(selectedEntity.id, bcatForm);
      }
      setShowModal(false);
      triggerRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu danh mục tin tức');
    }
  };

  const handleBlogPostSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create-post') {
        await api.addBlogPost(postForm);
      } else {
        await api.updateBlogPost(selectedEntity.id, postForm);
      }
      setShowModal(false);
      triggerRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu bài viết');
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create-banner') {
        await api.addBanner(bannerForm);
      } else {
        await api.updateBanner(selectedEntity.id, bannerForm);
      }
      setShowModal(false);
      triggerRefresh();
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu banner');
    }
  };

  // Delete Handlers
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      await api.deleteProduct(id).then(triggerRefresh).catch(e => alert(e.message));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      await api.deleteCategory(id).then(triggerRefresh).catch(e => alert(e.message));
    }
  };

  const handleDeleteBlogCategory = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục tin tức này?')) {
      await api.deleteBlogCategory(id).then(triggerRefresh).catch(e => alert(e.message));
    }
  };

  const handleDeleteBlogPost = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      await api.deleteBlogPost(id).then(triggerRefresh).catch(e => alert(e.message));
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      await api.deleteBanner(id).then(triggerRefresh).catch(e => alert(e.message));
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      await api.deleteUser(id).then(triggerRefresh).catch(e => alert(e.message));
    }
  };

  const handleToggleUserRole = async (usr) => {
    const newRole = usr.role.roleName === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    if (window.confirm(`Bạn có chắc chắn muốn chuyển phân quyền tài khoản này thành ${newRole}?`)) {
      await api.updateUserRole(usr.id, newRole).then(triggerRefresh).catch(e => alert(e.message));
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, newPaymentStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, newPaymentStatus);
      triggerRefresh();
      // Saga events are processed asynchronously via Kafka.
      // We trigger a delayed refresh after 1 second to capture the updated inventory state.
      setTimeout(() => {
        triggerRefresh();
      }, 1000);
    } catch (e) {
      alert(e.message);
    }
  };

  const openViewOrderModal = (order) => {
    setModalType('view-order');
    setSelectedEntity(order);
    setShowModal(true);
  };

  const openCreateModal = (type) => {
    setModalType(type);
    setSelectedEntity(null);
    if (type === 'create-prod') setProdForm({ productName: '', price: '', promoPrice: '', category: categories[0]?.name || 'Electronics', availability: 10, imageUrl: '', discription: '', variants: [] });
    if (type === 'create-cat') setCatForm({ name: '', slug: '' });
    if (type === 'create-bcat') setBcatForm({ name: '', slug: '' });
    if (type === 'create-post') setPostForm({ title: '', content: '', coverImageUrl: '', categoryName: blogCategories[0]?.name || 'Technology News' });
    if (type === 'create-banner') setBannerForm({ title: '', imageUrl: '', targetUrl: '', active: true });
    setShowModal(true);
  };

  const openEditModal = (type, entity) => {
    setModalType(type);
    setSelectedEntity(entity);
    if (type === 'edit-prod') setProdForm({ productName: entity.productName, price: entity.price, promoPrice: entity.promoPrice || '', category: entity.category, availability: entity.availability, imageUrl: entity.imageUrl, discription: entity.discription, variants: entity.variants || [] });
    if (type === 'edit-cat') setCatForm({ name: entity.name, slug: entity.slug });
    if (type === 'edit-bcat') setBcatForm({ name: entity.name, slug: entity.slug });
    if (type === 'edit-post') setPostForm({ title: entity.title, content: entity.content, coverImageUrl: entity.coverImageUrl, categoryName: entity.categoryName });
    if (type === 'edit-banner') setBannerForm({ title: entity.title, imageUrl: entity.imageUrl, targetUrl: entity.targetUrl, active: entity.active });
    setShowModal(true);
  };

  // 1. Low stock products (availability <= 5)
  const lowStockProducts = products.filter(p => p.availability <= 5);

  // 2. Revenue timeline data
  const getRevenueTimelineData = () => {
    const dailyData = {};
    orders.forEach(ord => {
      if (ord.status === 'DELIVERED' || ord.status === 'COMPLETED' || ord.status === 'PAID') {
        const dateStr = ord.orderedDate || 'Chưa rõ';
        const dateKey = dateStr.split(' ')[0] || dateStr; 
        dailyData[dateKey] = (dailyData[dateKey] || 0) + parseFloat(ord.total || 0);
      }
    });

    const sortedKeys = Object.keys(dailyData).sort();
    return sortedKeys.map(key => ({
      date: key,
      revenue: dailyData[key]
    }));
  };

  const timelineData = getRevenueTimelineData();

  // 3. Category distribution data
  const getCategoryDistribution = () => {
    const catData = {};
    products.forEach(p => {
      const cat = p.category || 'Khác';
      catData[cat] = (catData[cat] || 0) + 1;
    });
    return Object.keys(catData).map(cat => ({
      category: cat,
      count: catData[cat]
    }));
  };

  const categoryDist = getCategoryDistribution();

  // 4. Render SVG timeline chart
  const renderRevenueTimelineChart = () => {
    if (timelineData.length === 0) {
      return (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Chưa có dữ liệu doanh thu đơn hàng để lập biểu đồ.
        </div>
      );
    }

    const width = 500;
    const height = 200;
    const padding = 35;

    const maxRevenue = Math.max(...timelineData.map(d => d.revenue), 1);
    
    const points = timelineData.map((d, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(timelineData.length - 1, 1);
      const y = height - padding - (d.revenue * (height - padding * 2)) / maxRevenue;
      return { x, y, label: d.date, value: d.revenue };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : '';

    return (
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220px" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-color)" strokeDasharray="3,3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--border-color)" strokeDasharray="3,3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" />

          {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}
          {linePath && <path d={linePath} fill="none" stroke="var(--accent-primary)" strokeWidth="3" />}
          
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-primary)" stroke="var(--accent-primary)" strokeWidth="2" />
              <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontWeight="bold">
                {p.value >= 1000000 ? `${(p.value / 1000000).toFixed(1)}M` : p.value.toLocaleString('vi-VN')}
              </text>
              <text x={p.x} y={height - 10} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
                {p.label.substring(5)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // 5. Render Category Progress bars
  const renderCategoryDistribution = () => {
    if (categoryDist.length === 0) {
      return (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Chưa có dữ liệu danh mục sản phẩm.
        </div>
      );
    }

    const totalProducts = products.length || 1;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
        {categoryDist.map((c, idx) => {
          const percentage = Math.round((c.count / totalProducts) * 100);
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-primary)' }}>{c.category}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.count} sản phẩm ({percentage}%)</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0 4rem 0', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Bảng Điều Khiển Admin</h1>
        <button onClick={triggerRefresh} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* Sidebar Nav */}
        <aside className="glass-panel" style={{ padding: '1rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => setActiveTab('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'dashboard' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'dashboard' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <LayoutDashboard size={18} /> Tổng quan
            </button>
            <button onClick={() => setActiveTab('products')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'products' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'products' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <Package size={18} /> Sản phẩm
            </button>
            <button onClick={() => setActiveTab('categories')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'categories' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'categories' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <FolderTree size={18} /> Danh mục sản phẩm
            </button>
            <button onClick={() => setActiveTab('blog-cats')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'blog-cats' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'blog-cats' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <FolderTree size={18} /> Danh mục tin tức
            </button>
            <button onClick={() => setActiveTab('blogs')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'blogs' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'blogs' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <FileText size={18} /> Bài viết / Tin tức
            </button>
            <button onClick={() => setActiveTab('banners')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'banners' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'banners' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <Image size={18} /> Banner quảng cáo
            </button>
            <button onClick={() => setActiveTab('users')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'users' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'users' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <Users size={18} /> Tài khoản khách
            </button>
            <button onClick={() => { setActiveTab('orders'); setOrderPage(1); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'orders' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <ShoppingCart size={18} /> Đơn hàng
            </button>
            <button onClick={() => setActiveTab('statistics')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'statistics' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'statistics' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <TrendingUp size={18} /> Thống kê doanh thu
            </button>
          </div>
        </aside>

        {/* Console view */}
        <main className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', minHeight: '500px', overflowX: 'auto' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', fontWeight: 600 }}>Đang tải cơ sở dữ liệu...</div>
          ) : (
            <>
              {/* Tab: Dashboard Overview */}
              {activeTab === 'dashboard' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Tổng Quan Hoạt Động Cửa Hàng</h3>

                  {/* Overview Cards Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    {/* Revenue Card */}
                    <div className="glass-panel" style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(219,39,119,0.15) 100%)',
                      border: '1px solid rgba(124, 58, 237, 0.25)',
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>Tổng Doanh Thu</div>
                      <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--accent-primary)', textShadow: '0 2px 10px rgba(124, 58, 237, 0.2)' }}>
                        {(revenueStats.totalRevenue || 0).toLocaleString('vi-VN')} đ
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Tính trên {revenueStats.completedOrdersCount} đơn thành công
                      </div>
                    </div>

                    {/* Low Stock Warning Card */}
                    <div className="glass-panel" style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      borderLeft: '4px solid #ef4444',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('products')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sản Phẩm Gần Hết</div>
                        <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                      </div>
                      <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ef4444', margin: '0.35rem 0' }}>
                        {lowStockProducts.length} <span style={{ fontSize: '1rem', fontWeight: 500 }}>mặt hàng</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Có mức tồn kho ≤ 5 sản phẩm
                      </div>
                    </div>

                    {/* Total Orders Card */}
                    <div className="glass-panel" style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      borderLeft: '4px solid #10b981',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('orders')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tổng Số Đơn Hàng</div>
                        <ShoppingCart size={18} style={{ color: '#10b981' }} />
                      </div>
                      <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#10b981', margin: '0.35rem 0' }}>
                        {revenueStats.totalOrdersCount || 0} <span style={{ fontSize: '1rem', fontWeight: 500 }}>đơn</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {revenueStats.pendingOrdersCount} đang xử lý / {revenueStats.failedOrdersCount} hủy
                      </div>
                    </div>

                    {/* Total Products Card */}
                    <div className="glass-panel" style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      borderLeft: '4px solid var(--accent-secondary)',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('products')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tổng Sản Phẩm</div>
                        <Package size={18} style={{ color: 'var(--accent-secondary)' }} />
                      </div>
                      <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--accent-secondary)', margin: '0.35rem 0' }}>
                        {products.length} <span style={{ fontSize: '1rem', fontWeight: 500 }}>mẫu</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Phân bổ trên {categories.length} danh mục chính
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Warning Alert List */}
                  {lowStockProducts.length > 0 && (
                    <div className="glass-panel" style={{
                      borderLeft: '4px solid #ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.03)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      marginBottom: '2rem',
                      textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ef4444', marginBottom: '1rem', fontWeight: 700 }}>
                        <AlertTriangle size={20} />
                        <span>Cảnh Báo: Sản Phẩm Sắp Hết Hàng ({lowStockProducts.length})</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        {lowStockProducts.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'var(--bg-secondary)' }}>
                            <img src={p.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{p.productName}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mục: {p.category}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 800 }}>Chỉ còn {p.availability}</span>
                              <button onClick={() => { setActiveTab('products'); openEditModal('edit-prod', p); }} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', border: 'none', background: 'var(--accent-primary)', color: 'white', borderRadius: '4px', marginTop: '0.25rem' }}>Nhập hàng</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Charts Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                  }}>
                    {/* Revenue Timeline Chart Card */}
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} />
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Xu Hướng Doanh Thu</h4>
                      </div>
                      {renderRevenueTimelineChart()}
                    </div>

                    {/* Category Distribution progress chart */}
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <TrendingUp size={18} style={{ color: 'var(--accent-secondary)' }} />
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Cơ Cấu Sản Phẩm Theo Danh Mục</h4>
                      </div>
                      {renderCategoryDistribution()}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 1: Products Panel */}
              {activeTab === 'products' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Quản Lý Sản Phẩm ({products.length})</h3>
                    <button onClick={() => openCreateModal('create-prod')} className="btn btn-primary" style={{ padding: '0.45rem 1rem', borderRadius: '8px' }}>
                      <Plus size={16} /> Thêm sản phẩm
                    </button>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>Hình ảnh</th>
                        <th style={{ padding: '0.75rem' }}>Tên sản phẩm</th>
                        <th style={{ padding: '0.75rem' }}>Danh mục</th>
                        <th style={{ padding: '0.75rem' }}>Giá bán</th>
                        <th style={{ padding: '0.75rem' }}>Giá khuyến mãi</th>
                        <th style={{ padding: '0.75rem' }}>Số lượng</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <img src={p.imageUrl} alt={p.productName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'white' }} />
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.productName}</td>
                          <td style={{ padding: '0.75rem' }}>{p.category}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 700 }}>{parseFloat(p.price).toLocaleString('vi-VN')} đ</td>
                          <td style={{ padding: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>{p.promoPrice ? `${parseFloat(p.promoPrice).toLocaleString('vi-VN')} đ` : '-'}</td>
                          <td style={{ padding: '0.75rem' }}>{p.availability}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button onClick={() => openEditModal('edit-prod', p)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', marginRight: '0.4rem' }}>
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Categories Panel */}
              {activeTab === 'categories' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Quản Lý Danh Mục ({categories.length})</h3>
                    <button onClick={() => openCreateModal('create-cat')} className="btn btn-primary" style={{ padding: '0.45rem 1rem', borderRadius: '8px' }}>
                      <Plus size={16} /> Thêm danh mục
                    </button>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>ID</th>
                        <th style={{ padding: '0.75rem' }}>Tên danh mục</th>
                        <th style={{ padding: '0.75rem' }}>Slug</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem' }}>{c.id}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.name}</td>
                          <td style={{ padding: '0.75rem' }}>{c.slug}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button onClick={() => openEditModal('edit-cat', c)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', marginRight: '0.4rem' }}>
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteCategory(c.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Blog Categories Panel */}
              {activeTab === 'blog-cats' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Quản Lý Danh Mục Tin Tức ({blogCategories.length})</h3>
                    <button onClick={() => openCreateModal('create-bcat')} className="btn btn-primary" style={{ padding: '0.45rem 1rem', borderRadius: '8px' }}>
                      <Plus size={16} /> Thêm danh mục tin
                    </button>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>ID</th>
                        <th style={{ padding: '0.75rem' }}>Tên danh mục</th>
                        <th style={{ padding: '0.75rem' }}>Slug</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogCategories.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem' }}>{c.id}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.name}</td>
                          <td style={{ padding: '0.75rem' }}>{c.slug}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button onClick={() => openEditModal('edit-bcat', c)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', marginRight: '0.4rem' }}>
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteBlogCategory(c.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 4: Blog Posts Panel */}
              {activeTab === 'blogs' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Quản Lý Bài Viết / Tin Tức ({blogs.length})</h3>
                    <button onClick={() => openCreateModal('create-post')} className="btn btn-primary" style={{ padding: '0.45rem 1rem', borderRadius: '8px' }}>
                      <Plus size={16} /> Thêm bài viết
                    </button>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>Ảnh bìa</th>
                        <th style={{ padding: '0.75rem' }}>Tiêu đề</th>
                        <th style={{ padding: '0.75rem' }}>Danh mục tin</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map(post => (
                        <tr key={post.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <img src={post.coverImageUrl} alt="" style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 600, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</td>
                          <td style={{ padding: '0.75rem' }}>{post.categoryName}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button onClick={() => openEditModal('edit-post', post)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', marginRight: '0.4rem' }}>
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteBlogPost(post.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 5: Banners Panel */}
              {activeTab === 'banners' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Quản Lý Banners Quảng Cáo ({banners.length})</h3>
                    <button onClick={() => openCreateModal('create-banner')} className="btn btn-primary" style={{ padding: '0.45rem 1rem', borderRadius: '8px' }}>
                      <Plus size={16} /> Thêm banner
                    </button>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>Hình ảnh</th>
                        <th style={{ padding: '0.75rem' }}>Tiêu đề quảng cáo</th>
                        <th style={{ padding: '0.75rem' }}>Link chuyển</th>
                        <th style={{ padding: '0.75rem' }}>Trạng thái</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <img src={b.imageUrl} alt="" style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>{b.title}</td>
                          <td style={{ padding: '0.75rem' }}>{b.targetUrl}</td>
                          <td style={{ padding: '0.75rem' }}>
                            {b.active ? (
                              <span className="badge badge-stock">Hoạt động</span>
                            ) : (
                              <span className="badge" style={{ backgroundColor: 'rgba(156,163,175,0.15)', color: '#9ca3af' }}>Ẩn</span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button onClick={() => openEditModal('edit-banner', b)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', marginRight: '0.4rem' }}>
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteBanner(b.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 6: Users Management */}
              {activeTab === 'users' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quản Lý Tài Khoản Khách Hàng / Nhân Viên ({users.length})</h3>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>ID</th>
                        <th style={{ padding: '0.75rem' }}>Tên đăng nhập</th>
                        <th style={{ padding: '0.75rem' }}>Họ tên</th>
                        <th style={{ padding: '0.75rem' }}>Số điện thoại</th>
                        <th style={{ padding: '0.75rem' }}>Phân quyền</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(usr => (
                        <tr key={usr.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem' }}>{usr.id}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>{usr.userName}</td>
                          <td style={{ padding: '0.75rem' }}>
                            {usr.userDetails ? `${usr.userDetails.lastName || ''} ${usr.userDetails.firstName || ''}`.trim() : '-'}
                          </td>
                          <td style={{ padding: '0.75rem' }}>{usr.userDetails?.phoneNumber || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span 
                              className="badge" 
                              style={{ 
                                backgroundColor: usr.role?.roleName === 'ROLE_ADMIN' ? 'rgba(124, 58, 237, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                                color: usr.role?.roleName === 'ROLE_ADMIN' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontWeight: 700 
                              }}
                            >
                              {usr.role?.roleName || 'ROLE_USER'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            {/* Do not allow toggling self */}
                            {usr.id !== user.userId && (
                              <>
                                <button onClick={() => handleToggleUserRole(usr)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', marginRight: '0.4rem', fontSize: '0.75rem' }} title="Đổi quyền hạn">
                                  Đổi Quyền
                                </button>
                                <button onClick={() => handleDeleteUser(usr.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 7: Orders Manager */}
              {activeTab === 'orders' && (() => {
                const ordersPerPage = 5;
                const totalPages = Math.ceil(orders.length / ordersPerPage);
                const indexOfLastOrder = orderPage * ordersPerPage;
                const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
                const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

                return (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quản Lý Đơn Hàng ({orders.length})</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {currentOrders.map(ord => (
                        <div key={ord.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                              <strong>Đơn hàng #{ord.id}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ngày đặt: {ord.orderedDate}</span>
                              <button 
                                onClick={() => openViewOrderModal(ord)} 
                                className="btn btn-secondary" 
                                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <Eye size={12} /> Xem chi tiết
                              </button>
                            </div>
                            
                            {/* Order & Payment Status selectors */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Đơn hàng:</span>
                                <select 
                                  value={ord.status} 
                                  onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value, ord.paymentStatus)}
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                                >
                                  <option value="PENDING">Chờ xử lý</option>
                                  <option value="CONFIRMED">Đã nhận</option>
                                  <option value="SHIPPED">Đang vận chuyển</option>
                                  <option value="DELIVERED">Đã giao</option>
                                  <option value="CANCELLED">Đã hủy</option>
                                </select>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Thanh toán:</span>
                                <span style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  fontSize: '0.8rem', 
                                  borderRadius: '6px', 
                                  border: '1px solid var(--border-color)', 
                                  backgroundColor: 'var(--bg-primary)', 
                                  color: 'var(--text-primary)',
                                  fontWeight: 700
                                }}>
                                  {ord.paymentMethod === 'BANK' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Order info details */}
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                            <div>
                              <div>Họ tên khách: <strong>{ord.fullName || ord.user?.userName}</strong></div>
                              <div>Số điện thoại: <strong>{ord.phoneNumber || '-'}</strong></div>
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                                <span>Trạng thái: </span>
                                <span style={{ 
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: ord.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 
                                                   ord.paymentStatus === 'FAILED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: ord.paymentStatus === 'PAID' ? '#34d399' : 
                                         ord.paymentStatus === 'FAILED' ? '#f87171' : '#fbbf24'
                                }}>
                                  {ord.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                                   ord.paymentStatus === 'FAILED' ? 'Thất bại' : 'Chờ thanh toán'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div>Địa chỉ giao: <strong>{ord.shippingAddress || 'Chưa cập nhật'}</strong></div>
                              <div style={{ color: 'var(--accent-primary)', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.25rem' }}>Tổng thanh toán: {parseFloat(ord.total).toLocaleString('vi-VN')} đ</div>
                            </div>
                          </div>

                          {/* Items listed */}
                          <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                            {ord.items && ord.items.map(it => (
                              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center' }}>
                                <span>
                                  {it.product?.productName}
                                  {(it.color || it.size) && (
                                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 600 }}>
                                      ({[it.color, it.size].filter(Boolean).join(' - ')})
                                    </span>
                                  )}
                                  <strong> x{it.quantity}</strong>
                                </span>
                                <strong>{(it.product ? parseFloat(it.product.price) * it.quantity : 0).toLocaleString('vi-VN')} đ</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                        <button 
                          disabled={orderPage === 1}
                          onClick={() => setOrderPage(prev => Math.max(prev - 1, 1))}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', height: 'auto', fontSize: '0.85rem' }}
                        >
                          Trước
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => setOrderPage(p)}
                            className={`btn ${orderPage === p ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ 
                              padding: '0.4rem 0.8rem', 
                              height: 'auto', 
                              fontSize: '0.85rem',
                              minWidth: '32px'
                            }}
                          >
                            {p}
                          </button>
                        ))}
                        
                        <button 
                          disabled={orderPage === totalPages}
                          onClick={() => setOrderPage(prev => Math.min(prev + 1, totalPages))}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', height: 'auto', fontSize: '0.85rem' }}
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Tab 8: Statistics Panel */}
              {activeTab === 'statistics' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Báo Cáo & Thống Kê Doanh Thu</h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2.5rem'
                  }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-primary)', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tổng Doanh Thu (Đơn hoàn thành)</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {(revenueStats.totalRevenue || 0).toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #10b981', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Đơn Hàng Đã Giao</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {revenueStats.completedOrdersCount || 0} đơn
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #fbbf24', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Đơn Hàng Chờ Xử Lý</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {revenueStats.pendingOrdersCount || 0} đơn
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #ef4444', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Đơn Hàng Thất Bại / Hủy</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {revenueStats.failedOrdersCount || 0} đơn
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>Tóm Tắt Hoạt Động</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <span>Tổng số đơn đặt hàng:</span>
                        <strong>{revenueStats.totalOrdersCount || 0} đơn</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <span>Tỷ lệ hoàn thành đơn hàng:</span>
                        <strong>
                          {revenueStats.totalOrdersCount > 0 
                            ? Math.round((revenueStats.completedOrdersCount / revenueStats.totalOrdersCount) * 100) 
                            : 0}%
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                        <span>Doanh thu trung bình trên mỗi đơn hàng:</span>
                        <strong>
                          {revenueStats.completedOrdersCount > 0 
                            ? Math.round(revenueStats.totalRevenue / revenueStats.completedOrdersCount).toLocaleString('vi-VN') 
                            : 0} đ
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* CRUD Pop-up Modals */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyOrigin: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: modalType === 'view-order' ? '680px' : '520px', padding: '2rem', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {modalType === 'view-order' ? 'Chi Tiết Đơn Hàng' : modalType.startsWith('create') ? 'Thêm mới' : 'Chỉnh sửa'} {
                  modalType === 'view-order' ? '' :
                  modalType.endsWith('prod') ? 'Sản phẩm' :
                  modalType.endsWith('cat') ? 'Danh mục' :
                  modalType.endsWith('bcat') ? 'Danh mục tin' :
                  modalType.endsWith('post') ? 'Bài viết' : 'Banner'
                }
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* View Order Details */}
            {modalType === 'view-order' && selectedEntity && (() => {
              const ord = selectedEntity;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* General Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ marginBottom: '0.5rem' }}>Mã đơn hàng: <strong style={{ color: 'var(--accent-primary)' }}>#{ord.id}</strong></div>
                      <div style={{ marginBottom: '0.5rem' }}>Ngày đặt: <strong>{ord.orderedDate || '-'}</strong></div>
                      <div style={{ marginBottom: '0.5rem' }}>Trạng thái đơn: 
                        <span style={{ 
                          marginLeft: '0.5rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: ord.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.15)' : 
                                           ord.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: ord.status === 'DELIVERED' ? '#34d399' : 
                                 ord.status === 'CANCELLED' ? '#f87171' : '#fbbf24'
                        }}>
                          {ord.status === 'PENDING' ? 'Chờ xử lý' :
                           ord.status === 'CONFIRMED' ? 'Đã nhận' :
                           ord.status === 'SHIPPED' ? 'Đang vận chuyển' :
                           ord.status === 'DELIVERED' ? 'Đã giao' : 'Đã hủy'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ marginBottom: '0.5rem' }}>Thanh toán: 
                        <span style={{ 
                          marginLeft: '0.5rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: ord.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 
                                           ord.paymentStatus === 'FAILED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: ord.paymentStatus === 'PAID' ? '#34d399' : 
                                 ord.paymentStatus === 'FAILED' ? '#f87171' : '#fbbf24'
                        }}>
                          {ord.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                           ord.paymentStatus === 'FAILED' ? 'Thất bại' : 'Chờ thanh toán'}
                        </span>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>Phương thức: <strong>{ord.paymentMethod === 'BANK' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng'}</strong></div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--accent-primary)' }}>Thông Tin Khách Hàng</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                      <div>Họ tên: <strong>{ord.fullName || ord.user?.userName || '-'}</strong></div>
                      <div>Số điện thoại: <strong>{ord.phoneNumber || '-'}</strong></div>
                      <div style={{ gridColumn: 'span 2' }}>Địa chỉ giao hàng: <strong>{ord.shippingAddress || 'Chưa cập nhật'}</strong></div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--accent-primary)' }}>Danh Sách Sản Phẩm</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {ord.items && ord.items.map(it => (
                        <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {it.product?.imageUrl ? (
                              <img src={it.product.imageUrl} alt={it.product.productName} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                            ) : (
                              <div style={{ width: '45px', height: '45px', backgroundColor: 'var(--border-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>No image</div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{it.product?.productName}</span>
                              {(it.color || it.size) && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.1rem' }}>
                                  Phân loại: {[it.color, it.size].filter(Boolean).join(' - ')}
                                </span>
                              )}
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Đơn giá: {parseFloat(it.product?.price || 0).toLocaleString('vi-VN')} đ</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                            <div>Số lượng: <strong>x{it.quantity}</strong></div>
                            <strong style={{ color: 'var(--accent-primary)' }}>{(it.product ? parseFloat(it.product.price) * it.quantity : 0).toLocaleString('vi-VN')} đ</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total summary */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border-color)' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>Tổng cộng:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{parseFloat(ord.total).toLocaleString('vi-VN')} đ</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem' }}>Đóng</button>
                  </div>
                </div>
              );
            })()}

            {/* Form for Product */}
            {modalType.includes('prod') && (
              <form onSubmit={handleProductSubmit}>
                <div className="form-group">
                  <label className="form-label">Tên sản phẩm</label>
                  <input type="text" required className="form-input" value={prodForm.productName} onChange={(e) => setProdForm({ ...prodForm, productName: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Giá gốc (đ)</label>
                    <input type="number" step="1" required className="form-input" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giá khuyến mãi (đ)</label>
                    <input type="number" step="1" className="form-input" value={prodForm.promoPrice} onChange={(e) => setProdForm({ ...prodForm, promoPrice: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Danh mục</label>
                    <select className="form-input" value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số lượng có sẵn</label>
                    <input type="number" required className="form-input" value={prodForm.availability} onChange={(e) => setProdForm({ ...prodForm, availability: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Link hình ảnh sản phẩm</label>
                  <input type="text" required className="form-input" value={prodForm.imageUrl} onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })} />
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'prod', 'imageUrl')} style={{ display: 'none' }} id="prod-file-upload" />
                    <label htmlFor="prod-file-upload" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-block' }}>
                      {uploading ? 'Đang tải lên...' : 'Tải ảnh lên Cloudinary'}
                    </label>
                    {prodForm.imageUrl && <img src={prodForm.imageUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'white' }} />}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả sản phẩm</label>
                  <textarea rows="3" className="form-input" value={prodForm.discription} onChange={(e) => setProdForm({ ...prodForm, discription: e.target.value })} style={{ resize: 'vertical' }} />
                </div>

                {/* Product Variants Section */}
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--accent-primary)' }}>Phân Loại Sản Phẩm ({prodForm.variants?.length || 0})</h4>
                    <button
                      type="button"
                      onClick={() => setProdForm(prev => ({
                        ...prev,
                        variants: [...(prev.variants || []), { color: '', size: '', price: '', availability: 10, imageUrl: '' }]
                      }))}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Plus size={14} /> Thêm phân loại
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(!prodForm.variants || prodForm.variants.length === 0) ? (
                      <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Chưa có phân loại nào. Sản phẩm này sẽ bán với thông tin giá gốc ở trên.
                      </div>
                    ) : (
                      prodForm.variants.map((variant, index) => (
                        <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', position: 'relative' }}>
                          
                          {/* Close / Delete variant button */}
                          <button
                            type="button"
                            onClick={() => setProdForm(prev => ({
                              ...prev,
                              variants: prev.variants.filter((_, i) => i !== index)
                            }))}
                            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            title="Xóa phân loại"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Màu sắc</label>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                                placeholder="VD: Đỏ, Trắng..."
                                value={variant.color}
                                onChange={(e) => {
                                  const updated = [...prodForm.variants];
                                  updated[index].color = e.target.value;
                                  setProdForm(prev => ({ ...prev, variants: updated }));
                                }}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Kích thước</label>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                                placeholder="VD: M, XL, 42..."
                                value={variant.size}
                                onChange={(e) => {
                                  const updated = [...prodForm.variants];
                                  updated[index].size = e.target.value;
                                  setProdForm(prev => ({ ...prev, variants: updated }));
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Giá riêng (để trống nếu dùng giá gốc)</label>
                              <input
                                type="number"
                                className="form-input"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                                value={variant.price || ''}
                                onChange={(e) => {
                                  const updated = [...prodForm.variants];
                                  updated[index].price = e.target.value;
                                  setProdForm(prev => ({ ...prev, variants: updated }));
                                }}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Số lượng có sẵn</label>
                              <input
                                type="number"
                                className="form-input"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                                value={variant.availability}
                                onChange={(e) => {
                                  const updated = [...prodForm.variants];
                                  updated[index].availability = e.target.value;
                                  setProdForm(prev => ({ ...prev, variants: updated }));
                                }}
                              />
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Link hình ảnh phân loại</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                              value={variant.imageUrl || ''}
                              onChange={(e) => {
                                const updated = [...prodForm.variants];
                                updated[index].imageUrl = e.target.value;
                                  setProdForm(prev => ({ ...prev, variants: updated }));
                                }}
                              />
                              <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleVariantFileUpload(e, index)}
                                  style={{ display: 'none' }}
                                  id={`variant-file-upload-${index}`}
                                />
                                <label
                                  htmlFor={`variant-file-upload-${index}`}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem', height: 'auto', cursor: 'pointer' }}
                                >
                                  {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
                                </label>
                                {variant.imageUrl && (
                                  <img src={variant.imageUrl} alt="Variant Preview" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'white' }} />
                                )}
                              </div>
                            </div>

                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '42px' }}>Lưu dữ liệu</button>
              </form>
            )}

            {/* Form for Category */}
            {modalType.includes('cat') && !modalType.includes('bcat') && (
              <form onSubmit={handleCategorySubmit}>
                <div className="form-group">
                  <label className="form-label">Tên danh mục</label>
                  <input type="text" required className="form-input" value={catForm.name} onChange={(e) => setCatForm({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input type="text" required className="form-input" value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '42px' }}>Lưu dữ liệu</button>
              </form>
            )}

            {/* Form for Blog Category */}
            {modalType.includes('bcat') && (
              <form onSubmit={handleBlogCategorySubmit}>
                <div className="form-group">
                  <label className="form-label">Tên danh mục tin tức</label>
                  <input type="text" required className="form-input" value={bcatForm.name} onChange={(e) => setBcatForm({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input type="text" required className="form-input" value={bcatForm.slug} onChange={(e) => setBcatForm({ ...bcatForm, slug: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '42px' }}>Lưu dữ liệu</button>
              </form>
            )}

            {/* Form for Blog Post */}
            {modalType.includes('post') && (
              <form onSubmit={handleBlogPostSubmit}>
                <div className="form-group">
                  <label className="form-label">Tiêu đề bài viết</label>
                  <input type="text" required className="form-input" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục bài viết</label>
                  <select className="form-input" value={postForm.categoryName} onChange={(e) => setPostForm({ ...postForm, categoryName: e.target.value })}>
                    {blogCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Link ảnh bìa bài viết</label>
                  <input type="text" required className="form-input" value={postForm.coverImageUrl} onChange={(e) => setPostForm({ ...postForm, coverImageUrl: e.target.value })} />
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'post', 'coverImageUrl')} style={{ display: 'none' }} id="post-file-upload" />
                    <label htmlFor="post-file-upload" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-block' }}>
                      {uploading ? 'Đang tải lên...' : 'Tải ảnh lên Cloudinary'}
                    </label>
                    {postForm.coverImageUrl && <img src={postForm.coverImageUrl} alt="Preview" style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'white' }} />}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nội dung chi tiết bài viết</label>
                  <textarea rows="6" required className="form-input" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '42px' }}>Lưu bài viết</button>
              </form>
            )}

            {/* Form for Banner */}
            {modalType.includes('banner') && (
              <form onSubmit={handleBannerSubmit}>
                <div className="form-group">
                  <label className="form-label">Tiêu đề quảng cáo</label>
                  <input type="text" required className="form-input" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Link hình ảnh banner</label>
                  <input type="text" required className="form-input" value={bannerForm.imageUrl} onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} />
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'banner', 'imageUrl')} style={{ display: 'none' }} id="banner-file-upload" />
                    <label htmlFor="banner-file-upload" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-block' }}>
                      {uploading ? 'Đang tải lên...' : 'Tải ảnh lên Cloudinary'}
                    </label>
                    {bannerForm.imageUrl && <img src={bannerForm.imageUrl} alt="Preview" style={{ width: '60px', height: '30px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'white' }} />}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Link đích đến khi nhấn vào</label>
                  <input type="text" required className="form-input" value={bannerForm.targetUrl} onChange={(e) => setBannerForm({ ...bannerForm, targetUrl: e.target.value })} />
                </div>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="bannerActive" checked={bannerForm.active} onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })} style={{ accentColor: 'var(--accent-primary)' }} />
                  <label htmlFor="bannerActive" className="form-label" style={{ marginBottom: 0 }}>Cho phép hoạt động hiển thị</label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '42px' }}>Lưu banner</button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
