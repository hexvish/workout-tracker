import React, { useState } from 'react';
import { AppState, Exercise, WorkoutSession, WorkoutSet, CategoryDef } from '../types';
import { getAllExercises } from '../lib/storage';
import { ChevronLeft, Plus, History, LineChart, Edit3, Trash2, Check, Dumbbell } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ExerciseDetailViewProps {
  exercise: Exercise;
  categoryColor: string;
  state: AppState;
  onBack: () => void;
  onSaveSetsToSession: (exercise: Exercise, sets: WorkoutSet[]) => void;
}

export const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({
  exercise,
  categoryColor,
  state,
  onBack,
  onSaveSetsToSession,
}) => {
  const [activeTab, setActiveTab] = useState<'input' | 'history' | 'graph'>('input');

  // Find historical sessions containing this exercise
  const exerciseHistory: { date: string; sets: WorkoutSet[]; sessionTitle: string }[] = [];
  state.workouts.forEach((w) => {
    const matchingEx = w.exercises.find((e) => e.exerciseId === exercise.id);
    if (matchingEx && matchingEx.sets.length > 0) {
      exerciseHistory.push({
        date: w.date.split('T')[0],
        sets: matchingEx.sets,
        sessionTitle: w.title,
      });
    }
  });

  // Pre-fill sets from the most recent historical session or defaults
  const latestHistory = exerciseHistory.length > 0 ? exerciseHistory[0] : null;

  const [sets, setSets] = useState<WorkoutSet[]>(() => {
    if (latestHistory && latestHistory.sets.length > 0) {
      return latestHistory.sets.map((s, idx) => ({
        id: `set-${Date.now()}-${idx + 1}`,
        setNumber: idx + 1,
        weightKg: s.weightKg,
        reps: s.reps,
        distanceKm: s.distanceKm,
        durationSeconds: s.durationSeconds,
        completed: false,
      }));
    }
    return [
      {
        id: `set-${Date.now()}-1`,
        setNumber: 1,
        weightKg: exercise.metricType === 'weight_reps' ? 20 : undefined,
        reps: exercise.metricType === 'weight_reps' || exercise.metricType === 'reps_only' ? 10 : undefined,
        durationSeconds: exercise.metricType === 'time_only' ? 60 : undefined,
        completed: false,
      },
    ];
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const newNumber = sets.length + 1;
    setSets((prev) => [
      ...prev,
      {
        id: `set-${Date.now()}-${newNumber}`,
        setNumber: newNumber,
        weightKg: lastSet?.weightKg ?? 20,
        reps: lastSet?.reps ?? 10,
        distanceKm: lastSet?.distanceKm,
        durationSeconds: lastSet?.durationSeconds,
        completed: false,
      },
    ]);
  };

  const removeSet = (index: number) => {
    setSets((prev) => {
      const copy = prev.filter((_, idx) => idx !== index);
      return copy.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    });
  };

  const updateSet = (index: number, field: keyof WorkoutSet, val: any) => {
    setSets((prev) => {
      const copy = [...prev];
      (copy[index] as any)[field] = val;
      return copy;
    });
  };

  const handleSave = () => {
    onSaveSetsToSession(exercise, sets);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onBack();
    }, 1200);
  };

  // Prepare graph data
  const graphData = exerciseHistory
    .slice()
    .reverse()
    .map((item) => {
      const maxWeight = Math.max(...item.sets.map((s) => s.weightKg || 0));
      const totalVol = item.sets.reduce((acc, s) => acc + (s.weightKg || 0) * (s.reps || 0), 0);
      return {
        date: item.date,
        maxWeight,
        totalVol,
      };
    });

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-[#16161A] p-4 rounded-2xl border border-white/5">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-white/5 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColor }} />
          <h2 className="text-base font-bold text-white tracking-tight">{exercise.name}</h2>
        </div>

        <div className="w-9" />
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-[#16161A] p-1 rounded-xl border border-white/5">
        <button
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'input' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" /> Log Sets
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" /> History
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'graph' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" /> Graph
        </button>
      </div>

      {/* TAB 1: Current Set Entry Input */}
      {activeTab === 'input' && (
        <div className="space-y-4">
          {latestHistory && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
              💡 Pre-filled from your last session on <strong>{latestHistory.date}</strong>.
            </div>
          )}

          <div className="bg-[#16161A] border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
              <span className="col-span-2 text-center">Set</span>
              <span className="col-span-4 text-center">{state.unit}</span>
              <span className="col-span-4 text-center">Reps</span>
              <span className="col-span-2 text-center">Del</span>
            </div>

            {sets.map((set, idx) => (
              <div key={set.id} className="grid grid-cols-12 gap-2 items-center bg-[#0A0A0C] p-2 rounded-xl border border-white/5">
                <span className="col-span-2 text-center font-mono font-bold text-xs text-zinc-300">
                  #{set.setNumber}
                </span>

                <div className="col-span-4 flex justify-center">
                  <input
                    type="number"
                    value={set.weightKg ?? ''}
                    onChange={(e) => updateSet(idx, 'weightKg', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 text-center bg-[#16161A] border border-white/5 focus:border-indigo-500 rounded-lg py-1 text-xs font-mono font-bold text-white outline-none"
                  />
                </div>

                <div className="col-span-4 flex justify-center">
                  <input
                    type="number"
                    value={set.reps ?? ''}
                    onChange={(e) => updateSet(idx, 'reps', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 text-center bg-[#16161A] border border-white/5 focus:border-indigo-500 rounded-lg py-1 text-xs font-mono font-bold text-white outline-none"
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <button
                    onClick={() => removeSet(idx)}
                    className="p-1 text-zinc-600 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addSet}
              className="w-full py-2.5 bg-[#0A0A0C] hover:bg-zinc-800 border border-white/5 text-zinc-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" /> Add Set
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-400" /> Saved to Active Session!
              </>
            ) : (
              'Save & Add to Workout'
            )}
          </button>
        </div>
      )}

      {/* TAB 2: Exercise History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {exerciseHistory.length === 0 ? (
            <div className="text-center py-10 bg-[#16161A] border border-dashed border-white/10 rounded-2xl p-6">
              <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400 font-medium">No past logged sessions for this exercise.</p>
            </div>
          ) : (
            exerciseHistory.map((item, idx) => (
              <div key={idx} className="bg-[#16161A] border border-white/5 rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{item.sessionTitle}</span>
                  <span className="text-zinc-400 font-mono text-[11px]">{item.date}</span>
                </div>
                <div className="space-y-1">
                  {item.sets.map((s, sIdx) => (
                    <div key={sIdx} className="flex justify-between text-xs text-zinc-400 font-mono bg-[#0A0A0C] px-3 py-1.5 rounded-lg border border-white/5">
                      <span>Set #{s.setNumber}</span>
                      <span className="text-indigo-300 font-bold">{s.weightKg} {state.unit} × {s.reps} reps</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Progress Graph */}
      {activeTab === 'graph' && (
        <div className="bg-[#16161A] border border-white/5 rounded-2xl p-4 space-y-4">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Max Weight History ({state.unit})</h3>

          {graphData.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">Not enough data to display graph.</p>
          ) : (
            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={graphData}>
                  <XAxis dataKey="date" stroke="#71717A" fontSize={10} />
                  <YAxis stroke="#71717A" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="maxWeight" stroke={categoryColor || '#6366F1'} strokeWidth={3} dot={{ fill: categoryColor || '#6366F1' }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
