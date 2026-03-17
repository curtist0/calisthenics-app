"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getExerciseById } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseModal from "@/components/ExerciseModal";
import Timer from "@/components/Timer";
import RestTimer from "@/components/RestTimer";
import { Exercise } from "@/lib/types";
import Link from "next/link";

export default function ActivePlanPage() {
  const router = useRouter();
  const {
    activePlan,
    activeWorkout,
    startDayWorkout,
    completeSet,
    finishWorkout,
    cancelWorkout,
  } = useWorkout();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [showRest, setShowRest] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  if (!activePlan) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-gray-300 font-semibold mb-2">No active plan</p>
        <p className="text-gray-500 text-sm mb-6">
          Generate a plan by selecting skills you want to master
        </p>
        <Link
          href="/workouts"
          className="inline-block px-6 py-3 bg-brand-500 text-white rounded-full font-semibold hover:bg-brand-600 transition-colors"
        >
          Build Your Plan
        </Link>
      </div>
    );
  }

  const activeDay = isActive ? activePlan.days[activeDayIndex] : null;
  const currentWorkoutExercise = activeDay?.exercises[currentExerciseIndex];
  const currentExercise = currentWorkoutExercise
    ? getExerciseById(currentWorkoutExercise.exerciseId)
    : null;

  const handleStartDay = (dayIndex: number) => {
    startDayWorkout(activePlan.id, dayIndex, activePlan);
    setActiveDayIndex(dayIndex);
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
    if (!activeDay) return;
    if (currentSetIndex < currentWorkoutExercise!.sets - 1) {
      setShowRest(true);
      setCurrentSetIndex((s) => s + 1);
    } else if (currentExerciseIndex < activeDay.exercises.length - 1) {
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

  // Active workout view
  if (
    isActive &&
    activeWorkout &&
    currentExercise &&
    currentWorkoutExercise &&
    activeDay
  ) {
    const totalSets = activeDay.exercises.reduce((s, e) => s + e.sets, 0);
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

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{activeDay.name}</span>
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

        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">{currentExercise.image}</span>
          <h2 className="text-2xl font-bold text-white mb-1">
            {currentExercise.name}
          </h2>
          <p className="text-gray-400">
            Set {currentSetIndex + 1} of {currentWorkoutExercise.sets}
          </p>
        </div>

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

  // Plan overview
  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <button
        onClick={() => router.push("/workouts")}
        className="text-gray-400 hover:text-white transition-colors mb-4 inline-block"
      >
        ← Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {activePlan.name}
        </h1>
        <p className="text-gray-400 text-sm mb-2">{activePlan.description}</p>
        <p className="text-brand-400 text-sm font-medium">
          Goal: {activePlan.goal}
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {activePlan.days.map((day, index) => (
          <div
            key={index}
            className={`rounded-xl border transition-all ${
              day.isRest
                ? "bg-gray-800/30 border-gray-700/30 p-4"
                : selectedDay === index
                ? "bg-gray-800 border-brand-500/50 p-4"
                : "bg-gray-800/50 border-gray-700/50 p-4 hover:bg-gray-800/70 cursor-pointer"
            }`}
            onClick={() =>
              !day.isRest &&
              setSelectedDay(selectedDay === index ? null : index)
            }
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono w-8">
                    {day.day.slice(0, 3)}
                  </span>
                  <span
                    className={`font-semibold ${
                      day.isRest ? "text-gray-500" : "text-white"
                    }`}
                  >
                    {day.name}
                  </span>
                </div>
                {day.focus && !day.isRest && (
                  <p className="text-xs text-gray-400 mt-1 ml-10">
                    {day.focus}
                  </p>
                )}
              </div>
              {!day.isRest && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {day.exercises.length} exercises
                  </span>
                  <span className="text-gray-500">
                    {selectedDay === index ? "▲" : "▼"}
                  </span>
                </div>
              )}
              {day.isRest && (
                <span className="text-xs text-gray-500">😴</span>
              )}
            </div>

            {selectedDay === index && !day.isRest && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="space-y-2 mb-4">
                  {day.exercises.map((we, exIndex) => {
                    const exercise = getExerciseById(we.exerciseId);
                    if (!exercise) return null;
                    return (
                      <div
                        key={`${we.exerciseId}-${exIndex}`}
                        className="flex items-center gap-3"
                      >
                        <span className="text-gray-500 font-mono text-xs w-5">
                          {exIndex + 1}.
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExercise(exercise);
                          }}
                          className="flex-1"
                        >
                          <ExerciseCard exercise={exercise} compact />
                        </button>
                        <div className="text-right text-sm text-gray-400 flex-shrink-0">
                          <p className="text-white font-semibold">
                            {we.sets} ×{" "}
                            {we.holdSeconds ? `${we.holdSeconds}s` : we.reps}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartDay(index);
                  }}
                  className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors"
                >
                  Start {day.name} 🚀
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
