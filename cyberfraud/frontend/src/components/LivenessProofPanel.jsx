import React, { useState } from 'react';
import { Fingerprint, Camera, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function LivenessProofPanel({ victimName = 'Victim' }) {
  const [step, setStep] = useState('idle'); // idle, capturing, verified
  const [livenessScore, setLivenessScore] = useState(null);

  const handleStartLiveness = () => {
    setStep('capturing');
    // Simulate biometric capture
    setTimeout(() => {
      setLivenessScore(97.3);
      setStep('verified');
    }, 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl max-w-md mx-auto">
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Fingerprint className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-100 uppercase">Biometric Liveness Verification</h4>
          <p className="text-xs text-slate-400 font-mono">Anti-spoofing victim identity proof</p>
        </div>
      </div>

      {step === 'idle' && (
        <div className="text-center space-y-4 py-4">
          <Camera className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400">
            Capture real-time biometric liveness proof for victim <span className="text-cyan-400 font-bold">{victimName}</span>
          </p>
          <button
            onClick={handleStartLiveness}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase font-mono shadow-md shadow-cyan-950 transition"
          >
            START LIVENESS CAPTURE
          </button>
        </div>
      )}

      {step === 'capturing' && (
        <div className="text-center space-y-4 py-6">
          <Camera className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
          <p className="text-xs text-cyan-300 font-mono font-bold animate-pulse">
            CAPTURING BIOMETRIC LIVENESS FRAME...
          </p>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      )}

      {step === 'verified' && (
        <div className="text-center space-y-3 py-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <div>
            <p className="text-xs text-emerald-300 font-mono font-bold">LIVENESS VERIFIED SUCCESSFULLY</p>
            <p className="text-xs text-slate-400 mt-1">
              Confidence Score: <span className="text-emerald-400 font-bold">{livenessScore}%</span>
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-400">
            Anti-spoofing check: PASS | Depth map: VALID | Blink detection: CONFIRMED
          </div>
        </div>
      )}
    </div>
  );
}
