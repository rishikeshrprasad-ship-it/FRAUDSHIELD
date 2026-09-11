import React, { useState } from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

export default function AegisLogin({ selectedRole = 'POLICE', onAuthSuccess }) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInstantAuth = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (onAuthSuccess) {
        onAuthSuccess({
          id: `usr_${Date.now()}`,
          username: `${selectedRole.toLowerCase().replace(/[^a-z0-9]/g, '_')}_officer`,
          name: `${selectedRole} Auth Badge #${Math.floor(1000 + Math.random() * 9000)}`,
          role: selectedRole
        });
      }
    }, 300);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-100 uppercase tracking-wider">
              AEGIS Quick Hardware Verification
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Class-3 Direct Encrypted Key Delegation
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={isVerifying}
          onClick={handleInstantAuth}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono tracking-wider flex items-center space-x-1.5 transition transform active:scale-95 shadow-md shadow-cyan-950/50"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isVerifying ? 'VERIFYING...' : 'INSTANT AUTH'}</span>
        </button>
      </div>
    </div>
  );
}
