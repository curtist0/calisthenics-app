export type MuscleGroup = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "core" | "quads" | "hamstrings" | "glutes" | "calves" | "full-body";
export type Difficulty = "beginner" | "intermediate" | "advanced" | "elite";
export type ExerciseCategory = "push" | "pull" | "legs" | "core" | "skill";
export type Rank = "F" | "E" | "D" | "C" | "B" | "A" | "S";
export type TrainingGoal = "strength-skill" | "hypertrophy" | "endurance" | "muscle" | "skills" | "weight-loss" | "balanced"; // Legacy goals kept for backward compat
export type Equipment = "rings" | "parallettes" | "pull-up-bar" | "weights" | "wall" | "calisthenics";
export type TrainingMode = "strength" | "endurance";

// Ranking decision tracking
export interface RankingDecision {
  trainingMode: TrainingMode;
  decidedAt: string;  // ISO timestamp when decision was made
  canChangeAt: string; // ISO timestamp when user can change decision (decidedAt + 24hrs)
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  muscles: MuscleGroup[];
  difficulty: Difficulty;
  instructions: string[];
  image: string;
  isHold: boolean;
  supportsWeight: boolean;
  videoUrl: string;
  imageUrl: string;
  equipment?: Equipment[];
  progressionFrom?: string;
  progressionTo?: string;
}

export interface YogaPose {
  id: string;
  name: string;
  sanskrit: string;
  description: string;
  holdSeconds: number;
  difficulty: Difficulty;
  category: "flexibility" | "balance" | "strength" | "relaxation";
  targetAreas: string[];
  instructions: string[];
  image: string;
  imageUrl: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number | null;
  holdSeconds: number | null;
  restSeconds: number;
  progressionLevel?: string;
  levelAdjustment?: number; // Allows +1 (harder), -1 (easier) from the generated plan
}

export interface WarmUp {
  name: string;
  duration: string;
  exercises: string[];
}

export interface RestDayActivity {
  name: string;
  description: string;
  duration: string;
  type: "yoga" | "mobility" | "light-cardio";
  yogaPoseIds?: string[];
}

export interface DayWorkout {
  day: string;
  name: string;
  isRest: boolean;
  focus?: string;
  exercises: WorkoutExercise[];
  warmUp?: WarmUp;
  restDayActivities?: RestDayActivity[];
}

export interface WeeklyPlan {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  goal: string;
  trainingGoal: TrainingGoal;
  targetSkills: string[];
  days: DayWorkout[];
  estimatedWeeklyMinutes: number;
  createdAt: string;
}

/** Persisted UI state when pausing an in-progress day workout (e.g. to browse the app). */
export interface WorkoutSessionUIState {
  planId: string;
  dayIndex: number;
  curEx: number;
  curSet: number;
  showRest: boolean;
  isPaused: boolean;
  scheduleOverride?: boolean;
}

export interface CompletedSet {
  reps: number | null;
  holdSeconds: number | null;
  weightKg: number | null;
  completed: boolean;
  targetReps?: number; // User-overridden target (e.g., app said 8 but user did 6)
  targetHold?: number;
}

export interface CompletedExercise {
  exerciseId: string;
  sets: CompletedSet[];
}

export interface WorkoutLog {
  id: string;
  planId: string;
  dayIndex: number;
  date: string;
  startTime: string;
  endTime: string | null;
  exercises: CompletedExercise[];
  completed: boolean;
}

export interface PersonalRecord {
  exerciseId: string;
  type: "reps" | "hold" | "weight";
  value: number;
  date: string;
  previousValue: number | null;
}

export interface ExerciseLevel {
  exerciseId: string;
  level: Difficulty;
  bestReps: number;
  bestHold: number;
  lastUpdated: string;
}

export interface SkillLevels {
  push: Difficulty;
  pull: Difficulty;
  legs: Difficulty;
  core: Difficulty;
  balance: Difficulty;
  flexibility: Difficulty;
}

export interface UserProfile {
  onboarded: boolean;
  overallLevel: Difficulty;
  skillLevels: SkillLevels;
  exerciseLevels: ExerciseLevel[];
  trainingGoal: TrainingGoal;
  userEquipment?: Equipment[];
  yogaSetUp: boolean;
  yogaLevel: Difficulty;
  createdAt: string;
  ranks?: any; // EnhancedRanks from rankingSystem.ts
  rankingDecision?: RankingDecision; // NEW: Training mode choice + 24-hour lock
  estimatedRankAtOnboarding?: Rank; // NEW: Initial rank estimate from onboarding
}

export interface ProgressPhoto {
  id: string;
  date: string;
  dataUrl: string;
  note: string;
}

export interface UserStats {
  totalWorkouts: number;
  totalExercises: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
}

export interface PoseLog {
  poseId: string;
  duration: number;
}

export interface YogaSession {
  id: string;
  planId: string;
  dayIndex: number;
  currentPoseIndex: number;
  flowId: string;
  startTime: number;
  pausedTime?: number;
  completedPoses: PoseLog[];
}
