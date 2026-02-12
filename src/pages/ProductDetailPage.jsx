import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Typography,
    Button,
    Tag,
    Rate,
    Divider,
    Space,
    Badge,
    Card,
    notification
} from 'antd';
import {
    ShoppingCartOutlined,
    ThunderboltOutlined,
    SafetyCertificateOutlined,
    SyncOutlined,
    TruckOutlined
} from '@ant-design/icons';
import { useCart } from '../context/cart.context';

const { Title, Text, Paragraph } = Typography;

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);

    // Mock fetching product data
    useEffect(() => {
        const mockProducts = [
            { id: 1, name: 'Aviator Gold Premium', price: '3,500,000đ', brand: 'Ray-Ban', type: 'Frame', status: 'In-Stock', description: 'Trải nghiệm phong cách cổ điển vượt thời gian với Aviator Gold Premium. Gọng kính mạ vàng 18K tinh xảo.', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800' },
            { id: 2, name: 'Executive Titan', price: '5,200,000đ', brand: 'Oakley', type: 'Frame', status: 'Pre-order', description: 'Dòng kính cao cấp dành cho doanh nhân. Chất liệu Titanium siêu nhẹ, bền bỉ và đẳng cấp.', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800' },
            { id: 3, name: 'Urban Minimalist', price: '1,800,000đ', brand: 'Genetix', type: 'Frame', status: 'In-Stock', description: 'Thiết kế tối giản hiện đại phù hợp với nhịp sống thành thị sôi động.', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800' },
            { id: 4, name: 'Retro Round Wood', price: '2,900,000đ', brand: 'Gucci', type: 'Frame', status: 'In-Stock', description: 'Sự kết hợp độc đáo giữa chất liệu gọng cao cấp và họa tiết vân gỗ sang trọng.', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800' },
        ];

        const found = mockProducts.find(p => p.id === parseInt(id));
        setProduct(found || mockProducts[0]);
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product);
        notification.success({
            message: 'Đã thêm vào giỏ hàng',
            description: `${product.name} đã được thêm vào giỏ hàng của bạn.`,
            placement: 'bottomRight'
        });
    };

    if (!product) return null;

    const isPreOrder = product.status === 'Pre-order';

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
            <Row gutter={[64, 32]}>
                {/* Image Section */}
                <Col xs={24} md={12}>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <Card
                            cover={<img alt={product.name} src={product.image} style={{ borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-lg)' }} />}
                            styles={{ body: { display: 'none' } }}
                        />
                    </div>
                </Col>

                {/* Info Section */}
                <Col xs={24} md={12}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Text type="secondary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</Text>
                            <Title level={1} style={{ margin: '8px 0', fontFamily: 'var(--font-heading)' }}>{product.name}</Title>
                            <Space size="middle">
                                <Rate disabled defaultValue={5} />
                                <Text type="secondary">(120 đánh giá)</Text>
                                <Divider type="vertical" />
                                <Tag color={isPreOrder ? 'gold' : 'green'} style={{ border: 'none', fontWeight: 600 }}>
                                    {isPreOrder ? 'ĐẶT TRƯỚC' : 'CÓ SẴN'}
                                </Tag>
                            </Space>
                        </div>

                        <div>
                            <Title level={2} style={{ color: 'var(--primary-color)', margin: 0 }}>{product.price}</Title>
                            {isPreOrder && (
                                <Text type="danger" style={{ display: 'block', marginTop: 8 }}>
                                    * Chỉ cần thanh toán trước 30% (tương đương {(parseInt(product.price.replace(/[^\d]/g, '')) * 0.3).toLocaleString('vi-VN')}đ)
                                </Text>
                            )}
                        </div>

                        <Paragraph style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.8' }}>
                            {product.description}
                        </Paragraph>

                        <Divider />

                        {isPreOrder && (
                            <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', padding: '16px', borderRadius: '8px', marginBottom: 24 }}>
                                <Title level={5} style={{ margin: '0 0 8px 0', color: '#856404' }}>Thông tin Pre-order</Title>
                                <Space direction="vertical" size={2}>
                                    <Text>• Dự kiến giao hàng: 15/04/2026</Text>
                                    <Text>• Đặc quyền: Tặng kèm hộp kính và vải lau cao cấp</Text>
                                    <Text>• Miễn phí vệ sinh gọng kính trọn đời</Text>
                                </Space>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                style={{ height: '56px', flex: 1, fontSize: '1.1rem' }}
                                onClick={() => handleAddToCart()}
                            >
                                Thêm vào giỏ hàng
                            </Button>

                            <Button
                                type="default"
                                size="large"
                                icon={<ThunderboltOutlined />}
                                style={{
                                    height: '56px',
                                    flex: 1,
                                    fontSize: '1.1rem',
                                    background: 'var(--accent-color)',
                                    border: 'none',
                                    color: 'var(--primary-color)'
                                }}
                                onClick={() => {
                                    handleAddToCart();
                                    navigate('/cart');
                                }}
                            >
                                {isPreOrder ? 'Đặt cọc ngay' : 'Mua ngay'}
                            </Button>
                        </div>

                        <Divider />

                        <Row gutter={[24, 24]}>
                            <Col span={12}>
                                <Space>
                                    <TruckOutlined style={{ fontSize: '24px', color: 'var(--accent-color)' }} />
                                    <div>
                                        <Text strong block>Miễn phí vận chuyển</Text>
                                        <Text type="secondary" size="small">Đối với đơn hàng trên 2tr</Text>
                                    </div>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space>
                                    <SyncOutlined style={{ fontSize: '24px', color: 'var(--accent-color)' }} />
                                    <div>
                                        <Text strong block>Đổi trả 30 ngày</Text>
                                        <Text type="secondary" size="small">Nếu có lỗi từ nhà sản xuất</Text>
                                    </div>
                                </Space>
                            </Col>
                            <Col span={12}>
                                <Space>
                                    <SafetyCertificateOutlined style={{ fontSize: '24px', color: 'var(--accent-color)' }} />
                                    <div>
                                        <Text strong block>Bảo hành 12 tháng</Text>
                                        <Text type="secondary" size="small">Chính hãng GENETIX</Text>
                                    </div>
                                </Space>
                            </Col>
                        </Row>
                    </Space>
                </Col>
            </Row>

            {/* Recommended Products */}
            <div style={{ marginTop: '80px' }}>
                <Title level={3} style={{ marginBottom: '32px' }}>Có thể bạn sẽ thích</Title>
                <Row gutter={[24, 24]}>
                    {[1, 2, 3, 4].map(i => (
                        <Col xs={12} md={6} key={i}>
                            <Card
                                hoverable
                                cover={<img src={`https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400`} />}
                                styles={{ body: { padding: '16px' } }}
                            >
                                <Text strong>Aviator Classic {i}</Text>
                                <br />
                                <Text type="danger">2,500,000đ</Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default ProductDetailPage;
