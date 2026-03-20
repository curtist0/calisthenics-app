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
  muscle:        { sets: 1.3, reps: 0.8, rest: 1.3, extraDays: 0 },
  skills:        { sets: 1.2, reps: 0.7, rest: 1.5, extraDays: -1 },
  "weight-loss": { sets: 0.8, reps: 1.4, rest: 0.5, extraDays: 1 },
  endurance:     { sets: 0.9, reps: 1.5, rest: 0.4, extraDays: 1 },
  balanced:      { sets: 1.0, reps: 1.0, rest: 1.0, extraDays: 0 },
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

function getWarmUp(focus: string): WarmUp {
  if (focus.includes("push") || focus.includes("Push")) return { name: "Upper Body Warm-Up", duration: "5 min", exercises: ["Arm circles × 15 each", "Band pull-aparts × 15", "Push-up walkouts × 5", "Wrist circles × 20"] };
  if (focus.includes("pull") || focus.includes("Pull")) return { name: "Pull Warm-Up", duration: "5 min", exercises: ["Dead hangs 30s", "Scapular pulls × 10", "Band pull-aparts × 15", "Cat-cow × 8"] };
  return { name: "Full Body Warm-Up", duration: "5 min", exercises: ["Jumping jacks × 20", "Arm circles × 10 each", "Leg swings × 10 each", "Wrist circles × 20", "Air squats × 10"] };
}

const yogaFlows: RestDayActivity[] = [
  { name: "Hip Opening Flow", description: "Deep hip stretches", duration: "15 min", type: "yoga", yogaPoseIds: ["pigeon", "seated-straddle", "half-splits", "childs", "savasana"] },
  { name: "Spine & Back Flow", description: "Backbends and twists", duration: "12 min", type: "yoga", yogaPoseIds: ["cobra", "bridge", "forward-fold", "childs", "legs-up-wall"] },
  { name: "Full Body Restore", description: "Head-to-toe relaxation", duration: "18 min", type: "yoga", yogaPoseIds: ["childs", "cobra", "pigeon", "forward-fold", "bridge", "savasana"] },
];

function getRestDayActivities(dayIndex: number): RestDayActivity[] {
  const profile = getUserProfile();
  const acts: RestDayActivity[] = [];
  if (profile?.yogaSetUp) acts.push(yogaFlows[dayIndex % yogaFlows.length]);
  acts.push({ name: "Light Walk", description: "20–30 min easy walk", duration: "20-30 min", type: "light-cardio" });
  acts.push({ name: "Mobility Work", description: "Joint circles, foam rolling", duration: "10 min", type: "mobility" });
  return acts;
}

// ─── CALISTHENICS PLAN ───

