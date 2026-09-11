import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { db } from './logic/database.js';
import { calculateUrgencyScore } from './logic/scoring.js';
import { checkSebiRegistry } from './logic/sebiRegistryCheck.js';
import { checkMhaBlockedApps } from './logic/mhaBlockedAppsCheck.js';
import { traceCryptoMuleWallet } from './logic/cryptoRouting.js';
import { triggerBankFreeze } from './logic/freezeWorkflow.js';
import { scanDomainWatch } from './logic/domainWatchScraper.js';
import { buildDeviceGraph } from './logic/deviceGraph.js';
import { generateCaseFileDossier } from './logic/generateCaseFile.js';
import { analyzeLinkRisk } from './logic/linkRiskCheck.js';
import { generateLLMExplanation } from './logic/llmExplain.js';
import { createPairingSession, verifyPairingCode } from './logic/pairingSession.js';
import { startRecruitmentAdScanner } from './logic/recruitmentAdScanner.js';

const JWT_SECRET = process.env.FRAUDSHIELD_SECRET || 'FRAUDSHIELD_SECRET';
const PORT = process.env.PORT || 4000;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ROUTES ---

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { username, password, role, name } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const existing = db.findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: `usr_${Date.now()}`,
    username,
    name: name || username,
    role: role || 'CITIZEN',
    password: hashedPassword
  };

  db.addUser(newUser);

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    token,
    user: { id: newUser.id, username: newUser.username, role: newUser.role, name: newUser.name }
  });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role, name: user.name }
  });
});

// --- CASES API ---

// GET /api/cases
app.get('/api/cases', (req, res) => {
  const cases = db.getCases();
  res.json(cases);
});

// POST /api/report - Ingest new cybercrime case
app.post('/api/report', (req, res) => {
  const {
    title,
    scam_type,
    amount,
    description,
    location_name,
    latitude,
    longitude,
    victim_name,
    victim_contact,
    suspect_account,
    scam_channel
  } = req.body;

  if (!title || !amount) {
    return res.status(400).json({ error: 'Title and amount are required' });
  }

  const caseId = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const urgency_score = calculateUrgencyScore({ amount, scam_type, scam_channel, description });

  const newCase = {
    id: caseId,
    title,
    scam_type: scam_type || 'Financial Fraud',
    amount: Number(amount),
    description: description || '',
    location_name: location_name || 'Delhi NCR',
    latitude: parseFloat(latitude) || 28.6139,
    longitude: parseFloat(longitude) || 77.2090,
    victim_name: victim_name || 'Anonymous Citizen',
    victim_contact: victim_contact || 'N/A',
    status: 'pending',
    urgency_score,
    created_at: new Date().toISOString(),
    claimed_by: null,
    claimed_by_name: null,
    suspect_account: suspect_account || 'SBI-MULE-48192019',
    scam_channel: scam_channel || 'Mobile Call / Phishing',
    sla_deadline: new Date(Date.now() + 2700000).toISOString() // 45 min golden SLA
  };

  db.addCase(newCase);

  // Broadcast to ALL connected clients
  io.emit('case:new', newCase);

  res.status(201).json(newCase);
});

// POST /api/case/:id/claim - Direct Police Claiming
app.post('/api/case/:id/claim', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userName = req.user.name || req.user.username;

  const updatedCase = db.claimCase(id, userId, userName);
  if (!updatedCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  // Broadcast update
  io.emit('case:updated', updatedCase);

  res.json(updatedCase);
});

// POST /api/case/:id/status
app.post('/api/case/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedCase = db.updateCaseStatus(id, status);
  if (!updatedCase) {
    return res.status(404).json({ error: 'Case not found' });
  }

  io.emit('case:updated', updatedCase);
  res.json(updatedCase);
});

// --- THREAT INTELLIGENCE & UTILITY ENDPOINTS ---

// GET /api/domain-watch
app.get('/api/domain-watch', async (req, res) => {
  const keyword = (req.query.q || 'sbi').toString();
  const result = await scanDomainWatch(keyword);
  res.json(result);
});

// GET /api/mule-ads
app.get('/api/mule-ads', (req, res) => {
  res.json(db.getMuleAds());
});

// POST /api/link-risk
app.post('/api/link-risk', (req, res) => {
  const { url } = req.body;
  const result = analyzeLinkRisk(url);
  res.json(result);
});

// POST /api/sebi-check
app.post('/api/sebi-check', (req, res) => {
  const { url } = req.body;
  const result = checkSebiRegistry(url);
  res.json(result);
});

// POST /api/mha-check
app.post('/api/mha-check', (req, res) => {
  const { query } = req.body;
  const result = checkMhaBlockedApps(query);
  res.json(result);
});

