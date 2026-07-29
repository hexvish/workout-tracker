import React from 'react';
import { Play, Flame, Activity, Trophy, Dumbbell, Scale, Ruler, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AppState, WorkoutSession, BodyPartCategory, BODY_PART_COLORS } from '../types';

interface DashboardViewProps {
  state: AppState;
  onStartWorkout: (templateName?: string) => void;
  onSelectTab: (tab: any) => void;
  onLogBodyWeight: (weight: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onStartWorkout,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Workouts logged today
  const todayWorkouts = state.workouts.filter(
    (w) => w.date.split('T')[0] === todayStr
  );

  // Weekly workouts
  const thisWeekWorkouts = state.workouts.filter((w) => {
    const diffDays = (new Date().getTime() - new Date(w.date).getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  });

  const thisWeekVolumeKg = thisWeekWorkouts.reduce((acc, w) => acc + w.totalVolumeKg, 0);
  const thisWeekCalories = thisWeekWorkouts.reduce((acc, w) => acc + w.totalCaloriesBurned, 0);

  // Find most trophied exercise performed today
  // A PR occurs if today's set weight/reps exceeds any recorded prior set for that exercise
  let topTrophyInfo: { exerciseName: string; weightGain: number; repsGain: number } | null = null;

  if (todayWorkouts.length > 0) {
    const priorWorkouts = state.workouts.filter((w) => w.date.split('T')[0] !== todayStr);

    todayWorkouts.forEach((session) => {
      session.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.completed && set.weightKg && set.reps) {
            // Find max weight logged prior for this exercise
            let maxPriorWeight = 0;
            let maxPriorRepsAtWeight = 0;

            priorWorkouts.forEach((pw) => {
              pw.exercises.forEach((pex) => {
                if (pex.exerciseId === ex.exerciseId) {
                  pex.sets.forEach((pset) => {
                    if (pset.completed && pset.weightKg) {
                      if (pset.weightKg > maxPriorWeight) {
                        maxPriorWeight = pset.weightKg;
                      }
                      if (pset.weightKg === set.weightKg && (pset.reps || 0) > maxPriorRepsAtWeight) {
                        maxPriorRepsAtWeight = pset.reps || 0;
                      }
                    }
                  });
                }
              });
            });

            const weightGain = maxPriorWeight > 0 && set.weightKg > maxPriorWeight ? set.weightKg - maxPriorWeight : 0;
            const repsGain = set.reps > maxPriorRepsAtWeight && maxPriorRepsAtWeight > 0 ? set.reps - maxPriorRepsAtWeight : 0;

            if (weightGain > 0 || repsGain > 0) {
              if (!topTrophyInfo || weightGain > topTrophyInfo.weightGain) {
                topTrophyInfo = {
                  exerciseName: ex.exerciseName,
                  weightGain,
                  repsGain,
                };
              }
            }
          }
        });
      });
    });
  }

  // Calculate body part workout distribution over the past 7 days for the Pie Chart
  const categoryCounts: Record<string, number> = {};
  thisWeekWorkouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      const group = ex.muscleGroup;
      categoryCounts[group] = (categoryCounts[group] || 0) + ex.sets.length;
    });
  });

  const pieData = Object.entries(categoryCounts).map(([catName, count]) => {
    const catDef = state.categories.find(
      (c) => c.name.toLowerCase() === catName.toLowerCase()
    );
    return {
      name: catName,
      value: count,
      color: catDef ? catDef.color : '#3B82F6',
    };
  });

  const latestWeight = state.bodyMetrics.length > 0 ? state.bodyMetrics[state.bodyMetrics.length - 1].weightKg : null;
  const userHeight = state.userProfile?.heightCm || null;

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Today's Session Highlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-[#16161A] to-[#111114] border border-indigo-500/30 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> Today (
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {todayWorkouts.length > 0 ? todayWorkouts[0].title : "Today's Session"}
            </h2>
          </div>

          <button
            onClick={() => onStartWorkout()}
            className="group flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            title="Start Session"
          >
            <Play className="w-7 h-7 fill-white translate-x-0.5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Most Trophied Highlight Badge */}
        {topTrophyInfo ? (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Top Trophy PR Achievement!
              </p>
              <p className="text-xs text-zinc-200 mt-0.5 font-medium">
                {topTrophyInfo.exerciseName}
                {topTrophyInfo.weightGain > 0 ? ` +${topTrophyInfo.weightGain} ${state.unit}` : ''}
                {topTrophyInfo.repsGain > 0 ? ` +${topTrophyInfo.repsGain} reps` : ''} vs past records!
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-2xl bg-zinc-950/60 border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span className="text-zinc-400">Body Weight: <strong className="text-white">{latestWeight ? `${latestWeight} ${state.unit}` : 'Not set'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-400" />
              <span className="text-zinc-400">Height: <strong className="text-white">{userHeight ? `${userHeight} cm` : 'Not set'}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Stats Summary Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#16161A] border border-white/5 rounded-2xl p-3 text-center shadow-sm">
          <div className="w-8 h-8 mx-auto rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-1.5">
            <Trophy className="w-4 h-4" />
          </div>
          <p className="text-lg font-black text-white">{thisWeekWorkouts.length}</p>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Weekly Workouts</p>
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

      {/* Weekly Workouts Pie Chart Distribution */}
      <div className="bg-[#16161A] border border-white/5 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
          Weekly Muscle Group Breakdown
        </h3>

        {pieData.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500">
            No workouts logged this week to display breakdown.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-xl border border-white/5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-zinc-300 font-semibold">{d.name}:</span>
                  <span className="text-white font-bold">{d.value} sets</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

