import { Exercise, WeeklyPlan, DayWorkout, WorkoutExercise } from "./types";
import { exercises, getExerciseById } from "@/data/exercises";

function getProgressionChain(exerciseId: string): Exercise[] {
  const chain: Exercise[] = [];
  let current = getExerciseById(exerciseId);
  if (!current) return chain;

  // Walk backward to find the easiest prerequisite
  const visited = new Set<string>();
  let root = current;
  while (root.progressionFrom && !visited.has(root.progressionFrom)) {
    visited.add(root.id);
    const prev = getExerciseById(root.progressionFrom);
    if (!prev) break;
    root = prev;
  }

  // Walk forward from root
  visited.clear();
  let node: Exercise | undefined = root;
  while (node && !visited.has(node.id)) {
    visited.add(node.id);
    chain.push(node);
    node = node.progressionTo ? getExerciseById(node.progressionTo) : undefined;
  }

  return chain;
}

function getPrerequisites(targetId: string): Exercise[] {
  const chain = getProgressionChain(targetId);
  const targetIdx = chain.findIndex((e) => e.id === targetId);
  if (targetIdx <= 0) return [];
  return chain.slice(Math.max(0, targetIdx - 2), targetIdx);
}

function getSupportingExercises(
  targetExercises: Exercise[],
  alreadyIncluded: Set<string>
): Exercise[] {
  const supporting: Exercise[] = [];
  const targetMuscles = new Set<string>();
  const targetCategories = new Set<string>();

  for (const ex of targetExercises) {
    ex.muscles.forEach((m) => targetMuscles.add(m));
    targetCategories.add(ex.category);
  }

  const needsPull = targetCategories.has("push") || targetCategories.has("skill");
  const needsPush = targetCategories.has("pull");
  const needsCore = true;
  const needsLegs = true;

  const candidates = exercises.filter(
    (e) =>
      !alreadyIncluded.has(e.id) &&
      (e.difficulty === "beginner" || e.difficulty === "intermediate")
  );

  if (needsPull) {
    const pull = candidates.find((e) => e.category === "pull");
    if (pull) supporting.push(pull);
  }
  if (needsPush) {
    const push = candidates.find(
      (e) => e.category === "push" && !alreadyIncluded.has(e.id) && !supporting.find((s) => s.id === e.id)
    );
    if (push) supporting.push(push);
  }
  if (needsCore) {
    const core = candidates.find(
      (e) => e.category === "core" && !supporting.find((s) => s.id === e.id)
    );
    if (core) supporting.push(core);
  }
  if (needsLegs) {
    const legs = candidates.find(
      (e) => e.category === "legs" && !supporting.find((s) => s.id === e.id)
    );
    if (legs) supporting.push(legs);
  }

  return supporting;
}

function makeWorkoutExercise(
  ex: Exercise,
  isTarget: boolean
): WorkoutExercise {
  if (ex.isHold) {
    const holdBase = ex.difficulty === "elite" ? 5 : ex.difficulty === "advanced" ? 10 : ex.difficulty === "intermediate" ? 15 : 30;
    return {
      exerciseId: ex.id,
      sets: isTarget ? 5 : 3,
      reps: null,
      holdSeconds: holdBase,
      restSeconds: isTarget ? 120 : 60,
    };
  }

  const repBase = ex.difficulty === "elite" ? 3 : ex.difficulty === "advanced" ? 5 : ex.difficulty === "intermediate" ? 8 : 12;
  return {
    exerciseId: ex.id,
    sets: isTarget ? 4 : 3,
    reps: repBase,
    holdSeconds: null,
    restSeconds: isTarget ? 120 : 60,
  };
}

