import { workouts, getWorkoutById } from "@/data/workouts";
import { getExerciseById } from "@/data/exercises";

describe("Workout data", () => {
  it("has workouts loaded", () => {
    expect(workouts.length).toBeGreaterThan(0);
  });

  it("each workout has required fields", () => {
    workouts.forEach((w) => {
      expect(w.id).toBeTruthy();
      expect(w.name).toBeTruthy();
      expect(w.description).toBeTruthy();
      expect(w.exercises.length).toBeGreaterThan(0);
      expect(w.estimatedMinutes).toBeGreaterThan(0);
    });
  });

  it("all workout exercises reference valid exercises", () => {
    workouts.forEach((w) => {
      w.exercises.forEach((we) => {
        const exercise = getExerciseById(we.exerciseId);
        expect(exercise).toBeDefined();
      });
    });
  });

  it("getWorkoutById returns correct workout", () => {
    const workout = getWorkoutById("beginner-push");
    expect(workout).toBeDefined();
    expect(workout!.name).toBe("Push Day — Beginner");
  });

  it("getWorkoutById returns undefined for missing id", () => {
    const missing = getWorkoutById("nonexistent");
    expect(missing).toBeUndefined();
  });
});
