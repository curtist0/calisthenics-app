import { Rank, UserProfile, WorkoutLog } from "./types";
import { exercises } from "@/data/exercises";

type MovementPlane = "push" | "pull" | "core" | "legs";

interface PlaneStats {
  totalSets: number;
  totalReps: number;
  averageReps: number;
}

/**
 * Map exercise categories to movement planes
 */
function getMovementPlane(exerciseId: string): MovementPlane | null {
  const exercise = exercises.find((e) => e.id === exerciseId);
  if (!exercise) return null;

  // Map exercise categories to movement planes
  const categoryToPlane: Record<string, MovementPlane | null> = {
    push: "push",
    pull: "pull",
    core: "core",
    legs: "legs",
    "full-body": null, // Skip full-body exercises
    skill: null, // Skip skill exercises
  };

  return categoryToPlane[exercise.category] || null;
}

/**
 * Calculate statistics for a movement plane from workout logs
 */
function calculatePlaneStats(
  logs: WorkoutLog[],
  plane: MovementPlane
): PlaneStats {
  let totalSets = 0;
  let totalReps = 0;

  for (const log of logs) {
    for (const ex of log.exercises) {
      const plane_ = getMovementPlane(ex.exerciseId);
      if (plane_ !== plane) continue;

      for (const set of ex.sets) {
        if (set.completed) {
          totalSets += 1;
          // Use reps if available, otherwise estimate from hold seconds
          if (set.reps !== null) {
            totalReps += set.reps;
          } else if (set.holdSeconds !== null) {
            // Convert hold time to rep equivalent (roughly 1 rep = 2 seconds for holds)
            totalReps += Math.ceil(set.holdSeconds / 2);
          }
        }
      }
    }
  }

  const averageReps = totalSets > 0 ? totalReps / totalSets : 0;

  return {
    totalSets,
    totalReps,
    averageReps,
  };
}

/**
 * Map average reps to a rank
 */
function repsToRank(averageReps: number): Rank {
  if (averageReps >= 12) return "S";
  if (averageReps >= 10) return "A";
  if (averageReps >= 8) return "B";
  if (averageReps >= 6) return "C";
  if (averageReps >= 4) return "D";
  if (averageReps >= 2) return "E";
  return "F";
}

/**
 * Calculate ranks for all movement planes from workout logs
 */
export function calculateRanks(
  profile: UserProfile,
  logs: WorkoutLog[]
): { push: Rank; pull: Rank; core: Rank; legs: Rank } {
  const completedLogs = logs.filter((l) => l.completed);

  const pushStats = calculatePlaneStats(completedLogs, "push");
  const pullStats = calculatePlaneStats(completedLogs, "pull");
  const coreStats = calculatePlaneStats(completedLogs, "core");
  const legsStats = calculatePlaneStats(completedLogs, "legs");

  return {
    push: repsToRank(pushStats.averageReps),
    pull: repsToRank(pullStats.averageReps),
    core: repsToRank(coreStats.averageReps),
    legs: repsToRank(legsStats.averageReps),
  };
}
