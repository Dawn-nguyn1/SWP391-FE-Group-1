import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Spin, message, InputNumber, Button } from 'antd';
import {
    ShoppingCartOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ThunderboltOutlined,
    InboxOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { addToCartAPI, getPublicCampaignsAPI, getPublicProductDetailAPI } from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import { AuthContext } from '../../context/auth.context';
import './product-detail.css';

const formatVND = (amount) => (
    amount || amount === 0
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
        : 'Liên hệ'
);

const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('vi-VN').format(date);
};

const normalizeImage = (image) => image?.imageUrl || image?.url || image || null;

const getVariantImages = (variant, productImage) => {
    const attributeImages = (variant?.attributes || [])
        .flatMap((attribute) => Array.isArray(attribute.images) ? attribute.images.map(normalizeImage) : [])
        .filter(Boolean);

    if (attributeImages.length > 0) return attributeImages;
    return productImage ? [productImage] : [];
};

const getVariantLabel = (variant) => {
    const values = (variant?.attributes || []).map((attribute) => attribute?.attributeValue).filter(Boolean);
    return values.length > 0 ? values.join(' / ') : variant?.sku || `Variant ${variant?.id}`;
};

const hasPositiveStock = (variant) => {
    const stockQuantity = Number(variant?.stockQuantity);
    return Number.isFinite(stockQuantity) && stockQuantity > 0;
};

const getAvailabilityMeta = (variant) => {
    if (!variant) {
        return {
            label: 'Tạm hết lựa chọn',
            tone: 'out',
            copy: 'Mẫu này đang được cập nhật thêm phiên bản phù hợp. Vui lòng quay lại sau để xem tiếp.',
            canAddToCart: false,
        };
    }

    if (variant?.saleType === 'PRE_ORDER') {
        return {
            label: 'Đặt qua chiến dịch',
            tone: 'out',
            copy: 'Phiên bản này đang mở bán trong một chiến dịch riêng để bạn theo dõi thông tin và quyền lợi trọn vẹn hơn.',
            canAddToCart: false,
        };
    }

    if (variant?.availabilityStatus === 'OUT_OF_STOCK' || !hasPositiveStock(variant)) {
        return {
            label: 'Tạm hết hàng',
            tone: 'out',
            copy: 'Phiên bản này đang được khách hàng quan tâm nhiều. Bạn có thể chọn phiên bản khác hoặc quay lại sau.',
            canAddToCart: false,
        };
    }

    return {
        label: 'Có sẵn',
        tone: 'in',
        copy: `Sẵn sàng để thêm vào giỏ với số lượng còn lại: ${Math.max((variant?.stockQuantity ?? 0) - (variant?.currentPreorders ?? 0), 0)}`,
        canAddToCart: true,
    };
};

