import React, { useState } from 'react';
import { FileText, MapPin, Send, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FileFraudCase({ onCaseReported }) {
  const [title, setTitle] = useState('');
  const [scamType, setScamType] = useState('Digital Arrest / Impersonation');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Connaught Place, New Delhi');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [victimName, setVictimName] = useState('');
  const [victimContact, setVictimContact] = useState('');
  const [suspectAccount, setSuspectAccount] = useState('');
  const [scamChannel, setScamChannel] = useState('WhatsApp Video Call');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [gpsFetching, setGpsFetching] = useState(false);

  // Browser GPS helper
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg('Geolocation is not supported by your browser.');
      return;
    }

    setGpsFetching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setGpsFetching(false);
        setStatusMsg('GPS coordinates captured successfully.');
      },
      (err) => {
        setGpsFetching(false);
        setStatusMsg('Unable to retrieve GPS. Nominatim geocoding will convert your text address.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    let finalLat = parseFloat(latitude);
    let finalLng = parseFloat(longitude);

    // OpenStreetMap Nominatim Fallback:
    // If user typed a text address without valid float coordinates, lookup OSM Nominatim with custom User-Agent
    if (isNaN(finalLat) || isNaN(finalLng)) {
      try {
        setStatusMsg('Resolving address coordinates via OpenStreetMap Nominatim API...');
        const nominatimRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'FraudShield-CyberCrime-CommandCenter/2.6 (contact@fraudshield.gov.in)'
            }
          }
        );
        const nomData = await nominatimRes.json();
        if (nomData && nomData.length > 0) {
          finalLat = parseFloat(nomData[0].lat);
          finalLng = parseFloat(nomData[0].lon);
          setLatitude(finalLat);
          setLongitude(finalLng);
        } else {
          // Default Delhi NCR Coords
          finalLat = 28.6139;
          finalLng = 77.2090;
        }
      } catch (err) {
        finalLat = 28.6139;
        finalLng = 77.2090;
      }
    }

    try {
      const response = await fetch('http://localhost:4000/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          scam_type: scamType,
          amount: parseFloat(amount),
          description,
          location_name: locationName,
          latitude: finalLat,
          longitude: finalLng,
          victim_name: victimName,
          victim_contact: victimContact,
          suspect_account: suspectAccount,
          scam_channel: scamChannel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to ingest report');
      }

      const newCase = await response.json();
      setStatusMsg(`✅ Cyber Crime Case ${newCase.id} successfully registered! Broadcast to Command Center active.`);
      if (onCaseReported) onCaseReported(newCase);

      // Reset form
      setTitle('');
      setAmount('');
      setDescription('');
    } catch (err) {
      setStatusMsg(`❌ Error submitting report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-extrabold text-lg tracking-wider text-slate-100 uppercase">
            File a Cyber Crime Incident Report
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Direct ingestion into Law Enforcement Command Center & NPCI Lien Gateway
          </p>
        </div>
      </div>

      {statusMsg && (\n        <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Incident Headline *</label>
            <input
              type="text"
              required
              placeholder="e.g. CBI Digital Arrest Video Call Extortion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Scam Type Category *</label>
            <select
              value={scamType}
              onChange={(e) => setScamType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
            >
              <option>Digital Arrest / Impersonation</option>
              <option>SEBI Registry Spoofing</option>
              <option>Teller Duress Alert</option>
              <option>Mule Account P2P Trap</option>
              <option>Phishing Link / APK Trojan</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Financial Loss Amount (₹) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 450000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Scam Channel Vector</label>
            <input
              type="text"
              placeholder="e.g. WhatsApp Video Call / Telegram"
              value={scamChannel}
              onChange={(e) => setScamChannel(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Victim Full Name</label>
            <input
              type="text"
              placeholder="Victim Name"
              value={victimName}
              onChange={(e) => setVictimName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Victim Contact Mobile</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={victimContact}
              onChange={(e) => setVictimContact(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Location & GIS Address Geocoding */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Location & GIS Coords (OpenStreetMap Nominatim Enabled)</span>
            </span>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gpsFetching}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs flex items-center space-x-1 border border-slate-700"
            >
              <Navigation className="w-3 h-3" />
              <span>{gpsFetching ? 'GPS LOCATING...' : 'USE GPS'}</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Location Address / Area</label>
            <input
              type="text"
              placeholder="e.g. Connaught Place, New Delhi"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <label className="text-slate-500 block mb-1">Float Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="28.6315"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Float Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="77.2167"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">Suspect Mule Bank Account / UPI ID</label>
          <input
            type="text"
            placeholder="e.g. SBI-MULE-48192019 or suspect@upi"
            value={suspectAccount}
            onChange={(e) => setSuspectAccount(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">Incident Description & Narrative</label>
          <textarea
            rows="3"
            required
            placeholder="Provide comprehensive details of how fraud occurred..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-cyan-950 transition transform active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'SUBMITTING INCIDENT...' : 'SUBMIT CYBERCRIME REPORT'}</span>
        </button>
      </form>
    </div>
  );
}
