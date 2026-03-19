import { Exercise, WeeklyPlan, DayWorkout, WorkoutExercise, TrainingGoal, WarmUp, RestDayActivity } from "./types";
import { exercises, getExerciseById } from "@/data/exercises";
import { getYogaPoseById } from "@/data/yoga";
import { getUserProfile } from "./storage";

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

const goalMultipliers: Record<TrainingGoal, { sets: number; reps: number; rest: number }> = {
  muscle:      { sets: 1.3, reps: 0.8, rest: 1.3 },
  skills:      { sets: 1.2, reps: 0.7, rest: 1.5 },
  "weight-loss": { sets: 0.8, reps: 1.4, rest: 0.5 },
  endurance:   { sets: 0.9, reps: 1.5, rest: 0.4 },
  balanced:    { sets: 1.0, reps: 1.0, rest: 1.0 },
};

function makeExercise(ex: Exercise, baseSets: number, goal: TrainingGoal, label?: string): WorkoutExercise {
  const m = goalMultipliers[goal];
  const sets = Math.max(2, Math.round(baseSets * m.sets));
  if (ex.isHold) {
    const hold = ex.difficulty === "elite" ? 5 : ex.difficulty === "advanced" ? 10 : ex.difficulty === "intermediate" ? 15 : 30;
    return { exerciseId: ex.id, sets, reps: null, holdSeconds: Math.round(hold * m.reps), restSeconds: Math.round(90 * m.rest), progressionLevel: label };
  }
  const reps = ex.difficulty === "elite" ? 3 : ex.difficulty === "advanced" ? 5 : ex.difficulty === "intermediate" ? 8 : 12;
  return { exerciseId: ex.id, sets, reps: Math.max(1, Math.round(reps * m.reps)), holdSeconds: null, restSeconds: Math.round(90 * m.rest), progressionLevel: label };
}

function getWarmUp(focus: string): WarmUp {
  const warmUps: Record<string, WarmUp> = {
    push: { name: "Upper Body Warm-Up", duration: "5 min", exercises: ["Arm circles (30s each direction)", "Band pull-aparts × 15", "Push-up walkouts × 5", "Wrist circles (30s)"] },
    pull: { name: "Pull Warm-Up", duration: "5 min", exercises: ["Dead hangs 30s", "Scapular pulls × 10", "Band pull-aparts × 15", "Cat-cow stretches × 8"] },
    legs: { name: "Lower Body Warm-Up", duration: "5 min", exercises: ["Leg swings × 10 each", "Bodyweight squats × 10", "Hip circles × 10 each", "Ankle rotations × 10 each"] },
    skill: { name: "Skill Warm-Up", duration: "7 min", exercises: ["Wrist warm-up circles × 20", "Plank hold 30s", "Scapular push-ups × 10", "Hollow body hold 20s", "Dead hang 30s"] },
    general: { name: "General Warm-Up", duration: "5 min", exercises: ["Jumping jacks × 20", "Arm circles × 10 each", "Leg swings × 10 each", "Bodyweight squats × 10"] },
  };
  if (focus.toLowerCase().includes("push") || focus.toLowerCase().includes("press")) return warmUps.push;
  if (focus.toLowerCase().includes("pull")) return warmUps.pull;
  if (focus.toLowerCase().includes("leg")) return warmUps.legs;
  if (focus.toLowerCase().includes("skill") || focus.toLowerCase().includes("progression")) return warmUps.skill;
  return warmUps.general;
}

const yogaFlows: RestDayActivity[] = [
  { name: "Hip Opening Flow", description: "Deep hip stretches for recovery", duration: "15 min", type: "yoga", yogaPoseIds: ["pigeon", "seated-straddle", "half-splits", "childs", "savasana"] },
  { name: "Spine & Back Flow", description: "Gentle backbends and twists", duration: "12 min", type: "yoga", yogaPoseIds: ["cobra", "bridge", "forward-fold", "childs", "legs-up-wall"] },
  { name: "Full Body Restore", description: "Head-to-toe relaxation", duration: "18 min", type: "yoga", yogaPoseIds: ["childs", "cobra", "pigeon", "forward-fold", "bridge", "legs-up-wall", "savasana"] },
  { name: "Balance & Focus", description: "Build stability and mindfulness", duration: "15 min", type: "yoga", yogaPoseIds: ["tree", "warrior3", "chair", "forward-fold", "savasana"] },
  { name: "Splits Prep Flow", description: "Progressive stretching toward splits", duration: "20 min", type: "yoga", yogaPoseIds: ["forward-fold", "half-splits", "pigeon", "seated-straddle", "full-splits", "savasana"] },
];

