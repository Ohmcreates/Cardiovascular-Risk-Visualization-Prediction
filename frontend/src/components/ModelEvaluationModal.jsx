import React, { useEffect, useState } from 'react';
import { X, Award, BarChart3, Database, AlertCircle, ShieldAlert, CheckCircle } from 'lucide-react';

const ModelEvaluationModal = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/model-info')
        .then((res) => res.json())
        .then((data) => {
          setMetrics(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load metrics:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Empirical Model Evaluation Report</h2>
              <p className="text-xs text-slate-400">
                Direct benchmark metrics evaluated on holdout test samples from the UCI Heart Disease dataset.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-400">Loading model evaluation metrics...</p>
            </div>
          ) : !metrics ? (
            <div className="py-12 text-center text-rose-400 text-sm">
              Failed to load evaluation metrics. Verify backend service is running.
            </div>
          ) : (
            <>
              {/* Dataset Info Box */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-0.5">
                    Dataset Source
                  </span>
                  <a
                    href={metrics.dataset.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-sky-400 hover:underline flex items-center gap-1.5"
                  >
                    <Database className="w-4 h-4" />
                    {metrics.dataset.name}
                  </a>
                </div>
                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block">Total Cohort:</span>
                    <span className="font-bold text-slate-200">{metrics.dataset.total_samples} patients</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Train + Val Set:</span>
                    <span className="font-bold text-slate-200">{metrics.dataset.train_samples}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Holdout Test:</span>
                    <span className="font-bold text-slate-200">{metrics.dataset.test_samples}</span>
                  </div>
                </div>
              </div>

              {/* Models Comparison Table */}
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Baseline Model Comparison (Holdout Test Set)
                </h3>
                <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Model Architecture</th>
                        <th className="py-3 px-4">Accuracy</th>
                        <th className="py-3 px-4">ROC-AUC</th>
                        <th className="py-3 px-4">F1-Score</th>
                        <th className="py-3 px-4">Sensitivity (Recall)</th>
                        <th className="py-3 px-4">Specificity</th>
                        <th className="py-3 px-4">Precision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {metrics.models_compared &&
                        Object.values(metrics.models_compared).map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4 font-sans font-semibold text-white">
                              {m?.model_name || 'Model'}
                            </td>
                            <td className="py-3 px-4 text-emerald-400 font-bold">
                              {(((m?.accuracy ?? 0) * 100)).toFixed(1)}%
                            </td>
                            <td className="py-3 px-4 text-sky-400 font-bold">{(m?.roc_auc ?? 0).toFixed(4)}</td>
                            <td className="py-3 px-4 text-slate-200">{(m?.f1_score ?? 0).toFixed(4)}</td>
                            <td className="py-3 px-4 text-slate-300">{(((m?.recall ?? 0) * 100)).toFixed(1)}%</td>
                            <td className="py-3 px-4 text-slate-300">{(((m?.specificity ?? 0) * 100)).toFixed(1)}%</td>
                            <td className="py-3 px-4 text-slate-300">{(((m?.precision ?? 0) * 100)).toFixed(1)}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confusion Matrix & Detailed Metrics */}
              {metrics.selected_model && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Confusion Matrix */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Production Confusion Matrix ({metrics.selected_model.name})
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-center font-mono">
                      <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl">
                        <div className="text-lg font-bold text-emerald-400">
                          {metrics.selected_model.metrics.confusion_matrix.tn}
                        </div>
                        <div className="text-[10px] text-emerald-300 uppercase mt-0.5">True Negatives</div>
                      </div>
                      <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl">
                        <div className="text-lg font-bold text-rose-400">
                          {metrics.selected_model.metrics.confusion_matrix.fp}
                        </div>
                        <div className="text-[10px] text-rose-300 uppercase mt-0.5">False Positives</div>
                      </div>
                      <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                        <div className="text-lg font-bold text-amber-400">
                          {metrics.selected_model.metrics.confusion_matrix.fn}
                        </div>
                        <div className="text-[10px] text-amber-300 uppercase mt-0.5">False Negatives</div>
                      </div>
                      <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl">
                        <div className="text-lg font-bold text-blue-400">
                          {metrics.selected_model.metrics.confusion_matrix.tp}
                        </div>
                        <div className="text-[10px] text-blue-300 uppercase mt-0.5">True Positives</div>
                      </div>
                    </div>
                  </div>

                  {/* Top Model Features */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Top Influential Features in Model
                    </h4>
                    <div className="space-y-1.5 overflow-y-auto max-h-[140px] text-xs">
                      {metrics.selected_model.feature_importance?.slice(0, 5).map((f, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-slate-850">
                          <span className="text-slate-300 truncate max-w-[200px]">{f?.feature || 'Feature'}</span>
                          <span className="font-mono text-slate-400">{(f?.weight ?? 0).toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Regulatory & Clinical Limitations Notice */}
              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Clinical Limitations & Non-Claim Boundaries
                </h4>
                <ul className="text-xs text-amber-200/80 space-y-1 list-disc pl-5 leading-relaxed">
                  {metrics.clinical_limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelEvaluationModal;
