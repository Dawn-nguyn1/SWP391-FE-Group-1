import React, { useContext, useEffect, useState } from 'react';
import {
    Tag,
    Button,
    Popconfirm,
    message,
    Modal,
    Input,
    InputNumber,
    Empty,
    Pagination
} from 'antd';
import {
    SendOutlined,
    ReloadOutlined,
    LogoutOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import {
    getOperationOrdersAPI,
    getApprovedOrdersAPI,
    operationsConfirmOrderAPI,
    getOperationReturnRequestsAPI,
    operationReceiveReturnRequestAPI,
} from '../../services/api.service';
import './staff-operations.css';
import './staff-orders.css';
import '../customer-pages/orders.css';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth.context.jsx';
import {
    formatAddressText,
    normalizeOrdersResponse,
    normalizeReturnRequestsResponse,
    parseEvidenceUrls,
} from '../../utils/role-data';
import {
    hasPreOrderRemainingBalance,
    isPreOrderFullyPaidAfterSupport,
    isPreOrderReadyForOperation,
    isPreOrderRemainingOpen,
    isPreOrderRemainingPaid,
    isPreOrderWaitingSupport,
} from '../../utils/preorder-flow';

const formatVND = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const formatDateTime = (value) => {
    if (!value) return '—';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : '—';
};

const getFriendlyError = (error, fallback) =>
    error?.response?.data?.message || error?.message || error?.error || fallback;

const sortByNewest = (items = []) =>
    [...items].sort((a, b) => {
        const timeA = dayjs(a?.createdAt).isValid() ? dayjs(a.createdAt).valueOf() : 0;
        const timeB = dayjs(b?.createdAt).isValid() ? dayjs(b.createdAt).valueOf() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b?.id || 0) - (a?.id || 0);
    });

const CAN_SHIP_STATUSES = ['SUPPORT_CONFIRMED'];
const OPERATION_READY_QUEUE_SOURCE = 'approved_queue';
const ACTIVE_SHIPMENT_STATUSES = ['READY_TO_PICK', 'PICKING', 'PICKED', 'DELIVERING'];

const hasOutstandingPreorderBalance = (order) =>
    hasPreOrderRemainingBalance(order) && !isPreOrderRemainingPaid(order);

const hasSupportApproval = (order) =>
    order?.approvalStatus === 'SUPPORT_APPROVED'
    || order?.approvalStatus === 'OPERATION_CONFIRMED'
    || Boolean(order?.supportApprovedAt)
    || order?.queueSource === OPERATION_READY_QUEUE_SOURCE;

const hasCompletedInStockPayment = (order) =>
    order?.orderType === 'IN_STOCK'
    && Number(order?.remainingAmount || 0) <= 0
    && ['SUCCESS', 'PAID'].includes(order?.paymentStatus)
    && order?.paymentMethod !== 'COD';

const normalizeShipmentStatus = (status) =>
    typeof status === 'string' ? status.trim().toUpperCase() : status;

const hasShipmentCreated = (order) =>
    Boolean(order?.ghnOrderCode) || ACTIVE_SHIPMENT_STATUSES.includes(normalizeShipmentStatus(order?.shipmentStatus));

const getOrderStatusLabel = (status) => {
    const labels = {
        WAITING_CONFIRM: 'Chờ duyệt',
        SUPPORT_CONFIRMED: 'Sẵn sàng giao GHN',
        SHIPPING: 'Đang giao',
        COMPLETED: 'Hoàn tất',
        CANCELLED: 'Đã hủy',
        FAILED: 'Thất bại',
        PENDING_PAYMENT: 'Chờ thanh toán',
        PAID: 'Đã cọc / chờ bước tiếp theo',
        CONFIRMED: 'Đã xác nhận',
        OPERATION_CONFIRMED: 'Đã tạo vận đơn',
    };
    return labels[status] || status || '—';
};

