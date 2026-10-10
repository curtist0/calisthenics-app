import { getExerciseById } from "@/data/exercises";
import { ACCENT_THEMES, AccentThemeId, RANKS, STREAK_CONFIG, WEEKLY_CHALLENGE_CONFIG, XP_CONFIG } from "./gamificationConfig";
import { updateExerciseLevel } from "./progression";
import { Difficulty, PersonalRecord, UserProfile, WeeklyPlan, WorkoutLog } from "./types";

export interface RankProgress {
  totalXp: number;
  rank: string;
  nextRank: string | null;
  xpToNextRank: number;
  rankProgressPercent: number;
}

export interface ForgivingStreak {
  currentStreak: number;
  longestStreak: number;
  freezesHeld: number;
}

export interface WeeklyChallenge {
  weekStart: string;
  exerciseId: string;
  metric: "reps" | "holdSeconds";
  target: number;
  progress: number;
}

export interface GamificationOverview extends RankProgress, ForgivingStreak {
  accentTheme: AccentThemeId;
  weeklyChallenge: WeeklyChallenge | null;
}

export interface WorkoutRewards {
  xpEarned: number;
  personalRecordsEarned: number;
  masteredSkills: { exerciseId: string; fromLevel: Difficulty; toLevel: Difficulty }[];
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateKey(date);
}

function mondayWeekStart(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return toDateKey(date);
}

const LEVEL_INDEX: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  elite: 3,
};

function collectBestRecords(logs: WorkoutLog[]): Map<string, number | { reps: number; weight: number }> {
  const values = new Map<string, number | { reps: number; weight: number }>();
  for (const log of logs) {
    if (!log.completed) continue;
    for (const exercise of log.exercises) {
      for (const set of exercise.sets) {
        if (!set.completed) continue;
        const updateNumber = (type: PersonalRecord["type"], value: number | null) => {
          if (value === null || value <= 0) return;
          const key = `${exercise.exerciseId}:${type}`;
          const current = values.get(key);
          if (typeof current !== "number" || value > current) values.set(key, value);
        };
        updateNumber("reps", set.reps);
        updateNumber("hold", set.holdSeconds);
        updateNumber("weight", set.weightKg);
        if (set.reps !== null && set.reps > 0 && set.weightKg !== null && set.weightKg > 0) {
          const key = `${exercise.exerciseId}:weighted-reps`;
          const current = values.get(key);
          const candidate = { reps: set.reps, weight: set.weightKg };
          if (
            typeof current !== "object"
            || candidate.reps > current.reps
            || (candidate.reps === current.reps && candidate.weight > current.weight)
          ) values.set(key, candidate);
        }
      }
    }
  }
  return values;
}

function countNewRecords(workout: WorkoutLog, previousLogs: WorkoutLog[]): number {
  const previous = collectBestRecords(previousLogs);
  const current = collectBestRecords([workout]);
  let count = 0;
  for (const [key, value] of current) {
    const before = previous.get(key);
    if (typeof value === "number" && (typeof before !== "number" || value > before)) count += 1;
    else if (typeof value === "object" && (
      typeof before !== "object"
      || value.reps > before.reps
      || (value.reps === before.reps && value.weight > before.weight)
    )) count += 1;
  }
  return count;
}

export function calculateWorkoutRewards(
  workout: WorkoutLog,
  previousLogs: WorkoutLog[],
  profile: UserProfile | null,
): WorkoutRewards {
  const personalRecordsEarned = countNewRecords(workout, previousLogs);
  const previousLevels = profile?.exerciseLevels ?? [];
  const masteredSkills: WorkoutRewards["masteredSkills"] = [];
  const seenExerciseIds = new Set<string>();

  for (const exercise of workout.exercises) {
    if (seenExerciseIds.has(exercise.exerciseId) || !getExerciseById(exercise.exerciseId)) continue;
    seenExerciseIds.add(exercise.exerciseId);
    const definition = getExerciseById(exercise.exerciseId);
    if (definition?.category !== "skill") continue;
    const previousLevel = previousLevels.find((level) => level.exerciseId === exercise.exerciseId)?.level ?? "beginner";
    const nextLevel = updateExerciseLevel(
      previousLevels,
      exercise.exerciseId,
      exercise.sets,
    ).find((level) => level.exerciseId === exercise.exerciseId)?.level ?? previousLevel;
    if (LEVEL_INDEX[nextLevel] > LEVEL_INDEX[previousLevel]) {
      masteredSkills.push({ exerciseId: exercise.exerciseId, fromLevel: previousLevel, toLevel: nextLevel });
    }
  }

  return {
    personalRecordsEarned,
    masteredSkills,
    xpEarned: XP_CONFIG.completedSession
      + personalRecordsEarned * XP_CONFIG.personalRecordBonus
      + masteredSkills.length * XP_CONFIG.skillMasteryBonus,
  };
}

export function getRankProgress(totalXp: number): RankProgress {
  const safeXp = Math.max(0, Number.isFinite(totalXp) ? totalXp : 0);
  let rankIndex = 0;
  for (let index = 1; index < RANKS.length; index++) {
    if (safeXp >= RANKS[index].minXp) rankIndex = index;
    else break;
  }
  const current = RANKS[rankIndex];
  const next = RANKS[rankIndex + 1];
  if (!next) {
    return { totalXp: safeXp, rank: current.name, nextRank: null, xpToNextRank: 0, rankProgressPercent: 100 };
  }
  const rankWidth = next.minXp - current.minXp;
  const rankXp = safeXp - current.minXp;
  return {
    totalXp: safeXp,
    rank: current.name,
    nextRank: next.name,
    xpToNextRank: next.minXp - safeXp,
    rankProgressPercent: Math.min(100, Math.round((rankXp / rankWidth) * 100)),
  };
}

