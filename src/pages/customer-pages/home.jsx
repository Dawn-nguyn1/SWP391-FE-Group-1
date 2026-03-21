import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, message } from 'antd';
import { RightOutlined, FireOutlined, TagOutlined, ThunderboltOutlined, RocketOutlined } from '@ant-design/icons';
import { getBrandsAPI, getPublicProductDetailAPI, searchProductsAPI } from '../../services/api.service';
import { enrichPublicProducts } from '../../utils/public-product-view';
import './home.css';

const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('vi-VN').format(date);
};

const HomePage = () => {
    const [featured, setFeatured] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([searchProductsAPI({ page: 0, size: 24 }), getBrandsAPI()])
            .then(async ([productResponse, brandResponse]) => {
                const rawProducts = productResponse?.content || [];
                const enriched = await enrichPublicProducts(rawProducts, getPublicProductDetailAPI);
                setFeatured(enriched);
                setBrands(Array.isArray(brandResponse) ? brandResponse.slice(0, 8) : []);
            })
            .catch(() => message.error('Không thể tải dữ liệu'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="home-loading"><Spin size="large" /></div>;

    const preOrderProducts = featured.filter((product) => product.productMode === 'PRE_ORDER').slice(0, 3);
    const readyProducts = featured.filter((product) => product.productMode === 'IN_STOCK').slice(0, 3);

    const getModeMeta = (product) => {
        if (product.productMode === 'PRE_ORDER') {
            const fulfillmentDate = product?.variants?.find((variant) => variant?.saleType === 'PRE_ORDER')?.preorderFulfillmentDate;
            return {
                className: 'mode-preorder',
                label: 'Đặt trước',
                copy: fulfillmentDate
                    ? `Dự kiến có hàng từ ${formatDate(fulfillmentDate)}`
                    : 'Thanh toán theo luồng pre-order và chờ hàng về.',
            };
        }

        return {
            className: 'mode-ready',
            label: 'Hàng sẵn',
            copy: `Chỉ còn lại ${product.totalStock ?? 0} sản phẩm.`,
        };
    };

    const renderProductCard = (product) => {
        const modeMeta = getModeMeta(product);

        return (
            <Link key={product.id} to={`/customer/products/${product.id}`} className={`showcase-card ${modeMeta.className}`}>
                <div className="showcase-image">
                    {product.productImage ? (
                        <img src={product.productImage} alt={product.name} className="showcase-img" />
                    ) : (
                        <div className="showcase-placeholder">👓</div>
                    )}
                    <span className={`showcase-mode-pill ${modeMeta.className}`}>{modeMeta.label}</span>
                </div>
                <div className="showcase-content">
                    <p className="showcase-brand">{product.brandName || 'Unknown'}</p>
                    <h3 className="showcase-name">{product.name}</h3>
                    <p className="showcase-copy">{modeMeta.copy}</p>
                    <p className="showcase-price">
                        {product.priceLabel?.minPrice ? formatVND(product.priceLabel.minPrice) : 'Liên hệ'}
                    </p>
                </div>
            </Link>
        );
    };

    return (
        <div className="home-shell">
            <section className="hero-grid">
                <div className="hero-inner">
                    <div className="hero-copy">
                        <span className="hero-pill"><FireOutlined /> Genetix 2026 Collection</span>
                        <h1 className="hero-title">
                            Mua kính dễ hơn khi
                            <span>pre-order và hàng sẵn ngay bên dưới</span>
                        </h1>
                        <p className="hero-desc">
                            GENETIX là cửa hàng bán mắt kính uy tín, đảm bảo tối đa quyền lợi cho khách hàng.          
                            CHUYÊN NGHIỆP - UY TÍN - CHẤT LƯỢNG.
                        </p>
                        <div className="hero-actions">
                            <Link to="/customer/products" className="btn-primary">
                                Xem toàn bộ catalog <RightOutlined />
                            </Link>
                            <Link to="/customer/products?view=pre-order" className="btn-secondary">
                                Khám phá pre-order
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div>
                                <strong>{featured.length}</strong>
                                <span>Mẫu đang nổi bật</span>
                            </div>
                            <div>
                                <strong>{preOrderProducts.length}</strong>
                                <span>Mẫu chỉ đặt trước</span>
                            </div>
                            <div>
                                <strong>{readyProducts.length}</strong>
                                <span>Mẫu hàng sẵn</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-showcase">
                        <div className="mode-board">
                            <div className="mode-card preorder">
                                <ThunderboltOutlined />
                                <div>
                                    <strong>Pre-order</strong>
                                    <span>Hỗ trợ đặt cọc 30% và chờ hàng về.</span>
                                </div>
                            </div>
                            <div className="mode-card ready">
                                <RocketOutlined />
                                <div>
                                    <strong>In-stock</strong>
                                    <span>Lên đơn để được giao hàng ngay.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="brand-section">
                <div className="section-head">
                    <h2>Thương hiệu nổi bật</h2>
                    <p>Đi tắt đến bộ sưu tập bạn đang quan tâm.</p>
                </div>
                <div className="brand-row">
                    {brands.map((brand) => (
                        <Link key={brand} to={`/customer/products?brand=${encodeURIComponent(brand)}`} className="brand-card">
                            <TagOutlined /> {brand}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="showcase-section">
                <div className="showcase-header">
                    <div>
                        <span className="section-kicker preorder">Pre-order</span>
                        <h2>Các mẫu đặt trước</h2>
                        <p className="section-subcopy">Khách đặt cọc trước, chờ hàng về rồi hoàn tất thanh toán theo tiến độ pre-order.</p>
                    </div>
                    <Link to="/customer/products?view=pre-order" className="section-link">
                        Xem pre-order <RightOutlined />
                    </Link>
                </div>
                <div className="showcase-grid">
                    {preOrderProducts.length > 0 ? preOrderProducts.map(renderProductCard) : (
                        <div className="empty-state">
                            <span>⌛</span>
                            <p>Hiện chưa có mẫu pre-order trong nhóm nổi bật.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="showcase-section ready-block">
                <div className="showcase-header">
                    <div>
                        <span className="section-kicker ready">In-stock</span>
                        <h2>Mẫu đang có hàng sẵn để xử lý đơn ngay</h2>
                        <p className="section-subcopy">Các sản phẩm đang còn thực tế có thể chốt đơn nhanh.</p>
                    </div>
                    <Link to="/customer/products?view=ready" className="section-link">
                        Xem hàng sẵn <RightOutlined />
                    </Link>
                </div>
                <div className="showcase-grid">
                    {readyProducts.length > 0 ? readyProducts.map(renderProductCard) : (
                        <div className="empty-state">
                            <span>🕶️</span>
                            <p>Hiện chưa có mẫu hàng sẵn trong nhóm nổi bật.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="cta-strip">
                <div>
                    <h2>Bắt đầu với một catalog rõ ràng hơn</h2>
                    <p>Đi tới trang sản phẩm để duyệt riêng pre-order và hàng sẵn.</p>
                </div>
                <Link to="/customer/products" className="btn-primary">Mở catalog</Link>
            </section>
        </div>
    );
};

export default HomePage;
