import React, { useState } from 'react';
import {
  PRESET_DATASETS,
  PresetDataset,
  parseCustomJson,
  parseCustomCsv,
  exportDatasetAsJson,
  exportDatasetAsCsv,
  Drug,
  DrugInteraction,
} from '../data/drugData';
import {
  Database,
  Upload,
  Download,
  FileText,
  FileCode,
  Check,
  AlertCircle,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

interface DatasetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDatasetId: string;
  onSelectPreset: (preset: PresetDataset) => void;
  onLoadCustomData: (drugs: Drug[], interactions: DrugInteraction[], name: string) => void;
  currentDrugs: Drug[];
  currentInteractions: DrugInteraction[];
}

export const DatasetManagerModal: React.FC<DatasetManagerModalProps> = ({
  isOpen,
  onClose,
  activeDatasetId,
  onSelectPreset,
  onLoadCustomData,
  currentDrugs,
  currentInteractions,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'export'>('presets');
  const [rawText, setRawText] = useState<string>('');
  const [inputFormat, setInputFormat] = useState<'json' | 'csv'>('json');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith('.csv');
    const isJson = file.name.endsWith('.json');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      setInputFormat(isCsv ? 'csv' : 'json');
      setParseError(null);
      setParseSuccess(`Loaded file "${file.name}" (${(file.size / 1024).toFixed(1)} KB) into editor.`);
    };
    reader.readAsText(file);
  };

  const handleParseAndApply = () => {
    setParseError(null);
    setParseSuccess(null);

    if (!rawText.trim()) {
      setParseError('Please paste or upload JSON/CSV data first.');
      return;
    }

    try {
      if (inputFormat === 'json') {
        const result = parseCustomJson(rawText);
        onLoadCustomData(result.drugs, result.interactions, 'Custom JSON Dataset');
        setParseSuccess(`Successfully loaded ${result.drugs.length} drugs and ${result.interactions.length} interactions!`);
        setTimeout(() => onClose(), 1200);
      } else {
        const result = parseCustomCsv(rawText);
        onLoadCustomData(result.drugs, result.interactions, 'Custom CSV Dataset');
        setParseSuccess(`Successfully loaded ${result.drugs.length} drugs and ${result.interactions.length} interactions from CSV!`);
        setTimeout(() => onClose(), 1200);
      }
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse dataset.');
    }
  };

  const handleDownloadExport = (format: 'json' | 'csv') => {
    const content = format === 'json'
      ? exportDatasetAsJson(currentDrugs, currentInteractions)
      : exportDatasetAsCsv(currentDrugs, currentInteractions);

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RxWeb-Dataset.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sampleJsonTemplate = `{
  "drugs": [
    {
      "id": "warfarin",
      "brandName": "Warfarin",
      "genericName": "Warfarin Sodium",
      "category": "Anticoagulant",
      "classKey": "anticoagulant",
      "description": "Potent blood thinner.",
      "commonSideEffects": ["Bruising", "Bleeding"]
    },
    {
      "id": "aspirin",
      "brandName": "Aspirin",
      "genericName": "Acetylsalicylic acid",
      "category": "NSAID",
      "classKey": "nsaid",
      "description": "Antiplatelet analgesic.",
      "commonSideEffects": ["Heartburn", "Stomach irritation"]
    }
  ],
  "interactions": [
    {
      "id": "warfarin-aspirin",
      "drug1": "warfarin",
      "drug2": "aspirin",
      "severity": "severe",
      "mechanismType": "synergistic",
      "title": "Severe Hemorrhage Risk",
      "description": "Additive platelet and coagulation inhibition.",
      "clinicalRationale": "Simultaneous inhibition of thromboxane A2 and clotting factors.",
      "patientActionableAdvice": "Do not combine without explicit cardiologist guidance."
    }
  ]
}`;

  const sampleCsvTemplate = `drug1,drug2,severity,mechanismType,title,description
warfarin,aspirin,severe,synergistic,"Severe Hemorrhage Risk","Additive bleeding danger"
warfarin,diflucan,severe,metabolic,"CYP2C9 Inhibition","Fluconazole spikes warfarin plasma levels"
zoloft,tramadol,severe,synergistic,"Serotonin Syndrome","Dual serotonergic load raises seizure risk"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Scalable Dataset Pipeline
              </h3>
              <p className="text-xs text-slate-500">
                Switch presets or ingest large external JSON / CSV pharmacovigilance corpora.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50/40 text-xs font-semibold gap-4">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 pt-1 border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Clinical Presets ({PRESET_DATASETS.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 pt-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Load JSON / CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 pt-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Active Data</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Curated Pharmacology Hub-and-Spoke Networks
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_DATASETS.map((preset) => {
                  const isActive = activeDatasetId === preset.id;
                  const hubs = preset.drugs.filter((d) => d.isHub);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onSelectPreset(preset);
                        onClose();
                      }}
                      className={`p-4 text-left rounded-xl border transition-all flex items-start justify-between gap-4 group ${
                        isActive
                          ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-400/40 shadow-xs'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                            {preset.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                          {preset.description}
                        </p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 font-mono">
                          <span>{preset.drugs.length} Drugs</span>
                          <span>·</span>
                          <span className="text-sky-700 font-semibold">{hubs.length} Central Hubs</span>
                          <span>·</span>
                          <span>{preset.interactions.length} Interactions</span>
                        </div>
                      </div>
                      {isActive && (
                        <div className="p-1.5 bg-sky-600 text-white rounded-lg shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* File upload drag drop bar */}
              <div className="p-4 border-2 border-dashed border-slate-200 hover:border-sky-300 rounded-xl bg-slate-50/60 text-center transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-700">
                  Drop a JSON or CSV file here, or{' '}
                  <label className="text-sky-600 hover:text-sky-800 cursor-pointer underline">
                    browse files
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supports FDA FAERS reports, Kaggle 1000-drug pairs, or custom schemas.
                </div>
              </div>

              {/* Format toggle & Template Loaders */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Format:</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                    <button
                      onClick={() => setInputFormat('json')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        inputFormat === 'json' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                      }`}
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => setInputFormat('csv')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        inputFormat === 'csv' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                      }`}
                    >
                      CSV
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setRawText(inputFormat === 'json' ? sampleJsonTemplate : sampleCsvTemplate)}
                  className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                >
                  Load Sample {inputFormat.toUpperCase()} Template
                </button>
              </div>

              {/* Raw Text Input */}
              <div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Paste raw ${inputFormat.toUpperCase()} data here...`}
                  rows={8}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 selection:bg-sky-500/30"
                />
              </div>

              {/* Status alerts */}
              {parseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
              {parseSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{parseSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleParseAndApply}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
                >
                  Parse &amp; Render Network
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Export Current Network Snapshot
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download the current active dataset ({currentDrugs.length} drugs, {currentInteractions.length} interaction lines) for offline analysis, spreadsheet calculation, or distribution.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleDownloadExport('json')}
                  className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 bg-white transition-all text-left group"
                >
                  <FileCode className="w-5 h-5 text-sky-600 mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-bold text-slate-900">Export as JSON</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Structured nodes, side-effects, and clinical mechanism objects.
                  </div>
                </button>

                <button
                  onClick={() => handleDownloadExport('csv')}
                  className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 bg-white transition-all text-left group"
                >
                  <FileText className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-bold text-slate-900">Export as CSV</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tabular edge list compatible with Excel, pandas, or Gephi.
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Active Nodes: {currentDrugs.length} · Connections: {currentInteractions.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
