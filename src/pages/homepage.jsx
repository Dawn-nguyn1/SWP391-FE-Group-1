import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles/homepage.css';

// Mock data for products
const trendingProducts = [
  {
    id: 1,
    name: 'Aviator Classic',
    brand: 'Ray-Ban',
    price: 4500000,
    originalPrice: 5200000,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    badge: 'bestseller',
    isPreorder: false
  },
  {
    id: 2,
    name: 'GG1134O',
    brand: 'Gucci',
    price: 8900000,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
    badge: 'new',
    isPreorder: false
  },
  {
    id: 3,
    name: 'PR 17WS',
    brand: 'Prada',
    price: 7200000,
    originalPrice: 8500000,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400',
    badge: 'sale',
    isPreorder: false
  },
  {
    id: 4,
    name: 'Holbrook XL',
    brand: 'Oakley',
    price: 5800000,
    originalPrice: null,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    badge: 'preorder',
    isPreorder: true
  }
];

// Mock data for 12-step process
const eyeExamSteps = [
  { step: 1, title: 'Tiếp nhận', desc: 'Tư vấn sơ bộ' },
  { step: 2, title: 'Đo thị lực', desc: 'Kiểm tra cơ bản' },
  { step: 3, title: 'Khúc xạ tự động', desc: 'Máy Auto-refractor' },
  { step: 4, title: 'Khúc xạ chủ quan', desc: 'Đo chi tiết' },
  { step: 5, title: 'Điều tiết mắt', desc: 'Kiểm tra độ linh hoạt' },
  { step: 6, title: 'Đo PD', desc: 'Khoảng cách đồng tử' },
  { step: 7, title: 'Thị giác 2 mắt', desc: 'Phối hợp hai mắt' },
  { step: 8, title: 'Áp suất mắt', desc: 'Kiểm tra nhãn áp' },
  { step: 9, title: 'Soi đáy mắt', desc: 'Kiểm tra võng mạc' },
  { step: 10, title: 'Tư vấn tròng', desc: 'Chọn loại phù hợp' },
  { step: 11, title: 'Chọn gọng', desc: 'Tư vấn kiểu dáng' },
  { step: 12, title: 'Hoàn thiện', desc: 'Lắp ráp & điều chỉnh' }
];

// Mock testimonials
const testimonials = [
  {
    id: 1,
    text: 'Dịch vụ đo mắt rất chuyên nghiệp, phòng đo hiện đại. Nhân viên tư vấn nhiệt tình, kính chính hãng 100%. Rất hài lòng!',
    author: 'Nguyễn Văn An',
    avatar: 'https://i.pravatar.cc/100?img=11',
    product: 'Rayban Aviator',
    date: '15/01/2026',
    rating: 5
  },
  {
    id: 2,
    text: 'Mình đã mua kính Gucci tại đây, sản phẩm chính hãng có đầy đủ giấy tờ. Quy trình đo mắt 12 bước rất kỹ lưỡng.',
    author: 'Trần Thị Mai',
    avatar: 'https://i.pravatar.cc/100?img=25',
    product: 'Gucci GG1134O',
    date: '20/01/2026',
    rating: 5
  },
  {
    id: 3,
    text: 'Đặt trước kính Oakley, nhận hàng đúng hẹn. Chất lượng sản phẩm tuyệt vời, đóng gói cẩn thận. Sẽ ủng hộ tiếp!',
    author: 'Lê Minh Tuấn',
    avatar: 'https://i.pravatar.cc/100?img=33',
    product: 'Oakley Holbrook',
    date: '25/01/2026',
    rating: 5
  }
];

// Brand logos (using placeholder URLs)
const brands = [
  { name: 'Gucci', logo: 'https://logo.clearbit.com/gucci.com' },
  { name: 'Prada', logo: 'https://logo.clearbit.com/prada.com' },
  { name: 'Ray-Ban', logo: 'https://logo.clearbit.com/ray-ban.com' },
  { name: 'Oakley', logo: 'https://logo.clearbit.com/oakley.com' },
  { name: 'Tom Ford', logo: 'https://logo.clearbit.com/tomford.com' },
  { name: 'Essilor', logo: 'https://logo.clearbit.com/essilor.com' },
  { name: 'Zeiss', logo: 'https://logo.clearbit.com/zeiss.com' },
  { name: 'Dolce & Gabbana', logo: 'https://logo.clearbit.com/dolcegabbana.com' }
];

