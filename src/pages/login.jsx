import React, { useContext } from 'react';
import { Button, Form, Input, Row, Col, Tabs, notification, Typography } from "antd";
const { Text } = Typography;
import './styles/login.css';
import { Link, useNavigate } from "react-router-dom";
import { loginAPI } from "../services/api.service";
import { AuthContext } from "../context/auth.context";
const LoginPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const onFinish = async (values) => {
        // Mock login for testing purposes
        if (values.username === 'test@genetix.vn' && values.password === '123') {
            const mockRes = {
                accessKey: 'mock-token-123',
                _id: 'mock-user-id',
                email: 'test@genetix.vn',
                profile: {
                    fullName: 'Người Dùng Thử Nghiệm',
                    phone: '0987654321',
                    address: 'Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh'
                }
            };
            notification.success({
                message: "Đăng nhập thử nghiệm",
                description: "Đang vào hệ thống với tài khoản test.",
            });
            localStorage.setItem("access_token", mockRes.accessKey);
            setUser(mockRes);
            navigate('/homepage');
            return;
        }

        const res = await loginAPI(values.username, values.password);
        if (res && res.accessKey) {
            notification.success({
                title: "Login success",
                description: "Đăng nhập thành công!",
            });
            localStorage.setItem("access_token", res.accessKey);
            setUser(res);
            navigate('/homepage');
        } else {
            notification.error({
                title: "Login failed",
                // description: JSON.stringify(res.message),
                description: "Đăng nhập thất bại!",
            });
        }

    };

    const handleTabChange = (key) => {
        if (key === 'register') {
            navigate('/register');
        }
    };

    const items = [
        {
            key: 'login',
            label: 'Đăng nhập',
            children: (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="modern-form"
                >
                    <div className="form-header">
                        <h2>Chào mừng bạn!</h2>
                        <p>Vui lòng nhập thông tin để đăng nhập.</p>
                    </div>

                    <Form.Item
                        label="Username (email)"
                        name="username"
                        rules={[
                            { required: true, message: 'username không được để trống!' },
                            { type: "email", message: 'username không đúng định dạng!' },
                        ]}
                    >
                        <Input
                            placeholder="Nhập username của bạn"
                            className="modern-input"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Password không được để trống!' },
                        ]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu của bạn"
                            className="modern-input"
                            size="large"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') form.submit()
                            }}
                        />
                    </Form.Item>

                    <Form.Item className="form-actions">
                        <Button
                            type="primary"
                            onClick={() => form.submit()}
                            className="modern-button"
                            size="large"
                            block
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <div className="forget-password">
                        <Link to="/forget-password" className="forget-link">Quên mật khẩu?</Link>
                    </div>

                    <div style={{ marginTop: '16px', padding: '12px', border: '1px dashed #d9d9d9', borderRadius: '8px', textAlign: 'center' }}>
                        <Text type="secondary">Tài khoản test (Dành cho Dev):</Text><br />
                        <Text strong>test@genetix.vn</Text> / <Text strong>123</Text>
                    </div>

                    <div className="form-footer">
                        <span>Chưa có tài khoản? </span>
                        <Link to="/register" className="modern-link">Đăng ký tại đây</Link>
                    </div>
                </Form>
            ),
        },
        {
            key: 'register',
            label: 'Đăng ký',
        },
    ];

    console.log(">>>>> user:", user);
    return (
        <div className="login-container">
            <Row className="login-row">
                <Col xs={0} md={12} className="image-col">
                    <div className="image-overlay">
                        <div className="brand-content">
                            <h1>GENETIX </h1>
                            <p> Mua kính mắt chất lượng cao trực tuyến</p>
                        </div>
                    </div>
                </Col>
                <Col xs={24} md={12} className="form-col">
                    <div className="form-container">
                        <Tabs
                            defaultActiveKey="login"
                            centered
                            items={items}
                            className="modern-tabs"
                            onChange={handleTabChange}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default LoginPage;