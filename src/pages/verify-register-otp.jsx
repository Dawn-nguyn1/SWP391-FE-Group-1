import React, { useState } from 'react';
import { Button, Form, Input, Row, Col, notification } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Glasses_1 from '../assets/glasses_1.jpg';
import './styles/register.css';
import { verifyRegisterOTPAPI } from '../services/api.service';

const VerifyRegisterOTPPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    
    // Get email from location state
    const email = location.state?.email || '';

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log("OTP verification data:", { email, otp: values.otp });
            
            const res = await verifyRegisterOTPAPI(email, values.otp);
            console.log("OTP verification response:", res);
            
            // API returns text/plain: "Account verification completed"
            if (res) {
                notification.success({
                    title: "Verification Success",
                    description: "Xác thực OTP thành công! Tài khoản đã được kích hoạt.",
                });
                navigate('/login');
            } else {
                notification.error({
                    title: "Verification Failed",
                    description: "Mã OTP không đúng. Vui lòng thử lại!",
                });
            }
        } catch (error) {
            console.error("OTP verification error:", error);
            notification.error({
                title: "Verification Failed",
                description: "Xác thực OTP thất bại!",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <Row className="register-row">
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
                                <h2>Xác thực OTP</h2>
                                <p>Nhập mã OTP đã được gửi đến email: {email}</p>
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

                            <Form.Item className="form-actions">
                                <Button
                                    htmlType="submit"
                                    type="primary"
                                    className="modern-button"
                                    size="large"
                                    block
                                    loading={loading}
                                >
                                    Xác thực OTP
                                </Button>
                            </Form.Item>

                            <div className="form-footer">
                                <span>Quay lại </span>
                                <Link to="/register" className="modern-link">Đăng ký</Link>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default VerifyRegisterOTPPage;
