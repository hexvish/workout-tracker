export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'legs' 
  | 'shoulders' 
  | 'arms' 
  | 'core' 
  | 'cardio' 
  | 'full_body';

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
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
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
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  metricType: MetricType;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  date: string; // ISO string
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
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercentage?: number;
  notes?: string;
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
  bodyMetrics: BodyWeightEntry[];
  isDarkMode: boolean;
  unit: 'kg' | 'lbs';
  backupInfo?: BackupMetadata;
}

export type TimeFrame = 'week' | 'month' | 'year';
