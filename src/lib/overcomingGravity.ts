/**
 * Overcoming Gravity aligned training constants and helpers
 * Based on Steven Low's Overcoming Gravity principles
 */

export type OvercomingGravityGoal = "strength-skill" | "hypertrophy" | "endurance";

/**
 * OG-Aligned Training Goal Configuration
 * Each goal specifies target rep ranges, rest times, and weekly frequency
 */
export const OG_GOAL_CONFIG: Record<
  OvercomingGravityGoal,
  {
    name: string;
    description: string;
    targetReps: { min: number; max: number };
    targetHolds: { min: number; max: number };
    restSeconds: number;
    focus: string;
    setsPerExercise: number;
  }
> = {
  "strength-skill": {
    name: "Strength & Skill",
    description: "Neurological adaptation and skill mastery",
    targetReps: { min: 3, max: 8 },
    targetHolds: { min: 5, max: 15 },
    restSeconds: 180, // 3 minutes for full ATP-PC recovery
    focus: "Neurological adaptation, CNS recovery",
    setsPerExercise: 4,
  },
  hypertrophy: {
    name: "Muscle Growth",
    description: "Hypertrophy with mechanical tension",
    targetReps: { min: 8, max: 15 },
    targetHolds: { min: 15, max: 30 },
    restSeconds: 90, // 1.5 minutes
    focus: "Mechanical tension and time under tension",
    setsPerExercise: 3,
  },
  endurance: {
    name: "Stamina & Work Capacity",
    description: "High rep ranges and muscular endurance",
    targetReps: { min: 15, max: 25 },
    targetHolds: { min: 30, max: 60 },
    restSeconds: 60, // 1 minute
    focus: "Metabolic stress and work capacity",
    setsPerExercise: 3,
  },
};

/**
 * Exercise difficulty to rep/hold modifier for USER SKILL LEVEL
 * Beginners get HIGHER reps (focus on movement quality) but FEWER sets
 * Advanced get LOWER reps (focus on strength) with MORE sets
 * This applies to exercise sets/reps prescription, not individual exercise difficulty
 */
export const SKILL_LEVEL_SET_MODIFIERS = {
  beginner: 0.6,    // 60% of base sets (fewer sets for learning)
  intermediate: 0.85,
  advanced: 1.2,    // 120% of base sets (more sets for specialization)
};

/**
 * Skill level rep range adjustments
 * Beginners use HIGHER rep ranges within each goal to learn movement
 */
export const SKILL_LEVEL_REP_ADJUSTMENTS = {
  beginner: 1.25,    // 25% higher reps (more volume for learning movement quality)
  intermediate: 1.0,
  advanced: 0.8,     // Lower reps, focus on low-rep strength
};

/**
 * Exercise difficulty to rep/hold modifier (legacy, kept for progression levels)
 * Advanced and elite exercises use fewer reps/shorter holds due to difficulty
 */
export const DIFFICULTY_MODIFIERS = {
  beginner: 1.0,
  intermediate: 0.85,
  advanced: 0.6,
  elite: 0.4,
};

/**
 * Map exercise name to GitHub GIF filename
 * Converts "Push-Up" → "push-up" → https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/gifs/push-up.gif
 */
export function getExerciseGifUrl(exerciseName: string): string {
  const formatted = exerciseName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  return `https://raw.githubusercontent.com/omercotkd/exercises-gifs/main/gifs/${formatted}.gif`;
}

/**
 * A/B Split workout structure for preventing boredom
 * Alternates between two different focus areas each workout day
 */
export interface ABSplitConfig {
  dayType: "A" | "B";
  pushVariant: "primary" | "secondary";
  pullVariant: "primary" | "secondary";
  legVariant: "primary" | "secondary";
  focusAreas: string[];
}

/**
 * Generate A/B split configuration for a given day
 */
export function getABSplitConfig(dayIndex: number): ABSplitConfig {
  const dayType = (dayIndex % 2 === 0 ? "A" : "B") as "A" | "B";

  if (dayType === "A") {
    return {
      dayType: "A",
      pushVariant: "primary",
      pullVariant: "primary",
      legVariant: "secondary",
      focusAreas: ["Strength upper body", "Primary push & pull patterns"],
    };
  } else {
    return {
      dayType: "B",
      pushVariant: "secondary",
      pullVariant: "secondary",
      legVariant: "primary",
      focusAreas: ["Legs & complementary upper", "Secondary variations & legs"],
    };
  }
}

/**
 * Progression level terminology aligned with Overcoming Gravity
 */
export function getProgressionLabel(isTargetSkill: boolean, category: string): string {
  if (isTargetSkill) return "🎯 Target Skill";
  if (category === "core" || category === "legs") return "🔧 Supplemental Strength";
  return "💪 Strength Builder";
}
