import React from 'react';
import { Heart, Activity, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const Navbar = ({ onOpenEvaluation, isBackendHealthy }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 shadow-lg shadow-rose-500/20 text-white">
            <Heart className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                CardioVision <span className="text-sky-400 font-mono">3D</span>
              </h1>
              <span className="text-[10px] bg-slate-800 text-sky-400 border border-sky-500/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                UCI Cleveland ML
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Cardiovascular Risk Visualization & Statistical Prediction Platform
            </p>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-3">
          {/* Backend Status indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <div
              className={`w-2 h-2 rounded-full ${
                isBackendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-400 hidden md:inline">ML Engine:</span>
            <span className={isBackendHealthy ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
              {isBackendHealthy ? 'Live (86.9% Acc)' : 'Connecting...'}
            </span>
          </div>

          {/* Model Evaluation Report Button */}
          <button
            onClick={onOpenEvaluation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Model Report & Metrics</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
