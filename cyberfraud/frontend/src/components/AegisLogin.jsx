import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Scan, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AegisLogin({ selectedRole, onAuthSuccess }) {
  const [step, setStep] = useState(1);
  const [fingerprintDone, setFingerprintDone] = useState(false);
  const [irisDone, setIrisDone] = useState(false);
  const [yubiDone, setYubiDone] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSimulateFingerprint = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setFingerprintDone(true);
      setIsVerifying(false);
      setStep(2);
    }, 1200);
  };

  const handleSimulateIris = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIrisDone(true);
      setIsVerifying(false);
      setStep(3);
    }, 1200);
  };

  const handleSimulateYubiKey = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setYubiDone(true);
      setIsVerifying(false);
      onAuthSuccess({
        id: `usr_${Date.now()}`,
        username: `${selectedRole.toLowerCase()}_officer`,
        name: `${selectedRole} Auth Badge #${Math.floor(1000 + Math.random() * 9000)}`,
        role: selectedRole
      });
    }, 1000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
            AEGIS 3-Stage Biometric Hardware Auth
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Role: <span className="text-cyan-400 font-bold">{selectedRole}</span> | Class 3 Encrypted Session
          </p>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
        <div className={`p-2 rounded-lg border ${step === 1 ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400' : fingerprintDone ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400' : 'border-slate-800 text-slate-500'}`}>
          <div className="flex items-center justify-center space-x-1">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>1. FINGERPRINT</span>
          </div>
        </div>
        <div className={`p-2 rounded-lg border ${step === 2 ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400' : irisDone ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400' : 'border-slate-800 text-slate-500'}`}>
          <div className="flex items-center justify-center space-x-1">
            <Scan className="w-3.5 h-3.5" />
            <span>2. IRIS SCAN</span>
          </div>
        </div>
        <div className={`p-2 rounded-lg border ${step === 3 ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400' : yubiDone ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400' : 'border-slate-800 text-slate-500'}`Delete}>
          <div className="flex items-center justify-center space-x-1">
            <KeyRound className="w-3.5 h-3.5" />
            <span>3. HARDWARE KEY</span>
          </div>
        </div>
      </div>

      {/* Interactive Step Content */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 text-center space-y-4 min-h-[160px] flex flex-col items-center justify-center">
        {step === 1 && (
          <>
            <Fingerprint className={`w-12 h-12 text-cyan-400 ${isVerifying ? 'animate-bounce' : 'animate-pulse'}`} />
            <div>
              <p className="text-xs text-slate-300 font-semibold">Stage 1: Biometric Fingerprint Sensor</p>
              <p className="text-[11px] text-slate-500">Touch or simulate hardware fingerprint sensor scan</p>
            </div>
            <button
              onClick={handleSimulateFingerprint}
              disabled={isVerifying}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 transition"
            >
              {isVerifying ? 'SCANNING FINGERPRINT...' : 'SCAN FINGERPRINT'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <Scan className={`w-12 h-12 text-teal-400 ${isVerifying ? 'animate-spin' : ''}`} />
            <div>
              <p className="text-xs text-slate-300 font-semibold">Stage 2: Retinal / Iris Biometric Scan</p>
              <p className="text-[11px] text-slate-500">Align camera with eye scanner for spectral verification</p>
            </div>
            <button
              onClick={handleSimulateIris}
              disabled={isVerifying}
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-950 transition"
            >
              {isVerifying ? 'VERIFYING RETINA...' : 'EXECUTE IRIS SCAN'}\n            </button>
          </>
        )}

        {step === 3 && (
          <>
            <KeyRound className={`w-12 h-12 text-emerald-400 ${isVerifying ? 'animate-pulse' : ''}`} />
            <div>
              <p className="text-xs text-slate-300 font-semibold">Stage 3: YubiKey / FIDO2 Security Token</p>
              <p className="text-[11px] text-slate-500">Press hardware token contact button to finalize session signature</p>
            </div>
            <button
              onClick={handleSimulateYubiKey}
              disabled={isVerifying}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950 transition"
            >
              {isVerifying ? 'VERIFYING HARDWARE TOKEN...' : 'TOUCH YUBIKEY TOKEN'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
