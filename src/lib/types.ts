export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "core"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "full-body";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "elite";

export type ExerciseCategory = "push" | "pull" | "legs" | "core" | "full-body" | "skill";

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
  progressionFrom?: string;
  progressionTo?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number | null;
  holdSeconds: number | null;
  restSeconds: number;
}

export interface DayWorkout {
  day: string;
  name: string;
  isRest: boolean;
  focus?: string;
  exercises: WorkoutExercise[];
}

export interface WeeklyPlan {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  goal: string;
  days: DayWorkout[];
  estimatedWeeklyMinutes: number;
}

export interface CompletedSet {
  reps: number | null;
  holdSeconds: number | null;
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

export interface ExerciseRecord {
  exerciseId: string;
  date: string;
  maxReps: number | null;
  maxHoldSeconds: number | null;
  totalVolume: number;
}

export interface StrengthDataPoint {
  date: string;
  value: number;
}

export interface PlateauInfo {
  exerciseId: string;
  exerciseName: string;
  currentLevel: number;
  durationWeeks: number;
  suggestion: string;
}

export interface UserStats {
  totalWorkouts: number;
  totalExercises: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
}
