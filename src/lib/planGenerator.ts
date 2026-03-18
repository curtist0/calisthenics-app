import { Exercise, WeeklyPlan, DayWorkout, WorkoutExercise, TrainingGoal, WarmUp, RestDayActivity } from "./types";
import { exercises, getExerciseById } from "@/data/exercises";

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

function makeExercise(ex: Exercise, baseSets: number, isTarget: boolean, goal: TrainingGoal, level?: string): WorkoutExercise {
  const m = goalMultipliers[goal];
  const sets = Math.max(2, Math.round(baseSets * m.sets));
  if (ex.isHold) {
    const hold = ex.difficulty === "elite" ? 5 : ex.difficulty === "advanced" ? 10 : ex.difficulty === "intermediate" ? 15 : 30;
    return { exerciseId: ex.id, sets, reps: null, holdSeconds: Math.round(hold * m.reps), restSeconds: Math.round(90 * m.rest), progressionLevel: level };
  }
  const reps = ex.difficulty === "elite" ? 3 : ex.difficulty === "advanced" ? 5 : ex.difficulty === "intermediate" ? 8 : 12;
  return { exerciseId: ex.id, sets, reps: Math.max(1, Math.round(reps * m.reps)), holdSeconds: null, restSeconds: Math.round(90 * m.rest), progressionLevel: level };
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
  { name: "Full Body Restore", description: "Head-to-toe relaxation sequence", duration: "18 min", type: "yoga", yogaPoseIds: ["childs", "cobra", "pigeon", "forward-fold", "bridge", "legs-up-wall", "savasana"] },
  { name: "Balance & Focus", description: "Build stability and mindfulness", duration: "15 min", type: "yoga", yogaPoseIds: ["tree", "warrior3", "chair", "forward-fold", "savasana"] },
  { name: "Splits Prep Flow", description: "Progressive stretching toward splits", duration: "20 min", type: "yoga", yogaPoseIds: ["forward-fold", "half-splits", "pigeon", "seated-straddle", "full-splits", "savasana"] },
];

function getRestDayActivities(dayIndex: number): RestDayActivity[] {
  const flow = yogaFlows[dayIndex % yogaFlows.length];
  return [
    flow,
    { name: "Light Walk", description: "20–30 minute easy walk outdoors", duration: "20-30 min", type: "light-cardio" },
    { name: "Mobility Work", description: "Joint circles, wrist stretches, and foam rolling", duration: "10 min", type: "mobility" },
  ];
}

