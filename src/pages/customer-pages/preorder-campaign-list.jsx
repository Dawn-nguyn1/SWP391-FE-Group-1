import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    RightOutlined,
    ShopOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { getPublicCampaignsAPI, getPublicProductDetailAPI, searchProductsAPI } from '../../services/api.service';
import { enrichPublicProducts } from '../../utils/public-product-view';
import { decorateCampaigns, formatCampaignPrice, getCampaignStatusMeta } from '../../utils/preorder-campaign-view';
import './preorder-campaign.css';

const CampaignListSkeleton = () => (
    <div className="campaign-hub">
        <section className="campaign-shell campaign-hero-v2">
            <div className="campaign-hero-main">
                <div className="campaign-skeleton-block hero" />
                <div className="campaign-skeleton-block side" />
            </div>
            <div className="campaign-skeleton-strip">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="campaign-skeleton-block stat" />
                ))}
            </div>
        </section>
        <section className="campaign-shell campaign-process-section">
            <div className="campaign-skeleton-section-head" />
            <div className="campaign-skeleton-grid process">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="campaign-skeleton-block process-card" />
                ))}
            </div>
        </section>
        <section className="campaign-shell campaign-catalog-section">
            <div className="campaign-skeleton-section-head" />
            <div className="campaign-skeleton-block filter" />
            <div className="campaign-skeleton-grid cards">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="campaign-skeleton-block card" />
                ))}
            </div>
        </section>
    </div>
);

const CampaignListEmptyState = ({ onResetFilters }) => (
    <div className="campaign-empty-rich">
        <div className="campaign-empty-illustration">
            <ThunderboltOutlined />
        </div>
        <span className="campaign-kicker">Campaign catalog</span>
        <h3>Chưa có chiến dịch khớp với lựa chọn hiện tại</h3>
        <p>
            Hãy thử mở rộng bộ lọc để khám phá thêm những campaign đang nhận đơn hoặc quay về danh mục hàng sẵn nếu bạn muốn
            chọn ngay một mẫu có thể sở hữu nhanh chóng.
        </p>
        <div className="campaign-empty-actions">
            <button type="button" className="campaign-primary-cta campaign-empty-btn" onClick={onResetFilters}>
                Xem tất cả chiến dịch
            </button>
            <Link to="/customer/products?view=ready" className="campaign-secondary-cta">
                Khám phá hàng sẵn
            </Link>
        </div>
    </div>
);

const formatDate = (value) => {
    if (!value) return 'Chưa có';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('vi-VN').format(date);
};

const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const PROCESS_STEPS = [
    {
        title: 'Chọn chiến dịch yêu thích',
        copy: 'Mỗi campaign tổng hợp sẵn các phiên bản nổi bật, mức giá và thời gian mở bán để bạn so sánh nhanh hơn.',
    },
    {
        title: 'Chọn cách thanh toán phù hợp',
        copy: 'Mọi thông tin cần biết đều được trình bày rõ ràng để bạn yên tâm giữ chỗ cho mẫu kính mình thích.',
    },
    {
        title: 'Theo dõi hành trình sở hữu',
        copy: 'Sau khi đặt trước, bạn chỉ cần theo dõi đơn hàng và sẵn sàng đón sản phẩm về tay đúng thời điểm.',
    },
];

const PreorderCampaignListPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [brandFilter, setBrandFilter] = useState('all');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [campaignResponse, productResponse] = await Promise.all([
                    getPublicCampaignsAPI(),
                    searchProductsAPI({ page: 0, size: 100 }),
                ]);

                const rawProducts = productResponse?.content || [];
                const products = await enrichPublicProducts(rawProducts, getPublicProductDetailAPI);
                if (cancelled) return;

                const normalizedCampaigns = decorateCampaigns(campaignResponse, products);
                setCampaigns(normalizedCampaigns);
            } catch (error) {
                if (!cancelled) {
                    setCampaigns([]);
                    message.error(error?.message || 'Không thể tải danh sách chiến dịch pre-order.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const openCampaigns = campaigns.filter((campaign) => getCampaignStatusMeta(campaign).tone === 'open');
    const upcomingCampaigns = campaigns.filter((campaign) => getCampaignStatusMeta(campaign).tone === 'upcoming');
    const closedCampaigns = campaigns.filter((campaign) => ['closed', 'muted'].includes(getCampaignStatusMeta(campaign).tone));

    const brands = useMemo(
        () => [...new Set(campaigns.flatMap((campaign) => campaign.brands || []).filter(Boolean))],
        [campaigns]
    );

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((campaign) => {
            const statusMeta = getCampaignStatusMeta(campaign);
            const matchesStatus = statusFilter === 'all' || statusMeta.tone === statusFilter;
            const matchesBrand = brandFilter === 'all' || campaign.brands.includes(brandFilter);
            return matchesStatus && matchesBrand;
        });
    }, [brandFilter, campaigns, statusFilter]);

    const featuredCampaign = openCampaigns[0] || campaigns[0] || null;

    if (loading) {
        return <CampaignListSkeleton />;
    }

    return (
        <div className="campaign-hub">
            <section className="campaign-shell campaign-hero-v2">
                <div className="campaign-hero-main">
                    <div className="campaign-hero-copy">
                        <span className="campaign-pill"><ThunderboltOutlined /> Pre-order Campaign Hub</span>
                        <h1>Khám phá những chiến dịch đặt trước được săn đón nhất</h1>
                        <p>
                            Không gian này được thiết kế như một khu mua sắm riêng cho các mẫu kính giới hạn, giúp bạn xem nhanh trạng thái mở bán,
                            khoảng giá, thời gian nhận đơn và chọn chiến dịch phù hợp chỉ trong vài bước.
                        </p>
                        <div className="campaign-hero-actions">
                            <a href="#campaign-catalog" className="campaign-primary-cta">Xem các chiến dịch đang mở</a>
                            <Link to="/customer/products" className="campaign-secondary-cta">Quay lại danh mục sản phẩm</Link>
                        </div>
                    </div>

                    <div className="campaign-highlight-card">
                        <div className="campaign-highlight-head">
                            <span className="campaign-highlight-kicker">Gợi ý nổi bật</span>
                            <span className={`campaign-status ${featuredCampaign ? getCampaignStatusMeta(featuredCampaign).tone : 'muted'}`}>
                                {featuredCampaign ? getCampaignStatusMeta(featuredCampaign).label : 'Chưa có'}
                            </span>
                        </div>
                        {featuredCampaign ? (
                            <>
                                <h2>{featuredCampaign.name}</h2>
                                <p>{featuredCampaign.variantCount} phiên bản • {featuredCampaign.brands.join(' • ') || 'GENETIX'}</p>
                                <div className="campaign-highlight-meta">
                                    <div>
                                        <span>Khoảng giá</span>
                                        <strong>{formatCampaignPrice(featuredCampaign, formatVND)}</strong>
                                    </div>
                                    <div>
                                        <span>Nhận đơn đến</span>
                                        <strong>{formatDate(featuredCampaign.endDate)}</strong>
                                    </div>
                                </div>
                                <Link to={`/customer/preorder-campaigns/${featuredCampaign.id}`} className="campaign-highlight-link">
                                    Xem chiến dịch này <RightOutlined />
                                </Link>
                            </>
                        ) : (
                            <p>Hiện chưa có chiến dịch phù hợp để gợi ý.</p>
                        )}
                    </div>
                </div>

                <div className="campaign-stat-strip">
                    <article className="campaign-stat-card rich">
                        <span>Tổng chiến dịch</span>
                        <strong>{campaigns.length}</strong>
                        <small>Những campaign đang có mặt trong khu đặt trước của GENETIX</small>
                    </article>
                    <article className="campaign-stat-card rich">
                        <span>Đang mở nhận đơn</span>
                        <strong>{openCampaigns.length}</strong>
                        <small>Sẵn sàng để bạn vào xem chi tiết và giữ chỗ ngay</small>
                    </article>
                    <article className="campaign-stat-card rich">
                        <span>Sắp mở</span>
                        <strong>{upcomingCampaigns.length}</strong>
                        <small>Dễ theo dõi để chọn đúng thời điểm cho mẫu bạn yêu thích</small>
                    </article>
                    <article className="campaign-stat-card rich">
                        <span>Đã đóng / tạm ngưng</span>
                        <strong>{closedCampaigns.length}</strong>
                        <small>Tham khảo thêm những bộ sưu tập từng được khách hàng quan tâm</small>
                    </article>
                </div>
            </section>

            <section className="campaign-shell campaign-process-section">
                <div className="campaign-section-head">
                    <div>
                        <span className="campaign-kicker">Trải nghiệm mua sắm</span>
                        <h2>Đặt trước trở nên rõ ràng, dễ hiểu và đầy cảm hứng</h2>
                    </div>
                    <p>Từ lúc khám phá đến khi chọn mẫu, mọi thông tin đều được sắp xếp gọn gàng để bạn ra quyết định tự tin hơn.</p>
                </div>
                <div className="campaign-process-grid">
                    {PROCESS_STEPS.map((step, index) => (
                        <article key={step.title} className="campaign-process-card">
                            <div className="campaign-process-index">0{index + 1}</div>
                            <h3>{step.title}</h3>
                            <p>{step.copy}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section id="campaign-catalog" className="campaign-shell campaign-catalog-section">
                <div className="campaign-section-head">
                    <div>
                        <span className="campaign-kicker">Campaign catalog</span>
                        <h2>Chọn chiến dịch theo trạng thái và thương hiệu</h2>
                    </div>
                    <p>Bộ lọc giúp bạn nhanh chóng tìm ra chiến dịch đang mở, sắp mở hoặc tập trung đúng thương hiệu mình yêu thích.</p>
                </div>

                <div className="campaign-filter-bar">
                    <div className="campaign-filter-group">
                        <span>Trạng thái</span>
                        <div className="campaign-filter-chips">
                            <button type="button" className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>Tất cả</button>
                            <button type="button" className={statusFilter === 'open' ? 'active' : ''} onClick={() => setStatusFilter('open')}>Đang mở</button>
                            <button type="button" className={statusFilter === 'upcoming' ? 'active' : ''} onClick={() => setStatusFilter('upcoming')}>Sắp mở</button>
                            <button type="button" className={statusFilter === 'closed' ? 'active' : ''} onClick={() => setStatusFilter('closed')}>Đã đóng</button>
                            <button type="button" className={statusFilter === 'muted' ? 'active' : ''} onClick={() => setStatusFilter('muted')}>Tạm ngưng</button>
                        </div>
                    </div>

                    <div className="campaign-filter-group">
                        <span>Thương hiệu</span>
                        <div className="campaign-filter-chips brands">
                            <button type="button" className={brandFilter === 'all' ? 'active' : ''} onClick={() => setBrandFilter('all')}>Tất cả</button>
                            {brands.map((brand) => (
                                <button
                                    key={brand}
                                    type="button"
                                    className={brandFilter === brand ? 'active' : ''}
                                    onClick={() => setBrandFilter(brand)}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="campaign-list-header">
                    <div>
                        <strong>{filteredCampaigns.length}</strong>
                        <span>chiến dịch phù hợp với lựa chọn hiện tại</span>
                    </div>
                    <div className="campaign-list-note">
                        <ShopOutlined />
                        <span>Mỗi card đều tóm tắt nhanh hình ảnh, thời gian mở bán, mức giá và những điểm đáng chú ý để bạn dễ chọn hơn.</span>
                    </div>
                </div>

                {filteredCampaigns.length === 0 ? (
                    <div className="campaign-empty-wrap inline">
                        <CampaignListEmptyState
                            onResetFilters={() => {
                                setStatusFilter('all');
                                setBrandFilter('all');
                            }}
                        />
                    </div>
                ) : (
                    <div className="campaign-grid storefront">
                        {filteredCampaigns.map((campaign) => {
                            const statusMeta = getCampaignStatusMeta(campaign);
                            const featuredItem = campaign.featuredItem;

                            return (
                                <article key={campaign.id} className="campaign-card storefront-card">
                                    <Link to={`/customer/preorder-campaigns/${campaign.id}`} className="campaign-card-media storefront-media">
                                        {featuredItem?.productImage ? (
                                            <img src={featuredItem.productImage} alt={campaign.name} />
                                        ) : (
                                            <div className="campaign-card-placeholder">Campaign</div>
                                        )}
                                        <span className={`campaign-status ${statusMeta.tone}`}>{statusMeta.label}</span>
                                    </Link>

                                    <div className="campaign-card-body storefront-body">
                                        <div className="campaign-card-head">
                                            <p className="campaign-brand">{campaign.brands.join(' • ') || 'GENETIX'}</p>
                                            <h2>{campaign.name}</h2>
                                        </div>

                                        <p className="campaign-copy">{statusMeta.helper}</p>

                                        <div className="campaign-meta-grid storefront-meta">
                                            <div>
                                                <span>Mức giá</span>
                                                <strong>{formatCampaignPrice(campaign, formatVND)}</strong>
                                            </div>
                                            <div>
                                                <span>Phiên bản</span>
                                                <strong>{campaign.variantCount}</strong>
                                            </div>
                                            <div>
                                                <span>Nhận đơn đến</span>
                                                <strong>{formatDate(campaign.endDate)}</strong>
                                            </div>
                                            <div>
                                                <span>Dự kiến giao</span>
                                                <strong>{formatDate(campaign.fulfillmentDate)}</strong>
                                            </div>
                                        </div>

                                        <div className="campaign-card-highlights">
                                            <span><ClockCircleOutlined /> Mở từ {formatDate(campaign.startDate)}</span>
                                            <span><CalendarOutlined /> Giới hạn còn lại: {campaign.remainingSlots ?? 'Không giới hạn'}</span>
                                            <span><CheckCircleOutlined /> {campaign.paymentSummary.join(' • ') || 'Theo cấu hình chiến dịch'}</span>
                                        </div>

                                        <div className="campaign-card-footer storefront-footer">
                                            <span className="campaign-footer-tag">Xem chi tiết, chọn phiên bản yêu thích và bắt đầu giữ chỗ thật nhanh.</span>
                                            <Link to={`/customer/preorder-campaigns/${campaign.id}`} className="campaign-inline-cta">
                                                Khám phá chiến dịch <RightOutlined />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default PreorderCampaignListPage;
