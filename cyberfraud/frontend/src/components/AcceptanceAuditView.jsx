import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, Clock, User, ShieldAlert } from 'lucide-react';

export default function AcceptanceAuditView() {
  const [auditLog, setAuditLog] = useState([
    {
      id: 'AUD-001',
      caseId: 'CASE-2026-9041',
      action: 'CASE_CLAIMED',
      officer: 'Sub-Inspector Rahul Kumar',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      slaStatus: 'WITHIN_SLA',
      responseTimeMs: 12400
    },
    {
      id: 'AUD-002',
      caseId: 'CASE-2026-8812',
      action: 'NPCI_LIEN_EXECUTED',
      officer: 'Sub-Inspector Rahul Kumar',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      slaStatus: 'WITHIN_SLA',
      responseTimeMs: 28900
    },
    {
      id: 'AUD-003',
      caseId: 'CASE-2026-7104',
      action: 'DURESS_ALERT_TRIGGERED',
      officer: 'Anjali Verma (SBI Teller)',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      slaStatus: 'CRITICAL_BREACH',
      responseTimeMs: 182000
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Acceptance & SLA Compliance Audit Trail
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Command Center audit log of case claims, freeze executions, and SLA violations
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <th className="py-3 px-3">Audit ID</th>
              <th className="py-3 px-3">Case Ref</th>
              <th className="py-3 px-3">Action Type</th>
              <th className="py-3 px-3">Officer / Agent</th>
              <th className="py-3 px-3">Response Time</th>
              <th className="py-3 px-3">SLA Status</th>
              <th className="py-3 px-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {auditLog.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-950/50 transition">
                <td className="py-3 px-3 text-cyan-400 font-bold">{entry.id}</td>
                <td className="py-3 px-3 text-slate-300">{entry.caseId}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold">
                    {entry.action}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-300">{entry.officer}</td>
                <td className="py-3 px-3 text-slate-400">{(entry.responseTimeMs / 1000).toFixed(1)}s</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    entry.slaStatus === 'WITHIN_SLA'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {entry.slaStatus}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-500">{new Date(entry.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
