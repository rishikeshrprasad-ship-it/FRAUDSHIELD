import React from 'react';
import { Radio, Navigation, CheckCircle2 } from 'lucide-react';

export default function OfficerLocationShare({ isSharing, onToggleShare }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl max-w-md">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-xl border ${isSharing ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
          <Radio className={`w-5 h-5 ${isSharing ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <h4 className="font-bold text-xs text-slate-100 uppercase font-mono">Field Officer Live GPS Broadcaster</h4>
          <p className="text-[11px] text-slate-400">Socket.io 1Hz Location Pulse to Command Map</p>
        </div>
      </div>

      <button
        onClick={onToggleShare}
        className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition flex items-center space-x-1.5 ${
          isSharing
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
        }`}
      >
        <Navigation className="w-3.5 h-3.5" />
        <span>{isSharing ? 'BROADCASTING' : 'START GPS'}</span>
      </button>
    </div>
  );
}
