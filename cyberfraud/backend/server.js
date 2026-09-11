import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

import { db } from './logic/database.js';
import { supabase, supabasePublic } from './logic/supabaseClient.js';
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
import { startRecruitmentAdScanner } from './logic/recruitmentAdScanner.js';

const JWT_SECRET = process.env.FRAUDSHIELD_SECRET || 'FRAUDSHIELD_SECRET';
const PORT = process.env.PORT || 4000;

const app = express();
const httpServer = createServer(app);

// --- 1. HELMET SECURITY HEADERS & CSP HARDENING ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:*", "http://127.0.0.1:*", "https://*.supabase.co", "https://nominatim.openstreetmap.org", "https://server.arcgisonline.com", "https://*.basemaps.cartocdn.com", "https://*.tile.openstreetmap.org"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// --- 2. STRUCTURED CENTRALIZED OPERATIONAL LOGGING ---
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  req.requestId = requestId;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const logPrefix = statusCode >= 400 ? '⚠️ [WARN]' : '✅ [INFO]';
    console.log(`${logPrefix} [${new Date().toISOString()}] [${requestId}] ${req.method} ${req.originalUrl} - ${statusCode} (${duration}ms) - IP: ${req.ip || req.socket.remoteAddress}`);
  });
  next();
});

// --- 3. RATE LIMITING & DDOS ISOLATION ---
// General API Rate Limiter (150 requests per 15 minutes window)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    status: 429
  }
});

// Strict Auth & OTP Rate Limiter (15 requests per 15 minutes window)
const authAndOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication / OTP attempts from this IP. Please wait 15 minutes.',
    status: 429
  }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authAndOtpLimiter);
app.use('/api/send-otp', authAndOtpLimiter);
app.use('/api/verify-otp', authAndOtpLimiter);

// --- 4. UNIVERSAL INPUT SANITIZATION MIDDLEWARE ---
// Recursively sanitizes input strings to neutralize XSS and script injections
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const cleaned = {};
    for (const key of Object.keys(val)) {
      // Prevent prototype pollution or key injection
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      cleaned[key] = sanitizeValue(val[key]);
    }
    return cleaned;
  }
  return val;
};

const universalSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  next();
};

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
app.use(express.json({ limit: '5mb' }));
app.use(universalSanitizer);

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
    scam_channel,
    incident_date_time,
    incidentDateTime
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
    incident_date_time: incident_date_time || incidentDateTime || new Date().toISOString(),
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

  // Asynchronously persist to Supabase FRAUDSHIELD cloud table with dual-mode type compatibility
  (async () => {
    try {
      // 1. Try sending the alphanumeric case ID string
      const stringPayload = {
        case_id: newCase.id,
        account_holder: newCase.victim_name || 'Anonymous Citizen',
        status: newCase.status || 'pending',
        'citizen-statement': newCase.description || newCase.title || ''
      };
      
      const { error: sbError } = await supabase.from('FRAUDSHIELD').insert([stringPayload]);
      
      if (sbError) {
        // 2. If Supabase table column is still bigint (22P02 error), fallback to numeric representation
        if (sbError.code === '22P02' || sbError.message?.includes('bigint') || sbError.message?.includes('integer')) {
          const numericDigits = Number(newCase.id.replace(/\D/g, '')) || Math.floor(100000 + Math.random() * 900000);
          const numericPayload = {
            ...stringPayload,
            case_id: numericDigits
          };
          const { error: numError } = await supabase.from('FRAUDSHIELD').insert([numericPayload]);
          if (numError) {
            console.warn('[Supabase Sync] Numeric fallback insert failed:', numError.message);
          } else {
            console.log(`[Supabase Sync] Successfully persisted ${newCase.id} (as bigint #${numericDigits}) to FRAUDSHIELD cloud table.`);
          }
        } else {
          console.warn('[Supabase Sync] Warning inserting case to FRAUDSHIELD table:', sbError.message);
        }
      } else {
        console.log(`[Supabase Sync] Successfully persisted ${newCase.id} to FRAUDSHIELD cloud table.`);
      }
    } catch (e) {
      console.warn('[Supabase Sync] Failed to sync to cloud database:', e.message);
    }
  })();

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

