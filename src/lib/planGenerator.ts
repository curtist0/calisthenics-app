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
  const map: Record<string, WarmUp> = {
    push: { name: "Upper Body Warm-Up", duration: "5 min", exercises: ["Arm circles × 15 each direction", "Band pull-aparts × 15", "Push-up walkouts × 5", "Wrist circles × 20"] },
    pull: { name: "Pull Warm-Up", duration: "5 min", exercises: ["Dead hangs 30s", "Scapular pulls × 10", "Band pull-aparts × 15", "Cat-cow × 8"] },
    legs: { name: "Lower Body Warm-Up", duration: "5 min", exercises: ["Leg swings × 10 each", "Air squats × 10", "Hip circles × 10 each", "Ankle circles × 10"] },
    skill: { name: "Skill Warm-Up", duration: "7 min", exercises: ["Wrist circles × 20", "Plank 30s", "Scapular push-ups × 10", "Hollow body 20s", "Dead hang 30s"] },
  };
  const key = focus.includes("push") || focus.includes("Press") ? "push" : focus.includes("pull") || focus.includes("Pull") ? "pull" : focus.includes("leg") || focus.includes("Leg") ? "legs" : "skill";
  return map[key] || map.skill;
}

const yogaFlows: RestDayActivity[] = [
  { name: "Hip Opening Flow", description: "Deep hip stretches", duration: "15 min", type: "yoga", yogaPoseIds: ["pigeon", "seated-straddle", "half-splits", "childs", "savasana"] },
  { name: "Spine & Back Flow", description: "Backbends and twists", duration: "12 min", type: "yoga", yogaPoseIds: ["cobra", "bridge", "forward-fold", "childs", "legs-up-wall"] },
  { name: "Full Body Restore", description: "Head-to-toe relaxation", duration: "18 min", type: "yoga", yogaPoseIds: ["childs", "cobra", "pigeon", "forward-fold", "bridge", "savasana"] },
  { name: "Balance & Focus", description: "Stability and mindfulness", duration: "15 min", type: "yoga", yogaPoseIds: ["tree", "warrior3", "chair", "forward-fold", "savasana"] },
  { name: "Splits Prep", description: "Stretching toward splits", duration: "20 min", type: "yoga", yogaPoseIds: ["forward-fold", "half-splits", "pigeon", "seated-straddle", "savasana"] },
];

function getRestDayActivities(dayIndex: number): RestDayActivity[] {
  const profile = getUserProfile();
  const acts: RestDayActivity[] = [];
  if (profile?.yogaSetUp) acts.push(yogaFlows[dayIndex % yogaFlows.length]);
  acts.push({ name: "Light Walk", description: "20–30 min easy walk", duration: "20-30 min", type: "light-cardio" });
  acts.push({ name: "Mobility Work", description: "Joint circles, foam rolling", duration: "10 min", type: "mobility" });
  return acts;
}

const dayThemes = [
  { name: "Skill & Strength", focus: "Heavy progression work + strength" },
  { name: "Volume & Endurance", focus: "Higher reps, shorter rest" },
  { name: "Conditioning & Core", focus: "Conditioning prep + core work" },
  { name: "Power & Explosiveness", focus: "Low reps, full rest, quality" },
  { name: "Active Recovery + Skills", focus: "Light skill practice + mobility" },
  { name: "Full Body Circuit", focus: "All muscle groups, circuit style" },
];

// Check if user has shown enough progress to attempt the target skill
function shouldIncludeGoalSkill(targetId: string): boolean {
  const profile = getUserProfile();
  if (!profile) return false;
  const level = profile.exerciseLevels.find((l) => {
    const chain = getFullProgressionChain(targetId);
    const targetIdx = chain.findIndex((e) => e.id === targetId);
    if (targetIdx <= 0) return false;
    const prevExercise = chain[targetIdx - 1];
    return l.exerciseId === prevExercise.id;
  });
  if (!level) return false;
  // If user has intermediate+ level on the prerequisite, they can attempt the target
  return level.level === "intermediate" || level.level === "advanced" || level.level === "elite";
}

