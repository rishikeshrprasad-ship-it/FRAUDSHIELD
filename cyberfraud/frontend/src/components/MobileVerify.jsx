import React, { useState } from 'react';
import { Smartphone, CheckCircle2, ShieldCheck, Send } from 'lucide-react';

export default function MobileVerify({ onVerified }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (mobile.length >= 10) {
      setLoading(true);
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
      }, 800);
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setVerified(true);
      setLoading(false);
      if (onVerified) onVerified(mobile);
    }, 600);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl max-w-sm mx-auto">
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-100 uppercase">Mobile OTP Verification</h4>
          <p className="text-xs text-slate-400 font-mono">Identity gateway check</p>
        </div>
      </div>

      {!verified ? (
        !otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase font-mono shadow-md shadow-cyan-950 transition"
            >
              {loading ? 'SENDING...' : 'SEND OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-3">
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 text-center tracking-widest text-lg focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase font-mono shadow-md shadow-emerald-950 transition"
            >
              {loading ? 'VERIFYING...' : 'VERIFY OTP'}
            </button>
          </form>
        )
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold">MOBILE VERIFIED</div>
            <div>{mobile}</div>
          </div>
        </div>
      )}
    </div>
  );
}
