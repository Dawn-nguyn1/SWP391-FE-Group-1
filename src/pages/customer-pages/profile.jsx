import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, message, Spin, DatePicker, Radio } from 'antd';
import { UserOutlined, LockOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { getProfileAPI, updateProfileAPI, changePasswordAPI, getAddressesAPI, createAddressAPI, deleteAddressAPI, setDefaultAddressAPI } from '../../services/api.service';
import dayjs from 'dayjs';
import './profile.css';

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [profileForm] = Form.useForm();
    const [pwdForm] = Form.useForm();
    const [addrForm] = Form.useForm();
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [p, addrs] = await Promise.all([getProfileAPI(), getAddressesAPI()]);
            setProfile(p);
            setAddresses(Array.isArray(addrs) ? addrs : []);
            profileForm.setFieldsValue({
                fullName: p.fullName,
                phone: p.phone,
                gender: p.gender,
                dob: p.dob ? dayjs(p.dob) : undefined,
            });
        } catch { message.error('Không thể tải hồ sơ'); }
        finally { setLoading(false); }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadData(); }, []);

    const handleUpdateProfile = async (vals) => {
        setSaving(true);
        try {
            await updateProfileAPI({ ...vals, dob: vals.dob ? vals.dob.format('YYYY-MM-DD') : undefined });
            message.success('Cập nhật hồ sơ thành công!');
        } catch { message.error('Không thể cập nhật'); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async (vals) => {
        if (vals.newPassword !== vals.confirmPassword) { message.error('Mật khẩu mới không khớp!'); return; }
        setSaving(true);
        try {
            await changePasswordAPI({ oldPassword: vals.oldPassword, newPassword: vals.newPassword });
            message.success('Đổi mật khẩu thành công!');
            pwdForm.resetFields();
        } catch (e) { message.error(e?.response?.data?.message || 'Đổi mật khẩu thất bại'); }
        finally { setSaving(false); }
    };

    const handleAddAddress = async (vals) => {
        try {
            const dto = {
                receiverName: vals.receiverName,
                phone: vals.phone,
                province: vals.province,
                district: vals.district,
                ward: vals.ward,
                addressLine: vals.addressLine,
            };

            await createAddressAPI(dto);
            message.success('Thêm địa chỉ thành công');
            addrForm.resetFields();
            loadData();
        } catch (e) {
            console.error('Add address error:', e);
            message.error(e?.response?.data?.message || e?.message || 'Không thể thêm địa chỉ');
        }
    };

    const handleDeleteAddr = async (id) => {
        try { await deleteAddressAPI(id); message.success('Đã xoá địa chỉ'); loadData(); }
        catch { message.error('Không thể xoá'); }
    };

    const handleSetDefault = async (id) => {
        try { await setDefaultAddressAPI(id); message.success('Đã đặt làm mặc định'); loadData(); }
        catch { message.error('Không thể cập nhật'); }
    };

    if (loading) return <div className="profile-loading"><Spin size="large" /></div>;

    const tabItems = [
        {
            key: 'info',
            label: <span><UserOutlined /> Thông tin</span>,
            children: (
                <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile} className="profile-form">
                    <Form.Item label="Email"><Input value={profile?.email} disabled /></Form.Item>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
                    <Form.Item name="gender" label="Giới tính">
                        <Radio.Group>
                            <Radio value={0}>Nam</Radio>
                            <Radio value={1}>Nữ</Radio>
                            <Radio value={2}>Khác</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="dob" label="Ngày sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} /></Form.Item>
                    <Button type="primary" htmlType="submit" loading={saving} className="save-btn">Lưu thay đổi</Button>
                </Form>
            ),
        },
        {
            key: 'password',
            label: <span><LockOutlined /> Đổi mật khẩu</span>,
            children: (
                <Form form={pwdForm} layout="vertical" onFinish={handleChangePassword} className="profile-form">
                    <Form.Item name="oldPassword" label="Mật khẩu hiện tại" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, min: 6 }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="confirmPassword" label="Nhập lại mật khẩu mới" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={saving} className="save-btn">Đổi mật khẩu</Button>
                </Form>
            ),
        },
        {
            key: 'addresses',
            label: <span><EnvironmentOutlined /> Địa chỉ</span>,
            children: (
                <div className="addresses-tab">
                    <div className="addr-list">
                        {addresses.map(a => (
                            <div key={a.id} className="addr-card">
                                <div className="addr-info">
                                    <strong>{a.receiverName || a.recipientName}</strong> — {a.phone}
                                    <p>{a.addressLine || a.street}, {a.ward}, {a.district}, {a.province || a.city}</p>
                                    {a.isDefault && <span className="default-badge">Mặc định</span>}
                                </div>
                                <div className="addr-actions">
                                    {!a.isDefault && <button className="addr-btn default" onClick={() => handleSetDefault(a.id)}>Đặt mặc định</button>}
                                    <button className="addr-btn delete" onClick={() => handleDeleteAddr(a.id)}>Xoá</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="addr-form-wrap">
                        <h4>Thêm địa chỉ mới</h4>
                        <Form form={addrForm} layout="vertical" onFinish={handleAddAddress}>
                            <div className="addr-form-grid">
                                <Form.Item name="receiverName" label="Họ tên người nhận" rules={[{ required: true }]}><Input /></Form.Item>
                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                                        { pattern: /^0\d{9}$/, message: 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0' },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item name="province" label="Tỉnh / Thành phố" rules={[{ required: true }]}><Input /></Form.Item>
                                <Form.Item name="district" label="Quận / Huyện" rules={[{ required: true }]}><Input /></Form.Item>
                                <Form.Item name="ward" label="Phường / Xã" rules={[{ required: true }]}><Input /></Form.Item>
                                <Form.Item name="addressLine" label="Địa chỉ chi tiết" rules={[{ required: true }]}><Input placeholder="Số nhà, tên đường..." /></Form.Item>
                            </div>
                            <Button type="primary" htmlType="submit" className="save-btn">Thêm địa chỉ</Button>
                        </Form>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="profile-page">
            <div className="profile-inner">
                <div className="profile-header">
                    <div className="profile-avatar">{profile?.fullName?.[0] || 'U'}</div>
                    <div>
                        <h1 className="profile-name">{profile?.fullName || 'Người dùng'}</h1>
                        <p className="profile-email">{profile?.email}</p>
                    </div>
                </div>
                <div className="profile-card">
                    <Tabs defaultActiveKey="info" items={tabItems} />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