export function generateWeeklyPlan(selectedSkillIds: string[], goal: TrainingGoal): WeeklyPlan {
  const isYogaPlan = selectedSkillIds.some((id) => getYogaPoseById(id) !== undefined);
  if (isYogaPlan) return generateYogaPlan(selectedSkillIds);

  const targetNames: string[] = [];
  const allExercises: WorkoutExercise[] = [];
  const usedIds = new Set<string>();

  for (const targetId of selectedSkillIds) {
    const target = getExerciseById(targetId);
    if (!target) continue;
    targetNames.push(target.name);

    const chain = getFullProgressionChain(targetId);
    const targetIdx = chain.findIndex((e) => e.id === targetId);

    // Get ALL progressions from the EASIEST to one step below target
    // NEVER include the target itself
    const doableChain = targetIdx > 0 ? chain.slice(0, targetIdx) : [];

    // If no progressions exist (target IS the easiest), use conditioning instead
    if (doableChain.length === 0) {
      const cond = getConditioningForSkill(targetId);
      cond.forEach((c, ci) => {
        const isHold = c.reps.includes("s");
        allExercises.push({
          exerciseId: `cond-${targetId}-${ci}`,
          sets: c.sets, reps: isHold ? null : parseInt(c.reps) || 8,
          holdSeconds: isHold ? parseInt(c.reps) || 15 : null,
          restSeconds: 60, progressionLevel: `🔧 ${c.name} (prep for ${target.name})`,
        });
      });
      continue;
    }

    // Include each progression step, numbered from easiest to hardest
    doableChain.forEach((ex, i) => {
      if (usedIds.has(ex.id)) return;
      usedIds.add(ex.id);
      const stepNum = i + 1;
      const total = doableChain.length;
      const nextEx = doableChain[i + 1] || target;
      const label = i === total - 1
        ? `Step ${stepNum}/${total} — ⬆ Level up → ${nextEx.name}`
        : `Step ${stepNum}/${total}`;
      allExercises.push(makeEx(ex, i === total - 1 ? 4 : 3, goal, label));
    });

    // Add conditioning for this skill too
    const cond = getConditioningForSkill(targetId);
    if (cond.length > 0) {
      const topCond = cond[0]; // Just add the most important one
      const isHold = topCond.reps.includes("s");
      allExercises.push({
        exerciseId: `cond-${targetId}-0`,
        sets: topCond.sets, reps: isHold ? null : parseInt(topCond.reps) || 8,
        holdSeconds: isHold ? parseInt(topCond.reps) || 15 : null,
        restSeconds: 45, progressionLevel: `🔧 ${topCond.name}`,
      });
    }
  }

  // Add supporting exercises
  const supporters = exercises.filter(
    (e) => !usedIds.has(e.id) && (e.difficulty === "beginner" || e.difficulty === "intermediate") && e.category !== "skill"
  );
  for (const cat of ["push", "pull", "core", "legs"]) {
    const ex = supporters.find((e) => e.category === cat);
    if (ex && !usedIds.has(ex.id)) {
      usedIds.add(ex.id);
      allExercises.push(makeEx(ex, 3, goal));
    }
  }

  // Ensure minimum exercises
  while (allExercises.length < 5) {
    const filler = supporters.find((e) => !usedIds.has(e.id));
    if (!filler) break;
    usedIds.add(filler.id);
    allExercises.push(makeEx(filler, 3, goal));
  }

  // Build training days — put ALL exercises into EACH training day
  // so the workout runs through everything sequentially
  const numTargets = selectedSkillIds.length;
  const baseDays = numTargets <= 1 ? 3 : numTargets <= 3 ? 4 : numTargets <= 5 ? 5 : 6;
  const trainingDays = Math.max(3, Math.min(6, baseDays + goalConfig[goal].extraDays));

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const slots = trainingDays === 3 ? [0, 2, 4] : trainingDays === 4 ? [0, 1, 3, 4] : trainingDays === 5 ? [0, 1, 2, 4, 5] : [0, 1, 2, 3, 4, 5];

  const themes = ["Skill & Strength", "Volume & Endurance", "Conditioning & Core", "Power", "Active Recovery", "Full Body"];
  const days: DayWorkout[] = [];
  let ti = 0;
  for (let i = 0; i < 7; i++) {
    if (slots.includes(i) && ti < trainingDays) {
      days.push({
        day: dayNames[i], name: themes[ti % themes.length], isRest: false,
        focus: `Full workout — ${allExercises.length} exercises`,
        exercises: allExercises, // ALL exercises every training day
        warmUp: getWarmUp(themes[ti % themes.length]),
      });
      ti++;
    } else {
      days.push({ day: dayNames[i], name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) });
    }
  }

  const goalLabel = { muscle: "Build Muscle", skills: "Master Skills", "weight-loss": "Lose Weight", endurance: "Build Endurance", balanced: "Balanced" }[goal];
  return {
    id: `plan-${Date.now()}`,
    name: numTargets === 1 ? `${targetNames[0]} Program` : "Multi-Skill Program",
    description: `${goalLabel} — progressions toward: ${targetNames.join(", ")}`,
    difficulty: "intermediate", goal: `${goalLabel}: ${targetNames.join(", ")}`,
    trainingGoal: goal, targetSkills: selectedSkillIds, days,
    estimatedWeeklyMinutes: allExercises.length * 5 * trainingDays + trainingDays * 10,
    createdAt: new Date().toISOString(),
  };
}

// ─── YOGA PLAN: real flexibility sessions ───

// Map yoga poses to the muscles they need — used to find supporting stretches
const poseTargetMuscles: Record<string, string[]> = {
  "full-splits": ["hamstrings", "hip flexors", "inner thighs"],
  "middle-splits": ["inner thighs", "hips", "hamstrings"],
  "half-splits": ["hamstrings"],
  "pigeon": ["hips", "glutes"],
  "king-pigeon": ["hips", "quads", "back"],
  "wheel": ["spine", "shoulders", "chest"],
  "forearm-stand": ["shoulders", "core", "balance"],
  "headstand": ["core", "shoulders", "balance"],
  "crow": ["arms", "core", "wrists"],
  "scorpion": ["shoulders", "back", "balance"],
  "compass": ["hamstrings", "shoulders", "hips"],
  "standing-splits": ["hamstrings", "hips", "balance"],
  "eight-angle": ["arms", "core", "hips"],
  "flying-pigeon": ["arms", "hips", "core"],
  "firefly": ["arms", "hamstrings", "core"],
  "peacock": ["core", "wrists", "arms"],
  "lotus": ["hips", "knees", "ankles"],
};

// Stretches that open specific muscle groups
const muscleStretches: Record<string, string[]> = {
  "hamstrings": ["forward-fold", "half-splits", "seated-straddle"],
  "hip flexors": ["lizard", "pigeon", "warrior1", "camel"],
  "inner thighs": ["butterfly", "seated-straddle", "warrior2"],
  "hips": ["pigeon", "butterfly", "lizard", "happy-baby"],
  "glutes": ["pigeon", "happy-baby", "supine-twist"],
  "quads": ["camel", "dancer"],
  "back": ["cobra", "bridge", "supine-twist", "childs"],
  "spine": ["cobra", "bridge", "camel", "plow"],
  "shoulders": ["eagle", "dolphin", "childs"],
  "chest": ["cobra", "bridge", "camel", "warrior1"],
  "core": ["boat", "side-plank", "dolphin"],
  "balance": ["tree", "warrior3", "eagle", "dancer"],
  "arms": ["dolphin", "side-plank", "crow"],
  "wrists": ["dolphin"],
  "knees": ["butterfly", "childs"],
  "ankles": ["chair", "warrior1"],
};

