import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, message } from 'antd';
import { RightOutlined, FireOutlined, TagOutlined } from '@ant-design/icons';
import { getPublicProductsAPI, getBrandsAPI, searchProductsAPI } from '../../services/api.service';
import './home.css';

const HomePage = () => {
    const [featured, setFeatured] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([searchProductsAPI({ page: 0, size: 8 }), getBrandsAPI()])
            .then(([prodRes, brandRes]) => {
                setFeatured(prodRes?.content || []);
                setBrands(Array.isArray(brandRes) ? brandRes.slice(0, 6) : []);
            })
            .catch(() => message.error('Không thể tải dữ liệu'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="home-loading"><Spin size="large" /></div>;

    return (
        <div className="home-page">
            {/* Hero Banner */}
            <section className="hero-section">
                <div className="hero-content">
                    <span className="hero-badge"><FireOutlined /> Mới nhất 2026</span>
                    <h1 className="hero-title">Kính mắt cao cấp<br /><span>đẳng cấp thời trang</span></h1>
                    <p className="hero-desc">
                        Khám phá hàng trăm mẫu kính từ các thương hiệu hàng đầu thế giới.<br />
                        Giao hàng toàn quốc – Đổi trả trong 30 ngày.
                    </p>
                    <div className="hero-actions">
                        <Link to="/customer/products" className="btn-primary">
                            Mua ngay <RightOutlined />
                        </Link>
                        <Link to="/customer/products?inStock=true" className="btn-secondary">
                            Xem còn hàng
                        </Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-glow" />
                    <div className="hero-float-card card-1">Ray-Ban<br /><small>Classic</small></div>
                    <div className="hero-float-card card-2">Oakley<br /><small>Sport</small></div>
                    <div className="hero-float-card card-3">Gucci<br /><small>Premium</small></div>
                </div>
            </section>

            {/* Brands */}
            {brands.length > 0 && (
                <section className="section brands-section">
                    <div className="section-inner">
                        <h2 className="section-title">Thương hiệu nổi bật</h2>
                        <div className="brands-grid">
                            {brands.map(b => (
                                <Link key={b} to={`/customer/products?brand=${encodeURIComponent(b)}`} className="brand-chip">
                                    <TagOutlined /> {b}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            <section className="section products-section">
                <div className="section-inner">
                    <div className="section-header">
                        <h2 className="section-title">Sản phẩm nổi bật</h2>
                        <Link to="/customer/products" className="see-all">Xem tất cả <RightOutlined /></Link>
                    </div>
                    {featured.length === 0 ? (
                        <div className="empty-state">
                            <span style={{ fontSize: 48 }}>🕶️</span>
                            <p>Chưa có sản phẩm nào. Hãy thêm sản phẩm từ phần quản lý.</p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {featured.map(p => (
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
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Banner */}
            <section className="cta-section">
                <div className="cta-inner">
                    <h2>Bạn muốn tìm kính phù hợp hơn?</h2>
                    <p>Dùng bộ lọc thông minh để tìm kính theo thương hiệu, giá tiền và tình trạng hàng.</p>
                    <Link to="/customer/products" className="btn-primary">Khám phá ngay</Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
