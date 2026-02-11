import React, { useState } from 'react';
import { Layout, Menu, Typography, Row, Col, Card } from 'antd';
import {
    UserOutlined,
    HistoryOutlined,
    HomeOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import OrderHistory from './OrderHistory';
import ProfileSettings from './ProfileSettings';

const { Content, Sider } = Layout;
const { Title } = Typography;

const UserDashboard = () => {
    const [selectedKey, setSelectedKey] = useState('profile');
    const navigate = useNavigate();

    const menuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ của tôi',
        },
        {
            key: 'orders',
            icon: <HistoryOutlined />,
            label: 'Đơn hàng của tôi',
        },
        {
            type: 'divider',
        },
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: 'Quay về trang chủ',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
        },
    ];

    const handleMenuClick = (e) => {
        if (e.key === 'home') {
            navigate('/homepage');
        } else if (e.key === 'logout') {
            // Logic đăng xuất ở đây
            navigate('/login');
        } else {
            setSelectedKey(e.key);
        }
    };

    const renderContent = () => {
        switch (selectedKey) {
            case 'profile':
                return <ProfileSettings />;
            case 'orders':
                return <OrderHistory />;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 150px)', padding: '40px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Row gutter={32}>
                    <Col xs={24} md={6}>
                        <Card
                            styles={{ body: { padding: '12px 0' } }}
                            style={{ border: 'none', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '100px' }}
                        >
                            <Menu
                                mode="inline"
                                selectedKeys={[selectedKey]}
                                items={menuItems}
                                onClick={handleMenuClick}
                                style={{ borderRight: 'none' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} md={18}>
                        <div style={{ minHeight: '600px' }}>
                            {renderContent()}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default UserDashboard;
