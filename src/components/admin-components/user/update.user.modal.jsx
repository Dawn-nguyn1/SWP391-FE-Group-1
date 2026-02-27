import { useEffect, useState } from 'react'
import { Input, notification, Modal, Select, Form, Radio } from "antd";
import { updateUserAPI } from '../../../services/api.service';
import React from 'react';
import moment from 'moment';

const { Option } = Select;

const UpdateUserModal = (props) => {
    const [form] = Form.useForm();
    
    const { 
        isUpdateOpen, 
        setIsUpdateOpen,
        dataUpdate, 
        setDataUpdate, 
        loadUser 
    } = props;

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                id: dataUpdate.id,
                fullName: dataUpdate.fullName,
                email: dataUpdate.email,
                phone: dataUpdate.phone,
                role: dataUpdate.role,
                gender: dataUpdate.gender,
                dob: moment(dataUpdate.dob).format('YYYY-MM-DD')
            });
        }
    }, [dataUpdate, form]);

    const onFinish = async (values) => {
        try {
            const res = await updateUserAPI(
                dataUpdate.id, 
                values.fullName, 
                values.dob, 
                values.gender, 
                values.role
            );
            
            if (res && res.id) {
                notification.success({
                    message: "Update user",
                    description: `Cập nhật user "${res.fullName || res.email}" thành công!`
                });
                resetAndCloseModal();
                await loadUser();
            } else {
                notification.error({
                    message: "Error update user",
                    description: "Không nhận được dữ liệu user hợp lệ"
                });
            }
        } catch (error) {
            console.error("Update user error:", error);
            notification.error({
                message: "Error update user",
                description: error.response?.data?.message || error?.message || "Cập nhật user thất bại, vui lòng thử lại!"
            });
        }
    };

    const resetAndCloseModal = () => {
        form.resetFields();
        setDataUpdate(null);
        setIsUpdateOpen(false);
    };

    return (
        <Modal
            title="Update User"
            open={isUpdateOpen}
            onOk={() => form.submit()}
            onCancel={() => resetAndCloseModal()}
            maskClosable={false}
            okText={"UPDATE"}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Form.Item
                    label="ID"
                    name="id"
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    label={<span>Full Name <span style={{ color: 'red' }}>*</span></span>}
                    name="fullName"
                    rules={[
                        { required: true, message: 'Full Name không được để trống!' },
                        { min: 2, message: 'Full Name phải có ít nhất 2 ký tự!' },
                        { max: 50, message: 'Full Name không quá 50 ký tự!' }
                    ]}
                >
                    <Input 
                        placeholder="Nhập full name của bạn" 
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label={<span>Email <span style={{ color: 'red' }}>*</span></span>}
                    name="email"
                    rules={[
                        { required: true, message: 'Email không được để trống!' },
                        { type: "email", message: 'Email không đúng định dạng!' },
                    ]}
                >
                    <Input 
                        placeholder="Nhập email của bạn" 
                        size="large"
                        disabled={true}
                    />
                </Form.Item>

                <Form.Item
                    label={<span>Phone <span style={{ color: 'red' }}>*</span></span>}
                    name="phone"
                    rules={[
                        { required: true, message: 'Phone không được để trống!' },
                        { pattern: /^[0-9]{10,11}$/, message: 'Phone phải có 10-11 số!' }
                    ]}
                >
                    <Input 
                        placeholder="Nhập số điện thoại của bạn" 
                        size="large"
                        disabled={true}
                    />
                </Form.Item>

                <Form.Item
                    label="Date of Birth (YYYY-MM-DD)"
                    name="dob"
                    rules={[
                        { required: true, message: 'Date of Birth không được để trống!' },
                        { 
                            pattern: /^\d{4}-\d{2}-\d{2}$/, 
                            message: 'Format phải là YYYY-MM-DD (ví dụ: 2004-03-03)' 
                        },
                        {
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                const date = moment(value, 'YYYY-MM-DD', true);
                                if (!date.isValid()) {
                                    return Promise.reject(new Error('Ngày không hợp lệ'));
                                }
                                if (date.isBefore(moment(), 'day')) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Ngày sinh phải là ngày trong quá khứ'));
                            }
                        }
                    ]}
                >
                    <Input
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="2004-03-03"
                    />
                </Form.Item>

                <Form.Item
                    label="Gender"
                    name="gender"
                    rules={[{ required: true, message: 'Gender không được để trống!' }]}
                >
                    <Radio.Group size="large">
                        <Radio value={1}>Male</Radio>
                        <Radio value={2}>Female</Radio>
                        <Radio value={3}>Other</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="role"
                    rules={[{ required: true, message: 'Role không được để trống!' }]}
                >
                    <Select
                        style={{ width: '100%' }}
                        size="large"
                    >
                        <Option value="ADMIN">Admin</Option>
                        <Option value="MANAGER">Manager</Option>
                        <Option value="OPERATION_STAFF">Operation Staff</Option>
                        <Option value="SUPPORT_STAFF">Support Staff</Option>
                        <Option value="CUSTOMER">Customer</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default UpdateUserModal;