"use client";

import { Exercise } from "@/lib/types";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  compact?: boolean;
}

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400",
  intermediate: "bg-yellow-500/20 text-yellow-400",
  advanced: "bg-red-500/20 text-red-400",
};

const categoryColors = {
  push: "bg-blue-500/20 text-blue-400",
  pull: "bg-purple-500/20 text-purple-400",
  legs: "bg-orange-500/20 text-orange-400",
  core: "bg-pink-500/20 text-pink-400",
  "full-body": "bg-teal-500/20 text-teal-400",
};

export default function ExerciseCard({
  exercise,
  onClick,
  compact,
}: ExerciseCardProps) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 w-full p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors text-left"
      >
        <span className="text-2xl">{exercise.image}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">
            {exercise.name}
          </h3>
          <div className="flex gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                categoryColors[exercise.category]
              }`}
            >
              {exercise.category}
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="block w-full p-4 bg-gray-800/50 rounded-2xl hover:bg-gray-800 transition-all hover:scale-[1.02] text-left border border-gray-700/50"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0 bg-gray-700/50 w-14 h-14 rounded-xl flex items-center justify-center">
          {exercise.image}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg">{exercise.name}</h3>
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
            {exercise.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                difficultyColors[exercise.difficulty]
              }`}
            >
              {exercise.difficulty}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                categoryColors[exercise.category]
              }`}
            >
              {exercise.category}
            </span>
            {exercise.isHold && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-cyan-500/20 text-cyan-400">
                hold
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
