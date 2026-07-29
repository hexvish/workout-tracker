import { AppState, WorkoutSession, Exercise, BodyWeightEntry, DEFAULT_CATEGORIES } from '../types';
import { PRESET_EXERCISES } from '../data/presetExercises';
import { INITIAL_WORKOUTS, INITIAL_BODY_METRICS } from '../data/mockHistory';

const STORAGE_KEY = 'workout_tracker_app_state_v1';

export const getDefaultState = (): AppState => ({
  workouts: INITIAL_WORKOUTS,
  customExercises: [],
  categories: DEFAULT_CATEGORIES,
  bodyMetrics: INITIAL_BODY_METRICS,
  isDarkMode: true,
  unit: 'kg',
  backupInfo: {
    lastBackupDate: undefined,
    fileName: undefined
  }
});

export const loadAppState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultState(),
      ...parsed,
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
      workouts: parsed.workouts || INITIAL_WORKOUTS,
      bodyMetrics: parsed.bodyMetrics || INITIAL_BODY_METRICS,
    };
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
    return getDefaultState();
  }
};

export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
};

export const getAllExercises = (customExercises: Exercise[] = []): Exercise[] => {
  return [...PRESET_EXERCISES, ...customExercises];
};

