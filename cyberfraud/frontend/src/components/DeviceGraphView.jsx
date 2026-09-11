import React, { useEffect, useState, useRef } from 'react';
import { Network, X, RefreshCw, ZoomIn, ShieldAlert, Cpu } from 'lucide-react';

const mockRawNodes = [
  { id: 'VICTIM-DEV-01', label: 'Victim Mobile Device (Samsung S23)', type: 'victim_device', group: 1 },
  { id: 'IP-185-220-101-5', label: 'Proxy IP (185.220.101.5)', type: 'ip', group: 2 },
  { id: 'APK-TROJAN-CBI', label: 'CBI Video Extortion APK', type: 'malware', group: 2 },
  { id: 'MULE-BANK-SBI-01', label: 'SBI Mule Account #48192019', type: 'mule_account', group: 3 },
  { id: 'MULE-BANK-HDFC-02', label: 'HDFC Mule Account #99210411', type: 'mule_account', group: 3 },
  { id: 'TRC20-WALLET-01', label: 'USDT TRC20 Wallet (TX9mK2...)', type: 'crypto_wallet', group: 4 },
  { id: 'OFFSHORE-OTC-DUBAI', label: 'Offshore Dubai OTC Desk', type: 'crypto_wallet', group: 4 }
];

const mockRawLinks = [
  { source: 'VICTIM-DEV-01', target: 'APK-TROJAN-CBI' },
  { source: 'APK-TROJAN-CBI', target: 'IP-185-220-101-5' },
  { source: 'IP-185-220-101-5', target: 'MULE-BANK-SBI-01' },
  { source: 'MULE-BANK-SBI-01', target: 'MULE-BANK-HDFC-02' },
  { source: 'MULE-BANK-HDFC-02', target: 'TRC20-WALLET-01' },
  { source: 'TRC20-WALLET-01', target: 'OFFSHORE-OTC-DUBAI' }
];

export default function DeviceGraphView({ caseId = 'CASE-2026-9041' }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [computing, setComputing] = useState(true);
  const svgRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Web Worker force simulation calculation requirement
  useEffect(() => {
    setComputing(true);

    // Slice raw nodes: rawNodes.slice(0, 40)
    const slicedNodes = mockRawNodes.slice(0, 40);

    // Launch Web Worker
    const worker = new Worker(new URL('../workers/graphWorker.js', import.meta.url), {
      type: 'module'
    });

    worker.postMessage({ nodes: slicedNodes, links: mockRawLinks });

    worker.onmessage = (e) => {
      setGraphData(e.data);
      setComputing(false);
      worker.terminate();
    };\n
    return () => {
      worker.terminate();
    };
  }, [caseId]);

  // Universal Modal close listener for node details drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedNode) {
        setSelectedNode(null);
      }
    };\n    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);\n  }, [selectedNode]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);\n  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'victim_device': return '#06b6d4'; // cyan
      case 'ip': return '#f59e0b'; // amber
      case 'malware': return '#ef4444'; // crimson
      case 'mule_account': return '#eab308'; // yellow
      case 'crypto_wallet': return '#a855f7'; // purple
      default: return '#94a3b8';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
              D3 Device & Mule Linkage Graph (Web Worker Offloaded)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Case Ref: <span className="text-cyan-400 font-bold">{caseId}</span> | Multi-Hop Clustering
            </p>
          </div>
        </div>

        {computing && (
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800 animate-pulse">
            <Cpu className="w-4 h-4" />
            <span>Worker Computing Math...</span>
          </div>
        )}
      </div>

      {/* Interactive SVG Graph Area */}
      <div className="relative w-full h-[520px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
        <svg ref={svgRef} className="w-full h-full">
          {/* Render Link Lines */}
          {graphData.links.map((link, idx) => {
            const sourceNode = graphData.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source));
            const targetNode = graphData.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target));
            if (!sourceNode || !targetNode) return null;

            return (
              <line
                key={idx}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="#334155"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            );
          })}

          {/* Render Nodes with Drag vs Click Movement Delta Check */}
          {graphData.nodes.map((node) => {
            const color = getNodeColor(node.type);
            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                className="cursor-pointer group"
                onMouseDown={(e) => {
                  dragStartPos.current = { x: e.clientX, y: e.clientY };
                }}
                onMouseUp={(e) => {
                  const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
                  const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
                  // Delta check requirement: dragging does NOT open details drawer
                  if (deltaX < 5 && deltaY < 5) {
                    handleNodeClick(node);
                  }
                }}
              >
                <circle
                  r={22}
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth={3}
                  className="transition transform group-hover:scale-110"
                />
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fill="#f8fafc"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.type === 'victim_device' ? 'DEV' : node.type === 'ip' ? 'IP' : node.type === 'mule_account' ? 'BANK' : 'CRYPTO'}
                </text>
                <text
                  textAnchor="middle"
                  dy="32"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Drawer / Modal */}
        {selectedNode && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedNode(null);
            }}
            className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex items-center justify-end p-4"
          >
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="font-bold text-xs text-cyan-400 font-mono uppercase">
                  NODE ENTITY INSPECTOR
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                  title="Close (ESC)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block">Node ID:</span>
                  <span className="text-slate-200 font-bold">{selectedNode.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Label:</span>
                  <span className="text-slate-300">{selectedNode.label}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Entity Type:</span>
                  <span className="text-purple-400 font-bold uppercase">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cluster Status:</span>
                  <span className="text-rose-400 font-bold">FLAGGED MULE NETWORK</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
