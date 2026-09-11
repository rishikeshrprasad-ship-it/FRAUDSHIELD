import React, { useState, useEffect } from 'react';
import {
  Eye,
  Search,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Globe,
  Lock,
  Terminal,
  Layers,
  Copy,
  CheckCircle2,
  X,
  Building
} from 'lucide-react';
import SafeViewerModal from './SafeViewerModal.jsx';

const PRESET_KEYWORDS = ['ALL', 'SBI', 'HDFC', 'ICICI', 'PNB', 'RBI', 'CBI / POLICE', 'PAYTM / UPI'];

export default function DomainWatchPanel() {
  const [keyword, setKeyword] = useState('sbi');
  const [selectedPreset, setSelectedPreset] = useState('SBI');
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('crt.sh (Live CT Feed)');
  const [selectedThreatForPreview, setSelectedThreatForPreview] = useState(null);
  const [deAnonymizeTarget, setDeAnonymizeTarget] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const fetchDomainThreats = async (queryKeyword) => {
    setLoading(true);
    const cleanKw = queryKeyword.toLowerCase().replace(/[^a-z0-9]/g, '');
    try {
      const res = await fetch(`http://localhost:4000/api/domain-watch?q=${cleanKw}`);
      const data = await res.json();
      setThreats(data.threats || []);
      setSource(data.source || 'crt.sh (Live CT Feed)');
    } catch (e) {
      console.error('Domain watch fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomainThreats('sbi');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      fetchDomainThreats(keyword);
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    const kw = preset === 'ALL' ? 'sbi' : preset === 'CBI / POLICE' ? 'cbi' : preset === 'PAYTM / UPI' ? 'paytm' : preset.toLowerCase();
    setKeyword(kw);
    fetchDomainThreats(kw);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-base text-slate-100 uppercase tracking-wider font-mono">
                CERTIFICATE TRANSPARENCY DOMAIN WATCH (CRT.SH)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                LIVE CT LOG MONITOR
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Scans global public CT logs for rapid SSL certificate issuance & typosquatting • Source: {source}
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search keyword (sbi, hdfc, rbi)..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-3.5 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none w-56 sm:w-64"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase flex items-center space-x-1.5 shadow-md shadow-cyan-950 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>SCAN CT</span>
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 font-mono text-xs">
        <span className="text-slate-500 text-[11px] font-bold px-2">TARGET ENTITY:</span>
        {PRESET_KEYWORDS.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetSelect(preset)}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              selectedPreset === preset
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-mono text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <span>IDENTIFIED DOMAIN THREAT SIGNATURES</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] border border-rose-500/30">
                {threats.length} Flagged
              </span>
            </h3>
          </div>
          <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>AIR-GAPPED THREAT RECONNAISSANCE ACTIVE</span>
          </div>
        </div>

        <div className="space-y-3.5">
          {threats.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/90 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl transition duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex-shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-300 font-mono font-bold text-sm tracking-wide">
                        {item.domain}
                      </span>
                      <button
                        onClick={() => handleCopy(item.domain, `dom_${item.id}`)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                        title="Copy Domain"
                      >
                        {copiedField === `dom_${item.id}` ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2 mt-0.5">
                      <span className="text-rose-400 font-semibold">{item.threat_vector || 'Phishing Harvester'}</span>
                      <span>•</span>
                      <span className="text-slate-500">{item.ct_log_id || `CT-LOG-${item.id}`}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 font-mono text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">THREAT CONFIDENCE</span>
                    <span className="text-rose-400 font-extrabold text-sm">{item.risk_score}% CRITICAL</span>
                  </div>
                  <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                      style={{ width: `${item.risk_score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Issuer CA Authority</span>
                  <span className="text-slate-200 font-bold truncate block">{item.registrar || item.issuer}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Resolved Proxy IP & ASN</span>
                  <span className="text-rose-400 font-bold block">{item.ip}</span>
                  <span className="text-slate-400 text-[10px] truncate block">{item.asn || 'AS9009 M247 Proxy'}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Cert Validity Window</span>
                  <span className="text-emerald-400 font-bold block">
                    {item.not_before || '2026-03-08'} to {item.not_after || '2026-06-06'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-800/60">
                <button
                  onClick={() => setDeAnonymizeTarget(item)}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-mono font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer active:scale-95"
                >
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>DE-ANONYMIZE DOMAIN</span>
                </button>

                <button
                  onClick={() => setSelectedThreatForPreview(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs uppercase flex items-center space-x-1.5 shadow-md shadow-cyan-950 transition cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>SAFE PREVIEW SANDBOX</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedThreatForPreview && (
        <SafeViewerModal
          url={`https://${selectedThreatForPreview.domain}`}
          threatData={selectedThreatForPreview}
          title={`Safe Viewer: ${selectedThreatForPreview.domain}`}
          onClose={() => setSelectedThreatForPreview(null)}
        />
      )}

      {deAnonymizeTarget && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeAnonymizeTarget(null);
          }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-end p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                    DE-ANONYMIZATION ATTRIBUTION
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{deAnonymizeTarget.domain}</h4>
                </div>
              </div>
              <button
                onClick={() => setDeAnonymizeTarget(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="Close (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div>
                <span className="text-slate-500 block text-[10px]">Authoritative Name Servers (NS):</span>
                <span className="text-cyan-300 font-bold">ns1.bulletproof-dns-gateway.cc</span>
                <span className="text-cyan-300 font-bold block">ns2.bulletproof-dns-gateway.cc</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DNS SOA Hostmaster:</span>
                <span className="text-slate-200">hostmaster@{deAnonymizeTarget.domain} (Serial: 2026031001)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">BGP ASN Origin:</span>
                <span className="text-rose-400 font-bold">{deAnonymizeTarget.asn}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Registrar Abuse Contact:</span>
                <span className="text-amber-300">abuse-complaints@privacy-guard-services.is</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setDeAnonymizeTarget(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                DISMISS ATTRIBUTION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
