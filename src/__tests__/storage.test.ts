import { dismissSuggestion, generateId, getAccentTheme, getActiveWorkout, getDismissedSuggestions, getPersonalRecords, getRestDuration, getTrainingReminder, getUserStats, getWeeklyChallenge, saveAccentTheme, saveActiveWorkout, saveRestDuration, saveTrainingReminder, saveWorkoutLog } from "@/lib/storage";

describe("Storage utilities", () => {
  beforeEach(() => localStorage.clear());

  it("generateId returns unique ids", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("generateId returns string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("derives stats and records from completed workout logs, not stale caches", () => {
    localStorage.setItem("calisthenics_stats", JSON.stringify({ totalWorkouts: 12 }));
    localStorage.setItem("calisthenics_prs", JSON.stringify([
      { exerciseId: "push-up", type: "reps", value: 100, date: "2025-05-15", previousValue: null },
    ]));

    expect(getUserStats().totalWorkouts).toBe(0);
    expect(getPersonalRecords()).toEqual([]);

    saveWorkoutLog({
      id: "test-log",
      planId: "test-plan",
      dayIndex: 0,
      date: "2026-10-08T12:00:00.000Z",
      startTime: "2026-10-08T11:00:00.000Z",
      endTime: "2026-10-08T12:00:00.000Z",
      completed: true,
      exercises: [{
        exerciseId: "push-up",
        sets: [{ reps: 12, holdSeconds: null, weightKg: null, completed: true }],
      }],
    });

    expect(getUserStats().totalWorkouts).toBe(1);
    expect(getPersonalRecords()).toEqual([{
      exerciseId: "push-up",
      type: "reps",
      value: 12,
      date: "2026-10-08",
      previousValue: null,
    }]);
  });

  it("persists and restores an in-progress workout locally", () => {
    const workout = {
      id: "active-test",
      planId: "plan-test",
      dayIndex: 2,
      date: "2026-10-09T12:00:00.000Z",
      startTime: "2026-10-09T12:00:00.000Z",
      endTime: null,
      completed: false,
      exercises: [{ exerciseId: "pull-up", sets: [{ reps: 5, holdSeconds: null, weightKg: null, bandAssistance: "light band", tempoNote: "slow negative", completed: true }] }],
    };
    saveActiveWorkout(workout);
    expect(getActiveWorkout()).toEqual(workout);
    saveActiveWorkout(null);
    expect(getActiveWorkout()).toBeNull();
  });

  it("defaults to a supported rest duration and persists a selected duration", () => {
    expect(getRestDuration()).toBe(90);
    saveRestDuration(120);
    expect(getRestDuration()).toBe(120);
  });

  it("persists explicit reminder preferences and dismissed progression suggestions", () => {
    expect(getTrainingReminder()).toEqual({
      enabled: false,
      time: "18:00",
      snoozedDate: null,
      lastSentDate: null,
    });
    saveTrainingReminder({ enabled: true, time: "19:30", snoozedDate: "2026-01-02", lastSentDate: null });
    expect(getTrainingReminder()).toEqual({
      enabled: true,
      time: "19:30",
      snoozedDate: "2026-01-02",
      lastSentDate: null,
    });
    dismissSuggestion("log-1:push-up");
    dismissSuggestion("log-1:push-up");
    expect(getDismissedSuggestions()).toEqual(["log-1:push-up"]);
  });

  it("derives a weighted-reps PR from completed workout logs", () => {
    saveWorkoutLog({
      id: "weighted-log",
      planId: "plan-test",
      dayIndex: 0,
      date: "2026-10-09T12:00:00.000Z",
      startTime: "2026-10-09T11:00:00.000Z",
      endTime: "2026-10-09T12:00:00.000Z",
      completed: true,
      exercises: [{
        exerciseId: "pull-up",
        sets: [{ reps: 8, holdSeconds: null, weightKg: 10, completed: true }],
      }],
    });
    expect(getPersonalRecords()).toContainEqual({
      exerciseId: "pull-up",
      type: "weighted-reps",
      value: 8,
      date: "2026-10-09",
      previousValue: null,
      weightKg: 10,
    });
  });

  it("persists XP rewards on completion and does not award them twice", () => {
    const workout = {
      id: "xp-log",
      planId: "plan-test",
      dayIndex: 0,
      date: "2026-10-09T12:00:00.000Z",
      startTime: "2026-10-09T11:00:00.000Z",
      endTime: "2026-10-09T12:00:00.000Z",
      completed: true,
      exercises: [{
        exerciseId: "push-up",
        sets: [{ reps: 12, holdSeconds: null, weightKg: null, completed: true }],
      }],
    };

    const firstSave = saveWorkoutLog(workout, true);
    const repeatedSave = saveWorkoutLog(workout, true);

    expect(firstSave.xpEarned).toBe(125);
    expect(repeatedSave.xpEarned).toBe(125);
    expect(JSON.parse(localStorage.getItem("calisthenics_logs") ?? "[]")).toHaveLength(1);
  });

  it("persists the selected unlocked theme and keeps the weekly challenge stable", () => {
    saveAccentTheme("cyan");
    expect(getAccentTheme()).toBe("cyan");

    const pushUpLog = {
      id: "challenge-first",
      planId: "plan-test",
      dayIndex: 0,
      date: "2026-10-09T12:00:00.000Z",
      startTime: "2026-10-09T11:00:00.000Z",
      endTime: "2026-10-09T12:00:00.000Z",
      completed: true,
      exercises: [{
        exerciseId: "push-up",
        sets: [{ reps: 5, holdSeconds: null, weightKg: null, completed: true }],
      }],
    };
    const firstChallenge = getWeeklyChallenge([pushUpLog], new Date("2026-10-09T12:00:00.000Z"));
    const laterLog = {
      ...pushUpLog,
      id: "challenge-later",
      exercises: [{
        exerciseId: "pull-up",
        sets: [{ reps: 8, holdSeconds: null, weightKg: null, completed: true }],
      }],
    };
    const laterChallenge = getWeeklyChallenge([pushUpLog, laterLog], new Date("2026-10-09T12:00:00.000Z"));

    expect(firstChallenge?.exerciseId).toBe("push-up");
    expect(laterChallenge?.exerciseId).toBe("push-up");
    expect(laterChallenge?.progress).toBe(5);
  });
});
