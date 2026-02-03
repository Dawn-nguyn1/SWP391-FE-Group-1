import React, { useState } from 'react';
import { Button, Form, Input, Row, Col, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordAPI } from '../services/api.service';
import './styles/login.css';

const ForgetPasswordPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [emailSent, setEmailSent] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');

    const onFinish = async (values) => {
        setLoading(true);
        setCountdown(10);
        setCurrentEmail(values.email);
        
        try {
            const res = await forgotPasswordAPI(values.email);
            console.log("Response từ forgot-password API:", res);
            
            if (res) {
                setEmailSent(values.email);
                notification.success({
                    message: "Email sent",
                    description: JSON.stringify(res),
                });
                
                // Start countdown
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setLoading(false);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
                
            } else {
                setLoading(false);
                notification.error({
                    message: "Send failed", 
                    description: "Gửi email thất bại!",
                });
            }
        } catch (error) {
            console.error("Error sending forgot password:", error);
            setLoading(false);
            notification.error({
                message: "Send failed",
                description: "Gửi email thất bại!",
            });
        }
    };

    const handleGoToReset = () => {
        navigate('/reset-password', { state: { email: currentEmail } });
    };

    return (
        <div className="login-container">
            <Row className="login-row">
                <Col xs={0} md={12} className="image-col">
                    <div className="image-overlay">
                        <div className="brand-content">
                            <h1>SWP Glasses</h1>
                            <p>Mua kính mắt chất lượng cao trực tuyến</p>
                        </div>
                    </div>
                </Col>
                <Col xs={24} md={12} className="form-col">
                    <div className="form-container">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            className="modern-form"
                        >
                            <div className="form-header">
                                <h2>Quên mật khẩu?</h2>
                                <p>Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.</p>
                            </div>
                            
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Email không được để trống!' },
                                    { type: "email", message: 'Email không đúng định dạng!' }
                                ]}
                            >
                                <Input
                                    placeholder="Nhập email của bạn"
                                    className="modern-input"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item className="form-actions">
                                <Button
                                    htmlType="submit"
                                    type="default"
                                    style={{ backgroundColor: '#7575f0ff', borderColor: '#667eea', color: '#667eea' }}

                                    className="modern-button"
                                    size="large"
                                    block
                                    loading={loading}
                                    disabled={countdown > 0}
                                >
                                    {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi mã OTP'}
                                </Button>
                            </Form.Item>

                            {emailSent && (
                                <Form.Item className="form-actions">
                                    <Button
                                        type="primary"
                                        className="modern-button"
                                        size="large"
                                        block
                                        onClick={handleGoToReset}
                                    >
                                        Đã nhận được mã, đến reset
                                    </Button>
                                </Form.Item>
                            )}

                            <div className="form-footer">
                                <span>Đã nhớ mật khẩu? </span>
                                <Link to="/login" className="modern-link">Đăng nhập tại đây</Link>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default ForgetPasswordPage;
