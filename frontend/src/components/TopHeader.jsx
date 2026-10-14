import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  ChevronDown, 
  Sparkles, 
  Sliders, 
  User, 
  Bell, 
  Layers,
  Sun,
  Moon
} from 'lucide-react';

export default function TopHeader({ 
  activeSystem, 
  setActiveSystem, 
  currentPatient, 
  samplePatients, 
  onSelectSample, 
  onOpenEvaluation, 
  isBackendHealthy,
  environmentTheme,
  activeViewTitle = 'Cardiovascular Overview'
}) {
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const isLight = environmentTheme === 'light';

  return (
    <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between gap-4 z-20 backdrop-blur-md sticky top-0 transition-colors duration-300 ${
      isLight 
        ? 'bg-white/85 border-slate-200/90 text-slate-800' 
        : 'bg-slate-900/60 border-slate-800/80 text-slate-100'
    }`}>
      {/* Left: Brand & Workspace Title */}
      <div className="flex items-center gap-4 lg:gap-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <Heart className="w-4 h-4 text-white fill-white/20 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-sm tracking-tight flex items-center gap-1.5 ${isLight ? 'text-slate-950' : 'text-white'}`}>
              CardioVision <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-full border ${
                isLight ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>3D</span>
            </span>
            <span className={`text-[10px] font-mono -mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {activeViewTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Engine Status, Patient Chip, Model Evaluation */}
      <div className="flex items-center gap-3 shrink-0">
        {/* ML Status Badge */}
        <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[11px] font-mono font-medium">
            {isBackendHealthy ? 'Engine Online (UCI Cleveland)' : 'Connecting...'}
          </span>
        </div>

        {/* Patient Selection Dropdown Chip */}
        <div className="relative">
          <button
            onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-left transition group ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm' 
                : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800/90'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center font-bold text-xs text-white">
              {currentPatient?.name ? currentPatient.name.charAt(0) : 'J'}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-bold leading-tight ${isLight ? 'text-slate-950' : 'text-slate-200 group-hover:text-white'}`}>
                {currentPatient?.name || 'Jaxson Culhane'}
              </span>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {currentPatient?.gender || 'Male'} &bull; {currentPatient?.age || 58} y.o.
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {isPatientDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl p-2 z-50 border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Select Clinical Patient Case
              </div>
              <div className="space-y-1">
                {samplePatients.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => {
                      onSelectSample(sp);
                      setIsPatientDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex flex-col group ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isLight ? 'text-slate-900 group-hover:text-teal-700' : 'text-slate-200 group-hover:text-indigo-400'}`}>
                        {sp.name || sp.label || sp.id}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        sp.id?.includes('high') ? 'bg-rose-100 text-rose-800' :
                        sp.id?.includes('inter') || sp.id?.includes('mod') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sp.expected_risk ? sp.expected_risk.split(' ')[0].toUpperCase() : (sp.id || 'DEMO').toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-[11px] mt-0.5 line-clamp-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {sp.clinical_summary || sp.description || 'Clinical profile'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Model Evaluation Button */}
        <button
          onClick={onOpenEvaluation}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition ${
            isLight
              ? 'bg-slate-900 hover:bg-slate-800 text-white'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Model Evaluation</span>
        </button>
      </div>
    </header>
  );
}
