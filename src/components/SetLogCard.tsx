"use client";

import { useState } from "react";
import { getExerciseById } from "@/data/exercises";
import { WorkoutExercise } from "@/lib/types";

interface SetLogCardProps {
  exerciseIndex: number;
  setIndex: number;
  workoutExercise: WorkoutExercise;
  setData: {
    reps: number | null;
    holdSeconds: number | null;
    weightKg: number | null;
    completed: boolean;
  } | undefined;
  exercise: ReturnType<typeof getExerciseById>;
  onLogSet: (exerciseIndex: number, setIndex: number, reps: number | null, hold: number | null, weight: number | null) => void;
  onUndoSet: (exerciseIndex: number, setIndex: number) => void;
}

export default function SetLogCard({
  exerciseIndex,
  setIndex,
  workoutExercise,
  setData,
  exercise,
  onLogSet,
  onUndoSet,
}: SetLogCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [repsInput, setRepsInput] = useState(setData?.reps?.toString() || workoutExercise.reps?.toString() || "");
  const [holdInput, setHoldInput] = useState(setData?.holdSeconds?.toString() || workoutExercise.holdSeconds?.toString() || "");
  const [weightInput, setWeightInput] = useState(setData?.weightKg?.toString() || "");

  const isLogged = setData?.completed;
  const isHold = exercise?.isHold || workoutExercise.holdSeconds;

  const handleLogSet = () => {
    const reps = isHold ? null : (repsInput ? parseInt(repsInput) : workoutExercise.reps);
    const hold = isHold ? (holdInput ? parseInt(holdInput) : workoutExercise.holdSeconds) : null;
    const weight = exercise?.supportsWeight && weightInput ? parseFloat(weightInput) : null;
    onLogSet(exerciseIndex, setIndex, reps, hold, weight);
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-xl p-3 transition-all ${isLogged ? "bg-green-500/10 border border-green-500/30" : "bg-gray-800/50 border border-gray-700/50"}`}
    >
      {isEditing ? (
        <div className="space-y-2">
          {isHold ? (
            <input
              type="number"
              value={holdInput}
              onChange={(e) => setHoldInput(e.target.value)}
              placeholder={workoutExercise.holdSeconds?.toString()}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center font-mono text-sm focus:border-brand-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <input
              type="number"
              value={repsInput}
              onChange={(e) => setRepsInput(e.target.value)}
              placeholder={workoutExercise.reps?.toString()}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center font-mono text-sm focus:border-brand-500 focus:outline-none"
              autoFocus
            />
          )}
          {exercise?.supportsWeight && !isHold && (
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Weight (kg)"
              step="0.5"
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center font-mono text-xs focus:border-brand-500 focus:outline-none"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleLogSet}
              className="flex-1 py-2 bg-brand-500 text-white rounded-lg text-xs font-semibold hover:bg-brand-600"
            >
              ✓ Log
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Set {setIndex + 1}</p>
            {isLogged ? (
              <p className="text-xs text-green-400 mt-1">
                ✓ {isHold ? `${setData?.holdSeconds}s` : `${setData?.reps} reps`}
                {setData?.weightKg ? ` + ${setData.weightKg}kg` : ""}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Target: {isHold ? `${workoutExercise.holdSeconds}s` : `${workoutExercise.reps} reps`}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 bg-brand-500/20 text-brand-400 rounded-lg text-xs font-semibold hover:bg-brand-500/30"
          >
            {isLogged ? "Edit" : "Log"}
          </button>
          {isLogged && (
            <button
              onClick={() => onUndoSet(exerciseIndex, setIndex)}
              className="w-5 h-5 rounded-lg text-red-400 hover:text-red-300 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
