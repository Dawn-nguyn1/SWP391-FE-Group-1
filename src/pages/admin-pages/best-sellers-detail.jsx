import React, { useEffect, useState } from 'react';
import { Table, Card, DatePicker, Select, Button, Input, Progress, Tag, Pagination } from 'antd';
import { ReloadOutlined, SearchOutlined, TrophyOutlined, RiseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getManagerDashboardAPI } from '../../services/api.service';
import './best-sellers-detail.css';

const { RangePicker } = DatePicker;

export default function BestSellersDetail() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filter states
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [sortBy, setSortBy] = useState('totalSold');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchBestSellers = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const from = dateRange?.[0]?.format('YYYY-MM-DD') || null;
      const to = dateRange?.[1]?.format('YYYY-MM-DD') || null;
      
      const res = await getManagerDashboardAPI(from, to);
      
      if (res?.bestSellers) {
        // Sort based on selected criteria
        let sorted = [...res.bestSellers];
        if (sortBy === 'totalSold') {
          sorted.sort((a, b) => b.totalSold - a.totalSold);
        } else if (sortBy === 'revenue') {
          sorted.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
        }
        
        setProducts(sorted);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: sorted.length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch best sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestSellers();
  }, [sortBy]);

  const handleSearch = () => {
    fetchBestSellers(1, 10);
  };

  const handleReset = () => {
    setDateRange([dayjs().subtract(30, 'days'), dayjs()]);
    setSortBy('totalSold');
    setSearchKeyword('');
    setCategoryFilter('ALL');
    fetchBestSellers(1, 10);
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Calculate statistics
  const totalSold = products.reduce((sum, p) => sum + (p.totalSold || 0), 0);
  const maxSold = Math.max(...products.map(p => p.totalSold || 0), 1);
  const topProduct = products[0];

  const filteredProducts = products.filter(product => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return product.productName?.toLowerCase().includes(keyword);
  });

  const getRankTag = (rank) => {
    if (rank === 1) return <Tag color="gold" icon={<TrophyOutlined />}>Top 1</Tag>;
    if (rank === 2) return <Tag color="silver">Top 2</Tag>;
    if (rank === 3) return <Tag color="orange">Top 3</Tag>;
    if (rank <= 10) return <Tag color="blue">Top 10</Tag>;
    return <Tag>#{rank}</Tag>;
  };

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
      title: 'Xếp hạng',
      key: 'rank',
      width: 100,
      align: 'center',
      render: (_, __, index) => getRankTag(index + 1 + (pagination.current - 1) * pagination.pageSize),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 300,
      render: (text, record, index) => (
        <div className="product-name-cell">
          <span className={`rank-badge rank-${index < 3 ? index + 1 : 'other'}`}>
            {index + 1 + (pagination.current - 1) * pagination.pageSize}
          </span>
          <span className="product-name-text" title={text}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'totalSold',
      key: 'totalSold',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.totalSold - b.totalSold,
      render: (value) => (
        <span className="sold-count">
          <RiseOutlined /> {value?.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Tỷ lệ',
      key: 'percentage',
      width: 150,
      render: (_, record) => {
        const percentage = ((record.totalSold || 0) / maxSold) * 100;
        return (
          <div className="percentage-cell">
            <Progress 
              percent={percentage.toFixed(1)} 
              size="small" 
              strokeColor={percentage > 50 ? '#52c41a' : '#1890ff'}
            />
          </div>
        );
      },
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 150,
      align: 'right',
      sorter: (a, b) => (a.revenue || 0) - (b.revenue || 0),
      render: (value) => (
        <span className="revenue-text">
          {value ? formatVND(value) : '0đ'}
        </span>
      ),
    },
  ];

  return (
    <div className="best-sellers-detail-container">
      <Card className="page-card">
        <div className="page-header">
          <div>
            <h1><TrophyOutlined /> Tổng sản phẩm đã bán</h1>
            <p>Thống kê chi tiết sản phẩm bán chạy nhất</p>
          </div>
          {topProduct && (
            <div className="top-product-badge">
              <span className="label">Sản phẩm bán chạy nhất:</span>
              <span className="value">{topProduct.productName}</span>
              <span className="sold">({topProduct.totalSold} đã bán)</span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <Card className="summary-card">
            <div className="summary-label">Tổng sản phẩm đã bán</div>
            <div className="summary-value">{totalSold.toLocaleString()}</div>
          </Card>
          <Card className="summary-card">
            <div className="summary-label">Số lượng sản phẩm</div>
            <div className="summary-value">{products.length}</div>
          </Card>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-row" style={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}>
            <div className="filter-item search-item">
              <label>Tìm kiếm:</label>
              <Input
                placeholder="Nhập tên sản phẩm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
              />
            </div>

            <div className="filter-item" style={{ marginLeft: '16px' }}>
              <label>Khoảng thời gian:</label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
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
            showQuickJumper: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total} sản phẩm`,
          }}
          onChange={handleTableChange}
          rowKey="productId"
          scroll={{ x: 900 }}
          className="best-sellers-table"
        />
      </Card>
    </div>
  );
}
