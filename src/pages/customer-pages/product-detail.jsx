import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin, message, InputNumber, Button } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, CheckCircleOutlined, ThunderboltOutlined, InboxOutlined } from '@ant-design/icons';
import { getPublicProductDetailAPI, addToCartAPI } from '../../services/api.service';
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

const getCartSaleType = (items = []) => {
    const saleTypes = [...new Set(items.map((item) => item?.saleType).filter(Boolean))];
    return saleTypes.length === 1 ? saleTypes[0] : null;
};

const getPreorderWindowState = (variant) => {
    const now = new Date();
    const start = variant?.preorderStartDate ? new Date(variant.preorderStartDate) : null;
    const end = variant?.preorderEndDate ? new Date(variant.preorderEndDate) : null;

    if (start && !Number.isNaN(start.getTime()) && now < start) return 'upcoming';
    if (end && !Number.isNaN(end.getTime()) && now > end) return 'closed';
    return 'open';
};

const getPreorderEligibility = (variant) => {
    if (!variant || variant?.saleType !== 'PRE_ORDER') {
        return { isPreorder: false, canPreorder: false, remainingSlots: null };
    }

    const hasAllowFlag = Object.prototype.hasOwnProperty.call(variant || {}, 'allowPreorder');
    const allowPreorder = hasAllowFlag ? variant?.allowPreorder === true : true;
    const preorderLimit = Number(variant?.preorderLimit);
    const currentPreorders = Number(variant?.currentPreorders);
    const hasLimit = Number.isFinite(preorderLimit) && preorderLimit > 0;
    const hasCurrent = Number.isFinite(currentPreorders) && currentPreorders >= 0;
    const remainingSlots = hasLimit
        ? Math.max(preorderLimit - (hasCurrent ? currentPreorders : 0), 0)
        : null;
    const hasFulfillmentDate = !Object.prototype.hasOwnProperty.call(variant || {}, 'preorderFulfillmentDate')
        || Boolean(variant?.preorderFulfillmentDate);
    const windowState = getPreorderWindowState(variant);

    return {
        isPreorder: true,
        canPreorder: allowPreorder && hasLimit && hasFulfillmentDate && windowState === 'open' && (remainingSlots === null || remainingSlots > 0),
        allowPreorder,
        hasLimit,
        remainingSlots,
        windowState,
        hasFulfillmentDate,
    };
};

const getAvailabilityMeta = (variant) => {
    if (!variant) {
        return {
            label: 'Chưa có biến thể',
            tone: 'out',
            copy: 'Sản phẩm này hiện chưa có biến thể khả dụng.',
            canAddToCart: false,
        };
    }
    const availability = variant?.availabilityStatus;
    const preorder = getPreorderEligibility(variant);
    if (availability === 'PRE_ORDER' || preorder.canPreorder) {
        return {
            label: 'Pre-order',
            tone: 'preorder',
            copy: variant?.preorderFulfillmentDate
                ? `Ngày nhận hàng dự kiến: ${variant.preorderFulfillmentDate}`
                : 'Biến thể đang mở đặt trước.',
            canAddToCart: true,
        };
    }
    if (preorder.isPreorder) {
        if (!preorder.allowPreorder) {
            return {
                label: 'Pre-order chưa bật',
                tone: 'out',
                copy: 'Biến thể này chưa được backend mở cho đặt trước.',
                canAddToCart: false,
            };
        }

        if (!preorder.hasLimit) {
            return {
                label: 'Thiếu giới hạn pre-order',
                tone: 'out',
                copy: 'Biến thể pre-order chưa được cấu hình số lượng nhận cọc hợp lệ.',
                canAddToCart: false,
            };
        }

        if (preorder.windowState === 'upcoming') {
            return {
                label: 'Sắp mở pre-order',
                tone: 'preorder',
                copy: variant?.preorderStartDate
                    ? `Đợt đặt trước bắt đầu từ ${formatDate(variant.preorderStartDate)}.`
                    : 'Biến thể này chưa mở đặt trước.',
                canAddToCart: false,
            };
        }

        if (preorder.windowState === 'closed') {
            return {
                label: 'Đã đóng pre-order',
                tone: 'out',
                copy: 'Đợt nhận đặt trước đã kết thúc.',
                canAddToCart: false,
            };
        }

        if (!preorder.hasFulfillmentDate) {
            return {
                label: 'Chưa sẵn sàng',
                tone: 'out',
                copy: 'Biến thể pre-order chưa có lịch giao dự kiến.',
                canAddToCart: false,
            };
        }

        if (preorder.remainingSlots !== null && preorder.remainingSlots <= 0) {
            return {
                label: 'Hết slot pre-order',
                tone: 'out',
                copy: 'Biến thể này đã kín số lượng đặt trước.',
                canAddToCart: false,
            };
        }
    }

    if (availability === 'OUT_OF_STOCK') {
        return {
            label: 'Hết hàng',
            tone: 'out',
            copy: 'Hiện chưa thể thêm vào giỏ hàng.',
            canAddToCart: false,
        };
    }
    return {
        label: 'Có hàng',
        tone: 'in',
        copy: `Tồn kho hiện tại: ${variant?.stockQuantity ?? 0}`,
        canAddToCart: true,
    };
};

