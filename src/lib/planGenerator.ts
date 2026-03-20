import { Exercise, WeeklyPlan, DayWorkout, WorkoutExercise, TrainingGoal, WarmUp, RestDayActivity } from "./types";
import { exercises, getExerciseById } from "@/data/exercises";
import { yogaPoses, getYogaPoseById } from "@/data/yoga";
import { getUserProfile } from "./storage";
import { getConditioningForSkill } from "./conditioning";

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

const goalConfig: Record<TrainingGoal, { sets: number; reps: number; rest: number; extraDays: number }> = {
  muscle: { sets: 1.3, reps: 0.8, rest: 1.3, extraDays: 0 },
  skills: { sets: 1.2, reps: 0.7, rest: 1.5, extraDays: -1 },
  "weight-loss": { sets: 0.8, reps: 1.4, rest: 0.5, extraDays: 1 },
  endurance: { sets: 0.9, reps: 1.5, rest: 0.4, extraDays: 1 },
  balanced: { sets: 1.0, reps: 1.0, rest: 1.0, extraDays: 0 },
};

function makeEx(ex: Exercise, baseSets: number, goal: TrainingGoal, label?: string): WorkoutExercise {
  const m = goalConfig[goal];
  const sets = Math.max(2, Math.round(baseSets * m.sets));
  if (ex.isHold) {
    const hold = ex.difficulty === "elite" ? 5 : ex.difficulty === "advanced" ? 10 : ex.difficulty === "intermediate" ? 15 : 30;
    return { exerciseId: ex.id, sets, reps: null, holdSeconds: Math.round(hold * m.reps), restSeconds: Math.round(90 * m.rest), progressionLevel: label };
  }
  const reps = ex.difficulty === "elite" ? 3 : ex.difficulty === "advanced" ? 5 : ex.difficulty === "intermediate" ? 8 : 12;
  return { exerciseId: ex.id, sets, reps: Math.max(1, Math.round(reps * m.reps)), holdSeconds: null, restSeconds: Math.round(90 * m.rest), progressionLevel: label };
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
    return generateYogaPlan(selectedSkillIds, 60);
  }

  const targetNames: string[] = [];
  const workoutExercises: WorkoutExercise[] = [];
  const usedIds = new Set<string>();

  for (const targetId of selectedSkillIds) {
    const target = getExerciseById(targetId);
    if (!target) continue;
    targetNames.push(target.name);

    const chain = getFullProgressionChain(targetId);
    const targetIdx = chain.findIndex((e) => e.id === targetId);
    const progressions = targetIdx > 0 ? chain.slice(0, targetIdx) : [];

    if (progressions.length > 0) {
      progressions.forEach((ex, i) => {
        if (usedIds.has(ex.id)) return;
        usedIds.add(ex.id);
        const isLast = i === progressions.length - 1;
        const label = isLast ? `⬆ Level up → ${target.name}` : undefined;
        workoutExercises.push(makeEx(ex, isLast ? 4 : 3, goal, label));
      });
    }

    const cond = getConditioningForSkill(targetId);
    if (cond.length > 0) {
      const top = cond[0];
      const isHold = top.reps.includes("s");
      workoutExercises.push({
        exerciseId: `cond-${targetId}-0`, sets: top.sets,
        reps: isHold ? null : parseInt(top.reps) || 8,
        holdSeconds: isHold ? parseInt(top.reps) || 15 : null,
        restSeconds: 60, progressionLevel: `🔧 ${top.name}`,
      });
    }
  }

  // Supporting exercises
  const supporters = exercises.filter(
    (e) => !usedIds.has(e.id) && (e.difficulty === "beginner" || e.difficulty === "intermediate") && e.category !== "skill"
  );
  for (const cat of ["push", "pull", "core", "legs"]) {
    if (workoutExercises.length >= 8) break;
    const ex = supporters.find((e) => e.category === cat && !usedIds.has(e.id));
    if (ex) { usedIds.add(ex.id); workoutExercises.push(makeEx(ex, 3, goal)); }
  }
  while (workoutExercises.length < 5) {
    const f = supporters.find((e) => !usedIds.has(e.id));
    if (!f) break;
    usedIds.add(f.id); workoutExercises.push(makeEx(f, 3, goal));
  }

  // Build days
  const baseDays = selectedSkillIds.length <= 1 ? 3 : Math.min(selectedSkillIds.length + 2, 6);
  const trainingDays = Math.max(3, Math.min(6, baseDays + goalConfig[goal].extraDays));
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const slots = trainingDays === 3 ? [0, 2, 4] : trainingDays === 4 ? [0, 1, 3, 4] : trainingDays === 5 ? [0, 1, 2, 4, 5] : [0, 1, 2, 3, 4, 5];
  const themes = ["Skill & Strength", "Volume & Endurance", "Conditioning", "Power", "Active Recovery", "Full Body"];
  const focusHints = ["Main lifts & holds", "Higher reps, controlled tempo", "Circuits & core", "Explosive & tight rest", "Easy pace & form", "Balanced push/pull"];

  const perDayPool: WorkoutExercise[][] = Array.from({ length: trainingDays }, () => []);
  for (let i = 0; i < workoutExercises.length; i++) {
    perDayPool[i % trainingDays].push(workoutExercises[i]);
  }
  const planSeed = Date.now() % 100000;
  perDayPool.forEach((list, di) => {
    perDayPool[di] = seededShuffle(list, planSeed + di * 997);
  });

  const days: DayWorkout[] = [];
  let ti = 0;
  for (let i = 0; i < 7; i++) {
    if (slots.includes(i) && ti < trainingDays) {
      const dayExercises = perDayPool[ti];
      const warmUp = calisthenicsWarmUpVariants[(ti + planSeed) % calisthenicsWarmUpVariants.length];
      days.push({
        day: dayNames[i],
        name: `${themes[ti % themes.length]} (${dayExercises.length} moves)`,
        isRest: false,
        focus: `${focusHints[ti % focusHints.length]} — ${dayExercises.length} exercises`,
        exercises: dayExercises,
        warmUp,
      });
      ti++;
    } else {
      days.push({ day: dayNames[i], name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) });
    }
  }

  const goalLabel = { muscle: "Build Muscle", skills: "Master Skills", "weight-loss": "Lose Weight", endurance: "Build Endurance", balanced: "Balanced" }[goal];
  const weeklyExerciseSlots = days.filter((d) => !d.isRest).reduce((s, d) => s + d.exercises.length, 0);
  return {
    id: `plan-${Date.now()}`, name: selectedSkillIds.length === 1 ? `${targetNames[0]} Program` : "Multi-Skill Program",
    description: `${goalLabel} — progressing toward: ${targetNames.join(", ")}`,
    difficulty: "intermediate", goal: `${goalLabel}: ${targetNames.join(", ")}`,
    trainingGoal: goal, targetSkills: selectedSkillIds, days,
    estimatedWeeklyMinutes: Math.round(weeklyExerciseSlots * 5), createdAt: new Date().toISOString(),
  };
}

