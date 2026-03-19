export type MuscleGroup = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "core" | "quads" | "hamstrings" | "glutes" | "calves" | "full-body";
export type Difficulty = "beginner" | "intermediate" | "advanced" | "elite";
export type ExerciseCategory = "push" | "pull" | "legs" | "core" | "full-body" | "skill";
export type TrainingGoal = "muscle" | "skills" | "weight-loss" | "endurance" | "balanced";

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

export interface CompletedSet {
  reps: number | null;
  holdSeconds: number | null;
  weightKg: number | null;
  completed: boolean;
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

export interface UserProfile {
  onboarded: boolean;
  overallLevel: Difficulty;
  exerciseLevels: ExerciseLevel[];
  trainingGoal: TrainingGoal;
  yogaSetUp: boolean;
  yogaLevel: Difficulty;
  createdAt: string;
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