const getOrderStatusMeta = (order) => {
    if (hasShipmentCreated(order)) {
        return { label: 'Đã giao GHN', className: 'status-confirmed' };
    }
    if (order?.orderType !== 'PRE_ORDER' && (hasSupportApproval(order) || hasCompletedInStockPayment(order))) {
        return { label: 'Sẵn sàng giao GHN', className: 'status-confirmed' };
    }
    if (isPreOrderFullyPaidAfterSupport(order)) {
        return { label: 'Đã thanh toán đủ - sẵn sàng giao GHN', className: 'status-confirmed' };
    }
    if (isPreOrderRemainingOpen(order)) {
        return { label: 'Đã mở thanh toán còn lại', className: 'status-pending' };
    }
    return {
        label: getOrderStatusLabel(order?.orderStatus),
        className: getOrderStatusClass(order?.orderStatus),
    };
};

const getOrderStatusClass = (status) => {
    if (CAN_SHIP_STATUSES.includes(status) || status === 'SHIPPING') return 'status-confirmed';
    if (status === 'COMPLETED') return 'status-completed';
    if (status === 'CANCELLED' || status === 'FAILED') return 'status-cancelled';
    return 'status-waiting';
};

const getShipmentLabel = (status) => {
    const normalizedStatus = normalizeShipmentStatus(status);
    if (!normalizedStatus) return 'Chưa tạo vận đơn';
    const labels = {
        WAITING_CONFIRM: 'Chờ tạo vận đơn',
        READY_TO_PICK: 'Chờ GHN lấy hàng',
        PICKING: 'Đang lấy hàng',
        PICKED: 'Đã nhận hàng',
        DELIVERING: 'Đang giao hàng',
        DELIVERED: 'Hoàn thành',
        FAILED: 'Giao thất bại',
        CANCELLED: 'Đã hủy vận đơn',
        RETURNED: 'Đơn hoàn về'
    };
    return labels[normalizedStatus] || normalizedStatus;
};

const getPaymentMethodLabel = (method) => {
    if (!method) return '—';
    if (method === 'VNPAY') return 'VNPAY';
    if (method === 'COD') return 'COD';
    if (method === 'BANKING') return 'Chuyển khoản';
    return method;
};

const getPaymentStatusLabel = (status) => {
    if (!status) return '—';
    const labels = {
        SUCCESS: 'Thành công',
        PAID: 'Đã thanh toán',
        UNPAID: 'Chưa thanh toán',
        CANCELLED: 'Đã hủy',
        FAILED: 'Thất bại',
        PENDING: 'Đang chờ'
    };
    return labels[status] || status;
};

const getReturnStatusLabel = (status) => {
    const labels = {
        WAITING_RETURN: 'Chờ nhận',
        RECEIVED: 'Đã nhận',
        REFUND_REQUESTED: 'Đã tạo yêu cầu hoàn tiền',
        REJECTED: 'Đã từ chối',
        SUBMITTED: 'Đã gửi',
    };
    return labels[status] || status || '—';
};

const getOrderTypeLabel = (type) => {
    if (type === 'PRE_ORDER') return 'Đặt trước';
    if (type === 'IN_STOCK') return 'Có sẵn';
    return type || '—';
};

const isOrderReadyForShipment = (order) =>
    !hasShipmentCreated(order)
    && ((order?.orderType !== 'PRE_ORDER' && ((hasSupportApproval(order) || hasCompletedInStockPayment(order))
        || order.queueSource === OPERATION_READY_QUEUE_SOURCE
        || CAN_SHIP_STATUSES.includes(order.orderStatus)))
    || isPreOrderReadyForOperation(order));

