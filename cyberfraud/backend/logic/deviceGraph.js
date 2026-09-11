/**
 * Constructs linkage graphs between devices, IPs, bank accounts, and crypto wallets.
 */
export function buildDeviceGraph(caseId) {
  const nodes = [
    { id: 'VICTIM-DEV-01', label: 'Victim Mobile Device', type: 'victim_device', group: 1 },
    { id: 'IP-185-220-101-5', label: 'Fraudster Proxy IP (185.220.101.5)', type: 'ip', group: 2 },
    { id: 'APK-TROJAN-CBI', label: 'Remote Control APK', type: 'malware', group: 2 },
    { id: 'MULE-BANK-SBI-01', label: 'SBI Mule Acc #48192019', type: 'mule_account', group: 3 },
    { id: 'MULE-BANK-HDFC-02', label: 'HDFC Mule Acc #99210411', type: 'mule_account', group: 3 },
    { id: 'TRC20-WALLET-01', label: 'USDT Mule Wallet (TX9mK2...)', type: 'crypto_wallet', group: 4 },
    { id: 'OFFSHORE-OTC-DUBAI', label: 'Offshore OTC Exchange', type: 'crypto_wallet', group: 4 }
  ];

  const links = [
    { source: 'VICTIM-DEV-01', target: 'APK-TROJAN-CBI', value: 3 },
    { source: 'APK-TROJAN-CBI', target: 'IP-185-220-101-5', value: 4 },
    { source: 'IP-185-220-101-5', target: 'MULE-BANK-SBI-01', value: 5 },
    { source: 'MULE-BANK-SBI-01', target: 'MULE-BANK-HDFC-02', value: 4 },
    { source: 'MULE-BANK-HDFC-02', target: 'TRC20-WALLET-01', value: 5 },
    { source: 'TRC20-WALLET-01', target: 'OFFSHORE-OTC-DUBAI', value: 5 }
  ];

  return { caseId, nodes, links, clusterRisk: 'CRITICAL_CYBER_SYNDICATE' };
}
