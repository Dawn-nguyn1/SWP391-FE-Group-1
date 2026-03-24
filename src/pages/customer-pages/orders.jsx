import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, Input, Modal, Pagination, Popconfirm, Spin, Tag, Tooltip, message } from 'antd';
import {
    cancelOrderByCustomerAPI,
    createCustomerReturnRequestAPI,
    getCustomerOrderDetailAPI,
    getCustomerOrdersAPI,
    getCustomerPaymentsAPI,
    getCustomerRefundRequestsByOrderAPI,
    getCustomerReturnRequestsAPI,
    payRemainingOrderAPI,
} from '../../services/api.service';
import {
    formatAddressText,
    normalizeOrder,
    normalizeOrdersResponse,
    normalizePaymentsResponse,
    normalizeRefundRequestsResponse,
    normalizeReturnRequestsResponse,
} from '../../utils/role-data';
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
    PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'gold' },
    WAITING_CONFIRM: { label: 'Chờ xác nhận', color: 'orange' },
    PAID: { label: 'Đã thanh toán', color: 'blue' },
    SUPPORT_CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
    OPERATION_CONFIRMED: { label: 'Đã tạo vận đơn', color: 'cyan' },
    SHIPPING: { label: 'Đang giao hàng', color: 'cyan' },
    COMPLETED: { label: 'Hoàn thành', color: 'green' },
    CANCELLED: { label: 'Đã hủy', color: 'red' },
    RETURNED: { label: 'Hoàn trả', color: 'volcano' },
    FAILED: { label: 'Thất bại', color: 'red' },
};

const SHIPMENT_STATUS_CONFIG = {
    WAITING_CONFIRM: { label: 'Chờ tạo vận đơn', color: 'default' },
    READY_TO_PICK: { label: 'Chờ GHN lấy hàng', color: 'blue' },
    PICKING: { label: 'Đang lấy hàng', color: 'blue' },
    PICKED: { label: 'Đã lấy hàng', color: 'cyan' },
    DELIVERING: { label: 'Đang giao hàng', color: 'cyan' },
    DELIVERED: { label: 'Đã giao hàng', color: 'green' },
    FAILED: { label: 'Giao hàng thất bại', color: 'red' },
    CANCELLED: { label: 'Đã hủy', color: 'red' },
    RETURNED: { label: 'Đơn hoàn về', color: 'volcano' },
};

const RETURN_REASON_OPTIONS = [
    ['DEFECTIVE', 'Sản phẩm lỗi'],
    ['WRONG_ITEM', 'Giao sai sản phẩm'],
    ['DAMAGED', 'Sản phẩm hư hỏng'],
    ['MISSING_PART', 'Thiếu phụ kiện'],
    ['OTHER', 'Lý do khác'],
];

const RETURN_STATUS_META = {
    SUBMITTED: ['Đã gửi, chờ support duyệt', 'pending'],
    WAITING_RETURN: ['Đã duyệt, chờ trả hàng về', 'ready'],
    RECEIVED: ['Kho đã nhận hàng', 'info'],
    REFUND_REQUESTED: ['Đã tạo yêu cầu hoàn tiền', 'done'],
    REJECTED: ['Bị từ chối', 'danger'],
    CANCELLED: ['Đã hủy', 'danger'],
};

const REFUND_STATUS_META = {
    REQUESTED: ['Chờ xử lý hoàn tiền', 'pending'],
    APPROVED: ['Đã duyệt hoàn tiền', 'info'],
    DONE: ['Đã hoàn tiền', 'done'],
    REJECTED: ['Yêu cầu hoàn tiền bị từ chối', 'danger'],
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

    if (shipmentStatus && SHIPMENT_STATUS_CONFIG[shipmentStatus]) return SHIPMENT_STATUS_CONFIG[shipmentStatus];
    if (order?.orderType !== 'PRE_ORDER' && hasSupportApproval(order)) return { label: 'Đã xác nhận - chờ giao GHN', color: 'cyan' };
    if (isPreOrderFullyPaidAfterSupport(order)) return { label: 'Đã thanh toán đủ - chờ giao GHN', color: 'green' };
    if (canOpenRemainingPayment(order)) return { label: 'Đã về hàng - chờ thanh toán còn lại', color: 'gold' };
    if (isPreOrderWaitingSupport(order)) return { label: 'Đã thanh toán cọc - chờ support duyệt', color: 'blue' };
    return STATUS_CONFIG[order?.orderStatus] || { label: order?.orderStatus || '-', color: 'default' };
};

const formatVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const formatDate = (d) => (d ? new Date(d).toLocaleString('vi-VN') : 'Backend chưa trả ngày');

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
            byStage: Object.fromEntries(['DEPOSIT', 'FULL', 'REMAINING'].map((stage) => [
                stage,
                sorted.find((payment) => payment.stage === stage) || null,
            ])),
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
        return {
            ...order,
            paymentMethod: order.paymentMethod || latestPayment?.method || (order.orderType === 'PRE_ORDER' ? 'VNPAY' : null),
            paymentStatus: order.paymentStatus || latestPayment?.status || null,
            remainingPaymentMethod: order.remainingPaymentMethod || (hasRemainingBalance ? (remainingPayment?.method || 'VNPAY') : null),
            remainingPaymentStatus: order.remainingPaymentStatus || remainingPayment?.status || null,
        };
    });
};

const enrichOrdersWithDetails = async (orders) => Promise.all((Array.isArray(orders) ? orders : []).map(async (order) => {
    const needsDetail =
        order?.id
        && order?.orderType === 'PRE_ORDER'
        && Number(order?.remainingAmount) > 0
        && !isPreOrderRemainingOpen(order)
        && !isPreOrderRemainingPaid(order);
    if (!needsDetail) return order;
    try {
        const detail = normalizeOrder(await getCustomerOrderDetailAPI(order.id));
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

const mergeOrderUpdate = (orders, updatedOrder) =>
    (!updatedOrder?.id ? orders : orders.map((order) => (order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order)));

const getOrderDisplayPaymentMethod = (order) =>
    (order.orderType === 'PRE_ORDER' && Number(order.remainingAmount) > 0)
        ? (order.remainingPaymentMethod || 'VNPAY')
        : (order.paymentMethod || order.remainingPaymentMethod || 'Không có thông tin thanh toán');

const getShipmentLabel = (status) => {
    const normalizedStatus = normalizeShipmentStatus(status);
    if (!normalizedStatus) return 'Chưa có trạng thái giao vận';
    const labels = {
        WAITING_CONFIRM: 'Chờ tạo vận đơn',
        READY_TO_PICK: 'Chờ GHN lấy hàng',
        PICKING: 'Đang lấy hàng',
        PICKED: 'Đã lấy hàng',
        DELIVERING: 'Đang giao hàng',
        DELIVERED: 'Hoàn thành',
        FAILED: 'Giao hàng thất bại',
        CANCELLED: 'Đã hủy vận đơn',
        RETURNED: 'Đơn hoàn về',
    };
    return labels[normalizedStatus] || normalizedStatus;
};

const getRemainingPaymentMeta = (order) => {
    if (!hasPreOrderRemainingBalance(order)) return null;
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
            description: 'Đơn đang chờ backend chuyển sang bước tiếp theo. Nút thanh toán phần còn lại chỉ xuất hiện khi đơn chuyển sang chờ thanh toán.',
        };
    }
    return {
        tone: 'waiting',
        title: 'Chờ mở thanh toán phần còn lại',
        description: 'Đơn pre-order vẫn đang ở bước trung gian. Khi backend chuyển đơn sang trạng thái thanh toán còn lại, nút thanh toán sẽ xuất hiện tại đây.',
    };
};

const getReturnStatusMeta = (status) => {
    const [label, tone] = RETURN_STATUS_META[status] || [status || '-', 'info'];
    return { label, tone };
};

const getRefundStatusMeta = (status) => {
    const [label, tone] = REFUND_STATUS_META[status] || [status || '-', 'info'];
    return { label, tone };
};

const getItemDisplayName = (item) =>
    [item?.productName, item?.variantName].filter(Boolean).join(' - ') || `Item #${item?.id || '-'}`;

const hasActiveReturnForItem = (itemId, returnRequests) =>
    returnRequests.some((request) =>
        request.orderItemId === itemId
        && ['SUBMITTED', 'WAITING_RETURN', 'RECEIVED', 'REFUND_REQUESTED'].includes(request.status)
    );

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingOrderId, setPayingOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [complaintModalOpen, setComplaintModalOpen] = useState(false);
    const [complaintLoading, setComplaintLoading] = useState(false);
    const [complaintSubmitting, setComplaintSubmitting] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderReturnRequests, setOrderReturnRequests] = useState([]);
    const [orderRefundRequests, setOrderRefundRequests] = useState([]);
    const [complaintForm, setComplaintForm] = useState({
        orderItemId: '',
        quantity: 1,
        reason: 'DEFECTIVE',
        note: '',
        evidenceText: '',
    });
    const pageSize = 5;

    const load = async () => {
        try {
            setLoading(true);
            const [ordersRes, paymentsRes] = await Promise.all([getCustomerOrdersAPI(), getCustomerPaymentsAPI()]);
            const normalizedOrders = normalizeOrdersResponse(ordersRes).items;
            const hydratedOrders = await enrichOrdersWithDetails(normalizedOrders);
            setOrders(enrichOrdersWithPayments(hydratedOrders, normalizePaymentsResponse(paymentsRes)));
        } catch {
            message.error('Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const loadComplaintContext = async (orderId) => {
        setComplaintLoading(true);
        try {
            const [detailRes, returnRes, refundRes] = await Promise.all([
                getCustomerOrderDetailAPI(orderId),
                getCustomerReturnRequestsAPI(),
                getCustomerRefundRequestsByOrderAPI(orderId),
            ]);
            const detail = normalizeOrder(detailRes);
            const currentReturnRequests = normalizeReturnRequestsResponse(returnRes).filter((request) => request.orderId === orderId);
            const currentRefundRequests = normalizeRefundRequestsResponse(refundRes);
            const firstAvailableItem = (detail.items || []).find((item) => !hasActiveReturnForItem(item.id, currentReturnRequests));

            setSelectedOrder(detail);
            setOrderReturnRequests(currentReturnRequests);
            setOrderRefundRequests(currentRefundRequests);
            setComplaintForm({
                orderItemId: firstAvailableItem?.id ? String(firstAvailableItem.id) : '',
                quantity: 1,
                reason: 'DEFECTIVE',
                note: '',
                evidenceText: '',
            });
            setOrders((prev) => mergeOrderUpdate(prev, detail));
        } catch (error) {
            message.error(getErrorMessage(error, 'Không thể tải thông tin khiếu nại'));
        } finally {
            setComplaintLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [orders.length, currentPage, pageSize]);

    const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleCancel = async (orderId) => {
        try {
            await cancelOrderByCustomerAPI(orderId);
            message.success('Đã hủy đơn hàng');
            load();
        } catch (e) {
            message.error(e?.response?.data?.message || 'Không thể hủy đơn');
        }
    };

    const handlePayRemaining = async (orderId) => {
        try {
            setPayingOrderId(orderId);
            let latestOrder = orders.find((order) => order.id === orderId) || null;
            try {
                const detail = normalizeOrder(await getCustomerOrderDetailAPI(orderId));
                if (detail?.id) {
                    latestOrder = { ...(latestOrder || {}), ...detail };
                    setOrders((prev) => mergeOrderUpdate(prev, latestOrder));
                }
            } catch {
                // Keep the latest client snapshot if refresh fails.
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
                message.warning('Backend chưa mở thanh toán phần còn lại cho đơn này. Hãy thử lại sau.');
            } else {
                message.error(backendMessage);
            }
        } finally {
            setPayingOrderId(null);
        }
    };

    const openComplaintModal = async (orderId) => {
        setComplaintModalOpen(true);
        await loadComplaintContext(orderId);
    };

    const closeComplaintModal = () => {
        setComplaintModalOpen(false);
        setSelectedOrder(null);
        setOrderReturnRequests([]);
        setOrderRefundRequests([]);
    };

    const submitComplaint = async () => {
        if (!selectedOrder?.id) return;
        if (!complaintForm.orderItemId) {
            message.warning('Hãy chọn sản phẩm cần khiếu nại.');
            return;
        }

        const evidenceUrls = complaintForm.evidenceText
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);

        setComplaintSubmitting(true);
        try {
            await createCustomerReturnRequestAPI({
                orderItemId: Number(complaintForm.orderItemId),
                quantity: Number(complaintForm.quantity) || 1,
                reason: complaintForm.reason,
                note: complaintForm.note.trim() || null,
                evidenceUrls: evidenceUrls.length ? JSON.stringify(evidenceUrls) : null,
            });
            message.success('Đã gửi yêu cầu trả hàng.');
            await loadComplaintContext(selectedOrder.id);
        } catch (error) {
            message.error(getErrorMessage(error, 'Không thể gửi yêu cầu trả hàng'));
        } finally {
            setComplaintSubmitting(false);
        }
    };

    const selectedItem = (selectedOrder?.items || []).find((item) => String(item.id) === String(complaintForm.orderItemId));
    const selectedItemMaxQty = Math.max(Number(selectedItem?.quantity || 1), 1);

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
                            {paginatedOrders.map((order) => {
                                const statusCfg = getOrderStatusMeta(order);
                                const canCancel = order.orderStatus === 'WAITING_CONFIRM';
                                const canOpenComplaint = order.orderStatus === 'COMPLETED';
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
                                                    <span className="order-type">{order.orderType || '-'}</span>
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
                                                <strong>{order.receiverName || '-'}</strong>
                                            </div>
                                            <div className="info-block">
                                                <span>Số điện thoại</span>
                                                <strong>{order.receiverPhone || '-'}</strong>
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
                                                        {payingOrderId === order.id ? 'Đang chuyển thanh toán...' : (isReadyToPayRemaining ? 'Thanh toán phần còn lại' : 'Kiểm tra thanh toán phần còn lại')}
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
                                            <div className="order-inline-actions">
                                                <button className="secondary-action-btn" type="button" onClick={() => openComplaintModal(order.id)}>
                                                    {canOpenComplaint ? 'Khiếu nại / trả hàng' : 'Xem tiến độ hoàn trả'}
                                                </button>
                                                {canCancel ? (
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
                                                ) : (
                                                    <Tooltip title="Không thể hủy ở trạng thái hiện tại">
                                                        <span className="cancel-disabled">Không thể hủy</span>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {orders.length > pageSize && (
                            <div className="orders-pagination">
                                <Pagination current={currentPage} pageSize={pageSize} total={orders.length} onChange={setCurrentPage} showSizeChanger={false} />
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal
                title={selectedOrder ? `Xử lý khiếu nại đơn #${selectedOrder.orderCode || selectedOrder.id}` : 'Xử lý khiếu nại'}
                open={complaintModalOpen}
                onCancel={closeComplaintModal}
                footer={null}
                width={980}
                destroyOnClose
            >
                {complaintLoading ? (
                    <div className="orders-loading" style={{ minHeight: 240 }}><Spin size="large" /></div>
                ) : !selectedOrder ? (
                    <Empty description="Không có dữ liệu khiếu nại" />
                ) : (
                    <div className="complaint-modal">
                        <div className="complaint-overview">
                            <div className="complaint-overview-card"><span>Trạng thái đơn</span><strong>{getOrderStatusMeta(selectedOrder).label}</strong></div>
                            <div className="complaint-overview-card"><span>Giao vận</span><strong>{getShipmentLabel(selectedOrder.shipmentStatus)}</strong></div>
                            <div className="complaint-overview-card"><span>Tổng thanh toán</span><strong>{formatVND(selectedOrder.totalAmount)}</strong></div>
                        </div>

                        <div className="complaint-section">
                            <div className="complaint-section-header">
                                <h3>Gửi yêu cầu trả hàng</h3>
                                <p>Chỉ cho phép tạo yêu cầu đổi trả với đơn đã hoàn thành và chỉ xử lý một lần.</p>
                            </div>
                            {selectedOrder.orderStatus !== 'COMPLETED' ? (
                                <div className="complaint-callout">
                                    Chỉ đơn đã hoàn thành mới được tạo yêu cầu trả hàng. Bạn vẫn có thể theo dõi các yêu cầu cũ ở phần bên dưới.
                                </div>
                            ) : (
                                <div className="complaint-form-grid">
                                    <label className="complaint-field">
                                        <span>Sản phẩm</span>
                                        <select value={complaintForm.orderItemId} onChange={(e) => setComplaintForm((prev) => ({ ...prev, orderItemId: e.target.value, quantity: 1 }))}>
                                            <option value="">Chọn sản phẩm</option>
                                            {(selectedOrder.items || []).map((item) => {
                                                const disabled = hasActiveReturnForItem(item.id, orderReturnRequests);
                                                return <option key={item.id} value={item.id} disabled={disabled}>{getItemDisplayName(item)} x{item.quantity}{disabled ? ' - đang có yêu cầu' : ''}</option>;
                                            })}
                                        </select>
                                    </label>
                                    <label className="complaint-field">
                                        <span>Số lượng</span>
                                        <input type="number" min="1" max={selectedItemMaxQty} value={complaintForm.quantity} onChange={(e) => {
                                            const nextValue = Number(e.target.value) || 1;
                                            setComplaintForm((prev) => ({ ...prev, quantity: Math.min(Math.max(nextValue, 1), selectedItemMaxQty) }));
                                        }} />
                                    </label>
                                    <label className="complaint-field">
                                        <span>Lý do</span>
                                        <select value={complaintForm.reason} onChange={(e) => setComplaintForm((prev) => ({ ...prev, reason: e.target.value }))}>
                                            {RETURN_REASON_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                        </select>
                                    </label>
                                    <label className="complaint-field full">
                                        <span>Mô tả</span>
                                        <Input.TextArea rows={3} value={complaintForm.note} onChange={(e) => setComplaintForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Mô tả tình trạng sản phẩm và lý do cần hỗ trợ." />
                                    </label>
                                    <label className="complaint-field full">
                                        <span>Bằng chứng</span>
                                        <Input.TextArea rows={3} value={complaintForm.evidenceText} onChange={(e) => setComplaintForm((prev) => ({ ...prev, evidenceText: e.target.value }))} placeholder="Mỗi dòng hoặc mỗi dấu phẩy là một URL ảnh/video." />
                                    </label>
                                    <div className="complaint-field full complaint-actions">
                                        <button className="pay-remaining-btn" type="button" onClick={submitComplaint} disabled={complaintSubmitting}>
                                            {complaintSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu trả hàng'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="complaint-section">
                            <div className="complaint-section-header">
                                <h3>Tiến độ trả hàng</h3>
                                <p>Support duyệt, operations nhận hàng, sau đó sẽ hoàn tiền.</p>
                            </div>
                            {orderReturnRequests.length === 0 ? (
                                <div className="complaint-empty-box">Chưa có yêu cầu trả hàng.</div>
                            ) : (
                                <div className="complaint-history-list">
                                    {orderReturnRequests.map((request) => {
                                        const meta = getReturnStatusMeta(request.status);
                                        const linkedRefunds = orderRefundRequests.filter((refund) => refund.orderId === request.orderId);
                                        return (
                                            <div key={request.id} className="complaint-history-card">
                                                <div className="complaint-history-head">
                                                    <div><strong>Yêu cầu trả hàng #{request.id}</strong><span>{formatDate(request.createdAt)}</span></div>
                                                    <span className={`complaint-status-pill ${meta.tone}`}>{meta.label}</span>
                                                </div>
                                                <div className="complaint-history-grid">
                                                    <div><span>Order item</span><strong>#{request.orderItemId || '-'}</strong></div>
                                                    <div><span>Số lượng yêu cầu</span><strong>{request.requestedQuantity || '-'}</strong></div>
                                                    <div><span>Số lượng nhận</span><strong>{request.acceptedQuantity ?? '-'}</strong></div>
                                                    <div><span>Lý do</span><strong>{request.reason || '-'}</strong></div>
                                                </div>
                                                {request.note && <div className="complaint-note-box">{request.note}</div>}
                                                {request.evidenceUrls?.length > 0 && (
                                                    <div className="complaint-evidence-box">
                                                        <span>Bằng chứng:</span>
                                                        <ul>
                                                            {request.evidenceUrls.map((url, index) => <li key={`${request.id}-${index}`}><a href={url} target="_blank" rel="noreferrer">{url}</a></li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                                {linkedRefunds.length > 0 && (
                                                    <div className="complaint-refund-stack">
                                                        {linkedRefunds.map((refund) => {
                                                            const refundMeta = getRefundStatusMeta(refund.status);
                                                            return (
                                                                <div key={refund.id} className="complaint-refund-row">
                                                                    <div><strong>Yêu cầu hoàn tiền #{refund.id}</strong><p>{formatVND(refund.refundAmount)} - {refund.policy || '-'}</p></div>
                                                                    <span className={`complaint-status-pill ${refundMeta.tone}`}>{refundMeta.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrdersPage;


