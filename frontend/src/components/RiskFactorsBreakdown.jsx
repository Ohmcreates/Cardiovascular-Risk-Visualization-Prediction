import React from 'react';
import { AlertCircle, CheckCircle, Info, TrendingUp, TrendingDown, Minus, Stethoscope, Sliders } from 'lucide-react';

const RiskFactorsBreakdown = ({ result }) => {
  if (!result) return null;

  const { feature_attributions = [], clinical_observations = [] } = result;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Evidence-Based Clinical Flags */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-emerald-400" />
          Clinical Measurement Summary
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Measured biomarkers compared against standard cardiology clinical threshold guidelines.
        </p>

        <div className="space-y-2.5 flex-1 overflow-y-auto">
          {clinical_observations.map((item, idx) => {
            const isWarning = item.level === 'warning';
            const isCaution = item.level === 'caution';
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isWarning
                    ? 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                    : isCaution
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">{item.factor}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{item.status}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold px-2 py-1 rounded bg-slate-900/80 border border-slate-700/50">
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Model Feature Attributions (Log-Odds Impact) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Model Feature Attribution (Log-Odds)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Empirical contributions computed as transformed feature value &times; model coefficient ($w_i \cdot x_i$).
        </p>

        <div className="space-y-3 flex-1 overflow-y-auto">
          {feature_attributions.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No feature attribution available for this model type.</p>
          ) : (
            feature_attributions.map((attr, idx) => {
              const isPositive = attr.log_odds_contribution > 0;
              const contributionAbs = Math.abs(attr.log_odds_contribution);
              // Max scale ~ 2.5
              const barWidth = Math.min(100, Math.round((contributionAbs / 2.2) * 100));

              return (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-200">{attr.display_name}</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className={isPositive ? 'text-rose-400' : 'text-emerald-400'}>
                        {isPositive ? '+' : ''}{attr.log_odds_contribution.toFixed(3)}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        ({attr.impact})
                      </span>
                    </div>
                  </div>
                  {/* Divergent bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPositive ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(5, barWidth)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskFactorsBreakdown;
