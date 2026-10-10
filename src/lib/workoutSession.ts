import { CompletedSet, PersonalRecord, WorkoutLog } from "./types";

export const REST_DURATION_OPTIONS = [60, 90, 120, 180] as const;
export type RestDuration = (typeof REST_DURATION_OPTIONS)[number];

export function isRestDuration(value: number): value is RestDuration {
  return REST_DURATION_OPTIONS.includes(value as RestDuration);
}

export function getRestRemainingSeconds(startedAt: string, durationSeconds: number, now = Date.now()): number {
  const startedAtMs = Date.parse(startedAt);
  if (!Number.isFinite(startedAtMs) || !Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.max(0, Math.ceil((startedAtMs + durationSeconds * 1000 - now) / 1000));
}

export function findNextIncompleteSet(workout: WorkoutLog): { exerciseIndex: number; setIndex: number } | null {
  for (let exerciseIndex = 0; exerciseIndex < workout.exercises.length; exerciseIndex++) {
    const setIndex = workout.exercises[exerciseIndex].sets.findIndex((set) => !set.completed);
    if (setIndex >= 0) return { exerciseIndex, setIndex };
  }
  return null;
}

export function getLivePersonalRecord(
  exerciseId: string,
  set: CompletedSet,
  existingValues: { reps: number; hold: number; weight: number; weightedReps: number; weightedRepWeight: number },
  date = new Date().toISOString().split("T")[0],
): PersonalRecord[] {
  const records = [];
  if (set.reps !== null && set.reps > existingValues.reps) {
    records.push({ exerciseId, type: "reps" as const, value: set.reps, date, previousValue: existingValues.reps || null });
  }
  if (set.holdSeconds !== null && set.holdSeconds > existingValues.hold) {
    records.push({ exerciseId, type: "hold" as const, value: set.holdSeconds, date, previousValue: existingValues.hold || null });
  }
  if (set.weightKg !== null && set.weightKg > existingValues.weight) {
    records.push({ exerciseId, type: "weight" as const, value: set.weightKg, date, previousValue: existingValues.weight || null });
  }
  if (set.reps !== null && set.weightKg !== null && set.weightKg > 0
    && (set.reps > existingValues.weightedReps || (set.reps === existingValues.weightedReps && set.weightKg > existingValues.weightedRepWeight))) {
    records.push({
      exerciseId,
      type: "weighted-reps" as const,
      value: set.reps,
      date,
      previousValue: existingValues.weightedReps || null,
      weightKg: set.weightKg,
    });
  }
  return records;
}
