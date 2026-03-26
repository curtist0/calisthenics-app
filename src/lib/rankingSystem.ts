import { Rank, UserProfile, WorkoutLog, TrainingMode, RankingDecision } from "./types";
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
 * Calculate strength rank based on highest elite skills achievable
 * Maps progression level to rank
 */
function calculateStrengthRank(logs: WorkoutLog[]): Rank {
  let highestProgression = 0;
  
  for (const log of logs) {
    if (!log.completed) continue;
    for (const ex of log.exercises) {
      const progression = getProgressionDifficulty(ex.exerciseId);
      if (progression > highestProgression) {
        highestProgression = progression;
      }
    }
  }
  
  return progressionToRank(highestProgression);
}

/**
 * Calculate endurance rank based on total reps completed across basic skills
 * Aggregates all bodyweight/calisthenics exercises
 */
function calculateEnduranceRank(logs: WorkoutLog[]): Rank {
  let totalReps = 0;
  
  for (const log of logs) {
    if (!log.completed) continue;
    for (const ex of log.exercises) {
      const exercise = getExerciseById(ex.exerciseId);
      if (!exercise) continue;
      
      // Count bodyweight exercises (empty equipment or calisthenics)
      const isBodyweight = !exercise.equipment || exercise.equipment.length === 0;
      if (!isBodyweight) continue;
      
      for (const set of ex.sets) {
        if (set.completed) {
          if (set.reps !== null) {
            totalReps += set.reps;
          } else if (set.holdSeconds !== null) {
            // Convert holds to rep equivalents (each 2s = 1 rep)
            totalReps += Math.ceil(set.holdSeconds / 2);
          }
        }
      }
    }
  }
  
  // Scale: F<50, E<100, D<200, C<500, B<1000, A<2000, S>=2000
  if (totalReps >= 2000) return "S";
  if (totalReps >= 1000) return "A";
  if (totalReps >= 500) return "B";
  if (totalReps >= 200) return "C";
  if (totalReps >= 100) return "D";
  if (totalReps >= 50) return "E";
  return "F";
}

/**
 * Calculate balance rank based on yoga session frequency
 * Only available if user has set up yoga
 */
function calculateBalanceRank(logs: WorkoutLog[]): Rank {
  const completedYogaLogs = logs.filter((l) => l.completed && l.exercises.some((ex) => getYogaPoseById(ex.exerciseId)));
  
  const sessionCount = completedYogaLogs.length;
  
  // Scale: F=0, E=1-2, D=3-5, C=6-10, B=10-15, A=15-20, S>=20
  if (sessionCount >= 20) return "S";
  if (sessionCount >= 15) return "A";
  if (sessionCount >= 10) return "B";
  if (sessionCount >= 6) return "C";
  if (sessionCount >= 3) return "D";
  if (sessionCount >= 1) return "E";
  return "F";
}

/**
 * Check if training mode decision is locked (within 24 hours)
 */
export function isTrainingModeLocked(rankingDecision: RankingDecision | undefined): boolean {
  if (!rankingDecision) return false;
  const canChangeAt = new Date(rankingDecision.canChangeAt);
  return new Date() < canChangeAt;
}

/**
 * Get remaining time until training mode can be changed
 * Returns { hours, minutes, seconds } or null if not locked
 */
export function getTimeUntilUnlock(rankingDecision: RankingDecision | undefined): { hours: number; minutes: number; seconds: number } | null {
  if (!rankingDecision) return null;
  const canChangeAt = new Date(rankingDecision.canChangeAt);
  const now = new Date();
  
  if (now >= canChangeAt) return null;
  
  const diff = canChangeAt.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}

/**
 * Create a new ranking decision with 24-hour lock
 */
export function createRankingDecision(trainingMode: TrainingMode): RankingDecision {
  const now = new Date();
  const canChangeAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return {
    trainingMode,
    decidedAt: now.toISOString(),
    canChangeAt: canChangeAt.toISOString(),
  };
}
export function calculateRanks(
  profile: UserProfile,
  logs: WorkoutLog[]
): EnhancedRanks {
  const completedLogs = logs.filter((l) => l.completed);
  const rankEstablished = isRankEstablished(completedLogs);
  const rankStatus: RankStatus = rankEstablished ? "established" : "estimated";
  const trainingMode = profile.rankingDecision?.trainingMode || "strength";

  // Calculate plane stats for push/pull/core/legs
  const pushStats = calculatePlaneStats(completedLogs, "push");
  const pullStats = calculatePlaneStats(completedLogs, "pull");
  const coreStats = calculatePlaneStats(completedLogs, "core");
  const legsStats = calculatePlaneStats(completedLogs, "legs");

  // Calculate ranks based on training mode
  let pushRank: Rank;
  let pullRank: Rank;
  let coreRank: Rank;
  let legsRank: Rank;

  if (trainingMode === "strength") {
    // Strength mode: Map to elite skills achievable
    pushRank = pushStats.highestProgressionLevel > 0
      ? progressionToRank(pushStats.highestProgressionLevel)
      : repsToRank(pushStats.averageReps);
    
    pullRank = pullStats.highestProgressionLevel > 0
      ? progressionToRank(pullStats.highestProgressionLevel)
      : repsToRank(pullStats.averageReps);
    
    coreRank = coreStats.highestProgressionLevel > 0
      ? progressionToRank(coreStats.highestProgressionLevel)
      : repsToRank(coreStats.averageReps);
    
    legsRank = legsStats.highestProgressionLevel > 0
      ? progressionToRank(legsStats.highestProgressionLevel)
      : repsToRank(legsStats.averageReps);
  } else {
    // Endurance mode: Map to total reps
    // For endurance, we still track movement planes but weight is on volume
    pushRank = pushStats.totalReps > 0 ? repsToRank(pushStats.averageReps) : "F";
    pullRank = pullStats.totalReps > 0 ? repsToRank(pullStats.averageReps) : "F";
    coreRank = coreStats.totalReps > 0 ? repsToRank(coreStats.averageReps) : "F";
    legsRank = legsStats.totalReps > 0 ? repsToRank(legsStats.averageReps) : "F";
  }

  const result: EnhancedRanks = {
    push: { rank: pushRank, status: rankStatus, workoutCount: completedLogs.length },
    pull: { rank: pullRank, status: rankStatus, workoutCount: completedLogs.length },
    core: { rank: coreRank, status: rankStatus, workoutCount: completedLogs.length },
    legs: { rank: legsRank, status: rankStatus, workoutCount: completedLogs.length },
    balance: {
      rank: profile.yogaSetUp ? calculateBalanceRank(completedLogs) : "F",
      status: rankStatus,
      workoutCount: completedLogs.filter((l) => l.exercises.some((ex) => getYogaPoseById(ex.exerciseId))).length,
    },
  };

  // Add flexibility rank if yoga is set up
  if (profile.yogaSetUp) {
    result.flexibility = {
      rank: calculateFlexibilityRank(completedLogs),
      status: rankStatus,
      workoutCount: completedLogs.filter((l) => l.exercises.some((ex) => getYogaPoseById(ex.exerciseId))).length,
    };
  }

  return result;
}
