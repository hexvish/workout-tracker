import { Exercise } from '../types';

export const PRESET_EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'preset-bench-press',
    name: 'Barbell Bench Press',
    category: 'Strength',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'arms'],
    equipment: 'Barbell',
    defaultRestSeconds: 90,
    metricType: 'weight_reps',
    instructions: 'Lie on bench, grip bar slightly wider than shoulder width. Lower bar to chest level and press explosively up.'
  },
  {
    id: 'preset-incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'Strength',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'arms'],
    equipment: 'Dumbbells',
    defaultRestSeconds: 90,
    metricType: 'weight_reps',
    instructions: 'Set bench to 30-45 degree incline. Press dumbbells upwards vertically while keeping core tight.'
  },
  {
    id: 'preset-pushups',
    name: 'Push-Ups',
    category: 'Bodyweight',
    muscleGroup: 'chest',
    secondaryMuscles: ['core', 'arms'],
    equipment: 'Bodyweight',
    defaultRestSeconds: 60,
    metricType: 'reps_only',
    instructions: 'Keep body in a straight line from head to heels. Lower chest until nearly touching floor and push up.'
  },
  {
    id: 'preset-chest-flyes',
    name: 'Cable Chest Flyes',
    category: 'Strength',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders'],
    equipment: 'Cable Machine',
    defaultRestSeconds: 60,
    metricType: 'weight_reps',
    instructions: 'Set pulleys to shoulder height. Bring handles together in a hugging motion with slight elbow bend.'
  },

  // BACK
  {
    id: 'preset-deadlift',
    name: 'Barbell Deadlift',
    category: 'Strength',
    muscleGroup: 'back',
    secondaryMuscles: ['legs', 'core'],
    equipment: 'Barbell',
    defaultRestSeconds: 120,
    metricType: 'weight_reps',
    instructions: 'Stand mid-foot under barbell. Hinges at hips, grip bar, drive knees out and stand up straight pressing through heels.'
  },
  {
    id: 'preset-pullups',
    name: 'Overhand Pull-Ups',
    category: 'Bodyweight',
    muscleGroup: 'back',
    secondaryMuscles: ['arms'],
    equipment: 'Pull-up Bar',
    defaultRestSeconds: 90,
    metricType: 'reps_only',
    instructions: 'Grip pull-up bar palms facing away. Pull chest up to the bar driving elbows down towards ribs.'
  },
  {
    id: 'preset-lat-pulldown',
    name: 'Lat Pulldown',
    category: 'Strength',
    muscleGroup: 'back',
    secondaryMuscles: ['arms'],
    equipment: 'Cable Machine',
    defaultRestSeconds: 60,
    metricType: 'weight_reps',
    instructions: 'Sit under thigh pads. Pull bar down to upper chest level while keeping torso upright.'
  },
  {
    id: 'preset-bentover-row',
    name: 'Barbell Bent-Over Row',
    category: 'Strength',
    muscleGroup: 'back',
    secondaryMuscles: ['arms', 'core'],
    equipment: 'Barbell',
    defaultRestSeconds: 90,
    metricType: 'weight_reps',
    instructions: 'Hinge forward at hips with flat back. Pull bar towards belly button squeezing shoulder blades together.'
  },

  // LEGS
  {
    id: 'preset-squat',
    name: 'Barbell Back Squat',
    category: 'Strength',
    muscleGroup: 'legs',
    secondaryMuscles: ['core'],
    equipment: 'Barbell',
    defaultRestSeconds: 120,
    metricType: 'weight_reps',
    instructions: 'Rest bar across upper back traps. Sit hips down and back until thighs are parallel to ground, drive back up.'
  },
  {
    id: 'preset-leg-press',
    name: 'Sled Leg Press',
    category: 'Strength',
    muscleGroup: 'legs',
    equipment: 'Leg Press Machine',
    defaultRestSeconds: 90,
    metricType: 'weight_reps',
    instructions: 'Position feet shoulder-width apart on platform. Lower platform slowly until knees form 90 degree angle.'
  },
  {
    id: 'preset-romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    category: 'Strength',
    muscleGroup: 'legs',
    secondaryMuscles: ['back'],
    equipment: 'Dumbbells',
    defaultRestSeconds: 90,
    metricType: 'weight_reps',
    instructions: 'Keep slight bend in knees. Hinge at hips pushing glutes backward while lowering weights along shins.'
  },
  {
    id: 'preset-walking-lunges',
    name: 'Dumbbell Walking Lunges',
    category: 'Strength',
    muscleGroup: 'legs',
    equipment: 'Dumbbells',
    defaultRestSeconds: 60,
    metricType: 'weight_reps',
    instructions: 'Step forward landing heel to toe. Drop back knee toward floor, push off front leg to transition step.'
  },

  // SHOULDERS
  {
    id: 'preset-overhead-press',
    name: 'Overhead Barbell Press (OHP)',
    category: 'Strength',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['arms', 'core'],
    equipment: 'Barbell',
    defaultRestSeconds: 90,
    metricType: 'weight_reps',
    instructions: 'Rest bar on collarbone. Press bar overhead until arms lock out vertically, tucking head slightly back.'
  },
  {
    id: 'preset-lateral-raises',
    name: 'Dumbbell Lateral Raise',
    category: 'Strength',
    muscleGroup: 'shoulders',
    equipment: 'Dumbbells',
    defaultRestSeconds: 60,
    metricType: 'weight_reps',
    instructions: 'Raise dumbbells outwards to sides until arms are parallel to floor with soft elbows.'
  },

  // ARMS
  {
    id: 'preset-bicep-curls',
    name: 'Dumbbell Bicep Curls',
    category: 'Strength',
    muscleGroup: 'arms',
    equipment: 'Dumbbells',
    defaultRestSeconds: 60,
    metricType: 'weight_reps',
    instructions: 'Keep elbows tucked into sides. Curl weights upwards while squeezing biceps at apex.'
  },
  {
    id: 'preset-tricep-pushdown',
    name: 'Cable Tricep Rope Pushdown',
    category: 'Strength',
    muscleGroup: 'arms',
    equipment: 'Cable Machine',
    defaultRestSeconds: 60,
    metricType: 'weight_reps',
    instructions: 'Push rope attachment straight down until arms lock out, flaring hands slightly outwards at bottom.'
  },

  // CORE
  {
    id: 'preset-plank',
    name: 'Forearm Plank',
    category: 'Bodyweight',
    muscleGroup: 'core',
    equipment: 'Bodyweight',
    defaultRestSeconds: 45,
    metricType: 'time_only',
    instructions: 'Maintain a rigid straight line from shoulders to ankles while resting on forearms and toes.'
  },
  {
    id: 'preset-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    category: 'Bodyweight',
    muscleGroup: 'core',
    equipment: 'Pull-up Bar',
    defaultRestSeconds: 60,
    metricType: 'reps_only',
    instructions: 'Hang from bar with straight arms. Raise legs up until parallel to floor using lower abdominals.'
  },

  // CARDIO
  {
    id: 'preset-treadmill-run',
    name: 'Treadmill Running',
    category: 'Cardio',
    muscleGroup: 'cardio',
    equipment: 'Treadmill',
    defaultRestSeconds: 60,
    metricType: 'distance_time',
    instructions: 'Maintain steady pace with upright posture and landing lightly on mid-foot.'
  },
  {
    id: 'preset-stationary-bike',
    name: 'Stationary Cycling',
    category: 'Cardio',
    muscleGroup: 'cardio',
    equipment: 'Stationary Bike',
    defaultRestSeconds: 45,
    metricType: 'distance_time',
    instructions: 'Pedal at targeted RPM maintaining active core engagement and knee alignment.'
  }
];
