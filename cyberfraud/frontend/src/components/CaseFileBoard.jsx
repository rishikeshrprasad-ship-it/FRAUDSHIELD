import React, { useState } from 'react';
import { ShieldAlert, Lock, IndianRupee, MapPin, Clock, Search, Filter, ChevronRight, AlertTriangle } from 'lucide-react';
import SLATimer from './SLATimer.jsx';

export default function CaseFileBoard({ cases, onSelectCase, onClaimCase, currentRole }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = cases.filter((c) => {
    const matchesStatus =
      filterStatus === 'ALL' || c.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.scam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.victim_name && c.victim_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div>
          <h2 className="font-extrabold text-lg text-slate-100 tracking-wider flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>LIVE INCIDENT COMMAND BOARD</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Direct Police Claiming Enabled • Real-Time Interception Stream
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, title, victim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-48 font-mono"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            {['ALL', 'PENDING', 'CLAIMED', 'FROZEN'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterStatus === st
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => {
          const isPending = c.status === 'pending';
          const isHighUrgency = (c.urgency_score || 0) >= 80;

          return (
            <div
              key={c.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between transition hover:border-cyan-500/50 ${
                isHighUrgency ? 'border-rose-800/80 shadow-rose-950/20' : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                {/* Case Top Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isPending
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : c.status === 'claimed'
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <SLATimer deadlineISO={c.sla_deadline} />
                </div>

                {/* Case Title */}
                <h3 className="font-bold text-slate-100 text-base leading-snug">{c.title}</h3>

                {/* Fraud Amount & Scam Type */}
                <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-emerald-400 font-bold text-sm flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                    {Number(c.amount).toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400 font-semibold">{c.scam_type}</span>
                </div>

                {/* Description Truncation Requirement: line-clamp-3 overflow-hidden text-ellipsis */}
                <p className="text-xs text-slate-400 line-clamp-3 overflow-hidden text-ellipsis leading-relaxed">
                  {c.description}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[11px] font-mono text-slate-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                  <span className="truncate max-w-[120px]">{c.location_name}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {isPending && currentRole !== 'CITIZEN' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClaimCase(c.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-1 shadow-md shadow-cyan-950 transition"
                    >
                      <Lock className="w-3 h-3" />
                      <span>CLAIM</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectCase(c)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition flex items-center"
                    title="View Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
