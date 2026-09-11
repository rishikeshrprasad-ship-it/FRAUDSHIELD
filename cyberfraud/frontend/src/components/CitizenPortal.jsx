import React, { useState, useMemo, useDeferredValue, useCallback, memo } from 'react';
import {
  Shield,
  QrCode,
  FileText,
  Search,
  MapPin,
  Scale,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Zap,
  Activity,
  Lock,
  Compass
} from 'lucide-react';

const ToolCard = memo(function ToolCard({ tool, onSelect }) {
  const Icon = tool.icon;
  const isHighlighted = tool.badge === 'LIVE FEED' || tool.badge === 'INSTANT ML';

  return (
    <button
      type="button"
      onClick={() => onSelect(tool.id)}
      className="group relative text-left w-full h-full p-6 rounded-2xl bg-slate-900/70 hover:bg-slate-900/95 border border-slate-800/80 hover:border-slate-700/90 shadow-xl hover:shadow-cyan-950/20 backdrop-blur-md transition-all duration-200 transform-gpu hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] flex flex-col justify-between overflow-hidden will-change-transform"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none bg-gradient-to-br ${tool.gradient}`}
      />

      <div className="space-y-4 relative z-10 w-full">
        <div className="flex items-center justify-between">
          <div
            className={`p-3.5 rounded-xl border ${tool.iconStyle} transition-transform duration-200 group-hover:scale-105 transform-gpu`}
          >
            <Icon className="w-6 h-6" />
          </div>

          {tool.badge && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center space-x-1 ${
                isHighlighted
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isHighlighted ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{tool.badge}</span>
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-base text-slate-100 group-hover:text-white transition-colors flex items-center justify-between">
            <span>{tool.title}</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 text-slate-400 group-hover:text-cyan-400 flex-shrink-0" />
          </h3>
          <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed font-sans transition-colors line-clamp-2">
            {tool.desc}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500 group-hover:text-slate-400 transition-colors relative z-10">
        <span>{tool.category}</span>
        <span className="text-cyan-400 font-bold group-hover:underline flex items-center space-x-1">
          <span>Launch Tool</span>
        </span>
      </div>
    </button>
  );
});

const CategoryPill = memo(function CategoryPill({ label, active, onClick, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-150 transform-gpu flex items-center space-x-1.5 flex-shrink-0 ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-cyan-950/40'
          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
      }`}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-950 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
});

function CitizenPortal({ activeTab, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const deferredSearch = useDeferredValue(searchQuery);

  const citizenTools = useMemo(
    () => [
      {
        id: 'scanner',
        title: 'QR & Link Scam Scanner',
        desc: 'Advanced heuristic ML threat scoring for suspicious URLs, APK downloads, and payment QR codes.',
        icon: QrCode,
        category: 'PROTECTION',
        badge: 'INSTANT ML',
        gradient: 'from-cyan-500 to-blue-500',
        iconStyle: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
      },
      {
        id: 'file_case',
        title: 'Report Cyber Crime Incident',
        desc: 'Official digital filing desk with structured evidence hashing and immediate NCRP docket generation.',
        icon: FileText,
        category: 'REPORTING',
        badge: 'LEGAL DOCKET',
        gradient: 'from-emerald-500 to-teal-500',
        iconStyle: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      },
      {
        id: 'victim_tracker',
        title: 'Victim Case Tracker',
        desc: 'Real-time investigation milestone feed, officer assignment status, and fund lien recovery telemetry.',
        icon: Search,
        category: 'INVESTIGATION',
        badge: 'LIVE SYNC',
        gradient: 'from-purple-500 to-indigo-500',
        iconStyle: 'bg-purple-500/10 border-purple-500/30 text-purple-400'
      },
      {
        id: 'public_heatmap',
        title: 'Public Threat Radar Map',
        desc: 'High-performance GIS interactive radar displaying active syndicate hotspots with satellite imagery.',
        icon: MapPin,
        category: 'INTELLIGENCE',
        badge: 'LIVE FEED',
        gradient: 'from-rose-500 to-amber-500',
        iconStyle: 'bg-rose-500/10 border-rose-500/30 text-rose-400'
      },
      {
        id: 'appeal_portal',
        title: 'Account Unfreeze Appeal Desk',
        desc: 'Statutory grievance filing and Section 91 Cr.P.C. legal memo dispatch for erroneous NPCI lien freezes.',
        icon: Scale,
        category: 'LEGAL RELIEF',
        badge: 'GOV DISPATCH',
        gradient: 'from-teal-500 to-emerald-500',
        iconStyle: 'bg-teal-500/10 border-teal-500/30 text-teal-400'
      },
      {
        id: 'scanner',
        title: 'Emergency Phishing Verification',
        desc: 'Rapid URL sandbox analysis to verify bank OTP prompts, WhatsApp APK links, and fake lottery lures.',
        icon: ShieldCheck,
        category: 'PROTECTION',
        badge: 'SECURE CHECK',
        gradient: 'from-amber-500 to-orange-500',
        iconStyle: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      }
    ],
    []
  );

  const categories = useMemo(() => ['ALL', 'PROTECTION', 'REPORTING', 'INVESTIGATION', 'INTELLIGENCE', 'LEGAL RELIEF'], []);

  const filteredTools = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return citizenTools.filter((tool) => {
      const matchesCategory = selectedCategory === 'ALL' || tool.category === selectedCategory;
      const matchesSearch =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [citizenTools, deferredSearch, selectedCategory]);

  const handleToolSelect = useCallback(
    (toolId) => {
      setActiveTab(toolId);
    },
    [setActiveTab]
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-slate-100 pb-12 animate-in fade-in duration-200">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-slate-800/80 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none transform-gpu" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none transform-gpu" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>GOVERNMENT CYBERCRIME CITIZEN SHIELD</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 uppercase">
                FraudShield Citizen Portal
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-normal leading-relaxed">
                National unified cybersecurity countermeasure grid. Report incidents directly to law enforcement, scan
                suspicious QR codes & URLs in real-time, monitor case status, and appeal wrongful bank lien freezes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 shadow-xl flex items-center space-x-4 flex-shrink-0 self-start md:self-auto">
              <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div className="font-mono text-xs">
                <div className="text-[10px] text-slate-400 uppercase font-bold">National Cyber Helpline</div>
                <div className="text-xl font-black text-rose-400 tracking-wider">1930</div>
                <div className="text-[9px] text-emerald-400 font-sans">24x7 MHA Dispatch Ready</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 font-mono text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase">Threat Analysis</span>
              <span className="text-emerald-400 font-bold text-sm">Active & Live</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase">Lien Interception</span>
              <span className="text-cyan-400 font-bold text-sm">NPCI / Bank Ready</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase">Docket Generation</span>
              <span className="text-purple-400 font-bold text-sm">Instant SHA-256</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase">Citizen Privacy</span>
              <span className="text-amber-400 font-bold text-sm">End-to-End Secure</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search Citizen Tools, Scanners, Appeals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none font-mono transition backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-mono text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>
        </div>

        {deferredSearch && (
          <div className="text-xs font-mono text-cyan-400 flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>
              Found {filteredTools.length} tool{filteredTools.length === 1 ? '' : 's'} matching "{deferredSearch}"
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => (
            <ToolCard key={tool.id + tool.title} tool={tool} onSelect={handleToolSelect} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs space-y-2 bg-slate-900/40 rounded-2xl border border-slate-800">
            <AlertTriangle className="w-6 h-6 mx-auto text-amber-500/80" />
            <p>No citizen tools match the specified search query.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="text-cyan-400 hover:underline text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CitizenPortal);
