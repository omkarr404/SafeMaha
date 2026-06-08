// FILE NAME: d:\Omkar\Water\FDA\admin\src\components\OfficerManager.jsx

import React, { useState, useEffect } from 'react';

const MOCK_SERVER_URL = 'http://localhost:8000';

export default function OfficerManager() {
  const [officers, setOfficers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null); // null if adding new
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    district: '',
    role: 'Inspector',
    is_active: true
  });

  useEffect(() => {
    fetchOfficers();
    fetchDistricts();
  }, []);

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('@safemaha_admin_token');
      const res = await fetch(`${MOCK_SERVER_URL}/api/admin/officers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOfficers(data);
      } else {
        setError('Failed to fetch officers directory');
      }
    } catch (err) {
      setError('Connection to backend server failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await fetch(`${MOCK_SERVER_URL}/api/districts`);
      if (res.ok) {
        const data = await res.json();
        setDistricts(data);
        if (data.length > 0 && !formData.district) {
          setFormData(prev => ({ ...prev, district: data[0].name }));
        }
      }
    } catch (err) {
      console.error('Failed to load districts:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingOfficer(null);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      district: districts[0]?.name || '',
      role: 'Inspector',
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (officer) => {
    setEditingOfficer(officer);
    setFormData({
      name: officer.name,
      email: officer.email,
      mobile: officer.mobile,
      district: officer.district,
      role: officer.role,
      is_active: officer.is_active
    });
    setShowModal(true);
  };

  const handleToggleActive = async (officer) => {
    try {
      const token = localStorage.getItem('@safemaha_admin_token');
      const res = await fetch(`${MOCK_SERVER_URL}/api/admin/officers/${officer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !officer.is_active })
      });
      if (res.ok) {
        fetchOfficers();
        alert(`Officer successfully ${!officer.is_active ? 'enabled' : 'disabled'}!`);
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('@safemaha_admin_token');
      const url = editingOfficer 
        ? `${MOCK_SERVER_URL}/api/admin/officers/${editingOfficer.id}`
        : `${MOCK_SERVER_URL}/api/admin/officers`;
      const method = editingOfficer ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        fetchOfficers();
        alert(editingOfficer ? 'Officer details updated successfully!' : 'Officer added successfully!');
      } else {
        const data = await res.json();
        alert(data.detail || 'An error occurred during save.');
      }
    } catch (err) {
      alert('Network request failed.');
    }
  };

  return (
    <div className="animated">
      <div className="page-header">
        <div>
          <h2 className="page-title">Officer Directory</h2>
          <p className="page-subtitle">Configure FDA inspectors, senior staff, and regional administrators</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <i className="fa-solid fa-user-plus"></i> Add New Officer
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '10px', marginBottom: '20px', fontWeight: '600' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i> {error}
        </div>
      )}

      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">Registered FDA Officers ({officers.length})</h3>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748B' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px' }}></i>
              <p style={{ fontWeight: '600' }}>Loading officers directory...</p>
            </div>
          ) : officers.length > 0 ? (
            <table className="custom-table" style={{ cursor: 'default' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>District</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr key={officer.id}>
                    <td style={{ fontWeight: '700', color: '#0A3D62' }}>{officer.name}</td>
                    <td style={{ fontWeight: '600', color: '#3C6382' }}>{officer.role}</td>
                    <td style={{ fontWeight: '600' }}>{officer.district}</td>
                    <td style={{ color: '#64748B' }}>{officer.email}</td>
                    <td style={{ color: '#64748B' }}>+91 {officer.mobile}</td>
                    <td>
                      <span className={`badge ${officer.is_active ? 'badge-action' : 'badge-closed'}`}>
                        {officer.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn" 
                          onClick={() => handleOpenEdit(officer)}
                          style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#E2E8F0', color: '#0F172A' }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button 
                          className="btn"
                          onClick={() => handleToggleActive(officer)}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px', 
                            backgroundColor: officer.is_active ? '#FEE2E2' : '#D1FAE5',
                            color: officer.is_active ? '#B91C1C' : '#047857'
                          }}
                        >
                          {officer.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#94A3B8' }}>
              <i className="fa-solid fa-users-slash" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <p style={{ fontSize: '15px', fontWeight: '600' }}>No officers registered in the directory.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORM POPUP */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(7, 38, 62, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '500px', margin: '20px', animation: 'slideIn 0.3s ease-out' }}>
            <div className="card-header">
              <h3 className="card-title">{editingOfficer ? 'Edit Officer' : 'Add FDA Officer'}</h3>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', fontSize: '20px', color: '#64748B' }} onClick={() => setShowModal(false)}></i>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input 
                  type="text" 
                  maxLength="10"
                  pattern="[0-9]{10}"
                  className="input-field" 
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">FDA Role</label>
                  <select 
                    className="select-filter" 
                    style={{ width: '100%', height: '44px' }}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Inspector">Inspector</option>
                    <option value="Senior Inspector">Senior Inspector</option>
                    <option value="District Officer">District Officer</option>
                    <option value="State Admin">State Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned District</label>
                  <select 
                    className="select-filter" 
                    style={{ width: '100%', height: '44px' }}
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ backgroundColor: '#E2E8F0', color: '#0F172A' }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-floppy-disk"></i> Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
