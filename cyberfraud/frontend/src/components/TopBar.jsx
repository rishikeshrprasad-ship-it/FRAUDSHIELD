import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, Clock, IndianRupee } from 'lucide-react';
import CaseStatusTimeline from './CaseStatusTimeline.jsx';

export default function VictimTracker({ cases }) {
  const [query, setQuery] = useState('');
  const [foundCase, setFoundCase] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    const clean = query.trim().toLowerCase();
    const result = cases.find(
      (c) =>
        c.id.toLowerCase() === clean ||
        (c.victim_contact && c.victim_contact.includes(clean))
    );
    setFoundCase(result || null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Victim Investigation & Lien Status Tracker
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Track live police claim, NPCI lien, and unfreeze progress
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">Enter Case Reference ID or Mobile Number</label>
          <input
            type="text"
            required
            placeholder="e.g. CASE-2026-9041 or +91 98765 43210"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950 transition"
        >
          <Search className="w-4 h-4" />
          <span>TRACK CASE INTERCEPTION STATUS</span>
        </button>
      </form>

      {/* Result Display */}
      {searched && (
        foundCase ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold">{foundCase.id}</span>
                <h3 className="font-bold text-base">{foundCase.title}</h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold uppercase">
                {foundCase.status}
              </span>
            </div>

            <CaseStatusTimeline status={foundCase.status} />

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
              <div>Assigned Officer: <span className="text-amber-400 font-bold">{foundCase.claimed_by_name || 'In Queue'}</span></div>
              <div>Reported Loss: <span className="text-emerald-400 font-bold">₹{Number(foundCase.amount).toLocaleString('en-IN')}</span></div>
              <div>Location: <span className="text-slate-200">{foundCase.location_name}</span></div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs font-mono text-slate-400">
            ⚠️ No case record found matching query "{query}". Please check the Case ID.
          </div>
        )
      )}
    </div>
  );
}