export function generateWeeklyPlan(selectedSkillIds: string[], goal: TrainingGoal): WeeklyPlan {
  const isYogaPlan = selectedSkillIds.some((id) => getYogaPoseById(id) !== undefined);
  if (isYogaPlan) return generateYogaPlan(selectedSkillIds);

  const targetNames: string[] = [];
  const usedIds = new Set<string>();
  type ExEntry = { ex: WorkoutExercise; category: string };
  const primaryExercises: ExEntry[] = [];
  const conditioningExercises: ExEntry[] = [];

  for (const targetId of selectedSkillIds) {
    const target = getExerciseById(targetId);
    if (!target) continue;
    targetNames.push(target.name);

    const chain = getFullProgressionChain(targetId);
    const targetIdx = chain.findIndex((e) => e.id === targetId);

    // Progressions BELOW target
    const doable = chain.slice(Math.max(0, targetIdx - 4), targetIdx);
    if (doable.length === 0 && targetIdx > 0) doable.push(chain[targetIdx - 1]);
    if (targetIdx === 0) doable.push(chain[0]);

    doable.forEach((ex, i) => {
      if (usedIds.has(ex.id)) return;
      usedIds.add(ex.id);
      const isHighest = i === doable.length - 1;
      const nextInChain = chain[chain.indexOf(ex) + 1];
      const label = isHighest && nextInChain ? `⬆ Level up → ${nextInChain.name}` : `Step ${i + 1}`;
      primaryExercises.push({ ex: makeEx(ex, isHighest ? 4 : 3, goal, label), category: ex.category });
    });

    // If user shows enough progress, include the TARGET at very low volume
    if (shouldIncludeGoalSkill(targetId) && !usedIds.has(targetId)) {
      usedIds.add(targetId);
      const goalEx = makeEx(target, 2, goal, `🎯 Attempt: ${target.name}`);
      // Reduce to minimal volume — just taste the skill
      if (goalEx.reps) goalEx.reps = Math.min(goalEx.reps, 3);
      if (goalEx.holdSeconds) goalEx.holdSeconds = Math.min(goalEx.holdSeconds, 5);
      goalEx.sets = 2;
      goalEx.restSeconds = 120;
      primaryExercises.push({ ex: goalEx, category: target.category });
    }

    // Conditioning prep
    const cond = getConditioningForSkill(targetId);
    cond.forEach((c) => {
      const isHold = c.reps.includes("s");
      conditioningExercises.push({
        ex: {
          exerciseId: `cond-${targetId}-${c.name.toLowerCase().replace(/\s+/g, "-").slice(0, 20)}`,
          sets: c.sets, reps: isHold ? null : parseInt(c.reps) || 8,
          holdSeconds: isHold ? parseInt(c.reps) || 15 : null,
          restSeconds: 45, progressionLevel: `🔧 Prep for ${target.name}`,
        },
        category: target.category,
      });
    });
  }

  // Supporting exercises
  const allSupporters = exercises.filter(
    (e) => !usedIds.has(e.id) && (e.difficulty === "beginner" || e.difficulty === "intermediate") && e.category !== "skill"
  );
  const supportersByCat: Record<string, Exercise[]> = {};
  for (const ex of allSupporters) {
    if (!supportersByCat[ex.category]) supportersByCat[ex.category] = [];
    supportersByCat[ex.category].push(ex);
  }

  const numTargets = selectedSkillIds.length;
  const baseDays = numTargets <= 1 ? 3 : numTargets <= 3 ? 4 : numTargets <= 5 ? 5 : 6;
  const trainingDays = Math.max(3, Math.min(6, baseDays + goalConfig[goal].extraDays));

  type Bucket = { exercises: WorkoutExercise[]; name: string; focus: string };
  const buckets: Bucket[] = [];

  for (let d = 0; d < trainingDays; d++) {
    const theme = dayThemes[d % dayThemes.length];
    const dayExercises: WorkoutExercise[] = [];

    const primForDay = primaryExercises.filter((_, i) => i % trainingDays === d || primaryExercises.length <= trainingDays);
    primForDay.forEach((p) => dayExercises.push(p.ex));

    if (dayExercises.length < 2 && conditioningExercises.length > 0) {
      conditioningExercises.filter((_, i) => i % trainingDays === d).slice(0, 2).forEach((c) => dayExercises.push(c.ex));
    }

    const cats = ["push", "pull", "core", "legs"];
    for (const cat of cats) {
      if (dayExercises.length >= 5) break;
      const pool = supportersByCat[cat] || [];
      if (pool.length > 0) {
        const pick = pool[d % pool.length];
        dayExercises.push(makeEx(d % 2 === 0 ? pick : (pool[(d + 1) % pool.length] || pick), 3, goal));
      }
    }

    while (dayExercises.length < 3) {
      const filler = allSupporters.find((e) => !dayExercises.some((de) => de.exerciseId === e.id));
      if (!filler) break;
      dayExercises.push(makeEx(filler, 3, goal));
    }

    buckets.push({ exercises: dayExercises, name: theme.name, focus: theme.focus });
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const slots = trainingDays === 3 ? [0, 2, 4] : trainingDays === 4 ? [0, 1, 3, 4] : trainingDays === 5 ? [0, 1, 2, 4, 5] : [0, 1, 2, 3, 4, 5];
  const days: DayWorkout[] = [];
  let bi = 0;
  for (let i = 0; i < 7; i++) {
    if (slots.includes(i) && bi < buckets.length) {
      days.push({ day: dayNames[i], name: buckets[bi].name, isRest: false, focus: buckets[bi].focus, exercises: buckets[bi].exercises, warmUp: getWarmUp(buckets[bi].focus) });
      bi++;
    } else {
      days.push({ day: dayNames[i], name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) });
    }
  }

  const totalEx = buckets.reduce((s, b) => s + b.exercises.length, 0);
  const goalLabel = { muscle: "Build Muscle", skills: "Master Skills", "weight-loss": "Lose Weight", endurance: "Build Endurance", balanced: "Balanced" }[goal];
  return {
    id: `plan-${Date.now()}`, name: numTargets === 1 ? `${targetNames[0]} Program` : "Multi-Skill Program",
    description: `${goalLabel} — progressions toward: ${targetNames.join(", ")}`,
    difficulty: "intermediate", goal: `${goalLabel}: ${targetNames.join(", ")}`,
    trainingGoal: goal, targetSkills: selectedSkillIds, days,
    estimatedWeeklyMinutes: totalEx * 5 + trainingDays * 10, createdAt: new Date().toISOString(),
  };
}

