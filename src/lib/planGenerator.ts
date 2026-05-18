import { Exercise, WeeklyPlan, DayWorkout, WorkoutExercise, TrainingGoal, WarmUp, RestDayActivity, Equipment } from "./types";
import { exercises, getExerciseById } from "@/data/exercises";
import { yogaPoses, getYogaPoseById } from "@/data/yoga";
import { getUserProfile } from "./storage";
import { getConditioningForSkill } from "./conditioning";
import { OG_GOAL_CONFIG, DIFFICULTY_MODIFIERS, getProgressionLabel } from "./overcomingGravity";

function userHasEquipment(exercise: Exercise | undefined, userEquipment?: Equipment[]): boolean {
  if (!exercise) return false;
  // If user has no equipment restrictions, allow all exercises
  if (!userEquipment || userEquipment.length === 0) return true;
  // If exercise has no equipment requirements, it's calisthenics (always allowed)
  if (!exercise.equipment || exercise.equipment.length === 0) return true;
  // Check if any of the exercise's required equipment matches user's equipment
  return exercise.equipment.some(eq => userEquipment.includes(eq));
}

function getFullProgressionChain(exerciseId: string): Exercise[] {
  const chain: Exercise[] = [];
  let current = getExerciseById(exerciseId);
  if (!current) return chain;
  let root = current;
  const visited = new Set<string>();
  while (root.progressionFrom && !visited.has(root.progressionFrom)) {
    visited.add(root.id);
    const prev = getExerciseById(root.progressionFrom);
    if (!prev) break;
    root = prev;
  }
  visited.clear();
  let node: Exercise | undefined = root;
  while (node && !visited.has(node.id)) {
    visited.add(node.id);
    chain.push(node);
    node = node.progressionTo ? getExerciseById(node.progressionTo) : undefined;
  }
  return chain;
}

// Daily focus types: Volume, Intensity, or Conditioning
type DailyFocus = "volume" | "intensity" | "conditioning";

// Goal-specific focus patterns for 6-day training cycles
const goalFocusPatterns: Record<TrainingGoal, DailyFocus[]> = {
  "strength-skill": ["intensity", "volume", "conditioning", "intensity", "volume", "conditioning"],
  hypertrophy: ["volume", "intensity", "conditioning", "volume", "intensity", "conditioning"],
  endurance: ["conditioning", "volume", "intensity", "conditioning", "volume", "intensity"],
  // Legacy goals
  muscle: ["volume", "intensity", "conditioning", "volume", "intensity", "conditioning"],
  skills: ["intensity", "volume", "conditioning", "intensity", "volume", "conditioning"],
  "weight-loss": ["conditioning", "conditioning", "volume", "conditioning", "conditioning", "volume"],
  balanced: ["volume", "intensity", "conditioning", "volume", "intensity", "conditioning"],
};

// Focus-specific multipliers for sets, reps, and rest
const focusConfig: Record<DailyFocus, { sets: number; reps: number; rest: number }> = {
  volume: { sets: 1.4, reps: 1.2, rest: 0.8 },      // More sets, more reps, less rest
  intensity: { sets: 1.0, reps: 0.7, rest: 1.4 },   // Moderate sets, low reps, more rest
  conditioning: { sets: 0.9, reps: 1.3, rest: 0.5 }, // Fewer sets, more reps, minimal rest
};

// Base goal configuration (goal impact on all days)
const goalConfig: Record<TrainingGoal, { baseMultiplier: number }> = {
  "strength-skill": { baseMultiplier: 1.0 },
  hypertrophy: { baseMultiplier: 1.1 },
  endurance: { baseMultiplier: 1.05 },
  // Legacy goals
  muscle: { baseMultiplier: 1.1 },
  skills: { baseMultiplier: 1.0 },
  "weight-loss": { baseMultiplier: 0.95 },
  balanced: { baseMultiplier: 1.0 },
};

