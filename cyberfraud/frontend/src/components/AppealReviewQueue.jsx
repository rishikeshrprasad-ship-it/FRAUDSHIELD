import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, XCircle, FileText, User } from 'lucide-react';

export default function AppealReviewQueue({ token }) {
  const [appeals, setAppeals] = useState([]);

  const fetchAppeals = () => {
    fetch('http://localhost:4000/api/appeals')
      .then((res) => res.json())
      .then((data) => setAppeals(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const handleReview = async (id, status) => {
    try {
      await fetch(`http://localhost:4000/api/appeal/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          notes: `Reviewed by law enforcement officer on ${new Date().toLocaleTimeString()}`
        })
      });
      fetchAppeals();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
              Police Officer Appeal Review Queue
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Review and grant/reject bank account unfreeze appeals
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {appeals.map((app) => (
          <div
            key={app.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{app.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {app.status}
                </span>
              </div>
              <div className="font-bold text-sm">{app.full_name} ({app.mobile})</div>
              <div className="font-mono text-xs text-slate-400">Account: {app.account_no} | Case: {app.case_id}</div>
              <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                "{app.reason}"
              </p>
            </div>

            {app.status === 'PENDING_REVIEW' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleReview(app.id, 'APPROVED_UNFROZEN')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase flex items-center space-x-1 shadow-md shadow-emerald-950 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>UNFREEZE</span>
                </button>
                <button
                  onClick={() => handleReview(app.id, 'REJECTED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono uppercase flex items-center space-x-1 shadow-md shadow-rose-950 transition"
                >
                  <XCircle className="w-4 h-4" />
                  <span>REJECT</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
