import React, { useEffect, useState, useContext } from 'react';
import {
    Tag,
    Button,
    Popconfirm,
    message,
    Modal,
    Descriptions,
    Space,
    Tooltip,
    Empty,
    Pagination,
    Input
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    ReloadOutlined,
    InboxOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import {
    getSupportOrdersAPI,
    supportConfirmOrderAPI,
    supportCancelOrderAPI,
    getSupportReturnRequestsAPI,
    supportApproveReturnRequestAPI,
    supportRejectReturnRequestAPI
} from '../../services/api.service';
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

const formatVND = n =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const SupportOrdersPage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [ordersTotal, setOrdersTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const [returnRequests, setReturnRequests] = useState([]);
    const [returnLoading, setReturnLoading] = useState(true);
    const [returnActioning, setReturnActioning] = useState(null);
    const [returnPage, setReturnPage] = useState(1);
    const returnPageSize = 6;

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [rejectTarget, setRejectTarget] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState('SHOP_CANNOT_SUPPLY');
    const [cancelNote, setCancelNote] = useState('');

    const applyReturnRequests = (items) => {
        setReturnRequests(items);
        setReturnPage(1);
    };

    const loadOrders = async (page = currentPage) => {
        setLoading(true);
        try {
            const res = await getSupportOrdersAPI(page - 1, pageSize);
            const { items, total } = normalizeOrdersResponse(res);
            setOrders(items);
            setOrdersTotal(total);
        } catch (err) {
            console.error('[Genetix] loadOrders error:', err);
            message.error('Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const loadReturnRequests = async () => {
        setReturnLoading(true);
        try {
            const res = await getSupportReturnRequestsAPI();
            const items = normalizeReturnRequestsResponse(res);
            applyReturnRequests(items);
        } catch (err) {
            console.error('[Genetix] loadReturnRequests error:', err);
            message.error('Không thể tải yêu cầu trả hàng');
        } finally {
            setReturnLoading(false);
        }
    };

    useEffect(() => {
        loadOrders(1);
        loadReturnRequests();
    }, []);

    const handleAction = async (orderId, actionAPI, successMsg) => {
        setActioning(orderId);
        try {
            await actionAPI(orderId);
            message.success(successMsg);
            loadOrders();
        } catch {
            message.error('Thao tác thất bại');
        } finally {
            setActioning(null);
        }
    };

    const handleReturnAction = async (id, actionAPI, successMsg) => {
        setReturnActioning(id);
        try {
            await actionAPI(id);
            message.success(successMsg);
            loadReturnRequests();
        } catch {
            message.error('Thao tác thất bại');
        } finally {
            setReturnActioning(null);
        }
    };

    const viewOrderDetails = (record) => {
        setSelectedOrder(record);
        setIsModalVisible(true);
    };

    const openCancelModal = (record) => {
        setCancelTarget(record);
        setCancelReason('SHOP_CANNOT_SUPPLY');
        setCancelNote('');
        setIsCancelModalOpen(true);
    };

    const submitCancel = async () => {
        if (!cancelTarget) return;
        setActioning(cancelTarget.id);
        try {
            await supportCancelOrderAPI(cancelTarget.id, {
                reason: cancelReason,
                note: cancelNote.trim() || null,
            });
            message.success(`Đã hủy đơn #${cancelTarget.id}`);
            setIsCancelModalOpen(false);
            loadOrders(currentPage);
        } catch {
            message.error('Hủy đơn thất bại');
        } finally {
            setActioning(null);
        }
    };

    const openRejectModal = (record) => {
        setRejectTarget(record);
        setRejectNote('');
        setIsRejectModalOpen(true);
    };

    const submitReject = async () => {
        if (!rejectTarget) return;
        setReturnActioning(rejectTarget.id);
        try {
            await supportRejectReturnRequestAPI(rejectTarget.id, rejectNote.trim() || undefined);
            message.success(`Đã từ chối yêu cầu #${rejectTarget.id}`);
            setIsRejectModalOpen(false);
            loadReturnRequests();
        } catch {
            message.error('Từ chối thất bại');
        } finally {
            setReturnActioning(null);
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        setUser({
            id: '',
            email: '',
            profile: { fullName: '' },
            role: ''
        });
        navigate('/login');
    };

    const statusConfig = {
        WAITING_CONFIRM: { label: 'Chờ duyệt', className: 'status-waiting' },
        SUPPORT_CONFIRMED: { label: 'Đã duyệt', className: 'status-confirmed' },
        OPERATION_CONFIRMED: { label: 'Đã xác nhận', className: 'status-confirmed' },
        CONFIRMED: { label: 'Đã xác nhận', className: 'status-confirmed' },
        COMPLETED: { label: 'Hoàn tất', className: 'status-completed' },
        CANCELLED: { label: 'Đã hủy', className: 'status-cancelled' },
        PENDING_PAYMENT: { label: 'Chờ thanh toán', className: 'status-pending' },
        PAID: { label: 'Đã thanh toán', className: 'status-paid' },
        SHIPPING: { label: 'Đang giao', className: 'status-shipping' },
        FAILED: { label: 'Thất bại', className: 'status-cancelled' },
        PENDING: { label: 'Đang xử lý', className: 'status-pending' }
    };

    const returnStatusConfig = {
        SUBMITTED: { label: 'Chờ duyệt', className: 'status-waiting' },
        APPROVED: { label: 'Đã duyệt', className: 'status-confirmed' },
        REJECTED: { label: 'Từ chối', className: 'status-cancelled' },
        RECEIVED: { label: 'Đã nhận', className: 'status-completed' }
    };

    const getStatusMeta = (status) => statusConfig[status] || { label: status || '—', className: 'status-pending' };
    const getReturnStatusMeta = (status) => returnStatusConfig[status] || { label: status || '—', className: 'status-pending' };

    const getOrderTypeLabel = (type) => {
        if (type === 'IN_STOCK') return 'Có sẵn';
        if (type === 'PRE_ORDER') return 'Đặt trước';
        return type || '—';
    };

    const waitingCount = ordersTotal;
    const pageOrders = orders;

    const returnTotal = returnRequests.length;
    const returnStart = (returnPage - 1) * returnPageSize;
    const returnPageItems = returnRequests.slice(returnStart, returnStart + returnPageSize);

    const renderOrderActions = (record) => {
        const isLoading = actioning === record.id;
        const canAction = record.orderStatus === 'WAITING_CONFIRM';
        return (
            <Space size={8}>
                {canAction ? (
                    <>
                        <Popconfirm
                            title="Xác nhận duyệt đơn hàng này?"
                            description="Đơn hàng sẽ được chuyển sang trạng thái đã xác nhận."
                            onConfirm={() => handleAction(record.id, supportConfirmOrderAPI, `Đã duyệt đơn #${record.id}`)}
                            okText="Duyệt"
                            cancelText="Không"
                        >
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                loading={isLoading}
                                className="btn-confirm"
                            >
                                Duyệt
                            </Button>
                        </Popconfirm>
                        <Button
                            size="small"
                            icon={<CloseCircleOutlined />}
                            loading={isLoading}
                            className="btn-cancel"
                            onClick={() => openCancelModal(record)}
                        >
                            Hủy
                        </Button>
                    </>
                ) : (
                    <span className="order-action-muted">Đã xử lý</span>
                )}
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => viewOrderDetails(record)}
                        style={{ color: '#6b7280' }}
                    />
                </Tooltip>
            </Space>
        );
    };

    return (
        <div className="support-shell">
            <div className="support-topbar">
                <div className="support-branding">
                    <p className="support-label">Support Desk</p>
                    <h1>Genetix Support Workspace</h1>
                    <span>Kiểm tra đơn hàng và yêu cầu trả hàng theo đúng quy trình</span>
                </div>
                <div className="support-metrics">
                    <div className="metric-card">
                        <span>Đơn chờ duyệt</span>
                        <strong>{waitingCount}</strong>
                    </div>
                    <div className="metric-card">
                        <span>Tổng đơn</span>
                        <strong>{ordersTotal}</strong>
                    </div>
                    <div className="metric-card">
                        <span>Yêu cầu trả</span>
                        <strong>{returnTotal}</strong>
                    </div>
                    <div className="topbar-actions">
                        <div className="user-chip">
                            <div className="user-avatar">
                                {(user?.fullName || user?.email || user?.role || 'U').trim().slice(0, 1).toUpperCase()}
                            </div>
                            <div className="user-meta">
                                <span className="user-name">{user?.fullName || user?.email || 'Support Staff'}</span>
                                <span className="user-role">{user?.role || 'SUPPORT_STAFF'}</span>
                            </div>
                        </div>
                        <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                loadOrders(currentPage);
                                loadReturnRequests();
                            }}
                            style={{ color: '#6b7280' }}
                            loading={loading || returnLoading}
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

            <div className="support-grid">
                <section className="support-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Đơn hàng cần duyệt</h2>
                            <p>Chỉ duyệt các đơn ở trạng thái chờ xác nhận từ Support.</p>
                        </div>
                        <div className="support-filters">
                            <button type="button" className="filter-btn active">
                                Payload BE hiện tại: chỉ trả đơn `WAITING_CONFIRM`
                            </button>
                        </div>
                    </div>

                    <div className="panel-body">
                        {loading ? (
                            <div className="orders-loading" style={{ minHeight: 240 }} />
                        ) : ordersTotal === 0 ? (
                            <div className="orders-empty">
                                <Empty description={<span>Không có đơn phù hợp.</span>} />
                            </div>
                        ) : (
                            <div className="orders-list">
                                {pageOrders.map(order => {
                                    const statusMeta = getStatusMeta(order.orderStatus);
                                    return (
                                        <div key={order.id || order.orderCode} className="order-card support-order">
                                            <div className="order-header">
                                                <div>
                                                    <span className="order-id">{order.orderCode || `Đơn #${order.id}`}</span>
                                                    <span className="order-date">{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                                                </div>
                                                <div className="order-header-right">
                                                    <Tag className={statusMeta.className} icon={<ClockCircleOutlined />}>
                                                        {statusMeta.label}
                                                    </Tag>
                                                    <span className="order-pay-method">{getOrderTypeLabel(order.orderType)}</span>
                                                </div>
                                            </div>

                                            <div className="order-info">
                                                <div className="info-row">
                                                    <span className="info-label">Người nhận</span>
                                                    <span className="info-value">{order.receiverName || '—'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">SĐT</span>
                                                    <span className="info-value">{order.receiverPhone || '—'}</span>
                                                </div>
                                                <div className="info-row full">
                                                    <span className="info-label">Địa chỉ</span>
                                                    <span className="info-value">{formatAddressText(order.address)}</span>
                                                </div>
                                            </div>

                                            <div className="order-footer">
                                                <div className="order-totals">
                                                    <span className="order-total">
                                                        Tổng: <strong>{formatVND(order.totalAmount || order.total)}</strong>
                                                    </span>
                                                    <span className="order-subtotal">
                                                        Đặt cọc: {formatVND(order.deposit)}
                                                    </span>
                                                    <span className="order-subtotal">
                                                        Còn lại: {formatVND(order.remainingAmount)}
                                                    </span>
                                                </div>
                                                {renderOrderActions(order)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {!loading && ordersTotal > pageSize && (
                        <div className="support-pagination">
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={ordersTotal}
                                onChange={(page) => {
                                    setCurrentPage(page);
                                    loadOrders(page);
                                }}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </section>

                <section className="support-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Yêu cầu trả hàng</h2>
                            <p>Xác nhận các yêu cầu trả hàng đã được gửi.</p>
                        </div>
                        <div className="panel-icon">
                            <InboxOutlined />
                        </div>
                    </div>

                    <div className="panel-body">
                        {returnLoading ? (
                            <div className="orders-loading" style={{ minHeight: 240 }} />
                        ) : returnTotal === 0 ? (
                            <div className="orders-empty">
                                <Empty description={<span>Chưa có yêu cầu trả hàng.</span>} />
                            </div>
                        ) : (
                            <div className="returns-list">
                                {returnPageItems.map(req => {
                                    const statusMeta = getReturnStatusMeta(req.status);
                                    const evidences = parseEvidenceUrls(req.evidenceUrls);
                                    return (
                                        <div key={req.id} className="return-card">
                                            <div className="return-header">
                                                <div>
                                                    <span className="return-id">RR-{req.id}</span>
                                                    <span className="return-date">{req.createdAt ? dayjs(req.createdAt).format('DD/MM/YYYY HH:mm') : '—'}</span>
                                                </div>
                                                <Tag className={statusMeta.className} icon={<ClockCircleOutlined />}>
                                                    {statusMeta.label}
                                                </Tag>
                                            </div>

                                            <div className="return-meta">
                                                <div className="meta-item">
                                                    <span className="meta-label">Số lượng</span>
                                                    <span className="meta-value">{req.requestedQuantity ?? '—'}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Lý do</span>
                                                    <span className="meta-value">{req.reason || '—'}</span>
                                                </div>
                                                {req.note && (
                                                    <div className="meta-item full">
                                                        <span className="meta-label">Ghi chú</span>
                                                        <span className="meta-value">{req.note}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {evidences.length > 0 && (
                                                <div className="return-evidence">
                                                    <span>Minh chứng:</span>
                                                    <ul>
                                                        {evidences.slice(0, 3).map((url, idx) => (
                                                            <li key={`${req.id}-ev-${idx}`}>{url}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="return-actions">
                                                <Popconfirm
                                                    title="Duyệt yêu cầu trả hàng?"
                                                    onConfirm={() => handleReturnAction(req.id, supportApproveReturnRequestAPI, `Đã duyệt yêu cầu #${req.id}`)}
                                                    okText="Duyệt"
                                                    cancelText="Không"
                                                >
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<CheckCircleOutlined />}
                                                        loading={returnActioning === req.id}
                                                        className="btn-confirm"
                                                    >
                                                        Duyệt
                                                    </Button>
                                                </Popconfirm>
                                                <Button
                                                    size="small"
                                                    icon={<CloseCircleOutlined />}
                                                    loading={returnActioning === req.id}
                                                    className="btn-cancel"
                                                    onClick={() => openRejectModal(req)}
                                                >
                                                    Từ chối
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {!returnLoading && returnTotal > returnPageSize && (
                        <div className="support-pagination">
                            <Pagination
                                current={returnPage}
                                pageSize={returnPageSize}
                                total={returnTotal}
                                onChange={(page) => setReturnPage(page)}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </section>
            </div>

            {/* ── Order Detail Modal ── */}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.id || ''}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                className="order-detail-modal"
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={720}
            >
                {selectedOrder && (
                    <div style={{ padding: '8px 0' }}>
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="Mã đơn">
                                #{selectedOrder.id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã đơn hàng">
                                {selectedOrder.orderCode || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                {dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại đơn">
                                <Tag color="purple">{getOrderTypeLabel(selectedOrder.orderType)}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <strong style={{ color: '#d97706', fontSize: 16 }}>
                                    {formatVND(selectedOrder.totalAmount)}
                                </strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Đặt cọc">
                                {formatVND(selectedOrder.deposit)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Còn lại">
                                {formatVND(selectedOrder.remainingAmount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag className={getStatusMeta(selectedOrder.orderStatus).className} icon={<ClockCircleOutlined />}>
                                    {getStatusMeta(selectedOrder.orderStatus).label}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Người nhận">
                                {selectedOrder.receiverName || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedOrder.receiverPhone || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                {formatAddressText(selectedOrder.address)}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>

            {/* ── Reject Return Modal ── */}
            <Modal
                title={rejectTarget ? `Từ chối yêu cầu #${rejectTarget.id}` : 'Từ chối yêu cầu'}
                open={isRejectModalOpen}
                onCancel={() => setIsRejectModalOpen(false)}
                onOk={submitReject}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: returnActioning === rejectTarget?.id }}
            >
                <p>Nhập ghi chú (tuỳ chọn) để phản hồi khách hàng.</p>
                <Input.TextArea
                    rows={4}
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Ví dụ: Sản phẩm không đủ điều kiện đổi trả."
                />
            </Modal>

            <Modal
                title={cancelTarget ? `Hủy đơn #${cancelTarget.id}` : 'Hủy đơn'}
                open={isCancelModalOpen}
                onCancel={() => setIsCancelModalOpen(false)}
                onOk={submitCancel}
                okText="Xác nhận hủy"
                cancelText="Đóng"
                okButtonProps={{ danger: true, loading: actioning === cancelTarget?.id }}
            >
                <p>Backend yêu cầu truyền `reason` và `note` khi support hủy đơn.</p>
                <div style={{ display: 'grid', gap: 12 }}>
                    <label>
                        <span style={{ display: 'block', marginBottom: 6 }}>Lý do hoàn tiền</span>
                        <select
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            style={{ width: '100%', minHeight: 38, borderRadius: 8, border: '1px solid #d9d9d9', padding: '0 12px' }}
                        >
                            <option value="SHOP_CANNOT_SUPPLY">SHOP_CANNOT_SUPPLY</option>
                            <option value="SYSTEM_ERROR">SYSTEM_ERROR</option>
                            <option value="LATE_DELIVERY">LATE_DELIVERY</option>
                        </select>
                    </label>
                    <Input.TextArea
                        rows={4}
                        value={cancelNote}
                        onChange={(e) => setCancelNote(e.target.value)}
                        placeholder="Ghi chú thêm cho khách hàng"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default SupportOrdersPage;
