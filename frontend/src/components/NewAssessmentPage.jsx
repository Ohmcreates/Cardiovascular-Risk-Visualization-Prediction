import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  FlaskConical, 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles,
  Info,
  ShieldCheck,
  Eye,
  User
} from 'lucide-react';

export default function NewAssessmentPage({ 
  formData, 
  onChangeFormData, 
  onSubmitAssessment, 
  isLoading, 
  predictionResult, 
  onNavigateToAnatomy 
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [reviewMode, setReviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateCurrentStep = () => {
    const errors = {};
    if (currentStep === 1) {
      if (formData.age < 18 || formData.age > 100) errors.age = 'Age must be between 18 and 100 years.';
      if (formData.trestbps < 70 || formData.trestbps > 250) errors.trestbps = 'Resting blood pressure must be 70–250 mm Hg.';
      if (formData.thalach < 50 || formData.thalach > 230) errors.thalach = 'Maximum heart rate must be 50–230 bpm.';
    } else if (currentStep === 2) {
      if (formData.chol < 80 || formData.chol > 700) errors.chol = 'Serum cholesterol must be 80–700 mg/dl.';
    } else if (currentStep === 3) {
      if (formData.oldpeak < 0 || formData.oldpeak > 10.0) errors.oldpeak = 'ST depression must be 0.0–10.0 mm.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 3) {
        setCurrentStep((s) => s + 1);
      } else {
        setReviewMode(true);
      }
    }
  };

  const handleBack = () => {
    if (reviewMode) {
      setReviewMode(false);
    } else if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFieldChange = (field, value) => {
    onChangeFormData({ ...formData, [field]: parseFloat(value) });
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitAssessment(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/80 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
            Clinical Intake Protocol
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            New Patient Cardiovascular Assessment
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">
            14 validated clinical attributes conforming to the UCI Cleveland Heart Disease benchmark schema.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-1.5">
              <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition ${
                reviewMode 
                  ? 'bg-teal-500 text-white'
                  : currentStep === step
                  ? 'bg-slate-900 text-white shadow-sm'
                  : currentStep > step
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {currentStep > step || reviewMode ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              {step < 3 && <div className="w-4 h-0.5 bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Body or Review View */}
      {!reviewMode ? (
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-md space-y-6">
          {/* STEP 1: Demographics & Resting Hemodynamics */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-700" />
                  Step 1: Patient Demographics & Baseline Vitals
                </h3>
                <p className="text-xs text-slate-700">Enter age, biological sex, and resting cardiovascular measurements.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Age */}
                <div>
                  <label className="text-xs font-bold text-slate-800 flex justify-between mb-1.5">
                    <span>Patient Age <strong className="text-rose-500">*</strong></span>
                    <span className="font-mono text-slate-600">years (18–100)</span>
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                    required
                  />
                  {validationErrors.age && <p className="text-[11px] text-rose-500 mt-1">{validationErrors.age}</p>}
                </div>

                {/* Sex */}
                <div>
                  <label className="text-xs font-bold text-slate-800 flex justify-between mb-1.5">
                    <span>Biological Sex <strong className="text-rose-500">*</strong></span>
                    <span className="font-mono text-slate-600">Categorical</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('sex', 1)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                        formData.sex === 1
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Male (1)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('sex', 0)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                        formData.sex === 0
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Female (0)
                    </button>
                  </div>
                </div>

                {/* Resting Blood Pressure */}
                <div>
                  <label className="text-xs font-bold text-slate-800 flex justify-between mb-1.5">
                    <span>Resting Blood Pressure (trestbps) <strong className="text-rose-500">*</strong></span>
                    <span className="font-mono text-slate-600">mm Hg (70–250)</span>
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="250"
                    value={formData.trestbps}
                    onChange={(e) => handleFieldChange('trestbps', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                    required
                  />
                  {validationErrors.trestbps && <p className="text-[11px] text-rose-500 mt-1">{validationErrors.trestbps}</p>}
                </div>

                {/* Maximum Heart Rate */}
                <div>
                  <label className="text-xs font-bold text-slate-800 flex justify-between mb-1.5">
                    <span>Max Heart Rate Achieved (thalach) <strong className="text-rose-500">*</strong></span>
                    <span className="font-mono text-slate-600">bpm (50–230)</span>
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="230"
                    value={formData.thalach}
                    onChange={(e) => handleFieldChange('thalach', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                    required
                  />
                  {validationErrors.thalach && <p className="text-[11px] text-rose-500 mt-1">{validationErrors.thalach}</p>}
                </div>

                {/* Chest Pain Type */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Chest Pain Presentation (cp) <strong className="text-rose-500">*</strong>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 1, label: 'Typical Angina', desc: 'Substernal chest pain with exertion' },
                      { id: 2, label: 'Atypical Angina', desc: 'Non-exertional chest discomfort' },
                      { id: 3, label: 'Non-Anginal', desc: 'Musculoskeletal or pleuritic pain' },
                      { id: 4, label: 'Asymptomatic', desc: 'Silent / ischemic presentation' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleFieldChange('cp', t.id)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          formData.cp === t.id
                            ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm ring-1 ring-teal-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-bold block">{t.label}</span>
                        <span className="text-[10px] text-slate-600 mt-1 line-clamp-2">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Lipids & Blood Chemistry */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-amber-600" />
                  Step 2: Serum Lipids & Metabolic Profile
                </h3>
                <p className="text-xs text-slate-700">Circulating lipid concentrations and fasting metabolic indicators.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Cholesterol */}
                <div>
                  <label className="text-xs font-bold text-slate-800 flex justify-between mb-1.5">
                    <span>Serum Cholesterol (chol) <strong className="text-rose-500">*</strong></span>
                    <span className="font-mono text-slate-600">mg/dl (80–700)</span>
                  </label>
                  <input
                    type="number"
                    min="80"
                    max="700"
                    value={formData.chol}
                    onChange={(e) => handleFieldChange('chol', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                    required
                  />
                  {validationErrors.chol && <p className="text-[11px] text-rose-500 mt-1">{validationErrors.chol}</p>}
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Reference: &lt;200 mg/dl Desirable, 200–239 mg/dl Borderline, &ge;240 mg/dl Elevated.
                  </p>
                </div>

                {/* Fasting Blood Sugar */}
                <div>
                  <label className="text-xs font-bold text-slate-800 flex justify-between mb-1.5">
                    <span>Fasting Blood Sugar &gt; 120 mg/dl (fbs) <strong className="text-rose-500">*</strong></span>
                    <span className="font-mono text-slate-600">Binary</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('fbs', 0)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                        formData.fbs === 0
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      &le; 120 mg/dl (Normal)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('fbs', 1)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                        formData.fbs === 1
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      &gt; 120 mg/dl (Diabetic)
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5">
                    Surrogate marker for impaired fasting glycemia or Type 2 diabetes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Electrocardiography & Diagnostic Findings */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Step 3: ECG, Stress Testing & Perfusion Findings
                </h3>
                <p className="text-xs text-slate-700">Exercise stress biomarkers and myocardial perfusion parameters.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Resting ECG */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Resting ECG Result (restecg) <strong className="text-rose-500">*</strong>
                  </label>
                  <select
                    value={formData.restecg}
                    onChange={(e) => handleFieldChange('restecg', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                  >
                    <option value={0}>0: Normal ECG tracing</option>
                    <option value={1}>1: ST-T wave abnormality (T wave inversions)</option>
                    <option value={2}>2: Left ventricular hypertrophy by Estes criteria</option>
                  </select>
                </div>

                {/* Exercise Induced Angina */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Exercise-Induced Angina (exang) <strong className="text-rose-500">*</strong>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('exang', 0)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                        formData.exang === 0
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      No (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('exang', 1)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                        formData.exang === 1
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Yes (1)
                    </button>
                  </div>
                </div>

                {/* ST Depression (oldpeak) */}
                <div>
                  <label className="text-xs font-bold text-slate-800 flex justify-between mb-1.5">
                    <span>Exercise ST Depression (oldpeak) <strong className="text-rose-500">*</strong></span>
                    <span className="font-mono text-slate-600">mm (0.0–10.0)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10.0"
                    value={formData.oldpeak}
                    onChange={(e) => handleFieldChange('oldpeak', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                    required
                  />
                  {validationErrors.oldpeak && <p className="text-[11px] text-rose-500 mt-1">{validationErrors.oldpeak}</p>}
                </div>

                {/* Peak Exercise ST Slope */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Slope of Peak Exercise ST (slope) <strong className="text-rose-500">*</strong>
                  </label>
                  <select
                    value={formData.slope}
                    onChange={(e) => handleFieldChange('slope', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                  >
                    <option value={1}>1: Upsloping (typically benign)</option>
                    <option value={2}>2: Flat (ischemic marker)</option>
                    <option value={3}>3: Downsloping (severe ischemia)</option>
                  </select>
                </div>

                {/* Number of Major Vessels (ca) */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Major Vessels Colored by Fluoroscopy (ca) <strong className="text-rose-500">*</strong>
                  </label>
                  <select
                    value={formData.ca}
                    onChange={(e) => handleFieldChange('ca', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                  >
                    <option value={0}>0 vessels</option>
                    <option value={1}>1 vessel</option>
                    <option value={2}>2 vessels</option>
                    <option value={3}>3 vessels</option>
                  </select>
                </div>

                {/* Thallium Scintigraphy (thal) */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Thallium Scintigraphy Perfusion (thal) <strong className="text-rose-500">*</strong>
                  </label>
                  <select
                    value={formData.thal}
                    onChange={(e) => handleFieldChange('thal', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition"
                  >
                    <option value={3}>3: Normal perfusion</option>
                    <option value={6}>6: Fixed defect (prior infarction / scar)</option>
                    <option value={7}>7: Reversible defect (inducible ischemia)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            ) : <div />}

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/20 flex items-center gap-2 transition"
            >
              <span>{currentStep === 3 ? 'Review Before Assessment' : 'Continue to Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      ) : (
        /* REVIEW & CONFIRMATION STEP (Direct Requirement from Part 7) */
        <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-md space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Clinical Verification & Review
              </h3>
              <p className="text-xs text-slate-700">Confirm values prior to dispatching to the UCI Cleveland inference engine.</p>
            </div>
            <button
              onClick={() => setReviewMode(false)}
              className="text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              Edit Inputs
            </button>
          </div>

          {/* Review Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-600 block text-[11px]">Age & Sex</span>
              <span className="font-bold text-slate-900">{formData.age} yrs &bull; {formData.sex === 1 ? 'Male' : 'Female'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-600 block text-[11px]">Resting BP</span>
              <span className="font-bold text-slate-900">{formData.trestbps} mm Hg</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-600 block text-[11px]">Max HR (thalach)</span>
              <span className="font-bold text-slate-900">{formData.thalach} bpm</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-600 block text-[11px]">Chest Pain</span>
              <span className="font-bold text-slate-900">Type {formData.cp}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-600 block text-[11px]">Serum Cholesterol</span>
              <span className="font-bold text-slate-900">{formData.chol} mg/dl</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-600 block text-[11px]">Fasting Sugar</span>
              <span className="font-bold text-slate-900">{formData.fbs === 1 ? '> 120' : 'Normal'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-600 block text-[11px]">ST Depression</span>
              <span className="font-bold text-slate-900">{formData.oldpeak} mm</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-600 block text-[11px]">Perfusion (thal)</span>
              <span className="font-bold text-slate-900">Code {formData.thal}</span>
            </div>
          </div>

          {/* Submission Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReviewMode(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Back to Edit
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Running Model Inference...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Execute AI Prediction & View 3D Result
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
