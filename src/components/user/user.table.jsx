import React, { useState } from 'react';
import { Table, Popconfirm, notification, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import UpdateUserModal from './update.user.modal';
import ViewUserDetail from './user.detail';
// import { deleteUserAPI } from '../../services/api.service';
import './user.css'; // Import CSS file

const UserTable = (props) => {
    const { 
        dataUsers, 
        loadUser, 
        current, 
        pageSize, 
        total,
        setCurrent, 
        setPageSize 
    } = props;

    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);
    const [dataDetail, setDataDetail] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false); // Toggle xác nhận xóa

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
                        {(index + 1) + (current - 1) * pageSize}
                    </span> 
                );
            }
        },
        {
            title: 'Id',
            dataIndex: '_id',
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
                        #{record._id.slice(-8).toUpperCase()}
                    </a>
                );
            }
        },
        {
            title: 'Avatar',
            dataIndex: ['profile', 'avatar'],
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
                            {getInitials(record.profile?.fullName)}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Full Name',
            dataIndex: ['profile', 'fullName'],
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
            title: 'Role',
            dataIndex: 'role',
            width: 180,
            render: (role) => {
                const roleConfig = {
                    'admin': { class: 'role-admin', label: 'Admin' },
                    'manager': { class: 'role-manager', label: 'Manager' },
                    'operator_staff': { class: 'role-operator', label: 'Operator Staff' },
                    'support_staff': { class: 'role-support', label: 'Support Staff' },
                    'user': { class: 'role-user', label: 'User' }
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
            render: (status) => (
                <span className={`status-badge ${status}`}>
                    {status === 'active' ? (
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
            width: 120,
            render: (_, record) => (
                <div className="action-buttons">
                    <button
                        className="action-btn-icon edit-btn"
                        onClick={() => {
                            setDataUpdate(record);
                            setIsModalUpdateOpen(true);
                        }}
                        title="Edit"
                    >
                        <EditOutlined />
                    </button>
                    {confirmDelete ? (
                        // Xóa trực tiếp
                        <button 
                            className="action-btn-icon delete-btn"
                            onClick={() => handleDeleteClick(record)}
                            title="Delete (No confirmation)"
                        >
                            <DeleteOutlined />
                        </button>
                    ) : (
                        // Xác nhận trước khi xóa
                        <Popconfirm
                            title="Xóa người dùng"
                            description="Bạn chắc chắn xóa user này ?"
                            onConfirm={() => handleDeleteUser(record._id)}
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
            
            // API trả về {message: "User deleted successfully"}
            if (res && res.message) {
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
            // Xóa trực tiếp không cần xác nhận
            handleDeleteUser(record._id);
        }
        // Nếu không confirmDelete, Popconfirm sẽ xử lý
    };

    const onChange = (pagination, filters, sorter, extra) => {
        console.log("check onChange:", pagination, filters, sorter, extra);
        
        // Nếu thay đổi trang: current
        if (pagination && pagination.current) {
            if (pagination.current !== +current) {
                setCurrent(+pagination.current); // +: chuyển string thành số nguyên
            }
        }
        
        // Nếu thay đổi tổng số Ptu: pageSize
        if (pagination && pagination.pageSize) {
            if (pagination.pageSize !== +pageSize) {
                setPageSize(+pagination.pageSize);
            }
        }

        console.log({ pagination, filters, sorter, extra });
    };

    return (
        <div className="user-table-wrapper">
            {/* Toggle xác nhận xóa */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Xóa liên tục:</span>
                <Switch 
                    checked={confirmDelete}
                    onChange={setConfirmDelete}
                    
                />
            </div>
            
            <Table
                className="user-table"
                columns={columns}
                dataSource={dataUsers}
                rowKey={"_id"}
                pagination={{
                    current: current,
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
            
            <UpdateUserModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadUser={loadUser}
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