import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Tag, Popconfirm, message, Empty, Tooltip } from 'antd';
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
const formatAddress = (address) => {
    if (!address) return '—';
    const parts = [address.addressLine, address.ward, address.district, address.province].filter(Boolean);
    return parts.join(', ');
};

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
                <h1 className="orders-title">Đơn hàng của tôi</h1>
                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <Empty description={<span>Bạn chưa có đơn hàng nào. <Link to="/customer/products">Mua sắm ngay!</Link></span>} />
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => {
                            const statusCfg = STATUS_CONFIG[order.orderStatus] || { label: order.orderStatus, color: 'default' };
                            const canCancel = order.orderStatus === 'WAITING_CONFIRM';
                            return (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-main">
                                            <div className="order-title">
                                                <span className="order-id">{order.orderCode || `Đơn #${order.id}`}</span>
                                                <span className="order-type">{order.orderType || '—'}</span>
                                            </div>
                                            <span className="order-date">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="order-header-right">
                                            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                                            <span className="order-pay-method">{order.remainingPaymentMethod || order.paymentMethod || '—'}</span>
                                        </div>
                                    </div>

                                    <div className="order-info-grid">
                                        <div className="info-block">
                                            <span>Người nhận</span>
                                            <strong>{order.address?.receiverName || '—'}</strong>
                                        </div>
                                        <div className="info-block">
                                            <span>Số điện thoại</span>
                                            <strong>{order.address?.phone || '—'}</strong>
                                        </div>
                                        <div className="info-block full">
                                            <span>Địa chỉ</span>
                                            <strong>{formatAddress(order.address)}</strong>
                                        </div>
                                    </div>

                                    <div className="order-summary">
                                        <div className="summary-item">
                                            <span>Tổng tiền</span>
                                            <strong>{formatVND(order.totalAmount || order.total)}</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Đặt cọc</span>
                                            <strong>{formatVND(order.deposit)}</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Còn lại</span>
                                            <strong>{formatVND(order.remainingAmount)}</strong>
                                        </div>
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
                                        {!canCancel && (
                                            <Tooltip title="Chỉ hủy được khi đơn ở trạng thái Chờ xác nhận">
                                                <span className="cancel-disabled">Không thể hủy</span>
                                            </Tooltip>
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
