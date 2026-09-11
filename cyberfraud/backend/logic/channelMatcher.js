/**
 * Matches scam channel signatures (Telegram, WhatsApp, APK, Fake Site, Phone Call, QR Phishing).
 */
export function matchScamChannel(inputString) {
  if (!inputString) return { channel: 'Unknown Channel', confidence: 0, signature: 'GENERIC' };

  const str = inputString.toLowerCase();

  if (str.includes('telegram') || str.includes('t.me')) {
    return { channel: 'Telegram Cyber Syndicate', confidence: 95, signature: 'MULE_RECRUITMENT_TG' };
  }
  if (str.includes('whatsapp') || str.includes('wa.me')) {
    return { channel: 'WhatsApp Digital Arrest', confidence: 92, signature: 'DIGITAL_ARREST_WA' };
  }
  if (str.includes('.apk') || str.includes('app') || str.includes('download')) {
    return { channel: 'Malicious Android APK (Trojan)', confidence: 98, signature: 'APK_RAT_STEALER' };
  }
  if (str.includes('sebi') || str.includes('trading') || str.includes('invest')) {
    return { channel: 'Fake Stock Trading Portal', confidence: 90, signature: 'SEBI_REGISTERED_SPOOF' };
  }
  if (str.includes('qr') || str.includes('upi') || str.includes('paytm') || str.includes('gpay')) {
    return { channel: 'Reverse UPI QR Scam', confidence: 94, signature: 'REVERSE_QR_PAYMENT' };
  }

  return { channel: 'Direct Phone / SMS Phishing', confidence: 75, signature: 'VOICE_PHISHING' };
}
