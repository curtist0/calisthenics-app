"use client";

import { useState } from "react";
import { Exercise } from "@/lib/types";
import { getExerciseById } from "@/data/exercises";
import ExerciseAnimation from "./ExerciseAnimation";

interface FollowAlongCarouselProps {
  exercises: Array<{ exerciseId: string; sets: number; reps: number | null; holdSeconds: number | null }>;
  onExerciseComplete: (exerciseIndex: number, setIndex: number) => void;
  onPause: () => void;
  currentExerciseIndex: number;
  currentSetIndex: number;
}

export default function FollowAlongCarousel({
  exercises,
  onExerciseComplete,
  onPause,
  currentExerciseIndex,
  currentSetIndex,
}: FollowAlongCarouselProps) {
  const [controlInput, setControlInput] = useState("");

  const currentEx = exercises[currentExerciseIndex];
  const exercise = currentEx ? getExerciseById(currentEx.exerciseId) : null;
  const totalExercises = exercises.length;
  const totalSets = currentEx ? currentEx.sets : 1;

  if (!currentEx || !exercise) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center">
        <p className="text-white/60">Exercise not found</p>
      </div>
    );
  }

  const handleSkipSet = () => {
    onExerciseComplete(currentExerciseIndex, currentSetIndex);
  };

  const handleFinishExercise = () => {
    // Skip to last set
    for (let i = currentSetIndex; i < totalSets; i++) {
      if (i === totalSets - 1) {
        onExerciseComplete(currentExerciseIndex, i);
        break;
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24 flex flex-col h-screen">
      {/* Progress Header */}
      <div className="mb-8">
        <p className="text-xs text-white/60 uppercase tracking-widest mb-2">
          Exercise {currentExerciseIndex + 1} of {totalExercises} • Set {currentSetIndex + 1} of {totalSets}
        </p>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
            style={{
              width: `${
                ((currentExerciseIndex + (currentSetIndex + 1) / totalSets) / totalExercises) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Exercise Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Exercise Name */}
        <h1 className="text-4xl font-extrabold text-white mb-6 text-center">{exercise.name}</h1>

        {/* Exercise Animation/Icon */}
        <div className="mb-8 flex justify-center">
          <ExerciseAnimation exerciseId={exercise.id} size={120} />
        </div>

        {/* Rep/Hold Info */}
        <div className="glass-card rounded-2xl p-6 mb-8 text-center w-full">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Target</p>
          <p className="text-5xl font-black text-emerald-400 mb-3">
            {currentEx.holdSeconds ? `${currentEx.holdSeconds}s` : `${currentEx.reps} reps`}
          </p>
          <p className="text-sm text-white/70">
            {currentEx.holdSeconds ? "Hold this position" : `Perform this many reps`}
          </p>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-4 w-full mb-8">
          <h3 className="font-bold text-white mb-3 text-sm">How to perform:</h3>
          <ul className="space-y-2">
            {exercise.instructions.slice(0, 3).map((instruction, idx) => (
              <li key={idx} className="flex gap-3 text-xs">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  {idx + 1}
                </span>
                <span className="text-white/80">{instruction}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-slate-950/95 border-t border-white/10 space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleSkipSet}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors"
          >
            ✓ Set Complete
          </button>
          <button
            onClick={onPause}
            className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold transition-colors border border-white/20"
          >
            ⏸ Pause
          </button>
        </div>

        <button
          onClick={handleFinishExercise}
          className="w-full py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm font-medium transition-colors"
        >
          Skip to Next Exercise
        </button>
      </div>
    </div>
  );
}
