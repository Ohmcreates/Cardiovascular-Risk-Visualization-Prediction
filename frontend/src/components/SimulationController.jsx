import React, { useState } from 'react';
import { 
  Brain, 
  Scan, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  RotateCcw, 
  Sparkles, 
  Activity, 
  Heart, 
  FlaskConical, 
  Pill, 
  Dna, 
  Info,
  CheckCircle2
} from 'lucide-react';

export default function SimulationController({ 
  formData, 
  onChange, 
  onReset, 
  onRunSimulation, 
  isLoading 
}) {
  const [activeTab, setActiveTab] = useState('labs');
  const [searchQuery, setSearchQuery] = useState('');
  const [simulationMode, setSimulationMode] = useState('forecast');
  const [includeGenetics, setIncludeGenetics] = useState(true);
  
  // Accordion states
  const [expandedSections, setExpandedSections] = useState({
    cardiac: true,
    lipids: true,
    ecg: true,
    imaging: false
  });

  const toggleSection = (sec) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleInputChange = (field, val) => {
    onChange({ ...formData, [field]: parseFloat(val) });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-5 backdrop-blur-md overflow-hidden">
      {/* 1. AI Diagnostic Settings Header (Direct from Image 1) */}
      <div className="space-y-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            AI Diagnostic Settings
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Digital Twin v2.4
          </span>
        </div>

        {/* Mode Selector Cards (Forecast vs Current Analysis) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Forecast Mode Card */}
          <button
            onClick={() => setSimulationMode('forecast')}
            className={`p-2.5 rounded-2xl border text-left transition relative flex flex-col items-center justify-center gap-1.5 ${
              simulationMode === 'forecast'
                ? 'bg-gradient-to-b from-indigo-950/60 to-purple-950/60 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 text-slate-400'
            }`}
          >
            {simulationMode === 'forecast' && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-200 block">Forecast</span>
              <span className="text-[10px] text-slate-400">Cardiovascular Risk</span>
            </div>
          </button>

          {/* Current Analysis Card */}
          <button
            onClick={() => setSimulationMode('current')}
            className={`p-2.5 rounded-2xl border text-left transition relative flex flex-col items-center justify-center gap-1.5 ${
              simulationMode === 'current'
                ? 'bg-gradient-to-b from-indigo-950/60 to-purple-950/60 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 text-slate-400'
            }`}
          >
            {simulationMode === 'current' && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/30 to-indigo-500/30 border border-sky-400/30 flex items-center justify-center">
              <Scan className="w-5 h-5 text-sky-300" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-200 block">Current Scan</span>
              <span className="text-[10px] text-slate-400">Clinical Baseline</span>
            </div>
          </button>
        </div>

        {/* Include Genetic Factors Toggle */}
        <div className="flex items-center justify-between pt-1">
          <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
            <Dna className="w-3.5 h-3.5 text-purple-400" />
            Include genetic priors & age
          </label>
          <button
            onClick={() => setIncludeGenetics(!includeGenetics)}
            className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
              includeGenetics ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* 2. Add to Simulation Section (Direct from Image 1) */}
      <div className="flex-1 flex flex-col pt-3 min-h-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Add to Simulation
          </span>
          <span className="text-[10px] text-indigo-400 font-mono">14 Features Active</span>
        </div>

        {/* Category Tabs: Lab Tests, Medications, Vitals */}
        <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('labs')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'labs'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clinical Vitals
          </button>
          <button
            onClick={() => setActiveTab('ecg')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'ecg'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ECG & Stress
          </button>
          <button
            onClick={() => setActiveTab('imaging')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'imaging'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Imaging & Scint
          </button>
        </div>

        {/* Search Bar (Direct from Image 1) */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search biomarkers, vitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Expandable Clinical Parameter Cards with colored indicator dots */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {/* Group 1: Vitals & Blood Pressure */}
          <div className="bg-slate-950/50 border border-slate-800/70 rounded-2xl p-3 space-y-2.5">
            <div 
              onClick={() => toggleSection('cardiac')}
              className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-200"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>Hemodynamics & Vitals</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {expandedSections.cardiac ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>

            {expandedSections.cardiac && (
              <div className="space-y-3 pt-1 border-t border-slate-900">
                {/* Resting Blood Pressure */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Resting Blood Pressure (trestbps)</span>
                    <span className="font-mono font-bold text-slate-200">{formData.trestbps} mm Hg</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="200"
                    value={formData.trestbps}
                    onChange={(e) => handleInputChange('trestbps', e.target.value)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>90 (Optimal)</span>
                    <span>120 (Normal)</span>
                    <span className="text-rose-400">&gt;140 (Hypertensive)</span>
                  </div>
                </div>

                {/* Maximum Heart Rate */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Max Heart Rate (thalach)</span>
                    <span className="font-mono font-bold text-slate-200">{formData.thalach} bpm</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="210"
                    value={formData.thalach}
                    onChange={(e) => handleInputChange('thalach', e.target.value)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Chest Pain Type */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Chest Pain Presentation (cp)</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {formData.cp === 1 ? 'Typical Angina' : formData.cp === 2 ? 'Atypical Angina' : formData.cp === 3 ? 'Non-anginal' : 'Asymptomatic (Ischemic)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 1, label: 'Typical' },
                      { id: 2, label: 'Atypical' },
                      { id: 3, label: 'Non-anginal' },
                      { id: 4, label: 'Asymptomatic' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleInputChange('cp', t.id)}
                        className={`py-1 text-xs rounded-lg border transition ${
                          formData.cp === t.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group 2: Lipids & Metabolic Panel */}
          <div className="bg-slate-950/50 border border-slate-800/70 rounded-2xl p-3 space-y-2.5">
            <div 
              onClick={() => toggleSection('lipids')}
              className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-200"
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                <span>Lipids & Blood Chemistry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {expandedSections.lipids ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>

            {expandedSections.lipids && (
              <div className="space-y-3 pt-1 border-t border-slate-900">
                {/* Cholesterol */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Serum Cholesterol (chol)</span>
                    <span className="font-mono font-bold text-amber-300">{formData.chol} mg/dL</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="450"
                    value={formData.chol}
                    onChange={(e) => handleInputChange('chol', e.target.value)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>&lt;200 (Desirable)</span>
                    <span className="text-amber-400">200-239 (Borderline)</span>
                    <span className="text-rose-400">&ge;240 (High)</span>
                  </div>
                </div>

                {/* Fasting Blood Sugar */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Fasting Blood Sugar &gt; 120 mg/dl</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInputChange('fbs', 0)}
                      className={`px-2.5 py-1 text-xs rounded-lg border ${
                        formData.fbs === 0
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('fbs', 1)}
                      className={`px-2.5 py-1 text-xs rounded-lg border ${
                        formData.fbs === 1
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Yes (&gt;120)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group 3: Electrocardiogram & Stress Testing */}
          <div className="bg-slate-950/50 border border-slate-800/70 rounded-2xl p-3 space-y-2.5">
            <div 
              onClick={() => toggleSection('ecg')}
              className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-200"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-purple-400" />
                <span>Electrocardiography (ECG)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {expandedSections.ecg ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>

            {expandedSections.ecg && (
              <div className="space-y-3 pt-1 border-t border-slate-900">
                {/* ST Depression */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Exercise ST Depression (oldpeak)</span>
                    <span className="font-mono font-bold text-rose-400">{formData.oldpeak} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6.0"
                    step="0.1"
                    value={formData.oldpeak}
                    onChange={(e) => handleInputChange('oldpeak', e.target.value)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0.0 mm (Normal)</span>
                    <span className="text-rose-400">&gt;2.0 mm (Marked Ischemia)</span>
                  </div>
                </div>

                {/* Exercise Induced Angina */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Exercise Induced Angina (exang)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInputChange('exang', 0)}
                      className={`px-2.5 py-1 text-xs rounded-lg border ${
                        formData.exang === 0
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('exang', 1)}
                      className={`px-2.5 py-1 text-xs rounded-lg border ${
                        formData.exang === 1
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions: Reset Simulation & Run AI Assessment (Direct from Image 1) */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          
          <button
            type="button"
            onClick={onRunSimulation}
            disabled={isLoading}
            className="flex-1 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Running Simulation...
              </span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Run AI Simulation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
