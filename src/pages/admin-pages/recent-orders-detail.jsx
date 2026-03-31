import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, DatePicker, Select, Button, Card, Pagination, Input } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDashboardOrderDetailAPI } from '../../services/api.service';
import './recent-orders-detail.css';

const { RangePicker } = DatePicker;

const STATUS_MAP = {
  'PENDING': { color: 'warning', text: 'Chờ xử lý' },
  'PAID': { color: 'success', text: 'Đã thanh toán' },
  'SHIPPING': { color: 'processing', text: 'Đang giao' },
  'COMPLETED': { color: 'default', text: 'Hoàn thành' },
  'CANCELLED': { color: 'error', text: 'Đã hủy' },
  'PENDING_PAYMENT': { color: 'warning', text: 'Chờ thanh toán' },
  'WAITING_CONFIRM': { color: 'purple', text: 'Chờ xác nhận' },
  'CONFIRMED': { color: 'success', text: 'Đã xác nhận' },
  'SUPPORT_CONFIRMED': { color: 'cyan', text: 'Support xác nhận' },
  'OPERATION_CONFIRMED': { color: 'green', text: 'Operation xác nhận' },
  'FAILED': { color: 'error', text: 'Thất bại' },
};

function formatVND(amount) {
  if (!amount || amount === 0) return '0đ';
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(date) {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export default function RecentOrdersDetail() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filter states
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchOrders = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const from = dateRange?.[0]?.format('YYYY-MM-DD') || null;
      const to = dateRange?.[1]?.format('YYYY-MM-DD') || null;
      
      const res = await getDashboardOrderDetailAPI(statusFilter, from, to, page - 1, pageSize);
      
      if (res?.content) {
        setOrders(res.content);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: res.totalElements || res.content.length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, pagination.pageSize);
  }, [statusFilter, dateRange]);

  const handleSearch = () => {
    fetchOrders(1, pagination.pageSize);
  };

  const handleReset = () => {
    setDateRange([dayjs().subtract(30, 'days'), dayjs()]);
    setStatusFilter('ALL');
    setSearchKeyword('');
    fetchOrders(1, pagination.pageSize);
  };

  const handleTableChange = (newPagination) => {
    fetchOrders(newPagination.current, newPagination.pageSize);
  };

  const filteredOrders = orders.filter(order => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      order.orderCode?.toLowerCase().includes(keyword) ||
      order.items?.some(item => item.productName?.toLowerCase().includes(keyword)) ||
      order.address?.receiverName?.toLowerCase().includes(keyword)
    );
  });

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 120,
      render: (text) => <span className="order-code">{text}</span>,
    },
    {
      title: 'Khách hàng',
      key: 'customerName',
      width: 150,
      render: (record) => record.address?.receiverName || 'N/A',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      width: 250,
      render: (items) => (
        <div className="order-products">
          {items?.map((item, idx) => (
            <div key={idx} className="product-item">
              <span className="product-name">{item.productName}</span>
              <span className="product-qty">x{item.quantity}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (amount) => <span className="order-amount">{formatVND(amount)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      width: 140,
      align: 'center',
      render: (status) => {
        const config = STATUS_MAP[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div className="recent-orders-detail-container">
      <Card className="page-card">
        <div className="page-header">
          <div>
            <h1 style={{ color: 'white' }}>Đơn hàng gần đây</h1>
            <p style={{ color: 'white' }}>Chi tiết tất cả đơn hàng trong hệ thống</p>
          </div>
        </div>

        {/* Filter Section - Đơn giản và dễ hiểu */}
        <div className="filter-section">
          <div className="filter-row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="filter-item">
                <label>Khoảng thời gian:</label>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  format="DD/MM/YYYY"
                  placeholder={['Từ ngày', 'Đến ngày']}
                />
              </div>

              <div className="filter-item">
                <label>Trạng thái đơn:</label>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 180 }}
                  placeholder="Chọn trạng thái"
                >
                  <Select.Option value="ALL">📋 Tất cả trạng thái</Select.Option>
                  <Select.Option value="PENDING">⏳ Chờ xử lý</Select.Option>
                  <Select.Option value="PENDING_PAYMENT">💳 Chờ thanh toán</Select.Option>
                  <Select.Option value="PAID">✅ Đã thanh toán</Select.Option>
                  <Select.Option value="CONFIRMED">✔️ Đã xác nhận</Select.Option>
                  <Select.Option value="SHIPPING">🚚 Đang giao</Select.Option>
                  <Select.Option value="COMPLETED">🏁 Hoàn thành</Select.Option>
                  <Select.Option value="CANCELLED">❌ Đã hủy</Select.Option>
                </Select>
              </div>
            </div>

            <div className="filter-item search-item">
              <label>Tìm kiếm:</label>
              <Input
                placeholder="Tìm theo mã đơn, tên sản phẩm, khách hàng..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="id"
          scroll={{ x: 1200 }}
          className="orders-detail-table"
        />
      </Card>
    </div>
  );
}
