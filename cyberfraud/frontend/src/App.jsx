import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// Components
import TopBar from './components/TopBar.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import CaseFileBoard from './components/CaseFileBoard.jsx';
import CaseDetailPanel from './components/CaseDetailPanel.jsx';
import FileFraudCase from './components/FileFraudCase.jsx';
import PredictionMap from './components/PredictionMap.jsx';
import PublicHeatmapView from './components/PublicHeatmapView.jsx';
import BranchHeatmap from './components/BranchHeatmap.jsx';
import BranchDetailModal from './components/BranchDetailModal.jsx';
import DeviceGraphView from './components/DeviceGraphView.jsx';
import TellerShieldPanel from './components/TellerShieldPanel.jsx';
import QRScamScanner from './components/QRScamScanner.jsx';
import DomainWatchPanel from './components/DomainWatchPanel.jsx';
import RecruitmentWatchPanel from './components/RecruitmentWatchPanel.jsx';
import VictimTracker from './components/VictimTracker.jsx';
import AppealPortal from './components/AppealPortal.jsx';
import AppealReviewQueue from './components/AppealReviewQueue.jsx';
import AcceptanceAuditView from './components/AcceptanceAuditView.jsx';
import ChiefApprovalQueue from './components/ChiefApprovalQueue.jsx';
import CitizenPortal from './components/CitizenPortal.jsx';
import MissionLog from './components/MissionLog.jsx';

const BACKEND_URL = 'http://localhost:4000';

