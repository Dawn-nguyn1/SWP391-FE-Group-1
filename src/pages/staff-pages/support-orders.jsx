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

            // Normalize: if string, parse it
            if (typeof res === 'string') {
                try { res = JSON.parse(res); } catch (e) { console.error('[Genetix] parse error', e); res = {}; }
            }

            // Normalize: if axios returns { data: ... } wrapper
            if (res?.data && (res.data.content || typeof res.data === 'string')) {
                res = res.data;
                if (typeof res === 'string') {
                    try { res = JSON.parse(res); } catch (e) { res = {}; }
                }
            }

            console.log('[Genetix] parsed result:', res);
            const items = res?.content || (Array.isArray(res) ? res : []);
            const total = res?.totalElements || items.length;

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
            render: id => <strong style={{ color: '#a78bfa' }}>#{id}</strong>
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
            width: 140,
            ellipsis: true,
            render: code => <span style={{ color: '#c4b5fd', fontFamily: 'monospace', fontSize: 12 }}>{code || '—'}</span>
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            render: date => (
                <span style={{ color: '#cbd5e1', fontSize: 13 }}>
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
                <strong style={{ color: '#fbbf24', fontSize: 14 }}>
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
                                style={{ color: 'rgba(255,255,255,0.45)' }}
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
                            <ClockCircleOutlined style={{ color: '#fbbf24' }} />
                            <span>Đang chờ:</span>
                            <span className="stat-count">{pagination.total}</span>
                        </div>
                        <Tooltip title="Tải lại">
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={() => loadOrders(1)}
                                style={{ color: 'rgba(255,255,255,0.6)' }}
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
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>
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
                                <strong style={{ color: '#fbbf24', fontSize: 16 }}>
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