// Quick filter options
const quickFilters = [
  'Kính mát', 'Kính cận', 'Gọng kính', 'Gucci', 'Rayban', 
  'Prada', '< 5 triệu', 'Pre-order', 'Sale'
];

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [email, setEmail] = useState('');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleBookAppointment = () => {
    // TODO: Navigate to appointment booking page
    alert('Chức năng đặt lịch đo mắt sẽ được triển khai sau!');
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Đăng ký thành công với email: ${email}`);
      setEmail('');
    }
  };

  return (
    <div className="homepage">
      {/* HERO BANNER */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">✨ Đại lý ủy quyền chính hãng</span>
          <h1 className="hero-title">
            ĐO MẮT <span>12 BƯỚC</span><br/>
            TIÊU CHUẨN QUỐC TẾ
          </h1>
          <p className="hero-subtitle">
            Trải nghiệm dịch vụ đo mắt chuyên sâu và bộ sưu tập kính thời trang 
            cao cấp tại hệ thống Genetix Glasses
          </p>
          <div className="hero-cta-group">
            <button className="btn btn-primary" onClick={handleBookAppointment}>
              📅 ĐẶT LỊCH ĐO MẮT
            </button>
            <Link to="/collections" className="btn btn-secondary">
              👓 KHÁM PHÁ BỘ SƯU TẬP
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust-bar">
        <div className="homepage-container">
          <div className="trust-bar-grid">
            <div className="trust-item">
              <span className="trust-icon">🏅</span>
              <span className="trust-title">100% Chính Hãng</span>
              <span className="trust-desc">Bồi hoàn 1000% nếu giả</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🔬</span>
              <span className="trust-title">12-Step Eye Exam</span>
              <span className="trust-desc">Tiêu chuẩn quốc tế</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🛒</span>
              <span className="trust-title">Đặt kính Online</span>
              <span className="trust-desc">Tiện lợi, nhanh chóng</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">📦</span>
              <span className="trust-title">Hỗ trợ Pre-order</span>
              <span className="trust-desc">Đặt trước khi hết hàng</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🔧</span>
              <span className="trust-title">Hoàn trả lỗi NSX</span>
              <span className="trust-desc">Bảo hành nhà sản xuất</span>
            </div>
          </div>
        </div>
      </section>

      {/* SMART SEARCH */}
      <section className="smart-search">
        <div className="homepage-container">
          <div className="search-wrapper">
            <div className="search-input-group">
              <input 
                type="text" 
                className="search-input"
                placeholder="Tìm kiếm kính theo tên, thương hiệu, chất liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">
                🔍 Tìm kiếm
              </button>
            </div>
          </div>
          <div className="quick-filters">
            {quickFilters.map((filter) => (
              <button 
                key={filter}
                className={`filter-chip ${activeFilters.includes(filter) ? 'active' : ''}`}
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING COLLECTIONS */}
      <section className="trending-section homepage-section">
        <div className="homepage-container">
          <h2 className="section-title">XU HƯỚNG NỔI BẬT</h2>
          <div className="products-grid">
            {trendingProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  {product.badge && (
                    <span className={`product-badge badge-${product.badge}`}>
                      {product.badge === 'bestseller' && '🔥 Bestseller'}
                      {product.badge === 'new' && '✨ New'}
                      {product.badge === 'sale' && '🏷️ Sale'}
                      {product.badge === 'preorder' && '📦 Pre-order'}
                    </span>
                  )}
                  <div className="product-actions">
                    <button className="action-btn" title="Yêu thích">❤️</button>
                    <button className="action-btn" title="Xem nhanh">👁️</button>
                  </div>
                </div>
                <div className="product-info">
                  <span className="product-brand">{product.brand}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">
                    <span className="price-current">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="price-original">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  {product.isPreorder && (
                    <button className="btn btn-outline-gold" style={{ marginTop: '12px', width: '100%' }}>
                      Đặt cọc 30%
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12-STEP EYE EXAM */}
      <section className="eye-exam-section">
        <div className="homepage-container">
          <h2 className="section-title">QUY TRÌNH ĐO MẮT 12 BƯỚC</h2>
          <div className="steps-timeline">
            {eyeExamSteps.slice(0, 8).map((item) => (
              <div key={item.step} className="step-item">
                <div className="step-number">{item.step}</div>
                <h4 className="step-title">{item.title}</h4>
                <p className="step-desc">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="eye-exam-cta">
            <button 
              className="btn btn-primary btn-cta-large"
              onClick={handleBookAppointment}
            >
              📅 ĐẶT LỊCH ĐO MẮT NGAY
            </button>
          </div>
        </div>
      </section>

      {/* BRAND WALL */}
      <section className="brand-wall homepage-section">
        <div className="homepage-container">
          <h2 className="section-title">ĐẠI LÝ ỦY QUYỀN CHÍNH HÃNG</h2>
        </div>
        <div className="brands-slider">
          <div className="brands-track">
            {[...brands, ...brands].map((brand, index) => (
              <img 
                key={index}
                src={brand.logo} 
                alt={brand.name}
                className="brand-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="homepage-container">
          <h2 className="section-title">KHÁCH HÀNG NÓI GÌ VỀ GENETIX?</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-rating">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <div className="author-name">
                      {testimonial.author}
                      <span className="author-badge">✓ Verified Purchase</span>
                    </div>
                    <div className="author-product">
                      {testimonial.product} • {testimonial.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORE LOCATOR */}
      <section className="store-locator homepage-section">
        <div className="homepage-container">
          <div className="store-grid">
            <div className="store-map">
              <div className="map-placeholder">
                <div className="map-placeholder-icon">🗺️</div>
                <p>Bản đồ hệ thống cửa hàng</p>
              </div>
            </div>
            <div className="store-info">
              <h3>HỆ THỐNG CỬA HÀNG TOÀN QUỐC</h3>
              <div className="store-stats">
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Cửa hàng</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">20+</div>
                  <div className="stat-label">Tỉnh thành</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">100K+</div>
                  <div className="stat-label">Khách hàng</div>
                </div>
              </div>
              <button className="btn btn-primary">
                📍 TÌM CỬA HÀNG GẦN BẠN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter-section">
        <div className="homepage-container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>NHẬN ƯU ĐÃI ĐỘC QUYỀN</h3>
              <p>Đăng ký nhận thông tin mới nhất về bộ sưu tập và khuyến mãi</p>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                className="newsletter-input"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">
                ĐĂNG KÝ
              </button>
            </form>
          </div>
          <div className="contact-row">
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span>1900 xxxx (Miễn phí)</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">💬</span>
              <span>Chat trực tuyến</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span>contact@genetix.vn</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;