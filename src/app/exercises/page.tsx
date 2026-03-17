"use client";

import { useState } from "react";
import { exercises } from "@/data/exercises";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseModal from "@/components/ExerciseModal";
import { Exercise, ExerciseCategory, Difficulty } from "@/lib/types";

const categories: { value: ExerciseCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
  { value: "full-body", label: "Full Body" },
];

const difficulties: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function ExercisesPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    ExerciseCategory | "all"
  >("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  const filtered = exercises.filter((e) => {
    if (selectedCategory !== "all" && e.category !== selectedCategory)
      return false;
    if (selectedDifficulty !== "all" && e.difficulty !== selectedDifficulty)
      return false;
    return true;
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="text-3xl font-bold text-white mb-1">Exercise Library</h1>
      <p className="text-gray-400 mb-6">
        {exercises.length} bodyweight exercises
      </p>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.value
                ? "bg-brand-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Difficulty Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => setSelectedDifficulty(diff.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDifficulty === diff.value
                ? "bg-gray-600 text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-3">
        {filtered.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onClick={() => setSelectedExercise(exercise)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">
            No exercises match your filters. Try adjusting them.
          </p>
        </div>
      )}

      {/* Modal */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
