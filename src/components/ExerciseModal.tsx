"use client";

import { Exercise } from "@/lib/types";
import ExerciseIllustration from "./ExerciseIllustration";
import { getExerciseById } from "@/data/exercises";

interface ExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export default function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const progressionFrom = exercise.progressionFrom ? getExerciseById(exercise.progressionFrom) : null;
  const progressionTo = exercise.progressionTo ? getExerciseById(exercise.progressionTo) : null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-gray-900 rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white">{exercise.name}</h2>
            <p className="text-sm text-gray-400 capitalize">{exercise.category} · {exercise.difficulty}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {/* Animated Illustration — tap to play */}
        <div className="flex justify-center mb-2">
          <ExerciseIllustration exerciseId={exercise.id} size={200} animated />
        </div>
        <p className="text-center text-xs text-gray-500 mb-5">Tap illustration to see the movement</p>

        <p className="text-gray-300 mb-5">{exercise.description}</p>

        {exercise.supportsWeight && (
          <div className="flex items-center gap-2 mb-5 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
            <span className="text-lg">🏋️</span>
            <p className="text-blue-400 text-sm font-medium">Supports added weight for progressive overload</p>
          </div>
        )}

        <div className="mb-5">
          <h3 className="font-semibold text-white mb-3">Muscles Targeted</h3>
          <div className="flex flex-wrap gap-2">
            {exercise.muscles.map((m) => (
              <span key={m} className="bg-brand-500/20 text-brand-400 text-xs px-3 py-1.5 rounded-full font-medium capitalize">{m}</span>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <h3 className="font-semibold text-white mb-3">Instructions</h3>
          <ol className="space-y-3">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                <span className="text-gray-300 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {(progressionFrom || progressionTo) && (
          <div>
            <h3 className="font-semibold text-white mb-3">Progression Path</h3>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              {progressionFrom && (<><span className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-full">{progressionFrom.name}</span><span className="text-gray-500">→</span></>)}
              <span className="bg-brand-500/20 text-brand-400 px-3 py-1.5 rounded-full font-medium">{exercise.name}</span>
              {progressionTo && (<><span className="text-gray-500">→</span><span className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-full">{progressionTo.name}</span></>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
