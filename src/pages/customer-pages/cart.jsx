import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Spin, InputNumber, Button, Empty, message, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
    getCartAPI,
    getPublicCampaignsAPI,
    getPublicCampaignDetailAPI,
    getPublicProductDetailAPI,
    removeCartItemAPI,
    updateCartItemAPI,
} from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import { normalizeCart, normalizeCollectionResponse } from '../../utils/role-data';
import {
    buildCampaignConfigIndex,
    getCartLineTotal,
    getPreOrderCartSummary,
    getPreOrderDepositAmount,
    getPreOrderItemBreakdown,
    normalizeCampaignPayload,
    resolvePreOrderPolicy,
} from '../../utils/preorder-cart-policy';
import './cart.css';

const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const normalizeText = (value) =>
    String(value || '')
        .trim()
        .toLowerCase();

const buildAttributeSignature = (attributes = []) =>
    (Array.isArray(attributes) ? attributes : [])
        .map((attribute) => `${normalizeText(attribute?.attributeName)}:${normalizeText(attribute?.attributeValue)}`)
        .filter(Boolean)
        .sort()
        .join('|');

const resolveCartVariantId = (item, productDetail) => {
    const variants = Array.isArray(productDetail?.variants) ? productDetail.variants : [];
    if (variants.length === 0) return null;
    if (variants.length === 1) return variants[0]?.id || null;

    const cartSignature = buildAttributeSignature(item?.attributes);
    const unitPrice = Number(item?.unitPrice || item?.lineTotal || 0);

    const matchedVariant = variants.find((variant) => {
        const variantSignature = buildAttributeSignature(variant?.attributes);
        const sameAttributes = cartSignature && variantSignature === cartSignature;
        const samePrice = Number(variant?.price || 0) === unitPrice;
        return sameAttributes || (samePrice && variantSignature === cartSignature);
    });

    return matchedVariant?.id || null;
};

const getPreOrderBadge = (preorderPolicy) => {
    if (!preorderPolicy?.isPreOrderCart) return null;
    if (preorderPolicy.paymentOption === 'FULL_ONLY') return 'Thanh toán 100%';
    if (preorderPolicy.paymentOption === 'DEPOSIT_ONLY') {
        return preorderPolicy.depositPercent
            ? `Đặt cọc ${preorderPolicy.depositPercent}%`
            : 'Đặt cọc theo campaign';
    }
    return preorderPolicy.depositPercent
        ? `Linh hoạt ${preorderPolicy.depositPercent}% / 100%`
        : 'Linh hoạt theo campaign';
};

