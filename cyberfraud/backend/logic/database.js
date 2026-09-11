import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data_store.json');

// Initial seed data
const initialData = {
  users: [
    {
      id: 'usr_admin',
      username: 'chief_admin',
      name: 'Inspector General V. Sharma',
      role: 'CHIEF / ADMIN',
      // Password: Password@123
      password: '$2a$10$8K1p/a0dL1LXMIgoED88heS9x6M2P6vK4d/eRj/wB5rC2k/YI0nS2'
    },
    {
      id: 'usr_officer1',
      username: 'officer_rahul',
      name: 'Sub-Inspector Rahul Kumar',
      role: 'POLICE',
      password: '$2a$10$8K1p/a0dL1LXMIgoED88heS9x6M2P6vK4d/eRj/wB5rC2k/YI0nS2'
    },
    {
      id: 'usr_teller1',
      username: 'teller_sbi_01',
      name: 'Anjali Verma (SBI Cyberabad Branch)',
      role: 'BRANCH STAFF',
      password: '$2a$10$8K1p/a0dL1LXMIgoED88heS9x6M2P6vK4d/eRj/wB5rC2k/YI0nS2'
    }
  ],
  cases: [
    {
      id: 'CASE-2026-9041',
      title: 'Digital Arrest Threat & Instant Transfer',
      scam_type: 'Digital Arrest / Impersonation',
      amount: 450000,
      description: 'Victim received video call from fake CBI officer threatening arrest for illegal courier. Transferred 4.5 Lakhs under duress.',
      location_name: 'Connaught Place, New Delhi',
      latitude: 28.6315,
      longitude: 77.2167,
      victim_name: 'Rajesh Sharma',
      victim_contact: '+91 98765 43210',
      status: 'pending',
      urgency_score: 92,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      claimed_by: null,
      claimed_by_name: null,
      suspect_account: 'SBI-MULE-48192019',
      scam_channel: 'WhatsApp Video Call',
      sla_deadline: new Date(Date.now() + 1800000).toISOString()
    },
    {
      id: 'CASE-2026-8812',
      title: 'SEBI Registered Trading App Spoof',
      scam_type: 'SEBI Registry Spoofing',
      amount: 1200000,
      description: 'Fake institutional trading portal mimicking SEBI licensed entity, lured via Telegram stock tip group.',
      location_name: 'Bandra Kurla Complex, Mumbai',
      latitude: 19.0657,
      longitude: 72.8687,
      victim_name: 'Priya Mehta',
      victim_contact: '+91 98112 23344',
      status: 'claimed',
      urgency_score: 88,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      claimed_by: 'usr_officer1',
      claimed_by_name: 'Sub-Inspector Rahul Kumar',
      suspect_account: 'HDFC-MULE-99210411',
      scam_channel: 'Telegram Channel',
      sla_deadline: new Date(Date.now() + 900000).toISOString()
    },
    {
      id: 'CASE-2026-7104',
      title: 'Senior Citizen Branch Teller Duress Intercept',
      scam_type: 'Teller Duress Alert',
      amount: 850000,
      description: '72-year-old victim came to branch asking to clear FD immediately while receiving urgent instructions on phone.',
      location_name: 'MG Road, Bengaluru',
      latitude: 12.9756,
      longitude: 77.6062,
      victim_name: 'K. S. Sundaram',
      victim_contact: '+91 94433 11223',
      status: 'frozen',
      urgency_score: 98,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      claimed_by: 'usr_officer1',
      claimed_by_name: 'Sub-Inspector Rahul Kumar',
      suspect_account: 'ICICI-MULE-11829304',
      scam_channel: 'Voice Call',
      sla_deadline: new Date(Date.now() + 2700000).toISOString()
    }
  ],
  domain_threats: [
    {
      id: 'dom_1',
      domain: 'sbi-kyc-update-portal.com',
      keyword: 'sbi',
      risk_score: 95,
      ip: '185.220.101.5',
      registrar: 'NameCheap Inc.',
      status: 'FLAGGED',
      detected_at: new Date().toISOString()
    },
    {
      id: 'dom_2',
      domain: 'sebi-verified-stock-trade.online',
      keyword: 'sebi',
      risk_score: 91,
      ip: '194.26.29.112',
      registrar: 'Regtime Ltd',
      status: 'BLOCKED',
      detected_at: new Date().toISOString()
    }
  ],
  mule_ads: [
    {
      id: 'ad_1',
      title: 'Earn ₹25,000/Day - Bank Account Renting Needed urgently',
      platform: 'Telegram / CyberJobs',
      contact: '@fast_commission_payouts',
      risk_score: 96,
      payout: '5% commission per incoming transfer',
      detected_at: new Date().toISOString(),
      status: 'ACTIVE_MONITORING'
    },
    {
      id: 'ad_2',
      title: 'Crypto USDT P2P Cash Out Agents Required in Delhi NCR',
      platform: 'Dark Web / Forum',
      contact: 'usdt_mule_operator_delhi',
      risk_score: 94,
      payout: '10,000 INR fixed daily',
      detected_at: new Date().toISOString(),
      status: 'ACTIVE_MONITORING'
    }
  ],
  duress_alerts: [],
  appeals: []
};

class JSONDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.write(initialData);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading DB file, re-initializing:', e);
      this.write(initialData);
      return initialData;
    }
  }

  write(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Users
  findUserByUsername(username) {
    const data = this.read();
    return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  addUser(user) {
    const data = this.read();
    data.users.push(user);
    this.write(data);
    return user;
  }

  // Cases
  getCases() {
    const data = this.read();
    return data.cases;
  }

  getCaseById(id) {
    const data = this.read();
    return data.cases.find(c => c.id === id);
  }

  addCase(newCase) {
    const data = this.read();
    data.cases.unshift(newCase);
    this.write(data);
    return newCase;
  }

  claimCase(caseId, userId, userName) {
    const data = this.read();
    const c = data.cases.find(item => item.id === caseId);
    if (!c) return null;
    c.status = 'claimed';
    c.claimed_by = userId;
    c.claimed_by_name = userName;
    c.claimed_at = new Date().toISOString();
    this.write(data);
    return c;
  }

  updateCaseStatus(caseId, status) {
    const data = this.read();
    const c = data.cases.find(item => item.id === caseId);
    if (!c) return null;
    c.status = status;
    c.updated_at = new Date().toISOString();
    this.write(data);
    return c;
  }

  // Domain Threats
  getDomainThreats() {
    const data = this.read();
    return data.domain_threats || [];
  }

  addDomainThreat(threat) {
    const data = this.read();
    data.domain_threats = data.domain_threats || [];
    data.domain_threats.unshift(threat);
    this.write(data);
    return threat;
  }

  // Mule Ads
  getMuleAds() {
    const data = this.read();
    return data.mule_ads || [];
  }

  addMuleAd(ad) {
    const data = this.read();
    data.mule_ads = data.mule_ads || [];
    data.mule_ads.unshift(ad);
    this.write(data);
    return ad;
  }

  // Appeals
  getAppeals() {
    const data = this.read();
    return data.appeals || [];
  }

  addAppeal(appeal) {
    const data = this.read();
    data.appeals = data.appeals || [];
    data.appeals.unshift(appeal);
    this.write(data);
    return appeal;
  }

  updateAppealStatus(id, status, notes) {
    const data = this.read();
    const app = (data.appeals || []).find(a => a.id === id);
    if (!app) return null;
    app.status = status;
    app.review_notes = notes;
    app.reviewed_at = new Date().toISOString();
    this.write(data);
    return app;
  }

  // Duress Alerts
  addDuressAlert(alert) {
    const data = this.read();
    data.duress_alerts = data.duress_alerts || [];
    data.duress_alerts.unshift(alert);
    this.write(data);
    return alert;
  }

  getDuressAlerts() {
    const data = this.read();
    return data.duress_alerts || [];
  }
}

export const db = new JSONDatabase();
