import React, { useState } from 'react';
import { AppState, Exercise, BodyWeightEntry } from '../types';
import { ExercisesView } from './ExercisesView';
import { BackupView } from './BackupView';
import { BookOpen, HardDrive, User, Scale, Ruler, Plus, Check } from 'lucide-react';

interface SettingsViewProps {
  state: AppState;
  onOpenCustomExerciseModal: () => void;
  onRestoreState: (newState: Partial<AppState>) => void;
  onUpdateBackupInfo: (info: { lastBackupDate: string; fileName: string }) => void;
  onInitGoogleAuth: () => void;
  onUpdateMetrics: (weightKg: number, heightCm?: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onOpenCustomExerciseModal,
  onRestoreState,
  onUpdateBackupInfo,
  onInitGoogleAuth,
  onUpdateMetrics,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'exercises' | 'backup'>('profile');

  // Local metric inputs
  const latestWeight = state.bodyMetrics.length > 0 ? state.bodyMetrics[state.bodyMetrics.length - 1].weightKg : '';
  const latestHeight = state.userProfile?.heightCm || '';

  const [weightInput, setWeightInput] = useState<string>(latestWeight.toString());
  const [heightInput, setHeightInput] = useState<string>(latestHeight.toString());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    const h = heightInput ? parseFloat(heightInput) : undefined;
    if (!isNaN(w) && w > 0) {
      onUpdateMetrics(w, h);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center bg-zinc-900/80 p-1 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Body Metrics
        </button>
        <button
          onClick={() => setActiveSubTab('exercises')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'exercises'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Exercises
        </button>
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          Backup & Data
        </button>
      </div>

      {/* Body Profile Metrics Tab */}
      {activeSubTab === 'profile' && (
        <div className="space-y-5">
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Body Measurements</h2>
            </div>
            
            <form onSubmit={handleSaveMetrics} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-400" />
                  Body Weight ({state.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 75.5"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-indigo-400" />
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="1"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Metrics Updated!
                  </>
                ) : (
                  'Save Body Metrics'
                )}
              </button>
            </form>
          </div>

          {/* Metrics History List */}
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-md space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Weight History Log</h3>
            {state.bodyMetrics.length === 0 ? (
              <p className="text-xs text-zinc-500">No body weight entries recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {state.bodyMetrics.slice().reverse().map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center bg-zinc-950/60 px-3.5 py-2 rounded-xl border border-white/5 text-xs">
                    <span className="text-zinc-400 font-mono">{entry.date}</span>
                    <span className="text-white font-semibold">{entry.weightKg} {state.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exercises Library Tab */}
      {activeSubTab === 'exercises' && (
        <ExercisesView
          customExercises={state.customExercises}
          onOpenCustomExerciseModal={onOpenCustomExerciseModal}
        />
      )}

      {/* Backup & Storage Tab */}
      {activeSubTab === 'backup' && (
        <BackupView
          state={state}
          onRestoreState={onRestoreState}
          onUpdateBackupInfo={onUpdateBackupInfo}
          onInitGoogleAuth={onInitGoogleAuth}
        />
      )}
    </div>
  );
};
