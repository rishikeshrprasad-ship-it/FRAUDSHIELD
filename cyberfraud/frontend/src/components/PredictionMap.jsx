import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  ShieldAlert,
  Building,
  Radio,
  Zap,
  Activity,
  Layers,
  Globe,
  Mountain,
  ArrowRight,
  Crosshair,
  Wifi,
  Lock,
  Compass,
  MapPin,
  ExternalLink,
  Target
} from 'lucide-react';
import { deriveTacticalTelemetry } from '../utils/tacticalTelemetry.js';

const TILE_PROVIDERS = {
  hybrid: {
    id: 'hybrid',
    name: 'HYBRID',
    base: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      minZoom: 3,
      maxZoom: 18
    },
    overlays: [
      {
        id: 'transportation',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        minZoom: 3,
        maxZoom: 18,
        opacity: 0.75,
        className: 'transportation-overlay'
      },
      {
        id: 'carto-voyager-labels',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        subdomains: 'abcd',
        minZoom: 3,
        maxZoom: 18,
        opacity: 0.92,
        className: 'tactical-label-overlay'
      }
    ]
  },
  terrain: {
    id: 'terrain',
    name: 'TERRAIN',
    base: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, METI, and the GIS User Community',
      minZoom: 3,
      maxZoom: 18
    },
    overlays: [
      {
        id: 'carto-voyager-labels-terrain',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        subdomains: 'abcd',
        minZoom: 3,
        maxZoom: 18,
        opacity: 0.88,
        className: 'tactical-label-overlay'
      }
    ]
  }
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createC2Icon = () =>
  L.divIcon({
    className: 'tactical-c2-pin',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#e11d48;border:2.5px solid #ffffff;border-radius:50%;color:#ffffff;box-shadow:0 0 16px rgba(225,29,72,0.9);cursor:pointer;">
        <span style="position:absolute;width:100%;height:100%;border-radius:50%;border:2px solid #f43f5e;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });

const createATMIcon = () =>
  L.divIcon({
    className: 'tactical-atm-pin',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:#f97316;border:2px solid #ffffff;border-radius:50%;color:#ffffff;box-shadow:0 0 14px rgba(249,115,22,0.9);cursor:pointer;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16]
  });

function MapUpdater({ center, flyTarget }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (flyTarget && flyTarget.coords && Array.isArray(flyTarget.coords) && !isNaN(flyTarget.coords[0]) && !isNaN(flyTarget.coords[1])) {
      map.flyTo(flyTarget.coords, flyTarget.zoom || 15, {
        duration: 0.8,
        easeLinearity: 0.25
      });
    } else if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, 14, { duration: 0.6 });
    }
  }, [center, flyTarget, map]);

  return null;
}

function resolveMarkerPositions(c2Pos, atmPos) {
  if (!c2Pos || !atmPos) return { c2Pos, atmPos, isAdjusted: false };
  const dLat = Math.abs(c2Pos[0] - atmPos[0]);
  const dLng = Math.abs(c2Pos[1] - atmPos[1]);

  if (dLat < 0.0022 && dLng < 0.0022) {
    return {
      c2Pos: [c2Pos[0], c2Pos[1] - 0.0018],
      atmPos: [c2Pos[0], c2Pos[1] + 0.0018],
      isAdjusted: true
    };
  }

  return { c2Pos, atmPos, isAdjusted: false };
}

