import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, User, Phone, MapPin, IndianRupee, Lock, FileText, Sparkles, Building, AlertTriangle } from 'lucide-react';
import UrgencyMeter from './UrgencyMeter.jsx';
import CaseStatusTimeline from './CaseStatusTimeline.jsx';
import SLATimer from './SLATimer.jsx';

export default function CaseDetailPanel({ caseItem, onClose, onClaimCase, currentRole, token }) {
  const [llmExplanation, setLlmExplanation] = useState('');
  const [loadingLlm, setLoadingLlm] = useState(false);
  const [dossier, setDossier] = useState(null);
  const [freezeResult, setFreezeResult] = useState(null);
  const [freezing, setFreezing] = useState(false);

  // Universal Keyboard Escape Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && caseItem) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [caseItem, onClose]);

  if (!caseItem) return null;

  const handleFetchLlmExplanation = async () => {
    setLoadingLlm(true);
    try {
      const res = await fetch(`http://localhost:4000/api/case/${caseItem.id}/explain`, {
        method: 'POST'
      });
      const data = await res.json();
      setLlmExplanation(data.explanation || 'Explanation generated.');
    } catch (e) {
      setLlmExplanation('Failed to generate AI analysis.');
    } finally {
      setLoadingLlm(false);
    }
  };

  const handleFetchDossier = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/case/${caseItem.id}/file`);
      const data = await res.json();
      setDossier(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteFreeze = async () => {
    setFreezing(true);
    try {
      const res = await fetch(`http://localhost:4000/api/bank-freeze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accountNo: caseItem.suspect_account || 'SBI-MULE-48192019',
          bankName: 'SBI Clearing Hub',
          caseId: caseItem.id
        })
      });
      const data = await res.json();
      setFreezeResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setFreezing(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-end p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-cyan-400 font-bold">{caseItem.id}</span>
                <SLATimer deadlineISO={caseItem.sla_deadline} />
              </div>
              <h2 className="font-extrabold text-lg tracking-wider text-slate-100">{caseItem.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Close Drawer (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Urgency & Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UrgencyMeter score={caseItem.urgency_score} />
          <CaseStatusTimeline status={caseItem.status} />
        </div>

        {/* Case Metrics Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 block">Reported Fraud Amount</span>
              <span className="text-emerald-400 font-bold text-base flex items-center">
                <IndianRupee className="w-4 h-4 mr-0.5" />
                {Number(caseItem.amount).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Scam Type & Channel</span>
              <span className="text-cyan-300 font-semibold">{caseItem.scam_type}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Victim Profile</span>
              <span className="text-slate-200 font-semibold">{caseItem.victim_name} ({caseItem.victim_contact})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Assigned Officer</span>
              <span className="text-amber-400 font-semibold">
                {caseItem.claimed_by_name || 'UNCLAIMED / IN QUEUE'}
              </span>
            </div>
          </div>

          {/* Description Text Truncation Requirement: line-clamp-3 overflow-hidden text-ellipsis */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-500 block mb-1">Incident Summary:</span>
            <p className="text-slate-300 font-sans line-clamp-3 overflow-hidden text-ellipsis bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
              {caseItem.description}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2 pt-2">
          {caseItem.status === 'pending' && currentRole !== 'CITIZEN' && (\n            <button\n              onClick={() => onClaimCase(caseItem.id)}\n              className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950 transition"\n            >\n              <Lock className="w-4 h-4" />\n              <span>CLAIM CASE IMMEDIATELY</span>\n            </button>\n          )}

          {currentRole !== 'CITIZEN' && (
            <button
              onClick={handleExecuteFreeze}
              disabled={freezing}
              className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-rose-950 transition"
            >
              <Building className="w-4 h-4" />
              <span>{freezing ? 'ISSUING LIEN...' : 'NPCI LIEN FREEZE'}</span>
            </button>
          )}

          <button
            onClick={handleFetchLlmExplanation}
            disabled={loadingLlm}
            className="py-2.5 px-4 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI EXPLAIN</span>
          </button>

          <button
            onClick={handleFetchDossier}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 border border-slate-700 transition"
          >
            <FileText className="w-4 h-4" />
            <span>CASE DOSSIER</span>
          </button>
        </div>

        {/* Freeze Result Display */}
        {freezeResult && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono">
            ✅ {freezeResult.details} (Ref: {freezeResult.referenceId})
          </div>
        )}

        {/* LLM Explanation Box */}
        {llmExplanation && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/80 text-xs text-purple-200 whitespace-pre-line font-mono">
            {llmExplanation}
          </div>
        )}

        {/* Dossier Preview Modal/Box */}
        {dossier && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-slate-200 uppercase border-b border-slate-800 pb-2">
              📂 Dossier ID: {dossier.dossierId}
            </h4>
            <div className="text-slate-400">
              <div>Assigned: {dossier.caseSummary.assignedOfficer}</div>
              <div>Loss: {dossier.caseSummary.amountLoss}</div>
            </div>
            <div>
              <span className="text-cyan-400 font-bold block mb-1">Legal Evidence Pack:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {dossier.legalEvidencePack.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
