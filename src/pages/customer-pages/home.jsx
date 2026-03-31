import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, message } from 'antd';
import { RightOutlined, FireOutlined, TagOutlined, RocketOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
    getBrandsAPI,
    getPublicCampaignsAPI,
    getPublicProductDetailAPI,
    searchProductsAPI,
} from '../../services/api.service';
import { enrichPublicProducts } from '../../utils/public-product-view';
import { decorateCampaigns, formatCampaignPrice, getCampaignStatusMeta } from '../../utils/preorder-campaign-view';
import './home.css';

const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const HomePage = () => {
    const [featured, setFeatured] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            searchProductsAPI({ page: 0, size: 24 }),
            getBrandsAPI(),
            getPublicCampaignsAPI(),
        ])
            .then(async ([productResponse, brandResponse, campaignResponse]) => {
                const rawProducts = productResponse?.content || [];
                const enriched = await enrichPublicProducts(rawProducts, getPublicProductDetailAPI);
                if (cancelled) return;

                setFeatured(enriched);
                setCampaigns(decorateCampaigns(campaignResponse, enriched).slice(0, 3));
                setBrands(Array.isArray(brandResponse) ? brandResponse.slice(0, 8) : []);
            })
            .catch(() => !cancelled && message.error('Không thể tải dữ liệu'))
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) return <div className="home-loading"><Spin size="large" /></div>;

    const mixedProducts = featured.filter((product) => product.productMode === 'MIXED').slice(0, 3);
    const readyProducts = featured.filter((product) => product.productMode === 'IN_STOCK').slice(0, 3);

    const renderProductCard = (product) => (
        <Link key={product.id} to={`/customer/products/${product.id}`} className="showcase-card mode-ready">
            <div className="showcase-image">
                {product.productImage ? (
                    <img src={product.productImage} alt={product.name} className="showcase-img" />
                ) : (
                    <div className="showcase-placeholder">Kính</div>
                )}
                <span className="showcase-mode-pill mode-ready">{product.productMode === 'MIXED' ? 'Lựa chọn linh hoạt' : 'Có sẵn ngay'}</span>
            </div>
            <div className="showcase-content">
                <p className="showcase-brand">{product.brandName || 'GENETIX'}</p>
                <h3 className="showcase-name">{product.name}</h3>
                <p className="showcase-copy">
                    {product.productMode === 'MIXED'
                        ? 'Vừa có phiên bản giao nhanh, vừa có lựa chọn đặt trước dành cho những ai muốn săn mẫu nổi bật.'
                        : `Sẵn sàng lên đơn với số lượng còn lại: ${product.totalStock ?? 0} sản phẩm.`}
                </p>
                <p className="showcase-price">
                    {product.priceLabel?.minPrice ? formatVND(product.priceLabel.minPrice) : 'Liên hệ'}
                </p>
            </div>
        </Link>
    );

    const renderCampaignCard = (campaign) => {
        const statusMeta = getCampaignStatusMeta(campaign);
        return (
            <Link
                key={campaign.id}
                to={`/customer/preorder-campaigns/${campaign.id}`}
                className={`showcase-card ${statusMeta.canOrder ? 'mode-preorder' : 'mode-mixed'}`}
            >
                <div className="showcase-image">
                    {campaign.featuredItem?.productImage ? (
                        <img src={campaign.featuredItem.productImage} alt={campaign.name} className="showcase-img" />
                    ) : (
                        <div className="showcase-placeholder">Campaign</div>
                    )}
                    <span className={`showcase-mode-pill ${statusMeta.canOrder ? 'mode-preorder' : 'mode-mixed'}`}>
                        {statusMeta.label}
                    </span>
                </div>
                <div className="showcase-content">
                    <p className="showcase-brand">{campaign.brands.join(' • ') || 'GENETIX'}</p>
                    <h3 className="showcase-name">{campaign.name}</h3>
                    <p className="showcase-copy">
                        {campaign.variantCount} biến thể • {statusMeta.helper}
                    </p>
                    <p className="showcase-price">{formatCampaignPrice(campaign, formatVND)}</p>
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
                            Chọn mẫu kính bạn yêu thích theo cách
                            <span>nhanh gọn, rõ ràng và đầy cảm hứng</span>
                        </h1>
                        <p className="hero-desc">
                            Từ những mẫu có thể sở hữu ngay đến các chiến dịch đặt trước giới hạn, GENETIX mang đến trải nghiệm mua sắm
                            được sắp xếp rõ ràng để bạn dễ chọn, dễ so sánh và tự tin chốt đơn.
                        </p>
                        <div className="hero-actions">
                            <Link to="/customer/products" className="btn-primary">
                                Khám phá sản phẩm nổi bật <RightOutlined />
                            </Link>
                            <Link to="/customer/preorder-campaigns" className="btn-secondary">
                                Xem chiến dịch đặt trước
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div>
                                <strong>{featured.length}</strong>
                                <span>Mẫu nổi bật hôm nay</span>
                            </div>
                            <div>
                                <strong>{campaigns.length}</strong>
                                <span>Chiến dịch đáng chú ý</span>
                            </div>
                            <div>
                                <strong>{readyProducts.length}</strong>
                                <span>Mẫu có thể mua ngay</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-showcase">
                        <div className="mode-board">
                            <div className="mode-card preorder">
                                <ThunderboltOutlined />
                                <div>
                                    <strong>Pre-order chọn lọc</strong>
                                    <span>Đặt trước các phiên bản giới hạn với thông tin rõ ràng về thời gian và quyền lợi.</span>
                                </div>
                            </div>
                            <div className="mode-card ready">
                                <RocketOutlined />
                                <div>
                                    <strong>Mua sắm linh hoạt</strong>
                                    <span>Tìm nhanh các mẫu đang sẵn hàng để lên đơn ngay khi bạn vừa chọn được chiếc kính ưng ý.</span>
                                </div>
                            </div>
                        </div>
                        {mixedProducts.length > 0 && (
                            <div className="hero-note">
                                <TagOutlined />
                                <span>{mixedProducts.length} mẫu đang có cả lựa chọn mua ngay lẫn phiên bản đặt trước hấp dẫn.</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="brand-section">
                <div className="section-head">
                    <h2>Thương hiệu nổi bật</h2>
                    <p>Đi nhanh tới bộ sưu tập bạn đang quan tâm chỉ với một chạm.</p>
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
                        <span className="section-kicker preorder">Chiến dịch nổi bật</span>
                        <h2>Các campaign được khách hàng quan tâm nhiều</h2>
                        <p className="section-subcopy">
                            Mỗi chiến dịch là một không gian mua sắm riêng cho những phiên bản đáng chờ đợi, giúp bạn dễ nắm bắt thời điểm đẹp để đặt trước.
                        </p>
                    </div>
                    <Link to="/customer/preorder-campaigns" className="section-link">
                        Xem tất cả chiến dịch <RightOutlined />
                    </Link>
                </div>
                <div className="showcase-grid">
                    {campaigns.length > 0 ? campaigns.map(renderCampaignCard) : (
                        <div className="empty-state">
                            <span>⌛</span>
                            <p>Những chiến dịch mới sẽ sớm xuất hiện. Bạn có thể khám phá catalog trong lúc chờ đợi.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="showcase-section ready-block">
                <div className="showcase-header">
                    <div>
                        <span className="section-kicker ready">Mua ngay</span>
                        <h2>Những mẫu sẵn hàng để bạn chốt đơn ngay hôm nay</h2>
                        <p className="section-subcopy">Tập hợp các thiết kế đang có sẵn hoặc có lựa chọn giao nhanh để việc mua sắm trở nên nhẹ nhàng hơn bao giờ hết.</p>
                    </div>
                    <Link to="/customer/products?view=ready" className="section-link">
                        Xem hàng sẵn <RightOutlined />
                    </Link>
                </div>
                <div className="showcase-grid">
                    {readyProducts.length > 0 ? readyProducts.map(renderProductCard) : (
                        <div className="empty-state">
                            <span>🕶️</span>
                            <p>Danh mục nổi bật đang được làm mới. Hãy quay lại sau để xem thêm những mẫu vừa cập nhật.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="cta-strip">
                <div>
                    <h2>Bắt đầu hành trình chọn kính theo cách bạn thích</h2>
                    <p>Tìm mẫu giao nhanh để sở hữu sớm, hoặc khám phá chiến dịch đặt trước để giữ chỗ những thiết kế được săn đón nhất.</p>
                </div>
                <Link to="/customer/preorder-campaigns" className="btn-primary">Khám phá chiến dịch</Link>
            </section>
        </div>
    );
};

export default HomePage;
