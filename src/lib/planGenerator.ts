import { Exercise, WeeklyPlan, DayWorkout, WorkoutExercise } from "./types";
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

function makeExercise(ex: Exercise, sets: number, isTarget: boolean, level?: string): WorkoutExercise {
  if (ex.isHold) {
    const hold = ex.difficulty === "elite" ? 5 : ex.difficulty === "advanced" ? 10 : ex.difficulty === "intermediate" ? 15 : 30;
    return { exerciseId: ex.id, sets, reps: null, holdSeconds: hold, restSeconds: isTarget ? 120 : 60, progressionLevel: level };
  }
  const reps = ex.difficulty === "elite" ? 3 : ex.difficulty === "advanced" ? 5 : ex.difficulty === "intermediate" ? 8 : 12;
  return { exerciseId: ex.id, sets, reps, holdSeconds: null, restSeconds: isTarget ? 120 : 60, progressionLevel: level };
}

export function generateWeeklyPlan(selectedSkillIds: string[]): WeeklyPlan {
  const allExIds = new Set<string>();
  const skillChains: { target: Exercise; chain: Exercise[] }[] = [];

  for (const id of selectedSkillIds) {
    const target = getExerciseById(id);
    if (!target) continue;
    const chain = getFullProgressionChain(id);
    skillChains.push({ target, chain });
    chain.forEach((e) => allExIds.add(e.id));
  }

  const numTargets = selectedSkillIds.length;
  const trainingDays = numTargets <= 1 ? 3 : numTargets <= 3 ? 4 : numTargets <= 5 ? 5 : 6;

  type Bucket = { exercises: WorkoutExercise[]; name: string; focus: string };
  const buckets: Bucket[] = [];

  // Build progression-focused training days
  if (trainingDays <= 3) {
    buckets.push({ exercises: [], name: "Progression Day", focus: "Work through skill progressions" });
    buckets.push({ exercises: [], name: "Strength Day", focus: "Build supporting strength" });
    buckets.push({ exercises: [], name: "Volume Day", focus: "Higher volume skill work" });
  } else if (trainingDays <= 4) {
    buckets.push({ exercises: [], name: "Progression A", focus: "Skill progressions (heavy)" });
    buckets.push({ exercises: [], name: "Strength", focus: "Supporting strength" });
    buckets.push({ exercises: [], name: "Progression B", focus: "Skill progressions (volume)" });
    buckets.push({ exercises: [], name: "Accessory", focus: "Accessory + balance work" });
  } else {
    for (let i = 0; i < trainingDays; i++) {
      const names = ["Progression A", "Push Strength", "Pull Strength", "Progression B", "Accessory", "Volume"];
      const focuses = ["Heavy skill progressions", "Pushing strength", "Pulling strength", "Skill volume work", "Accessory + core", "Endurance"];
      buckets.push({ exercises: [], name: names[i] || `Day ${i + 1}`, focus: focuses[i] || "" });
    }
  }

  const progBuckets = buckets.filter((b) => b.name.includes("Progression") || b.name.includes("Volume"));
  const strBuckets = buckets.filter((b) => !b.name.includes("Progression") && !b.name.includes("Volume"));

  // For each target skill, add the full progression chain spread across progression days
  skillChains.forEach(({ target, chain }, si) => {
    const targetIdx = chain.findIndex((e) => e.id === target.id);
    const relevantChain = chain.slice(Math.max(0, targetIdx - 3), targetIdx + 1);

    relevantChain.forEach((ex, i) => {
      const isTarget = ex.id === target.id;
      const level = i === relevantChain.length - 1 ? "Target" :
        i === relevantChain.length - 2 ? "Level " + (relevantChain.length - 1) :
        "Level " + (i + 1);
      const sets = isTarget ? 5 : 3;
      const bucket = progBuckets[(si + i) % progBuckets.length];
      if (bucket) bucket.exercises.push(makeExercise(ex, sets, isTarget, level));
    });
  });

  // Add supporting exercises to strength/accessory days
  const usedIds = new Set(buckets.flatMap((b) => b.exercises.map((e) => e.exerciseId)));
  const supporters = exercises.filter(
    (e) => !usedIds.has(e.id) && (e.difficulty === "beginner" || e.difficulty === "intermediate")
  );

  const cats = ["pull", "push", "core", "legs"];
  cats.forEach((cat, ci) => {
    const ex = supporters.find((e) => e.category === cat);
    if (ex && strBuckets.length > 0) {
      const bucket = strBuckets[ci % strBuckets.length];
      bucket.exercises.push(makeExercise(ex, 3, false));
      usedIds.add(ex.id);
    }
  });

  // Fill short days
  for (const b of buckets) {
    while (b.exercises.length < 3) {
      const filler = supporters.find((e) => !usedIds.has(e.id));
      if (!filler) break;
      b.exercises.push(makeExercise(filler, 3, false));
      usedIds.add(filler.id);
    }
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const slots = trainingDays === 3 ? [0, 2, 4] : trainingDays === 4 ? [0, 1, 3, 4] : trainingDays === 5 ? [0, 1, 2, 4, 5] : [0, 1, 2, 3, 4, 5];
  const days: DayWorkout[] = [];
  let bi = 0;
  for (let i = 0; i < 7; i++) {
    if (slots.includes(i) && bi < buckets.length) {
      days.push({ day: dayNames[i], name: buckets[bi].name, isRest: false, focus: buckets[bi].focus, exercises: buckets[bi].exercises });
      bi++;
    } else {
      days.push({ day: dayNames[i], name: "Rest & Recovery", isRest: true, exercises: [] });
    }
  }

  const totalEx = buckets.reduce((s, b) => s + b.exercises.length, 0);
  const skillNames = skillChains.map((s) => s.target.name);

  return {
    id: `plan-${Date.now()}`,
    name: numTargets === 1 ? `${skillNames[0]} Program` : "Multi-Skill Program",
    description: `Progression-based plan targeting: ${skillNames.join(", ")}`,
    difficulty: skillChains.some((s) => s.target.difficulty === "elite") ? "elite" : "advanced",
    goal: `Master ${skillNames.join(", ")}`,
    targetSkills: selectedSkillIds,
    days,
    estimatedWeeklyMinutes: totalEx * 5 + trainingDays * 10,
    createdAt: new Date().toISOString(),
  };
}
