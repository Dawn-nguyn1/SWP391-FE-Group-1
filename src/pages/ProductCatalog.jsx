import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Layout,
    Typography,
    Breadcrumb,
    Row,
    Col,
    Select,
    Checkbox,
    Slider,
    Card,
    Pagination,
    Tag,
    Empty
} from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const ProductCatalog = () => {

    // Mock data for products
    const products = [
        { id: 1, name: 'Aviator Gold Premium', price: 3500000, brand: 'Ray-Ban', type: 'Sunglasses', status: 'In-Stock', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' },
        { id: 2, name: 'Executive Titan', price: 5200000, brand: 'Oakley', type: 'Prescription', status: 'Pre-Order', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400' },
        { id: 3, name: 'Urban Minimalist', price: 1800000, brand: 'Genetix', type: 'Prescription', status: 'In-Stock', image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400' },
        { id: 4, name: 'Retro Round Wood', price: 2900000, brand: 'Gucci', type: 'Sunglasses', status: 'In-Stock', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400' },
        { id: 5, name: 'Sport Flex Z', price: 2400000, brand: 'Oakley', type: 'Sport', status: 'Pre-Order', image: 'https://images.unsplash.com/photo-1574258495973-f327dfca5301?w=400' },
        { id: 6, name: 'Classic Black Horn', price: 4100000, brand: 'Prada', type: 'Sunglasses', status: 'In-Stock', image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400' },
    ];

    return (
        <div style={{ background: 'var(--surface-color)', minHeight: '100vh', paddingBottom: '60px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--spacing-lg)' }}>
                <Breadcrumb style={{ marginBottom: 'var(--spacing-md)' }}>
                    <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
                    <Breadcrumb.Item>Bộ sưu tập</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-xl)' }}>
                    <div>
                        <Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Tất cả sản phẩm</Title>
                        <Text type="secondary">Khám phá {products.length} mẫu kính mắt phong cách nhất</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Text strong>Sắp xếp:</Text>
                        <Select defaultValue="newest" style={{ width: 180 }}>
                            <Select.Option value="newest">Mới nhất</Select.Option>
                            <Select.Option value="price-asc">Giá: Thấp đến Cao</Select.Option>
                            <Select.Option value="price-desc">Giá: Cao đến Thấp</Select.Option>
                        </Select>
                    </div>
                </div>

                <Layout style={{ background: 'transparent' }}>
                    <Sider
                        width={280}
                        breakpoint="lg"
                        collapsedWidth="0"
                        style={{
                            background: '#fff',
                            borderRadius: 'var(--border-radius-md)',
                            padding: '24px',
                            marginRight: '32px',
                            height: 'fit-content',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <FilterOutlined style={{ color: 'var(--primary-color)' }} />
                            <Text strong style={{ fontSize: '1.1rem' }}>Bộ lọc</Text>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '16px' }}>Loại sản phẩm</Text>
                            <Checkbox.Group style={{ width: '100%' }}>
                                <Row>
                                    <Col span={24} style={{ marginBottom: '8px' }}><Checkbox value="sunglasses">Kính mát</Checkbox></Col>
                                    <Col span={24} style={{ marginBottom: '8px' }}><Checkbox value="prescription">Kính cận/viễn</Checkbox></Col>
                                    <Col span={24} style={{ marginBottom: '8px' }}><Checkbox value="sport">Kính thể thao</Checkbox></Col>
                                </Row>
                            </Checkbox.Group>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '16px' }}>Tình trạng kho</Text>
                            <Checkbox.Group style={{ width: '100%' }}>
                                <Row>
                                    <Col span={24} style={{ marginBottom: '8px' }}><Checkbox value="in-stock">Có sẵn (In-Stock)</Checkbox></Col>
                                    <Col span={24} style={{ marginBottom: '8px' }}><Checkbox value="pre-order">Đặt trước (Pre-Order)</Checkbox></Col>
                                </Row>
                            </Checkbox.Group>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '16px' }}>Thương hiệu</Text>
                            <Checkbox.Group style={{ width: '100%' }}>
                                <Row>
                                    <Col span={24} style={{ marginBottom: '8px' }}><Checkbox value="rayban">Ray-Ban</Checkbox></Col>
                                    <Col span={24} style={{ marginBottom: '8px' }}><Checkbox value="gucci">Gucci</Checkbox></Col>
                                    <Col span={24} style={{ marginBottom: '8px' }}><Checkbox value="oakley">Oakley</Checkbox></Col>
                                </Row>
                            </Checkbox.Group>
                        </div>

                        <div>
                            <Text strong style={{ display: 'block', marginBottom: '16px' }}>Khoảng giá (VNĐ)</Text>
                            <Slider range min={500000} max={10000000} defaultValue={[1000000, 7000000]} step={500000} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                <Text type="secondary">500k</Text>
                                <Text type="secondary">10M</Text>
                            </div>
                        </div>
                    </Sider>

                    <Content>
                        {products.length > 0 ? (
                            <>
                                <Row gutter={[24, 24]}>
                                    {products.map(product => (
                                        <Col xs={24} sm={12} xl={8} key={product.id}>
                                            <Link to={`/product/${product.id}`}>
                                                <Card
                                                    hoverable
                                                    cover={
                                                        <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                                                            <img alt={product.name} src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                                                                <Tag color={product.status === 'In-Stock' ? 'green' : 'gold'} style={{ border: 'none', fontWeight: 600 }}>
                                                                    {product.status === 'In-Stock' ? 'CÓ SẴN' : 'ĐẶT TRƯỚC'}
                                                                </Tag>
                                                            </div>
                                                        </div>
                                                    }
                                                    style={{ border: 'none', borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-sm)' }}
                                                    styles={{ body: { padding: '20px' } }}
                                                >
                                                    <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase' }}>{product.brand}</Text>
                                                    <Title level={5} style={{ margin: '4px 0 12px 0' }}>{product.name}</Title>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                                                            {product.price.toLocaleString('vi-VN')}đ
                                                        </Text>
                                                        <Tag color="blue">{product.type}</Tag>
                                                    </div>
                                                </Card>
                                            </Link>
                                        </Col>
                                    ))}
                                </Row>
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
                                    <Pagination defaultCurrent={1} total={50} />
                                </div>
                            </>
                        ) : (
                            <Empty description="Không tìm thấy sản phẩm" style={{ marginTop: '100px' }} />
                        )}
                    </Content>
                </Layout>
            </div>
        </div>
    );
};

export default ProductCatalog;
