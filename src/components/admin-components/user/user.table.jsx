import React, { useState } from 'react';
import { Table, Popconfirm, notification, Switch, Input, Select, Space } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import ViewUserDetail from './user.detail';
import { deleteUserAPI, updateUserStatusAPI } from '../../../services/api.service';
import './user.css';

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

    const [dataDetail, setDataDetail] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Function to get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Function to get avatar color
    const getAvatarColor = (index) => {
        const colors = ['color-blue', 'color-orange', 'color-purple', 'color-red', 'color-teal', 'color-pink'];
        return colors[index % colors.length];
    };

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
            title: 'Avatar',
            dataIndex: 'avatar',
            width: 80,
            render: (avatar, record, index) => (
                <div className="avatar-wrapper">
                    {avatar ? (
                        <img 
                            src={avatar} 
                            alt="avatar"
                            className="user-avatar"
                        />
                    ) : (
                        <div className={`initials-avatar ${getAvatarColor(index)}`}>
                            {getInitials(record.fullName)}
                        </div>
                    )}
                </div>
            )
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
            render: (status, record) => (
                <span className={`status-badge ${status}`}>
                    {status === 'ACTIVED' ? (
                        <>
                            <CheckCircleOutlined />
                            Active
                        </>
                    ) : (
                        <>
                            <CloseCircleOutlined />
                            Inactive
                        </>
                    )}
                </span>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 180,
            render: (_, record) => (
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
                            // Pass to parent form for editing
                            console.log("Edit user:", record);
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
            ),
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
        <div className="user-table-wrapper">
            {/* Filters */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <Space>
                    <span>Search:</span>
                    <Input
                        placeholder="Search by name, email..."
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setCurrent(0); // Reset to first page when searching
                        }}
                        style={{ width: 200 }}
                        prefix={<SearchOutlined />}
                    />
                </Space>
                
                <Space>
                    <span>Role:</span>
                    <Select
                        value={role}
                        onChange={(value) => {
                            setRole(value);
                            setCurrent(0); // Reset to first page when filtering
                        }}
                        style={{ width: 150 }}
                        allowClear
                        placeholder="All roles"
                    >
                        <Option value="ADMIN">Admin</Option>
                        <Option value="MANAGER">Manager</Option>
                        <Option value="OPERATION_STAFF">Operation Staff</Option>
                        <Option value="SUPPORT_STAFF">Support Staff</Option>
                        <Option value="CUSTOMER">Customer</Option>
                    </Select>
                </Space>
                
                <Space>
                    <span>Status:</span>
                    <Select
                        value={status}
                        onChange={(value) => {
                            setStatus(value);
                            setCurrent(0); // Reset to first page when filtering
                        }}
                        style={{ width: 120 }}
                        allowClear
                        placeholder="All status"
                    >
                        <Option value="ACTIVED">Active</Option>
                        <Option value="INACTIVE">Inactive</Option>
                    </Select>
                </Space>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>Xóa liên tục:</span>
                    <Switch 
                        checked={confirmDelete}
                        onChange={setConfirmDelete}
                    />
                </div>
            </div>
            
            <Table
                className="user-table"
                columns={columns}
                dataSource={dataUsers}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: current + 1, // Display uses 1-based indexing
                    pageSize: pageSize,
                    showSizeChanger: true,
                    total: total,
                    showTotal: (total, range) => {
                        return (
                            <span>
                                Showing {range[0]}-{range[1]} of {total} users
                            </span>
                        );
                    }
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
        </div>
    );
};

export default UserTable;