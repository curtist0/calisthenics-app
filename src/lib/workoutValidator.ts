/**
 * Workout Validator
 * Checks if generated workouts are appropriate for user profiles across:
 * - Exercise difficulty vs user skill level
 * - Volume appropriateness (sets/reps/hold times)
 * - Recovery (rest between sets, deload weeks)
 * - Progressive overload patterns
 * - Safety considerations
 */

import { WeeklyPlan, DayWorkout, WorkoutExercise } from "./types";
import { getExerciseById } from "@/data/exercises";

export interface WorkoutValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  score: number; // 0-100, higher is better
}

export interface ValidationIssue {
  severity: "error" | "warning";
  day: number;
  exercise?: string;
  message: string;
}

export interface ValidationWarning {
  day: number;
  exercise?: string;
  message: string;
}

interface UserProfile {
  skillLevel: "beginner" | "intermediate" | "advanced";
  trainingMonths: number; // How many months of training experience
}

/**
 * Validate that a generated workout plan is appropriate for the user
 */
export function validateWorkoutPlan(
  plan: WeeklyPlan,
  userProfile: UserProfile
): WorkoutValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];
  let score = 100;

  // 1. Check exercise difficulty alignment
  const difficultyCheck = checkDifficultyAlignment(plan, userProfile);
  issues.push(...difficultyCheck.issues);
  warnings.push(...difficultyCheck.warnings);
  score -= difficultyCheck.issues.length * 10;
  score -= difficultyCheck.warnings.length * 3;

  // 2. Check volume appropriateness
  const volumeCheck = checkVolumeAppropriate(plan, userProfile);
  issues.push(...volumeCheck.issues);
  warnings.push(...volumeCheck.warnings);
  score -= volumeCheck.issues.length * 10;
  score -= volumeCheck.warnings.length * 3;

  // 3. Check recovery patterns
  const recoveryCheck = checkRecoveryPatterns(plan, userProfile);
  issues.push(...recoveryCheck.issues);
  warnings.push(...recoveryCheck.warnings);
  score -= recoveryCheck.issues.length * 10;
  score -= recoveryCheck.warnings.length * 3;

  // 4. Check progressive overload
  const overloadCheck = checkProgressiveOverload(plan, userProfile);
  issues.push(...overloadCheck.issues);
  warnings.push(...overloadCheck.warnings);
  score -= overloadCheck.issues.length * 5;
  score -= overloadCheck.warnings.length * 2;

  // 5. Check for deload week
  const deloadCheck = checkDeloadWeek(plan);
  issues.push(...deloadCheck.issues);
  warnings.push(...deloadCheck.warnings);
  score -= deloadCheck.issues.length * 15; // Deload is important
  score -= deloadCheck.warnings.length * 5;

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    score: Math.max(0, score),
  };
}

/**
 * Check if exercise difficulties match user skill level
 */
function checkDifficultyAlignment(
  plan: WeeklyPlan,
  userProfile: UserProfile
): { issues: ValidationIssue[]; warnings: ValidationWarning[] } {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];

  plan.days.forEach((day, dayIndex) => {
    if (day.isRest) return;

    day.exercises.forEach((we) => {
      const exercise = getExerciseById(we.exerciseId);
      if (!exercise) return;

      // Beginners should mostly do beginner-intermediate exercises
      if (
        userProfile.skillLevel === "beginner" &&
        (exercise.difficulty === "advanced" || exercise.difficulty === "elite")
      ) {
        issues.push({
          severity: "error",
          day: dayIndex,
          exercise: exercise.name,
          message: `Beginner doing ${exercise.difficulty} exercise "${exercise.name}". Risk of injury or frustration.`,
        });
      }

      // Intermediates can do all but elite
      if (
        userProfile.skillLevel === "intermediate" &&
        exercise.difficulty === "elite"
      ) {
        warnings.push({
          day: dayIndex,
          exercise: exercise.name,
          message: `Intermediate doing elite exercise "${exercise.name}". Consider more progression steps.`,
        });
      }

      // Check if beginner enough for low-experience users
      if (userProfile.trainingMonths < 3 && exercise.difficulty !== "beginner") {
        warnings.push({
          day: dayIndex,
          exercise: exercise.name,
          message: `User has < 3 months experience. "${exercise.name}" may be too advanced. Consider more beginner progressions.`,
        });
      }
    });
  });

  return { issues, warnings };
}

/**
 * Check if sets/reps/holds are appropriate for user level
 */
function checkVolumeAppropriate(
  plan: WeeklyPlan,
  userProfile: UserProfile
): { issues: ValidationIssue[]; warnings: ValidationWarning[] } {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];

  plan.days.forEach((day, dayIndex) => {
    if (day.isRest) return;

    day.exercises.forEach((we) => {
      const exercise = getExerciseById(we.exerciseId);
      if (!exercise) return;

      // Beginners with 4+ sets may be too much
      if (
        userProfile.skillLevel === "beginner" &&
        userProfile.trainingMonths < 6 &&
        we.sets > 3
      ) {
        warnings.push({
          day: dayIndex,
          exercise: exercise.name,
          message: `Beginner (<6mo) assigned ${we.sets} sets of "${exercise.name}". Consider 2-3 sets for learning phase.`,
        });
      }

      // Hold times for beginners should be shorter
      if (
        exercise.isHold &&
        userProfile.skillLevel === "beginner" &&
        we.holdSeconds &&
        we.holdSeconds > 20
      ) {
        warnings.push({
          day: dayIndex,
          exercise: exercise.name,
          message: `Beginner assigned ${we.holdSeconds}s holds. Consider starting with 10-15s holds.`,
        });
      }

      // Rest periods should be adequate
      if (
        userProfile.skillLevel === "beginner" &&
        we.restSeconds < 60 &&
        exercise.category === "push"
      ) {
        warnings.push({
          day: dayIndex,
          exercise: exercise.name,
          message: `${we.restSeconds}s rest may be too short for beginners. Consider 90-120s between push sets.`,
        });
      }

      // Very high rep ranges for beginners
      if (
        userProfile.skillLevel === "beginner" &&
        we.reps &&
        we.reps > 20
      ) {
        warnings.push({
          day: dayIndex,
          exercise: exercise.name,
          message: `${we.reps} reps may be excessive for beginners. Consider 5-12 rep range for learning.`,
        });
      }
    });
  });

  return { issues, warnings };
}

