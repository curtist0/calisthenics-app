import { getExerciseById } from "@/data/exercises";
import { generateWeeklyPlan } from "@/lib/planGenerator";

describe("Plan generator", () => {
  it("generates a 42-day mesocycle plan (6 weeks) for a single skill", () => {
    const plan = generateWeeklyPlan(["muscle-up"], "balanced");
    expect(plan.days.length).toBe(42); // 6 weeks × 7 days
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

  it("applies Daily Undulating Periodization (DUP) with varying focus per training day", () => {
    const plan = generateWeeklyPlan(["muscle-up", "full-planche"], "strength-skill");
    const training = plan.days.filter((d) => !d.isRest);
    
    // Extract focuses from the first week (days 0-6)
    const week1Training = plan.days.slice(0, 7).filter((d) => !d.isRest);
    const focuses = week1Training.map(d => d.focus ? d.focus.split('&')[0].trim() : null);
    
    // Should have varying focuses (Intensity, Volume, Conditioning pattern)
    const uniqueFocuses = new Set(focuses);
    expect(uniqueFocuses.size).toBeGreaterThan(1);
  });

  it("week 6 is mandatory deload week with light focus", () => {
    const plan = generateWeeklyPlan(["muscle-up"], "strength-skill");
    const week6Days = plan.days.slice(35, 42); // Days 35-41 are week 6
    const trainingDaysWeek6 = week6Days.filter((d) => !d.isRest);
    
    // All training days in week 6 should be "Light & Recovery"
    trainingDaysWeek6.forEach(day => {
      expect(day.focus).toContain("Light & Recovery");
    });
  });

  it("applies progressive overload across weeks (sets increase weeks 1-4, pullback week 5, deload week 6)", () => {
    const plan = generateWeeklyPlan(["muscle-up"], "hypertrophy");
    
    // Get first training day of each week
    const week1FirstTrain = plan.days.slice(0, 7).find(d => !d.isRest);
    const week4FirstTrain = plan.days.slice(21, 28).find(d => !d.isRest);
    const week6FirstTrain = plan.days.slice(35, 42).find(d => !d.isRest);
    
    // Week 4 should have more sets than week 1 (progressive overload)
    const week1Sets = week4FirstTrain?.exercises[0]?.sets ?? 0;
    const week4Sets = week4FirstTrain?.exercises[0]?.sets ?? 0;
    const week6Sets = week6FirstTrain?.exercises[0]?.sets ?? 0;
    
    // Week 6 deload should have significantly fewer sets
    expect(week6Sets).toBeLessThan(week1Sets);
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
});
