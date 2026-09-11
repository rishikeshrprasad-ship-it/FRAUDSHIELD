import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  ShieldAlert,
  Search,
  Navigation,
  Radio,
  Zap,
  Filter,
  Layers,
  X,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  DollarSign,
  Globe,
  Satellite,
  Info
} from 'lucide-react';

import { deriveTacticalTelemetry } from '../utils/tacticalTelemetry.js';

const BACKEND_URL = 'http://localhost:4000';
const MIN_ZOOM_FOR_PINGS = 10;

// Tile Providers for Normal vs Satellite Switching (Free, Non-Authenticated & No Watermarks)
const TILE_LAYERS = {
  dark: {
    id: 'dark',
    name: 'Command Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, USGS, METI/NASA, OpenStreetMap contributors',
    maxZoom: 16
  },
  standard: {
    id: 'standard',
    name: 'Standard Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  }
};

// Preset Regional Hotspots across India
const PRESET_REGIONS = [
  { name: 'All India', lat: 21.7679, lng: 78.8718, zoom: 5 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, zoom: 12 },
  { name: 'Mumbai BKC', lat: 19.0760, lng: 72.8777, zoom: 12 },
  { name: 'Bengaluru IT', lat: 12.9716, lng: 77.5946, zoom: 12 },
  { name: 'Hyderabad Cyberabad', lat: 17.3850, lng: 78.4867, zoom: 12 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, zoom: 12 },
  { name: 'Mewat-Jamtara Corridor', lat: 27.8974, lng: 76.9400, zoom: 11 }
];

// Curated Baseline Threat Zones for Macro Radar Overview
const BASELINE_THREAT_ZONES = [
  { id: 'tz_1', name: 'Connaught Place Phishing Corridor', lat: 28.6315, lng: 77.2167, riskLevel: 'CRITICAL', threatCount: 42, city: 'Delhi NCR' },
  { id: 'tz_2', name: 'BKC Digital Arrest Impersonation Hub', lat: 19.0657, lng: 72.8687, riskLevel: 'HIGH', threatCount: 28, city: 'Mumbai' },
  { id: 'tz_3', name: 'MG Road Investment Spoofing Grid', lat: 12.9756, lng: 77.6062, riskLevel: 'ELEVATED', threatCount: 19, city: 'Bengaluru' },
  { id: 'tz_4', name: 'Hitec City Fake Crypto P2P Nodes', lat: 17.4435, lng: 78.3772, riskLevel: 'HIGH', threatCount: 24, city: 'Hyderabad' },
  { id: 'tz_5', name: 'Salt Lake Sector V Telegram Syndicate', lat: 22.5804, lng: 88.4378, riskLevel: 'CRITICAL', threatCount: 35, city: 'Kolkata' },
  { id: 'tz_6', name: 'Bharatpur-Mewat Smishing Triangle', lat: 27.2170, lng: 77.4895, riskLevel: 'CRITICAL', threatCount: 57, city: 'Mewat-Jamtara Corridor' }
];

// Custom Crimson Threat Hotspot Pin Icon
const createC2Icon = (isSelected = false) => {
  const size = isSelected ? 34 : 26;
  return L.divIcon({
    className: 'tactical-c2-pin',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;background:#e11d48;border:2.5px solid ${isSelected ? '#ffffff' : '#fecdd3'};border-radius:50%;color:#ffffff;box-shadow:0 0 14px rgba(225,29,72,0.9);cursor:pointer;">
        <span style="position:absolute;width:100%;height:100%;border-radius:50%;border:2px solid #f43f5e;animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <svg width="${size > 28 ? 15 : 12}" height="${size > 28 ? 15 : 12}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Custom Orange ATM Cash-Out Pin Icon
const createATMIcon = (isSelected = false) => {
  const size = isSelected ? 32 : 24;
  return L.divIcon({
    className: 'tactical-atm-pin',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;background:#f97316;border:2px solid ${isSelected ? '#ffffff' : '#ffedd5'};border-radius:50%;color:#ffffff;box-shadow:0 0 12px rgba(249,115,22,0.9);cursor:pointer;">
        <svg width="${size > 26 ? 14 : 11}" height="${size > 26 ? 14 : 11}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Map Viewport Controller: Handles flyTo, invalidates size on mount, and monitors zoom/bounds
function MapViewController({ targetCenter, targetZoom, onBoundsChange, onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (targetCenter && Array.isArray(targetCenter) && targetCenter.length === 2 && !isNaN(targetCenter[0]) && !isNaN(targetCenter[1])) {
      map.flyTo(targetCenter, targetZoom || 12, {
        duration: 1.0,
        easeLinearity: 0.25
      });
    }
  }, [targetCenter, targetZoom, map]);

  useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds(), map.getCenter());
      }
    },
    zoomend: () => {
      const z = map.getZoom();
      if (onZoomChange) onZoomChange(z);
      if (onBoundsChange) onBoundsChange(map.getBounds(), map.getCenter());
    }
  });

  return null;
}

// Coordinate Separation / Jitter Logic to prevent marker collisions and stacking
function applyCoordinateSeparation(nodes) {
  if (!nodes || nodes.length <= 1) return nodes;

  const coordGroups = {};

  nodes.forEach((node, idx) => {
    // Cluster by ~300 meters (~0.0028 deg)
    const latGrid = Math.round(node.lat * 350) / 350;
    const lngGrid = Math.round(node.lng * 350) / 350;
    const key = `${latGrid.toFixed(4)}_${lngGrid.toFixed(4)}`;
    if (!coordGroups[key]) coordGroups[key] = [];
    coordGroups[key].push({ node, originalIndex: idx });
  });

  const separated = [...nodes];

  Object.values(coordGroups).forEach((group) => {
    if (group.length > 1) {
      const step = (2 * Math.PI) / group.length;
      const radius = 0.0022; // ~240m radial separation
      group.forEach((item, i) => {
        const angle = i * step + Math.PI / 4;
        const latOffset = Math.sin(angle) * radius;
        const lngOffset = Math.cos(angle) * radius;
        separated[item.originalIndex] = {
          ...item.node,
          lat: item.node.lat + latOffset,
          lng: item.node.lng + lngOffset
        };
      });
    }
  });

  return separated;
}

export default function PublicHeatmapView({ cases: initialCases = [], socket }) {
  const [caseList, setCaseList] = useState(initialCases);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [activeRegion, setActiveRegion] = useState('All India');
  const [activeTileKey, setActiveTileKey] = useState('satellite'); // 'satellite' | 'dark' | 'standard'
  const [tacticalFilter, setTacticalFilter] = useState('ALL'); // 'ALL' | 'C2' | 'ATM'

  // Map state
  const [mapCenter, setMapCenter] = useState([21.7679, 78.8718]);
  const [mapZoom, setMapZoom] = useState(5);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [currentBounds, setCurrentBounds] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [livePulse, setLivePulse] = useState(false);

  // Sync initial cases
  useEffect(() => {
    if (initialCases && initialCases.length > 0) {
      setCaseList(initialCases);
    }
  }, [initialCases]);

  // Fetch live cases from backend if initialCases not supplied
  const fetchBackendCases = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/cases`);
      if (res.ok) {
        const data = await res.json();
        setCaseList(data);
      }
    } catch (err) {
      console.warn('Threat Map: Failed to fetch backend cases:', err);
    }
  }, []);

  useEffect(() => {
    if (!initialCases || initialCases.length === 0) {
      fetchBackendCases();
    }
  }, [fetchBackendCases, initialCases]);

  const mapFallbackPollingRef = useRef(null);

  // Real-time socket updates with automated 15s REST fallback on socket disconnect
  useEffect(() => {
    if (!socket) {
      // If no socket provided, poll every 15s
      const timer = setInterval(fetchBackendCases, 15000);
      return () => clearInterval(timer);
    }

    let lastUpdateTime = 0;
    const THROTTLE_MS = 1000; // 1Hz throttle to stabilize Leaflet canvas rendering

    const handleNew = (newCase) => {
      const now = Date.now();
      if (now - lastUpdateTime < THROTTLE_MS) {
        setTimeout(() => {
          setCaseList((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)]);
        }, THROTTLE_MS);
      } else {
        lastUpdateTime = now;
        setCaseList((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)]);
      }
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 2000);
    };

    const handleUpdated = (updatedCase) => {
      setCaseList((prev) =>
        prev.map((c) => (c.id === updatedCase.id ? { ...c, ...updatedCase } : c))
      );
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 2000);
    };

    const handleDisconnect = () => {
      console.warn('[Public Threat Map] Socket disconnected. Activating 15s REST polling.');
      if (!mapFallbackPollingRef.current) {
        mapFallbackPollingRef.current = setInterval(fetchBackendCases, 15000);
      }
    };

    const handleConnect = () => {
      if (mapFallbackPollingRef.current) {
        clearInterval(mapFallbackPollingRef.current);
        mapFallbackPollingRef.current = null;
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('case:new', handleNew);
    socket.on('case:updated', handleUpdated);

    return () => {
      if (mapFallbackPollingRef.current) {
        clearInterval(mapFallbackPollingRef.current);
      }
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('case:new', handleNew);
      socket.off('case:updated', handleUpdated);
    };
  }, [fetchBackendCases, socket]);

  // Merge Live Ingested Cases + Baseline Threat Zones into Citizen-Friendly Datasets
  const allMapEntities = useMemo(() => {
    const nodes = [];

    // Process live cases
    (caseList || []).forEach((c) => {
      const tele = deriveTacticalTelemetry(c);
      if (!tele) return;

      // 🔴 Crimson Threat Ingress Hotspot
      nodes.push({
        id: `${c.id}_c2`,
        caseId: c.id,
        nodeType: 'C2',
        name: c.title || 'Reported Cyber Scam Incident',
        scam_type: c.scam_type || 'Digital Financial Fraud',
        amount: c.amount || 0,
        status: c.status || 'pending',
        lat: tele.c2Node.lat,
        lng: tele.c2Node.lng,
        location_name: c.location_name || 'Regional Cyber Grid',
        pairedCoords: tele.atmNode.coords,
        telemetry: tele.c2Node,
        summary: c.description || c.summary || 'Citizen reported fraudulent transaction via unauthorized digital channel. Real-time bank freeze and recovery protocols active.',
        advisory: 'Never share OTPs, click unverified SMS/APK links, or transfer funds to unverified bank accounts.',
        isLiveCase: true
      });

      // 🟠 Orange Downstream Mule ATM Cash-Out Node
      nodes.push({
        id: `${c.id}_atm`,
        caseId: c.id,
        nodeType: 'ATM',
        name: `${tele.atmNode.hubName} Cash-Out Point`,
        scam_type: c.scam_type || 'Mule Account Withdrawal',
        amount: c.amount || 0,
        status: c.status || 'pending',
        lat: tele.atmNode.lat,
        lng: tele.atmNode.lng,
        location_name: c.location_name || 'Regional Cyber Grid',
        pairedCoords: tele.c2Node.coords,
        telemetry: tele.atmNode,
        summary: `Suspected mule account cash withdrawal point at ${tele.atmNode.hubName}. Banking security protocols alerted.`,
        advisory: 'Report suspicious mule account requests or ATM cash collection scams to the National Cyber Crime Portal (1930).',
        isLiveCase: true
      });
    });

    // Process baseline macro threat zones
    BASELINE_THREAT_ZONES.forEach((tz) => {
      const mockCase = {
        id: tz.id,
        title: tz.name,
        amount: tz.threatCount * 75000,
        latitude: tz.lat,
        longitude: tz.lng,
        location_name: tz.city,
        status: 'critical_zone'
      };
      const tele = deriveTacticalTelemetry(mockCase);
      if (!tele) return;

      nodes.push({
        id: `${tz.id}_c2`,
        caseId: tz.id,
        nodeType: 'C2',
        name: tz.name,
        scam_type: 'Regional Fraud Hotspot',
        amount: tz.threatCount * 75000,
        status: 'critical_zone',
        lat: tele.c2Node.lat,
        lng: tele.c2Node.lng,
        location_name: tz.city,
        pairedCoords: tele.atmNode.coords,
        telemetry: tele.c2Node,
        summary: `High volume of cybercrime reports detected in ${tz.city}. Active regional syndicates targeting citizens via spoofed calls and fake investment schemes.`,
        advisory: 'Stay vigilant against unverified investment groups, part-time job offers, and impersonation calls claiming to be law enforcement.',
        isLiveCase: false
      });

      nodes.push({
        id: `${tz.id}_atm`,
        caseId: tz.id,
        nodeType: 'ATM',
        name: `${tele.atmNode.hubName} Withdrawal Point`,
        scam_type: 'Regional Cash-Out Corridor',
        amount: tz.threatCount * 75000,
        status: 'critical_zone',
        lat: tele.atmNode.lat,
        lng: tele.atmNode.lng,
        location_name: tz.city,
        pairedCoords: tele.c2Node.coords,
        telemetry: tele.atmNode,
        summary: `Identified ATM cash-out zone for syndicate operations in ${tz.city}. Law enforcement and bank vigilance enhanced.`,
        advisory: 'Never rent out your bank account or accept cash deposits for unknown individuals.',
        isLiveCase: false
      });
    });

    return applyCoordinateSeparation(nodes);
  }, [caseList]);

  // Zoom-Threshold Visibility Culling + Layer Filtering
  const isDetailedZoom = currentZoom >= MIN_ZOOM_FOR_PINGS;

  const visibleEntities = useMemo(() => {
    if (!isDetailedZoom) return []; // Cull markers at macro country level

    const filtered = allMapEntities.filter((item) => {
      if (tacticalFilter === 'C2') return item.nodeType === 'C2';
      if (tacticalFilter === 'ATM') return item.nodeType === 'ATM';
      return true; // 'ALL'
    });

    if (!currentBounds) return filtered.slice(0, 40);

    return filtered.filter((item) => {
      if (isNaN(item.lat) || isNaN(item.lng)) return false;
      const latLng = L.latLng(item.lat, item.lng);
      return currentBounds.contains(latLng);
    });
  }, [allMapEntities, currentBounds, isDetailedZoom, tacticalFilter]);

  // OpenStreetMap Nominatim Geocoding Search
  const handleLocationSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery || searchQuery.trim().length < 2) return;

    setSearching(true);
    setSearchStatus('Searching location coordinates...');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&countrycodes=in&limit=1`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'FraudShield-CyberCrime-CommandCenter/2.6 (contact@fraudshield.gov.in)'
          }
        }
      );
      const data = await res.json();
      setSearching(false);

      if (data && data.length > 0) {
        const topResult = data[0];
        const lat = parseFloat(topResult.lat);
        const lng = parseFloat(topResult.lon);

        setMapCenter([lat, lng]);
        setMapZoom(12);
        setCurrentZoom(12);
        setActiveRegion(topResult.display_name.split(',')[0]);
        setSearchStatus(`Target Locked: ${topResult.display_name.slice(0, 50)}...`);
      } else {
        setSearchStatus('No specific location found. Showing country overview.');
      }
    } catch (err) {
      setSearching(false);
      setSearchStatus('Location lookup timed out. Default regional view maintained.');
    }
  };

  const handleSelectPreset = (preset) => {
    setActiveRegion(preset.name);
    setSearchQuery(preset.name === 'All India' ? '' : preset.name);
    setMapCenter([preset.lat, preset.lng]);
    setMapZoom(preset.zoom);
    setCurrentZoom(preset.zoom);
    setSelectedPin(null);
    setSearchStatus(`Region Focus: ${preset.name}`);
  };

  const handleFocusEntity = (item) => {
    setSelectedPin(item);
    setMapCenter([item.lat, item.lng]);
    setMapZoom(13);
    setCurrentZoom(13);
  };

  const activeTile = TILE_LAYERS[activeTileKey] || TILE_LAYERS.satellite;

  return (
    <div className="max-w-7xl mx-auto space-y-5 text-slate-100 pb-10">
      {/* Custom Styles for Leaflet Popups and Zoom Controls */}
      <style>{`
        .custom-tactical-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 1.25rem !important;
        }
        .custom-tactical-popup .leaflet-popup-content {
          margin: 0 !important;
          line-height: inherit !important;
        }
        .custom-tactical-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .custom-tactical-popup .leaflet-popup-close-button {
          top: 14px !important;
          right: 14px !important;
          color: #94a3b8 !important;
          font-size: 16px !important;
          padding: 4px !important;
          z-index: 50 !important;
        }
        .custom-tactical-popup .leaflet-popup-close-button:hover {
          color: #ffffff !important;
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(51, 65, 85, 0.8) !important;
          border-radius: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7) !important;
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(8px) !important;
          margin-right: 14px !important;
          margin-bottom: 14px !important;
        }
        .leaflet-control-zoom a {
          background-color: rgba(15, 23, 42, 0.95) !important;
          color: #38bdf8 !important;
          border-bottom: 1px solid rgba(51, 65, 85, 0.8) !important;
          width: 30px !important;
          height: 30px !important;
          line-height: 30px !important;
          font-size: 15px !important;
          transition: all 0.2s ease !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: rgba(30, 41, 59, 1) !important;
          color: #ffffff !important;
        }
        .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }
      `}</style>

      {/* Top Banner & Telemetry Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-slate-800/80 p-5 md:p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                  <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>PUBLIC CYBER THREAT MONITOR</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all duration-300 flex items-center space-x-1 ${
                    livePulse
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${livePulse ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                  <span>{livePulse ? 'NEW INCIDENT REPORTED' : 'LIVE AWARENESS FEED ACTIVE'}</span>
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white uppercase">
                Public Cyber Threat & Scam Incident Monitor
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Tracking regional fraud patterns, reported scam incidents, and high-risk cyber hotspots across districts and states.
              </p>
            </div>
          </div>

          {/* Quick Metrics & Zoom Level Badge */}
          <div className="flex items-center space-x-3 self-start md:self-auto bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5">
            <div className="text-right font-mono text-xs">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Zoom Level: {currentZoom} / 18</div>
              <div className={isDetailedZoom ? 'text-emerald-400 font-bold text-xs' : 'text-amber-400 font-bold text-xs'}>
                {isDetailedZoom ? `${visibleEntities.length} Incidents in Viewport` : 'Zoom in (10+) for Local Hotspots'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Search Bar, Layer Switcher & Preset Hubs */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleLocationSearch} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search State, District, City (e.g. Mumbai, Bengaluru, Connaught Place, Mewat)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 focus:outline-none font-sans transition"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-xs uppercase font-mono tracking-wider flex items-center space-x-1.5 shadow-md shadow-rose-950/50 transition transform active:scale-95 disabled:opacity-50 flex-shrink-0"
            >
              <Compass className={`w-3.5 h-3.5 ${searching ? 'animate-spin' : ''}`} />
              <span>{searching ? 'LOCATING...' : 'LOCATE'}</span>
            </button>
          </form>

          {/* Map Tile Style Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-950/90 border border-slate-800 rounded-xl p-1 text-xs font-mono self-end md:self-auto flex-shrink-0">
            <span className="text-[10px] text-slate-500 px-2 font-bold uppercase hidden sm:inline">Tile:</span>
            <button
              type="button"
              onClick={() => setActiveTileKey('satellite')}
              className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition ${
                activeTileKey === 'satellite'
                  ? 'bg-rose-500 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Satellite className="w-3 h-3" />
              <span>Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTileKey('dark')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTileKey === 'dark'
                  ? 'bg-rose-500 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setActiveTileKey('standard')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTileKey === 'standard'
                  ? 'bg-rose-500 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Street
            </button>
          </div>
        </div>

        {/* Quick-Jump Regional Preset Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-thin scrollbar-thumb-slate-800">
          <span className="text-slate-500 text-[10px] uppercase font-bold flex-shrink-0">
            Regional Hubs:
          </span>
          {PRESET_REGIONS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition flex-shrink-0 ${
                activeRegion === preset.name
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {searchStatus && (
          <div className="text-[11px] font-mono text-rose-400/90 flex items-center space-x-1.5 pt-0.5">
            <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
            <span>{searchStatus}</span>
          </div>
        )}
      </div>

      {/* Main Split Screen Layout: Map (Col 8) + Live Feed Sidebar (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* PRIMARY VIEWPORT: Fixed 650px Leaflet Map Container (Col 8) */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur-md relative">
          <div
            className="relative w-full h-[650px] min-h-[650px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950"
            style={{ height: '650px', minHeight: '650px' }}
          >
            <MapContainer
              key={`fraudshield-radar-${activeTileKey}`}
              center={mapCenter}
              zoom={mapZoom}
              zoomControl={false}
              scrollWheelZoom={true}
              style={{ height: '650px', width: '100%' }}
              className="w-full h-full z-10"
            >
              <TileLayer
                key={activeTile.id}
                attribution={activeTile.attribution}
                url={activeTile.url}
                maxZoom={activeTile.maxZoom}
              />

              <ZoomControl position="bottomright" />

              <MapViewController
                targetCenter={mapCenter}
                targetZoom={mapZoom}
                onBoundsChange={(bounds) => setCurrentBounds(bounds)}
                onZoomChange={(z) => setCurrentZoom(z)}
              />

              {/* Baseline Threat Zones Heat Rings */}
              {BASELINE_THREAT_ZONES.map((tz) => (
                <Circle
                  key={tz.id}
                  center={[tz.lat, tz.lng]}
                  radius={tz.threatCount * 250}
                  pathOptions={{
                    color: tz.riskLevel === 'CRITICAL' ? '#f43f5e' : '#f59e0b',
                    fillColor: tz.riskLevel === 'CRITICAL' ? '#f43f5e' : '#f59e0b',
                    fillOpacity: 0.15,
                    weight: 1.5,
                    dashArray: '3, 3'
                  }}
                />
              ))}

              {/* Render Incident / Hotspot Markers when Zoom Level >= 10 */}
              {isDetailedZoom &&
                visibleEntities.map((item) => {
                  const isC2 = item.nodeType === 'C2';
                  const isSelected = selectedPin?.id === item.id;
                  const icon = isC2 ? createC2Icon(isSelected) : createATMIcon(isSelected);

                  return (
                    <Marker
                      key={item.id}
                      position={[item.lat, item.lng]}
                      icon={icon}
                      eventHandlers={{
                        click: () => setSelectedPin(item)
                      }}
                    >
                      <Popup
                        className="custom-tactical-popup"
                        autoPan={true}
                        autoPanPaddingTopLeft={[20, 90]}
                        autoPanPaddingBottomRight={[20, 30]}
                        offset={[0, -20]}
                        maxHeight={400}
                      >
                        <div className="p-4 bg-slate-950/95 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl min-w-[280px] max-w-[320px] space-y-3 font-sans">
                          <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                            <div>
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                <span
                                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border flex items-center space-x-1 ${
                                    isC2
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                      : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                                  }`}
                                >
                                  <span>{isC2 ? '🔴 Cyber Threat Hotspot' : '🟠 Suspected Cash-Out Point'}</span>
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                  #{item.caseId}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-white mt-1.5 leading-snug">{item.name}</h4>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                              <span className="text-slate-400 text-[11px] font-medium">Scam Vector</span>
                              <span className="text-rose-300 font-semibold text-[11px] text-right truncate max-w-[150px]">{item.scam_type}</span>
                            </div>

                            <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                              <span className="text-slate-400 text-[11px] font-medium">Reported Loss</span>
                              <span className="text-emerald-400 font-bold text-[12px] font-mono">
                                ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                              <span className="text-slate-400 text-[11px] font-medium">District / Area</span>
                              <span className="text-slate-200 font-medium text-[11px] text-right truncate max-w-[150px]">
                                {item.location_name}
                              </span>
                            </div>

                            <div className="pt-1 text-[11px] text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase mb-0.5">Incident Summary</div>
                              <p className="text-slate-300 text-[11px]">{item.summary}</p>
                            </div>

                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] flex items-start space-x-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                              <span><strong>Advisory:</strong> {item.advisory}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>

            {/* In-Map Top Control Bar: Non-Colliding Responsive Flex-Wrap */}
            <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              {/* Left Group: Incident Filter Pills */}
              <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-1.5 font-mono text-xs shadow-2xl flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTacticalFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    tacticalFilter === 'ALL'
                      ? 'bg-rose-500 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ALL INCIDENTS
                </button>
                <button
                  type="button"
                  onClick={() => setTacticalFilter('C2')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 whitespace-nowrap transition ${
                    tacticalFilter === 'C2'
                      ? 'bg-rose-600 text-white font-bold shadow'
                      : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>🔴 THREAT HOTSPOTS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTacticalFilter('ATM')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 whitespace-nowrap transition ${
                    tacticalFilter === 'ATM'
                      ? 'bg-orange-500 text-slate-950 font-bold shadow'
                      : 'text-orange-400 hover:text-orange-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>🟠 CASH-OUT POINTS</span>
                </button>
              </div>

              {/* Right Group: Region HUD Badge */}
              <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl px-3 py-2 font-mono text-[10px] text-slate-300 shadow-xl flex items-center space-x-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>REGION: {activeRegion.toUpperCase()}</span>
              </div>
            </div>

            {/* Zoom-Threshold Helper Banner when Zoomed Out */}
            {!isDetailedZoom && (
              <div className="absolute bottom-4 left-4 right-4 z-[400] bg-slate-950/90 backdrop-blur-md border border-rose-500/30 rounded-2xl p-3 text-center text-xs font-mono text-rose-300 shadow-2xl flex items-center justify-center space-x-2">
                <Info className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  National Incident Overview (Zoom {currentZoom}/18). <strong>Zoom in past Level 10</strong> or click a Regional Hub above to explore localized cyber threat hotspots and reported cases.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SIDE PANEL: Public Incident & Threat Feed (Col 4) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-4 flex flex-col h-[680px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wide uppercase text-slate-200">
                  Public Incident & Threat Feed
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  {isDetailedZoom
                    ? `${visibleEntities.length} Incidents in Current Viewport`
                    : `${allMapEntities.length} Active Threat Incidents Recorded`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchBackendCases}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
              title="Refresh Incident Feed"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>

          {/* Scrollable Hotspot Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {(isDetailedZoom ? visibleEntities : allMapEntities).length > 0 ? (
              (isDetailedZoom ? visibleEntities : allMapEntities).map((item) => {
                const isSelected = selectedPin?.id === item.id;
                const isC2 = item.nodeType === 'C2';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleFocusEntity(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isC2
                          ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/40'
                          : 'bg-orange-950/40 border-orange-500/60 shadow-lg shadow-orange-950/40'
                        : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                      <span className="text-slate-400 text-[10px] truncate max-w-[120px]">
                        {item.location_name}
                      </span>
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-bold ${
                          isC2
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                        }`}
                      >
                        {isC2 ? '🔴 THREAT HOTSPOT' : '🟠 CASH-OUT POINT'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-100 truncate">{item.name}</div>

                    <div className="mt-1 text-[11px] text-rose-300 font-medium truncate">
                      {item.scam_type}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                      <span className="text-emerald-400 font-bold">
                        ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center space-x-0.5">
                        <span>View on map</span>
                        <ChevronRight className="w-3 h-3 text-rose-400" />
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs font-mono text-slate-500 space-y-2">
                <MapPin className="w-6 h-6 mx-auto text-slate-600" />
                <p>No active incidents in this viewport.</p>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(PRESET_REGIONS[0])}
                  className="text-rose-400 underline text-[11px]"
                >
                  Zoom out to All India
                </button>
              </div>
            )}
          </div>

          {/* Selected Pin Mini Drawer */}
          {selectedPin && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/40 text-xs font-sans space-y-2.5 flex-shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold uppercase text-[10px] font-mono flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>INCIDENT DETAILS #{selectedPin.caseId}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPin(null)}
                  className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="font-bold text-white text-xs truncate">{selectedPin.name}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] block">TYPE</span>
                  <span className="text-rose-300 font-semibold truncate block">{selectedPin.scam_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">REPORTED LOSS</span>
                  <span className="text-emerald-400 font-bold block">₹{Number(selectedPin.amount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{selectedPin.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
