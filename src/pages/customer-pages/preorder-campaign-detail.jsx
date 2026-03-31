import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, InputNumber, message } from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    RightOutlined,
    SafetyCertificateOutlined,
    ShoppingCartOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../../context/auth.context';
import { CartContext } from '../../context/cart.context';
import {
    addToCartAPI,
    getPublicCampaignDetailAPI,
    getPublicProductDetailAPI,
    searchProductsAPI,
} from '../../services/api.service';
import { enrichPublicProducts } from '../../utils/public-product-view';
import {
    buildCampaignVariantIndex,
    decorateCampaign,
    formatCampaignPrice,
    getCampaignQuantityLimit,
    getCampaignStatusMeta,
} from '../../utils/preorder-campaign-view';
import './preorder-campaign.css';

const CampaignDetailSkeleton = () => (
    <div className="campaign-detail-page">
        <div className="campaign-detail-shell premium">
            <div className="campaign-skeleton-breadcrumb" />
            <section className="campaign-detail-hero premium-hero">
                <div className="campaign-skeleton-block hero" />
                <div className="campaign-skeleton-block side" />
            </section>
            <section className="campaign-process-section detail-benefits">
                <div className="campaign-skeleton-section-head" />
                <div className="campaign-skeleton-grid process">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="campaign-skeleton-block process-card" />
                    ))}
                </div>
            </section>
            <section className="campaign-detail-grid premium-grid">
                <div className="campaign-skeleton-block detail-list" />
                <div className="campaign-skeleton-block detail-purchase" />
            </section>
        </div>
    </div>
);

const CampaignDetailEmptyState = () => (
    <div className="campaign-empty-rich detail">
        <div className="campaign-empty-illustration">
            <CalendarOutlined />
        </div>
        <span className="campaign-kicker">Campaign detail</span>
        <h3>Không tìm thấy chiến dịch phù hợp để tiếp tục</h3>
        <p>
            Chiến dịch này có thể đã kết thúc hoặc tạm thời không còn lựa chọn phù hợp. Bạn vẫn có thể quay lại hub để khám phá
            chiến dịch khác hoặc xem danh mục sản phẩm để chọn một mẫu có thể mua ngay.
        </p>
        <div className="campaign-empty-actions">
            <Link to="/customer/preorder-campaigns" className="campaign-primary-cta">
                Quay lại campaign hub
            </Link>
            <Link to="/customer/products" className="campaign-secondary-cta">
                Xem danh mục sản phẩm
            </Link>
        </div>
    </div>
);

const EXPERIENCE_POINTS = [
    {
        icon: <ThunderboltOutlined />,
        title: 'Dễ chọn hơn',
        copy: 'Chiến dịch đã gom sẵn những phiên bản đáng chú ý để bạn không mất thời gian tìm kiếm từng lựa chọn riêng lẻ.',
    },
    {
        icon: <ClockCircleOutlined />,
        title: 'Timeline rõ ràng',
        copy: 'Mốc mở bán, chốt đơn và thời gian dự kiến được trình bày nổi bật để bạn yên tâm cân nhắc.',
    },
    {
        icon: <SafetyCertificateOutlined />,
        title: 'Thanh toán an tâm',
        copy: 'Bạn có thể xem giá, chọn phiên bản và hoàn tất bước giữ chỗ trong một trải nghiệm liền mạch.',
    },
];

const formatDate = (value) => {
    if (!value) return 'Chưa có';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('vi-VN').format(date);
};

const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const getVariantLabel = (variant) => {
    const values = (variant?.attributes || []).map((attribute) => attribute?.attributeValue).filter(Boolean);
    return values.length > 0 ? values.join(' / ') : variant?.sku || `Variant ${variant?.id}`;
};

const getPaymentOptionLabel = (config) => {
    if (!config?.preorderPaymentOption) return 'Theo chiến dịch';
    if (config.preorderPaymentOption === 'FULL_ONLY') return 'Thanh toán 100%';
    if (config.preorderPaymentOption === 'DEPOSIT_ONLY') {
        return config.depositPercent ? `Đặt cọc ${config.depositPercent}%` : 'Đặt cọc theo chiến dịch';
    }
    if (config.preorderPaymentOption === 'FLEXIBLE') {
        return config.depositPercent
            ? `Chọn cọc ${config.depositPercent}% hoặc thanh toán 100%`
            : 'Chọn cọc hoặc thanh toán 100%';
    }
    return config.preorderPaymentOption;
};

