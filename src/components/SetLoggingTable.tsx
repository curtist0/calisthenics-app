"use client";

import { useState } from "react";
import { WorkoutExercise, CompletedExercise, Exercise } from "@/lib/types";
import { getExerciseById } from "@/data/exercises";
import ExerciseAnimation from "./ExerciseAnimation";

interface SetLoggingTableProps {
  workoutExercise: WorkoutExercise;
  completedExercise: CompletedExercise | undefined;
  exerciseIndex: number;
  onLogSet: (setIndex: number, reps: number | null, holdSeconds: number | null, weight: number | null) => void;
  onSkipSet: (setIndex: number) => void;
}

export default function SetLoggingTable({
  workoutExercise,
  completedExercise,
  exerciseIndex,
  onLogSet,
  onSkipSet,
}: SetLoggingTableProps) {
  const exercise = getExerciseById(workoutExercise.exerciseId);
  const [editingSet, setEditingSet] = useState<number | null>(null);
  const [repsInput, setRepsInput] = useState<string>("");
  const [holdInput, setHoldInput] = useState<string>("");
  const [weightInput, setWeightInput] = useState<string>("");

  const isHold = exercise?.isHold || workoutExercise.holdSeconds;

  const completedSets = completedExercise?.sets || [];

  const handleStartEdit = (setIndex: number) => {
    setEditingSet(setIndex);
    const completed = completedSets[setIndex];
    if (completed) {
      setRepsInput(completed.reps ? completed.reps.toString() : "");
      setHoldInput(completed.holdSeconds ? completed.holdSeconds.toString() : "");
      setWeightInput(completed.weightKg ? completed.weightKg.toString() : "");
    } else {
      setRepsInput(workoutExercise.reps?.toString() || "");
      setHoldInput(workoutExercise.holdSeconds?.toString() || "");
      setWeightInput("");
    }
  };

  const handleSaveSet = (setIndex: number) => {
    const reps = isHold ? null : (repsInput ? parseInt(repsInput) : workoutExercise.reps);
    const holdSeconds = isHold ? (holdInput ? parseInt(holdInput) : workoutExercise.holdSeconds) : null;
    const weight = exercise?.supportsWeight && weightInput ? parseFloat(weightInput) : null;

    onLogSet(setIndex, reps, holdSeconds, weight);
    setEditingSet(null);
  };

  return (
    <div className="space-y-4">
      {/* Exercise Info */}
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-4">
          {exercise && <ExerciseAnimation exerciseId={exercise.id} size={60} />}
          <div>
            <h3 className="text-white font-bold">{exercise?.name || "Exercise"}</h3>
            {workoutExercise.progressionLevel && (
              <p className="text-brand-400 text-xs mt-1">{workoutExercise.progressionLevel}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              {workoutExercise.sets} sets × {isHold ? `${workoutExercise.holdSeconds}s` : `${workoutExercise.reps} reps`}
            </p>
          </div>
        </div>
      </div>

      {/* Set Logging Table */}
      <div className="space-y-2">
        <p className="text-gray-400 text-sm font-medium">Log each set</p>
        {Array.from({ length: workoutExercise.sets }).map((_, setIndex) => {
          const completed = completedSets[setIndex];
          const isLogged = completed?.completed;
          const isEditing = editingSet === setIndex;

          return (
            <div key={setIndex} className={`rounded-xl p-3 transition-all ${isLogged ? "bg-green-500/10 border border-green-500/30" : "bg-gray-800/50 border border-gray-700/50"}`}>
              {isEditing ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-400">Set {setIndex + 1}</span>
                  </div>

                  {isHold ? (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Hold Time (seconds)</label>
                      <input
                        type="number"
                        value={holdInput}
                        onChange={(e) => setHoldInput(e.target.value)}
                        placeholder={workoutExercise.holdSeconds?.toString()}
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center font-mono text-sm focus:border-brand-500 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Reps Completed</label>
                      <input
                        type="number"
                        value={repsInput}
                        onChange={(e) => setRepsInput(e.target.value)}
                        placeholder={workoutExercise.reps?.toString()}
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center font-mono text-sm focus:border-brand-500 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  )}

                  {exercise?.supportsWeight && !isHold && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Weight Added (kg)</label>
                      <input
                        type="number"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        placeholder="0"
                        step="0.5"
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center font-mono text-sm focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveSet(setIndex)}
                      className="flex-1 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600"
                    >
                      ✓ Log Set
                    </button>
                    <button
                      onClick={() => setEditingSet(null)}
                      className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Set {setIndex + 1}</p>
                    {isLogged ? (
                      <p className="text-xs text-green-400 mt-1">
                        ✓ {isHold ? `${completed.holdSeconds}s held` : `${completed.reps} reps`}
                        {completed.weightKg && ` + ${completed.weightKg}kg`}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">
                        Target: {isHold ? `${workoutExercise.holdSeconds}s` : `${workoutExercise.reps} reps`}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStartEdit(setIndex)}
                      className="px-3 py-2 bg-brand-500/20 text-brand-400 rounded-lg text-xs font-semibold hover:bg-brand-500/30 transition-colors"
                    >
                      {isLogged ? "Edit" : "Log"}
                    </button>
                    {isLogged && (
                      <button
                        onClick={() => onSkipSet(setIndex)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition-colors"
                      >
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="glass rounded-xl p-3 mt-4">
        <p className="text-gray-400 text-xs">
          Progress: {completedSets.filter((s) => s.completed).length}/{workoutExercise.sets} sets logged
        </p>
      </div>
    </div>
  );
}
