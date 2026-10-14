import React, { useRef, useState } from 'react';
import HeartCanvas, { ANATOMICAL_PARTS } from './HeartCanvas';
import { 
  Heart, 
  Activity, 
  ShieldAlert, 
  ArrowUpRight, 
  ChevronRight, 
  TrendingUp, 
  Zap, 
  Calendar, 
  FileText, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Clock,
  User,
  PlusCircle,
  Eye
} from 'lucide-react';

export default function OverviewDashboard({ 
  formData, 
  predictionResult, 
  onNavigateToAssessment, 
  onNavigateToWorkspace, 
  onNavigateToReport,
  samplePatients,
  onSelectSample,
  currentPatientMeta
}) {
  const heartRef = useRef(null);
  const [selectedPartId, setSelectedPartId] = useState('lv');

  const prob = predictionResult?.probability ? Math.round(predictionResult.probability * 100) : 78;
  const isHighRisk = prob >= 65;
  const isModRisk = prob >= 35 && prob < 65;
  
  // Heart Age calculation
  const chronologicalAge = Math.round(formData.age || 58);
  const heartAgeDelta = isHighRisk ? 9 : isModRisk ? 4 : -2;
  const estimatedHeartAge = chronologicalAge + heartAgeDelta;

  return (
    <div className="space-y-6">
      {/* Top Banner: Patient Overview & Quick Case Switcher */}
      <div className="bg-white/80 border border-slate-200/90 rounded-3xl p-5 shadow-sm backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-sky-500/20">
            {currentPatientMeta?.name ? currentPatientMeta.name.charAt(0) : 'J'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {currentPatientMeta?.name || 'Jaxson Culhane'}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Record #{currentPatientMeta?.id?.toUpperCase() || 'CV-104'}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5">
              {currentPatientMeta?.gender || 'Male'} &bull; {currentPatientMeta?.age || 58} years &bull; Last Assessed: Today, 10:45 AM &bull; Protocol: Cleveland Clinical Baseline
            </p>
          </div>
        </div>

        {/* Quick Sample Patient Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
            Case Profiles:
          </span>
          {samplePatients.map((sp) => (
            <button
              key={sp.id}
              onClick={() => onSelectSample(sp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border shrink-0 ${
                currentPatientMeta?.id === sp.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {(sp.name || sp.label || sp.id).replace('Sample Patient: ', '')}
            </button>
          ))}
          <button
            onClick={onNavigateToAssessment}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Assessment
          </button>
        </div>
      </div>

      {/* Main Two-Column Viewport (Inspired directly by Reference Image 2 - MediFlex) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Prominent 3D Anatomical Visualizer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-5 shadow-sm backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            {/* Anatomy Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 uppercase tracking-wider">
                  Interactive Anatomy Layer
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
                  Cardiovascular Structure & Vessels
                </h3>
              </div>
              <button
                onClick={onNavigateToWorkspace}
                className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200"
              >
                <span>Full Workspace</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive 3D Canvas Box */}
            <div className="h-[430px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-950">
              <HeartCanvas
                ref={heartRef}
                predictionData={predictionResult}
                selectedPartId={selectedPartId}
                onSelectPart={(partId) => setSelectedPartId(partId)}
              />
            </div>

            {/* Structure Quick Selector Chips */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mr-1">
                Structures:
              </span>
              {Object.values(ANATOMICAL_PARTS).map((part) => (
                <button
                  key={part.id}
                  onClick={() => {
                    setSelectedPartId(part.id);
                    if (heartRef.current) heartRef.current.focusPart(part.id);
                  }}
                  className={`px-2 py-0.5 text-xs rounded-lg transition font-medium border ${
                    selectedPartId === part.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-semibold'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {part.name.split(' (')[0]}
                </button>
              ))}
            </div>

            {/* Structure Clinical Detail Callout */}
            {selectedPartId && ANATOMICAL_PARTS[selectedPartId] && (
              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block mb-0.5">
                  {ANATOMICAL_PARTS[selectedPartId].name}
                </span>
                <p className="text-slate-700 leading-snug">
                  {ANATOMICAL_PARTS[selectedPartId].clinicalSignificance}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Clinical Intelligence, Key Areas of Concern & Vitals (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Cardiovascular System Header Card with Risk Gradient (Direct from Image 2) */}
          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-5 shadow-sm backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                  <Heart className="w-5 h-5 fill-teal-600/30" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Cardiovascular Assessment
                  </h3>
                  <span className="text-xs text-slate-700">Calculated via UCI Cleveland Benchmark Classifier</span>
                </div>
              </div>

              {/* Risk Score Progress Slider (Direct from Image 2) */}
              <div className="flex flex-col sm:items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-700 font-medium">Risk Score</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                    isHighRisk 
                      ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                      : isModRisk 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {isHighRisk ? '▲ High' : isModRisk ? '● Moderate' : '▼ Low'} {prob}%
                  </span>
                </div>
                {/* Visual Progress Gradient Bar */}
                <div className="w-48 sm:w-56 h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${Math.min(Math.max(prob, 5), 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Heart Age vs Chronological Age (Direct from Image 2) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="md:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center font-black text-rose-800 text-xs">
                    {heartAgeDelta > 0 ? `+${heartAgeDelta}y` : `${heartAgeDelta}y`}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block uppercase tracking-wider font-semibold">Heart Age</span>
                    <span className="text-2xl font-black text-slate-900">{estimatedHeartAge} <span className="text-xs font-normal text-slate-600">yrs</span></span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-200" />

                <div className="text-right">
                  <span className="text-[10px] text-slate-600 block uppercase tracking-wider font-semibold">Chronological</span>
                  <span className="text-2xl font-black text-slate-800">{chronologicalAge} <span className="text-xs font-normal text-slate-600">yrs</span></span>
                </div>
              </div>

              {/* Age Callout with 3D Heart Illustration (Direct from Image 2) */}
              <div className="md:col-span-6 bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-slate-800 font-medium leading-snug">
                    Your heart is aging <strong className="text-slate-950 underline decoration-rose-500 underline-offset-2">{Math.abs(heartAgeDelta)} years {heartAgeDelta > 0 ? 'faster' : 'slower'}</strong> than chronological age.
                  </p>
                  <button
                    onClick={onNavigateToReport}
                    className="text-[11px] font-bold text-teal-800 hover:text-teal-900 mt-2 flex items-center gap-1 transition"
                  >
                    View full clinical report <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-sky-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Heart className="w-6 h-6 text-sky-600 fill-sky-600/30" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Key Areas of Concern with Slider Range Indicators (Direct from Image 2) */}
          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-5 shadow-sm backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-teal-700" />
                Key Areas of Concern
              </h4>
              <span className="text-[10px] text-slate-600 font-medium">Calibrated Reference Limits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Metric 1: Blood Pressure */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">Blood Pressure</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${formData.trestbps >= 140 ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                    {formData.trestbps >= 140 ? 'Stage 2 HTN' : 'Normal'}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  {formData.trestbps} <span className="text-xs font-normal text-slate-600">mmHg</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 rounded-full" 
                      style={{ width: `${Math.min(Math.max(((formData.trestbps - 80) / 120) * 100, 10), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                    <span>80</span>
                    <span>120</span>
                    <span>200</span>
                  </div>
                </div>
              </div>

              {/* Metric 2: Serum Cholesterol */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">Cholesterol</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${formData.chol >= 240 ? 'bg-rose-100 text-rose-800 border border-rose-200' : formData.chol >= 200 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                    {formData.chol >= 240 ? 'High' : formData.chol >= 200 ? 'Borderline' : 'Desirable'}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  {formData.chol} <span className="text-xs font-normal text-slate-600">mg/dL</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full" 
                      style={{ width: `${Math.min(Math.max(((formData.chol - 100) / 300) * 100, 10), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                    <span>100</span>
                    <span>200</span>
                    <span>400</span>
                  </div>
                </div>
              </div>

              {/* Metric 3: ST Depression (oldpeak) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">ST Depression</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${formData.oldpeak >= 2.0 ? 'bg-rose-100 text-rose-800 border border-rose-200' : formData.oldpeak >= 1.0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                    {formData.oldpeak >= 2.0 ? 'Marked' : formData.oldpeak >= 1.0 ? 'Moderate' : 'Normal'}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900">
                  {formData.oldpeak} <span className="text-xs font-normal text-slate-600">mm</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 rounded-full" 
                      style={{ width: `${Math.min(Math.max((formData.oldpeak / 5.0) * 100, 5), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                    <span>0.0</span>
                    <span>2.0</span>
                    <span>5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Hemodynamic Waveform & Pulse Rate Gauge (Direct from Image 2) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Waveform Box */}
            <div className="md:col-span-7 bg-white/90 border border-slate-200/90 rounded-3xl p-5 shadow-sm backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900">Hemodynamic Waveform</span>
                </div>
                <span className="text-[10px] font-mono text-slate-600">Telemetry 60-140 bpm</span>
              </div>

              {/* Animated ECG Waveform */}
              <div className="h-24 w-full bg-slate-950 rounded-2xl p-2 border border-slate-200 relative overflow-hidden flex items-center">
                <svg className="w-full h-full" viewBox="0 0 300 70" preserveAspectRatio="none">
                  <path
                    d="M 0 35 Q 25 35 30 30 T 45 40 T 60 15 T 70 60 T 80 35 L 120 35 Q 145 35 150 25 T 165 45 T 180 10 T 190 65 T 200 35 L 240 35 Q 265 35 270 28 T 285 42 T 295 18 T 300 35"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between pt-3 text-xs">
                <div>
                  <span className="text-slate-600 block text-[10px] font-medium">Resting HR</span>
                  <span className="text-slate-900 font-bold">{Math.round(formData.thalach * 0.55)} bpm</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] font-medium">Peak Exercise HR</span>
                  <span className="text-rose-600 font-bold">{formData.thalach} bpm</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] font-medium">Stress Indicator</span>
                  <span className="text-amber-600 font-bold">{isHighRisk ? 'Elevated' : 'Stable'}</span>
                </div>
              </div>
            </div>

            {/* Pulse Rate Speedometer Radial Arc Gauge */}
            <div className="md:col-span-5 bg-white/90 border border-slate-200/90 rounded-3xl p-5 shadow-sm backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Pulse Rate</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </div>

              <div className="flex flex-col items-center justify-center my-2 relative">
                <div className="relative w-32 h-20 overflow-hidden flex items-end justify-center">
                  <div className="w-32 h-32 rounded-full border-8 border-slate-100 border-t-teal-500 border-r-rose-500 absolute -top-12 rotate-45" />
                  <div className="text-center z-10">
                    <span className="text-2xl font-black text-slate-900">{Math.round(formData.thalach * 0.52)}</span>
                    <span className="text-[10px] text-slate-600 block -mt-1 font-semibold">bpm</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 mt-1">Beats per minute</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                <div className="bg-slate-50 p-2 rounded-xl text-center">
                  <span className="text-slate-600 block font-medium">Stress Impact</span>
                  <span className="font-bold text-amber-700">{isHighRisk ? 'Moderate-High' : 'Low'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl text-center">
                  <span className="text-slate-600 block font-medium">Perfusion</span>
                  <span className="font-bold text-teal-700">{isHighRisk ? 'Compromised' : 'Preserved'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Actionable Lifestyle & Clinical Next Steps */}
          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-5 shadow-sm backdrop-blur-md">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Physician Action Plan & Decision Support
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Myocardial Perfusion Protocol</span>
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                    {formData.oldpeak > 1.5 
                      ? 'Exercise ST depression > 1.5mm indicates subendocardial stress. Order myocardial perfusion scintigraphy (SPECT).' 
                      : 'Maintain cardiovascular conditioning in aerobic Zone 2 (115-135 bpm).'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Metabolic & Lipid Target</span>
                  <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                    {formData.chol > 200 
                      ? 'Target non-HDL cholesterol reduction. Recommend statin therapy evaluation and nutritional counseling.' 
                      : 'Lipid concentrations are within optimal clinical guideline thresholds.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
