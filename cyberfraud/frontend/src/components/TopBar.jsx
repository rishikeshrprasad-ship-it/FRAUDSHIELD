import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  User,
  LogOut,
  Lock,
  Radio,
  MapPin,
  Eye,
  FileText,
  QrCode,
  Building,
  AlertTriangle,
  Network,
  Search,
  Scale,
  CheckCircle2,
  History,
  ChevronDown,
  Menu,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

export const isPoliceOrCommandRole = (role) => {
  if (!role) return false;
  const r = role.toString().trim().toUpperCase();
  return r === 'POLICE' || r === 'CHIEF / ADMIN' || r === 'CHIEF' || r === 'COMMAND';
};

export const TAB_PERMISSIONS = {
  citizen: [
    { id: 'scanner', label: 'QR & Link Scanner', icon: QrCode, desc: 'ML Phishing & APK Threat Scanner' },
    { id: 'file_case', label: 'Report Cybercrime', icon: FileText, desc: 'Ingest Incident to Command Center' },
    { id: 'victim_tracker', label: 'Victim Case Tracker', icon: Search, desc: 'Lien & Police Investigation Status' },
    { id: 'public_heatmap', label: 'Public Threat Map', icon: MapPin, desc: 'Citizen Threat Radar & Hotspots' },
    { id: 'appeal_portal', label: 'Account Unfreeze Appeal', icon: Scale, desc: 'Contest Erroneous NPCI Freezes' }
  ],
  official: [
    { id: 'case_board', label: 'Live Incident Board', icon: ShieldAlert, desc: 'Active Cybercrime Queue & Triage' },
    { id: 'device_graph', label: 'Device Link Graph', icon: Network, desc: 'Multi-Hop Mule & Crypto Clusters' },
    { id: 'domain_watch', label: 'Domain Watch (crt.sh)', icon: Eye, desc: 'Certificate Transparency Monitor' },
    { id: 'recruitment_watch', label: 'Mule Ad Scanner', icon: Search, desc: 'Telegram & Social Syndicate Feed' },
    { id: 'appeal_queue', label: 'Unfreeze Appeals', icon: Scale, desc: 'Judicial Unfreeze Review Queue' },
    { id: 'acceptance_audit', label: 'Audit Log', icon: History, desc: 'Immutable Acceptance Verification' },
    { id: 'mission_log', label: 'Mission Log', icon: Radio, desc: 'Live Telemetry & Socket Broadcast' },
    { id: 'scanner', label: 'ML Scanner Tool', icon: QrCode, desc: 'Phishing & Malicious APK Deep Scan' }
  ]
};

export default function TopBar({
  currentRole,
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  isOfficerSharing,
  onToggleOfficerShare
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isCitizen = currentRole === 'CITIZEN' && (!user || user.role === 'CITIZEN');
  const isPolice = isPoliceOrCommandRole(currentRole) || isPoliceOrCommandRole(user?.role);

  const userRole = (user?.role || currentRole || '').toString().trim().toUpperCase();
  const isPoliceRole = userRole === 'POLICE';

  const availableTabs = isCitizen
    ? TAB_PERMISSIONS.citizen
    : TAB_PERMISSIONS.official.filter((tab) => {
        if (tab.id === 'mission_log' && isPoliceRole) return false;
        if (tab.policeOnly && !isPolice) return false;
        return true;
      });

  const currentTabObj = availableTabs.find((t) => t.id === activeTab) || availableTabs[0];
  const CurrentIcon = currentTabObj?.icon || Layers;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick, { passive: true });
    window.addEventListener('keydown', handleEscape, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setDropdownOpen(false);
  };

  return (
    <header className="backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80 sticky top-0 z-40 px-4 lg:px-6 py-2.5 text-slate-100 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono border transition-all duration-200 shadow-lg will-change-transform transform active:scale-95 cursor-pointer ${
                dropdownOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-cyan-950/50'
                  : 'bg-slate-900/90 text-slate-200 border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-slate-900'
              }`}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Menu className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-2">
                <CurrentIcon className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-100 tracking-wide">
                  {currentTabObj?.label || 'Command Modules'}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 sm:w-84 bg-slate-900/95 border border-slate-800/90 rounded-2xl shadow-2xl p-2 z-50 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    <span>COMMAND MATRIX</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-cyan-300 border border-slate-800">
                    {isCitizen ? 'CITIZEN PORTAL' : `${user?.role || currentRole || 'OFFICIAL'} ACCESS`}
                  </span>
                </div>

                <div className="max-h-[380px] overflow-y-auto space-y-1 p-1 mt-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {availableTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSelectTab(tab.id)}
                        className={`w-full flex items-start space-x-3 p-2.5 rounded-xl text-left transition-all duration-150 will-change-transform hover:scale-[1.01] cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/40'
                            : 'hover:bg-slate-800/70 border border-transparent text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg border mt-0.5 ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold leading-tight truncate flex items-center space-x-1.5">
                              <span>{tab.label}</span>
                              {tab.policeOnly && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                                  POLICE
                                </span>
                              )}
                            </div>
                            {isActive && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0"></span>
                            )}
                          </div>
                          {tab.desc && (
                            <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                              {tab.desc}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 mt-1 border-t border-slate-800/80 px-2 py-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>ESC to Close</span>
                  <span className="text-cyan-500/80">{availableTabs.length} Modules Online</span>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>NODE: SYNCED</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          {isPolice && onToggleOfficerShare && (
            <button
              onClick={onToggleOfficerShare}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono border transition-all will-change-transform active:scale-95 cursor-pointer ${
                isOfficerSharing
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-700 shadow-md shadow-emerald-950'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isOfficerSharing ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>{isOfficerSharing ? 'GPS 1Hz' : 'SHARE GPS'}</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-md">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[120px]">
                  {user.name || user.username}
                </div>
                <div className="text-[10px] font-mono text-cyan-400 font-semibold">{user.role}</div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1 rounded-lg hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center space-x-1.5 shadow-md shadow-cyan-950/50 transition-all duration-150 will-change-transform transform active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>AUTHENTICATE</span>
            </button>
          )}

          <div
            className="flex items-center space-x-2.5 cursor-pointer pl-1 md:pl-2 border-l border-slate-800/80 group"
            onClick={() => setActiveTab(isCitizen ? 'scanner' : 'case_board')}
            title="FraudShield Command Center"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 transition-transform duration-200 group-hover:scale-105">
              <Shield className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div className="hidden sm:block text-right">
              <div className="flex items-center justify-end space-x-1.5">
                <h1 className="font-black text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                  FRAUDSHIELD
                </h1>
                <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">COMMAND CENTER</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
