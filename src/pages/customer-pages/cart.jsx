import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Spin, InputNumber, Button, Empty, message, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { getCartAPI, updateCartItemAPI, removeCartItemAPI } from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import './cart.css';

const formatVND = n => n ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '0 ₫';

const CartPage = () => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const { fetchCart } = useContext(CartContext);
    const navigate = useNavigate();

    const loadCart = async () => {
        try {
            setLoading(true);
            const res = await getCartAPI();
            setItems(res?.items || []);
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

    const total = items.reduce((sum, it) => sum + (it.unitPrice || 0) * (it.quantity || 1), 0);

    if (loading) return <div className="cart-loading"><Spin size="large" /></div>;

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
                            {items.map(item => (
                                <div key={item.id} className="cart-item">
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
                                        />
                                    </div>
                                    <div className="item-price">{formatVND((item.unitPrice || 0) * (item.quantity || 1))}</div>
                                    <Popconfirm title="Xoá sản phẩm này?" onConfirm={() => handleRemove(item.id)} okText="Xoá" cancelText="Huỷ">
                                        <button className="item-delete"><DeleteOutlined /></button>
                                    </Popconfirm>
                                </div>
                            ))}
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
                                onClick={() => navigate('/customer/checkout')}
                                className="checkout-btn"
                                block
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
