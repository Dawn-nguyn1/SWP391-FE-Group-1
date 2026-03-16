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

const formatVND = n =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const coerceArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') {
        const vals = Object.values(value);
        if (vals.length && vals.every(v => v && typeof v === 'object')) {
            return vals;
        }
    }
    return null;
};

const parseMaybeString = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    try { return JSON.parse(trimmed); } catch { /* ignore */ }
    try {
        const normalized = trimmed
            .replace(/\\'/g, '__SQUOTE__')
            .replace(/'/g, '"')
            .replace(/__SQUOTE__/g, "'");
        return JSON.parse(normalized);
    } catch {
        try {
            // eslint-disable-next-line no-new-func
            return new Function(`return (${trimmed})`)();
        } catch {
            return value;
        }
    }
};

const extractJsonFromString = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const sliced = trimmed.slice(firstBrace, lastBrace + 1);
        const parsed = parseMaybeString(sliced);
        if (parsed && typeof parsed === 'object') return parsed;
    }
    const firstBracket = trimmed.indexOf('[');
    const lastBracket = trimmed.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
        const sliced = trimmed.slice(firstBracket, lastBracket + 1);
        const parsed = parseMaybeString(sliced);
        if (parsed) return parsed;
    }
    return value;
};

const extractArrayAfterKey = (text, key) => {
    if (typeof text !== 'string') return null;
    const keyVariants = [`"${key}"`, key];
    let startIdx = -1;
    for (const k of keyVariants) {
        const idx = text.indexOf(k);
        if (idx !== -1) {
            startIdx = idx + k.length;
            break;
        }
    }
    if (startIdx === -1) return null;
    const bracketStart = text.indexOf('[', startIdx);
    if (bracketStart === -1) return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = bracketStart; i < text.length; i += 1) {
        const ch = text[i];
        if (escape) {
            escape = false;
            continue;
        }
        if (ch === '\\') {
            escape = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
        }
        if (inString) continue;
        if (ch === '[') depth += 1;
        if (ch === ']') depth -= 1;
        if (depth === 0) {
            const slice = text.slice(bracketStart, i + 1);
            const parsed = parseMaybeString(slice);
            return Array.isArray(parsed) ? parsed : null;
        }
    }
    return null;
};

const findArrayCandidate = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    const values = Object.values(obj);
    for (const val of values) {
        const maybeArray = coerceArray(val);
        if (maybeArray) {
            const first = maybeArray[0];
            if (first && typeof first === 'object' && ('id' in first || 'orderCode' in first || 'order_code' in first)) {
                return maybeArray;
            }
        }
    }
    for (const val of values) {
        if (val && typeof val === 'object') {
            const nested = Object.values(val);
            for (const nestedVal of nested) {
                const maybeArray = coerceArray(nestedVal);
                if (maybeArray) {
                    const first = maybeArray[0];
                    if (first && typeof first === 'object' && ('id' in first || 'orderCode' in first || 'order_code' in first)) {
                        return maybeArray;
                    }
                }
            }
        }
    }
    return null;
};

const normalizeOrdersResponse = (res) => {
    let data = parseMaybeString(res);
    if (typeof data === 'string') {
        const extracted =
            extractArrayAfterKey(data, 'content') ||
            extractArrayAfterKey(data, 'result') ||
            extractArrayAfterKey(data, 'items');
        if (Array.isArray(extracted)) {
            return { items: extracted, total: extracted.length };
        }
        data = extractJsonFromString(data);
    }

    if (data && typeof data === 'object' && 'data' in data) {
        data = parseMaybeString(data.data ?? data);
        if (typeof data === 'string') {
            const extracted =
                extractArrayAfterKey(data, 'content') ||
                extractArrayAfterKey(data, 'result') ||
                extractArrayAfterKey(data, 'items');
            if (Array.isArray(extracted)) {
                return { items: extracted, total: extracted.length };
            }
            data = extractJsonFromString(data);
        }
    }

    const nestedContent = data?.content?.content;
    if (typeof nestedContent === 'string') {
        const parsed = parseMaybeString(nestedContent);
        const maybeArray = coerceArray(parsed);
        if (maybeArray) {
            return { items: maybeArray, total: maybeArray.length };
        }
    }
    const nestedArray = coerceArray(nestedContent);
    if (nestedArray) {
        return {
            items: nestedArray,
            total: data.content?.totalElements ?? nestedArray.length
        };
    }

    if (typeof data?.content === 'string') {
        const parsed = parseMaybeString(data.content);
        const maybeArray = coerceArray(parsed);
        if (maybeArray) {
            return { items: maybeArray, total: maybeArray.length };
        }
    }
    const contentArray = coerceArray(data?.content);
    if (contentArray) {
        return { items: contentArray, total: data.totalElements ?? data.total ?? contentArray.length };
    }

    const resultArray = coerceArray(data?.result);
    if (resultArray) {
        return { items: resultArray, total: data.total ?? resultArray.length };
    }

    const itemsArray = coerceArray(data?.items);
    if (itemsArray) {
        return { items: itemsArray, total: data.total ?? itemsArray.length };
    }

    if (Array.isArray(data)) {
        return { items: data, total: data.length };
    }

    if (data && typeof data === 'object' && data.id != null) {
        return { items: [data], total: 1 };
    }

    const candidate = findArrayCandidate(data);
    if (Array.isArray(candidate)) {
        return { items: candidate, total: candidate.length };
    }

    return { items: [], total: 0 };
};

