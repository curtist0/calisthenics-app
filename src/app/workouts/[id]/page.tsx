"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import { getExerciseById } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseModal from "@/components/ExerciseModal";
import Timer from "@/components/Timer";
import RestTimer from "@/components/RestTimer";
import { Exercise } from "@/lib/types";

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeWorkout, startWorkout, completeSet, finishWorkout, cancelWorkout } =
    useWorkout();

  const workout = getWorkoutById(params.id as string);
  const [isActive, setIsActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [showRest, setShowRest] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  if (!workout) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center">
        <p className="text-gray-400">Workout not found</p>
        <button
          onClick={() => router.push("/workouts")}
          className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-full"
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  const currentWorkoutExercise = workout.exercises[currentExerciseIndex];
  const currentExercise = currentWorkoutExercise
    ? getExerciseById(currentWorkoutExercise.exerciseId)
    : null;

  const handleStart = () => {
    startWorkout(workout.id);
    setIsActive(true);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
  };

  const handleCompleteReps = () => {
    if (!currentWorkoutExercise) return;
    completeSet(
      currentExerciseIndex,
      currentSetIndex,
      currentWorkoutExercise.reps,
      null
    );
    advanceToNext();
  };

  const handleCompleteHold = (actualSeconds: number) => {
    completeSet(currentExerciseIndex, currentSetIndex, null, actualSeconds);
    advanceToNext();
  };

  const advanceToNext = () => {
    if (currentSetIndex < currentWorkoutExercise.sets - 1) {
      setShowRest(true);
      setCurrentSetIndex((s) => s + 1);
    } else if (currentExerciseIndex < workout.exercises.length - 1) {
      setShowRest(true);
      setCurrentExerciseIndex((e) => e + 1);
      setCurrentSetIndex(0);
    } else {
      finishWorkout();
      setIsActive(false);
      router.push("/progress");
    }
  };

  const handleCancel = () => {
    cancelWorkout();
    setIsActive(false);
  };

  if (isActive && activeWorkout && currentExercise && currentWorkoutExercise) {
    const totalSets = workout.exercises.reduce((s, e) => s + e.sets, 0);
    const completedSets = activeWorkout.exercises.reduce(
      (s, e) => s + e.sets.filter((set) => set.completed).length,
      0
    );

    return (
      <div className="max-w-lg mx-auto px-4 pt-8">
        {showRest && (
          <RestTimer
            seconds={currentWorkoutExercise.restSeconds}
            onComplete={() => setShowRest(false)}
          />
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{workout.name}</span>
            <span>
              {completedSets}/{totalSets} sets
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedSets / totalSets) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Exercise */}
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">{currentExercise.image}</span>
          <h2 className="text-2xl font-bold text-white mb-1">
            {currentExercise.name}
          </h2>
          <p className="text-gray-400">
            Set {currentSetIndex + 1} of {currentWorkoutExercise.sets}
          </p>
        </div>

        {/* Action */}
        {currentExercise.isHold && currentWorkoutExercise.holdSeconds ? (
          <div className="flex flex-col items-center">
            <Timer
              targetSeconds={currentWorkoutExercise.holdSeconds}
              onComplete={handleCompleteHold}
              label={`Hold for ${currentWorkoutExercise.holdSeconds}s`}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 text-center w-full">
              <p className="text-5xl font-bold text-white mb-2">
                {currentWorkoutExercise.reps}
              </p>
              <p className="text-gray-400">reps</p>
            </div>
            <button
              onClick={handleCompleteReps}
              className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 transition-colors"
            >
              Complete Set ✓
            </button>
          </div>
        )}

        <button
          onClick={handleCancel}
          className="w-full mt-4 py-3 bg-gray-800 text-gray-400 rounded-2xl font-medium hover:bg-gray-700 transition-colors"
        >
          Cancel Workout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      {/* Header */}
      <button
        onClick={() => router.push("/workouts")}
        className="text-gray-400 hover:text-white transition-colors mb-4 inline-block"
      >
        ← Back to Workouts
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{workout.name}</h1>
        <p className="text-gray-400 mb-4">{workout.description}</p>
        <div className="flex gap-4 text-sm text-gray-300">
          <span>⏱ {workout.estimatedMinutes} min</span>
          <span>💪 {workout.exercises.length} exercises</span>
          <span className="capitalize">📊 {workout.difficulty}</span>
        </div>
      </div>

      {/* Exercise List */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Exercises</h2>
        <div className="space-y-3">
          {workout.exercises.map((we, index) => {
            const exercise = getExerciseById(we.exerciseId);
            if (!exercise) return null;
            return (
              <div
                key={`${we.exerciseId}-${index}`}
                className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
              >
                <span className="text-gray-500 font-mono text-sm w-6">
                  {index + 1}.
                </span>
                <button
                  onClick={() => setSelectedExercise(exercise)}
                  className="flex-1 text-left"
                >
                  <ExerciseCard exercise={exercise} compact />
                </button>
                <div className="text-right text-sm text-gray-400 flex-shrink-0">
                  <p className="text-white font-semibold">
                    {we.sets} × {we.holdSeconds ? `${we.holdSeconds}s` : we.reps}
                  </p>
                  <p className="text-xs">Rest {we.restSeconds}s</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 transition-colors mb-4"
      >
        Start Workout 🚀
      </button>

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
