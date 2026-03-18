import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Tag, Popconfirm, message, Empty, Tooltip, Pagination } from 'antd';
import { getCustomerOrdersAPI, cancelOrderByCustomerAPI, payRemainingOrderAPI } from '../../services/api.service';
import { formatAddressText, normalizeOrdersResponse } from '../../utils/role-data';
import './orders.css';

const STATUS_CONFIG = {
    PENDING_PAYMENT:   { label: 'Chờ thanh toán', color: 'gold' },
    WAITING_CONFIRM:   { label: 'Chờ xác nhận',   color: 'orange' },
    SUPPORT_CONFIRMED: { label: 'Đã xác nhận',    color: 'blue' },
    CONFIRMED:         { label: 'Đã xác nhận',    color: 'blue' },
    OPERATION_CONFIRMED:{ label: 'Đã tạo vận đơn', color: 'cyan' },
    SHIPPING:          { label: 'Đang giao hàng', color: 'cyan' },
    COMPLETED:         { label: 'Hoàn thành',     color: 'green' },
    CANCELLED:         { label: 'Đã hủy',         color: 'red' },
    RETURNED:          { label: 'Hoàn trả',       color: 'volcano' },
};

const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const formatDate = d => d ? new Date(d).toLocaleString('vi-VN') : 'BE chưa trả ngày đặt';
const getShipmentLabel = (status) => {
    if (!status) return 'Chưa có trạng thái giao vận';
    const labels = {
        WAITING_CONFIRM: 'Chờ tạo vận đơn',
        READY_TO_PICK: 'GHN chờ lấy hàng',
        PICKING: 'GHN đang lấy hàng',
        DELIVERING: 'GHN đang giao',
        DELIVERED: 'Đã giao thành công',
        FAILED: 'Giao hàng thất bại',
        CANCELLED: 'Đã hủy vận đơn',
        RETURNED: 'Đơn hoàn về'
    };
    return labels[status] || status;
};

const getRemainingPaymentMeta = (order) => {
    const isPreOrderDeposit = order.orderType === 'PRE_ORDER' && Number(order.remainingAmount) > 0;

    if (!isPreOrderDeposit) return null;

    if (order.orderStatus === 'PENDING_PAYMENT') {
        return {
            tone: 'ready',
            title: 'Đã mở thanh toán phần còn lại',
            description: `Hàng đã về. Bạn có thể thanh toán ${formatVND(order.remainingAmount)} còn lại ngay bây giờ.`,
        };
    }

    if (order.orderStatus === 'COMPLETED' || Number(order.remainingAmount) <= 0) {
        return {
            tone: 'done',
            title: 'Đã hoàn tất thanh toán pre-order',
            description: 'Đơn đã được thanh toán đủ và đang tiếp tục các bước giao vận.',
        };
    }

    return {
        tone: 'waiting',
        title: 'Chờ mở thanh toán phần còn lại',
        description: 'Bạn đã cọc 30%. Khi manager xác nhận hàng đã về, hệ thống sẽ mở nút thanh toán phần còn lại tại đây.',
    };
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingOrderId, setPayingOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const load = async () => {
        try {
            setLoading(true);
            const res = await getCustomerOrdersAPI();
            setOrders(normalizeOrdersResponse(res).items);
        } catch { message.error('Không thể tải đơn hàng'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [orders.length, currentPage]);

    const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleCancel = async (orderId) => {
        try {
            await cancelOrderByCustomerAPI(orderId);
            message.success('Đã hủy đơn hàng');
            load();
        } catch (e) { message.error(e?.response?.data?.message || 'Không thể hủy đơn'); }
    };

    const handlePayRemaining = async (orderId) => {
        try {
            setPayingOrderId(orderId);
            const res = await payRemainingOrderAPI(orderId);
            if (res?.paymentUrl) {
                window.location.href = res.paymentUrl;
                return;
            }
            message.success('Đã tạo yêu cầu thanh toán phần còn lại.');
            load();
        } catch (e) {
            message.error(e?.response?.data?.message || 'Không thể thanh toán phần còn lại');
        } finally {
            setPayingOrderId(null);
        }
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
                    <>
                        <div className="orders-page-meta">
                            <span>Hiển thị {paginatedOrders.length} / {orders.length} đơn hàng</span>
                            <strong>Trang {currentPage}</strong>
                        </div>
                        <div className="orders-list">
                        {paginatedOrders.map(order => {
                            const statusCfg = STATUS_CONFIG[order.orderStatus] || { label: order.orderStatus, color: 'default' };
                            const canCancel = order.orderStatus === 'WAITING_CONFIRM';
                            const canPayRemaining =
                                order.orderType === 'PRE_ORDER'
                                && Number(order.remainingAmount) > 0
                                && order.orderStatus === 'PENDING_PAYMENT';
                            const remainingPaymentMeta = getRemainingPaymentMeta(order);

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
                                            <span className="order-pay-method">{order.remainingPaymentMethod || order.paymentMethod || 'Không có thông tin thanh toán'}</span>
                                        </div>
                                    </div>

                                    <div className="order-info-grid">
                                        <div className="info-block">
                                            <span>Người nhận</span>
                                            <strong>{order.receiverName || '—'}</strong>
                                        </div>
                                        <div className="info-block">
                                            <span>Số điện thoại</span>
                                            <strong>{order.receiverPhone || '—'}</strong>
                                        </div>
                                        <div className="info-block full">
                                            <span>Địa chỉ</span>
                                            <strong>{formatAddressText(order.address)}</strong>
                                        </div>
                                        <div className="info-block">
                                            <span>Mã vận đơn</span>
                                            <strong className="tracking-code">{order.ghnOrderCode || 'Chưa tạo vận đơn'}</strong>
                                        </div>
                                        <div className="info-block">
                                            <span>Trạng thái giao vận</span>
                                            <strong>{getShipmentLabel(order.shipmentStatus)}</strong>
                                        </div>
                                    </div>

                                    {remainingPaymentMeta && (
                                        <div className={`remaining-payment-banner ${remainingPaymentMeta.tone}`}>
                                            <div>
                                                <strong>{remainingPaymentMeta.title}</strong>
                                                <p>{remainingPaymentMeta.description}</p>
                                            </div>
                                            {canPayRemaining && (
                                                <button
                                                    className="pay-remaining-btn"
                                                    type="button"
                                                    onClick={() => handlePayRemaining(order.id)}
                                                    disabled={payingOrderId === order.id}
                                                >
                                                    {payingOrderId === order.id ? 'Đang chuyển thanh toán...' : 'Thanh toán phần còn lại'}
                                                </button>
                                            )}
                                        </div>
                                    )}

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
                        {orders.length > pageSize && (
                            <div className="orders-pagination">
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={orders.length}
                                    onChange={setCurrentPage}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
