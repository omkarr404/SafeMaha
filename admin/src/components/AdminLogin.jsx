// FILE NAME: d:\Omkar\Water\FDA\admin\src\components\AdminLogin.jsx

import React, { useState } from 'react';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const targetEmail = email.trim().toLowerCase();
    const targetPassword = password.trim();

    if (!targetEmail || !targetPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    fetch('http://localhost:8000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email: targetEmail, password: targetPassword })
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        // Store session token in localStorage
        localStorage.setItem('@safemaha_admin_token', data.access_token);
        onLoginSuccess(data.user);
      } else {
        setError(data.detail || 'Invalid official email or password.');
      }
    })
    .catch((err) => {
      console.error('Admin authentication failure:', err);
      setError('Server offline. Failed to establish connection with security gateway.');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="login-container">
      <div className="login-card animated">
        <div className="login-header">
          <div className="login-logo">
            <i className="fa-solid fa-building-shield"></i>
          </div>
          <h1 className="login-title">FDA SafeMaha</h1>
          <p className="login-subtitle">GOVT. OF MAHARASHTRA • OFFICIAL PORTAL</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              color: '#EF4444',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
              border: '1px solid #FCA5A5'
            }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Official Email</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-envelope" style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B'
              }}></i>
              <input
                type="email"
                className="input-field"
                placeholder="e.g. name@fda.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-lock" style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B'
              }}></i>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            style={{ height: '48px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? (
              <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Authenticating...</span>
            ) : (
              <span>Secure Login <i className="fa-solid fa-shield-halved" style={{ marginLeft: '6px' }}></i></span>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          fontSize: '11px',
          color: '#94A3B8',
          fontWeight: '600',
          lineHeight: '1.6'
        }}>
          This is a restricted administrative system. Unauthorized access attempts are logged and monitored under IT Act guidelines.
        </div>
      </div>
    </div>
  );
}
