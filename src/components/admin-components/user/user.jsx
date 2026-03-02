import React from 'react';
import { useEffect, useState } from 'react';
import { mockUsers } from './user.data';
import UserTable from './user.table';
import UserForm from './user.form';
import './user.css';
import { fetchAllUserAPI } from '../../../services/api.service';

const UserPage = () => {
    const [dataUsers, setDataUsers] = useState([]);
    const [current, setCurrent] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        console.log("Loading user page with new API");
        loadUser();
    }, [current, pageSize, keyword, role, status]);

    const loadUser = async () => {
        setLoading(true);
        try {
            const res = await fetchAllUserAPI(current, pageSize, keyword, role, status);
            console.log("User API response:", res);
            
            if (res && res.content) {
                setDataUsers(res.content);
                setTotal(res.totalElements);
            } else {
                // Fallback to mock data if API fails
                console.log("API failed, using mock data");
                setDataUsers(mockUsers);
                setTotal(mockUsers.length);
            }
        } catch (error) {
            console.error("Error loading users:", error);
            // Fallback to mock data
            setDataUsers(mockUsers);
            setTotal(mockUsers.length);
        }
        setLoading(false);
    };

    return (
        <div className="user-page-container">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage and view all users in the system</p>
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