// ─── YOGA PLAN: 30-60 min follow-along sessions ───

function generateYogaPlan(selectedPoseIds: string[]): WeeklyPlan {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const targetPoses = selectedPoseIds.map((id) => getYogaPoseById(id)).filter(Boolean);
  const poseNames = targetPoses.map((p) => p!.name);

  // Build a large pool of poses for full sessions
  const allBeginnerPoses = yogaPoses.filter((p) => p.difficulty === "beginner");
  const allIntermediatePoses = yogaPoses.filter((p) => p.difficulty === "intermediate" || p.difficulty === "beginner");

  // Session templates: each is a different 30-60 min flow
  const sessions = [
    {
      name: "Sunrise Flow",
      focus: "Full body opening — 40 min",
      buildPoses: (targets: string[]) => [
        "childs", "cobra", "bridge", "forward-fold", "warrior1", "warrior2", "tree",
        ...targets,
        "seated-straddle", "butterfly", "supine-twist", "happy-baby", "savasana",
      ],
    },
    {
      name: "Deep Stretch",
      focus: "Long holds for deep flexibility — 45 min",
      buildPoses: (targets: string[]) => [
        "childs", "cobra", "pigeon", "lizard", "half-splits",
        ...targets,
        "seated-straddle", "forward-fold", "butterfly", "supine-twist", "legs-up-wall", "savasana",
      ],
    },
    {
      name: "Strength & Balance",
      focus: "Active poses for strength — 35 min",
      buildPoses: (targets: string[]) => [
        "chair", "warrior1", "warrior2", "warrior3", "eagle", "boat", "dolphin",
        ...targets,
        "side-plank", "bridge", "childs", "savasana",
      ],
    },
    {
      name: "Flexibility Builder",
      focus: "Progressive stretching — 50 min",
      buildPoses: (targets: string[]) => [
        "forward-fold", "cobra", "pigeon", "lizard", "half-splits", "seated-straddle",
        ...targets,
        "butterfly", "bridge", "supine-twist", "happy-baby", "legs-up-wall", "savasana",
      ],
    },
    {
      name: "Evening Restore",
      focus: "Calming wind-down flow — 30 min",
      buildPoses: (targets: string[]) => [
        "childs", "cobra", "butterfly", "forward-fold",
        ...targets,
        "supine-twist", "happy-baby", "legs-up-wall", "savasana",
      ],
    },
  ];

  const warmUp: WarmUp = {
    name: "Yoga Warm-Up",
    duration: "5 min",
    exercises: ["Neck rolls × 10 each direction", "Shoulder rolls × 10 each", "Cat-cow × 10", "Hip circles × 10 each", "Sun salutation × 3"],
  };

  const days: DayWorkout[] = dayNames.map((day, i) => {
    if (i === 3 || i === 6) {
      return { day, name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) };
    }

    const session = sessions[i % sessions.length];
    const poseIds = session.buildPoses(selectedPoseIds);
    // Remove duplicates while preserving order
    const uniquePoseIds = [...new Set(poseIds)];
    // Only include poses that exist
    const validPoseIds = uniquePoseIds.filter((id) => getYogaPoseById(id));

    // Vary hold times by session
    const holdMultiplier = session.name.includes("Deep") ? 1.5 : session.name.includes("Strength") ? 0.8 : session.name.includes("Restore") ? 1.3 : 1.0;

    return {
      day, name: session.name, isRest: false, focus: session.focus,
      exercises: validPoseIds.map((id) => {
        const pose = getYogaPoseById(id);
        const baseHold = pose?.holdSeconds || 30;
        const isTwoSided = ["pigeon", "lizard", "half-splits", "warrior1", "warrior2", "warrior3", "eagle", "dancer", "tree"].includes(id);
        return {
          exerciseId: id, sets: isTwoSided ? 2 : 1, reps: null,
          holdSeconds: Math.round(baseHold * holdMultiplier),
          restSeconds: 5,
          progressionLevel: selectedPoseIds.includes(id) ? "🎯 Target pose" : undefined,
        };
      }),
      warmUp,
    };
  });

  return {
    id: `yoga-${Date.now()}`,
    name: targetPoses.length === 1 ? `${poseNames[0]} Program` : "Flexibility Program",
    description: `30-60 min yoga sessions progressing toward: ${poseNames.join(", ")}`,
    difficulty: targetPoses.some((p) => p!.difficulty === "elite") ? "elite" : targetPoses.some((p) => p!.difficulty === "advanced") ? "advanced" : "intermediate",
    goal: `Achieve: ${poseNames.join(", ")}`,
    trainingGoal: "balanced", targetSkills: selectedPoseIds, days,
    estimatedWeeklyMinutes: 200, createdAt: new Date().toISOString(),
  };
}
