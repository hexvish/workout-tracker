import React, { useState } from 'react';
import { Play, Plus, Flame, Activity, Trophy, Calendar, Dumbbell, ChevronRight, Scale, CheckCircle2 } from 'lucide-react';
import { AppState, WorkoutSession } from '../types';

interface DashboardViewProps {
  state: AppState;
  onStartWorkout: (templateName?: string) => void;
  onSelectTab: (tab: any) => void;
  onLogBodyWeight: (weight: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onStartWorkout,
  onSelectTab,
  onLogBodyWeight,
}) => {
  const [weightInput, setWeightInput] = useState<string>('');
  const [loggedWeightMsg, setLoggedWeightMsg] = useState<boolean>(false);

  // Calculate quick stats
  const totalWorkouts = state.workouts.length;
  const thisWeekWorkouts = state.workouts.filter((w) => {
    const diffDays = (new Date().getTime() - new Date(w.date).getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  const thisWeekVolumeKg = thisWeekWorkouts.reduce((acc, w) => acc + w.totalVolumeKg, 0);
  const thisWeekCalories = thisWeekWorkouts.reduce((acc, w) => acc + w.totalCaloriesBurned, 0);

  const latestWeight = state.bodyMetrics.length > 0 ? state.bodyMetrics[state.bodyMetrics.length - 1] : null;

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0) {
      onLogBodyWeight(val);
      setWeightInput('');
      setLoggedWeightMsg(true);
      setTimeout(() => setLoggedWeightMsg(false), 3000);
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Quick Start Workout Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/60 via-[#16161A] to-[#111114] border border-indigo-500/30 p-5 shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> Today (
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Today's Session</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">
              {thisWeekWorkouts.length > 0
                ? `${thisWeekWorkouts.length} sessions completed this week`
                : 'Start logging set by set with smart rest timer'}
            </p>
          </div>
          <button
            onClick={() => onStartWorkout()}
            className="group flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            title="Start Empty Session"
          >
            <Play className="w-7 h-7 fill-white translate-x-0.5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Preset Quick Workouts */}
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onStartWorkout('Upper Body Power')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A0A0C] hover:bg-zinc-800/80 border border-white/5 text-left transition-all"
          >
            <Dumbbell className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-200 truncate">Upper Body</p>
              <p className="text-[10px] text-zinc-500">Chest, Back & Arms</p>
            </div>
          </button>
          <button
            onClick={() => onStartWorkout('Lower Body Strength')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A0A0C] hover:bg-zinc-800/80 border border-white/5 text-left transition-all"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-200 truncate">Lower Body</p>
              <p className="text-[10px] text-zinc-500">Squats & Deadlifts</p>
            </div>
          </button>
        </div>
      </div>

      {/* Weekly Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#16161A] border border-white/5 rounded-2xl p-3 text-center shadow-sm">
          <div className="w-8 h-8 mx-auto rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-1.5">
            <Trophy className="w-4 h-4" />
          </div>
          <p className="text-lg font-black text-white">{thisWeekWorkouts.length}</p>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Workouts</p>
        </div>

        <div className="bg-[#16161A] border border-white/5 rounded-2xl p-3 text-center shadow-sm">
          <div className="w-8 h-8 mx-auto rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-1.5">
            <Dumbbell className="w-4 h-4" />
          </div>
          <p className="text-lg font-black text-white">
            {thisWeekVolumeKg >= 1000 ? `${(thisWeekVolumeKg / 1000).toFixed(1)}k` : thisWeekVolumeKg}
          </p>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{state.unit} Volume</p>
        </div>

        <div className="bg-[#16161A] border border-white/5 rounded-2xl p-3 text-center shadow-sm">
          <div className="w-8 h-8 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-1.5">
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-lg font-black text-white">{thisWeekCalories}</p>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">KCal Burned</p>
        </div>
      </div>

      {/* Body Weight Logging Card */}
      <div className="bg-[#16161A] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Body Weight Log</h3>
          </div>
          {latestWeight && (
            <span className="text-xs font-semibold text-zinc-300">
              Current: <strong className="text-indigo-400">{latestWeight.weightKg} {state.unit}</strong> ({latestWeight.date})
            </span>
          )}
        </div>

        <form onSubmit={handleWeightSubmit} className="flex gap-2">
          <input
            type="number"
            step="0.1"
            placeholder={`Log weight (${state.unit})`}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="flex-1 bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-white rounded-xl px-3 py-2 text-xs outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Log
          </button>
        </form>
        {loggedWeightMsg && (
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Body weight logged successfully!
          </p>
        )}
      </div>

      {/* Recent Activity Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Recent Workouts
          </h3>
          <button
            onClick={() => onSelectTab('analytics')}
            className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            View Graphs <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {state.workouts.length === 0 ? (
          <div className="text-center py-8 bg-[#16161A]/50 border border-dashed border-white/5 rounded-2xl p-6">
            <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No logged workouts yet</p>
            <p className="text-xs text-zinc-500 mt-1">Tap the Play button above to start your first session!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.workouts.slice(0, 4).map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} unit={state.unit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface WorkoutCardProps {
  workout: WorkoutSession;
  unit: string;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, unit }) => {
  const [expanded, setExpanded] = useState(false);
  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-[#16161A] border border-white/5 rounded-2xl p-4 shadow-sm hover:border-zinc-700 transition-all">
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">{workout.title}</h4>
            <span className="text-[10px] text-zinc-400 bg-[#0A0A0C] border border-white/5 px-2 py-0.5 rounded-full font-medium">
              {formattedDate}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5 font-medium">
            <span>⏱️ {workout.durationMinutes} mins</span>
            {workout.totalVolumeKg > 0 && <span>🏋️ {workout.totalVolumeKg.toLocaleString()} {unit}</span>}
            {workout.totalCaloriesBurned > 0 && <span>🔥 {workout.totalCaloriesBurned} kcal</span>}
          </div>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-zinc-500 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
      </div>

      {/* Exercises Chips */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {workout.exercises.map((ex, idx) => (
          <span
            key={idx}
            className="text-[11px] bg-[#0A0A0C] text-zinc-300 border border-white/5 px-2 py-0.5 rounded-lg"
          >
            {ex.exerciseName} ({ex.sets.length} sets)
          </span>
        ))}
      </div>

      {/* Expanded sets details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
          {workout.exercises.map((ex, idx) => (
            <div key={idx} className="bg-[#0A0A0C] p-2.5 rounded-xl border border-white/5 text-xs">
              <p className="font-bold text-indigo-400">{ex.exerciseName}</p>
              <div className="mt-1 space-y-1">
                {ex.sets.map((s) => (
                  <div key={s.id} className="flex justify-between text-zinc-400 font-mono text-[11px]">
                    <span>Set {s.setNumber}:</span>
                    <span>
                      {s.weightKg ? `${s.weightKg} ${unit} × ` : ''}
                      {s.reps ? `${s.reps} reps` : ''}
                      {s.distanceKm ? `${s.distanceKm} km` : ''}
                      {s.durationSeconds ? ` ${Math.floor(s.durationSeconds / 60)}m ${s.durationSeconds % 60}s` : ''}
                      {s.rpe ? ` (RPE ${s.rpe})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {workout.notes && <p className="text-xs text-zinc-400 italic">"{workout.notes}"</p>}
        </div>
      )}
    </div>
  );
};
