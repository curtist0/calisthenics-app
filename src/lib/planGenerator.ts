import { Exercise, WeeklyPlan, DayWorkout, WorkoutExercise, TrainingGoal, WarmUp, RestDayActivity } from "./types";
import { exercises, getExerciseById } from "@/data/exercises";
import { getYogaPoseById } from "@/data/yoga";
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

function makeExercise(ex: Exercise, baseSets: number, goal: TrainingGoal, level?: string): WorkoutExercise {
  const m = goalConfig[goal];
  const sets = Math.max(2, Math.round(baseSets * m.sets));
  if (ex.isHold) {
    const hold = ex.difficulty === "elite" ? 5 : ex.difficulty === "advanced" ? 10 : ex.difficulty === "intermediate" ? 15 : 30;
    return { exerciseId: ex.id, sets, reps: null, holdSeconds: Math.round(hold * m.reps), restSeconds: Math.round(90 * m.rest), progressionLevel: level };
  }
  const reps = ex.difficulty === "elite" ? 3 : ex.difficulty === "advanced" ? 5 : ex.difficulty === "intermediate" ? 8 : 12;
  return { exerciseId: ex.id, sets, reps: Math.max(1, Math.round(reps * m.reps)), holdSeconds: null, restSeconds: Math.round(90 * m.rest), progressionLevel: level };
}

function getWarmUp(focus: string): WarmUp {
  const map: Record<string, WarmUp> = {
    push: { name: "Upper Body Warm-Up", duration: "5 min", exercises: ["Arm circles × 15 each", "Band pull-aparts × 15", "Push-up walkouts × 5", "Wrist circles × 20"] },
    pull: { name: "Pull Warm-Up", duration: "5 min", exercises: ["Dead hangs 30s", "Scapular pulls × 10", "Band pull-aparts × 15", "Cat-cow × 8"] },
    legs: { name: "Lower Body Warm-Up", duration: "5 min", exercises: ["Leg swings × 10 each", "Air squats × 10", "Hip circles × 10 each", "Ankle circles × 10"] },
    skill: { name: "Skill Warm-Up", duration: "7 min", exercises: ["Wrist circles × 20", "Plank 30s", "Scapular push-ups × 10", "Hollow body 20s", "Dead hang 30s"] },
  };
  const key = focus.includes("push") || focus.includes("Press") ? "push" : focus.includes("pull") || focus.includes("Pull") ? "pull" : focus.includes("leg") || focus.includes("Leg") ? "legs" : "skill";
  return map[key] || map.skill;
}

const yogaFlows: RestDayActivity[] = [
  { name: "Hip Opening Flow", description: "Deep hip stretches for recovery", duration: "15 min", type: "yoga", yogaPoseIds: ["pigeon", "seated-straddle", "half-splits", "childs", "savasana"] },
  { name: "Spine & Back Flow", description: "Gentle backbends and twists", duration: "12 min", type: "yoga", yogaPoseIds: ["cobra", "bridge", "forward-fold", "childs", "legs-up-wall"] },
  { name: "Full Body Restore", description: "Head-to-toe relaxation sequence", duration: "18 min", type: "yoga", yogaPoseIds: ["childs", "cobra", "pigeon", "forward-fold", "bridge", "legs-up-wall", "savasana"] },
  { name: "Balance & Focus", description: "Build stability and mindfulness", duration: "15 min", type: "yoga", yogaPoseIds: ["tree", "warrior3", "chair", "forward-fold", "savasana"] },
  { name: "Splits Prep", description: "Stretching toward splits", duration: "20 min", type: "yoga", yogaPoseIds: ["forward-fold", "half-splits", "pigeon", "seated-straddle", "savasana"] },
];

function getRestDayActivities(dayIndex: number): RestDayActivity[] {
  const profile = getUserProfile();
  const yogaEnabled = profile?.yogaSetUp ?? false;
  const activities: RestDayActivity[] = [];
  if (yogaEnabled) {
    activities.push(yogaFlows[dayIndex % yogaFlows.length]);
  }
  activities.push({ name: "Light Walk", description: "20–30 minute easy walk outdoors", duration: "20-30 min", type: "light-cardio" });
  activities.push({ name: "Mobility Work", description: "Joint circles, wrist stretches, and foam rolling", duration: "10 min", type: "mobility" });
  return activities;
}

// Day themes for variety — each day has a different training focus
const dayThemes = [
  { name: "Skill & Strength", focus: "Heavy progression work + strength", setsMultiplier: 1.0 },
  { name: "Volume & Endurance", focus: "Higher reps, shorter rest", setsMultiplier: 0.8 },
  { name: "Conditioning & Core", focus: "Conditioning prep + core work", setsMultiplier: 0.9 },
  { name: "Power & Explosiveness", focus: "Low reps, full rest, quality", setsMultiplier: 1.2 },
  { name: "Active Recovery + Skills", focus: "Light skill practice + mobility", setsMultiplier: 0.7 },
  { name: "Full Body Circuit", focus: "All muscle groups, circuit style", setsMultiplier: 0.8 },
];

