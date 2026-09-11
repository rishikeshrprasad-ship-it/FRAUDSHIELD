import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Inner MapUpdater component using useMap() hook and map.flyTo
function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, map.getZoom() || 13, { duration: 0.5 });
    }
  }, [center, map]);

  return null;
}

export default function PredictionMap({ caseItem }) {
  // Wrap MapContainer in a null guard for victimLoc coordinates
  if (!caseItem || !caseItem.latitude || !caseItem.longitude) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs font-mono text-slate-500">
        📍 Select a case with valid GIS coordinates to view tactical prediction map.
      </div>
    );
  }

  const victimLoc = [parseFloat(caseItem.latitude), parseFloat(caseItem.longitude)];

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 
        Leaflet Canvas Stability:
        Static key prevents destroying and re-mounting heavy Leaflet canvas on case changes.
        MapUpdater uses map.flyTo to smoothly reposition the map viewport.
      */}
      <MapContainer
        key="fraudshield-prediction-map-canvas"
        center={victimLoc}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Child MapUpdater using map.flyTo */}
        <MapUpdater center={victimLoc} />

        {/* Victim Location Marker */}
        <Marker position={victimLoc}>
          <Popup className="font-sans">
            <div className="space-y-1 text-slate-950 font-semibold text-xs">
              <div className="font-bold text-rose-600">{caseItem.title}</div>
              <div>Victim: {caseItem.victim_name}</div>
              <div>Loss: ₹{Number(caseItem.amount).toLocaleString('en-IN')}</div>
              <div>Status: {caseItem.status}</div>
            </div>
          </Popup>
        </Marker>

        {/* Tactical Risk Radius Overlay */}
        <Circle
          center={victimLoc}
          radius={2500}
          pathOptions={{
            color: caseItem.urgency_score >= 80 ? '#ef4444' : '#06b6d4',
            fillColor: caseItem.urgency_score >= 80 ? '#ef4444' : '#06b6d4',
            fillOpacity: 0.15,
            weight: 2
          }}
        />
      </MapContainer>

      {/* Floating Tactical Overlay Badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[11px] text-cyan-300 shadow-lg">
        🎯 GIS Canvas Active | Key: {caseItem.id}
      </div>
    </div>
  );
}
