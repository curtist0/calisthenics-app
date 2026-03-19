import { Difficulty, ExerciseLevel, CompletedSet } from "./types";
import { getExerciseById } from "@/data/exercises";

const THRESHOLDS: Record<string, { intermediate: number; advanced: number; elite: number }> = {
  "push-up":     { intermediate: 15, advanced: 30, elite: 50 },
  "diamond-push-up": { intermediate: 10, advanced: 20, elite: 35 },
  "pike-push-up": { intermediate: 8, advanced: 15, elite: 25 },
  "dips":        { intermediate: 10, advanced: 20, elite: 30 },
  "pull-up":     { intermediate: 5, advanced: 12, elite: 20 },
  "chin-up":     { intermediate: 6, advanced: 14, elite: 22 },
  "australian-pull-up": { intermediate: 12, advanced: 20, elite: 30 },
  "squat":       { intermediate: 20, advanced: 40, elite: 60 },
  "pistol-squat": { intermediate: 3, advanced: 8, elite: 15 },
  "lunge":       { intermediate: 12, advanced: 20, elite: 30 },
  "calf-raise":  { intermediate: 15, advanced: 25, elite: 40 },
  "jump-squat":  { intermediate: 10, advanced: 20, elite: 30 },
  "hanging-leg-raise": { intermediate: 8, advanced: 15, elite: 25 },
  "burpee":      { intermediate: 10, advanced: 20, elite: 30 },
  "bear-crawl":  { intermediate: 10, advanced: 20, elite: 30 },
  "muscle-up":   { intermediate: 1, advanced: 5, elite: 10 },
  "handstand-push-up": { intermediate: 3, advanced: 8, elite: 15 },
  "dragon-flag": { intermediate: 3, advanced: 8, elite: 12 },
  "pseudo-planche-push-up": { intermediate: 5, advanced: 12, elite: 20 },
  "freestanding-hspu": { intermediate: 1, advanced: 3, elite: 8 },
};

const HOLD_THRESHOLDS: Record<string, { intermediate: number; advanced: number; elite: number }> = {
  "plank":           { intermediate: 30, advanced: 60, elite: 120 },
  "hollow-body-hold": { intermediate: 20, advanced: 40, elite: 60 },
  "l-sit":           { intermediate: 10, advanced: 20, elite: 30 },
  "v-sit":           { intermediate: 5, advanced: 12, elite: 20 },
  "manna":           { intermediate: 3, advanced: 8, elite: 15 },
  "tuck-planche":    { intermediate: 5, advanced: 12, elite: 20 },
  "straddle-planche": { intermediate: 3, advanced: 8, elite: 15 },
  "full-planche":    { intermediate: 2, advanced: 5, elite: 10 },
  "tuck-front-lever": { intermediate: 8, advanced: 15, elite: 25 },
  "front-lever":     { intermediate: 3, advanced: 8, elite: 15 },
  "back-lever":      { intermediate: 5, advanced: 12, elite: 20 },
  "90-degree-hold":  { intermediate: 3, advanced: 6, elite: 10 },
  "human-flag":      { intermediate: 3, advanced: 8, elite: 15 },
};

export function calculateLevel(exerciseId: string, bestReps: number, bestHold: number): Difficulty {
  const repThresh = THRESHOLDS[exerciseId];
  const holdThresh = HOLD_THRESHOLDS[exerciseId];
  const ex = getExerciseById(exerciseId);
  if (!ex) return "beginner";

  if (ex.isHold && holdThresh) {
    if (bestHold >= holdThresh.elite) return "elite";
    if (bestHold >= holdThresh.advanced) return "advanced";
    if (bestHold >= holdThresh.intermediate) return "intermediate";
    return "beginner";
  }

  if (repThresh) {
    if (bestReps >= repThresh.elite) return "elite";
    if (bestReps >= repThresh.advanced) return "advanced";
    if (bestReps >= repThresh.intermediate) return "intermediate";
    return "beginner";
  }

  return "beginner";
}

export function updateExerciseLevel(
  levels: ExerciseLevel[],
  exerciseId: string,
  sets: CompletedSet[]
): ExerciseLevel[] {
  const updated = [...levels];
  let existing = updated.find((l) => l.exerciseId === exerciseId);

  let bestReps = existing?.bestReps ?? 0;
  let bestHold = existing?.bestHold ?? 0;

  for (const set of sets) {
    if (set.completed && set.reps !== null) bestReps = Math.max(bestReps, set.reps);
    if (set.completed && set.holdSeconds !== null) bestHold = Math.max(bestHold, set.holdSeconds);
  }

  const newLevel = calculateLevel(exerciseId, bestReps, bestHold);
  const now = new Date().toISOString();

  if (existing) {
    existing.bestReps = bestReps;
    existing.bestHold = bestHold;
    existing.level = newLevel;
    existing.lastUpdated = now;
  } else {
    updated.push({ exerciseId, level: newLevel, bestReps, bestHold, lastUpdated: now });
  }

  return updated;
}

export function getExerciseLevel(levels: ExerciseLevel[], exerciseId: string): Difficulty {
  return levels.find((l) => l.exerciseId === exerciseId)?.level ?? "beginner";
}
