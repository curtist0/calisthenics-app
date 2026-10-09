import { generateId, getPersonalRecords, getUserStats, saveWorkoutLog } from "@/lib/storage";

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
});
