// FILE NAME: d:\Omkar\Water\FDA\admin\src\components\AdminDashboard.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './AdminDashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://safemaha.onrender.com';

export default function AdminDashboard({ complaints = [], onSelectComplaint, onRefresh }) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [talukaFilter, setTalukaFilter] = useState('All');
  const [officerFilter, setOfficerFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Backend Data States
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Fetch Maharashtra districts from backend API
  useEffect(() => {
    setLoadingDistricts(true);
    fetch(`${API_BASE}/api/districts`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then((data) => setDistricts(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching districts:', err))
      .finally(() => setLoadingDistricts(false));

    // Fetch Officers Directory from backend API
    const token = localStorage.getItem('@safemaha_admin_token');
    fetch(`${API_BASE}/api/admin/officers/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then((data) => setOfficers(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching officers:', err));
  }, []);

  // Fetch Talukas dynamically when District changes
  useEffect(() => {
    if (districtFilter === 'All') {
      setTalukas([]);
      setTalukaFilter('All');
    } else {
      const selected = districts.find((d) => d.name === districtFilter);
      if (selected) {
        fetch(`${API_BASE}/api/districts/${selected.id}/talukas`)
          .then((res) => res.json())
          .then((data) => setTalukas(Array.isArray(data) ? data : []))
          .catch((err) => console.error('Error fetching talukas:', err));
      }
    }
    setCurrentPage(1);
  }, [districtFilter, districts]);

  // Reset pagination on any filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, talukaFilter, officerFilter, sortBy]);

  // Calculate real metrics from complaints array
  const totalCount = complaints.length;
  const newCount = complaints.filter((c) => c.status === 'Submitted').length;
  const pendingCount = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Assigned'
  ).length;
  const investigatingCount = complaints.filter(
    (c) => c.status === 'Investigation' || c.status === 'Action Taken'
  ).length;
  const closedCount = complaints.filter((c) => c.status === 'Closed').length;
  const criticalCount = complaints.filter((c) => c.priority === 'Critical').length;

  // Active filter count calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter !== 'All') count++;
    if (priorityFilter !== 'All') count++;
    if (categoryFilter !== 'All') count++;
    if (districtFilter !== 'All') count++;
    if (talukaFilter !== 'All') count++;
    if (officerFilter !== 'All') count++;
    return count;
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, districtFilter, talukaFilter, officerFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setDistrictFilter('All');
    setTalukaFilter('All');
    setOfficerFilter('All');
    setSortBy('date-desc');
  };

  // Filter complaints list
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Search filter
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (c.id && c.id.toLowerCase().includes(term)) ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.mobile && c.mobile.includes(term)) ||
        (c.title && c.title.toLowerCase().includes(term)) ||
        (c.description && c.description.toLowerCase().includes(term)) ||
        (c.district_name && c.district_name.toLowerCase().includes(term));

      // Status filter
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;

      // Category filter
      const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;

      // District filter
      const matchesDistrict = districtFilter === 'All' || c.district_name === districtFilter;

      // Taluka filter
      const matchesTaluka = talukaFilter === 'All' || c.taluka_name === talukaFilter;

      // Officer filter
      const matchesOfficer = officerFilter === 'All' || c.assignedOfficer === officerFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesDistrict &&
        matchesTaluka &&
        matchesOfficer
      );
    });
  }, [complaints, searchTerm, statusFilter, priorityFilter, categoryFilter, districtFilter, talukaFilter, officerFilter]);

  // Sort complaints list
  const sortedComplaints = useMemo(() => {
    const list = [...filteredComplaints];
    const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };

    return list.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt || a.created_at || 0) - new Date(b.createdAt || b.created_at || 0);
      }
      if (sortBy === 'priority-desc') {
        return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      }
      if (sortBy === 'id-desc') {
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'id-asc') {
        return (a.id || '').localeCompare(b.id || '');
      }
      return 0;
    });
  }, [filteredComplaints, sortBy]);

  // Pagination calculation
  const totalEntries = sortedComplaints.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedComplaints.slice(start, start + pageSize);
  }, [sortedComplaints, currentPage, pageSize]);

  // Category counts for real backend chart
  const categoryStats = useMemo(() => {
    const counts = { food: 0, drug: 0, cosmetic: 0, other: 0 };
    complaints.forEach((c) => {
      if (counts[c.category] !== undefined) {
        counts[c.category]++;
      } else {
        counts.other++;
      }
    });
    return [
      { key: 'food', label: 'Food Safety', count: counts.food, color: '#2563EB' },
      { key: 'drug', label: 'Drugs & Pharmaceuticals', count: counts.drug, color: '#142B4A' },
      { key: 'cosmetic', label: 'Cosmetics & Personal Care', count: counts.cosmetic, color: '#D97706' },
      { key: 'other', label: 'Medical Devices & Other', count: counts.other, color: '#64748B' },
    ];
  }, [complaints]);

  // Helpers for formatting
  const formattedDate = (dateVal) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  const checkIsOverdue = (item) => {
    if (item.status === 'Closed') return false;
    const created = new Date(item.createdAt || item.created_at || Date.now());
    const hoursElapsed = (Date.now() - created.getTime()) / (1000 * 3600);
    if (item.priority === 'Critical' && hoursElapsed > 24) return true;
    if (item.priority === 'High' && hoursElapsed > 72) return true;
    return false;
  };

  const getPriorityBadge = (priority) => {
    const p = priority || 'Low';
    switch (p) {
      case 'Critical':
        return <span className="gov-badge gov-badge-critical"><i className="fa-solid fa-circle-exclamation"></i> Critical</span>;
      case 'High':
        return <span className="gov-badge gov-badge-warning">High</span>;
      case 'Medium':
        return <span className="gov-badge gov-badge-info">Medium</span>;
      case 'Low':
      default:
        return <span className="gov-badge gov-badge-success">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <span className="gov-badge gov-badge-neutral">Submitted</span>;
      case 'Assigned':
        return <span className="gov-badge gov-badge-info">Assigned</span>;
      case 'Investigation':
        return <span className="gov-badge gov-badge-warning">Investigation</span>;
      case 'Action Taken':
        return <span className="gov-badge gov-badge-info" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', borderColor: '#BAE6FD' }}>Action Taken</span>;
      case 'Closed':
        return <span className="gov-badge gov-badge-success"><i className="fa-solid fa-check"></i> Resolved</span>;
      default:
        return <span className="gov-badge gov-badge-neutral">{status || 'Submitted'}</span>;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food':
        return <i className="fa-solid fa-bowl-food" style={{ color: '#2563EB' }}></i>;
      case 'drug':
        return <i className="fa-solid fa-pills" style={{ color: '#142B4A' }}></i>;
      case 'cosmetic':
        return <i className="fa-solid fa-pump-soap" style={{ color: '#D97706' }}></i>;
      default:
        return <i className="fa-solid fa-kit-medical" style={{ color: '#64748B' }}></i>;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* 1. Header Banner */}
      <header className="gov-dashboard-header">
        <div className="gov-header-title-block">
          <span className="gov-dept-tag">
            <i className="fa-solid fa-building-shield"></i> Government of Maharashtra • Food & Drug Administration
          </span>
          <h1 className="gov-dashboard-title">Consumer Grievance Operations Dashboard</h1>
          <p className="gov-dashboard-subtitle">
            Centralized public health surveillance and grievance adjudication across 36 Maharashtra districts
          </p>
        </div>

        <div className="gov-header-actions">
          <span className="gov-live-indicator">
            <span className="gov-live-dot"></span> System Live
          </span>
          {onRefresh && (
            <button
              className="gov-btn gov-btn-outline gov-btn-sm"
              onClick={onRefresh}
              title="Synchronize records with live server"
            >
              <i className="fa-solid fa-rotate"></i> Sync Data
            </button>
          )}
        </div>
      </header>

      {/* 2. Professional 6-Card KPI Metrics Grid */}
      <section className="gov-kpi-grid" aria-label="Key Performance Indicators">
        {/* KPI 1: Total Complaints */}
        <div className="gov-kpi-card">
          <div className="gov-kpi-top">
            <div className="gov-kpi-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
              <i className="fa-solid fa-folder-closed"></i>
            </div>
            <span className="gov-kpi-pill" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
              All Time
            </span>
          </div>
          <div>
            <div className="gov-kpi-value">{totalCount}</div>
            <div className="gov-kpi-label">Total Complaints</div>
          </div>
        </div>

        {/* KPI 2: New Complaints */}
        <div className="gov-kpi-card">
          <div className="gov-kpi-top">
            <div className="gov-kpi-icon-wrap" style={{ backgroundColor: '#F0FDF4', color: '#15803D' }}>
              <i className="fa-solid fa-inbox"></i>
            </div>
            <span className="gov-kpi-pill" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
              {totalCount > 0 ? `${Math.round((newCount / totalCount) * 100)}%` : '0%'}
            </span>
          </div>
          <div>
            <div className="gov-kpi-value">{newCount}</div>
            <div className="gov-kpi-label">New Complaints</div>
          </div>
        </div>

        {/* KPI 3: Pending Complaints */}
        <div className="gov-kpi-card">
          <div className="gov-kpi-top">
            <div className="gov-kpi-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <i className="fa-solid fa-clock"></i>
            </div>
            <span className="gov-kpi-pill" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              Queue
            </span>
          </div>
          <div>
            <div className="gov-kpi-value">{pendingCount}</div>
            <div className="gov-kpi-label">Pending Review</div>
          </div>
        </div>

        {/* KPI 4: Under Investigation */}
        <div className="gov-kpi-card">
          <div className="gov-kpi-top">
            <div className="gov-kpi-icon-wrap" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <span className="gov-kpi-pill" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
              In Field
            </span>
          </div>
          <div>
            <div className="gov-kpi-value">{investigatingCount}</div>
            <div className="gov-kpi-label">Under Investigation</div>
          </div>
        </div>

        {/* KPI 5: Resolved Complaints */}
        <div className="gov-kpi-card">
          <div className="gov-kpi-top">
            <div className="gov-kpi-icon-wrap" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <span className="gov-kpi-pill" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
              {totalCount > 0 ? `${Math.round((closedCount / totalCount) * 100)}% Rate` : '0%'}
            </span>
          </div>
          <div>
            <div className="gov-kpi-value">{closedCount}</div>
            <div className="gov-kpi-label">Resolved Cases</div>
          </div>
        </div>

        {/* KPI 6: Critical Complaints */}
        <div className="gov-kpi-card">
          <div className="gov-kpi-top">
            <div className="gov-kpi-icon-wrap" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <span className="gov-kpi-pill" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              Immediate SLA
            </span>
          </div>
          <div>
            <div className="gov-kpi-value" style={{ color: '#DC2626' }}>{criticalCount}</div>
            <div className="gov-kpi-label">Critical Priority</div>
          </div>
        </div>
      </section>

      {/* 3. Meaningful Real-Data Visualizations */}
      <section className="gov-analytics-row">
        {/* Category Share Progress */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div>
              <h3 className="gov-card-title">Grievance Distribution by Sector</h3>
              <p className="gov-card-subtitle">Volume breakdown across FDA regulated domains</p>
            </div>
          </div>
          <div className="gov-card-body">
            <div className="gov-metric-bar-group">
              {categoryStats.map((item) => {
                const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                return (
                  <div key={item.key} className="gov-bar-item">
                    <div className="gov-bar-labels">
                      <span>{item.label}</span>
                      <span>{item.count} cases ({pct}%)</span>
                    </div>
                    <div className="gov-bar-track">
                      <div
                        className="gov-bar-fill"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Workflow Progression Funnel */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div>
              <h3 className="gov-card-title">Case Processing Pipeline</h3>
              <p className="gov-card-subtitle">Active distribution across investigation lifecycle</p>
            </div>
          </div>
          <div className="gov-card-body">
            <div className="gov-pipeline-steps">
              <div className="gov-pipeline-step">
                <div className="gov-step-count">{newCount}</div>
                <div className="gov-step-name">Submitted</div>
              </div>
              <div className="gov-pipeline-step">
                <div className="gov-step-count">
                  {complaints.filter((c) => c.status === 'Assigned').length}
                </div>
                <div className="gov-step-name">Assigned</div>
              </div>
              <div className="gov-pipeline-step">
                <div className="gov-step-count">
                  {complaints.filter((c) => c.status === 'Investigation').length}
                </div>
                <div className="gov-step-name">Investigation</div>
              </div>
              <div className="gov-pipeline-step">
                <div className="gov-step-count">
                  {complaints.filter((c) => c.status === 'Action Taken').length}
                </div>
                <div className="gov-step-name">Action Taken</div>
              </div>
              <div className="gov-pipeline-step" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
                <div className="gov-step-count" style={{ color: '#15803D' }}>{closedCount}</div>
                <div className="gov-step-name" style={{ color: '#15803D' }}>Closed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Complaints Overview Data Table Container */}
      <section className="gov-complaints-table-card" aria-label="Grievances Data Table">
        {/* Comprehensive Filter Controls */}
        <div className="gov-filter-panel">
          <div className="gov-filter-row-primary">
            {/* Search Input */}
            <div className="gov-search-wrap">
              <i className="fa-solid fa-magnifying-glass gov-search-icon"></i>
              <input
                type="text"
                className="gov-search-input"
                placeholder="Search Reference ID, citizen name, phone, keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="gov-select-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              <option value="food">Food Safety</option>
              <option value="drug">Drugs & Pharma</option>
              <option value="cosmetic">Cosmetics</option>
              <option value="other">Medical Devices / Other</option>
            </select>

            {/* Priority Filter */}
            <select
              className="gov-select-control"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* Status Filter */}
            <select
              className="gov-select-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="Investigation">Under Investigation</option>
              <option value="Action Taken">Action Taken</option>
              <option value="Closed">Closed / Resolved</option>
            </select>

            {/* District Filter */}
            <select
              className="gov-select-control"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              aria-label="Filter by district"
            >
              <option value="All">All Districts (36)</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Taluka Filter */}
            <select
              className="gov-select-control"
              value={talukaFilter}
              onChange={(e) => setTalukaFilter(e.target.value)}
              disabled={districtFilter === 'All'}
              aria-label="Filter by taluka"
            >
              <option value="All">{districtFilter === 'All' ? 'Select District First' : 'All Talukas'}</option>
              {talukas.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Officer Filter */}
            <select
              className="gov-select-control"
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
              aria-label="Filter by officer"
            >
              <option value="All">All Officers</option>
              {officers.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              className="gov-select-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort order"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="priority-desc">Priority: Critical First</option>
              <option value="id-desc">Reference (Z–A)</option>
              <option value="id-asc">Reference (A–Z)</option>
            </select>
          </div>

          {/* Active Filter Indicator & Reset */}
          <div className="gov-filter-row-secondary">
            <div className="gov-active-filter-indicator">
              <span>Showing <strong>{sortedComplaints.length}</strong> matching records</span>
              {activeFiltersCount > 0 && (
                <>
                  <span className="gov-filter-count-chip">{activeFiltersCount} active filters</span>
                  <button className="gov-btn-link-reset" onClick={handleClearFilters}>
                    <i className="fa-solid fa-xmark"></i> Clear Filters
                  </button>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Rows per page:</span>
              <select
                className="gov-select-control"
                style={{ minWidth: '70px', padding: '4px 8px' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="gov-table-wrapper">
          {paginatedComplaints.length > 0 ? (
            <table className="gov-data-table">
              <thead>
                <tr>
                  <th>Reference & Title</th>
                  <th>Citizen Details</th>
                  <th>Domain / Category</th>
                  <th>District & Taluka</th>
                  <th>Priority & SLA</th>
                  <th>Dates (Logged / Updated)</th>
                  <th>Assigned Officer</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComplaints.map((item) => (
                  <tr
                    key={item.id}
                    className="gov-table-row"
                    onClick={() => onSelectComplaint(item.id)}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="gov-id-cell">{item.id}</span>
                          {checkIsOverdue(item) && (
                            <span className="gov-badge gov-badge-critical" style={{ fontSize: '9px', padding: '1px 5px' }}>
                              <i className="fa-solid fa-clock-rotate-left"></i> OVERDUE
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--gov-text)',
                            maxWidth: '220px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={item.title}
                        >
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="gov-citizen-cell">
                        <span className="gov-citizen-name">{item.name || 'Anonymous Citizen'}</span>
                        <span className="gov-citizen-phone">{item.mobile ? `+91 ${item.mobile}` : 'No phone provided'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="gov-category-tag">
                        {getCategoryIcon(item.category)}
                        <span style={{ textTransform: 'capitalize' }}>{item.category || 'General'}</span>
                      </span>
                    </td>
                    <td>
                      <span className="gov-location-text">
                        {item.district_name || (item.location && item.location.address ? item.location.address.split(',')[0] : 'Maharashtra')}
                      </span>
                      {item.taluka_name && (
                        <span className="gov-location-sub">{item.taluka_name}</span>
                      )}
                    </td>
                    <td>{getPriorityBadge(item.priority)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', color: 'var(--gov-text-secondary)', gap: '2px' }}>
                        <span><strong style={{ color: 'var(--gov-text)' }}>Lodged:</strong> {formattedDate(item.createdAt || item.created_at)}</span>
                        {(item.updatedAt || item.updated_at) && (
                          <span style={{ color: '#94A3B8' }}>
                            <strong>Updated:</strong> {formattedDate(item.updatedAt || item.updated_at)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {item.assignedOfficer ? (
                        <span style={{ fontWeight: '600', color: 'var(--gov-primary)' }}>
                          {item.assignedOfficer}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--gov-text-muted)', fontStyle: 'italic', fontSize: '12px' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="gov-btn gov-btn-outline gov-btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(item.id);
                        }}
                      >
                        Review Case <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }}></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="gov-empty-state">
              <div className="gov-empty-icon">
                <i className="fa-solid fa-folder-open"></i>
              </div>
              <h4 className="gov-empty-title">No Grievance Records Found</h4>
              <p className="gov-empty-desc">
                {activeFiltersCount > 0
                  ? 'No complaints match the specific filter and search parameters applied.'
                  : 'There are currently no complaints logged in the system.'}
              </p>
              {activeFiltersCount > 0 && (
                <button className="gov-btn gov-btn-outline gov-btn-sm" onClick={handleClearFilters}>
                  <i className="fa-solid fa-rotate-left"></i> Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5. Pagination Bar */}
        {totalEntries > 0 && (
          <footer className="gov-pagination-bar">
            <div>
              Showing{' '}
              <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, totalEntries)}</strong> of{' '}
              <strong>{totalEntries}</strong> entries
            </div>

            <div className="gov-pagination-controls">
              <button
                className="gov-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span style={{ padding: '0 4px', color: '#94A3B8' }}>…</span>}
                      <button
                        className={`gov-page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                className="gov-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}