// Updated Set/Rep logic based on Overcoming Gravity principles
function makeEx(ex: Exercise, isTargetSkill: boolean, goal: TrainingGoal, label?: string): WorkoutExercise {
  // Map legacy goals to new OG goals
  const ogGoal = 
    goal === "strength-skill" || goal === "skills" ? "strength-skill" :
    goal === "hypertrophy" || goal === "muscle" ? "hypertrophy" :
    goal === "endurance" || goal === "weight-loss" ? "endurance" :
    "hypertrophy"; // Default fallback

  const config = OG_GOAL_CONFIG[ogGoal];
  const difficulty = ex.difficulty || "beginner";
  const diffModifier = DIFFICULTY_MODIFIERS[difficulty] || 1.0;

  let sets = config.setsPerExercise;
  let reps = Math.round((config.targetReps.max - config.targetReps.min) / 2 * diffModifier);
  let holdSeconds = Math.round((config.targetHolds.max - config.targetHolds.min) / 2 * diffModifier);
  let restSeconds = config.restSeconds;

  // Adjust for target skills (extra volume for neurological adaptation)
  if (isTargetSkill && ogGoal === "strength-skill") {
    sets = Math.min(5, sets + 1);
  }

  if (ex.isHold) {
    return {
      exerciseId: ex.id,
      sets,
      reps: null,
      holdSeconds: Math.max(5, holdSeconds),
      restSeconds,
      progressionLevel: label || getProgressionLabel(isTargetSkill, ex.category),
    };
  }

  return {
    exerciseId: ex.id,
    sets,
    reps: Math.max(1, reps),
    holdSeconds: null,
    restSeconds,
    progressionLevel: label || getProgressionLabel(isTargetSkill, ex.category),
  };
}

