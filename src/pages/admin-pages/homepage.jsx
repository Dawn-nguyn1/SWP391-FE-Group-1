import React, { useEffect, useState } from 'react';
import { DatePicker, Select, Button, Card, Row, Col, Statistic, Table, Switch, Tooltip } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { ReloadOutlined, FallOutlined, RiseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './homepage.css';
import { getManagerDashboardAPI, getDashboardOrderDetailAPI, getDashboardRevenueDetailAPI } from '../../services/api.service';

function formatVND(amount) {
  if (!amount || amount === 0) return '0đ';
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(date) {
  return dayjs(date).format('DD/MM/YYYY');
}

function calculatePercentageChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(1);
}

function getChangeIcon(change) {
  if (change > 0) return <RiseOutlined style={{ color: '#10b981' }} />;
  if (change < 0) return <FallOutlined style={{ color: '#ef4444' }} />;
  return null;
}

function getChangeColor(change) {
  if (change > 0) return '#10b981';
  if (change < 0) return '#ef4444';
  return '#6b7280';
}

function MetricCard({ label, value, sub, change, icon, color = "purple" }) {
  const cardClass = `metric-card-${color}`;
  return (
    <div className={cardClass}>
      <div className="metric-card-icon">
        {icon}
      </div>
      <div className="metric-card-content">
        <span className="metric-card-label">{label}</span>
        <span className="metric-card-value">{value}</span>
        {sub && <span className="metric-card-sub">{sub}</span>}
        {false && (
          <div className="metric-card-change" style={{ color: '#ef4444', fontSize: '14px' }}>
            {getChangeIcon(change)}
            <span>{change > 0 ? '+' : ''}{change}%</span>
            <span className="change-text">vs kỳ trước</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RevenueChart({ data, chartType, onChartTypeChange }) {
  const chartData = data.map(item => ({
    time: item.time,
    year: item.year === 0 ? new Date().getFullYear() : item.year,
    revenue: item.revenue || 0,
    displayTime: `Tháng ${item.time}/${item.year === 0 ? new Date().getFullYear() : item.year}`
  }));

  return (
    <div className="revenue-chart">
      <div className="revenue-chart-header">
        <div>
          <div className="revenue-chart-title">Biểu đồ Doanh thu</div>
          <div className="revenue-chart-subtitle">Theo tháng</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayTime" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <RechartsTooltip
            formatter={(value) => [formatVND(value), 'Doanh thu']}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Bar 
            dataKey="revenue" 
            fill="#7c3aed"
            name="Doanh thu"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecentOrdersTable({ orders }) {
  const navigate = useNavigate();
  
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <span className="order-code">{text}</span>
    },
    {
      title: 'Giá trị',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span className="order-value">{formatVND(amount)}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => {
        const statusConfig = {
          'PENDING': { color: '#f59e0b', text: 'Chờ xử lý' },
          'PAID': { color: '#10b981', text: 'Đã thanh toán' },
          'SHIPPING': { color: '#3b82f6', text: 'Đang giao' },
          'COMPLETED': { color: '#6b7280', text: 'Hoàn thành' },
          'CANCELLED': { color: '#ef4444', text: 'Đã hủy' },
          'PENDING_PAYMENT': { color: '#f59e0b', text: 'Chờ thanh toán' },
          'WAITING_CONFIRM': { color: '#8b5cf6', text: 'Chờ xác nhận' },
          'CONFIRMED': { color: '#10b981', text: 'Đã xác nhận' },
          'SUPPORT_CONFIRMED': { color: '#06b6d4', text: 'Support xác nhận' },
          'OPERATION_CONFIRMED': { color: '#059669', text: 'Operation xác nhận' },
          'FAILED': { color: '#dc2626', text: 'Thất bại' },
          'ALL': { color: '#6b7280', text: 'Tất cả' }
        };
        const config = statusConfig[status] || { color: '#6b7280', text: status };
        return (
          <span className="order-status" style={{ color: config.color, backgroundColor: `${config.color}20` }}>
            {config.text}
          </span>
        );
      }
    },
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <span className="order-date">{formatDate(date)}</span>
    }
  ];

  return (
    <div className="recent-orders-table">
      <div className="recent-orders-header">
        <div>
          <div className="recent-orders-title">Đơn hàng gần đây</div>
          <div className="recent-orders-subtitle">{orders.length} đơn hàng</div>
        </div>
        <Button 
          type="link" 
          onClick={() => navigate('/admin/recent-orders')}
          className="view-all-btn"
        >
          Xem tất cả →
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={orders.slice(0, 3)}
        pagination={false}
        size="small"
        rowKey="id"
        className="orders-table"
      />
    </div>
  );
}

function BestSellersChart({ items }) {
  const navigate = useNavigate();
  const max = Math.max(...items.map((i) => i.totalSold));
  const totalSold = items.reduce((s, i) => s + i.totalSold, 0);

  return (
    <div className="best-sellers-chart">
      <div className="best-sellers-header">
        <div>
          <div className="best-sellers-title">Tổng đã bán</div>
          <div className="best-sellers-total">{totalSold} sản phẩm</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="best-sellers-badge">Top bán chạy</span>
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate('/admin/best-sellers')}
            style={{ padding: 0 }}
          >
            Xem tất cả →
          </Button>
        </div>
      </div>
      <div className="best-sellers-list">
        {items.slice(0, 3).map((item, idx) => {
          const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other';
          return (
            <div key={idx} className="best-seller-item">
              <div className="best-seller-rank">
                <span className={`rank-number ${rankClass}`}>{idx + 1}</span>
              </div>
              <div className="best-seller-content">
                <div className="best-seller-info">
                  <span className={`best-seller-name ${idx < 2 ? '' : 'normal'}`} title={item.productName}>
                    {item.productName}
                  </span>
                </div>
                <div className="sold-count">{item.totalSold} đã bán</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StockBadge({ qty }) {
  if (qty <= 2)
    return <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{qty} còn lại</span>;
  return <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{qty} còn lại</span>;
}

function LowStockTable({ items }) {
  const navigate = useNavigate();
  return (
    <div className="low-stock-table hover-effect">
      {/* Header strip tím giống MetricCardPurple */}
      <div className="low-stock-table-header">
        <div className="low-stock-table-header-content">
          <div className="low-stock-table-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <span className="low-stock-table-title">Tồn kho sắp hết</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="low-stock-table-badge">
            {items.length} mặt hàng
          </span>
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate('/admin/low-stock')}
            style={{ padding: 0, color: 'white' }}
          >
            Xem tất cả →
          </Button>
        </div>
      </div>

      <div className="low-stock-table-content">
        {items.slice(0, 6).map((item, idx) => (
          <div key={item.variantId} className="low-stock-item">
            <div className="low-stock-item-info">
              <span className="low-stock-item-name">{item.productName}</span>
              <span className="low-stock-item-variant">Variant #{item.variantId}</span>
            </div>
            <StockBadge qty={item.stockQuantity} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminHomepage() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    cancellationRate: 0,
    bestSellers: [],
    lowStockProducts: [],
    revenueByMonth: [],
    revenueByQuarter: [],
  });
  
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('revenue');
  const [timeFilter, setTimeFilter] = useState('today');
  const [customDateRange, setCustomDateRange] = useState({ from: null, to: null });
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [revenueTypeFilter] = useState('MONTH');

  // Time filter options
  const timeFilterOptions = [
    { value: 'today', label: 'Hôm nay' },
    { value: '7days', label: '7 ngày' },
    { value: '30days', label: '30 ngày' },
    { value: 'thisMonth', label: 'Tháng này' },
    { value: 'custom', label: 'Tùy chọn' },
    { value: 'monthYear', label: 'Tháng/Năm' },
  ];

  // Order status options
  const orderStatusOptions = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'SHIPPING', label: 'Đang giao' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
    { value: 'WAITING_CONFIRM', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'SUPPORT_CONFIRMED', label: 'Support xác nhận' },
    { value: 'OPERATION_CONFIRMED', label: 'Operation xác nhận' },
    { value: 'FAILED', label: 'Thất bại' },
  ];

  // Revenue type options
  const revenueTypeOptions = [
    { value: 'MONTH', label: '📆 Theo tháng' },
  ];

  // Get date range based on filter
  const getDateRange = () => {
    const now = dayjs();
    let from, to;

    switch (timeFilter) {
      case 'today':
        from = now.startOf('day').format('YYYY-MM-DD');
        to = now.endOf('day').format('YYYY-MM-DD');
        break;
      case '7days':
        from = now.subtract(7, 'day').startOf('day').format('YYYY-MM-DD');
        to = now.endOf('day').format('YYYY-MM-DD');
        break;
      case '30days':
        from = now.subtract(30, 'day').startOf('day').format('YYYY-MM-DD');
        to = now.endOf('day').format('YYYY-MM-DD');
        break;
      case 'thisMonth':
        from = now.startOf('month').format('YYYY-MM-DD');
        to = now.endOf('month').format('YYYY-MM-DD');
        break;
      case 'custom':
        from = customDateRange.from ? customDateRange.from.format('YYYY-MM-DD') : null;
        to = customDateRange.to ? customDateRange.to.format('YYYY-MM-DD') : null;
        break;
      case 'monthYear':
        from = dayjs().year(selectedYear).month(selectedMonth).startOf('month').format('YYYY-MM-DD');
        to = dayjs().year(selectedYear).month(selectedMonth).endOf('month').format('YYYY-MM-DD');
        break;
      default:
        from = null;
        to = null;
    }

    return { from, to };
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { from, to } = getDateRange();
      
      const [dashboardRes, revenueRes, ordersRes] = await Promise.all([
        getManagerDashboardAPI(from, to),
        getDashboardRevenueDetailAPI(revenueTypeFilter, from, to),
        getDashboardOrderDetailAPI(orderStatusFilter, from, to, 0, 10)
      ]);
      
      if (dashboardRes) {
        setData({
          totalRevenue: dashboardRes.totalRevenue || 0,
          totalOrders: dashboardRes.totalOrders || 0,
          averageOrderValue: dashboardRes.averageOrderValue || 0,
          cancellationRate: dashboardRes.cancellationRate || 0,
          bestSellers: dashboardRes.bestSellers || [],
          lowStockProducts: dashboardRes.lowStockProducts || [],
          revenueByMonth: dashboardRes.revenueByMonth || [],
          revenueByQuarter: dashboardRes.revenueByQuarter || [],
        });
      }

      if (revenueRes) {
        setRevenueData(revenueRes);
      }

      if (ordersRes?.content) {
        setOrdersData(ordersRes.content);
        setRecentOrders(ordersRes.content);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter, customDateRange, selectedMonth, selectedYear, orderStatusFilter]);

  // Calculate percentage changes from revenueByMonth/revenueByQuarter
  const getPreviousPeriodData = () => {
    const { from, to } = getDateRange();
    if (!from || !to) return null;
    
    const fromDate = dayjs(from);
    const toDate = dayjs(to);
    const currentMonth = fromDate.month();
    const currentYear = fromDate.year();
    const currentQuarter = Math.floor(currentMonth / 3) + 1;
    
    // If date range spans multiple months or is a full month, use month comparison
    if (timeFilter === 'thisMonth' || timeFilter === 'monthYear' || 
        (fromDate.isSame(fromDate.startOf('month')) && toDate.isSame(toDate.endOf('month')))) {
      // Find previous month data
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear = currentYear - 1;
      }
      
      const prevMonthData = data.revenueByMonth?.find(m => m.time === prevMonth + 1 && m.year === prevYear);
      const currentMonthData = data.revenueByMonth?.find(m => m.time === currentMonth + 1 && m.year === currentYear);
      
      if (prevMonthData && currentMonthData) {
        return {
          totalRevenue: prevMonthData.revenue,
          // Orders và các metric khác không có trong revenueByMonth, nên dùng estimation
          totalOrders: data.totalOrders * (prevMonthData.revenue / currentMonthData.revenue),
          averageOrderValue: data.averageOrderValue,
          cancellationRate: data.cancellationRate,
        };
      }
    }
    
    return null;
  };

  const previousPeriodData = getPreviousPeriodData();

  // Calculate percentage changes
  const revenueChange = previousPeriodData ? 
    calculatePercentageChange(data.totalRevenue, previousPeriodData.totalRevenue) : 0;
  const ordersChange = previousPeriodData ? 
    calculatePercentageChange(data.totalOrders, previousPeriodData.totalOrders) : 0;
  const avgOrderChange = previousPeriodData ? 
    calculatePercentageChange(data.averageOrderValue, previousPeriodData.averageOrderValue) : 0;
  const cancellationChange = previousPeriodData ? 
    calculatePercentageChange(data.cancellationRate, previousPeriodData.cancellationRate) : 0;

  if (loading) {
    return (
      <div className="admin-homepage-container">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-homepage-container">
      {/* Header with improved filters */}
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <p>Tổng quan hoạt động kinh doanh</p>
        </div>
        
        {/* Improved Filter Section */}
        <Card className="filter-card" size="small">
          <div className="dashboard-filters">
            {/* Row 1: Time Period Filter */}
            <div className="filter-group">
              <label className="filter-label"> Thời gian:</label>
              <Select
                value={timeFilter}
                onChange={setTimeFilter}
                style={{ width: 160 }}
                options={[
                  { value: 'today', label: 'Hôm nay' },
                  { value: '7days', label: '7 ngày qua' },
                  { value: '30days', label: '30 ngày qua' },
                  { value: 'thisMonth', label: 'Tháng này' },
                  { value: 'custom', label: ' Tùy chọn...' },
                  { value: 'monthYear', label: ' Tháng/Năm' },
                ]}
              />
            </div>

            {/* Custom Date Range */}
            {timeFilter === 'custom' && (
              <div className="filter-group">
                <label className="filter-label"> Chọn ngày:</label>
                <DatePicker.RangePicker
                  value={[customDateRange.from, customDateRange.to]}
                  onChange={(dates) => setCustomDateRange({ from: dates?.[0], to: dates?.[1] })}
                  format="DD/MM/YYYY"
                  placeholder={['Từ ngày', 'Đến ngày']}
                />
              </div>
            )}

            {/* Month/Year Picker */}
            {timeFilter === 'monthYear' && (
              <div className="filter-group">
                <label className="filter-label"> Chọn tháng:</label>
                <DatePicker
                  picker="month"
                  value={dayjs().year(selectedYear).month(selectedMonth)}
                  onChange={(date) => {
                    setSelectedMonth(date.month());
                    setSelectedYear(date.year());
                  }}
                  format="MM/YYYY"
                />
              </div>
            )}

            {/* Row 2: Order Status Filter */}
            <div className="filter-group">
              <label className="filter-label"> Trạng thái đơn:</label>
              <Select
                value={orderStatusFilter}
                onChange={setOrderStatusFilter}
                style={{ width: 170 }}
                options={[
                  { value: 'ALL', label: ' Tất cả' },
                  { value: 'PAID', label: ' Đã thanh toán' },
                  { value: 'SHIPPING', label: ' Đang giao' },
                  { value: 'COMPLETED', label: ' Hoàn thành' },
                  { value: 'CANCELLED', label: ' Đã hủy' },
                ]}
              />
            </div>

            {/* Row 3: Revenue Chart Type - chỉ hiển thị MONTH */}
            <div className="filter-group">
              <label className="filter-label"> Biểu đồ:</label>
              <Select
                value={revenueTypeFilter}
                style={{ width: 140 }}
                options={revenueTypeOptions}
                disabled
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          label="Tổng doanh thu"
          value={formatVND(data.totalRevenue)}
          change={revenueChange}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          }
          color="purple"
        />
        <MetricCard
          label="Tổng đơn hàng"
          value={data.totalOrders}
          sub="đơn hàng"
          change={ordersChange}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          }
          color="blue"
        />
        <MetricCard
          label="Giá trị TB / đơn"
          value={formatVND(data.averageOrderValue)}
          change={avgOrderChange}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 9h6M9 12h6M9 15h4"/>
            </svg>
          }
          color="blue"
        />
        <MetricCard
          label="Tỉ lệ hủy đơn"
          value={`${data.cancellationRate}%`}
          change={cancellationChange}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          }
          color="white"
        />
      </div>

      {/* Revenue Chart and Recent Orders */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <RevenueChart 
            data={revenueData} 
            chartType={chartType}
            onChartTypeChange={setChartType}
          />
        </Col>
        <Col xs={24} lg={8}>
          <RecentOrdersTable orders={recentOrders} />
        </Col>
      </Row>

      {/* Best Sellers and Low Stock */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <div className="best-sellers-container">
            <BestSellersChart items={data.bestSellers} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <LowStockTable items={data.lowStockProducts} />
        </Col>
      </Row>
    </div>
  );
}
