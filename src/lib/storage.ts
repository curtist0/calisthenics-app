import { WorkoutLog, UserStats, PersonalRecord, WeeklyPlan, ProgressPhoto, UserProfile, ExerciseLevel, TrainingGoal, WorkoutSessionUIState, YogaSession } from "./types";
import { getExerciseById } from "@/data/exercises";
import { updateExerciseLevel } from "./progression";

const LOGS_KEY = "calisthenics_logs";
const STATS_KEY = "calisthenics_stats";
const PRS_KEY = "calisthenics_prs";
const PLANS_KEY = "calisthenics_plans";
const PHOTOS_KEY = "calisthenics_photos";
const PROFILE_KEY = "calisthenics_profile";
const SESSION_UI_KEY = "calisthenics_session_ui";
const ACTIVE_CALISTHENICS_SESSION_KEY = "calisthenics_active_session";
const ACTIVE_YOGA_SESSION_KEY = "yoga_active_session";

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
  const idx = logs.findIndex((l) => l.id === log.id);
  if (idx >= 0) logs[idx] = log;
  else logs.push(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  updatePRsFromLog(log);
  updateLevelsFromLog(log);
}

// ── Personal Records ──

export function getPersonalRecords(): PersonalRecord[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(PRS_KEY);
  return data ? JSON.parse(data) : [];
}