function getRestDayActivities(dayIndex: number): RestDayActivity[] {
  const profile = getUserProfile();
  const yogaEnabled = profile?.yogaSetUp ?? false;
  const activities: RestDayActivity[] = [];
  if (yogaEnabled) activities.push(yogaFlows[dayIndex % yogaFlows.length]);
  activities.push({ name: "Light Walk", description: "20–30 minute easy walk outdoors", duration: "20-30 min", type: "light-cardio" });
  activities.push({ name: "Mobility Work", description: "Joint circles, wrist stretches, and foam rolling", duration: "10 min", type: "mobility" });
  return activities;
}

export function generateWeeklyPlan(selectedSkillIds: string[], goal: TrainingGoal): WeeklyPlan {
  const isYogaPlan = selectedSkillIds.some((id) => getYogaPoseById(id) !== undefined);
  if (isYogaPlan) return generateYogaPlan(selectedSkillIds, goal);

  const allWorkExercises: { ex: WorkoutExercise; category: string }[] = [];
  const usedIds = new Set<string>();
  const targetNames: string[] = [];

  // For each target skill, include ONLY the progressions the user can actually do
  // EXCLUDE the target itself (they can't do it yet)
  for (const targetId of selectedSkillIds) {
    const target = getExerciseById(targetId);
    if (!target) continue;
    targetNames.push(target.name);

    const chain = getFullProgressionChain(targetId);
    const targetIdx = chain.findIndex((e) => e.id === targetId);

    // Get progressions BELOW the target (exercises they CAN do)
    const doable = chain.slice(Math.max(0, targetIdx - 4), targetIdx);
    if (doable.length === 0 && targetIdx > 0) {
      doable.push(chain[targetIdx - 1]);
    }
    // If target is the very first in chain (beginner skill), include it
    if (targetIdx === 0) {
      doable.push(chain[0]);
    }

    doable.forEach((ex, i) => {
      if (usedIds.has(ex.id)) return;
      usedIds.add(ex.id);
      const isHighest = i === doable.length - 1;
      const nextInChain = chain[chain.indexOf(ex) + 1];
      const label = isHighest && nextInChain
        ? `⬆ Level up → ${nextInChain.name}`
        : `Step ${i + 1}`;
      allWorkExercises.push({
        ex: makeExercise(ex, isHighest ? 4 : 3, goal, label),
        category: ex.category,
      });
    });
  }

  // Add supporting exercises (ones the user can actually do — beginner/intermediate only)
  const supporters = exercises.filter(
    (e) => !usedIds.has(e.id) && (e.difficulty === "beginner" || e.difficulty === "intermediate") && e.category !== "skill"
  );
  const supportCats = ["pull", "push", "core", "legs"];
  for (const cat of supportCats) {
    const ex = supporters.find((e) => e.category === cat);
    if (ex) {
      usedIds.add(ex.id);
      allWorkExercises.push({ ex: makeExercise(ex, 3, goal), category: cat });
    }
  }

  // Distribute into training days
  const numTargets = selectedSkillIds.length;
  const baseDays = numTargets <= 1 ? 3 : numTargets <= 3 ? 4 : numTargets <= 5 ? 5 : 6;
  let trainingDays: number;
  if (goal === "weight-loss") trainingDays = Math.min(baseDays + 1, 6);
  else if (goal === "endurance") trainingDays = Math.min(baseDays + 1, 6);
  else if (goal === "skills") trainingDays = Math.max(baseDays - 1, 3);
  else trainingDays = baseDays;

  type Bucket = { exercises: WorkoutExercise[]; name: string; focus: string };
  const buckets: Bucket[] = [];
  const names = ["Progression A", "Strength", "Progression B", "Accessory", "Volume", "Conditioning"];
  for (let i = 0; i < trainingDays; i++) {
    buckets.push({ exercises: [], name: names[i] || `Day ${i + 1}`, focus: "" });
  }

  // Distribute exercises round-robin
  allWorkExercises.forEach((item, i) => {
    buckets[i % buckets.length].exercises.push(item.ex);
  });

  // Ensure each day has at least 3 exercises
  for (const b of buckets) {
    while (b.exercises.length < 3) {
      const filler = supporters.find((e) => !usedIds.has(e.id));
      if (!filler) break;
      b.exercises.push(makeExercise(filler, 3, goal));
      usedIds.add(filler.id);
    }
    b.focus = b.exercises.map((e) => getExerciseById(e.exerciseId)?.category).filter(Boolean).join(", ");
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const slots = trainingDays === 3 ? [0, 2, 4] : trainingDays === 4 ? [0, 1, 3, 4] : trainingDays === 5 ? [0, 1, 2, 4, 5] : [0, 1, 2, 3, 4, 5];
  const days: DayWorkout[] = [];
  let bi = 0;
  for (let i = 0; i < 7; i++) {
    if (slots.includes(i) && bi < buckets.length) {
      days.push({
        day: dayNames[i], name: buckets[bi].name, isRest: false, focus: buckets[bi].focus,
        exercises: buckets[bi].exercises, warmUp: getWarmUp(buckets[bi].name),
      });
      bi++;
    } else {
      days.push({ day: dayNames[i], name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) });
    }
  }

  const totalEx = buckets.reduce((s, b) => s + b.exercises.length, 0);
  const goalLabel = { muscle: "Build Muscle", skills: "Master Skills", "weight-loss": "Lose Weight", endurance: "Build Endurance", balanced: "Balanced" }[goal];

  return {
    id: `plan-${Date.now()}`,
    name: numTargets === 1 ? `${targetNames[0]} Program` : "Multi-Skill Program",
    description: `${goalLabel} — progressions toward: ${targetNames.join(", ")}`,
    difficulty: "intermediate",
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
  const prepPoses = ["forward-fold", "cobra", "bridge", "childs"].filter((id) => !selectedPoseIds.includes(id));
  const warmUp: WarmUp = { name: "Flexibility Warm-Up", duration: "5 min", exercises: ["Neck rolls × 10", "Shoulder rolls × 10", "Cat-cow × 8", "Hip circles × 10 each", "Deep breathing × 5"] };

  const days: DayWorkout[] = dayNames.map((day, i) => {
    if (i === 2 || i === 6) {
      return { day, name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) };
    }
    const allPoseIds = [...prepPoses.slice(0, 2), ...selectedPoseIds, "savasana"];
    return {
      day, name: i % 2 === 0 ? "Flexibility Focus" : "Deep Stretch",
      isRest: false, focus: `Working toward: ${poseNames.join(", ")}`,
      exercises: allPoseIds.map((id) => {
        const pose = getYogaPoseById(id);
        return { exerciseId: id, sets: 1, reps: null, holdSeconds: pose?.holdSeconds || 30, restSeconds: 10 };
      }),
      warmUp,
    };
  });

  return {
    id: `yoga-${Date.now()}`, name: targetPoses.length === 1 ? `${poseNames[0]} Program` : "Flexibility Program",
    description: `Progressive flexibility plan toward: ${poseNames.join(", ")}`,
    difficulty: targetPoses.some((p) => p!.difficulty === "elite") ? "elite" : targetPoses.some((p) => p!.difficulty === "advanced") ? "advanced" : "intermediate",
    goal: `Achieve: ${poseNames.join(", ")}`, trainingGoal: goal, targetSkills: selectedPoseIds,
    days, estimatedWeeklyMinutes: 80, createdAt: new Date().toISOString(),
  };
}
