/**
 * Client-side link risk score calculation and threat detection utility.
 */
export function checkFrontendLinkRisk(url) {
  if (!url) return { riskScore: 0, category: 'SAFE', reasons: [] };

  const clean = url.toLowerCase().trim();
  const reasons = [];
  let score = 10;

  if (clean.includes('kyc') || clean.includes('verify') || clean.includes('update') || clean.includes('reward')) {
    score += 30;
    reasons.push('Contains social engineering keywords (KYC/Reward/Verify)');
  }

  if (clean.includes('sbi') || clean.includes('hdfc') || clean.includes('icici') || clean.includes('rbi')) {
    if (!clean.includes('.sbi') && !clean.includes('sbi.co.in') && !clean.includes('hdfcbank.com') && !clean.includes('icicibank.com') && !clean.includes('rbi.org.in')) {
      score += 45;
      reasons.push('Banking brand keyword spoofing detected on non-official TLD');
    }
  }

  if (clean.includes('.apk') || clean.includes('download')) {
    score += 40;
    reasons.push('Direct APK payload or unauthorized download link');
  }

  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(clean)) {
    score += 35;
    reasons.push('Raw IP numerical address hosting');
  }

  const finalScore = Math.min(99, score);
  let category = 'SAFE';
  if (finalScore >= 75) category = 'CRITICAL_PHISHING';
  else if (finalScore >= 45) category = 'HIGH_RISK';
  else if (finalScore >= 25) category = 'MODERATE';

  return {
    url,
    riskScore: finalScore,
    category,
    reasons
  };
}
