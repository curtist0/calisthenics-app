import { exercises, getExerciseById, getExercisesByCategory } from "@/data/exercises";

describe("Exercise data", () => {
  it("has exercises loaded", () => {
    expect(exercises.length).toBeGreaterThan(0);
  });

  it("each exercise has required fields", () => {
    exercises.forEach((ex) => {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.description).toBeTruthy();
      expect(ex.category).toBeTruthy();
      expect(ex.muscles.length).toBeGreaterThan(0);
      expect(ex.instructions.length).toBeGreaterThan(0);
    });
  });

  it("getExerciseById returns correct exercise", () => {
    const pushUp = getExerciseById("push-up");
    expect(pushUp).toBeDefined();
    expect(pushUp!.name).toBe("Push-Up");
  });

  it("getExerciseById returns undefined for missing id", () => {
    const missing = getExerciseById("nonexistent");
    expect(missing).toBeUndefined();
  });

  it("getExercisesByCategory filters correctly", () => {
    const pushExercises = getExercisesByCategory("push");
    expect(pushExercises.length).toBeGreaterThan(0);
    pushExercises.forEach((ex) => {
      expect(ex.category).toBe("push");
    });
  });

  it("has all categories represented", () => {
    const categories = new Set(exercises.map((e) => e.category));
    expect(categories.has("push")).toBe(true);
    expect(categories.has("pull")).toBe(true);
    expect(categories.has("legs")).toBe(true);
    expect(categories.has("core")).toBe(true);
    expect(categories.has("full-body")).toBe(true);
    expect(categories.has("skill")).toBe(true);
  });

  it("includes advanced skills", () => {
    expect(getExerciseById("dragon-flag")).toBeDefined();
    expect(getExerciseById("full-planche")).toBeDefined();
    expect(getExerciseById("front-lever")).toBeDefined();
    expect(getExerciseById("90-degree-hold")).toBeDefined();
    expect(getExerciseById("human-flag")).toBeDefined();
    expect(getExerciseById("muscle-up")).toBeDefined();
    expect(getExerciseById("back-lever")).toBeDefined();
    expect(getExerciseById("manna")).toBeDefined();
  });

  it("has valid progression chains", () => {
    exercises.forEach((ex) => {
      if (ex.progressionFrom) {
        const from = getExerciseById(ex.progressionFrom);
        expect(from).toBeDefined();
      }
      if (ex.progressionTo) {
        const to = getExerciseById(ex.progressionTo);
        expect(to).toBeDefined();
      }
    });
  });
});
