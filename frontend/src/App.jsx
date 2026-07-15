import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard';
import PaymentResult from './pages/PaymentResult';
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';

import './App.css';

function AppContent({
  theme,
  setTheme,
  user,
  setUser,
  cart,
  setCart,
  handleAddToCart,
  handleUpdateQuantity,
  handleRemoveFromCart,
  handleClearCart,
  handleBuyNow,
  handleLoginSuccess,
  handleLogout,
  toggleTheme,
  cartCount
}) {
  const location = useLocation();
  // Check if current page is admin dashboard (/admin) or admin login (/admin/login)
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Customer Header Navigation: HIDE on Admin routes */}
      {!isAdminRoute && (
        <Header 
          cartCount={cartCount} 
          user={user} 
          onLogout={handleLogout} 
          openAuthModal={() => window.location.href = '/login'}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
          <Route path="/shop" element={<Shop onAddToCart={handleAddToCart} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={handleAddToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} onUpdateQuantity={handleUpdateQuantity} onRemoveFromCart={handleRemoveFromCart} user={user} openAuthModal={() => window.location.href = '/login'} />} />
          <Route path="/checkout" element={<Checkout cart={cart} user={user} onClearCart={handleClearCart} />} />
          <Route path="/payment-result" element={<PaymentResult onClearCart={handleClearCart} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/admin/login" element={<AdminLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Customer Footer: HIDE on Admin routes */}
      {!isAdminRoute && <Footer />}

      {/* Customer AI Chatbot: HIDE on Admin routes */}
      {!isAdminRoute && (
        <Chatbot 
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('nexus_theme') || 'dark');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // Initialize theme and user session
  useEffect(() => {
    // Theme setup
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Session setup
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Cart setup
    const savedCart = localStorage.getItem('nexus_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
      let newCart = [...prevCart];

      if (existingItemIndex > -1) {
        const currentQty = newCart[existingItemIndex].quantity;
        const newQty = Math.min(product.availability, currentQty + quantity);
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newQty
        };
      } else {
        newCart.push({ product, quantity: Math.min(product.availability, quantity) });
      }

      localStorage.setItem('nexus_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const item = prevCart.find(i => i.product.id === productId);
      if (!item) return prevCart;

      const maxAvailability = item.product.availability;
      const updatedCart = prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: Math.min(maxAvailability, newQuantity) } 
          : item
      );

      localStorage.setItem('nexus_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.product.id !== productId);
      localStorage.setItem('nexus_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('nexus_cart');
  };

  const handleBuyNow = (product) => {
    handleAddToCart(product, 1);
    if (!user) {
      window.location.href = '/login';
    } else {
      window.location.href = '/checkout';
    }
  };

  // Auth Operations
  const handleLoginSuccess = (loginData) => {
    const session = {
      username: loginData.username || loginData.userName,
      userId: loginData.userId || loginData.id,
      role: typeof loginData.role === 'object' ? (loginData.role?.roleName || 'ROLE_USER') : (loginData.role || 'ROLE_USER'),
      token: loginData.token
    };
    setUser(session);
    localStorage.setItem('nexus_user', JSON.stringify(session));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
    window.location.href = '/';
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BrowserRouter>
      <AppContent 
        theme={theme}
        setTheme={setTheme}
        user={user}
        setUser={setUser}
        cart={cart}
        setCart={setCart}
        handleAddToCart={handleAddToCart}
        handleUpdateQuantity={handleUpdateQuantity}
        handleRemoveFromCart={handleRemoveFromCart}
        handleClearCart={handleClearCart}
        handleBuyNow={handleBuyNow}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
        toggleTheme={toggleTheme}
        cartCount={cartCount}
      />
    </BrowserRouter>
  );
}

export default App;
