import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Avatar, Dropdown, Input } from 'antd';
import {
    ShoppingCartOutlined,
    SearchOutlined,
    UserOutlined,
    LogoutOutlined,
    ProfileOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../../../context/auth.context';
import { CartContext } from '../../../context/cart.context';
import './CustomerHeader.css';

const CustomerHeader = () => {
    const { user, setUser } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState('');

    const handleLogout = () => {
        setUser({ id: '', accessKey: '', refreshKey: '', role: '' });
        navigate('/login');
    };

    const handleSearch = (value) => {
        if (value.trim()) navigate(`/customer/products?keyword=${encodeURIComponent(value.trim())}`);
    };

    const avatarMenu = {
        items: [
            {
                key: 'profile',
                label: <Link to="/customer/profile">Hồ sơ cá nhân</Link>,
                icon: <ProfileOutlined />,
            },
            {
                key: 'orders',
                label: <Link to="/customer/orders">Đơn hàng của tôi</Link>,
                icon: <HistoryOutlined />,
            },
            { type: 'divider' },
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout,
            },
        ],
    };

    return (
        <header className="customer-header">
            <div className="header-inner">
                {/* Logo */}
                <Link to="/customer" className="header-logo">
                    <span className="logo-icon">👓</span>
                    <span className="logo-text">GENETIX</span>
                </Link>

                {/* Search */}
                <div className="header-search">
                    <Input.Search
                        placeholder="Tìm kiếm kính mắt, thương hiệu..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onSearch={handleSearch}
                        enterButton={<SearchOutlined />}
                        size="large"
                        className="search-input"
                    />
                </div>

                {/* Actions */}
                <div className="header-actions">
                    <Link to="/customer/cart" className="cart-btn">
                        <Badge count={cartCount} size="small" offset={[-2, 4]}>
                            <ShoppingCartOutlined className="cart-icon" />
                        </Badge>
                        <span className="cart-label">Giỏ hàng</span>
                    </Link>

                    {user?.id ? (
                        <Dropdown menu={avatarMenu} placement="bottomRight" arrow>
                            <div className="avatar-btn">
                                <Avatar
                                    size={36}
                                    icon={<UserOutlined />}
                                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', cursor: 'pointer' }}
                                />
                                <span className="avatar-name">
                                    {user?.profile?.fullName?.split(' ').pop() || 'Tôi'}
                                </span>
                            </div>
                        </Dropdown>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-login">Đăng nhập</Link>
                            <Link to="/register" className="btn-register">Đăng ký</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Nav Links */}
            <nav className="header-nav">
                <Link to="/customer" className="nav-link">Trang chủ</Link>
                <Link to="/customer/products" className="nav-link">Sản phẩm</Link>
                <Link to="/customer/products?brand=Ray-Ban" className="nav-link">Ray-Ban</Link>
                <Link to="/customer/products?brand=Oakley" className="nav-link">Oakley</Link>
                <Link to="/customer/products?inStock=true" className="nav-link">Còn hàng</Link>
            </nav>
        </header>
    );
};

export default CustomerHeader;
