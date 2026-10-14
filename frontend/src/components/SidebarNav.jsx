import React from 'react';
import { 
  LayoutGrid, 
  PlusCircle, 
  Heart, 
  History, 
  Sliders, 
  FileText, 
  Settings, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export default function SidebarNav({ 
  activeView, 
  setActiveView, 
  environmentTheme, 
  onToggleTheme 
}) {
  const navItems = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview Dashboard' },
    { id: 'assessment', icon: PlusCircle, label: 'New Patient Assessment' },
    { id: 'workspace', icon: Heart, label: '3D Anatomy & AI Workspace' },
    { id: 'history', icon: History, label: 'Patient History & Trends' },
    { id: 'performance', icon: Sliders, label: 'Model Evaluation' },
    { id: 'reports', icon: FileText, label: 'Clinical Reports' },
    { id: 'settings', icon: Settings, label: 'Application Settings' },
  ];

  const isLight = environmentTheme === 'light';

  return (
    <aside className={`w-16 border-r flex flex-col items-center py-4 justify-between z-30 shrink-0 backdrop-blur-md transition-colors duration-300 ${
      isLight 
        ? 'bg-white/85 border-slate-200/90 text-slate-700' 
        : 'bg-slate-950/90 border-slate-800/80 text-slate-400'
    }`}>
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <div 
          onClick={() => setActiveView('overview')}
          className="relative group cursor-pointer" 
          title="CardioVision 3D"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-indigo-600 p-0.5 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center transition-colors ${
              isLight ? 'bg-white' : 'bg-slate-950'
            }`}>
              <Sparkles className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        </div>

        {/* Primary Navigation Buttons */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={item.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
                  isActive
                    ? isLight
                      ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-sm'
                      : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {isActive && (
                  <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${
                    isLight ? 'bg-teal-600' : 'bg-indigo-500'
                  }`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Environment Theme Toggle (Light / Dark) + Clinician Avatar */}
      <div className="flex flex-col items-center gap-3">
        {/* Environment Theme Switcher */}
        <button
          onClick={onToggleTheme}
          title={isLight ? 'Switch to Environment B (Dark AI Workspace)' : 'Switch to Environment A (Light Clinical Overview)'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
            isLight 
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200' 
              : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border-slate-800'
          }`}
        >
          {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Clinician Profile Avatar */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 p-0.5 cursor-pointer shadow-sm" title="Dr. S. Priya, MD (Cardiology)">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80"
              alt="Clinician Avatar"
              className="w-full h-full rounded-[10px] object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
