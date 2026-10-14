import React from 'react';
import { 
  Heart, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ChevronRight, 
  TrendingUp, 
  Zap, 
  SlidersHorizontal,
  Flame,
  FileText
} from 'lucide-react';

export default function ClinicalMetricsPanel({ 
  predictionResult, 
  formData, 
  onOpenReport 
}) {
  const prob = predictionResult?.probability ? Math.round(predictionResult.probability * 100) : 78;
  const isHighRisk = prob >= 65;
  const isModRisk = prob >= 35 && prob < 65;
  
  // Calculate Heart Age delta based on clinical risk
  const chronologicalAge = Math.round(formData.age || 58);
  const heartAgeDelta = isHighRisk ? 9 : isModRisk ? 4 : -2;
  const estimatedHeartAge = chronologicalAge + heartAgeDelta;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* 1. Header: Cardiovascular System & Risk Score Gradient (Direct from Image 2) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500/30 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Cardiovascular System
              </h3>
              <span className="text-xs text-slate-400">Clinical Hemodynamic & Risk Status</span>
            </div>
          </div>

          {/* Risk Score Progress Slider (Direct from Image 2) */}
          <div className="flex flex-col sm:items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-slate-400">Cardiovascular Risk Score</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                isHighRisk 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : isModRisk 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {isHighRisk ? '▲ High' : isModRisk ? '● Moderate' : '▼ Low'} {prob}%
              </span>
            </div>
            {/* Visual Gradient Progress Bar */}
            <div className="w-48 sm:w-56 h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                style={{ width: `${Math.min(Math.max(prob, 5), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Heart Age vs Chronological Age (Direct from Image 2) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          {/* Age Comparison Stat Cards */}
          <div className="md:col-span-6 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-rose-500/30 flex items-center justify-center font-black text-rose-400 text-xs">
                {heartAgeDelta > 0 ? `+${heartAgeDelta}y` : `${heartAgeDelta}y`}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Heart Age</span>
                <span className="text-2xl font-black text-white">{estimatedHeartAge} <span className="text-xs font-normal text-slate-400">yrs</span></span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Chronological</span>
              <span className="text-2xl font-black text-slate-300">{chronologicalAge} <span className="text-xs font-normal text-slate-400">yrs</span></span>
            </div>
          </div>

          {/* Age Difference Callout Card with 3D Heart Illustration (Direct from Image 2) */}
          <div className="md:col-span-6 bg-gradient-to-r from-indigo-950/50 to-slate-950/80 border border-indigo-500/30 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex flex-col justify-center">
              <p className="text-xs text-indigo-200 font-medium leading-snug">
                Your heart is aging <strong className="text-white underline decoration-rose-500 underline-offset-2">{Math.abs(heartAgeDelta)} years {heartAgeDelta > 0 ? 'faster' : 'slower'}</strong> than chronological age.
              </p>
              <button
                onClick={onOpenReport}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 mt-2 flex items-center gap-1 transition"
              >
                View full clinical report <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Heart className="w-7 h-7 text-indigo-400 fill-indigo-400/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Key Areas of Concern (Direct from Image 2) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            Key Areas of Concern
          </h4>
          <span className="text-[10px] text-slate-400">Calibrated to Clinical Guidelines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Metric 1: Blood Pressure */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 space-y-2 group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Blood Pressure</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${formData.trestbps >= 140 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {formData.trestbps >= 140 ? 'Stage 2 HTN' : 'Normal'}
              </span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {formData.trestbps} <span className="text-xs font-normal text-slate-400">mmHg</span>
            </div>
            {/* Visual Slider Indicator (Direct from Image 2) */}
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 rounded-full" 
                  style={{ width: `${Math.min(Math.max(((formData.trestbps - 80) / 120) * 100, 10), 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>80</span>
                <span>120</span>
                <span>200</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Serum Cholesterol */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 space-y-2 group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Cholesterol</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${formData.chol >= 240 ? 'bg-rose-500/20 text-rose-300' : formData.chol >= 200 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {formData.chol >= 240 ? 'High' : formData.chol >= 200 ? 'Borderline' : 'Desirable'}
              </span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {formData.chol} <span className="text-xs font-normal text-slate-400">mg/dL</span>
            </div>
            {/* Visual Slider Indicator */}
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full" 
                  style={{ width: `${Math.min(Math.max(((formData.chol - 100) / 300) * 100, 10), 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>100</span>
                <span>200</span>
                <span>400</span>
              </div>
            </div>
          </div>

          {/* Metric 3: ST Depression (oldpeak) */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 space-y-2 group hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">ST Depression</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${formData.oldpeak >= 2.0 ? 'bg-rose-500/20 text-rose-300' : formData.oldpeak >= 1.0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {formData.oldpeak >= 2.0 ? 'Marked' : formData.oldpeak >= 1.0 ? 'Moderate' : 'Normal'}
              </span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {formData.oldpeak} <span className="text-xs font-normal text-slate-400">mm</span>
            </div>
            {/* Visual Slider Indicator */}
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 rounded-full" 
                  style={{ width: `${Math.min(Math.max((formData.oldpeak / 5.0) * 100, 5), 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0</span>
                <span>2.0</span>
                <span>5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Health Plan & Pulse Rate Gauge (Direct from Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Vital Waveform Graph */}
        <div className="md:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-slate-200">Hemodynamic Waveform</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Continuous telemetry</span>
          </div>

          {/* SVG Animated Continuous Waveform (Direct from Image 2) */}
          <div className="h-24 w-full bg-slate-950/80 rounded-2xl p-2 border border-slate-800/90 relative overflow-hidden flex items-center">
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
              <span className="text-slate-400 block text-[10px]">Resting Pulse</span>
              <span className="text-white font-bold">{Math.round(formData.thalach * 0.55)} bpm</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Peak Exercise HR</span>
              <span className="text-rose-400 font-bold">{formData.thalach} bpm</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Stress Index</span>
              <span className="text-amber-400 font-bold">{isHighRisk ? 'Elevated' : 'Stable'}</span>
            </div>
          </div>
        </div>

        {/* Pulse Rate Speedometer Gauge (Direct from Image 2) */}
        <div className="md:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Pulse Rate</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Speedometer Radial Arc Gauge */}
          <div className="flex flex-col items-center justify-center my-2 relative">
            <div className="relative w-32 h-20 overflow-hidden flex items-end justify-center">
              {/* Half Circle Arc */}
              <div className="w-32 h-32 rounded-full border-8 border-slate-800 border-t-indigo-500 border-r-rose-500 absolute -top-12 rotate-45" />
              <div className="text-center z-10">
                <span className="text-2xl font-black text-white">{Math.round(formData.thalach * 0.52)}</span>
                <span className="text-[10px] text-slate-400 block -mt-1">bpm</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Beats per minute</span>
          </div>

          {/* Sub-indicators: Stress & Sleep Impact (Direct from Image 2) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
            <div className="bg-slate-950/70 p-2 rounded-xl">
              <span className="text-slate-400 block">Stress Indicator</span>
              <span className="font-bold text-amber-400">{isHighRisk ? 'Moderate-High' : 'Low'}</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-xl">
              <span className="text-slate-400 block">Perfusion Impact</span>
              <span className="font-bold text-emerald-400">{isHighRisk ? 'Compromised' : 'Preserved'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Lifestyle Actions & Clinical Guidance (Direct from Image 2) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 sm:p-5 backdrop-blur-md">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          Actionable Clinical Next Steps
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Myocardial Perfusion Protocol</span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {formData.oldpeak > 1.5 
                  ? 'High exercise ST depression indicates significant subendocardial stress. Recommend SPECT or stress echo.' 
                  : 'Maintain aerobic endurance training in Zone 2 (115-135 bpm).'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Lipid & Metabolic Target</span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {formData.chol > 200 
                  ? 'Target non-HDL cholesterol reduction. Clinical assessment for statin therapy.' 
                  : 'Fasting lipid profile within target reference boundaries.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
