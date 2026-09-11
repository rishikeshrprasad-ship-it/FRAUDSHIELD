import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShieldAlert,
  CheckCircle2,
  Clock,
  IndianRupee,
  Phone,
  User,
  MapPin,
  Lock,
  Zap,
  Radio,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import CaseStatusTimeline from './CaseStatusTimeline.jsx';

const BACKEND_URL = 'http://localhost:4000';

const STATUS_CONFIG = {
  pending: {
    label: 'Submitted & Ingested',
    tier: 'CRITICAL / INTAKE',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dotColor: 'bg-rose-400',
    desc: 'Case received in Central Triage. Automated urgency scoring calculated.'
  },
  claimed: {
    label: 'Assigned to Cyber Cell Officer',
    tier: 'ACTIVE INVESTIGATION',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dotColor: 'bg-amber-400',
    desc: 'Designated law enforcement officer actively conducting evidence triage.'
  },
  frozen: {
    label: 'NPCI Bank Lien Executed',
    tier: 'INTERCEPTION ACTIVE',
    badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dotColor: 'bg-indigo-400',
    desc: 'Emergency debit freeze placed on suspect mule accounts across partner clearing nodes.'
  },
  escalated: {
    label: 'FIR Formalized & Asset Recovery',
    tier: 'JUDICIAL ESCALATION',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dotColor: 'bg-purple-400',
    desc: 'Formal court petition and inter-state police jurisdictional warrants dispatched.'
  },
  resolved: {
    label: 'Resolved & Restitution Initiated',
    tier: 'CLOSED / RESTITUTED',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    desc: 'Victim restitution finalized and fraudulent transactions safely reversed.'
  }
};

const deduplicateCases = (arr) => {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
};

