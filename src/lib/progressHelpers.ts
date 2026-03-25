/**
 * Helper functions for Progress screen
 */

export interface ProgressData {
  exerciseId: string;
  exerciseName: string;
  current: number;
  goal: number;
  previous: number;
  type: "reps" | "hold" | "weight";
  trend: number[];
  date: string;
}

/**
 * Format growth delta to 1 decimal place
 */
export function formatGrowthDelta(value: number): string {
  if (isNaN(value)) return "0.0";
  return (value).toFixed(1);
}

/**
 * Calculate percentage for progress ring
 */
export function calculateProgressPercentage(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, (current / goal) * 100);
}

/**
 * Stable mock data for progress stats (never changes on reload)
 */
export const mockProgressData: ProgressData[] = [
  {
    exerciseId: "push-up",
    exerciseName: "Push-Up",
    current: 14,
    goal: 20,
    previous: 12,
    type: "reps",
    trend: [10, 11, 12, 13, 12, 13, 14],
    date: new Date().toISOString(),
  },
  {
    exerciseId: "plank",
    exerciseName: "Plank",
    current: 45,
    goal: 60,
    previous: 40,
    type: "hold",
    trend: [30, 32, 35, 38, 40, 42, 45],
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    exerciseId: "squat",
    exerciseName: "Bodyweight Squat",
    current: 28,
    goal: 50,
    previous: 25,
    type: "reps",
    trend: [20, 21, 22, 24, 25, 27, 28],
    date: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    exerciseId: "pull-up",
    exerciseName: "Pull-Up",
    current: 8,
    goal: 15,
    previous: 7,
    type: "reps",
    trend: [4, 5, 6, 6, 7, 7, 8],
    date: new Date(Date.now() - 259200000).toISOString(),
  },
];

