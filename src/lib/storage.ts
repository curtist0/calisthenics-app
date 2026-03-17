import { WorkoutLog, UserStats } from "./types";

const LOGS_KEY = "calisthenics_logs";
const STATS_KEY = "calisthenics_stats";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

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
}

export function deleteWorkoutLog(id: string): void {
  if (!isBrowser()) return;
  const logs = getWorkoutLogs().filter((l) => l.id !== id);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

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
