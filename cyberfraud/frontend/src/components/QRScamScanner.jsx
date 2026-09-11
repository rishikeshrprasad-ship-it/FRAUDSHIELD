import React, { useState } from 'react';
import { QrCode, Search, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';
import { checkFrontendLinkRisk } from '../utils/linkRiskCheck.js';

export default function QRScamScanner() {
  const [scanInput, setScanInput] = useState('https://sbi-kyc-update-portal.com/claim-reward');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = checkFrontendLinkRisk(scanInput);
      setScanResult(res);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Phishing Link & Reverse QR Scam Scanner
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Instant URL, UPI QR code, and APK signature risk analysis
            </p>
          </div>
        </div>
      </div>

      {/* Scanner Form */}
      <form onSubmit={handleScan} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">Enter URL, QR Code Text, or APK Package ID</label>
          <input
            type="text"
            required
            placeholder="Paste link e.g. https://sebi-verified-stock-trade.online"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950 transition"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'ANALYZING RISK THREAT...' : 'SCAN PHISHING LINK / QR'}</span>
        </button>
      </form>

      {/* Scan Result */}
      {scanResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Risk Score:</span>
              <span className="font-extrabold text-sm text-rose-400">{scanResult.riskScore} / 100</span>
            </div>
            <span className={`px-3 py-1 rounded-lg font-bold ${scanResult.riskScore >= 75 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
              {scanResult.category}
            </span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div className="font-bold text-cyan-400">Scanned URL: {scanResult.url}</div>
            <div>
              <span className="text-slate-500 block mb-1">Identified Risk Factors:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                {scanResult.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
