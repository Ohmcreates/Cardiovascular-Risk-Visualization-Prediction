import React from 'react';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  FileText,
  Activity,
  Heart
} from 'lucide-react';

export default function PatientHistoryView({ currentPatientMeta, onSelectHistoricalDate }) {
  const historyData = [
    {
      date: '14 Oct 2026',
      time: '10:45 AM',
      type: 'Current Assessment',
      risk: 78,
      riskTier: 'High',
      trestbps: 140,
      chol: 260,
      oldpeak: 2.2,
      thalach: 142,
      change: '+14% vs Jun 2026',
      isFlagged: true,
      notes: 'Ischemic ST depression elevation on exercise stress test. Recommended SPECT.'
    },
    {
      date: '22 Jun 2026',
      time: '02:15 PM',
      type: 'Follow-up Consultation',
      risk: 64,
      riskTier: 'Moderate-High',
      trestbps: 135,
      chol: 245,
      oldpeak: 1.4,
      thalach: 148,
      change: '+10% vs Jan 2026',
      isFlagged: false,
      notes: 'Blood pressure elevated despite beta-blocker titration. Medication adjusted.'
    },
    {
      date: '15 Jan 2026',
      time: '11:00 AM',
      type: 'Routine Annual Physical',
      risk: 54,
      riskTier: 'Moderate',
      trestbps: 130,
      chol: 232,
      oldpeak: 0.8,
      thalach: 155,
      change: '+6% vs Sep 2025',
      isFlagged: false,
      notes: 'Borderline hypercholesterolemia noted. Dietary lifestyle modifications initiated.'
    },
    {
      date: '10 Sep 2025',
      time: '09:30 AM',
      type: 'Baseline Intake Assessment',
      risk: 48,
      riskTier: 'Moderate',
      trestbps: 125,
      chol: 218,
      oldpeak: 0.2,
      thalach: 160,
      change: 'Baseline established',
      isFlagged: false,
      notes: 'Normal resting ECG, mild exertional dyspnea on heavy stairs.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
            Longitudinal Health Record
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Historical Assessments & Trajectory
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            Patient: <strong>{currentPatientMeta?.name || 'Jaxson Culhane'}</strong> (Male &bull; 58 y.o.) &bull; 4 longitudinal assessments on record
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 font-medium">Trajectory:</span>
          <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
            +30% Risk Delta (13 mo)
          </span>
        </div>
      </div>

      {/* Visual Timeline Cards */}
      <div className="space-y-4">
        {historyData.map((item, idx) => (
          <div 
            key={idx}
            className={`bg-white/90 border rounded-3xl p-5 shadow-sm backdrop-blur-md transition hover:border-slate-300 relative ${
              item.isFlagged ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Date & Type */}
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  item.risk >= 65 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  item.risk >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{item.date}</span>
                    <span className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.time}
                    </span>
                    {item.isFlagged && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Significant Shift
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-700 block mt-0.5">{item.type}</span>
                </div>
              </div>

              {/* Vitals Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">BP (mmHg)</span>
                  <span className="font-mono font-bold text-slate-900">{item.trestbps}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Chol (mg/dl)</span>
                  <span className="font-mono font-bold text-slate-900">{item.chol}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">ST Dep (mm)</span>
                  <span className="font-mono font-bold text-slate-900">{item.oldpeak}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px] uppercase font-semibold">Max HR (bpm)</span>
                  <span className="font-mono font-bold text-slate-900">{item.thalach}</span>
                </div>
              </div>

              {/* Model Risk Output */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-600 block font-medium">Estimated Risk</span>
                  <span className={`text-base font-black ${
                    item.risk >= 65 ? 'text-rose-700' : item.risk >= 50 ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {item.risk}% ({item.riskTier})
                  </span>
                </div>
                <div className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                  item.risk >= 65 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.change}
                </div>
              </div>
            </div>

            {/* Clinician Notes */}
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-700 flex items-center justify-between">
              <p className="italic">
                "{item.notes}"
              </p>
              <span className="text-[10px] font-mono text-slate-600 shrink-0">
                Model: UCI Baseline v1.2
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
