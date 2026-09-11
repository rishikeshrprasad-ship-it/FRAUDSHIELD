import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import throttle from 'lodash/throttle';
import { Shield, Building, MapPin, Radio } from 'lucide-react';

const mockBranches = [
  { id: 'br_sbi_cp', name: 'SBI Connaught Place Main Branch', lat: 28.6315, lng: 77.2167, duressStatus: 'NORMAL', officersNear: 3 },
  { id: 'br_hdfc_bkc', name: 'HDFC Bandra Kurla Complex', lat: 19.0657, lng: 72.8687, duressStatus: 'ALERT', officersNear: 5 },
  { id: 'br_icici_mg', name: 'ICICI MG Road Bengaluru', lat: 12.9756, lng: 77.6062, duressStatus: 'DURESS_TRIGGERED', officersNear: 2 }
];

export default function BranchHeatmap({ socket, onSelectBranch }) {
  const [officerLocations, setOfficerLocations] = useState({});

  const throttledUpdateRef = useRef(
    throttle((data) => {
      setOfficerLocations((prev) => ({
        ...prev,
        [data.officer_id]: {
          id: data.officer_id,
          name: data.name || 'Officer On Patrol',
          lat: data.latitude,
          lng: data.longitude,
          timestamp: new Date().toISOString()
        }
      }));
    }, 1000)
  );

  useEffect(() => {
    if (!socket) return;

    const handleLocationBroadcast = (data) => {
      throttledUpdateRef.current(data);
    };

    socket.on('officer:location_broadcast', handleLocationBroadcast);

    return () => {
      socket.off('officer:location_broadcast', handleLocationBroadcast);
      throttledUpdateRef.current.cancel();
    };
  }, [socket]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
              Tactical GIS Branch Heatmap & Patrol Dispatch
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live Socket.io Location Broadcasts Throttled to 1Hz (1000ms)
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mockBranches.map((br) => (
            <Marker key={br.id} position={[br.lat, br.lng]}>
              <Popup
                autoPan={true}
                autoPanPaddingTopLeft={[20, 80]}
                autoPanPaddingBottomRight={[20, 20]}
                offset={[0, -20]}
                maxHeight={350}
              >
                <div className="font-sans text-xs text-slate-950 space-y-1">
                  <div className="font-bold">{br.name}</div>
                  <div>Status: <span className="font-mono font-bold text-rose-600">{br.duressStatus}</span></div>
                  <div>Officers in 2km: {br.officersNear}</div>
                  {onSelectBranch && (
                    <button
                      onClick={() => onSelectBranch(br)}
                      className="mt-1 px-2 py-1 bg-cyan-600 text-white rounded text-[10px] font-bold"
                    >
                      OPEN BRANCH DESK
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {Object.values(officerLocations).map((off) => (
            <React.Fragment key={off.id}>
              <Marker position={[off.lat, off.lng]}>
                <Popup
                  autoPan={true}
                  autoPanPaddingTopLeft={[20, 80]}
                  autoPanPaddingBottomRight={[20, 20]}
                  offset={[0, -20]}
                >
                  <div className="font-sans text-xs text-slate-950 font-bold">
                    👮 {off.name} (Active Patrol)
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[off.lat, off.lng]}
                radius={1500}
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
