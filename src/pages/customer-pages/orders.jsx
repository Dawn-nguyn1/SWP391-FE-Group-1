import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Tag, Popconfirm, message, Empty, Tooltip, Pagination } from 'antd';
import { getCustomerOrdersAPI, getCustomerOrderDetailAPI, cancelOrderByCustomerAPI, payRemainingOrderAPI, getCustomerPaymentsAPI } from '../../services/api.service';
import { formatAddressText, normalizeOrder, normalizeOrdersResponse, normalizePaymentsResponse } from '../../utils/role-data';
import {
    hasPreOrderRemainingBalance,
    isPreOrderFullyPaidAfterSupport,
    isPreOrderRemainingOpen,
    isPreOrderRemainingPaid,
    isPreOrderSupportApproved,
    isPreOrderWaitingSupport,
} from '../../utils/preorder-flow';
import './orders.css';

const STATUS_CONFIG = {
    PENDING_PAYMENT:   { label: 'Chờ thanh toán', color: 'gold' },
    WAITING_CONFIRM:   { label: 'Chờ xác nhận',   color: 'orange' },
    PAID:              { label: 'Đã thanh toán', color: 'blue' },
    SUPPORT_CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
    CONFIRMED:         { label: 'Đã xác nhận', color: 'blue' },
    OPERATION_CONFIRMED:{ label: 'Đã tạo vận đơn', color: 'cyan' },
    SHIPPING:          { label: 'Đang giao hàng', color: 'cyan' },
    COMPLETED:         { label: 'Hoàn thành',     color: 'green' },
    CANCELLED:         { label: 'Đã hủy',         color: 'red' },
    RETURNED:          { label: 'Hoàn trả',       color: 'volcano' },
    FAILED:            { label: 'Thất bại',       color: 'red' },
};

const SHIPMENT_STATUS_CONFIG = {
    WAITING_CONFIRM: { label: 'Chờ tạo vận đơn', color: 'default' },
    READY_TO_PICK:   { label: 'Chờ GHN lấy hàng', color: 'blue' },
    PICKING:         { label: 'Đang lấy hàng', color: 'blue' },
    PICKED:          { label: 'Đã lấy hàng', color: 'cyan' },
    DELIVERING:      { label: 'Đang giao hàng', color: 'cyan' },
    DELIVERED:       { label: 'Hoàn thành', color: 'green' },
    FAILED:          { label: 'Giao hàng thất bại', color: 'red' },
    CANCELLED:       { label: 'Đã hủy đơn', color: 'red' },
    RETURNED:        { label: 'Đơn hoàn về', color: 'volcano' },
};

const getErrorMessage = (error, fallback) =>
    error?.message
    || error?.error
    || error?.data?.message
    || error?.response?.data?.message
    || fallback;

const getRedirectUrl = (payload) =>
    payload?.paymentUrl
    || payload?.data?.paymentUrl
    || payload?.result?.paymentUrl
    || null;

const hasFinishedRemainingPayment = (order) =>
    !hasPreOrderRemainingBalance(order) || isPreOrderRemainingPaid(order);

const canOpenRemainingPayment = (order) =>
    hasPreOrderRemainingBalance(order) && isPreOrderRemainingOpen(order);

const hasSupportApproval = (order) =>
    order?.approvalStatus === 'SUPPORT_APPROVED'
    || order?.approvalStatus === 'OPERATION_CONFIRMED'
    || Boolean(order?.supportApprovedAt);

const normalizeShipmentStatus = (status) =>
    typeof status === 'string' ? status.trim().toUpperCase() : status;

const getOrderStatusMeta = (order) => {
    const shipmentStatus = normalizeShipmentStatus(order?.shipmentStatus);

    if (shipmentStatus && SHIPMENT_STATUS_CONFIG[shipmentStatus]) {
        return SHIPMENT_STATUS_CONFIG[shipmentStatus];
    }

    if (order?.orderType !== 'PRE_ORDER' && hasSupportApproval(order)) {
        return { label: 'Đã xác nhận - chờ giao GHN', color: 'cyan' };
    }

    if (isPreOrderFullyPaidAfterSupport(order)) {
        return { label: 'Đã thanh toán đủ - chờ giao GHN', color: 'green' };
    }

    if (canOpenRemainingPayment(order)) {
        return { label: 'Đã về hàng - chờ thanh toán còn lại', color: 'gold' };
    }

    if (isPreOrderWaitingSupport(order)) {
        return { label: 'Đã thanh toán cọc - chờ support duyệt', color: 'blue' };
    }

    return STATUS_CONFIG[order?.orderStatus] || { label: order?.orderStatus || '—', color: 'default' };
};

const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const formatDate = d => d ? new Date(d).toLocaleString('vi-VN') : 'BE chưa trả ngày đặt';
const getPaymentTimestamp = (payment) => {
    const rawDate = payment?.paidAt || payment?.createAt;
    const time = rawDate ? new Date(rawDate).getTime() : 0;
    return Number.isNaN(time) ? 0 : time;
};

