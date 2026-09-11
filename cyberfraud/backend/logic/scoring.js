/**
 * Calculates urgency score (0–100) based on financial loss, velocity, scam channel, and vulnerability factors.
 */
export function calculateUrgencyScore(caseData) {
  let score = 50; // base score

  const amount = Number(caseData.amount) || 0;
  // Financial loss weighting
  if (amount > 1000000) {
    score += 30;
  } else if (amount > 500000) {
    score += 20;
  } else if (amount > 100000) {
    score += 12;
  } else if (amount > 25000) {
    score += 6;
  }

  // Scam Channel Weighting
  const scamType = (caseData.scam_type || '').toLowerCase();
  const channel = (caseData.scam_channel || '').toLowerCase();

  if (scamType.includes('digital arrest') || scamType.includes('duress')) {
    score += 20;
  }
  if (scamType.includes('sebi') || scamType.includes('trading')) {
    score += 15;
  }
  if (channel.includes('whatsapp') || channel.includes('telegram')) {
    score += 10;
  }
  if (channel.includes('apk') || channel.includes('malware')) {
    score += 18;
  }

  // Vulnerability boost (e.g. senior citizens)
  const desc = (caseData.description || '').toLowerCase();
  if (desc.includes('senior') || desc.includes('elder') || desc.includes('pension')) {
    score += 10;
  }

  return Math.min(100, Math.max(10, score));
}