const getShipReadinessText = (order) => {
    if (hasShipmentCreated(order)) {
        return `Đơn đã có mã vận đơn ${order.ghnOrderCode || ''}. Theo dõi tiếp trạng thái GHN ở màn hình này.`;
    }
    if (order?.orderType !== 'PRE_ORDER' && (hasSupportApproval(order) || hasCompletedInStockPayment(order))) {
        return 'Đơn in-stock đã được support duyệt và có thể tạo vận đơn GHN ngay từ màn hình này.';
    }
    if (hasOutstandingPreorderBalance(order)) {
        if (isPreOrderWaitingSupport(order)) {
            return 'Đơn pre-order mới dừng ở bước thanh toán ban đầu. Support cần duyệt trước khi customer thanh toán phần còn lại.';
        }
        if (isPreOrderRemainingOpen(order)) {
            return 'Đơn đã mở bước thanh toán phần còn lại và đang chờ customer hoàn tất trước khi giao GHN.';
        }
        if (order.orderStatus === 'CONFIRMED') {
            return 'Đơn đã đủ điều kiện xử lý nhưng vẫn chưa hoàn tất bước support trước khi giao GHN.';
        }
    }

    if (isOrderReadyForShipment(order)) {
        return 'Đơn đã đủ điều kiện ở BE và có thể tạo vận đơn GHN từ màn hình này.';
    }
    if (order.orderStatus === 'SHIPPING') return 'Đơn đã có vận đơn và đang trong quá trình giao.';
    if (CAN_SHIP_STATUSES.includes(order.orderStatus)) return 'Đơn đã đủ điều kiện để tạo vận đơn GHN.';
    if (order.orderStatus === 'PENDING_PAYMENT') return 'Đơn đang chờ khách hoàn tất thanh toán trước khi giao.';
    return 'Đơn chưa sẵn sàng để tạo vận đơn.';
};

const getOperationsStageLabel = (order) => {
    if (hasShipmentCreated(order)) return getShipmentLabel(order?.shipmentStatus);
    if (order?.orderType !== 'PRE_ORDER' && (hasSupportApproval(order) || hasCompletedInStockPayment(order))) return 'Sẵn sàng giao GHN';
    if (isPreOrderWaitingSupport(order)) return 'Chờ support duyệt';
    if (isPreOrderRemainingOpen(order)) return 'Chờ thanh toán còn lại';
    if (isOrderReadyForShipment(order)) return 'Sẵn sàng giao GHN';
    if (order?.orderStatus === 'SHIPPING' || order?.orderStatus === 'OPERATION_CONFIRMED') return 'Đang giao vận';
    if (order?.orderStatus === 'COMPLETED') return 'Hoàn tất';
    return 'Chờ xử lý';
};