export function generateWeeklyPlan(selectedSkillIds: string[]): WeeklyPlan {
  const targetExercises: Exercise[] = [];
  const allExerciseIds = new Set<string>();
  const prerequisiteExercises: Exercise[] = [];

  for (const skillId of selectedSkillIds) {
    const ex = getExerciseById(skillId);
    if (ex) {
      targetExercises.push(ex);
      allExerciseIds.add(ex.id);
    }
  }

  for (const target of targetExercises) {
    const prereqs = getPrerequisites(target.id);
    for (const p of prereqs) {
      if (!allExerciseIds.has(p.id)) {
        prerequisiteExercises.push(p);
        allExerciseIds.add(p.id);
      }
    }
  }

  const supporting = getSupportingExercises(
    [...targetExercises, ...prerequisiteExercises],
    allExerciseIds
  );
  for (const s of supporting) {
    allExerciseIds.add(s.id);
  }

  const skillWork = targetExercises.map((ex) => makeWorkoutExercise(ex, true));
  const prereqWork = prerequisiteExercises.map((ex) => makeWorkoutExercise(ex, false));
  const supportWork = supporting.map((ex) => makeWorkoutExercise(ex, false));

  const allWork = [...skillWork, ...prereqWork, ...supportWork];

  const numTargets = selectedSkillIds.length;
  let trainingDays: number;
  if (numTargets <= 1) trainingDays = 3;
  else if (numTargets <= 3) trainingDays = 4;
  else if (numTargets <= 5) trainingDays = 5;
  else trainingDays = 6;

  const dayBuckets: { exercises: WorkoutExercise[]; name: string; focus: string }[] = [];

  if (trainingDays <= 3) {
    dayBuckets.push({ exercises: [], name: "Skill Focus", focus: "Primary skill work" });
    dayBuckets.push({ exercises: [], name: "Strength", focus: "Supporting strength" });
    dayBuckets.push({ exercises: [], name: "Skill + Conditioning", focus: "Skill practice + conditioning" });
  } else if (trainingDays <= 4) {
    dayBuckets.push({ exercises: [], name: "Skill Day A", focus: "Primary skill work" });
    dayBuckets.push({ exercises: [], name: "Push & Press", focus: "Pushing strength" });
    dayBuckets.push({ exercises: [], name: "Skill Day B", focus: "Skill volume" });
    dayBuckets.push({ exercises: [], name: "Pull & Core", focus: "Pulling + core strength" });
  } else if (trainingDays <= 5) {
    dayBuckets.push({ exercises: [], name: "Skill Day A", focus: "Primary skill work" });
    dayBuckets.push({ exercises: [], name: "Push Strength", focus: "Pushing strength" });
    dayBuckets.push({ exercises: [], name: "Pull Strength", focus: "Pulling strength" });
    dayBuckets.push({ exercises: [], name: "Skill Day B", focus: "Skill volume" });
    dayBuckets.push({ exercises: [], name: "Legs & Core", focus: "Lower body + core" });
  } else {
    dayBuckets.push({ exercises: [], name: "Skill Day A", focus: "Primary skill work" });
    dayBuckets.push({ exercises: [], name: "Push Strength", focus: "Pushing strength" });
    dayBuckets.push({ exercises: [], name: "Pull Strength", focus: "Pulling strength" });
    dayBuckets.push({ exercises: [], name: "Skill Day B", focus: "Skill volume" });
    dayBuckets.push({ exercises: [], name: "Legs & Core", focus: "Lower body + core" });
    dayBuckets.push({ exercises: [], name: "Skill Day C", focus: "Skill endurance" });
  }

  // Distribute skill work across skill days
  const skillDayIndices = dayBuckets
    .map((d, i) => (d.name.includes("Skill") ? i : -1))
    .filter((i) => i >= 0);
  const otherDayIndices = dayBuckets
    .map((d, i) => (!d.name.includes("Skill") ? i : -1))
    .filter((i) => i >= 0);

  skillWork.forEach((ex, i) => {
    const dayIdx = skillDayIndices[i % skillDayIndices.length];
    dayBuckets[dayIdx].exercises.push(ex);
  });

  prereqWork.forEach((ex, i) => {
    const dayIdx = skillDayIndices[(i + 1) % skillDayIndices.length];
    dayBuckets[dayIdx].exercises.push(ex);
  });

  supportWork.forEach((ex, i) => {
    const dayIdx = otherDayIndices.length > 0
      ? otherDayIndices[i % otherDayIndices.length]
      : i % dayBuckets.length;
    dayBuckets[dayIdx].exercises.push(ex);
  });

  // Ensure every training day has at least 3 exercises
  for (const bucket of dayBuckets) {
    if (bucket.exercises.length < 3) {
      const fillers = exercises
        .filter(
          (e) =>
            !allExerciseIds.has(e.id) &&
            (e.difficulty === "beginner" || e.difficulty === "intermediate") &&
            e.category !== "full-body"
        )
        .slice(0, 3 - bucket.exercises.length);
      for (const f of fillers) {
        bucket.exercises.push(makeWorkoutExercise(f, false));
        allExerciseIds.add(f.id);
      }
    }
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const days: DayWorkout[] = [];
  let bucketIdx = 0;

  // Spread training days with rest between
  const trainingSlots: number[] = [];
  if (trainingDays === 3) trainingSlots.push(0, 2, 4);
  else if (trainingDays === 4) trainingSlots.push(0, 1, 3, 4);
  else if (trainingDays === 5) trainingSlots.push(0, 1, 2, 4, 5);
  else trainingSlots.push(0, 1, 2, 3, 4, 5);

  for (let i = 0; i < 7; i++) {
    if (trainingSlots.includes(i) && bucketIdx < dayBuckets.length) {
      const bucket = dayBuckets[bucketIdx];
      days.push({
        day: dayNames[i],
        name: bucket.name,
        isRest: false,
        focus: bucket.focus,
        exercises: bucket.exercises,
      });
      bucketIdx++;
    } else {
      days.push({
        day: dayNames[i],
        name: "Rest & Recovery",
        isRest: true,
        exercises: [],
      });
    }
  }

  const totalExercises = dayBuckets.reduce((s, b) => s + b.exercises.length, 0);
  const estimatedMinutes = totalExercises * 5 + trainingDays * 10;

  const skillNames = targetExercises.map((e) => e.name).join(", ");

  return {
    id: `custom-${Date.now()}`,
    name: `${numTargets === 1 ? targetExercises[0].name : "Multi-Skill"} Program`,
    description: `Custom weekly plan targeting: ${skillNames}`,
    difficulty: targetExercises.some((e) => e.difficulty === "elite")
      ? "elite"
      : targetExercises.some((e) => e.difficulty === "advanced")
      ? "advanced"
      : "intermediate",
    goal: `Master ${skillNames}`,
    days,
    estimatedWeeklyMinutes: estimatedMinutes,
  };
}
