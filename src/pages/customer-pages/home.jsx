import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, message } from 'antd';
import { RightOutlined, FireOutlined, TagOutlined } from '@ant-design/icons';
import { getBrandsAPI, searchProductsAPI } from '../../services/api.service';
import './home.css';

const HomePage = () => {
    const [featured, setFeatured] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([searchProductsAPI({ page: 0, size: 8 }), getBrandsAPI()])
            .then(([prodRes, brandRes]) => {
                setFeatured(prodRes?.content || []);
                setBrands(Array.isArray(brandRes) ? brandRes.slice(0, 8) : []);
            })
            .catch(() => message.error('Không thể tải dữ liệu'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="home-loading"><Spin size="large" /></div>;

    return (
        <div className="home-shell">
            <section className="hero-grid">
                <div className="hero-inner">
                    <div className="hero-copy">
                        <span className="hero-pill"><FireOutlined /> Bộ sưu tập mới 2026</span>
                        <h1 className="hero-title">
                            Kính mắt tinh xảo
                            <span>định hình phong cách</span>
                        </h1>
                        <p className="hero-desc">
                            Lựa chọn kính cao cấp từ các thương hiệu quốc tế, thiết kế sang trọng
                            và chất lượng bền bỉ. Giao hàng nhanh, hỗ trợ đổi trả trong 30 ngày.
                        </p>
                        <div className="hero-actions">
                            <Link to="/customer/products" className="btn-primary">
                                Khám phá ngay <RightOutlined />
                            </Link>
                            <Link to="/customer/products?inStock=true" className="btn-secondary">
                                Xem còn hàng
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div>
                                <strong>{featured.length}+</strong>
                                <span>Mẫu nổi bật</span>
                            </div>
                            <div>
                                <strong>{brands.length}+</strong>
                                <span>Thương hiệu</span>
                            </div>
                            <div>
                                <strong>24h</strong>
                                <span>Giao nhanh</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-showcase">
                        <div className="hero-panel">
                            <div className="panel-card">
                                <p>Signature Fit</p>
                                <span>Gọng nhẹ, kính chống UV</span>
                            </div>
                            <div className="panel-card">
                                <p>Crafted Lines</p>
                                <span>Hoàn thiện thủ công</span>
                            </div>
                            <div className="panel-card">
                                <p>Premium Lens</p>
                                <span>Chống chói - chống xước</span>
                            </div>
                        </div>
                        <div className="hero-badges">
                            <div className="badge">Ray-Ban</div>
                            <div className="badge">Oakley</div>
                            <div className="badge">Gucci</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="brand-section">
                <div className="section-head">
                    <h2>Thương hiệu nổi bật</h2>
                    <p>Chọn nhanh thương hiệu bạn yêu thích.</p>
                </div>
                <div className="brand-row">
                    {brands.map(b => (
                        <Link key={b} to={`/customer/products?brand=${encodeURIComponent(b)}`} className="brand-card">
                            <TagOutlined /> {b}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="feature-section">
                <div className="feature-copy">
                    <h2>Bộ lọc thông minh, cá nhân hoá trải nghiệm</h2>
                    <p>
                        So sánh giá, xem tình trạng hàng, và khám phá kính phù hợp với khuôn mặt.
                        Giao diện mới giúp bạn tìm sản phẩm nhanh hơn.
                    </p>
                    <div className="feature-points">
                        <div>
                            <h3>Tùy chọn linh hoạt</h3>
                            <span>Chọn thương hiệu, giá và tình trạng kho.</span>
                        </div>
                        <div>
                            <h3>Thanh toán tiện lợi</h3>
                            <span>Hỗ trợ nhiều phương thức thanh toán.</span>
                        </div>
                        <div>
                            <h3>Bảo hành rõ ràng</h3>
                            <span>Đổi trả dễ dàng trong 30 ngày.</span>
                        </div>
                    </div>
                </div>
                <div className="feature-grid">
                    {featured.length === 0 ? (
                        <div className="empty-state">
                            <span>🕶️</span>
                            <p>Chưa có sản phẩm nào. Hãy thêm sản phẩm từ phần quản lý.</p>
                        </div>
                    ) : (
                        featured.map(p => (
                            <Link key={p.id} to={`/customer/products/${p.id}`} className="product-card">
                                <div className="product-img-wrap">
                                    {p.productImage ? (
                                        <img src={p.productImage} alt={p.name} className="product-img" />
                                    ) : (
                                        <div className="product-img-placeholder">👓</div>
                                    )}
                                    {p.hasStock === false && <span className="badge-sold-out">Hết hàng</span>}
                                    {p.hasStock !== false && <span className="badge-in-stock">Còn hàng</span>}
                                </div>
                                <div className="product-info">
                                    <p className="product-brand">{p.brandName || 'Unknown'}</p>
                                    <h3 className="product-name">{p.name}</h3>
                                    <p className="product-price">
                                        {p.minPrice
                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.minPrice)
                                            : 'Liên hệ'}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            <section className="cta-strip">
                <div>
                    <h2>Sẵn sàng chọn kính mới?</h2>
                    <p>Lướt thêm hàng trăm mẫu kính mới nhất trong hôm nay.</p>
                </div>
                <Link to="/customer/products" className="btn-primary">Bắt đầu mua sắm</Link>
            </section>
        </div>
    );
};

export default HomePage;
