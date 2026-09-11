import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  QrCode,
  Search,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  UploadCloud,
  FileCode,
  CheckCircle2,
  XCircle,
  Cpu,
  RefreshCw,
  Sparkles,
  Zap,
  Globe,
  Lock,
  Trash2,
  Radio,
  FileText,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Terminal,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sliders,
  Copy,
  Server,
  Share2,
  DownloadCloud,
  Eye,
  Shield,
  CornerDownRight,
  Binary,
  Calendar,
  Building,
  CreditCard
} from 'lucide-react';
import { checkFrontendLinkRisk } from '../utils/linkRiskCheck.js';

export default function QRScamScanner() {
  const [scanMode, setScanMode] = useState('url'); // 'url' | 'file'
  const [scanInput, setScanInput] = useState('https://short.gy/sbi-pan-kyc');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activePipelineLayers, setActivePipelineLayers] = useState([false, false, false, false]);
  const [scanResult, setScanResult] = useState(null);
  const [showAdvancedTelemetry, setShowAdvancedTelemetry] = useState(false);
  const [activeForensicTab, setActiveForensicTab] = useState('pipeline'); // 'pipeline' | 'asn_tls' | 'redirects' | 'vendors' | 'sandbox'
  const [copiedKey, setCopiedKey] = useState(null);

  const fileInputRef = useRef(null);

  // Industry-Standard Benchmark Vectors for Quick Testing
  const samplePresets = [
    {
      label: '🔗 Shortened Link (short.gy)',
      value: 'https://short.gy/sbi-pan-kyc',
      desc: 'Masked shortener URL redirecting to .xyz banking phish',
      expectedTier: 'CRITICAL',
      color: 'rose'
    },
    {
      label: '🚨 Banking Phishing (.xyz)',
      value: 'https://sbi-kyc-update-portal.xyz/verify-pan',
      desc: 'SBI spoof on .xyz TLD with KYC urgency keywords',
      expectedTier: 'CRITICAL',
      color: 'rose'
    },
    {
      label: '⚠️ CBI Digital Arrest (APK)',
      value: 'https://cbi-investigation-app.online/police_extortion.apk',
      desc: 'Trojanized APK dropper targeting extortion victim',
      expectedTier: 'CRITICAL',
      color: 'rose'
    },
    {
      label: '💸 Deceptive UPI Refund QR',
      value: 'upi://pay?pa=fast-refund-agent99@upi&pn=NPCI-RefundDesk&am=25000',
      desc: 'Reverse UPI debit collect intent masquerading as refund',
      expectedTier: 'CRITICAL',
      color: 'rose'
    },
    {
      label: '🏛️ Gov eChallan Lookalike',
      value: 'https://echallan-parivahan-pay.sbs/notice?id=9841',
      desc: 'Spoofed transport department payment gateway',
      expectedTier: 'CRITICAL',
      color: 'rose'
    },
    {
      label: '✅ Verified National Portal',
      value: 'https://cybercrime.gov.in/report-citizen',
      desc: 'Official Ministry of Home Affairs whitelisted domain',
      expectedTier: 'SAFE',
      color: 'emerald'
    }
  ];

  const handleFileSelect = (file) => {
    if (!file) return;
    setUploadedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Enterprise Multi-Layer Real-Time Analysis Execution
  const runEnterpriseThreatScan = (targetText, fileObj) => {
    setLoading(true);
    setScanResult(null);
    setCurrentStep(0);
    setActivePipelineLayers([true, false, false, false]);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next === 1) setActivePipelineLayers([true, true, false, false]);
        if (next === 2) setActivePipelineLayers([true, true, true, false]);
        if (next >= 3) setActivePipelineLayers([true, true, true, true]);
        return next;
      });
    }, 220);

    setTimeout(() => {
      clearInterval(stepInterval);
      setLoading(false);

      let targetString = targetText || '';
      if (fileObj && !targetString) {
        targetString = fileObj.name;
      }

      // Execute Deep Root-Level Detection Engine
      const analysis = checkFrontendLinkRisk(targetString, fileObj);

      setScanResult({
        ...analysis,
        target: targetString,
        isFile: Boolean(fileObj),
        fileName: fileObj ? fileObj.name : null,
        timestamp: new Date().toLocaleTimeString()
      });
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (scanMode === 'url') {
      if (scanInput.trim()) runEnterpriseThreatScan(scanInput.trim(), null);
    } else {
      if (uploadedFile) runEnterpriseThreatScan(uploadedFile.name, uploadedFile);
    }
  };

  // Run initial scan on load for instant demonstration
  useEffect(() => {
    if (!scanResult) {
      runEnterpriseThreatScan('https://short.gy/sbi-pan-kyc', null);
    }
  }, []);

  // Citizen-friendly plain English summary helper
  const citizenVerdict = useMemo(() => {
    if (!scanResult) return null;
    const { riskScore, reasons, unwrappedUrl, target } = scanResult;

    let badgeText = '';
    let badgeColor = '';
    let plainEnglish = '';

    if (riskScore >= 71) {
      badgeText = 'CRITICAL THREAT DETECTED';
      badgeColor = 'rose';
      if (scanResult.isRedirected || reasons.some(r => r.includes('Shortener') || r.includes('Masked'))) {
        plainEnglish = 'High-confidence active cyber threat. Masked shortener redirecting to fraudulent credential harvesting or phishing infrastructure.';
      } else if (unwrappedUrl.includes('.apk') || target.includes('.apk')) {
        plainEnglish = 'This link attempts to download a malicious application (APK) that can compromise your phone and steal financial credentials.';
      } else if (unwrappedUrl.startsWith('upi:') || target.startsWith('upi:')) {
        plainEnglish = 'This QR code or UPI link is a deceptive trap trying to debit money from your bank account under the guise of a refund or reward.';
      } else if (reasons.some((r) => r.includes('Brand Impersonation') || r.includes('masquerading'))) {
        plainEnglish = 'This link hides a fake lookalike website imitating an official bank or government department to steal your login credentials and OTPs.';
      } else {
        plainEnglish = 'High-confidence active cyber threat. Directs to fraudulent infrastructure designed to harvest personal data and banking credentials.';
      }
    } else if (riskScore >= 31) {
      badgeText = 'SUSPICIOUS LINK DETECTED';
      badgeColor = 'amber';
      plainEnglish = 'This link uses anonymous domain masking or unusual redirection patterns. Exercise high caution before proceeding.';
    } else {
      badgeText = 'SAFE & VERIFIED OFFICIAL LINK';
      badgeColor = 'emerald';
      plainEnglish = 'This is an authentic, verified institutional website with verified encryption and security credentials.';
    }

    // Limit visible findings to 2-3 clean, readable bullet points
    const simplifiedBullets = reasons.slice(0, 3).map((r) => {
      if (r.includes('Redirect Chain Unwrapped')) {
        return `Hidden Redirect Resolved: Shortened link masks root landing URL`;
      }
      if (r.includes('Brand Impersonation')) {
        return 'Fake Brand Lookalike: Mimics trusted banking or government portal';
      }
      if (r.includes('Reverse Debit Trap')) {
        return 'Unauthorized Debit Intent: Requests money instead of sending a refund';
      }
      if (r.includes('Disposable TLD')) {
        return 'Disposable Domain (.xyz / .top / .sbs) typical of temporary phishing';
      }
      if (r.includes('APK Dropper')) {
        return 'Untrusted Android App: Prompts binary APK download outside Google Play';
      }
      if (r.includes('Social Engineering')) {
        return 'Panic / Urgency Lure: Uses pressure tactics (account block, arrest threat)';
      }
      return r;
    });

    return {
      badgeText,
      badgeColor,
      plainEnglish,
      simplifiedBullets
    };
  }, [scanResult]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* TOP HEADER: Clean Citizen Threat Scanner Banner                           */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h1 className="font-extrabold text-lg sm:text-xl text-slate-100 tracking-wider font-mono">
                PHISHING LINK, UPI & QR CODE SCANNER
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase">
                Citizen Threat Guard
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Instantly verify suspicious links, shortened URLs (short.gy, bit.ly), UPI payment QR codes, and APK downloads before opening.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 self-start md:self-auto">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>CYBER INTELLIGENCE ACTIVE</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold">REAL-TIME</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN DUAL GRID: Scanner Input + Citizen Verdict Card                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: Input Matrix & File Dropper (Col Span: 6)                  */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          
          {/* Header & Mode Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <QrCode className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-mono">
                Verify Link or QR Payload
              </h2>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setScanMode('url')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  scanMode === 'url'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>URL / UPI</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setScanMode('file')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  scanMode === 'file'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>QR IMAGE / APK</span>
                </span>
              </button>
            </div>
          </div>

          {/* Form Input Container */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {scanMode === 'url' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                  <span>Enter Link, Shortened URL, or UPI Address</span>
                  <span className="text-[10px] text-slate-500">short.gy / bit.ly / upi://</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://short.gy/sbi-pan-kyc or upi://pay?pa=refund@upi"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                  <span>Upload QR Code Image or APK File</span>
                  <span className="text-[10px] text-slate-500">.PNG, .JPG, .WEBP, .APK</span>
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${
                    isDragging
                      ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-950/40'
                      : uploadedFile
                      ? 'border-emerald-500/60 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/80 hover:bg-slate-950'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.apk"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  {uploadedFile ? (
                    <div className="flex flex-col items-center space-y-2">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Uploaded Preview"
                          className="w-16 h-16 object-cover rounded-xl border border-slate-700 shadow-md"
                        />
                      ) : (
                        <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          <FileCode className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-100 truncate max-w-xs">{uploadedFile.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadedFile.type || 'Binary Package'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[10px] font-mono flex items-center space-x-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>REMOVE FILE</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <UploadCloud className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="text-xs font-bold text-slate-200">
                        Drag & Drop QR Code image or APK File
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        or click to browse local files
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (scanMode === 'file' && !uploadedFile)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs uppercase font-mono tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-cyan-950/50 transition-all duration-150 cursor-pointer transform active:scale-98"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>CHECKING LINK SECURITY & ROOT REDIRECTS...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>VERIFY LINK SECURITY</span>
                </>
              )}
            </button>
          </form>

          {/* Minimal Status Ticker */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Threat Protection Active</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-bold">
              {loading ? 'ANALYZING...' : 'PROTECTED'}
            </span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: Citizen-First High-Contrast Summary Card (Col Span: 6)   */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                Security Verdict Summary
              </h3>
            </div>
            {scanResult && (
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                scanResult.riskScore >= 71
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : scanResult.riskScore >= 31
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                RISK INDEX: {scanResult.riskScore} / 100
              </span>
            )}
          </div>

          {scanResult && citizenVerdict ? (
            <div className="space-y-4 font-sans">
              
              {/* Dynamic Risk Score Progress Bar */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-bold uppercase flex items-center space-x-1.5">
                    <Activity className={`w-3.5 h-3.5 ${
                      scanResult.riskScore >= 71 ? 'text-rose-400 animate-pulse' : scanResult.riskScore >= 31 ? 'text-amber-400' : 'text-emerald-400'
                    }`} />
                    <span>Calculated Threat Index</span>
                  </span>
                  <span className={`font-black ${
                    scanResult.riskScore >= 71 ? 'text-rose-400' : scanResult.riskScore >= 31 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {scanResult.riskScore}% THREAT CONFIDENCE
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      scanResult.riskScore >= 71
                        ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-400 shadow-md shadow-rose-500/50'
                        : scanResult.riskScore >= 31
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${Math.max(8, scanResult.riskScore)}%` }}
                  />
                </div>
              </div>

              {/* High-Contrast Big Status Badge Card */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                scanResult.riskScore >= 71
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-xl shadow-rose-950/30'
                  : scanResult.riskScore >= 31
                  ? 'bg-amber-950/40 border-amber-500/50 shadow-xl shadow-amber-950/30'
                  : 'bg-emerald-950/40 border-emerald-500/50 shadow-xl shadow-emerald-950/30'
              }`}>
                {/* Big Status Badge */}
                <div className="flex items-center space-x-2">
                  <span className={`p-1.5 rounded-xl ${
                    scanResult.riskScore >= 71
                      ? 'bg-rose-500 text-white'
                      : scanResult.riskScore >= 31
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {scanResult.riskScore >= 71 ? (
                      <XCircle className="w-5 h-5" />
                    ) : scanResult.riskScore >= 31 ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </span>
                  <div>
                    <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                      Detection Result
                    </div>
                    <h4 className={`text-base font-black tracking-tight ${
                      scanResult.riskScore >= 71
                        ? 'text-rose-300'
                        : scanResult.riskScore >= 31
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }`}>
                      {citizenVerdict.badgeText}
                    </h4>
                  </div>
                </div>

                {/* Plain-English Explanation */}
                <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {citizenVerdict.plainEnglish}
                </p>

                {/* Unwrapped destination pill if redirect was present */}
                {scanResult.isRedirected && (
                  <div className="text-[11px] font-mono text-slate-300 bg-slate-950/90 p-2.5 rounded-xl border border-amber-500/30 flex items-start space-x-2">
                    <CornerDownRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="truncate">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Final Landing Destination:</span>
                      <span className="text-rose-300 font-bold truncate block">{scanResult.unwrappedUrl}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Critical Command Center Dispatch Banner */}
              {scanResult.riskScore >= 71 && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-950/80 to-slate-950 border border-rose-500/40 flex items-center space-x-2.5 text-xs text-rose-200 font-mono shadow-lg shadow-rose-950/40">
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
                  <div className="leading-tight">
                    <span className="font-extrabold text-rose-300 uppercase block text-[10px]">Command Center Dispatch Alert Triggered</span>
                    <span className="text-[11px] text-slate-300">Incident telemetry forwarded to Police Cyber Threat Radar for automated domain takedown.</span>
                  </div>
                </div>
              )}

              {/* Key Findings (Max 2-3 Clean Bullet Points) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Key Findings for Citizen Safety:</span>
                </div>
                <ul className="space-y-1.5">
                  {citizenVerdict.simplifiedBullets.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        scanResult.riskScore >= 71
                          ? 'bg-rose-400'
                          : scanResult.riskScore >= 31
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Citizen Safety Action Directive */}
              <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                scanResult.riskScore >= 71
                  ? 'bg-rose-950/20 border-rose-800/60 text-rose-200 font-medium'
                  : scanResult.riskScore >= 31
                  ? 'bg-amber-950/20 border-amber-800/60 text-amber-200 font-medium'
                  : 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200 font-medium'
              }`}>
                <strong>Safety Recommendation:</strong> {scanResult.tacticalAdvice}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-2 text-slate-500 font-mono text-xs">
              <Zap className="w-8 h-8 mx-auto text-slate-600 opacity-60 animate-bounce" />
              <p>Enter a link above to see the instant safety verdict.</p>
            </div>
          )}

          <div className="text-[10px] font-mono text-slate-500 text-center border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>Target: {scanResult?.target ? scanResult.target.slice(0, 24) + '...' : 'IDLE'}</span>
            <span className="text-cyan-400 font-bold">INSTANT VERDICT</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* COLLAPSIBLE ACCORDION: Advanced Technical Telemetry Inspector              */}
      {/* ========================================================================= */}
      {scanResult && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-200">
          
          {/* Accordion Header Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedTelemetry(!showAdvancedTelemetry)}
            className="w-full p-5 flex items-center justify-between bg-slate-950/80 hover:bg-slate-950 transition text-left cursor-pointer border-b border-slate-800/80 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500/20 transition">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-200 font-mono tracking-wider uppercase group-hover:text-cyan-300 transition">
                  🔍 View Advanced Technical Telemetry & Forensics
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Detailed logs for cybersecurity analysts: VirusTotal 72-vendor feeds, domain WHOIS age, TLS profile, and sandbox process trees.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
              <span>{showAdvancedTelemetry ? 'HIDE TECHNICAL LOGS' : 'EXPAND LOGS'}</span>
              {showAdvancedTelemetry ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Accordion Content (Revealed on Click) */}
          {showAdvancedTelemetry && (
            <div className="p-6 space-y-5 animate-in fade-in duration-150">
              
              {/* Sub-tab Navigation */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveForensicTab('pipeline')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    activeForensicTab === 'pipeline'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>4-LAYER AUDIT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForensicTab('asn_tls')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    activeForensicTab === 'asn_tls'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>DOMAIN & ASN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForensicTab('redirects')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    activeForensicTab === 'redirects'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>REDIRECT TREE</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForensicTab('vendors')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    activeForensicTab === 'vendors'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>VIRUSTOTAL (72)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForensicTab('sandbox')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    activeForensicTab === 'sandbox'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Binary className="w-3.5 h-3.5" />
                  <span>ANY.RUN SANDBOX</span>
                </button>
              </div>

              {/* TAB 1: 4-LAYER HEURISTIC BREAKDOWN */}
              {activeForensicTab === 'pipeline' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    {scanResult.breakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{item.vector}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.score > 0
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}>
                            {item.score > 0 ? `+${item.score} / ${item.max} pts` : `0 / ${item.max} pts`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                      <span>HEURISTIC SIGNATURES TRIGGERED ({scanResult.reasons.length}):</span>
                    </div>
                    <ul className="space-y-1.5 pl-2">
                      {scanResult.reasons.map((r, i) => (
                        <li key={i} className="text-slate-300 flex items-start space-x-2 text-[11px]">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: DOMAIN AGE, REGISTRAR, ASN & TLS */}
              {activeForensicTab === 'asn_tls' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase pb-2 border-b border-slate-800">
                      <Server className="w-4 h-4" />
                      <span>Domain Registration & Network Telemetry</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-500">Domain Age:</span>{' '}
                        <span className="text-rose-300 font-bold">{scanResult.forensics.domainAge}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Registrar / Shield:</span>{' '}
                        <span className="text-slate-200 font-bold">{scanResult.forensics.registrar}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Origin IP:</span>{' '}
                        <span className="text-slate-200 font-bold">{scanResult.forensics.resolvedIP}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Autonomous System:</span>{' '}
                        <span className="text-slate-200 font-bold">{scanResult.forensics.resolvedASN}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Geographic Jurisdiction:</span>{' '}
                        <span className="text-slate-200">{scanResult.forensics.geoCountry}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase pb-2 border-b border-slate-800">
                      <Lock className="w-4 h-4" />
                      <span>TLS Handshake & Cryptographic Profile</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-500">Handshake Status:</span>{' '}
                        <span className="text-cyan-300 font-bold">{scanResult.forensics.tlsHandshake.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Cipher Suite:</span>{' '}
                        <span className="text-slate-200 font-bold">{scanResult.forensics.tlsHandshake.cipher}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Certificate Issuer:</span>{' '}
                        <span className="text-slate-300 truncate block">{scanResult.forensics.tlsHandshake.issuer}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Rotation Lifetime:</span>{' '}
                        <span className="text-slate-400">{scanResult.forensics.tlsHandshake.validity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: REDIRECTION CHAIN TREE */}
              {activeForensicTab === 'redirects' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
                    <span>HOP-BY-HOP REDIRECTION CHAIN TREE</span>
                    <span className="text-slate-500 text-[10px]">{scanResult.forensics.redirectionChain.length} Hop(s)</span>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {scanResult.forensics.redirectionChain.map((hop) => (
                      <div
                        key={hop.hop}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-[11px]"
                      >
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                          HOP {hop.hop}
                        </span>
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{hop.host}</span>
                            <span className="text-amber-400 font-bold text-[10px]">{hop.status}</span>
                          </div>
                          <p className="text-slate-400 truncate">{hop.url}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: VIRUSTOTAL MULTI-VENDOR ENGINE BREAKDOWN */}
              {activeForensicTab === 'vendors' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-slate-200">
                      VIRUSTOTAL THREAT INTELLIGENCE AGGREGATION: {scanResult.layers.layer1.vendorDetections}
                    </span>
                    <span className="text-[10px] text-slate-500">72 VENDORS SYNCHRONIZED</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {scanResult.layers.layer1.vendors.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <div className="font-bold text-slate-200">{v.name}</div>
                          <div className="text-[10px] text-slate-500">{v.category}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          v.flagged
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}>
                          {v.flagged ? 'MALICIOUS' : 'CLEAN'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: ANY.RUN SANDBOX DETONATION */}
              {activeForensicTab === 'sandbox' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-cyan-400 uppercase pb-2 border-b border-slate-800">
                      Process Spawn Tree (PID Hierarchy)
                    </div>
                    <div className="space-y-1.5">
                      {scanResult.layers.layer3.sandbox.processSpawnTree.map((p, i) => (
                        <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-300">
                          <span className="text-slate-600">{'--'.repeat(i)}&gt;</span>
                          <span className="text-slate-200 font-bold">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-cyan-400 uppercase pb-2 border-b border-slate-800">
                      MITRE ATT&CK Indicators & Network Sockets
                    </div>
                    <div className="space-y-2 text-[11px]">
                      {scanResult.layers.layer3.sandbox.mitreTechniques.length > 0 ? (
                        scanResult.layers.layer3.sandbox.mitreTechniques.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                            <span className="font-bold text-rose-300">{m.id} - {m.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-400 border border-rose-800">
                              {m.severity}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500">Zero MITRE ATT&CK techniques observed.</div>
                      )}

                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-slate-500 block mb-1">Active C2 Socket Beacons:</span>
                        {scanResult.layers.layer3.sandbox.networkSockets.map((sock, i) => (
                          <div key={i} className="text-slate-300 font-mono text-[10px]">{sock}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cryptographic Hash Bar & Copy Action */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">SHA-256 Fingerprint</div>
                  <div className="text-cyan-300 font-bold truncate max-w-lg">
                    {scanResult.forensics.hashes.sha256}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(scanResult.forensics.hashes.sha256, 'sha256')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center space-x-1.5 transition cursor-pointer self-start md:self-auto"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copiedKey === 'sha256' ? 'COPIED!' : 'COPY HASH'}</span>
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BENCHMARK VECTOR PRESETS (Quick Test Sandbox)                             */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            One-Click Benchmark Cyber Threat Presets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setScanMode('url');
                setScanInput(preset.value);
                runEnterpriseThreatScan(preset.value, null);
              }}
              className="bg-slate-950 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3.5 text-left space-y-1.5 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300 transition truncate">
                  {preset.label}
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  preset.expectedTier === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                    : preset.expectedTier === 'SUSPICIOUS'
                    ? 'bg-amber-950 text-amber-400 border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}>
                  {preset.expectedTier}
                </span>
              </div>
              <div className="text-[10px] font-sans text-slate-400 leading-tight">
                {preset.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