const getSelectedPaymentBreakdown = (item) => {
    const price = Number(item?.variant?.price || 0);
    const paymentOption = item?.config?.preorderPaymentOption;
    const depositPercent = Number(item?.config?.depositPercent || 0);

    if (!price) {
        return {
            todayLabel: 'Thanh toán hôm nay',
            todayAmount: 0,
            laterLabel: 'Thanh toán sau',
            laterAmount: 0,
        };
    }

    if (paymentOption === 'FULL_ONLY') {
        return {
            todayLabel: 'Thanh toán hôm nay',
            todayAmount: price,
            laterLabel: 'Thanh toán sau',
            laterAmount: 0,
        };
    }

    if ((paymentOption === 'DEPOSIT_ONLY' || paymentOption === 'FLEXIBLE') && depositPercent > 0) {
        const todayAmount = Math.round((price * depositPercent) / 100);
        return {
            todayLabel: `Đặt cọc ${depositPercent}%`,
            todayAmount,
            laterLabel: 'Thanh toán khi hàng về',
            laterAmount: Math.max(price - todayAmount, 0),
        };
    }

    return {
        todayLabel: 'Thanh toán hôm nay',
        todayAmount: price,
        laterLabel: 'Thanh toán sau',
        laterAmount: 0,
    };
};

const getVariantDepositPreview = (item) => {
    const paymentOption = item?.config?.preorderPaymentOption;
    const depositPercent = Number(item?.config?.depositPercent || 0);
    const price = Number(item?.variant?.price || 0);

    if ((paymentOption === 'DEPOSIT_ONLY' || paymentOption === 'FLEXIBLE') && depositPercent > 0 && price > 0) {
        return ` · Cọc ${formatVND(Math.round((price * depositPercent) / 100))}`;
    }

    return '';
};

