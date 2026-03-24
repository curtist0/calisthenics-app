/**
 * Helper functions for Progress screen
 */

export interface ProgressData {
  exerciseId: string;
  exerciseName: string;
  current: number;
  goal: number;
  previous: number;
  type: "reps" | "hold" | "weight";
  trend: number[];
  date: string;
}

/**
 * Format growth delta to 1 decimal place
 */
export function formatGrowthDelta(value: number): string {
  if (isNaN(value)) return "0.0";
  return (value).toFixed(1);
}

/**
 * Calculate percentage for progress ring
 */
export function calculateProgressPercentage(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, (current / goal) * 100);
}

/**
 * Stable mock data for progress stats (never changes on reload)
 */
export const mockProgressData: ProgressData[] = [
  {
    exerciseId: "push-up",
    exerciseName: "Push-Up",
    current: 14,
    goal: 20,
    previous: 12,
    type: "reps",
    trend: [10, 11, 12, 13, 12, 13, 14],
    date: new Date().toISOString(),
  },
  {
    exerciseId: "plank",
    exerciseName: "Plank",
    current: 45,
    goal: 60,
    previous: 40,
    type: "hold",
    trend: [30, 32, 35, 38, 40, 42, 45],
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    exerciseId: "squat",
    exerciseName: "Bodyweight Squat",
    current: 28,
    goal: 50,
    previous: 25,
    type: "reps",
    trend: [20, 21, 22, 24, 25, 27, 28],
    date: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    exerciseId: "pull-up",
    exerciseName: "Pull-Up",
    current: 8,
    goal: 15,
    previous: 7,
    type: "reps",
    trend: [4, 5, 6, 6, 7, 7, 8],
    date: new Date(Date.now() - 259200000).toISOString(),
  },
];

/**
 * Achievement/Badge definitions
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: string;
  unlocked: boolean;
  emoji: string;
}

export const achievements: Achievement[] = [
  {
    id: "groundbreaker",
    title: "Groundbreaker",
    description: "Push-Ups: 10 reps",
    target: "push-up:10",
    unlocked: true,
    emoji: "🚀",
  },
  {
    id: "air-walker",
    title: "Air Walker",
    description: "Statics: 5s hold",
    target: "plank:5",
    unlocked: true,
    emoji: "✈️",
  },
  {
    id: "quadzilla",
    title: "Quadzilla",
    description: "Squats: 100 reps",
    target: "squat:100",
    unlocked: false,
    emoji: "🦵",
  },
];
