import React, { useState } from 'react';
import { Exercise, ExerciseCategory, MetricType, MuscleGroup } from '../types';
import { Plus, X } from 'lucide-react';

interface CustomExerciseModalProps {
  onSave: (exercise: Exercise) => void;
  onClose: () => void;
}

export const CustomExerciseModal: React.FC<CustomExerciseModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('Strength');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('chest');
  const [equipment, setEquipment] = useState('Dumbbells');
  const [metricType, setMetricType] = useState<MetricType>('weight_reps');
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(90);
  const [instructions, setInstructions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter an exercise name.');
      return;
    }

    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      muscleGroup,
      equipment: equipment || 'None',
      metricType,
      defaultRestSeconds,
      instructions: instructions.trim() || undefined,
      isCustom: true,
    };

    onSave(newExercise);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0C]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#16161A] border border-white/5 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-400" /> Create Custom Exercise
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-400 font-bold mb-1">Exercise Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Incline Cable Flyes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-white rounded-xl px-3 py-2 outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-zinc-400 font-bold mb-1">Target Muscle</label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                className="w-full bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-white rounded-xl px-3 py-2 outline-none"
              >
                <option value="chest">Chest</option>
                <option value="back">Back</option>
                <option value="legs">Legs</option>
                <option value="shoulders">Shoulders</option>
                <option value="arms">Arms</option>
                <option value="core">Core</option>
                <option value="cardio">Cardio</option>
                <option value="full_body">Full Body</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                className="w-full bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-white rounded-xl px-3 py-2 outline-none"
              >
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="Bodyweight">Bodyweight</option>
                <option value="Olympic">Olympic</option>
                <option value="Flexibility">Flexibility</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-zinc-400 font-bold mb-1">Tracking Type</label>
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value as MetricType)}
                className="w-full bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-white rounded-xl px-3 py-2 outline-none"
              >
                <option value="weight_reps">Weight & Reps</option>
                <option value="reps_only">Reps Only</option>
                <option value="distance_time">Distance & Time</option>
                <option value="time_only">Time Only</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1">Rest Timer (Sec)</label>
              <input
                type="number"
                value={defaultRestSeconds}
                onChange={(e) => setDefaultRestSeconds(parseInt(e.target.value) || 60)}
                className="w-full bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-white rounded-xl px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-1">Equipment</label>
            <input
              type="text"
              placeholder="e.g. Barbell, Dumbbell, Resistance Band"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-white rounded-xl px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-1">Instructions / Notes</label>
            <textarea
              placeholder="e.g. Focus on deep stretch at bottom of rep..."
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-[#0A0A0C] border border-white/5 focus:border-indigo-500 text-white rounded-xl px-3 py-2 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            Save Custom Exercise
          </button>
        </form>
      </div>
    </div>
  );
};