export default function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentRole, setCurrentRole] = useState('CITIZEN');
  const [showAuth, setShowAuth] = useState(false);

  // Dashboard State
  const [activeTab, setActiveTab] = useState('scanner');
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Officer GPS
  const [isOfficerSharing, setIsOfficerSharing] = useState(false);
  const gpsIntervalRef = useRef(null);

  // Socket.io
  const socketRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[FraudShield] Socket connected:', socket.id);
    });

    // Listen for new cases
    socket.on('case:new', (newCase) => {
      setCases((prev) => {
        const exists = prev.some((c) => c.id === newCase.id);
        if (exists) return prev;
        return [newCase, ...prev];
      });
    });

    // Listen for updated cases
    socket.on('case:updated', (updatedCase) => {
      setCases((prev) =>
        prev.map((c) => (c.id === updatedCase.id ? updatedCase : c))
      );
      // Also update selectedCase if open
      setSelectedCase((prev) =>
        prev && prev.id === updatedCase.id ? updatedCase : prev
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch initial cases
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/cases`)
      .then((res) => res.json())
      .then((data) => setCases(data))
      .catch((err) => console.error('Failed to fetch cases:', err));
  }, []);

  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('fraudshield_token');
    if (savedToken && savedToken.startsWith('MOCK_AEGIS_TOKEN_')) {
      // Aegis mock token — restore from local state only
      return;
    }
    if (savedToken) {
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUser({ id: payload.id, username: payload.username, role: payload.role, name: payload.name });
        setToken(savedToken);
        setCurrentRole(payload.role || 'CITIZEN');
        setActiveTab(payload.role === 'CITIZEN' ? 'scanner' : 'case_board');
      } catch (e) {
        localStorage.removeItem('fraudshield_token');
      }
    }
  }, []);

  // Handle login success
  const handleLoginSuccess = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    const role = userData.role || 'CITIZEN';
    setCurrentRole(role);
    setActiveTab(role === 'CITIZEN' ? 'scanner' : 'case_board');
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    setCurrentRole('CITIZEN');
    setActiveTab('scanner');
    localStorage.removeItem('fraudshield_token');
    setIsOfficerSharing(false);
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
  }, []);

  // Claim case handler
  const handleClaimCase = useCallback(async (caseId) => {
    if (!token) {
      setShowAuth(true);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/case/${caseId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error('Claim error:', errData.error);
      }
    } catch (err) {
      console.error('Claim failed:', err);
    }
  }, [token]);

  // Officer GPS toggle
  const handleToggleOfficerShare = useCallback(() => {
    if (isOfficerSharing) {
      // Stop sharing
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current);
        gpsIntervalRef.current = null;
      }
      setIsOfficerSharing(false);
    } else {
      // Start sharing at 1Hz
      setIsOfficerSharing(true);
      gpsIntervalRef.current = setInterval(() => {
        if (socketRef.current && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              socketRef.current.emit('officer:location_broadcast', {
                officer_id: user?.id || 'officer_unknown',
                name: user?.name || 'Officer',
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              });
            },
            () => {
              // Fallback: emit mock Delhi NCR coords
              socketRef.current.emit('officer:location_broadcast', {
                officer_id: user?.id || 'officer_unknown',
                name: user?.name || 'Officer',
                latitude: 28.6139 + (Math.random() - 0.5) * 0.05,
                longitude: 77.2090 + (Math.random() - 0.5) * 0.05
              });
            }
          );
        }
      }, 1000);
    }
  }, [isOfficerSharing, user]);

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => {
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current);
      }
    };
  }, []);

  const isCitizen = currentRole === 'CITIZEN';

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      // Citizen-accessible tabs
      case 'scanner':
        return <QRScamScanner />;
      case 'file_case':
        return <FileFraudCase onCaseReported={(c) => setCases((prev) => [c, ...prev])} />;
      case 'teller':
        return <TellerShieldPanel socket={socketRef.current} />;
      case 'victim_tracker':
        return <VictimTracker cases={cases} />;
      case 'public_heatmap':
        return <PublicHeatmapView />;
      case 'appeal_portal':
        return <AppealPortal />;

      // Official-only tabs
      case 'case_board':
        return (
          <div className="space-y-6">
            <CaseFileBoard
              cases={cases}
              onSelectCase={setSelectedCase}
              onClaimCase={handleClaimCase}
              currentRole={currentRole}
            />
            {selectedCase && <PredictionMap caseItem={selectedCase} />}
          </div>
        );
      case 'branch_map':
        return (
          <BranchHeatmap
            socket={socketRef.current}
            onSelectBranch={setSelectedBranch}
          />
        );
      case 'device_graph':
        return <DeviceGraphView caseId={selectedCase?.id || 'CASE-2026-9041'} />;
      case 'domain_watch':
        return <DomainWatchPanel />;
      case 'recruitment_watch':
        return <RecruitmentWatchPanel socket={socketRef.current} />;
      case 'appeal_queue':
        return <AppealReviewQueue token={token} />;
      case 'chief_queue':
        return <ChiefApprovalQueue cases={cases} token={token} />;
      case 'acceptance_audit':
        return <AcceptanceAuditView />;
      case 'mission_log':
        return <MissionLog socket={socketRef.current} />;

      default:
        if (isCitizen) {
          return <CitizenPortal activeTab={activeTab} setActiveTab={setActiveTab} />;
        }
        return <CaseFileBoard cases={cases} onSelectCase={setSelectedCase} onClaimCase={handleClaimCase} currentRole={currentRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <TopBar
        currentRole={currentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setShowAuth(true)}
        onLogout={handleLogout}
        isOfficerSharing={isOfficerSharing}
        onToggleOfficerShare={!isCitizen ? handleToggleOfficerShare : null}
      />

      {/* Main Dashboard Content Area */}
      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        {renderTabContent()}
      </main>

      {/* Auth Modal */}
      <AuthScreen
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Case Detail Drawer */}
      {selectedCase && (
        <CaseDetailPanel
          caseItem={selectedCase}
          onClose={() => setSelectedCase(null)}
          onClaimCase={handleClaimCase}
          currentRole={currentRole}
          token={token}
        />
      )}

      {/* Branch Detail Modal */}
      {selectedBranch && (
        <BranchDetailModal
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
}
