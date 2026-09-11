import React, { useState } from 'react';
import { ShieldAlert, Lock, IndianRupee, MapPin, Clock, Search, Filter, ChevronRight, AlertTriangle, Calendar } from 'lucide-react';

export function formatCaseTimestamp(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    
    return `${day}-${month}-${year}, ${formattedHours}:${minutes} ${ampm}`;
  } catch (e) {
    return String(dateStr);
  }
}

export default function CaseFileBoard({ cases, onSelectCase, onClaimCase, currentRole }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const SCAM_TYPE_OPTIONS = [
    { value: 'ALL', label: 'ALL TYPES' },
    { value: 'Digital Arrest / Impersonation', label: 'Digital Arrest / Impersonation' },
    { value: 'Mule P2P Trap', label: 'Mule P2P Trap' },
    { value: 'UPI / Refund Fraud', label: 'UPI / Refund Fraud' },
    { value: 'General Lien Contest', label: 'General Lien Contest' }
  ];

  const filteredCases = cases.filter((c) => {
    const matchesStatus =
      filterStatus === 'ALL' || (c.status && c.status.toLowerCase() === filterStatus.toLowerCase());

    const matchesType =
      filterType === 'ALL' ||
      (c.scam_type && c.scam_type.toLowerCase() === filterType.toLowerCase()) ||
      (filterType === 'Digital Arrest / Impersonation' && (c.scam_type?.toLowerCase().includes('digital arrest') || c.scam_type?.toLowerCase().includes('impersonation') || c.title?.toLowerCase().includes('arrest'))) ||
      (filterType === 'Mule P2P Trap' && (c.scam_type?.toLowerCase().includes('mule') || c.scam_type?.toLowerCase().includes('p2p') || c.title?.toLowerCase().includes('mule') || c.title?.toLowerCase().includes('p2p'))) ||
      (filterType === 'UPI / Refund Fraud' && (c.scam_type?.toLowerCase().includes('upi') || c.scam_type?.toLowerCase().includes('refund') || c.title?.toLowerCase().includes('upi') || c.title?.toLowerCase().includes('refund'))) ||
      (filterType === 'General Lien Contest' && (c.scam_type?.toLowerCase().includes('lien') || c.scam_type?.toLowerCase().includes('contest') || c.scam_type?.toLowerCase().includes('appeal') || c.title?.toLowerCase().includes('lien')));

    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (c.id && c.id.toLowerCase().includes(term)) ||
      (c.title && c.title.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term)) ||
      (c.location_name && c.location_name.toLowerCase().includes(term)) ||
      (c.scam_type && c.scam_type.toLowerCase().includes(term)) ||
      (c.victim_name && c.victim_name.toLowerCase().includes(term)) ||
      (c.victim_contact && c.victim_contact.toLowerCase().includes(term));

    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
        <div>
          <h2 className="font-extrabold text-lg text-slate-100 tracking-wider flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>LIVE INCIDENT COMMAND BOARD</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Direct Police Claiming Enabled • Real-Time Interception Stream
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Case ID, keyword, location, or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition shadow-inner"
            />
          </div>

          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer shadow-inner"
            >
              {SCAM_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            {['ALL', 'PENDING', 'CLAIMED', 'FROZEN'].map((st) => (\n              <button\n                key={st}\n                type="button"\n                onClick={() => setFilterStatus(st)}\n                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${\n                  filterStatus === st\n                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/60'\n                    : 'text-slate-400 hover:text-slate-200'\n                }`}\n              >\n                {st}\n              </button>\n            ))}
          </div>
        </div>
      </div>

      {(searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL') && (
        <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Showing <strong className="text-cyan-400">{filteredCases.length}</strong> of {cases.length} incidents</span>
            {filterType !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                Type: {filterType}
              </span>
            )}
            {filterStatus !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                Status: {filterStatus}
              </span>
            )}
          </div>
          {(searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterType('ALL');
                setFilterStatus('ALL');
              }}
              className="text-cyan-400 hover:text-cyan-300 underline text-[11px] cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {filteredCases.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-8 h-8 text-cyan-400/40" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-bold text-base text-slate-200">
              No matching cases found for your search criteria.
            </h3>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Try adjusting your keyword query, clearing case-type filters, or switching the status selector.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setFilterType('ALL');
              setFilterStatus('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-cyan-300 font-mono text-xs transition cursor-pointer"
          >
            Clear All Filters & Show All Cases
          </button>
        </div>
      ) : (
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
                <div className="flex items-center justify-between gap-2">
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
                  
                  <div
                    className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg font-mono shadow-sm flex-shrink-0"
                    title="Case Registration Date & Time"
                  >
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{formatCaseTimestamp(c.created_at || c.createdAt || c.incident_date_time || c.incidentDateTime)}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-100 text-base leading-snug">{c.title}</h3>

                <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-emerald-400 font-bold text-sm flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                    {Number(c.amount).toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400 font-semibold">{c.scam_type}</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 overflow-hidden text-ellipsis leading-relaxed">
                  {c.description}
                </p>
              </div>

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
      )}
    </div>
  );
}
