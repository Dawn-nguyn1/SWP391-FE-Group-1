import React from 'react';
import { Button, Form, Input, Row, Col, Tabs, notification, DatePicker, Select } from "antd";
import dayjs from 'dayjs';
import { Link, useNavigate } from "react-router-dom";
import Glasses_1 from '../assets/glasses_1.jpg';
import './styles/register.css';
import { registerUserAPI } from '../services/api.service';

const RegisterPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        console.log("Register data:", values);

        // Convert dob dayjs object to string
        const formattedValues = {
            ...values,
            dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null // Use dayjs format method
        };

        console.log("Formatted values:", formattedValues);

        try {
            const res = await registerUserAPI(formattedValues.fullName, formattedValues.email, formattedValues.password, formattedValues.confirmPassword, formattedValues.phone, formattedValues.dob, formattedValues.gender);
            console.log("Response:", res);
            if (res) {
                notification.success({
                    title: "OTP Sent",
                    description: "Mã OTP đã được gửi đến email của bạn!",
                });
                // Navigate to OTP verification page with email
                navigate('/verify-register-otp', { state: { email: formattedValues.email } });
            }
        } catch (error) {
            console.log("Register error:", error);
            
            // Get error message from API response
            // let errorMessage = "Tạo tài khoản thất bại!";
            // if (error?.message) {
            //     errorMessage = error.message;
            // } else if (error?.error) {
            //     errorMessage = error.error;
            // } else if (typeof error === 'string') {
            //     errorMessage = error;
            // }
            
            notification.error({
                title: "Register failed",
                description: error.message,
            });
        }
    };
    const handleTabChange = (key) => {
        if (key === 'login') {
            navigate('/login');
        }
    };

    const items = [
        {
            key: 'login',
            label: 'Đăng nhập',
        },
        {
            key: 'register',
            label: 'Đăng ký',
            children: (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="modern-form"
                >
                    <div className="form-header">
                        <h2>Tạo tài khoản mới!</h2>
                        <p>Vui lòng nhập thông tin để đăng ký.</p>
                    </div>

                    <Form.Item
                        label="Full Name"
                        name="fullName"
                        rules={[{ required: true, message: 'Please input your fullName!' }]}
                    >
                        <Input
                            placeholder="Nhập họ tên của bạn"
                            className="modern-input"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[{ required: true, message: 'Please input your phone number!' }]}
                    >
                        <Input
                            placeholder="Nhập số điện thoại của bạn"
                            className="modern-input"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: "email", message: 'Email không đúng định dạng!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập email của bạn"
                            className="modern-input"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu của bạn"
                            className="modern-input"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Nhập lại mật khẩu của bạn"
                            className="modern-input"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Date of Birth"
                        name="dob"
                        rules={[
                            { required: true, message: 'Please select your date of birth!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    
                                    // Calculate age
                                    const today = new Date();
                                    const birthDate = new Date(value);
                                    let age = today.getFullYear() - birthDate.getFullYear();
                                    const monthDiff = today.getMonth() - birthDate.getMonth();
                                    
                                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                        age--;
                                    }
                                    
                                    // Check if user is at least 16 years old
                                    if (age < 16) {
                                        return Promise.reject(new Error('Bạn phải đủ 16 tuổi trở lên!'));
                                    }
                                    
                                    // Check if date is in the future
                                    if (birthDate > today) {
                                        return Promise.reject(new Error('Ngày sinh không thể là ngày trong tương lai!'));
                                    }
                                    
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            placeholder="Chọn ngày sinh, ví dụ: 2026-03-02"
                            className="modern-input"
                            size="large"
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Gender"
                        name="gender"
                        rules={[{ required: true, message: 'Please select your gender!' }]}
                    >
                        <Select
                            placeholder="Chọn giới tính"
                            className="modern-input"
                            size="large"
                            options={[
                                { value: 0, label: 'Nam' },
                                { value: 1, label: 'Nữ' },
                                { value: 2, label: 'Khác' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item className="form-actions">
                        <Button
                            htmlType="submit"
                            type="primary"
                            className="modern-button"
                            size="large"
                            block
                        >
                            Đăng ký
                        </Button>
                    </Form.Item>

                    <div className="form-footer">
                        <span>Đã có tài khoản? </span>
                        <Link to="/login" className="modern-link">Đăng nhập tại đây</Link>
                    </div>
                </Form>
            ),
        },
    ];

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
                        <Tabs
                            defaultActiveKey="register"
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

export default RegisterPage;