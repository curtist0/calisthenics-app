"use client";

import { Workout } from "@/lib/types";
import Link from "next/link";

interface WorkoutCardProps {
  workout: Workout;
}

const difficultyColors = {
  beginner: "from-green-500/20 to-green-600/10 border-green-500/30",
  intermediate: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
  advanced: "from-red-500/20 to-red-600/10 border-red-500/30",
};

const difficultyBadge = {
  beginner: "bg-green-500/20 text-green-400",
  intermediate: "bg-yellow-500/20 text-yellow-400",
  advanced: "bg-red-500/20 text-red-400",
};

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Link
      href={`/workouts/${workout.id}`}
      className={`block p-5 rounded-2xl bg-gradient-to-br ${
        difficultyColors[workout.difficulty]
      } border hover:scale-[1.02] transition-all`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-white text-lg">{workout.name}</h3>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            difficultyBadge[workout.difficulty]
          }`}
        >
          {workout.difficulty}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-4">{workout.description}</p>
      <div className="flex gap-4 text-sm text-gray-300">
        <span>⏱ {workout.estimatedMinutes} min</span>
        <span>💪 {workout.exercises.length} exercises</span>
        <span>
          🔄{" "}
          {workout.exercises.reduce((sum, e) => sum + e.sets, 0)} sets
        </span>
      </div>
    </Link>
  );
}
