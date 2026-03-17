import { weeklyPlans, getPlanById } from "@/data/workouts";
import { getExerciseById } from "@/data/exercises";

describe("Weekly plan data", () => {
  it("has plans loaded", () => {
    expect(weeklyPlans.length).toBeGreaterThan(0);
  });

  it("each plan has 7 days", () => {
    weeklyPlans.forEach((p) => {
      expect(p.days.length).toBe(7);
    });
  });

  it("each plan has required fields", () => {
    weeklyPlans.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.goal).toBeTruthy();
      expect(p.estimatedWeeklyMinutes).toBeGreaterThan(0);
    });
  });

  it("all plan exercises reference valid exercises", () => {
    weeklyPlans.forEach((p) => {
      p.days.forEach((day) => {
        day.exercises.forEach((we) => {
          const exercise = getExerciseById(we.exerciseId);
          expect(exercise).toBeDefined();
        });
      });
    });
  });

  it("getPlanById returns correct plan", () => {
    const plan = getPlanById("beginner-full-body");
    expect(plan).toBeDefined();
    expect(plan!.name).toBe("Beginner Full Body");
  });

  it("getPlanById returns undefined for missing id", () => {
    const missing = getPlanById("nonexistent");
    expect(missing).toBeUndefined();
  });

  it("includes advanced skill programs", () => {
    expect(getPlanById("muscle-up-program")).toBeDefined();
    expect(getPlanById("planche-program")).toBeDefined();
    expect(getPlanById("hspu-program")).toBeDefined();
    expect(getPlanById("front-lever-program")).toBeDefined();
    expect(getPlanById("elite-skills")).toBeDefined();
  });

  it("rest days have no exercises", () => {
    weeklyPlans.forEach((p) => {
      p.days.filter((d) => d.isRest).forEach((day) => {
        expect(day.exercises.length).toBe(0);
      });
    });
  });
});
