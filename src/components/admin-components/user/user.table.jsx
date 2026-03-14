import React, { useState, useContext } from 'react';
import { Table, Popconfirm, notification, Switch, Input, Select, Space } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import ViewUserDetail from './user.detail';
import { deleteUserAPI, updateUserStatusAPI } from '../../../services/api.service';
import './user.css';
import UpdateUserModal from './update.user.modal';
import { AuthContext } from '../../../context/auth.context';

const { Option } = Select;

const UserTable = (props) => {
    const {
        dataUsers,
        loadUser,
        current,
        pageSize,
        total,
        setCurrent,
        setPageSize,
        loading,
        keyword,
        setKeyword,
        role,
        setRole,
        status,
        setStatus
    } = props;

    const { user: currentUser } = useContext(AuthContext);
    const [dataDetail, setDataDetail] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    const columns = [
        {
            title: 'STT',
            width: 70,
            render: (_, record, index) => {
                return (
                    <span className="stt-number">
                        {(index + 1) + (current) * pageSize}
                    </span>
                );
            }
        },
        {
            title: 'Id',
            dataIndex: 'id',
            width: 150,
            render: (_, record) => {
                return (
                    <a
                        className="user-id"
                        href='#'
                        onClick={(e) => {
                            e.preventDefault();
                            setDataDetail(record);
                            setIsDetailOpen(true);
                        }}
                    >
                        #{record.id ? record.id.toString().slice(-8).toUpperCase() : 'N/A'}
                    </a>
                );
            }
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            render: (name) => (
                <span className="user-name">{name}</span>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            render: (email) => (
                <span className="user-email">{email}</span>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            render: (phone) => (
                <span className="user-phone">{phone}</span>
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            width: 180,
            render: (role) => {
                const roleConfig = {
                    'ADMIN': { class: 'role-admin', label: 'Admin' },
                    'MANAGER': { class: 'role-manager', label: 'Manager' },
                    'OPERATION_STAFF': { class: 'role-operator', label: 'Operation Staff' },
                    'SUPPORT_STAFF': { class: 'role-support', label: 'Support Staff' },
                    'CUSTOMER': { class: 'role-user', label: 'Customer' }
                };

                const config = roleConfig[role] || { class: 'role-default', label: role };

                return (
                    <span className={`role-badge ${config.class}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            width: 120,
            align: 'center',
            render: (status) => (
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: status === 'ACTIVED' ? '#f0fdf4' : '#fef2f2',
                    color: status === 'ACTIVED' ? '#16a34a' : '#dc2626'
                }}>
                    {status === 'ACTIVED' ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 180,
            align: 'center',
            render: (_, record) => {
                // Check if this is the current user
                if (currentUser && record.id === currentUser.id) {
                    return (
                        <span 
                            style={{
                                color: '#f59e0b',
                                fontWeight: '600',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                backgroundColor: '#fef3c7',
                                border: '1px solid #fbbf24',
                                fontSize: '12px',
                                display: 'inline-block'
                            }}
                        >
                            đây là bạn
                        </span>
                    );
                }

                // Show action buttons for other users
                return (
                    <div className="action-buttons">
                        <button
                            className="action-btn-icon view-btn"
                            onClick={() => {
                                setDataDetail(record);
                                setIsDetailOpen(true);
                            }}
                            title="View"
                        >
                            <EyeOutlined />
                        </button>
                        <button
                            className="action-btn-icon edit-btn"
                            onClick={() => {
                               setIsUpdateOpen(true);
                               setDataUpdate(record);
                            }}
                            title="Edit"
                        >
                            <EditOutlined />
                        </button>
                        {confirmDelete ? (
                            <button
                                className="action-btn-icon delete-btn"
                                onClick={() => handleDeleteClick(record)}
                                title="Delete (No confirmation)"
                            >
                                <DeleteOutlined />
                            </button>
                        ) : (
                            <Popconfirm
                                title="Xóa người dùng"
                                description="Bạn chắc chắn xóa user này ?"
                                onConfirm={() => handleDeleteUser(record.id)}
                                okText="Yes"
                                cancelText="No"
                                placement="left"
                            >
                                <button
                                    className="action-btn-icon delete-btn"
                                    title="Delete"
                                >
                                    <DeleteOutlined />
                                </button>
                            </Popconfirm>
                        )}
                    </div>
                );
            },
        },
    ];

    const handleDeleteUser = async (id) => {
        try {
            const res = await deleteUserAPI(id);

            if (res) {
                notification.success({
                    message: "Delete user",
                    description: "Xóa user thành công"
                });
                await loadUser();
            } else {
                notification.error({
                    message: "Error delete user",
                    description: "Không nhận được xác nhận xóa từ server"
                });
            }
        } catch (error) {
            console.error("Delete user error:", error);
            notification.error({
                message: "Error delete user",
                description: error?.message || "Xóa user thất bại, vui lòng thử lại!"
            });
        }
    };

    const handleDeleteClick = (record) => {
        if (confirmDelete) {
            handleDeleteUser(record.id);
        }
    };

    const handleStatusToggle = async (record) => {
        try {
            const newStatus = record.status === 'ACTIVED' ? 'INACTIVE' : 'ACTIVED';
            const res = await updateUserStatusAPI(record.id, newStatus);

            if (res && res.id) {
                notification.success({
                    message: "Update Status",
                    description: `Cập nhật trạng thái thành ${newStatus === 'ACTIVED' ? 'Active' : 'Inactive'}`
                });
                await loadUser();
            }
        } catch (error) {
            console.error("Update status error:", error);
            notification.error({
                message: "Error update status",
                description: error?.message || "Cập nhật trạng thái thất bại"
            });
        }
    };

    const onChange = (pagination, filters, sorter, extra) => {
        console.log("check onChange:", pagination, filters, sorter, extra);

        if (pagination && pagination.current) {
            if (pagination.current !== +current) {
                setCurrent(+pagination.current - 1); // API uses 0-based indexing
            }
        }

        if (pagination && pagination.pageSize) {
            if (pagination.pageSize !== +pageSize) {
                setPageSize(+pagination.pageSize);
                setCurrent(0); // Reset to first page when changing page size
            }
        }
    };

    return (
    <div className="user-table-wrapper" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Style cục bộ để xử lý màu sắc đặc trưng */}
        <style>{`
            .custom-filter-section .ant-input-affix-wrapper, 
            .custom-filter-section .ant-select-selector {
                border-radius: 8px !important;
                border: 1px solid #e2e8f0 !important;
                height: 38px !important;
                display: flex !important;
                align-items: center !important;
                transition: all 0.3s !important;
            }
            .custom-filter-section .ant-input-affix-wrapper:hover,
            .custom-filter-section .ant-select:hover .ant-select-selector {
                border-color: #7c3aed !important;
                box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1) !important;
            }
            .custom-filter-section .ant-input-affix-wrapper-focused {
                border-color: #0891b2 !important;
                box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.1) !important;
            }
            .ant-switch-checked { background-color: #7c3aed !important; }
            .filter-label {
                font-size: 11px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 4px;
                display: block;
            }
        `}</style>

        {/* Filters Container */}
        <div className="custom-filter-section" style={{ 
            padding: '24px', 
            display: 'flex', 
            gap: '20px', 
            alignItems: 'flex-end', 
            flexWrap: 'wrap',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9'
        }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 220px', maxWidth: '300px' }}>
                <span className="filter-label">Search</span>
                <Input
                    placeholder="Name, email..."
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setCurrent(0);
                    }}
                    prefix={<SearchOutlined style={{ color: '#0891b2' }} />}
                />
            </div>

            {/* Role Select */}
            <div style={{ width: '160px' }}>
                <span className="filter-label">Role</span>
                <Select
                    value={role}
                    onChange={(value) => {
                        setRole(value);
                        setCurrent(0);
                    }}
                    style={{ width: '100%' }}
                    allowClear
                    placeholder="All roles"
                >
                    <Option value="ADMIN">Admin</Option>
                    <Option value="MANAGER">Manager</Option>
                    <Option value="OPERATION_STAFF">Operation Staff</Option>
                    <Option value="SUPPORT_STAFF">Support Staff</Option>
                    <Option value="CUSTOMER">Customer</Option>
                </Select>
            </div>

            {/* Status Select */}
            <div style={{ width: '140px' }}>
                <span className="filter-label">Status</span>
                <Select
                    value={status}
                    onChange={(value) => {
                        setStatus(value);
                        setCurrent(0);
                    }}
                    style={{ width: '100%' }}
                    allowClear
                    placeholder="All status"
                >
                    <Option value="ACTIVED">Active</Option>
                    <Option value="INACTIVE">Inactive</Option>
                </Select>
            </div>

            {/* Continuous Delete Switch - Nút bấm được bao bọc đẹp mắt */}
            <div style={{ 
                marginLeft: 'auto', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '10px 16px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Xóa liên tục:</span>
                <Switch
                    checked={confirmDelete}
                    onChange={setConfirmDelete}
                />
            </div>
        </div>

        {/* Table Section */}
        <Table
            className="user-table"
            columns={columns}
            dataSource={dataUsers}
            rowKey="id"
            loading={loading}
            pagination={{
                current: current + 1,
                pageSize: pageSize,
                showSizeChanger: true,
                total: total,
                showTotal: (total, range) => (
                    <span style={{ fontWeight: 500, color: '#64748b' }}>
                        Showing <b>{range[0]}-{range[1]}</b> of {total} users
                    </span>
                )
            }}
            onChange={onChange}
        />

        <ViewUserDetail
            dataDetail={dataDetail}
            setDataDetail={setDataDetail}
            isDetailOpen={isDetailOpen}
            setIsDetailOpen={setIsDetailOpen}
            loadUser={loadUser}
        />

        <UpdateUserModal
            isUpdateOpen={isUpdateOpen}
            setIsUpdateOpen={setIsUpdateOpen}
            dataUpdate={dataUpdate}
            setDataUpdate={setDataUpdate}
            loadUser={loadUser}
        />
    </div>
);
};

export default UserTable;