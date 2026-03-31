import React, { useContext, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Avatar, Dropdown, Input } from 'antd';
import {
    ShoppingCartOutlined,
    SearchOutlined,
    UserOutlined,
    LogoutOutlined,
    ProfileOutlined,
    HistoryOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../../../context/auth.context';
import { CartContext } from '../../../context/cart.context';
import './CustomerHeader.css';

const CustomerHeader = () => {
    const { user, setUser } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchValue, setSearchValue] = useState('');

    const activeCatalogKey = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const brand = params.get('brand');
        const view = params.get('view');

        if (brand === 'Ray-Ban') return 'ray-ban';
        if (brand === 'Oakley') return 'oakley';
        if (view === 'ready') return 'ready';
        if (location.pathname === '/customer/products') return 'products';
        return '';
    }, [location.pathname, location.search]);

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
            {
                key: 'payments',
                label: <Link to="/customer/payments">Lịch sử thanh toán</Link>,
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
                <div className="header-left">
                    <Link to="/customer" className="header-logo">
                        <span className="logo-icon">👓</span>
                        <div className="logo-copy">
                            <span className="logo-text">GENETIX</span>
                            <small className="logo-tagline">Campaign-first eyewear store</small>
                        </div>
                    </Link>

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
                </div>

                <div className="header-actions">
                    <NavLink
                        to="/customer/preorder-campaigns"
                        className={({ isActive }) => `campaign-chip-link ${isActive ? 'active' : ''}`}
                    >
                        <ThunderboltOutlined />
                        <span>Campaign hub</span>
                    </NavLink>

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

            <nav className="header-nav">
                <NavLink to="/customer" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Trang chủ</NavLink>
                <NavLink to="/customer/products" end className={`nav-link ${activeCatalogKey === 'products' ? 'active' : ''}`}>Sản phẩm</NavLink>
                <NavLink
                    to="/customer/preorder-campaigns"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    Chiến dịch pre-order
                </NavLink>
                <NavLink to="/customer/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Đơn hàng của tôi</NavLink>
                <NavLink to="/customer/payments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Lịch sử thanh toán</NavLink>
                <Link to="/customer/products?brand=Ray-Ban" className={`nav-link ${activeCatalogKey === 'ray-ban' ? 'active' : ''}`}>Ray-Ban</Link>
                <Link to="/customer/products?brand=Oakley" className={`nav-link ${activeCatalogKey === 'oakley' ? 'active' : ''}`}>Oakley</Link>
                <Link to="/customer/products?view=ready" className={`nav-link ${activeCatalogKey === 'ready' ? 'active' : ''}`}>Hàng sẵn</Link>
            </nav>
        </header>
    );
};

export default CustomerHeader;
