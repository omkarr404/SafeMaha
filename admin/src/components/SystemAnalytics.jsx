// FILE NAME: d:\Omkar\Water\FDA\admin\src\components\SystemAnalytics.jsx

import React, { useState, useEffect } from 'react';

const MOCK_SERVER_URL = 'http://localhost:8000';

export default function SystemAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('@safemaha_admin_token');
      const res = await fetch(`${MOCK_SERVER_URL}/api/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748B' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px' }}></i>
        <p style={{ fontWeight: '600' }}>Aggregating system-wide metrics...</p>
      </div>
    );
  }

  if (!data || !data.summary) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        <h3>Analytics Unavailable</h3>
        <p>No grievance data is currently uploaded to calculate metrics.</p>
      </div>
    );
  }

  const { summary, by_district, by_category, monthly_trends } = data;

  // 1. Prepare Category Chart details
  const categoryLabels = {
    food: { name: 'Food Safety', color: '#38ADA9' },
    drug: { name: 'Drug Safety', color: '#0A3D62' },
    cosmetic: { name: 'Cosmetics', color: '#E58E26' },
    other: { name: 'Others', color: '#82589F' }
  };
  const categoryData = Object.entries(by_category).map(([cat, val]) => ({
    label: categoryLabels[cat]?.name || cat,
    color: categoryLabels[cat]?.color || '#64748B',
    value: val
  }));

  // 2. Prepare District Chart details (Bar Chart)
  const districtData = Object.entries(by_district).sort((a, b) => b[1] - a[1]);
  const maxDistrictVal = districtData.length > 0 ? Math.max(...districtData.map(d => d[1])) : 1;

  // 3. Prepare Monthly Trend details (Line Chart)
  const sortedMonths = Object.entries(monthly_trends).sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonthVal = sortedMonths.length > 0 ? Math.max(...sortedMonths.map(m => m[1])) : 1;

  return (
    <div className="animated">
      <div className="page-header">
        <div>
          <h2 className="page-title">FDA Analytics Dashboard</h2>
          <p className="page-subtitle">Real-time indicators, escalation audits, and district-level metrics</p>
        </div>
        <button className="btn" style={{ backgroundColor: '#E2E8F0', color: '#0F172A' }} onClick={fetchAnalytics}>
          <i className="fa-solid fa-arrows-rotate"></i> Refresh
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
            <i className="fa-solid fa-list-check"></i>
          </div>
          <div className="metric-details">
            <div className="metric-value">{summary.total}</div>
            <div className="metric-label">Total Grievances</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            <i className="fa-solid fa-envelope-open-text"></i>
          </div>
          <div className="metric-details">
            <div className="metric-value">{summary.open}</div>
            <div className="metric-label">Open / In Investigation</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="metric-details">
            <div className="metric-value">{summary.closed}</div>
            <div className="metric-label">Closed / Resolved Cases</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="metric-details">
            <div className="metric-value">{summary.high_priority}</div>
            <div className="metric-label">High / Critical Priority</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#FCE7F3', color: '#DB2777' }}>
            <i className="fa-solid fa-route"></i>
          </div>
          <div className="metric-details">
            <div className="metric-value">{summary.escalated}</div>
            <div className="metric-label">Escalated Incidents</div>
          </div>
        </div>
      </div>

      {/* SVG Analytics Charts */}
      <div className="analytics-grid">
        
        {/* Category Breakdown (Donut Chart) */}
        <div className="chart-card">
          <h3 className="chart-title">
            <i className="fa-solid fa-chart-pie" style={{ color: '#38ADA9' }}></i> Complaints by Category
          </h3>
          <div className="chart-flex">
            {categoryData.length > 0 ? (
              <>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="70" fill="transparent" stroke="#E2E8F0" strokeWidth="20" />
                  {(() => {
                    let cumulativePercent = 0;
                    return categoryData.map((item, index) => {
                      const percent = (item.value / summary.total) * 100;
                      if (percent <= 0) return null;
                      
                      const strokeDasharray = `${(percent / 100) * 2 * Math.PI * 70} ${2 * Math.PI * 70}`;
                      const strokeDashoffset = `${- (cumulativePercent / 100) * 2 * Math.PI * 70}`;
                      cumulativePercent += percent;

                      return (
                        <circle 
                          key={index}
                          cx="90"
                          cy="90"
                          r="70"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          transform="rotate(-90 90 90)"
                        />
                      );
                    });
                  })()}
                  <circle cx="90" cy="90" r="50" fill="white" />
                  <text x="90" y="96" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0A3D62">
                    {summary.total}
                  </text>
                  <text x="90" y="112" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748B">
                    TOTAL
                  </text>
                </svg>

                <div className="chart-legend">
                  {categoryData.map((item, index) => (
                    <div key={index} className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: item.color }} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <span style={{ color: '#64748B' }}>{item.value} ({Math.round((item.value / summary.total) * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '13px' }}>No categories registered.</div>
            )}
          </div>
        </div>

        {/* Resolution Rate (Progress Wheel) */}
        <div className="chart-card">
          <h3 className="chart-title">
            <i className="fa-solid fa-circle-check" style={{ color: '#047857' }}></i> Case Resolution Rate
          </h3>
          <div className="chart-flex" style={{ padding: '10px 0' }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="70" fill="transparent" stroke="#E2E8F0" strokeWidth="16" />
              <circle 
                cx="90" 
                cy="90" 
                r="70" 
                fill="transparent" 
                stroke="#047857" 
                strokeWidth="16" 
                strokeDasharray={`${(summary.resolution_rate / 100) * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                transform="rotate(-90 90 90)"
                strokeLinecap="round"
              />
              <text x="90" y="90" textAnchor="middle" fontSize="26" fontWeight="800" fill="#047857">
                {summary.resolution_rate}%
              </text>
              <text x="90" y="112" textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748B">
                RESOLVED CASES
              </text>
            </svg>

            <div style={{ maxWidth: '200px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0A3D62', marginBottom: '6px' }}>FDA Service Standard</div>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.6' }}>
                Resolution rate measures closed cases out of total grievances filed. Standard FDA compliance target is <strong>&gt; 85%</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Complaints by District (Bar Chart) */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="chart-title">
            <i className="fa-solid fa-map-location-dot" style={{ color: '#0A3D62' }}></i> Regional Distribution (Districts)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            {districtData.length > 0 ? (
              districtData.slice(0, 5).map(([name, count], index) => {
                const widthPercent = (count / maxDistrictVal) * 100;
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '130px', fontWeight: '700', fontSize: '13px', color: '#0A3D62' }}>{name}</div>
                    <div style={{ flex: 1, backgroundColor: '#E2E8F0', height: '24px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                      <div 
                        style={{ 
                          width: `${widthPercent}%`, 
                          backgroundColor: '#3C6382', 
                          height: '100%', 
                          borderRadius: '6px',
                          transition: 'width 0.6s ease'
                        }} 
                      />
                    </div>
                    <div style={{ width: '50px', textAlign: 'right', fontWeight: '700', fontSize: '13px', color: '#3C6382' }}>{count}</div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No regional records submitted yet.</div>
            )}
          </div>
        </div>

        {/* Monthly Trend (Line Graph SVG) */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="chart-title">
            <i className="fa-solid fa-chart-line" style={{ color: '#E58E26' }}></i> Monthly Influx Trends
          </h3>
          {sortedMonths.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="100%" height="220" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="#E2E8F0" strokeWidth="1.5" />
                
                {/* SVG path calculations */}
                {(() => {
                  const paddingLeft = 60;
                  const paddingRight = 440;
                  const step = sortedMonths.length > 1 ? (paddingRight - paddingLeft) / (sortedMonths.length - 1) : 0;
                  const points = sortedMonths.map(([m, val], idx) => {
                    const x = paddingLeft + idx * step;
                    // Scale Y value (170 is bottom baseline, 20 is top padding)
                    const y = 170 - (val / maxMonthVal) * 140;
                    return { x, y, month: m, val };
                  });

                  const pathD = points.reduce((acc, p, idx) => (
                    idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
                  ), '');

                  const areaD = points.length > 0 
                    ? `${pathD} L ${points[points.length-1].x} 170 L ${points[0].x} 170 Z`
                    : '';

                  return (
                    <>
                      {/* Area Fill */}
                      {areaD && <path d={areaD} fill="rgba(229, 143, 38, 0.08)" />}
                      {/* Trend Line */}
                      {pathD && <path d={pathD} fill="none" stroke="#E58E26" strokeWidth="3.5" strokeLinecap="round" />}
                      
                      {/* Circle Dots */}
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#E58E26" stroke="white" strokeWidth="1.5" />
                          {/* Value Tag above dot */}
                          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0A3D62">
                            {p.val}
                          </text>
                          {/* Label below axis */}
                          <text x={p.x} y="186" textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748B">
                            {p.month}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          ) : (
            <div style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No monthly trend details loaded.</div>
          )}
        </div>

      </div>
    </div>
  );
}
