import React from 'react';
import { 
  Settings, 
  Sliders, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Cpu, 
  Database,
  CheckCircle2
} from 'lucide-react';

export default function AppSettingsView({ 
  environmentTheme, 
  setEnvironmentTheme, 
  isBackendHealthy 
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/80 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-md">
        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
          System Configuration
        </span>
        <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
          Clinical & Application Settings
        </h2>
        <p className="text-xs text-slate-700 mt-0.5">
          Configure clinical measurement units, visual environments, and machine learning inference endpoints.
        </p>
      </div>

      {/* Setting 1: Visual Environment Mode (Part 1.1) */}
      <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Visual Environment System
          </h3>
          <p className="text-xs text-slate-700 mt-0.5">
            Select the active environment mode conforming to the project's art direction standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Environment A: Light Clinical Overview */}
          <button
            onClick={() => setEnvironmentTheme('light')}
            className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
              environmentTheme === 'light'
                ? 'bg-teal-50/80 border-teal-500 shadow-sm ring-1 ring-teal-500'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 shadow-sm">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Environment A</span>
                {environmentTheme === 'light' && (
                  <span className="text-[10px] bg-teal-600 text-white px-2 py-0.2 rounded-full font-bold">Active</span>
                )}
              </div>
              <span className="text-xs font-semibold text-teal-900 block mt-0.5">Clinical Overview (Light)</span>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                Spacious near-white cards, pale cyan/mint undertones, dark navy typography. Inspired by MediFlex.
              </p>
            </div>
          </button>

          {/* Environment B: Dark AI Diagnostic Workspace */}
          <button
            onClick={() => setEnvironmentTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
              environmentTheme === 'dark'
                ? 'bg-slate-900 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${environmentTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Environment B
                </span>
                {environmentTheme === 'dark' && (
                  <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.2 rounded-full font-bold">Active</span>
                )}
              </div>
              <span className={`text-xs font-semibold block mt-0.5 ${environmentTheme === 'dark' ? 'text-indigo-300' : 'text-indigo-900'}`}>
                AI Diagnostic Workspace (Dark)
              </span>
              <p className={`text-[11px] mt-1 leading-snug ${environmentTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Deep charcoal and midnight navy, compact controls, connected neural risk graph. Inspired by Image 1.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Setting 2: Clinical Units & Standards */}
      <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Clinical Units & Measurement Standards
          </h3>
          <p className="text-xs text-slate-700 mt-0.5">
            Configure unit standards according to clinical laboratory conventions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Blood Pressure Unit</span>
              <span className="text-slate-600 text-[11px]">Systemic arterial pressure</span>
            </div>
            <span className="font-mono font-bold px-3 py-1 bg-white border border-slate-300 rounded-xl text-slate-900">
              mm Hg
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Serum Cholesterol Unit</span>
              <span className="text-slate-600 text-[11px]">Circulating total lipids</span>
            </div>
            <span className="font-mono font-bold px-3 py-1 bg-white border border-slate-300 rounded-xl text-slate-900">
              mg/dl
            </span>
          </div>
        </div>
      </div>

      {/* Setting 3: Backend Runtime & Model Engine */}
      <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-md space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-700" />
          Runtime Diagnostics & Architecture
        </h3>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span>Inference API Status</span>
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {isBackendHealthy ? 'Online (FastAPI 1.0.0)' : 'Reconnecting...'}
            </span>
          </div>

          <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span>Primary Model Weights</span>
            <span className="font-mono font-bold text-slate-900">model.joblib (LogisticRegression L2)</span>
          </div>

          <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span>3D Rendering Engine</span>
            <span className="font-mono font-bold text-slate-900">Three.js r186 + WebGL Canvas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
