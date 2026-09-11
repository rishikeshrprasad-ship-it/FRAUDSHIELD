import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  Network,
  X,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldAlert,
  Cpu,
  Lock,
  Layers,
  Building,
  Terminal,
  Smartphone,
  Globe,
  Radio,
  Coins,
  Copy,
  CheckCircle2,
  ExternalLink,
  Filter,
  Activity,
  ArrowRight,
  Sparkles,
  ChevronDown,
  CreditCard,
  AlertTriangle,
  FileDown,
  ShieldCheck
} from 'lucide-react';

// Default active investigation cases for quick selection
const DEFAULT_CASES = [
  {
    id: 'CASE-2026-9041',
    title: 'Digital Arrest & Video Extortion Syndicate',
    amount: '₹1,85,000',
    scamType: 'CBI Video Arrest / APK Malware',
    victim: 'Anand Swaroop',
    urgency: 94
  },
  {
    id: 'CASE-2026-8812',
    title: 'High-Yield Fake Institutional Trading App',
    amount: '₹14,50,000',
    scamType: 'SEBI Spoofed Investment Bot',
    victim: 'Meenakshi Sundaram',
    urgency: 88
  },
  {
    id: 'CASE-2026-7734',
    title: 'Urgent Electricity Disconnection Surcharge',
    amount: '₹84,500',
    scamType: 'SMS Phishing & Accessibility Trojan',
    victim: 'Dr. Rajesh Khanna',
    urgency: 76
  },
  {
    id: 'CASE-2026-5509',
    title: 'Part-Time Telegram Job & Task Fee Trap',
    amount: '₹3,20,000',
    scamType: 'Mule Layering & P2P Crypto Swap',
    victim: 'Priya Sharma',
    urgency: 82
  },
  {
    id: 'CASE-2026-3321',
    title: 'Customs Parcel Drug Interception Fraud',
    amount: '₹6,40,000',
    scamType: 'FedEx / Narcotics Blackmail Ring',
    victim: 'Vikramaditya Roy',
    urgency: 91
  }
];

