import { db } from './database.js';

/**
 * Background scanner identifying mule recruitment ads. Emits recruitment:new via socket.io.
 */
let intervalId = null;

export function startRecruitmentAdScanner(io) {
  if (intervalId) return;

  const mockAdsTemplates = [
    { title: 'Urgent Renting of Savings Bank Accounts - 8% Cut per Transfer', platform: 'Telegram / @mule_cashout_hub', contact: '@fast_pay_admin' },
    { title: 'Work From Home USDT P2P Cash out Operator (No KYC Needed)', platform: 'Darknet Forum', contact: 'usdt_operator_ncr' },
    { title: 'Earn ₹40,000 Weekly - SBI / HDFC ATM Card Handover Project', platform: 'Instagram DM Syndicate', contact: '@quick_money_delhi' }
  ];

  intervalId = setInterval(() => {
    const randomTemplate = mockAdsTemplates[Math.floor(Math.random() * mockAdsTemplates.length)];
    const newAd = {
      id: `ad_${Date.now()}`,
      title: randomTemplate.title,
      platform: randomTemplate.platform,
      contact: randomTemplate.contact,
      risk_score: Math.floor(88 + Math.random() * 11),
      payout: 'High Commission per incoming transaction',
      detected_at: new Date().toISOString(),
      status: 'ACTIVE_MONITORING'
    };

    db.addMuleAd(newAd);
    if (io) {
      io.emit('recruitment:new', newAd);
    }
  }, 45000); // scans every 45s
}

export function stopRecruitmentAdScanner() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
