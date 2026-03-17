"use client";

import { Exercise } from "@/lib/types";

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export default function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl bg-gray-800 w-16 h-16 rounded-2xl flex items-center justify-center">
              {exercise.image}
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">{exercise.name}</h2>
              <p className="text-sm text-gray-400 capitalize">
                {exercise.category} · {exercise.difficulty}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-300 mb-6">{exercise.description}</p>

        <div className="mb-6">
          <h3 className="font-semibold text-white mb-3">Muscles Targeted</h3>
          <div className="flex flex-wrap gap-2">
            {exercise.muscles.map((muscle) => (
              <span
                key={muscle}
                className="bg-brand-500/20 text-brand-400 text-xs px-3 py-1.5 rounded-full font-medium capitalize"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-3">Instructions</h3>
          <ol className="space-y-3">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-gray-300 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
