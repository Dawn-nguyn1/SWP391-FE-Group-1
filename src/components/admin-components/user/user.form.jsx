import { Button, Input, notification, Modal, Select, Form, DatePicker, Radio } from "antd";
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
    console.log("Form values:", values);
    
    try {
      // Format date for API
      const formattedValues = {
        ...values,
        dob: values.dob // Already in YYYY-MM-DD format from input
      };

      console.log("Payload gửi lên:", JSON.stringify(formattedValues, null, 2));
      console.log("Data update:", dataUpdate);

      let res;
      if (dataUpdate) {
        // Update mode
        res = await updateUserAPI(dataUpdate.id, formattedValues.fullName, formattedValues.dob, formattedValues.gender, formattedValues.role);
        
        if (res && res.id) {
          notification.success({
            message: "Update user",
            description: `Cập nhật user "${res.fullName || res.email}" thành công!`
          });
        }
      } else {
        // Create mode
        res = await createUserAPI(
          formattedValues.fullName, 
          formattedValues.email, 
          formattedValues.password, 
          formattedValues.phone,
          formattedValues.dob,
          formattedValues.gender,
          formattedValues.role
        );
        
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
      console.error("Save user error:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      
      notification.error({
        message: dataUpdate ? "Error update user" : "Error create user",
        description: error.response?.data?.message || error?.message || `${dataUpdate ? "Cập nhật" : "Tạo"} user thất bại, vui lòng thử lại!`
      });
    }
    setLoading(false);
  };

  const resetAndCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
    setDataUpdate(null);
    setLoading(false);
  }

  const handleEditUser = (user) => {
    setDataUpdate(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      gender: user.gender,
      dob: user.dob // Already in YYYY-MM-DD format
    });
    setIsModalOpen(true);
  };

  return (
    <div className="user-form" style={{ margin: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Table Users</h3>
        <Button
          onClick={() => setIsModalOpen(true)}
          type="primary"> Create User </Button>
      </div>

      <Modal
        title={dataUpdate ? "Update User" : "Create User"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => resetAndCloseModal()}
        maskClosable={false}
        confirmLoading={loading}
        okText={dataUpdate ? "UPDATE" : "CREATE"}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            role: "CUSTOMER",
            gender: 2
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
              disabled={!!dataUpdate} // Disable email in edit mode
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
            />
          </Form.Item>

          {!dataUpdate && (
            <Form.Item
              label={<span>Password <span style={{ color: 'red' }}>*</span></span>}
              name="password"
              rules={[
                { required: true, message: 'Password không được để trống!' },
                { min: 6, message: 'Password phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password
                placeholder="Nhập mật khẩu của bạn"
                size="large"
              />
            </Form.Item>
          )}

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
    </div>
  )
}

export default UserForm;