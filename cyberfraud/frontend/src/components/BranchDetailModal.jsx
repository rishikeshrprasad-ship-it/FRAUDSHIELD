import React, { useEffect } from 'react';
import { X, Building, ShieldAlert, Phone, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function BranchDetailModal({ branch, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && branch) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [branch, onClose]);

  if (!branch) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">{branch.name}</h3>
              <p className="text-xs text-slate-400 font-mono">Branch ID: {branch.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex justify-between">
            <span className="text-slate-500">Duress Intercept Status:</span>
            <span className="font-bold text-emerald-400">{branch.duressStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Patrol Officers Nearby:</span>
            <span className="font-bold text-cyan-400">{branch.officersNear} Units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">GPS Coordinates:</span>
            <span className="text-slate-300">{branch.lat}, {branch.lng}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-950 transition"
        >
          CLOSE BRANCH DESK
        </button>
      </div>
    </div>
  );
}
