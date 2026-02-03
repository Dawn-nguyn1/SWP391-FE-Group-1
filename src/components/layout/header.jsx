import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import {
    UsergroupAddOutlined,
    HomeOutlined,
    PlayCircleOutlined,
    AliwangwangOutlined,
    LoginOutlined
} from '@ant-design/icons';

import { useState } from 'react';
import { AuthContext } from '../../context/auth.context';

const Header = () => {
    const [current, setCurrent] = useState('');
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        setUser({
            _id: "",
            email: "",
            profile: {
                fullName: ""
            },
            role: "",
        });
        navigate("/login");
    };

    const onClick = (e) => {
        if (e.key === 'logout') {
            handleLogout();
            return;
        }
        setCurrent(e.key);
    };

    const items = [
        {
            label: <Link to={"/homepage"}>Home</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to={"/users"}>Users</Link>,
            key: 'users',
            icon: <UsergroupAddOutlined />
        },

        ...(!user?._id ? [{
            label: <Link to={"/login"}>Đăng nhập</Link>,
            key: 'login',
            icon: <LoginOutlined />,
        }] : []),

        ...(user?._id ? [{
            label: `Welcome ${user.profile?.fullName ?? user.email}`,
            key: 'setting',
            icon: <AliwangwangOutlined />,
            children: [
                {
                    label: <span >Đăng xuất</span>,
                    key: 'logout',
                },
            ],
        }] : []),
    ];

    return (
        <div
            style={{
                width: 256,
                height: '100vh',
                position: 'sticky',
                top: 0,
                left: 0,
                overflow: 'auto',
                borderRight: '1px solid #e2e8f0',
                background: '#fff'
            }}
        >
            <div
                style={{
                    padding: '16px 20px',
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#fff',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                SWP Glasses
            </div>
            <Menu
                onClick={onClick}
                style={{ width: 256, borderRight: 0 }}
                selectedKeys={current ? [current] : undefined}
                mode="inline"
                items={items}
            />
        </div>
    )
}

export default Header;