import React from 'react';
import { Moon, Sun, Dumbbell, HardDrive, Calendar } from 'lucide-react';
import { AppState } from '../types';

interface HeaderBarProps {
  state: AppState;
  onToggleDarkMode: () => void;
  onToggleUnit: () => void;
  onOpenBackup: () => void;
  onOpenCalendar: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  state,
  onToggleDarkMode,
  onToggleUnit,
  onOpenBackup,
  onOpenCalendar,
}) => {
  const isDark = state.isDarkMode;

  return (
    <header className={`sticky top-0 z-30 w-full backdrop-blur-md px-4 py-3 transition-colors border-b ${
      isDark
        ? 'bg-[#111114]/90 border-white/5'
        : 'bg-white/90 border-zinc-200 shadow-sm'
    }`}>
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* App Branding */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <Dumbbell className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h1 className={`text-base font-bold tracking-tight leading-none flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              FitPulse <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 border border-indigo-500/30">Pro</span>
            </h1>
            <p className={`text-[11px] leading-none mt-1 font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Fitness Overview & Tracker</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Calendar History Button */}
          <button
            onClick={onOpenCalendar}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1 ${
              isDark
                ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500/30 hover:bg-indigo-900/50'
                : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Open Workout Calendar & History"
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
          </button>

          {/* Drive Backup Status */}
          <button
            onClick={onOpenBackup}
            className={`p-2 rounded-xl text-xs font-medium border transition-all ${
              state.backupInfo?.lastBackupDate
                ? isDark
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : isDark
                ? 'bg-[#16161A] text-zinc-400 border-white/5'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
            }`}
            title="Google Drive Backup & Restore"
          >
            <HardDrive className="w-4 h-4" />
          </button>

          {/* Unit Switcher */}
          <button
            onClick={onToggleUnit}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all uppercase ${
              isDark
                ? 'bg-[#16161A] text-zinc-200 border-white/5'
                : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200'
            }`}
          >
            {state.unit}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-[#16161A] text-zinc-300 border-white/5 hover:text-indigo-400'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
            }`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
