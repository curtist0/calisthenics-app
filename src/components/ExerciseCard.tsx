"use client";

import { Exercise } from "@/lib/types";
import ExerciseIllustration from "./ExerciseIllustration";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  compact?: boolean;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/15 text-green-400",
  intermediate: "bg-yellow-500/15 text-yellow-400",
  advanced: "bg-red-500/15 text-red-400",
  elite: "bg-fuchsia-500/15 text-fuchsia-400",
};

const categoryColors: Record<string, string> = {
  push: "bg-blue-500/15 text-blue-400",
  pull: "bg-purple-500/15 text-purple-400",
  legs: "bg-orange-500/15 text-orange-400",
  core: "bg-pink-500/15 text-pink-400",
  "full-body": "bg-teal-500/15 text-teal-400",
  skill: "bg-amber-500/15 text-amber-400",
};

export default function ExerciseCard({ exercise, onClick, compact }: ExerciseCardProps) {
  if (compact) {
    return (
      <button onClick={onClick} className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-800/50 transition-colors text-left">
        <span className="text-xl">{exercise.image}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm truncate">{exercise.name}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${categoryColors[exercise.category]}`}>{exercise.category}</span>
        </div>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="block w-full glass rounded-2xl p-4 hover:scale-[1.02] transition-all duration-200 text-left group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <ExerciseIllustration exerciseId={exercise.id} size={80} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-white text-base group-hover:text-brand-300 transition-colors">{exercise.name}</h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{exercise.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${difficultyColors[exercise.difficulty]}`}>{exercise.difficulty}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${categoryColors[exercise.category]}`}>{exercise.category}</span>
            {exercise.isHold && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/15 text-cyan-400">hold</span>}
            {exercise.supportsWeight && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/15 text-blue-400">+weight</span>}
          </div>
        </div>
      </div>
    </button>
  );
}
