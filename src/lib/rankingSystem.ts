import { Rank, UserProfile, WorkoutLog } from "./types";
import { exercises, getExerciseById } from "@/data/exercises";
import { getYogaPoseById } from "@/data/yoga";

type MovementPlane = "push" | "pull" | "core" | "legs";
type RankStatus = "estimated" | "established";

export interface EnhancedRank {
  rank: Rank;
  status: RankStatus;
  highestExercise?: string;
  workoutCount?: number;
}

export interface EnhancedRanks {
  push: EnhancedRank;
  pull: EnhancedRank;
  core: EnhancedRank;
  legs: EnhancedRank;
  flexibility?: EnhancedRank;
  balance?: EnhancedRank;
}

interface PlaneStats {
  totalSets: number;
  totalReps: number;
  averageReps: number;
  highestProgressionLevel: number;
}

/**
 * Map exercise categories to movement planes
 */
function getMovementPlane(exerciseId: string): MovementPlane | null {
  const exercise = exercises.find((e) => e.id === exerciseId);
  if (!exercise) return null;

  const categoryToPlane: Record<string, MovementPlane | null> = {
    push: "push",
    pull: "pull",
    core: "core",
    legs: "legs",
    "full-body": null,
    skill: null,
  };

  return categoryToPlane[exercise.category] || null;
}

/**
 * Get progression difficulty value for an exercise (0-5 scale)
 */
function getProgressionDifficulty(exerciseId: string): number {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return 0;

  const difficultyScale: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    elite: 4,
  };

  return difficultyScale[exercise.difficulty] || 0;
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
  let highestProgressionLevel = 0;

  for (const log of logs) {
    if (!log.completed) continue;
    
    for (const ex of log.exercises) {
      const plane_ = getMovementPlane(ex.exerciseId);
      if (plane_ !== plane) continue;

      const progressionDiff = getProgressionDifficulty(ex.exerciseId);
      if (progressionDiff > highestProgressionLevel) {
        highestProgressionLevel = progressionDiff;
      }

      for (const set of ex.sets) {
        if (set.completed) {
          totalSets += 1;
          if (set.reps !== null) {
            totalReps += set.reps;
          } else if (set.holdSeconds !== null) {
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
    highestProgressionLevel,
  };
}

/**
 * Map progression level to a rank
 */
function progressionToRank(progressionLevel: number): Rank {
  if (progressionLevel >= 4) return "S"; // Elite exercises
  if (progressionLevel >= 3) return "A"; // Advanced exercises
  if (progressionLevel >= 2) return "B"; // Intermediate exercises
  if (progressionLevel >= 1) return "C"; // Beginner exercises
  return "F"; // No exercises completed
}

/**
 * Map average reps to a rank (secondary fallback)
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
 * Determine if a rank is "established" (after 3+ completed workouts)
 */
function isRankEstablished(logs: WorkoutLog[]): boolean {
  const completedWorkouts = logs.filter((l) => l.completed).length;
  return completedWorkouts >= 3;
}

/**
 * Calculate yoga flexibility rank from pose completions
 */
function calculateFlexibilityRank(logs: WorkoutLog[]): Rank {
  const completedYogaLogs = logs.filter((l) => l.completed && l.exercises.some((ex) => getYogaPoseById(ex.exerciseId)));
  
  if (completedYogaLogs.length === 0) return "F";
  
  let totalDifficulty = 0;
  let poseCount = 0;

  for (const log of completedYogaLogs) {
    for (const ex of log.exercises) {
      const pose = getYogaPoseById(ex.exerciseId);
      if (pose) {
        poseCount++;
        const diffScale = { beginner: 1, intermediate: 2, advanced: 3, elite: 4 };
        totalDifficulty += diffScale[pose.difficulty] || 0;
      }
    }
  }

  const avgDifficulty = poseCount > 0 ? totalDifficulty / poseCount : 0;

  if (avgDifficulty >= 3.5) return "S";
  if (avgDifficulty >= 3) return "A";
  if (avgDifficulty >= 2.5) return "B";
  if (avgDifficulty >= 2) return "C";
  if (avgDifficulty >= 1.5) return "D";
  return "E";
}

/**
 * Calculate yoga balance rank (based on practice frequency and variety)
 */
function calculateBalanceRank(logs: WorkoutLog[], yogaSetUp: boolean): Rank {
  if (!yogaSetUp) return "F";

  const completedYogaLogs = logs.filter((l) => l.completed && l.exercises.some((ex) => getYogaPoseById(ex.exerciseId)));
  
  if (completedYogaLogs.length === 0) return "F";
  
  // Base rank on number of yoga sessions
  const sessionCount = completedYogaLogs.length;
  
  if (sessionCount >= 20) return "S";
  if (sessionCount >= 15) return "A";
  if (sessionCount >= 10) return "B";
  if (sessionCount >= 6) return "C";
  if (sessionCount >= 3) return "D";
  return "E";
}

/**
 * Calculate ranks for all movement planes from workout logs with progression-based gating
 */
export function calculateRanks(
  profile: UserProfile,
  logs: WorkoutLog[]
): EnhancedRanks {
  const completedLogs = logs.filter((l) => l.completed);
  const rankEstablished = isRankEstablished(completedLogs);
  const rankStatus: RankStatus = rankEstablished ? "established" : "estimated";

  const pushStats = calculatePlaneStats(completedLogs, "push");
  const pullStats = calculatePlaneStats(completedLogs, "pull");
  const coreStats = calculatePlaneStats(completedLogs, "core");
  const legsStats = calculatePlaneStats(completedLogs, "legs");

  // Gate ranks by progression level, with rep average as tiebreaker
  const pushRank = pushStats.highestProgressionLevel > 0
    ? progressionToRank(pushStats.highestProgressionLevel)
    : repsToRank(pushStats.averageReps);

  const pullRank = pullStats.highestProgressionLevel > 0
    ? progressionToRank(pullStats.highestProgressionLevel)
    : repsToRank(pullStats.averageReps);

  const coreRank = coreStats.highestProgressionLevel > 0
    ? progressionToRank(coreStats.highestProgressionLevel)
    : repsToRank(coreStats.averageReps);

  const legsRank = legsStats.highestProgressionLevel > 0
    ? progressionToRank(legsStats.highestProgressionLevel)
    : repsToRank(legsStats.averageReps);

  const result: EnhancedRanks = {
    push: { rank: pushRank, status: rankStatus, workoutCount: completedLogs.length },
    pull: { rank: pullRank, status: rankStatus, workoutCount: completedLogs.length },
    core: { rank: coreRank, status: rankStatus, workoutCount: completedLogs.length },
    legs: { rank: legsRank, status: rankStatus, workoutCount: completedLogs.length },
  };

  // Add flexibility and balance ranks if yoga is set up
  if (profile.yogaSetUp) {
    result.flexibility = {
      rank: calculateFlexibilityRank(completedLogs),
      status: rankStatus,
      workoutCount: logs.filter((l) => l.completed && l.exercises.some((ex) => getYogaPoseById(ex.exerciseId))).length,
    };
    result.balance = {
      rank: calculateBalanceRank(logs, profile.yogaSetUp),
      status: rankStatus,
      workoutCount: logs.filter((l) => l.completed && l.exercises.some((ex) => getYogaPoseById(ex.exerciseId))).length,
    };
  }

  return result;
}
