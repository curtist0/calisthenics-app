import { getExerciseById } from "@/data/exercises";
import { generateWeeklyPlan } from "@/lib/planGenerator";

describe("Plan generator", () => {
  it("generates a 7-day plan for a single skill", () => {
    const plan = generateWeeklyPlan(["muscle-up"]);
    expect(plan.days.length).toBe(7);
    expect(plan.name).toContain("Muscle-Up");
    expect(plan.targetSkills).toContain("muscle-up");
    expect(plan.createdAt).toBeTruthy();
  });

  it("generates a plan with training and rest days", () => {
    const plan = generateWeeklyPlan(["full-planche"]);
    const training = plan.days.filter((d) => !d.isRest);
    const rest = plan.days.filter((d) => d.isRest);
    expect(training.length).toBeGreaterThan(0);
    expect(rest.length).toBeGreaterThan(0);
  });

  it("includes progression levels in exercises", () => {
    const plan = generateWeeklyPlan(["full-planche"]);
    const allEx = plan.days.flatMap((d) => d.exercises);
    const withLevel = allEx.filter((e) => e.progressionLevel);
    expect(withLevel.length).toBeGreaterThan(0);
  });

  it("includes prerequisite exercises from the chain", () => {
    const plan = generateWeeklyPlan(["full-planche"]);
    const allExIds = plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId));
    const hasPrereq = allExIds.includes("tuck-planche") || allExIds.includes("straddle-planche");
    expect(hasPrereq).toBe(true);
  });

  it("all generated exercises reference valid exercises", () => {
    const plan = generateWeeklyPlan(["muscle-up", "full-planche"]);
    plan.days.forEach((day) => {
      day.exercises.forEach((we) => {
        expect(getExerciseById(we.exerciseId)).toBeDefined();
      });
    });
  });

  it("scales training days for multiple skills", () => {
    const single = generateWeeklyPlan(["muscle-up"]);
    const multi = generateWeeklyPlan(["muscle-up", "full-planche", "front-lever", "dragon-flag"]);
    expect(multi.days.filter((d) => !d.isRest).length).toBeGreaterThanOrEqual(single.days.filter((d) => !d.isRest).length);
  });
});
