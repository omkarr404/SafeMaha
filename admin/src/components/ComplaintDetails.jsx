// FILE NAME: d:\Omkar\Water\FDA\admin\src\components\ComplaintDetails.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './ComplaintDetails.css';

const MOCK_SERVER_URL = 'http://localhost:8000';

export default function ComplaintDetails({ complaintId, complaints, onBack, onUpdateComplaint }) {
  const complaint = complaints.find((c) => c.id === complaintId);

  if (!complaint) {
    return (
      <div className="gov-empty-state" style={{ padding: '80px 20px' }}>
        <div className="gov-empty-icon">
          <i className="fa-solid fa-circle-question"></i>
        </div>
        <h3 className="gov-empty-title">Grievance Record Not Found</h3>
        <p className="gov-empty-desc">
          The requested complaint identifier "{complaintId}" does not exist in the active registry.
        </p>
        <button className="gov-btn gov-btn-primary gov-btn-sm" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i> Return to Registry
        </button>
      </div>
    );
  }

  // Local Form & State Management
  const [officerName, setOfficerName] = useState(complaint.assignedOfficer || '');
  const [status, setStatus] = useState(complaint.status || 'Submitted');
  const [priority, setPriority] = useState(complaint.priority || 'Low');
  const [newNote, setNewNote] = useState('');
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  // Evidence Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Backend Async Data States
  const [officers, setOfficers] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loadingAsync, setLoadingAsync] = useState(true);

  // Load live officers, escalations, and audits from backend
  useEffect(() => {
    setLoadingAsync(true);
    const token = localStorage.getItem('@safemaha_admin_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${MOCK_SERVER_URL}/api/admin/officers/`, { headers })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`${MOCK_SERVER_URL}/api/admin/complaints/${complaint.id}/escalations`, { headers })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`${MOCK_SERVER_URL}/api/admin/complaints/${complaint.id}/audits`, { headers })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ])
      .then(([officersData, escalationsData, auditsData]) => {
        setOfficers(Array.isArray(officersData) ? officersData.filter((o) => o.is_active) : []);
        setEscalations(Array.isArray(escalationsData) ? escalationsData : []);
        setAudits(Array.isArray(auditsData) ? auditsData : []);
      })
      .finally(() => setLoadingAsync(false));
  }, [complaint.id]);

  // Synchronize local form when complaint prop updates
  useEffect(() => {
    setOfficerName(complaint.assignedOfficer || '');
    setStatus(complaint.status || 'Submitted');
    setPriority(complaint.priority || 'Low');
  }, [complaint]);

  // Overdue / SLA breach calculation
  const slaStatus = useMemo(() => {
    const created = new Date(complaint.createdAt || complaint.created_at || Date.now());
    const hoursElapsed = (Date.now() - created.getTime()) / (1000 * 3600);
    const isClosed = complaint.status === 'Closed';

    if (isClosed) {
      return { isOverdue: false, label: 'Resolved within SLA', type: 'resolved' };
    }

    if (complaint.priority === 'Critical') {
      if (hoursElapsed > 24) {
        return {
          isOverdue: true,
          label: `Critical SLA Breached (${Math.floor(hoursElapsed)}h elapsed > 24h limit)`,
          type: 'breach',
        };
      }
      return {
        isOverdue: false,
        label: `Critical SLA Active (${Math.floor(24 - hoursElapsed)}h remaining)`,
        type: 'warning',
      };
    }

    if (complaint.priority === 'High') {
      if (hoursElapsed > 72) {
        return {
          isOverdue: true,
          label: `High Priority SLA Breached (${Math.floor(hoursElapsed / 24)} days elapsed)`,
          type: 'breach',
        };
      }
    }

    return { isOverdue: false, label: 'Standard SLA Active', type: 'normal' };
  }, [complaint]);

  // Copy reference ID handler
  const handleCopyId = () => {
    navigator.clipboard?.writeText(complaint.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status update
  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value;
    setStatus(nextStatus);
    setSavingAction(true);

    const actorEmail =
      JSON.parse(localStorage.getItem('@safemaha_admin_user'))?.email || 'admin@fda.gov.in';

    const updated = {
      ...complaint,
      status: nextStatus,
      actor_email: actorEmail,
    };

    try {
      await onUpdateComplaint(updated);
    } finally {
      setSavingAction(false);
    }
  };

  // Priority update
  const handlePriorityChange = async (e) => {
    const nextPriority = e.target.value;
    setPriority(nextPriority);
    setSavingAction(true);

    const actorEmail =
      JSON.parse(localStorage.getItem('@safemaha_admin_user'))?.email || 'admin@fda.gov.in';

    const updated = {
      ...complaint,
      priority: nextPriority,
      actor_email: actorEmail,
    };

    try {
      await onUpdateComplaint(updated);
    } finally {
      setSavingAction(false);
    }
  };

  // Assign Officer
  const handleAssignOfficer = async (e) => {
    e.preventDefault();
    if (!officerName.trim()) return;

    setSavingAction(true);
    const actorEmail =
      JSON.parse(localStorage.getItem('@safemaha_admin_user'))?.email || 'admin@fda.gov.in';

    const nextStatus = complaint.status === 'Submitted' ? 'Assigned' : complaint.status;

    const updated = {
      ...complaint,
      assignedOfficer: officerName.trim(),
      status: nextStatus,
      actor_email: actorEmail,
    };

    try {
      await onUpdateComplaint(updated);
      setStatus(nextStatus);
    } finally {
      setSavingAction(false);
    }
  };

  // Add Investigation Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSavingAction(true);
    const actorUser = JSON.parse(localStorage.getItem('@safemaha_admin_user'));
    const authorName = actorUser?.name || complaint.assignedOfficer || 'FDA Administrator';

    const createdNote = {
      id: `note-${Date.now()}`,
      author: authorName,
      timestamp: new Date().toISOString(),
      comment: newNote.trim(),
    };

    const updated = {
      ...complaint,
      notes: [createdNote, ...(complaint.notes || [])],
      actor_email: actorUser?.email || 'admin@fda.gov.in',
    };

    try {
      await onUpdateComplaint(updated);
      setNewNote('');
      setShowNotesForm(false);
    } finally {
      setSavingAction(false);
    }
  };

  // Stepper milestones
  const timelineSteps = [
    { key: 'Submitted', label: '1. Registration & Triage', desc: 'Grievance lodged, auto-priority calculated.' },
    { key: 'Assigned', label: '2. Officer Assignment', desc: 'Jurisdiction assigned to Food & Drug Inspector.' },
    { key: 'Investigation', label: '3. Field Investigation', desc: 'On-site inspections, evidence verification, and sampling.' },
    { key: 'Action Taken', label: '4. Enforcement & Notice', desc: 'Seizures, show-cause notices, or batch recalls.' },
    { key: 'Closed', label: '5. Resolution & Archive', desc: 'Findings recorded, citizen informed, case resolved.' },
  ];

  const activeStepIndex = timelineSteps.findIndex((s) => s.key === complaint.status);

  // Format date helper
  const formattedDate = (dateVal) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateVal);
    }
  };

  const evidenceList = complaint.evidence || [];

  return (
    <div className="complaint-details-view">
      {/* 1. Header Navigation & Case Banner */}
      <header className="gov-case-header">
        <div className="gov-back-nav">
          <button className="gov-btn gov-btn-outline gov-btn-sm" onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i> Back to Complaints Register
          </button>
        </div>

        <div className="gov-case-title-row">
          <div className="gov-case-id-group">
            <span className="gov-case-ref-id">{complaint.id}</span>
            <button
              className="gov-copy-btn"
              onClick={handleCopyId}
              title="Copy Reference ID to clipboard"
            >
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              {copied ? 'Copied' : 'Copy ID'}
            </button>
            <span
              className={`gov-badge ${
                complaint.priority === 'Critical'
                  ? 'gov-badge-critical'
                  : complaint.priority === 'High'
                  ? 'gov-badge-warning'
                  : 'gov-badge-info'
              }`}
            >
              {complaint.priority || 'Low'} Priority
            </span>
            <span
              className={`gov-badge ${
                complaint.status === 'Closed' ? 'gov-badge-success' : 'gov-badge-neutral'
              }`}
            >
              {complaint.status || 'Submitted'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="gov-btn gov-btn-outline gov-btn-sm"
              onClick={() => window.print()}
              title="Print formal case summary"
            >
              <i className="fa-solid fa-print"></i> Print Summary
            </button>
          </div>
        </div>

        {/* SLA Alert Banner if Critical or Overdue */}
        {slaStatus.isOverdue && (
          <div className="gov-sla-alert-banner">
            <div className="gov-sla-alert-text">
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '18px' }}></i>
              <span>{slaStatus.label} — Immediate administrative escalation required.</span>
            </div>
            <span
              className="gov-badge gov-badge-critical"
              style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#DC2626' }}
            >
              OVERDUE CASE
            </span>
          </div>
        )}
      </header>

      {/* 2. Main Two-Column Investigation Layout */}
      <div className="gov-details-grid">
        {/* LEFT COLUMN: Grievance Documentation, Evidence, Location */}
        <div className="gov-section-column">
          {/* Card: Case Statement & Citizen Particulars */}
          <section className="gov-card" aria-label="Grievance Statement">
            <div className="gov-card-header">
              <div>
                <h3 className="gov-card-title">
                  <i className="fa-solid fa-file-lines" style={{ marginRight: '8px', color: 'var(--gov-secondary)' }}></i>
                  Grievance Statement & Particulars
                </h3>
                <p className="gov-card-subtitle">Verified details submitted by complainant</p>
              </div>
              <span className="gov-badge gov-badge-info">
                Sector: {complaint.category ? complaint.category.toUpperCase() : 'GENERAL'}
              </span>
            </div>

            <div className="gov-card-body">
              <div className="gov-prop-grid">
                <div className="gov-prop-item">
                  <span className="gov-prop-label">Complainant Name</span>
                  <span className="gov-prop-value">{complaint.name || 'Anonymous Citizen'}</span>
                </div>
                <div className="gov-prop-item">
                  <span className="gov-prop-label">Verified Mobile Number</span>
                  <span className="gov-prop-value">
                    {complaint.mobile ? (
                      <a
                        href={`tel:${complaint.mobile}`}
                        style={{ color: 'var(--gov-secondary)', textDecoration: 'none' }}
                      >
                        +91 {complaint.mobile}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </span>
                </div>
                <div className="gov-prop-item">
                  <span className="gov-prop-label">Date Lodged</span>
                  <span className="gov-prop-value">
                    {formattedDate(complaint.createdAt || complaint.created_at)}
                  </span>
                </div>
                <div className="gov-prop-item">
                  <span className="gov-prop-label">SLA Compliance Status</span>
                  <span
                    className="gov-prop-value"
                    style={{
                      color: slaStatus.isOverdue ? 'var(--gov-critical)' : 'var(--gov-success)',
                    }}
                  >
                    {slaStatus.label}
                  </span>
                </div>
              </div>

              <div className="gov-prop-item" style={{ marginTop: '12px' }}>
                <span className="gov-prop-label">Subject / Allegation</span>
                <span className="gov-prop-value" style={{ fontSize: '15px', color: 'var(--gov-primary)' }}>
                  {complaint.title}
                </span>
              </div>

              <div className="gov-prop-item" style={{ marginTop: '14px' }}>
                <span className="gov-prop-label">Detailed Incident Narration</span>
                <div className="gov-narrative-box">{complaint.description}</div>
              </div>
            </div>
          </section>

          {/* Card: Uploaded Evidence Vault */}
          <section className="gov-card" aria-label="Evidence Vault">
            <div className="gov-card-header">
              <div>
                <h3 className="gov-card-title">
                  <i className="fa-solid fa-camera" style={{ marginRight: '8px', color: 'var(--gov-secondary)' }}></i>
                  Evidence Vault & Documentation
                </h3>
                <p className="gov-card-subtitle">
                  {evidenceList.length} photographic proof attachment(s)
                </p>
              </div>
            </div>

            <div className="gov-card-body">
              {evidenceList.length > 0 ? (
                <div className="gov-evidence-grid">
                  {evidenceList.map((uri, idx) => (
                    <div
                      key={idx}
                      className="gov-evidence-thumb-wrap"
                      onClick={() => setLightboxIndex(idx)}
                      title={`Click to inspect Evidence #${idx + 1}`}
                    >
                      <img src={uri} alt={`Evidence #${idx + 1}`} className="gov-evidence-thumb" />
                      <div className="gov-thumb-overlay">
                        <i className="fa-solid fa-magnifying-glass-plus"></i>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="gov-empty-state" style={{ padding: '24px' }}>
                  <i className="fa-solid fa-image" style={{ fontSize: '28px', color: 'var(--gov-text-muted)', marginBottom: '8px' }}></i>
                  <p style={{ margin: 0, fontSize: '13px' }}>
                    No photographic evidence attachments were submitted with this complaint.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Card: Incident Location & Regional Jurisdiction */}
          <section className="gov-card" aria-label="Incident Location">
            <div className="gov-card-header">
              <div>
                <h3 className="gov-card-title">
                  <i className="fa-solid fa-map-pin" style={{ marginRight: '8px', color: 'var(--gov-secondary)' }}></i>
                  Incident Location & Jurisdiction
                </h3>
                <p className="gov-card-subtitle">Geographic coordinates & local administrative zone</p>
              </div>
            </div>

            <div className="gov-card-body">
              <div className="gov-prop-grid">
                <div className="gov-prop-item">
                  <span className="gov-prop-label">Administrative District</span>
                  <span className="gov-prop-value">
                    {complaint.district_name || 'Maharashtra State'}
                  </span>
                </div>
                <div className="gov-prop-item">
                  <span className="gov-prop-label">Taluka / Sub-Division</span>
                  <span className="gov-prop-value">{complaint.taluka_name || 'Regional Zone'}</span>
                </div>
              </div>

              <div className="gov-prop-item" style={{ marginTop: '8px' }}>
                <span className="gov-prop-label">Premises Address</span>
                <span className="gov-prop-value" style={{ fontWeight: '500', color: 'var(--gov-text)' }}>
                  {complaint.location?.address || 'No specific street address provided'}
                </span>
              </div>

              {complaint.location?.latitude && complaint.location?.longitude && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 'var(--gov-radius-md)',
                    border: '1px solid var(--gov-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <span className="gov-prop-label">GPS Geolocation Coordinates</span>
                    <div style={{ fontFamily: 'var(--gov-font-mono)', fontSize: '13px', fontWeight: '600' }}>
                      Lat: {Number(complaint.location.latitude).toFixed(6)} | Long:{' '}
                      {Number(complaint.location.longitude).toFixed(6)}
                    </div>
                  </div>
                  <a
                    className="gov-btn gov-btn-outline gov-btn-sm"
                    href={`https://www.google.com/maps?q=${complaint.location.latitude},${complaint.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Open in Maps
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Investigation Workspace & Chronology */}
        <div className="gov-section-column">
          {/* Card: Investigation Control Center */}
          <section className="gov-card" aria-label="Investigation Control Center">
            <div className="gov-card-header">
              <div>
                <h3 className="gov-card-title">
                  <i className="fa-solid fa-sliders" style={{ marginRight: '8px', color: 'var(--gov-secondary)' }}></i>
                  Investigation Workspace
                </h3>
                <p className="gov-card-subtitle">Official actions, triage priority & inspector assignment</p>
              </div>
              {savingAction && (
                <span style={{ fontSize: '11px', color: 'var(--gov-secondary)', fontWeight: '600' }}>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                </span>
              )}
            </div>

            <div className="gov-card-body">
              {/* Status Selector */}
              <div className="gov-form-group">
                <label className="gov-label">Update Case Workflow Status</label>
                <select
                  className="gov-select"
                  value={status}
                  onChange={handleStatusChange}
                  style={{ fontWeight: '600' }}
                >
                  <option value="Submitted">Submitted (Pending Review)</option>
                  <option value="Assigned">Assigned (Officer Appointed)</option>
                  <option value="Investigation">Investigation (In Progress)</option>
                  <option value="Action Taken">Action Taken (Corrective Enforcement)</option>
                  <option value="Closed">Closed (Resolved & Verified)</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div className="gov-form-group">
                <label className="gov-label">Update Triage Priority</label>
                <select
                  className="gov-select"
                  value={priority}
                  onChange={handlePriorityChange}
                  style={{ fontWeight: '600' }}
                >
                  <option value="Low">Low Priority (Routine inspection)</option>
                  <option value="Medium">Medium Priority (Standard grievance)</option>
                  <option value="High">High Priority (Urgent sampling required)</option>
                  <option value="Critical">Critical Priority (Immediate public health hazard)</option>
                </select>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--gov-border)', margin: '16px 0' }} />

              {/* Officer Assignment Form */}
              <form onSubmit={handleAssignOfficer}>
                <div className="gov-form-group" style={{ marginBottom: '8px' }}>
                  <label className="gov-label">Assigned Food & Drug Inspector</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="gov-select"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      required
                    >
                      <option value="">Select Inspector from directory...</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.name}>
                          {o.name} ({o.role} • {o.district})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="gov-btn gov-btn-secondary gov-btn-sm">
                      Assign
                    </button>
                  </div>
                </div>

                {complaint.assignedOfficer ? (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--gov-success)',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className="fa-solid fa-circle-check"></i> Actively assigned to {complaint.assignedOfficer}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--gov-warning)', fontWeight: '600' }}>
                    <i className="fa-solid fa-circle-exclamation"></i> Unassigned — Please assign a designated inspector.
                  </div>
                )}
              </form>
            </div>
          </section>

          {/* Card: Multi-Stage Workflow Progress Stepper */}
          <section className="gov-card" aria-label="Lifecycle Stepper">
            <div className="gov-card-header">
              <h3 className="gov-card-title">
                <i className="fa-solid fa-timeline" style={{ marginRight: '8px', color: 'var(--gov-secondary)' }}></i>
                Investigation Lifecycle
              </h3>
            </div>

            <div className="gov-card-body">
              <div className="gov-timeline-progress">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = idx < activeStepIndex;
                  const isActive = idx === activeStepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`gov-timeline-item ${isCompleted ? 'completed' : ''} ${
                        isActive ? 'active' : ''
                      }`}
                    >
                      <div className="gov-timeline-icon">
                        {isCompleted ? (
                          <i className="fa-solid fa-check"></i>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <div className="gov-timeline-body">
                        <div className="gov-timeline-title">{step.label}</div>
                        <div className="gov-timeline-desc">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Card: Chronological Activity Timeline & Case Notes */}
          <section className="gov-card" aria-label="Case Notes & Activity">
            <div className="gov-card-header">
              <div>
                <h3 className="gov-card-title">
                  <i className="fa-solid fa-comments" style={{ marginRight: '8px', color: 'var(--gov-secondary)' }}></i>
                  Activity History & Notes
                </h3>
                <p className="gov-card-subtitle">
                  Chronological trail of notes, inspections & system actions
                </p>
              </div>
              <button
                className="gov-btn gov-btn-outline gov-btn-sm"
                onClick={() => setShowNotesForm(!showNotesForm)}
              >
                <i className={`fa-solid ${showNotesForm ? 'fa-xmark' : 'fa-plus'}`}></i>
                {showNotesForm ? 'Cancel' : 'Add Note'}
              </button>
            </div>

            <div className="gov-card-body">
              {/* Note Submission Form */}
              {showNotesForm && (
                <form
                  onSubmit={handleAddNote}
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '12px',
                    borderRadius: 'var(--gov-radius-md)',
                    border: '1px solid var(--gov-border)',
                    marginBottom: '16px',
                  }}
                >
                  <div className="gov-form-group" style={{ marginBottom: '8px' }}>
                    <label className="gov-label">New Official Investigation Note</label>
                    <textarea
                      className="gov-textarea"
                      placeholder="Enter field observation, lab sample analysis, or enforcement remarks..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      className="gov-btn gov-btn-outline gov-btn-sm"
                      onClick={() => setShowNotesForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="gov-btn gov-btn-primary gov-btn-sm">
                      <i className="fa-solid fa-floppy-disk"></i> Save Entry
                    </button>
                  </div>
                </form>
              )}

              {/* Unified Activity Stream */}
              <div className="gov-activity-stream">
                {/* 1. Official Notes */}
                {(complaint.notes || []).map((note) => (
                  <div key={note.id} className="gov-activity-entry">
                    <div className="gov-activity-header">
                      <span className="gov-activity-author">
                        <i className="fa-solid fa-user-shield" style={{ marginRight: '6px' }}></i>
                        {note.author}
                      </span>
                      <span className="gov-activity-time">{formattedDate(note.timestamp)}</span>
                    </div>
                    <p className="gov-activity-content">{note.comment}</p>
                  </div>
                ))}

                {/* 2. Escalation Events */}
                {escalations.map((esc) => (
                  <div
                    key={esc.id}
                    className="gov-activity-entry"
                    style={{ borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}
                  >
                    <div className="gov-activity-header">
                      <span className="gov-activity-author" style={{ color: 'var(--gov-critical)' }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                        Automatic Escalation: {esc.escalated_to}
                      </span>
                      <span className="gov-activity-time">{formattedDate(esc.escalated_at)}</span>
                    </div>
                    <p className="gov-activity-content" style={{ color: '#991B1B' }}>
                      <strong>Reason:</strong> {esc.reason} (Escalated from: {esc.escalated_from})
                    </p>
                  </div>
                ))}

                {/* 3. System Audits */}
                {audits.map((audit) => (
                  <div key={audit.id} className="gov-activity-entry">
                    <div className="gov-activity-header">
                      <span className="gov-audit-badge">{audit.action}</span>
                      <span className="gov-activity-time">{formattedDate(audit.timestamp)}</span>
                    </div>
                    <p className="gov-activity-content" style={{ color: 'var(--gov-text-secondary)', fontSize: '12px' }}>
                      Initiated by <strong>{audit.user_id}</strong>
                    </p>
                  </div>
                ))}

                {/* Empty State */}
                {!complaint.notes?.length && !escalations.length && !audits.length && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gov-text-muted)', fontSize: '13px' }}>
                    No investigation notes or audit actions recorded yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 3. Interactive Evidence Lightbox Dialog */}
      {lightboxIndex !== null && evidenceList[lightboxIndex] && (
        <div className="gov-lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          <div className="gov-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="gov-lightbox-header">
              <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--gov-text)' }}>
                Evidence Photo #{lightboxIndex + 1} of {evidenceList.length}
              </span>
              <button
                className="gov-copy-btn"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close Lightbox"
              >
                <i className="fa-solid fa-xmark"></i> Close
              </button>
            </div>

            <div className="gov-lightbox-body">
              <img
                src={evidenceList[lightboxIndex]}
                alt={`Evidence #${lightboxIndex + 1}`}
                className="gov-lightbox-img"
              />
            </div>

            <div className="gov-lightbox-footer">
              <button
                className="gov-btn gov-btn-outline gov-btn-sm"
                disabled={lightboxIndex === 0}
                onClick={() => setLightboxIndex((idx) => Math.max(0, idx - 1))}
              >
                <i className="fa-solid fa-chevron-left"></i> Previous
              </button>

              <a
                className="gov-btn gov-btn-outline gov-btn-sm"
                href={evidenceList[lightboxIndex]}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fa-solid fa-up-right-from-square"></i> Open High-Res
              </a>

              <button
                className="gov-btn gov-btn-outline gov-btn-sm"
                disabled={lightboxIndex === evidenceList.length - 1}
                onClick={() => setLightboxIndex((idx) => Math.min(evidenceList.length - 1, idx + 1))}
              >
                Next <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