function getRestDayActivities(dayIndex: number): RestDayActivity[] {
  const profile = getUserProfile();
  const acts: RestDayActivity[] = [];
  if (profile?.yogaSetUp) {
    const flows = [
      { name: "Hip Opening Flow", description: "Deep hip stretches", duration: "15 min", type: "yoga" as const, yogaPoseIds: ["pigeon", "seated-straddle", "half-splits", "childs", "savasana"] },
      { name: "Spine & Back Flow", description: "Backbends and twists", duration: "12 min", type: "yoga" as const, yogaPoseIds: ["cobra", "bridge", "forward-fold", "childs", "legs-up-wall"] },
      { name: "Shoulders & Chest Flow", description: "Open the front body", duration: "12 min", type: "yoga" as const, yogaPoseIds: ["eagle", "dolphin", "cobra", "bridge", "childs"] },
      { name: "Legs & Hamstrings Flow", description: "Standing and seated leg length", duration: "14 min", type: "yoga" as const, yogaPoseIds: ["forward-fold", "half-splits", "warrior1", "warrior2", "savasana"] },
      { name: "Calm Evening Flow", description: "Gentle twists and legs up", duration: "10 min", type: "yoga" as const, yogaPoseIds: ["supine-twist", "happy-baby", "legs-up-wall", "childs", "savasana"] },
    ];
    acts.push(flows[dayIndex % flows.length]);
  }
  const walkVariants = [
    { name: "Light Walk", description: "20–30 min easy walk", duration: "20-30 min", type: "light-cardio" as const },
    { name: "Easy Bike or Walk", description: "Low-intensity movement", duration: "15-25 min", type: "light-cardio" as const },
    { name: "Nature Walk", description: "Easy pace, nasal breathing", duration: "25-35 min", type: "light-cardio" as const },
  ];
  acts.push(walkVariants[dayIndex % walkVariants.length]);
  const mobilityVariants = [
    { name: "Mobility Work", description: "Joint circles, foam rolling", duration: "10 min", type: "mobility" as const },
    { name: "Dynamic Mobility", description: "Leg swings, thoracic rotations, ankle rocks", duration: "12 min", type: "mobility" as const },
    { name: "Gentle Stretching", description: "Easy full-body stretches", duration: "8 min", type: "mobility" as const },
  ];
  acts.push(mobilityVariants[(dayIndex + 1) % mobilityVariants.length]);
  return acts;
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const calisthenicsWarmUpVariants: WarmUp[] = [
  { name: "Warm-Up", duration: "5 min", exercises: ["Jumping jacks × 20", "Arm circles × 10 each", "Leg swings × 10 each", "Wrist circles × 20", "Air squats × 10"] },
  { name: "Pulse Warm-Up", duration: "5 min", exercises: ["High knees × 20", "Shoulder rolls × 10", "Hip circles × 8 each way", "Scap push-ups × 10", "Bodyweight squats × 12"] },
  { name: "Mobility First", duration: "5 min", exercises: ["Cat-cow × 10", "World’s greatest stretch × 5 each side", "Band pull-aparts × 15", "Dead bug × 8 each side", "Glute bridge × 12"] },
  { name: "Upper-Body Prep", duration: "5 min", exercises: ["Arm circles × 12", "Wall slides × 12", "Scapular dips × 10", "Plank shoulder taps × 10 each", "Push-up negatives × 5"] },
  { name: "Lower-Body Prep", duration: "5 min", exercises: ["Ankle rocks × 10 each", "Cossack squat × 5 each", "Walking lunges × 8 each leg", "Single-leg RDL × 6 each", "Calf raises × 15"] },
  { name: "Full-Body Wake-Up", duration: "5 min", exercises: ["Burpees × 5 (easy)", "Inchworms × 6", "Bear crawl × 20 steps", "Jump rope or shadow skip × 30s", "Torso twists × 10 each"] },
];

// ─── CALISTHENICS PLAN ───

export function generateWeeklyPlan(selectedSkillIds: string[], goal: TrainingGoal): WeeklyPlan {
  if (selectedSkillIds.some((id) => getYogaPoseById(id) !== undefined)) {
    return generateYogaPlan(selectedSkillIds, 60); // Assuming this exists elsewhere
  }

  const targetNames: string[] = [];
  const skillWork: WorkoutExercise[] = [];
  const strengthWork: WorkoutExercise[] = [];
  const coreLegsWork: WorkoutExercise[] = [];
  const usedIds = new Set<string>();

  // 1. Process Skills (These MUST go first in the workout)
  for (const targetId of selectedSkillIds) {
    const target = getExerciseById(targetId);
    if (!target) continue;
    targetNames.push(target.name);

    const chain = getFullProgressionChain(targetId);
    const targetIdx = chain.findIndex((e) => e.id === targetId);
    const progressions = targetIdx > 0 ? chain.slice(0, targetIdx) : [];

    if (progressions.length > 0) {
      // Only take the last 1-2 progressions so we don't fatigue before the main work
      const relevantProgressions = progressions.slice(-2); 
      relevantProgressions.forEach((ex, i) => {
        if (usedIds.has(ex.id)) return;
        usedIds.add(ex.id);
        const isLast = i === relevantProgressions.length - 1;
        const label = isLast ? `🎯 Target Progression` : `Warm-up Progression`;
        skillWork.push(makeEx(ex, true, goal, label));
      });
    }

    // Conditioning / Supplemental for the skill
    const cond = getConditioningForSkill(targetId);
    if (cond.length > 0) {
      const top = cond[0];
      const isHold = top.reps.includes("s");
      strengthWork.push({
        exerciseId: `cond-${targetId}-0`, sets: top.sets,
        reps: isHold ? null : parseInt(top.reps) || 8,
        holdSeconds: isHold ? parseInt(top.reps) || 15 : null,
        restSeconds: 90, progressionLevel: `🔧 Supplemental Strength`,
      });
    }
  }

  // 2. Fill out Full Body Strength (Push & Pull)
  const supporters = exercises.filter(
    (e) => !usedIds.has(e.id) && (e.difficulty === "beginner" || e.difficulty === "intermediate") && e.category !== "skill"
  );
  
  // Get 2 Pushes and 2 Pulls for structural balance
  const pushes = supporters.filter(e => e.category === "push").slice(0, 2);
  const pulls = supporters.filter(e => e.category === "pull").slice(0, 2);
  
  [...pushes, ...pulls].forEach(ex => {
    if (!usedIds.has(ex.id)) {
      usedIds.add(ex.id);
      strengthWork.push(makeEx(ex, false, goal, "Strength Core"));
    }
  });

  // 3. Fill out Legs & Core (Placed at the end to prevent CNS fatigue)
  const core = supporters.filter(e => e.category === "core").slice(0, 1);
  const legs = supporters.filter(e => e.category === "legs").slice(0, 1);
  
  [...core, ...legs].forEach(ex => {
    if (!usedIds.has(ex.id)) {
      usedIds.add(ex.id);
      coreLegsWork.push(makeEx(ex, false, goal, "Finisher"));
    }
  });

  // Combine in STRICT Overcoming Gravity order: Skill -> Strength -> Core/Legs
  const fullBodyRoutine = [...skillWork, ...strengthWork, ...coreLegsWork];

  // 4. Build the 7-Day Schedule (3x Full Body, 4x Rest/Mobility)
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const days: DayWorkout[] = [];
  
  for (let i = 0; i < 7; i++) {
    // Training days: Mon (0), Wed (2), Fri (4)
    if (i === 0 || i === 2 || i === 4) {
      days.push({
        day: dayNames[i],
        name: `Full Body Routine`,
        isRest: false,
        focus: `Skill acquisition & structural balance`,
        exercises: fullBodyRoutine, // Same routine to force neurological adaptation
        warmUp: calisthenicsWarmUpVariants[i % calisthenicsWarmUpVariants.length],
      });
    } else {
      // Rest / Prehab days
      days.push({
        day: dayNames[i],
        name: "Active Recovery",
        isRest: true,
        exercises: [],
        restDayActivities: getRestDayActivities(i)
      });
    }
  }

  const goalLabel: Record<TrainingGoal, string> = {
    "strength-skill": "Strength & Skill",
    hypertrophy: "Muscle Growth",
    endurance: "Stamina & Endurance",
    // Legacy
    muscle: "Build Muscle",
    skills: "Master Skills",
    "weight-loss": "Lose Weight",
    balanced: "Balanced",
  };
  const weeklyExerciseSlots = days.filter((d) => !d.isRest).reduce((s, d) => s + d.exercises.length, 0);
  
  // Ensure targetNames are strings (defensive against accidental object insertion)
  const skillNamesStr = targetNames.filter(n => typeof n === 'string').join(", ");
  const goalLabelStr = goalLabel[goal] || "Full Body";
  
  return {
    id: `plan-${Date.now()}`, 
    name: selectedSkillIds.length === 1 ? `${targetNames[0]} Program` : "Full Body Gymnastics Program",
    description: `${goalLabelStr} — Full Body Routine progressing toward: ${skillNamesStr}`,
    difficulty: "intermediate", 
    goal: `${goalLabelStr}: ${skillNamesStr}`,
    trainingGoal: goal, 
    targetSkills: selectedSkillIds, 
    days,
    estimatedWeeklyMinutes: Math.round(weeklyExerciseSlots * 5), 
    createdAt: new Date().toISOString(),
  };
}

// ─── YOGA PLAN ───

// Themed flow sequences for each day
const yogaThemes = {
  "monday": {
    name: "Power & Strength",
    description: "Warrior sequences, arm balances, strength holds",
    warmup: ["cat-cow", "downward-dog", "cobra"],
    main: ["warrior1", "warrior2", "warrior3", "chair", "side-plank", "boat"],
    cooldown: ["forward-fold", "supine-twist", "savasana"]
  },
  "tuesday": {
    name: "Dynamic Hip Openers",
    description: "Pigeon variants, lizard, bound angle, happy baby",
    warmup: ["cat-cow", "easy-pose", "butterfly"],
    main: ["pigeon", "lizard", "fire-log", "bound-angle", "happy-baby", "reclined-pigeon"],
    cooldown: ["forward-fold", "supine-twist", "childs", "savasana"]
  },
  "wednesday": {
    name: "Spine & Core Flow",
    description: "Backbends, twists, cobra, bridge, boat",
    warmup: ["cat-cow", "downward-dog", "sphinx"],
    main: ["cobra", "bridge", "locust", "seated-twist", "bow", "boat"],
    cooldown: ["childs", "supine-twist", "legs-up-wall", "savasana"]
  },
  "thursday": {
    name: "Balance & Inversions",
    description: "Arm balances, handstand prep, headstand prep",
    warmup: ["shoulder-rolls", "downward-dog", "dolphin"],
    main: ["crow", "eagle", "tree", "warrior3", "half-shoulder-stand", "handstand-prep"],
    cooldown: ["forward-fold", "childs", "easy-pose", "savasana"]
  },
  "friday": {
    name: "Hamstring & Flexibility",
    description: "Forward folds, splits prep, half-splits",
    warmup: ["cat-cow", "runners-lunge", "downward-dog"],
    main: ["forward-fold", "half-splits", "standing-splits", "seated-forward-fold", "seated-straddle", "pyramid"],
    cooldown: ["butterfly", "supine-twist", "happy-baby", "savasana"]
  },
  "saturday": {
    name: "Recovery & Restorative",
    description: "Gentle poses, supported stretches, yin",
    warmup: ["easy-pose", "cat-cow", "childs"],
    main: ["supported-bridge", "supported-child", "yin-pigeon", "supported-shoulder-opener", "eye-of-needle"],
    cooldown: ["legs-up-wall", "reclined-bound-angle", "savasana"]
  },
  "sunday": {
    name: "Yin Rest & Meditation",
    description: "Long holds, restorative, savasana focus",
    warmup: ["easy-pose", "humming-bee", "cat-cow"],
    main: ["yin-pigeon", "reclined-bound-angle", "supported-child", "legs-up-wall", "thunderbolt"],
    cooldown: ["seated-meditation", "savasana"]
  }
};

// Goal-based yoga themes for different training focuses
type YogaGoalType = "flexibility" | "core" | "relaxation";

const yogaGoalThemes: Record<YogaGoalType, Record<string, typeof yogaThemes["monday"]>> = {
  flexibility: {
    "monday": {
      name: "Deep Hip Openers",
      description: "Pigeon, lizard, bound angle, splits prep",
      warmup: ["cat-cow", "easy-pose", "butterfly"],
      main: ["pigeon", "lizard", "fire-log", "bound-angle", "half-splits", "standing-splits"],
      cooldown: ["forward-fold", "supine-twist", "savasana"]
    },
    "tuesday": {
      name: "Hamstring & Forward Folds",
      description: "Hamstring stretches, seated folds, splits progression",
      warmup: ["cat-cow", "downward-dog", "runners-lunge"],
      main: ["forward-fold", "seated-forward-fold", "seated-straddle", "pyramid", "half-splits", "happy-baby"],
      cooldown: ["childs", "supine-twist", "legs-up-wall", "savasana"]
    },
    "wednesday": {
      name: "Shoulder & Chest Openers",
      description: "Shoulder stretches, chest openers, backbends",
      warmup: ["shoulder-rolls", "cat-cow", "cobra"],
      main: ["cow-face", "eagle-arms", "supported-shoulder-opener", "bridge", "bow", "camel"],
      cooldown: ["childs", "easy-pose", "savasana"]
    },
    "thursday": {
      name: "Full Body Flexibility",
      description: "Mix of all major joints and planes of motion",
      warmup: ["cat-cow", "downward-dog", "world-greatest-stretch"],
      main: ["warrior1", "warrior2", "low-lunge", "pigeon", "seated-twist", "cobra"],
      cooldown: ["forward-fold", "supine-twist", "savasana"]
    },
    "friday": {
      name: "Groin & Inner Thigh",
      description: "Bound angle, butterfly, low lunges, splits",
      warmup: ["easy-pose", "butterfly", "cat-cow"],
      main: ["bound-angle", "butterfly", "low-lunge", "dragon-lunge", "fire-log", "pigeon"],
      cooldown: ["forward-fold", "supine-twist", "happy-baby", "savasana"]
    },
    "saturday": {
      name: "Active Recovery",
      description: "Gentle movement with flexibility focus",
      warmup: ["easy-pose", "cat-cow", "childs"],
      main: ["supported-bridge", "thread-the-needle", "reclined-pigeon", "happy-baby", "eye-of-needle"],
      cooldown: ["legs-up-wall", "savasana"]
    },
    "sunday": {
      name: "Restorative Flexibility",
      description: "Passive stretches, supported poses, long holds",
      warmup: ["easy-pose", "cat-cow"],
      main: ["yin-pigeon", "reclined-bound-angle", "supported-child", "sleeping-swan", "supported-shoulder-opener"],
      cooldown: ["legs-up-wall", "savasana"]
    }
  },
  core: {
    "monday": {
      name: "Power & Core Strength",
      description: "Warrior sequences, planks, boat pose",
      warmup: ["cat-cow", "downward-dog", "cobra"],
      main: ["warrior1", "warrior2", "warrior3", "side-plank", "boat", "plank"],
      cooldown: ["forward-fold", "supine-twist", "savasana"]
    },
    "tuesday": {
      name: "Core Holds & Twists",
      description: "Planks, boats, twists, core engagement",
      warmup: ["cat-cow", "downward-dog", "sphinx"],
      main: ["plank", "side-plank", "boat", "seated-twist", "windshield-wipers", "hollow-body"],
      cooldown: ["childs", "supine-twist", "savasana"]
    },
    "wednesday": {
      name: "Spine & Core Flow",
      description: "Backbends, core activation, spinal mobility",
      warmup: ["cat-cow", "cobra", "updog"],
      main: ["cobra", "bridge", "locust", "bow", "boat", "wheel"],
      cooldown: ["childs", "supine-twist", "savasana"]
    },
    "thursday": {
      name: "Balance & Stability",
      description: "Standing balance, core stability, arm balances",
      warmup: ["shoulder-rolls", "downward-dog", "warrior2"],
      main: ["tree", "warrior3", "eagle", "crow", "side-plank", "boat"],
      cooldown: ["forward-fold", "childs", "savasana"]
    },
    "friday": {
      name: "Inversions & Core",
      description: "Handstand prep, inversions, core engagement",
      warmup: ["downward-dog", "dolphin", "shoulderstand-prep"],
      main: ["handstand-prep", "half-shoulder-stand", "crow", "boat", "hollow-body", "plank"],
      cooldown: ["easy-pose", "savasana"]
    },
    "saturday": {
      name: "Active Recovery Core",
      description: "Gentle core engagement, stability work",
      warmup: ["easy-pose", "cat-cow", "childs"],
      main: ["supported-bridge", "boat", "locust", "side-plank-prep", "hollow-body-hold"],
      cooldown: ["legs-up-wall", "savasana"]
    },
    "sunday": {
      name: "Restorative Core Calm",
      description: "Gentle core work, meditation, relaxation",
      warmup: ["easy-pose", "cat-cow"],
      main: ["supported-bridge", "supported-child", "legs-up-wall", "savasana-focus"],
      cooldown: ["meditation", "savasana"]
    }
  },
  relaxation: {
    "monday": {
      name: "Gentle Stress Relief",
      description: "Easy flows, gentle stretches, breathing",
      warmup: ["easy-pose", "cat-cow", "childs"],
      main: ["supported-child", "butterfly", "forward-fold", "easy-twist", "happy-baby"],
      cooldown: ["legs-up-wall", "savasana"]
    },
    "tuesday": {
      name: "Restorative Yin",
      description: "Long holds, passive poses, grounding",
      warmup: ["easy-pose", "humming-bee", "breath-work"],
      main: ["yin-pigeon", "supported-child", "reclined-bound-angle", "sleeping-swan"],
      cooldown: ["legs-up-wall", "savasana"]
    },
    "wednesday": {
      name: "Evening Wind-Down",
      description: "Calming flows, gentle stretches, relaxation",
      warmup: ["easy-pose", "cat-cow", "childs"],
      main: ["forward-fold", "supine-twist", "reclined-pigeon", "happy-baby", "supported-shoulder-opener"],
      cooldown: ["legs-up-wall", "meditation", "savasana"]
    },
    "thursday": {
      name: "Breathing & Meditation",
      description: "Pranayama, meditation, breathing exercises",
      warmup: ["easy-pose", "humming-bee", "alternate-nostril"],
      main: ["easy-pose", "lotus", "meditation-pose", "breathing-focus", "humming-bee"],
      cooldown: ["meditation", "savasana"]
    },
    "friday": {
      name: "Gentle Full Body",
      description: "Accessible poses for all areas, relaxation focus",
      warmup: ["easy-pose", "cat-cow"],
      main: ["supported-child", "easy-twist", "butterfly", "supported-bridge", "eye-of-needle"],
      cooldown: ["legs-up-wall", "savasana"]
    },
    "saturday": {
      name: "Deep Relaxation",
      description: "Restorative, supported, long holds",
      warmup: ["easy-pose", "cat-cow"],
      main: ["reclined-bound-angle", "supported-child", "yin-pigeon", "supported-shoulder-opener"],
      cooldown: ["legs-up-wall", "meditation", "savasana"]
    },
    "sunday": {
      name: "Complete Rest & Restoration",
      description: "Full restorative session, deep relaxation",
      warmup: ["easy-pose"],
      main: ["supported-child", "reclined-bound-angle", "legs-up-wall", "meditation-focus"],
      cooldown: ["savasana-extended"]
    }
  }
};

function detectYogaGoal(goalText: string): YogaGoalType {
  const text = goalText.toLowerCase();
  if (text.includes("flexibility") || text.includes("split") || text.includes("hip") || text.includes("stretch")) {
    return "flexibility";
  }
  if (text.includes("core") || text.includes("strength") || text.includes("abs") || text.includes("power")) {
    return "core";
  }
  if (text.includes("stress") || text.includes("sleep") || text.includes("calm") || text.includes("relax") || text.includes("anxiety")) {
    return "relaxation";
  }
  return "flexibility"; // default
}

export function generateYogaPlanFromGoal(goalText: string, durationMinutes: number): WeeklyPlan {
  const dur = Math.max(20, durationMinutes || 60);
  const goal = detectYogaGoal(goalText);
  return generateYogaPlanWithGoal(dur, goal, 28); // 28 days = 4 weeks
}

function generateYogaPlanWithGoal(duration: number, goal: YogaGoalType, totalDays: number = 28): WeeklyPlan {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dur = Math.max(20, duration || 60);
  
  // Cap yoga hold times to 15 seconds max for beginners
  const maxHoldSeconds = 15;
  
  // Calculate hold time adjustments based on duration, but cap at maxHoldSeconds
  const holdMultiplier = Math.min(1, dur / 60);
  
  const themeSet = yogaGoalThemes[goal];
  
  const days: DayWorkout[] = [];
  
  // Generate 4 weeks of yoga
  for (let dayNum = 0; dayNum < totalDays; dayNum++) {
    const dayOfWeekIndex = dayNum % 7;
    const dayOfWeekName = dayNames[dayOfWeekIndex];
    const dayOfWeekLower = dayOfWeekName.toLowerCase();
    const weekNumber = Math.floor(dayNum / 7) + 1;
    const dayLabel = `${dayOfWeekName} (Week ${weekNumber})`;
    
    const theme = themeSet[dayOfWeekLower as keyof typeof themeSet];
    
    if (!theme) {
      days.push({ 
        day: dayLabel, 
        name: "Rest", 
        isRest: true, 
        exercises: [], 
        restDayActivities: getRestDayActivities(dayOfWeekIndex) 
      });
      continue;
    }

    // Build the flow: warmup -> main sequence -> cooldown
    const flowPoses = [...theme.warmup, ...theme.main, ...theme.cooldown];
    
    // Two-sided poses need 2 sets
    const twoSided = new Set(["pigeon", "lizard", "half-splits", "warrior1", "warrior2", "warrior3", "eagle", "dancer", "tree", "standing-splits", "reclined-pigeon", "fire-log", "sleeping-swan", "runners-lunge", "low-lunge", "high-lunge", "eye-of-needle", "thread-the-needle", "yin-pigeon"]);
    
    // Adjust hold times: warmup shorter, main medium, cooldown slightly longer
    // BUT cap at maxHoldSeconds (15s for beginners)
    const getHoldSeconds = (poseId: string): number => {
      const pose = getYogaPoseById(poseId);
      if (!pose) return Math.min(10, maxHoldSeconds);
      
      let baseHold = pose.holdSeconds;
      if (theme.warmup.includes(poseId)) {
        baseHold = Math.round(baseHold * 0.7 * holdMultiplier);
      } else if (theme.cooldown.includes(poseId)) {
        baseHold = Math.round(baseHold * 1.0 * holdMultiplier);
      } else {
        baseHold = Math.round(baseHold * 0.9 * holdMultiplier);
      }
      
      // Cap at maxHoldSeconds (15 seconds)
      return Math.min(baseHold, maxHoldSeconds);
    };

    days.push({
      day: dayLabel,
      name: `${theme.name} (${dur} min)`,
      isRest: false,
      focus: theme.description,
      exercises: flowPoses.map((poseId) => {
        const pose = getYogaPoseById(poseId);
        return {
          exerciseId: poseId,
          sets: twoSided.has(poseId) ? 2 : 1,
          reps: null,
          holdSeconds: getHoldSeconds(poseId),
          restSeconds: 3,
        };
      }),
    });
  }

  const goalLabel = goal === "flexibility" ? "Flexibility & Mobility" : goal === "core" ? "Core Strength & Stability" : "Relaxation & Recovery";

  return {
    id: `yoga-${Date.now()}`,
    name: `Yoga: ${goalLabel} (4-Week Program)`,
    description: `${dur}-minute daily yoga flows focused on ${goalLabel} with 4 weeks of varied sequences`,
    difficulty: "beginner",
    goal: `Build ${goalLabel.toLowerCase()} through consistent daily practice`,
    trainingGoal: "balanced",
    targetSkills: ["flexibility", "balance", "core-strength", "mobility"],
    days,
    estimatedWeeklyMinutes: dur * 6, // 6 training days per week on average
    createdAt: new Date().toISOString(),
  };
}

function generateThemedYogaPlan(duration: number): WeeklyPlan {
  return generateYogaPlanWithGoal(duration, "flexibility", 7); // 7-day default
}

function generateYogaPlan(poseIds: string[], durationMinutes: number): WeeklyPlan {
  return generateThemedYogaPlan(durationMinutes);
}

function generateYogaPlanInternal(goalText: string, duration: number, specificPoseIds?: string[]): WeeklyPlan {
  return generateThemedYogaPlan(duration);
}
