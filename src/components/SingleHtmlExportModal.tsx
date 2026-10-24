import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode } from 'lucide-react';
import { DRUGS, INTERACTIONS, Drug, DrugInteraction } from '../data/drugData';

interface SingleHtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDrugs?: Drug[];
  currentInteractions?: DrugInteraction[];
}

export const SingleHtmlExportModal: React.FC<SingleHtmlExportModalProps> = ({
  isOpen,
  onClose,
  currentDrugs = DRUGS,
  currentInteractions = INTERACTIONS,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const htmlContent = generateSingleFileHtml(currentDrugs, currentInteractions);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RxWeb-Flourish-Network.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Flourish Hub-and-Spoke Single-File HTML Prototype
              </h3>
              <p className="text-xs text-slate-500">
                A single self-contained HTML document featuring the complete physics engine, dataset pipeline, and hub-and-spoke web.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">
              Zero-dependency portable HTML file. Runs in any web browser directly:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li><strong>Flourish Hub-and-Spoke Engine</strong>: Central hubs with large badges &amp; heavy anchor mass + satellite spokes.</li>
              <li><strong>Interactive Physics Sliders</strong>: Adjust orbit spring length, repulsion, central gravity, and solver in real time.</li>
              <li><strong>Scalable Dataset Pipeline</strong>: Built-in dataset switcher, raw JSON / CSV parser, and file uploader.</li>
              <li><strong>Pair Checker &amp; Cabinet Scanner</strong>: Instant multi-drug conflict cluster scans and graph isolates.</li>
            </ul>
          </div>

          <div className="relative">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Source Preview ({(htmlContent.length / 1024).toFixed(1)} KB)</span>
              <span>Portable Single-File</span>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono rounded-xl h-64 overflow-y-auto overflow-x-auto selection:bg-sky-500/30">
              {htmlContent}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {currentDrugs.length} Active Nodes · {currentInteractions.length} Connectors
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied HTML!' : 'Copy to Clipboard'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download RxWeb.html</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function generateSingleFileHtml(drugs: Drug[] = DRUGS, interactions: DrugInteraction[] = INTERACTIONS): string {
  const drugsJson = JSON.stringify(drugs, null, 2);
  const interactionsJson = JSON.stringify(interactions, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RxWeb - Flourish Hub-and-Spoke Drug Interaction Network</title>
  <meta name="description" content="Flourish-style hub-and-spoke drug-drug interaction network visualizer with hyper-interactive physics and personal prescription safety cabinet.">
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <!-- vis-network CDN -->
  <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
    .vis-network { outline: none; }
    .code-font { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-[#F8FAFC] text-slate-800 antialiased h-screen flex flex-col overflow-hidden select-none">

  <!-- Top Navigation Bar -->
  <header class="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 z-30 shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">Rx</div>
      <span class="text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">RxWeb</span>
      <span class="text-xs text-slate-400 hidden sm:inline">·</span>
      <span class="text-xs text-slate-500 hidden sm:inline">Flourish Hub &amp; Spoke Engine</span>
    </div>

    <div class="flex items-center gap-3">
      <button onclick="openPairModal()" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors">
        Pair Checker
      </button>
      <button onclick="openDataModal()" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors">
        Dataset Pipeline
      </button>
      <button onclick="openCabinetModal()" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
        <span>My Prescriptions</span>
        <span id="navCabinetCount" class="w-4 h-4 rounded-full bg-sky-500 text-[10px] text-white flex items-center justify-center font-mono">0</span>
      </button>
    </div>
  </header>

  <!-- Sub-header Hub Statistics Strip -->
  <div class="h-9 bg-slate-50 border-b border-slate-200/80 px-6 flex items-center justify-between text-xs text-slate-500 overflow-x-auto whitespace-nowrap shrink-0">
    <div class="flex items-center gap-2 text-[11px] font-medium text-slate-600">
      <span class="font-bold text-sky-700">★ Flourish Logistics Topology</span>
      <span>·</span>
      <span id="hubCountStat">6 Central Hubs</span>
      <span>·</span>
      <span id="spokeCountStat">18 Orbital Spokes</span>
      <span>·</span>
      <span id="interactionCountStat">24 Curved Connectors</span>
    </div>
    <div id="cabinetConflictStatus" class="text-[11px] font-semibold text-emerald-700">
      ✓ Cabinet Ready
    </div>
  </div>

  <!-- Main Viewport Split -->
  <div class="flex-1 flex overflow-hidden relative">
    <!-- Network Canvas Viewport -->
    <div class="flex-1 h-full relative">
      <!-- Toolbar -->
      <div class="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div class="flex items-center gap-2 pointer-events-auto">
          <div id="subgraphStatus" class="hidden px-3 py-1.5 bg-sky-50/95 backdrop-blur-md border border-sky-200 text-sky-800 rounded-xl text-xs shadow-xs flex items-center gap-2">
            <span id="subgraphText">Focused</span>
            <button onclick="resetGraphFocus()" class="px-1.5 py-0.5 bg-white border border-sky-200 text-sky-700 rounded text-[10px] font-semibold">Reset</button>
          </div>
        </div>

        <!-- Right: Physics Panel Toggle & Canvas Zoom Buttons -->
        <div class="flex items-center gap-2 pointer-events-auto">
          <button onclick="togglePhysicsPanel()" class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-white shadow-xs">
            ⚙ Physics Controls
          </button>
          <div class="flex items-center bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 shadow-xs text-xs">
            <button onclick="zoomIn()" class="px-2 py-0.5 hover:bg-slate-100 rounded">+</button>
            <button onclick="zoomOut()" class="px-2 py-0.5 hover:bg-slate-100 rounded">-</button>
            <button onclick="fitGraph()" class="px-2.5 py-0.5 hover:bg-slate-100 rounded">Fit</button>
            <button onclick="togglePhysics()" id="physicsBtn" class="px-2.5 py-0.5 hover:bg-slate-100 rounded text-sky-600 font-semibold">Pause</button>
          </div>
        </div>
      </div>

      <!-- Physics Controls Drawer -->
      <div id="physicsPanel" class="hidden absolute top-16 right-4 z-20 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-4 text-xs space-y-3 pointer-events-auto">
        <div class="font-bold text-slate-800 text-[11px] uppercase tracking-wide border-b pb-1.5">Flourish Physics Tuning</div>
        <div>
          <div class="flex justify-between text-[11px] mb-1">
            <span>Spoke Orbit Radius</span>
            <span id="valSpring" class="font-mono">120px</span>
          </div>
          <input type="range" min="60" max="220" value="120" oninput="updatePhysics('spring', this.value)" class="w-full accent-sky-600">
        </div>
        <div>
          <div class="flex justify-between text-[11px] mb-1">
            <span>Node Repulsion Force</span>
            <span id="valRepulsion" class="font-mono">1800</span>
          </div>
          <input type="range" min="800" max="3500" value="1800" oninput="updatePhysics('repulsion', this.value)" class="w-full accent-sky-600">
        </div>
        <div>
          <div class="flex justify-between text-[11px] mb-1">
            <span>Core Attraction</span>
            <span id="valGravity" class="font-mono">0.18</span>
          </div>
          <input type="range" min="0.05" max="0.40" step="0.02" value="0.18" oninput="updatePhysics('gravity', this.value)" class="w-full accent-sky-600">
        </div>
        <button onclick="stabilizeGraph()" class="w-full py-1.5 bg-sky-50 text-sky-700 font-semibold rounded-lg hover:bg-sky-100">Stabilize Layout</button>
      </div>

      <!-- Graph Canvas -->
      <div id="networkCanvas" class="w-full h-full bg-[#F8FAFC]"></div>

      <!-- Legend -->
      <div class="absolute bottom-4 left-4 z-10 pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 text-xs shadow-md max-w-sm">
        <div class="font-bold text-slate-800 text-[11px] uppercase mb-1">Hub &amp; Spoke Hierarchy</div>
        <div class="flex items-center gap-3 text-[11px] mb-1.5">
          <span class="flex items-center gap-1 font-semibold text-sky-800">★ Primary Hub (Anchor)</span>
          <span class="flex items-center gap-1 text-slate-500">○ Satellite Spoke</span>
        </div>
        <div class="flex items-center gap-3 text-[10px] text-slate-600 pt-1 border-t">
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Severe</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Moderate</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Minor</span>
        </div>
      </div>
    </div>

    <!-- Right Inspector Sidebar -->
    <aside id="inspectorSidebar" class="w-80 md:w-96 bg-white border-l border-slate-200 h-full p-6 overflow-y-auto flex flex-col justify-between shrink-0 shadow-lg z-20">
      <div id="inspectorEmpty" class="text-center py-16">
        <h3 class="text-base font-semibold text-slate-800 mb-1">Clinical Inspector</h3>
        <p class="text-xs text-slate-500 mb-6">Hover or click any central hub or satellite spoke on the web to isolate its interaction cluster.</p>
      </div>
      <div id="inspectorContent" class="hidden space-y-4"></div>
      <div class="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3">RxWeb Flourish Topology System</div>
    </aside>
  </div>

  <!-- Pair Checker Modal -->
  <div id="pairModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
    <div class="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="font-bold text-base text-slate-900">Interaction Pair Checker</h3>
        <button onclick="closePairModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-[11px] font-semibold text-slate-400 block mb-1">Drug 1</label>
          <select id="selectDrugA" onchange="checkPairInteraction()" class="w-full text-xs p-2 border rounded-lg bg-slate-50"></select>
        </div>
        <div>
          <label class="text-[11px] font-semibold text-slate-400 block mb-1">Drug 2</label>
          <select id="selectDrugB" onchange="checkPairInteraction()" class="w-full text-xs p-2 border rounded-lg bg-slate-50"></select>
        </div>
      </div>
      <div id="pairResult" class="p-4 rounded-xl border text-xs"></div>
    </div>
  </div>

  <!-- Dataset Pipeline Modal -->
  <div id="dataModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
    <div class="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="font-bold text-base text-slate-900">Dataset Pipeline (Scalable Data Layer)</h3>
        <button onclick="closeDataModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <p class="text-xs text-slate-600">Paste custom CSV or JSON interaction data below to re-render the network graph dynamically:</p>
      <textarea id="customDataInput" rows="6" placeholder="Paste drug1,drug2,severity,mechanismType CSV or JSON data..." class="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl"></textarea>
      <div class="flex justify-end gap-2">
        <button onclick="loadCustomData()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">Parse &amp; Render Network</button>
      </div>
    </div>
  </div>

  <!-- Cabinet Modal -->
  <div id="cabinetModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
    <div class="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="font-bold text-base text-slate-900">My Prescriptions Cabinet</h3>
        <button onclick="closeCabinetModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <div id="cabinetScanCard" class="p-4 rounded-xl border text-xs"></div>
      <div class="flex gap-2">
        <select id="cabinetAddSelect" class="flex-1 text-xs p-2 border rounded-lg bg-slate-50"></select>
        <button onclick="addMedicationToCabinet()" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">Add</button>
      </div>
      <div id="cabinetList" class="divide-y divide-slate-100 border rounded-xl overflow-hidden text-xs"></div>
    </div>
  </div>

  <!-- Embedded Client Script -->
  <script>
    let ACTIVE_DRUGS = ${drugsJson};
    let ACTIVE_INTERACTIONS = ${interactionsJson};

    let network = null;
    let nodesDataSet = null;
    let edgesDataSet = null;
    let myCabinet = ['warfarin', 'aspirin', 'lipitor'];
    let physicsActive = true;

    let physicsParams = {
      springLength: 120,
      repulsion: -1800,
      gravity: 0.18,
      damping: 0.45
    };

    function calculateHubs() {
      const degMap = {};
      ACTIVE_DRUGS.forEach(d => degMap[d.id] = 0);
      ACTIVE_INTERACTIONS.forEach(i => {
        degMap[i.drug1] = (degMap[i.drug1] || 0) + 1;
        degMap[i.drug2] = (degMap[i.drug2] || 0) + 1;
      });

      ACTIVE_DRUGS.forEach(d => {
        d.degree = degMap[d.id] || 0;
        d.isHub = d.degree >= 3 || ['warfarin', 'aspirin', 'zoloft', 'lipitor', 'xanax', 'tramadol'].includes(d.id);
      });

      const hubs = ACTIVE_DRUGS.filter(d => d.isHub);
      const spokes = ACTIVE_DRUGS.filter(d => !d.isHub);
      document.getElementById('hubCountStat').innerText = hubs.length + ' Central Hubs';
      document.getElementById('spokeCountStat').innerText = spokes.length + ' Orbital Spokes';
      document.getElementById('interactionCountStat').innerText = ACTIVE_INTERACTIONS.length + ' Connectors';
    }

    function initNetwork() {
      calculateHubs();
      const container = document.getElementById('networkCanvas');

      const nodes = ACTIVE_DRUGS.map(d => {
        if (d.isHub) {
          return {
            id: d.id,
            label: '★ ' + d.brandName,
            title: '[Central Hub] ' + d.brandName + ' (' + d.genericName + ')\\nClass: ' + d.category + '\\nActive Connections: ' + d.degree + ' interacting drugs',
            shape: 'box',
            margin: { top: 10, bottom: 10, left: 16, right: 16 },
            borderRadius: 10,
            borderWidth: 2.5,
            color: { background: '#FFFFFF', border: '#0284C7' },
            font: { size: 13, face: 'Plus Jakarta Sans', color: '#0F172A', bold: true },
            mass: 2.5,
            data: d
          };
        } else {
          return {
            id: d.id,
            label: d.brandName,
            title: d.brandName + ' (' + d.genericName + ')\\nClass: ' + d.category,
            shape: 'box',
            margin: { top: 6, bottom: 6, left: 10, right: 10 },
            borderRadius: 6,
            borderWidth: 1.5,
            color: { background: '#FFFFFF', border: '#64748B' },
            font: { size: 11, face: 'Plus Jakarta Sans', color: '#334155' },
            mass: 1.0,
            data: d
          };
        }
      });

      const edges = ACTIVE_INTERACTIONS.map(i => ({
        id: i.id,
        from: i.drug1,
        to: i.drug2,
        title: i.title + '\\nSeverity: ' + i.severity.toUpperCase(),
        color: i.severity === 'severe' ? '#EF4444' : i.severity === 'moderate' ? '#F97316' : '#EAB308',
        width: i.mechanismType === 'synergistic' ? 3 : 2,
        dashes: i.mechanismType === 'metabolic' ? [6, 4] : false,
        smooth: { enabled: true, type: 'curvedCW', roundness: 0.15 },
        data: i
      }));

      nodesDataSet = new vis.DataSet(nodes);
      edgesDataSet = new vis.DataSet(edges);

      const options = {
        physics: {
          enabled: true,
          solver: 'barnesHut',
          minVelocity: 0.75,
          maxVelocity: 25,
          timestep: 0.5,
          barnesHut: {
            springLength: physicsParams.springLength,
            gravitationalConstant: physicsParams.repulsion,
            centralGravity: physicsParams.gravity,
            damping: physicsParams.damping,
            avoidOverlap: 0.6
          },
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 50,
            fit: true
          }
        },
        interaction: { hover: true, hoverConnectedEdges: true, tooltipDelay: 120 }
      };

      network = new vis.Network(container, { nodes: nodesDataSet, edges: edgesDataSet }, options);

      // Freeze physics once stabilized so the screen rests completely still!
      network.once('stabilized', () => {
        network.setOptions({ physics: { enabled: false } });
        physicsActive = false;
        const btn = document.getElementById('physicsBtn');
        if (btn) btn.innerText = 'Resume';
      });

      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          inspectDrug(params.nodes[0]);
        } else if (params.edges.length > 0) {
          inspectInteraction(params.edges[0]);
        } else {
          resetGraphFocus();
        }
      });


      populateDropdowns();
      updateCabinetUI();
    }


    function inspectDrug(drugId) {
      const drug = ACTIVE_DRUGS.find(d => d.id === drugId);
      if (!drug) return;

      const connectedEdges = ACTIVE_INTERACTIONS.filter(i => i.drug1 === drugId || i.drug2 === drugId);
      const neighborIds = new Set([drugId]);
      connectedEdges.forEach(e => { neighborIds.add(e.drug1); neighborIds.add(e.drug2); });

      const updated = ACTIVE_DRUGS.map(d => ({
        id: d.id,
        opacity: neighborIds.has(d.id) ? 1 : 0.15,
        color: d.id === drugId ? { background: '#F0F9FF', border: '#0284C7' } : { background: '#FFFFFF', border: '#CBD5E1' }
      }));
      nodesDataSet.update(updated);

      document.getElementById('subgraphStatus').classList.remove('hidden');
      document.getElementById('subgraphText').innerText = (drug.isHub ? '★ Hub: ' : 'Spoke: ') + drug.brandName;

      document.getElementById('inspectorEmpty').classList.add('hidden');
      const content = document.getElementById('inspectorContent');
      content.classList.remove('hidden');
      content.innerHTML = \`
        <div>
          <span class="text-[10px] font-semibold text-sky-600 uppercase tracking-wide">\${drug.category} \${drug.isHub ? '· CENTRAL HUB' : '· SPOKE'}</span>
          <h2 class="text-xl font-bold text-slate-900">\${drug.brandName}</h2>
          <div class="text-xs text-slate-500 font-mono">Active: \${drug.genericName}</div>
        </div>
        <button onclick="toggleCabinetMed('\${drug.id}')" class="w-full py-2 px-3 text-xs font-semibold rounded-lg border \${myCabinet.includes(drug.id) ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-900 text-white'}">
          \${myCabinet.includes(drug.id) ? '✓ Saved in Prescriptions' : '+ Add to Prescriptions'}
        </button>
        \${drug.fdaBoxedWarning ? '<div class="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs font-medium">⚠️ FDA Boxed Warning: ' + drug.boxedWarningSummary + '</div>' : ''}
        <div class="text-xs text-slate-600">\${drug.description}</div>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Common Side Effects</span>
          <div class="flex flex-wrap gap-1">\${(drug.commonSideEffects || []).map(s => '<span class="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">' + s + '</span>').join('')}</div>
        </div>
        <div class="bg-sky-50 p-3 rounded-xl border border-sky-100 text-xs text-sky-950 font-medium">
          <strong>Patient Advice:</strong> \${drug.patientAdvice || 'Consult prescribing doctor.'}
        </div>
      \`;
    }

    function inspectInteraction(interactionId) {
      const inter = ACTIVE_INTERACTIONS.find(i => i.id === interactionId);
      if (!inter) return;
      document.getElementById('inspectorEmpty').classList.add('hidden');
      const content = document.getElementById('inspectorContent');
      content.classList.remove('hidden');
      const isSevere = inter.severity === 'severe';
      content.innerHTML = \`
        <div class="p-3.5 rounded-xl border \${isSevere ? 'bg-red-50 border-red-200 text-red-950' : 'bg-orange-50 border-orange-200 text-orange-950'}">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase text-white \${isSevere ? 'bg-red-600' : 'bg-orange-500'}">\${inter.severity} Risk</span>
          <h3 class="text-sm font-bold mt-2">\${inter.title}</h3>
          <p class="text-xs mt-1">\${inter.description}</p>
        </div>
        <div class="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Clinical Mechanism</span>
          <p>\${inter.clinicalRationale}</p>
        </div>
        <div class="text-xs bg-sky-50 p-3 rounded-xl border border-sky-200 text-sky-950">
          <span class="text-[10px] uppercase font-bold text-sky-700 block">Patient Action</span>
          <p>\${inter.patientActionableAdvice}</p>
        </div>
      \`;
    }

    function resetGraphFocus() {
      const updated = ACTIVE_DRUGS.map(d => ({ id: d.id, opacity: 1, color: { background: '#FFFFFF', border: d.isHub ? '#0284C7' : '#64748B' } }));
      nodesDataSet.update(updated);
      document.getElementById('subgraphStatus').classList.add('hidden');
      network.fit();
    }

    function zoomIn() { network.moveTo({ scale: network.getScale() * 1.3 }); }
    function zoomOut() { network.moveTo({ scale: network.getScale() * 0.75 }); }
    function fitGraph() { network.fit(); }
    function togglePhysics() {
      physicsActive = !physicsActive;
      network.setOptions({ physics: { enabled: physicsActive } });
      document.getElementById('physicsBtn').innerText = physicsActive ? 'Pause' : 'Resume';
    }

    function togglePhysicsPanel() {
      const p = document.getElementById('physicsPanel');
      p.classList.toggle('hidden');
    }

    function updatePhysics(type, val) {
      if (type === 'spring') {
        physicsParams.springLength = Number(val);
        document.getElementById('valSpring').innerText = val + 'px';
      } else if (type === 'repulsion') {
        physicsParams.repulsion = -Number(val);
        document.getElementById('valRepulsion').innerText = val;
      } else if (type === 'gravity') {
        physicsParams.gravity = Number(val);
        document.getElementById('valGravity').innerText = val;
      }
      network.setOptions({
        physics: {
          barnesHut: {
            springLength: physicsParams.springLength,
            gravitationalConstant: physicsParams.repulsion,
            centralGravity: physicsParams.gravity
          }
        }
      });
    }

    function stabilizeGraph() {
      network.setOptions({ physics: { enabled: true } });
      physicsActive = true;
      const btn = document.getElementById('physicsBtn');
      if (btn) btn.innerText = 'Pause';
      network.stabilize(1000);
      network.once('stabilized', () => {
        network.setOptions({ physics: { enabled: false } });
        physicsActive = false;
        if (btn) btn.innerText = 'Resume';
      });
    }

    function populateDropdowns() {
      const a = document.getElementById('selectDrugA');
      const b = document.getElementById('selectDrugB');
      const c = document.getElementById('cabinetAddSelect');
      a.innerHTML = '';
      b.innerHTML = '';
      c.innerHTML = '';
      ACTIVE_DRUGS.forEach(d => {
        a.add(new Option(d.brandName + (d.isHub ? ' (★ Hub)' : ''), d.id));
        b.add(new Option(d.brandName + (d.isHub ? ' (★ Hub)' : ''), d.id));
        c.add(new Option(d.brandName, d.id));
      });
      if (b.options.length > 1) b.selectedIndex = 1;
      checkPairInteraction();
    }

    function checkPairInteraction() {
      const idA = document.getElementById('selectDrugA').value;
      const idB = document.getElementById('selectDrugB').value;
      const res = document.getElementById('pairResult');
      if (idA === idB) {
        res.innerHTML = '<span class="text-slate-400">Select two different drugs.</span>';
        return;
      }
      const match = ACTIVE_INTERACTIONS.find(i => (i.drug1 === idA && i.drug2 === idB) || (i.drug1 === idB && i.drug2 === idA));
      if (match) {
        res.className = 'p-4 rounded-xl border ' + (match.severity === 'severe' ? 'bg-red-50 border-red-200 text-red-950' : 'bg-orange-50 border-orange-200 text-orange-950');
        res.innerHTML = '<div class="font-bold text-sm">' + match.severity.toUpperCase() + ': ' + match.title + '</div><p class="mt-1">' + match.description + '</p>';
      } else {
        res.className = 'p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950';
        res.innerHTML = '<strong>No Direct Interaction Found</strong> for this specific pair.';
      }
    }

    function updateCabinetUI() {
      document.getElementById('navCabinetCount').innerText = myCabinet.length;
      const list = document.getElementById('cabinetList');
      list.innerHTML = myCabinet.map(id => {
        const d = ACTIVE_DRUGS.find(x => x.id === id);
        if (!d) return '';
        return '<div class="p-2.5 flex items-center justify-between"><div><strong>' + d.brandName + '</strong> <span class="text-slate-400 font-mono">(' + d.genericName + ')</span></div><button onclick="removeMedicationFromCabinet(\\'' + id + '\\')" class="text-red-500 hover:text-red-700">Remove</button></div>';
      }).join('');

      let conflicts = [];
      for (let i = 0; i < myCabinet.length; i++) {
        for (let j = i + 1; j < myCabinet.length; j++) {
          const match = ACTIVE_INTERACTIONS.find(m => (m.drug1 === myCabinet[i] && m.drug2 === myCabinet[j]) || (m.drug1 === myCabinet[j] && m.drug2 === myCabinet[i]));
          if (match) conflicts.push(match);
        }
      }

      const scan = document.getElementById('cabinetScanCard');
      const statusText = document.getElementById('cabinetConflictStatus');
      if (conflicts.length > 0) {
        scan.className = 'p-4 rounded-xl border bg-red-50 border-red-200 text-red-950';
        scan.innerHTML = '<div class="font-bold text-sm">⚠️ ' + conflicts.length + ' Negative Interaction Conflict(s) Detected in Cabinet!</div>' + conflicts.map(c => '<div class="mt-1 text-xs">• ' + c.title + ' (' + c.severity.toUpperCase() + ')</div>').join('');
        statusText.className = 'text-[11px] font-semibold text-rose-600';
        statusText.innerText = '⚠️ ' + conflicts.length + ' Cabinet Conflicts!';
      } else {
        scan.className = 'p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950';
        scan.innerHTML = '<strong>✓ All Clear:</strong> No known direct interaction clashes in your current list.';
        statusText.className = 'text-[11px] font-semibold text-emerald-700';
        statusText.innerText = '✓ Cabinet Safe';
      }
    }

    function toggleCabinetMed(id) {
      if (myCabinet.includes(id)) {
        myCabinet = myCabinet.filter(x => x !== id);
      } else {
        myCabinet.push(id);
      }
      updateCabinetUI();
      inspectDrug(id);
    }

    function addMedicationToCabinet() {
      const id = document.getElementById('cabinetAddSelect').value;
      if (id && !myCabinet.includes(id)) {
        myCabinet.push(id);
        updateCabinetUI();
      }
    }

    function removeMedicationFromCabinet(id) {
      myCabinet = myCabinet.filter(x => x !== id);
      updateCabinetUI();
    }

    function loadCustomData() {
      const text = document.getElementById('customDataInput').value.trim();
      if (!text) return;
      try {
        if (text.startsWith('{') || text.startsWith('[')) {
          const parsed = JSON.parse(text);
          if (parsed.drugs && parsed.interactions) {
            ACTIVE_DRUGS = parsed.drugs;
            ACTIVE_INTERACTIONS = parsed.interactions;
          }
        }
        initNetwork();
        closeDataModal();
      } catch (e) {
        alert('Invalid format. Please verify JSON or CSV syntax.');
      }
    }

    function openPairModal() { document.getElementById('pairModal').classList.remove('hidden'); }
    function closePairModal() { document.getElementById('pairModal').classList.add('hidden'); }
    function openCabinetModal() { document.getElementById('cabinetModal').classList.remove('hidden'); }
    function closeCabinetModal() { document.getElementById('cabinetModal').classList.add('hidden'); }
    function openDataModal() { document.getElementById('dataModal').classList.remove('hidden'); }
    function closeDataModal() { document.getElementById('dataModal').classList.add('hidden'); }

    window.onload = initNetwork;
  </script>
</body>
</html>`;
}
