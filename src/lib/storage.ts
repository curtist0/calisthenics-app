import { WorkoutLog, UserStats, PersonalRecord, WeeklyPlan, ProgressPhoto, UserProfile, ExerciseLevel, TrainingGoal, WorkoutSessionUIState, TrainingReminder } from "./types";
import { getExerciseById } from "@/data/exercises";
import { updateExerciseLevel } from "./progression";
import { isRestDuration, RestDuration } from "./workoutSession";
import { AccentThemeId, ACCENT_THEMES } from "./gamificationConfig";
import { calculateWorkoutRewards, getForgivingStreak, generateWeeklyChallenge, withChallengeProgress, WeeklyChallenge } from "./gamification";
import { DEFAULT_TRAINING_REMINDER } from "./trainingReminders";

const LOGS_KEY = "calisthenics_logs";
const STATS_KEY = "calisthenics_stats";
const PRS_KEY = "calisthenics_prs";
const PLANS_KEY = "calisthenics_plans";
const PHOTOS_KEY = "calisthenics_photos";
const PROFILE_KEY = "calisthenics_profile";
const SESSION_UI_KEY = "calisthenics_session_ui";
const ACTIVE_WORKOUT_KEY = "calisthenics_active_workout";
const REST_DURATION_KEY = "calisthenics_rest_duration";
const ACCENT_THEME_KEY = "calisthenics_accent_theme";
const WEEKLY_CHALLENGE_KEY = "calisthenics_weekly_challenge";
const TRAINING_REMINDER_KEY = "calisthenics_training_reminder";
const DISMISSED_SUGGESTIONS_KEY = "calisthenics_dismissed_suggestions";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isTrainingReminder(value: unknown): value is TrainingReminder {
  if (typeof value !== "object" || value === null) return false;
  const reminder = value as Record<string, unknown>;
  return typeof reminder.enabled === "boolean" &&
    typeof reminder.time === "string" &&
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(reminder.time) &&
    (reminder.snoozedDate === null || typeof reminder.snoozedDate === "string") &&
    (reminder.lastSentDate === null || typeof reminder.lastSentDate === "string");
}

// ── Workout Logs ──

