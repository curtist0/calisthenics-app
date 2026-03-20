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

function getWarmUp(type: string): WarmUp {
  if (type === "yoga") return { name: "Yoga Warm-Up", duration: "5 min", exercises: ["Neck rolls × 10 each", "Shoulder rolls × 10 each", "Cat-cow × 10", "Hip circles × 10 each", "Sun salutation × 3"] };
  return { name: "Full Body Warm-Up", duration: "5 min", exercises: ["Jumping jacks × 20", "Arm circles × 10 each", "Leg swings × 10 each", "Wrist circles × 20", "Air squats × 10"] };
}

const yogaFlows: RestDayActivity[] = [
  { name: "Hip Opening Flow", description: "Deep hip stretches", duration: "15 min", type: "yoga", yogaPoseIds: ["pigeon", "seated-straddle", "half-splits", "childs", "savasana"] },
  { name: "Spine & Back Flow", description: "Backbends and twists", duration: "12 min", type: "yoga", yogaPoseIds: ["cobra", "bridge", "forward-fold", "childs", "legs-up-wall"] },
  { name: "Full Body Restore", description: "Relaxation", duration: "18 min", type: "yoga", yogaPoseIds: ["childs", "cobra", "pigeon", "forward-fold", "bridge", "savasana"] },
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
  if (selectedSkillIds.some((id) => getYogaPoseById(id) !== undefined)) {
    return generateYogaPlan(selectedSkillIds);
  }

  const targetNames: string[] = [];
  const workoutExercises: WorkoutExercise[] = [];
  const usedIds = new Set<string>();
  let exerciseNum = 0;

  for (const targetId of selectedSkillIds) {
    const target = getExerciseById(targetId);
    if (!target) continue;
    targetNames.push(target.name);

    const chain = getFullProgressionChain(targetId);
    const targetIdx = chain.findIndex((e) => e.id === targetId);

    // Get all progressions from EASIEST up to (but NOT including) the target
    const progressions = targetIdx > 0 ? chain.slice(0, targetIdx) : [];

    if (progressions.length > 0) {
      // Add each progression step numbered sequentially
      const total = progressions.length;
      progressions.forEach((ex, i) => {
        if (usedIds.has(ex.id)) return;
        usedIds.add(ex.id);
        exerciseNum++;
        const isLast = i === total - 1;
        const label = isLast
          ? `#${exerciseNum} — ⬆ Level up → ${target.name}`
          : `#${exerciseNum} — Step ${i + 1} of ${total}`;
        workoutExercises.push(makeEx(ex, isLast ? 4 : 3, goal, label));
      });
    }

    // Add conditioning exercises if available
    const cond = getConditioningForSkill(targetId);
    if (cond.length > 0) {
      const top = cond[0];
      exerciseNum++;
      const isHold = top.reps.includes("s");
      workoutExercises.push({
        exerciseId: `cond-${targetId}-0`, sets: top.sets,
        reps: isHold ? null : parseInt(top.reps) || 8,
        holdSeconds: isHold ? parseInt(top.reps) || 15 : null,
        restSeconds: 60, progressionLevel: `#${exerciseNum} — 🔧 ${top.name}`,
      });
    }
  }

  // Add supporting exercises for a complete workout
  const supporters = exercises.filter(
    (e) => !usedIds.has(e.id) && (e.difficulty === "beginner" || e.difficulty === "intermediate") && e.category !== "skill"
  );
  for (const cat of ["push", "pull", "core", "legs"]) {
    if (workoutExercises.length >= 8) break;
    const ex = supporters.find((e) => e.category === cat && !usedIds.has(e.id));
    if (ex) {
      usedIds.add(ex.id);
      exerciseNum++;
      workoutExercises.push(makeEx(ex, 3, goal, `#${exerciseNum}`));
    }
  }

  // Ensure at least 5 exercises
  while (workoutExercises.length < 5) {
    const filler = supporters.find((e) => !usedIds.has(e.id));
    if (!filler) break;
    usedIds.add(filler.id);
    exerciseNum++;
    workoutExercises.push(makeEx(filler, 3, goal, `#${exerciseNum}`));
  }

  // Build days — same exercises each training day (user progresses by increasing reps/hold)
  const numTargets = selectedSkillIds.length;
  const baseDays = numTargets <= 1 ? 3 : numTargets <= 3 ? 4 : Math.min(numTargets + 2, 6);
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
        focus: `${workoutExercises.length} exercises — run through all`,
        exercises: workoutExercises, warmUp: getWarmUp("calisthenics"),
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
    description: `${goalLabel} — ${workoutExercises.length} exercises progressing toward: ${targetNames.join(", ")}`,
    difficulty: "intermediate", goal: `${goalLabel}: ${targetNames.join(", ")}`,
    trainingGoal: goal, targetSkills: selectedSkillIds, days,
    estimatedWeeklyMinutes: workoutExercises.length * 5 * trainingDays,
    createdAt: new Date().toISOString(),
  };
}

