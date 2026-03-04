import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Popconfirm, message, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { getApprovedOrdersAPI, operationsConfirmOrderAPI } from '../../services/api.service';
import './staff-orders.css';

const { Title } = Typography;
const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const OperationsOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getApprovedOrdersAPI();
            setOrders(res?.content || (Array.isArray(res) ? res : []));
        } catch { message.error('Không thể tải đơn hàng'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleShip = async (orderId) => {
        setActioning(orderId);
        try {
            await operationsConfirmOrderAPI(orderId);
            message.success(`Đã gửi đơn #${orderId} đến GHN`);
            load();
        } catch { message.error('Không thể gửi đơn hàng'); }
        finally { setActioning(null); }
    };

    const columns = [
        { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: id => <strong>#{id}</strong>, width: 80 },
        { title: 'Khách hàng', key: 'customer', render: (_, r) => r.user?.email || r.userId || '—' },
        { title: 'Địa chỉ giao', key: 'address', render: (_, r) => {
            const a = r.address;
            return a ? `${a.recipientName} – ${a.street}, ${a.district}, ${a.city}` : '—';
        }},
        { title: 'Thanh toán', dataIndex: 'paymentMethod', key: 'payment', render: v => <Tag color={v === 'VNPAY' ? 'blue' : 'orange'}>{v}</Tag>, width: 100 },
        { title: 'Trạng thái', key: 'status', render: () => <Tag color="blue">Đã xác nhận</Tag>, width: 120 },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'total', render: v => <strong style={{ color: '#764ba2' }}>{formatVND(v)}</strong>, width: 130 },
        {
            title: 'Thao tác', key: 'actions', width: 160,
            render: (_, r) => (
                <Popconfirm
                    title="Xác nhận giao qua GHN?"
                    description="Đơn hàng sẽ được tạo trên hệ thống GHN."
                    onConfirm={() => handleShip(r.id)}
                    okText="Giao hàng"
                    cancelText="Huỷ"
                >
                    <Button type="primary" size="small" icon={<SendOutlined />} loading={actioning === r.id} className="ship-btn">
                        Giao GHN
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="staff-page">
            <div className="staff-inner">
                <div className="staff-header">
                    <Title level={3} style={{ margin: 0 }}>🚚 Đơn hàng cần giao</Title>
                    <Tag color="blue" style={{ fontSize: 13 }}>{orders.length} đơn</Tag>
                </div>
                <div className="staff-card">
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 20 }}
                        expandable={{
                            expandedRowRender: r => (
                                <div className="expanded-items">
                                    {r.items?.map(i => (
                                        <div key={i.id} className="exp-item">
                                            <span>{i.productName || i.name}</span>
                                            <span>x{i.quantity}</span>
                                            <span>{formatVND(i.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            ),
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default OperationsOrdersPage;
