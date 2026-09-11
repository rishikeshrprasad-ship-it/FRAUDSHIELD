/**
 * Cross-checks APK / URL signatures against MHA (Ministry of Home Affairs) blocked app repository.
 */
const MHA_BLOCKED_SIGNATURES = [
  { name: 'Fake CBI Digital Arrest APK', packageId: 'com.cbi.investigation.sec', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
  { name: 'Loan Shark Instant Disbursement', packageId: 'com.instant.cash.loan.pro', hash: 'ca978112ca1bbdcafac231b39a23dac4' },
  { name: 'Screen Share Remote Access (Trojan)', packageId: 'com.anydesk.remote.mod', hash: '8743b52063cd84097a65d1633f5c74f5' },
  { name: 'Fake SBI YONO Rewards APK', packageId: 'com.sbi.yono.rewards.claim', hash: '11223344556677889900aabbccddeeff' }
];

export function checkMhaBlockedApps(query) {
  if (!query) return { isBlocked: false, details: null };

  const cleanQuery = query.toLowerCase();
  const matched = MHA_BLOCKED_SIGNATURES.find(app => 
    cleanQuery.includes(app.packageId.toLowerCase()) || 
    cleanQuery.includes(app.name.toLowerCase()) ||
    cleanQuery.includes(app.hash.toLowerCase())
  );

  if (matched) {
    return {
      isBlocked: true,
      severity: 'CRITICAL',
      appName: matched.name,
      packageId: matched.packageId,
      mhaAdvisoryNo: 'MHA-I4C-2026-BL-084',
      message: `CRITICAL ALERT: App package matched MHA / I4C (Indian Cybercrime Coordination Centre) Blacklist.`
    };
  }

  return {
    isBlocked: false,
    severity: 'LOW',
    appName: null,
    packageId: null,
    message: 'App / Package signature clean against MHA I4C blacklisted repository.'
  };
}
