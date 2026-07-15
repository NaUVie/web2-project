import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FolderTree, FileText, Image, Users, ShoppingCart, Plus, Edit, Trash2, Check, X, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminDashboard({ user, openAuthModal }) {
  const navigate = useNavigate();

  // Tabs: 'products', 'categories', 'blog-cats', 'blogs', 'banners', 'users', 'orders'
  const [activeTab, setActiveTab] = useState('products');

  // Entities lists state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Create/Edit Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create-prod', 'edit-prod', 'create-cat', 'edit-cat', 'create-bcat', 'edit-bcat', 'create-post', 'edit-post', 'create-banner', 'edit-banner'
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Form inputs
  const [prodForm, setProdForm] = useState({ productName: '', price: '', promoPrice: '', category: '', availability: 10, imageUrl: '', discription: '' });
  const [catForm, setCatForm] = useState({ name: '', slug: '' });
  const [bcatForm, setBcatForm] = useState({ name: '', slug: '' });
  const [postForm, setPostForm] = useState({ title: '', content: '', coverImageUrl: '', categoryName: '' });
  const [bannerForm, setBannerForm] = useState({ title: '', imageUrl: '', targetUrl: '', active: true });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      api.getAllOrdersAdmin().catch(() => [])
    ]).then(([prods, cats, bcats, posts, bns, usrs, ords]) => {
      setProducts(prods);
      setCategories(cats);
      setBlogCategories(bcats);
      setBlogs(posts);
      setBanners(bns);
      setUsers(usrs);
      setOrders(ords);
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
        availability: parseInt(prodForm.availability)
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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await api.updateOrderStatus(orderId, newStatus).then(triggerRefresh).catch(e => alert(e.message));
  };

  const openCreateModal = (type) => {
    setModalType(type);
    setSelectedEntity(null);
    if (type === 'create-prod') setProdForm({ productName: '', price: '', promoPrice: '', category: categories[0]?.name || 'Electronics', availability: 10, imageUrl: '', discription: '' });
    if (type === 'create-cat') setCatForm({ name: '', slug: '' });
    if (type === 'create-bcat') setBcatForm({ name: '', slug: '' });
    if (type === 'create-post') setPostForm({ title: '', content: '', coverImageUrl: '', categoryName: blogCategories[0]?.name || 'Technology News' });
    if (type === 'create-banner') setBannerForm({ title: '', imageUrl: '', targetUrl: '', active: true });
    setShowModal(true);
  };

  const openEditModal = (type, entity) => {
    setModalType(type);
    setSelectedEntity(entity);
    if (type === 'edit-prod') setProdForm({ productName: entity.productName, price: entity.price, promoPrice: entity.promoPrice || '', category: entity.category, availability: entity.availability, imageUrl: entity.imageUrl, discription: entity.discription });
    if (type === 'edit-cat') setCatForm({ name: entity.name, slug: entity.slug });
    if (type === 'edit-bcat') setBcatForm({ name: entity.name, slug: entity.slug });
    if (type === 'edit-post') setPostForm({ title: entity.title, content: entity.content, coverImageUrl: entity.coverImageUrl, categoryName: entity.categoryName });
    if (type === 'edit-banner') setBannerForm({ title: entity.title, imageUrl: entity.imageUrl, targetUrl: entity.targetUrl, active: entity.active });
    setShowModal(true);
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
            <button onClick={() => setActiveTab('orders')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', background: activeTab === 'orders' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
              <ShoppingCart size={18} /> Đơn hàng
            </button>
          </div>
        </aside>

        {/* Console view */}
        <main className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', minHeight: '500px', overflowX: 'auto' }}>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', fontWeight: 600 }}>Đang tải cơ sở dữ liệu...</div>
          ) : (
            <>
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
              {activeTab === 'orders' && (
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quản Lý Đơn Hàng ({orders.length})</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map(ord => (
                      <div key={ord.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                          <div>
                            <strong>Đơn hàng #{ord.id}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>Ngày đặt: {ord.orderedDate}</span>
                          </div>
                          
                          {/* Order Status selector */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Trạng thái:</span>
                            <select 
                              value={ord.status} 
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </div>
                        </div>

                        {/* Order info details */}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                          <div>
                            <div>Họ tên khách: <strong>{ord.fullName || ord.user?.userName}</strong></div>
                            <div>Số điện thoại: <strong>{ord.phoneNumber || '-'}</strong></div>
                            <div>Phương thức: <strong>{ord.paymentMethod || 'COD'}</strong></div>
                          </div>
                          <div>
                            <div>Địa chỉ giao: <strong>{ord.shippingAddress || 'Chưa cập nhật'}</strong></div>
                            <div style={{ color: 'var(--accent-primary)', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.25rem' }}>Tổng thanh toán: {parseFloat(ord.total).toLocaleString('vi-VN')} đ</div>
                          </div>
                        </div>

                        {/* Items listed */}
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                          {ord.items && ord.items.map(it => (
                            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                              <span>{it.product?.productName} <strong>x{it.quantity}</strong></span>
                              <strong>{(it.product ? parseFloat(it.product.price) * it.quantity : 0).toLocaleString('vi-VN')} đ</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '2rem', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {modalType.startsWith('create') ? 'Thêm mới' : 'Chỉnh sửa'} {
                  modalType.endsWith('prod') ? 'Sản phẩm' :
                  modalType.endsWith('cat') ? 'Danh mục' :
                  modalType.endsWith('bcat') ? 'Danh mục tin' :
                  modalType.endsWith('post') ? 'Bài viết' : 'Banner'
                }
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>✕</button>
            </div>

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
