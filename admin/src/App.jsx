// FILE NAME: d:\Omkar\Water\FDA\admin\src\App.jsx

import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ComplaintDetails from './components/ComplaintDetails';
import OfficerManager from './components/OfficerManager';
import SystemAnalytics from './components/SystemAnalytics';

const MOCK_SERVER_URL = 'http://localhost:8000';

const INITIAL_MOCK_COMPLAINTS = [
  {
    id: 'MHFDA-2026-000101',
    name: 'Omkar Somkuwar',
    mobile: '9876543210',
    category: 'food',
    title: 'Adulterated Paneer in Pune Sweet Home',
    description: 'Purchased 500g paneer on June 5. It had a rubbery texture, acidic smell, and turned dark blue when tested with home starch detection solution. Store Address: Pune Sweet Home, FC Road, Pune.',
    status: 'Investigation',
    assignedOfficer: 'Officer S. D. Deshmukh',
    evidence: ['https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=60'],
    location: {
      address: 'FC Road, Pune, Maharashtra',
      latitude: 18.5204,
      longitude: 73.8567
    },
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
    notes: [
      {
        id: 'note-1',
        author: 'Officer S. D. Deshmukh',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        comment: 'Conducted on-site inspection. Found sanitation compliance failures in food prep area. Collected 200g paneer sample and dispatched to Central Laboratory for starch chemical verification.'
      }
    ]
  },
  {
    id: 'MHFDA-2026-000102',
    name: 'Ashish Kulkarni',
    mobile: '9876543210',
    category: 'drug',
    title: 'Expired Paracetamol strip sold with scratched date',
    description: 'A strip of Paracetamol 650 was sold at Apollo Meds in Bandra. The pharmacist deliberately scratched off the expiry date text. Close inspection revealed the expiry was November 2025. Invoice collected.',
    status: 'Assigned',
    assignedOfficer: 'Inspector V. R. More',
    evidence: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'],
    location: {
      address: 'Bandra West, Mumbai, Maharashtra',
      latitude: 19.0596,
      longitude: 72.8295
    },
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
    notes: []
  },
  {
    id: 'MHFDA-2026-000103',
    name: 'Praniti Joshi',
    mobile: '9999999999',
    category: 'cosmetic',
    title: 'Counterfeit Lipstick causing chemical skin burns',
    description: 'Purchased a lipstick labelled as premium herbal brand from local street seller in Thane. Post application, lips developed painful swelling and chemical rashes. Packing lack batch prints and ingredient list.',
    status: 'Submitted',
    assignedOfficer: '',
    evidence: [],
    location: {
      address: 'Thane Station Road, Thane, Maharashtra',
      latitude: 19.1860,
      longitude: 72.9639
    },
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    notes: []
  }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'settings'
  const [syncStatus, setSyncStatus] = useState('offline'); // 'online', 'offline'

  // Check login state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('@safemaha_admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch complaints once logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchComplaints();
    }
  }, [isLoggedIn]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('@safemaha_admin_token');
      const headers = { 'Accept': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${MOCK_SERVER_URL}/api/complaints`, { headers });
      if (res.ok) {
        let list = await res.json();
        // If server is empty, initialize it with mock data
        if (list.length === 0) {
          for (const item of INITIAL_MOCK_COMPLAINTS) {
            await fetch(`${MOCK_SERVER_URL}/api/complaints`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(item)
            });
          }
          // Re-fetch
          const reloadRes = await fetch(`${MOCK_SERVER_URL}/api/complaints`, { headers });
          list = await reloadRes.json();
        }
        setComplaints(list);
        localStorage.setItem('@safemaha_admin_complaints', JSON.stringify(list));
        setSyncStatus('online');
      } else {
        throw new Error('Server returned error');
      }
    } catch (err) {
      console.log('Unable to sync with mock server, loading from localStorage:', err);
      setSyncStatus('offline');
      // Load offline from browser storage
      const offlineData = localStorage.getItem('@safemaha_admin_complaints');
      if (offlineData) {
        setComplaints(JSON.parse(offlineData));
      } else {
        // Fallback to local initialize if nothing in browser
        setComplaints(INITIAL_MOCK_COMPLAINTS);
        localStorage.setItem('@safemaha_admin_complaints', JSON.stringify(INITIAL_MOCK_COMPLAINTS));
      }
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('@safemaha_admin_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setSelectedComplaintId(null);
    localStorage.removeItem('@safemaha_admin_user');
    localStorage.removeItem('@safemaha_admin_token');
  };

  const handleUpdateComplaint = async (updatedComplaint) => {
    // 1. Update local state immediately
    const nextComplaints = complaints.map(c => 
      c.id === updatedComplaint.id ? updatedComplaint : c
    );
    setComplaints(nextComplaints);
    localStorage.setItem('@safemaha_admin_complaints', JSON.stringify(nextComplaints));

    // 2. Sync to Server
    try {
      const token = localStorage.getItem('@safemaha_admin_token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const res = await fetch(`${MOCK_SERVER_URL}/api/complaints/${updatedComplaint.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedComplaint)
      });
      if (res.ok) {
        console.log('Successfully synced complaint with server');
        setSyncStatus('online');
        // Refresh local memory in case server generated notifications, etc.
        const listRes = await fetch(`${MOCK_SERVER_URL}/api/complaints`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (listRes.ok) {
          const list = await listRes.json();
          setComplaints(list);
        }
      } else {
        throw new Error('Failed to PUT');
      }
    } catch (err) {
      console.log('Offline status: Saved updates locally in browser.', err);
      setSyncStatus('offline');
    }
  };

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <i className="fa-solid fa-building-shield sidebar-logo-icon"></i>
          <h2 className="sidebar-title">SafeMaha <span>Admin</span></h2>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedComplaintId(null);
            }}
          >
            <i className="fa-solid fa-gauge-high"></i> Dashboard
          </li>
          
          <li 
            className={`menu-item ${activeTab === 'officers' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('officers');
              setSelectedComplaintId(null);
            }}
          >
            <i className="fa-solid fa-users-gear"></i> Officers
          </li>

          <li 
            className={`menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('analytics');
              setSelectedComplaintId(null);
            }}
          >
            <i className="fa-solid fa-chart-column"></i> Analytics
          </li>

          <li 
            className="menu-item"
            onClick={fetchComplaints}
            style={{ color: '#38ADA9' }}
          >
            <i className="fa-solid fa-arrows-rotate"></i> Sync Data
          </li>
          
          <li 
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              setSelectedComplaintId(null);
            }}
          >
            <i className="fa-solid fa-sliders"></i> System Config
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="officer-profile">
            <div className="officer-avatar">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div>
              <div className="officer-name">{user?.name || 'FDA Officer'}</div>
              <div className="officer-role">{user?.role || 'Administrator'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span 
              style={{ 
                fontSize: '10px', 
                fontWeight: '700', 
                color: syncStatus === 'online' ? '#38ADA9' : '#EF4444',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: syncStatus === 'online' ? '#38ADA9' : '#EF4444',
                display: 'inline-block'
              }}></span>
              {syncStatus === 'online' ? 'SERVER ONLINE' : 'STANDALONE MODE'}
            </span>
            <div className="logout-link" onClick={handleLogout}>
              <i className="fa-solid fa-power-off"></i> Logout
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        
        {/* State-based layout pages switcher */}
        {selectedComplaintId ? (
          <ComplaintDetails 
            complaintId={selectedComplaintId}
            complaints={complaints}
            onBack={() => setSelectedComplaintId(null)}
            onUpdateComplaint={handleUpdateComplaint}
          />
        ) : activeTab === 'dashboard' ? (
          <AdminDashboard 
            complaints={complaints}
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
          />
        ) : activeTab === 'officers' ? (
          <OfficerManager />
        ) : activeTab === 'analytics' ? (
          <SystemAnalytics />
        ) : (
          /* SYSTEM CONFIG PAGE */
          <div className="animated">
            <div className="page-header">
              <div>
                <h2 className="page-title">System Configurations</h2>
                <p className="page-subtitle">Configure FDA parameters and local databases</p>
              </div>
            </div>
            
            <div className="dashboard-card detail-section">
              <h3 className="card-title" style={{ marginBottom: '18px' }}><i className="fa-solid fa-database" style={{ marginRight: '8px', color: '#3C6382' }}></i> Local Database Control</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '20px' }}>
                For development and testing purposes, you can reset all complaints and notifications database records in both mock server and browser localStorage.
              </p>
              
              <button 
                className="btn"
                style={{ backgroundColor: '#EF4444', color: 'white' }}
                onClick={async () => {
                  if (window.confirm('Are you absolutely sure you want to clear the entire grievances database? This cannot be undone.')) {
                    try {
                      const token = localStorage.getItem('@safemaha_admin_token');
                      const headers = {};
                      if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                      }
                      const res = await fetch(`${MOCK_SERVER_URL}/api/clear`, { method: 'DELETE', headers });
                      if (res.ok) {
                        alert('Cleared mock server data successfully!');
                      }
                    } catch (e) {
                      console.log('Server clear failed, clearing local only');
                    }
                    localStorage.removeItem('@safemaha_admin_complaints');
                    setComplaints([]);
                    alert('Browser local cache cleared!');
                  }
                }}
              >
                <i className="fa-solid fa-trash-can"></i> Clear All Data Records
              </button>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