const OperationsOrdersPage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState('');
    const [ordersPage, setOrdersPage] = useState(1);
    const ordersPageSize = 6;

    const [returnRequests, setReturnRequests] = useState([]);
    const [returnLoading, setReturnLoading] = useState(true);
    const [returnsError, setReturnsError] = useState('');
    const [returnPage, setReturnPage] = useState(1);
    const returnPageSize = 5;

    const [actioning, setActioning] = useState(null);
    const [receiveModalOpen, setReceiveModalOpen] = useState(false);
    const [receiveTarget, setReceiveTarget] = useState(null);
    const [acceptedQuantity, setAcceptedQuantity] = useState(null);
    const [conditionNote, setConditionNote] = useState('');

    const loadOrders = async () => {
        setOrdersLoading(true);
        setOrdersError('');
        try {
            const [allOrdersRes, approvedOrdersRes] = await Promise.all([
                getOperationOrdersAPI(),
                getApprovedOrdersAPI(0, 500),
            ]);

            const { items: allOrders } = normalizeOrdersResponse(allOrdersRes);
            const { items: approvedOrders } = normalizeOrdersResponse(approvedOrdersRes);
            const approvedIds = new Set(approvedOrders.map((order) => order.id));

            const mergedOrders = allOrders.map((order) => ({
                ...order,
                queueSource: approvedIds.has(order.id) ? OPERATION_READY_QUEUE_SOURCE : 'all_orders',
            }));

            setOrders(sortByNewest(mergedOrders));
        } catch (error) {
            setOrders([]);
            setOrdersError(getFriendlyError(error, 'Không thể tải danh sách đơn vận hành.'));
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadReturnRequests = async () => {
        setReturnLoading(true);
        setReturnsError('');
        try {
            const res = await getOperationReturnRequestsAPI();
            const items = normalizeReturnRequestsResponse(res);
            setReturnRequests(sortByNewest(items));
            setReturnPage(1);
        } catch (error) {
            setReturnRequests([]);
            setReturnsError(getFriendlyError(error, 'Không thể tải queue hoàn trả chờ nhận.'));
        } finally {
            setReturnLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        loadReturnRequests();
    }, []);

    useEffect(() => {
        const maxPage = Math.max(Math.ceil(orders.length / ordersPageSize), 1);
        if (ordersPage > maxPage) {
            setOrdersPage(maxPage);
        }
    }, [orders.length, ordersPage]);

    const handleShip = async (orderId) => {
        setActioning(orderId);
        try {
            const res = await operationsConfirmOrderAPI(orderId);
            const ghnCode = res?.ghnOrderCode;
            message.success(ghnCode ? `Đã tạo vận đơn GHN: ${ghnCode}` : `Đã đẩy đơn #${orderId} sang GHN`);
            loadOrders();
        } catch (error) {
            const rawMessage = getFriendlyError(error, 'Không thể gửi đơn hàng');
            if (rawMessage.includes('Order not approved by support')) {
                message.error('Đơn này chưa thể tạo vận đơn từ giao diện hiện tại. Vui lòng tải lại danh sách đơn và thử lại.');
            } else if (rawMessage.includes('Online payment not completed')) {
                message.error('Đơn chưa hoàn tất thanh toán nên chưa thể tạo vận đơn.');
            } else {
                message.error('Không thể tạo vận đơn GHN lúc này.');
            }
        } finally {
            setActioning(null);
        }
    };

    const openReceiveModal = (record) => {
        setReceiveTarget(record);
        setAcceptedQuantity(record?.requestedQuantity ?? 1);
        setConditionNote('');
        setReceiveModalOpen(true);
    };

    const submitReceive = async () => {
        if (!receiveTarget) return;
        setActioning(receiveTarget.id);
        try {
            await operationReceiveReturnRequestAPI(receiveTarget.id, {
                acceptedQuantity: acceptedQuantity ?? receiveTarget.requestedQuantity ?? 1,
                conditionNote: conditionNote?.trim() || null
            });
            message.success(`Đã nhận hoàn trả #${receiveTarget.id}`);
            setReceiveModalOpen(false);
            loadReturnRequests();
        } catch (error) {
            message.error(getFriendlyError(error, 'Xác nhận nhận hàng thất bại'));
        } finally {
            setActioning(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        setUser({ id: '', email: '', profile: { fullName: '' }, role: '' });
        navigate('/login');
    };

    const readyOrders = orders.filter((order) => isOrderReadyForShipment(order));
    const shippingOrders = orders.filter((order) => order.orderStatus === 'SHIPPING');
    const completedOrders = orders.filter((order) => order.orderStatus === 'COMPLETED');
    const orderStart = (ordersPage - 1) * ordersPageSize;
    const orderItems = orders.slice(orderStart, orderStart + ordersPageSize);
    const orderPageCount = Math.max(Math.ceil(orders.length / ordersPageSize), 1);

    const totalReturns = returnRequests.length;
    const returnStart = (returnPage - 1) * returnPageSize;
    const returnItems = returnRequests.slice(returnStart, returnStart + returnPageSize);
    const returnPageCount = Math.max(Math.ceil(totalReturns / returnPageSize), 1);

    return (
        <div className="ops-shell">
            <div className="ops-topbar">
                <div className="ops-branding">
                    <p className="ops-label">Operations Desk</p>
                    <h1>Genetix Logistics Control</h1>
                    <span>Theo dõi đơn cần tạo vận đơn, tiến độ giao hàng và các yêu cầu hoàn trả đang chờ xử lý trong cùng một màn hình.</span>
                </div>
                <div className="ops-metrics">
                    <div className="metric-card">
                        <span>Tổng đơn</span>
                        <strong>{orders.length}</strong>
                    </div>
                    <div className="metric-card">
                        <span>Sẵn sàng giao</span>
                        <strong>{readyOrders.length}</strong>
                    </div>
                    <div className="metric-card">
                        <span>Đang giao</span>
                        <strong>{shippingOrders.length}</strong>
                    </div>
                    <div className="metric-card">
                        <span>Hoàn tất</span>
                        <strong>{completedOrders.length}</strong>
                    </div>
                    <div className="metric-card">
                        <span>Hoàn trả chờ nhận</span>
                        <strong>{totalReturns}</strong>
                    </div>
                    <div className="topbar-actions">
                        <div className="user-chip">
                            <div className="user-avatar">
                                {(user?.fullName || user?.email || user?.role || 'U').trim().slice(0, 1).toUpperCase()}
                            </div>
                            <div className="user-meta">
                                <span className="user-name">{user?.fullName || user?.email || 'Operation Staff'}</span>
                                <span className="user-role">{user?.role || 'OPERATION_STAFF'}</span>
                            </div>
                        </div>
                        <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                loadOrders();
                                loadReturnRequests();
                            }}
                            style={{ color: '#6b7280' }}
                            loading={ordersLoading || returnLoading}
                        />
                        <Button
                            type="default"
                            icon={<LogoutOutlined />}
                            className="btn-logout"
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </div>

            <div className="ops-grid">
                <section className="ops-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Đơn hàng vận hành</h2>
                            <p>Luồng mới: operations chỉ giao GHN sau khi đơn pre-order đã qua support và khách hoàn tất phần thanh toán còn lại.</p>
                        </div>
                        <div className="support-panel-meta">
                            <span className="queue-badge queue-orders">Đơn hàng</span>
                            <span className="queue-hint">Trang {ordersPage}/{orderPageCount}</span>
                        </div>
                    </div>

                    <div className="queue-toolbar ops-summary-grid">
                        <div className="queue-toolbar-item">
                            <span className="queue-toolbar-label">Sẵn sàng tạo vận đơn</span>
                            <strong>{readyOrders.length} đơn</strong>
                        </div>
                        <div className="queue-toolbar-item">
                            <span className="queue-toolbar-label">Đang giao</span>
                            <strong>{shippingOrders.length} đơn</strong>
                        </div>
                        <div className="queue-toolbar-item">
                            <span className="queue-toolbar-label">Hoàn tất</span>
                            <strong>{completedOrders.length} đơn</strong>
                        </div>
                        <div className="queue-toolbar-item">
                            <span className="queue-toolbar-label">Đang hiển thị</span>
                            <strong>{orderItems.length} / {orders.length} đơn</strong>
                        </div>
                    </div>

                    <div className="panel-body">
                        {ordersLoading ? (
                            <div className="orders-loading" style={{ minHeight: 240 }} />
                        ) : ordersError ? (
                            <div className="support-callout error">
                                <strong>Không tải được danh sách đơn vận hành</strong>
                                <span>{ordersError}</span>
                                <Button size="small" icon={<ReloadOutlined />} onClick={loadOrders}>
                                    Thử lại
                                </Button>
                            </div>
                        ) : orderItems.length === 0 ? (
                            <div className="orders-empty">
                                <Empty description={<span>Hiện chưa có đơn hàng nào cần theo dõi.</span>} />
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orderItems.map((order) => {
                                    const canShip = isOrderReadyForShipment(order);
                                    return (
                                        <div key={order.id || order.orderCode} className="order-card ops-order ops-order-rich">
                                            <div className="order-header">
                                                <div>
                                                    <span className="order-id">{order.orderCode || `Đơn #${order.id}`}</span>
                                                    <span className="order-date">{formatDateTime(order.createdAt)}</span>
                                                </div>
                                                <div className="order-header-right">
                                                    <Tag className={getOrderStatusMeta(order).className} icon={<CheckCircleOutlined />}>
                                                        {getOrderStatusMeta(order).label}
                                                    </Tag>
                                                    <span className="order-pay-method">{getOrderTypeLabel(order.orderType)}</span>
                                                </div>
                                            </div>

                                            <div className="order-info ops-order-grid">
                                                <div className="info-row">
                                                    <span className="info-label">Mã đơn nội bộ</span>
                                                    <span className="info-value">#{order.id || '—'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Người nhận</span>
                                                    <span className="info-value">{order.receiverName || '—'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">SĐT</span>
                                                    <span className="info-value">{order.receiverPhone || '—'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Phương thức thanh toán</span>
                                                    <span className="info-value">{getPaymentMethodLabel(order.paymentMethod)}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Trạng thái thanh toán</span>
                                                    <span className="info-value">{getPaymentStatusLabel(order.paymentStatus)}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Trạng thái GHN</span>
                                                    <span className="info-value">{getShipmentLabel(order.shipmentStatus)}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Mã vận đơn</span>
                                                    <span className="info-value tracking-code">{order.ghnOrderCode || 'Chưa tạo vận đơn'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Tổng tiền</span>
                                                    <span className="info-value">{formatVND(order.totalAmount)}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Đặt cọc</span>
                                                    <span className="info-value">{formatVND(order.displayDeposit ?? order.deposit)}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Còn lại</span>
                                                    <span className="info-value">{formatVND(order.displayRemaining ?? order.remainingAmount)}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Chặng xử lý</span>
                                                    <span className="info-value">{getOperationsStageLabel(order)}</span>
                                                </div>
                                                <div className="info-row full">
                                                    <span className="info-label">Địa chỉ giao</span>
                                                    <span className="info-value">{formatAddressText(order.address)}</span>
                                                </div>
                                            </div>

                                            <div className="order-footer">
                                                <div className="ops-actions">
                                                    <span className="ops-order-note">{getShipReadinessText(order)}</span>
                                                    {canShip ? (
                                                        <Popconfirm
                                                            title="Xác nhận giao qua GHN?"
                                                            description="Hệ thống sẽ tạo vận đơn và chuyển đơn sang trạng thái đang giao."
                                                            onConfirm={() => handleShip(order.id)}
                                                            okText="Giao GHN"
                                                            cancelText="Huỷ"
                                                        >
                                                            <Button
                                                                type="primary"
                                                                size="small"
                                                                icon={<SendOutlined />}
                                                                loading={actioning === order.id}
                                                                className="btn-confirm"
                                                            >
                                                                Giao GHN
                                                            </Button>
                                                        </Popconfirm>
                                                    ) : (
                                                        <span className="order-action-muted">Chưa thể tạo vận đơn</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {!ordersLoading && orders.length > ordersPageSize && (
                        <div className="support-pagination">
                            <Pagination
                                current={ordersPage}
                                pageSize={ordersPageSize}
                                total={orders.length}
                                onChange={(page) => setOrdersPage(page)}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </section>

                <section className="ops-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Hoàn trả chờ nhận</h2>
                            <p>Theo dõi các yêu cầu hoàn trả đã được duyệt và xác nhận tình trạng hàng khi kho tiếp nhận.</p>
                        </div>
                        <div className="support-panel-meta">
                            <span className="queue-badge queue-returns">Hoàn trả</span>
                            <span className="queue-hint">Trang {returnPage}/{returnPageCount}</span>
                        </div>
                    </div>

                    <div className="queue-toolbar ops-summary-grid">
                        <div className="queue-toolbar-item">
                            <span className="queue-toolbar-label">Chờ tiếp nhận</span>
                            <strong>{totalReturns} yêu cầu</strong>
                        </div>
                        <div className="queue-toolbar-item">
                            <span className="queue-toolbar-label">Đang hiển thị</span>
                            <strong>{returnItems.length} yêu cầu</strong>
                        </div>
                        <div className="queue-toolbar-item">
                            <span className="queue-toolbar-label">Đã duyệt bởi</span>
                            <strong>Support staff</strong>
                        </div>
                        <div className="queue-toolbar-item">
                            <span className="queue-toolbar-label">Hành động</span>
                            <strong>Xác nhận đã nhận hàng</strong>
                        </div>
                    </div>

                    <div className="panel-body">
                        {returnLoading ? (
                            <div className="orders-loading" style={{ minHeight: 240 }} />
                        ) : returnsError ? (
                            <div className="support-callout error">
                                <strong>Không tải được queue hoàn trả</strong>
                                <span>{returnsError}</span>
                                <Button size="small" icon={<ReloadOutlined />} onClick={loadReturnRequests}>
                                    Thử lại
                                </Button>
                            </div>
                        ) : returnItems.length === 0 ? (
                            <div className="orders-empty">
                                <Empty description={<span>Hiện chưa có yêu cầu hoàn trả chờ nhận.</span>} />
                            </div>
                        ) : (
                            <div className="returns-list">
                                {returnItems.map((req) => {
                                    const evidences = parseEvidenceUrls(req.evidenceUrls);
                                    const canReceive = req.status === 'WAITING_RETURN' && !req.receivedByUserId;
                                    return (
                                        <div key={req.id} className="return-card ops-return-rich">
                                            <div className="return-header">
                                                <div>
                                                    <span className="return-id">RR-{req.id}</span>
                                                    <span className="return-date">{formatDateTime(req.createdAt)}</span>
                                                </div>
                                                <Tag className="status-waiting">{getReturnStatusLabel(req.status)}</Tag>
                                            </div>

                                            <div className="return-meta ops-return-grid">
                                                <div className="meta-item">
                                                    <span className="meta-label">Số lượng yêu cầu</span>
                                                    <span className="meta-value">{req.requestedQuantity ?? '—'}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Lý do</span>
                                                    <span className="meta-value">{req.reason || '—'}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Duyệt bởi</span>
                                                    <span className="meta-value">{req.approvedByUserId ?? '—'}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Duyệt lúc</span>
                                                    <span className="meta-value">{formatDateTime(req.approvedAt)}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Nhận bởi</span>
                                                    <span className="meta-value">{req.receivedByUserId ?? '—'}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Nhận lúc</span>
                                                    <span className="meta-value">{formatDateTime(req.receivedAt)}</span>
                                                </div>
                                                <div className="meta-item full">
                                                    <span className="meta-label">Cập nhật gần nhất</span>
                                                    <span className="meta-value">{formatDateTime(req.updatedAt)}</span>
                                                </div>
                                            </div>

                                            {req.note && (
                                                <div className="return-evidence">
                                                    <span>Ghi chú khách:</span>
                                                    <div>{req.note}</div>
                                                </div>
                                            )}

                                            {evidences.length > 0 && (
                                                <div className="return-evidence">
                                                    <span>Minh chứng:</span>
                                                    <ul>
                                                        {evidences.slice(0, 4).map((url, idx) => (
                                                            <li key={`${req.id}-ev-${idx}`}>{url}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="return-actions">
                                                <span className="ops-order-note">Kiểm tra tình trạng thực tế của sản phẩm trước khi xác nhận nhập kho hoàn trả.</span>
                                                {canReceive ? (
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<CheckCircleOutlined />}
                                                        className="btn-confirm"
                                                        loading={actioning === req.id}
                                                        onClick={() => openReceiveModal(req)}
                                                    >
                                                        Đã nhận
                                                    </Button>
                                                ) : (
                                                    <span className="order-action-muted">Yêu cầu này đã được xử lý</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {!returnLoading && totalReturns > returnPageSize && (
                        <div className="support-pagination">
                            <Pagination
                                current={returnPage}
                                pageSize={returnPageSize}
                                total={totalReturns}
                                onChange={(page) => setReturnPage(page)}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </section>
            </div>

            <Modal
                title={receiveTarget ? `Xác nhận nhận hoàn trả #${receiveTarget.id}` : 'Xác nhận nhận hoàn trả'}
                open={receiveModalOpen}
                onCancel={() => setReceiveModalOpen(false)}
                onOk={submitReceive}
                okText="Xác nhận"
                cancelText="Huỷ"
                okButtonProps={{ loading: actioning === receiveTarget?.id }}
            >
                <div className="receive-form">
                    <div className="receive-field">
                        <span>Số lượng nhận</span>
                        <InputNumber
                            min={1}
                            value={acceptedQuantity}
                            onChange={(val) => setAcceptedQuantity(val)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="receive-field">
                        <span>Ghi chú tình trạng</span>
                        <Input.TextArea
                            rows={3}
                            value={conditionNote}
                            onChange={(e) => setConditionNote(e.target.value)}
                            placeholder="Ví dụ: Hàng nguyên tem, đủ phụ kiện."
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default OperationsOrdersPage;