// ─── YOGA PLAN ───

const muscleStretches: Record<string, string[]> = {
  "hamstrings": ["forward-fold", "half-splits", "seated-straddle"],
  "hip flexors": ["lizard", "pigeon", "warrior1", "camel"],
  "inner thighs": ["butterfly", "seated-straddle", "warrior2"],
  "hips": ["pigeon", "butterfly", "lizard", "happy-baby", "lotus"],
  "glutes": ["pigeon", "happy-baby", "supine-twist"],
  "quads": ["camel", "dancer"],
  "back": ["cobra", "bridge", "supine-twist", "childs"],
  "spine": ["cobra", "bridge", "camel", "plow"],
  "shoulders": ["eagle", "dolphin", "childs"],
  "chest": ["cobra", "bridge", "camel", "warrior1"],
  "core": ["boat", "side-plank", "dolphin"],
  "balance": ["tree", "warrior3", "eagle", "dancer"],
  "arms": ["dolphin", "side-plank"],
  "stress": ["childs", "forward-fold", "legs-up-wall", "savasana", "happy-baby", "supine-twist"],
  "sleep": ["childs", "forward-fold", "legs-up-wall", "supine-twist", "happy-baby", "savasana"],
  "relaxation": ["childs", "cobra", "butterfly", "forward-fold", "legs-up-wall", "savasana"],
  "energy": ["warrior1", "warrior2", "chair", "cobra", "bridge", "tree"],
  "posture": ["cobra", "camel", "bridge", "warrior1", "warrior2", "chair", "tree"],
  "full body": ["forward-fold", "cobra", "pigeon", "warrior1", "warrior2", "tree", "bridge", "butterfly", "seated-straddle", "half-splits"],
};

export function generateYogaPlanFromGoal(goalText: string, durationMinutes: number): WeeklyPlan {
  return generateYogaPlanInternal(goalText, durationMinutes);
}

function generateYogaPlan(poseIds: string[], durationMinutes: number): WeeklyPlan {
  return generateYogaPlanInternal("flexibility", durationMinutes, poseIds);
}

