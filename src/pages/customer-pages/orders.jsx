import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Tag, Popconfirm, message, Empty } from 'antd';
import { getCustomerOrdersAPI, cancelOrderByCustomerAPI } from '../../services/api.service';
import './orders.css';

const STATUS_CONFIG = {
    PENDING_PAYMENT:   { label: 'Chờ thanh toán', color: 'gold' },
    WAITING_CONFIRM:   { label: 'Chờ xác nhận',   color: 'orange' },
    SUPPORT_CONFIRMED: { label: 'Đã xác nhận',    color: 'blue' },
    SHIPPING:          { label: 'Đang giao hàng', color: 'cyan' },
    COMPLETED:         { label: 'Hoàn thành',     color: 'green' },
    CANCELLED:         { label: 'Đã hủy',         color: 'red' },
    RETURNED:          { label: 'Hoàn trả',       color: 'volcano' },
};

const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const formatDate = d => d ? new Date(d).toLocaleString('vi-VN') : '';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            setLoading(true);
            const res = await getCustomerOrdersAPI();
            setOrders(Array.isArray(res) ? res : res?.content || []);
        } catch { message.error('Không thể tải đơn hàng'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCancel = async (orderId) => {
        try {
            await cancelOrderByCustomerAPI(orderId);
            message.success('Đã hủy đơn hàng');
            load();
        } catch (e) { message.error(e?.response?.data?.message || 'Không thể hủy đơn'); }
    };

    if (loading) return <div className="orders-loading"><Spin size="large" /></div>;

    return (
        <div className="orders-page">
            <div className="orders-inner">
                <h1 className="orders-title">📦 Đơn hàng của tôi</h1>
                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <Empty description={<span>Bạn chưa có đơn hàng nào. <Link to="/customer/products">Mua sắm ngay!</Link></span>} />
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => {
                            const statusCfg = STATUS_CONFIG[order.orderStatus] || { label: order.orderStatus, color: 'default' };
                            const canCancel = order.orderStatus === 'WAITING_CONFIRM' && order.paymentMethod === 'COD';
                            return (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <div>
                                            <span className="order-id">{order.orderCode || `Đơn #${order.id}`}</span>
                                            <span className="order-date">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="order-header-right">
                                            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                                            <span className="order-pay-method">{order.paymentMethod || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        {order.items?.map(item => (
                                            <div key={item.id} className="order-item">
                                                <span className="oi-name">{item.productName || item.name}</span>
                                                <span className="oi-qty">x{item.quantity}</span>
                                                <span className="oi-price">{formatVND((item.price || 0) * (item.quantity || 1))}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-footer">
                                        <span className="order-total">Tổng: <strong>{formatVND(order.totalAmount || order.total)}</strong></span>
                                        {canCancel && (
                                            <Popconfirm
                                                title="Xác nhận hủy đơn hàng?"
                                                description="Hành động này không thể hoàn tác."
                                                onConfirm={() => handleCancel(order.id)}
                                                okText="Hủy đơn"
                                                cancelText="Giữ lại"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <button className="cancel-btn">Hủy đơn</button>
                                            </Popconfirm>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
