import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Spin, InputNumber, Button, Empty, message, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { getCartAPI, updateCartItemAPI, removeCartItemAPI } from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import { normalizeCart } from '../../utils/role-data';
import './cart.css';

const formatVND = n => n ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '0 ₫';

const getDistinctSaleTypes = (items = []) => [...new Set(items.map((item) => item?.saleType).filter(Boolean))];

const CartPage = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const { fetchCart } = useContext(CartContext);
    const navigate = useNavigate();

    const loadCart = async () => {
        try {
            setLoading(true);
            const res = await getCartAPI();
            const normalizedCart = normalizeCart(res);
            setItems(normalizedCart.items);
        } catch { message.error('Không thể tải giỏ hàng'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadCart(); }, []);

    const handleQtyChange = async (itemId, qty) => {
        try {
            await updateCartItemAPI(itemId, qty);
            await loadCart();
            fetchCart();
        } catch { message.error('Không thể cập nhật số lượng'); }
    };

    const handleRemove = async (itemId) => {
        try {
            await removeCartItemAPI(itemId);
            await loadCart();
            fetchCart();
            message.success('Đã xoá sản phẩm');
        } catch { message.error('Không thể xoá sản phẩm'); }
    };

    const total = items.reduce((sum, it) => sum + (it.lineTotal || (it.unitPrice || 0) * (it.quantity || 1)), 0);
    const saleTypes = getDistinctSaleTypes(items);
    const isMixedCart = saleTypes.length > 1;

    if (loading) return <div className="cart-loading"><Spin size="large" /></div>;

    return (
        <div className="cart-page">
            <div className="cart-inner">
                <h1 className="cart-title">Giỏ hàng của bạn</h1>
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
                            {items.map(item => (
                                <div key={item.clientKey} className="cart-item">
                                    <div className="item-img">
                                        {item.productImage ? <img src={item.productImage} alt={item.productName} /> : <span style={{ fontSize: 36 }}>👓</span>}
                                    </div>
                                    <div className="item-info">
                                        <p className="item-brand">{item.brand || ''}</p>
                                        <h3 className="item-name">{item.productName}</h3>
                                        <p className="item-variant">{item.variantName || ''} {item.size || ''}</p>
                                    </div>
                                    <div className="item-qty">
                                        <InputNumber
                                            min={1} max={99}
                                            value={item.quantity}
                                            onChange={val => handleQtyChange(item.id, val)}
                                            size="small"
                                            disabled={!item.id}
                                        />
                                    </div>
                                    <div className="item-price">{formatVND((item.unitPrice || 0) * (item.quantity || 1))}</div>
                                    <Popconfirm title="Xoá sản phẩm này?" onConfirm={() => handleRemove(item.id)} okText="Xoá" cancelText="Huỷ" disabled={!item.id}>
                                        <button className="item-delete"><DeleteOutlined /></button>
                                    </Popconfirm>
                                </div>
                            ))}
                        </div>
                        {items.some(item => !item.id) && (
                            <div style={{ marginTop: 12, color: '#b45309', fontSize: 13 }}>
                                Backend hiện chưa trả `itemId` trong cart response, nên FE chưa thể cập nhật hoặc xoá item này chính xác.
                            </div>
                        )}
                        {isMixedCart && (
                            <div style={{ marginTop: 12, color: '#b91c1c', fontSize: 13, lineHeight: 1.6 }}>
                                Giỏ hàng đang chứa cả sản phẩm có sẵn và sản phẩm pre-order. Backend hiện không cho checkout mixed cart, vui lòng tách giỏ hàng trước khi thanh toán.
                            </div>
                        )}

                        <div className="cart-summary">
                            <h3>Tóm tắt đơn hàng</h3>
                            <div className="summary-row"><span>Tạm tính ({items.length} sản phẩm)</span><span>{formatVND(total)}</span></div>
                            <div className="summary-row"><span>Phí vận chuyển</span><span>Tính khi checkout</span></div>
                            <div className="summary-row total"><span>Tổng cộng</span><span className="total-price">{formatVND(total)}</span></div>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ArrowRightOutlined />}
                                onClick={() => {
                                    if (isMixedCart) {
                                        message.warning('Backend chưa hỗ trợ checkout cùng lúc sản phẩm có sẵn và pre-order.');
                                        return;
                                    }
                                    navigate('/customer/checkout');
                                }}
                                className="checkout-btn"
                                block
                                disabled={isMixedCart}
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
