import React from 'react';
import {
    Table,
    Tag,
    Typography,
    Card,
    Button,
    Space,
    Modal,
    Descriptions,
    Badge,
    Empty
} from 'antd';
import { EyeOutlined, ShoppingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const OrderHistory = () => {
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Mock data for user orders
    const mockOrders = [
        {
            key: '1',
            orderId: 'ORD-2026-X89',
            date: '11/02/2026',
            total: '3,500,000đ',
            status: 'Confirmed',
            type: 'In-Stock',
            items: [
                { name: 'Aviator Gold Premium', price: '3,500,000đ', qty: 1 }
            ]
        },
        {
            key: '2',
            orderId: 'ORD-2026-Y12',
            date: '10/02/2026',
            total: '1,560,000đ (Cọc)',
            status: 'Waiting Stocks',
            type: 'Pre-order',
            items: [
                { name: 'Executive Titan', price: '5,200,000đ', qty: 1 }
            ]
        }
    ];

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Tổng cộng',
            dataIndex: 'total',
            key: 'total',
            render: (total) => <Text style={{ color: 'var(--primary-color)' }}>{total}</Text>
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'In-Stock' ? 'blue' : 'gold'} style={{ border: 'none' }}>
                    {type.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'processing';
                if (status === 'Confirmed') color = 'success';
                if (status === 'Waiting Stocks') color = 'warning';
                return <Badge status={color} text={status} />;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedOrder(record);
                        setIsModalOpen(true);
                    }}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingOutlined style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
                <Title level={4} style={{ margin: 0 }}>Lịch sử đơn hàng</Title>
            </div>

            <Table
                columns={columns}
                dataSource={mockOrders}
                pagination={false}
                locale={{ emptyText: <Empty description="Bạn chưa có đơn hàng nào." /> }}
            />

            <Modal
                title={`Chi tiết đơn hàng: ${selectedOrder?.orderId}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>
                ]}
                width={700}
            >
                {selectedOrder && (
                    <Space direction="vertical" size="large" style={{ width: '100%', marginTop: '16px' }}>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Ngày đặt">{selectedOrder.date}</Descriptions.Item>
                            <Descriptions.Item label="Phương thức">COD</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={2}>
                                <Badge status="processing" text={selectedOrder.status} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                                Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh
                            </Descriptions.Item>
                        </Descriptions>

                        <Table
                            dataSource={selectedOrder.items}
                            pagination={false}
                            size="small"
                            columns={[
                                { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
                                { title: 'SL', dataIndex: 'qty', key: 'qty' },
                                { title: 'Giá', dataIndex: 'price', key: 'price' },
                            ]}
                        />

                        <div style={{ textAlign: 'right' }}>
                            <Text strong style={{ fontSize: '1.2rem' }}>
                                Tổng thanh toán: {selectedOrder.total}
                            </Text>
                        </div>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default OrderHistory;
