import { WorkoutSession, BodyWeightEntry } from '../types';

// Helper to subtract days
const minusDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const INITIAL_BODY_METRICS: BodyWeightEntry[] = [];

export const INITIAL_WORKOUTS: WorkoutSession[] = [];