const getPreorderMetrics = (variant) => {
    const preorderLimit = Number(variant?.preorderLimit);
    const currentPreorders = Number(variant?.currentPreorders);
    const hasLimit = Number.isFinite(preorderLimit) && preorderLimit > 0;
    const hasCurrent = Number.isFinite(currentPreorders) && currentPreorders >= 0;

    if (!hasLimit && !hasCurrent) return null;

    const safeLimit = hasLimit ? preorderLimit : 0;
    const safeCurrent = hasCurrent ? currentPreorders : 0;
    const remaining = hasLimit ? Math.max(safeLimit - safeCurrent, 0) : null;
    const percent = hasLimit && safeLimit > 0
        ? Math.min((safeCurrent / safeLimit) * 100, 100)
        : null;

    return {
        preorderLimit: safeLimit,
        currentPreorders: safeCurrent,
        remaining,
        percent,
    };
};

const getDefaultVariantId = (variants = []) => {
    const preorderReady = variants.find((variant) => {
        const availability = getAvailabilityMeta(variant);
        return availability.canAddToCart && variant?.saleType === 'PRE_ORDER';
    });
    if (preorderReady?.id) return preorderReady.id;

    const sellable = variants.find((variant) => getAvailabilityMeta(variant).canAddToCart);
    if (sellable?.id) return sellable.id;

    return variants?.[0]?.id || null;
};

