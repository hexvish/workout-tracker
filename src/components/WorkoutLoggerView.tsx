import React, { useState, useEffect } from 'react';
import { Play, Check, Plus, Trash2, Clock, CheckCircle2, Trophy, Flame, Dumbbell, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, Exercise, WorkoutExercise, WorkoutSession, WorkoutSet } from '../types';
import { getAllExercises } from '../lib/storage';

interface WorkoutLoggerViewProps {
  state: AppState;
  activeTemplateName?: string;
  targetDate?: string;
  onFinishWorkout: (session: WorkoutSession) => void;
  onOpenCustomExerciseModal: () => void;
  onTriggerRestTimer: (seconds: number) => void;
}

export const WorkoutLoggerView: React.FC<WorkoutLoggerViewProps> = ({
  state,
  activeTemplateName,
  targetDate,
  onFinishWorkout,
  onOpenCustomExerciseModal,
  onTriggerRestTimer,
}) => {
  const [workoutTitle, setWorkoutTitle] = useState<string>(activeTemplateName || 'Custom Workout Session');
  const [sessionExercises, setSessionExercises] = useState<WorkoutExercise[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const allExercises = getAllExercises(state.customExercises);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Pre-fill initial exercises if template selected
  useEffect(() => {
    if (sessionExercises.length === 0) {
      if (activeTemplateName?.includes('Upper Body')) {
        const bench = allExercises.find((e) => e.id === 'preset-bench-press');
        const row = allExercises.find((e) => e.id === 'preset-bentover-row');
        if (bench) addExerciseToSession(bench);
        if (row) addExerciseToSession(row);
      } else if (activeTemplateName?.includes('Lower Body')) {
        const squat = allExercises.find((e) => e.id === 'preset-squat');
        const rdl = allExercises.find((e) => e.id === 'preset-romanian-deadlift');
        if (squat) addExerciseToSession(squat);
        if (rdl) addExerciseToSession(rdl);
      }
    }
  }, [activeTemplateName]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addExerciseToSession = (exercise: Exercise) => {
    const newWorkoutEx: WorkoutExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      metricType: exercise.metricType,
      sets: [
        {
          id: `set-${Date.now()}-1`,
          setNumber: 1,
          weightKg: exercise.metricType === 'weight_reps' ? 60 : undefined,
          reps: exercise.metricType === 'weight_reps' || exercise.metricType === 'reps_only' ? 10 : undefined,
          durationSeconds: exercise.metricType === 'time_only' ? 60 : undefined,
          completed: false,
          rpe: 8,
        }
      ],
    };
    setSessionExercises((prev) => [...prev, newWorkoutEx]);
    setShowAddModal(false);
  };

  const addSetToExercise = (exIndex: number) => {
    setSessionExercises((prev) => {
      const copy = [...prev];
      const ex = copy[exIndex];
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNumber = ex.sets.length + 1;
      const newSet: WorkoutSet = {
        id: `set-${Date.now()}-${newSetNumber}`,
        setNumber: newSetNumber,
        weightKg: lastSet ? lastSet.weightKg : 50,
        reps: lastSet ? lastSet.reps : 10,
        distanceKm: lastSet ? lastSet.distanceKm : undefined,
        durationSeconds: lastSet ? lastSet.durationSeconds : undefined,
        completed: false,
        rpe: lastSet ? lastSet.rpe : 8,
      };
      ex.sets.push(newSet);
      return copy;
    });
  };

  const removeSetFromExercise = (exIndex: number, setIndex: number) => {
    setSessionExercises((prev) => {
      const copy = [...prev];
      copy[exIndex].sets.splice(setIndex, 1);
      // Re-number remaining sets
      copy[exIndex].sets.forEach((s, idx) => {
        s.setNumber = idx + 1;
      });
      return copy;
    });
  };

  const removeExerciseFromSession = (exIndex: number) => {
    setSessionExercises((prev) => prev.filter((_, idx) => idx !== exIndex));
  };

  const updateSetField = (exIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    setSessionExercises((prev) => {
      const copy = [...prev];
      const targetSet = copy[exIndex].sets[setIndex];
      (targetSet as any)[field] = value;
      return copy;
    });
  };

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    setSessionExercises((prev) => {
      const copy = [...prev];
      const targetSet = copy[exIndex].sets[setIndex];
      const newlyCompleted = !targetSet.completed;
      targetSet.completed = newlyCompleted;

      // Trigger rest timer on completing a set
      if (newlyCompleted) {
        const matchingEx = allExercises.find((e) => e.id === copy[exIndex].exerciseId);
        const restSecs = matchingEx ? matchingEx.defaultRestSeconds : 90;
        onTriggerRestTimer(restSecs);
      }

      return copy;
    });
  };

  // Compute live workout totals
  let totalVolumeKg = 0;
  let totalSetsCount = 0;
  let completedSetsCount = 0;

  sessionExercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      totalSetsCount++;
      if (s.completed) {
        completedSetsCount++;
        if (s.weightKg && s.reps) {
          totalVolumeKg += s.weightKg * s.reps;
        }
      }
    });
  });

  const estimatedCalories = Math.round(
    (elapsedSeconds / 60) * 7.5 + (totalVolumeKg > 0 ? totalVolumeKg * 0.05 : 0)
  );

  const handleCompleteSession = () => {
    if (sessionExercises.length === 0) {
      alert('Please add at least one exercise to your session before completing.');
      return;
    }

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    const workoutDate = targetDate 
      ? new Date(targetDate + 'T12:00:00').toISOString()
      : new Date().toISOString();

    const completedSession: WorkoutSession = {
      id: `workout-${Date.now()}`,
      title: workoutTitle || 'Workout Session',
      date: workoutDate,
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      totalVolumeKg,
      totalCaloriesBurned: estimatedCalories,
      notes,
      exercises: sessionExercises,
    };

    onFinishWorkout(completedSession);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Top Session Bar */}
      <div className="bg-[#16161A] border border-white/5 rounded-2xl p-4 shadow-lg sticky top-14 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            value={workoutTitle}
            onChange={(e) => setWorkoutTitle(e.target.value)}
            className="text-base font-black text-white bg-transparent border-b border-dashed border-zinc-700 focus:border-indigo-500 outline-none w-full py-0.5"
            placeholder="Workout Title"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-2.5 py-1 rounded-xl bg-[#0A0A0C] border border-white/5 text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {formatTimer(elapsedSeconds)}
            </button>
          </div>
        </div>

        {/* Live Session Counters */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
          <div className="bg-[#0A0A0C] p-2 rounded-xl border border-white/5">
            <p className="text-[10px] text-zinc-500 font-semibold uppercase">Volume</p>
            <p className="font-bold text-indigo-400">{totalVolumeKg.toLocaleString()} {state.unit}</p>
          </div>
          <div className="bg-[#0A0A0C] p-2 rounded-xl border border-white/5">
            <p className="text-[10px] text-zinc-500 font-semibold uppercase">Sets Done</p>
            <p className="font-bold text-zinc-200">{completedSetsCount} / {totalSetsCount}</p>
          </div>
          <div className="bg-[#0A0A0C] p-2 rounded-xl border border-white/5">
            <p className="text-[10px] text-zinc-500 font-semibold uppercase">Est. Calories</p>
            <p className="font-bold text-amber-400">{estimatedCalories} kcal</p>
          </div>
        </div>
      </div>

      {/* Exercises List in Session */}
      <div className="space-y-4">
        {sessionExercises.map((ex, exIndex) => (
          <div key={exIndex} className="bg-[#16161A] border border-white/5 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{ex.exerciseName}</h3>
                  <span className="text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    {ex.muscleGroup}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeExerciseFromSession(exIndex)}
                className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                title="Remove exercise"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Sets Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
                <span className="col-span-2 text-center">Set</span>
                <span className="col-span-4 text-center">
                  {ex.metricType === 'weight_reps' ? `${state.unit}` : ex.metricType === 'distance_time' ? 'Km' : 'Secs'}
                </span>
                <span className="col-span-3 text-center">
                  {ex.metricType === 'weight_reps' || ex.metricType === 'reps_only' ? 'Reps' : 'Mins'}
                </span>
                <span className="col-span-3 text-center">Done</span>
              </div>

              {ex.sets.map((set, setIndex) => {
                // Epley 1RM estimate formula: weight * (1 + reps/30)
                const estimated1RM = set.weightKg && set.reps ? Math.round(set.weightKg * (1 + set.reps / 30)) : null;

                return (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl transition-colors border ${
                      set.completed
                        ? 'bg-indigo-950/40 border-indigo-500/30'
                        : 'bg-[#0A0A0C] border-white/5'
                    }`}
                  >
                    <span className="col-span-2 text-center font-mono font-bold text-xs text-zinc-300">
                      #{set.setNumber}
                    </span>

                    {/* Weight / Main Metric Input */}
                    <div className="col-span-4 flex items-center justify-center">
                      <input
                        type="number"
                        value={set.weightKg ?? set.distanceKm ?? set.durationSeconds ?? ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (ex.metricType === 'weight_reps') updateSetField(exIndex, setIndex, 'weightKg', val);
                          else if (ex.metricType === 'distance_time') updateSetField(exIndex, setIndex, 'distanceKm', val);
                          else updateSetField(exIndex, setIndex, 'durationSeconds', val);
                        }}
                        placeholder="0"
                        className="w-16 text-center bg-[#16161A] border border-white/5 focus:border-indigo-500 rounded-lg py-1 text-xs font-mono font-bold text-white outline-none"
                      />
                    </div>

                    {/* Reps / Secondary Metric Input */}
                    <div className="col-span-3 flex items-center justify-center">
                      <input
                        type="number"
                        value={set.reps ?? ''}
                        onChange={(e) => updateSetField(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-14 text-center bg-[#16161A] border border-white/5 focus:border-indigo-500 rounded-lg py-1 text-xs font-mono font-bold text-white outline-none"
                      />
                    </div>

                    {/* Checkbox Complete */}
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      <button
                        onClick={() => toggleSetComplete(exIndex, setIndex)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          set.completed
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                            : 'bg-[#16161A] text-zinc-500 border border-white/5 hover:border-zinc-700'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      <button
                        onClick={() => removeSetFromExercise(exIndex, setIndex)}
                        className="p-1 text-zinc-600 hover:text-red-400"
                        title="Delete set"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Estimated 1RM Tag */}
                    {estimated1RM && set.completed && (
                      <div className="col-span-12 text-[10px] text-indigo-400 font-mono font-semibold text-right px-1 pt-0.5">
                        ⚡ Est. 1RM: {estimated1RM} {state.unit}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => addSetToExercise(exIndex)}
              className="w-full mt-3 py-2 bg-[#0A0A0C] hover:bg-zinc-800/80 border border-white/5 text-zinc-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" /> Add Set
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 bg-[#16161A] hover:bg-zinc-800/80 border border-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Plus className="w-4 h-4 text-indigo-400" /> Add Exercise to Session
        </button>

        {/* Workout Session Notes */}
        <div className="bg-[#16161A] border border-white/5 rounded-2xl p-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add session notes (e.g. felt strong, increased grip width...)"
            rows={2}
            className="w-full bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-zinc-200 text-xs rounded-xl p-2.5 outline-none resize-none"
          />
        </div>

        {/* Finish Workout Primary Button */}
        <button
          onClick={handleCompleteSession}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-98 transition-all"
        >
          <Trophy className="w-5 h-5 fill-white" /> Complete Workout Session
        </button>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0C]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-[#16161A] border border-white/5 rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Exercise</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-200"
              >
                Close
              </button>
            </div>

            <div className="p-3 border-b border-white/5">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  onOpenCustomExerciseModal();
                }}
                className="w-full py-2 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Create Custom Exercise
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 divide-y divide-white/5">
              {allExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => addExerciseToSession(ex)}
                  className="pt-2 cursor-pointer hover:bg-zinc-800/60 p-2.5 rounded-xl transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{ex.name}</p>
                    <p className="text-[10px] text-zinc-400">
                      {ex.category} • <span className="uppercase text-indigo-400">{ex.muscleGroup}</span>
                      {ex.isCustom ? ' • Custom' : ''}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-indigo-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
