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

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ExerciseCategory = "push" | "pull" | "legs" | "core" | "full-body";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  muscles: MuscleGroup[];
  difficulty: Difficulty;
  instructions: string[];
  image: string; // emoji placeholder
  isHold: boolean; // e.g. plank, L-sit
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number | null; // null for timed exercises
  holdSeconds: number | null; // for isometric holds
  restSeconds: number;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory | "mixed";
  difficulty: Difficulty;
  exercises: WorkoutExercise[];
  estimatedMinutes: number;
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
  workoutId: string;
  date: string; // ISO date
  startTime: string;
  endTime: string | null;
  exercises: CompletedExercise[];
  completed: boolean;
}

export interface UserStats {
  totalWorkouts: number;
  totalExercises: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
}
