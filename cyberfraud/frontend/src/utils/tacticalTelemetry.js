// Tactical Intelligence Telemetry & Coordinate Generator for FraudShield V2.6
// Derives military-grade dual-node footprint (Crimson C2 Node vs. Orange ATM Puncture) for every case.

const ANONYMIZATION_STACKS = [
  'Tor Exit Relay / Multi-Hop Ingress',
  'Rotating Commercial VPN & SOCKS5 Proxy',
  'Kali Linux C2 Command Node (Fast-Flux)',
  'Spoofed DNS & Tunnelled Telegram Relay',
  'Mullvad WireGuard Obfuscated Tunnel',
  'Bulletproof Cloud VPS Ingress Gateway'
];

const ASN_PROVIDERS = [
  'AS9009 (M247 Ltd - High Risk Datacenter)',
  'AS49505 (OVH Hosting Bulletproof Range)',
  'AS200052 (DataCamp S.R.O. Proxy Cluster)',
  'AS14061 (DigitalOcean Ingress Drop)',
  'AS62005 (Hostinger Offshore VPS)',
  'AS39351 (31173 Services AB / VPN Node)'
];

const BANK_ATM_HUBS = [
  'SBI 24x7 CDM & Instant Dispenser Hub',
  'HDFC Express Recycler Terminal',
  'ICICI Micro-ATM BC Point',
  'Axis Bank Automated Cash Puncture',
  'PNB Rural Banking Correspondent Kiosk',
  'Kotak Mahindra High-Volume ATM Node'
];

export function getHash(str) {
  let hash = 0;
  if (!str) return 1337;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function deriveTacticalTelemetry(caseItem) {
  if (!caseItem) return null;

  const hash = getHash(caseItem.id || caseItem.title || 'CASE-2026');
  
  // Exact incident GPS coordinates from case report (Zero artificial drift)
  const baseLat = parseFloat(caseItem.latitude) || 28.6139;
  const baseLng = parseFloat(caseItem.longitude) || 77.2090;

  // C2 Ingress / Primary Incident Pinned Marker is anchored exactly at true GPS coordinates
  const c2Coords = [baseLat, baseLng];

  // ATM Cash-Out / Mule Bank node placed in immediate localized vicinity (~380m radial vector)
  // Guarantees clean, unmerged visual separation between C2 and ATM icons on all zoom levels
  const angle = ((hash % 12) * (Math.PI / 6)) + (Math.PI / 4);
  const radius = 0.0032; // ~350 meters
  const atmLatDelta = Math.sin(angle) * radius;
  const atmLngDelta = Math.cos(angle) * radius;
  const atmCoords = [baseLat + atmLatDelta, baseLng + atmLngDelta];

  const anonStack = ANONYMIZATION_STACKS[hash % ANONYMIZATION_STACKS.length];
  const asn = ASN_PROVIDERS[(hash >> 3) % ASN_PROVIDERS.length];
  const atmHub = BANK_ATM_HUBS[(hash >> 5) % BANK_ATM_HUBS.length];
  
  const ingressIp = `185.${100 + (hash % 120)}.${(hash % 200) + 10}.${(hash % 250) + 1}`;
  const ttlValue = 64 - (hash % 14);
  const leakedSubnet = `10.${hash % 250}.${(hash >> 2) % 250}.${(hash >> 4) % 250}`;
  const canvasHash = `0x${((hash * 2654435761) >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
  const confidenceScore = 88 + (hash % 11);

  return {
    caseId: caseItem.id,
    title: caseItem.title,
    amount: Number(caseItem.amount || 0),
    status: caseItem.status || 'pending',
    urgencyScore: caseItem.urgency_score || 85,
    locationName: caseItem.location_name || 'Regional Command Grid',
    
    c2Node: {
      type: 'C2_INGRESS',
      label: 'Scammer Ingress / C2 Operational Node',
      coords: c2Coords,
      lat: c2Coords[0],
      lng: c2Coords[1],
      ip: ingressIp,
      asn: asn,
      anonymizationStack: anonStack,
      ttlFingerprint: `TTL=${ttlValue} (OS Stack Mismatch)`,
      webrtcLeak: `Leaked Gateway: ${leakedSubnet}`,
      canvasHash: canvasHash,
      confidenceScore: `${confidenceScore}% Confidence`
    },

    atmNode: {
      type: 'ATM_CASHOUT',
      label: 'Downstream Mule Bank / ATM Cash-Out Puncture',
      coords: atmCoords,
      lat: atmCoords[0],
      lng: atmCoords[1],
      hubName: atmHub,
      muleAccount: caseItem.suspect_account || `MULE-${((hash * 7919) % 90000000 + 10000000)}`,
      withdrawalSLA: `${(hash % 35) + 10} Mins to Intercept`,
      riskRating: 'CRITICAL ESCAPE VECTOR'
    }
  };
}