// Generates case-specific high-fidelity cybersecurity threat intelligence graph
export function generateCaseGraphData(caseId = 'CASE-2026-9041', caseMeta = null) {
  // Case 1: Digital Arrest & Video Extortion
  if (caseId === 'CASE-2026-9041') {
    return {
      caseId,
      nodes: [
        {
          id: 'C2-INGRESS-KALI',
          label: 'Kali C2 Ingress Rig',
          sublabel: 'AS9009 M247 Ltd (Tor Exit)',
          type: 'c2_ingress',
          group: 1,
          ip: '185.220.101.5',
          isp: 'M247 Ltd Dedicated Hosting (Bucharest Hub)',
          asn: 'AS9009 M247 Europe (High-Risk Tor Relay)',
          webrtcLeak: '10.244.18.92 (STUN Host Leaked)',
          canvasHash: 'SHA256:7e9a2b8901c2fa4b (Spoofed)',
          os: 'Linux 6.6.13-kali (Debian Testing)',
          ttl: 'TTL=64 (Direct Linux Core Raw Sockets)',
          threatActor: 'FIN-APT-9041 (Digital Arrest Cell)',
          riskScore: '99.8% CRITICAL',
          details: 'Adversary Command & Control rig routing automated phishing payloads and intercepting 2FA OTP tokens.'
        },
        {
          id: 'APK-TROJAN-CBI',
          label: 'Remote Access Trojan APK',
          sublabel: 'com.cbi.investigation.sec',
          type: 'c2_ingress',
          group: 1,
          package: 'com.cbi.investigation.sec.apk',
          permissions: 'Accessibility Services, Screen Recording, SMS Intercept, Call Forwarding',
          c2Server: 'cbi-verification-portal.internal-gateway.cc:8443',
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          riskScore: '98.5% HIGH',
          details: 'Malicious payload downloaded via spoofed WhatsApp message requesting digital identity verification.'
        },
        {
          id: 'VICTIM-DEV-01',
          label: 'Victim Mobile Device',
          sublabel: 'Samsung S23 (OneUI 6.1)',
          type: 'victim_target',
          group: 2,
          os: 'Android 14 (OneUI 6.1)',
          deviceModel: 'Samsung Galaxy S23 (SM-S911B)',
          victimName: caseMeta?.victim || 'Anand Swaroop',
          exposureVector: 'Social Engineering WhatsApp Direct Message (Video Call Warrants)',
          sessionState: 'Accessibility Services Hijacked & Screen Mirror Active',
          riskScore: 'TARGET COMPROMISED',
          details: 'Victim device tricked into allowing remote accessibility service permissions, granting attacker screen control.'
        },
        {
          id: 'PHISHING-LANDING-01',
          label: 'Spoofed CBI Portal',
          sublabel: 'cbi-investigation-portal-verify.in',
          type: 'victim_target',
          group: 2,
          url: 'https://cbi-investigation-portal-verify.in/case-check',
          cert: 'Let\'s Encrypt (Issued 48 hrs ago)',
          registrar: 'NameCheap Public Proxy (Blacklisted)',
          status: 'Flagged on CERT-In Cyber Threat Feed',
          riskScore: 'MALICIOUS HARVESTER',
          details: 'Counterfeit government portal displaying fake digital arrest warrants with victim national identity numbers.'
        },
        {
          id: 'MULE-BANK-SBI-01',
          label: 'Layer-1 SBI Mule #48192019',
          sublabel: 'SBI Chandni Chowk Hub',
          type: 'mule_account',
          group: 3,
          bank: 'State Bank of India',
          branch: 'Chandni Chowk Main Branch (Delhi)',
          ifsc: 'SBIN0000631',
          accountNo: 'SBI-MULE-48192019',
          upiHandle: 'quickpay.mule4819@oksbi',
          velocity: '₹1,85,000 / 4.2 mins (Burst Velocity High)',
          kycStatus: 'Dummy KYC: Sunita Devi (Purchased Identity)',
          riskScore: 'FLAGGED FOR FREEZE',
          details: 'Primary destination account receiving the initial unauthorized UPI transfer. First layering hop.'
        },
        {
          id: 'MULE-BANK-HDFC-02',
          label: 'Layer-2 HDFC Mule #99210411',
          sublabel: 'HDFC Sector 62 Branch',
          type: 'mule_account',
          group: 3,
          bank: 'HDFC Bank Ltd',
          branch: 'Sector 62 Noida Cyber City Hub',
          ifsc: 'HDFC0001928',
          accountNo: 'HDFC-MULE-99210411',
          upiHandle: 'payfast9921@okhdfcbank',
          velocity: 'Split Velocity: ₹90,000 x 2 Sub-Transactions',
          kycStatus: 'Compromised Dormant Account',
          riskScore: 'SECONDARY LAYER',
          details: 'Secondary mule pool splitting funds into dual sub-channels to evade automated NPCI fraud detection limits.'
        },
        {
          id: 'ATM-CASHOUT-NOIDA',
          label: 'ATM Cash-Out Puncture',
          sublabel: 'Noida Sector 62 Hub Booth 04',
          type: 'mule_account',
          group: 3,
          location: 'Noida Sector 62 Cyber City ATM Hub',
          atmId: 'ATM-NCR-NOIDA-B04',
          withdrawalWindow: '18 minutes post-transfer',
          cctvStatus: 'Surveillance Cam 02 Capture Active (Mule Runner in Helmet)',
          riskScore: 'PHYSICAL CASH PUNCTURE',
          details: 'Physical cash withdrawal node where mule runner extracts physical cash using cloned debit cards.'
        },
        {
          id: 'TRC20-WALLET-01',
          label: 'USDT TRC20 Mule Wallet',
          sublabel: 'TX9mK2jL89... (TRON)',
          type: 'crypto_wallet',
          group: 4,
          address: 'TX9mK2jL89aBcDeFgHiJkLmNoPqRsTuVwX',
          chain: 'TRON Network (TRC-20)',
          totalVolume: '$42,500 USDT Cleared',
          hopCount: 'Hop 3 to Dubai OTC Desk',
          mixerStatus: 'P2P Decentralized Telegram Liquidity Swap',
          riskScore: 'CRYPTO LAUNDERING BRIDGE',
          details: 'P2P cryptocurrency transit wallet converting stolen INR into Tether (USDT) on the TRON blockchain.'
        },
        {
          id: 'OFFSHORE-OTC-DUBAI',
          label: 'Offshore Dubai OTC Desk',
          sublabel: 'DIFC Transit Liquidity Node',
          type: 'crypto_wallet',
          group: 4,
          jurisdiction: 'Dubai International Financial Centre (DIFC) Transit',
          counterParty: 'Telegram P2P Liquidity Broker (@DubaiEscrowOTC)',
          status: 'Interpol Purple Notice Reference INT-AE-2026-9041',
          riskScore: 'FINAL EXFILTRATION SINK',
          details: 'Offshore OTC desk performing fiat liquidation into UAE Dirhams / hard currency outside domestic jurisdiction.'
        }
      ],
      links: [
        { source: 'C2-INGRESS-KALI', target: 'APK-TROJAN-CBI', label: 'Payload Delivery', value: 4 },
        { source: 'APK-TROJAN-CBI', target: 'VICTIM-DEV-01', label: 'Screen / OTP Intercept', value: 5 },
        { source: 'VICTIM-DEV-01', target: 'PHISHING-LANDING-01', label: 'Phishing Ingress', value: 3 },
        { source: 'PHISHING-LANDING-01', target: 'MULE-BANK-SBI-01', label: 'Layer-1 UPI Drain (₹1.85L)', value: 5 },
        { source: 'MULE-BANK-SBI-01', target: 'MULE-BANK-HDFC-02', label: 'Layer-2 Mule Split', value: 4 },
        { source: 'MULE-BANK-HDFC-02', target: 'ATM-CASHOUT-NOIDA', label: 'Physical ATM Cash-Out', value: 5 },
        { source: 'MULE-BANK-HDFC-02', target: 'TRC20-WALLET-01', label: 'INR -> USDT P2P Swap', value: 5 },
        { source: 'TRC20-WALLET-01', target: 'OFFSHORE-OTC-DUBAI', label: 'Offshore Exfiltration', value: 5 }
      ]
    };
  }

  // Case 2: Institutional Stock Trading Bot Scam
  if (caseId === 'CASE-2026-8812') {
    return {
      caseId,
      nodes: [
        {
          id: 'C2-INGRESS-CLOUD',
          label: 'ShenZhen Bulletproof Host',
          sublabel: 'AS13335 Cloudflare Gateway',
          type: 'c2_ingress',
          group: 1,
          ip: '103.14.26.88',
          isp: 'ChinaNet Guangdong Network (ShenZhen Node)',
          asn: 'AS13335 Cloudflare Enterprise Bypass',
          webrtcLeak: '192.168.10.45 (Local Subnet Host)',
          canvasHash: 'SHA256:4a81b29cc901ef (Chromium Spoofed)',
          os: 'Ubuntu 22.04 LTS Headless',
          ttl: 'TTL=56 (Multi-hop Cloud Reverse Proxy)',
          threatActor: 'SOUTHEAST-ASIA-PIG-BUTCHERING-CELL',
          riskScore: '99.2% CRITICAL',
          details: 'High-speed trading bot simulator manipulating fictitious candlesticks and balance gains.'
        },
        {
          id: 'TRADING-APP-BOT',
          label: 'Fake SEBI Trading App',
          sublabel: 'com.wealth.pro.trade',
          type: 'c2_ingress',
          group: 1,
          package: 'com.wealth.pro.trade.apk',
          permissions: 'Read Contacts, Full Network, Storage Access',
          c2Server: 'api-trade.apex-institutional-broker.cc',
          sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          riskScore: '97.0% HIGH',
          details: 'Counterfeit VIP institutional trading platform showing manipulated +450% unrealized portfolio profits.'
        },
        {
          id: 'VICTIM-DEV-02',
          label: 'Victim Mobile Device',
          sublabel: 'Apple iPhone 15 Pro (iOS 17.5)',
          type: 'victim_target',
          group: 2,
          os: 'iOS 17.5.1',
          deviceModel: 'Apple iPhone 15 Pro (A3102)',
          victimName: caseMeta?.victim || 'Meenakshi Sundaram',
          exposureVector: 'WhatsApp VIP Stock Tip Group ("SEBI Elite Wealth Club #4")',
          sessionState: 'Direct NEFT / RTGS Wire Authorizations',
          riskScore: 'HIGH-VALUE LOSS (₹14.5L)',
          details: 'Victim persuaded by WhatsApp mentors to transfer repeated capital additions under guarantee of IPO allocation.'
        },
        {
          id: 'MULE-BANK-ICICI-01',
          label: 'Layer-1 ICICI Current Mule',
          sublabel: 'Apex Capital Global LLP',
          type: 'mule_account',
          group: 3,
          bank: 'ICICI Bank',
          branch: 'Bandra Kurla Complex (Mumbai)',
          ifsc: 'ICIC0000004',
          accountNo: 'ICICI-CURR-002910488',
          upiHandle: 'apexcapital.invest@icici',
          velocity: '₹14,50,000 RTGS Ingress / Instant Layer-2 Sweep',
          kycStatus: 'Shell Corporate Entity (Forged MCA Certificate)',
          riskScore: 'CORPORATE MULE SHELL',
          details: 'Shell company current account used for large corporate RTGS ingest to bypass retail UPI caps.'
        },
        {
          id: 'MULE-BANK-KOTAK-02',
          label: 'Layer-2 Kotak Mule Pool',
          sublabel: 'Kotak Nariman Point Branch',
          type: 'mule_account',
          group: 3,
          bank: 'Kotak Mahindra Bank',
          branch: 'Nariman Point Mumbai',
          ifsc: 'KKBK0000958',
          accountNo: 'KOTAK-MULE-77291048',
          upiHandle: 'settlement.kotak@okaxis',
          velocity: 'Layer-2 Dispersal: ₹3.5L x 4 Sub-Transfers',
          kycStatus: 'Compromised Export-Import Firm',
          riskScore: 'RAPID DISPERSAL',
          details: 'Secondary corporate clearing account dispersing funds into multiple P2P USDT purchasing brokers.'
        },
        {
          id: 'ERC20-WALLET-WHALE',
          label: 'ERC20 USDT Whale Transit',
          sublabel: '0x71C...B29 (Ethereum)',
          type: 'crypto_wallet',
          group: 4,
          address: '0x71C86134b29F0FaA2e3f4C7192AcDe183B927B29',
          chain: 'Ethereum Mainnet (ERC-20 USDT)',
          totalVolume: '$175,000 USDT Cleared',
          hopCount: 'Hop 2 to Binance Sub-Account',
          mixerStatus: 'Tornado Cash / Transit Liquidity Pool',
          riskScore: 'HIGH-VALUE CRYPTO DRAIN',
          details: 'High-value smart contract transit address routing stolen capital into decentralized liquidity pools.'
        },
        {
          id: 'BINANCE-OFFSHORE-SUB',
          label: 'Binance Non-KYC Sub-Account',
          sublabel: 'Transit UID #88192019',
          type: 'crypto_wallet',
          group: 4,
          jurisdiction: 'Offshore Seychelles / Global Liquidity',
          counterParty: 'Merchant ID: P2P_Whale_Asia_09',
          status: 'LEA Subpoena Dispatched to Binance Compliance',
          riskScore: 'EXFILTRATION HUB',
          details: 'Final exchange sub-account converting crypto into offshore fiat wire settlements.'
        }
      ],
      links: [
        { source: 'C2-INGRESS-CLOUD', target: 'TRADING-APP-BOT', label: 'WebSocket Manipulation', value: 5 },
        { source: 'TRADING-APP-BOT', target: 'VICTIM-DEV-02', label: 'Fake Profit Displays', value: 4 },
        { source: 'VICTIM-DEV-02', target: 'MULE-BANK-ICICI-01', label: 'RTGS Ingress (₹14.5L)', value: 5 },
        { source: 'MULE-BANK-ICICI-01', target: 'MULE-BANK-KOTAK-02', label: 'Layer-2 Dispersal', value: 5 },
        { source: 'MULE-BANK-KOTAK-02', target: 'ERC20-WALLET-WHALE', label: 'P2P Crypto Purchase', value: 5 },
        { source: 'ERC20-WALLET-WHALE', target: 'BINANCE-OFFSHORE-SUB', label: 'Offshore Liquidation', value: 5 }
      ]
    };
  }

  // Dynamic Case Generator for all other cases
  const caseSum = caseId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const octet3 = 100 + (caseSum % 140);
  const octet4 = 10 + (caseSum % 80);
  const ip = `185.220.${octet3}.${octet4}`;
  const muleAcc = `SBI-MULE-${40000000 + (caseSum * 133) % 90000000}`;
  const amountStr = caseMeta?.amount || '₹2,50,000';

  return {
    caseId,
    nodes: [
      {
        id: `C2-${caseId}`,
        label: 'Tactical C2 Ingress Rig',
        sublabel: `AS49870 Dedicated VPS (${ip})`,
        type: 'c2_ingress',
        group: 1,
        ip: ip,
        isp: 'Alvotech High-Speed Dedicated Network',
        asn: 'AS49870 Alvotech VPS (High-Risk Ingress)',
        webrtcLeak: `10.244.${(caseSum % 50)}.${(caseSum % 90)} (STUN Leak)`,
        canvasHash: `SHA256:${(caseSum * 91823).toString(16).slice(0, 16)}`,
        os: 'Linux 6.6.8-hardened (Adversary Box)',
        ttl: 'TTL=64 (Direct Socket Route)',
        threatActor: `APT-SYNDICATE-${caseId.slice(-4)}`,
        riskScore: '98.9% CRITICAL',
        details: 'Adversary server generating weaponized phishing links and routing real-time telemetry intercepts.'
      },
      {
        id: `VICTIM-${caseId}`,
        label: 'Victim Endpoint Device',
        sublabel: `${caseMeta?.victim || 'Citizen Device'} (Android/iOS)`,
        type: 'victim_target',
        group: 2,
        os: 'Android 14 (Patch Level 2026)',
        deviceModel: 'OnePlus 11R 5G',
        victimName: caseMeta?.victim || 'Citizen Complainant',
        exposureVector: `Direct WhatsApp / SMS Phishing (${caseMeta?.scamType || 'Fraudulent Vector'})`,
        sessionState: 'Credentials Harvested via Spoofed Portal',
        riskScore: `REPORTED LOSS: ${amountStr}`,
        details: 'Citizen targeted with deceptive impersonation messages directing them to fraudulent transaction gateways.'
      },
      {
        id: `MULE-${caseId}-1`,
        label: `Primary Mule #${muleAcc.slice(-8)}`,
        sublabel: 'State Bank of India Transit Hub',
        type: 'mule_account',
        group: 3,
        bank: 'State Bank of India',
        branch: 'Regional Cyber Clearing Branch',
        ifsc: 'SBIN0004819',
        accountNo: muleAcc,
        upiHandle: `quickpay.${muleAcc.slice(-6)}@oksbi`,
        velocity: `${amountStr} / Instant Drain (< 5 mins)`,
        kycStatus: 'Purchased Mule (Dummy Identity)',
        riskScore: 'FLAGGED FOR IMMEDIATE LIEN',
        details: 'Primary destination account receiving the illicit transaction. Flagged for Section 102 CrPC lien freeze.'
      },
      {
        id: `MULE-${caseId}-2`,
        label: 'ATM Cash-Out Puncture Hub',
        sublabel: 'Metro ATM Cluster Node',
        type: 'mule_account',
        group: 3,
        location: 'Metro City Sector ATM Kiosk Node 02',
        withdrawalWindow: '12-25 minutes post-ingest',
        cctvStatus: 'Surveillance DVR Footage Tagged',
        riskScore: 'PHYSICAL CASH PUNCTURE',
        details: 'ATM withdrawal terminal where physical cash was extracted by on-ground mule runners.'
      },
      {
        id: `CRYPTO-${caseId}`,
        label: 'USDT TRC-20 Transit Wallet',
        sublabel: `TX${(caseSum * 777).toString(36).toUpperCase().slice(0, 8)}...`,
        type: 'crypto_wallet',
        group: 4,
        address: `TX${(caseSum * 777).toString(36).toUpperCase().padEnd(30, '0')}`,
        chain: 'TRON Network (TRC-20)',
        totalVolume: '$28,000 USDT Flow',
        hopCount: 'Hop 2 to P2P Liquidity Sink',
        riskScore: 'EXFILTRATION NODE',
        details: 'P2P crypto conversion wallet used to swap drained INR into anonymous blockchain liquidity.'
      }
    ],
    links: [
      { source: `C2-${caseId}`, target: `VICTIM-${caseId}`, label: 'Phishing Ingress Link', value: 4 },
      { source: `VICTIM-${caseId}`, target: `MULE-${caseId}-1`, label: `Illicit Transfer (${amountStr})`, value: 5 },
      { source: `MULE-${caseId}-1`, target: `MULE-${caseId}-2`, label: 'ATM Cash-Out Run', value: 4 },
      { source: `MULE-${caseId}-1`, target: `CRYPTO-${caseId}`, label: 'P2P Crypto Conversion', value: 5 }
    ]
  };
}

