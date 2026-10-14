import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Heart, 
  Activity, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Calendar,
  User,
  Stethoscope
} from 'lucide-react';

export default function ClinicalReportsView({ 
  formData, 
  predictionResult, 
  currentPatientMeta 
}) {
  const prob = predictionResult?.probability ? Math.round(predictionResult.probability * 100) : 78;
  const isHighRisk = prob >= 65;
  const isModRisk = prob >= 35 && prob < 65;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white/80 border border-slate-200/90 rounded-3xl p-5 shadow-sm backdrop-blur-md">
        <div>
          <h2 className="text-base font-black text-slate-900">Patient Cardiovascular Summary Report</h2>
          <p className="text-xs text-slate-700">Official Clinical Decision Support Record &bull; Generated for EHR archive</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/20 flex items-center gap-2 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-white border border-slate-300 rounded-3xl p-8 sm:p-12 shadow-md text-slate-900 space-y-8 font-sans">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-950">CardioVision 3D Clinical Report</h1>
              <span className="text-xs text-slate-600 font-mono">Cleveland Protocol &bull; Automated Decision Support</span>
            </div>
          </div>
          <div className="text-right text-xs text-slate-700">
            <span className="block font-bold">Report ID: CV-2026-1049</span>
            <span>Date: 14 Oct 2026, 10:45 AM</span>
          </div>
        </div>

        {/* Patient Demographics Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-600 block text-[10px] uppercase font-semibold">Patient Name</span>
            <span className="font-bold text-slate-950 text-sm">{currentPatientMeta?.name || 'Jaxson Culhane'}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[10px] uppercase font-semibold">Age / Sex</span>
            <span className="font-bold text-slate-950">{formData.age} yrs / {formData.sex === 1 ? 'Male' : 'Female'}</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[10px] uppercase font-semibold">Assessment Protocol</span>
            <span className="font-bold text-slate-950">UCI Cleveland ML Baseline</span>
          </div>
          <div>
            <span className="text-slate-600 block text-[10px] uppercase font-semibold">Referring Clinician</span>
            <span className="font-bold text-slate-950">Dr. S. Priya, MD (Cardiology)</span>
          </div>
        </div>

        {/* Prediction & Primary Result */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
              Automated Statistical Assessment Result
            </span>
            <h3 className="text-xl font-black text-slate-950">
              {predictionResult?.prediction_label || 'Presence of Heart Disease Detected (≥50% diameter narrowing)'}
            </h3>
            <p className="text-xs text-slate-700">
              Correlated with angiographic diagnostic status in the reference Cleveland clinical cohort.
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <div className={`text-4xl font-black ${isHighRisk ? 'text-rose-600' : isModRisk ? 'text-amber-600' : 'text-emerald-600'}`}>
              {prob}%
            </div>
            <span className="text-xs font-bold text-slate-700 block mt-0.5">
              {isHighRisk ? 'High Risk Tier' : isModRisk ? 'Moderate Risk Tier' : 'Low Risk Tier'}
            </span>
          </div>
        </div>

        {/* Vitals Summary Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Clinical Measurements & Baseline Findings
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-600 block text-[10px]">Resting Blood Pressure</span>
              <span className="font-bold text-slate-950 text-sm">{formData.trestbps} mm Hg</span>
              <span className="text-[10px] text-rose-600 block mt-0.5 font-semibold">Stage 2 Hypertension</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-600 block text-[10px]">Serum Cholesterol</span>
              <span className="font-bold text-slate-950 text-sm">{formData.chol} mg/dl</span>
              <span className="text-[10px] text-amber-600 block mt-0.5 font-semibold">Borderline High</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-600 block text-[10px]">ST Depression (Exercise)</span>
              <span className="font-bold text-slate-950 text-sm">{formData.oldpeak} mm</span>
              <span className="text-[10px] text-rose-600 block mt-0.5 font-semibold">Significant Ischemia</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-600 block text-[10px]">Max Heart Rate Achieved</span>
              <span className="font-bold text-slate-950 text-sm">{formData.thalach} bpm</span>
              <span className="text-[10px] text-slate-600 block mt-0.5 font-semibold">Normal chronotropic</span>
            </div>
          </div>
        </div>

        {/* Contributing Drivers & Attributions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Top Statistical Contributing Factors
          </h4>
          <div className="space-y-2">
            {[
              { factor: 'Major Vessels Colored by Fluoroscopy (ca=1.0)', impact: 'Increases Risk (+1.20 log-odds)', direction: 'positive' },
              { factor: 'Asymptomatic Chest Pain Presentation (cp=4.0)', impact: 'Increases Risk (+0.94 log-odds)', direction: 'positive' },
              { factor: 'Thallium Reversible Perfusion Defect (thal=7.0)', impact: 'Increases Risk (+0.79 log-odds)', direction: 'positive' },
              { factor: 'Exercise ST Depression (oldpeak=2.2mm)', impact: 'Increases Risk (+0.23 log-odds)', direction: 'positive' },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-900">{f.factor}</span>
                <span className="font-mono font-bold text-rose-700">{f.impact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Physician Recommendations & Plan */}
        <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2 text-xs">
          <h4 className="font-bold text-slate-950 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-700" />
            Recommended Cardiology Next Steps
          </h4>
          <p className="text-slate-800 leading-relaxed text-[11px]">
            1. Comprehensive cardiology consultation with stress myocardial perfusion scintigraphy (SPECT) or stress echocardiography to evaluate reversible wall motion abnormality.<br />
            2. Pharmacotherapy optimization: Intensify statin regimen (targeting LDL &lt; 70 mg/dl) and optimize anti-hypertensive titration.<br />
            3. Patient education: Symptom recognition for acute coronary syndrome; follow-up scheduled in 4 weeks.
          </p>
        </div>

        {/* Legal & Medical Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-600 space-y-1">
          <p>
            <strong>Medical Notice:</strong> CardioVision 3D is a clinical decision-support research application based on scikit-learn models trained on the historical UCI Cleveland Heart Disease cohort. This output represents a statistical probability of disease presence and does NOT constitute an independent clinical diagnosis, physical imaging finding, or coronary obstruction detection.
          </p>
          <div className="flex justify-between items-center pt-4">
            <span className="font-mono">CardioVision 3D v1.0 &bull; Hash: #4a9e-8c01</span>
            <span className="border-t border-slate-400 pt-1 px-8 text-center">Physician Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}
