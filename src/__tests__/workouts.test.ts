import { getExerciseById } from "@/data/exercises";
import { generateGuidedPlan, generateQuickWorkout, generateWeeklyPlan } from "@/lib/planGenerator";
import { getPlanProgress } from "@/lib/planProgress";
import { CompletedSet, UserProfile, WeeklyPlan, WorkoutLog } from "@/lib/types";
import { findNextIncompleteSet, getLivePersonalRecord, getRestRemainingSeconds } from "@/lib/workoutSession";
import { getPersonalRecordLines, summarizeWorkout, wrapMeasuredText } from "@/lib/workoutSummary";
import { calculateWorkoutRewards, generateWeeklyChallenge, getForgivingStreak, getRankProgress, isAccentThemeUnlocked, withChallengeProgress } from "@/lib/gamification";
import { createWelcomeBackPlan, getDaysSinceLastWorkout, getHomeGreeting, getProgressionSuggestion } from "@/lib/homePersonalization";
import { getNextReminderDelayMs, isReminderSnoozedForToday } from "@/lib/trainingReminders";

describe("Plan generator", () => {
  describe("Home personalization", () => {
    const plan: WeeklyPlan = {
      id: "home-plan",
      name: "Pull-up plan",
      description: "",
      difficulty: "beginner",
      goal: "Pull-up",
      trainingGoal: "skills",
      targetSkills: ["pull-up"],
      estimatedWeeklyMinutes: 100,
      createdAt: "2026-01-01T00:00:00.000Z",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => ({
        day,
        name: index === 0 ? "Pull day" : "Rest & Recovery",
        isRest: index !== 0,
        exercises: index === 0 ? [{ exerciseId: "push-up", sets: 2, reps: 10, holdSeconds: null, restSeconds: 60 }] : [],
      })),
    };

    it("uses time, optional profile name, and today's plan in the greeting", () => {
      const mondayMorning = new Date(2026, 5, 1, 9);
      expect(getHomeGreeting(null, plan, 0, mondayMorning)).toBe("Good morning. Pull day is up.");
      expect(getHomeGreeting({ displayName: "Riley" }, plan, 5, mondayMorning))
        .toBe("Good morning, Riley. Pull day is up. You’re on a 5-day streak.");
    });

    it("detects a week away from the latest completed workout", () => {
      const log: WorkoutLog = {
        id: "last-session",
        planId: plan.id,
        dayIndex: 0,
        date: "2026-01-01T12:00:00.000Z",
        startTime: "2026-01-01T11:00:00.000Z",
        endTime: "2026-01-01T12:00:00.000Z",
        completed: true,
        exercises: [],
      };
      expect(getDaysSinceLastWorkout([log], new Date(2026, 0, 8, 12))).toBe(7);
      expect(getDaysSinceLastWorkout([], new Date(2026, 0, 8, 12))).toBeNull();
    });

    it("suggests progression only when every prescribed set reaches its target", () => {
      const log: WorkoutLog = {
        id: "latest-session",
        planId: plan.id,
        dayIndex: 0,
        date: "2026-01-08T12:00:00.000Z",
        startTime: "2026-01-08T11:00:00.000Z",
        endTime: "2026-01-08T12:00:00.000Z",
        completed: true,
        exercises: [{
          exerciseId: "push-up",
          sets: [
            { reps: 10, holdSeconds: null, weightKg: null, completed: true },
            { reps: 12, holdSeconds: null, weightKg: null, completed: true },
          ],
        }],
      };
      expect(getProgressionSuggestion([log], [plan])).toMatchObject({
        logId: log.id,
        exerciseId: "push-up",
        nextName: "Diamond Push-Up",
      });
      const missedTarget = { ...log, exercises: [{ ...log.exercises[0], sets: [{ ...log.exercises[0].sets[0], reps: 9 }, log.exercises[0].sets[1]] }] };
      expect(getProgressionSuggestion([missedTarget], [plan])).toBeNull();

      const holdPlan = {
        ...plan,
        days: plan.days.map((day, index) => index === 0
          ? { ...day, exercises: [{ exerciseId: "plank", sets: 2, reps: null, holdSeconds: 20, restSeconds: 60 }] }
          : day),
      };
      const holdLog = {
        ...log,
        exercises: [{
          exerciseId: "plank",
          sets: [
            { reps: null, holdSeconds: 20, weightKg: null, completed: true },
            { reps: null, holdSeconds: 24, weightKg: null, completed: true },
          ],
        }],
      };
      expect(getProgressionSuggestion([holdLog], [holdPlan])?.nextName).toBe("Hollow Body Hold");
    });

    it("creates a lighter welcome-back session without changing the saved plan", () => {
      const original = JSON.stringify(plan);
      const returnPlan = createWelcomeBackPlan(plan, 0, "welcome-test", "2026-01-08T12:00:00.000Z");
      expect(returnPlan.days[0].name).toBe("Easy Return Session");
      expect(returnPlan.days[0].exercises[0]).toMatchObject({ sets: 1, reps: 7 });
      expect(returnPlan.days.slice(1).every((day) => day.isRest && day.exercises.length === 0)).toBe(true);
      expect(JSON.stringify(plan)).toBe(original);
    });
  });

  describe("Training reminder timing", () => {
    it("schedules the next local occurrence and respects a daily snooze", () => {
      const now = new Date(2026, 0, 2, 17, 30);
      expect(getNextReminderDelayMs("18:00", now)).toBe(30 * 60 * 1000);
      expect(getNextReminderDelayMs("17:00", now)).toBe(23.5 * 60 * 60 * 1000);
      expect(getNextReminderDelayMs("18:00", now, true)).toBe(24.5 * 60 * 60 * 1000);
      expect(() => getNextReminderDelayMs("25:00", now)).toThrow("valid reminder time");
      expect(isReminderSnoozedForToday({
        enabled: true,
        time: "18:00",
        snoozedDate: "2026-01-02",
        lastSentDate: null,
      }, now)).toBe(true);
    });
  });

  describe("Gamification", () => {
    const planForDays = (trainingDays: number[]): WeeklyPlan => ({
      id: "streak-plan",
      name: "Streak plan",
      description: "",
      difficulty: "beginner",
      goal: "Pull-up",
      trainingGoal: "balanced",
      targetSkills: [],
      estimatedWeeklyMinutes: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => ({
        day,
        name: trainingDays.includes(index) ? "Training" : "Rest",
        isRest: !trainingDays.includes(index),
        exercises: [],
      })),
    });

    const makeLog = (id: string, date: string, planId = "streak-plan"): WorkoutLog => ({
      id,
      planId,
      dayIndex: 0,
      date: `${date}T12:00:00.000Z`,
      startTime: `${date}T11:00:00.000Z`,
      endTime: `${date}T12:00:00.000Z`,
      completed: true,
      exercises: [],
    });

    it("awards configured session, new PR, and skill progression XP bonuses", () => {
      const profile: UserProfile = {
        onboarded: true,
        overallLevel: "beginner",
        skillLevels: { push: "beginner", pull: "beginner", legs: "beginner", core: "beginner", balance: "beginner", flexibility: "beginner" },
        exerciseLevels: [{ exerciseId: "muscle-up", level: "beginner", bestReps: 0, bestHold: 0, lastUpdated: "2026-01-01" }],
        trainingGoal: "skills",
        yogaSetUp: false,
        yogaLevel: "beginner",
        createdAt: "2026-01-01",
      };
      const workout = makeLog("rewards", "2026-10-09");
      workout.exercises = [{
        exerciseId: "muscle-up",
        sets: [{ reps: 1, holdSeconds: null, weightKg: null, completed: true }],
      }];

      expect(calculateWorkoutRewards(workout, [], profile)).toEqual({
        xpEarned: 175,
        personalRecordsEarned: 1,
        masteredSkills: [{ exerciseId: "muscle-up", fromLevel: "beginner", toLevel: "intermediate" }],
      });
    });

    it("uses configurable rank boundaries and unlocks themes by XP", () => {
      expect(getRankProgress(0)).toMatchObject({ rank: "Rookie", nextRank: "Bar Regular", xpToNextRank: 500 });
      expect(getRankProgress(499).rank).toBe("Rookie");
      expect(getRankProgress(500)).toMatchObject({ rank: "Bar Regular", nextRank: "Skill Hunter", xpToNextRank: 1000 });
      expect(getRankProgress(7000)).toMatchObject({ rank: "Elite", nextRank: null, xpToNextRank: 0, rankProgressPercent: 100 });
      expect(isAccentThemeUnlocked("cyan", 499)).toBe(false);
      expect(isAccentThemeUnlocked("cyan", 500)).toBe(true);
    });

    it("counts only planned training days, leaving rest days out of the streak", () => {
      const plan = planForDays([0, 2, 4]);
      const logs = [
        makeLog("mon", "2026-10-05"),
        makeLog("wed", "2026-10-07"),
        makeLog("fri", "2026-10-09"),
      ];
      expect(getForgivingStreak(logs, [plan], new Date("2026-10-09T12:00:00.000Z"))).toEqual({
        currentStreak: 3,
        longestStreak: 3,
        freezesHeld: 0,
      });
    });

    it("earns one freeze per seven planned days and automatically consumes a freeze on a miss", () => {
      const plan = planForDays([0, 1, 2, 3, 4, 5, 6]);
      const logs = Array.from({ length: 7 }, (_, index) => makeLog(`day-${index}`, `2026-10-0${index + 1}`));
      expect(getForgivingStreak(logs, [plan], new Date("2026-10-08T12:00:00.000Z"))).toEqual({
        currentStreak: 7,
        longestStreak: 7,
        freezesHeld: 0,
      });
      expect(getForgivingStreak(logs, [plan], new Date("2026-10-07T12:00:00.000Z"))).toEqual({
        currentStreak: 7,
        longestStreak: 7,
        freezesHeld: 1,
      });
      expect(getForgivingStreak(logs, [plan], new Date("2026-10-09T12:00:00.000Z"))).toEqual({
        currentStreak: 0,
        longestStreak: 7,
        freezesHeld: 0,
      });
    });

    it("generates a stable weekly exercise challenge from real recent logs and derives progress", () => {
      const log = makeLog("challenge", "2026-10-09");
      log.exercises = [{
        exerciseId: "push-up",
        sets: [{ reps: 5, holdSeconds: null, weightKg: null, completed: true }],
      }];
      const challenge = generateWeeklyChallenge([log], new Date("2026-10-09T12:00:00.000Z"));
      expect(challenge).toEqual({
        weekStart: "2026-10-05",
        exerciseId: "push-up",
        metric: "reps",
        target: 20,
      });
      expect(withChallengeProgress(challenge, [log])).toEqual({ ...challenge!, progress: 5 });
      expect(generateWeeklyChallenge([], new Date("2026-10-09T12:00:00.000Z"))).toBeNull();
    });
  });

  describe("Workout summary", () => {
    const workout: WorkoutLog = {
      id: "summary",
      planId: "plan",
      dayIndex: 0,
      date: "2026-10-09T10:00:00.000Z",
      startTime: "2026-10-09T10:00:00.000Z",
      endTime: "2026-10-09T10:47:00.000Z",
      completed: true,
      exercises: [
        {
          exerciseId: "pull-up",
          sets: [
            { reps: 8, holdSeconds: null, weightKg: 5, completed: true },
            { reps: 7, holdSeconds: null, weightKg: null, completed: true },
            { reps: 12, holdSeconds: null, weightKg: null, completed: false },
          ],
        },
        {
          exerciseId: "plank",
          sets: [{ reps: null, holdSeconds: 45, weightKg: null, completed: true }],
        },
      ],
    };

    it("summarizes duration, completed sets, rep volume, hold time, and weighted volume", () => {
      expect(summarizeWorkout(workout)).toEqual({
        durationSeconds: 2820,
        durationMinutes: 47,
        completedSets: 3,
        totalReps: 15,
        totalHoldSeconds: 45,
        weightedVolume: 40,
      });
    });

    it("formats zero, one, and many PRs for a share card without inventing records", () => {
      const makeRecord = (exerciseId: string, value: number) => ({
        exerciseId,
        type: "reps" as const,
        value,
        date: "2026-10-09",
        previousValue: null,
      });
      const nameFor = (id: string) => id === "pull-up" ? "Pull-Up" : id;

      expect(getPersonalRecordLines([], nameFor)).toEqual({ lines: [], remaining: 0 });
      expect(getPersonalRecordLines([makeRecord("pull-up", 8)], nameFor)).toEqual({
        lines: ["Pull-Up · 8 reps"],
        remaining: 0,
      });
      expect(getPersonalRecordLines([
        makeRecord("pull-up", 8),
        makeRecord("push-up", 20),
        makeRecord("plank", 45),
        makeRecord("squat", 30),
      ], nameFor)).toEqual({
        lines: ["Pull-Up · 8 reps", "push-up · 20 reps", "plank · 45 reps"],
        remaining: 1,
      });
    });

    it("wraps long workout names within the card width and caps title lines", () => {
      const result = wrapMeasuredText(
        "An exceptionally long workout name that should remain inside the story card boundaries and not overflow",
        100,
        (text) => text.length * 10,
        3,
      );

      expect(result.lines.length).toBeLessThanOrEqual(3);
      expect(result.lines.every((line) => line.length * 10 <= 100)).toBe(true);
      expect(result.truncated).toBe(true);
      expect(result.lines.at(-1)).toMatch(/…$/);
    });
  });

  it("generates a 7-day plan for a single skill", () => {
    const plan = generateWeeklyPlan(["muscle-up"], "balanced");
    expect(plan.days.length).toBe(7);
    expect(plan.name).toContain("Muscle-Up");
    expect(plan.trainingGoal).toBe("balanced");
  });

  describe("Focused workout helpers", () => {
    it("computes rest time from timestamps, including overdue and invalid starts", () => {
      expect(getRestRemainingSeconds("2026-10-09T15:00:00.000Z", 90, Date.parse("2026-10-09T15:00:30.000Z"))).toBe(60);
      expect(getRestRemainingSeconds("2026-10-09T15:00:00.000Z", 90, Date.parse("2026-10-09T15:02:00.000Z"))).toBe(0);
      expect(getRestRemainingSeconds("not-a-date", 90, Date.now())).toBe(0);
    });

    it("restores the next uncompleted set after interruption", () => {
      const workout: WorkoutLog = {
        id: "restore",
        planId: "plan",
        dayIndex: 0,
        date: "2026-10-09T12:00:00.000Z",
        startTime: "2026-10-09T12:00:00.000Z",
        endTime: null,
        completed: false,
        exercises: [
          { exerciseId: "push-up", sets: [{ reps: 8, holdSeconds: null, weightKg: null, completed: true }, { reps: null, holdSeconds: null, weightKg: null, completed: false }] },
          { exerciseId: "plank", sets: [{ reps: null, holdSeconds: null, weightKg: null, completed: false }] },
        ],
      };
      expect(findNextIncompleteSet(workout)).toEqual({ exerciseIndex: 0, setIndex: 1 });
      workout.exercises[0].sets[1].completed = true;
      expect(findNextIncompleteSet(workout)).toEqual({ exerciseIndex: 1, setIndex: 0 });
      workout.exercises[1].sets[0].completed = true;
      expect(findNextIncompleteSet(workout)).toBeNull();
    });

    it("detects rep, hold, weighted-load, and weighted-rep PRs only when they improve", () => {
      const recordSet: CompletedSet = { reps: 8, holdSeconds: 40, weightKg: 10, completed: true };
      expect(getLivePersonalRecord("pull-up", recordSet, { reps: 7, hold: 30, weight: 8, weightedReps: 6, weightedRepWeight: 8 }, "2026-10-09"))
        .toEqual([
          { exerciseId: "pull-up", type: "reps", value: 8, date: "2026-10-09", previousValue: 7 },
          { exerciseId: "pull-up", type: "hold", value: 40, date: "2026-10-09", previousValue: 30 },
          { exerciseId: "pull-up", type: "weight", value: 10, date: "2026-10-09", previousValue: 8 },
          { exerciseId: "pull-up", type: "weighted-reps", value: 8, date: "2026-10-09", previousValue: 6, weightKg: 10 },
        ]);
      expect(getLivePersonalRecord("pull-up", recordSet, { reps: 8, hold: 40, weight: 10, weightedReps: 8, weightedRepWeight: 10 })).toEqual([]);
    });
  });

  it("generates training and rest days", () => {
    const plan = generateWeeklyPlan(["full-planche"], "skills");
    expect(plan.days.filter((d) => !d.isRest).length).toBeGreaterThan(0);
    expect(plan.days.filter((d) => d.isRest).length).toBeGreaterThan(0);
  });

  it("includes progression levels", () => {
    const plan = generateWeeklyPlan(["full-planche"], "muscle");
    const allEx = plan.days.flatMap((d) => d.exercises);
    expect(allEx.filter((e) => e.progressionLevel).length).toBeGreaterThan(0);
  });

  it("includes warm-ups for training days", () => {
    const plan = generateWeeklyPlan(["muscle-up"], "balanced");
    const trainingDays = plan.days.filter((d) => !d.isRest);
    expect(trainingDays.every((d) => d.warmUp)).toBe(true);
  });

  it("includes rest day activities", () => {
    const plan = generateWeeklyPlan(["muscle-up"], "balanced");
    const restDays = plan.days.filter((d) => d.isRest);
    expect(restDays.every((d) => d.restDayActivities && d.restDayActivities.length > 0)).toBe(true);
  });

  it("uses distinct exercise selections across training days", () => {
    const plan = generateWeeklyPlan(["muscle-up", "full-planche"], "balanced");
    const training = plan.days.filter((d) => !d.isRest);
    const signatures = training.map((d) => d.exercises.map((e) => e.exerciseId).join(","));
    const unique = new Set(signatures);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("adjusts for weight-loss goal", () => {
    const balanced = generateWeeklyPlan(["muscle-up"], "balanced");
    const wl = generateWeeklyPlan(["muscle-up"], "weight-loss");
    const bReps = balanced.days.flatMap((d) => d.exercises).find((e) => !e.holdSeconds)?.reps ?? 0;
    const wReps = wl.days.flatMap((d) => d.exercises).find((e) => !e.holdSeconds)?.reps ?? 0;
    expect(wReps).toBeGreaterThanOrEqual(bReps);
  });

  it("all exercises reference valid exercises or conditioning", () => {
    const plan = generateWeeklyPlan(["muscle-up", "full-planche"], "skills");
    plan.days.forEach((day) => {
      day.exercises.forEach((we) => {
        const isConditioning = we.exerciseId.startsWith("cond-");
        if (!isConditioning) {
          expect(getExerciseById(we.exerciseId)).toBeDefined();
        }
      });
    });
  });

  it("generates deterministic guided sessions using only library exercises", () => {
      const input = {
        goalSkillId: "full-planche",
        daysPerWeek: 4,
        equipment: "pull-up-bar" as const,
        level: "intermediate" as const,
        id: "plan-test",
        createdAt: "2026-01-01T00:00:00.000Z",
      };
      const first = generateGuidedPlan(input);
      const second = generateGuidedPlan(input);
      const trainingDays = first.days.filter((day) => !day.isRest);

      expect(first.days).toEqual(second.days);
      expect(trainingDays).toHaveLength(4);
      expect(first.days).toHaveLength(7);
      expect(trainingDays.every((day) => day.exercises.length >= 4 && day.exercises.length <= 6)).toBe(true);
      expect(trainingDays.every((day) => day.exercises.length === 5)).toBe(true);
      expect(trainingDays.flatMap((day) => day.exercises).every((exercise) => getExerciseById(exercise.exerciseId))).toBe(true);
      expect(trainingDays.flatMap((day) => day.exercises).some((exercise) => exercise.exerciseId === "dips")).toBe(false);
      trainingDays.flatMap((day) => day.exercises).forEach((item) => {
        const exercise = getExerciseById(item.exerciseId)!;
        if (exercise.isHold) {
          expect(item.holdSeconds).toBeGreaterThan(0);
          expect(item.reps).toBeNull();
        } else {
          expect(item.reps).toBeGreaterThan(0);
          expect(item.holdSeconds).toBeNull();
        }
      });
  });

  it("supports 2-6 training days and rejects invalid guided-plan day counts", () => {
      for (let days = 2; days <= 6; days++) {
        const plan = generateGuidedPlan({
          goalSkillId: "pull-up",
          daysPerWeek: days,
          equipment: "pull-up-bar",
          level: "beginner",
        });
        expect(plan.days.filter((day) => !day.isRest)).toHaveLength(days);
      }

      expect(() => generateGuidedPlan({
        goalSkillId: "pull-up",
        daysPerWeek: 1,
        equipment: "pull-up-bar",
        level: "beginner",
      })).toThrow("Choose between 2 and 6 training days per week.");
  });

  it("filters optional equipment and includes the main skill plus push, pull, legs, and core work", () => {
      const withoutDipBars = generateGuidedPlan({
        goalSkillId: "full-planche",
        daysPerWeek: 3,
        equipment: "pull-up-bar",
        level: "intermediate",
      });
      const withDipBars = generateGuidedPlan({
        goalSkillId: "full-planche",
        daysPerWeek: 3,
        equipment: "pull-up-bar-and-dip-bars",
        level: "intermediate",
      });
      const session = withDipBars.days.find((day) => !day.isRest)!;
      const exercises = session.exercises.map((item) => getExerciseById(item.exerciseId)!);

      expect(withoutDipBars.days.flatMap((day) => day.exercises).some((item) => item.exerciseId === "dips")).toBe(false);
      expect(session.exercises.some((item) => item.exerciseId === "dips")).toBe(true);
      expect(exercises.some((exercise) => exercise.id === "tuck-planche")).toBe(true);
      expect(exercises.some((exercise) => exercise.category === "pull")).toBe(true);
      expect(exercises.some((exercise) => exercise.category === "push")).toBe(true);
      expect(exercises.some((exercise) => exercise.category === "legs")).toBe(true);
      expect(exercises.some((exercise) => exercise.category === "core")).toBe(true);
  });

  it("creates a single-session quick workout with the selected duration and weekday", () => {
      const plan = generateQuickWorkout({
        durationMinutes: 30,
        equipment: "pull-up-bar",
        level: "beginner",
        dayIndex: 4,
      });
      expect(plan.days.filter((day) => !day.isRest)).toHaveLength(1);
      expect(plan.days[4].exercises).toHaveLength(5);
      expect(plan.days[4].exercises[0].sets).toBe(3);
      expect(plan.name).toContain("30-Minute");
  });

  it("calculates six-week plan progress from completed logs for that plan only", () => {
      const plan = generateGuidedPlan({
        goalSkillId: "pull-up",
        daysPerWeek: 3,
        equipment: "pull-up-bar",
        level: "beginner",
        id: "progress-plan",
      });
      const logs: WorkoutLog[] = Array.from({ length: 4 }, (_, index) => ({
        id: `log-${index}`,
        planId: "progress-plan",
        dayIndex: index,
        date: "2026-01-01T12:00:00.000Z",
        startTime: "2026-01-01T12:00:00.000Z",
        endTime: "2026-01-01T12:30:00.000Z",
        exercises: [],
        completed: true,
      }));
      logs.push({ ...logs[0], id: "other-plan-log", planId: "different-plan" });

      expect(getPlanProgress(plan, logs)).toEqual({
        completedSessions: 4,
        totalSessions: 18,
        currentWeek: 2,
        percentage: 22,
    });
  });
});
