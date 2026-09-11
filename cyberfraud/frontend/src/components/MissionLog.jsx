import React, { useState, useEffect } from 'react';
import { Radio, ShieldAlert, Lock, Building, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function MissionLog({ socket, userRole, user }) {
  const currentRole = (userRole || user?.role || '').toString().trim().toUpperCase();
  if (currentRole === 'POLICE') return null;

  const [logEntries, setLogEntries] = useState([
    { id: 1, time: new Date(Date.now() - 300000).toLocaleTimeString(), type: 'SYSTEM', message: '🛡️ FraudShield Command Center initialized. All nodes connected.', severity: 'info' },
    { id: 2, time: new Date(Date.now() - 240000).toLocaleTimeString(), type: 'CASE_INGESTED', message: 'CASE-2026-9041: Digital Arrest Threat — ₹4,50,000 — Urgency 92/100', severity: 'critical' },
    { id: 3, time: new Date(Date.now() - 180000).toLocaleTimeString(), type: 'OFFICER_CLAIMED', message: 'Sub-Inspector Rahul Kumar claimed CASE-2026-9041 (Direct Police Claiming)', severity: 'success' },
    { id: 4, time: new Date(Date.now() - 120000).toLocaleTimeString(), type: 'NPCI_FREEZE', message: 'NPCI Lien Freeze executed: SBI-MULE-48192019 — Full Balance Hold', severity: 'warning' },
    { id: 5, time: new Date(Date.now() - 60000).toLocaleTimeString(), type: 'DOMAIN_SCAN', message: 'crt.sh scan: sbi-kyc-update-portal.com flagged (Risk 95/100)', severity: 'critical' }
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleNewCase = (newCase) => {
      setLogEntries((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'CASE_INGESTED',
          message: `${newCase.id}: ${newCase.title} — ₹${Number(newCase.amount).toLocaleString('en-IN')} — Urgency ${newCase.urgency_score}/100`,
          severity: 'critical'
        },
        ...prev
      ].slice(0, 50));
    };

    const handleUpdatedCase = (updatedCase) => {
      setLogEntries((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'CASE_UPDATED',
          message: `${updatedCase.id}: Status → ${updatedCase.status.toUpperCase()} ${updatedCase.claimed_by_name ? `(${updatedCase.claimed_by_name})` : ''}`,
          severity: 'success'
        },
        ...prev
      ].slice(0, 50));
    };

    const handleDuress = (alert) => {
      setLogEntries((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'TELLER_DURESS',
          message: `🚨 DURESS ALERT: ${alert.branch_name || 'Branch'} — ${alert.teller_name || 'Teller'} — ₹${Number(alert.amount || 0).toLocaleString('en-IN')}`,
          severity: 'critical'
        },
        ...prev
      ].slice(0, 50));
    };

    socket.on('case:new', handleNewCase);
    socket.on('case:updated', handleUpdatedCase);
    socket.on('teller:duress', handleDuress);

    return () => {
      socket.off('case:new', handleNewCase);
      socket.off('case:updated', handleUpdatedCase);
      socket.off('teller:duress', handleDuress);
    };
  }, [socket]);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical': return 'border-l-rose-500 bg-rose-950/20';
      case 'warning': return 'border-l-amber-500 bg-amber-950/20';
      case 'success': return 'border-l-emerald-500 bg-emerald-950/20';
      default: return 'border-l-cyan-500 bg-cyan-950/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Real-Time Mission Operations Log
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live command center activity feed — Socket.io broadcast stream
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-300 text-xs font-mono font-bold animate-pulse">
          ● LIVE
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-2 max-h-[600px] overflow-y-auto">
        {logEntries.map((entry) => (
          <div
            key={entry.id}
            className={`border-l-4 ${getSeverityStyle(entry.severity)} rounded-r-xl p-3 font-mono text-xs flex items-start space-x-3`}
          >
            <span className="text-slate-500 whitespace-nowrap">{entry.time}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold whitespace-nowrap">
              {entry.type}
            </span>
            <span className="text-slate-300 flex-1">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
