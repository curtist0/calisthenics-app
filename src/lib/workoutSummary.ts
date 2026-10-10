import { PersonalRecord, WorkoutLog } from "./types";

export interface WorkoutSummaryStats {
  durationSeconds: number;
  durationMinutes: number;
  completedSets: number;
  totalReps: number;
  totalHoldSeconds: number;
  weightedVolume: number;
}

export function summarizeWorkout(workout: WorkoutLog): WorkoutSummaryStats {
  const start = Date.parse(workout.startTime);
  const end = Date.parse(workout.endTime ?? "");
  const durationSeconds = Number.isFinite(start) && Number.isFinite(end)
    ? Math.max(0, Math.round((end - start) / 1000))
    : 0;
  const durationMinutes = Math.round(durationSeconds / 60);
  let completedSets = 0;
  let totalReps = 0;
  let totalHoldSeconds = 0;
  let weightedVolume = 0;

  for (const exercise of workout.exercises) {
    for (const set of exercise.sets) {
      if (!set.completed) continue;
      completedSets += 1;
      if (set.reps !== null) {
        totalReps += set.reps;
        if (set.weightKg !== null) weightedVolume += set.reps * set.weightKg;
      }
      if (set.holdSeconds !== null) totalHoldSeconds += set.holdSeconds;
    }
  }

  return { durationSeconds, durationMinutes, completedSets, totalReps, totalHoldSeconds, weightedVolume };
}

export function formatPersonalRecord(record: PersonalRecord, exerciseName: string): string {
  const result = record.type === "hold"
    ? `${record.value}s hold`
    : record.type === "weight"
      ? `${record.value}kg`
      : record.type === "weighted-reps"
        ? `${record.value} reps at ${record.weightKg ?? 0}kg`
        : `${record.value} reps`;
  return `${exerciseName} · ${result}`;
}

export function getPersonalRecordLines(
  records: PersonalRecord[],
  exerciseName: (exerciseId: string) => string,
  limit = 3,
): { lines: string[]; remaining: number } {
  const lines = records.slice(0, limit).map((record) => formatPersonalRecord(record, exerciseName(record.exerciseId)));
  return { lines, remaining: Math.max(0, records.length - lines.length) };
}

export function wrapMeasuredText(
  text: string,
  maxWidth: number,
  measure: (text: string) => number,
  maxLines = 4,
): { lines: string[]; truncated: boolean } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  let truncated = false;

  for (const word of words) {
    const chunks = measure(word) <= maxWidth
      ? [word]
      : Array.from(word).reduce<string[]>((parts, character) => {
          const index = parts.length - 1;
          const candidate = `${parts[index] ?? ""}${character}`;
          if (measure(candidate) <= maxWidth) parts[index] = candidate;
          else parts.push(character);
          return parts;
        }, []);

    for (const chunk of chunks) {
      const candidate = line ? `${line} ${chunk}` : chunk;
      if (measure(candidate) <= maxWidth) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        line = chunk;
        if (lines.length === maxLines) {
          truncated = true;
          break;
        }
      }
    }
    if (truncated) break;
  }

  if (line && lines.length < maxLines) lines.push(line);
  else if (line) truncated = true;

  if (truncated && lines.length > 0) {
    let lastLine = lines[lines.length - 1];
    while (lastLine && measure(`${lastLine}…`) > maxWidth) {
      lastLine = Array.from(lastLine).slice(0, -1).join("");
    }
    lines[lines.length - 1] = `${lastLine}…`;
  }

  return { lines, truncated };
}
