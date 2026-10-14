import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

export default function ForecastTimeline({ currentMonth = 'Aug', onSelectMonth }) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isPlaying, setIsPlaying] = useState(false);

  const timelineMonths = [
    { name: 'Nov', risk: 'low', color: 'bg-emerald-500' },
    { name: 'Dec', risk: 'low', color: 'bg-emerald-500' },
    { name: 'Jan', risk: 'low', color: 'bg-emerald-500' },
    { name: 'Feb', risk: 'moderate', color: 'bg-amber-500' },
    { name: 'Mar', risk: 'moderate', color: 'bg-amber-500' },
    { name: 'Apr', risk: 'moderate', color: 'bg-amber-500' },
    { name: 'May', risk: 'moderate', color: 'bg-amber-500' },
    { name: 'Jun', risk: 'moderate', color: 'bg-amber-500' },
    { name: 'Jul', risk: 'high', color: 'bg-rose-500' },
    { name: 'Aug', risk: 'high', color: 'bg-rose-500', isTarget: true },
    { name: 'Sep', risk: 'high', color: 'bg-rose-500' },
    { name: 'Oct', risk: 'high', color: 'bg-rose-500' },
  ];

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800/80 rounded-2xl p-2.5 sm:px-4 flex items-center justify-between gap-3 backdrop-blur-md">
      {/* Left Label (Direct from Image 1) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            Jan &ndash; Oct 2026
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">Forecast</span>
          </span>
          <span className="text-[10px] text-slate-400">Temporal risk projection</span>
        </div>
      </div>

      {/* Center Months Scrubber Strip (Direct from Image 1) */}
      <div className="flex-1 flex items-center justify-center gap-1 sm:gap-3 overflow-x-auto no-scrollbar py-1">
        {timelineMonths.map((m) => {
          const isSelected = selectedMonth === m.name;
          return (
            <button
              key={m.name}
              onClick={() => {
                setSelectedMonth(m.name);
                if (onSelectMonth) onSelectMonth(m.name);
              }}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition text-xs font-medium relative group ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${m.color} ${isSelected ? 'ring-2 ring-white' : ''}`} />
              <span className={`text-[11px] ${isSelected ? 'font-bold' : ''}`}>
                {m.name}
              </span>
              {m.isTarget && !isSelected && (
                <span className="absolute -bottom-1 w-1 h-1 bg-rose-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="hidden sm:flex items-center gap-1 shrink-0 text-slate-400">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          title="Play timeline progression"
          className="w-7 h-7 rounded-lg hover:bg-slate-800 hover:text-white flex items-center justify-center transition"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
