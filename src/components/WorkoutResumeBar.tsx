"use client";

import Link from "next/link";
import { useWorkout } from "@/context/WorkoutContext";

function getTodayWeekdayIndex(): number {
  return new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
}

export default function WorkoutResumeBar() {
  const { activeWorkout, workoutSessionUI, setWorkoutSessionUI } = useWorkout();
  const todayIndex = getTodayWeekdayIndex();

  if (!activeWorkout || !workoutSessionUI?.isPaused) return null;
  if (workoutSessionUI.planId !== activeWorkout.planId) return null;
  if (workoutSessionUI.dayIndex !== activeWorkout.dayIndex) return null;
  if (workoutSessionUI.dayIndex !== todayIndex) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <Link
          href={`/workouts/plan?id=${workoutSessionUI.planId}`}
          onClick={() => setWorkoutSessionUI({ ...workoutSessionUI, isPaused: false })}
          className="flex items-center justify-between gap-3 w-full py-3 px-4 rounded-2xl bg-brand-600 text-white font-bold shadow-lg border border-brand-400/30 hover:bg-brand-500 transition-colors"
        >
          <span className="text-lg">▶</span>
          <span className="flex-1 text-center text-sm">Resume today&apos;s workout</span>
          <span className="text-xs opacity-90">Paused</span>
        </Link>
      </div>
    </div>
  );
}
