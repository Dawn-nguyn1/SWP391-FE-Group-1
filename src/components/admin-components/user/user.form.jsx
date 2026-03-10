import { Button, Input, notification, Modal, Select, Form, Radio } from "antd";
import { useState } from "react";
import { createUserAPI, updateUserAPI } from '../../../services/api.service';
import React from "react";
import moment from "moment";

const { Option } = Select;

const UserForm = (props) => {
  const { loadUser } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formattedValues = { ...values, dob: values.dob };
      let res;
      if (dataUpdate) {
        res = await updateUserAPI(dataUpdate.id, formattedValues.fullName, formattedValues.dob, formattedValues.gender, formattedValues.role);
        if (res && res.id) {
          notification.success({
            message: "Update user",
            description: `Cập nhật user "${res.fullName || res.email}" thành công!`
          });
        }
      } else {
        res = await createUserAPI(formattedValues.fullName, formattedValues.email, formattedValues.password, formattedValues.phone, formattedValues.dob, formattedValues.gender, formattedValues.role);
        if (res && res.id) {
          notification.success({
            message: "Create user",
            description: `Tạo user "${res.fullName || res.email}" thành công!`
          });
        }
      }
      resetAndCloseModal();
      await loadUser();
    } catch (error) {
      notification.error({
        message: dataUpdate ? "Error update user" : "Error create user",
        description: error.response?.data?.message || error?.message || `${dataUpdate ? "Cập nhật" : "Tạo"} user thất bại!`
      });
    }
    setLoading(false);
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setDataUpdate(null);
    setLoading(false);
  };

  const handleCreateUser = () => {
    setDataUpdate(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

        :root {
          --cyan: #0891b2;
          --violet: #7c3aed;
          --white: #ffffff;
          --ink: #1e1b4b;
          --border: rgba(124,58,237,0.15);
        }

        /* ── Table header ── */
        .uf-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          background: var(--white);
          border-radius: 14px;
          border: 1px solid var(--border);
          box-shadow: 0 2px 12px rgba(8,145,178,0.06);
          margin: 10px 0;
        }

        .uf-title {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .uf-title::before {
          content: '';
          width: 4px; height: 20px;
          border-radius: 99px;
          background: linear-gradient(180deg, var(--cyan), var(--violet));
          display: inline-block;
        }

        .uf-create-btn.ant-btn {
          background: linear-gradient(135deg, var(--cyan) 0%, var(--violet) 100%) !important;
          border: none !important;
          border-radius: 10px !important;
          height: 38px !important;
          padding: 0 20px !important;
          font-family: 'Sora', sans-serif !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #fff !important;
          box-shadow: 0 4px 14px rgba(124,58,237,0.3) !important;
          transition: all 0.25s ease !important;
        }

        .uf-create-btn.ant-btn:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 20px rgba(124,58,237,0.4) !important;
          opacity: 0.9 !important;
        }
      `}</style>

      {/* Áp dụng class vào phần Header */}
      <div className="uf-header">
        <span className="uf-title">Table Users</span>
        <Button 
          className="uf-create-btn" 
          onClick={handleCreateUser} 
          type="primary"
        >
          + Create User
        </Button>
      </div>

      <Modal
        title={dataUpdate ? "Update User" : "Create User"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={resetAndCloseModal}
        maskClosable={false}
        confirmLoading={loading}
        okText={dataUpdate ? "UPDATE" : "CREATE"}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ role: "MANAGER", gender: 2 }}
        >
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: 'Không được để trống!' }]}
          >
            <Input placeholder="Nhập họ tên" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input placeholder="example@email.com" size="large" disabled={!!dataUpdate} />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, pattern: /^[0-9]{10,11}$/, message: '10-11 chữ số!' }]}
          >
            <Input placeholder="0987..." size="large" />
          </Form.Item>

          {!dataUpdate && (
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, min: 6, message: 'Ít nhất 6 ký tự!' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>
          )}

          <Form.Item
            label="Date of Birth (YYYY-MM-DD)"
            name="dob"
            rules={[
              { required: true, message: 'Không được để trống!' },
              { pattern: /^\d{4}-\d{2}-\d{2}$/, message: 'Định dạng YYYY-MM-DD' }
            ]}
          >
            <Input placeholder="2004-03-03" size="large" />
          </Form.Item>

          <Form.Item label="Gender" name="gender">
            <Radio.Group size="large">
              <Radio value={1}>Male</Radio>
              <Radio value={2}>Female</Radio>
              <Radio value={3}>Other</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="Role" name="role">
            <Select size="large">
              <Option value="ADMIN">Admin</Option>
              <Option value="MANAGER">Manager</Option>
              <Option value="OPERATION_STAFF">Operation Staff</Option>
              <Option value="SUPPORT_STAFF">Support Staff</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserForm;