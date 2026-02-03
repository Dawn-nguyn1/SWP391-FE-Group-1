import React from 'react';
import { useEffect, useState } from 'react';
import { mockUsers } from './user.data';
import UserTable from './user.table';
import UserForm from './user.form';
import './user.css'; // Import CSS file
// import { fetchUsersAPI } from '../../services/api.service';

const UserPage = () => {
    const [dataUsers, setDataUsers] = useState(mockUsers);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(mockUsers.length);

    // Empty array => run once
    useEffect(() => {
        console.log("day la page user");
        loadUser();
    }, [current, pageSize]);

    const loadUser = async () => {
        // Sử dụng mock data trực tiếp
        setDataUsers(mockUsers);
        setTotal(mockUsers.length);
    };

    return (
        <div className="user-page-container">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage and view all users in the system</p>
            </div>

            

            {/* User Form - Uncomment when ready */}
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
            />
        </div>
    );
};

export default UserPage;