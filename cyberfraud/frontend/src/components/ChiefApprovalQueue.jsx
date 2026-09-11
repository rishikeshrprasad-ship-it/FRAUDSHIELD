import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ShieldAlert, Lock, IndianRupee, AlertTriangle } from 'lucide-react';

export default function ChiefApprovalQueue({ cases, token }) {
  const highValueCases = (cases || []).filter(c => c.amount >= 500000 && (c.status === 'claimed' || c.status === 'frozen'));

  const handleApproveEscalation = async (caseId) => {
    try {
      await fetch(`http://localhost:4000/api/case/${caseId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'escalated' })\n      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Chief / Admin Approval Queue
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              High-value asset freeze & FIR escalation approvals (₹5L+ cases)
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-amber-950 border border-amber-800 rounded-xl text-amber-300 text-xs font-mono font-bold">
          {highValueCases.length} PENDING
        </div>
      </div>

      <div className="space-y-4">
        {highValueCases.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs font-mono text-slate-500">
            No high-value cases pending approval at this time.
          </div>
        ) : (
          highValueCases.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl text-slate-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    URGENCY: {c.urgency_score}
                  </span>
                </div>
                <span className="text-emerald-400 font-mono font-bold text-sm flex items-center">
                  <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                  {Number(c.amount).toLocaleString('en-IN')}
                </span>
              </div>

              <h3 className="font-bold text-sm">{c.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 overflow-hidden text-ellipsis">{c.description}</p>

              <div className="font-mono text-xs text-slate-400">
                Assigned: <span className="text-amber-400 font-bold">{c.claimed_by_name || 'Pending'}</span> |\n                Status: <span className="text-cyan-400 font-bold uppercase">{c.status}</span>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => handleApproveEscalation(c.id)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>APPROVE FIR ESCALATION</span>
                </button>
                <button
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs font-mono uppercase flex items-center space-x-1 border border-slate-700 transition"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>HOLD</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
