import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Popconfirm, message, Typography, Tabs, Modal, Descriptions, Steps, Timeline, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CarOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { getSupportOrdersAPI, supportConfirmOrderAPI, supportCancelOrderAPI, supportShipOrderAPI, supportCompleteOrderAPI } from '../../services/api.service';
import './staff-orders.css';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TabPane } = Tabs;

const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const ORDER_STATUSES = {
    ALL: '',
    PENDING: 'WAITING_CONFIRM',
    CONFIRMED: 'SUPPORT_CONFIRMED',
    SHIPPING: 'SHIPPING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

const STATUS_COLORS = {
    WAITING_CONFIRM: 'orange',
    SUPPORT_CONFIRMED: 'blue',
    SHIPPING: 'geekblue',
    COMPLETED: 'green',
    CANCELLED: 'red',
    FAILED: 'red'
};

const SupportOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(null);
    const [activeTab, setActiveTab] = useState(ORDER_STATUSES.ALL);
    
    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadOrders = async (status = activeTab) => {
        setLoading(true);
        try {
            const res = await getSupportOrdersAPI(status);
            setOrders(res?.content || (Array.isArray(res) ? res : []));
        } catch { 
            message.error('Không thể tải đơn hàng'); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        loadOrders(); 
    }, [activeTab]);

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

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const viewOrderDetails = (record) => {
        setSelectedOrder(record);
        setIsModalVisible(true);
    };

    const renderActionButtons = (record) => {
        const { id, orderStatus } = record;
        const isLoading = actioning === id;

        switch (orderStatus) {
            case 'WAITING_CONFIRM':
                return (
                    <Space size="small">
                        <Popconfirm title="Xác nhận đơn hàng này?" onConfirm={() => handleAction(id, supportConfirmOrderAPI, `Đã xác nhận đơn #${id}`)} okText="Xác nhận" cancelText="Huỷ">
                            <Button type="primary" size="small" icon={<CheckCircleOutlined />} loading={isLoading}>Duyệt</Button>
                        </Popconfirm>
                        <Popconfirm title="Hủy đơn hàng này?" onConfirm={() => handleAction(id, supportCancelOrderAPI, `Đã hủy đơn #${id}`)} okText="Hủy đơn" cancelText="Giữ" okButtonProps={{ danger: true }}>
                            <Button danger size="small" icon={<CloseCircleOutlined />} loading={isLoading}>Hủy</Button>
                        </Popconfirm>
                    </Space>
                );
            case 'SUPPORT_CONFIRMED':
                return (
                    <Popconfirm title="Chuyển sang trạng thái Đang giao?" onConfirm={() => handleAction(id, supportShipOrderAPI, `Đơn #${id} đang được giao`)} okText="Giao hàng" cancelText="Huỷ">
                        <Button type="default" size="small" icon={<CarOutlined />} loading={isLoading} style={{ borderColor: '#1890ff', color: '#1890ff' }}>Giao hàng</Button>
                    </Popconfirm>
                );
            case 'SHIPPING':
                return (
                    <Space size="small">
                        <Popconfirm title="Xác nhận giao thành công?" onConfirm={() => handleAction(id, supportCompleteOrderAPI, `Đơn #${id} đã giao thành công`)} okText="Hoàn thành" cancelText="Huỷ">
                            <Button type="primary" success size="small" icon={<CheckCircleOutlined />} loading={isLoading} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>Thành công</Button>
                        </Popconfirm>
                        <Popconfirm title="Xác nhận giao thất bại/hoàn trả?" onConfirm={() => handleAction(id, supportCancelOrderAPI, `Đơn #${id} giao thất bại`)} okText="Thất bại" cancelText="Giữ" okButtonProps={{ danger: true }}>
                            <Button danger size="small" icon={<CloseCircleOutlined />} loading={isLoading}>Thất bại</Button>
                        </Popconfirm>
                    </Space>
                );
            default:
                return (
                    <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => viewOrderDetails(record)}>Chi tiết</Button>
                );
        }
    };

    const columns = [
        { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: id => <strong>#{id}</strong>, width: 80 },
        { title: 'Ngày đặt', dataIndex: 'createdAt', key: 'createdAt', render: date => dayjs(date).format('DD/MM/YYYY HH:mm'), width: 140 },
        { title: 'Khách hàng', dataIndex: 'userEmail', key: 'email', render: (_, r) => r.userEmail || r.userId || '—' },
        { title: 'Địa chỉ nhận', dataIndex: 'address', key: 'address', render: (_, r) => {
            const a = r.address;
            return a ? `${a.addressLine || ''}, ${a.ward || ''}, ${a.district || ''}, ${a.province || ''}`.replace(/^(, )+|(, )+$/g, '') : '—';
        }, ellipsis: true},
        { title: 'PTTT', dataIndex: 'paymentMethod', key: 'payment', render: v => <Tag color={v === 'VNPAY' ? 'purple' : 'orange'}>{v}</Tag>, width: 90 },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'total', render: v => <strong style={{ color: '#764ba2' }}>{formatVND(v)}</strong>, width: 130 },
        { title: 'Trạng thái', dataIndex: 'orderStatus', key: 'status', render: v => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag>, width: 130 },
        { title: 'Thao tác', key: 'actions', width: 220, render: (_, record) => renderActionButtons(record) }
    ];

    return (
        <div className="staff-page">
            <div className="staff-inner">
                <div className="staff-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                     <div>
                        <Title level={3} style={{ margin: 0 }}>📦 Quản lý đơn hàng (In-Stock)</Title>
                        <span style={{ color: '#888' }}>Xử lý luồng đơn hàng từ khi chờ xác nhận đến khi hoàn thành</span>
                     </div>
                </div>

                <div className="staff-card" style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <Tabs activeKey={activeTab} onChange={handleTabChange} type="card" style={{ marginBottom: 16 }}>
                        <TabPane tab="Tất cả" key={ORDER_STATUSES.ALL} />
                        <TabPane tab="Chờ duyệt" key={ORDER_STATUSES.PENDING} />
                        <TabPane tab="Đã xác nhận (Chờ giao)" key={ORDER_STATUSES.CONFIRMED} />
                        <TabPane tab="Đang giao hàng" key={ORDER_STATUSES.SHIPPING} />
                        <TabPane tab="Hoàn thành" key={ORDER_STATUSES.COMPLETED} />
                        <TabPane tab="Đã hủy/Thất bại" key={ORDER_STATUSES.CANCELLED} />
                    </Tabs>

                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 20 }}
                        onRow={(record) => ({
                            onDoubleClick: () => viewOrderDetails(record)
                        })}
                    />
                </div>
            </div>

            {/* Order Detail Modal */}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>
                ]}
                width={800}
            >
                {selectedOrder && (
                    <div className="order-detail-content">
                        <Descriptions bordered size="small" column={2} style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="Khách hàng">{selectedOrder.userEmail || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">{dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                            <Descriptions.Item label="SĐT nhận hàng">{selectedOrder.address?.phone || '—'}</Descriptions.Item>
                            <Descriptions.Item label="Phương thức TT"><Tag color={selectedOrder.paymentMethod === 'VNPAY' ? 'purple' : 'orange'}>{selectedOrder.paymentMethod}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                {selectedOrder.address ? `${selectedOrder.address.addressLine || ''}, ${selectedOrder.address.ward || ''}, ${selectedOrder.address.district || ''}, ${selectedOrder.address.province || ''}`.replace(/^(, )+|(, )+$/g, '') : '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={STATUS_COLORS[selectedOrder.orderStatus]}>{selectedOrder.orderStatus}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <strong style={{ color: '#764ba2', fontSize: 16 }}>{formatVND(selectedOrder.totalAmount)}</strong>
                            </Descriptions.Item>
                        </Descriptions>

                        <Title level={5}>Sản phẩm ({selectedOrder.items?.length})</Title>
                        <Table 
                            dataSource={selectedOrder.items} 
                            rowKey="id" 
                            pagination={false} 
                            size="small"
                            style={{ marginBottom: 24 }}
                            columns={[
                                { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'name', render: (_, r) => r.productName || r.name || `Sản phẩm #${r.productId}` },
                                { title: 'Đơn giá', dataIndex: 'price', key: 'price', render: formatVND },
                                { title: 'SL', dataIndex: 'quantity', key: 'qty' },
                                { title: 'Thành tiền', key: 'total', render: (_, r) => formatVND(r.price * r.quantity) }
                            ]}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SupportOrdersPage;
