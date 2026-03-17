import {
  WorkoutLog,
  UserStats,
  ExerciseRecord,
  StrengthDataPoint,
  PlateauInfo,
} from "./types";
import { getExerciseById } from "@/data/exercises";

const LOGS_KEY = "calisthenics_logs";
const STATS_KEY = "calisthenics_stats";
const RECORDS_KEY = "calisthenics_records";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ── Workout Logs ──

export function getWorkoutLogs(): WorkoutLog[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWorkoutLog(log: WorkoutLog): void {
  if (!isBrowser()) return;
  const logs = getWorkoutLogs();
  const existingIndex = logs.findIndex((l) => l.id === log.id);
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.push(log);
  }
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  updateRecordsFromLog(log);
}

export function deleteWorkoutLog(id: string): void {
  if (!isBrowser()) return;
  const logs = getWorkoutLogs().filter((l) => l.id !== id);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

// ── Exercise Records (strength tracking) ──

export function getExerciseRecords(): ExerciseRecord[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(RECORDS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveExerciseRecords(records: ExerciseRecord[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

function updateRecordsFromLog(log: WorkoutLog): void {
  if (!log.completed) return;
  const records = getExerciseRecords();
  const dateStr = log.date.split("T")[0];

  for (const ex of log.exercises) {
    let maxReps: number | null = null;
    let maxHold: number | null = null;
    let totalVolume = 0;

    for (const set of ex.sets) {
      if (set.completed) {
        if (set.reps !== null) {
          maxReps = Math.max(maxReps ?? 0, set.reps);
          totalVolume += set.reps;
        }
        if (set.holdSeconds !== null) {
          maxHold = Math.max(maxHold ?? 0, set.holdSeconds);
          totalVolume += set.holdSeconds;
        }
      }
    }

    if (totalVolume > 0) {
      records.push({
        exerciseId: ex.exerciseId,
        date: dateStr,
        maxReps,
        maxHoldSeconds: maxHold,
        totalVolume,
      });
    }
  }

  saveExerciseRecords(records);
}

export function getStrengthHistory(exerciseId: string): StrengthDataPoint[] {
  const records = getExerciseRecords().filter(
    (r) => r.exerciseId === exerciseId
  );

  const byDate = new Map<string, number>();
  for (const r of records) {
    const existing = byDate.get(r.date) ?? 0;
    byDate.set(r.date, Math.max(existing, r.totalVolume));
  }

  return Array.from(byDate.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ── Plateau Detection ──

export function detectPlateaus(): PlateauInfo[] {
  const records = getExerciseRecords();
  const exerciseIds = [...new Set(records.map((r) => r.exerciseId))];
  const plateaus: PlateauInfo[] = [];

  for (const exId of exerciseIds) {
    const history = getStrengthHistory(exId);
    if (history.length < 4) continue;

    const recent = history.slice(-6);
    if (recent.length < 3) continue;

    const values = recent.map((d) => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const coeffOfVariation = avg > 0 ? stdDev / avg : 0;

    if (coeffOfVariation < 0.1 && history.length >= 4) {
      const exercise = getExerciseById(exId);
      if (!exercise) continue;

      const firstDate = new Date(recent[0].date);
      const lastDate = new Date(recent[recent.length - 1].date);
      const weeks = Math.max(
        1,
        Math.round(
          (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        )
      );

      plateaus.push({
        exerciseId: exId,
        exerciseName: exercise.name,
        currentLevel: Math.round(avg),
        durationWeeks: weeks,
        suggestion: generateSuggestion(exercise.id, exercise.category, avg),
      });
    }
  }

  return plateaus;
}

function generateSuggestion(
  exerciseId: string,
  category: string,
  currentVolume: number
): string {
  const suggestions: Record<string, string[]> = {
    push: [
      "Try adding a 3-second pause at the bottom of each rep to increase time under tension.",
      "Switch to a harder progression (e.g., diamond → pike → HSPU) for 2 weeks, then return.",
      "Add explosive push-ups (clap push-ups) to recruit more motor units.",
      "Try 'grease the groove' — do 50% of your max throughout the day, every day for a week.",
      "Increase rest between sets to 3 minutes and go for max reps each set.",
    ],
    pull: [
      "Add a 2-second hold at the top of each pull-up to build peak contraction strength.",
      "Try negative-only reps: jump up and lower for 5 seconds per rep.",
      "Switch grip width — go wider or use a mixed grip for variety.",
      "Add weight with a backpack if possible, even small amounts help.",
      "Do archer pull-ups or typewriter pull-ups to increase unilateral demand.",
    ],
    legs: [
      "Add a 3-second pause at the bottom of each squat.",
      "Try single-leg variations to double the intensity per leg.",
      "Add a jump to your squats for power development.",
      "Slow down the eccentric (lowering) phase to 4-5 seconds.",
      "Increase range of motion — use an elevated surface for deeper squats.",
    ],
    core: [
      "Increase hold duration by 10-15% each session.",
      "Try adding movement to your holds (e.g., hollow body rocks instead of holds).",
      "Progress to the next harder variation in the progression chain.",
      "Add weight — hold a book or water bottle for extra resistance.",
      "Try anti-rotation exercises to challenge the core differently.",
    ],
    skill: [
      "Focus on the easier progression for higher volume before returning to this skill.",
      "Film yourself to check form — small technique fixes unlock big strength gains.",
      "Add specific straight-arm or bent-arm conditioning work.",
      "Try 'negatives' of this skill: start from the end position and slowly lower.",
      "Take a deload week at 50% volume, then push past the plateau refreshed.",
    ],
    "full-body": [
      "Increase the tempo — slower reps recruit more muscle fibers.",
      "Try rest-pause sets: do max reps, rest 15 seconds, repeat for 3 mini-sets.",
      "Reduce rest periods by 15 seconds to increase metabolic demand.",
      "Add a variation you haven't tried to shock the body.",
      "Increase weekly frequency from 2 to 3 sessions for this exercise.",
    ],
  };

  const pool = suggestions[category] || suggestions["full-body"];
  const index = Math.floor(currentVolume) % pool.length;
  return pool[index];
}

// ── User Stats ──

export function getUserStats(): UserStats {
  if (!isBrowser()) {
    return {
      totalWorkouts: 0,
      totalExercises: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
    };
  }
  const data = localStorage.getItem(STATS_KEY);
  if (data) return JSON.parse(data);
  return recalculateStats();
}

export function recalculateStats(): UserStats {
  const logs = getWorkoutLogs().filter((l) => l.completed);

  if (logs.length === 0) {
    const stats: UserStats = {
      totalWorkouts: 0,
      totalExercises: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
    };
    if (isBrowser()) localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return stats;
  }

  const totalExercises = logs.reduce(
    (sum, log) => sum + log.exercises.length,
    0
  );

  const sortedDates = [
    ...new Set(logs.map((l) => l.date.split("T")[0])),
  ].sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays =
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const lastDate = sortedDates[sortedDates.length - 1];

  if (lastDate === today || lastDate === yesterday) {
    currentStreak = streak;
  } else {
    currentStreak = 0;
  }

  const stats: UserStats = {
    totalWorkouts: logs.length,
    totalExercises,
    currentStreak,
    longestStreak,
    lastWorkoutDate: sortedDates[sortedDates.length - 1],
  };

  if (isBrowser()) localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
