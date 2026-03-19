import React, { useEffect, useState } from 'react';
import './homepage.css';
import { getManagerDashboardAPI } from '../../services/api.service';

const GENDER_MAP = { 0: "Nữ", 1: "Nam", 2: "Khác" };
const GENDER_COLORS = { 1: "#7c3aed", 0: "#2563eb", 2: "#bfdbfe" };

function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function MetricCardPurple({ label, value, sub }) {
  return (
    <div className="metric-card-purple">
      <div className="metric-card-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      </div>
      <span className="metric-card-label">{label}</span>
      <span className="metric-card-value">{value}</span>
      {sub && <span className="metric-card-sub">{sub}</span>}
    </div>
  );
}

function MetricCardBlue({ label, value, sub, icon }) {
  return (
    <div className="metric-card-blue">
      <div className="metric-card-icon">
        {icon}
      </div>
      <span className="metric-card-label">{label}</span>
      <span className="metric-card-value">{value}</span>
      {sub && <span className="metric-card-sub">{sub}</span>}
    </div>
  );
}

function MetricCardWhite({ label, value, sub }) {
  return (
    <div className="metric-card-white">
      <div className="metric-card-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      </div>
      <span className="metric-card-label">{label}</span>
      <span className="metric-card-value">{value}</span>
      {sub && <span className="metric-card-sub">{sub}</span>}
    </div>
  );
}

function BestSellersChart({ items }) {
  const max = Math.max(...items.map((i) => i.totalSold));
  const totalSold = items.reduce((s, i) => s + i.totalSold, 0);

  return (
    <div className="best-sellers-chart">
      <div className="best-sellers-header">
        <div>
          <div className="best-sellers-title">Tổng đã bán</div>
          <div className="best-sellers-total">{totalSold} sản phẩm</div>
        </div>
        <span className="best-sellers-badge">Top bán chạy</span>
      </div>
      <div className="best-sellers-list">
        {items.map((item, idx) => {
          const pct = (item.totalSold / max) * 100;
          const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other';
          return (
            <div key={idx} className="best-seller-item">
              <div className="best-seller-row">
                <span className={`best-seller-name ${idx < 2 ? '' : 'normal'}`} title={item.productName}>
                  {item.productName}
                </span>
                <span className={`best-seller-count ${idx === 0 ? 'top' : ''}`}>
                  {item.totalSold}
                </span>
              </div>
              <div className="best-seller-bar">
                <div className={`best-seller-bar-fill ${rankClass}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DonutChart({ stats }) {
  const total = stats.reduce((s, g) => s + g.count, 0);
  let cumulative = 0;
  const r = 54, cx = 72, cy = 72;
  const circumference = 2 * Math.PI * r;

  const segments = stats.map((g) => {
    const start = cumulative;
    cumulative += g.percentage;
    return { ...g, start, dash: (g.percentage / 100) * circumference, offset: -(start / 100) * circumference };
  });

  return (
    <div className="gender-chart">
      <div className="gender-chart-header">
        <div className="gender-chart-title-container">
          <div className="gender-chart-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span className="gender-chart-title">Giới tính người dùng</span>
        </div>
        <span className="gender-chart-total">{total} users</span>
      </div>

      <div className="gender-chart-content">
        <div className="gender-chart-svg">
          <svg width={144} height={144} viewBox="0 0 144 144">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={18} />
            {segments.map((seg, i) => (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={GENDER_COLORS[seg.gender]} strokeWidth={18}
                strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                strokeDashoffset={seg.offset + circumference / 4}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            ))}
            <text x={cx} y={cy - 7} textAnchor="middle" fontSize={22} fontWeight={700} fill="#1e293b" fontFamily="'DM Mono', monospace">{total}</text>
            <text x={cx} y={cy + 13} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="sans-serif">users</text>
          </svg>
        </div>
        <div className="gender-chart-legend">
          {segments.map((seg) => (
            <div key={seg.gender} className="gender-legend-item">
              <div className="gender-legend-color" style={{ background: GENDER_COLORS[seg.gender] }} />
              <span className="gender-legend-name">{GENDER_MAP[seg.gender]}</span>
              <span className="gender-legend-percentage">{seg.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
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
        <span className="low-stock-table-badge">
          {items.length} mặt hàng
        </span>
      </div>

      <div className="low-stock-table-content">
        {items.map((item, idx) => (
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
    genderStats: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getManagerDashboardAPI();
        
        if (response) {
          setData({
            totalRevenue: response.totalRevenue || 0,
            totalOrders: response.totalOrders || 0,
            averageOrderValue: response.averageOrderValue || 0,
            cancellationRate: response.cancellationRate || 0,
            bestSellers: response.bestSellers || [],
            genderStats: response.genderStats || [],
            lowStockProducts: response.lowStockProducts || [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Keep default values if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      {/* Header */}
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Section label */}
      <div className="section-label">
        Sales Performance
      </div>

      {/* 4 metric cards */}
      <div className="metrics-grid">
        <MetricCardPurple label="Tổng doanh thu" value={formatVND(data.totalRevenue)} />
        <MetricCardBlue
          label="Tổng đơn hàng"
          value={data.totalOrders}
          sub="đơn hàng"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
        />
        <MetricCardBlue
          label="Giá trị TB / đơn"
          value={formatVND(data.averageOrderValue)}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>}
        />
        <MetricCardWhite label="Tỉ lệ hủy đơn" value={`${data.cancellationRate}%`} sub="✓ Không có đơn hủy" />
      </div>

      {/* Best sellers */}
      <div className="best-sellers-container">
        <BestSellersChart items={data.bestSellers} />
      </div>

      {/* Section label */}
      <div className="section-label">
        Customer & Operations
      </div>

      {/* Donut + Low stock side by side */}
      <div className="donut-low-stock-grid">
        <DonutChart stats={data.genderStats} />
        <LowStockTable items={data.lowStockProducts} />
      </div>
    </div>
  );
}
