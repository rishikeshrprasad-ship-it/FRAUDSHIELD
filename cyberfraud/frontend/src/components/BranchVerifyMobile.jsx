import React, { useState } from 'react';
import { Smartphone, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function BranchVerifyMobile({ onVerifyComplete }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (mobileNumber.length >= 10) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 6 || otp === '123456') {
      setVerified(true);
      if (onVerifyComplete) onVerifyComplete(mobileNumber);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl max-w-md mx-auto">
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-100 uppercase">In-Branch Customer Mobile OTP Verify</h4>
          <p className="text-xs text-slate-400 font-mono">Teller Identity Verification Gateway</p>
        </div>
      </div>

      {!verified ? (
        !otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Customer Mobile Number</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase font-mono shadow-md shadow-cyan-950 transition"
            >
              SEND VERIFICATION OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Enter 6-Digit OTP (Mock: 123456)</label>
              <input
                type="text"
                required
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:border-cyan-500 focus:outline-none text-center tracking-widest text-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase font-mono shadow-md shadow-emerald-950 transition"
            >
              VERIFY OTP & DUPLICATE CHECK
            </button>
          </form>
        )
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold">VERIFIED CUSTOMER IDENTITY</div>
            <div>Mobile: {mobileNumber} | Teller Verified</div>
          </div>
        </div>
      )}
    </div>
  );
}
