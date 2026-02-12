import React, { useState, useContext, useEffect } from 'react';
import {
    Row,
    Col,
    Typography,
    Form,
    Input,
    Radio,
    Button,
    Card,
    Divider,
    Space,
    Steps,
    Result,
    Badge,
    Checkbox,
    Tag
} from 'antd';
import {
    CheckCircleOutlined,
    ShoppingOutlined,
    CreditCardOutlined,
    UserOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { useCart } from '../context/cart.context';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const { Title, Text } = Typography;

const CheckoutFlow = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useContext(AuthContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [useDefaultAddress, setUseDefaultAddress] = useState(!!user?._id);

    // Set initial values from user profile if logged in
    useEffect(() => {
        if (user?._id) {
            form.setFieldsValue({
                fullName: user.profile?.fullName,
                phone: user.profile?.phone,
                address: user.profile?.address
            });
            setUseDefaultAddress(true);
        }
    }, [user, form]);

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
    const remainingAmount = cartTotal - totalToPayNow;

    const onFinish = (values) => {
        const finalValues = useDefaultAddress ? {
            fullName: user.profile?.fullName,
            phone: user.profile?.phone,
            address: user.profile?.address,
            paymentMethod: values.paymentMethod
        } : values;

        console.log('Order received:', finalValues);
        // Simulate API call
        setTimeout(() => {
            setOrderConfirmed(true);
            clearCart();
        }, 1500);
    };

    // Shopee style Address Section
    const renderAddressSection = () => {
        const hasProfile = user?._id && user.profile?.address;

        if (useDefaultAddress && hasProfile) {
            return (
                <Card
                    style={{ border: 'none', boxShadow: 'var(--shadow-sm)', marginBottom: '24px', borderTop: '4px solid var(--primary-color)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Space>
                            <EnvironmentOutlined style={{ color: 'var(--primary-color)', fontSize: '20px' }} />
                            <Title level={5} style={{ margin: 0 }}>Địa chỉ nhận hàng</Title>
                        </Space>
                        <Button type="link" onClick={() => setUseDefaultAddress(false)}>Thay đổi</Button>
                    </div>
                    <div style={{ paddingLeft: '28px' }}>
                        <Text strong style={{ fontSize: '16px' }}>{user.profile.fullName} | {user.profile.phone}</Text>
                        <br />
                        <Text type="secondary">{user.profile.address}</Text>
                        <br />
                        <Tag color="red" style={{ marginTop: '8px' }}>Mặc định</Tag>
                    </div>
                </Card>
            );
        }

        return (
            <Card
                title={<Space><EnvironmentOutlined /> Nhập địa chỉ giao hàng mới</Space>}
                style={{ border: 'none', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}
                extra={hasProfile && <Button type="link" onClick={() => setUseDefaultAddress(true)}>Dùng địa chỉ mặc định</Button>}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                            <Input placeholder="Nguyễn Văn A" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                            <Input placeholder="0901xxxxxx" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Địa chỉ nhận hàng" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                            <Input.TextArea placeholder="Số nhà, tên đường, phường/xã..." rows={3} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
        );
    };

    if (orderConfirmed) {
        return (
            <div style={{ padding: '80px 0' }}>
                <Result
                    status="success"
                    title="Đặt hàng thành công!"
                    subTitle={`Mã đơn hàng: ORD-2026-${Math.random().toString(36).substr(2, 5).toUpperCase()}. Chúng tôi sẽ sớm liên hệ để xác nhận.`}
                    extra={[
                        <Button type="primary" key="home" onClick={() => navigate('/homepage')}>Về trang chủ</Button>,
                        <Button key="orders" onClick={() => navigate('/homepage')}>Xem đơn hàng của tôi</Button>,
                    ]}
                >
                    {remainingAmount > 0 && (
                        <div style={{ textAlign: 'center', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                            <Text strong>Lưu ý:</Text> Bạn đã thanh toán {totalToPayNow.toLocaleString('vi-VN')}đ tiền cọc.
                            Số tiền còn lại <Text type="danger">{remainingAmount.toLocaleString('vi-VN')}đ</Text> sẽ được thanh toán khi hàng về kho.
                        </div>
                    )}
                </Result>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', fontFamily: 'var(--font-heading)' }}>
                Thanh toán đơn hàng
            </Title>

            <Steps
                current={currentStep}
                style={{ marginBottom: '48px' }}
                items={[
                    { title: 'Thông tin', icon: <UserOutlined /> },
                    { title: 'Thanh toán', icon: <CreditCardOutlined /> },
                    { title: 'Hoàn tất', icon: <CheckCircleOutlined /> },
                ]}
            />

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={15}>
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        {renderAddressSection()}

                        <Card title="Phương thức thanh toán" style={{ border: 'none', boxShadow: 'var(--shadow-sm)' }}>
                            <Form.Item name="paymentMethod" initialValue="cod">
                                <Radio.Group style={{ width: '100%' }}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Radio value="cod" style={{ padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px', width: '100%' }}>
                                            <Space>
                                                <ShoppingOutlined />
                                                Thanh toán khi nhận hàng (COD)
                                            </Space>
                                        </Radio>
                                        <Radio value="bank" style={{ padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px', width: '100%' }}>
                                            <Space>
                                                <CreditCardOutlined />
                                                Chuyển khoản ngân hàng (Giảm 2%)
                                            </Space>
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                block
                                style={{ height: '56px', marginTop: '24px', fontSize: '1.2rem' }}
                            >
                                Xác nhận Đặt hàng
                            </Button>
                        </Card>
                    </Form>
                </Col>

                <Col xs={24} lg={9}>
                    <Card title="Sản phẩm của bạn" style={{ border: 'none', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '24px' }}>
                            {cart.map(item => {
                                const isPre = item.status === 'Pre-order';
                                const frameP = parseInt(item.price.toString().replace(/[^\d]/g, ''));
                                const itemT = frameP * item.quantity;
                                return (
                                    <div key={item.cartKey} style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'start' }}>
                                        <Badge count={isPre ? 'Pre' : 0} size="small" color="gold">
                                            <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                        </Badge>
                                        <div style={{ flex: 1 }}>
                                            <Text strong block>{item.name}</Text>
                                            <Text type="secondary" size="small">SL: {item.quantity}</Text>
                                            {isPre && <Text type="danger" style={{ fontSize: '11px', display: 'block' }}>Cọc 30%</Text>}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <Text strong block>{itemT.toLocaleString('vi-VN')}đ</Text>
                                            {isPre && <Text type="secondary" style={{ fontSize: '11px' }}>({(itemT * 0.3).toLocaleString('vi-VN')}đ)</Text>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Divider />
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Tổng giá trị đơn hàng</Text>
                                <Text strong>{cartTotal.toLocaleString('vi-VN')}đ</Text>
                            </div>
                            {remainingAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>Tiền cọc cần trả trước</Text>
                                    <Text type="danger">-{remainingAmount.toLocaleString('vi-VN')}đ</Text>
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
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CheckoutFlow;
