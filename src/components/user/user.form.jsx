import { Button, Input, notification, Modal, Select, Form } from "antd";
import { useState } from "react";
// import { createUserAPI } from "../../services/api.service";
import React from "react";

const { Option } = Select;

const UserForm = (props) => {
  const { loadUser } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    console.log("Form values:", values);
    
    try {
      const res = await createUserAPI(values.fullName, values.email, values.password, values.role, values.status);
      
      if (res && res.user && res.user._id) {  
        notification.success({
          message: "Create user",
          description: `Tạo user "${res.user.profile?.fullName || res.user.email}" thành công!`
        });
        resetAndCloseModal();
        await loadUser();
      } else {
        notification.error({
          message: "Error create user",
          description: "Không nhận được dữ liệu user hợp lệ"
        });
      }
    } catch (error) {
      console.error("Create user error:", error);
      notification.error({
        message: "Error create user",
        description: error?.message || "Tạo user thất bại, vui lòng thử lại!"
      });
    }
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  }

  return (
    <div className="user-form" style={{ margin: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Table Users</h3>
        <Button
          onClick={() => setIsModalOpen(true)}
          type="primary"> Create User </Button>
      </div>

      <Modal
        title="Create User"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => resetAndCloseModal()}
        maskClosable={false}
        okText={"CREATE"}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            role: "user",
            status: "active"
          }}
        >
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
            label={<span>Password <span style={{ color: 'red' }}>*</span></span>}
            name="password"
            rules={[
              { required: true, message: 'Password không được để trống!' },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
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

    </div>
  )
}

export default UserForm;