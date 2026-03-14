import React, { useEffect, useState } from 'react';
import UserTable from './user.table';
import UserForm from './user.form';
import { searchAdminUsersAPI } from '../../../services/api.service';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './user.css';

const UserPage = () => {
    const [dataUsers, setDataUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(0); // 0-based for API
    const [pageSize, setPageSize] = useState(10);
    
    // Filter states
    const [keyword, setKeyword] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');

    // Modal state for Create
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadUser = async () => {
        setLoading(true);
        try {
            const res = await searchAdminUsersAPI(
                current,
                pageSize,
                keyword,
                role,
                status
            );
            console.log("User API response:", res);
            
            if (res && res.content) {
                setDataUsers(res.content);
                setTotal(res.totalElements || 0);
            } else {
                setDataUsers([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("Error loading users:", error);
            setDataUsers([]);
            setTotal(0);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUser();
    }, [current, pageSize, keyword, role, status]);

    return (
        <div className="user-page-container">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle" style={{ color: '#fff' }}>Manage and view all users in the system</p>
            </div>

            {/* User Form */}
            <UserForm loadUser={loadUser} />

            {/* User Table */}
            <UserTable
                loadUser={loadUser}
                dataUsers={dataUsers}
                current={current}
                pageSize={pageSize}
                total={total}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                loading={loading}
                keyword={keyword}
                setKeyword={setKeyword}
                role={role}
                setRole={setRole}
                status={status}
                setStatus={setStatus}
            />
        </div>
    );
};

export default UserPage;