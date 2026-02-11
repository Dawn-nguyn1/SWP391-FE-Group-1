import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import {
    UsergroupAddOutlined,
    HomeOutlined,
    PlayCircleOutlined,
    AliwangwangOutlined,
    LoginOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { Badge } from 'antd';
import { useState } from 'react';
import { AuthContext } from '../../context/auth.context';
import { useCart } from '../../context/cart.context';

const Header = () => {
    const [current, setCurrent] = useState('home');
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

    const { cartCount } = useCart();

    const onClick = (e) => {
        if (e.key === 'logout') {
            handleLogout();
            return;
        }
        setCurrent(e.key);
    };

    const items = [
        {
            label: <Link to={"/homepage"}>Trang chủ</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        {
            label: <Link to={"/products"}>Bộ sưu tập</Link>,
            key: 'products',
            icon: <PlayCircleOutlined />
        },
        {
            label: <Link to={"/admin"}>Trang quản trị</Link>,
            key: 'admin',
            icon: <UsergroupAddOutlined />
        },
        {
            label: (
                <Link to="/cart">
                    <Badge count={cartCount} size="small" offset={[10, 0]}>
                        Giỏ hàng
                    </Badge>
                </Link>
            ),
            key: 'cart',
            icon: <ShoppingCartOutlined />,
        },
    ];

    const userMenuItems = [
        ...(!user?._id ? [{
            label: <Link to={"/login"}>Đăng nhập</Link>,
            key: 'login',
            icon: <LoginOutlined />,
        }] : []),
        ...(user?._id ? [{
            label: `Xin chào, ${user.profile?.fullName ?? user.email}`,
            key: 'user-menu',
            icon: <AliwangwangOutlined />,
            children: [
                {
                    label: <Link to="/account">Thông tin cá nhân</Link>,
                    key: 'profile',
                },
                {
                    label: <Link to="/account">Đơn hàng của tôi</Link>,
                    key: 'my-orders',
                },
                {
                    type: 'divider',
                },
                {
                    label: 'Đăng xuất',
                    key: 'logout',
                    danger: true,
                },
            ],
        }] : []),
    ];

    return (
        <div
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 var(--spacing-xl)',
                height: '72px'
            }}
        >
            <div
                style={{
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '1px',
                    color: 'var(--primary-color)',
                    cursor: 'pointer'
                }}
                onClick={() => navigate('/homepage')}
            >
                GENETIX
            </div>

            <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode="horizontal"
                items={items}
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    borderBottom: 'none',
                    background: 'transparent'
                }}
            />

            <Menu
                onClick={onClick}
                mode="horizontal"
                items={userMenuItems}
                style={{
                    borderBottom: 'none',
                    background: 'transparent',
                    minWidth: '200px',
                    justifyContent: 'flex-end'
                }}
            />
        </div>
    )
}

export default Header;