export function getWorkoutLogs(): WorkoutLog[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWorkoutLog(log: WorkoutLog, awardXp = false): WorkoutLog {
  if (!isBrowser()) return log;
  const logs = getWorkoutLogs();
  const idx = logs.findIndex((l) => l.id === log.id);
  const existing = idx >= 0 ? logs[idx] : null;
  let savedLog = log;
  if (awardXp && log.completed && existing?.xpEarned === undefined) {
    const rewards = calculateWorkoutRewards(log, logs.filter((item) => item.id !== log.id), getUserProfile());
    savedLog = { ...log, ...rewards };
  } else if (existing?.xpEarned !== undefined) {
    savedLog = {
      ...log,
      xpEarned: existing.xpEarned,
      personalRecordsEarned: existing.personalRecordsEarned,
      masteredSkills: existing.masteredSkills,
    };
  }
  if (idx >= 0) logs[idx] = savedLog;
  else logs.push(savedLog);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  updatePRsFromLog(savedLog);
  updateLevelsFromLog(savedLog);
  return savedLog;
}

export function getActiveWorkout(): WorkoutLog | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(ACTIVE_WORKOUT_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveActiveWorkout(workout: WorkoutLog | null): void {
  if (!isBrowser()) return;
  if (workout === null) localStorage.removeItem(ACTIVE_WORKOUT_KEY);
  else localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(workout));
}

export function getRestDuration(): RestDuration {
  if (!isBrowser()) return 90;
  const value = Number(localStorage.getItem(REST_DURATION_KEY));
  return isRestDuration(value) ? value : 90;
}

export function saveRestDuration(seconds: RestDuration): void {
  if (!isBrowser()) return;
  if (!isRestDuration(seconds)) throw new Error("Choose a supported rest duration.");
  localStorage.setItem(REST_DURATION_KEY, String(seconds));
}

// ── Personal Records ──

export function getPersonalRecords(): PersonalRecord[] {
  if (!isBrowser()) return [];
  const records = new Map<string, PersonalRecord>();
  const logs = getWorkoutLogs()
    .filter((log) => log.completed)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  for (const log of logs) {
    const date = log.date.split("T")[0];
    for (const exercise of log.exercises) {
      for (const set of exercise.sets) {
        if (!set.completed) continue;
        const values: { type: PersonalRecord["type"]; value: number | null }[] = [
          { type: "reps", value: set.reps },
          { type: "hold", value: set.holdSeconds },
          { type: "weight", value: set.weightKg },
        ];
        for (const { type, value } of values) {
          if (value === null || value <= 0) continue;
          const key = `${exercise.exerciseId}:${type}`;
          const previous = records.get(key);
          if (!previous || value > previous.value) {
            records.set(key, {
              exerciseId: exercise.exerciseId,
              type,
              value,
              date,
              previousValue: previous?.value ?? null,
            });
          }
        }
        if (set.reps !== null && set.reps > 0 && set.weightKg !== null && set.weightKg > 0) {
          const key = `${exercise.exerciseId}:weighted-reps`;
          const previous = records.get(key);
          if (!previous || set.reps > previous.value || (set.reps === previous.value && set.weightKg > (previous.weightKg ?? 0))) {
            records.set(key, {
              exerciseId: exercise.exerciseId,
              type: "weighted-reps",
              value: set.reps,
              date,
              previousValue: previous?.value ?? null,
              weightKg: set.weightKg,
            });
          }
        }
      }
    }
  }

  const personalRecords = [...records.values()];
  savePRs(personalRecords);
  return personalRecords;
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

  const last = sortedDates[sortedDates.length - 1];
  const forgivingStreak = getForgivingStreak(logs, getSavedPlans());

  const stats: UserStats = {
    totalWorkouts: logs.length, totalExercises,
    currentStreak: forgivingStreak.currentStreak,
    longestStreak: forgivingStreak.longestStreak,
    lastWorkoutDate: last,
  };
  if (isBrowser()) localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export function getAccentTheme(): AccentThemeId {
  if (!isBrowser()) return "lime";
  const saved = localStorage.getItem(ACCENT_THEME_KEY);
  return ACCENT_THEMES.some((theme) => theme.id === saved) ? saved as AccentThemeId : "lime";
}

export function saveAccentTheme(themeId: AccentThemeId): void {
  if (!isBrowser()) return;
  if (!ACCENT_THEMES.some((theme) => theme.id === themeId)) throw new Error("Choose an available accent theme.");
  localStorage.setItem(ACCENT_THEME_KEY, themeId);
}

export function getWeeklyChallenge(logs = getWorkoutLogs(), asOf = new Date()): WeeklyChallenge | null {
  if (!isBrowser()) return null;
  const today = asOf.toISOString().slice(0, 10);
  const currentWeek = (() => {
    const date = new Date(`${today}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    return date.toISOString().slice(0, 10);
  })();
  const savedData = localStorage.getItem(WEEKLY_CHALLENGE_KEY);
  const saved = savedData ? JSON.parse(savedData) as Omit<WeeklyChallenge, "progress"> : null;
  if (saved?.weekStart === currentWeek) return withChallengeProgress(saved, logs);

  const next = generateWeeklyChallenge(logs, asOf);
  if (!next) return null;
  localStorage.setItem(WEEKLY_CHALLENGE_KEY, JSON.stringify(next));
  return withChallengeProgress(next, logs);
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

export function getTrainingReminder(): TrainingReminder {
  if (!isBrowser()) return { ...DEFAULT_TRAINING_REMINDER };
  const data = localStorage.getItem(TRAINING_REMINDER_KEY);
  if (!data) return { ...DEFAULT_TRAINING_REMINDER };
  const reminder: unknown = JSON.parse(data);
  if (!isTrainingReminder(reminder)) {
    throw new Error("Saved training reminder settings are invalid.");
  }
  return reminder;
}

export function saveTrainingReminder(reminder: TrainingReminder): void {
  if (!isBrowser()) return;
  if (!isTrainingReminder(reminder)) throw new Error("Choose valid training reminder settings.");
  localStorage.setItem(TRAINING_REMINDER_KEY, JSON.stringify(reminder));
}

export function getDismissedSuggestions(): string[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(DISMISSED_SUGGESTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function dismissSuggestion(suggestionId: string): void {
  if (!isBrowser()) return;
  const dismissed = getDismissedSuggestions();
  if (!dismissed.includes(suggestionId)) {
    localStorage.setItem(DISMISSED_SUGGESTIONS_KEY, JSON.stringify([...dismissed, suggestionId]));
  }
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
