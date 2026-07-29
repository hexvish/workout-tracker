import React, { useState } from 'react';
import { Search, Plus, Dumbbell, Info, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { Exercise, MuscleGroup } from '../types';
import { getAllExercises } from '../lib/storage';

interface ExercisesViewProps {
  customExercises: Exercise[];
  onOpenCustomExerciseModal: () => void;
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({
  customExercises,
  onOpenCustomExerciseModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const allExercises = getAllExercises(customExercises);

  const muscleGroups: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'legs', label: 'Legs' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'arms', label: 'Arms' },
    { id: 'core', label: 'Core' },
    { id: 'cardio', label: 'Cardio' },
  ];

  const filteredExercises = allExercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMuscle = selectedMuscle === 'all' || ex.muscleGroup === selectedMuscle;

    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Title & Custom Exercise Launch */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Exercise Library</h2>
          <p className="text-xs text-zinc-400">Presets and custom creations</p>
        </div>
        <button
          onClick={onOpenCustomExerciseModal}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Custom
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search exercise, muscle, equipment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#16161A] border border-white/5 focus:border-indigo-500 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
        />
      </div>

      {/* Muscle Group Filter Chips */}
      <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {muscleGroups.map((m) => {
          const isActive = selectedMuscle === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMuscle(m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                  : 'bg-[#16161A] text-zinc-400 border border-white/5 hover:text-zinc-200'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            onClick={() => setSelectedExercise(ex)}
            className="bg-[#16161A] border border-white/5 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-all shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0C] border border-white/5 flex items-center justify-center text-indigo-400 shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">{ex.name}</h3>
                  {ex.isCustom && (
                    <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  <strong className="text-indigo-400 uppercase">{ex.muscleGroup}</strong> • {ex.equipment}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>
        ))}

        {filteredExercises.length === 0 && (
          <div className="text-center py-12 bg-[#16161A]/40 border border-dashed border-white/5 rounded-2xl p-6">
            <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-300">No exercises found matching search</p>
            <button
              onClick={onOpenCustomExerciseModal}
              className="mt-3 text-xs text-indigo-400 font-bold hover:underline"
            >
              + Create custom exercise "{searchQuery}"
            </button>
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0C]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#16161A] border border-white/5 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  {selectedExercise.category}
                </span>
                <h3 className="text-base font-black text-white mt-2">{selectedExercise.name}</h3>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="bg-[#0A0A0C] p-3 rounded-xl border border-white/5 space-y-1">
                <p>
                  <strong>Primary Muscle:</strong> <span className="text-indigo-400 uppercase font-bold">{selectedExercise.muscleGroup}</span>
                </p>
                {selectedExercise.secondaryMuscles && selectedExercise.secondaryMuscles.length > 0 && (
                  <p>
                    <strong>Secondary Muscles:</strong> {selectedExercise.secondaryMuscles.join(', ')}
                  </p>
                )}
                <p><strong>Equipment:</strong> {selectedExercise.equipment}</p>
                <p><strong>Default Rest:</strong> {selectedExercise.defaultRestSeconds} seconds</p>
              </div>

              {selectedExercise.instructions && (
                <div className="bg-[#0A0A0C] p-3 rounded-xl border border-white/5">
                  <p className="font-bold text-zinc-200 mb-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-indigo-400" /> Instructions:
                  </p>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">{selectedExercise.instructions}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedExercise(null)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
