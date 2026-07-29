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
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#111114]/90 border-b border-white/5 px-4 py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* App Branding */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <Dumbbell className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none flex items-center gap-1.5">
              FitPulse <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Pro</span>
            </h1>
            <p className="text-[11px] text-zinc-500 leading-none mt-1 font-medium">Fitness Overview & Tracker</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Calendar History Button */}
          <button
            onClick={onOpenCalendar}
            className="p-2 rounded-xl bg-indigo-950/40 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-900/50 transition-all flex items-center gap-1"
            title="Open Workout Calendar & History"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Drive Backup Status */}
          <button
            onClick={onOpenBackup}
            className={`p-2 rounded-xl text-xs font-medium border transition-all ${
              state.backupInfo?.lastBackupDate
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40'
                : 'bg-[#16161A] text-zinc-400 border-white/5 hover:bg-zinc-800/60'
            }`}
            title="Google Drive Backup & Restore"
          >
            <HardDrive className="w-4 h-4" />
          </button>

          {/* Unit Switcher */}
          <button
            onClick={onToggleUnit}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#16161A] text-zinc-200 border border-white/5 hover:border-zinc-700 transition-all uppercase"
          >
            {state.unit}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-[#16161A] text-zinc-300 border border-white/5 hover:text-indigo-400 transition-all"
            aria-label="Toggle Theme"
          >
            {state.isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
