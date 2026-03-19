import { getExerciseById } from "@/data/exercises";
import { generateWeeklyPlan } from "@/lib/planGenerator";

describe("Plan generator", () => {
  it("generates a 7-day plan for a single skill", () => {
    const plan = generateWeeklyPlan(["muscle-up"], "balanced");
    expect(plan.days.length).toBe(7);
    expect(plan.name).toContain("Muscle-Up");
    expect(plan.trainingGoal).toBe("balanced");
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

  it("adjusts for weight-loss goal", () => {
    const balanced = generateWeeklyPlan(["muscle-up"], "balanced");
    const wl = generateWeeklyPlan(["muscle-up"], "weight-loss");
    const bReps = balanced.days.flatMap((d) => d.exercises).find((e) => !e.holdSeconds)?.reps ?? 0;
    const wReps = wl.days.flatMap((d) => d.exercises).find((e) => !e.holdSeconds)?.reps ?? 0;
    expect(wReps).toBeGreaterThanOrEqual(bReps);
  });

  it("all exercises reference valid exercises", () => {
    const plan = generateWeeklyPlan(["muscle-up", "full-planche"], "skills");
    plan.days.forEach((day) => {
      day.exercises.forEach((we) => { expect(getExerciseById(we.exerciseId)).toBeDefined(); });
    });
  });
});
