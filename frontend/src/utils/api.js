const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8900/api';

const getAuthHeaders = (extraHeaders = {}) => {
  const savedUser = localStorage.getItem('nexus_user');
  const headers = { ...extraHeaders };
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      if (user.userId) {
        headers['X-User-Id'] = String(user.userId);
      }
    } catch (e) {
      console.error('Error parsing user session', e);
    }
  }
  return headers;
};

export const api = {
  // Accounts (User Service)
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/accounts/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Đăng nhập thất bại');
    }
    return res.json();
  },

  loginWithGoogle: async (idToken) => {
    const res = await fetch(`${API_BASE}/accounts/login/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Đăng nhập Google thất bại');
    }
    return res.json();
  },

  forgotPassword: async (email) => {
    const res = await fetch(`${API_BASE}/accounts/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gửi yêu cầu khôi phục mật khẩu thất bại');
    }
    return res.json();
  },

  resetPassword: async (token, newPassword) => {
    const res = await fetch(`${API_BASE}/accounts/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Mã khôi phục không hợp lệ hoặc đã hết hạn');
    }
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/accounts/registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Đăng ký tài khoản thất bại');
    return res.json();
  },

  checkUsername: async (username) => {
    const res = await fetch(`${API_BASE}/accounts/users/check-username?username=${encodeURIComponent(username)}`);
    return res.json(); // { exists: boolean }
  },

  checkEmail: async (email) => {
    const res = await fetch(`${API_BASE}/accounts/users/check-email?email=${encodeURIComponent(email)}`);
    return res.json(); // { exists: boolean }
  },

  getUserProfile: async (id) => {
    const res = await fetch(`${API_BASE}/accounts/users/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải hồ sơ');
    return res.json();
  },

  updateUserProfile: async (id, profileData) => {
    const res = await fetch(`${API_BASE}/accounts/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error('Cập nhật hồ sơ thất bại');
    return res.json();
  },

  changePassword: async (id, newPassword) => {
    const res = await fetch(`${API_BASE}/accounts/users/${id}/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ newPassword })
    });
    if (!res.ok) throw new Error('Đổi mật khẩu thất bại');
    return true;
  },

  getUsersList: async () => {
    const res = await fetch(`${API_BASE}/accounts/users`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải danh sách tài khoản');
    return res.json();
  },

  updateUserRole: async (id, roleName) => {
    const res = await fetch(`${API_BASE}/accounts/users/${id}/role`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ roleName })
    });
    if (!res.ok) throw new Error('Cập nhật phân quyền thất bại');
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE}/accounts/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Xóa tài khoản thất bại');
    return true;
  },

  // Catalog (Product Catalog Service)
  getProducts: async (categories = [], name = '') => {
    const params = new URLSearchParams();
    if (Array.isArray(categories)) {
      categories.forEach(cat => {
        if (cat && cat !== 'All') {
          params.append('category', cat);
        }
      });
    } else if (categories && categories !== 'All') {
      params.append('category', categories);
    }
    if (name) params.append('name', name);
    
    const queryString = params.toString();
    const url = queryString ? `${API_BASE}/catalog/products?${queryString}` : `${API_BASE}/catalog/products`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/catalog/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    if (!res.ok) throw new Error('Tải ảnh lên thất bại');
    return res.json();
  },

  getProductById: async (id) => {
    const res = await fetch(`${API_BASE}/catalog/products/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
    return res.json();
  },

  addProduct: async (productData) => {
    const res = await fetch(`${API_BASE}/catalog/products`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Thêm sản phẩm thất bại');
    return res.json();
  },

  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE}/catalog/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Cập nhật sản phẩm thất bại');
    return res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/catalog/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Xóa sản phẩm thất bại');
    return true;
  },

  // Categories (Product Catalog Service)
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/catalog/categories`);
    if (!res.ok) return [];
    return res.json();
  },

  addCategory: async (categoryData) => {
    const res = await fetch(`${API_BASE}/catalog/categories`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Thêm danh mục thất bại');
    return res.json();
  },

  updateCategory: async (id, categoryData) => {
    const res = await fetch(`${API_BASE}/catalog/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Cập nhật danh mục thất bại');
    return res.json();
  },

  deleteCategory: async (id) => {
    const res = await fetch(`${API_BASE}/catalog/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Xóa danh mục thất bại');
    return true;
  },

  // Blog Categories
  getBlogCategories: async () => {
    const res = await fetch(`${API_BASE}/catalog/blog-categories`);
    if (!res.ok) return [];
    return res.json();
  },

  addBlogCategory: async (categoryData) => {
    const res = await fetch(`${API_BASE}/catalog/blog-categories`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Thêm danh mục tin tức thất bại');
    return res.json();
  },

  updateBlogCategory: async (id, categoryData) => {
    const res = await fetch(`${API_BASE}/catalog/blog-categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Cập nhật danh mục tin tức thất bại');
    return res.json();
  },

  deleteBlogCategory: async (id) => {
    const res = await fetch(`${API_BASE}/catalog/blog-categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Xóa danh mục tin tức thất bại');
    return true;
  },

  // Blog Posts
  getBlogs: async (category = '') => {
    const url = category 
      ? `${API_BASE}/catalog/blogs?category=${encodeURIComponent(category)}`
      : `${API_BASE}/catalog/blogs`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
  },

  getBlogById: async (id) => {
    const res = await fetch(`${API_BASE}/catalog/blogs/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy bài viết');
    return res.json();
  },

  addBlogPost: async (postData) => {
    const res = await fetch(`${API_BASE}/catalog/blogs`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(postData)
    });
    if (!res.ok) throw new Error('Thêm bài viết thất bại');
    return res.json();
  },

  updateBlogPost: async (id, postData) => {
    const res = await fetch(`${API_BASE}/catalog/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(postData)
    });
    if (!res.ok) throw new Error('Cập nhật bài viết thất bại');
    return res.json();
  },

  deleteBlogPost: async (id) => {
    const res = await fetch(`${API_BASE}/catalog/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Xóa bài viết thất bại');
    return true;
  },

  // Banners
  getBanners: async () => {
    const res = await fetch(`${API_BASE}/catalog/banners`);
    if (!res.ok) return [];
    return res.json();
  },

  getAllBannersAdmin: async () => {
    const res = await fetch(`${API_BASE}/catalog/banners/admin`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  addBanner: async (bannerData) => {
    const res = await fetch(`${API_BASE}/catalog/banners`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(bannerData)
    });
    if (!res.ok) throw new Error('Thêm banner thất bại');
    return res.json();
  },

  updateBanner: async (id, bannerData) => {
    const res = await fetch(`${API_BASE}/catalog/banners/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(bannerData)
    });
    if (!res.ok) throw new Error('Cập nhật banner thất bại');
    return res.json();
  },

  deleteBanner: async (id) => {
    const res = await fetch(`${API_BASE}/catalog/banners/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Xóa banner thất bại');
    return true;
  },

  // Shop (Order Service)
  syncCart: async (cartItems, userId) => {
    for (const item of cartItems) {
      const colorParam = item.selectedColor ? `&color=${encodeURIComponent(item.selectedColor)}` : '';
      const sizeParam = item.selectedSize ? `&size=${encodeURIComponent(item.selectedSize)}` : '';
      await fetch(`${API_BASE}/shop/cart?productId=${item.product.id}&quantity=${item.quantity}${colorParam}${sizeParam}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    }
  },

  placeOrder: async (userId, cartItems, shippingInfo) => {
    await api.syncCart(cartItems, userId);
    
    const res = await fetch(`${API_BASE}/shop/order/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(shippingInfo)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Đặt hàng thất bại');
    }
    return res.json();
  },

  confirmPayment: async (searchParamsString) => {
    const res = await fetch(`${API_BASE}/payment/orders/payment-confirm${searchParamsString}`);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Xác thực thanh toán thất bại');
    }
    return res.json();
  },

  getOrderPaymentUrl: async (orderId) => {
    const res = await fetch(`${API_BASE}/payment/orders/${orderId}/payment-url`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Lấy link thanh toán thất bại');
    }
    return res.json();
  },

  getUserOrders: async (userId) => {
    const res = await fetch(`${API_BASE}/shop/orders/user/${userId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  getAllOrdersAdmin: async () => {
    const res = await fetch(`${API_BASE}/shop/orders`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  updateOrderStatus: async (orderId, status, paymentStatus) => {
    const res = await fetch(`${API_BASE}/shop/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, paymentStatus })
    });
    if (!res.ok) throw new Error('Cập nhật trạng thái đơn hàng thất bại');
    return res.json();
  },

  getRevenueStatistics: async () => {
    const res = await fetch(`${API_BASE}/shop/orders/statistics/revenue`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải thống kê doanh thu');
    return res.json();
  },

  // Chatbot (Chatbot Service)
  sendChatMessage: async (message) => {
    const res = await fetch(`${API_BASE}/chatbot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('Không thể kết nối với chatbot');
    return res.json();
  }
};