// GET /api/proxy-preview - Sanitized preview proxy for malicious links
app.get('/api/proxy-preview', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('<h3>URL parameter is required</h3>');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'unsafe-inline'; script-src 'none'; img-src data: https:;");
  
  const sanitizedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>FraudShield Isolated Sandbox Preview</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #090d16; color: #e2e8f0; margin: 0; padding: 24px; }
          .banner { background: #1e1b4b; border: 1px solid #6366f1; padding: 16px; border-radius: 12px; margin-bottom: 20px; }
          .tag { display: inline-block; background: #dc2626; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; }
          .url-box { background: #020617; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 8px; border: 1px solid #334155; }
          .content-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="banner">
          <span class="tag">ISOLATED THREAT PREVIEW</span>
          <h2 style="margin: 8px 0 4px 0;">FraudShield Sanitized Sandbox Container</h2>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">Scripts and active network sockets disabled to prevent client exploitation.</p>
          <div class="url-box">Target: ${encodeURI(targetUrl)}</div>
        </div>
        <div class="content-box">
          <h3 style="color: #38bdf8;">Extracted Threat Metadata</h3>
          <p><strong>Host Signature:</strong> ${new URL(targetUrl.startsWith('http') ? targetUrl : 'http://' + targetUrl).hostname}</p>
          <p><strong>Status:</strong> Under Law Enforcement Interception Review</p>
          <p><strong>Sandbox State:</strong> Strict air-gap simulation mode active.</p>
        </div>
      </body>
    </html>
  `;
  res.send(sanitizedHtml);
});

// POST /api/crypto-trace
app.post('/api/crypto-trace', (req, res) => {
  const { walletAddress } = req.body;
  const result = traceCryptoMuleWallet(walletAddress);
  res.json(result);
});

// POST /api/bank-freeze
app.post('/api/bank-freeze', authenticateToken, (req, res) => {
  const { accountNo, bankName, caseId } = req.body;
  const result = triggerBankFreeze(accountNo, bankName, caseId, req.user.name || req.user.username);
  
  if (caseId) {
    db.updateCaseStatus(caseId, 'frozen');
    const updatedCase = db.getCaseById(caseId);
    if (updatedCase) io.emit('case:updated', updatedCase);
  }

  res.json(result);
});

// GET /api/device-graph/:id
app.get('/api/device-graph/:id', (req, res) => {
  const graph = buildDeviceGraph(req.params.id);
  res.json(graph);
});

// GET /api/case/:id/file
app.get('/api/case/:id/file', (req, res) => {
  const c = db.getCaseById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  const dossier = generateCaseFileDossier(c);
  res.json(dossier);
});

// POST /api/case/:id/explain
app.post('/api/case/:id/explain', (req, res) => {
  const c = db.getCaseById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  const explanation = generateLLMExplanation(c);
  res.json({ explanation });
});

// --- APPEALS ENDPOINTS ---

// GET /api/appeals
app.get('/api/appeals', (req, res) => {
  res.json(db.getAppeals());
});

// POST /api/appeal
app.post('/api/appeal', (req, res) => {
  const { case_id, account_no, full_name, mobile, reason, proof_document } = req.body;
  const appeal = {
    id: `APP-${Date.now()}`,
    case_id: case_id || 'GENERAL',
    account_no,
    full_name,
    mobile,
    reason,
    proof_document: proof_document || 'KYC_Aadhaar_Attachment.pdf',
    status: 'PENDING_REVIEW',
    submitted_at: new Date().toISOString()
  };
  db.addAppeal(appeal);
  io.emit('appeal:new', appeal);
  res.status(201).json(appeal);
});

// POST /api/appeal/:id/review
app.post('/api/appeal/:id/review', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const updated = db.updateAppealStatus(id, status, notes);
  if (!updated) return res.status(404).json({ error: 'Appeal not found' });
  io.emit('appeal:updated', updated);
  res.json(updated);
});

// --- TELLER DURESS PAIRING ---
app.post('/api/duress/pair-start', (req, res) => {
  const { branchId, tellerId } = req.body;
  const session = createPairingSession(branchId, tellerId);
  res.json(session);
});

app.post('/api/duress/pair-verify', (req, res) => {
  const { pairingCode, victimContact } = req.body;
  const result = verifyPairingCode(pairingCode, victimContact);
  if (result.success) {
    io.emit('teller:duress', {
      type: 'LIVE_DURESS_TRIGGERED',
      session: result.session,
      timestamp: new Date().toISOString()
    });
  }
  res.json(result);
});

// --- SOCKET.IO HANDLING ---
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join:room', (room) => {
    socket.join(room);
    console.log(`[Socket.io] Client ${socket.id} joined room: ${room}`);
  });

  // Officer live location broadcast
  socket.on('officer:location_broadcast', (data) => {
    socket.broadcast.emit('officer:location_broadcast', data);
  });

  // Teller duress trigger
  socket.on('teller:duress_alert', (data) => {
    const alertObj = {
      id: `DURESS-${Date.now()}`,
      branch_name: data.branch_name || 'MG Road SBI Branch',
      teller_name: data.teller_name || 'Anjali Verma',
      victim_name: data.victim_name || 'Senior Citizen Victim',
      amount: data.amount || 850000,
      timestamp: new Date().toISOString()
    };
    db.addDuressAlert(alertObj);
    io.emit('teller:duress', alertObj);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start background scanners
startRecruitmentAdScanner(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🛡️ FraudShield Command Center Backend active on port ${PORT}`);
  console.log(`=======================================================`);
});