function savePRs(prs: PersonalRecord[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(PRS_KEY, JSON.stringify(prs));
}

function updatePRsFromLog(log: WorkoutLog): void {
  if (!log.completed) return;
  const prs = getPersonalRecords();
  const dateStr = log.date.split("T")[0];

  for (const ex of log.exercises) {
    const exercise = getExerciseById(ex.exerciseId);
    if (!exercise) continue;

    for (const set of ex.sets) {
      if (!set.completed) continue;

      if (set.reps !== null && set.reps > 0) {
        const existing = prs.find(
          (p) => p.exerciseId === ex.exerciseId && p.type === "reps"
        );
        if (!existing || set.reps > existing.value) {
          const prev = existing?.value ?? null;
          const newPR: PersonalRecord = {
            exerciseId: ex.exerciseId,
            type: "reps",
            value: set.reps,
            date: dateStr,
            previousValue: prev,
          };
          if (existing) {
            const idx = prs.indexOf(existing);
            prs[idx] = newPR;
          } else {
            prs.push(newPR);
          }
        }
      }

      if (set.holdSeconds !== null && set.holdSeconds > 0) {
        const existing = prs.find(
          (p) => p.exerciseId === ex.exerciseId && p.type === "hold"
        );
        if (!existing || set.holdSeconds > existing.value) {
          const prev = existing?.value ?? null;
          const newPR: PersonalRecord = {
            exerciseId: ex.exerciseId,
            type: "hold",
            value: set.holdSeconds,
            date: dateStr,
            previousValue: prev,
          };
          if (existing) {
            const idx = prs.indexOf(existing);
            prs[idx] = newPR;
          } else {
            prs.push(newPR);
          }
        }
      }

      if (set.weightKg !== null && set.weightKg > 0) {
        const existing = prs.find(
          (p) => p.exerciseId === ex.exerciseId && p.type === "weight"
        );
        if (!existing || set.weightKg > existing.value) {
          const prev = existing?.value ?? null;
          const newPR: PersonalRecord = {
            exerciseId: ex.exerciseId,
            type: "weight",
            value: set.weightKg,
            date: dateStr,
            previousValue: prev,
          };
          if (existing) {
            const idx = prs.indexOf(existing);
            prs[idx] = newPR;
          } else {
            prs.push(newPR);
          }
        }
      }
    }
  }

  savePRs(prs);
}

export function getRecentPRs(limit = 10): PersonalRecord[] {
  return getPersonalRecords()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

// ── Saved Plans Library ──

export function getSavedPlans(): WeeklyPlan[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(PLANS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePlan(plan: WeeklyPlan): void {
  if (!isBrowser()) return;
  const plans = getSavedPlans();
  plans.unshift(plan);
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function deletePlan(planId: string): void {
  if (!isBrowser()) return;
  const plans = getSavedPlans().filter((p) => p.id !== planId);
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

// ── Progress Photos ──

export function getProgressPhotos(): ProgressPhoto[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(PHOTOS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProgressPhoto(photo: ProgressPhoto): void {
  if (!isBrowser()) return;
  const photos = getProgressPhotos();
  photos.unshift(photo);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

export function deleteProgressPhoto(id: string): void {
  if (!isBrowser()) return;
  const photos = getProgressPhotos().filter((p) => p.id !== id);
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

// ── User Stats ──

export function getUserStats(): UserStats {
  if (!isBrowser()) {
    return { totalWorkouts: 0, totalExercises: 0, currentStreak: 0, longestStreak: 0, lastWorkoutDate: null };
  }
  const data = localStorage.getItem(STATS_KEY);
  if (data) return JSON.parse(data);
  return recalculateStats();
}

export function recalculateStats(): UserStats {
  const logs = getWorkoutLogs().filter((l) => l.completed);
  if (logs.length === 0) {
    const s: UserStats = { totalWorkouts: 0, totalExercises: 0, currentStreak: 0, longestStreak: 0, lastWorkoutDate: null };
    if (isBrowser()) localStorage.setItem(STATS_KEY, JSON.stringify(s));
    return s;
  }

  const totalExercises = logs.reduce((s, l) => s + l.exercises.length, 0);
  const sortedDates = [...new Set(logs.map((l) => l.date.split("T")[0]))].sort();

  let streak = 1, longestStreak = 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) / 86400000;
    if (diff === 1) streak++;
    else { longestStreak = Math.max(longestStreak, streak); streak = 1; }
  }
  longestStreak = Math.max(longestStreak, streak);

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const last = sortedDates[sortedDates.length - 1];
  const currentStreak = (last === today || last === yesterday) ? streak : 0;

  const stats: UserStats = {
    totalWorkouts: logs.length, totalExercises, currentStreak, longestStreak,
    lastWorkoutDate: last,
  };
  if (isBrowser()) localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ── User Profile ──

export function getUserProfile(): UserProfile | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveUserProfile(profile: UserProfile): void {
  if (!isBrowser()) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// ── In-progress workout UI (pause / resume across navigation) ──

export function getWorkoutSessionUI(): WorkoutSessionUIState | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(SESSION_UI_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveWorkoutSessionUI(state: WorkoutSessionUIState | null): void {
  if (!isBrowser()) return;
  if (state === null) localStorage.removeItem(SESSION_UI_KEY);
  else localStorage.setItem(SESSION_UI_KEY, JSON.stringify(state));
}

export function updateLevelsFromLog(log: WorkoutLog): void {
  if (!log.completed) return;
  const profile = getUserProfile();
  if (!profile) return;
  let levels = [...profile.exerciseLevels];
  for (const ex of log.exercises) {
    levels = updateExerciseLevel(levels, ex.exerciseId, ex.sets);
  }
  profile.exerciseLevels = levels;
  saveUserProfile(profile);
}

// ── Active Calisthenics Session ──

export function getActiveCalisthenicsSession(): WorkoutLog | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(ACTIVE_CALISTHENICS_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveActiveCalisthenicsSession(session: WorkoutLog | null): void {
  if (!isBrowser()) return;
  if (session === null) localStorage.removeItem(ACTIVE_CALISTHENICS_SESSION_KEY);
  else localStorage.setItem(ACTIVE_CALISTHENICS_SESSION_KEY, JSON.stringify(session));
}

// ── Active Yoga Session ──

export function getActiveYogaSession(): YogaSession | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(ACTIVE_YOGA_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveActiveYogaSession(session: YogaSession | null): void {
  if (!isBrowser()) return;
  if (session === null) localStorage.removeItem(ACTIVE_YOGA_SESSION_KEY);
  else localStorage.setItem(ACTIVE_YOGA_SESSION_KEY, JSON.stringify(session));
}

// ── Schedule Helpers ──

/**
 * Check if a day of the week matches today's date.
 * Convention: 0=Monday, 1=Tuesday, ..., 6=Sunday
 * JavaScript Date.getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
 * Conversion: (jsDay + 6) % 7
 */
export function isScheduledForToday(dayOfWeek: number): boolean {
  if (!isBrowser()) return false;
  const jsDay = new Date().getDay(); // 0=Sunday
  const appConventionToday = (jsDay + 6) % 7; // Convert to 0=Monday
  return dayOfWeek === appConventionToday;
}

/**
 * Get the day of the week name from index.
 * Convention: 0=Monday, 1=Tuesday, ..., 6=Sunday
 */
export function getDayOfWeekName(dayOfWeek: number): string {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[dayOfWeek] || "Unknown";
}