export function generateWeeklyPlan(selectedSkillIds: string[], goal: TrainingGoal): WeeklyPlan {
  // Check if these are yoga pose IDs
  const isYogaPlan = selectedSkillIds.some((id) => getYogaPoseById(id) !== undefined);
  if (isYogaPlan) return generateYogaPlan(selectedSkillIds, goal);

  const targetNames: string[] = [];
  const usedIds = new Set<string>();
  let hasElite = false;

  // Build exercise pool: progressions + conditioning for each target
  type ExEntry = { ex: WorkoutExercise; isPrimary: boolean; category: string };
  const primaryExercises: ExEntry[] = [];
  const conditioningExercises: ExEntry[] = [];

  for (const targetId of selectedSkillIds) {
    const target = getExerciseById(targetId);
    if (!target) continue;
    targetNames.push(target.name);
    if (target.difficulty === "elite") hasElite = true;

    const chain = getFullProgressionChain(targetId);
    const targetIdx = chain.findIndex((e) => e.id === targetId);

    // Progressions BELOW target (doable exercises)
    const doable = chain.slice(Math.max(0, targetIdx - 4), targetIdx);
    if (doable.length === 0 && targetIdx > 0) doable.push(chain[targetIdx - 1]);
    if (targetIdx === 0) doable.push(chain[0]);

    doable.forEach((ex, i) => {
      if (usedIds.has(ex.id)) return;
      usedIds.add(ex.id);
      const isHighest = i === doable.length - 1;
      const nextInChain = chain[chain.indexOf(ex) + 1];
      const label = isHighest && nextInChain ? `⬆ Level up → ${nextInChain.name}` : `Step ${i + 1}`;
      primaryExercises.push({ ex: makeExercise(ex, isHighest ? 4 : 3, goal, label), isPrimary: true, category: ex.category });
    });

    // Add conditioning/prep exercises for this skill
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
        isPrimary: false, category: target.category,
      });
    });
  }

  // Supporting exercises pool (rotate different ones per day for variety)
  const allSupporters = exercises.filter(
    (e) => !usedIds.has(e.id) && (e.difficulty === "beginner" || e.difficulty === "intermediate") && e.category !== "skill"
  );
  const supportersByCat: Record<string, Exercise[]> = {};
  for (const ex of allSupporters) {
    if (!supportersByCat[ex.category]) supportersByCat[ex.category] = [];
    supportersByCat[ex.category].push(ex);
  }

  // Determine training days
  const numTargets = selectedSkillIds.length;
  // Goal-specific training day counts
  const baseDays = numTargets <= 1 ? 3 : numTargets <= 3 ? 4 : numTargets <= 5 ? 5 : 6;
  const trainingDays = Math.max(3, Math.min(6, baseDays + goalConfig[goal].extraDays));

  // Build each training day with DIFFERENT exercises and themes
  type Bucket = { exercises: WorkoutExercise[]; name: string; focus: string };
  const buckets: Bucket[] = [];

  for (let d = 0; d < trainingDays; d++) {
    const theme = dayThemes[d % dayThemes.length];
    const dayExercises: WorkoutExercise[] = [];

    // Core lifts: distribute primary exercises (rotate which ones appear)
    const primariesForDay = primaryExercises.filter((_, i) => i % trainingDays === d || primaryExercises.length <= trainingDays);
    primariesForDay.forEach((p) => dayExercises.push(p.ex));

    // If this day doesn't have enough primaries, add from conditioning
    if (dayExercises.length < 2 && conditioningExercises.length > 0) {
      const condForDay = conditioningExercises.filter((_, i) => i % trainingDays === d);
      condForDay.slice(0, 2).forEach((c) => dayExercises.push(c.ex));
    }

    // Add different supporting exercises each day (rotate through the pool)
    const cats = ["push", "pull", "core", "legs"];
    for (const cat of cats) {
      if (dayExercises.length >= 5) break;
      const pool = supportersByCat[cat] || [];
      if (pool.length > 0) {
        const pick = pool[d % pool.length];
        if (!usedIds.has(pick.id) || d > 0) { // Allow reuse across days but pick different ones
          const variant = pool[(d + 1) % pool.length] || pick;
          dayExercises.push(makeExercise(d % 2 === 0 ? pick : variant, 3, goal));
        }
      }
    }

    // Ensure minimum 3 exercises
    while (dayExercises.length < 3) {
      const filler = allSupporters.find((e) => !dayExercises.some((de) => de.exerciseId === e.id));
      if (!filler) break;
      dayExercises.push(makeExercise(filler, 3, goal));
    }

    buckets.push({ exercises: dayExercises, name: theme.name, focus: theme.focus });
  }

  // Build weekly schedule
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const slots = trainingDays === 3 ? [0, 2, 4] : trainingDays === 4 ? [0, 1, 3, 4] : trainingDays === 5 ? [0, 1, 2, 4, 5] : [0, 1, 2, 3, 4, 5];
  const days: DayWorkout[] = [];
  let bi = 0;
  for (let i = 0; i < 7; i++) {
    if (slots.includes(i) && bi < buckets.length) {
      days.push({
        day: dayNames[i], name: buckets[bi].name, isRest: false, focus: buckets[bi].focus,
        exercises: buckets[bi].exercises, warmUp: getWarmUp(buckets[bi].focus),
      });
      bi++;
    } else {
      days.push({
        day: dayNames[i], name: "Rest & Recovery", isRest: true, exercises: [],
        restDayActivities: getRestDayActivities(i),
      });
    }
  }

  const totalEx = buckets.reduce((s, b) => s + b.exercises.length, 0);
  const goalLabel = { muscle: "Build Muscle", skills: "Master Skills", "weight-loss": "Lose Weight", endurance: "Build Endurance", balanced: "Balanced Fitness" }[goal];

  return {
    id: `plan-${Date.now()}`,
    name: numTargets === 1 ? `${targetNames[0]} Program` : "Multi-Skill Program",
    description: `${goalLabel} plan targeting: ${targetNames.join(", ")}`,
    difficulty: hasElite ? "elite" : "advanced",
    goal: `${goalLabel}: ${targetNames.join(", ")}`,
    trainingGoal: goal, targetSkills: selectedSkillIds,
    days, estimatedWeeklyMinutes: totalEx * 5 + trainingDays * 10,
    createdAt: new Date().toISOString(),
  };
}

