# FraudShield — Cybercrime Fraud Intelligence & Command Center

FraudShield is a unified real-time cybercrime intelligence command center connecting citizens, bank tellers, police officers, and command center administrators to detect, track, and intercept financial fraud, phishing links, mule bank accounts, SEBI registry spoofing, and duress teller alerts.

## 🚀 Architecture & Key Features

- **Direct Police Claiming Workflow**: Real-time Socket.io case ingestion (`/api/report`) and direct officer claim binding (`/api/case/:id/claim`).
- **Aegis 3-Stage Biometric Hardware Auth**: Fingerprint sensor simulation, Retinal Iris scan, and YubiKey / FIDO2 token verification.
- **Tactical GIS Maps**: Leaflet canvas with `flyTo` map updaters, throttled officer location broadcast (1Hz), and OpenStreetMap Nominatim geocoding fallback with custom `User-Agent`.
- **D3 Linkage Graph**: Offloaded force simulation math via dedicated Web Worker (`graphWorker.js`) to trace devices, proxy IPs, mule bank accounts, and crypto wallets.
- **Silent Teller Duress Desk**: Interception panel for bank tellers with `ReactDOM.createPortal` overlay dialogs and mobile verification.
- **Threat Intelligence Scanners**: Certificate Transparency (`crt.sh`) banking scraper, mule recruitment ad watcher, and isolated iframe preview sandbox (`/api/proxy-preview`).
- **Fairness & Account Unfreeze Appeal**: Citizen appeal submission portal and police officer review queue for NPCI liens.

## 📦 Directory Structure

```
cyberfraud/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── logic/
│       ├── database.js
│       ├── scoring.js
│       ├── sebiRegistryCheck.js
│       ├── mhaBlockedAppsCheck.js
│       ├── cryptoRouting.js
│       ├── freezeWorkflow.js
│       ├── notify.js
│       ├── channelMatcher.js
│       ├── deviceGraph.js
│       ├── domainWatchScraper.js
│       ├── generateCaseFile.js
│       ├── linkRiskCheck.js
│       ├── llmExplain.js
│       ├── pairingSession.js
│       └── recruitmentAdScanner.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/ (31 Components)
        ├── utils/
        └── workers/
```

## 🛠️ Quick Start

### 1. Backend Server
```bash
cd cyberfraud/backend
npm install
npm start
# Runs on http://localhost:4000
```

### 2. Frontend Command Center
```bash
cd cyberfraud/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```
