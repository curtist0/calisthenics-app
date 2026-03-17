"use client";

import { useState } from "react";
import { workouts } from "@/data/workouts";
import WorkoutCard from "@/components/WorkoutCard";
import { Difficulty } from "@/lib/types";

const difficulties: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function WorkoutsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "all"
  >("all");

  const filtered = workouts.filter((w) => {
    if (selectedDifficulty !== "all" && w.difficulty !== selectedDifficulty)
      return false;
    return true;
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="text-3xl font-bold text-white mb-1">Workouts</h1>
      <p className="text-gray-400 mb-6">
        {workouts.length} training programs
      </p>

      {/* Difficulty Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => setSelectedDifficulty(diff.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDifficulty === diff.value
                ? "bg-brand-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {diff.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">
            No workouts match your filter.
          </p>
        </div>
      )}
    </div>
  );
}
