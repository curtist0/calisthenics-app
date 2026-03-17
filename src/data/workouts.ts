import { Workout } from "@/lib/types";

export const workouts: Workout[] = [
  {
    id: "beginner-push",
    name: "Push Day — Beginner",
    description: "Build a solid foundation for pushing strength with this beginner-friendly routine.",
    category: "push",
    difficulty: "beginner",
    estimatedMinutes: 20,
    exercises: [
      { exerciseId: "push-up", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
      { exerciseId: "diamond-push-up", sets: 3, reps: 6, holdSeconds: null, restSeconds: 60 },
      { exerciseId: "pike-push-up", sets: 3, reps: 8, holdSeconds: null, restSeconds: 60 },
    ],
  },
  {
    id: "beginner-pull",
    name: "Pull Day — Beginner",
    description: "Develop your back and biceps with this introductory pulling workout.",
    category: "pull",
    difficulty: "beginner",
    estimatedMinutes: 20,
    exercises: [
      { exerciseId: "australian-pull-up", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
      { exerciseId: "chin-up", sets: 3, reps: 5, holdSeconds: null, restSeconds: 90 },
      { exerciseId: "australian-pull-up", sets: 2, reps: 12, holdSeconds: null, restSeconds: 60 },
    ],
  },
  {
    id: "beginner-legs",
    name: "Leg Day — Beginner",
    description: "Strengthen your lower body with fundamental bodyweight leg exercises.",
    category: "legs",
    difficulty: "beginner",
    estimatedMinutes: 25,
    exercises: [
      { exerciseId: "squat", sets: 4, reps: 15, holdSeconds: null, restSeconds: 60 },
      { exerciseId: "lunge", sets: 3, reps: 12, holdSeconds: null, restSeconds: 60 },
      { exerciseId: "calf-raise", sets: 3, reps: 15, holdSeconds: null, restSeconds: 45 },
    ],
  },
  {
    id: "core-blast",
    name: "Core Blast",
    description: "A focused core workout combining holds and dynamic movements.",
    category: "core",
    difficulty: "intermediate",
    estimatedMinutes: 15,
    exercises: [
      { exerciseId: "plank", sets: 3, reps: null, holdSeconds: 45, restSeconds: 30 },
      { exerciseId: "hanging-leg-raise", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
      { exerciseId: "hollow-body-hold", sets: 3, reps: null, holdSeconds: 30, restSeconds: 30 },
    ],
  },
  {
    id: "full-body-starter",
    name: "Full Body Starter",
    description: "A complete full-body workout perfect for getting started with calisthenics.",
    category: "mixed",
    difficulty: "beginner",
    estimatedMinutes: 30,
    exercises: [
      { exerciseId: "push-up", sets: 3, reps: 10, holdSeconds: null, restSeconds: 60 },
      { exerciseId: "australian-pull-up", sets: 3, reps: 8, holdSeconds: null, restSeconds: 60 },
      { exerciseId: "squat", sets: 3, reps: 15, holdSeconds: null, restSeconds: 60 },
      { exerciseId: "plank", sets: 3, reps: null, holdSeconds: 30, restSeconds: 30 },
      { exerciseId: "burpee", sets: 2, reps: 8, holdSeconds: null, restSeconds: 90 },
    ],
  },
  {
    id: "advanced-upper",
    name: "Advanced Upper Body",
    description: "Challenge yourself with the hardest upper body calisthenics movements.",
    category: "mixed",
    difficulty: "advanced",
    estimatedMinutes: 40,
    exercises: [
      { exerciseId: "muscle-up", sets: 4, reps: 5, holdSeconds: null, restSeconds: 120 },
      { exerciseId: "handstand-push-up", sets: 4, reps: 5, holdSeconds: null, restSeconds: 120 },
      { exerciseId: "dips", sets: 4, reps: 12, holdSeconds: null, restSeconds: 90 },
      { exerciseId: "pull-up", sets: 4, reps: 10, holdSeconds: null, restSeconds: 90 },
      { exerciseId: "l-sit", sets: 3, reps: null, holdSeconds: 20, restSeconds: 60 },
    ],
  },
  {
    id: "hiit-conditioning",
    name: "HIIT Conditioning",
    description: "High-intensity interval training for cardiovascular fitness and fat burning.",
    category: "full-body",
    difficulty: "intermediate",
    estimatedMinutes: 20,
    exercises: [
      { exerciseId: "burpee", sets: 4, reps: 10, holdSeconds: null, restSeconds: 45 },
      { exerciseId: "jump-squat", sets: 4, reps: 12, holdSeconds: null, restSeconds: 45 },
      { exerciseId: "push-up", sets: 4, reps: 15, holdSeconds: null, restSeconds: 45 },
      { exerciseId: "bear-crawl", sets: 4, reps: 10, holdSeconds: null, restSeconds: 45 },
    ],
  },
];

export function getWorkoutById(id: string): Workout | undefined {
  return workouts.find((w) => w.id === id);
}
