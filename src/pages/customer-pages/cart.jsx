import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spin, InputNumber, Button, Empty, message, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { getCartAPI, updateCartItemAPI, removeCartItemAPI, clearCartAPI } from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import {
    getCartItemId,
    getCartItemImage,
    getCartItemLineTotal,
    getCartItemMeta,
    getCartItemName,
    getCartItemTypeLabel,
    isComboCartItem,
    isPreOrderCartItem,
} from '../../utils/cart-normalize';
import './cart.css';

const formatVND = (value) =>
    value ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) : '0 ₫';
const getMinDeposit = (value) => Math.ceil((Number(value) || 0) * 0.3);

const CartPage = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [cartSummary, setCartSummary] = useState(null);
    const { fetchCart } = useContext(CartContext);
    const navigate = useNavigate();

    const loadCart = async () => {
        try {
            setLoading(true);
            const response = await getCartAPI();
            setItems(response?.items || []);
            setCartSummary(response || null);
        } catch {
            message.error('Không thể tải giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const handleQtyChange = async (itemId, quantity, currentItem) => {
        try {
            await updateCartItemAPI(itemId || getCartItemId(currentItem), quantity);

            await loadCart();
            fetchCart();
        } catch {
            message.error('Không thể cập nhật số lượng');
        }
    };

    const handleRemove = async (itemId, currentItem) => {
        try {
            await removeCartItemAPI(itemId || getCartItemId(currentItem));

            await loadCart();
            fetchCart();
            message.success('Đã xoá sản phẩm');
        } catch {
            message.error('Không thể xoá sản phẩm');
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCartAPI();
            await loadCart();
            fetchCart();
            message.success('Đã xoá toàn bộ giỏ hàng');
        } catch {
            message.error('Không thể xoá giỏ hàng');
        }
    };

    const isComboItem = (item) => isComboCartItem(item);
    const comboItems = items.filter(isComboItem);
    const preOrderItems = items.filter((item) => isPreOrderCartItem(item));
    const inStockItems = items.filter((item) => !isComboItem(item) && !isPreOrderCartItem(item));
    const subTotal = Number(cartSummary?.subTotal ?? 0);
    const discountAmount = Number(cartSummary?.discountAmount ?? 0);
    const finalTotal = Number(cartSummary?.finalTotal ?? 0);
    const totalItems = Number(cartSummary?.totalItems ?? items.length);
    const hasPreOrderItems = preOrderItems.length > 0;
    const hasMixedCheckout = hasPreOrderItems && (comboItems.length > 0 || inStockItems.length > 0);
    const minDeposit = getMinDeposit(finalTotal);
    const remainingAmount = Math.max(finalTotal - minDeposit, 0);

    const renderItem = (item, combo = false) => (
        <div key={getCartItemId(item) || `${getCartItemName(item)}-${combo ? 'combo' : 'item'}`} className="cart-item">
            <div className={`item-img ${combo ? 'item-img-combo' : ''}`}>
                {getCartItemImage(item) ? <img src={getCartItemImage(item)} alt={getCartItemName(item)} /> : <span style={{ fontSize: 22, fontWeight: 700 }}>COMBO</span>}
            </div>
            <div className="item-info">
                <p className={`item-brand ${combo ? 'item-brand-combo' : ''}`}>{combo ? 'COMBO' : getCartItemTypeLabel(item)}</p>
                <h3 className="item-name">
                    {getCartItemName(item)}
                    {combo && <span className="item-badge">Combo</span>}
                    {isPreOrderCartItem(item) && <span className="item-badge item-badge-preorder">Pre-order</span>}
                </h3>
                <p className="item-variant">{getCartItemMeta(item)}</p>
            </div>
            <div className="item-qty">
                <InputNumber
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(value) => {
                        if (!value || value < 1) return;
                        handleQtyChange(getCartItemId(item), value, item);
                    }}
                    size="small"
                />
            </div>
            <div className="item-price">{formatVND(getCartItemLineTotal(item))}</div>
            <Popconfirm title="Xoá sản phẩm này?" onConfirm={() => handleRemove(getCartItemId(item), item)} okText="Xoá" cancelText="Huỷ">
                <button className="item-delete" type="button">
                    <DeleteOutlined />
                </button>
            </Popconfirm>
        </div>
    );

    if (loading) {
        return <div className="cart-loading"><Spin size="large" /></div>;
    }

    return (
        <div className="cart-page">
            <div className="cart-inner">
                <h1 className="cart-title"> Giỏ hàng của bạn</h1>
                {items.length === 0 ? (
                    <div className="cart-empty">
                        <Empty
                            image={<ShoppingOutlined style={{ fontSize: 72, color: '#c4b5fd' }} />}
                            description={<span>Giỏ hàng trống. <Link to="/customer/products">Mua sắm ngay!</Link></span>}
                        />
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {hasMixedCheckout && (
                                <div className="cart-warning">
                                    <span>Giỏ hàng đang trộn sản phẩm pre-order với hàng có sẵn hoặc combo. Backend sẽ từ chối checkout kiểu này.</span>
                                </div>
                            )}
                            {hasPreOrderItems && !hasMixedCheckout && (
                                <div className="cart-warning cart-warning-preorder">
                                    <span>Đây là giỏ hàng đặt trước. Bạn sẽ thanh toán cọc 30% ở bước checkout và phần còn lại khi hàng về.</span>
                                </div>
                            )}
                            {comboItems.length > 0 && (
                                <div className="cart-section">
                                    <div className="cart-section-title">Combo ưu đãi ({comboItems.length})</div>
                                    {comboItems.map((item) => renderItem(item, true))}
                                </div>
                            )}
                            {preOrderItems.length > 0 && (
                                <div className="cart-section">
                                    <div className="cart-section-title">Sản phẩm đặt trước ({preOrderItems.length})</div>
                                    {preOrderItems.map((item) => renderItem(item, false))}
                                </div>
                            )}
                            {inStockItems.length > 0 && (
                                <div className="cart-section">
                                    <div className="cart-section-title">Sản phẩm có sẵn ({inStockItems.length})</div>
                                    {inStockItems.map((item) => renderItem(item, false))}
                                </div>
                            )}
                        </div>

                        <div className="cart-summary">
                            <h3>{hasPreOrderItems && !hasMixedCheckout ? 'Tóm tắt đặt cọc' : 'Tóm tắt đơn hàng'}</h3>
                            <div className="summary-row"><span>Tạm tính ({totalItems} sản phẩm)</span><span>{formatVND(subTotal)}</span></div>
                            <div className="summary-row"><span>Giảm giá</span><span>{discountAmount > 0 ? `- ${formatVND(discountAmount)}` : '0 ₫'}</span></div>
                            <div className="summary-row"><span>Phí vận chuyển</span><span>Tính khi checkout</span></div>
                            {hasPreOrderItems && !hasMixedCheckout && (
                                <>
                                    <div className="summary-row preorder"><span>Thanh toán hôm nay</span><span>{formatVND(minDeposit)}</span></div>
                                    <div className="summary-row preorder"><span>Còn lại khi hàng về</span><span>{formatVND(remainingAmount)}</span></div>
                                </>
                            )}
                            <div className="summary-row total"><span>Tổng cộng</span><span className="total-price">{formatVND(finalTotal)}</span></div>
                            {!!cartSummary?.couponCode && (
                                <div className="cart-summary-note">Ma giam gia dang ap dung: {cartSummary.couponCode}</div>
                            )}
                            {!!cartSummary?.orderNote && (
                                <div className="cart-summary-note">Ghi chu don hang: {cartSummary.orderNote}</div>
                            )}
                            <Button
                                type="primary"
                                size="large"
                                icon={<ArrowRightOutlined />}
                                className="checkout-btn"
                                disabled={hasMixedCheckout}
                                onClick={() => navigate('/customer/checkout')}
                                block
                            >
                                {hasPreOrderItems && !hasMixedCheckout ? 'Tiến hành đặt cọc' : 'Tiến hành đặt hàng'}
                            </Button>
                            <Button danger type="text" onClick={handleClearCart} style={{ marginTop: 12 }} block>
                                Xoá toàn bộ giỏ hàng
                            </Button>
                            <Link to="/customer/products" className="continue-shopping">← Tiếp tục mua hàng</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
