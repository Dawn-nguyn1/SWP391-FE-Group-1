import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ShopOutlined,
    LogoutOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const DashboardLayout = () => {
    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/admin">Thống kê</Link>,
        },
        {
            key: 'orders',
            icon: <ShoppingCartOutlined />,
            label: <Link to="/admin/orders">Đơn hàng</Link>,
        },
        {
            key: 'products',
            icon: <ShopOutlined />,
            label: <Link to="/products">Sản phẩm</Link>,
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: <Link to="/users">Người dùng</Link>,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            style: { marginTop: 'auto' }
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider breakpoint="lg" collapsedWidth="0" theme="dark">
                <div style={{
                    height: 64,
                    margin: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    fontFamily: 'var(--font-heading)'
                }}>
                    GENETIX ADMIN
                </div>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']} items={menuItems} />
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserOutlined />
                        <span>Adminstrator</span>
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: '8px', minHeight: 280 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
