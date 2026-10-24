import React, { useState, useRef } from 'react';
import {
  DRUGS,
  INTERACTIONS,
  PRESET_DATASETS,
  PresetDataset,
  findInteractionsInCabinet,
  Drug,
  DrugInteraction,
} from './data/drugData';
import { NetworkGraph, NetworkGraphHandle } from './components/NetworkGraph';
import { DrugInfoSidebar } from './components/DrugInfoSidebar';
import { InteractionChecker } from './components/InteractionChecker';
import { PrescriptionCabinet } from './components/PrescriptionCabinet';
import { DatasetManagerModal } from './components/DatasetManagerModal';
import { SingleHtmlExportModal } from './components/SingleHtmlExportModal';
import {
  ShieldAlert,
  Search,
  Database,
  FileCode,
  HeartPulse,
  Info,
  CheckCircle2,
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';

export default function App() {
  const graphRef = useRef<NetworkGraphHandle>(null);

  // Active Dataset state
  const [activeDatasetId, setActiveDatasetId] = useState<string>('default-all');
  const [currentDrugs, setCurrentDrugs] = useState<Drug[]>(DRUGS);
  const [currentInteractions, setCurrentInteractions] = useState<DrugInteraction[]>(INTERACTIONS);

  // Selected entities for sidebar
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [selectedInteraction, setSelectedInteraction] = useState<DrugInteraction | null>(null);

  // Patient Cabinet state
  const [cabinetDrugIds, setCabinetDrugIds] = useState<string[]>(['warfarin', 'aspirin', 'lipitor']);
  const [isCabinetHighlightActive, setIsCabinetHighlightActive] = useState<boolean>(false);

  // Modals state
  const [isCheckerOpen, setIsCheckerOpen] = useState<boolean>(false);
  const [isCabinetOpen, setIsCabinetOpen] = useState<boolean>(false);
  const [isDatasetManagerOpen, setIsDatasetManagerOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Calculate Hubs vs Spokes
  const hubDrugs = currentDrugs.filter((d) => d.isHub);
  const spokeDrugs = currentDrugs.filter((d) => !d.isHub);

  // Compute cabinet conflicts in real-time
  const cabinetEvaluation = findInteractionsInCabinet(cabinetDrugIds, currentDrugs, currentInteractions);
  const hasCabinetConflicts = cabinetEvaluation.conflicts.length > 0;

  // Handlers
  const handleSelectDrug = (drug: Drug | null) => {
    setSelectedDrug(drug);
    if (drug) {
      setSelectedInteraction(null);
    }
  };

  const handleSelectInteraction = (interaction: DrugInteraction | null) => {
    setSelectedInteraction(interaction);
    if (interaction) {
      setSelectedDrug(null);
    }
  };

  const handleToggleCabinet = (drugId: string) => {
    setCabinetDrugIds((prev) =>
      prev.includes(drugId) ? prev.filter((id) => id !== drugId) : [...prev, drugId]
    );
  };

  const handleAddCabinetDrug = (drugId: string) => {
    if (!cabinetDrugIds.includes(drugId)) {
      setCabinetDrugIds((prev) => [...prev, drugId]);
    }
  };

  const handleRemoveCabinetDrug = (drugId: string) => {
    setCabinetDrugIds((prev) => prev.filter((id) => id !== drugId));
  };

  const handleClearCabinet = () => {
    setCabinetDrugIds([]);
    setIsCabinetHighlightActive(false);
  };

  const handleLoadPreset = (presetIds: string[]) => {
    setCabinetDrugIds(presetIds);
  };

  const handleHighlightCabinet = () => {
    setIsCabinetHighlightActive(true);
    setSelectedDrug(null);
    setSelectedInteraction(null);
  };

  const handleClearCabinetHighlight = () => {
    setIsCabinetHighlightActive(false);
    if (graphRef.current) {
      graphRef.current.resetView();
    }
  };

  const handleFocusInteractionOnGraph = (drugAId: string, drugBId: string) => {
    setIsCabinetHighlightActive(false);
    if (graphRef.current) {
      graphRef.current.focusInteraction(drugAId, drugBId);
    }
  };

  // Dataset switching handlers
  const handleSelectPreset = (preset: PresetDataset) => {
    setActiveDatasetId(preset.id);
    setCurrentDrugs(preset.drugs);
    setCurrentInteractions(preset.interactions);
    setSelectedDrug(null);
    setSelectedInteraction(null);
    setIsCabinetHighlightActive(false);
    if (graphRef.current) {
      graphRef.current.resetView();
    }
  };

  const handleLoadCustomData = (drugs: Drug[], interactions: DrugInteraction[], _name: string) => {
    setActiveDatasetId('custom-upload');
    setCurrentDrugs(drugs);
    setCurrentInteractions(interactions);
    setSelectedDrug(null);
    setSelectedInteraction(null);
    setIsCabinetHighlightActive(false);
    if (graphRef.current) {
      graphRef.current.resetView();
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden select-none">
      {/* 
        Top Bar Contract:
        [Brand title, one line] — [4–5 nav links, 1–2 word labels, single-line] — [1 primary action]
      */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 shrink-0 z-30">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            Rx
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            RxWeb
          </span>
        </div>

        {/* Zone 2: 4-5 nav links, single-line */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => {
              if (graphRef.current) graphRef.current.resetView();
              setIsCabinetHighlightActive(false);
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Word Web
          </button>
          <button
            onClick={() => setIsCheckerOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Pair Checker</span>
          </button>
          <button
            onClick={() => setIsCabinetOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <HeartPulse className="w-3.5 h-3.5 text-slate-400" />
            <span>Cabinet Scanner</span>
          </button>
          <button
            onClick={() => setIsDatasetManagerOpen(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Dataset Pipeline</span>
          </button>
          <button
            onClick={() => setIsExportOpen(true)}
            className="hover:text-sky-700 text-sky-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCabinetOpen(true)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 whitespace-nowrap shrink-0 ${
              hasCabinetConflicts
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {hasCabinetConflicts ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-200 animate-pulse" />
            ) : (
              <HeartPulse className="w-3.5 h-3.5 text-sky-300" />
            )}
            <span>My Prescriptions ({cabinetDrugIds.length})</span>
            {hasCabinetConflicts && (
              <span className="w-2 h-2 rounded-full bg-rose-300" />
            )}
          </button>
        </div>
      </header>

      {/* Sub-header Context / Metadata Strip (Zero-Pill Discipline & Flourish Topology Stats) */}
      <div className="h-9 bg-slate-50 border-b border-slate-200/80 px-6 flex items-center justify-between text-xs text-slate-500 overflow-x-auto whitespace-nowrap shrink-0">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
          <span className="font-bold text-sky-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500" />
            Flourish Hub-and-Spoke Engine
          </span>
          <span aria-hidden="true">·</span>
          <span><strong>{hubDrugs.length}</strong> Central Hubs</span>
          <span aria-hidden="true">·</span>
          <span><strong>{spokeDrugs.length}</strong> Orbital Spokes</span>
          <span aria-hidden="true">·</span>
          <span><strong>{currentInteractions.length}</strong> Interaction Vectors</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {hasCabinetConflicts ? (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              {cabinetEvaluation.conflicts.length} Cabinet Conflict{cabinetEvaluation.conflicts.length > 1 ? 's' : ''} Flagged
            </span>
          ) : (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Cabinet Safe (0 Known Clashes)
            </span>
          )}
          <span aria-hidden="true" className="text-slate-300">|</span>
          <button
            onClick={() => setIsDatasetManagerOpen(true)}
            className="text-slate-500 hover:text-sky-700 font-mono flex items-center gap-1 hover:underline"
          >
            <span>Active: {activeDatasetId}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Workspace: Vis Network + Dynamic Inspector Sidebar */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left/Center: VisNetwork Graph Viewport */}
        <section aria-label="Interactive Word Web" className="flex-1 h-full relative">
          <NetworkGraph
            ref={graphRef}
            drugs={currentDrugs}
            interactions={currentInteractions}
            onSelectDrug={handleSelectDrug}
            onSelectInteraction={handleSelectInteraction}
            selectedDrugId={selectedDrug?.id || null}
            cabinetDrugIds={cabinetDrugIds}
            isCabinetHighlightActive={isCabinetHighlightActive}
            onClearCabinetHighlight={handleClearCabinetHighlight}
          />
        </section>

        {/* Right: Dynamic Inspector Sidebar */}
        <DrugInfoSidebar
          drugs={currentDrugs}
          interactions={currentInteractions}
          selectedDrug={selectedDrug}
          selectedInteraction={selectedInteraction}
          onClose={() => {
            setSelectedDrug(null);
            setSelectedInteraction(null);
            if (graphRef.current) graphRef.current.resetView();
          }}
          onSelectDrug={(d) => {
            setSelectedDrug(d);
            setSelectedInteraction(null);
            if (graphRef.current) graphRef.current.focusDrug(d.id);
          }}
          onSelectInteraction={(i) => {
            setSelectedInteraction(i);
            setSelectedDrug(null);
            if (graphRef.current) graphRef.current.focusInteraction(i.drug1, i.drug2);
          }}
          isInCabinet={(id) => cabinetDrugIds.includes(id)}
          onToggleCabinet={handleToggleCabinet}
        />
      </main>

      {/* Modals */}
      <InteractionChecker
        drugs={currentDrugs}
        interactions={currentInteractions}
        isOpen={isCheckerOpen}
        onClose={() => setIsCheckerOpen(false)}
        onFocusInteractionOnGraph={handleFocusInteractionOnGraph}
      />

      <PrescriptionCabinet
        drugs={currentDrugs}
        interactions={currentInteractions}
        isOpen={isCabinetOpen}
        onClose={() => setIsCabinetOpen(false)}
        cabinetDrugIds={cabinetDrugIds}
        onAddDrug={handleAddCabinetDrug}
        onRemoveDrug={handleRemoveCabinetDrug}
        onClearCabinet={handleClearCabinet}
        onLoadPreset={handleLoadPreset}
        onHighlightInGraph={handleHighlightCabinet}
        onFocusInteraction={(a, b) => {
          handleFocusInteractionOnGraph(a, b);
          const match = currentInteractions.find(
            (i) => (i.drug1 === a && i.drug2 === b) || (i.drug1 === b && i.drug2 === a)
          );
          if (match) setSelectedInteraction(match);
        }}
        onSelectDrug={(d) => {
          setSelectedDrug(d);
          if (graphRef.current) graphRef.current.focusDrug(d.id);
        }}
      />

      <DatasetManagerModal
        isOpen={isDatasetManagerOpen}
        onClose={() => setIsDatasetManagerOpen(false)}
        activeDatasetId={activeDatasetId}
        onSelectPreset={handleSelectPreset}
        onLoadCustomData={handleLoadCustomData}
        currentDrugs={currentDrugs}
        currentInteractions={currentInteractions}
      />

      <SingleHtmlExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currentDrugs={currentDrugs}
        currentInteractions={currentInteractions}
      />

      {/* Clinical Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-base font-bold text-slate-900">
                Flourish Hub-and-Spoke Logistics Engine
              </h3>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-900 text-sm">Logistics Topology</h4>
                <p>
                  High-connectivity medications (such as broad-spectrum anticoagulants like Warfarin, common NSAIDs like Aspirin, and heavy CYP450 metabolizers like Lipitor and Zoloft) serve as <strong>Central Hubs</strong>. They are assigned higher mass in the physics engine to anchor cluster orbits. Interacting drugs float as <strong>Satellite Spokes</strong> around their primary hubs.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-slate-900 text-sm">Real-Time Physics Tuning</h4>
                <p>
                  Open the <strong>Physics Controls</strong> panel to fine-tune the gravitational constant, spoke orbital spring lengths, and damping friction in real time.
                </p>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsGuideOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
