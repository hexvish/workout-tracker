import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Flame, Dumbbell, Plus, Trash2 } from 'lucide-react';
import { AppState, WorkoutSession } from '../types';

interface CalendarModalProps {
  state: AppState;
  onClose: () => void;
  onSelectDateWorkout?: (dateStr: string) => void;
  onStartWorkoutForDate: (dateStr: string) => void;
  onDeleteWorkout?: (workoutId: string) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  state,
  onClose,
  onStartWorkoutForDate,
  onDeleteWorkout,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  // Format month name and year
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calendar math
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create dates grid
  const days = [];
  // Padding for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      dayNum: i,
      dateStr: formattedDate,
    });
  }

  // Workouts mapped by date string (YYYY-MM-DD)
  const workoutsByDate: Record<string, WorkoutSession[]> = {};
  state.workouts.forEach((w) => {
    const dateOnly = w.date.split('T')[0];
    if (!workoutsByDate[dateOnly]) {
      workoutsByDate[dateOnly] = [];
    }
    workoutsByDate[dateOnly].push(w);
  });

  const selectedWorkouts = workoutsByDate[selectedDateStr] || [];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111114] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#16161A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Workout Calendar</h3>
              <p className="text-[11px] text-zinc-400">View history & log past workouts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Calendar Month Selector */}
          <div className="flex items-center justify-between bg-[#16161A] p-2.5 rounded-2xl border border-white/5">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-zinc-100 tracking-wide">{monthName}</span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-10" />;
              }

              const hasWorkouts = Boolean(workoutsByDate[item.dateStr]?.length);
              const isSelected = item.dateStr === selectedDateStr;
              const isToday = item.dateStr === todayStr;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDateStr(item.dateStr)}
                  className={`h-10 rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-semibold ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105 z-10 ring-2 ring-indigo-400'
                      : isToday
                      ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40'
                      : 'bg-[#16161A] text-zinc-300 hover:bg-zinc-800/80 border border-white/5'
                  }`}
                >
                  <span>{item.dayNum}</span>
                  {hasWorkouts && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Workouts Section */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {selectedDateStr === todayStr
                  ? "Today's Log"
                  : new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
              </h4>
              <button
                onClick={() => {
                  onStartWorkoutForDate(selectedDateStr);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Session</span>
              </button>
            </div>

            {selectedWorkouts.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#16161A] border border-dashed border-white/10 text-center">
                <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400 font-medium">No workout recorded for this date</p>
                <button
                  onClick={() => {
                    onStartWorkoutForDate(selectedDateStr);
                    onClose();
                  }}
                  className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Start or add a workout for this date
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedWorkouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-2xl bg-[#16161A] border border-white/5 hover:border-indigo-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{w.title}</p>
                          <p className="text-[10px] text-zinc-400">
                            {w.exercises.length} exercises logged
                          </p>
                        </div>
                      </div>

                      {onDeleteWorkout && (
                        <button
                          onClick={() => onDeleteWorkout(w.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {w.durationMinutes} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        {w.totalCaloriesBurned} kcal
                      </span>
                      <span className="font-semibold text-indigo-300">
                        {w.totalVolumeKg} kg vol
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
