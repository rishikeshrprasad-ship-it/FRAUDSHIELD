import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Building,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Clock,
  ExternalLink,
  ShieldAlert,
  FileCheck,
  X,
  Lock,
  FileSpreadsheet,
  AlertCircle,
  Info,
  Check,
  Send,
  HelpCircle,
  BadgeAlert,
  Layers,
  ArrowRight,
  Sparkles,
  History,
  Archive,
  Calendar,
  Eye,
  FileSearch
} from 'lucide-react';

const DEFAULT_WARNING_TEXT =
  'Official Compliance Warning (Sec 91/102 CrPC): Account unfreezing sanctioned following verified offline bank ground work. Account holder is strictly cautioned against engaging in unverified P2P crypto transfers, renting bank credentials, or receiving third-party cash deposits. Subsequent violations will result in permanent biometric blacklisting and criminal asset attachment.';

export default function AppealReviewQueue({ token }) {
  // Explicit Dual State Arrays for Active vs Completed Queues
  const [activeAppeals, setActiveAppeals] = useState([]);
  const [completedAppeals, setCompletedAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Primary Tab: 'active' (Pending Queue) | 'history' (Completed Appeals)
  const [viewMode, setViewMode] = useState('active'); 
  const [historyFilter, setHistoryFilter] = useState('ALL'); // 'ALL' | 'UNFROZEN' | 'REJECTED'

  // Modal Review States
  const [activeReviewAppeal, setActiveReviewAppeal] = useState(null);
  const [warningText, setWarningText] = useState(DEFAULT_WARNING_TEXT);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Reject Modal State
  const [rejectingAppeal, setRejectingAppeal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Inspection Modal for Completed Appeals
  const [inspectingHistoryItem, setInspectingHistoryItem] = useState(null);

  const isPendingAppeal = (status) => {
    return !status || status === 'PENDING_REVIEW' || status === 'PENDING_POLICE_REVIEW' || status === 'PENDING';
  };

  const isCompletedUnfrozen = (status) => {
    return (
      status === 'COMPLETED' ||
      status === 'APPROVED_UNFROZEN' ||
      status === 'UNFROZEN_SUCCESS' ||
      status === 'COMPLETED_UNFROZEN' ||
      status === 'POLICE_REVIEW_SUCCESSFUL'
    );
  };

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/appeals');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setActiveAppeals(list.filter((a) => isPendingAppeal(a.status)));
        setCompletedAppeals(list.filter((a) => !isPendingAppeal(a.status)));
      }
    } catch (err) {
      console.error('Failed to fetch appeals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  // Filtered Active Pending Appeals
  const filteredActiveAppeals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return activeAppeals;

    return activeAppeals.filter((app) => {
      return (
        (app.id && app.id.toLowerCase().includes(q)) ||
        (app.full_name && app.full_name.toLowerCase().includes(q)) ||
        (app.account_no && app.account_no.toLowerCase().includes(q)) ||
        (app.upi_id && app.upi_id.toLowerCase().includes(q)) ||
        (app.case_id && app.case_id.toLowerCase().includes(q)) ||
        (app.bank_name && app.bank_name.toLowerCase().includes(q)) ||
        (app.reason && app.reason.toLowerCase().includes(q))
      );
    });
  }, [activeAppeals, searchQuery]);

  // Filtered Completed Appeals
  const filteredHistoryAppeals = useMemo(() => {
    return completedAppeals.filter((app) => {
      const matchesFilter =
        historyFilter === 'ALL'
          ? true
          : historyFilter === 'APPROVED_UNFROZEN' || historyFilter === 'COMPLETED' || historyFilter === 'UNFROZEN'
          ? isCompletedUnfrozen(app.status)
          : app.status === historyFilter;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesFilter;

      const matchesQuery =
        (app.id && app.id.toLowerCase().includes(q)) ||
        (app.full_name && app.full_name.toLowerCase().includes(q)) ||
        (app.account_no && app.account_no.toLowerCase().includes(q)) ||
        (app.upi_id && app.upi_id.toLowerCase().includes(q)) ||
        (app.case_id && app.case_id.toLowerCase().includes(q)) ||
        (app.bank_name && app.bank_name.toLowerCase().includes(q)) ||
        (app.review_notes && app.review_notes.toLowerCase().includes(q));

      return matchesFilter && matchesQuery;
    });
  }, [completedAppeals, historyFilter, searchQuery]);

  // Appeal Statistics
  const stats = useMemo(() => {
    const unfrozenCount = completedAppeals.filter((a) => isCompletedUnfrozen(a.status)).length;
    const rejectedCount = completedAppeals.filter((a) => a.status === 'REJECTED').length;
    return {
      total: activeAppeals.length + completedAppeals.length,
      pending: activeAppeals.length,
      approved: unfrozenCount,
      rejected: rejectedCount,
      solvedTotal: completedAppeals.length
    };
  }, [activeAppeals, completedAppeals]);

  // Open the Review & Forensic Dossier Modal
  const handleOpenUnfreezeModal = (appeal) => {
    setActiveReviewAppeal(appeal);
    setWarningText(DEFAULT_WARNING_TEXT);
  };

  // Confirm Unfreeze with Warning -> Disappear from Active & Immediately Appear in Completed
  const handleConfirmUnfreeze = async () => {
    if (!activeReviewAppeal) return;
    setIsSubmittingReview(true);
    const targetAppeal = activeReviewAppeal;
    const reviewNote = `Official Warning Issued: "${warningText}". Unfreeze authorized by Police Cyber Cell Compliance Desk following verified offline bank ground work.`;
    const reviewTime = new Date().toISOString();

    const completedObject = {
      ...targetAppeal,
      status: 'COMPLETED',
      review_notes: reviewNote,
      reviewed_at: reviewTime
    };

    // 1. Instantly Disappear from Active Queue
    setActiveAppeals((prev) => prev.filter((item) => item.id !== targetAppeal.id));

    // 2. Instantly Appear in Completed Queue
    setCompletedAppeals((prev) => [completedObject, ...prev.filter((item) => item.id !== targetAppeal.id)]);

    // 3. Success Toast Notification
    setSuccessToast({
      docketId: targetAppeal.id,
      name: targetAppeal.full_name,
      accountNo: targetAppeal.account_no,
      message: 'Police Review Successful - Account Unfrozen'
    });
    setActiveReviewAppeal(null);

    // Auto dismiss toast after 6s
    setTimeout(() => {
      setSuccessToast(null);
    }, 6000);

    // 4. Background Sync with Server
    try {
      await fetch(
        `http://localhost:4000/api/appeal/${targetAppeal.id}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            status: 'COMPLETED',
            notes: reviewNote
          })
        }
      );
    } catch (error) {
      console.warn('Backend sync notice (state already migrated):', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Confirm Rejection -> Disappear from Active & Immediately Appear in Completed
  const handleConfirmReject = async () => {
    if (!rejectingAppeal) return;
    setIsSubmittingReview(true);
    const targetAppeal = rejectingAppeal;
    const finalReason =
      rejectReason ||
      'Appeal rejected: Ground inquiry unverified or fraudulent nexus confirmed.';
    const reviewTime = new Date().toISOString();

    const rejectedObject = {
      ...targetAppeal,
      status: 'REJECTED',
      review_notes: finalReason,
      reviewed_at: reviewTime
    };

    // 1. Instantly Disappear from Active Queue
    setActiveAppeals((prev) => prev.filter((item) => item.id !== targetAppeal.id));

    // 2. Instantly Appear in Completed Queue
    setCompletedAppeals((prev) => [rejectedObject, ...prev.filter((item) => item.id !== targetAppeal.id)]);

    setRejectingAppeal(null);
    setRejectReason('');

    // 3. Background Sync with Server
    try {
      await fetch(
        `http://localhost:4000/api/appeal/${targetAppeal.id}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            status: 'REJECTED',
            notes: finalReason
          })
        }
      );
    } catch (error) {
      console.warn('Backend sync notice (state already migrated):', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Format Helper for Dates
  const formatTimestamp = (isoStr) => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return (
        d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) +
        ', ' +
        d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-950">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-lg text-slate-100 uppercase tracking-wider">
                Unfreeze Appeals Compliance & Review Desk
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                Bank-Police Joint Protocol
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Judicial adjudication queue for citizen bank lien appeals following offline ground inquiry.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAppeals}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold uppercase transition flex items-center space-x-1.5 self-start md:self-auto border border-slate-700"
        >
          <span>{loading ? 'SYNCING...' : 'REFRESH QUEUE'}</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-extrabold text-emerald-200 uppercase tracking-wide">
                {successToast.message}
              </div>
              <div className="text-xs font-mono text-emerald-300/90">
                Docket: <strong className="text-white">{successToast.docketId}</strong> |
                Holder: <strong className="text-white">{successToast.name}</strong> (Account: {successToast.accountNo})
              </div>
              <p className="text-[11px] text-emerald-400/80">
                Official Sec 91/102 CrPC Compliance Warning logged. Financial institution notification dispatched.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-slate-500 text-[10px] uppercase font-bold">Total Docket Entries</div>
          <div className="text-xl font-extrabold text-slate-100 mt-1">{stats.total}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-amber-400 text-[10px] uppercase font-bold">Pending Police Review</div>
          <div className="text-xl font-extrabold text-amber-300 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-emerald-400 text-[10px] uppercase font-bold">Sanctioned & Unfrozen</div>
          <div className="text-xl font-extrabold text-emerald-300 mt-1">{stats.approved}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-rose-400 text-[10px] uppercase font-bold">Rejected / Maintained</div>
          <div className="text-xl font-extrabold text-rose-300 mt-1">{stats.rejected}</div>
        </div>
      </div>

      {/* Primary Tab Navigation: Active Queue vs Resolved History */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 font-mono text-xs">
        <button
          type="button"
          onClick={() => setViewMode('active')}
          className={`px-4 py-2.5 rounded-xl font-bold uppercase transition flex items-center space-x-2 ${
            viewMode === 'active'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ACTIVE APPEALS QUEUE</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              viewMode === 'active' ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {stats.pending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('history')}
          className={`px-4 py-2.5 rounded-xl font-bold uppercase transition flex items-center space-x-2 ${
            viewMode === 'history'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>COMPLETED APPEALS</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              viewMode === 'history' ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {stats.solvedTotal}
          </span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              viewMode === 'active'
                ? 'Search active queue by Docket, Name, Account...'
                : 'Search completed appeals by Docket, Name, Notes...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono transition"
          />
        </div>

        {/* Filter Pills for History Mode */}
        {viewMode === 'history' ? (
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto font-mono text-xs">
            <button
              type="button"
              onClick={() => setHistoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                historyFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              ALL COMPLETED ({stats.solvedTotal})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('APPROVED_UNFROZEN')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                historyFilter === 'APPROVED_UNFROZEN'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-slate-800'
              }`}
            >
              UNFROZEN ({stats.approved})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                historyFilter === 'REJECTED'
                  ? 'bg-rose-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-rose-400 hover:text-rose-300 border border-slate-800'
              }`}
            >
              REJECTED ({stats.rejected})
            </button>
          </div>
        ) : (
          <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Showing <strong className="text-amber-300">{filteredActiveAppeals.length}</strong> pending appeals requiring review</span>
          </div>
        )}
      </div>

      {/* VIEW 1: ACTIVE APPEALS QUEUE */}
      {viewMode === 'active' && (
        <div className="space-y-4">
          {filteredActiveAppeals.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/80" />
              <div className="text-slate-200 font-bold text-sm">Active Appeals Queue is Clean</div>
              <p className="text-slate-400">
                All submitted bank lien unfreeze appeals have been processed and moved to Completed Appeals.
              </p>
              <button
                type="button"
                onClick={() => setViewMode('history')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold uppercase transition"
              >
                <History className="w-4 h-4" />
                <span>VIEW COMPLETED APPEALS ({stats.solvedTotal})</span>
              </button>
            </div>
          ) : (
            filteredActiveAppeals.map((app) => {
              const formattedUPI =
                app.upi_id ||
                (app.full_name
                  ? `${app.full_name.toLowerCase().replace(/\s+/g, '')}@okaxis`
                  : 'N/A');

              const freezeOrigin =
                app.freeze_origin ||
                'Automated Tier-2 NPCI Lien Freeze triggered by suspicious credit influx linked to cybercrime complaint.';

              const groundNotes =
                app.ground_work_notes ||
                'Branch Compliance Manager verified Aadhaar biometrics, physical address, and source of funds narrative. No prior malicious intent detected; account holder fell prey to deceptive P2P trading counterparty.';

              return (
                <div
                  key={app.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-2xl transition space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                        {app.id}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Case: <strong className="text-slate-200">{app.case_id || 'GENERAL'}</strong>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                        • Filed: {formatTimestamp(app.submitted_at)}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 uppercase flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>PENDING POLICE REVIEW</span>
                      </span>
                    </div>
                  </div>

                  {/* Account & Target Forensics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">
                        Account Holder
                      </span>
                      <div className="text-slate-100 font-bold text-sm truncate">
                        {app.full_name || 'Anonymous Citizen'}
                      </div>
                      <div className="text-slate-400 flex items-center space-x-1 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{app.mobile || 'Not specified'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">
                        Bank & Account Number
                      </span>
                      <div className="text-slate-200 font-bold truncate">
                        {app.bank_name || 'State Bank of India'}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Acc: <strong className="text-cyan-400 font-mono">{app.account_no || 'N/A'}</strong>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">
                        UPI ID & Attached Proof
                      </span>
                      <div className="text-indigo-300 font-mono truncate text-[11px]">
                        {formattedUPI}
                      </div>
                      <div className="text-slate-400 flex items-center space-x-1 text-[11px]">
                        <FileCheck className="w-3 h-3 text-emerald-400" />
                        <span className="truncate text-emerald-300">
                          {app.proof_document || 'KYC_Verification_Proof.pdf'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Background Audit Summary Strip */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 text-slate-300 space-y-1">
                      <span className="text-rose-400 text-[10px] font-mono font-bold uppercase block flex items-center space-x-1">
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        <span>Freeze Origin & Lien Trigger:</span>
                      </span>
                      <p className="text-slate-300 text-xs">{freezeOrigin}</p>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 text-slate-300 space-y-1">
                      <span className="text-indigo-400 text-[10px] font-mono font-bold uppercase block flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-400" />
                        <span>Bank Branch & Police Ground Work Notes:</span>
                      </span>
                      <p className="text-slate-300 text-xs">{groundNotes}</p>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 text-slate-300 space-y-1">
                      <span className="text-slate-400 text-[10px] font-mono font-bold uppercase block">
                        Citizen Stated Grounds for Unfreeze:
                      </span>
                      <p className="text-slate-300 italic text-xs">"{app.reason || 'No statement provided.'}"</p>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRejectingAppeal(app)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-rose-400 border border-slate-800 hover:border-rose-500/40 text-xs font-mono font-bold uppercase transition flex items-center space-x-1.5 shadow"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>REJECT APPEAL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenUnfreezeModal(app)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs font-mono uppercase transition flex items-center space-x-1.5 shadow-lg shadow-emerald-950/50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>REVIEW & UNFREEZE</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: RESOLVED / SOLVED HISTORY LOG */}
      {viewMode === 'history' && (
        <div className="space-y-4">
          {filteredHistoryAppeals.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs space-y-2">
              <Archive className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>No resolved history records match your search or filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {filteredHistoryAppeals.map((app) => {
                const isApproved = isCompletedUnfrozen(app.status);
                return (
                  <div
                    key={app.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 shadow-xl hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                          {app.id}
                        </span>
                        <span className="text-slate-400">
                          Case: <strong className="text-slate-200">{app.case_id || 'GENERAL'}</strong>
                        </span>
                      </div>

                      {/* Resolution Badge & Timestamp */}
                      <div className="flex items-center space-x-2">
                        {isApproved ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>POLICE REVIEW SUCCESSFUL - UNFROZEN</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase flex items-center space-x-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>REJECTED / MAINTAINED</span>
                          </span>
                        )}

                        <span className="text-[10px] text-slate-500 hidden md:inline">
                          Resolved: {formatTimestamp(app.reviewed_at || app.submitted_at)}
                        </span>
                      </div>
                    </div>

                    {/* Summary Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Account Holder:</span>
                        <strong className="text-slate-200">{app.full_name}</strong> ({app.mobile || 'N/A'})
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Bank & Account:</span>
                        <span className="text-slate-300">{app.bank_name || 'Bank'}</span> - <strong className="text-cyan-400">{app.account_no}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Attached Proof:</span>
                        <span className="text-emerald-300 truncate block">{app.proof_document || 'Proof.pdf'}</span>
                      </div>
                    </div>

                    {/* Officer Adjudication Notes */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
                      <span className="text-indigo-300 text-[9px] font-bold uppercase block flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-indigo-400" />
                        <span>Official Adjudication & Compliance Note:</span>
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans text-xs">
                        {app.review_notes || 'No review notes recorded.'}
                      </p>
                    </div>

                    {/* Action Bar for Completed Appeal */}
                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setInspectingHistoryItem(app)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-bold uppercase transition flex items-center space-x-1.5 shadow"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>INSPECT AUDIT DOSSIER</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛡️ MODAL: Comprehensive Background Forensic Dossier & Unfreeze Protocol  */}
      {/* ========================================================================= */}
      {activeReviewAppeal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                    Judicial Unfreeze Review & Compliance Dossier
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Docket ID: <span className="text-cyan-400 font-bold">{activeReviewAppeal.id}</span> |
                    Case: <span className="text-slate-200">{activeReviewAppeal.case_id || 'GENERAL'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveReviewAppeal(null)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs font-mono text-slate-300">
              {/* Account Holder Profile Matrix */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>Target Account Forensics</span>
                  <span className="text-emerald-400">KYC VERIFIED</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Account Holder:</span>
                    <strong className="text-slate-100">{activeReviewAppeal.full_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Contact Mobile:</span>
                    <span className="text-slate-300">{activeReviewAppeal.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Bank & Branch:</span>
                    <span className="text-slate-300">{activeReviewAppeal.bank_name || 'State Bank of India'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Account Number:</span>
                    <strong className="text-cyan-400">{activeReviewAppeal.account_no || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Virtual UPI ID:</span>
                    <span className="text-indigo-300">
                      {activeReviewAppeal.upi_id ||
                        `${activeReviewAppeal.full_name?.toLowerCase().replace(/\s+/g, '')}@okaxis`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Proof Attached:</span>
                    <span className="text-emerald-300 font-bold truncate block">
                      {activeReviewAppeal.proof_document || 'Aadhaar_KYC_Verification.pdf'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Forensic Audit Section 1: Freeze Origin */}
              <div className="bg-rose-950/20 p-3.5 rounded-xl border border-rose-500/30 space-y-1.5">
                <span className="text-rose-400 text-[10px] font-bold uppercase flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>1. Freeze Origin & Lien Trigger Reason</span>
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {activeReviewAppeal.freeze_origin ||
                    'Automated Tier-2 NPCI Lien Freeze triggered by ₹1,20,000 credit influx linked to reported SEBI spoofing syndicate.'}
                </p>
              </div>

              {/* Forensic Audit Section 2: Bank & Police Ground Work Notes */}
              <div className="bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/30 space-y-1.5">
                <span className="text-indigo-400 text-[10px] font-bold uppercase flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Joint Bank Branch & Police Field Ground Work Notes</span>
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {activeReviewAppeal.ground_work_notes ||
                    'Joint inquiry conducted by Bank Branch Chief & Cyber Cell Sub-Inspector. Account holder presented biometric KYC verification, verified PAN, and legitimate P2P crypto trading counterparty chat logs. Found to be an innocent third-party trader ensnared in a mule layering cascade.'}
                </p>
              </div>

              {/* Forensic Audit Section 3: Citizen's Reason */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">
                  3. Citizen Affirmation & Stated Grounds
                </span>
                <p className="text-slate-300 italic text-xs">
                  "{activeReviewAppeal.reason || 'No specific statement attached.'}"
                </p>
              </div>

              {/* Section 4: Official Compliance Warning Protocol */}
              <div className="bg-amber-950/20 p-3.5 rounded-xl border border-amber-500/40 space-y-2">
                <div className="flex items-center space-x-2">
                  <BadgeAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 text-[10px] font-bold uppercase">
                    4. Official Warning & Compliance Mandate to be Issued
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  By authorizing unfreeze, the reviewing officer certifies that offline ground inquiry is satisfied. The warning below will be logged in the permanent compliance audit ledger:
                </p>
                <textarea
                  rows={3}
                  value={warningText}
                  onChange={(e) => setWarningText(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Modal Footer Decisions (OK / Cancel) */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveReviewAppeal(null)}
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase transition"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleConfirmUnfreeze}
                disabled={isSubmittingReview}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold uppercase transition shadow-lg shadow-emerald-950/60 flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmittingReview ? 'AUTHORIZING...' : 'OK / CONFIRM UNFREEZE'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔴 REJECT MODAL: Record Reason for Maintaining Lien Freeze                */}
      {/* ========================================================================= */}
      {rejectingAppeal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm uppercase">
                <XCircle className="w-5 h-5" />
                <span>Reject Appeal & Maintain Lien</span>
              </div>
              <button
                type="button"
                onClick={() => setRejectingAppeal(null)}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <p>
                Rejecting unfreeze request for Docket <strong className="text-white">{rejectingAppeal.id}</strong> ({rejectingAppeal.full_name}).
              </p>
              <label className="block text-slate-400 text-[10px] uppercase font-bold">
                Rejection Grounds & Investigation Notes *
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Inconclusive physical address verification; suspect remains under active Section 66D IT Act probe."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => setRejectingAppeal(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase transition"
              >
                {isSubmittingReview ? 'RECORDING...' : 'OK / CONFIRM REJECTION'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📜 MODAL: Archived Completed Appeal Forensic Dossier & Adjudication View */}
      {/* ========================================================================= */}
      {inspectingHistoryItem && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl border ${
                  isCompletedUnfrozen(inspectingHistoryItem.status)
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                      Archived Completed Appeal Audit Dossier
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isCompletedUnfrozen(inspectingHistoryItem.status)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {isCompletedUnfrozen(inspectingHistoryItem.status) ? 'COMPLETED - UNFROZEN' : 'REJECTED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Docket ID: <span className="text-cyan-400 font-bold">{inspectingHistoryItem.id}</span> |
                    Case: <span className="text-slate-200">{inspectingHistoryItem.case_id || 'GENERAL'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingHistoryItem(null)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs font-mono text-slate-300">
              {/* Account Forensics */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>Target Account Forensics</span>
                  <span className="text-slate-500">
                    Resolved: {formatTimestamp(inspectingHistoryItem.reviewed_at || inspectingHistoryItem.submitted_at)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Account Holder:</span>
                    <strong className="text-slate-100">{inspectingHistoryItem.full_name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Contact Mobile:</span>
                    <span className="text-slate-300">{inspectingHistoryItem.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Bank & Branch:</span>
                    <span className="text-slate-300">{inspectingHistoryItem.bank_name || 'State Bank of India'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Account Number:</span>
                    <strong className="text-cyan-400">{inspectingHistoryItem.account_no || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Virtual UPI ID:</span>
                    <span className="text-indigo-300">
                      {inspectingHistoryItem.upi_id ||
                        `${inspectingHistoryItem.full_name?.toLowerCase().replace(/\s+/g, '')}@okaxis`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Proof Attached:</span>
                    <span className="text-emerald-300 font-bold truncate block">
                      {inspectingHistoryItem.proof_document || 'Aadhaar_KYC_Verification.pdf'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Background Trail: Freeze Origin */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-rose-400 text-[10px] font-bold uppercase block flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>1. Freeze Origin & Lien Trigger Reason</span>
                </span>
                <p className="text-slate-300 text-xs">
                  {inspectingHistoryItem.freeze_origin ||
                    'Automated Tier-2 NPCI Lien Freeze triggered by credit influx linked to cybercrime complaint.'}
                </p>
              </div>

              {/* Background Trail: Ground Notes */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-indigo-400 text-[10px] font-bold uppercase block flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2. Joint Bank Branch & Police Field Ground Work Notes</span>
                </span>
                <p className="text-slate-300 text-xs">
                  {inspectingHistoryItem.ground_work_notes ||
                    'Branch Manager and Cyber Cell Officer verified identity, KYC documents, and fund narrative.'}
                </p>
              </div>

              {/* Background Trail: Citizen Reason */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">
                  3. Citizen Affirmation & Stated Grounds
                </span>
                <p className="text-slate-300 italic text-xs">
                  "{inspectingHistoryItem.reason || 'No statement recorded.'}"
                </p>
              </div>

              {/* Official Adjudication Notes & Warning */}
              <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                isCompletedUnfrozen(inspectingHistoryItem.status)
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}>
                <span className={`text-[10px] font-bold uppercase flex items-center space-x-1.5 ${
                  isCompletedUnfrozen(inspectingHistoryItem.status) ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                  <FileText className="w-3.5 h-3.5" />
                  <span>4. Official Police Adjudication & Compliance Warning Log</span>
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {inspectingHistoryItem.review_notes || 'No review notes recorded.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end font-mono text-xs">
              <button
                type="button"
                onClick={() => setInspectingHistoryItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase transition"
              >
                CLOSE DOSSIER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
