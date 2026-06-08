// FILE NAME: d:\Omkar\Water\FDA\admin\src\components\ComplaintDetails.jsx

import React, { useState, useEffect } from 'react';

const MOCK_SERVER_URL = 'http://localhost:8000';

export default function ComplaintDetails({ complaintId, complaints, onBack, onUpdateComplaint }) {
  const complaint = complaints.find((c) => c.id === complaintId);
  
  if (!complaint) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h3>Complaint not found</h3>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '16px' }}>Go Back</button>
      </div>
    );
  }

  const [officerName, setOfficerName] = useState(complaint.assignedOfficer || '');
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState(complaint.status);
  const [showNotesForm, setShowNotesForm] = useState(false);

  const [officers, setOfficers] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [audits, setAudits] = useState([]);
  const [priority, setPriority] = useState(complaint.priority || 'Low');

  useEffect(() => {
    // Fetch officers
    const token = localStorage.getItem('@safemaha_admin_token');
    fetch(`${MOCK_SERVER_URL}/api/admin/officers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOfficers(data.filter(o => o.is_active));
      })
      .catch(err => console.error('Error loading officers:', err));

    // Fetch escalations
    fetch(`${MOCK_SERVER_URL}/api/admin/complaints/${complaint.id}/escalations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEscalations(data))
      .catch(err => console.error('Error loading escalations:', err));

    // Fetch audits
    fetch(`${MOCK_SERVER_URL}/api/admin/complaints/${complaint.id}/audits`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAudits(data))
      .catch(err => console.error('Error loading audits:', err));
  }, [complaint.id]);

  const handlePriorityChange = (e) => {
    const newPriority = e.target.value;
    setPriority(newPriority);
    const updated = {
      ...complaint,
      priority: newPriority,
      actor_email: JSON.parse(localStorage.getItem('@safemaha_admin_user'))?.email || 'admin@fda.gov.in'
    };
    onUpdateComplaint(updated);
  };


  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    
    // Automatically triggers update
    const updated = {
      ...complaint,
      status: newStatus,
      actor_email: JSON.parse(localStorage.getItem('@safemaha_admin_user'))?.email || 'admin@fda.gov.in'
    };
    onUpdateComplaint(updated);
  };

  const handleAssignOfficer = (e) => {
    e.preventDefault();
    if (!officerName.trim()) return;

    const updated = {
      ...complaint,
      assignedOfficer: officerName.trim(),
      status: complaint.status === 'Submitted' ? 'Assigned' : complaint.status, // Auto promote to Assigned
      actor_email: JSON.parse(localStorage.getItem('@safemaha_admin_user'))?.email || 'admin@fda.gov.in'
    };
    
    if (complaint.status === 'Submitted') {
      setStatus('Assigned');
    }
    
    onUpdateComplaint(updated);
    alert('Officer assigned successfully!');
  };


  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const notes = complaint.notes || [];
    const createdNote = {
      id: `note-${Date.now()}`,
      author: complaint.assignedOfficer || 'FDA Administrator',
      timestamp: new Date().toISOString(),
      comment: newNote.trim(),
    };

    const updated = {
      ...complaint,
      notes: [createdNote, ...notes]
    };

    onUpdateComplaint(updated);
    setNewNote('');
    setShowNotesForm(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timelineSteps = [
    { key: 'Submitted', label: 'Submitted', desc: 'Citizen registered the complaint and ID was generated.' },
    { key: 'Assigned', label: 'Assigned', desc: 'Grievance assigned to regional Food & Drug Officer.' },
    { key: 'Investigation', label: 'Investigation', desc: 'On-site inspections and batch analysis initiated.' },
    { key: 'Action Taken', label: 'Action Taken', desc: 'Notices served or corrective recalls enforced.' },
    { key: 'Closed', label: 'Closed', desc: 'Case resolution audits completed and archived.' }
  ];

  const activeIndex = timelineSteps.findIndex((step) => step.key === complaint.status);

  return (
    <div className="animated">
      
      {/* Detail Header bar */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <button className="btn" onClick={onBack} style={{ padding: '8px 16px', backgroundColor: '#E2E8F0', color: '#0F172A', marginBottom: '16px' }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h2 className="page-title">{complaint.id}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div>
                {complaint.status === 'Submitted' && <span className="badge badge-submitted">Submitted</span>}
                {complaint.status === 'Assigned' && <span className="badge badge-assigned">Assigned</span>}
                {complaint.status === 'Investigation' && <span className="badge badge-investigation">Investigation</span>}
                {complaint.status === 'Action Taken' && <span className="badge badge-action">Action Taken</span>}
                {complaint.status === 'Closed' && <span className="badge badge-closed">Closed</span>}
              </div>
              <div>
                {priority === 'Critical' && <span className="badge badge-priority-critical">Critical Priority</span>}
                {priority === 'High' && <span className="badge badge-priority-high">High Priority</span>}
                {priority === 'Medium' && <span className="badge badge-priority-medium">Medium Priority</span>}
                {priority === 'Low' && <span className="badge badge-priority-low">Low Priority</span>}
              </div>
            </div>
          </div>

          <p className="page-subtitle">Category: {getCategoryLabel(complaint.category)} • Submitted on {formattedDate(complaint.createdAt)}</p>
        </div>
      </div>

      {/* Grid Layout splits details and actions */}
      <div className="details-layout">
        
        {/* Left main: Details, Evidence, Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Info */}
          <div className="dashboard-card detail-section">
            <h3 className="card-title" style={{ marginBottom: '18px' }}><i className="fa-solid fa-file-invoice" style={{ marginRight: '8px', color: '#3C6382' }}></i> Grievance Statement</h3>
            
            <div className="grid-2">
              <div className="info-item">
                <div className="info-label">Citizen Name</div>
                <div className="info-value">{complaint.name || 'Anonymous'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Contact Number</div>
                <div className="info-value">+91 {complaint.mobile}</div>
              </div>
            </div>

            <div className="info-item" style={{ marginTop: '10px' }}>
              <div className="info-label">Grievance Subject</div>
              <div className="info-value" style={{ fontSize: '16px', color: '#0A3D62' }}>{complaint.title}</div>
            </div>

            <div className="info-item" style={{ marginTop: '16px' }}>
              <div className="info-label">Detailed Description</div>
              <div className="info-value" style={{ 
                fontWeight: '500', 
                backgroundColor: '#F8FAFC', 
                padding: '16px', 
                borderRadius: '10px', 
                border: '1px solid #E2E8F0',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {complaint.description}
              </div>
            </div>
          </div>

          {/* Evidence Photos */}
          <div className="dashboard-card detail-section">
            <h3 className="card-title" style={{ marginBottom: '18px' }}><i className="fa-solid fa-images" style={{ marginRight: '8px', color: '#3C6382' }}></i> Uploaded Evidence</h3>
            {complaint.evidence && complaint.evidence.length > 0 ? (
              <div>
                <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginBottom: '10px' }}>Citizen attached {complaint.evidence.length} image(s):</p>
                <div className="evidence-gallery">
                  {complaint.evidence.map((uri, i) => (
                    <img 
                      key={i} 
                      src={uri} 
                      alt={`Evidence ${i + 1}`} 
                      className="evidence-img" 
                      onClick={() => window.open(uri, '_blank')}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: '500', padding: '10px 0' }}>
                No evidence photos were uploaded with this complaint.
              </div>
            )}
          </div>

          {/* Location Capture */}
          <div className="dashboard-card detail-section">
            <h3 className="card-title" style={{ marginBottom: '18px' }}><i className="fa-solid fa-map-location-dot" style={{ marginRight: '8px', color: '#3C6382' }}></i> Incident Address</h3>
            {complaint.location ? (
              <div>
                <div className="info-value" style={{ fontSize: '15px', color: '#334155' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: '#EF4444', marginRight: '8px' }}></i>
                  {complaint.location.address}
                </div>
                {complaint.location.latitude && (
                  <div className="location-map-box">
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block' }}>GPS GEOLOCATION</span>
                    <div className="location-coord-row">
                      <span>Latitude: {complaint.location.latitude.toFixed(6)}</span>
                      <span>Longitude: {complaint.location.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: '500', padding: '10px 0' }}>
                No specific incident location details provided.
              </div>
            )}
          </div>

        </div>

        {/* Right side: Actions, Timeline, Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Action Center */}
          <div className="dashboard-card detail-section" style={{ backgroundColor: '#F8FAFC' }}>
            <h3 className="card-title" style={{ marginBottom: '18px', color: '#0A3D62' }}><i className="fa-solid fa-user-gear" style={{ marginRight: '8px' }}></i> Action Center</h3>
            
            {/* Status change dropdown */}
            <div className="form-group">
              <label className="form-label">Update Case Status</label>
              <select
                className="input-field"
                value={status}
                onChange={handleStatusChange}
                style={{ backgroundColor: 'white', fontWeight: '700' }}
              >
                <option value="Submitted">Submitted (Pending Review)</option>
                <option value="Assigned">Assigned (Officer Appointed)</option>
                <option value="Investigation">Investigation (In Progress)</option>
                <option value="Action Taken">Action Taken (Corrective Enforcement)</option>
                <option value="Closed">Closed (Resolved)</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Update Priority Level</label>
              <select
                className="input-field"
                value={priority}
                onChange={handlePriorityChange}
                style={{ backgroundColor: 'white', fontWeight: '700' }}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>

            <div className="section-divider"></div>

            {/* Officer Assignment */}
            <form onSubmit={handleAssignOfficer} className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Assigned FDA Inspector</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="select-filter"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  style={{ backgroundColor: 'white', height: '40px', flex: 1 }}
                  required
                >
                  <option value="">Select Inspector...</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.name}>{o.name} ({o.district})</option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', height: '40px', fontSize: '13px' }}>
                  Assign
                </button>
              </div>
              {complaint.assignedOfficer && (
                <div style={{ fontSize: '12px', color: '#047857', fontWeight: '700', marginTop: '6px' }}>
                  <i className="fa-solid fa-circle-check"></i> Actively assigned to {complaint.assignedOfficer}
                </div>
              )}
            </form>
          </div>


          {/* Stepper Timeline */}
          <div className="dashboard-card detail-section">
            <h3 className="card-title" style={{ marginBottom: '18px' }}><i className="fa-solid fa-route" style={{ marginRight: '8px', color: '#3C6382' }}></i> Case Timeline</h3>
            <div className="timeline-flow">
              {timelineSteps.map((step, index) => {
                const isCompleted = index < activeIndex;
                const isActive = index === activeIndex;
                
                let stepClass = '';
                if (isCompleted) stepClass = 'completed';
                if (isActive) stepClass = 'active';

                return (
                  <div key={step.key} className={`timeline-step ${stepClass}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-details">
                      <div className="timeline-title">{step.label}</div>
                      <div className="timeline-date" style={{ fontSize: '11px', color: '#94A3B8' }}>{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Internal Officer Notes */}
          <div className="dashboard-card detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 className="card-title" style={{ margin: '0' }}><i className="fa-solid fa-note-sticky" style={{ marginRight: '8px', color: '#3C6382' }}></i> Case Notes</h3>
              <button 
                className="btn" 
                onClick={() => setShowNotesForm(!showNotesForm)}
                style={{
                  padding: '4px 10px', 
                  fontSize: '11px', 
                  backgroundColor: '#EBF3F9', 
                  color: '#0A3D62', 
                  border: '1px solid #D0E2EF',
                  fontWeight: '700'
                }}
              >
                {showNotesForm ? 'Cancel' : '+ Add Note'}
              </button>
            </div>

            {/* Note form toggle */}
            {showNotesForm && (
              <form onSubmit={handleAddNote} style={{ marginBottom: '18px', animation: 'fadeIn 0.2s' }}>
                <textarea
                  className="input-field"
                  placeholder="Type official comment or audit update notes..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{ minHeight: '80px', fontSize: '13px', backgroundColor: '#F8FAFC', resize: 'vertical', marginBottom: '8px' }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px', height: '32px' }}>
                  Save Note
                </button>
              </form>
            )}

            {/* Notes registry list */}
            <div className="notes-container">
              {complaint.notes && complaint.notes.length > 0 ? (
                complaint.notes.map((note) => (
                  <div key={note.id} className="note-card">
                    <div className="note-header">
                      <span className="note-author">{note.author}</span>
                      <span>{formattedDate(note.timestamp)}</span>
                    </div>
                    <p className="note-comment">{note.comment}</p>
                  </div>
                ))
              ) : (
                <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '500', padding: '10px 0', textAlign: 'center' }}>
                  No internal notes logged on this case yet.
                </div>
              )}
            </div>
          </div>

          {/* Audit Logs and Escalations Card */}
          <div className="dashboard-card detail-section">
            <h3 className="card-title" style={{ marginBottom: '18px' }}><i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '8px', color: '#3C6382' }}></i> System Logs & Escalations</h3>
            
            {/* Escalations Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0A3D62', marginBottom: '8px' }}>Escalation Events ({escalations.length})</div>
              {escalations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {escalations.map((esc) => (
                    <div key={esc.id} style={{ padding: '10px', backgroundColor: '#FFF5F5', borderLeft: '3px solid #EF4444', borderRadius: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#B91C1C', marginBottom: '4px' }}>
                        <span>Escalated to: {esc.escalated_to}</span>
                        <span>{formattedDate(esc.escalated_at)}</span>
                      </div>
                      <div style={{ color: '#7F1D1D' }}>From: {esc.escalated_from}</div>
                      <div style={{ color: '#451A03', marginTop: '2px', fontStyle: 'italic' }}>Reason: {esc.reason}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>No escalations logged.</div>
              )}
            </div>

            <div className="section-divider"></div>

            {/* Audit Logs Section */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0A3D62', marginBottom: '8px' }}>Grievance Audit Trail ({audits.length})</div>
              {audits.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {audits.map((audit) => (
                    <div key={audit.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                      <div>
                        <span style={{ fontWeight: '700', color: '#0F172A' }}>{audit.action}</span>
                        <span style={{ marginLeft: '6px', color: '#94A3B8' }}>by {audit.user_id}</span>
                      </div>
                      <div>{formattedDate(audit.timestamp)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>No audit trails recorded.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