function generateYogaPlan(selectedPoseIds: string[], goal: TrainingGoal): WeeklyPlan {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const targetPoses = selectedPoseIds.map((id) => getYogaPoseById(id)).filter(Boolean);
  const poseNames = targetPoses.map((p) => p!.name);

  // Prep poses for warm-up
  const prepPoses = ["forward-fold", "cobra", "bridge", "butterfly", "childs"].filter((id) => !selectedPoseIds.includes(id));

  // Different yoga sessions for variety
  const sessionTypes = [
    { name: "Gentle Flow", focus: "Slow, hold-focused", holdMult: 1.0, extra: ["childs", "savasana"] },
    { name: "Dynamic Stretch", focus: "Movement between poses", holdMult: 0.7, extra: ["cobra", "savasana"] },
    { name: "Deep Hold", focus: "Longer holds for deep flexibility", holdMult: 1.5, extra: ["legs-up-wall", "savasana"] },
    { name: "Active Flexibility", focus: "Strength + stretch combo", holdMult: 0.8, extra: ["boat", "savasana"] },
    { name: "Restorative", focus: "Maximum relaxation", holdMult: 1.3, extra: ["happy-baby", "supine-twist", "savasana"] },
  ];

  const warmUp: WarmUp = { name: "Flexibility Warm-Up", duration: "5 min", exercises: ["Neck rolls × 10", "Shoulder rolls × 10", "Cat-cow × 8", "Hip circles × 10 each", "Deep breathing × 5"] };

  const days: DayWorkout[] = dayNames.map((day, i) => {
    if (i === 2 || i === 6) {
      return { day, name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) };
    }

    const session = sessionTypes[i % sessionTypes.length];
    // Rotate which prep poses are used each day
    const dayPrep = prepPoses.slice(i % prepPoses.length, (i % prepPoses.length) + 2);
    if (dayPrep.length < 2) dayPrep.push(...prepPoses.slice(0, 2 - dayPrep.length));

    const extra = session.extra.filter((id) => !selectedPoseIds.includes(id) && !dayPrep.includes(id));
    const allPoseIds = [...dayPrep, ...selectedPoseIds, ...extra];

    return {
      day, name: session.name, isRest: false, focus: session.focus,
      exercises: allPoseIds.map((id) => {
        const pose = getYogaPoseById(id);
        const baseHold = pose?.holdSeconds || 30;
        return { exerciseId: id, sets: 1, reps: null, holdSeconds: Math.round(baseHold * session.holdMult), restSeconds: 10 };
      }),
      warmUp,
    };
  });

  return {
    id: `yoga-${Date.now()}`, name: targetPoses.length === 1 ? `${poseNames[0]} Program` : "Flexibility Program",
    description: `Progressive flexibility plan targeting: ${poseNames.join(", ")}`,
    difficulty: targetPoses.some((p) => p!.difficulty === "elite") ? "elite" : targetPoses.some((p) => p!.difficulty === "advanced") ? "advanced" : "intermediate",
    goal: `Achieve: ${poseNames.join(", ")}`, trainingGoal: goal, targetSkills: selectedPoseIds,
    days, estimatedWeeklyMinutes: 80, createdAt: new Date().toISOString(),
  };
}