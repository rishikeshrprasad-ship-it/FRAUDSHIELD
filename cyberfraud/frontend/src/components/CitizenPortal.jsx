import React from 'react';
import { Shield, QrCode, FileText, Building, Search, MapPin, Scale, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function CitizenPortal({ activeTab, setActiveTab }) {
  const citizenTools = [
    {
      id: 'scanner',
      title: 'QR & Link Scam Scanner',
      desc: 'Instantly analyze phishing URLs, QR codes, and UPI addresses for fraud risk',
      icon: QrCode,
      color: 'cyan'
    },
    {
      id: 'file_case',
      title: 'Report Cyber Crime',
      desc: 'File a cybercrime report directly to the law enforcement command center',
      icon: FileText,
      color: 'emerald'
    },
    {
      id: 'teller',
      title: 'Branch Teller Shield',
      desc: 'Silent duress interception for bank tellers encountering coercion at counters',
      icon: Building,
      color: 'amber'
    },
    {
      id: 'victim_tracker',
      title: 'Victim Case Tracker',
      desc: 'Track your case lien status, officer assignment, and investigation timeline',
      icon: Search,
      color: 'purple'
    },
    {
      id: 'public_heatmap',
      title: 'Public Threat Map',
      desc: 'View anonymized threat heatmap zones across major cities in real-time',
      icon: MapPin,
      color: 'rose'
    },
    {
      id: 'appeal_portal',
      title: 'Account Unfreeze Appeal',
      desc: 'Contest erroneous NPCI bank lien freezes with KYC documentation',
      icon: Scale,
      color: 'teal'
    }
  ];

  const colorMap = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', hover: 'hover:border-cyan-500/60' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', hover: 'hover:border-emerald-500/60' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', hover: 'hover:border-amber-500/60' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', hover: 'hover:border-purple-500/60' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', hover: 'hover:border-rose-500/60' },
    teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', hover: 'hover:border-teal-500/60' }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-10 h-10" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
        </div>
        <h1 className="font-extrabold text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
          FRAUDSHIELD CITIZEN PORTAL
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          India's unified cybercrime fraud intelligence platform. Report scams, scan phishing links,
          track your case, and contest erroneous bank freezes — all in one secure command center.
        </p>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {citizenTools.map((tool) => {
          const Icon = tool.icon;
          const colors = colorMap[tool.color];
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`bg-slate-900/90 border border-slate-800 ${colors.hover} rounded-2xl p-6 space-y-4 shadow-xl text-left transition-all duration-200 transform hover:scale-[1.02] active:scale-95`}
            >
              <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border w-fit`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">{tool.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tool.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
