// FILE NAME: d:\Omkar\Water\FDA\mock-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5001;
const DATA_DIR = path.join(__dirname, 'data');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(COMPLAINTS_FILE)) {
  fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([]));
}

// Utility to read JSON files safely
function readJSON(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
}

// Utility to write JSON files safely
function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// Helper to create notifications
function createNotification(complaintId, status, mobile) {
  const notifications = readJSON(NOTIFICATIONS_FILE);
  const date = new Date().toISOString();
  let titleEn = '';
  let descEn = '';
  let titleMr = '';
  let descMr = '';

  switch (status) {
    case 'Submitted':
      titleEn = 'Complaint Submitted Successfully';
      descEn = `Your complaint ${complaintId} has been successfully logged and is awaiting review.`;
      titleMr = 'तक्रार यशस्वीरित्या नोंदवली';
      descMr = `तुमची तक्रार ${complaintId} यशस्वीरित्या नोंदवली गेली आहे आणि पुनरावलोकनाची प्रतीक्षा आहे.`;
      break;
    case 'Assigned':
      titleEn = 'Officer Assigned';
      descEn = `An FDA Officer has been assigned to inspect and review your complaint ${complaintId}.`;
      titleMr = 'अधिकारी नियुक्त';
      descMr = `तुमच्या तक्रार ${complaintId} च्या तपासणी आणि पुनरावलोकनासाठी अन्न व औषध सुरक्षा अधिकारी नियुक्त केले आहेत.`;
      break;
    case 'Investigation':
      titleEn = 'Investigation Started';
      descEn = `Officer is investigating the incident details for complaint ${complaintId}.`;
      titleMr = 'तपास सुरू';
      descMr = `अधिकारी तक्रार ${complaintId} च्या घटनास्थळाची आणि तपशीलांची तपासणी करत आहेत.`;
      break;
    case 'Action Taken':
      titleEn = 'Action Taken';
      descEn = `Legal warnings, compliance notices or recall directives issued for complaint ${complaintId}.`;
      titleMr = 'कारवाई केली';
      descMr = `तक्रार ${complaintId} संदर्भात कायदेशीर नोटीस किंवा निर्देश जारी करण्यात आले आहेत.`;
      break;
    case 'Closed':
      titleEn = 'Complaint Closed';
      descEn = `Resolution audit is complete and complaint ${complaintId} is closed.`;
      titleMr = 'तक्रार बंद करण्यात आली';
      descMr = `निवारण लेखापरीक्षण पूर्ण झाले असून तक्रार ${complaintId} यशस्वीरित्या बंद करण्यात आली आहे.`;
      break;
    default:
      titleEn = 'Status Updated';
      descEn = `The status of your complaint ${complaintId} is now ${status}.`;
      titleMr = 'स्थिती अद्यतनित';
      descMr = `तुमच्या तक्रार ${complaintId} ची स्थिती आता ${status} आहे.`;
  }

  const newNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    complaintId,
    mobile: mobile || '',
    title: { en: titleEn, mr: titleMr },
    description: { en: descEn, mr: descMr },
    date,
    read: false
  };

  notifications.unshift(newNotification);
  writeJSON(NOTIFICATIONS_FILE, notifications);
  return newNotification;
}

