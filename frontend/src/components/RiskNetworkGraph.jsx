import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Dna, 
  FlaskConical, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertCircle, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';

export default function RiskNetworkGraph({ predictionResult, formData, onSelectPart }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState('central');

  const probability = predictionResult?.probability ? Math.round(predictionResult.probability * 100) : 78;
  const isHighRisk = probability >= 65;
  const isModRisk = probability >= 35 && probability < 65;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.15, 1.4));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.15, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="relative w-full h-[520px] bg-slate-950/90 border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col justify-between p-6 select-none shadow-2xl backdrop-blur-md">
      {/* Background Cybernetic Grid & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950/80 to-slate-950 -z-10 pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none -z-10" 
        style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Floating Canvas Zoom Controls (Direct from Image 1) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center bg-slate-900/80 border border-slate-800/90 rounded-2xl p-1 gap-1 shadow-xl z-20">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono text-slate-400 px-1">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Reset Canvas View"
          className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Scaled Canvas Container */}
      <div 
        className="w-full h-full flex flex-col items-center justify-center relative transition-transform duration-300 origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* SVG Bezier Dynamic Connectors with Flow Arrows (Direct from Image 1) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            {/* Gradient definition for connectors */}
            <linearGradient id="flowGradientRed" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="flowGradientGreen" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="flowGradientYellow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
            </linearGradient>

            <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
            </marker>
            <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Curved Connector 1: Genetics (left) -> Central Node */}
          <path
            d="M 220 320 C 220 250, 360 260, 420 230"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-70 animate-pulse"
          />

          {/* Curved Connector 2: Cardiogram / Primary Driver (center bottom) -> Central Node */}
          <path
            d="M 500 320 C 500 270, 500 250, 500 230"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            markerEnd="url(#arrowRed)"
            className="opacity-90"
          />

          {/* Curved Connector 3: Blood Lipids (right bottom) -> Central Node */}
          <path
            d="M 780 320 C 780 250, 640 260, 580 230"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-70"
          />
        </svg>

        {/* TOP / CENTRAL CARD: Heart Attack / CAD Target (Direct from Image 1) */}
        <div className="relative z-10 -mt-10 mb-12">
          <div className="w-80 sm:w-96 bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl shadow-indigo-950/80 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-400 transition-all">
            {/* Watermark Heart Silhouette */}
            <div className="absolute right-2 -bottom-4 opacity-10 pointer-events-none">
              <Heart className="w-36 h-36 text-indigo-400 fill-indigo-400" />
            </div>

            {/* Header Tags */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Primary Target Outcome
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            </div>

            {/* Main Title & Factors */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Coronary Disease Risk
                </h3>
                <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  14 clinical factors synthesized
                </span>
              </div>

              {/* Glowing Probability Badge (Direct from Image 1) */}
              <div className={`px-3.5 py-1.5 rounded-2xl font-black text-lg flex items-center gap-1.5 shadow-lg ${
                isHighRisk 
                  ? 'bg-rose-500 text-white shadow-rose-500/40' 
                  : isModRisk 
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/40' 
                  : 'bg-emerald-500 text-white shadow-emerald-500/40'
              }`}>
                {probability}%
              </div>
            </div>

            {/* Sub-Metric Gauge Indicators (34% / 66% style from Image 1) */}
            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full border-2 border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-300">
                  {Math.round(probability * 0.45)}%
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="text-slate-400 block">Ischemia</span>
                  <span className="font-semibold text-slate-200">Reversible</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full border-2 border-rose-500/30 flex items-center justify-center font-bold text-xs text-rose-300">
                  {Math.round(probability * 0.75)}%
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="text-slate-400 block">Perfusion</span>
                  <span className="font-semibold text-slate-200">Stress Deficit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM NODES: Connected Drivers & Biomarkers (Direct from Image 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4 z-10">
          {/* Node 1: Genetics & Demographics (Low Risk Driver - Green) */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Low risk driver
              </span>
              <span className="text-[10px] font-mono text-slate-400">Priors</span>
            </div>
            
            <div className="my-1">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-emerald-400" />
                Genetics & Demographics
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Patient age {formData.age} yrs &bull; {formData.sex === 1 ? 'Male' : 'Female'} baseline profile
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Risk weight</span>
              <span className="font-mono font-bold text-emerald-400">+0.12 SHAP</span>
            </div>
          </div>

          {/* Node 2: Cardiogram / ST Depression (Primary Risk Driver - Red with animated ECG Waveform!) */}
          <div className="bg-slate-900/90 border border-rose-500/50 rounded-2xl p-4 shadow-xl shadow-rose-950/40 backdrop-blur-md flex flex-col justify-between hover:border-rose-400 transition-all relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Primary risk driver
              </span>
              <span className="text-[10px] font-mono text-rose-400 animate-pulse">Critical</span>
            </div>

            <div className="my-1">
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                Cardiogram & ST Waveform
              </h4>
              <span className="text-[11px] text-slate-400 block">
                {formData.oldpeak}mm depression &bull; {formData.exang === 1 ? 'Angina provoked' : 'No exercise angina'}
              </span>
            </div>

            {/* Live Animated Mini ECG Waveform (Direct from Image 1!) */}
            <div className="h-10 w-full my-1.5 bg-slate-950/60 rounded-xl px-2 py-1 flex items-center border border-slate-800 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                <path
                  d="M 0 20 L 30 20 L 40 10 L 50 35 L 60 5 L 70 20 L 100 20 L 110 15 L 120 20 L 140 20 L 150 5 L 160 35 L 170 20 L 200 20"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              </svg>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Impact rank</span>
              <span className="font-mono font-bold text-rose-400">#1 Factor (+0.48)</span>
            </div>
          </div>

          {/* Node 3: Blood Lipids & Cholesterol (Medium Risk Driver - Yellow) */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Medium risk driver
              </span>
              <span className="text-[10px] font-mono text-slate-400">Lipid Panel</span>
            </div>

            <div className="my-1">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                Blood Lipids & Cholesterol
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Total Serum: {formData.chol} mg/dL &bull; Fasting Blood Sugar: {formData.fbs === 1 ? '>120' : 'Normal'}
              </p>
            </div>

            {/* Scatter Dot Cluster Graphic (Direct from Image 1) */}
            <div className="h-6 w-full flex items-center gap-1.5 px-1 py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 opacity-80" />
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm" />
              <span className="w-2 h-2 rounded-full bg-purple-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>

            <div className="mt-1 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Risk weight</span>
              <span className="font-mono font-bold text-amber-400">+0.28 SHAP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