const PreorderCampaignDetailPage = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { fetchCart } = useContext(CartContext);

    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [campaignResponse, productResponse] = await Promise.all([
                    getPublicCampaignDetailAPI(campaignId),
                    searchProductsAPI({ page: 0, size: 100 }),
                ]);

                const rawProducts = productResponse?.content || [];
                const products = await enrichPublicProducts(rawProducts, getPublicProductDetailAPI);
                if (cancelled) return;

                const variantIndex = buildCampaignVariantIndex(products);
                const normalizedCampaign = decorateCampaign(campaignResponse, variantIndex);
                setCampaign(normalizedCampaign);
                setSelectedVariantId(normalizedCampaign.items[0]?.variantId || null);
            } catch (error) {
                if (!cancelled) {
                    setCampaign(null);
                    message.error(error?.message || 'Không thể tải chi tiết chiến dịch pre-order.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [campaignId]);

    useEffect(() => {
        setQuantity(1);
    }, [selectedVariantId]);

    const selectedItem = useMemo(
        () => campaign?.items?.find((item) => item.variantId === selectedVariantId) || campaign?.items?.[0] || null,
        [campaign, selectedVariantId]
    );

    const statusMeta = getCampaignStatusMeta(campaign);
    const quantityLimit = getCampaignQuantityLimit(campaign);
    const relatedVariants = campaign?.items?.slice(0, 3) || [];
    const paymentBreakdown = useMemo(() => getSelectedPaymentBreakdown(selectedItem), [selectedItem]);

    const handleAddToCart = async () => {
        if (!user?.id) {
            message.warning('Vui lòng đăng nhập để giữ chỗ cho chiến dịch này.');
            navigate('/login');
            return;
        }

        if (!selectedItem?.variantId) {
            message.warning('Vui lòng chọn phiên bản bạn muốn đặt trước.');
            return;
        }

        if (!statusMeta.canOrder) {
            message.warning('Chiến dịch này hiện chưa mở nhận thêm đơn.');
            return;
        }

        setAdding(true);
        try {
            await addToCartAPI(selectedItem.variantId, quantity);
            await fetchCart();
            message.success('Đã thêm lựa chọn của chiến dịch vào giỏ hàng.');
        } catch (error) {
            message.error(error?.message || 'Không thể thêm vào giỏ hàng.');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return <CampaignDetailSkeleton />;
    }

    if (!campaign || campaign.items.length === 0) {
        return (
            <div className="campaign-empty-wrap">
                <CampaignDetailEmptyState />
            </div>
        );
    }

    return (
        <div className="campaign-detail-page">
            <div className="campaign-detail-shell premium">
                <div className="campaign-detail-breadcrumb">
                    <Link to="/customer/preorder-campaigns">Campaign hub</Link>
                    <span>/</span>
                    <strong>{campaign.name}</strong>
                </div>

                <section className="campaign-detail-hero premium-hero">
                    <div className="campaign-detail-copy premium-copy">
                        <span className={`campaign-status ${statusMeta.tone}`}>{statusMeta.label}</span>
                        <h1>{campaign.name}</h1>
                        <p>{statusMeta.helper}</p>

                        <div className="campaign-detail-facts premium-facts">
                            <div>
                                <span>Khoảng giá</span>
                                <strong>{formatCampaignPrice(campaign, formatVND)}</strong>
                            </div>
                            <div>
                                <span>Phiên bản tham gia</span>
                                <strong>{campaign.variantCount}</strong>
                            </div>
                            <div>
                                <span>Giới hạn còn lại</span>
                                <strong>{campaign.remainingSlots ?? 'Không giới hạn'}</strong>
                            </div>
                        </div>

                        <div className="campaign-hero-actions detail">
                            <a href="#campaign-purchase" className="campaign-primary-cta">Chọn phiên bản và đặt trước</a>
                            {selectedItem?.product?.id && (
                                <Link to={`/customer/products/${selectedItem.product.id}`} className="campaign-secondary-cta">
                                    Xem sản phẩm gốc
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="campaign-timeline-card premium-timeline">
                        <div className="campaign-timeline-head">
                            <span className="campaign-highlight-kicker">Timeline chiến dịch</span>
                            <strong>3 mốc đáng chú ý</strong>
                        </div>
                        <div className="campaign-timeline-row">
                            <CalendarOutlined />
                            <div>
                                <span>Mở nhận đơn</span>
                                <strong>{formatDate(campaign.startDate)}</strong>
                            </div>
                        </div>
                        <div className="campaign-timeline-row">
                            <ClockCircleOutlined />
                            <div>
                                <span>Đóng nhận đơn</span>
                                <strong>{formatDate(campaign.endDate)}</strong>
                            </div>
                        </div>
                        <div className="campaign-timeline-row">
                            <CheckCircleOutlined />
                            <div>
                                <span>Dự kiến giao</span>
                                <strong>{formatDate(campaign.fulfillmentDate)}</strong>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="campaign-process-section detail-benefits">
                    <div className="campaign-section-head">
                        <div>
                            <span className="campaign-kicker">Điểm nổi bật</span>
                            <h2>Vì sao chiến dịch này đáng để bạn quan tâm</h2>
                        </div>
                        <p>Mọi thông tin quan trọng đều được đặt ngay trong tầm mắt để bạn chọn nhanh hơn và tự tin hơn trước khi giữ chỗ.</p>
                    </div>
                    <div className="campaign-process-grid">
                        {EXPERIENCE_POINTS.map((point) => (
                            <article key={point.title} className="campaign-process-card premium-point">
                                <div className="campaign-process-index icon">{point.icon}</div>
                                <h3>{point.title}</h3>
                                <p>{point.copy}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="campaign-purchase" className="campaign-detail-grid premium-grid">
                    <div className="campaign-detail-panel premium-panel variants">
                        <div className="campaign-panel-head">
                            <div>
                                <span className="campaign-kicker">Phiên bản trong chiến dịch</span>
                                <h2>Chọn phiên bản bạn muốn sở hữu</h2>
                            </div>
                            <span>{campaign.items.length} lựa chọn</span>
                        </div>

                        <div className="campaign-variant-list premium-variant-list">
                            {campaign.items.map((item) => {
                                const isActive = selectedVariantId === item.variantId;
                                return (
                                    <button
                                        key={item.variantId}
                                        type="button"
                                        className={`campaign-variant-card ${isActive ? 'active' : ''}`}
                                        onClick={() => setSelectedVariantId(item.variantId)}
                                    >
                                        <div className="campaign-variant-main">
                                            <strong>{item.product?.name}</strong>
                                            <span>{getVariantLabel(item.variant)}</span>
                                        </div>
                                        <div className="campaign-variant-meta">
                                            <span>{formatVND(item.variant?.price)}</span>
                                            <small>{`${getPaymentOptionLabel(item.config)}${getVariantDepositPreview(item)}`}</small>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {relatedVariants.length > 0 && (
                            <div className="campaign-related-strip">
                                <span className="campaign-related-label">Những lựa chọn được quan tâm nhiều trong chiến dịch</span>
                                <div className="campaign-related-chips">
                                    {relatedVariants.map((item) => (
                                        <button
                                            key={`related-${item.variantId}`}
                                            type="button"
                                            className={selectedVariantId === item.variantId ? 'active' : ''}
                                            onClick={() => setSelectedVariantId(item.variantId)}
                                        >
                                            {getVariantLabel(item.variant)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="campaign-detail-panel premium-panel purchase">
                        <div className="campaign-panel-head">
                            <div>
                                <span className="campaign-kicker">Tóm tắt lựa chọn</span>
                                <h2>{selectedItem?.product?.name}</h2>
                            </div>
                            {selectedItem?.product?.id && (
                                <Link to={`/customer/products/${selectedItem.product.id}`}>Xem sản phẩm gốc</Link>
                            )}
                        </div>

                        <div className="campaign-selected-media">
                            {selectedItem?.productImage ? (
                                <img src={selectedItem.productImage} alt={selectedItem?.product?.name || 'Sản phẩm pre-order'} />
                            ) : (
                                <div className="campaign-selected-media-fallback">
                                    <span>{selectedItem?.product?.name?.slice(0, 1) || 'G'}</span>
                                </div>
                            )}
                        </div>

                        <div className="campaign-selected-summary premium-summary">
                            <p className="campaign-price">{formatVND(selectedItem?.variant?.price)}</p>
                            <p className="campaign-selected-copy">
                                <ThunderboltOutlined /> {getPaymentOptionLabel(selectedItem?.config)}
                            </p>
                            <p className="campaign-selected-copy">{getVariantLabel(selectedItem?.variant)}</p>
                        </div>

                        <div className="campaign-payment-breakdown">
                            <div>
                                <span>{paymentBreakdown.todayLabel}</span>
                                <strong>{formatVND(paymentBreakdown.todayAmount)}</strong>
                            </div>
                            <div>
                                <span>{paymentBreakdown.laterLabel}</span>
                                <strong>{formatVND(paymentBreakdown.laterAmount)}</strong>
                            </div>
                        </div>

                        <div className="campaign-note-box accent premium-note">
                            <strong>Sẵn sàng cho bước tiếp theo</strong>
                            <p>
                                Bạn đã có đầy đủ thông tin về giá, phiên bản và thời điểm dự kiến. Nếu đây là mẫu bạn yêu thích,
                                hãy giữ chỗ ngay để không bỏ lỡ.
                            </p>
                        </div>

                        {selectedItem?.product?.description && (
                            <div className="campaign-note-box">
                                <strong>Mô tả nhanh</strong>
                                <p>{selectedItem.product.description}</p>
                            </div>
                        )}

                        <div className="campaign-purchase-facts">
                            <div>
                                <span>Thương hiệu</span>
                                <strong>{selectedItem?.brandName || 'GENETIX'}</strong>
                            </div>
                            <div>
                                <span>Dự kiến giao</span>
                                <strong>{formatDate(campaign.fulfillmentDate)}</strong>
                            </div>
                        </div>

                        <div className="campaign-qty-row">
                            <span>Số lượng</span>
                            <InputNumber
                                min={1}
                                max={quantityLimit}
                                value={quantity}
                                onChange={(value) => setQuantity(value || 1)}
                                disabled={!statusMeta.canOrder}
                            />
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            icon={<ShoppingCartOutlined />}
                            onClick={handleAddToCart}
                            loading={adding}
                            disabled={!statusMeta.canOrder}
                            className="campaign-cart-btn"
                        >
                            Thêm vào giỏ hàng
                        </Button>

                        <div className="campaign-purchase-footnote">
                            <span><CheckCircleOutlined /> Giữ chỗ nhanh cho phiên bản bạn yêu thích</span>
                            <span><CheckCircleOutlined /> Dễ theo dõi đơn hàng và hành trình sở hữu sau khi đặt trước</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PreorderCampaignDetailPage;
