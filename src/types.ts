export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'biceps'
  | 'triceps'
  | 'shoulders' 
  | 'legs' 
  | 'abs' 
  | 'arms' 
  | 'core' 
  | 'cardio' 
  | 'full_body';

export type BodyPartCategory = 'chest' | 'back' | 'biceps' | 'triceps' | 'shoulders' | 'legs' | 'abs';

export interface BodyPartColor {
  name: string;
  color: string;
  bg: string;
  border: string;
}

export const BODY_PART_COLORS: Record<BodyPartCategory, BodyPartColor> = {
  chest: { name: 'Chest', color: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  back: { name: 'Back', color: '#3B82F6', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  biceps: { name: 'Biceps', color: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  triceps: { name: 'Triceps', color: '#8B5CF6', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  shoulders: { name: 'Shoulders', color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  legs: { name: 'Legs', color: '#F97316', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  abs: { name: 'Abs', color: '#EC4899', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
};

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
  bodyMetrics: BodyWeightEntry[];
  userProfile?: UserProfile;
  isDarkMode: boolean;
  unit: 'kg' | 'lbs';
  backupInfo?: BackupMetadata;
}

export type TimeFrame = 'week' | 'month' | 'year';
