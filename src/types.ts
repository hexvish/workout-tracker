export type MuscleGroup = 
  | string;

export interface CategoryDef {
  id: string;
  name: string;
  color: string; // HEX code
}

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'cat-abs', name: 'Abs', color: '#EC4899' },
  { id: 'cat-shoulders', name: 'Shoulders', color: '#10B981' },
  { id: 'cat-biceps', name: 'Biceps', color: '#F59E0B' },
  { id: 'cat-triceps', name: 'Triceps', color: '#8B5CF6' },
  { id: 'cat-legs', name: 'Legs', color: '#F97316' },
  { id: 'cat-chest', name: 'Chest', color: '#EF4444' },
  { id: 'cat-back', name: 'Back', color: '#3B82F6' },
];

export type ExerciseCategory = 
  | 'Strength' 
  | 'Cardio' 
  | 'Bodyweight' 
  | 'Olympic' 
  | 'Flexibility';

export type MetricType = 
  | 'weight_reps' 
  | 'distance_time' 
  | 'time_only' 
  | 'reps_only';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: string; // Category name (e.g. Chest, Back, Biceps, Cardio)
  secondaryMuscles?: string[];
  equipment: string;
  isCustom?: boolean;
  defaultRestSeconds: number;
  instructions?: string;
  metricType: MetricType;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weightKg?: number;
  reps?: number;
  distanceKm?: number;
  durationSeconds?: number;
  completed: boolean;
  rpe?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  metricType: MetricType;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  exercises: WorkoutExercise[];
  totalVolumeKg: number;
  totalCaloriesBurned: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  notes?: string;
}

export interface BodyWeightEntry {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  notes?: string;
}

export interface UserProfile {
  heightCm?: number;
}

export interface BackupMetadata {
  lastBackupDate?: string;
  fileId?: string;
  fileName?: string;
  fileSizeKb?: number;
}

export interface AppState {
  workouts: WorkoutSession[];
  customExercises: Exercise[];
  categories: CategoryDef[];
  bodyMetrics: BodyWeightEntry[];
  userProfile?: UserProfile;
  isDarkMode: boolean;
  unit: 'kg' | 'lbs';
  backupInfo?: BackupMetadata;
}

export type TimeFrame = 'week' | 'month' | 'year';

