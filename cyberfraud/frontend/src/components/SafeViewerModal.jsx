import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, ExternalLink, AlertTriangle } from 'lucide-react';

export default function SafeViewerModal({ url, title, onClose }) {
  // Universal Keyboard Escape Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && url) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [url, onClose]);

  if (!url) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100 my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                  SECURITY SANDBOX PROTECTED MODE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  SANDBOX ISOLATED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-xl">{url}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Close Viewer (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning Banner */}
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Strict Security Sandbox Active: Scripts & Top-Level Navigation Disabled (sandbox="allow-same-origin").
          </span>
        </div>

        {/* 
          Sandboxed iframe requirement: 
          sandbox="allow-same-origin" (strictly excluding allow-scripts and allow-top-navigation)
          Routed through backend sanitized proxy: /api/proxy-preview
        */}
        <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
          <iframe
            src={`http://localhost:4000/api/proxy-preview?url=${encodeURIComponent(url)}`}
            title={title || 'Safe Viewer'}
            sandbox="allow-same-origin"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
