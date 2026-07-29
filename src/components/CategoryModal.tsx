import React, { useState } from 'react';
import { AppState, CategoryDef } from '../types';
import { Plus, X, Check } from 'lucide-react';

interface CategoryModalProps {
  existingCategories: CategoryDef[];
  onSaveCategory: (newCategory: CategoryDef) => void;
  onClose: () => void;
}

// Preset vibrant unique color choices
const PRESET_COLORS = [
  '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', 
  '#10B981', '#F97316', '#EC4899', '#06B6D4',
  '#84CC16', '#6366F1', '#D946EF', '#14B8A6'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  existingCategories,
  onSaveCategory,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  const usedColors = existingCategories.map((c) => c.color.toLowerCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    // Check duplicate color
    if (usedColors.includes(color.toLowerCase())) {
      setErrorMsg('This color is already assigned to another category. Pick a distinct color!');
      return;
    }

    const newCat: CategoryDef = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      color,
    };

    onSaveCategory(newCat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#16161A] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-400" /> Create Category
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="e.g. Cardio, Forearms..."
              className="w-full bg-[#0A0A0C] border border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Select Category Color</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((hex) => {
                const isUsed = usedColors.includes(hex.toLowerCase());
                const isSelected = color.toLowerCase() === hex.toLowerCase();

                return (
                  <button
                    key={hex}
                    type="button"
                    disabled={isUsed}
                    onClick={() => {
                      setColor(hex);
                      setErrorMsg('');
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-all ${
                      isSelected ? 'ring-2 ring-white scale-110' : ''
                    } ${isUsed ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105'}`}
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            Save Category
          </button>
        </form>
      </div>
    </div>
  );
};
