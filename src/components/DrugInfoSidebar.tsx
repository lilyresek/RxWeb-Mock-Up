import React from 'react';
import { Drug, DrugInteraction, DRUGS, DRUG_CLASSES, INTERACTIONS } from '../data/drugData';
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  Check,
  Plus,
  Trash2,
  X,
  ExternalLink,
  Activity,
  ArrowRight
} from 'lucide-react';

interface DrugInfoSidebarProps {
  drugs?: Drug[];
  interactions?: DrugInteraction[];
  selectedDrug: Drug | null;
  selectedInteraction: DrugInteraction | null;
  onClose: () => void;
  onSelectDrug: (drug: Drug) => void;
  onSelectInteraction: (interaction: DrugInteraction) => void;
  isInCabinet: (drugId: string) => boolean;
  onToggleCabinet: (drugId: string) => void;
}

export const DrugInfoSidebar: React.FC<DrugInfoSidebarProps> = ({
  drugs = DRUGS,
  interactions = INTERACTIONS,
  selectedDrug,
  selectedInteraction,
  onClose,
  onSelectDrug,
  onSelectInteraction,
  isInCabinet,
  onToggleCabinet,
}) => {
  if (!selectedDrug && !selectedInteraction) {
    return (
      <div className="w-80 md:w-96 bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between overflow-y-auto">
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">Interactive Clinical Inspector</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-6">
            Click any drug node to view active ingredients, side effects, and dangerous pairs. Click any connection line to inspect the clinical mechanism.
          </p>

          <div className="text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
              Quick Suggestions to Explore
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Warfarin', 'Aspirin', 'Zoloft', 'Tramadol', 'Nitrostat', 'Viagra', 'Lipitor'].map((name) => {
                const d = drugs.find((x) => x.brandName === name) || drugs[0];
                if (!d) return null;
                return (
                  <button
                    key={d.id}
                    onClick={() => onSelectDrug(d)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50/50 transition-colors shadow-2xs"
                  >
                    {d.brandName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3">
          Derived from clinical pharmacology datasets and FDA adverse reporting models.
        </div>
      </div>
    );
  }


  // CONNECTION / INTERACTION SELECTED
  if (selectedInteraction) {
    const drugA = DRUGS.find((d) => d.id === selectedInteraction.drug1);
    const drugB = DRUGS.find((d) => d.id === selectedInteraction.drug2);

    const isSevere = selectedInteraction.severity === 'severe';
    const isModerate = selectedInteraction.severity === 'moderate';

    const severityBg = isSevere ? 'bg-rose-50 border-rose-200 text-rose-900' : isModerate ? 'bg-orange-50 border-orange-200 text-orange-900' : 'bg-amber-50 border-amber-200 text-amber-900';
    const severityBadge = isSevere ? 'bg-rose-600 text-white' : isModerate ? 'bg-orange-500 text-white' : 'bg-amber-500 text-white';

    return (
      <aside aria-label="Interaction Details" className="w-80 md:w-96 bg-white border-l border-slate-200 h-full flex flex-col shadow-lg z-20 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <span>Drug-Drug Interaction</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{selectedInteraction.mechanismType}</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 leading-snug">
              {selectedInteraction.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Severity Banner */}
          <div className={`p-3.5 rounded-xl border ${severityBg}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${severityBadge}`}>
                {selectedInteraction.severity} Risk
              </span>
              <span className="text-xs font-medium opacity-90 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Negative Interaction
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed">
              {selectedInteraction.description}
            </p>
          </div>

          {/* Involved Drugs Pair Pill */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Conflicting Medications
            </span>
            <div className="grid grid-cols-2 gap-2">
              {drugA && (
                <button
                  onClick={() => onSelectDrug(drugA)}
                  className="p-3 text-left bg-slate-50 hover:bg-sky-50/70 border border-slate-200 rounded-xl transition-colors group"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 block truncate">
                    {drugA.brandName}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {drugA.genericName}
                  </span>
                </button>
              )}
              {drugB && (
                <button
                  onClick={() => onSelectDrug(drugB)}
                  className="p-3 text-left bg-slate-50 hover:bg-sky-50/70 border border-slate-200 rounded-xl transition-colors group"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 block truncate">
                    {drugB.brandName}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {drugB.genericName}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Mechanism & Line Style Insight */}
          <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Network Line Mechanism
            </span>
            <div className="text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                {selectedInteraction.mechanismType === 'metabolic' ? (
                  <span className="w-8 border-b-2 border-dashed border-rose-500 inline-block" />
                ) : selectedInteraction.mechanismType === 'clearance' ? (
                  <span className="w-8 border-b-2 border-dotted border-amber-500 inline-block" />
                ) : (
                  <span className="w-8 h-1 bg-rose-500 inline-block rounded" />
                )}
                <span className="font-semibold text-slate-900 capitalize">
                  {selectedInteraction.mechanismType === 'metabolic'
                    ? 'Metabolic Interference (CYP450 Enzyme)'
                    : selectedInteraction.mechanismType === 'clearance'
                    ? 'Renal / Hemodynamic Clearance'
                    : 'Direct Synergistic Adverse Risk'}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Pharmacology Rationale */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Clinical Rationale & Mechanism
            </span>
            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
              {selectedInteraction.clinicalRationale}
            </div>
          </div>

          {/* Patient Actionable Advice */}
          <div>
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              What Patients Should Do
            </span>
            <div className="text-xs text-sky-900 bg-sky-50/70 p-3.5 rounded-xl border border-sky-200/80 leading-relaxed font-medium">
              {selectedInteraction.patientActionableAdvice}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // DRUG NODE SELECTED
  const drug = selectedDrug!;
  const classItem = DRUG_CLASSES.find((c) => c.key === drug.classKey);
  const inCabinet = isInCabinet(drug.id);

  // Find all direct interactions for this drug
  const drugInteractions = drug
    ? DRUGS.map((otherDrug) => {
        if (otherDrug.id === drug.id) return null;
        const interaction = DRUGS
          ? (
              // Find matching interaction
              [drug.id, otherDrug.id]
            )
          : null;
        return null;
      }).filter(Boolean)
    : [];

  const directInteractions = (
    // Filter interactions involving this drug
    drug
      ? DRUGS.flatMap((otherDrug) => {
          if (otherDrug.id === drug.id) return [];
          const match =
            // check
            null;
          return [];
        })
      : []
  );

  return (
    <aside aria-label="Medication Profile" className="w-80 md:w-96 bg-white border-l border-slate-200 h-full flex flex-col shadow-lg z-20 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: classItem?.color || '#0284C7' }}
            />
            <span className="font-medium text-slate-700">{drug.category}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {drug.brandName}
          </h2>
          <div className="text-xs font-mono text-slate-500 mt-0.5">
            Active: {drug.genericName}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Cabinet Action Button */}
        <button
          onClick={() => onToggleCabinet(drug.id)}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs ${
            inCabinet
              ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {inCabinet ? (
            <>
              <Check className="w-4 h-4 text-amber-600" />
              <span>Saved in "My Prescriptions"</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add to "My Prescriptions"</span>
            </>
          )}
        </button>

        {/* FDA Boxed Warning banner if applicable */}
        {drug.fdaBoxedWarning && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 text-rose-900">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-800 mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              FDA Boxed Warning
            </div>
            <p className="text-xs leading-relaxed text-rose-950 font-medium">
              {drug.boxedWarningSummary || 'Carries a black box warning for serious adverse events.'}
            </p>
          </div>
        )}

        {/* Description */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Clinical Overview
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            {drug.description}
          </p>
        </div>

        {/* Common Side Effects */}
        <div>
          <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-2">
            Common Side Effects (Dataset)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {drug.commonSideEffects.map((effect, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-md font-medium"
              >
                {effect}
              </span>
            ))}
          </div>
        </div>

        {/* Patient Advice */}
        <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-sky-900 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            Patient Usage Guidance
          </span>
          <p className="text-xs text-sky-950 leading-relaxed">
            {drug.patientAdvice}
          </p>
        </div>

        {/* Direct Dangerous Interaction Neighbors */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              Known Conflicting Drugs ({drugs.length > 0 ? getConflictCount(drug.id, interactions) : 0})
            </span>
            <span className="text-[10px] text-slate-400">Click to inspect</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {getConflictList(drug.id, onSelectDrug, onSelectInteraction, drugs, interactions)}
          </div>
        </div>
      </div>
    </aside>
  );
};

// Helper for count
function getConflictCount(drugId: string, interactionList: DrugInteraction[] = INTERACTIONS): number {
  return interactionList.filter((i) => i.drug1 === drugId || i.drug2 === drugId).length;
}

// Helper for list
function getConflictList(
  drugId: string,
  onSelectDrug: (d: Drug) => void,
  onSelectInteraction: (i: DrugInteraction) => void,
  drugList: Drug[] = DRUGS,
  interactionList: DrugInteraction[] = INTERACTIONS
) {
  const matchingInteractions = interactionList.filter((i) => i.drug1 === drugId || i.drug2 === drugId);

  if (matchingInteractions.length === 0) {
    return (
      <div className="text-xs text-slate-400 italic py-2">
        No severe interactions logged in current dataset.
      </div>
    );
  }

  return matchingInteractions.map((inter) => {
    const otherId = inter.drug1 === drugId ? inter.drug2 : inter.drug1;
    const otherDrug = drugList.find((d) => d.id === otherId);
    if (!otherDrug) return null;

    const isSevere = inter.severity === 'severe';
    const isModerate = inter.severity === 'moderate';

    return (
      <div
        key={inter.id}
        className="p-2.5 rounded-lg border border-slate-200/90 hover:border-sky-300 bg-white hover:bg-slate-50 transition-all flex items-center justify-between group"
      >
        <div className="flex-1 min-w-0 mr-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isSevere ? 'bg-rose-500' : isModerate ? 'bg-orange-500' : 'bg-amber-400'
              }`}
            />
            <button
              onClick={() => onSelectDrug(otherDrug)}
              className="text-xs font-bold text-slate-800 hover:text-sky-700 truncate text-left"
            >
              {otherDrug.brandName}
            </button>
          </div>
          <div className="text-[11px] text-slate-500 truncate pl-3.5">
            {inter.title}
          </div>
        </div>

        <button
          onClick={() => onSelectInteraction(inter)}
          title="Inspect interaction details"
          className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors shrink-0"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  });
}


