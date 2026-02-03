import React, { useState } from 'react';
import { Button, Form, Input, Row, Col, notification } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { resetPasswordAPI } from '../services/api.service';
import './styles/login.css';

const ResetPasswordPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    
    // Get email from previous page
    const email = location.state?.email || '';

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await resetPasswordAPI(email, values.otp, values.newPassword);
            console.log("Response từ reset-password API:", res);
            
            if (res) {
                notification.success({
                    message: "Password reset successful",
                    description: JSON.stringify(res),
                });
                navigate('/login');
            } else {
                notification.error({
                    message: "Reset failed", 
                    description: "Đặt lại mật khẩu thất bại!",
                });
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            console.error("Error response:", error.response);
            notification.error({
                message: "Reset failed",
                description: `Lỗi: ${error.response?.status} - ${error.response?.data || 'Đặt lại mật khẩu thất bại!'}`,
            });
        } finally {
            setLoading(false);
        }
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
                                <h2>Đặt lại mật khẩu</h2>
                                <p>Nhập mã OTP và mật khẩu mới cho tài khoản: {email}</p>
                            </div>
                            
                            <Form.Item
                                label="Mã OTP"
                                name="otp"
                                rules={[
                                    { required: true, message: 'OTP không được để trống!' },
                                    { len: 6, message: 'OTP phải có 6 số!' },
                                    { pattern: /^\d+$/, message: 'OTP chỉ chứa số!' }
                                ]}
                            >
                                <Input
                                    placeholder="Nhập mã OTP 6 số"
                                    className="modern-input"
                                    size="large"
                                    maxLength={6}
                                    style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '8px' }}
                                />
                            </Form.Item>
                            
                            <Form.Item
                                label="Mật khẩu mới"
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Mật khẩu không được để trống!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password
                                    placeholder="Nhập mật khẩu mới"
                                    className="modern-input"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Xác nhận mật khẩu"
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Xác nhận mật khẩu không được để trống!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="modern-input"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item className="form-actions">
                                <Button
                                    htmlType="submit"
                                    type="primary"
                                    className="modern-button"
                                    size="large"
                                    block
                                    loading={loading}
                                >
                                    Đặt lại mật khẩu
                                </Button>
                            </Form.Item>

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

export default ResetPasswordPage;
