import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2, Key, Bot } from 'lucide-react';
import { api } from '../utils/api';

export default function Chatbot({ onAddToCart, onBuyNow }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const chatEndRef = useRef(null);

  // Load chat history & products on mount
  useEffect(() => {
    const saved = localStorage.getItem('nexus_chat_history');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: 'Xin chào! Tôi là trợ lý ảo AI của Nexus Shop. Tôi có thể giúp gì cho bạn hôm nay? (Bạn có thể hỏi về sản phẩm, tìm kiếm sản phẩm hoặc hỏi về khuyến mãi!)',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }

    api.getProducts().then(setAllProducts).catch(() => {});
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('nexus_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleClearHistory = () => {
    const defaultMsg = [
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Lịch sử trò chuyện đã được xóa. Tôi có thể hỗ trợ gì khác cho bạn?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(defaultMsg);
    localStorage.removeItem('nexus_chat_history');
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey);
    setShowKeyInput(false);
    alert('Đã lưu API Key thành công!');
  };

  // Find matching products by text keyword
  const findMatchingProducts = (text) => {
    const lowerText = text.toLowerCase();
    return allProducts.filter(p => {
      const name = p.productName.toLowerCase();
      const desc = p.discription.toLowerCase();
      const cat = p.category.toLowerCase();
      
      if (lowerText.includes('macbook') || lowerText.includes('laptop') || lowerText.includes('máy tính')) {
        return name.includes('macbook');
      }
      if (lowerText.includes('iphone') || lowerText.includes('điện thoại')) {
        return name.includes('iphone');
      }
      if (lowerText.includes('tai nghe') || lowerText.includes('loa') || lowerText.includes('sound') || lowerText.includes('audio')) {
        return cat.includes('audio') || name.includes('sony');
      }
      if (lowerText.includes('giày') || lowerText.includes('nike') || lowerText.includes('sneaker') || lowerText.includes('shoes')) {
        return cat.includes('footwear');
      }
      if (lowerText.includes('bàn phím') || lowerText.includes('keyboard')) {
        return name.includes('keyboard') || name.includes('gmmk');
      }
      if (lowerText.includes('màn hình') || lowerText.includes('monitor')) {
        return name.includes('monitor') || name.includes('gaming');
      }
      return name.includes(lowerText) || desc.includes(lowerText);
    }).slice(0, 2); // Show max 2 matching products
  };

  // Predefined smart fallback responses
  const getFallbackResponse = (userInput) => {
    const text = userInput.toLowerCase();
    let reply = 'Tôi hiểu bạn đang hỏi về shop. Là trợ lý của Nexus Shop, tôi xin thông tin thêm là cửa hàng chuyên bán Laptop, Điện thoại, Tai nghe chống ồn, Giày thể thao, Màn hình gaming và Bàn phím cơ cao cấp. Bạn cần tư vấn chi tiết dòng nào ạ?';
    
    if (text.includes('xin chào') || text.includes('hi') || text.includes('hello')) {
      reply = 'Xin chào! Chúc bạn một ngày tốt lành. Tôi có thể giúp gì cho bạn trong việc tìm kiếm các sản phẩm công nghệ cao cấp tại Nexus Shop?';
    } else if (text.includes('khuyến mãi') || text.includes('giảm giá') || text.includes('sale') || text.includes('rẻ')) {
      reply = 'Hiện tại shop đang có chương trình khuyến mãi Hè 2026 với các sản phẩm như MacBook Pro M3 Max (giảm $200), iPhone 15 Pro (giảm $100), Nike Air Max 270 (giảm $30) và Màn hình Gaming 34" (giảm $50). Bạn có muốn mua ngay không?';
    } else if (text.includes('giao hàng') || text.includes('ship') || text.includes('vận chuyển')) {
      reply = 'Nexus Shop hỗ trợ giao hàng nhanh toàn quốc. Đối với đơn hàng nội thành TP.HCM, thời gian giao hàng là 1-2 ngày. Đơn hàng tỉnh khác từ 3-5 ngày. Đơn hàng trên $500 được miễn phí ship!';
    } else if (text.includes('bảo hành') || text.includes('đổi trả') || text.includes('lỗi')) {
      reply = 'Tất cả sản phẩm điện tử tại Nexus Shop được bảo hành chính hãng 12 tháng. Bạn có quyền đổi trả sản phẩm lỗi nhà sản xuất trong vòng 7 ngày đầu kể từ khi nhận hàng.';
    } else if (text.includes('liên hệ') || text.includes('địa chỉ') || text.includes('sđt')) {
      reply = 'Bạn có thể ghé thăm shop trực tiếp tại địa chỉ: 123 Đường Ba Tháng Hai, Quận 10, TP.HCM. Sđt hỗ trợ: 1900 6789. Hoạt động từ 8h00 đến 21h00 hàng ngày.';
    } else {
      const matches = findMatchingProducts(userInput);
      if (matches.length > 0) {
        reply = `Dưới đây là một số sản phẩm phù hợp với tìm kiếm của bạn tại Nexus Shop:`;
      }
    }
    return reply;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Loader bot message
    const botLoadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, {
      id: botLoadingId,
      sender: 'bot',
      text: 'Đang suy nghĩ...',
      loading: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    let botReplyText = '';
    let matchedProducts = [];

    try {
      const response = await api.sendChatMessage(userText, apiKey);
      botReplyText = response.reply;
      matchedProducts = findMatchingProducts(userText);
    } catch (err) {
      console.error('Error calling Chatbot Service, falling back:', err);
      botReplyText = getFallbackResponse(userText);
      matchedProducts = findMatchingProducts(userText);
    }

    // Wait and replace loading message
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== botLoadingId).concat({
        id: String(Date.now() + 1),
        sender: 'bot',
        text: botReplyText,
        products: matchedProducts, // Attach interactive cards
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn btn-primary"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel" style={{
          width: '380px',
          height: '520px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-glass)',
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={22} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Trợ Lý AI Nexus</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Online | Gemini Smart Assistant</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                onClick={() => setShowKeyInput(!showKeyInput)}
                title="Cấu hình API Key Gemini"
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <Key size={18} />
              </button>
              <button 
                onClick={handleClearHistory}
                title="Xóa lịch sử chat"
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* API Key Input Overlay */}
          {showKeyInput && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-color)',
              textAlign: 'left'
            }}>
              <form onSubmit={handleSaveKey}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Nhập Google Gemini API Key:</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input 
                    type="password" 
                    placeholder="AIzaSy..." 
                    className="form-input" 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)}
                    style={{ height: '32px', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', height: '32px' }}>
                    Lưu
                  </button>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Để trống để sử dụng trợ lý Fallback (không cần API Key).
                </div>
              </form>
            </div>
          )}

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: 'var(--bg-primary)'
          }}>
            {messages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  textAlign: 'left'
                }}
              >
                {/* Bubble message */}
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  backgroundColor: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.loading ? (
                    <span style={{ display: 'inline-flex', gap: '4px' }}>
                      <span className="dot" style={{ animation: 'fadeIn 1s infinite alternate' }}>•</span>
                      <span className="dot" style={{ animation: 'fadeIn 1s infinite alternate 0.2s' }}>•</span>
                      <span className="dot" style={{ animation: 'fadeIn 1s infinite alternate 0.4s' }}>•</span>
                    </span>
                  ) : msg.text}
                </div>

                {/* Display Interactive Product Cards if attached */}
                {msg.products && msg.products.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    {msg.products.map(prod => (
                      <div 
                        key={prod.id} 
                        className="glass-panel" 
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.productName} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                            {prod.productName}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            ${prod.promoPrice || prod.price}
                          </span>
                          
                          {/* Interactive Card Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <button 
                              onClick={() => onAddToCart(prod)}
                              style={{ padding: '2px 6px', fontSize: '0.65rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                              title="Thêm vào giỏ"
                            >
                              🛒 +
                            </button>
                            <button 
                              onClick={() => onBuyNow(prod)}
                              style={{ padding: '2px 6px', fontSize: '0.65rem', borderRadius: '4px', cursor: 'pointer', border: 'none', background: 'var(--accent-primary)', color: 'white' }}
                            >
                              💳 Mua Ngay
                            </button>
                            <a 
                              href={`/product/${prod.id}`}
                              style={{ padding: '2px 6px', fontSize: '0.65rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)' }}
                            >
                              👁️ Xem
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Timestamp */}
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.15rem',
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} style={{
            padding: '0.75rem',
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <input 
              type="text" 
              placeholder="Hỏi trợ lý Nexus..." 
              className="form-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ flex: 1, height: '36px', borderRadius: '18px', padding: '0 0.75rem' }}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