export function generateWeeklyPlan(selectedSkillIds: string[], goal: TrainingGoal): WeeklyPlan {
  const allExIds = new Set<string>();
  const skillChains: { target: Exercise; chain: Exercise[] }[] = [];

  for (const id of selectedSkillIds) {
    const target = getExerciseById(id);
    if (!target) continue;
    skillChains.push({ target, chain: getFullProgressionChain(id) });
    getFullProgressionChain(id).forEach((e) => allExIds.add(e.id));
  }

  const numTargets = selectedSkillIds.length;
  const trainingDays = goal === "weight-loss" || goal === "endurance"
    ? Math.min(numTargets <= 2 ? 4 : 5, 6)
    : numTargets <= 1 ? 3 : numTargets <= 3 ? 4 : numTargets <= 5 ? 5 : 6;

  type Bucket = { exercises: WorkoutExercise[]; name: string; focus: string };
  const buckets: Bucket[] = [];
  const names3 = ["Progression Day", "Strength Day", "Volume Day"];
  const names4 = ["Progression A", "Strength", "Progression B", "Accessory"];
  const names6 = ["Progression A", "Push Strength", "Pull Strength", "Progression B", "Accessory", "Volume"];
  const nameList = trainingDays <= 3 ? names3 : trainingDays <= 4 ? names4 : names6;
  for (let i = 0; i < trainingDays; i++) {
    buckets.push({ exercises: [], name: nameList[i] || `Day ${i + 1}`, focus: "" });
  }

  const progBuckets = buckets.filter((b) => b.name.includes("Progression") || b.name.includes("Volume"));
  const strBuckets = buckets.filter((b) => !progBuckets.includes(b));

  skillChains.forEach(({ target, chain }, si) => {
    const targetIdx = chain.findIndex((e) => e.id === target.id);
    const relevant = chain.slice(Math.max(0, targetIdx - 3), targetIdx + 1);
    relevant.forEach((ex, i) => {
      const isTarget = ex.id === target.id;
      const level = isTarget ? "Target" : `Level ${i + 1}`;
      const bucket = progBuckets[(si + i) % progBuckets.length];
      if (bucket) bucket.exercises.push(makeExercise(ex, isTarget ? 5 : 3, isTarget, goal, level));
    });
  });

  const usedIds = new Set(buckets.flatMap((b) => b.exercises.map((e) => e.exerciseId)));
  const supporters = exercises.filter((e) => !usedIds.has(e.id) && (e.difficulty === "beginner" || e.difficulty === "intermediate"));
  ["pull", "push", "core", "legs"].forEach((cat, ci) => {
    const ex = supporters.find((e) => e.category === cat);
    if (ex && strBuckets.length > 0) {
      strBuckets[ci % strBuckets.length].exercises.push(makeExercise(ex, 3, false, goal));
      usedIds.add(ex.id);
    }
  });

  if (goal === "weight-loss" || goal === "endurance") {
    const cardio = exercises.find((e) => e.id === "burpee");
    if (cardio && !usedIds.has(cardio.id)) {
      const lastBucket = strBuckets[strBuckets.length - 1] || buckets[buckets.length - 1];
      lastBucket.exercises.push(makeExercise(cardio, 4, false, goal));
    }
  }

  for (const b of buckets) {
    while (b.exercises.length < 3) {
      const filler = supporters.find((e) => !usedIds.has(e.id));
      if (!filler) break;
      b.exercises.push(makeExercise(filler, 3, false, goal));
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
      days.push({
        day: dayNames[i], name: "Rest & Recovery", isRest: true, exercises: [],
        restDayActivities: getRestDayActivities(i),
      });
    }
  }

  const totalEx = buckets.reduce((s, b) => s + b.exercises.length, 0);
  const skillNames = skillChains.map((s) => s.target.name);
  const goalLabel = { muscle: "Build Muscle", skills: "Master Skills", "weight-loss": "Lose Weight", endurance: "Build Endurance", balanced: "Balanced Fitness" }[goal];

  return {
    id: `plan-${Date.now()}`,
    name: numTargets === 1 ? `${skillNames[0]} Program` : "Multi-Skill Program",
    description: `${goalLabel} plan targeting: ${skillNames.join(", ")}`,
    difficulty: skillChains.some((s) => s.target.difficulty === "elite") ? "elite" : "advanced",
    goal: `${goalLabel}: ${skillNames.join(", ")}`, trainingGoal: goal, targetSkills: selectedSkillIds,
    days, estimatedWeeklyMinutes: totalEx * 5 + trainingDays * 10, createdAt: new Date().toISOString(),
  };
}

export function generateFlexibilityPlan(): WeeklyPlan {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const flows = yogaFlows;
  const days: DayWorkout[] = dayNames.map((day, i) => {
    if (i === 2 || i === 5) {
      return { day, name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: [
        { name: "Light Walk", description: "Easy walk for active recovery", duration: "20 min", type: "light-cardio" as const },
      ] };
    }
    const flow = flows[i % flows.length];
    return {
      day, name: flow.name, isRest: false, focus: flow.description,
      exercises: (flow.yogaPoseIds || []).map((id) => ({
        exerciseId: id, sets: 1, reps: null, holdSeconds: 45, restSeconds: 10,
      })),
      warmUp: { name: "Gentle Warm-Up", duration: "3 min", exercises: ["Neck rolls × 10", "Shoulder rolls × 10", "Cat-cow × 8", "Deep breathing × 5"] },
    };
  });

  return {
    id: `flex-${Date.now()}`, name: "Flexibility & Yoga Program",
    description: "5-day yoga & flexibility program working toward full splits",
    difficulty: "beginner", goal: "Improve flexibility and achieve splits",
    trainingGoal: "balanced", targetSkills: [],
    days, estimatedWeeklyMinutes: 100, createdAt: new Date().toISOString(),
  };
}
