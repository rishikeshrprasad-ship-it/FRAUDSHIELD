import React, { useState, useEffect } from 'react';
import { Eye, Search, AlertTriangle, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import SafeViewerModal from './SafeViewerModal.jsx';

export default function DomainWatchPanel() {
  const [keyword, setKeyword] = useState('sbi');
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('crt.sh');
  const [selectedSafeUrl, setSelectedSafeUrl] = useState(null);

  const fetchDomainThreats = async (queryKeyword) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/domain-watch?q=${queryKeyword}`);
      const data = await res.json();
      setThreats(data.threats || []);
      setSource(data.source || 'crt.sh');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomainThreats('sbi');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDomainThreats(keyword);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Certificate Transparency Domain Watch (crt.sh)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Scans crt.sh logs for banking spoofing (sbi, pnb, rbi) • Source: {source}
            </p>
          </div>
        </div>

        {/* Keyword Search Form */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search keyword (sbi, pnb, rbi)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase flex items-center space-x-1 shadow-md shadow-cyan-950 transition"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>SCAN</span>
          </button>
        </form>
      </div>

      {/* Threats Table / Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Identified Domain Threat Signatures ({threats.length})</span>
          <span className="text-cyan-400">SAFE VIEWER SANDBOX ENABLED</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-3">Domain Name</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Proxy IP</th>
                <th className="py-3 px-3">Registrar / Issuer</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {threats.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/50 transition">
                  <td className="py-3 px-3 text-cyan-300 font-bold">{item.domain}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                      {item.risk_score} / 100
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{item.ip}</td>
                  <td className="py-3 px-3 text-slate-400 truncate max-w-[150px]">{item.registrar}</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setSelectedSafeUrl(`https://${item.domain}`)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center space-x-1 border border-slate-700 transition"
                    >
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                      <span>SAFE PREVIEW</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safe Viewer Sandbox Modal */}
      {selectedSafeUrl && (
        <SafeViewerModal
          url={selectedSafeUrl}
          title="Domain Watch Safe Viewer"
          onClose={() => setSelectedSafeUrl(null)}
        />
      )}
    </div>
  );
}
