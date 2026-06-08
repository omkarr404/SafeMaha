// FILE NAME: d:\Omkar\Water\FDA\admin\src\components\AdminDashboard.jsx

import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ complaints, onSelectComplaint }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [talukaFilter, setTalukaFilter] = useState('All');
  const [officerFilter, setOfficerFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'id-desc', 'id-asc'

  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    // Fetch districts
    fetch('http://localhost:8000/api/districts')
      .then(res => res.json())
      .then(data => setDistricts(data))
      .catch(err => console.error('Error fetching districts:', err));

    // Fetch officers
    const token = localStorage.getItem('@safemaha_admin_token');
    fetch('http://localhost:8000/api/admin/officers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOfficers(data))
      .catch(err => console.error('Error fetching officers:', err));
  }, []);

  useEffect(() => {
    if (districtFilter === 'All') {
      setTalukas([]);
      setTalukaFilter('All');
    } else {
      const selected = districts.find(d => d.name === districtFilter);
      if (selected) {
        fetch(`http://localhost:8000/api/districts/${selected.id}/talukas`)
          .then(res => res.json())
          .then(data => setTalukas(data))
          .catch(err => console.error('Error fetching talukas:', err));
      }
    }
  }, [districtFilter, districts]);

  // Calculations for KPI metric cards
  const totalCount = complaints.length;
  
  const openCount = complaints.filter(
    c => c.status === 'Submitted' || c.status === 'Assigned'
  ).length;

  const investigatingCount = complaints.filter(
    c => c.status === 'Investigation' || c.status === 'Action Taken'
  ).length;

  const closedCount = complaints.filter(
    c => c.status === 'Closed'
  ).length;

  // Filter complaints list
  const filteredComplaints = complaints.filter((c) => {
    // Search filter (ID, name, title)
    const matchesSearch = 
      (c.id && c.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = c.status === statusFilter;
    }

    // Category filter
    let matchesCategory = true;
    if (categoryFilter !== 'All') {
      matchesCategory = c.category === categoryFilter;
    }

    // District filter
    let matchesDistrict = true;
    if (districtFilter !== 'All') {
      matchesDistrict = c.district_name === districtFilter;
    }

    // Taluka filter
    let matchesTaluka = true;
    if (talukaFilter !== 'All') {
      matchesTaluka = c.taluka_name === talukaFilter;
    }

    // Officer filter
    let matchesOfficer = true;
    if (officerFilter !== 'All') {
      matchesOfficer = c.assignedOfficer === officerFilter;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDistrict && matchesTaluka && matchesOfficer;
  });

  // Sort complaints list
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'date-asc') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'id-desc') {
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'id-asc') {
      return a.id.localeCompare(b.id);
    }
    return 0;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return <span className="badge badge-submitted">Submitted</span>;
      case 'Assigned':
        return <span className="badge badge-assigned">Assigned</span>;
      case 'Investigation':
        return <span className="badge badge-investigation">Investigation</span>;
      case 'Action Taken':
        return <span className="badge badge-action">Action Taken</span>;
      case 'Closed':
        return <span className="badge badge-closed">Closed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority || 'Low';
    switch (p) {
      case 'Critical':
        return <span className="badge badge-priority-critical">Critical</span>;
      case 'High':
        return <span className="badge badge-priority-high">High</span>;
      case 'Medium':
        return <span className="badge badge-priority-medium">Medium</span>;
      default:
        return <span className="badge badge-priority-low">Low</span>;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'food': return 'Food Safety';
      case 'drug': return 'Drug Safety';
      case 'cosmetic': return 'Cosmetic Safety';
      case 'other': return 'Other Grievance';
      default: return category;
    }
  };

  const formattedDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="animated">
      <div className="page-header">
        <div>
          <h2 className="page-title">Management Dashboard</h2>
          <p className="page-subtitle">Overview of consumer grievances filed with Maharashtra FDA</p>
        </div>
      </div>


      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
            <i className="fa-solid fa-list-check"></i>
          </div>
          <div className="metric-details">
            <div className="metric-value">{totalCount}</div>
            <div className="metric-label">Total Complaints</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            <i className="fa-solid fa-envelope-open-text"></i>
          </div>
          <div className="metric-details">
            <div className="metric-value">{openCount}</div>
            <div className="metric-label">Open Complaints</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <i className="fa-solid fa-magnifying-glass-chart"></i>
          </div>
          <div className="metric-details">
            <div className="metric-value">{investigatingCount}</div>
            <div className="metric-label">Under Investigation</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#D1FAE5', color: '#047857' }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="metric-details">
            <div className="metric-value">{closedCount}</div>
            <div className="metric-label">Closed Cases</div>
          </div>
        </div>
      </div>

      {/* Complaints List Card */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">Grievances Register ({sortedComplaints.length})</h3>
          
          {/* Controls Bar */}
          <div className="filters-bar">
            {/* Search */}
            <div className="search-input-wrapper">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                className="input-field"
                placeholder="Search ID, name, keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="select-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="food">Food Safety</option>
              <option value="drug">Drug Safety</option>
              <option value="cosmetic">Cosmetics Safety</option>
              <option value="other">Other Grievance</option>
            </select>

            {/* District Filter */}
            <select
              className="select-filter"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
            >
              <option value="All">All Districts</option>
              {districts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            {/* Taluka Filter */}
            <select
              className="select-filter"
              value={talukaFilter}
              onChange={(e) => setTalukaFilter(e.target.value)}
              disabled={districtFilter === 'All'}
            >
              <option value="All">All Talukas</option>
              {talukas.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>

            {/* Officer Filter */}
            <select
              className="select-filter"
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
            >
              <option value="All">All Officers</option>
              {officers.map(o => (
                <option key={o.id} value={o.name}>{o.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="Investigation">Investigation</option>
              <option value="Action Taken">Action Taken</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Sort Order */}
            <select
              className="select-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="id-desc">Reference (High-Low)</option>
              <option value="id-asc">Reference (Low-High)</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="table-responsive">
          {sortedComplaints.length > 0 ? (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Reference ID</th>
                  <th>Citizen Name</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Date Logged</th>
                  <th>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedComplaints.map((item) => (
                  <tr key={item.id} onClick={() => onSelectComplaint(item.id)}>
                    <td style={{ fontWeight: '800', color: '#0A3D62' }}>{item.id}</td>
                    <td style={{ fontWeight: '600' }}>{item.name || 'Anonymous'}</td>
                    <td style={{ fontWeight: '600', color: '#3C6382' }}>{getCategoryLabel(item.category)}</td>
                    <td>{getPriorityBadge(item.priority)}</td>
                    <td style={{ color: '#64748B' }}>{formattedDate(item.createdAt)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          ) : (
            <div style={{
              padding: '60px 24px',
              textAlign: 'center',
              color: '#94A3B8'
            }}>
              <i className="fa-regular fa-folder-open" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <p style={{ fontSize: '15px', fontWeight: '600' }}>No grievances match the filtered criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