export default function PredictionMap({ caseItem, showTelemetryHUD = true }) {
  const [tacticalFilter, setTacticalFilter] = useState('ALL');
  const [mapLayer, setMapLayer] = useState('hybrid');
  const [flyTarget, setFlyTarget] = useState(null);

  const telemetry = useMemo(() => deriveTacticalTelemetry(caseItem), [caseItem]);

  const activeNodes = useMemo(() => {
    if (!telemetry) return null;
    const { c2Node, atmNode } = telemetry;
    const { c2Pos, atmPos, isAdjusted } = resolveMarkerPositions(c2Node.coords, atmNode.coords);
    return {
      c2Node: { ...c2Node, renderedCoords: c2Pos },
      atmNode: { ...atmNode, renderedCoords: atmPos },
      isSeparated: isAdjusted
    };
  }, [telemetry]);

  if (!caseItem || !telemetry || !activeNodes) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs font-mono text-slate-500">
        📍 Select a case with valid GIS coordinates to view tactical prediction map.
      </div>
    );
  }

  const { c2Node, atmNode } = activeNodes;
  const mapCenter = c2Node.renderedCoords;

  const showC2 = tacticalFilter === 'ALL' || tacticalFilter === 'C2';
  const showATM = tacticalFilter === 'ALL' || tacticalFilter === 'ATM';

  const handleFlyTo = (coords, zoom = 15) => {
    setFlyTarget({ coords, zoom, timestamp: Date.now() });
  };

  return (
    <div className="w-full h-full flex flex-col space-y-2 relative z-0 min-h-0">
      <style>{`
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
        .custom-tactical-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 1rem !important;
        }
        .custom-tactical-popup .leaflet-popup-content {
          margin: 0 !important;
          line-height: inherit !important;
        }
        .custom-tactical-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .custom-tactical-popup .leaflet-popup-close-button {
          top: 10px !important;
          right: 10px !important;
          color: #94a3b8 !important;
          font-size: 14px !important;
          padding: 4px !important;
          z-index: 50 !important;
        }
        .custom-tactical-popup .leaflet-popup-close-button:hover {
          color: #ffffff !important;
        }
        .tactical-label-overlay {
          pointer-events: none !important;
          user-select: none !important;
        }
        .transportation-overlay {
          pointer-events: none !important;
        }
      `}</style>

      <div className="relative w-full flex-1 min-h-[320px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 z-0">
        <MapContainer
          key={`fraudshield-tactical-map-${caseItem.id}`}
          center={mapCenter}
          zoom={14}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="w-full h-full z-0"
        >
          <TileLayer
            key={`tile-layer-base-${mapLayer}`}
            attribution={TILE_PROVIDERS[mapLayer]?.base?.attribution}
            url={TILE_PROVIDERS[mapLayer]?.base?.url}
            minZoom={TILE_PROVIDERS[mapLayer]?.base?.minZoom || 3}
            maxZoom={TILE_PROVIDERS[mapLayer]?.base?.maxZoom || 18}
          />

          {TILE_PROVIDERS[mapLayer]?.overlays?.map((overlay) => (
            <TileLayer
              key={`tile-layer-overlay-${mapLayer}-${overlay.id}`}
              url={overlay.url}
              subdomains={overlay.subdomains || 'abc'}
              minZoom={overlay.minZoom || 3}
              maxZoom={overlay.maxZoom || 18}
              opacity={overlay.opacity ?? 1.0}
              className={overlay.className || ''}
              zIndex={5}
            />
          ))}

          <ZoomControl position="bottomright" />
          <MapUpdater center={mapCenter} flyTarget={flyTarget} />

          {showC2 && showATM && (
            <Polyline
              positions={[c2Node.renderedCoords, atmNode.renderedCoords]}
              pathOptions={{
                color: '#f43f5e',
                weight: 2.5,
                dashArray: '6, 8',
                opacity: 0.85
              }}
            />
          )}

          {showC2 && (
            <>
              <Marker key={`c2-marker-${caseItem.id}`} position={c2Node.renderedCoords} icon={createC2Icon()}>
                <Popup
                  className="custom-tactical-popup font-mono text-xs"
                  autoPan={true}
                  autoPanPaddingTopLeft={[20, 90]}
                  autoPanPaddingBottomRight={[20, 30]}
                  offset={[0, -20]}
                  maxHeight={400}
                >
                  <div className="p-3.5 bg-slate-950 text-slate-100 rounded-xl border border-rose-500/40 shadow-2xl min-w-[270px] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                        <span>C2 INGRESS PIN</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">{c2Node.confidenceScore}</span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div><span className="text-slate-500">Incident GPS:</span> <strong className="text-cyan-400 font-mono">[{c2Node.lat.toFixed(6)}, {c2Node.lng.toFixed(6)}]</strong></div>
                      <div><span className="text-slate-500">Origin IP:</span> <strong className="text-rose-400">{c2Node.ip}</strong></div>
                      <div><span className="text-slate-500">Stack:</span> <span className="text-slate-200">{c2Node.anonymizationStack}</span></div>
                      <div><span className="text-slate-500">ASN:</span> <span className="text-slate-300">{c2Node.asn}</span></div>
                      <div><span className="text-slate-500">Telemetry:</span> <span className="text-amber-300">{c2Node.ttlFingerprint}</span></div>
                      <div><span className="text-slate-500">WebRTC Leak:</span> <span className="text-cyan-300">{c2Node.webrtcLeak}</span></div>
                      <div><span className="text-slate-500">Canvas Hash:</span> <span className="text-purple-300">{c2Node.canvasHash}</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFlyTo(c2Node.renderedCoords, 16)}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition"
                    >
                      <Crosshair className="w-3 h-3 text-rose-400" />
                      <span>CENTER ON C2 NODE</span>
                    </button>
                  </div>
                </Popup>
              </Marker>

              <Circle
                key={`c2-circle-${caseItem.id}`}
                center={c2Node.renderedCoords}
                radius={600}
                pathOptions={{
                  color: '#f43f5e',
                  fillColor: '#f43f5e',
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
            </>
          )}

          {showATM && (
            <>
              <Marker key={`atm-marker-${caseItem.id}`} position={atmNode.renderedCoords} icon={createATMIcon()}>
                <Popup
                  className="custom-tactical-popup font-mono text-xs"
                  autoPan={true}
                  autoPanPaddingTopLeft={[20, 90]}
                  autoPanPaddingBottomRight={[20, 30]}
                  offset={[0, -20]}
                  maxHeight={400}
                >
                  <div className="p-3.5 bg-slate-950 text-slate-100 rounded-xl border border-orange-500/40 shadow-2xl min-w-[270px] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 uppercase">
                        ATM CASH-OUT PUNCTURE
                      </span>
                      <span className="text-[10px] text-rose-400 font-bold">{atmNode.withdrawalSLA}</span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div><span className="text-slate-500">Puncture GPS:</span> <strong className="text-orange-400 font-mono">[{atmNode.lat.toFixed(6)}, {atmNode.lng.toFixed(6)}]</strong></div>
                      <div><span className="text-slate-500">Location:</span> <strong className="text-orange-300">{atmNode.hubName}</strong></div>
                      <div><span className="text-slate-500">Mule Account:</span> <span className="text-slate-100">{atmNode.muleAccount}</span></div>
                      <div><span className="text-slate-500">Loss Pool:</span> <span className="text-emerald-400 font-bold">₹{Number(caseItem.amount).toLocaleString('en-IN')}</span></div>
                      <div><span className="text-slate-500">Status:</span> <span className="text-amber-400 uppercase font-bold">{caseItem.status}</span></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFlyTo(atmNode.renderedCoords, 16)}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition"
                    >
                      <Crosshair className="w-3 h-3 text-orange-400" />
                      <span>CENTER ON ATM PUNCTURE</span>
                    </button>
                  </div>
                </Popup>
              </Marker>

              <Circle
                center={atmNode.renderedCoords}
                radius={400}
                pathOptions={{
                  color: '#f97316',
                  fillColor: '#f97316',
                  fillOpacity: 0.12,
                  weight: 1.5
                }}
              />
            </>
          )}
        </MapContainer>

        <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl shadow-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setTacticalFilter('ALL')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap transition ${
                  tacticalFilter === 'ALL'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => setTacticalFilter('C2')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap flex items-center space-x-1 transition ${
                  tacticalFilter === 'C2'
                    ? 'bg-rose-500 text-white font-bold shadow'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>🔴 C2</span>
              </button>
              <button
                type="button"
                onClick={() => setTacticalFilter('ATM')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap flex items-center space-x-1 transition ${
                  tacticalFilter === 'ATM'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow'
                    : 'text-orange-400 hover:text-orange-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>🟠 ATM</span>
              </button>
            </div>

            <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setMapLayer('hybrid')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap flex items-center space-x-1.5 transition ${
                  mapLayer === 'hybrid'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Google Maps-Style Hybrid Satellite with Roads & Town Labels"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span>HYBRID</span>
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('terrain')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium whitespace-nowrap flex items-center space-x-1.5 transition ${
                  mapLayer === 'terrain'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Esri World Topographic Terrain Map"
              >
                <Mountain className="w-3.5 h-3.5 text-indigo-300" />
                <span>TERRAIN</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => handleFlyTo(c2Node.renderedCoords, 15)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-rose-300 shadow flex items-center space-x-1.5 transition"
              title="Fly directly to calibrated incident GPS coordinate"
            >
              <Target className="w-3.5 h-3.5 text-rose-400" />
              <span>FLY TO C2</span>
            </button>

            <button
              type="button"
              onClick={() => handleFlyTo(atmNode.renderedCoords, 15)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-orange-300 shadow flex items-center space-x-1.5 transition"
              title="Fly directly to downstream ATM cashout perimeter"
            >
              <Target className="w-3.5 h-3.5 text-orange-400" />
              <span>FLY TO ATM</span>
            </button>

            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 shadow flex items-center space-x-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-emerald-400">EPSG:3857</span>
            </div>
          </div>
        </div>
      </div>

      {showTelemetryHUD && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <div className="flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                Active Tactical Telemetry & Coordinate Calibration
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-cyan-400 font-mono">
                GPS: [{c2Node.lat.toFixed(6)}, {c2Node.lng.toFixed(6)}]
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold uppercase">
                {c2Node.confidenceScore}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
            <div
              onClick={() => handleFlyTo(c2Node.renderedCoords, 15)}
              className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 hover:border-rose-500/50 cursor-pointer transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 block text-[9px] uppercase">C2 Ingress IP</span>
                <span className="text-[9px] text-rose-400 group-hover:underline flex items-center space-x-0.5">
                  <span>Fly to</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
              <span className="text-rose-400 font-bold truncate block font-mono">{c2Node.ip}</span>
              <span className="text-slate-400 text-[9px] block truncate">{c2Node.anonymizationStack}</span>
            </div>

            <div
              onClick={() => handleFlyTo(atmNode.renderedCoords, 15)}
              className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 hover:border-orange-500/50 cursor-pointer transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 block text-[9px] uppercase">ATM Cash-Out Hub</span>
                <span className="text-[9px] text-orange-400 group-hover:underline flex items-center space-x-0.5">
                  <span>Fly to</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
              <span className="text-orange-400 font-bold truncate block">{atmNode.hubName}</span>
              <span className="text-slate-400 text-[9px] block truncate">{atmNode.muleAccount}</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 block text-[9px] uppercase">TTL / OS Fingerprint</span>
                <span className="text-[9px] text-amber-400 font-bold">{atmNode.withdrawalSLA}</span>
              </div>
              <span className="text-amber-300 font-bold truncate block">{c2Node.ttlFingerprint}</span>
              <span className="text-cyan-300 text-[9px] block truncate">{c2Node.webrtcLeak}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