const CartPage = () => {
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({ items: [], finalTotal: 0 });
    const [preorderPolicy, setPreorderPolicy] = useState(null);
    const [configIndex, setConfigIndex] = useState(new Map());
    const { fetchCart } = useContext(CartContext);
    const navigate = useNavigate();

    const loadCart = async () => {
        try {
            setLoading(true);
            const [cartResponse, campaignResponse] = await Promise.all([getCartAPI(), getPublicCampaignsAPI()]);
            const normalizedCart = normalizeCart(cartResponse);
            const preorderProductIds = [...new Set(
                normalizedCart.items
                    .filter((item) => item?.saleType === 'PRE_ORDER' && item?.productId)
                    .map((item) => item.productId)
            )];
            const productDetails = await Promise.all(
                preorderProductIds.map(async (productId) => {
                    try {
                        return [String(productId), await getPublicProductDetailAPI(productId)];
                    } catch {
                        return [String(productId), null];
                    }
                })
            );
            const productDetailMap = new Map(productDetails);
            const enrichedItems = normalizedCart.items.map((item) => {
                if (item?.saleType !== 'PRE_ORDER') return item;
                const productDetail = item?.productId ? productDetailMap.get(String(item.productId)) : null;
                const resolvedVariantId = resolveCartVariantId(item, productDetail);
                return {
                    ...item,
                    resolvedVariantId: resolvedVariantId || item?.resolvedVariantId || null,
                };
            });
            const enrichedCart = {
                ...normalizedCart,
                items: enrichedItems,
            };
            const campaigns = normalizeCollectionResponse(campaignResponse).items;
            const detailedCampaigns = await Promise.all(
                campaigns.map(async (campaign) => {
                    const campaignId = campaign?.id;
                    if (!campaignId) return null;
                    try {
                        return normalizeCampaignPayload(await getPublicCampaignDetailAPI(campaignId));
                    } catch {
                        return normalizeCampaignPayload(campaign);
                    }
                })
            );

            const campaignSource = detailedCampaigns.filter(Boolean).length > 0
                ? detailedCampaigns.filter(Boolean)
                : campaigns;
            const nextConfigIndex = buildCampaignConfigIndex(campaignSource);
            const nextPolicy = resolvePreOrderPolicy(enrichedCart.items, nextConfigIndex);

            setCart(enrichedCart);
            setConfigIndex(nextConfigIndex);
            setPreorderPolicy(nextPolicy);
        } catch {
            message.error('Không thể tải giỏ hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const handleQtyChange = async (itemId, qty) => {
        try {
            await updateCartItemAPI(itemId, qty);
            await loadCart();
            fetchCart();
        } catch {
            message.error('Không thể cập nhật số lượng.');
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await removeCartItemAPI(itemId);
            await loadCart();
            fetchCart();
            message.success('Đã xóa sản phẩm khỏi giỏ hàng.');
        } catch {
            message.error('Không thể xóa sản phẩm.');
        }
    };

    const items = cart?.items || [];
    const itemsWithBreakdown = useMemo(
        () => items.map((item) => ({ ...item, preorderBreakdown: getPreOrderItemBreakdown(item, configIndex) })),
        [items, configIndex]
    );

    if (loading) return <div className="cart-loading"><Spin size="large" /></div>;

    const total = cart?.finalTotal || 0;
    const totalLabel = formatVND(total);
    const preorderSummary = getPreOrderCartSummary({ totalLabel, preorderPolicy });
    const preorderBadge = getPreOrderBadge(preorderPolicy);
    const depositAmount = getPreOrderDepositAmount({
        total,
        paymentMode: 'deposit',
        preorderPolicy,
    });
    const remainingAmount = preorderPolicy?.isPreOrderCart
        ? Number(preorderPolicy?.dueLater || Math.max(total - depositAmount, 0))
        : 0;

    return (
        <div className="cart-page">
            <div className="cart-inner">
                <div className="cart-hero">
                    <div>
                        <h1 className="cart-title">Giỏ hàng của bạn</h1>
                        <p className="cart-subtitle">
                            Kiểm tra lại lựa chọn yêu thích trước khi sang bước thanh toán và hoàn tất đơn thật gọn gàng.
                        </p>
                    </div>
                    {preorderBadge && <span className="cart-mode-pill preorder">{preorderBadge}</span>}
                </div>

                {items.length === 0 ? (
                    <div className="cart-empty">
                        <Empty
                            image={<ShoppingOutlined style={{ fontSize: 72, color: '#c4b5fd' }} />}
                            description={
                                <span>
                                    Giỏ hàng đang trống. <Link to="/customer/products">Khám phá bộ sưu tập ngay!</Link>
                                </span>
                            }
                        />
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {preorderSummary && (
                                <div className="cart-policy-banner">
                                    <strong>{preorderSummary.title}</strong>
                                    <p>{preorderSummary.detail}</p>
                                    <div className="cart-policy-stats">
                                        <span>
                                            Thanh toán hôm nay:
                                            <strong>{` ${formatVND(depositAmount)}`}</strong>
                                        </span>
                                        <span>
                                            Thanh toán sau:
                                            <strong>{` ${formatVND(remainingAmount)}`}</strong>
                                        </span>
                                    </div>
                                    {preorderPolicy?.hasMixedPolicies && (
                                        <p className="cart-policy-warning">
                                            Giỏ hàng đang có nhiều cấu hình pre-order khác nhau. Hệ thống đang ưu tiên cấu hình của nhóm campaign đầu tiên để đồng bộ với checkout.
                                        </p>
                                    )}
                                    {preorderPolicy?.missingConfigCount > 0 && (
                                        <p className="cart-policy-warning">
                                            Một vài phiên bản pre-order chưa đọc được cấu hình campaign đầy đủ. Hãy kiểm tra lại campaign nếu số tiền chưa đúng như mong muốn.
                                        </p>
                                    )}
                                </div>
                            )}

                            {itemsWithBreakdown.map((item) => {
                                const breakdown = item.preorderBreakdown;

                                return (
                                    <div key={item.clientKey} className={`cart-item ${item.saleType === 'PRE_ORDER' ? 'preorder' : ''}`}>
                                        <div className="item-img">
                                            {item.productImage ? (
                                                <img src={item.productImage} alt={item.productName} />
                                            ) : (
                                                <span className="item-fallback-glyph">G</span>
                                            )}
                                        </div>
                                        <div className="item-info">
                                            <div className="item-head">
                                                <p className="item-brand">{item.brand || ''}</p>
                                                {item.saleType === 'PRE_ORDER' && <span className="item-mode-tag">Pre-order</span>}
                                            </div>
                                            <h3 className="item-name">{item.productName}</h3>
                                            <p className="item-variant">{item.variantName || ''} {item.size || ''}</p>

                                            {item.saleType === 'PRE_ORDER' && (
                                                <div className="item-preorder-breakdown">
                                                    <span>
                                                        Cọc hôm nay
                                                        <strong>{formatVND(breakdown.dueToday)}</strong>
                                                    </span>
                                                    <span>
                                                        Thanh toán sau
                                                        <strong>{formatVND(breakdown.dueLater)}</strong>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="item-qty">
                                            <InputNumber
                                                min={1}
                                                max={99}
                                                value={item.quantity}
                                                onChange={(value) => handleQtyChange(item.id, value)}
                                                size="small"
                                                disabled={!item.id}
                                            />
                                        </div>
                                        <div className="item-price">{formatVND(getCartLineTotal(item))}</div>
                                        <Popconfirm
                                            title="Xóa sản phẩm này?"
                                            onConfirm={() => handleRemove(item.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            disabled={!item.id}
                                        >
                                            <button className="item-delete"><DeleteOutlined /></button>
                                        </Popconfirm>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-summary">
                            <h3>Tóm tắt đơn hàng</h3>
                            <div className="summary-row">
                                <span>Tạm tính ({items.length} sản phẩm)</span>
                                <span>{totalLabel}</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí vận chuyển</span>
                                <span>Tính khi checkout</span>
                            </div>

                            {preorderSummary && (
                                <>
                                    <div className="summary-divider" />
                                    <div className="summary-highlight">
                                        <strong>{preorderSummary.dueTodayLabel}</strong>
                                        <span>{formatVND(depositAmount)}</span>
                                    </div>
                                    <div className="summary-row compact">
                                        <span>Hình thức</span>
                                        <span>{preorderSummary.dueTodayMode}</span>
                                    </div>
                                    <div className="summary-row compact">
                                        <span>Thanh toán sau</span>
                                        <span>{formatVND(remainingAmount)}</span>
                                    </div>
                                </>
                            )}

                            <div className="summary-row total">
                                <span>Tổng cộng</span>
                                <span className="total-price">{totalLabel}</span>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ArrowRightOutlined />}
                                onClick={() => navigate('/customer/checkout')}
                                className="checkout-btn"
                                block
                            >
                                Tiến hành đặt hàng
                            </Button>
                            <Link to="/customer/products" className="continue-shopping">← Tiếp tục mua sắm</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
