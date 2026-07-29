import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { AppState, TimeFrame, WorkoutSession } from '../types';
import { TrendingUp, Dumbbell, Calendar, Scale, Flame, Award } from 'lucide-react';
import { getAllExercises } from '../lib/storage';

interface AnalyticsViewProps {
  state: AppState;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state }) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('month');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('preset-bench-press');

  const allExercises = getAllExercises(state.customExercises);

  // Filter workouts by timeframe
  const now = new Date();
  const getDaysForTimeframe = (tf: TimeFrame) => {
    if (tf === 'week') return 7;
    if (tf === 'month') return 30;
    return 365;
  };

  const daysLimit = getDaysForTimeframe(timeframe);

  const filteredWorkouts = state.workouts.filter((w) => {
    const workoutDate = new Date(w.date);
    const diffTime = Math.abs(now.getTime() - workoutDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysLimit;
  });

  // Prepare Volume Data over time
  const sortedWorkouts = [...filteredWorkouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const volumeChartData = sortedWorkouts.map((w) => ({
    date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: w.totalVolumeKg,
    calories: w.totalCaloriesBurned,
    duration: w.durationMinutes,
  }));

  // Frequency aggregation
  const frequencyMap: Record<string, number> = {};
  sortedWorkouts.forEach((w) => {
    const key = new Date(w.date).toLocaleDateString('en-US', {
      month: 'short',
      day: timeframe === 'year' ? undefined : 'numeric',
    });
    frequencyMap[key] = (frequencyMap[key] || 0) + 1;
  });

  const frequencyChartData = Object.keys(frequencyMap).map((k) => ({
    period: k,
    workouts: frequencyMap[k],
  }));

  // Muscle Group Breakdown
  const muscleVolumeMap: Record<string, number> = {};
  sortedWorkouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      const muscle = ex.muscleGroup.toUpperCase();
      let exVol = 0;
      ex.sets.forEach((s) => {
        if (s.completed && s.weightKg && s.reps) {
          exVol += s.weightKg * s.reps;
        }
      });
      muscleVolumeMap[muscle] = (muscleVolumeMap[muscle] || 0) + (exVol || 100);
    });
  });

  const muscleChartData = Object.keys(muscleVolumeMap).map((k) => ({
    name: k,
    value: muscleVolumeMap[k],
  }));

  const PIE_COLORS = ['#22c55e', '#06b6d4', '#f97316', '#a855f7', '#ec4899', '#eab308'];

  // 1RM Progression for selected exercise
  const exerciseHistoryData: { date: string; maxWeight: number; est1RM: number }[] = [];
  sortedWorkouts.forEach((w) => {
    const matchEx = w.exercises.find((ex) => ex.exerciseId === selectedExerciseId);
    if (matchEx) {
      let maxWeight = 0;
      let maxEst1RM = 0;
      matchEx.sets.forEach((s) => {
        if (s.completed && s.weightKg) {
          if (s.weightKg > maxWeight) maxWeight = s.weightKg;
          if (s.reps) {
            const e1rm = Math.round(s.weightKg * (1 + s.reps / 30));
            if (e1rm > maxEst1RM) maxEst1RM = e1rm;
          }
        }
      });
      if (maxWeight > 0) {
        exerciseHistoryData.push({
          date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          maxWeight,
          est1RM: maxEst1RM || maxWeight,
        });
      }
    }
  });

  // Body weight chart data
  const bodyWeightChartData = state.bodyMetrics.map((m) => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: m.weightKg,
  }));

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Analytics Header & Timeframe Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Progress Analytics
          </h2>
          <p className="text-xs text-slate-400">Week, month and yearly insights</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {(['week', 'month', 'year'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase transition-all ${
                timeframe === tf
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart 1: Total Volume Progression */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-emerald-400" /> Total Volume Progression ({state.unit})
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredWorkouts.reduce((a, b) => a + b.totalVolumeKg, 0).toLocaleString()} {state.unit} total
          </span>
        </div>

        <div className="h-48 w-full mt-2">
          {volumeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No volume data recorded in this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Exercise Strength & 1RM Tracker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Award className="w-4 h-4 text-cyan-400" /> 1RM Strength Curve
          </h3>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 text-cyan-400 font-bold text-xs rounded-xl px-2.5 py-1 outline-none truncate max-w-[180px]"
          >
            {allExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        <div className="h-44 w-full mt-2">
          {exerciseHistoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exerciseHistoryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="est1RM" name="Est. 1RM" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 4 }} />
                <Line type="monotone" dataKey="maxWeight" name="Max Weight" stroke="#22c55e" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center p-4">
              No recorded logs for this exercise in the selected timeframe.
            </div>
          )}
        </div>
      </div>

      {/* Grid: Muscle Distribution Donut & Workout Frequency Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Muscle Group Split */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            Muscle Focus Split
          </h3>
          <div className="h-40 w-full flex items-center justify-center">
            {muscleChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={muscleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {muscleChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">No muscle distribution data</span>
            )}
          </div>
        </div>

        {/* Workout Frequency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            Session Frequency
          </h3>
          <div className="h-40 w-full">
            {frequencyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Bar dataKey="workouts" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500 flex h-full items-center justify-center">
                No frequency logs
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chart 4: Body Weight Progress */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-emerald-400" /> Body Weight Progression ({state.unit})
        </h3>
        <div className="h-40 w-full">
          {bodyWeightChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyWeightChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No body weight logs added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
