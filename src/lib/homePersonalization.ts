import { exercises } from "@/data/exercises";
import { UserProfile, WeeklyPlan, WorkoutExercise, WorkoutLog } from "./types";

export interface ProgressionSuggestion {
  logId: string;
  exerciseId: string;
  currentName: string;
  nextName: string;
}

function localDateOrdinal(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

export function getDaysSinceLastWorkout(logs: WorkoutLog[], now = new Date()): number | null {
  const latest = logs
    .filter((log) => log.completed && Number.isFinite(new Date(log.date).getTime()))
    .reduce<Date | null>((latestDate, log) => {
      const date = new Date(log.date);
      return latestDate === null || date > latestDate ? date : latestDate;
    }, null);
  return latest ? Math.max(0, localDateOrdinal(now) - localDateOrdinal(latest)) : null;
}

export function getHomeGreeting(
  profile: Pick<UserProfile, "displayName"> | null,
  plan: WeeklyPlan | null,
  currentStreak: number,
  now = new Date(),
): string {
  const hour = now.getHours();
  const salutation = hour < 12 && hour >= 5 ? "Good morning" : hour < 17 && hour >= 12 ? "Good afternoon" : "Good evening";
  const name = profile?.displayName?.trim();
  const trainingIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const today = plan?.days[trainingIndex];
  const context = today && !today.isRest ? `${today.name} is up.` : "Your next session is waiting when you are.";
  const streak = currentStreak > 0 ? ` You’re on a ${currentStreak}-day streak.` : "";
  return `${salutation}${name ? `, ${name}` : ""}. ${context}${streak}`;
}

export function getProgressionSuggestion(logs: WorkoutLog[], plans: WeeklyPlan[]): ProgressionSuggestion | null {
  const latestLog = logs
    .filter((log) => log.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  if (!latestLog) return null;

  const plan = plans.find((savedPlan) => savedPlan.id === latestLog.planId);
  const day = plan?.days[latestLog.dayIndex];
  if (!day) return null;

  for (const completedExercise of latestLog.exercises) {
    const prescription = day.exercises.find((exercise) => exercise.exerciseId === completedExercise.exerciseId);
    const currentExercise = exercises.find((exercise) => exercise.id === completedExercise.exerciseId);
    const nextExercise = currentExercise?.progressionTo
      ? exercises.find((exercise) => exercise.id === currentExercise.progressionTo)
      : null;
    if (!prescription || !currentExercise || !nextExercise || completedExercise.sets.length !== prescription.sets) continue;
    const metEverySet = completedExercise.sets.every((set) =>
      set.completed &&
      (prescription.holdSeconds !== null
        ? set.holdSeconds !== null && set.holdSeconds >= prescription.holdSeconds
        : prescription.reps !== null && set.reps !== null && set.reps >= prescription.reps),
    );
    if (metEverySet) {
      return {
        logId: latestLog.id,
        exerciseId: currentExercise.id,
        currentName: currentExercise.name,
        nextName: nextExercise.name,
      };
    }
  }
  return null;
}

function lightenPrescription(exercise: WorkoutExercise): WorkoutExercise {
  return {
    ...exercise,
    sets: Math.max(1, Math.min(2, exercise.sets - 1)),
    reps: exercise.reps === null ? null : Math.max(1, Math.floor(exercise.reps * 0.7)),
    holdSeconds: exercise.holdSeconds === null ? null : Math.max(5, Math.floor(exercise.holdSeconds * 0.7)),
    restSeconds: Math.max(exercise.restSeconds, 90),
  };
}

export function createWelcomeBackPlan(plan: WeeklyPlan, dayIndex: number, id: string, createdAt = new Date().toISOString()): WeeklyPlan {
  if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= plan.days.length) {
    throw new Error("Choose a valid day for the return session.");
  }
  const selectedDay = plan.days[dayIndex];
  const sourceDay = selectedDay && !selectedDay.isRest && selectedDay.exercises.length > 0
    ? selectedDay
    : plan.days.find((day) => !day.isRest && day.exercises.length > 0);
  if (!sourceDay) throw new Error("This plan has no training session to adapt.");

  return {
    ...plan,
    id,
    name: `Welcome Back: ${plan.name}`,
    description: "A lighter return session based on your existing plan.",
    estimatedWeeklyMinutes: 15,
    createdAt,
    days: plan.days.map((day, index) => index === dayIndex
      ? {
          day: day.day,
          name: "Easy Return Session",
          isRest: false,
          focus: "A lighter session to ease back into training",
          exercises: sourceDay.exercises.slice(0, 4).map(lightenPrescription),
        }
      : { day: day.day, name: "Rest & Recovery", isRest: true, exercises: [] }),
  };
}
