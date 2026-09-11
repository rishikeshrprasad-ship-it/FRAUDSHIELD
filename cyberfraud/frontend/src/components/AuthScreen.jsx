import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, UserCheck, Building, ShieldAlert, KeyRound, User } from 'lucide-react';
import AegisLogin from './AegisLogin.jsx';

export default function AuthScreen({ isOpen, onClose, onLoginSuccess }) {
  const [accessMode, setAccessMode] = useState('CITIZEN'); // CITIZEN or OFFICIAL
  const [officialRole, setOfficialRole] = useState('POLICE'); // POLICE, BRANCH STAFF, CHIEF / ADMIN
  const [authType, setAuthType] = useState('LOGIN'); // LOGIN or REGISTER
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = authType === 'LOGIN' ? '/api/auth/login' : '/api/auth/register';
      const roleToSubmit = accessMode === 'CITIZEN' ? 'CITIZEN' : officialRole;

      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          name: name || username,
          role: roleToSubmit
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('fraudshield_token', data.token);
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAegisSuccess = (biometricUser) => {
    const mockToken = 'MOCK_AEGIS_TOKEN_' + Date.now();
    localStorage.setItem('fraudshield_token', mockToken);
    onLoginSuccess(biometricUser, mockToken);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100 my-8">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-wider text-slate-100">AUTHENTICATION GATEWAY</h2>
              <p className="text-xs text-slate-400 font-mono">FraudShield Multi-Role Access Control System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Toggle: CITIZEN PORTAL vs OFFICIAL ACCESS */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => setAccessMode('CITIZEN')}
            className={`py-2.5 rounded-lg flex items-center justify-center space-x-2 transition ${
              accessMode === 'CITIZEN'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>CITIZEN PORTAL</span>
          </button>
          <button
            type="button"
            onClick={() => setAccessMode('OFFICIAL')}
            className={`py-2.5 rounded-lg flex items-center justify-center space-x-2 transition ${
              accessMode === 'OFFICIAL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>OFFICIAL ACCESS</span>
          </button>
        </div>

        {/* Official Role Selectors */}
        {accessMode === 'OFFICIAL' && (
          <div className="space-y-3">
            <label className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider block">
              Select Official Role Category:
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {[
                { id: 'POLICE', label: 'POLICE OFFICER', icon: ShieldAlert },
                { id: 'BRANCH STAFF', label: 'BANK TELLER', icon: Building },
                { id: 'CHIEF / ADMIN', label: 'CHIEF ADMIN', icon: UserCheck }
              ].map((role) => {
                const Icon = role.icon;
                const selected = officialRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setOfficialRole(role.id)}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition ${
                      selected
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold shadow-md'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Render Aegis 3-Stage Biometric Component for Official Hardware Auth Option */}
            <div className="mt-4">
              <AegisLogin selectedRole={officialRole} onAuthSuccess={handleAegisSuccess} />
            </div>
          </div>
        )}

        {/* Standard Password Auth Form (Available for both Citizen and Official) */}
        {accessMode === 'CITIZEN' && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-mono text-slate-400">Standard Credentials Sign-in</span>
              <div className="space-x-3 font-mono">
                <button
                  type="button"
                  onClick={() => setAuthType('LOGIN')}
                  className={authType === 'LOGIN' ? 'text-cyan-400 font-bold underline' : 'text-slate-500'}
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => setAuthType('REGISTER')}
                  className={authType === 'REGISTER' ? 'text-cyan-400 font-bold underline' : 'text-slate-500'}
                >
                  REGISTER
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
                ⚠️ {errorMsg}
              </div>
            )}

            {authType === 'REGISTER' && (
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Username / Mobile</label>
              <input
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-950 transition transform active:scale-95"
            >
              {loading ? 'AUTHENTICATING...' : authType === 'LOGIN' ? 'LOGIN TO CITIZEN PORTAL' : 'CREATE CITIZEN ACCOUNT'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
