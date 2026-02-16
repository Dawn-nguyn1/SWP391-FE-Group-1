import { useEffect, useState } from 'react'
import { Input, notification, Modal, Select, Form } from "antd";
// import { updateUserAPI } from '../../services/api.service';
import React from 'react';

const { Option } = Select;

const UpdateUserModal = (props) => {
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [form] = Form.useForm();
    
    const { 
        isModalUpdateOpen: propIsModalOpen, 
        setIsModalUpdateOpen: propSetIsModalUpdateOpen,
        dataUpdate, 
        setDataUpdate, 
        loadUser 
    } = props;

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                _id: dataUpdate._id,
                fullName: dataUpdate.profile?.fullName || dataUpdate.fullName,
                email: dataUpdate.email,
                role: dataUpdate.role,
                status: dataUpdate.status
            });
        }
    }, [dataUpdate, form]);

    const onFinish = async (values) => {
        try {
            const res = await updateUserAPI(values._id, values.email, values.password,
               values.fullName, values.role, values.status);
            
            // Với smart interceptor đã sửa:
            // Update user: res là {user: {...}} từ response.data.data
            if (res && res.user && res.user._id) {
                notification.success({
                    message: "Update user",
                    description: `Cập nhật user "${res.user.profile?.fullName || res.user.email}" thành công!`
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
                description: error?.message || "Cập nhật user thất bại, vui lòng thử lại!"
            });
        }
    };

    const resetAndCloseModal = () => {
        form.resetFields();
        setDataUpdate(null);
        propSetIsModalUpdateOpen(false);
    };

    return (
        <Modal
            title="Update User"
            open={propIsModalOpen}
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
                    name="_id"
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
                    />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    help="Để trống nếu không muốn đổi mật khẩu"
                >
                    <Input.Password 
                        placeholder="Nhập mật khẩu mới (để trống nếu không đổi)" 
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    label="Role"
                    name="role"
                    rules={[
                        { required: true, message: 'Role không được để trống!' }
                    ]}
                >
                    <Select
                        style={{ width: '100%' }}
                        size="large"
                    >
                        <Option value="admin">Admin</Option>
                        <Option value="manager">Manager</Option>
                        <Option value="operator_staff">Operator Staff</Option>
                        <Option value="support_staff">Support Staff</Option>
                        <Option value="user">User</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Status"
                    name="status"
                    rules={[
                        { required: true, message: 'Status không được để trống!' }
                    ]}
                >
                    <Select
                        style={{ width: '100%' }}
                        size="large"
                    >
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default UpdateUserModal;