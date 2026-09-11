import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export default function CaseStatusTimeline({ status = 'pending' }) {
  const steps = [
    { id: 'pending', label: 'Ingested & Scoring', desc: 'Case received via Cyber Command' },
    { id: 'claimed', label: 'Officer Claimed', desc: 'Assigned to field officer' },
    { id: 'frozen', label: 'Mule Lien Executed', desc: 'NPCI bank hold active' },
    { id: 'escalated', label: 'FIR / Court Escalated', desc: 'Asset recovery workflow' }
  ];

  const getStepStatus = (stepId, index) => {
    const statusOrder = ['pending', 'claimed', 'frozen', 'escalated'];
    const currentIndex = statusOrder.indexOf(status);

    if (currentIndex > index) return 'completed';
    if (currentIndex === index) return 'active';
    return 'upcoming';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      <h4 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
        <Clock className="w-4 h-4 text-cyan-400" />
        <span>Interception Lifecycle Timeline</span>
      </h4>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const state = getStepStatus(step.id, idx);
          return (
            <div key={step.id} className="flex items-start space-x-3 text-xs">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                    state === 'completed'
                      ? 'bg-emerald-500 text-slate-950'
                      : state === 'active'
                      ? 'bg-cyan-500 text-slate-950 animate-pulse'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {state === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-6 my-0.5 ${
                      state === 'completed' ? 'bg-emerald-500/60' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
              <div className="pt-0.5">
                <div
                  className={`font-semibold ${
                    state === 'active' ? 'text-cyan-300 font-bold' : state === 'completed' ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-[11px] text-slate-400">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
