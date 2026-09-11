import React from 'react';
import { Shield, Network, MapPin, Eye, QrCode, Building, Scale, Radio, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

export default function FeatureSectionView() {
  const features = [
    {
      icon: Shield,
      title: 'Real-Time Cyber Crime Interception',
      desc: 'Ingest citizen fraud reports and broadcast live to all police command center nodes via Socket.io.',
      color: 'text-cyan-400'
    },
    {
      icon: Network,
      title: 'D3 Device & Mule Account Graph',
      desc: 'Visualize multi-hop linkages between victim devices, proxy IPs, mule bank accounts, and crypto wallets using Web Worker offloaded force simulation.',
      color: 'text-purple-400'
    },
    {
      icon: MapPin,
      title: 'GIS Leaflet Tactical Maps',
      desc: 'Optimized Leaflet canvas with flyTo updates (no remount), throttled officer location broadcasts at 1Hz, and public threat heatmap zones.',
      color: 'text-emerald-400'
    },
    {
      icon: Eye,
      title: 'Certificate Transparency Domain Watch',
      desc: 'Scrapes crt.sh logs for banking keyword spoofing (SBI, PNB, RBI) with automatic fallback to local threat database.',
      color: 'text-amber-400'
    },
    {
      icon: QrCode,
      title: 'QR & Phishing Link Scanner',
      desc: 'Multi-layer risk scoring combining SEBI registry validation, MHA blocked app checks, and social engineering keyword detection.',
      color: 'text-rose-400'
    },
    {
      icon: Building,
      title: 'Bank Teller Duress Interception',
      desc: 'Silent duress alert system for branch tellers detecting coerced senior citizens, with live pairing verification and portal overlay modals.',
      color: 'text-teal-400'
    },
    {
      icon: Scale,
      title: 'Fairness & Unfreeze Appeal System',
      desc: 'Legitimate account holders can contest erroneous NPCI lien freezes through a structured appeal queue reviewed by law enforcement.',
      color: 'text-indigo-400'
    },
    {
      icon: Cpu,
      title: 'NPCI / APBS Bank Freeze Gateway',
      desc: 'Emergency lien placement across NPCI clearing network with automated SLA timer tracking the 45-minute golden interception window.',
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      <div className="text-center space-y-3">
        <h2 className="font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
          PLATFORM CAPABILITIES & INTELLIGENCE MODULES
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          FraudShield v2.6 Command Center — connecting citizens, bank tellers, police officers,
          and command center admins to detect, track, and intercept financial fraud in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl hover:border-slate-700 transition"
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-6 h-6 ${feat.color}`} />
                <h3 className="font-bold text-sm text-slate-100">{feat.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
