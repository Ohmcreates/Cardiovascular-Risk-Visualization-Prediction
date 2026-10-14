import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, HelpCircle, Activity, TrendingUp } from 'lucide-react';

const PredictionResultCard = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-300 font-medium">Running inference through fitted pipeline...</p>
        <p className="text-xs text-slate-500 mt-1">Validating features against UCI Cleveland calibration</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[220px] text-center">
        <Activity className="w-10 h-10 text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-300">Awaiting Patient Profile Input</p>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Adjust clinical parameters or select a demo patient profile above to compute model predictions and risk factor attributions.
        </p>
      </div>
    );
  }

  const {
    predicted_class,
    prediction_label,
    probability,
    probability_percentage,
    risk_category,
    risk_color,
    confidence_margin,
    model_type
  } = result;

  const isPositive = predicted_class === 1;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl border flex items-center justify-center"
            style={{
              backgroundColor: `${risk_color}18`,
              borderColor: `${risk_color}40`,
              color: risk_color
            }}
          >
            {isPositive ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${risk_color}25`,
                  color: risk_color
                }}
              >
                {risk_category}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Model: {model_type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1 leading-snug">
              {prediction_label}
            </h3>
          </div>
        </div>

        {/* Big Probability Counter */}
        <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
          <div className="text-3xl font-extrabold tracking-tight" style={{ color: risk_color }}>
            {probability_percentage}%
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Predicted Probability
          </div>
        </div>
      </div>

      {/* Progress Probability Gauge Bar */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
          <span>0% (Absence)</span>
          <span className="font-mono text-slate-300">Threshold: 50.0%</span>
          <span>100% (Presence)</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(4, Math.min(100, probability_percentage))}%`,
              backgroundColor: risk_color
            }}
          />
          {/* 50% Threshold marker */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-500/60 z-10" />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
          <span>Confidence Margin from 0.5 Threshold:</span>
          <span className="font-mono font-bold text-slate-200">
            {(((confidence_margin ?? 0) * 100)).toFixed(1)}% Certainty
          </span>
        </div>
      </div>

      {/* Methodology Guardrails Disclaimer */}
      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-300">Methodological Scope:</strong> This prediction represents the statistical classification of angiographically confirmed heart disease presence ($\ge 50\%$ diameter stenosis) in the UCI Cleveland benchmark. It is not an automated 3D lesion detector and does not predict future acute coronary syndrome events.
      </div>
    </div>
  );
};

export default PredictionResultCard;
