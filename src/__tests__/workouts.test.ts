import { weeklyPlans, getPlanById } from "@/data/workouts";
import { getExerciseById } from "@/data/exercises";
import { generateWeeklyPlan } from "@/lib/planGenerator";

describe("Weekly plan data", () => {
  it("has plans loaded", () => {
    expect(weeklyPlans.length).toBeGreaterThan(0);
  });

  it("each plan has 7 days", () => {
    weeklyPlans.forEach((p) => {
      expect(p.days.length).toBe(7);
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
});

describe("Plan generator", () => {
  it("generates a 7-day plan for a single skill", () => {
    const plan = generateWeeklyPlan(["muscle-up"]);
    expect(plan.days.length).toBe(7);
    expect(plan.name).toContain("Muscle-Up");
  });

  it("generates a plan with training and rest days", () => {
    const plan = generateWeeklyPlan(["full-planche"]);
    const trainingDays = plan.days.filter((d) => !d.isRest);
    const restDays = plan.days.filter((d) => d.isRest);
    expect(trainingDays.length).toBeGreaterThan(0);
    expect(restDays.length).toBeGreaterThan(0);
  });

  it("generates more training days for multiple skills", () => {
    const singlePlan = generateWeeklyPlan(["muscle-up"]);
    const multiPlan = generateWeeklyPlan(["muscle-up", "full-planche", "front-lever", "dragon-flag"]);
    const singleTraining = singlePlan.days.filter((d) => !d.isRest).length;
    const multiTraining = multiPlan.days.filter((d) => !d.isRest).length;
    expect(multiTraining).toBeGreaterThanOrEqual(singleTraining);
  });

  it("all generated exercises reference valid exercises", () => {
    const plan = generateWeeklyPlan(["muscle-up", "full-planche"]);
    plan.days.forEach((day) => {
      day.exercises.forEach((we) => {
        const exercise = getExerciseById(we.exerciseId);
        expect(exercise).toBeDefined();
      });
    });
  });

  it("includes prerequisite exercises", () => {
    const plan = generateWeeklyPlan(["full-planche"]);
    const allExIds = plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId));
    // Full planche should include tuck planche or straddle planche as prerequisite
    const hasPrereq = allExIds.includes("tuck-planche") || allExIds.includes("straddle-planche");
    expect(hasPrereq).toBe(true);
  });
});
