import React, { useContext } from 'react';
import { Button, Form, Input, Row, Col, Tabs, notification } from "antd";
import './styles/login.css';
import { Link, useNavigate } from "react-router-dom";
import { loginAPI } from "../services/api.service";
import { AuthContext } from "../context/auth.context";
const LoginPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const {user,setUser} = useContext(AuthContext);

    const onFinish = async (values) => {
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
    
    console.log(">>>>> user:",user );
    return (
        <div className="login-container">
            <Row className="login-row">
                <Col xs={0} md={12} className="image-col">
                    <div className="image-overlay">
                        <div className="brand-content">
                            <h1>SWP Glasses </h1>
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