import { generateWeeklyPlan } from "../lib/planGenerator";
import { saveUserProfile } from "../lib/storage";
import { exercises } from "../data/exercises";

describe("Equipment Filtering", () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe("Zero-equipment pull exercises fallback", () => {
    it("generates workouts with zero-equipment pull exercises when user has no pull equipment", () => {
      // User with ONLY bodyweight (no pull-up bar, no rings, no weights)
      saveUserProfile({
        userId: "test-no-equipment",
        userEquipment: ["calisthenics"],
        overallLevel: "beginner",
        trainingAge: 0,
      });

      const plan = generateWeeklyPlan(["prone-floor-swimmers"], "balanced");

      // Should have training days
      const trainingDays = plan.days.filter(d => !d.isRest);
      expect(trainingDays.length).toBeGreaterThan(0);

      // All exercises should be available (no pull-up-bar required)
      let hasUnavailableExercise = false;
      trainingDays.forEach(day => {
        day.exercises.forEach(ex => {
          const exercise = exercises.find(e => e.id === ex.exerciseId);
          if (exercise && exercise.equipment && exercise.equipment.length > 0) {
            // User only has "calisthenics", so any equipment requirement means it's unavailable
            if (!exercise.equipment.includes("calisthenics")) {
              hasUnavailableExercise = true;
            }
          }
        });
      });

      expect(hasUnavailableExercise).toBe(false);
    });

    it("includes zero-equipment pull exercises in the exercise pool", () => {
      const zeroEquipmentPulls = exercises.filter(
        e => e.category === "pull" && (!e.equipment || e.equipment.length === 0)
      );

      // Should have at least 4 zero-equipment pull exercises
      expect(zeroEquipmentPulls.length).toBeGreaterThanOrEqual(4);

      // Verify specific ones exist
      const expectedIds = [
        "prone-floor-swimmers",
        "sliding-floor-pulldowns",
        "prone-cobra-hold",
        "prone-superman-hold",
      ];
      const foundIds = new Set(zeroEquipmentPulls.map(e => e.id));
      expectedIds.forEach(id => {
        expect(foundIds.has(id)).toBe(true);
      });
    });

    it("zero-equipment pull exercises have correct category and no equipment", () => {
      const exerciseIds = [
        "prone-floor-swimmers",
        "sliding-floor-pulldowns",
        "prone-cobra-hold",
        "prone-superman-hold",
      ];

      exerciseIds.forEach(id => {
        const ex = exercises.find(e => e.id === id);
        expect(ex).toBeDefined();
        if (ex) {
          expect(ex.category).toBe("pull");
          expect(ex.equipment).toEqual([]);
        }
      });
    });
  });

  describe("Pull equipment filtering", () => {
    it("filters out pull exercises when user has no pull equipment", () => {
      saveUserProfile({
        userId: "test-push-only",
        userEquipment: ["calisthenics", "parallettes"],
        overallLevel: "beginner",
        trainingAge: 0,
      });

      const plan = generateWeeklyPlan(["handstand-push-up"], "balanced");
      const allExercises = plan.days.flatMap(d => d.exercises);
      
      // Find any pull exercise that requires equipment
      const hasInvalidPull = allExercises.some(we => {
        const ex = exercises.find(e => e.id === we.exerciseId);
        return ex && ex.category === "pull" && ex.equipment && 
               (ex.equipment.includes("pull-up-bar") || ex.equipment.includes("rings"));
      });

      expect(hasInvalidPull).toBe(false);
    });

    it("includes pull exercises when user has pull-up bar", () => {
      saveUserProfile({
        userId: "test-with-bar",
        userEquipment: ["calisthenics", "pull-up-bar"],
        overallLevel: "beginner",
        trainingAge: 0,
      });

      const plan = generateWeeklyPlan(["pull-up"], "balanced");

      // Should have at least one pull exercise in the generated plan
      const allExercises = plan.days.flatMap(d => d.exercises);
      const hasPullExercise = allExercises.some(we => {
        const ex = exercises.find(e => e.id === we.exerciseId);
        return ex && ex.category === "pull";
      });

      expect(hasPullExercise).toBe(true);
    });
  });

  describe("Mixed equipment scenarios", () => {
    it("handles user with rings but no pull-up bar", () => {
      saveUserProfile({
        userId: "test-rings-only",
        userEquipment: ["calisthenics", "rings"],
        overallLevel: "beginner",
        trainingAge: 0,
      });

      const plan = generateWeeklyPlan(["handstand"], "balanced");

      // Should generate successfully without errors
      expect(plan.days.length).toBe(42);
      expect(plan.days.filter(d => !d.isRest).length).toBeGreaterThan(0);
    });

    it("includes all available exercises based on user equipment", () => {
      saveUserProfile({
        userId: "test-all-equipment",
        userEquipment: ["calisthenics", "pull-up-bar", "rings", "parallettes", "wall", "weights"],
        overallLevel: "beginner",
        trainingAge: 0,
      });

      const plan = generateWeeklyPlan(["muscle-up"], "balanced");

      // Should generate successfully
      expect(plan.days.length).toBe(42);
      
      // All exercises should be available to user
      let allAvailable = true;
      plan.days.forEach(day => {
        day.exercises.forEach(ex => {
          const exercise = exercises.find(e => e.id === ex.exerciseId);
          if (exercise && exercise.equipment && exercise.equipment.length > 0) {
            const hasRequiredEquipment = exercise.equipment.some(eq => 
              ["calisthenics", "pull-up-bar", "rings", "parallettes", "wall", "weights"].includes(eq)
            );
            if (!hasRequiredEquipment) {
              allAvailable = false;
            }
          }
        });
      });

      expect(allAvailable).toBe(true);
    });
  });

  describe("Isometric pull exercises", () => {
    it("includes isometric pull exercises with correct hold properties", () => {
      const isometricPulls = [
        "prone-cobra-hold",
        "prone-superman-hold",
      ];

      isometricPulls.forEach(id => {
        const ex = exercises.find(e => e.id === id);
        expect(ex).toBeDefined();
        if (ex) {
          expect(ex.isHold).toBe(true);
          expect(ex.category).toBe("pull");
        }
      });
    });

    it("generates isometric pull exercises with hold seconds, not reps", () => {
      saveUserProfile({
        userId: "test-isometric",
        userEquipment: ["calisthenics"],
        overallLevel: "beginner",
        trainingAge: 0,
      });

      const plan = generateWeeklyPlan(["prone-cobra-hold"], "balanced");

      // Find the prone-cobra-hold exercise in the plan
      let foundCobraWithHolds = false;
      plan.days.forEach(day => {
        day.exercises.forEach(we => {
          if (we.exerciseId === "prone-cobra-hold") {
            // Isometric exercises should have holdSeconds, not reps
            expect(we.holdSeconds).toBeGreaterThan(0);
            expect(we.reps).toBeNull();
            foundCobraWithHolds = true;
          }
        });
      });

      expect(foundCobraWithHolds).toBe(true);
    });
  });

  describe("Progression chains with equipment", () => {
    it("maintains correct progression chain for zero-equipment exercises", () => {
      const prone = exercises.find(e => e.id === "prone-floor-swimmers");
      expect(prone?.progressionTo).toBe("australian-pull-up");

      const sliding = exercises.find(e => e.id === "sliding-floor-pulldowns");
      expect(sliding?.progressionTo).toBe("australian-pull-up");

      const australian = exercises.find(e => e.id === "australian-pull-up");
      expect(australian?.progressionFrom).toBe("prone-floor-swimmers");
    });

    it("prevents progression to equipment-requiring exercises if user lacks equipment", () => {
      // User with no equipment
      saveUserProfile({
        userId: "test-progression",
        userEquipment: ["calisthenics"],
        overallLevel: "beginner",
        trainingAge: 0,
      });

      const plan = generateWeeklyPlan(["prone-floor-swimmers"], "balanced");

      // Should still work - even though australian-pull-up requires pull-up-bar,
      // the generator should still assign prone-floor-swimmers since it has no equipment
      const allExercises = plan.days.flatMap(d => d.exercises);
      const hasProne = allExercises.some(we => we.exerciseId === "prone-floor-swimmers");
      
      expect(hasProne).toBe(true);
    });
  });
});
