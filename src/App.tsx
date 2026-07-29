/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, Exercise, WorkoutSession, BodyWeightEntry } from './types';
import { loadAppState, saveAppState } from './lib/storage';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { WorkoutLoggerView } from './components/WorkoutLoggerView';
import { ExercisesView } from './components/ExercisesView';
import { AnalyticsView } from './components/AnalyticsView';
import { BackupView } from './components/BackupView';
import { CustomExerciseModal } from './components/CustomExerciseModal';
import { RestTimerOverlay } from './components/RestTimerOverlay';
import { CalendarModal } from './components/CalendarModal';

export default function App() {
  const [state, setState] = useState<AppState>(loadAppState);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeTemplateName, setActiveTemplateName] = useState<string | undefined>(undefined);
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);

  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [targetLogDate, setTargetLogDate] = useState<string | undefined>(undefined);

  // Sync state to localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Dark mode class on body element
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#0A0A0C';
  }, [state.isDarkMode]);

  // Dark Mode Toggle
  const handleToggleDarkMode = () => {
    setState((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  // Unit Switcher Toggle (kg vs lbs)
  const handleToggleUnit = () => {
    setState((prev) => ({ ...prev, unit: prev.unit === 'kg' ? 'lbs' : 'kg' }));
  };

  // Start Workout
  const handleStartWorkout = (templateName?: string) => {
    setTargetLogDate(undefined);
    setActiveTemplateName(templateName);
    setIsWorkoutActive(true);
    setActiveTab('logger');
  };

  // Start Workout for a Specific Target Date (via Calendar)
  const handleStartWorkoutForDate = (dateStr: string) => {
    setTargetLogDate(dateStr);
    setActiveTemplateName('Historical Workout');
    setIsWorkoutActive(true);
    setActiveTab('logger');
  };

  // Delete Workout Session
  const handleDeleteWorkout = (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout session?')) {
      setState((prev) => ({
        ...prev,
        workouts: prev.workouts.filter((w) => w.id !== workoutId),
      }));
    }
  };

  // Complete Workout Session
  const handleFinishWorkout = (session: WorkoutSession) => {
    setState((prev) => ({
      ...prev,
      workouts: [session, ...prev.workouts],
    }));
    setIsWorkoutActive(false);
    setActiveTemplateName(undefined);
    setTargetLogDate(undefined);
    setActiveTab('dashboard');
  };

  // Save Custom Exercise
  const handleSaveCustomExercise = (newEx: Exercise) => {
    setState((prev) => ({
      ...prev,
      customExercises: [...prev.customExercises, newEx],
    }));
    setShowCustomModal(false);
  };

  // Log Body Weight
  const handleLogBodyWeight = (weightKg: number) => {
    const newMetric: BodyWeightEntry = {
      id: `bw-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg,
    };
    setState((prev) => ({
      ...prev,
      bodyMetrics: [...prev.bodyMetrics, newMetric],
    }));
  };

  // Restore State from Drive or Local File
  const handleRestoreState = (newState: Partial<AppState>) => {
    setState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  // Update Backup Info metadata
  const handleUpdateBackupInfo = (info: { lastBackupDate: string; fileName: string }) => {
    setState((prev) => ({
      ...prev,
      backupInfo: {
        lastBackupDate: info.lastBackupDate,
        fileName: info.fileName,
      },
    }));
  };

  // Trigger Google Auth Setup
  const handleInitGoogleAuth = () => {
    setActiveTab('backup');
  };

  return (
    <div className="min-h-screen text-[#E4E4E7] bg-[#0A0A0C] font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <HeaderBar
        state={state}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleUnit={handleToggleUnit}
        onOpenBackup={() => setActiveTab('backup')}
        onOpenCalendar={() => setShowCalendarModal(true)}
      />

      {/* Main Screen Frame */}
      <main className="max-w-md mx-auto px-4 pt-4">
        {activeTab === 'dashboard' && (
          <DashboardView
            state={state}
            onStartWorkout={handleStartWorkout}
            onSelectTab={setActiveTab}
            onLogBodyWeight={handleLogBodyWeight}
          />
        )}

        {activeTab === 'logger' && (
          <WorkoutLoggerView
            state={state}
            activeTemplateName={activeTemplateName}
            targetDate={targetLogDate}
            onFinishWorkout={handleFinishWorkout}
            onOpenCustomExerciseModal={() => setShowCustomModal(true)}
            onTriggerRestTimer={(secs) => setRestTimerSeconds(secs)}
          />
        )}

        {activeTab === 'exercises' && (
          <ExercisesView
            customExercises={state.customExercises}
            onOpenCustomExerciseModal={() => setShowCustomModal(true)}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView state={state} />}

        {activeTab === 'backup' && (
          <BackupView
            state={state}
            onRestoreState={handleRestoreState}
            onUpdateBackupInfo={handleUpdateBackupInfo}
            onInitGoogleAuth={handleInitGoogleAuth}
          />
        )}
      </main>

      {/* Floating Rest Timer Countdown Overlay */}
      {restTimerSeconds !== null && (
        <RestTimerOverlay
          initialSeconds={restTimerSeconds}
          onFinish={() => setRestTimerSeconds(null)}
        />
      )}

      {/* Custom Exercise Modal */}
      {showCustomModal && (
        <CustomExerciseModal
          onSave={handleSaveCustomExercise}
          onClose={() => setShowCustomModal(false)}
        />
      )}

      {/* Calendar History & Log Modal */}
      {showCalendarModal && (
        <CalendarModal
          state={state}
          onClose={() => setShowCalendarModal(false)}
          onStartWorkoutForDate={handleStartWorkoutForDate}
          onDeleteWorkout={handleDeleteWorkout}
        />
      )}

      {/* Bottom Android Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isWorkoutActive={isWorkoutActive}
      />
    </div>
  );
}
