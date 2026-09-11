import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Building, AlertTriangle, ShieldCheck, Phone, X, Lock, CheckCircle2 } from 'lucide-react';
import BranchVerifyMobile from './BranchVerifyMobile.jsx';

export default function TellerShieldPanel({ socket }) {
  const [branchName, setBranchName] = useState('MG Road SBI Branch');
  const [tellerName, setTellerName] = useState('Anjali Verma');
  const [victimName, setVictimName] = useState('Senior Citizen Victim');
  const [amount, setAmount] = useState('850000');
  const [showDuressModal, setShowDuressModal] = useState(false);
  const [duressDetails, setDuressDetails] = useState(null);

  // Universal Keyboard Escape Listener for Portal Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showDuressModal) {
        setShowDuressModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDuressModal]);

  const handleTriggerDuressAlert = () => {
    const alertData = {
      branch_name: branchName,
      teller_name: tellerName,
      victim_name: victimName,
      amount: parseFloat(amount)
    };

    setDuressDetails(alertData);
    setShowDuressModal(true);

    if (socket) {
      socket.emit('teller:duress_alert', alertData);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Bank Teller Duress Interception Desk
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Silent duress alert trigger for branch tellers encountering coercion scams
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Silent Duress Trigger Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-100 uppercase font-mono border-b border-slate-800 pb-2">
            🚨 Silent Duress Interception Trigger
          </h3>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Branch Name</label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Teller Name / ID</label>
            <input
              type="text"
              value={tellerName}
              onChange={(e) => setTellerName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Coerced Customer Name</label>
            <input
              type="text"
              value={victimName}
              onChange={(e) => setVictimName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Withdrawal / FD Transfer Loss (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100"
            />
          </div>

          <button
            onClick={handleTriggerDuressAlert}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-rose-950 transition transform active:scale-95"
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span>TRIGGER SILENT TELLER DURESS ALERT</span>
          </button>
        </div>

        {/* Mobile Verification Panel */}
        <BranchVerifyMobile />
      </div>

      {/* 
        Portal Modal Overlay requirement: 
        Render alert modal via ReactDOM.createPortal(..., document.body) 
        with fixed inset-0 z-[9999] bg-black/50 backdrop
      */}
      {showDuressModal &&
        ReactDOM.createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDuressModal(false);
            }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg bg-slate-900 border border-rose-600 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-rose-900/60">
                <div className="flex items-center space-x-2 text-rose-400 font-bold font-mono text-sm">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                  <span>SILENT TELLER DURESS BROADCAST SENT</span>
                </div>
                <button
                  onClick={() => setShowDuressModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs text-slate-300">
                <div>Branch: <span className="text-slate-100 font-bold">{duressDetails?.branch_name}</span></div>
                <div>Teller: <span className="text-cyan-400 font-bold">{duressDetails?.teller_name}</span></div>
                <div>Target Victim: <span className="text-amber-300 font-bold">{duressDetails?.victim_name}</span></div>
                <div>Target Amount: <span className="text-rose-400 font-bold">₹{Number(duressDetails?.amount).toLocaleString('en-IN')}</span></div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Police Command Center dispatch notified immediately. Maintain normal demeanor with customer.
              </p>

              <button
                onClick={() => setShowDuressModal(false)}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-lg"
              >
                DISMISS ALERT NOTIFICATION
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
