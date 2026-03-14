import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spin, InputNumber, Button, Empty, message, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { getCartAPI, updateCartItemAPI, removeCartItemAPI, clearCartAPI } from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import { attachCartItemKinds, isLegacyComboCartItem, rebuildCartFromItems } from '../../utils/cart-normalize';
import './cart.css';

const formatVND = (value) =>
    value ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) : '0 ₫';

const CartPage = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const { fetchCart } = useContext(CartContext);
    const navigate = useNavigate();

    const loadCart = async () => {
        try {
            setLoading(true);
            const response = await getCartAPI();
            const nextItems = await attachCartItemKinds(response?.items || []);
            setItems(nextItems);
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
            if (currentItem?.itemKind === 'combo') {
                message.warning('Combo legacy không thể chỉnh sửa riêng lẻ. Vui lòng xoá toàn bộ giỏ hàng.');
                return;
            }

            if (itemId) {
                await updateCartItemAPI(itemId, quantity);
            } else {
                const nextItems = items.map((item) =>
                    item === currentItem ? { ...item, quantity } : item
                );
                await rebuildCartFromItems(nextItems);
            }

            await loadCart();
            fetchCart();
        } catch {
            message.error('Không thể cập nhật số lượng');
        }
    };

    const handleRemove = async (itemId, currentItem) => {
        try {
            if (currentItem?.itemKind === 'combo') {
                message.warning('Combo legacy không thể xoá riêng lẻ. Vui lòng xoá toàn bộ giỏ hàng.');
                return;
            }

            if (itemId) {
                await removeCartItemAPI(itemId);
            } else {
                const nextItems = items.filter((item) => item !== currentItem);
                await rebuildCartFromItems(nextItems);
            }

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

    const isComboItem = (item) => isLegacyComboCartItem(item);
    const comboItems = items.filter(isComboItem);
    const normalItems = items.filter((item) => !isComboItem(item));
    const total = items.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1), 0);
    const hasComboItems = comboItems.length > 0;

    const renderItem = (item, combo = false) => (
        <div key={item.id || `${item.productId}-${combo ? 'combo' : 'item'}`} className="cart-item">
            <div className={`item-img ${combo ? 'item-img-combo' : ''}`}>
                {item.productImage ? <img src={item.productImage} alt={item.productName} /> : <span style={{ fontSize: 22, fontWeight: 700 }}>COMBO</span>}
            </div>
            <div className="item-info">
                <p className={`item-brand ${combo ? 'item-brand-combo' : ''}`}>{combo ? 'COMBO ƯU ĐÃI' : (item.brand || '')}</p>
                <h3 className="item-name">
                    {item.productName}
                    {combo && <span className="item-badge">Combo</span>}
                </h3>
                <p className="item-variant">
                    {combo ? 'Hiển thị tham khảo, chưa hỗ trợ mua trực tiếp' : `${item.variantName || ''} ${item.size || ''}`}
                </p>
            </div>
            <div className="item-qty">
                <InputNumber
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(value) => {
                        if (!value || value < 1) return;
                        handleQtyChange(item.id, value, item);
                    }}
                    size="small"
                    disabled={combo}
                />
            </div>
            <div className="item-price">{formatVND((item.unitPrice || 0) * (item.quantity || 1))}</div>
            <Popconfirm title="Xoá sản phẩm này?" onConfirm={() => handleRemove(item.id, item)} okText="Xoá" cancelText="Huỷ">
                <button className={`item-delete ${combo ? 'item-delete-disabled' : ''}`} type="button">
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
                <h1 className="cart-title">🛒 Giỏ hàng của bạn</h1>
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
                            {hasComboItems && (
                                <div className="cart-warning">
                                    Giỏ hàng đang chứa combo legacy. FE chặn thanh toán để tránh sai lệch giá combo so với giá thanh toán.
                                    <Button type="link" className="cart-warning-action" onClick={handleClearCart}>Xoá toàn bộ giỏ hàng</Button>
                                </div>
                            )}
                            {comboItems.length > 0 && (
                                <div className="cart-section">
                                    <div className="cart-section-title">Combo ưu đãi ({comboItems.length})</div>
                                    {comboItems.map((item) => renderItem(item, true))}
                                </div>
                            )}
                            {normalItems.length > 0 && (
                                <div className="cart-section">
                                    <div className="cart-section-title">Sản phẩm đơn lẻ ({normalItems.length})</div>
                                    {normalItems.map((item) => renderItem(item, false))}
                                </div>
                            )}
                        </div>

                        <div className="cart-summary">
                            <h3>Tóm tắt đơn hàng</h3>
                            <div className="summary-row"><span>Tạm tính ({items.length} sản phẩm)</span><span>{formatVND(total)}</span></div>
                            <div className="summary-row"><span>Phí vận chuyển</span><span>Tính khi checkout</span></div>
                            <div className="summary-row total"><span>Tổng cộng</span><span className="total-price">{formatVND(total)}</span></div>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ArrowRightOutlined />}
                                className="checkout-btn"
                                onClick={() => {
                                    if (hasComboItems) {
                                        message.warning('Vui lòng xoá combo legacy khỏi giỏ hàng trước khi thanh toán.');
                                        return;
                                    }
                                    navigate('/customer/checkout');
                                }}
                                block
                                disabled={hasComboItems}
                            >
                                Tiến hành đặt hàng
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
