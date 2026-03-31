import React, { useEffect, useState } from 'react';
import { Table, Card, Input, Select, Button, Tag, Progress, Space, Pagination, Alert, Statistic, Row, Col } from 'antd';
import { ReloadOutlined, SearchOutlined, WarningOutlined, ShoppingOutlined, InboxOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getManagerDashboardAPI } from '../../services/api.service';
import './low-stock-detail.css';

const STOCK_LEVELS = {
  CRITICAL: { label: 'Cực kỳ nguy hiểm', color: '#ff4d4f', bgColor: '#fff2f0', threshold: 2 },
  WARNING: { label: 'Sắp hết hàng', color: '#faad14', bgColor: '#fffbe6', threshold: 10 },
  NORMAL: { label: 'Ổn định', color: '#52c41a', bgColor: '#f6ffed', threshold: 20 },
  GOOD: { label: 'Dồi dào', color: '#1890ff', bgColor: '#e6f7ff', threshold: Infinity },
};

function getStockStatus(qty) {
  if (qty <= 2) return STOCK_LEVELS.CRITICAL;
  if (qty <= 10) return STOCK_LEVELS.WARNING;
  if (qty <= 20) return STOCK_LEVELS.NORMAL;
  return STOCK_LEVELS.GOOD;
}

export default function LowStockDetail() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('stockQuantity');

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      const res = await getManagerDashboardAPI();
      
      if (res?.lowStockProducts) {
        let filtered = [...res.lowStockProducts];
        
        // Filter by stock level
        if (stockLevelFilter !== 'ALL') {
          filtered = filtered.filter(p => {
            const status = getStockStatus(p.stockQuantity);
            return status.label === STOCK_LEVELS[stockLevelFilter].label;
          });
        }
        
        // Sort
        filtered.sort((a, b) => {
          if (sortBy === 'stockQuantity') return a.stockQuantity - b.stockQuantity;
          if (sortBy === 'productName') return a.productName?.localeCompare(b.productName);
          return 0;
        });
        
        setProducts(filtered);
        setPagination({
          current: 1,
          pageSize: 10,
          total: filtered.length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, [stockLevelFilter, sortBy]);

  const handleSearch = () => {
    fetchLowStockProducts();
  };

  const handleReset = () => {
    setSearchKeyword('');
    setStockLevelFilter('ALL');
    setSortBy('stockQuantity');
    fetchLowStockProducts();
  };

  // Statistics
  const criticalCount = products.filter(p => p.stockQuantity <= 2).length;
  const warningCount = products.filter(p => p.stockQuantity > 2 && p.stockQuantity <= 10).length;
  const totalLowStock = products.length;

  const filteredProducts = products.filter(product => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      product.productName?.toLowerCase().includes(keyword) ||
      product.variantId?.toString().includes(keyword)
    );
  });

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <span style={{ fontWeight: 'bold' }}>
          {index + 1 + (pagination.current - 1) * pagination.pageSize}
        </span>
      ),
    },
    {
      title: 'Variant ID',
      dataIndex: 'variantId',
      key: 'variantId',
      width: 120,
      align: 'center',
      render: (id) => <span className="variant-id">#{id}</span>,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 300,
      render: (text, record) => {
        const status = getStockStatus(record.stockQuantity);
        return (
          <div className="product-info">
            <div className="product-name" title={text}>{text}</div>
            <Tag color={status.color} style={{ marginTop: 4 }}>
              {status.label}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 150,
      align: 'center',
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
      render: (value) => {
        const status = getStockStatus(value);
        const percent = Math.min((value / 20) * 100, 100);
        return (
          <div className="stock-quantity">
            <div className="stock-number" style={{ color: status.color, fontWeight: 'bold' }}>
              {value} <span className="unit">cái</span>
            </div>
            <Progress 
              percent={percent} 
              size="small" 
              strokeColor={status.color}
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const qty = record.stockQuantity;
        const status = getStockStatus(qty);
        return (
          <Tag 
            color={status.color}
            style={{ 
              backgroundColor: status.bgColor,
              borderColor: status.color,
              fontWeight: 500,
            }}
          >
            {qty <= 2 && <ExclamationCircleOutlined style={{ marginRight: 4 }} />}
            {status.label}
          </Tag>
        );
      },
    },
    {
      title: 'Sale Type',
      dataIndex: 'saleType',
      key: 'saleType',
      width: 120,
      align: 'center',
      render: (type) => {
        const isPreOrder = type === 'PRE_ORDER';
        return (
          <Tag color={isPreOrder ? 'blue' : 'green'}>
            {isPreOrder ? '📦 Pre-order' : '🏪 In Stock'}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="low-stock-detail-container">
      {/* Alert Section */}
      {criticalCount > 0 && (
        <Alert
          message={`Cảnh báo: ${criticalCount} sản phẩm đang ở mức cực kỳ nguy hiểm (≤ 2 cái)`}
          description="Cần nhập thêm hàng ngay lập tức để tránh hết hàng"
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      <Card className="page-card">
        <div className="page-header">
          <div>
            <h1><InboxOutlined /> Tồn kho sắp hết</h1>
            <p>Theo dõi và quản lý sản phẩm tồn kho thấp</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={8}>
            <Card className="stat-card critical">
              <Statistic
                title={<span style={{ color: '#ff4d4f' }}>⚠️ Cực kỳ nguy hiểm</span>}
                value={criticalCount}
                suffix="sản phẩm"
                valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
                prefix={<WarningOutlined />}
              />
              <div className="stat-desc">≤ 2 cái trong kho</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card warning">
              <Statistic
                title={<span style={{ color: '#faad14' }}>🔔 Sắp hết hàng</span>}
                value={warningCount}
                suffix="sản phẩm"
                valueStyle={{ color: '#faad14', fontSize: '24px' }}
                prefix={<ShoppingOutlined />}
              />
              <div className="stat-desc">3-10 cái trong kho</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card total">
              <Statistic
                title="📊 Tổng sản phẩm cần chú ý"
                value={totalLowStock}
                suffix="sản phẩm"
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                prefix={<InboxOutlined />}
              />
              <div className="stat-desc">Tất cả sản phẩm tồn kho thấp</div>
            </Card>
          </Col>
        </Row>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-row" style={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}>
            <div className="filter-item search-item">
              <label>Tìm kiếm:</label>
              <Input
                placeholder="Tìm theo tên sản phẩm, variant ID..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
              />
            </div>

            <div className="filter-item" style={{ marginLeft: '16px' }}>
              <label>Mức độ tồn kho:</label>
              <Select
                value={stockLevelFilter}
                onChange={setStockLevelFilter}
                style={{ width: 200 }}
                placeholder="Lọc theo mức độ"
              >
                <Select.Option value="ALL">📋 Tất cả mức độ</Select.Option>
                <Select.Option value="CRITICAL">
                  <span style={{ color: '#ff4d4f' }}>⚠️ Cực kỳ nguy hiểm (≤2)</span>
                </Select.Option>
                <Select.Option value="WARNING">
                  <span style={{ color: '#faad14' }}>🔔 Sắp hết hàng (3-10)</span>
                </Select.Option>
                <Select.Option value="NORMAL">
                  <span style={{ color: '#52c41a' }}>✅ Ổn định (11-20)</span>
                </Select.Option>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total} sản phẩm`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
          rowKey="variantId"
          scroll={{ x: 900 }}
          className="low-stock-table"
        />
      </Card>
    </div>
  );
}
