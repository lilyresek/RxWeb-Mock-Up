import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Network, Options } from 'vis-network';
import { DataSet } from 'vis-data';
import { Drug, DrugInteraction, DRUG_CLASSES } from '../data/drugData';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Play,
  Pause,
  Filter,
  Eye,
  Search,
  Sliders,
  ChevronDown,
  ChevronUp,
  Activity,
  Sparkles,
  Info,
  Radio
} from 'lucide-react';

interface NetworkGraphProps {
  drugs: Drug[];
  interactions: DrugInteraction[];
  onSelectDrug: (drug: Drug | null) => void;
  onSelectInteraction: (interaction: DrugInteraction | null) => void;
  selectedDrugId: string | null;
  cabinetDrugIds: string[];
  isCabinetHighlightActive: boolean;
  onClearCabinetHighlight: () => void;
}

export interface NetworkGraphHandle {
  focusDrug: (drugId: string) => void;
  focusInteraction: (drugAId: string, drugBId: string) => void;
  resetView: () => void;
}

export const NetworkGraph = forwardRef<NetworkGraphHandle, NetworkGraphProps>(({
  drugs,
  interactions,
  onSelectDrug,
  onSelectInteraction,
  selectedDrugId,
  cabinetDrugIds,
  isCabinetHighlightActive,
  onClearCabinetHighlight,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesDataSetRef = useRef<DataSet<any> | null>(null);
  const edgesDataSetRef = useRef<DataSet<any> | null>(null);

  // Layout & Physics state
  const [physicsRunning, setPhysicsRunning] = useState<boolean>(false); // Pauses after stabilization
  const [solverType, setSolverType] = useState<'barnesHut' | 'forceAtlas2Based'>('barnesHut');
  const [springLength, setSpringLength] = useState<number>(120);
  const [repulsionStrength, setRepulsionStrength] = useState<number>(-1800);
  const [centralGravity, setCentralGravity] = useState<number>(0.18);
  const [damping, setDamping] = useState<number>(0.45);
  const [physicsPanelOpen, setPhysicsPanelOpen] = useState<boolean>(false);

  // Filters & Subgraph state
  const [severityFilter, setSeverityFilter] = useState<'all' | 'severe' | 'moderate'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [focusedDrug, setFocusedDrug] = useState<Drug | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [legendOpen, setLegendOpen] = useState<boolean>(false);

  // Helper colors
  const getSeverityColor = (severity: 'severe' | 'moderate' | 'minor') => {
    switch (severity) {
      case 'severe':
        return '#EF4444'; // Red
      case 'moderate':
        return '#F97316'; // Orange
      case 'minor':
        return '#EAB308'; // Amber/Yellow
    }
  };

  const getClassColor = (classKey: Drug['classKey']) => {
    const item = DRUG_CLASSES.find((c) => c.key === classKey);
    return item ? item.color : '#0284C7';
  };

  // Build Vis nodes & edges with strictly plain-text labels (NO HTML TAGS)
  const createNodesAndEdges = () => {
    const nodes = drugs.map((drug) => {
      const color = getClassColor(drug.classKey);
      const isHub = !!drug.isHub;

      if (isHub) {
        // CENTRAL HUB: Strictly plain-text label, larger font, bold border
        return {
          id: drug.id,
          label: `★ ${drug.brandName}`,
          title: `[Central Hub] ${drug.brandName} (${drug.genericName})\nClass: ${drug.category}\nActive Connections: ${drug.degree || 0} interacting drugs`,
          shape: 'box',
          margin: { top: 10, bottom: 10, left: 16, right: 16 },
          borderWidth: 2.5,
          borderRadius: 10,
          color: {
            background: '#FFFFFF',
            border: color,
            highlight: {
              background: '#F0F9FF',
              border: '#0284C7',
            },
            hover: {
              background: '#F8FAFC',
              border: '#0284C7',
            },
          },
          font: {
            color: '#0F172A',
            size: 13,
            face: 'Plus Jakarta Sans, sans-serif',
            bold: true,
          },
          shadow: {
            enabled: true,
            color: 'rgba(2, 132, 199, 0.18)',
            size: 8,
            x: 0,
            y: 2,
          },
          mass: 2.5,
          data: drug,
        };
      } else {
        // SPOKE SATELLITE: Strictly plain-text label
        return {
          id: drug.id,
          label: drug.brandName,
          title: `${drug.brandName} (${drug.genericName})\nClass: ${drug.category}`,
          shape: 'box',
          margin: { top: 6, bottom: 6, left: 10, right: 10 },
          borderWidth: 1.5,
          borderRadius: 6,
          color: {
            background: '#FFFFFF',
            border: color,
            highlight: {
              background: '#F0F9FF',
              border: '#0284C7',
            },
            hover: {
              background: '#F8FAFC',
              border: '#0284C7',
            },
          },
          font: {
            color: '#334155',
            size: 11,
            face: 'Plus Jakarta Sans, sans-serif',
          },
          shadow: {
            enabled: true,
            color: 'rgba(15, 23, 42, 0.05)',
            size: 4,
            x: 0,
            y: 1,
          },
          mass: 1.0,
          data: drug,
        };
      }
    });

    // Flourish-Style Curved Spline Edges
    const edges = interactions.map((interaction) => {
      const color = getSeverityColor(interaction.severity);
      const isSynergistic = interaction.mechanismType === 'synergistic';
      const isMetabolic = interaction.mechanismType === 'metabolic';

      return {
        id: interaction.id,
        from: interaction.drug1,
        to: interaction.drug2,
        title: `${interaction.title}\nSeverity: ${interaction.severity.toUpperCase()}\nMechanism: ${interaction.mechanismType}`,
        color: {
          color: color,
          highlight: color,
          hover: color,
          opacity: 0.85,
        },
        width: isSynergistic ? 3 : 2,
        dashes: isMetabolic ? [6, 4] : interaction.mechanismType === 'clearance' ? [2, 3] : false,
        smooth: {
          enabled: true,
          type: 'curvedCW',
          roundness: 0.15,
        },
        hoverWidth: 1.5,
        selectionWidth: 2,
        data: interaction,
      };
    });

    return { nodes, edges };
  };

  // Initialize Network with Rock-Solid Stabilization & Non-Erratic Physics
  useEffect(() => {
    if (!containerRef.current) return;

    const { nodes, edges } = createNodesAndEdges();
    const nodesDataSet = new DataSet(nodes);
    const edgesDataSet = new DataSet(edges);

    nodesDataSetRef.current = nodesDataSet;
    edgesDataSetRef.current = edgesDataSet;

    const options: Options = {
      nodes: {
        scaling: {
          min: 12,
          max: 28,
        },
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'curvedCW',
          roundness: 0.15,
        },
      },
      physics: {
        enabled: true,
        solver: solverType,
        minVelocity: 0.75,
        maxVelocity: 25, // Bounds velocity to prevent erratic jumping off-screen
        timestep: 0.5,
        barnesHut: {
          gravitationalConstant: repulsionStrength,
          centralGravity: centralGravity,
          springLength: springLength,
          springConstant: 0.035,
          damping: damping, // High damping eliminates perpetual spinning & jitter
          avoidOverlap: 0.6,
        },
        forceAtlas2Based: {
          gravitationalConstant: -40,
          centralGravity: 0.02,
          springLength: springLength * 0.8,
          springConstant: 0.06,
          damping: 0.6,
          avoidOverlap: 0.65,
        },
        stabilization: {
          enabled: true,
          iterations: 1000, // Settles completely in memory before painting
          updateInterval: 50,
          onlyDynamicEdges: false,
          fit: true,
        },
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        selectConnectedEdges: false,
        tooltipDelay: 120,
        zoomView: true,
        dragView: true,
        dragNodes: true,
        navigationButtons: false,
        keyboard: false,
      },
    };

    const network = new Network(
      containerRef.current,
      { nodes: nodesDataSet as any, edges: edgesDataSet as any },
      options
    );
    networkRef.current = network;

    // Automatic Stabilization Handler: Freezes physics once layout reaches resting equilibrium
    network.once('stabilized', () => {
      network.setOptions({ physics: { enabled: false } });
      setPhysicsRunning(false);
    });

    network.on('stabilizationIterationsDone', () => {
      network.setOptions({ physics: { enabled: false } });
      setPhysicsRunning(false);
    });

    // Handle user dragging: allow dragging with gentle physics, then pause
    network.on('dragStart', () => {
      // Keep viewport calm and steady during drag
    });

    network.on('dragEnd', () => {
      // Stop continuous physics once drag finishes to avoid jitter
      network.setOptions({ physics: { enabled: false } });
      setPhysicsRunning(false);
    });

    // Click handler: isolates subgraph (hub & spokes)
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const clickedNodeId = params.nodes[0];
        const drug = drugs.find((d) => d.id === clickedNodeId) || null;
        onSelectDrug(drug);
        onSelectInteraction(null);
        applyFocusFilter(clickedNodeId);
      } else if (params.edges.length > 0) {
        const clickedEdgeId = params.edges[0];
        const interaction = interactions.find((i) => i.id === clickedEdgeId) || null;
        onSelectInteraction(interaction);
        onSelectDrug(null);
      } else {
        // Clicked canvas background: reset focus
        onSelectDrug(null);
        onSelectInteraction(null);
        resetFocusFilter();
      }
    });

    // Resize observer: Redraw without calling network.fit() to prevent violent jumping
    const resizeObserver = new ResizeObserver(() => {
      if (networkRef.current) {
        networkRef.current.redraw();
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      network.destroy();
      networkRef.current = null;
    };
  }, [drugs, interactions]);

  // Update physics parameters when sliders change
  const applyPhysicsOptions = (enabled: boolean) => {
    if (!networkRef.current) return;
    networkRef.current.setOptions({
      physics: {
        enabled: enabled,
        solver: solverType,
        minVelocity: 0.75,
        maxVelocity: 25,
        barnesHut: {
          gravitationalConstant: repulsionStrength,
          centralGravity: centralGravity,
          springLength: springLength,
          springConstant: 0.035,
          damping: damping,
          avoidOverlap: 0.6,
        },
        forceAtlas2Based: {
          gravitationalConstant: -40,
          centralGravity: 0.02,
          springLength: springLength * 0.8,
          springConstant: 0.06,
          damping: 0.6,
          avoidOverlap: 0.65,
        },
      },
    });
  };

  // Subgraph Focus Filter: smoothly highlights clicked node & connected hub/spokes
  const applyFocusFilter = (focusId: string) => {
    const drug = drugs.find((d) => d.id === focusId);
    setFocusedDrug(drug || null);

    if (!nodesDataSetRef.current || !edgesDataSetRef.current || !networkRef.current) return;

    const connectedEdges = interactions.filter((i) => i.drug1 === focusId || i.drug2 === focusId);
    const neighborIds = new Set<string>([focusId]);
    connectedEdges.forEach((e) => {
      neighborIds.add(e.drug1);
      neighborIds.add(e.drug2);
    });
    const activeEdgeIds = new Set(connectedEdges.map((e) => e.id));

    const updatedNodes = drugs.map((d) => {
      const isFocused = d.id === focusId;
      const isNeighbor = neighborIds.has(d.id);
      const color = getClassColor(d.classKey);

      if (isFocused) {
        return {
          id: d.id,
          color: {
            background: '#F0F9FF',
            border: '#0284C7',
          },
          borderWidth: 3,
          opacity: 1,
        };
      } else if (isNeighbor) {
        return {
          id: d.id,
          color: {
            background: '#FFFFFF',
            border: color,
          },
          borderWidth: d.isHub ? 2.5 : 1.5,
          opacity: 1,
        };
      } else {
        return {
          id: d.id,
          color: {
            background: '#F8FAFC',
            border: '#E2E8F0',
          },
          borderWidth: 1,
          opacity: 0.15,
        };
      }
    });

    const updatedEdges = interactions.map((i) => {
      const isConnected = activeEdgeIds.has(i.id);
      const baseColor = getSeverityColor(i.severity);
      return {
        id: i.id,
        hidden: !isConnected,
        color: {
          color: baseColor,
          opacity: isConnected ? 1 : 0.05,
        },
      };
    });

    nodesDataSetRef.current.update(updatedNodes);
    edgesDataSetRef.current.update(updatedEdges);
  };

  const resetFocusFilter = () => {
    setFocusedDrug(null);
    if (!nodesDataSetRef.current || !edgesDataSetRef.current || !networkRef.current) return;

    const { nodes, edges } = createNodesAndEdges();
    nodesDataSetRef.current.update(nodes);
    edgesDataSetRef.current.update(edges);
  };

  // React to external selectedDrugId change
  useEffect(() => {
    if (selectedDrugId) {
      applyFocusFilter(selectedDrugId);
    } else if (!isCabinetHighlightActive && focusedDrug) {
      resetFocusFilter();
    }
  }, [selectedDrugId]);

  // Cabinet Highlight Mode
  useEffect(() => {
    if (!nodesDataSetRef.current || !edgesDataSetRef.current || !networkRef.current) return;

    if (isCabinetHighlightActive && cabinetDrugIds.length > 0) {
      const cabinetSet = new Set(cabinetDrugIds);
      const cabinetInteractions = interactions.filter(
        (i) => cabinetSet.has(i.drug1) && cabinetSet.has(i.drug2)
      );
      const cabinetEdgeIds = new Set(cabinetInteractions.map((i) => i.id));

      const updatedNodes = drugs.map((d) => {
        const inCabinet = cabinetSet.has(d.id);

        if (inCabinet) {
          return {
            id: d.id,
            color: {
              background: '#FEF3C7',
              border: '#D97706',
            },
            borderWidth: 3,
            opacity: 1,
          };
        } else {
          return {
            id: d.id,
            color: {
              background: '#F8FAFC',
              border: '#E2E8F0',
            },
            borderWidth: 1,
            opacity: 0.12,
          };
        }
      });

      const updatedEdges = interactions.map((i) => {
        const isCabinetConflict = cabinetEdgeIds.has(i.id);
        const baseColor = getSeverityColor(i.severity);

        if (isCabinetConflict) {
          return {
            id: i.id,
            hidden: false,
            width: 4,
            color: {
              color: baseColor,
              opacity: 1,
            },
          };
        } else {
          return {
            id: i.id,
            hidden: true,
            color: {
              color: '#CBD5E1',
              opacity: 0.05,
            },
          };
        }
      });

      nodesDataSetRef.current.update(updatedNodes);
      edgesDataSetRef.current.update(updatedEdges);
    } else if (!isCabinetHighlightActive && !selectedDrugId) {
      resetFocusFilter();
    }
  }, [isCabinetHighlightActive, cabinetDrugIds]);

  // Imperative handle
  useImperativeHandle(ref, () => ({
    focusDrug: (drugId: string) => {
      const drug = drugs.find((d) => d.id === drugId);
      if (drug) {
        onSelectDrug(drug);
        applyFocusFilter(drugId);
        if (networkRef.current) {
          networkRef.current.focus(drugId, {
            scale: 1.1,
            animation: { duration: 350, easingFunction: 'easeInOutQuad' },
          });
        }
      }
    },
    focusInteraction: (drugAId: string, drugBId: string) => {
      const interaction = interactions.find(
        (i) => (i.drug1 === drugAId && i.drug2 === drugBId) || (i.drug1 === drugBId && i.drug2 === drugAId)
      );
      if (interaction && networkRef.current) {
        onSelectInteraction(interaction);
        networkRef.current.setSelection({
          nodes: [drugAId, drugBId],
          edges: [interaction.id],
        });
      }
    },
    resetView: () => {
      onSelectDrug(null);
      onSelectInteraction(null);
      resetFocusFilter();
      if (networkRef.current) {
        networkRef.current.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
      }
    },
  }));

  // Canvas View Controls
  const handleZoomIn = () => {
    if (!networkRef.current) return;
    const currentScale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: currentScale * 1.25, animation: { duration: 200, easingFunction: 'easeInOutQuad' } });
  };

  const handleZoomOut = () => {
    if (!networkRef.current) return;
    const currentScale = networkRef.current.getScale();
    networkRef.current.moveTo({ scale: currentScale * 0.8, animation: { duration: 200, easingFunction: 'easeInOutQuad' } });
  };

  const handleFit = () => {
    if (!networkRef.current) return;
    networkRef.current.fit({ animation: { duration: 350, easingFunction: 'easeInOutQuad' } });
  };

  const togglePhysics = () => {
    if (!networkRef.current) return;
    const newState = !physicsRunning;
    networkRef.current.setOptions({ physics: { enabled: newState } });
    setPhysicsRunning(newState);
  };

  const handleStabilize = () => {
    if (!networkRef.current) return;
    networkRef.current.stabilize(500);
    networkRef.current.setOptions({ physics: { enabled: false } });
    setPhysicsRunning(false);
  };

  const filteredSearchDrugs = drugs.filter(
    (d) =>
      d.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.genericName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-full bg-[#F8FAFC] overflow-hidden flex flex-col select-none">
      {/* Top Floating Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Quick Search & Subgraph Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Drug Finder */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-xs hover:bg-white hover:border-slate-300 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Locate Drug Node</span>
            </button>

            {isSearchOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <input
                  type="text"
                  placeholder="Search drug or active ingredient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
                />
                <div className="max-h-56 overflow-y-auto mt-2 divide-y divide-slate-100">
                  {filteredSearchDrugs.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectDrug(d);
                        applyFocusFilter(d.id);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-sky-50/70 rounded-lg transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 flex items-center gap-1.5">
                          {d.isHub && <span className="text-[10px] text-sky-600 font-bold">★</span>}
                          {d.brandName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {d.genericName}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-sky-600 font-mono">
                        {d.isHub ? 'Hub' : 'Spoke'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subgraph Focus Badge */}
          {focusedDrug && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50/95 backdrop-blur-md border border-sky-200 text-sky-800 rounded-xl text-xs shadow-xs">
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              <span>
                Isolated: <strong>{focusedDrug.brandName}</strong> ({focusedDrug.degree || 0} connections)
              </span>
              <button
                onClick={resetFocusFilter}
                className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-sky-200 text-sky-700 rounded hover:bg-sky-100"
              >
                Reset
              </button>
            </div>
          )}

          {/* Cabinet Highlight Badge */}
          {isCabinetHighlightActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/90 backdrop-blur-md border border-amber-200 text-amber-800 rounded-xl text-xs shadow-xs">
              <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>
                Cabinet Active (<strong>{cabinetDrugIds.length}</strong> Prescriptions)
              </span>
              <button
                onClick={onClearCabinetHighlight}
                className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-amber-200 text-amber-700 rounded hover:bg-amber-100"
              >
                Exit View
              </button>
            </div>
          )}
        </div>

        {/* Right: Physics Panel Toggle & Canvas Zoom Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Interactive Physics Controls Toggle */}
          <button
            onClick={() => setPhysicsPanelOpen(!physicsPanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border shadow-xs transition-all ${
              physicsPanelOpen
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 hover:bg-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Physics Controls</span>
            {physicsPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* View Zoom Buttons */}
          <div className="flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFit}
              title="Fit to Screen"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={togglePhysics}
              title={physicsRunning ? 'Freeze Physics' : 'Thaw Physics'}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {physicsRunning ? <Pause className="w-4 h-4 text-sky-600" /> : <Play className="w-4 h-4 text-emerald-600" />}
            </button>
            <button
              onClick={resetFocusFilter}
              title="Reset View"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Physics Controls Panel */}
      {physicsPanelOpen && (
        <div className="absolute top-16 right-4 z-20 w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-4.5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Physics &amp; Stability Tuning
              </span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${physicsRunning ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {physicsRunning ? 'Active' : 'Stabilized'}
            </span>
          </div>

          {/* Solver selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 block">
              Layout Solver:
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => {
                  setSolverType('barnesHut');
                  applyPhysicsOptions(true);
                }}
                className={`py-1.5 px-2 rounded-lg transition-all ${
                  solverType === 'barnesHut' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Hub &amp; Spoke
              </button>
              <button
                onClick={() => {
                  setSolverType('forceAtlas2Based');
                  applyPhysicsOptions(true);
                }}
                className={`py-1.5 px-2 rounded-lg transition-all ${
                  solverType === 'forceAtlas2Based' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                ForceAtlas2
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3 text-xs">
            {/* Spring Length */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600">
                <span>Spoke Orbit Radius</span>
                <span className="font-mono text-slate-900">{springLength}px</span>
              </div>
              <input
                type="range"
                min="70"
                max="240"
                step="5"
                value={springLength}
                onChange={(e) => {
                  setSpringLength(Number(e.target.value));
                  applyPhysicsOptions(true);
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Repulsion */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600">
                <span>Node Repulsion</span>
                <span className="font-mono text-slate-900">{Math.abs(repulsionStrength)}</span>
              </div>
              <input
                type="range"
                min="800"
                max="3500"
                step="100"
                value={Math.abs(repulsionStrength)}
                onChange={(e) => {
                  setRepulsionStrength(-Number(e.target.value));
                  applyPhysicsOptions(true);
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Central Gravity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600">
                <span>Central Core Attraction</span>
                <span className="font-mono text-slate-900">{centralGravity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.45"
                step="0.02"
                value={centralGravity}
                onChange={(e) => {
                  setCentralGravity(Number(e.target.value));
                  applyPhysicsOptions(true);
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Damping */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600">
                <span>Movement Damping (Friction)</span>
                <span className="font-mono text-slate-900">{damping.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={damping}
                onChange={(e) => {
                  setDamping(Number(e.target.value));
                  applyPhysicsOptions(true);
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setSpringLength(120);
                setRepulsionStrength(-1800);
                setCentralGravity(0.18);
                setDamping(0.45);
                setSolverType('barnesHut');
                applyPhysicsOptions(true);
              }}
              className="flex-1 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset Physics
            </button>
            <button
              onClick={handleStabilize}
              className="flex-1 py-1.5 text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
            >
              Freeze / Settle
            </button>
          </div>
        </div>
      )}

      {/* Main Graph Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-md p-3.5 text-xs text-slate-600 max-w-sm">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-[11px] tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Hub-and-Spoke Logistics Hierarchy
            </span>
            <button
              onClick={() => setLegendOpen(!legendOpen)}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
            >
              {legendOpen ? 'Hide' : 'Expand'}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md border-2 border-sky-600 bg-white font-bold text-[8px] flex items-center justify-center text-sky-700">★</span>
                <span className="font-semibold text-slate-800">Primary Hubs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md border border-slate-400 bg-white" />
                <span className="text-slate-600">Orbital Spokes</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[10px] pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="font-semibold text-slate-700">Severe</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                <span className="font-semibold text-slate-700">Moderate</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="font-semibold text-slate-700">Minor</span>
              </div>
            </div>

            {legendOpen && (
              <div className="space-y-1 text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                <div>• Solid lines: Synergistic toxicity (bleeding, CNS)</div>
                <div>• Dashed lines: Metabolic CYP450 interference</div>
                <div>• Dotted lines: Renal clearance &amp; hemodynamics</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
