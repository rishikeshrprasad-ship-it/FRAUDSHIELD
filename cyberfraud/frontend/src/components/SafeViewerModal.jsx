import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  ExternalLink,
  AlertTriangle,
  Globe,
  Terminal,
  Layers,
  Copy,
  CheckCircle2,
  EyeOff
} from 'lucide-react';

export default function SafeViewerModal({ url, threatData = null, title, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  // Universal Keyboard Escape Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && url) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [url, onClose]);

  if (!url) return null;

  let domainName = url;
  try {
    domainName = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch (e) {
    domainName = url.split('/')[0];
  }
  const data = threatData || {
    domain: domainName,
    ip: '185.220.101.5',
    asn: 'AS9009 M247 Ltd (Tor Exit / High Risk Proxy)',
    registrar: "Let's Encrypt Authority E6",
    issuer: "C=US, O=Let's Encrypt, CN=E6",
    ct_log_id: 'CT-LOG-14892019842',
    risk_score: 96,
    threat_vector: 'NetBanking Phishing Ingress'
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-100 uppercase tracking-wider font-mono">
                  AIR-GAPPED SECURITY SANDBOX
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  ISOLATED
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {data.risk_score}% THREAT
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-mono truncate max-w-xl mt-0.5">
                Target: {data.domain} • Host IP: {data.ip}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Close Viewer (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Policy Status Strip */}
        <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex-shrink-0 font-mono text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-200">{data.domain}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">{data.threat_vector}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-amber-400">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Scripts & Sockets Neutralized</span>
          </div>
        </div>

        {/* Content Body: Streamlined Sandbox View */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
          {/* Sanitized Browser Address Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between font-mono text-xs shadow-inner">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 pl-2">|</span>
              <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-rose-400">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold">https://{data.domain}/login</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
              AIR-GAP CONTAINER
            </span>
          </div>

          {/* Isolated DOM Preview Container */}
          <div className="border border-slate-800 rounded-2xl p-6 bg-slate-950/80 relative space-y-4 overflow-hidden">
            <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              {/* Fake Header Branding */}
              <div className="text-center space-y-1 pb-3 border-b border-slate-800">
                <div className="inline-block p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-100">
                  Online Account Verification
                </h3>
                <p className="text-[11px] text-rose-400 font-mono">
                  Deceptive Landing Page Template Detected
                </p>
              </div>

              {/* Harvest Form Fields (Neutralized) */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">
                    User ID / Customer Number:
                  </label>
                  <input
                    type="text"
                    disabled
                    value="48192019842"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">
                    Password / Profile PIN:
                  </label>
                  <input
                    type="password"
                    disabled
                    value="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">
                    Authentication OTP:
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="Intercept Endpoint Active"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-900/50 text-rose-400 placeholder:text-rose-600/60 cursor-not-allowed"
                  />
                </div>

                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-rose-600/50 text-white font-bold text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>ACTION DISABLED IN SANDBOX</span>
                </button>
              </div>
            </div>

            {/* Essential Host Attribution Metadata */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 font-mono text-xs space-y-2">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>IDENTIFIED THREAT HOST TELEMETRY</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div><span className="text-slate-500">Origin IP:</span> <span className="text-rose-400 font-bold">{data.ip}</span></div>
                <div><span className="text-slate-500">BGP ASN:</span> <span className="text-amber-300 truncate block">{data.asn}</span></div>
                <div><span className="text-slate-500">Issuer CA:</span> <span className="text-slate-200">{data.registrar || data.issuer}</span></div>
                <div><span className="text-slate-500">CT Ref:</span> <span className="text-slate-400">{data.ct_log_id || 'CT-LOG-ACTIVE'}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0 font-mono text-xs">
          <div className="text-[11px] text-slate-500">
            Esc to Dismiss • Strict Air-Gap Protection
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase transition cursor-pointer"
          >
            DISMISS VIEWER
          </button>
        </div>
      </div>
    </div>
  );
}
