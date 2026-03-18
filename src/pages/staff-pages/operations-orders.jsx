import React, { useEffect, useState, useContext } from 'react';
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
    InboxOutlined,
    LogoutOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import {
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
} from '../../utils/role-data';

const formatVND = n =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const OperationsOrdersPage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersTotal, setOrdersTotal] = useState(0);
    const ordersPageSize = 8;

    const [returnRequests, setReturnRequests] = useState([]);
    const [returnLoading, setReturnLoading] = useState(true);
    const [returnPage, setReturnPage] = useState(1);
    const returnPageSize = 6;

    const [actioning, setActioning] = useState(null);
    const [receiveModalOpen, setReceiveModalOpen] = useState(false);
    const [receiveTarget, setReceiveTarget] = useState(null);
    const [acceptedQuantity, setAcceptedQuantity] = useState(null);
    const [conditionNote, setConditionNote] = useState('');

    const loadApprovedOrders = async (page = ordersPage) => {
        setOrdersLoading(true);
        try {
            const res = await getApprovedOrdersAPI(page - 1, ordersPageSize);
            const { items, total } = normalizeOrdersResponse(res);
            setOrders(items);
            setOrdersTotal(total);
        } catch {
            message.error('Không thể tải đơn hàng đã duyệt');
        } finally {
            setOrdersLoading(false);
        }
    };

    const loadReturnRequests = async () => {
        setReturnLoading(true);
        try {
            const res = await getOperationReturnRequestsAPI();
            const items = normalizeReturnRequestsResponse(res);
            setReturnRequests(items);
            setReturnPage(1);
        } catch {
            message.error('Không thể tải yêu cầu hoàn trả');
        } finally {
            setReturnLoading(false);
        }
    };

    useEffect(() => {
        loadApprovedOrders(1);
        loadReturnRequests();
    }, []);

    const handleShip = async (orderId) => {
        setActioning(orderId);
        try {
            await operationsConfirmOrderAPI(orderId);
            message.success(`Đã gửi đơn #${orderId} đến GHN`);
            loadApprovedOrders(ordersPage);
        } catch {
            message.error('Không thể gửi đơn hàng');
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
        } catch {
            message.error('Xác nhận nhận hàng thất bại');
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

    const normalizePaymentLabel = (method) => {
        if (!method) return null;
        if (method === 'VNPAY') return 'VNPAY';
        if (method === 'COD') return 'COD';
        if (method === 'BANKING') return 'Chuyển khoản';
        return method;
    };

    const getPaymentMethod = (order) => {
        const method = normalizePaymentLabel(order?.remainingPaymentMethod);
        if (order?.remainingAmount && Number(order.remainingAmount) > 0) {
            return method ? `Còn lại: ${method}` : 'BE không trả phương thức còn lại';
        }
        return 'BE không trả phương thức thanh toán ban đầu';
    };

    const totalReturns = returnRequests.length;
    const returnStart = (returnPage - 1) * returnPageSize;
    const returnItems = returnRequests.slice(returnStart, returnStart + returnPageSize);

    return (
        <div className="ops-shell">
            <div className="ops-topbar">
                <div className="ops-branding">
                    <p className="ops-label">Operations Desk</p>
                    <h1>Genetix Logistics Control</h1>
                    <span>Quản lý giao hàng và nhận hoàn trả theo quy trình vận hành.</span>
                </div>
                <div className="ops-metrics">
                    <div className="metric-card">
                        <span>Đơn chờ giao</span>
                        <strong>{ordersTotal}</strong>
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
                                loadApprovedOrders(ordersPage);
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
                            <h2>Đơn hàng cần giao GHN</h2>
                            <p>Danh sách đơn đã được Support duyệt.</p>
                        </div>
                        <div className="panel-icon">
                            <SendOutlined />
                        </div>
                    </div>

                    <div className="panel-body">
                        {ordersLoading ? (
                            <div className="orders-loading" style={{ minHeight: 240 }} />
                        ) : orders.length === 0 ? (
                            <div className="orders-empty">
                                <Empty description={<span>Chưa có đơn cần giao.</span>} />
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orders.map(order => (
                                    <div key={order.id || order.orderCode} className="order-card ops-order">
                                        <div className="order-header">
                                            <div>
                                                <span className="order-id">{order.orderCode || `Đơn #${order.id}`}</span>
                                                <span className="order-date">{order.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : '—'}</span>
                                            </div>
                                            <div className="order-header-right">
                                                <Tag className="status-confirmed" icon={<CheckCircleOutlined />}>
                                                    {order.orderStatus || 'SUPPORT_CONFIRMED'}
                                                </Tag>
                                                <span className="order-pay-method">{order.orderType || '—'}</span>
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
                                            <div className="info-row">
                                                <span className="info-label">Thanh toán</span>
                                                <span className="info-value">{getPaymentMethod(order)}</span>
                                            </div>
                                            <div className="info-row full">
                                                <span className="info-label">Địa chỉ</span>
                                                <span className="info-value">{formatAddressText(order.address)}</span>
                                            </div>
                                        </div>

                                        <div className="order-footer">
                                            <div className="order-totals">
                                                <span className="order-total">
                                                    Tổng: <strong>{formatVND(order.totalAmount)}</strong>
                                                </span>
                                                <span className="order-subtotal">
                                                    Đặt cọc: {formatVND(order.deposit)}
                                                </span>
                                                <span className="order-subtotal">
                                                    Còn lại: {formatVND(order.remainingAmount)}
                                                </span>
                                            </div>
                                            <Popconfirm
                                                title="Xác nhận giao qua GHN?"
                                                description="Đơn hàng sẽ được tạo trên hệ thống GHN."
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!ordersLoading && ordersTotal > ordersPageSize && (
                        <div className="support-pagination">
                            <Pagination
                                current={ordersPage}
                                pageSize={ordersPageSize}
                                total={ordersTotal}
                                onChange={(page) => {
                                    setOrdersPage(page);
                                    loadApprovedOrders(page);
                                }}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </section>

                <section className="ops-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Hoàn trả chờ nhận</h2>
                            <p>Ghi nhận tình trạng và số lượng hàng trả.</p>
                        </div>
                        <div className="panel-icon">
                            <InboxOutlined />
                        </div>
                    </div>

                    <div className="panel-body">
                        {returnLoading ? (
                            <div className="orders-loading" style={{ minHeight: 240 }} />
                        ) : totalReturns === 0 ? (
                            <div className="orders-empty">
                                <Empty description={<span>Chưa có hoàn trả.</span>} />
                            </div>
                        ) : (
                            <div className="returns-list">
                                {returnItems.map(req => {
                                    return (
                                        <div key={req.id} className="return-card">
                                            <div className="return-header">
                                                <div>
                                                    <span className="return-id">RR-{req.id}</span>
                                                    <span className="return-date">{req.createdAt ? dayjs(req.createdAt).format('DD/MM/YYYY HH:mm') : '—'}</span>
                                                </div>
                                                <Tag className="status-waiting">Chờ nhận</Tag>
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
                                            </div>

                                            {req.note && (
                                                <div className="return-evidence">
                                                    <span>Ghi chú khách:</span>
                                                    <div>{req.note}</div>
                                                </div>
                                            )}

                                            {req.evidenceUrls.length > 0 && (
                                                <div className="return-evidence">
                                                    <span>Minh chứng:</span>
                                                    <ul>
                                                        {req.evidenceUrls.slice(0, 3).map((url, idx) => (
                                                            <li key={`${req.id}-ev-${idx}`}>{url}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="return-actions">
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