// ─── YOGA PLAN: 30-60 min sessions ───

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
  "arms": ["dolphin", "side-plank"],
  "wrists": ["dolphin"],
};

function generateYogaPlan(selectedPoseIds: string[]): WeeklyPlan {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const targetPoses = selectedPoseIds.map((id) => getYogaPoseById(id)).filter(Boolean);
  const poseNames = targetPoses.map((p) => p!.name);

  // Find muscles needed for target poses
  const neededMuscles = new Set<string>();
  for (const id of selectedPoseIds) {
    const pose = getYogaPoseById(id);
    if (pose) pose.targetAreas.forEach((a) => neededMuscles.add(a));
  }

  // Build supporting stretches pool
  const supportPool = new Set<string>();
  for (const muscle of neededMuscles) {
    (muscleStretches[muscle] || []).forEach((id) => {
      if (!selectedPoseIds.includes(id) && getYogaPoseById(id)) supportPool.add(id);
    });
  }
  // Always add fundamentals
  ["forward-fold", "cobra", "butterfly", "bridge", "childs", "warrior1", "warrior2", "tree", "pigeon", "seated-straddle"].forEach((id) => {
    if (getYogaPoseById(id)) supportPool.add(id);
  });
  const supports = [...supportPool];

  // 5 session templates — each 30-60 min with 12-20 poses
  const sessions = [
    { name: "Flexibility Flow", focus: "45 min — progressive stretching", holdMult: 1.0,
      build: () => ["childs", "cobra", "bridge", ...supports.slice(0, 6), ...selectedPoseIds, "butterfly", "forward-fold", "supine-twist", "happy-baby", "legs-up-wall", "savasana"] },
    { name: "Deep Hold Session", focus: "50 min — long holds for deep flexibility", holdMult: 1.5,
      build: () => ["childs", "cobra", ...supports.slice(2, 8), ...selectedPoseIds, ...supports.slice(0, 3), "pigeon", "seated-straddle", "supine-twist", "legs-up-wall", "savasana"] },
    { name: "Active Flexibility", focus: "40 min — strength meets stretch", holdMult: 0.8,
      build: () => ["chair", "warrior1", "warrior2", "warrior3", "tree", "eagle", ...supports.slice(0, 4), ...selectedPoseIds, "boat", "dolphin", "side-plank", "bridge", "childs", "savasana"] },
    { name: "Target Pose Focus", focus: "45 min — deep work on goal poses", holdMult: 1.2,
      build: () => ["childs", "cobra", ...supports.slice(0, 5), ...selectedPoseIds, "forward-fold", "butterfly", ...supports.slice(3, 7), ...selectedPoseIds, "supine-twist", "savasana"] },
    { name: "Restorative Flow", focus: "35 min — gentle recovery", holdMult: 1.3,
      build: () => ["childs", "cobra", "butterfly", "forward-fold", "bridge", ...supports.slice(0, 4), ...selectedPoseIds, "pigeon", "happy-baby", "supine-twist", "legs-up-wall", "savasana"] },
  ];

  const twoSided = new Set(["pigeon", "lizard", "half-splits", "warrior1", "warrior2", "warrior3", "eagle", "dancer", "tree", "standing-splits"]);
  const warmUp = getWarmUp("yoga");

  const days: DayWorkout[] = dayNames.map((day, i) => {
    if (i === 3 || i === 6) {
      return { day, name: "Rest & Recovery", isRest: true, exercises: [], restDayActivities: getRestDayActivities(i) };
    }
    const session = sessions[i % sessions.length];
    const rawPoses = session.build();
    const uniquePoses = [...new Set(rawPoses)].filter((id) => getYogaPoseById(id));

    return {
      day, name: session.name, isRest: false, focus: session.focus,
      exercises: uniquePoses.map((id, idx) => {
        const pose = getYogaPoseById(id);
        return {
          exerciseId: id, sets: twoSided.has(id) ? 2 : 1, reps: null,
          holdSeconds: Math.round((pose?.holdSeconds || 30) * session.holdMult), restSeconds: 5,
          progressionLevel: selectedPoseIds.includes(id) ? `🎯 Target pose` : `#${idx + 1}`,
        };
      }),
      warmUp,
    };
  });

  return {
    id: `yoga-${Date.now()}`,
    name: targetPoses.length === 1 ? `${poseNames[0]} Program` : "Flexibility Program",
    description: `35-50 min yoga sessions progressing toward: ${poseNames.join(", ")}`,
    difficulty: "intermediate", goal: `Achieve: ${poseNames.join(", ")}`,
    trainingGoal: "balanced", targetSkills: selectedPoseIds, days,
    estimatedWeeklyMinutes: 200, createdAt: new Date().toISOString(),
  };
}
