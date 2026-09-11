import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Lock,
  UserCheck,
  ShieldAlert,
  Zap,
  User,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:4000';

const DEMO_PROFILES = [
  {
    id: 'police',
    role: 'POLICE',
    title: 'Police Cyber Officer',
    name: 'Sub-Inspector Rahul Kumar',
    username: 'officer_rahul',
    password: 'Password@123',
    badge: 'INVESTIGATION COMMAND',
    color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/40',
    iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: ShieldAlert
  },
  {
    id: 'chief',
    role: 'CHIEF / ADMIN',
    title: 'Chief Admin / Commander',
    name: 'Inspector General V. Sharma',
    username: 'chief_admin',
    password: 'Password@123',
    badge: 'EXECUTIVE COMMAND',
    color: 'border-purple-500/40 bg-purple-950/30 text-purple-300 hover:border-purple-400 hover:bg-purple-900/40',
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    icon: UserCheck
  },
  {
    id: 'citizen',
    role: 'CITIZEN',
    title: 'Citizen Portal User',
    name: 'Ramesh Kumar (Citizen)',
    username: 'citizen_demo',
    password: 'Password@123',
    badge: 'SCAN & REPORTING',
    color: 'border-amber-500/40 bg-amber-950/30 text-amber-300 hover:border-amber-400 hover:bg-amber-900/40',
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    icon: User
  }
];

const generateMockJWT = (userData) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      id: userData.id || `usr_${Date.now()}`,
      username: userData.username,
      name: userData.name,
      role: userData.role,
      exp: Math.floor(Date.now() / 1000) + 86400
    })
  );
  const signature = btoa('fraudshield_judge_demo_signature');
  return `${header}.${payload}.${signature}`;
};

export default function AuthScreen({ isOpen, onClose, onLoginSuccess }) {
  const [authTab, setAuthTab] = useState('DIRECT_DEMO');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('CITIZEN');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticatingRoleId, setAuthenticatingRoleId] = useState(null);

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

  const handleQuickDemoLogin = async (profile) => {
    setErrorMsg('');
    setAuthenticatingRoleId(profile.id);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profile.username,
          password: profile.password
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('fraudshield_token', data.token);
        onLoginSuccess(data.user, data.token);
        onClose();
        return;
      }
    } catch (err) {
      console.warn('Direct login fallback activated:', err);
    }

    const fallbackUser = {
      id: `usr_${profile.id}_${Date.now()}`,
      username: profile.username,
      name: profile.name,
      role: profile.role
    };
    const fallbackToken = generateMockJWT(fallbackUser);

    localStorage.setItem('fraudshield_token', fallbackToken);
    onLoginSuccess(fallbackUser, fallbackToken);
    onClose();
    setLoading(false);
    setAuthenticatingRoleId(null);
  };

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = authTab === 'REGISTER' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        authTab === 'REGISTER'
          ? { username, password, name: name || username, role: selectedRole }
          : { username, password };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('fraudshield_token', data.token);
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-slate-100 my-8 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-wider text-slate-100 flex items-center space-x-2">
                <span>AUTHENTICATION GATEWAY</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  V2.6 LIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">FraudShield Multi-Role Access Control & Judge Demo Entry</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthTab('DIRECT_DEMO');
              setErrorMsg('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              authTab === 'DIRECT_DEMO'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ JUDGE DEMO</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab('STANDARD_LOGIN');
              setErrorMsg('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              authTab === 'STANDARD_LOGIN'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>LOGIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab('REGISTER');
              setErrorMsg('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              authTab === 'REGISTER'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>REGISTER</span>
          </button>
        </div>

        {authTab === 'DIRECT_DEMO' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-xs font-mono text-amber-300">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
              <span>
                <strong>Instant Judge Access:</strong> Click any role below for 1-click token injection and immediate command dashboard routing.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_PROFILES.map((profile) => {
                const Icon = profile.icon;
                const isLoggingIn = authenticatingRoleId === profile.id;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickDemoLogin(profile)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg ${profile.color}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl border ${profile.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 uppercase">
                          {profile.badge}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-white">{profile.title}</h4>
                        <p className="text-[11px] text-slate-300 font-mono truncate">{profile.name}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Direct Entry</span>
                      <span className="font-bold flex items-center space-x-1">
                        <span>{isLoggingIn ? 'LOGGING IN...' : 'LAUNCH'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {authTab !== 'DIRECT_DEMO' && (
          <form onSubmit={handleStandardSubmit} className="space-y-4 animate-in fade-in duration-150">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono flex items-center space-x-2">
                <span>⚠️ {errorMsg}</span>
              </div>
            )}

            {authTab === 'REGISTER' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inspector Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">System Role *</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none font-mono"
                  >
                    <option value="CITIZEN">CITIZEN (Public Portal Access)</option>
                    <option value="POLICE">POLICE (Investigation Command Board)</option>
                    <option value="CHIEF / ADMIN">CHIEF / ADMIN (Executive Approvals)</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Username / Mobile ID *</label>
              <input
                type="text"
                required
                placeholder="Enter username (e.g. officer_rahul)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition transform active:scale-95 font-mono ${
                authTab === 'REGISTER'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/50'
              }`}
            >
              {loading
                ? 'AUTHENTICATING...'
                : authTab === 'REGISTER'
                ? 'CREATE OFFICIAL FRAUDSHIELD ACCOUNT'
                : 'AUTHENTICATE & ENTER PORTAL'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