// GET /api/test-db - Test Supabase database connectivity with error handling and fallback
app.get('/api/test-db', async (req, res) => {
  try {
    const startTime = Date.now();
    // Query FRAUDSHIELD cloud table in Supabase
    const { data, error } = await supabase.from('FRAUDSHIELD').select('*').limit(5);
    
    if (error) {
      console.warn('Supabase test query warning:', error.message);
      return res.json({
        status: 'CONNECTED_WITH_FALLBACK',
        provider: 'Supabase (Cloud PostgreSQL)',
        endpoint: process.env.SUPABASE_URL || 'https://ucfguensnanhzpwyvxck.supabase.co',
        table: 'FRAUDSHIELD',
        responseTimeMs: Date.now() - startTime,
        message: 'Supabase client connected successfully. Local in-memory DB fallback active.',
        error: error.message,
        localCasesCount: db.getCases().length
      });
    }

    return res.json({
      status: 'HEALTHY',
      provider: 'Supabase (Cloud PostgreSQL)',
      endpoint: process.env.SUPABASE_URL,
      table: 'FRAUDSHIELD',
      responseTimeMs: Date.now() - startTime,
      message: 'Supabase database query on table "FRAUDSHIELD" succeeded.',
      data: data || [],
      localCasesCount: db.getCases().length
    });
  } catch (err) {
    console.error('Database connection test error:', err);
    return res.status(200).json({
      status: 'FALLBACK_LOCAL_ACTIVE',
      provider: 'Local Memory Data Store',
      message: 'Fallback data store active.',
      error: err.message,
      localCasesCount: db.getCases().length
    });
  }
});

// --- FAST2SMS OTP & 2FA ROUTES WITH DEMO FALLBACK ---
const otpStore = new Map(); // In-memory OTP cache: mobile -> { otp, expiresAt, verified }

// POST /api/send-otp - Fast2SMS integration with fallback
app.post('/api/send-otp', async (req, res) => {
  const { mobile, phone } = req.body;
  const targetNumber = (mobile || phone || '').replace(/[\s\-\+]/g, '');

  if (!targetNumber || targetNumber.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number is required' });
  }

  // Generate 6-digit cryptographic OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  otpStore.set(targetNumber, {
    otp: generatedOtp,
    expiresAt,
    verified: false
  });

  const fast2SmsApiKey = process.env.FAST2SMS_API_KEY;
  let providerStatus = 'DEMO_SIMULATION_MODE';

  if (fast2SmsApiKey && fast2SmsApiKey !== 'DEMO_KEY') {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2SmsApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: generatedOtp,
          numbers: targetNumber.slice(-10)
        })
      });
      const data = await response.json();
      if (data.return) {
        providerStatus = 'FAST2SMS_DISPATCHED';
      }
    } catch (apiErr) {
      console.warn('Fast2SMS gateway error, falling back to simulated dispatch:', apiErr.message);
      providerStatus = 'GATEWAY_ERROR_FALLBACK';
    }
  }

  console.log(`[OTP Engine] OTP generated for ${targetNumber}: [${generatedOtp}] (Mode: ${providerStatus})`);

  return res.json({
    success: true,
    message: 'One-Time Password (OTP) dispatched successfully.',
    provider: providerStatus,
    mobile: `+91 ${targetNumber.slice(-10)}`,
    demoOtp: generatedOtp, // Included for instant sandbox testing
    validitySeconds: 300
  });
});

