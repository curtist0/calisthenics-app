import { WeeklyPlan } from "@/lib/types";

export const weeklyPlans: WeeklyPlan[] = [
  // ─── BEGINNER ───
  {
    id: "beginner-full-body",
    name: "Beginner Full Body",
    description: "A 3-day per week full-body program to build your calisthenics foundation.",
    difficulty: "beginner",
    goal: "Build foundational strength",
    estimatedWeeklyMinutes: 90,
    days: [
      {
        day: "Monday",
        name: "Full Body A",
        isRest: false,
        focus: "Push & Squat emphasis",
        exercises: [
          { exerciseId: "push-up", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "australian-pull-up", sets: 3, reps: 8, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "squat", sets: 3, reps: 15, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "plank", sets: 3, reps: null, holdSeconds: 30, restSeconds: 30 },
        ],
      },
      { day: "Tuesday", name: "Rest", isRest: true, exercises: [] },
      {
        day: "Wednesday",
        name: "Full Body B",
        isRest: false,
        focus: "Pull & Lunge emphasis",
        exercises: [
          { exerciseId: "diamond-push-up", sets: 3, reps: 8, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "australian-pull-up", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "lunge", sets: 3, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "plank", sets: 3, reps: null, holdSeconds: 40, restSeconds: 30 },
        ],
      },
      { day: "Thursday", name: "Rest", isRest: true, exercises: [] },
      {
        day: "Friday",
        name: "Full Body C",
        isRest: false,
        focus: "Conditioning",
        exercises: [
          { exerciseId: "push-up", sets: 3, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "australian-pull-up", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "squat", sets: 3, reps: 20, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "calf-raise", sets: 3, reps: 15, holdSeconds: null, restSeconds: 45 },
          { exerciseId: "burpee", sets: 2, reps: 8, holdSeconds: null, restSeconds: 90 },
        ],
      },
      { day: "Saturday", name: "Rest", isRest: true, exercises: [] },
      { day: "Sunday", name: "Rest", isRest: true, exercises: [] },
    ],
  },

  // ─── INTERMEDIATE PPL ───
  {
    id: "intermediate-ppl",
    name: "Intermediate Push/Pull/Legs",
    description: "A 6-day PPL split for intermediate athletes ready to increase volume and intensity.",
    difficulty: "intermediate",
    goal: "Build muscle and strength",
    estimatedWeeklyMinutes: 180,
    days: [
      {
        day: "Monday",
        name: "Push",
        isRest: false,
        focus: "Chest, shoulders, triceps",
        exercises: [
          { exerciseId: "diamond-push-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "pike-push-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "dips", sets: 4, reps: 10, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "pseudo-planche-push-up", sets: 3, reps: 6, holdSeconds: null, restSeconds: 90 },
        ],
      },
      {
        day: "Tuesday",
        name: "Pull",
        isRest: false,
        focus: "Back, biceps",
        exercises: [
          { exerciseId: "pull-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "chin-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "australian-pull-up", sets: 3, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "tuck-front-lever", sets: 3, reps: null, holdSeconds: 15, restSeconds: 60 },
        ],
      },
      {
        day: "Wednesday",
        name: "Legs & Core",
        isRest: false,
        focus: "Quads, glutes, core",
        exercises: [
          { exerciseId: "jump-squat", sets: 4, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "lunge", sets: 4, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "calf-raise", sets: 4, reps: 15, holdSeconds: null, restSeconds: 45 },
          { exerciseId: "hanging-leg-raise", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "hollow-body-hold", sets: 3, reps: null, holdSeconds: 30, restSeconds: 30 },
        ],
      },
      {
        day: "Thursday",
        name: "Push",
        isRest: false,
        focus: "Chest, shoulders, triceps",
        exercises: [
          { exerciseId: "push-up", sets: 4, reps: 15, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "pike-push-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "dips", sets: 4, reps: 12, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "l-sit", sets: 3, reps: null, holdSeconds: 15, restSeconds: 60 },
        ],
      },
      {
        day: "Friday",
        name: "Pull",
        isRest: false,
        focus: "Back, biceps",
        exercises: [
          { exerciseId: "pull-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "chin-up", sets: 3, reps: 10, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "tuck-front-lever", sets: 4, reps: null, holdSeconds: 20, restSeconds: 90 },
          { exerciseId: "hanging-leg-raise", sets: 3, reps: 12, holdSeconds: null, restSeconds: 60 },
        ],
      },
      {
        day: "Saturday",
        name: "Legs & Core",
        isRest: false,
        focus: "Legs, core, conditioning",
        exercises: [
          { exerciseId: "pistol-squat", sets: 3, reps: 5, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "jump-squat", sets: 3, reps: 15, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "calf-raise", sets: 4, reps: 20, holdSeconds: null, restSeconds: 45 },
          { exerciseId: "burpee", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "plank", sets: 3, reps: null, holdSeconds: 60, restSeconds: 30 },
        ],
      },
      { day: "Sunday", name: "Rest", isRest: true, exercises: [] },
    ],
  },

  // ─── MUSCLE-UP PROGRESSION ───
  {
    id: "muscle-up-program",
    name: "Muscle-Up Mastery",
    description: "A focused 4-day program to build the explosive pull and transition strength needed for muscle-ups.",
    difficulty: "advanced",
    goal: "Unlock the muscle-up",
    estimatedWeeklyMinutes: 150,
    days: [
      {
        day: "Monday",
        name: "Explosive Pull",
        isRest: false,
        focus: "High pull power",
        exercises: [
          { exerciseId: "pull-up", sets: 5, reps: 5, holdSeconds: null, restSeconds: 120 },
          { exerciseId: "chin-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "muscle-up", sets: 5, reps: 2, holdSeconds: null, restSeconds: 180 },
          { exerciseId: "hanging-leg-raise", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
        ],
      },
      {
        day: "Tuesday",
        name: "Push Strength",
        isRest: false,
        focus: "Transition & dip strength",
        exercises: [
          { exerciseId: "dips", sets: 5, reps: 10, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "diamond-push-up", sets: 4, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "pike-push-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "l-sit", sets: 3, reps: null, holdSeconds: 20, restSeconds: 60 },
        ],
      },
      { day: "Wednesday", name: "Rest", isRest: true, exercises: [] },
      {
        day: "Thursday",
        name: "Muscle-Up Practice",
        isRest: false,
        focus: "Skill and volume",
        exercises: [
          { exerciseId: "muscle-up", sets: 6, reps: 2, holdSeconds: null, restSeconds: 180 },
          { exerciseId: "pull-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "dips", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "hollow-body-hold", sets: 3, reps: null, holdSeconds: 30, restSeconds: 30 },
        ],
      },
      {
        day: "Friday",
        name: "Supplementary",
        isRest: false,
        focus: "Pulling endurance + core",
        exercises: [
          { exerciseId: "australian-pull-up", sets: 4, reps: 15, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "chin-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "dragon-flag", sets: 3, reps: 5, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "plank", sets: 3, reps: null, holdSeconds: 60, restSeconds: 30 },
        ],
      },
      { day: "Saturday", name: "Rest", isRest: true, exercises: [] },
      { day: "Sunday", name: "Rest", isRest: true, exercises: [] },
    ],
  },

  // ─── PLANCHE PROGRESSION ───
  {
    id: "planche-program",
    name: "Planche Progression",
    description: "A systematic 4-day program to build toward the full planche through proven progressions.",
    difficulty: "advanced",
    goal: "Progress toward planche",
    estimatedWeeklyMinutes: 140,
    days: [
      {
        day: "Monday",
        name: "Planche Skill",
        isRest: false,
        focus: "Planche-specific work",
        exercises: [
          { exerciseId: "tuck-planche", sets: 5, reps: null, holdSeconds: 12, restSeconds: 120 },
          { exerciseId: "pseudo-planche-push-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "l-sit", sets: 4, reps: null, holdSeconds: 20, restSeconds: 60 },
          { exerciseId: "hollow-body-hold", sets: 3, reps: null, holdSeconds: 30, restSeconds: 30 },
        ],
      },
      {
        day: "Tuesday",
        name: "Push Strength",
        isRest: false,
        focus: "Supporting push strength",
        exercises: [
          { exerciseId: "handstand-push-up", sets: 4, reps: 5, holdSeconds: null, restSeconds: 120 },
          { exerciseId: "dips", sets: 4, reps: 12, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "diamond-push-up", sets: 4, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "pike-push-up", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
        ],
      },
      { day: "Wednesday", name: "Rest", isRest: true, exercises: [] },
      {
        day: "Thursday",
        name: "Planche Skill + Pull",
        isRest: false,
        focus: "Balance planche with pulling",
        exercises: [
          { exerciseId: "tuck-planche", sets: 5, reps: null, holdSeconds: 15, restSeconds: 120 },
          { exerciseId: "pseudo-planche-push-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "pull-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "tuck-front-lever", sets: 3, reps: null, holdSeconds: 15, restSeconds: 90 },
        ],
      },
      {
        day: "Friday",
        name: "Core & Straight-Arm",
        isRest: false,
        focus: "Core compression & straight-arm strength",
        exercises: [
          { exerciseId: "v-sit", sets: 4, reps: null, holdSeconds: 10, restSeconds: 90 },
          { exerciseId: "dragon-flag", sets: 3, reps: 5, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "hanging-leg-raise", sets: 3, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "l-sit", sets: 4, reps: null, holdSeconds: 25, restSeconds: 60 },
        ],
      },
      { day: "Saturday", name: "Rest", isRest: true, exercises: [] },
      { day: "Sunday", name: "Rest", isRest: true, exercises: [] },
    ],
  },

  // ─── HSPU PROGRAM ───
  {
    id: "hspu-program",
    name: "HSPU Domination",
    description: "Build toward freestanding handstand push-ups with this progressive overhead pressing program.",
    difficulty: "advanced",
    goal: "Master handstand push-ups",
    estimatedWeeklyMinutes: 130,
    days: [
      {
        day: "Monday",
        name: "Heavy HSPU",
        isRest: false,
        focus: "Max strength pressing",
        exercises: [
          { exerciseId: "handstand-push-up", sets: 5, reps: 5, holdSeconds: null, restSeconds: 120 },
          { exerciseId: "pike-push-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "dips", sets: 4, reps: 10, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "plank", sets: 3, reps: null, holdSeconds: 60, restSeconds: 30 },
        ],
      },
      {
        day: "Tuesday",
        name: "Pull Balance",
        isRest: false,
        focus: "Counter-balance pulling work",
        exercises: [
          { exerciseId: "pull-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "tuck-front-lever", sets: 4, reps: null, holdSeconds: 15, restSeconds: 90 },
          { exerciseId: "hanging-leg-raise", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "hollow-body-hold", sets: 3, reps: null, holdSeconds: 30, restSeconds: 30 },
        ],
      },
      { day: "Wednesday", name: "Rest", isRest: true, exercises: [] },
      {
        day: "Thursday",
        name: "HSPU Volume",
        isRest: false,
        focus: "High rep overhead work",
        exercises: [
          { exerciseId: "handstand-push-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 120 },
          { exerciseId: "pike-push-up", sets: 4, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "diamond-push-up", sets: 3, reps: 15, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "l-sit", sets: 3, reps: null, holdSeconds: 20, restSeconds: 60 },
        ],
      },
      { day: "Friday", name: "Active Recovery", isRest: true, exercises: [] },
      {
        day: "Saturday",
        name: "Legs & Core",
        isRest: false,
        focus: "Lower body + core stability",
        exercises: [
          { exerciseId: "pistol-squat", sets: 3, reps: 5, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "jump-squat", sets: 3, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "lunge", sets: 3, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "dragon-flag", sets: 3, reps: 5, holdSeconds: null, restSeconds: 90 },
        ],
      },
      { day: "Sunday", name: "Rest", isRest: true, exercises: [] },
    ],
  },

  // ─── FRONT LEVER & DRAGON FLAG ───
  {
    id: "front-lever-program",
    name: "Front Lever & Dragon Flag",
    description: "Develop elite pulling strength and core control through front lever and dragon flag progressions.",
    difficulty: "advanced",
    goal: "Master front lever & dragon flag",
    estimatedWeeklyMinutes: 140,
    days: [
      {
        day: "Monday",
        name: "Lever Skill",
        isRest: false,
        focus: "Front lever + back lever",
        exercises: [
          { exerciseId: "front-lever", sets: 5, reps: null, holdSeconds: 8, restSeconds: 120 },
          { exerciseId: "tuck-front-lever", sets: 4, reps: null, holdSeconds: 20, restSeconds: 90 },
          { exerciseId: "back-lever", sets: 3, reps: null, holdSeconds: 15, restSeconds: 120 },
          { exerciseId: "pull-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
        ],
      },
      {
        day: "Tuesday",
        name: "Dragon Flag & Core",
        isRest: false,
        focus: "Anti-extension + compression",
        exercises: [
          { exerciseId: "dragon-flag", sets: 4, reps: 5, holdSeconds: null, restSeconds: 120 },
          { exerciseId: "hanging-leg-raise", sets: 4, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "hollow-body-hold", sets: 3, reps: null, holdSeconds: 40, restSeconds: 30 },
          { exerciseId: "l-sit", sets: 3, reps: null, holdSeconds: 20, restSeconds: 60 },
        ],
      },
      { day: "Wednesday", name: "Rest", isRest: true, exercises: [] },
      {
        day: "Thursday",
        name: "Pull Strength",
        isRest: false,
        focus: "Heavy pulling volume",
        exercises: [
          { exerciseId: "pull-up", sets: 5, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "chin-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "australian-pull-up", sets: 3, reps: 15, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "front-lever", sets: 4, reps: null, holdSeconds: 10, restSeconds: 120 },
        ],
      },
      {
        day: "Friday",
        name: "Push & Core",
        isRest: false,
        focus: "Supplementary push + core",
        exercises: [
          { exerciseId: "dips", sets: 4, reps: 12, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "push-up", sets: 3, reps: 15, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "dragon-flag", sets: 3, reps: 6, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "plank", sets: 3, reps: null, holdSeconds: 60, restSeconds: 30 },
        ],
      },
      { day: "Saturday", name: "Rest", isRest: true, exercises: [] },
      { day: "Sunday", name: "Rest", isRest: true, exercises: [] },
    ],
  },

  // ─── ELITE SKILLS ───
  {
    id: "elite-skills",
    name: "Elite Skills Mastery",
    description: "For athletes chasing the hardest calisthenics holds: full planche, front lever, 90° hold, and human flag.",
    difficulty: "elite",
    goal: "Master elite static holds",
    estimatedWeeklyMinutes: 200,
    days: [
      {
        day: "Monday",
        name: "Planche Focus",
        isRest: false,
        focus: "Planche progressions",
        exercises: [
          { exerciseId: "straddle-planche", sets: 5, reps: null, holdSeconds: 8, restSeconds: 180 },
          { exerciseId: "tuck-planche", sets: 4, reps: null, holdSeconds: 15, restSeconds: 120 },
          { exerciseId: "pseudo-planche-push-up", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "90-degree-hold", sets: 3, reps: null, holdSeconds: 5, restSeconds: 180 },
          { exerciseId: "handstand-push-up", sets: 3, reps: 5, holdSeconds: null, restSeconds: 120 },
        ],
      },
      {
        day: "Tuesday",
        name: "Front Lever & Pull",
        isRest: false,
        focus: "Front lever + heavy pulling",
        exercises: [
          { exerciseId: "front-lever", sets: 5, reps: null, holdSeconds: 10, restSeconds: 180 },
          { exerciseId: "back-lever", sets: 4, reps: null, holdSeconds: 15, restSeconds: 120 },
          { exerciseId: "muscle-up", sets: 4, reps: 5, holdSeconds: null, restSeconds: 120 },
          { exerciseId: "pull-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 90 },
        ],
      },
      { day: "Wednesday", name: "Rest", isRest: true, exercises: [] },
      {
        day: "Thursday",
        name: "Flag & Core Power",
        isRest: false,
        focus: "Human flag, dragon flag, manna",
        exercises: [
          { exerciseId: "human-flag", sets: 4, reps: null, holdSeconds: 8, restSeconds: 180 },
          { exerciseId: "dragon-flag", sets: 4, reps: 6, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "v-sit", sets: 4, reps: null, holdSeconds: 15, restSeconds: 90 },
          { exerciseId: "manna", sets: 3, reps: null, holdSeconds: 5, restSeconds: 120 },
          { exerciseId: "hollow-body-hold", sets: 3, reps: null, holdSeconds: 45, restSeconds: 30 },
        ],
      },
      {
        day: "Friday",
        name: "Push & Planche Volume",
        isRest: false,
        focus: "Push strength to support planche",
        exercises: [
          { exerciseId: "tuck-planche", sets: 5, reps: null, holdSeconds: 12, restSeconds: 120 },
          { exerciseId: "freestanding-hspu", sets: 4, reps: 3, holdSeconds: null, restSeconds: 180 },
          { exerciseId: "dips", sets: 4, reps: 15, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "l-sit", sets: 3, reps: null, holdSeconds: 30, restSeconds: 60 },
        ],
      },
      {
        day: "Saturday",
        name: "Legs & Conditioning",
        isRest: false,
        focus: "Lower body + active recovery",
        exercises: [
          { exerciseId: "pistol-squat", sets: 4, reps: 8, holdSeconds: null, restSeconds: 90 },
          { exerciseId: "jump-squat", sets: 3, reps: 15, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "lunge", sets: 3, reps: 12, holdSeconds: null, restSeconds: 60 },
          { exerciseId: "calf-raise", sets: 3, reps: 20, holdSeconds: null, restSeconds: 45 },
        ],
      },
      { day: "Sunday", name: "Rest", isRest: true, exercises: [] },
    ],
  },
];

export function getPlanById(id: string): WeeklyPlan | undefined {
  return weeklyPlans.find((w) => w.id === id);
}