/**
 * Achievement/Badge definitions
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: string;
  unlocked: boolean;
  emoji: string;
}

export const achievements: Achievement[] = [
  // ─── MANDATORY BASELINE BADGES ───
  {
    id: "neurological-primer",
    title: "The Neurological Primer",
    description: "Log first 3-day week",
    target: "workouts:3",
    unlocked: true,
    emoji: "🧠",
  },
  {
    id: "structural-balance",
    title: "Structural Balance",
    description: "Reach Rank C across Push/Pull/Core/Legs",
    target: "rank:c-all",
    unlocked: true,
    emoji: "⚖️",
  },
  {
    id: "form-over-ego",
    title: "Form over Ego",
    description: "Edit a set to log fewer reps due to form",
    target: "form-adjustment",
    unlocked: true,
    emoji: "🎯",
  },
  {
    id: "defying-gravity",
    title: "Defying Gravity",
    description: "Hold freestanding handstand for 10s",
    target: "handstand:10",
    unlocked: false,
    emoji: "✨",
  },
  {
    id: "consistency-king",
    title: "Consistency is King",
    description: "Log 12 workouts in a mesocycle",
    target: "workouts:12",
    unlocked: false,
    emoji: "👑",
  },
  {
    id: "gravity-bender",
    title: "The Gravity Bender",
    description: "Reach Rank A in any category",
    target: "rank:a-any",
    unlocked: false,
    emoji: "🌀",
  },
  {
    id: "deload-master",
    title: "Deload Master",
    description: "Complete week 6 of mesocycle",
    target: "mesocycle:week6",
    unlocked: false,
    emoji: "🏆",
  },

  // ─── ADDITIONAL ACHIEVEMENTS (15-20+) ───
  {
    id: "og-student",
    title: "OG Student",
    description: "Complete 3 strength-skill focused workouts",
    target: "goal:strength-skill-3",
    unlocked: false,
    emoji: "📚",
  },
  {
    id: "hypertrophy-seeker",
    title: "Hypertrophy Seeker",
    description: "Log 20+ hypertrophy workouts",
    target: "goal:hypertrophy-20",
    unlocked: false,
    emoji: "💪",
  },
  {
    id: "endurance-athlete",
    title: "Endurance Athlete",
    description: "Complete 10 endurance workouts",
    target: "goal:endurance-10",
    unlocked: false,
    emoji: "🏃",
  },
  {
    id: "rep-counter",
    title: "Rep Counter",
    description: "Log 500 total reps",
    target: "total-reps:500",
    unlocked: false,
    emoji: "🔢",
  },
  {
    id: "time-keeper",
    title: "Time Keeper",
    description: "5 minutes total hold time",
    target: "total-hold:300",
    unlocked: false,
    emoji: "⏱️",
  },
  {
    id: "progressive-overload",
    title: "Progressive Overload Master",
    description: "Increase difficulty 5 times",
    target: "difficulty-increases:5",
    unlocked: false,
    emoji: "📈",
  },
  {
    id: "skill-seeker",
    title: "Skill Seeker",
    description: "Unlock all skill progressions",
    target: "skills:all",
    unlocked: false,
    emoji: "🎪",
  },
  {
    id: "iron-grip",
    title: "Iron Grip",
    description: "Accumulate 1000 lbs of weight",
    target: "weight:1000",
    unlocked: false,
    emoji: "🤜",
  },
  {
    id: "flexibility-champion",
    title: "Flexibility Champion",
    description: "Achieve 10s hold in 5 yoga poses",
    target: "yoga:5-poses",
    unlocked: false,
    emoji: "🧘",
  },
  {
    id: "strong-foundation",
    title: "Strong Foundation",
    description: "Rank B in Push and Legs",
    target: "rank:b-push-legs",
    unlocked: false,
    emoji: "🏗️",
  },
  {
    id: "balanced-athlete",
    title: "Balanced Athlete",
    description: "Rank B in all 4 categories",
    target: "rank:b-all",
    unlocked: false,
    emoji: "⚡",
  },
  {
    id: "yin-yang",
    title: "Yin & Yang",
    description: "Complete yoga flow and strength in same week",
    target: "yoga-strength-week",
    unlocked: false,
    emoji: "☯️",
  },
  {
    id: "comeback-kid",
    title: "Comeback Kid",
    description: "Log after 2-week break",
    target: "comeback-2week",
    unlocked: false,
    emoji: "🔥",
  },
  {
    id: "personal-record",
    title: "Personal Record",
    description: "Log new max in any exercise",
    target: "personal-record:any",
    unlocked: false,
    emoji: "🎖️",
  },
  {
    id: "diamond-hands",
    title: "Diamond Hands",
    description: "Log 10 perfect sets in a row",
    target: "perfect-sets:10",
    unlocked: false,
    emoji: "💎",
  },
  {
    id: "strength-seeker",
    title: "Strength Seeker",
    description: "3 consecutive heavy (low rep) sessions",
    target: "heavy-sessions:3",
    unlocked: false,
    emoji: "🦾",
  },
  {
    id: "cardio-converter",
    title: "Cardio Converter",
    description: "Switch goals to endurance, complete week",
    target: "endurance-week",
    unlocked: false,
    emoji: "🔄",
  },
  {
    id: "equipment-mastery",
    title: "Equipment Mastery",
    description: "Rings exercises: 20 reps",
    target: "rings:20",
    unlocked: false,
    emoji: "🔴",
  },
  {
    id: "the-specialist",
    title: "The Specialist",
    description: "Reach Rank S in any category",
    target: "rank:s-any",
    unlocked: false,
    emoji: "⭐",
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Log every day for a full week",
    target: "daily-week:7",
    unlocked: false,
    emoji: "💥",
  },
  {
    id: "groundbreaker",
    title: "Groundbreaker",
    description: "Push-Ups: 10 reps",
    target: "push-up:10",
    unlocked: true,
    emoji: "🚀",
  },
  {
    id: "air-walker",
    title: "Air Walker",
    description: "Statics: 5s hold",
    target: "plank:5",
    unlocked: true,
    emoji: "✈️",
  },
  {
    id: "quadzilla",
    title: "Quadzilla",
    description: "Squats: 100 reps",
    target: "squat:100",
    unlocked: false,
    emoji: "🦵",
  },
];