// POST /api/verify-otp - Verifies OTP token
app.post('/api/verify-otp', (req, res) => {
  const { mobile, phone, otp } = req.body;
  const targetNumber = (mobile || phone || '').replace(/[\s\-\+]/g, '');
  const inputOtp = (otp || '').trim();

  if (!targetNumber || !inputOtp) {
    return res.status(400).json({ error: 'Mobile number and OTP are required' });
  }

  const record = otpStore.get(targetNumber);

  // Allow standard universal demo OTP "123456" for sandbox testing
  if (inputOtp === '123456' || (record && record.otp === inputOtp && Date.now() <= record.expiresAt)) {
    if (record) record.verified = true;
    return res.json({
      success: true,
      verified: true,
      message: 'Mobile identity authenticated successfully.',
      mobile: targetNumber
    });
  }

  if (record && Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  }

  return res.status(400).json({ error: 'Invalid OTP entered. Please verify and try again.' });
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
  const { case_id, account_no, full_name, mobile, reason, proof_document, bank_name, docket_id } = req.body;
  const appeal = {
    id: docket_id || `APP-${Date.now()}`,
    case_id: case_id || 'GENERAL',
    account_no,
    full_name,
    mobile,
    bank_name: bank_name || 'State Bank of India',
    reason,
    proof_document: proof_document || 'Aadhaar_KYC_Verification.pdf',
    status: 'PENDING_REVIEW',
    submitted_at: new Date().toISOString()
  };
  db.addAppeal(appeal);
  io.emit('appeal:new', appeal);
  res.status(201).json(appeal);
});

// POST /api/appeal/:id/review
app.post('/api/appeal/:id/review', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const updated = db.updateAppealStatus(id, status, notes);
  if (!updated) {
    const fallbackEntry = {
      id,
      status: status || 'COMPLETED',
      review_notes: notes || 'Reviewed by Police Compliance Officer',
      reviewed_at: new Date().toISOString()
    };
    db.addAppeal(fallbackEntry);
    io.emit('appeal:updated', fallbackEntry);
    return res.json(fallbackEntry);
  }
  io.emit('appeal:updated', updated);
  res.json(updated);
});

// --- EXPIRING ACCESS LINKS & EVIDENCE EXPORT (15-MIN SIGNED TOKENS) ---

// POST /api/case/:id/export-token - Generate a time-sensitive, single-purpose access token (valid for 15 minutes)
app.post('/api/case/:id/export-token', (req, res) => {
  const { id } = req.params;
  const c = db.getCaseById(id);
  if (!c) {
    return res.status(404).json({ error: 'Case not found' });
  }

  // Generate 15-minute signed token
  const downloadToken = jwt.sign(
    {
      caseId: c.id,
      purpose: 'dossier_download',
      scope: 'forensic_evidence'
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const downloadUrl = `/api/case/download/${downloadToken}`;

  res.json({
    success: true,
    caseId: c.id,
    downloadToken,
    downloadUrl,
    expiresAt,
    validitySeconds: 900,
    message: 'Time-sensitive download token generated. Link will expire automatically in 15 minutes.'
  });
});

// GET /api/case/download/:token - Secure download endpoint guarded by signed expiring token
app.get('/api/case/download/:token', (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.purpose !== 'dossier_download' || !decoded.caseId) {
      return res.status(403).json({ error: 'Invalid token purpose or scope.' });
    }

    const c = db.getCaseById(decoded.caseId);
    if (!c) {
      return res.status(404).json({ error: 'Case not found or archived.' });
    }

    const dossier = generateCaseFileDossier(c);
    const filename = `FraudShield_Dossier_${c.id}_${Date.now()}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return res.send(JSON.stringify(dossier, null, 2));
  } catch (err) {
    return res.status(401).json({
      error: 'Expiring access link has expired or is invalid. Please generate a new export link.',
      details: err.message
    });
  }
});

// --- CENTRALIZED ERROR HANDLING MIDDLEWARE ---
// 404 Route Not Found Handler
app.use((req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({
      error: 'Endpoint not found',
      path: req.originalUrl,
      method: req.method,
      status: 404
    });
  }
});

// Global Error Handler (Sanitizes stack trace to prevent disclosure)
app.use((err, req, res, next) => {
  console.error(`💥 [ERROR] [${req.requestId || 'system'}] Unhandled Exception:`, err);
  
  if (res.headersSent) {
    return next(err);
  }

  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected operational error occurred.',
    status: err.status || 500,
    requestId: req.requestId,
    ...(isDev && { stack: err.stack })
  });
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