function generateYogaPlan(selectedPoseIds: string[]): WeeklyPlan {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const targetPoses = selectedPoseIds.map((id) => getYogaPoseById(id)).filter(Boolean);
  const poseNames = targetPoses.map((p) => p!.name);

  // Find all muscles the target poses require
  const neededMuscles = new Set<string>();
  for (const poseId of selectedPoseIds) {
    const muscles = poseTargetMuscles[poseId] || [];
    muscles.forEach((m) => neededMuscles.add(m));
    // Also use target areas from the pose data
    const pose = getYogaPoseById(poseId);
    if (pose) pose.targetAreas.forEach((a) => neededMuscles.add(a));
  }

  // Build a pool of supporting stretches for those muscles
  const supportingPoseIds = new Set<string>();
  for (const muscle of neededMuscles) {
    const stretches = muscleStretches[muscle] || [];
    stretches.forEach((id) => {
      if (!selectedPoseIds.includes(id)) supportingPoseIds.add(id);
    });
  }

  // Always include fundamentals
  ["forward-fold", "cobra", "butterfly", "childs", "bridge"].forEach((id) => supportingPoseIds.add(id));

  const supportingList = [...supportingPoseIds].filter((id) => getYogaPoseById(id));

  const warmUp: WarmUp = {
    name: "Yoga Warm-Up", duration: "5 min",
    exercises: ["Neck rolls × 10 each direction", "Shoulder rolls × 10 each", "Cat-cow × 10", "Hip circles × 10 each", "Sun salutation × 3"],
  };

  // Build 5 different session types for variety
  const sessionBuilders = [
    (supports: string[], targets: string[]) => ({
      name: "Flexibility Flow", focus: "Progressive stretching — 45 min",
      poses: [...supports.slice(0, 6), ...targets, "supine-twist", "happy-baby", "savasana"],
    }),
    (supports: string[], targets: string[]) => ({
      name: "Deep Hold Session", focus: "Long holds for deep stretch — 50 min",
      poses: ["childs", ...supports.slice(0, 5), ...targets, ...supports.slice(5, 8), "legs-up-wall", "savasana"],
    }),
    (supports: string[], targets: string[]) => ({
      name: "Active Flexibility", focus: "Strength meets stretch — 40 min",
      poses: ["chair", "warrior1", "warrior2", ...supports.slice(0, 4), ...targets, "boat", "side-plank", "childs", "savasana"],
    }),
    (supports: string[], targets: string[]) => ({
      name: "Target Pose Focus", focus: "Maximum work on goal poses — 45 min",
      poses: [...supports.slice(0, 4), ...targets, ...supports.slice(2, 6), ...targets, "supine-twist", "savasana"],
    }),
    (supports: string[], targets: string[]) => ({
      name: "Restorative & Stretch", focus: "Gentle recovery stretching — 35 min",
      poses: ["childs", "cobra", "butterfly", ...supports.slice(0, 4), ...targets, "happy-baby", "legs-up-wall", "savasana"],
    }),
  ];

  const days: DayWorkout[] = dayNames.map((day, i) => {
    if (i === 3 || i === 6) {
      return { day, name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) };
    }

    const builder = sessionBuilders[i % sessionBuilders.length];
    const session = builder(supportingList, selectedPoseIds);
    const uniquePoses = [...new Set(session.poses)].filter((id) => getYogaPoseById(id));
    const holdMult = session.name.includes("Deep") ? 1.5 : session.name.includes("Active") ? 0.8 : 1.0;
    const twoSided = ["pigeon", "lizard", "half-splits", "warrior1", "warrior2", "warrior3", "eagle", "dancer", "tree", "standing-splits"];

    return {
      day, name: session.name, isRest: false, focus: session.focus,
      exercises: uniquePoses.map((id) => {
        const pose = getYogaPoseById(id);
        return {
          exerciseId: id, sets: twoSided.includes(id) ? 2 : 1, reps: null,
          holdSeconds: Math.round((pose?.holdSeconds || 30) * holdMult), restSeconds: 5,
          progressionLevel: selectedPoseIds.includes(id) ? "🎯 Target pose" : undefined,
        };
      }),
      warmUp,
    };
  });

  return {
    id: `yoga-${Date.now()}`,
    name: targetPoses.length === 1 ? `${poseNames[0]} Program` : "Flexibility Program",
    description: `Flexibility sessions progressing toward: ${poseNames.join(", ")}`,
    difficulty: targetPoses.some((p) => p!.difficulty === "elite") ? "elite" : "intermediate",
    goal: `Achieve: ${poseNames.join(", ")}`,
    trainingGoal: "balanced", targetSkills: selectedPoseIds, days,
    estimatedWeeklyMinutes: 200, createdAt: new Date().toISOString(),
  };
}
