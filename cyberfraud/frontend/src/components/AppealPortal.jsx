import React, { useState } from 'react';
import { Scale, Send, CheckCircle2, FileText, Upload } from 'lucide-react';

export default function AppealPortal() {
  const [caseId, setCaseId] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [appealRef, setAppealRef] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId || 'GENERAL',
          account_no: accountNo,
          full_name: fullName,
          mobile,
          reason,
          proof_document: 'Aadhaar_KYC_Verification.pdf'
        })
      });
      const data = await res.json();
      setAppealRef(data.id);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Fairness & Bank Account Unfreeze Appeal Portal
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              For legitimate account holders to contest erroneous NPCI lien freezes
            </p>
          </div>
        </div>
      </div>

      {!submitted ? (\n        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl text-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Frozen Bank Account Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. SBI-48192019"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Related Cyber Case ID (Optional)</label>
              <input
                type="text"
                placeholder="CASE-2026-9041"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Account Holder Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Registered Mobile Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Reason for Appeal & Proof Narrative</label>
            <textarea
              rows="3"
              required
              placeholder="Explain legitimate transaction source..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Aadhaar KYC & Income Source Proof</span>
            </div>
            <span className="text-emerald-400 font-bold">Aadhaar_KYC_Verification.pdf</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950 transition"
          >
            <Send className="w-4 h-4" />
            <span>SUBMIT FAIRNESS UNFREEZE APPEAL</span>
          </button>
        </form>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl text-slate-100">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
          <h3 className="font-extrabold text-lg uppercase font-mono">Unfreeze Appeal Submitted Successfully</h3>
          <p className="text-xs text-slate-400 font-mono">
            Appeal Reference: <span className="text-cyan-400 font-bold">{appealRef}</span>
          </p>
          <p className="text-xs text-slate-400">
            Your appeal has been queued for Law Enforcement Officer audit & review.
          </p>
        </div>
      )}
    </div>
  );
}