const normalizeArrayResponse = (res) => {
    let data = parseMaybeString(res);
    if (typeof data === 'string') {
        data = extractJsonFromString(data);
    }
    if (data && typeof data === 'object' && 'data' in data) {
        data = data.data;
    }
    const content = coerceArray(data?.content) || coerceArray(data?.items) || coerceArray(data?.result);
    if (content) return content;
    if (Array.isArray(data)) return data;
    return [];
};

const parseEvidenceUrls = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const parsed = parseMaybeString(value);
    if (Array.isArray(parsed)) return parsed;
    if (typeof value === 'string') {
        return value.split(',').map(v => v.trim()).filter(Boolean);
    }
    return [];
};

const SupportOrdersPage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(null);
    const [activeFilter, setActiveFilter] = useState('WAITING_CONFIRM');
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
    const [previewImage, setPreviewImage] = useState(null);

    const applyOrders = (items) => {
        setOrders(items);
        setCurrentPage(1);
    };

    const applyReturnRequests = (items) => {
        setReturnRequests(items);
        setReturnPage(1);
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            let res = await getSupportOrdersAPI();
            if (typeof res === 'string') {
                res = extractJsonFromString(res);
            }
            if (Array.isArray(res?.content)) {
                applyOrders(res.content);
                return;
            }
            if (Array.isArray(res?.data?.content)) {
                applyOrders(res.data.content);
                return;
            }
            if (typeof res?.content === 'string') {
                const parsed = parseMaybeString(res.content);
                if (Array.isArray(parsed)) {
                    applyOrders(parsed);
                    return;
                }
            }
            const { items } = normalizeOrdersResponse(res);
            applyOrders(items);
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
            const items = normalizeArrayResponse(res);
            applyReturnRequests(items);
        } catch (err) {
            console.error('[Genetix] loadReturnRequests error:', err);
            message.error('Không thể tải yêu cầu trả hàng');
        } finally {
            setReturnLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
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

    const formatAddress = (address) => {
        if (!address) return '—';
        const parts = [address.addressLine, address.ward, address.district, address.province]
            .filter(Boolean);
        return parts.join(', ');
    };

    const waitingCount = orders.filter(order => order.orderStatus === 'WAITING_CONFIRM').length;
    const sortedOrders = [...orders].sort((a, b) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
    });
    const visibleOrders = activeFilter === 'ALL'
        ? sortedOrders
        : sortedOrders.filter(order => order.orderStatus === 'WAITING_CONFIRM');
    const totalVisible = visibleOrders.length;
    const pageStart = (currentPage - 1) * pageSize;
    const pageOrders = visibleOrders.slice(pageStart, pageStart + pageSize);

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
                        <Popconfirm
                            title="Hủy đơn hàng này?"
                            description="Hành động này không thể hoàn tác."
                            onConfirm={() => handleAction(record.id, supportCancelOrderAPI, `Đã hủy đơn #${record.id}`)}
                            okText="Hủy đơn"
                            cancelText="Giữ lại"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                size="small"
                                icon={<CloseCircleOutlined />}
                                loading={isLoading}
                                className="btn-cancel"
                            >
                                Hủy
                            </Button>
                        </Popconfirm>
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
                        <strong>{orders.length}</strong>
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
                                loadOrders();
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
                            <button
                                type="button"
                                className={`filter-btn ${activeFilter === 'WAITING_CONFIRM' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveFilter('WAITING_CONFIRM');
                                    setCurrentPage(1);
                                }}
                            >
                                Đơn chờ duyệt
                            </button>
                            <button
                                type="button"
                                className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveFilter('ALL');
                                    setCurrentPage(1);
                                }}
                            >
                                Tất cả đơn
                            </button>
                        </div>
                    </div>

                    <div className="panel-body">
                        {loading ? (
                            <div className="orders-loading" style={{ minHeight: 240 }} />
                        ) : totalVisible === 0 ? (
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
                                                    <span className="info-value">{order.address?.receiverName || '—'}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">SĐT</span>
                                                    <span className="info-value">{order.address?.phone || '—'}</span>
                                                </div>
                                                <div className="info-row full">
                                                    <span className="info-label">Địa chỉ</span>
                                                    <span className="info-value">{formatAddress(order.address)}</span>
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

                    {!loading && totalVisible > pageSize && (
                        <div className="support-pagination">
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={totalVisible}
                                onChange={(page) => setCurrentPage(page)}
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
                                                    <div className="evidence-title">Minh chứng</div>
                                                    <div className="evidence-grid">
                                                        {evidences.slice(0, 4).map((url, idx) => (
                                                            <div
                                                                key={`${req.id}-ev-${idx}`}
                                                                className="evidence-thumb"
                                                                onClick={() => setPreviewImage(url)}
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') setPreviewImage(url);
                                                                }}
                                                            >
                                                                <img src={url} alt={`evidence-${idx + 1}`} />
                                                            </div>
                                                        ))}
                                                    </div>
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
                                {selectedOrder.address?.receiverName || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedOrder.address?.phone || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                {formatAddress(selectedOrder.address)}
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
                open={!!previewImage}
                footer={null}
                onCancel={() => setPreviewImage(null)}
                width="90vw"
                centered
                className="evidence-preview-modal"
            >
                {previewImage && (
                    <img src={previewImage} alt="Evidence preview" className="evidence-preview-image" />
                )}
            </Modal>
        </div>
    );
};

export default SupportOrdersPage;