export default function VictimTracker({ cases: initialCases = [], socket }) {
  const [caseList, setCaseList] = useState(() => deduplicateCases(initialCases));
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [searched, setSearched] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [livePulse, setLivePulse] = useState(false);

  const SCAM_TYPE_OPTIONS = [
    { value: 'ALL', label: 'ALL TYPES' },
    { value: 'Digital Arrest / Impersonation', label: 'Digital Arrest / Impersonation' },
    { value: 'Mule P2P Trap', label: 'Mule P2P Trap' },
    { value: 'UPI / Refund Fraud', label: 'UPI / Refund Fraud' },
    { value: 'General Lien Contest', label: 'General Lien Contest' }
  ];

  // Sync initial cases from prop
  useEffect(() => {
    if (initialCases && initialCases.length > 0) {
      setCaseList(deduplicateCases(initialCases));
    }
  }, [initialCases]);

  // Fetch all cases directly from backend on mount or when refreshed
  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/cases`);
      if (res.ok) {
        const data = await res.json();
        setCaseList(deduplicateCases(data));
      }
    } catch (err) {
      console.warn('Failed to fetch cases from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialCases || initialCases.length === 0) {
      fetchCases();
    }
  }, []);

  // Socket.io real-time listeners for live updates
  useEffect(() => {
    if (!socket) return;

    const handleNewCase = (newCase) => {
      if (!newCase || !newCase.id) return;
      setCaseList((prev) => deduplicateCases([newCase, ...prev.filter((c) => c.id !== newCase.id)]));
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 2000);
    };

    const handleUpdatedCase = (updatedCase) => {
      if (!updatedCase || !updatedCase.id) return;
      setCaseList((prev) =>
        deduplicateCases(
          prev.map((c) => (c.id === updatedCase.id ? { ...c, ...updatedCase } : c))
        )
      );
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 2000);
    };

    socket.on('case:new', handleNewCase);
    socket.on('case:updated', handleUpdatedCase);

    return () => {
      socket.off('case:new', handleNewCase);
      socket.off('case:updated', handleUpdatedCase);
    };
  }, [socket]);

  // Dynamic filter for search query & case type dropdown
  const filteredCases = useMemo(() => {
    const rawClean = query.trim().toLowerCase();
    const cleanPhone = query.trim().toLowerCase().replace(/[\s\-\+\(\)]/g, '');

    return caseList.filter((c) => {
      // 1. Case Type Filter
      const matchesType =
        filterType === 'ALL' ||
        (c.scam_type && c.scam_type.toLowerCase() === filterType.toLowerCase()) ||
        (filterType === 'Digital Arrest / Impersonation' && (c.scam_type?.toLowerCase().includes('digital arrest') || c.scam_type?.toLowerCase().includes('impersonation') || c.title?.toLowerCase().includes('arrest'))) ||
        (filterType === 'Mule P2P Trap' && (c.scam_type?.toLowerCase().includes('mule') || c.scam_type?.toLowerCase().includes('p2p') || c.title?.toLowerCase().includes('mule') || c.title?.toLowerCase().includes('p2p'))) ||
        (filterType === 'UPI / Refund Fraud' && (c.scam_type?.toLowerCase().includes('upi') || c.scam_type?.toLowerCase().includes('refund') || c.title?.toLowerCase().includes('upi') || c.title?.toLowerCase().includes('refund'))) ||
        (filterType === 'General Lien Contest' && (c.scam_type?.toLowerCase().includes('lien') || c.scam_type?.toLowerCase().includes('contest') || c.scam_type?.toLowerCase().includes('appeal') || c.title?.toLowerCase().includes('lien')));

      // 2. Keyword Search (Matches ID, Title, Description, Location, Victim Name, Contact, Scam Type)
      const rawContact = (c.victim_contact || '').replace(/[\s\-\+\(\)]/g, '').toLowerCase();
      const contactMatch = rawContact && cleanPhone.length >= 3 && rawContact.includes(cleanPhone);
      const matchesSearch =
        !rawClean ||
        c.id?.toLowerCase().includes(rawClean) ||
        c.title?.toLowerCase().includes(rawClean) ||
        c.description?.toLowerCase().includes(rawClean) ||
        c.location_name?.toLowerCase().includes(rawClean) ||
        c.victim_name?.toLowerCase().includes(rawClean) ||
        c.scam_type?.toLowerCase().includes(rawClean) ||
        contactMatch;

      return matchesType && matchesSearch;
    });
  }, [query, filterType, caseList]);

  // Search Results helper (for multiple matches banner)
  const searchResults = useMemo(() => {
    if (!query.trim() && filterType === 'ALL') return [];
    return deduplicateCases(filteredCases);
  }, [query, filterType, filteredCases]);

  // Find currently inspected case
  const activeCase = useMemo(() => {
    if (selectedCaseId) {
      const found = filteredCases.find((c) => c.id === selectedCaseId);
      if (found) return found;
      // Fallback to caseList if selected but filter changed
      return caseList.find((c) => c.id === selectedCaseId) || null;
    }
    if (filteredCases.length > 0) {
      return filteredCases[0];
    }
    return null;
  }, [selectedCaseId, filteredCases, caseList]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearched(true);
    if (filteredCases.length > 0) {
      setSelectedCaseId(filteredCases[0].id);
    } else {
      setSelectedCaseId(null);
    }
  };

  const handleCopyCaseId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Mask sensitive financial or officer details for public citizen privacy
  const maskSensitiveAccount = (acc) => {
    if (!acc || acc === 'N/A') return 'PROTECTED / MASKED';
    if (acc.includes('@')) {
      const parts = acc.split('@');
      return `${parts[0].slice(0, 3)}••••@${parts[1]}`;
    }
    if (acc.length > 6) {
      return `${acc.slice(0, 4)}••••${acc.slice(-4)}`;
    }
    return '••••••••';
  };

  const currentStatusMeta = activeCase
    ? STATUS_CONFIG[activeCase.status] || STATUS_CONFIG.pending
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-slate-800/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-inner shadow-purple-500/20">
              <Search className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  <span>CITIZEN CASE RADAR // PUBLIC INQUIRY</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all duration-300 flex items-center space-x-1.5 ${
                    livePulse
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${livePulse ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                  <span>{livePulse ? 'SOCKET TELEMETRY UPDATED' : 'SOCKET LIVE SYNC'}</span>
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                Victim Case Investigation & Lien Tracker
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Live cryptographic tracking of police triage, assigned cyber officers, and NPCI inter-bank lien holds.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchCases}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center space-x-2 transition self-start md:self-auto shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'SYNCING CASES...' : 'SYNC DATABASE'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <label className="text-xs font-mono text-slate-300 font-medium block flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search Incident Report Database</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Query by Case ID, keyword, location, or summary
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by Case ID, keyword, location, or summary..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearched(Boolean(e.target.value));
                }}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none font-mono transition shadow-inner"
              />
            </div>

            {/* Case-Type Dropdown Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setSearched(true);
                }}
                className="w-full sm:w-auto bg-slate-950/90 border border-slate-800 text-slate-200 rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer shadow-inner"
              >
                {SCAM_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider font-mono flex items-center justify-center space-x-2 shadow-lg shadow-purple-950/50 transition transform active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>FILTER CASES</span>
            </button>
          </div>
        </form>

        {/* Quick Sample Chips & Active Filter Indicator */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          {caseList.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold flex-shrink-0">
                Active Cases ({filteredCases.length}/{caseList.length}):
              </span>
              {filteredCases.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setQuery(c.id);
                    setSelectedCaseId(c.id);
                    setSearched(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition flex-shrink-0 flex items-center space-x-1 cursor-pointer ${
                    selectedCaseId === c.id || query === c.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span>{c.id}</span>
                  <span className="text-[9px] text-slate-500">({c.status})</span>
                </button>
              ))}
            </div>
          )}

          {(query || filterType !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilterType('ALL');
                setSearched(false);
              }}
              className="text-cyan-400 hover:text-cyan-300 underline text-[11px] cursor-pointer self-start sm:self-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Multiple Search Results Selector (if query matches multiple cases) */}
      {searchResults.length > 1 && (
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Found {searchResults.length} incidents matching "{query}":</span>
            <span className="text-[10px] text-cyan-400">Click a case to inspect full timeline</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {searchResults.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  activeCase?.id === c.id
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-950'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span>{c.id}</span>
                  <span className="text-[10px] uppercase text-cyan-400">{c.status}</span>
                </div>
                <div className="text-xs font-semibold truncate text-slate-100">{c.title}</div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1">
                  ₹{Number(c.amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Case Dossier Card (When Case is Active) */}
      {activeCase ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Section 1: Lifecycle Timeline (Col 7) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
                  Interception Lifecycle Progress
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase border ${currentStatusMeta?.badgeBg}`}>
                {currentStatusMeta?.tier || activeCase.status}
              </span>
            </div>

            {/* Lifecycle Timeline Visualizer */}
            <CaseStatusTimeline status={activeCase.status} />

            {/* Live Status Description */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase text-[11px]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Current Stage Directive:</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                {currentStatusMeta?.desc}
              </p>
              {activeCase.claimed_by_name && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Field Dispatch Officer:</span>
                  <span className="text-amber-400 font-bold">{activeCase.claimed_by_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Case Snapshot & Forensic Protection (Col 5) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
                    Case Dossier Snapshot
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCaseId(activeCase.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-cyan-300 flex items-center space-x-1 transition"
                  title="Copy Reference ID"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId ? 'COPIED' : 'COPY ID'}</span>
                </button>
              </div>

              {/* Case Metadata Table */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Case Reference ID</span>
                  <span className="font-bold text-cyan-400">{activeCase.id}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Reported Loss Amount</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    ₹{Number(activeCase.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Classification</span>
                  <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[180px]">
                    {activeCase.scam_type || 'Financial Fraud'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Jurisdiction Region</span>
                  <span className="font-semibold text-slate-300 text-[11px] truncate max-w-[180px]">
                    {activeCase.location_name || 'Delhi NCR'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Suspect Account (Masked)</span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {maskSensitiveAccount(activeCase.suspect_account)}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy & Safety Note */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1 mt-4">
              <div className="text-slate-300 font-mono font-bold flex items-center space-x-1.5 text-xs">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Official Protocol Notice</span>
              </div>
              <p className="leading-normal">
                Never disclose OTPs or credentials to anyone claiming to represent Police or NPCI. Real investigators will never ask for PINs.
              </p>
            </div>
          </div>

          {/* Section 3: Citizen Directives (Full 12 Columns) */}
          <div className="lg:col-span-12 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
                  Citizen Safety Directives & Support Channels
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                HELPLINE 1930
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>National Cyber Helpline</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Call <strong className="text-white">1930</strong> (Toll-Free, 24/7) to lodge supplementary financial transaction IDs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-purple-400 font-bold flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Preserve Evidence</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Keep screenshots of chat messages, UPI UTR numbers, and bank account statements ready for the assigned officer.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-amber-400 font-bold flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Bank Freezes & Liens</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  NPCI lien requests are processed automatically across 42 partner banks under the 45-minute golden SLA window.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / No Match State */
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-10 text-center space-y-4 shadow-xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-7 h-7 text-cyan-400/50" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-bold text-base text-slate-200">
              {searched ? 'No matching cases found for your search criteria.' : 'Ready to Track Cyber Incident'}
            </h3>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              {searched
                ? `No case matching query "${query}" was found. Try adjusting your keyword query, clearing case-type filters, or searching by phone number.`
                : 'Enter your Case Reference ID (e.g. CASE-2026-9041) or the registered complainant mobile number above to inspect live case status.'}
            </p>
          </div>
          {caseList.length > 0 && (
            <div className="flex items-center justify-center space-x-3">
              {searched && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setFilterType('ALL');
                    setSearched(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs transition cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const first = caseList[0];
                  setQuery(first.id);
                  setSelectedCaseId(first.id);
                  setSearched(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300 font-mono text-xs transition inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Load Latest Active Case ({caseList[0].id})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
