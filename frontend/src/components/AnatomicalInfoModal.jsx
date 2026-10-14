import React from 'react';
import { X, Heart, Activity, Info, Stethoscope, ChevronRight } from 'lucide-react';
import { ANATOMICAL_PARTS } from './HeartCanvas';

const AnatomicalInfoModal = ({ partId, onClose }) => {
  if (!partId || !ANATOMICAL_PARTS[partId]) return null;
  const part = ANATOMICAL_PARTS[partId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{part.name}</h3>
              <span className="text-xs text-sky-400 font-mono tracking-wide uppercase">
                {part.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              Anatomical & Physiological Structure
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
              {part.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              Clinical Correlation & Risk Factors
            </h4>
            <div className="text-sm text-slate-300 leading-relaxed bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-900/30 text-emerald-200/90">
              {part.clinicalSignificance}
            </div>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl text-xs text-amber-300/80 leading-snug">
            <strong>Important Diagnostic Disclaimer:</strong> Visualizing this structure provides clinical anatomical context. This web application does not perform radiographic segmentation or automated arterial lumen grading.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnatomicalInfoModal;
