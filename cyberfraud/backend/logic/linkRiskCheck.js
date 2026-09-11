import { checkSebiRegistry } from './sebiRegistryCheck.js';
import { checkMhaBlockedApps } from './mhaBlockedAppsCheck.js';

/**
 * Analyzes URLs and domains for phishing risk scores.
 */
export function analyzeLinkRisk(url) {
  if (!url) {
    return { riskScore: 0, verdict: 'SAFE', reasons: ['No URL provided'] };
  }

  const cleanUrl = url.toLowerCase().trim();
  const reasons = [];
  let riskScore = 15; // base score for unknown links

  // Check keywords
  const suspiciousKeywords = ['kyc', 'reward', 'verify', 'update-bank', 'gift-card', 'apk-download', 'cbi-notice', 'govt', 'police', 'challan', 'sbi', 'upi'];
  suspiciousKeywords.forEach(kw => {
    if (cleanUrl.includes(kw)) {
      riskScore += 25;
      reasons.push(`Contains high-risk phishing keyword: "${kw}"`);
    }
  });

  // Check URL shorteners & masking domains
  const shorteners = ['short.gy', 'bit.ly', 'tinyurl', 't.co', 'cutt.ly', 'is.gd', 'rb.gy', 'shorturl.at', 'rebrand.ly'];
  const isShortener = shorteners.some(s => cleanUrl.includes(s));
  if (isShortener) {
    riskScore += 45;
    reasons.push('Uses URL shortener / masking service to conceal real destination');
  }

  // Check high-risk disposable TLDs
  const highRiskTLDs = ['.xyz', '.top', '.zip', '.ru', '.cn', '.sbs', '.online', '.site', '.work', '.click'];
  const hasHighRiskTLD = highRiskTLDs.some(tld => cleanUrl.includes(tld));
  if (hasHighRiskTLD) {
    riskScore += 35;
    reasons.push('Registered on high-abuse disposable top-level domain');
  }

  // Instant critical override for shorteners or fake government/bank patterns
  if (isShortener || (hasHighRiskTLD && suspiciousKeywords.some(kw => cleanUrl.includes(kw)))) {
    riskScore = Math.max(95, riskScore);
  }

  // IP based host check
  if (/\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}/.test(cleanUrl)) {
    riskScore += 30;
    reasons.push('Uses direct raw IP address instead of domain name');
  }

  // Check SEBI
  const sebiRes = checkSebiRegistry(cleanUrl);
  if (sebiRes.risk === 'CRITICAL') {
    riskScore += 45;
    reasons.push(sebiRes.message);
  }

  // Check MHA
  const mhaRes = checkMhaBlockedApps(cleanUrl);
  if (mhaRes.isBlocked) {
    riskScore += 50;
    reasons.push(mhaRes.message);
  }

  const finalScore = Math.min(99, Math.max(5, riskScore));
  let verdict = 'SAFE';
  if (finalScore >= 75) verdict = 'CRITICAL PHISHING THREAT';
  else if (finalScore >= 45) verdict = 'SUSPICIOUS LINK';
  else if (finalScore >= 25) verdict = 'MODERATE RISK';

  return {
    url,
    riskScore: finalScore,
    verdict,
    reasons,
    sebiInfo: sebiRes,
    mhaInfo: mhaRes
  };
}
