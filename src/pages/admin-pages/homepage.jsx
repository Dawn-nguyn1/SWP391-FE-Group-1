import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Tooltip
} from 'recharts';

const monthlyData = [
  { month: 'Jan', investment: 45, loss: 30, profit: 25, maintenance: 0 },
  { month: 'Feb', investment: 130, loss: 60, profit: 90, maintenance: 10 },
  { month: 'Mar', investment: 80, loss: 30, profit: 40, maintenance: 5 },
  { month: 'Apr', investment: 60, loss: 25, profit: 15, maintenance: 0 },
  { month: 'May', investment: 70, loss: 25, profit: 20, maintenance: 5 },
  { month: 'Jun', investment: 110, loss: 70, profit: 120, maintenance: 120 },
  { month: 'Jul', investment: 100, loss: 65, profit: 50, maintenance: 0 },
  { month: 'Aug', investment: 20, loss: 15, profit: 10, maintenance: 0 },
  { month: 'Sep', investment: 70, loss: 30, profit: 20, maintenance: 0 },
  { month: 'Oct', investment: 120, loss: 35, profit: 20, maintenance: 0 },
  { month: 'Nov', investment: 70, loss: 50, profit: 70, maintenance: 25 },
  { month: 'Dec', investment: 100, loss: 35, profit: 20, maintenance: 0 },
];

const totalOrderData = [
  { v: 20 }, { v: 45 }, { v: 30 }, { v: 60 }, { v: 40 }, { v: 80 }, { v: 55 }, { v: 90 }, { v: 70 }, { v: 110 }
];

const popularStockAreaData = [
  { v: 40 }, { v: 80 }, { v: 60 }, { v: 120 }, { v: 90 }, { v: 150 }, { v: 110 }, { v: 160 }, { v: 130 }, { v: 100 }
];

const stocks = [
  { name: 'Bajaj Finery', label: '10% Profit', value: '$1839.00', up: true },
  { name: 'TTML',         label: '10% loss',   value: '$100.00',  up: false },
  { name: 'Reliance',     label: '10% Profit', value: '$200.00',  up: true },
  { name: 'TTML',         label: '10% loss',   value: '$189.00',  up: false },
  { name: 'Stolon',       label: '10% loss',   value: '$189.00',  up: false },
];

const ArrowUp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3L13 10H3L8 3Z" fill="#22c55e"/>
  </svg>
);
const ArrowDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 13L3 6H13L8 13Z" fill="#ef4444"/>
  </svg>
);

export default function AdminHomePage() {
  const [period, setPeriod] = useState('Year');

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px', fontFamily: 'Segoe UI, sans-serif', boxSizing: 'border-box' }}>
      
      {/* TOP CARDS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Total Earning */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
          borderRadius: '16px', padding: '24px', color: '#fff', position: 'relative', overflow: 'hidden', minHeight: '130px'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            $500.00
            <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>↑</span>
          </div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>Total Earning</div>
          <div style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', opacity: 0.7, fontSize: '20px', letterSpacing: 2 }}>···</div>
        </div>

        {/* Total Order */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          borderRadius: '16px', padding: '24px', color: '#fff', position: 'relative', overflow: 'hidden', minHeight: '130px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                $961
                <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>↻</span>
              </div>
              <div style={{ fontSize: '13px', opacity: 0.85 }}>Total Order</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setPeriod('Month')} style={{ background: period === 'Month' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>Month</button>
                <button onClick={() => setPeriod('Year')} style={{ background: period === 'Year' ? '#fff' : 'rgba(255,255,255,0.1)', border: 'none', color: period === 'Year' ? '#2563eb' : '#fff', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Year</button>
              </div>
              <div style={{ width: 150, height: 55 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={totalOrderData}>
                    <Line type="monotone" dataKey="v" stroke="white" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>$203k</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Total Income</div>
            </div>
          </div>
          <div style={{ background: '#fff', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', overflow: 'hidden', minHeight: '70px' }}>
            <div style={{ background: '#fef3c7', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            </div>
            <div style={{ zIndex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>$203k</div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>Total Income</div>
            </div>
            <div style={{ position: 'absolute', right: -15, bottom: -25, width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #fde68a, #fbbf24)', opacity: 0.5 }} />
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

        {/* Bar Chart */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>Total Growth</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>$2,324.00</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', color: '#475569', cursor: 'pointer', background: '#fff', outline: 'none' }}>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
              <span style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>☰</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} barCategoryGap="25%" barGap={1}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} ticks={[0, 100, 200, 300, 400]} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '12px' }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="investment" stackId="a" fill="#bfdbfe" name="Investment" />
              <Bar dataKey="loss" stackId="a" fill="#3b82f6" name="Loss" />
              <Bar dataKey="profit" stackId="a" fill="#7c3aed" name="Profit" />
              <Bar dataKey="maintenance" stackId="a" fill="#e2e8f0" radius={[4,4,0,0]} name="Maintenance" />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            {[
              { color: '#bfdbfe', label: 'Investment' },
              { color: '#3b82f6', label: 'Loss' },
              { color: '#7c3aed', label: 'Profit' },
              { color: '#e2e8f0', label: 'Maintenance' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '2px', background: item.color, border: item.color === '#e2e8f0' ? '1px solid #cbd5e1' : 'none' }} />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Stocks */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>Popular Stocks</div>
              <span style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '20px', letterSpacing: 1 }}>···</span>
            </div>
          </div>

          {/* Top Area Chart */}
          <div style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', padding: '16px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#7c3aed' }}>Bajaj Finery</div>
                <div style={{ fontSize: '12px', color: '#8b5cf6' }}>10% Profit</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>$1839.00</div>
            </div>
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={popularStockAreaData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2} fill="url(#stockGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stock List */}
          <div style={{ padding: '4px 20px', flex: 1 }}>
            {stocks.map((stock, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < stocks.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{stock.name}</div>
                  <div style={{ fontSize: '12px', color: stock.up ? '#22c55e' : '#ef4444', marginTop: '2px' }}>{stock.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{stock.value}</span>
                  {stock.up ? <ArrowUp /> : <ArrowDown />}
                </div>
              </div>
            ))}

            <div style={{ textAlign: 'center', padding: '14px 0 8px' }}>
              <a href="#" style={{ color: '#2563eb', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>View All →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}