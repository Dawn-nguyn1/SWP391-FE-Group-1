import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Popconfirm, message, Modal, Descriptions, Space, Tooltip } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { getSupportWaitingOrdersAPI, supportConfirmOrderAPI, supportCancelOrderAPI } from '../../services/api.service';
import './staff-orders.css';
import dayjs from 'dayjs';

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
            // Fallback for backend strings that look like JS object literals
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

const SupportOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadOrders = async (page = pagination.current, size = pagination.pageSize) => {
        setLoading(true);
        try {
            let res = await getSupportWaitingOrdersAPI(page - 1, size);
            console.log('[Genetix] raw API response:', res, 'type:', typeof res);
            if (typeof res === 'string') {
                res = extractJsonFromString(res);
            }
            const { items, total } = normalizeOrdersResponse(res);

            setOrders(items);
            setPagination(prev => ({
                ...prev,
                current: page,
                total
            }));
        } catch (err) {
            console.error('[Genetix] loadOrders error:', err);
            message.error('Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
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

    const viewOrderDetails = (record) => {
        setSelectedOrder(record);
        setIsModalVisible(true);
    };

    const handleTableChange = (pag) => {
        loadOrders(pag.current, pag.pageSize);
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: id => <strong style={{ color: '#2563eb' }}>#{id}</strong>
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
            width: 140,
            ellipsis: true,
            render: code => <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{code || '—'}</span>
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            render: date => (
                <span style={{ color: '#6b7280', fontSize: 13 }}>
                    {dayjs(date).format('DD/MM/YYYY HH:mm')}
                </span>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'total',
            width: 140,
            render: v => (
                <strong style={{ color: '#d97706', fontSize: 14 }}>
                    {formatVND(v)}
                </strong>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            key: 'status',
            width: 160,
            render: () => (
                <Tag className="status-waiting" icon={<ClockCircleOutlined />}>
                    Chờ duyệt
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 260,
            render: (_, record) => {
                const isLoading = actioning === record.id;
                return (
                    <Space size={8}>
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
            }
        }
    ];

    return (
        <div className="support-page">
            <div className="support-inner">
                {/* ── Header ── */}
                <div className="support-page-header">
                    <div className="support-brand">
                        <h2>Genetix</h2>
                        <span>Duyệt đơn hàng chờ xác nhận</span>
                    </div>
                    <div className="support-stats">
                        <div className="stat-pill">
                            <ClockCircleOutlined style={{ color: '#d97706' }} />
                            <span>Đang chờ:</span>
                            <span className="stat-count">{pagination.total}</span>
                        </div>
                        <Tooltip title="Tải lại">
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={() => loadOrders(1)}
                                style={{ color: '#6b7280' }}
                                loading={loading}
                            />
                        </Tooltip>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="support-card">
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: false,
                            showTotal: (total) => (
                                <span style={{ color: '#6b7280' }}>
                                    Tổng: {total} đơn
                                </span>
                            )
                        }}
                        onChange={handleTableChange}
                        onRow={(record) => ({
                            onDoubleClick: () => viewOrderDetails(record)
                        })}
                    />
                </div>
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
                width={700}
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
                                <Tag color="purple">{selectedOrder.orderType || '—'}</Tag>
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
                                <Tag className="status-waiting" icon={<ClockCircleOutlined />}>
                                    Chờ duyệt
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SupportOrdersPage;
