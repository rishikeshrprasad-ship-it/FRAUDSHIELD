import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data_store.json');

class JSONDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.write({ users: [], cases: [], domain_threats: [], mule_ads: [], appeals: [] });
    }
  }

  read() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return { users: [], cases: [], domain_threats: [], mule_ads: [], appeals: [] };
    }
  }

  write(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  findUserByUsername(username) {
    const data = this.read();
    return (data.users || []).find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  addUser(user) {
    const data = this.read();
    data.users = data.users || [];
    data.users.push(user);
    this.write(data);
    return user;
  }

  getCases() {
    const data = this.read();
    return data.cases || [];
  }

  getCaseById(id) {
    const data = this.read();
    return (data.cases || []).find(c => c.id === id);
  }

  addCase(newCase) {
    const data = this.read();
    data.cases = data.cases || [];
    data.cases.unshift(newCase);
    this.write(data);
    return newCase;
  }

  claimCase(caseId, userId, userName) {
    const data = this.read();
    const c = (data.cases || []).find(item => item.id === caseId);
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
    const c = (data.cases || []).find(item => item.id === caseId);
    if (!c) return null;
    c.status = status;
    c.updated_at = new Date().toISOString();
    this.write(data);
    return c;
  }

  getDomainThreats() {
    const data = this.read();
    return data.domain_threats || [];
  }

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
}

export const db = new JSONDatabase();