const buildPaymentSummaryMap = (payments) => {
    const grouped = new Map();

    payments.forEach((payment) => {
        if (!payment?.orderCode) return;
        const current = grouped.get(payment.orderCode) || [];
        current.push(payment);
        grouped.set(payment.orderCode, current);
    });

    const summaryMap = new Map();
    grouped.forEach((orderPayments, orderCode) => {
        const sorted = [...orderPayments].sort((a, b) => getPaymentTimestamp(b) - getPaymentTimestamp(a));
        summaryMap.set(orderCode, {
            latest: sorted[0] || null,
            byStage: Object.fromEntries(
                ['DEPOSIT', 'FULL', 'REMAINING'].map((stage) => [
                    stage,
                    sorted.find((payment) => payment.stage === stage) || null,
                ])
            ),
        });
    });

    return summaryMap;
};

const enrichOrdersWithPayments = (orders, payments) => {
    const paymentSummaryMap = buildPaymentSummaryMap(payments);

    return orders.map((order) => {
        const paymentSummary = paymentSummaryMap.get(order.orderCode);
        const latestPayment = paymentSummary?.latest || null;
        const remainingPayment = paymentSummary?.byStage?.REMAINING || null;
        const hasRemainingBalance = Number(order.remainingAmount) > 0;
        const remainingPaymentStatus = remainingPayment?.status || null;

        return {
            ...order,
            paymentMethod: order.paymentMethod || latestPayment?.method || (order.orderType === 'PRE_ORDER' ? 'VNPAY' : null),
            paymentStatus: order.paymentStatus || latestPayment?.status || null,
            remainingPaymentMethod: order.remainingPaymentMethod || (hasRemainingBalance ? (remainingPayment?.method || 'VNPAY') : null),
            remainingPaymentStatus: order.remainingPaymentStatus || remainingPaymentStatus,
        };
    });
};

const enrichOrdersWithDetails = async (orders) => {
    const items = Array.isArray(orders) ? orders : [];

    const enriched = await Promise.all(items.map(async (order) => {
        const needsDetail =
            order?.id
            && order?.orderType === 'PRE_ORDER'
            && Number(order?.remainingAmount) > 0
            && !isPreOrderRemainingOpen(order)
            && !isPreOrderRemainingPaid(order);

        if (!needsDetail) return order;

        try {
            const detailRes = await getCustomerOrderDetailAPI(order.id);
            const detail = normalizeOrder(detailRes);
            return {
                ...order,
                approvalStatus: detail?.approvalStatus ?? order?.approvalStatus,
                supportApprovedAt: detail?.supportApprovedAt ?? order?.supportApprovedAt,
                remainingPaymentOpen: detail?.remainingPaymentOpen ?? order?.remainingPaymentOpen,
                remainingPaymentOpenedAt: detail?.remainingPaymentOpenedAt ?? order?.remainingPaymentOpenedAt,
                remainingPaymentStatus: detail?.remainingPaymentStatus ?? order?.remainingPaymentStatus,
                operationConfirmedAt: detail?.operationConfirmedAt ?? order?.operationConfirmedAt,
                orderStatus: detail?.orderStatus || order?.orderStatus,
                shipmentStatus: detail?.shipmentStatus || order?.shipmentStatus,
                ghnOrderCode: detail?.ghnOrderCode || order?.ghnOrderCode,
            };
        } catch {
            return order;
        }
    }));

    return enriched;
};

const mergeOrderUpdate = (orders, updatedOrder) => {
    if (!updatedOrder?.id) return orders;
    return orders.map((order) => (order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order));
};

const getOrderDisplayPaymentMethod = (order) => {
    if (order.orderType === 'PRE_ORDER' && Number(order.remainingAmount) > 0) {
        return order.remainingPaymentMethod || 'VNPAY';
    }

    return order.paymentMethod || order.remainingPaymentMethod || 'Không có thông tin thanh toán';
};

const getShipmentLabel = (status) => {
    const normalizedStatus = normalizeShipmentStatus(status);
    if (!normalizedStatus) return 'Chưa có trạng thái giao vận';
    const labels = {
        WAITING_CONFIRM: 'Chờ tạo vận đơn',
        READY_TO_PICK: 'Chờ GHN lấy hàng',
        PICKING: 'Đang lấy hàng',
        PICKED: 'Đã nhận hàng',
        DELIVERING: 'Đang giao hàng',
        DELIVERED: 'Hoàn thành',
        FAILED: 'Giao hàng thất bại',
        CANCELLED: 'Đã hủy vận đơn',
        RETURNED: 'Đơn hoàn về'
    };
    return labels[normalizedStatus] || normalizedStatus;
};