/**
 * Check recovery patterns (rest days, frequency)
 */
function checkRecoveryPatterns(
  plan: WeeklyPlan,
  userProfile: UserProfile
): { issues: ValidationIssue[]; warnings: ValidationWarning[] } {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];

  // Count training days per week
  const trainingDaysPerWeek = plan.days
    .slice(0, 7)
    .filter((d) => !d.isRest).length;

  // Beginners shouldn't do more than 3-4x per week
  if (userProfile.skillLevel === "beginner" && trainingDaysPerWeek > 4) {
    issues.push({
      severity: "error",
      day: 0,
      message: `Beginner assigned ${trainingDaysPerWeek}x per week. High risk of overtraining. Max 3-4x for beginners.`,
    });
  }

  // Should have at least 2-3 rest days per week for anyone
  const restDaysPerWeek = plan.days.slice(0, 7).filter((d) => d.isRest).length;
  if (restDaysPerWeek < 2) {
    issues.push({
      severity: "error",
      day: 0,
      message: `Only ${restDaysPerWeek} rest day(s) per week. Minimum 2-3 rest days needed for recovery.`,
    });
  }

  return { issues, warnings };
}

/**
 * Check if progressive overload is structured properly
 */
function checkProgressiveOverload(
  plan: WeeklyPlan,
  userProfile: UserProfile
): { issues: ValidationIssue[]; warnings: ValidationWarning[] } {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];

  // Check week-to-week progression
  const week1 = plan.days.slice(0, 7);
  const week4 = plan.days.slice(21, 28);

  const week1Sets = week1
    .filter((d) => !d.isRest)
    .flatMap((d) => d.exercises)
    .reduce((sum, e) => sum + e.sets, 0);

  const week4Sets = week4
    .filter((d) => !d.isRest)
    .flatMap((d) => d.exercises)
    .reduce((sum, e) => sum + e.sets, 0);

  // Week 4 should have similar or slightly more volume than week 1
  if (week4Sets < week1Sets * 0.8) {
    warnings.push({
      day: 21,
      message: `Week 4 has less volume than Week 1 (${week4Sets} vs ${week1Sets} total sets). Progressive overload pattern weak.`,
    });
  }

  return { issues, warnings };
}

/**
 * Check that week 6 is mandatory deload
 */
function checkDeloadWeek(plan: WeeklyPlan): {
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
} {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];

  const week6Days = plan.days.slice(35, 42);
  const week6Training = week6Days.filter((d) => !d.isRest);

  // Check if week 6 has deload pattern
  const isDeload = week6Training.every((d) =>
    d.focus?.toLowerCase().includes("deload")
  );

  if (!isDeload) {
    warnings.push({
      day: 35,
      message:
        "Week 6 should be mandatory deload week. Pattern not detected. Overtraining risk.",
    });
  }

  // Check if week 6 has very low volume
  const week6Sets = week6Training.reduce((sum, day) => {
    return sum + day.exercises.reduce((s, e) => s + e.sets, 0);
  }, 0);

  const week5Sets = plan.days
    .slice(28, 35)
    .filter((d) => !d.isRest)
    .reduce((sum, day) => {
      return sum + day.exercises.reduce((s, e) => s + e.sets, 0);
    }, 0);

  if (week6Sets > week5Sets * 0.7) {
    warnings.push({
      day: 35,
      message: `Week 6 should have significantly reduced volume for deload. Current: ${week6Sets} sets vs Week 5: ${week5Sets}.`,
    });
  }

  return { issues, warnings };
}

/**
 * Generate human-readable validation report
 */
export function generateValidationReport(result: WorkoutValidationResult): string {
  let report = "\n📋 WORKOUT VALIDATION REPORT\n";
  report += "═".repeat(50) + "\n\n";

  // Score
  report += `Score: ${result.score}/100 `;
  if (result.score >= 85) report += "✅ EXCELLENT\n";
  else if (result.score >= 70) report += "⚠️  GOOD\n";
  else if (result.score >= 50) report += "⚠️  NEEDS ATTENTION\n";
  else report += "❌ POOR\n";

  // Status
  report += `Status: ${result.isValid ? "✅ VALID" : "❌ INVALID"}\n\n`;

  // Issues
  if (result.issues.length > 0) {
    report += "🔴 CRITICAL ISSUES:\n";
    result.issues.forEach((issue) => {
      report += `  • Day ${issue.day}${issue.exercise ? ` (${issue.exercise})` : ""}\n`;
      report += `    ${issue.message}\n`;
    });
    report += "\n";
  }

  // Warnings
  if (result.warnings.length > 0) {
    report += "🟡 WARNINGS:\n";
    result.warnings.forEach((warning) => {
      report += `  • Day ${warning.day}${warning.exercise ? ` (${warning.exercise})` : ""}\n`;
      report += `    ${warning.message}\n`;
    });
    report += "\n";
  }

  if (result.issues.length === 0 && result.warnings.length === 0) {
    report += "✅ No issues detected!\n\n";
  }

  return report;
}
