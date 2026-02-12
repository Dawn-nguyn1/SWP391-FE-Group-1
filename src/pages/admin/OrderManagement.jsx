import React, { useState } from 'react';
import {
    Table,
    Tag,
    Space,
    Button,
    Card,
    Typography,
    Tabs,
    Badge,
    Modal,
    Descriptions,
    Steps
} from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    TruckOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const OrderManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const mockOrders = [
        {
            key: '1',
            orderId: 'ORD-2026-001',
            customer: 'Nguyễn Văn A',
            date: '11/02/2026',
            total: '2,500,000đ',
            status: 'Pending',
            type: 'In-Stock',
            items: [{ name: 'Aviator Classic', price: '2,500,000đ', qty: 1 }]
        },
        {
            key: '2',
            orderId: 'ORD-2026-002',
            customer: 'Trần Thị B',
            date: '10/02/2026',
            total: '1,500,000đ (Cọc)',
            status: 'Waiting Stocks',
            type: 'Pre-Order',
            items: [{ name: 'Executive Titan', price: '5,000,000đ', qty: 1 }]
        },
        {
            key: '3',
            orderId: 'ORD-2026-003',
            customer: 'Lê Văn C',
            date: '09/02/2026',
            total: '3,200,000đ',
            status: 'Shipping',
            type: 'In-Stock',
            items: [{ name: 'Round Metal', price: '3,200,000đ', qty: 1 }]
        },
    ];

    const columns = [
        { title: 'Mã đơn hàng', dataIndex: 'orderId', key: 'orderId' },
        { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
        { title: 'Ngày đặt', dataIndex: 'date', key: 'date' },
        { title: 'Tổng cộng', dataIndex: 'total', key: 'total' },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color={type === 'In-Stock' ? 'blue' : 'purple'}>{type}</Tag>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'gold';
                if (status === 'Shipping') color = 'blue';
                if (status === 'Completed') color = 'green';
                if (status === 'Waiting Stocks') color = 'cyan';
                return <Badge status={status === 'Completed' ? 'success' : 'processing'} text={<Tag color={color}>{status}</Tag>} />;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EyeOutlined />} onClick={() => showOrderDetails(record)}>Chi tiết</Button>
                    {record.status === 'Pending' && (
                        <Button type="primary" icon={<CheckCircleOutlined />}>Xác nhận</Button>
                    )}
                    {record.status === 'Confirmed' && (
                        <Button type="primary" icon={<TruckOutlined />}>Giao hàng</Button>
                    )}
                </Space>
            ),
        },
    ];

    const showOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const getStepStatus = (status) => {
        switch (status) {
            case 'Pending': return 0;
            case 'Confirmed': return 1;
            case 'Shipping': return 2;
            case 'Completed': return 3;
            default: return 0;
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2}>Quản lý Đơn hàng</Title>
                <Text type="secondary">Theo dõi và cập nhật trạng thái đơn hàng của hệ thống</Text>
            </div>

            <Card style={{ borderRadius: '8px' }}>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Tất cả đơn hàng" key="1">
                        <Table columns={columns} dataSource={mockOrders} pagination={{ pageSize: 10 }} />
                    </TabPane>
                    <TabPane tab="Chờ xác nhận" key="2">
                        <Table columns={columns} dataSource={mockOrders.filter(o => o.status === 'Pending')} />
                    </TabPane>
                    <TabPane tab="Pre-order (Chờ hàng)" key="3">
                        <Table columns={columns} dataSource={mockOrders.filter(o => o.status === 'Waiting Stocks')} />
                    </TabPane>
                    <TabPane tab="Đang giao" key="4">
                        <Table columns={columns} dataSource={mockOrders.filter(o => o.status === 'Shipping')} />
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title={`Chi tiết đơn hàng: ${selectedOrder?.orderId}`}
                open={isModalVisible}
                onOk={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        <Steps
                            current={getStepStatus(selectedOrder.status)}
                            items={[
                                { title: 'Chờ xác nhận' },
                                { title: 'Đã xác nhận' },
                                { title: 'Đang giao' },
                                { title: 'Hoàn thành' },
                            ]}
                            style={{ marginBottom: '32px' }}
                        />

                        <Descriptions title="Thông tin khách hàng" bordered column={2}>
                            <Descriptions.Item label="Họ tên">{selectedOrder.customer}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">0901xxxxxx</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh</Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: '24px' }}>
                            <Title level={5}>Danh sách sản phẩm</Title>
                            <Table
                                dataSource={selectedOrder.items}
                                columns={[
                                    { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
                                    { title: 'Số lượng', dataIndex: 'qty', key: 'qty' },
                                    { title: 'Thành tiền', dataIndex: 'price', key: 'price' },
                                ]}
                                pagination={false}
                                size="small"
                            />
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'right' }}>
                            <Title level={4}>Tổng thanh toán: {selectedOrder.total}</Title>
                            {selectedOrder.type === 'Pre-Order' && (
                                <Text type="warning">Lưu ý: Đơn hàng Pre-order đã thanh toán cọc 30%</Text>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderManagement;