// Create HTTP Server
const server = http.createServer((req, res) => {
  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathName = parsedUrl.pathname;

  // ROUTER
  
  // 1. GET /api/complaints
  if (pathName === '/api/complaints' && req.method === 'GET') {
    const complaints = readJSON(COMPLAINTS_FILE);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(complaints));
    return;
  }

  // 2. GET /api/complaints/:id
  if (pathName.startsWith('/api/complaints/') && req.method === 'GET') {
    const id = pathName.split('/').pop();
    const complaints = readJSON(COMPLAINTS_FILE);
    const complaint = complaints.find(c => c.id === id);

    if (complaint) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(complaint));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Complaint not found' }));
    }
    return;
  }

  // 3. POST /api/complaints (Save a new complaint)
  if (pathName === '/api/complaints' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newComplaint = JSON.parse(body);
        const complaints = readJSON(COMPLAINTS_FILE);

        // Check duplicates
        const index = complaints.findIndex(c => c.id === newComplaint.id);
        let statusChanged = false;
        let oldStatus = '';

        if (index > -1) {
          oldStatus = complaints[index].status;
          statusChanged = oldStatus !== newComplaint.status;
          complaints[index] = newComplaint;
        } else {
          newComplaint.status = newComplaint.status || 'Submitted';
          newComplaint.createdAt = newComplaint.createdAt || new Date().toISOString();
          newComplaint.notes = newComplaint.notes || [];
          complaints.push(newComplaint);
          statusChanged = true; // Created status counts as transition
        }

        writeJSON(COMPLAINTS_FILE, complaints);

        if (statusChanged) {
          createNotification(newComplaint.id, newComplaint.status, newComplaint.mobile);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, complaint: newComplaint }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 4. PUT /api/complaints/:id (Update complaint, e.g. status/notes from Admin)
  if (pathName.startsWith('/api/complaints/') && req.method === 'PUT') {
    const id = pathName.split('/').pop();
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        const complaints = readJSON(COMPLAINTS_FILE);
        const index = complaints.findIndex(c => c.id === id);

        if (index > -1) {
          const oldStatus = complaints[index].status;
          const updatedComplaint = {
            ...complaints[index],
            ...updates,
            id: complaints[index].id, // Make sure ID is immutable
          };

          complaints[index] = updatedComplaint;
          writeJSON(COMPLAINTS_FILE, complaints);

          // Trigger notification if status is updated
          if (updates.status && updates.status !== oldStatus) {
            createNotification(id, updates.status, updatedComplaint.mobile);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, complaint: updatedComplaint }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Complaint not found' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 5. GET /api/notifications
  if (pathName === '/api/notifications' && req.method === 'GET') {
    const notifications = readJSON(NOTIFICATIONS_FILE);
    // Support filtering by mobile if query parameter exists
    const mobileParam = parsedUrl.searchParams.get('mobile');
    let filtered = notifications;
    if (mobileParam) {
      filtered = notifications.filter(n => n.mobile === mobileParam);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(filtered));
    return;
  }

  // 6. PUT /api/notifications/:id/read (Mark notification as read)
  if (pathName.startsWith('/api/notifications/') && pathName.endsWith('/read') && req.method === 'PUT') {
    const parts = pathName.split('/');
    const id = parts[parts.length - 2]; // Get the ID before '/read'
    const notifications = readJSON(NOTIFICATIONS_FILE);
    const index = notifications.findIndex(n => n.id === id);

    if (index > -1) {
      notifications[index].read = true;
      writeJSON(NOTIFICATIONS_FILE, notifications);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, notification: notifications[index] }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Notification not found' }));
    }
    return;
  }

  // 7. PUT /api/notifications/read-all (Mark all notifications as read for a mobile)
  if (pathName === '/api/notifications/read-all' && req.method === 'PUT') {
    const mobileParam = parsedUrl.searchParams.get('mobile');
    const notifications = readJSON(NOTIFICATIONS_FILE);
    
    let updatedCount = 0;
    const updated = notifications.map(n => {
      if (!mobileParam || n.mobile === mobileParam) {
        if (!n.read) {
          n.read = true;
          updatedCount++;
        }
      }
      return n;
    });

    writeJSON(NOTIFICATIONS_FILE, updated);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, updatedCount }));
    return;
  }

  // 8. DELETE /api/clear
  if (pathName === '/api/clear' && req.method === 'DELETE') {
    writeJSON(COMPLAINTS_FILE, []);
    writeJSON(NOTIFICATIONS_FILE, []);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Cleared all database records' }));
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

// Start listening
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`SafeMaha Mock Data Server is running on port ${PORT}`);
  console.log(`API Endpoints:`);
  console.log(` - GET/POST /api/complaints`);
  console.log(` - GET/PUT  /api/complaints/:id`);
  console.log(` - GET      /api/notifications?mobile=:mobile`);
  console.log(` - PUT      /api/notifications/:id/read`);
  console.log(` - PUT      /api/notifications/read-all?mobile=:mobile`);
  console.log(` - DELETE   /api/clear`);
  console.log(`======================================================\n`);
});
