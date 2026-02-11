import React from 'react';
import {
    Row,
    Col,
    Typography,
    Table,
    InputNumber,
    Button,
    Card,
    Divider,
    Space,
    Empty,
    Badge,
    notification
} from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '../context/cart.context';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            render: (_, record) => {
                const isPreOrder = record.status === 'Pre-order';
                return (
                    <Space size="large" align="start">
                        <Badge count={isPreOrder ? 'Pre-order' : 0} offset={[-10, 10]} color="gold">
                            <img src={record.image} alt={record.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                        </Badge>
                        <div>
                            <Text strong style={{ fontSize: '1.1rem', display: 'block' }}>{record.name}</Text>
                            <Text type="secondary" block>{record.brand}</Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Giá đơn vị',
            key: 'unitPrice',
            render: (_, record) => {
                const framePrice = parseInt(record.price.toString().replace(/[^\d]/g, ''));
                return (
                    <Text strong>{framePrice.toLocaleString('vi-VN')}đ</Text>
                );
            }
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            render: (_, record) => (
                <InputNumber
                    min={1}
                    max={10}
                    value={record.quantity}
                    onChange={(val) => updateQuantity(record.cartKey, val)}
                />
            ),
        },
        {
            title: 'Thành tiền',
            key: 'subtotal',
            render: (_, record) => {
                const framePrice = parseInt(record.price.toString().replace(/[^\d]/g, ''));
                const total = framePrice * record.quantity;
                return (
                    <Space direction="vertical" align="end" size={0}>
                        <Text strong>{total.toLocaleString('vi-VN')}đ</Text>
                        {record.status === 'Pre-order' && (
                            <Text type="danger" style={{ fontSize: '12px' }}>Cọc 30%: {(total * 0.3).toLocaleString('vi-VN')}đ</Text>
                        )}
                    </Space>
                );
            }
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                        removeFromCart(record.cartKey);
                        notification.info({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
                    }}
                />
            ),
        },
    ];

    const depositTotal = cart.reduce((acc, item) => {
        if (item.status !== 'Pre-order') return acc;
        const framePrice = parseInt(item.price.toString().replace(/[^\d]/g, ''));
        const total = framePrice * item.quantity;
        return acc + (total * 0.3);
    }, 0);

    const instockTotal = cart.reduce((acc, item) => {
        if (item.status === 'Pre-order') return acc;
        const framePrice = parseInt(item.price.toString().replace(/[^\d]/g, ''));
        const total = framePrice * item.quantity;
        return acc + total;
    }, 0);

    const totalToPayNow = instockTotal + depositTotal;

    if (cart.length === 0) {
        return (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<Title level={4}>Giỏ hàng của bạn đang trống</Title>}
                >
                    <Button type="primary" size="large" onClick={() => navigate('/products')}>Tiếp tục mua sắm</Button>
                </Empty>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
            <Title level={2} style={{ marginBottom: '32px', fontFamily: 'var(--font-heading)' }}>
                <ShoppingCartOutlined /> Giỏ hàng của bạn ({cartCount})
            </Title>

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={16}>
                    <Card styles={{ body: { padding: 0 } }} style={{ border: 'none', boxShadow: 'var(--shadow-sm)' }}>
                        <Table
                            dataSource={cart}
                            columns={columns}
                            pagination={false}
                            rowKey="cartKey"
                        />
                    </Card>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        style={{ marginTop: '24px' }}
                        onClick={() => navigate('/products')}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Tóm tắt đơn hàng" style={{ border: 'none', boxShadow: 'var(--shadow-sm)' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Tổng giá trị sản phẩm</Text>
                                <Text strong>{cartTotal.toLocaleString('vi-VN')}đ</Text>
                            </div>
                            {depositTotal > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>Tiền cọc Pre-order (30%)</Text>
                                    <Text type="danger">-{(cartTotal - totalToPayNow).toLocaleString('vi-VN')}đ</Text>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Phí vận chuyển</Text>
                                <Text type="success">Miễn phí</Text>
                            </div>
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Title level={4}>Thanh toán ngay</Title>
                                <Title level={4} style={{ color: 'var(--primary-color)' }}>{totalToPayNow.toLocaleString('vi-VN')}đ</Title>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                block
                                style={{ height: '56px', marginTop: '16px', fontSize: '1.2rem' }}
                                onClick={() => navigate('/checkout')}
                            >
                                Tiến hành thanh toán
                            </Button>
                            {depositTotal > 0 && (
                                <Text type="secondary" align="center" style={{ display: 'block', mt: '12px', fontSize: '12px' }}>
                                    Số tiền còn lại sẽ thanh toán khi hàng về.
                                </Text>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CartPage;
