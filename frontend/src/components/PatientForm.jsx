import React, { useState } from 'react';
import { User, Activity, AlertCircle, Sparkles, Send, RefreshCw, HeartPulse, ChevronDown } from 'lucide-react';

const INITIAL_FORM_STATE = {
  age: 55,
  sex: 1,
  cp: 4,
  trestbps: 140,
  chol: 245,
  fbs: 0,
  restecg: 0,
  thalach: 145,
  exang: 1,
  oldpeak: 1.8,
  slope: 2,
  ca: 1,
  thal: 7
};

const PatientForm = ({ onSubmit, isLoading, samplePatients, onSelectSample }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (formData.age < 18 || formData.age > 100) newErrors.age = 'Age must be between 18 and 100';
    if (formData.trestbps < 70 || formData.trestbps > 250) newErrors.trestbps = 'Blood pressure must be 70 - 250 mmHg';
    if (formData.chol < 80 || formData.chol > 700) newErrors.chol = 'Cholesterol must be 80 - 700 mg/dL';
    if (formData.thalach < 50 || formData.thalach > 230) newErrors.thalach = 'Max heart rate must be 50 - 230 bpm';
    if (formData.oldpeak < 0.0 || formData.oldpeak > 10.0) newErrors.oldpeak = 'ST depression must be 0.0 - 10.0 mm';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value)
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleLoadSample = (sample) => {
    setFormData(sample.data);
    setErrors({});
    if (onSelectSample) {
      onSelectSample(sample);
    }
    // Automatically trigger prediction for the selected sample patient
    onSubmit(sample.data);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      {/* Header & Quick Demo Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            Patient Clinical Profile
          </h2>
          <p className="text-xs text-slate-400">
            Validated against the 14-parameter Cleveland Clinic Heart Disease dataset schema.
          </p>
        </div>

        {/* Demo Patient Badges */}
        {samplePatients && samplePatients.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Demo:
            </span>
            {samplePatients.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => handleLoadSample(sp)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-sky-600/20 hover:border-sky-500/40 border border-slate-700 text-slate-300 hover:text-sky-300 transition"
                title={sp.clinical_summary}
              >
                {sp.name.split(' (')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-5">
        {/* Section 1: Demographics & Vitals */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            1. Demographics & Hemodynamics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Age */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Age (years)
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                min="18"
                max="100"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
              {errors.age && <p className="text-xs text-rose-400 mt-1">{errors.age}</p>}
            </div>

            {/* Sex */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Biological Sex
              </label>
              <select
                value={formData.sex}
                onChange={(e) => handleChange('sex', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value={1}>Male (1)</option>
                <option value={0}>Female (0)</option>
              </select>
            </div>

            {/* Resting Blood Pressure */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Resting BP (mmHg)
              </label>
              <input
                type="number"
                value={formData.trestbps}
                onChange={(e) => handleChange('trestbps', e.target.value)}
                min="70"
                max="250"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
              {errors.trestbps && <p className="text-xs text-rose-400 mt-1">{errors.trestbps}</p>}
            </div>

            {/* Serum Cholesterol */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Serum Cholesterol (mg/dL)
              </label>
              <input
                type="number"
                value={formData.chol}
                onChange={(e) => handleChange('chol', e.target.value)}
                min="80"
                max="700"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
              {errors.chol && <p className="text-xs text-rose-400 mt-1">{errors.chol}</p>}
            </div>

            {/* Fasting Blood Sugar */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fasting Blood Sugar &gt; 120 mg/dL
              </label>
              <select
                value={formData.fbs}
                onChange={(e) => handleChange('fbs', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value={0}>No (&le; 120 mg/dL)</option>
                <option value={1}>Yes (&gt; 120 mg/dL)</option>
              </select>
            </div>

            {/* Resting ECG */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Resting Electrocardiogram
              </label>
              <select
                value={formData.restecg}
                onChange={(e) => handleChange('restecg', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value={0}>Normal (0)</option>
                <option value={1}>ST-T Wave Abnormality (1)</option>
                <option value={2}>Left Ventricular Hypertrophy (2)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Symptoms & Exercise Stress Testing */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            2. Symptom Presentation & Exercise Stress Test
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Chest Pain Type */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Chest Pain Type (cp)
              </label>
              <select
                value={formData.cp}
                onChange={(e) => handleChange('cp', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value={1}>1: Typical Angina</option>
                <option value={2}>2: Atypical Angina</option>
                <option value={3}>3: Non-Anginal Pain</option>
                <option value={4}>4: Asymptomatic</option>
              </select>
            </div>

            {/* Max Heart Rate Achieved */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Heart Rate (thalach)
              </label>
              <input
                type="number"
                value={formData.thalach}
                onChange={(e) => handleChange('thalach', e.target.value)}
                min="50"
                max="230"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
              {errors.thalach && <p className="text-xs text-rose-400 mt-1">{errors.thalach}</p>}
            </div>

            {/* Exercise-Induced Angina */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Exercise-Induced Angina
              </label>
              <select
                value={formData.exang}
                onChange={(e) => handleChange('exang', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value={0}>No (0)</option>
                <option value={1}>Yes (1)</option>
              </select>
            </div>

            {/* ST Depression Oldpeak */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ST Depression (oldpeak mm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.oldpeak}
                onChange={(e) => handleChange('oldpeak', e.target.value)}
                min="0.0"
                max="10.0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
              {errors.oldpeak && <p className="text-xs text-rose-400 mt-1">{errors.oldpeak}</p>}
            </div>

            {/* Peak Exercise ST Slope */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Peak ST Slope
              </label>
              <select
                value={formData.slope}
                onChange={(e) => handleChange('slope', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value={1}>1: Upsloping (Normal)</option>
                <option value={2}>2: Flat</option>
                <option value={3}>3: Downsloping</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Diagnostic Fluoroscopy & Scintigraphy */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            3. Fluoroscopy & Scintigraphy Findings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Major Vessels Colored (ca) */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Major Vessels Colored (ca: 0 - 3)
              </label>
              <select
                value={formData.ca}
                onChange={(e) => handleChange('ca', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value={0}>0 Major Vessels</option>
                <option value={1}>1 Major Vessel</option>
                <option value={2}>2 Major Vessels</option>
                <option value={3}>3 Major Vessels</option>
              </select>
            </div>

            {/* Thallium Stress Scintigraphy */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Thallium Scintigraphy (thal)
              </label>
              <select
                value={formData.thal}
                onChange={(e) => handleChange('thal', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option value={3}>3.0: Normal Perfusion</option>
                <option value={6}>6.0: Fixed Perfusion Defect</option>
                <option value={7}>7.0: Reversible Perfusion Defect</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setFormData(INITIAL_FORM_STATE)}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Baseline
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Patient Data...
              </>
            ) : (
              <>
                <HeartPulse className="w-4 h-4" />
                Compute Model Prediction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