function generateYogaPlanInternal(goalText: string, duration: number, specificPoseIds?: string[]): WeeklyPlan {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dur = Math.max(10, duration || 60);
  const posesPerSession = Math.max(5, Math.round(dur / 3));

  // Determine which muscle groups to focus on based on goal
  const goalLower = goalText.toLowerCase();
  let focusMuscles: string[] = [];
  if (goalLower.includes("split") || goalLower.includes("flex")) focusMuscles = ["hamstrings", "hip flexors", "inner thighs", "hips"];
  else if (goalLower.includes("back") || goalLower.includes("bend")) focusMuscles = ["back", "spine", "shoulders", "chest"];
  else if (goalLower.includes("balance") || goalLower.includes("handstand")) focusMuscles = ["balance", "core", "arms"];
  else if (goalLower.includes("stress") || goalLower.includes("relax") || goalLower.includes("anxiety")) focusMuscles = ["stress", "relaxation"];
  else if (goalLower.includes("sleep")) focusMuscles = ["sleep", "relaxation"];
  else if (goalLower.includes("energy") || goalLower.includes("morning")) focusMuscles = ["energy", "posture"];
  else if (goalLower.includes("posture")) focusMuscles = ["posture", "back", "chest"];
  else focusMuscles = ["full body", "hips", "hamstrings", "back"];

  // Build pose pool from muscle groups
  const posePool = new Set<string>();
  for (const muscle of focusMuscles) {
    (muscleStretches[muscle] || []).forEach((id) => { if (getYogaPoseById(id)) posePool.add(id); });
  }
  // Add specific poses if provided
  if (specificPoseIds) specificPoseIds.forEach((id) => { if (getYogaPoseById(id)) posePool.add(id); });
  // Always include fundamentals
  ["forward-fold", "cobra", "childs", "butterfly", "bridge"].forEach((id) => posePool.add(id));
  const allPoses = [...posePool].filter((id) => getYogaPoseById(id));

  // Session templates
  const sessionTypes = [
    { name: "Flow Session", holdMult: 1.0 },
    { name: "Deep Stretch", holdMult: 1.5 },
    { name: "Active Flexibility", holdMult: 0.8 },
    { name: "Restorative", holdMult: 1.3 },
    { name: "Strength & Stretch", holdMult: 0.9 },
  ];

  const twoSided = new Set(["pigeon", "lizard", "half-splits", "warrior1", "warrior2", "warrior3", "eagle", "dancer", "tree", "standing-splits"]);
  const warmUpPoses = ["childs", "cobra", "bridge"];
  const coolDownPoses = ["supine-twist", "happy-baby", "legs-up-wall", "savasana"].filter((id) => getYogaPoseById(id));

  const yogaSeed = dur * 7919 + allPoses.length * 13;
  const days: DayWorkout[] = dayNames.map((day, i) => {
    if (i === 3 || i === 6) {
      return { day, name: "Rest", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) };
    }

    const session = sessionTypes[i % sessionTypes.length];
    const mainCount = Math.max(3, posesPerSession - warmUpPoses.length - coolDownPoses.length);
    const shuffled = seededShuffle(allPoses, yogaSeed + i * 104729);
    const start = allPoses.length <= mainCount ? 0 : (i * 11) % Math.max(1, shuffled.length - mainCount);
    const doubled = shuffled.length >= mainCount ? [...shuffled, ...shuffled] : [...shuffled, ...shuffled, ...shuffled];
    const mainPoses = doubled.slice(start, start + mainCount);
    const sessionPoses = [...new Set([...warmUpPoses, ...mainPoses, ...coolDownPoses])].filter((id) => getYogaPoseById(id));

    return {
      day,
      name: `${session.name} · Day ${i + 1} (${dur} min)`,
      isRest: false,
      focus: `${focusMuscles.slice(0, 3).join(", ")} — varied sequence`,
      exercises: sessionPoses.map((id) => {
        const pose = getYogaPoseById(id);
        return {
          exerciseId: id, sets: twoSided.has(id) ? 2 : 1, reps: null,
          holdSeconds: Math.round((pose?.holdSeconds || 30) * session.holdMult),
          restSeconds: 5, progressionLevel: specificPoseIds?.includes(id) ? "🎯 Target" : undefined,
        };
      }),
    };
  });

  const goalDesc = specificPoseIds
    ? specificPoseIds.map((id) => getYogaPoseById(id)?.name).filter(Boolean).join(", ")
    : goalText;

  return {
    id: `yoga-${Date.now()}`, name: `Yoga: ${goalDesc.slice(0, 30)}`,
    description: `${dur}-min yoga sessions — ${goalDesc}`,
    difficulty: "intermediate", goal: goalDesc,
    trainingGoal: "balanced", targetSkills: specificPoseIds || [], days,
    estimatedWeeklyMinutes: dur * 5, createdAt: new Date().toISOString(),
  };
}
