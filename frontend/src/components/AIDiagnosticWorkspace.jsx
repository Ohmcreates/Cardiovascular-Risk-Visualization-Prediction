import React, { useRef, useState } from 'react';
import SimulationController from './SimulationController';
import RiskNetworkGraph from './RiskNetworkGraph';
import ForecastTimeline from './ForecastTimeline';
import HeartCanvas, { ANATOMICAL_PARTS } from './HeartCanvas';
import RiskFactorsBreakdown from './RiskFactorsBreakdown';
import { 
  GitFork, 
  Heart, 
  Activity, 
  Layers, 
  Sparkles, 
  Sliders, 
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

export default function AIDiagnosticWorkspace({ 
  formData, 
  onChangeFormData, 
  onResetFormData, 
  onRunSimulation, 
  predictionResult, 
  isLoading,
  onOpenEvaluation
}) {
  const heartRef = useRef(null);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [centerMode, setCenterMode] = useState('graph'); // 'graph' vs '3d'

  return (
    <div className="space-y-5">
      {/* Workspace Top Toolbar: View Toggles & Model Status */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 px-5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCenterMode('graph')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                centerMode === 'graph'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              AI Neural Risk Graph
            </button>
            <button
              onClick={() => setCenterMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                centerMode === '3d'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              3D Anatomical Twin
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Model: <strong className="text-slate-200 font-mono">UCI Cleveland Regularized Ensemble</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEvaluation}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            Model Metrics & Evaluation
          </button>
        </div>
      </div>

      {/* Main Workspace Grid (Inspired directly by Reference Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: AI Diagnostic Settings & Simulation Sliders (4 cols) */}
        <div className="lg:col-span-4 h-full">
          <SimulationController
            formData={formData}
            onChange={onChangeFormData}
            onReset={onResetFormData}
            onRunSimulation={onRunSimulation}
            isLoading={isLoading}
          />
        </div>

        {/* Center & Right Column: Interactive Canvas & Explanatory Nodes (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Canvas: Neural Risk Graph OR 3D Heart */}
          {centerMode === 'graph' ? (
            <RiskNetworkGraph
              predictionResult={predictionResult}
              formData={formData}
              onSelectPart={(partId) => setSelectedPartId(partId)}
            />
          ) : (
            <div className="space-y-3">
              <div className="h-[520px] w-full bg-slate-950/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative">
                <HeartCanvas
                  ref={heartRef}
                  predictionData={predictionResult}
                  selectedPartId={selectedPartId}
                  onSelectPart={(partId) => setSelectedPartId(partId)}
                />
              </div>

              {/* Anatomical Structure Selector */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Anatomy:
                </span>
                {Object.values(ANATOMICAL_PARTS).map((part) => (
                  <button
                    key={part.id}
                    onClick={() => {
                      setSelectedPartId(part.id);
                      if (heartRef.current) heartRef.current.focusPart(part.id);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg transition font-medium border ${
                      selectedPartId === part.id
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {part.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Temporal Forecast Range Timeline (Direct from Image 1) */}
          <ForecastTimeline />

          {/* Feature Attributions & SHAP Drivers Panel */}
          {predictionResult && (
            <RiskFactorsBreakdown result={predictionResult} />
          )}
        </div>
      </div>
    </div>
  );
}
