import React from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { MapPin, ShieldAlert, Info } from 'lucide-react';

const mockThreatZones = [
  { id: 'tz_1', name: 'Connaught Place Phishing Zone', lat: 28.6315, lng: 77.2167, riskLevel: 'CRITICAL', threatCount: 42 },
  { id: 'tz_2', name: 'BKC Digital Arrest Hotspot', lat: 19.0657, lng: 72.8687, riskLevel: 'HIGH', threatCount: 28 },
  { id: 'tz_3', name: 'MG Road Investment Spoof Area', lat: 12.9756, lng: 77.6062, riskLevel: 'ELEVATED', threatCount: 19 }
];

export default function PublicHeatmapView() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
              Public Cyber Crime Threat Zone Radar Map
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Anonymized Citizen Threat Radar & Fraud Hotspot Map
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mockThreatZones.map((tz) => (
            <Circle
              key={tz.id}
              center={[tz.lat, tz.lng]}
              radius={8000}
              pathOptions={{
                color: tz.riskLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                fillColor: tz.riskLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                fillOpacity: 0.35,
                weight: 2
              }}
            >
              <Popup>
                <div className="font-sans text-xs text-slate-950 space-y-1">
                  <div className="font-bold">{tz.name}</div>
                  <div>Risk Category: <span className="font-mono font-bold text-rose-600">{tz.riskLevel}</span></div>
                  <div>Reported Scams (Last 72h): {tz.threatCount}</div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
