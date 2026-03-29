import { generateWeeklyPlan } from "../lib/planGenerator";
import { saveUserProfile } from "../lib/storage";

describe("Advanced User Push/Pull Split", () => {
  it("generates 4x/week Push/Pull split for advanced users (not full body)", () => {
    // Set up an advanced user profile
    saveUserProfile({
      userId: "test-advanced",
      userEquipment: ["pull-up-bar", "rings", "parallettes", "wall"],
      overallLevel: "advanced",
      trainingAge: 5,
    });

    const plan = generateWeeklyPlan(["muscle-up"], "balanced");

    // Check total training days
    const trainingDays = plan.days.filter(d => !d.isRest);
    expect(trainingDays.length).toBe(24); // 4 × 6 weeks

    // Check that training days are on Mon/Tue/Thu/Fri (days 0,1,3,4)
    const daysPerWeek = [0, 0, 0, 0, 0, 0, 0];
    plan.days.forEach((day, idx) => {
      const dayOfWeek = idx % 7;
      if (!day.isRest) {
        daysPerWeek[dayOfWeek]++;
      }
    });

    expect(daysPerWeek[0]).toBe(6); // Monday: 6 times (once per week)
    expect(daysPerWeek[1]).toBe(6); // Tuesday: 6 times
    expect(daysPerWeek[2]).toBe(0); // Wednesday: 0 (rest)
    expect(daysPerWeek[3]).toBe(6); // Thursday: 6 times
    expect(daysPerWeek[4]).toBe(6); // Friday: 6 times
    expect(daysPerWeek[5]).toBe(0); // Saturday: 0 (rest)
    expect(daysPerWeek[6]).toBe(0); // Sunday: 0 (rest)

    // Clean up
    localStorage.clear();
  });

  it("alternates between Push and Pull days correctly", () => {
    // Set up an advanced user profile
    saveUserProfile({
      userId: "test-advanced",
      userEquipment: ["pull-up-bar", "rings", "parallettes", "wall"],
      overallLevel: "advanced",
      trainingAge: 5,
    });

    const plan = generateWeeklyPlan(["muscle-up"], "balanced");

    const week1Days = plan.days.slice(0, 7).filter(d => !d.isRest);
    expect(week1Days.length).toBe(4);
    
    // Should be: Mon=Push, Tue=Pull, Thu=Push, Fri=Pull
    expect(week1Days[0].name).toContain("Push");
    expect(week1Days[1].name).toContain("Pull");
    expect(week1Days[2].name).toContain("Push");
    expect(week1Days[3].name).toContain("Pull");

    // Clean up
    localStorage.clear();
  });

  it("enforces 5-set maximum cap for all users", () => {
    const plan = generateWeeklyPlan(["muscle-up"], "balanced");

    let maxSets = 0;
    plan.days.forEach(day => {
      day.exercises.forEach(ex => {
        maxSets = Math.max(maxSets, ex.sets);
      });
    });

    expect(maxSets).toBeLessThanOrEqual(5);
  });

  it("maintains 3x/week Full Body schedule for beginner users", () => {
    // Beginner is default when no profile is set
    localStorage.clear();

    const plan = generateWeeklyPlan(["knee-push-up"], "balanced");

    const daysPerWeek = [0, 0, 0, 0, 0, 0, 0];
    plan.days.forEach((day, idx) => {
      const dayOfWeek = idx % 7;
      if (!day.isRest) {
        daysPerWeek[dayOfWeek]++;
      }
    });

    // Should be 3x/week (Mon/Wed/Fri)
    expect(daysPerWeek[0]).toBe(6); // Monday
    expect(daysPerWeek[2]).toBe(6); // Wednesday
    expect(daysPerWeek[4]).toBe(6); // Friday
    expect(daysPerWeek[1]).toBe(0); // Tuesday (rest)
    expect(daysPerWeek[3]).toBe(0); // Thursday (rest)
  });

  it("deload week 6 applies light focus for all users", () => {
    localStorage.clear();
    const plan = generateWeeklyPlan(["muscle-up"], "balanced");

    // Week 6 is days 35-41
    const week6Days = plan.days.slice(35, 42);
    const week6TrainingDays = week6Days.filter(d => !d.isRest);

    week6TrainingDays.forEach(day => {
      expect(day.focus).toContain("Deload");
    });
  });
});
