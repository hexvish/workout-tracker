import React, { useState, useEffect } from 'react';
import { Play, Check, Plus, Trash2, Clock, Trophy, Dumbbell, Timer, ChevronRight, Pause } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, Exercise, WorkoutExercise, WorkoutSession, WorkoutSet, CategoryDef } from '../types';
import { getAllExercises } from '../lib/storage';
import { ExerciseDetailView } from './ExerciseDetailView';
import { CategoryModal } from './CategoryModal';

interface WorkoutLoggerViewProps {
  state: AppState;
  activeTemplateName?: string;
  targetDate?: string;
  onFinishWorkout: (session: WorkoutSession) => void;
  onOpenCustomExerciseModal: () => void;
  onTriggerRestTimer: (seconds: number) => void;
  onAddCategory: (category: CategoryDef) => void;
}

export const WorkoutLoggerView: React.FC<WorkoutLoggerViewProps> = ({
  state,
  activeTemplateName,
  targetDate,
  onFinishWorkout,
  onOpenCustomExerciseModal,
  onTriggerRestTimer,
  onAddCategory,
}) => {
  const [workoutTitle, setWorkoutTitle] = useState<string>(activeTemplateName || 'Workout Session');
  const [sessionExercises, setSessionExercises] = useState<WorkoutExercise[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false); // Manual timer (defaults to paused)
  
  // Navigation states inside Workout tab: 'session' | 'categories' | 'exercise_list' | 'exercise_detail'
  const [viewMode, setViewMode] = useState<'session' | 'categories' | 'exercise_list' | 'exercise_detail'>('session');
  const [selectedCategory, setSelectedCategory] = useState<CategoryDef | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);

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

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveExerciseSetsToSession = (exercise: Exercise, sets: WorkoutSet[]) => {
    setSessionExercises((prev) => {
      const existingIdx = prev.findIndex((e) => e.exerciseId === exercise.id);
      const newEx: WorkoutExercise = {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        metricType: exercise.metricType,
        sets,
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newEx;
        return copy;
      }
      return [...prev, newEx];
    });

    setViewMode('session');
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
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        distanceKm: lastSet ? lastSet.distanceKm : undefined,
        durationSeconds: lastSet ? lastSet.durationSeconds : undefined,
        completed: false,
      };
      ex.sets.push(newSet);
      return copy;
    });
  };

  const removeSetFromExercise = (exIndex: number, setIndex: number) => {
    setSessionExercises((prev) => {
      const copy = [...prev];
      copy[exIndex].sets.splice(setIndex, 1);
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
      targetSet.completed = !targetSet.completed;
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

  // Category Exercises Filter
  const categoryExercises = selectedCategory
    ? allExercises.filter(
        (e) => e.muscleGroup.toLowerCase() === selectedCategory.name.toLowerCase()
      )
    : [];

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* VIEW MODE: Exercise Detail Page */}
      {viewMode === 'exercise_detail' && selectedExercise && (
        <ExerciseDetailView
          exercise={selectedExercise}
          categoryColor={selectedCategory?.color || '#3B82F6'}
          state={state}
          onBack={() => setViewMode('exercise_list')}
          onSaveSetsToSession={handleSaveExerciseSetsToSession}
        />
      )}

      {/* VIEW MODE: Category Exercise List */}
      {viewMode === 'exercise_list' && selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#16161A] p-4 rounded-2xl border border-white/5">
            <button
              onClick={() => setViewMode('categories')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0A0A0C] text-zinc-300 border border-white/5 hover:bg-zinc-800"
            >
              ← Back to Categories
            </button>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
              <h2 className="text-base font-bold text-white">{selectedCategory.name} Workouts</h2>
            </div>
          </div>

          <div className="space-y-2">
            {categoryExercises.length === 0 ? (
              <div className="p-8 text-center bg-[#16161A] border border-dashed border-white/10 rounded-2xl">
                <p className="text-xs text-zinc-400">No exercises registered under {selectedCategory.name} yet.</p>
              </div>
            ) : (
              categoryExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => {
                    setSelectedExercise(ex);
                    setViewMode('exercise_detail');
                  }}
                  className="p-4 bg-[#16161A] hover:bg-zinc-800/80 border border-white/5 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">{ex.name}</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{ex.category} • {ex.equipment}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              ))
            )}

            <button
              onClick={onOpenCustomExerciseModal}
              className="w-full py-3 mt-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Custom Exercise to {selectedCategory.name}
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE: Category Navigation Grid */}
      {viewMode === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#16161A] p-4 rounded-2xl border border-white/5">
            <button
              onClick={() => setViewMode('session')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0A0A0C] text-zinc-300 border border-white/5 hover:bg-zinc-800"
            >
              ← Back to Active Session
            </button>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Select Category</h2>
          </div>

          {/* Preset & Custom Category Grid */}
          <div className="grid grid-cols-2 gap-3">
            {state.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setViewMode('exercise_list');
                }}
                className="p-4 rounded-2xl bg-[#16161A] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between h-28 text-left group"
              >
                <div className="flex justify-between items-start">
                  <span className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: cat.color }} />
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{cat.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {allExercises.filter((e) => e.muscleGroup.toLowerCase() === cat.name.toLowerCase()).length} workouts
                  </p>
                </div>
              </button>
            ))}

            {/* Create Custom Category Card */}
            <button
              onClick={() => setShowCategoryModal(true)}
              className="p-4 rounded-2xl bg-indigo-600/10 border border-dashed border-indigo-500/40 hover:bg-indigo-600/20 transition-all flex flex-col items-center justify-center h-28 text-indigo-300 font-bold text-xs gap-1.5"
            >
              <Plus className="w-6 h-6 text-indigo-400" />
              <span>Add Custom Category</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE: Active Session Logger */}
      {viewMode === 'session' && (
        <>
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
                {/* Manual Timer Toggle */}
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-3 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                    isTimerRunning
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-[#0A0A0C] text-zinc-400 border-white/5 hover:text-white'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5 text-indigo-400" /> : <Play className="w-3.5 h-3.5 text-zinc-400" />}
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

          {/* Blank Initial State Notice */}
          {sessionExercises.length === 0 && (
            <div className="p-8 rounded-3xl bg-[#16161A] border border-dashed border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Empty Workout Session</h3>
                <p className="text-xs text-zinc-400 mt-1">Tap below to choose exercises via Category Navigation.</p>
              </div>
            </div>
          )}

          {/* Exercises List in Session */}
          <div className="space-y-4">
            {sessionExercises.map((ex, exIndex) => {
              const catDef = state.categories.find((c) => c.name.toLowerCase() === ex.muscleGroup.toLowerCase());
              const catColor = catDef ? catDef.color : '#3B82F6';

              return (
                <div key={exIndex} className="bg-[#16161A] border border-white/5 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: catColor }} />
                      <h3 className="text-sm font-bold text-white">{ex.exerciseName}</h3>
                      <span className="text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                        {ex.muscleGroup}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onTriggerRestTimer(90)}
                        className="p-1.5 text-indigo-400 hover:text-indigo-300 rounded-lg hover:bg-indigo-500/10 transition-colors flex items-center gap-1 text-[10px] font-semibold"
                        title="Start Rest Timer"
                      >
                        <Timer className="w-4 h-4" />
                        Timer
                      </button>
                      <button
                        onClick={() => removeExerciseFromSession(exIndex)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remove exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
                      <span className="col-span-2 text-center">Set</span>
                      <span className="col-span-4 text-center">{state.unit}</span>
                      <span className="col-span-3 text-center">Reps</span>
                      <span className="col-span-3 text-center">Done</span>
                    </div>

                    {ex.sets.map((set, setIndex) => (
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

                        <div className="col-span-4 flex items-center justify-center">
                          <input
                            type="number"
                            value={set.weightKg ?? ''}
                            onChange={(e) => updateSetField(exIndex, setIndex, 'weightKg', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-16 text-center bg-[#16161A] border border-white/5 focus:border-indigo-500 rounded-lg py-1 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>

                        <div className="col-span-3 flex items-center justify-center">
                          <input
                            type="number"
                            value={set.reps ?? ''}
                            onChange={(e) => updateSetField(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-14 text-center bg-[#16161A] border border-white/5 focus:border-indigo-500 rounded-lg py-1 text-xs font-mono font-bold text-white outline-none"
                          />
                        </div>

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
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSetToExercise(exIndex)}
                    className="w-full mt-3 py-2 bg-[#0A0A0C] hover:bg-zinc-800/80 border border-white/5 text-zinc-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" /> Add Set
                  </button>
                </div>
              );
            })}
          </div>

          {/* Navigation to Category Mode */}
          <div className="space-y-2">
            <button
              onClick={() => setViewMode('categories')}
              className="w-full py-3.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-indigo-400" /> Add Exercise by Category
            </button>

            <div className="bg-[#16161A] border border-white/5 rounded-2xl p-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add session notes..."
                rows={2}
                className="w-full bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-zinc-200 text-xs rounded-xl p-2.5 outline-none resize-none"
              />
            </div>

            <button
              onClick={handleCompleteSession}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-98 transition-all"
            >
              <Trophy className="w-5 h-5 fill-white" /> Complete Workout Session
            </button>
          </div>
        </>
      )}

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <CategoryModal
          existingCategories={state.categories}
          onSaveCategory={onAddCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
};