const getRemainingPaymentMeta = (order) => {
    const isPreOrderDeposit = hasPreOrderRemainingBalance(order);

    if (!isPreOrderDeposit) return null;

    if (hasFinishedRemainingPayment(order)) {
        return {
            tone: 'done',
            title: 'Đã hoàn tất thanh toán pre-order',
            description: 'Đơn đã được thanh toán đủ và đang tiếp tục các bước giao vận.',
        };
    }

    if (canOpenRemainingPayment(order)) {
        return {
            tone: 'ready',
            title: 'Đã mở thanh toán phần còn lại',
            description: `Bạn có thể thanh toán ${formatVND(order.remainingAmount)} còn lại ngay bây giờ.`,
        };
    }

    if (order.orderStatus === 'PAID') {
        return {
            tone: 'waiting',
            title: isPreOrderSupportApproved(order) ? 'Đã mở thanh toán phần còn lại' : 'Đã ghi nhận thanh toán ban đầu',
            description: isPreOrderSupportApproved(order)
                ? `Support đã xác nhận đơn. Bạn có thể thanh toán ${formatVND(order.remainingAmount)} còn lại ngay bây giờ.`
                : 'Khách đã thanh toán tiền cọc. Đơn đang chờ support xác nhận trước khi mở bước thanh toán còn lại.',
        };
    }

    if (isPreOrderSupportApproved(order)) {
        return {
            tone: 'waiting',
            title: 'Đơn đã qua support',
            description: 'Đơn đang chờ backend chuyển sang bước tiếp theo. Nút thanh toán phần còn lại chỉ xuất hiện khi trạng thái đơn chuyển sang chờ thanh toán.',
        };
    }

    return {
        tone: 'waiting',
        title: 'Chờ mở thanh toán phần còn lại',
        description: 'Đơn pre-order vẫn đang ở bước trung gian. Khi BE chuyển đơn sang trạng thái thanh toán còn lại, nút thanh toán sẽ xuất hiện tại đây.',
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
            const [ordersRes, paymentsRes] = await Promise.all([
                getCustomerOrdersAPI(),
                getCustomerPaymentsAPI(),
            ]);
            const normalizedOrders = normalizeOrdersResponse(ordersRes).items;
            const hydratedOrders = await enrichOrdersWithDetails(normalizedOrders);
            const normalizedPayments = normalizePaymentsResponse(paymentsRes);
            setOrders(enrichOrdersWithPayments(hydratedOrders, normalizedPayments));
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
            let latestOrder = orders.find((order) => order.id === orderId) || null;

            try {
                const detailRes = await getCustomerOrderDetailAPI(orderId);
                const detail = normalizeOrder(detailRes);
                if (detail?.id) {
                    latestOrder = {
                        ...(latestOrder || {}),
                        ...detail,
                    };
                    setOrders((prev) => mergeOrderUpdate(prev, latestOrder));
                }
            } catch {
                // Keep the last successful snapshot if detail refresh fails.
            }

            if (latestOrder && !canOpenRemainingPayment(latestOrder)) {
                message.warning('Đơn này vẫn chưa được backend mở bước thanh toán phần còn lại.');
                return;
            }

            const res = await payRemainingOrderAPI(orderId);
            const paymentUrl = getRedirectUrl(res);
            if (paymentUrl) {
                window.location.href = paymentUrl;
                return;
            }
            message.success('Đã tạo yêu cầu thanh toán phần còn lại.');
            load();
        } catch (e) {
            const backendMessage = getErrorMessage(e, 'Không thể thanh toán phần còn lại');
            if (typeof backendMessage === 'string' && backendMessage.includes('Remaining payment is not opened yet')) {
                message.warning('BE chưa mở thanh toán phần còn lại cho đơn này. Hãy thử lại sau.');
            } else {
                message.error(backendMessage);
            }
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
                            const statusCfg = getOrderStatusMeta(order);
                            const canCancel = order.orderStatus === 'WAITING_CONFIRM';
                            const isReadyToPayRemaining = canOpenRemainingPayment(order);
                            const canAttemptPayRemaining =
                                hasPreOrderRemainingBalance(order)
                                && !['COMPLETED', 'CANCELLED'].includes(order.orderStatus)
                                && canOpenRemainingPayment(order);
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
                                            <span className="order-pay-method">{getOrderDisplayPaymentMethod(order)}</span>
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
                                            {canAttemptPayRemaining && (
                                                <button
                                                    className="pay-remaining-btn"
                                                    type="button"
                                                    onClick={() => handlePayRemaining(order.id)}
                                                    disabled={payingOrderId === order.id}
                                                >
                                                    {payingOrderId === order.id
                                                        ? 'Đang chuyển thanh toán...'
                                                        : (isReadyToPayRemaining ? 'Thanh toán phần còn lại' : 'Kiểm tra thanh toán phần còn lại')}
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
                                            <strong>{formatVND(order.displayDeposit ?? order.deposit)}</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Còn lại</span>
                                            <strong>{formatVND(order.displayRemaining ?? order.remainingAmount)}</strong>
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