const getActionLabel = (variant, availabilityMeta) => {
    if (availabilityMeta.canAddToCart) {
        return variant?.saleType === 'PRE_ORDER' ? 'Đặt trước ngay' : 'Thêm vào giỏ hàng';
    }

    if (variant?.saleType === 'PRE_ORDER') {
        if (availabilityMeta.label === 'Sắp mở pre-order') return 'Chưa mở nhận cọc';
        if (availabilityMeta.label === 'Đã đóng pre-order') return 'Đã đóng pre-order';
        if (availabilityMeta.label === 'Hết slot pre-order') return 'Đã kín suất đặt trước';
        if (availabilityMeta.label === 'Chưa sẵn sàng') return 'Pre-order chưa bật';
        if (availabilityMeta.label === 'Pre-order chưa bật') return 'Pre-order chưa bật';
        if (availabilityMeta.label === 'Thiếu giới hạn pre-order') return 'Thiếu cấu hình pre-order';
    }

    return 'Hết hàng';
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { fetchCart, cart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        getPublicProductDetailAPI(id)
            .then((response) => {
                setProduct(response);
                const defaultVariantId = getDefaultVariantId(response?.variants || []);
                if (defaultVariantId) {
                    setSelectedVariantId(defaultVariantId);
                }
            })
            .catch(() => message.error('Không tìm thấy sản phẩm'))
            .finally(() => setLoading(false));
    }, [id]);

    const selectedVariant = useMemo(
        () => product?.variants?.find((variant) => variant.id === selectedVariantId) || product?.variants?.[0] || null,
        [product, selectedVariantId]
    );

    const variantImages = useMemo(
        () => getVariantImages(selectedVariant, product?.productImage),
        [selectedVariant, product?.productImage]
    );

    useEffect(() => {
        setActiveImg(0);
        setQuantity(1);
    }, [selectedVariantId]);

    const availabilityMeta = getAvailabilityMeta(selectedVariant);
    const preorderMetrics = getPreorderMetrics(selectedVariant);
    const preorderEligibility = getPreorderEligibility(selectedVariant);
    const hasPreorderWindow = Boolean(
        selectedVariant?.preorderStartDate || selectedVariant?.preorderEndDate || selectedVariant?.preorderFulfillmentDate
    );
    const actionLabel = getActionLabel(selectedVariant, availabilityMeta);
    const maxQuantity = availabilityMeta.canAddToCart
        ? Math.max(
            1,
            selectedVariant?.saleType === 'PRE_ORDER'
                ? preorderEligibility.remainingSlots || 1
                : selectedVariant?.stockQuantity || 1
        )
        : 1;

    const handleAddToCart = async () => {
        if (!user?.id) {
            message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }

        if (!selectedVariant?.id) {
            message.warning('Vui lòng chọn biến thể sản phẩm');
            return;
        }

        if (!availabilityMeta.canAddToCart) {
            message.warning('Biến thể này hiện chưa thể thêm vào giỏ hàng');
            return;
        }

        const currentCartSaleType = getCartSaleType(cart?.items || []);
        if (currentCartSaleType && currentCartSaleType !== selectedVariant?.saleType) {
            message.warning(
                currentCartSaleType === 'PRE_ORDER'
                    ? 'Giỏ hàng hiện có sản phẩm pre-order. Vui lòng thanh toán hoặc xóa giỏ hiện tại trước khi thêm sản phẩm có sẵn.'
                    : 'Giỏ hàng hiện có sản phẩm có sẵn. Vui lòng thanh toán hoặc xóa giỏ hiện tại trước khi thêm sản phẩm pre-order.'
            );
            return;
        }

        setAdding(true);
        try {
            await addToCartAPI(selectedVariant.id, quantity);
            await fetchCart();
            message.success('Đã thêm vào giỏ hàng');
        } catch (error) {
            const backendMessage = error?.response?.data?.message || error?.message || 'Không thể thêm vào giỏ hàng';
            if (
                typeof backendMessage === 'string'
                && (backendMessage.includes('Pre-order is not available') || backendMessage.includes('Variant is not available for preorder'))
            ) {
                message.error('Biến thể này chưa được backend mở cho preorder. Hãy chọn biến thể khác hoặc cập nhật cấu hình BE.');
            } else {
                message.error(backendMessage);
            }
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
                                {variantImages[activeImg] ? (
                                    <img src={variantImages[activeImg]} alt={product.name} className="main-img" />
                                ) : (
                                    <div className="main-img-placeholder">👓</div>
                                )}
                            </div>
                        </div>

                        <div className="gallery-panel">
                            <div className="gallery-panel-head">
                                <div>
                                    <span className="gallery-panel-kicker">Variant gallery</span>
                                    <strong>Ảnh theo biến thể đang chọn</strong>
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

                            <div className="gallery-note">
                                Ảnh và thông tin bên phải đang đồng bộ theo biến thể bạn chọn.
                            </div>
                        </div>
                    </div>

                    <div className="detail-info">
                        <p className="detail-brand">{product.brandName}</p>
                        <h1 className="detail-title">{product.name}</h1>
                        <div className="purchase-strip">
                            <div className="detail-price">{formatVND(selectedVariant?.price)}</div>
                            <div className="purchase-strip-note">
                                <span>Loại bán</span>
                                <strong>{selectedVariant?.saleType === 'PRE_ORDER' ? 'Pre-order' : 'In-stock'}</strong>
                            </div>
                        </div>

                        <div className={`status-panel ${availabilityMeta.tone}`}>
                            <div className="status-panel-head">
                                <span className="status-pill">{availabilityMeta.label}</span>
                                <span className="status-sku">{selectedVariant?.sku || `SKU-${selectedVariant?.id}`}</span>
                            </div>
                            <p>{availabilityMeta.copy}</p>
                            {selectedVariant?.saleType === 'PRE_ORDER' && (
                                <div className="status-meta-row">
                                    <span><ThunderboltOutlined /> Loại bán: Pre-order</span>
                                    {selectedVariant?.preorderFulfillmentDate && (
                                        <span><InboxOutlined /> Giao dự kiến: {selectedVariant.preorderFulfillmentDate}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {product.variants?.length > 0 && (
                            <div className="select-group">
                                <label>Biến thể</label>
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

                        {(preorderMetrics || hasPreorderWindow) && (
                            <div className="preorder-zone">
                                <div className="preorder-zone-head">
                                    <strong>Thông tin pre-order</strong>
                                </div>

                                {preorderMetrics && (
                                    <div className="preorder-stats">
                                        <div className="preorder-stat-card">
                                            <span className="preorder-stat-label">Đã đặt trước</span>
                                            <strong>{preorderMetrics.currentPreorders}</strong>
                                        </div>
                                        <div className="preorder-stat-card">
                                            <span className="preorder-stat-label">Giới hạn</span>
                                            <strong>{preorderMetrics.preorderLimit || '—'}</strong>
                                        </div>
                                        <div className="preorder-stat-card">
                                            <span className="preorder-stat-label">Còn lại</span>
                                            <strong>{preorderMetrics.remaining ?? '—'}</strong>
                                        </div>
                                        {preorderMetrics.percent !== null && (
                                            <div className="preorder-progress-wrap">
                                                <div className="preorder-progress-head">
                                                    <span>Tiến độ đặt trước</span>
                                                    <strong>{Math.round(preorderMetrics.percent)}%</strong>
                                                </div>
                                                <div className="preorder-progress-bar">
                                                    <span style={{ width: `${preorderMetrics.percent}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {hasPreorderWindow && (
                                    <div className="preorder-timeline">
                                        {selectedVariant?.preorderStartDate && (
                                            <div className="preorder-timeline-item">
                                                <span>Mở đặt trước</span>
                                                <strong>{formatDate(selectedVariant.preorderStartDate)}</strong>
                                            </div>
                                        )}
                                        {selectedVariant?.preorderEndDate && (
                                            <div className="preorder-timeline-item">
                                                <span>Kết thúc nhận cọc</span>
                                                <strong>{formatDate(selectedVariant.preorderEndDate)}</strong>
                                            </div>
                                        )}
                                        {selectedVariant?.preorderFulfillmentDate && (
                                            <div className="preorder-timeline-item">
                                                <span>Giao dự kiến</span>
                                                <strong>{formatDate(selectedVariant.preorderFulfillmentDate)}</strong>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedVariant?.attributes?.length > 0 && (
                            <div className="select-group">
                                <label>Thông tin biến thể đã chọn</label>
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
                                {availabilityMeta.copy}
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
                            {actionLabel}
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
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> Thanh toán an toàn qua VNPay / COD</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