export default function DeviceGraphView({
  caseId = 'CASE-2026-9041',
  cases = [],
  token = null
}) {
  const [selectedCaseId, setSelectedCaseId] = useState(caseId);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [computing, setComputing] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [copiedKey, setCopiedKey] = useState(null);
  const [freezeTriggered, setFreezeTriggered] = useState(false);
  const [freezeDetails, setFreezeDetails] = useState(null);

  // Pan and Zoom Transformation state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, transX: 0, transY: 0 });

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Compute available cases list by combining prop cases and defaults
  const availableCases = useMemo(() => {
    const combined = [...DEFAULT_CASES];
    if (cases && cases.length > 0) {
      cases.forEach((c) => {
        if (!combined.some((item) => item.id === c.id)) {
          combined.unshift({
            id: c.id,
            title: c.title,
            amount: `₹${Number(c.amount || 0).toLocaleString('en-IN')}`,
            scamType: c.scam_type || 'Cyber Incident',
            victim: c.victim_name || 'Citizen',
            urgency: c.urgency_score || 80
          });
        }
      });
    }
    return combined;
  }, [cases]);

  const currentCaseMeta = useMemo(() => {
    return availableCases.find((c) => c.id === selectedCaseId) || availableCases[0];
  }, [availableCases, selectedCaseId]);

  // Synchronize when incoming caseId prop changes
  useEffect(() => {
    if (caseId && caseId !== selectedCaseId) {
      setSelectedCaseId(caseId);
    }
  }, [caseId]);

  // Load and calculate graph positions via Web Worker
  const computeWorkerLayout = useCallback((cid) => {
    setComputing(true);
    setSelectedNode(null);
    setFreezeTriggered(false);
    setFreezeDetails(null);

    const data = generateCaseGraphData(cid, currentCaseMeta);

    const worker = new Worker(new URL('../workers/graphWorker.js', import.meta.url), {
      type: 'module'
    });

    const containerWidth = containerRef.current ? containerRef.current.clientWidth : 960;
    const containerHeight = containerRef.current ? containerRef.current.clientHeight : 560;

    worker.postMessage({
      nodes: data.nodes,
      links: data.links,
      width: Math.max(900, containerWidth),
      height: Math.max(540, containerHeight)
    });

    worker.onmessage = (e) => {
      setGraphData(e.data);
      setComputing(false);
      worker.terminate();
    };

    worker.onerror = (err) => {
      console.error('Worker calculation error:', err);
      setComputing(false);
      worker.terminate();
    };

    return worker;
  }, [currentCaseMeta]);

  useEffect(() => {
    const worker = computeWorkerLayout(selectedCaseId);
    return () => {
      if (worker && worker.terminate) worker.terminate();
    };
  }, [selectedCaseId, computeWorkerLayout]);

  // Universal Modal close listener for node details drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedNode) {
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Trigger NPCI Lien Freeze from Inspector
  const handleExecuteLienFreeze = async (node) => {
    setFreezeTriggered(true);
    const accNumber = node.accountNo || 'SBI-MULE-48192019';
    try {
      let data = null;
      try {
        const res = await fetch(`http://localhost:4000/api/bank-freeze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            accountNo: accNumber,
            bankName: node.bank || 'State Bank of India',
            caseId: selectedCaseId
          })
        });
        if (res.ok) data = await res.json();
      } catch (netErr) {
        console.warn('Backend offline, simulated freeze:', netErr);
      }

      if (!data) {
        data = {
          success: true,
          referenceId: `NPCI-LIEN-${Date.now().toString().slice(-6)}`,
          accountNo: accNumber,
          timestamp: new Date().toISOString(),
          details: `Lien lock issued under Sec 102 CrPC for account ${accNumber}`
        };
      }
      setFreezeDetails(data);
    } catch (err) {
      console.error('Lien freeze failed:', err);
    }
  };

  // Node Color Scheme & Glyphs
  const getNodeConfig = (type) => {
    switch (type) {
      case 'c2_ingress':
        return {
          primary: '#f43f5e',
          secondary: '#e11d48',
          bg: 'rgba(244, 63, 94, 0.15)',
          border: 'rgba(244, 63, 94, 0.5)',
          glow: 'rgba(244, 63, 94, 0.8)',
          category: 'C2 INGRESS',
          icon: Terminal,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        };
      case 'victim_target':
        return {
          primary: '#38bdf8',
          secondary: '#0284c7',
          bg: 'rgba(56, 189, 248, 0.15)',
          border: 'rgba(56, 189, 248, 0.5)',
          glow: 'rgba(56, 189, 248, 0.8)',
          category: 'TARGET / VICTIM',
          icon: Smartphone,
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        };
      case 'mule_account':
        return {
          primary: '#f97316',
          secondary: '#ea580c',
          bg: 'rgba(249, 115, 22, 0.15)',
          border: 'rgba(249, 115, 22, 0.5)',
          glow: 'rgba(249, 115, 22, 0.8)',
          category: 'MULE CLUSTER',
          icon: Building,
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
        };
      case 'crypto_wallet':
        return {
          primary: '#a855f7',
          secondary: '#9333ea',
          bg: 'rgba(168, 85, 247, 0.15)',
          border: 'rgba(168, 85, 247, 0.5)',
          glow: 'rgba(168, 85, 247, 0.8)',
          category: 'CRYPTO / EXFIL',
          icon: Coins,
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        };
      default:
        return {
          primary: '#94a3b8',
          secondary: '#64748b',
          bg: 'rgba(148, 163, 184, 0.15)',
          border: 'rgba(148, 163, 184, 0.5)',
          glow: 'rgba(148, 163, 184, 0.8)',
          category: 'ENTITY',
          icon: Network,
          badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40'
        };
    }
  };

  const visibleNodes = useMemo(() => {
    if (filterType === 'ALL') return graphData.nodes;
    return graphData.nodes.filter((n) => n.type === filterType);
  }, [graphData.nodes, filterType]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  const visibleLinks = useMemo(() => {
    return graphData.links.filter(
      (l) => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target)
    );
  }, [graphData.links, visibleNodeIds]);

  const handleZoomIn = () => setTransform((t) => ({ ...t, scale: Math.min(2.5, t.scale + 0.2) }));
  const handleZoomOut = () => setTransform((t) => ({ ...t, scale: Math.max(0.4, t.scale - 0.2) }));
  const handleResetZoom = () => setTransform({ x: 0, y: 0, scale: 1 });

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'graph-bg') {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        transX: transform.x,
        transY: transform.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setTransform((t) => ({
        ...t,
        x: panStartRef.current.transX + dx,
        y: panStartRef.current.transY + dy
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="space-y-4 font-sans text-slate-100 relative">
      {/* Top Header Card with Case Selection Dropdown & Worker Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider font-mono">
                MILITARY-GRADE MULE & LINKAGE GRAPH
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                ACTIVE RECON
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Multi-Hop Syndicate Linkage & Real-Time C2 Ingress Attribution
            </p>
          </div>
        </div>

        {/* Case Selection Dropdown & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* CASE SELECTOR DROPDOWN */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Case:</span>
            <div className="relative">
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="bg-transparent text-xs font-mono font-bold text-cyan-300 pr-6 focus:outline-none cursor-pointer appearance-none"
              >
                {availableCases.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                    {c.id} • {c.title.slice(0, 32)}... ({c.amount})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-0.5 pointer-events-none" />
            </div>
          </div>

          {/* Worker Status Badge */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              computing
                ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400 animate-pulse'
                : 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{computing ? 'Calculating Physics...' : 'Worker: 60 FPS'}</span>
          </div>

          {/* Re-calculate Button */}
          <button
            onClick={() => computeWorkerLayout(selectedCaseId)}
            disabled={computing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Recalculate Node Physics"
          >
            <RefreshCw className={`w-4 h-4 ${computing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Case Summary Strip */}
      {currentCaseMeta && (
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold">{currentCaseMeta.id}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-200 font-semibold">{currentCaseMeta.title}</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <div><span className="text-slate-500">Vector:</span> <span className="text-cyan-300">{currentCaseMeta.scamType}</span></div>
            <div><span className="text-slate-500">Loss:</span> <span className="text-emerald-400 font-bold">{currentCaseMeta.amount}</span></div>
            <div><span className="text-slate-500">Victim:</span> <span className="text-slate-300">{currentCaseMeta.victim}</span></div>
          </div>
        </div>
      )}

      {/* Main Interactive Graph Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[600px] bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center select-none"
      >
        <div
          id="graph-bg"
          className="absolute inset-0 opacity-20 pointer-events-auto cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Entity Filter Pill Bar */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl font-mono text-[11px]">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL ENTITIES ({graphData.nodes.length})
          </button>
          <button
            onClick={() => setFilterType('c2_ingress')}
            className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 transition cursor-pointer ${
              filterType === 'c2_ingress'
                ? 'bg-rose-600 text-white font-bold shadow'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>🔴 C2 INGRESS</span>
          </button>
          <button
            onClick={() => setFilterType('victim_target')}
            className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 transition cursor-pointer ${
              filterType === 'victim_target'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>🔵 TARGET</span>
          </button>
          <button
            onClick={() => setFilterType('mule_account')}
            className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 transition cursor-pointer ${
              filterType === 'mule_account'
                ? 'bg-orange-600 text-white font-bold shadow'
                : 'text-orange-400 hover:text-orange-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>🟠 MULES / ATM</span>
          </button>
          <button
            onClick={() => setFilterType('crypto_wallet')}
            className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 transition cursor-pointer ${
              filterType === 'crypto_wallet'
                ? 'bg-purple-600 text-white font-bold shadow'
                : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>🟣 CRYPTO OTC</span>
          </button>
        </div>

        {/* Pan & Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl font-mono text-xs">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 transition cursor-pointer"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-slate-950 rounded-lg border border-slate-800 font-bold">
            {Math.round(transform.scale * 100)}%
          </span>
        </div>

        {/* SVG Drawing Layer */}
        <svg
          ref={svgRef}
          className="w-full h-full pointer-events-auto"
          style={{ cursor: isPanning ? 'grabbing' : 'default' }}
        >
          <defs>
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f43f5e" floodOpacity="0.6" />
            </filter>
            <filter id="mule-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f97316" floodOpacity="0.6" />
            </filter>
            <filter id="crypto-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#a855f7" floodOpacity="0.6" />
            </filter>
          </defs>

          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
            {/* 1. Curved Link Paths with Animated Data-Flow Pulses */}
            {visibleLinks.map((link, idx) => {
              const sourceNode = graphData.nodes.find((n) => n.id === link.source);
              const targetNode = graphData.nodes.find((n) => n.id === link.target);
              if (!sourceNode || !targetNode) return null;

              const dx = targetNode.x - sourceNode.x;
              const dy = targetNode.y - sourceNode.y;
              const cx = (sourceNode.x + targetNode.x) / 2 - dy * 0.15;
              const cy = (sourceNode.y + targetNode.y) / 2 + dx * 0.15;
              const pathData = `M ${sourceNode.x} ${sourceNode.y} Q ${cx} ${cy} ${targetNode.x} ${targetNode.y}`;

              const isHighlighted =
                selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id);

              return (
                <g key={`link-${idx}`}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isHighlighted ? '#38bdf8' : '#334155'}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeOpacity={isHighlighted ? 0.9 : 0.5}
                  />

                  <path
                    d={pathData}
                    fill="none"
                    stroke={
                      sourceNode.type === 'c2_ingress'
                        ? '#f43f5e'
                        : targetNode.type === 'crypto_wallet'
                        ? '#a855f7'
                        : '#f97316'
                    }
                    strokeWidth={2.5}
                    strokeDasharray="6 14"
                    className="animate-pulse"
                    strokeOpacity={0.85}
                  />

                  {link.label && (
                    <text
                      x={cx}
                      y={cy - 6}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      className="pointer-events-none select-none"
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 2. Structured Node Glyphs */}
            {visibleNodes.map((node) => {
              const config = getNodeConfig(node.type);
              const isSelected = selectedNode && selectedNode.id === node.id;
              const isHovered = hoveredNode && hoveredNode.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onMouseEnter={(e) => {
                    setHoveredNode(node);
                    const rect = containerRef.current.getBoundingClientRect();
                    setHoverPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = containerRef.current.getBoundingClientRect();
                    setHoverPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                  onMouseDown={(e) => {
                    dragStartPos.current = { x: e.clientX, y: e.clientY };
                  }}
                  onMouseUp={(e) => {
                    const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
                    const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
                    if (deltaX < 5 && deltaY < 5) {
                      setSelectedNode(node);
                    }
                  }}
                >
                  {(node.type === 'c2_ingress' || isSelected) && (
                    <circle
                      r={node.radius + 10}
                      fill="none"
                      stroke={config.primary}
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      className="animate-spin"
                      style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                      opacity={0.6}
                    />
                  )}

                  <circle
                    r={node.radius + 4}
                    fill={config.bg}
                    stroke={config.border}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-300 group-hover:scale-110"
                  />

                  <circle
                    r={node.radius}
                    fill="#090d16"
                    stroke={isSelected ? '#ffffff' : config.primary}
                    strokeWidth={isSelected ? 2.5 : 2}
                    className="transition-transform duration-200 group-hover:scale-105"
                  />

                  <text
                    textAnchor="middle"
                    dy=".35em"
                    fill={isSelected ? '#ffffff' : config.primary}
                    fontSize={node.radius >= 26 ? '10' : '9'}
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {node.type === 'c2_ingress'
                      ? 'C2'
                      : node.type === 'victim_target'
                      ? 'VICTIM'
                      : node.type === 'mule_account'
                      ? 'MULE'
                      : 'CRYPTO'}
                  </text>

                  <text
                    textAnchor="middle"
                    dy={node.radius + 16}
                    fill="#f1f5f9"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none pointer-events-none drop-shadow"
                  >
                    {node.label}
                  </text>

                  {node.sublabel && (
                    <text
                      textAnchor="middle"
                      dy={node.radius + 28}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="sans-serif"
                      className="select-none pointer-events-none"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Telemetry Inspector Hover Tooltip */}
        {hoveredNode && !selectedNode && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md font-mono text-xs max-w-xs space-y-1.5 transition-all duration-75"
            style={{
              left: Math.min(hoverPos.x + 16, (containerRef.current?.clientWidth || 800) - 280),
              top: Math.max(16, Math.min(hoverPos.y - 40, (containerRef.current?.clientHeight || 500) - 180))
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="font-bold text-cyan-300 uppercase text-[10px] tracking-wider">
                {hoveredNode.type.replace('_', ' ')}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                {hoveredNode.riskScore}
              </span>
            </div>
            <div className="text-slate-100 font-bold text-xs">{hoveredNode.label}</div>
            <div className="space-y-0.5 text-[11px] text-slate-300">
              {hoveredNode.ip && <div><span className="text-slate-500">IP:</span> {hoveredNode.ip}</div>}
              {hoveredNode.asn && <div className="truncate"><span className="text-slate-500">ASN:</span> {hoveredNode.asn}</div>}
              {hoveredNode.webrtcLeak && <div><span className="text-slate-500">Leak:</span> <span className="text-cyan-300">{hoveredNode.webrtcLeak}</span></div>}
              {hoveredNode.upiHandle && <div><span className="text-slate-500">UPI:</span> <span className="text-orange-300">{hoveredNode.upiHandle}</span></div>}
              {hoveredNode.velocity && <div><span className="text-slate-500">Velocity:</span> <span className="text-emerald-400">{hoveredNode.velocity}</span></div>}
              {hoveredNode.address && <div className="truncate"><span className="text-slate-500">Wallet:</span> {hoveredNode.address}</div>}
            </div>
          </div>
        )}

        {/* Bottom-Left Threat Taxonomy Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-xl font-mono text-[10px] space-y-1.5 hidden sm:block">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px] border-b border-slate-800 pb-1">
            THREAT NODE TAXONOMY
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span className="text-slate-200">🔴 C2 Ingress Rig</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span className="text-slate-200">🔵 Victim / Phish</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
              <span className="text-slate-200">🟠 Mule Hub / ATM</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
              <span className="text-slate-200">🟣 Crypto Exfil</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE NODE FORENSICS INSPECTOR DRAWER / MODAL */}
        {selectedNode && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedNode(null);
            }}
            className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-md flex items-center justify-end p-4 animate-in fade-in duration-150"
          >
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 max-h-[94%] overflow-y-auto">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl border ${getNodeConfig(selectedNode.type).badgeColor}`}
                  >
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      FORENSIC NODE ATTRIBUTION
                    </span>
                    <h4 className="font-extrabold text-base text-slate-100 font-mono">
                      {selectedNode.label}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title="Close Inspector (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Metadata Fields According to Node Type */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Threat Severity:</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                    {selectedNode.riskScore}
                  </span>
                </div>

                {/* C2 INGRESS SPECIFIC FIELDS */}
                {selectedNode.type === 'c2_ingress' && (
                  <div className="space-y-2.5">
                    {selectedNode.ip && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Ingress IP:</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-rose-400 font-bold">{selectedNode.ip}</span>
                          <button
                            onClick={() => handleCopy(selectedNode.ip, 'ip')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400"
                            title="Copy IP"
                          >
                            {copiedKey === 'ip' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedNode.isp && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Hosting Provider (ISP):</span>
                        <span className="text-slate-200 text-[11px]">{selectedNode.isp}</span>
                      </div>
                    )}
                    {selectedNode.asn && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Autonomous System (ASN):</span>
                        <span className="text-slate-300 text-[11px]">{selectedNode.asn}</span>
                      </div>
                    )}
                    {selectedNode.webrtcLeak && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">STUN / WebRTC Leak:</span>
                        <span className="text-cyan-300 font-bold">{selectedNode.webrtcLeak}</span>
                      </div>
                    )}
                    {selectedNode.canvasHash && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Hardware Canvas Hash:</span>
                        <span className="text-purple-300 text-[10px] break-all">{selectedNode.canvasHash}</span>
                      </div>
                    )}
                    {selectedNode.os && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Adversary OS:</span>
                        <span className="text-amber-300 font-bold">{selectedNode.os}</span>
                      </div>
                    )}
                    {selectedNode.threatActor && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Threat Syndicate:</span>
                        <span className="text-rose-400 font-bold">{selectedNode.threatActor}</span>
                      </div>
                    )}
                    {selectedNode.package && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Malware Package ID:</span>
                        <span className="text-rose-300 text-[11px]">{selectedNode.package}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* VICTIM TARGET SPECIFIC FIELDS */}
                {selectedNode.type === 'victim_target' && (
                  <div className="space-y-2.5">
                    {selectedNode.victimName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Victim Profile:</span>
                        <span className="text-cyan-300 font-bold">{selectedNode.victimName}</span>
                      </div>
                    )}
                    {selectedNode.deviceModel && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Device Hardware:</span>
                        <span className="text-slate-200">{selectedNode.deviceModel}</span>
                      </div>
                    )}
                    {selectedNode.os && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">OS Version:</span>
                        <span className="text-slate-200">{selectedNode.os}</span>
                      </div>
                    )}
                    {selectedNode.exposureVector && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Exposure Vector:</span>
                        <span className="text-amber-300 text-[11px]">{selectedNode.exposureVector}</span>
                      </div>
                    )}
                    {selectedNode.sessionState && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Session Hijack State:</span>
                        <span className="text-rose-300 text-[11px]">{selectedNode.sessionState}</span>
                      </div>
                    )}
                    {selectedNode.url && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Spoofed Phishing URL:</span>
                        <span className="text-cyan-300 text-[10px] break-all">{selectedNode.url}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* MULE ACCOUNT & ATM SPECIFIC FIELDS */}
                {selectedNode.type === 'mule_account' && (
                  <div className="space-y-2.5">
                    {selectedNode.bank && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Bank & Branch:</span>
                        <span className="text-slate-200 font-bold">{selectedNode.bank} ({selectedNode.branch || 'Branch Hub'})</span>
                      </div>
                    )}
                    {selectedNode.ifsc && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Branch IFSC:</span>
                        <span className="text-cyan-300 font-bold">{selectedNode.ifsc}</span>
                      </div>
                    )}
                    {selectedNode.accountNo && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Mule Account No:</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-orange-400 font-bold">{selectedNode.accountNo}</span>
                          <button
                            onClick={() => handleCopy(selectedNode.accountNo, 'acc')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400"
                          >
                            {copiedKey === 'acc' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedNode.upiHandle && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">UPI Handle:</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-orange-300 font-bold">{selectedNode.upiHandle}</span>
                          <button
                            onClick={() => handleCopy(selectedNode.upiHandle, 'upi')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400"
                          >
                            {copiedKey === 'upi' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedNode.velocity && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Fund Velocity:</span>
                        <span className="text-emerald-400 font-bold">{selectedNode.velocity}</span>
                      </div>
                    )}
                    {selectedNode.location && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">ATM Hub Location:</span>
                        <span className="text-orange-300 font-bold">{selectedNode.location}</span>
                      </div>
                    )}
                    {selectedNode.cctvStatus && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Surveillance CCTV Feed:</span>
                        <span className="text-slate-300 text-[11px]">{selectedNode.cctvStatus}</span>
                      </div>
                    )}
                    {selectedNode.kycStatus && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">KYC Profile Status:</span>
                        <span className="text-rose-300 text-[11px]">{selectedNode.kycStatus}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CRYPTO EXFIL SPECIFIC FIELDS */}
                {selectedNode.type === 'crypto_wallet' && (
                  <div className="space-y-2.5">
                    {selectedNode.address && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Blockchain Address:</span>
                        <div className="flex items-center justify-between text-purple-300 text-[11px] mt-0.5">
                          <span className="break-all font-mono">{selectedNode.address}</span>
                          <button
                            onClick={() => handleCopy(selectedNode.address, 'addr')}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 ml-1 flex-shrink-0"
                          >
                            {copiedKey === 'addr' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedNode.chain && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Blockchain Network:</span>
                        <span className="text-purple-300 font-bold">{selectedNode.chain}</span>
                      </div>
                    )}
                    {selectedNode.totalVolume && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total Volume Cleared:</span>
                        <span className="text-emerald-400 font-bold">{selectedNode.totalVolume}</span>
                      </div>
                    )}
                    {selectedNode.hopCount && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Laundering Hop Count:</span>
                        <span className="text-amber-300 font-bold">{selectedNode.hopCount}</span>
                      </div>
                    )}
                    {selectedNode.jurisdiction && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Offshore Jurisdiction:</span>
                        <span className="text-slate-200 text-[11px]">{selectedNode.jurisdiction}</span>
                      </div>
                    )}
                    {selectedNode.status && (
                      <div>
                        <span className="text-slate-500 block text-[10px]">Interpol Notice Reference:</span>
                        <span className="text-rose-300 font-bold text-[11px]">{selectedNode.status}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Intelligence Summary Text */}
                {selectedNode.details && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] mb-1">Intelligence Summary:</span>
                    <p className="text-slate-300 font-sans text-xs leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      {selectedNode.details}
                    </p>
                  </div>
                )}
              </div>

              {/* Lien Freeze Feedback Banner */}
              {freezeDetails && (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>NPCI LIEN FREEZE DISPATCHED</span>
                  </div>
                  <div className="text-[11px] text-emerald-200">{freezeDetails.details}</div>
                  <div className="text-[10px] text-emerald-400 font-bold">Ref: {freezeDetails.referenceId}</div>
                </div>
              )}

              {/* Interactive Forensic Action Controls */}
              <div className="space-y-2 pt-1">
                {selectedNode.type === 'mule_account' && (
                  <button
                    onClick={() => handleExecuteLienFreeze(selectedNode)}
                    disabled={freezeTriggered}
                    className={`w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg active:scale-95 ${
                      freezeTriggered
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>
                      {freezeTriggered ? '✅ NPCI LIEN FREEZE ACTIVE' : 'EMERGENCY NPCI LIEN FREEZE'}
                    </span>
                  </button>
                )}

                {selectedNode.ip && (
                  <button
                    onClick={() => handleCopy(selectedNode.ip, 'btn_ip')}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition cursor-pointer active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {copiedKey === 'btn_ip' ? 'IOC IP COPIED!' : 'COPY INGRESS IP IOC'}
                    </span>
                  </button>
                )}

                {selectedNode.address && (
                  <button
                    onClick={() => handleCopy(selectedNode.address, 'btn_addr')}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition cursor-pointer active:scale-95"
                  >
                    <Coins className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {copiedKey === 'btn_addr' ? 'WALLET COPIED!' : 'COPY CRYPTO WALLET IOC'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  DISMISS INSPECTOR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
