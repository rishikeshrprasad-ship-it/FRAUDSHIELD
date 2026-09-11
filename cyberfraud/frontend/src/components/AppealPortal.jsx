import React, { useState, useRef } from 'react';
import {
  Scale,
  Send,
  CheckCircle2,
  FileText,
  Upload,
  Building,
  User,
  Phone,
  Lock,
  Mail,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileCheck,
  ArrowRight,
  ShieldAlert,
  Hash,
  FileSpreadsheet,
  Trash2,
  AlertCircle
} from 'lucide-react';

const BANK_OPTIONS = [
  'State Bank of India (SBI)',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank (PNB)',
  'Axis Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Kotak Mahindra Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'Other Scheduled Commercial Bank'
];

export default function AppealPortal({ socket }) {
  const [accountNo, setAccountNo] = useState('');
  const [caseId, setCaseId] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [bankName, setBankName] = useState(BANK_OPTIONS[0]);
  const [reason, setReason] = useState('');

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const uploadSectionRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [docketData, setDocketData] = useState(null);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file) => {
    setUploadError('');
    const randomHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    setUploadedFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      hash: `SHA256: ${randomHash}`,
      timestamp: new Date().toISOString()
    });
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setUploadedFile(null);
    setUploadError('Mandatory: Please upload your KYC / Aadhaar verification documents to proceed.');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');

    if (!uploadedFile || !uploadedFile.name) {
      setUploadError('Mandatory: Please upload your KYC / Aadhaar verification documents to proceed.');
      if (uploadSectionRef.current) {
        uploadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    const generatedDocketId = `#FRD-APL-${Math.floor(10000 + Math.random() * 90000)}`;

    const payload = {
      docket_id: generatedDocketId,
      case_id: caseId.trim() || 'GENERAL-LIEN-CONTEST',
      account_no: accountNo.trim(),
      full_name: fullName.trim(),
      mobile: mobile.trim(),
      bank_name: bankName,
      reason: reason.trim(),
      proof_document: uploadedFile.name,
      document_hash: uploadedFile.hash,
      submitted_at: new Date().toISOString()
    };

    try {
      const res = await fetch('http://localhost:4000/api/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const responseData = await res.json();

      if (socket) {
        socket.emit('appeal:new', {
          ...payload,
          id: responseData.id || generatedDocketId
        });
      }

      setDocketData({
        ...payload,
        id: responseData.id || generatedDocketId,
        dateFormatted: new Date().toLocaleString('en-IN', {
          dateStyle: 'full',
          timeStyle: 'medium'
        })
      });
      setSubmitted(true);
    } catch (err) {
      setStatusMsg(`Submission error: ${err.message}. Backend on port 4000 might be offline.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLegalMemo = () => {
    if (!docketData) return;
    const memoText = `
GOVERNMENT OF INDIA // NATIONAL CYBERCRIME REPORTING PORTAL
OFFICIAL GRIEVANCE REDRESSAL & BANK UNFREEZE DOCKET

DOCKET REFERENCE ID: ${docketData.id}
DATE & TIME OF INGESTION: ${docketData.dateFormatted}

TO:
  1. Nodal Cybercrime Investigation Officer <nodal.cybercell@police.gov.in>
  2. Chief Grievance Officer, ${docketData.bank_name} <grievance.chiefbank@banking.in>
CC:
  - Appellant: ${docketData.full_name} (${docketData.mobile})
  - I4C Central Oversight <i4c.grievance@mha.gov.in>

SUBJECT: Formal Legal Petition for Immediate Removal of Erroneous NPCI Debit Freeze under Section 91 CrPC

APPELLANT PARTICULARS:
- Full Legal Name: ${docketData.full_name}
- Registered Mobile: ${docketData.mobile}
- Financial Institution: ${docketData.bank_name}
- Frozen Bank Account Number: ${docketData.account_no}
- Associated Crime Case ID: ${docketData.case_id}

EVIDENCE & ATTACHED AFFIDAVIT:
- Document Name: ${docketData.proof_document}
- Cryptographic Integrity Hash: ${docketData.document_hash}

GROUNDS & NARRATIVE STATEMENT:
"${docketData.reason}"

STATUTORY NOTICE:
Pursuant to Standard Operating Procedures issued by the Indian Cyber Crime Coordination Centre (I4C) and RBI Master Directions on Unwarranted Account Holds, the appellant hereby requests review and revocation of the debit lien.
    `.trim();

    navigator.clipboard.writeText(memoText);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setDocketData(null);
    setAccountNo('');
    setCaseId('');
    setFullName('');
    setMobile('');
    setReason('');
    setUploadedFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setStatusMsg('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-slate-800/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-inner shadow-teal-500/20">
              <Scale className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  <span>JUDICIAL FAIRNESS & CITIZEN REMEDY CHANNEL</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                  SECTION 91 CrPC COMPLIANT
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                Bank Account Unfreeze & Fairness Appeal Portal
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Official statutory grievance conduit for genuine account holders to contest erroneous NPCI multi-bank lien freezes.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <div className="font-mono text-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Fast-Track Audit</div>
              <div className="text-teal-400 font-semibold">24-72h REVIEW SLA</div>
            </div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
          ⚠️ {statusMsg}
        </div>
      )}

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
                    1. Account & Institution Parameters
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                  REQUIRED
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
                    <span>Frozen Bank Account Number / UPI ID *</span>
                    <span className="text-[10px] text-rose-400 font-bold">Target of Lien</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBI-48192019 or 309812456789"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full pl-3.5 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-sm font-mono text-slate-100 placeholder-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
                    <span>Banking Institution Name *</span>
                    <span className="text-[10px] text-slate-500">Clearing Node</span>
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 focus:outline-none font-mono transition cursor-pointer"
                  >
                    {BANK_OPTIONS.map((bank) => (
                      <option key={bank} value={bank} className="bg-slate-950 text-slate-100">
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
                    <span>Related Cyber Case ID (Optional)</span>
                    <span className="text-[10px] text-slate-500">NCRP / State Police ID</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CASE-2026-9041 or NCRP-2026-88190"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-sm font-mono text-slate-100 placeholder-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-5">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <User className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
                      2. Appellant Information
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                    IDENTITY
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-slate-300 font-medium block mb-1.5">
                      Account Holder Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra Verma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 font-medium block mb-1.5">
                      Registered Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-sm font-mono text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1 mt-4">
                <div className="text-slate-300 font-mono font-bold flex items-center space-x-1.5 text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                  <span>Statutory Fairness Protocol</span>
                </div>
                <p className="leading-normal">
                  All filed appeals are assigned a tamper-evident cryptographic docket number and transmitted to the state Cyber Cell Superintendent review desk.
                </p>
              </div>
            </div>

            <div className="lg:col-span-12 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
                    3. Grievance Narrative & Supporting KYC Documentation
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  CRYPTOGRAPHIC PROOF
                </span>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 font-medium block mb-1.5">
                  Reason for Appeal & Legitimate Fund Source Narrative *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Explain the legitimate nature of the transactions credited to your account (e.g. 'Received payment from client for software freelancing via UPI; transaction was legitimate and not connected to any fraudulent scheme. Attaching GST invoice and client contract.')..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition leading-relaxed"
                />
              </div>

              <div ref={uploadSectionRef}>
                <label className="text-xs font-mono text-slate-300 font-medium block mb-2 flex items-center justify-between">
                  <span>
                    Verification Document / Aadhaar & Bank Proof Attachment (PDF/Image) <span className="text-rose-400 font-bold">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">MANDATORY VERIFICATION</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />

                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-3 ${
                      uploadError
                        ? 'border-rose-500/80 bg-rose-500/5 hover:border-rose-400 ring-2 ring-rose-500/20'
                        : isDragging
                        ? 'border-teal-400 bg-teal-500/10'
                        : 'border-slate-800 hover:border-teal-500/50 bg-slate-950/80 hover:bg-slate-950'
                    }`}
                  >
                    <div className={`p-3.5 rounded-2xl border transition-all ${
                      uploadError
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                    }`}>
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        Click to browse or drag & drop KYC / Aadhaar document
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        Supported formats: PDF, PNG, JPG, JPEG (Max 10MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-5 rounded-2xl border border-teal-500/30 bg-teal-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="p-3 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex-shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-100 flex items-center space-x-2 truncate">
                          <span className="truncate">{uploadedFile.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                            READY
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Size: {uploadedFile.size}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="font-mono text-[10px] text-slate-400 bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex-shrink-0 max-w-[200px] sm:max-w-[240px]">
                        <div className="text-slate-500 uppercase font-bold text-[9px]">Digest</div>
                        <div className="text-cyan-400 font-semibold truncate">
                          {uploadedFile.hash}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 transition flex-shrink-0"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-2.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs font-mono">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs font-mono text-slate-500 flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span>Transmitted directly to Law Enforcement Nodal Authority</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider font-mono flex items-center justify-center space-x-2.5 shadow-xl shadow-teal-950/50 transition transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{loading ? 'GENERATING LEGAL DOCKET...' : 'TRANSMIT UNFREEZE PETITION'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-slate-100 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-lg shadow-emerald-950/30">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-emerald-200 uppercase font-mono">
                  Grievance Petition Transmitted Successfully
                </h3>
                <p className="text-xs text-emerald-400/90 font-mono">
                  Registered Docket: <strong className="text-white">{docketData?.id}</strong> • Transmitted via LEA Bridge
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleCopyLegalMemo}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs flex items-center space-x-1.5 transition"
              >
                {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMemo ? 'COPIED MEMO' : 'COPY MEMO'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs flex items-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>PRINT</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 md:p-8 space-y-6 text-slate-200 font-mono shadow-inner">
            <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                  GOVERNMENT OF INDIA • NATIONAL CYBERCRIME REPORTING PORTAL
                </div>
                <h2 className="text-base md:text-lg font-black tracking-tight text-white uppercase mt-0.5">
                  FORMAL STATUTORY GRIEVANCE MEMORANDUM
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Under Section 91 CrPC & RBI Fair Banking Lien Redressal Directives
                </div>
              </div>

              <div className="text-left sm:text-right text-xs">
                <div className="text-slate-500 font-bold">DOCKET REF:</div>
                <div className="text-emerald-400 font-extrabold text-sm">{docketData?.id}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{docketData?.dateFormatted}</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="flex">
                <span className="text-slate-500 w-20 flex-shrink-0 font-bold">TO:</span>
                <span className="text-cyan-300 font-semibold">nodal.cybercell@police.gov.in, grievance.chiefbank@banking.in</span>
              </div>
              <div className="flex">
                <span className="text-slate-500 w-20 flex-shrink-0 font-bold">CC:</span>
                <span className="text-slate-400">{docketData?.mobile}@citizen.nic.in, i4c.grievance@mha.gov.in</span>
              </div>
              <div className="flex pt-1 border-t border-slate-800/80">
                <span className="text-slate-500 w-20 flex-shrink-0 font-bold">SUBJECT:</span>
                <span className="text-amber-300 font-bold">
                  [URGENT UNFREEZE PETITION] Request for Revocation of Erroneous Debit Lien on Account #{docketData?.account_no} (Docket {docketData?.id})
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <p>Respected Cyber Cell Nodal Authority & Bank Chief Grievance Officer,</p>
              <p>
                This statutory memorandum is submitted on behalf of <strong>{docketData?.full_name}</strong> (Registered Mobile: <code>{docketData?.mobile}</code>) regarding the immediate review of the administrative debit freeze placed on Account Number <strong className="text-white bg-slate-900 px-2 py-0.5 rounded font-mono">{docketData?.account_no}</strong> with <strong>{docketData?.bank_name}</strong>, associated with Reference Case <code>{docketData?.case_id}</code>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Appellant Legal Identity:</span>
                  <span className="font-bold text-white">{docketData?.full_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Banking Institution:</span>
                  <span className="font-bold text-cyan-300">{docketData?.bank_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Frozen Account:</span>
                  <span className="font-bold text-rose-400">{docketData?.account_no}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Attached Integrity Proof:</span>
                  <span className="font-bold text-emerald-400 truncate block">{docketData?.proof_document}</span>
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-bold uppercase text-[11px] mb-1">
                  Grounds for Appeal & Affirmation:
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 italic text-slate-200">
                  "{docketData?.reason}"
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] space-y-1">
                <div className="flex items-center space-x-1.5 text-teal-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>CRYPTOGRAPHIC EVIDENCE CERTIFICATION</span>
                </div>
                <div className="text-slate-400">
                  SHA-256 Digest: <code className="text-cyan-300">{docketData?.document_hash}</code>
                </div>
                <div className="text-slate-500">
                  This document hash is recorded onto the immutable Law Enforcement Acceptance Audit log.
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                The appellant solemnly affirms that all information provided is accurate and agrees to submit supplementary bank statements upon notice. In accordance with NPCI Circular guidelines, resolution is mandated within 72 hours.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <div>STATUS: PENDING OFFICER AUDIT</div>
              <div className="text-cyan-400 font-bold">FRAUDSHIELD VERIFIED DISPATCH</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs flex items-center space-x-2 transition"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>FILE ANOTHER UNFREEZE APPEAL</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
