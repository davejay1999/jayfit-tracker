export type ExerciseType = 'strength' | 'core' | 'warmup' | 'recovery' | 'cardio' | 'stretch' | 'rest';
export type WorkoutStatus = 'not_started' | 'in_progress' | 'partial' | 'completed';
export type Side = 'R' | 'L';
export type WeightUnit = 'lb' | 'kg';
export type Phase = 'warmup' | 'main' | 'cooldown';

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  minReps?: number;
  maxReps?: number;
  unilateral?: boolean;
  type: ExerciseType;
  primary: string[];
  secondary?: string[];
  note?: string;
  visual: string;
  optional?: boolean;
  timedMinutes?: [number, number];
  alternatives?: string[];
};

export type DayPlan = {
  weekday: number;
  title: string;
  subtitle: string;
  kind: 'push' | 'pull' | 'legs' | 'recovery' | 'cardio' | 'rest';
  warmup: Exercise[];
  main: Exercise[];
  cooldown: Exercise[];
};

export type SetEntry = {
  cloudId?: string;
  exerciseId: string;
  exerciseName: string;
  phase: Phase;
  setNumber: number;
  side?: Side;
  weight: string;
  reps: string;
  durationSeconds?: number;
  done: boolean;
  notes?: string;
  setType: 'WARMUP' | 'WORKING' | 'COOLDOWN' | 'RECOVERY';
  weightUnit: WeightUnit;
  loggedAt?: string;
};

export type SessionEntry = {
  cloudId?: string;
  date: string;
  workoutType: string;
  status: WorkoutStatus;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  notes?: string;
  sorenessScore?: number;
  sorenessAreas?: Record<string, number>;
  planSnapshot?: string;
  selectedCardio?: string;
  substitutions?: Record<string, string>;
};

export type MachineSetting = {
  cloudId?: string;
  exerciseId: string;
  seat?: string;
  backrest?: string;
  handle?: string;
  machine?: string;
  pin?: string;
  preferredWeight?: string;
  notes?: string;
};

export type UserSettings = {
  weightUnit: WeightUnit;
  defaultRestSeconds: number;
  beginnerMode: boolean;
  theme: 'dark';
  autoRestTimer: boolean;
  routineOverrides: Record<string, { enabled?: boolean; sets?: number; reps?: string; order?: number }>;
};

export type AppState = {
  sessions: Record<string, SessionEntry>;
  sets: Record<string, Record<string, SetEntry[]>>;
  machineSettings: Record<string, MachineSetting>;
  settings: UserSettings;
  profileCloudId?: string;
  lastSyncAt?: string;
};

export type PRMetric = {
  exerciseId: string;
  exerciseName: string;
  side?: Side;
  date: string;
  weight: number;
  reps: number;
  volume: number;
  oneRM: number;
};

export type PREvent = PRMetric & {
  type: 'weight' | 'volume' | 'oneRM' | 'reps';
  value: number;
};