function planForDate(plans: WeeklyPlan[], dateKey: string): WeeklyPlan | undefined {
  return [...plans]
    .filter((plan) => plan.createdAt.slice(0, 10) <= dateKey)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function getForgivingStreak(
  logs: WorkoutLog[],
  plans: WeeklyPlan[],
  asOf = new Date(),
): ForgivingStreak {
  const completedLogs = logs.filter((log) => log.completed);
  if (completedLogs.length === 0 || plans.length === 0) {
    return { currentStreak: 0, longestStreak: 0, freezesHeld: 0 };
  }

  const today = toDateKey(asOf);
  const earliestLog = completedLogs.reduce(
    (earliest, log) => log.date.slice(0, 10) < earliest ? log.date.slice(0, 10) : earliest,
    today,
  );
  const workoutDates = new Set(completedLogs.map((log) => log.date.slice(0, 10)));
  let currentStreak = 0;
  let longestStreak = 0;
  let freezesHeld = 0;

  for (let dateKey = earliestLog; dateKey <= today; dateKey = addDays(dateKey, 1)) {
    const weekday = (new Date(`${dateKey}T00:00:00.000Z`).getUTCDay() + 6) % 7;
    const plan = planForDate(plans, dateKey);
    if (!plan?.days[weekday] || plan.days[weekday].isRest) continue;

    if (workoutDates.has(dateKey)) {
      currentStreak += 1;
      if (currentStreak > 0 && currentStreak % STREAK_CONFIG.daysPerFreeze === 0) {
        freezesHeld = Math.min(STREAK_CONFIG.maxHeldFreezes, freezesHeld + 1);
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (freezesHeld > 0) {
      freezesHeld -= 1;
    } else {
      currentStreak = 0;
    }
  }

  return { currentStreak, longestStreak, freezesHeld };
}

function getChallengeProgress(
  logs: WorkoutLog[],
  weekStart: string,
  exerciseId: string,
  metric: WeeklyChallenge["metric"],
): number {
  return logs
    .filter((log) => log.completed && log.date.slice(0, 10) >= weekStart)
    .flatMap((log) => log.exercises)
    .filter((exercise) => exercise.exerciseId === exerciseId)
    .flatMap((exercise) => exercise.sets)
    .filter((set) => set.completed)
    .reduce((sum, set) => sum + (metric === "reps" ? set.reps ?? 0 : set.holdSeconds ?? 0), 0);
}

export function generateWeeklyChallenge(
  logs: WorkoutLog[],
  asOf = new Date(),
): Omit<WeeklyChallenge, "progress"> | null {
  const today = toDateKey(asOf);
  const historyStart = addDays(today, -WEEKLY_CHALLENGE_CONFIG.historyDays);
  const recent = logs.filter((log) => log.completed && log.date.slice(0, 10) >= historyStart && log.date.slice(0, 10) <= today);
  const counts = new Map<string, number>();
  for (const log of recent) {
    for (const exercise of log.exercises) {
      if (exercise.sets.some((set) => set.completed)) {
        counts.set(exercise.exerciseId, (counts.get(exercise.exerciseId) ?? 0) + 1);
      }
    }
  }
  const target = [...counts.entries()]
    .filter(([id]) => getExerciseById(id))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  if (!target) return null;

  const exercise = getExerciseById(target[0]);
  if (!exercise) return null;
  const metric = exercise.isHold ? "holdSeconds" : "reps";
  let recentTotal = 0;
  for (const log of recent) {
    for (const item of log.exercises) {
      if (item.exerciseId !== exercise.id) continue;
      for (const set of item.sets) {
        if (set.completed) recentTotal += metric === "reps" ? set.reps ?? 0 : set.holdSeconds ?? 0;
      }
    }
  }
  const challengeTarget = metric === "reps"
    ? Math.max(
        WEEKLY_CHALLENGE_CONFIG.minimumRepTarget,
        Math.ceil(Math.ceil(recentTotal * WEEKLY_CHALLENGE_CONFIG.repTargetMultiplier) / 5) * 5,
      )
    : Math.max(
        WEEKLY_CHALLENGE_CONFIG.minimumHoldTargetSeconds,
        Math.ceil(Math.ceil(recentTotal * WEEKLY_CHALLENGE_CONFIG.holdTargetMultiplier) / 30) * 30,
      );

  return {
    weekStart: mondayWeekStart(today),
    exerciseId: exercise.id,
    metric,
    target: challengeTarget,
  };
}

export function withChallengeProgress(
  challenge: Omit<WeeklyChallenge, "progress"> | null,
  logs: WorkoutLog[],
): WeeklyChallenge | null {
  if (!challenge) return null;
  return {
    ...challenge,
    progress: getChallengeProgress(logs, challenge.weekStart, challenge.exerciseId, challenge.metric),
  };
}

export function getGamificationOverview(
  logs: WorkoutLog[],
  plans: WeeklyPlan[],
  accentTheme: AccentThemeId,
  challenge: WeeklyChallenge | null,
  asOf = new Date(),
): GamificationOverview {
  const totalXp = logs.reduce((sum, log) => sum + (log.completed ? log.xpEarned ?? 0 : 0), 0);
  return {
    ...getRankProgress(totalXp),
    ...getForgivingStreak(logs, plans, asOf),
    accentTheme,
    weeklyChallenge: challenge,
  };
}

export function isAccentThemeUnlocked(themeId: AccentThemeId, totalXp: number): boolean {
  const theme = ACCENT_THEMES.find((item) => item.id === themeId);
  return Boolean(theme && totalXp >= theme.unlockXp);
}
