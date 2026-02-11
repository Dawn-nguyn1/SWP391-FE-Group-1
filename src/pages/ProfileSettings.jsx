import React, { useContext, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Card, Typography, Divider, notification, Avatar } from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/auth.context';

const { Title, Text } = Typography;

const ProfileSettings = () => {
    const { user, setUser } = useContext(AuthContext);
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Profile updated:', values);
        // Sync with AuthContext
        setUser(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                fullName: values.fullName,
                phone: values.phone,
                address: values.address
            }
        }));

        notification.success({
            message: 'Cập nhật thành công',
            description: 'Thông tin cá nhân của bạn đã được lưu lại.',
            placement: 'bottomRight'
        });
    };

    // Pre-fill form when user data changes
    useEffect(() => {
        if (user?._id) {
            form.setFieldsValue({
                fullName: user.profile?.fullName,
                phone: user.profile?.phone,
                address: user.profile?.address
            });
        }
    }, [user, form]);

    return (
        <div>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: 'var(--primary-color)', marginBottom: '16px' }} />
                <Title level={4} style={{ margin: 0 }}>Thông tin tài khoản</Title>
                <Text type="secondary">Quản lý thông cá nhân và bảo mật của bạn</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    fullName: user.profile?.fullName || '',
                    email: user.email || 'customer@genetix.vn',
                    phone: user.profile?.phone || '',
                    address: user.profile?.address || ''
                }}
                onFinish={onFinish}
            >
                <Card style={{ border: 'none', boxShadow: 'var(--shadow-sm)' }}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Địa chỉ Email (Không thể thay đổi)" name="email">
                                <Input size="large" disabled />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Địa chỉ giao hàng mặc định" name="address">
                                <Input.TextArea size="large" rows={3} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            size="large"
                            style={{ padding: '0 40px', height: '48px' }}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </Card>
            </Form>

            <Card title="Đổi mật khẩu" style={{ marginTop: '32px', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
                <Form layout="vertical">
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label="Mật khẩu hiện tại" name="currentPassword">
                                <Input.Password size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Mật khẩu mới" name="newPassword">
                                <Input.Password size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword">
                                <Input.Password size="large" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="default" size="large">Cập nhật mật khẩu</Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ProfileSettings;