const getDefaultVariantId = (variants = []) => {
    const inStockVariant = variants.find((variant) => getAvailabilityMeta(variant).canAddToCart);
    if (inStockVariant?.id) return inStockVariant.id;
    return variants?.[0]?.id || null;
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { fetchCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        let cancelled = false;

        Promise.all([getPublicProductDetailAPI(id), getPublicCampaignsAPI()])
            .then(([productResponse, campaignResponse]) => {
                if (cancelled) return;
                setProduct(productResponse);
                setCampaigns(Array.isArray(campaignResponse) ? campaignResponse : []);
                const defaultVariantId = getDefaultVariantId(productResponse?.variants || []);
                if (defaultVariantId) {
                    setSelectedVariantId(defaultVariantId);
                }
            })
            .catch(() => !cancelled && message.error('Không tìm thấy sản phẩm'))
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, [id]);

    const selectedVariant = useMemo(
        () => product?.variants?.find((variant) => variant.id === selectedVariantId) || product?.variants?.[0] || null,
        [product, selectedVariantId]
    );

    const productCampaigns = useMemo(() => {
        const variantIds = new Set((product?.variants || []).map((variant) => variant?.id));
        return campaigns.filter((campaign) => {
            const campaignVariantIds = Array.isArray(campaign?.variantIds)
                ? campaign.variantIds
                : Array.from(campaign?.variantIds || []);
            return campaignVariantIds.some((variantId) => variantIds.has(variantId));
        });
    }, [campaigns, product?.variants]);

    const matchedCampaign = useMemo(() => {
        if (!selectedVariant?.id) return null;
        return productCampaigns.find((campaign) => {
            const campaignVariantIds = Array.isArray(campaign?.variantIds)
                ? campaign.variantIds
                : Array.from(campaign?.variantIds || []);
            return campaignVariantIds.includes(selectedVariant.id);
        }) || null;
    }, [productCampaigns, selectedVariant?.id]);

    const variantImages = useMemo(
        () => getVariantImages(selectedVariant, product?.productImage),
        [selectedVariant, product?.productImage]
    );

    const productImage = useMemo(() => normalizeImage(product?.productImage), [product?.productImage]);
    const availabilityMeta = getAvailabilityMeta(selectedVariant);
    const maxQuantity = availabilityMeta.canAddToCart
        ? Math.max((selectedVariant?.stockQuantity ?? 0) - (selectedVariant?.currentPreorders ?? 0), 1)
        : 1;

    useEffect(() => {
        setActiveImg(0);
        setQuantity(1);
    }, [selectedVariantId]);

    const handleAddToCart = async () => {
        if (!user?.id) {
            message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            navigate('/login');
            return;
        }

        if (!selectedVariant?.id || !availabilityMeta.canAddToCart) {
            message.warning('Phiên bản này hiện chưa thể thêm vào giỏ hàng');
            return;
        }

        setAdding(true);
        try {
            await addToCartAPI(selectedVariant.id, quantity);
            await fetchCart();
            message.success('Đã thêm vào giỏ hàng');
        } catch (error) {
            message.error(error?.message || 'Không thể thêm vào giỏ hàng');
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <div className="detail-loading"><Spin size="large" /></div>;
    if (!product) return <div className="detail-empty">Không tìm thấy sản phẩm.</div>;

    return (
        <div className="product-detail-page">
            <div className="detail-inner">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeftOutlined /> Quay lại
                </button>

                <div className="detail-grid">
                    <div className="detail-images">
                        <div className="gallery-header">
                            <span className={`gallery-mode-tag ${availabilityMeta.tone}`}>{availabilityMeta.label}</span>
                            <div>
                                <strong>{selectedVariant?.sku || product.name}</strong>
                                <span>{getVariantLabel(selectedVariant)}</span>
                            </div>
                        </div>

                        <div className="gallery-shell">
                            <div className="main-img-wrap">
                                {variantImages[activeImg] || productImage ? (
                                    <img src={variantImages[activeImg] || productImage} alt={product.name} className="main-img" />
                                ) : (
                                    <div className="main-img-placeholder">Kính</div>
                                )}
                            </div>
                        </div>

                        <div className="gallery-panel">
                            <div className="gallery-panel-head">
                                <div>
                                    <span className="gallery-panel-kicker">Bộ ảnh sản phẩm</span>
                                    <strong>Ngắm chi tiết phiên bản bạn đang quan tâm</strong>
                                </div>
                                <span className="gallery-panel-count">{variantImages.length} ảnh</span>
                            </div>

                            <div className="thumb-list">
                                {variantImages.map((image, index) => (
                                    <button
                                        key={`${selectedVariant?.id || 'variant'}-${index}`}
                                        className={`thumb ${activeImg === index ? 'active' : ''}`}
                                        onClick={() => setActiveImg(index)}
                                    >
                                        <img src={image} alt="" />
                                        <span className="thumb-overlay">{index + 1}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="detail-info">
                        <p className="detail-brand">{product.brandName}</p>
                        <h1 className="detail-title">{product.name}</h1>
                        <div className="purchase-strip">
                            <div className="detail-price">{formatVND(selectedVariant?.price)}</div>
                        </div>

                        <div className={`status-panel ${availabilityMeta.tone}`}>
                            <div className="status-panel-head">
                                <span className="status-pill">{availabilityMeta.label}</span>
                                <span className="status-sku">{selectedVariant?.sku || `SKU-${selectedVariant?.id}`}</span>
                            </div>
                            <p>{availabilityMeta.copy}</p>
                            {selectedVariant?.saleType === 'PRE_ORDER' && matchedCampaign && (
                                <div className="status-meta-row">
                                    <span><ThunderboltOutlined /> Có trong chiến dịch: {matchedCampaign.name}</span>
                                    {matchedCampaign?.fulfillmentDate && (
                                        <span><InboxOutlined /> Dự kiến giao từ: {formatDate(matchedCampaign.fulfillmentDate)}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {product.variants?.length > 0 && (
                            <div className="select-group">
                                <label>Chọn phiên bản</label>
                                <div className="variant-chips">
                                    {product.variants.map((variant) => {
                                        const variantAvailability = getAvailabilityMeta(variant);
                                        return (
                                            <button
                                                key={variant.id}
                                                className={`chip ${selectedVariant?.id === variant.id ? 'active' : ''} ${variantAvailability.tone}`}
                                                onClick={() => setSelectedVariantId(variant.id)}
                                            >
                                                <span>{getVariantLabel(variant)}</span>
                                                <small>{variantAvailability.label}</small>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {matchedCampaign && (
                            <div className="preorder-zone">
                                <div className="preorder-zone-head">
                                    <strong>Chiến dịch liên quan</strong>
                                    <span>Khám phá không gian riêng dành cho phiên bản này để xem trọn bộ quyền lợi và thời gian mở bán.</span>
                                </div>
                                <div className="preorder-stats">
                                    <div className="preorder-stat-card">
                                        <span className="preorder-stat-label">Tên chiến dịch</span>
                                        <strong>{matchedCampaign.name}</strong>
                                    </div>
                                    <div className="preorder-stat-card">
                                        <span className="preorder-stat-label">Mở nhận đơn đến</span>
                                        <strong>{formatDate(matchedCampaign.endDate) || '—'}</strong>
                                    </div>
                                    <div className="preorder-stat-card">
                                        <span className="preorder-stat-label">Dự kiến giao</span>
                                        <strong>{formatDate(matchedCampaign.fulfillmentDate) || '—'}</strong>
                                    </div>
                                </div>
                                <Link to={`/customer/preorder-campaigns/${matchedCampaign.id}`} className="section-link">
                                    Xem chiến dịch này <RightOutlined />
                                </Link>
                            </div>
                        )}

                        {productCampaigns.length > 1 && (
                            <div className="select-group">
                                <label>Các chiến dịch khác của mẫu này</label>
                                <div className="variant-chips">
                                    {productCampaigns.map((campaign) => (
                                        <Link key={campaign.id} to={`/customer/preorder-campaigns/${campaign.id}`} className="chip in">
                                            <span>{campaign.name}</span>
                                            <small>{formatDate(campaign.endDate) || 'Chiến dịch'}</small>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedVariant?.attributes?.length > 0 && (
                            <div className="select-group">
                                <label>Thông tin phiên bản đã chọn</label>
                                <div className="attribute-grid">
                                    {selectedVariant.attributes.map((attribute) => (
                                        <div key={attribute.id} className="attribute-card">
                                            <span className="attribute-name">{attribute.attributeName}</span>
                                            <strong className="attribute-value">{attribute.attributeValue}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="select-group">
                            <label>Số lượng</label>
                            <InputNumber
                                min={1}
                                max={maxQuantity}
                                value={quantity}
                                onChange={(value) => setQuantity(value || 1)}
                                size="large"
                                style={{ width: 120 }}
                                disabled={!availabilityMeta.canAddToCart}
                            />
                        </div>

                        {!availabilityMeta.canAddToCart && selectedVariant?.saleType === 'PRE_ORDER' && (
                            <div className="preorder-block-note">
                                {matchedCampaign ? (
                                    <>Phiên bản này đang được mở bán trong chiến dịch <strong>{matchedCampaign.name}</strong>. Hãy ghé xem để giữ chỗ sớm.</>
                                ) : (
                                    <>Phiên bản này hiện thuộc nhóm đặt trước. Vui lòng quay lại sau để xem thêm thông tin mở bán.</>
                                )}
                            </div>
                        )}

                        <Button
                            type="primary"
                            size="large"
                            icon={availabilityMeta.canAddToCart ? <ShoppingCartOutlined /> : null}
                            disabled={!availabilityMeta.canAddToCart}
                            loading={adding}
                            onClick={handleAddToCart}
                            className="add-cart-btn"
                        >
                            {availabilityMeta.canAddToCart ? 'Thêm vào giỏ hàng' : 'Xem chiến dịch đặt trước'}
                        </Button>

                        {product.description && (
                            <div className="detail-desc">
                                <h4>Mô tả sản phẩm</h4>
                                <p>{product.description}</p>
                            </div>
                        )}

                        <div className="detail-meta">
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> Giao hàng toàn quốc qua GHN</div>
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> Đổi trả trong 30 ngày</div>
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> Thanh toán an toàn, mua sắm thuận tiện</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
