import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, ExternalLink, ShieldCheck, Radio } from 'lucide-react';
import SafeViewerModal from './SafeViewerModal.jsx';

export default function RecruitmentWatchPanel({ socket }) {
  const [ads, setAds] = useState([]);
  const [selectedSafeUrl, setSelectedSafeUrl] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/mule-ads')
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch((err) => console.error(err));

    if (!socket) return;

    const handleNewAd = (newAd) => {
      setAds((prev) => [newAd, ...prev]);
    };

    socket.on('recruitment:new', handleNewAd);

    return () => {
      socket.off('recruitment:new', handleNewAd);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Mule Recruitment Ad Watch & Syndicate Tracker
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Background scanner emitting live <span className="text-cyan-400 font-bold">recruitment:new</span> socket alerts
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map((ad) => (\n          <div
            key={ad.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl hover:border-amber-500/50 transition"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                {ad.platform}
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                Risk Score: {ad.risk_score}/100
              </span>
            </div>

            <h3 className="font-bold text-slate-100 text-sm leading-snug">{ad.title}</h3>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-xs text-slate-400">
              <div>Contact Handle: <span className="text-cyan-300 font-bold">{ad.contact}</span></div>
              <div>Payout Structure: <span className="text-emerald-400 font-bold">{ad.payout}</span></div>
            </div>

            <button
              onClick={() => setSelectedSafeUrl(`https://t.me/s/${ad.contact.replace('@', '')}`)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center space-x-1.5 border border-slate-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>INSPECT IN SANDBOX MODAL</span>
            </button>
          </div>
        ))}
      </div>

      {selectedSafeUrl && (
        <SafeViewerModal
          url={selectedSafeUrl}
          title="Mule Ad Sandbox Inspector"
          onClose={() => setSelectedSafeUrl(null)}
        />
      )}
    </div>
  );
}
