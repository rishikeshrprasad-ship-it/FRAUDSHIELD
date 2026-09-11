import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function UrgencyMeter({ score = 50, isPredicting = false }) {
  // Skeleton Fallback Requirement: Add early return if (isPredicting) { return <SkeletonFallback />; }
  if (isPredicting) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton width={120} height={18} baseColor="#0f172a" highlightColor="#1e293b" />
          <Skeleton circle width={24} height={24} baseColor="#0f172a" highlightColor="#1e293b" />
        </div>
        <Skeleton height={12} borderRadius={6} baseColor="#0f172a" highlightColor="#1e293b" />
        <div className="flex justify-between">
          <Skeleton width={80} height={14} baseColor="#0f172a" highlightColor="#1e293b" />
          <Skeleton width={60} height={14} baseColor="#0f172a" highlightColor="#1e293b" />
        </div>
      </div>
    );
  }

  let colorClass = 'from-cyan-500 to-teal-400 text-cyan-400';
  let badgeLabel = 'LOW RISK';
  let Icon = ShieldCheck;

  if (score >= 80) {
    colorClass = 'from-rose-600 to-amber-500 text-rose-400';
    badgeLabel = 'CRITICAL URGENCY';
    Icon = AlertTriangle;
  } else if (score >= 50) {
    colorClass = 'from-amber-500 to-yellow-400 text-amber-400';
    badgeLabel = 'HIGH RISK';
    Icon = Zap;
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
            Threat Urgency Score
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase border border-slate-700 bg-slate-950 ${colorClass}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400">0% (Low)</span>
        <span className="font-extrabold text-slate-100 text-sm">{score} / 100</span>
        <span className="text-slate-400">100% (Critical)</span>
      </div>
    </div>
  );
}
