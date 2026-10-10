"use client";

import Link from "next/link";
import { useWorkout } from "@/context/WorkoutContext";
import { usePathname } from "next/navigation";
import WorkoutIcon from "./WorkoutIcon";

export default function WorkoutResumeBar() {
  const { activeWorkout, workoutSessionUI, setWorkoutSessionUI } = useWorkout();
  const pathname = usePathname();
  const dayIndex = workoutSessionUI?.dayIndex ?? activeWorkout?.dayIndex;
  const isPaused = workoutSessionUI?.isPaused ?? true;

  if (!activeWorkout || dayIndex === undefined) return null;
  if (workoutSessionUI && (workoutSessionUI.planId !== activeWorkout.planId || dayIndex !== activeWorkout.dayIndex)) return null;
  if (pathname === "/workouts/plan" && !isPaused) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <Link
          href={`/workouts/plan?id=${activeWorkout.planId}&day=${dayIndex}`}
          onClick={() => {
            if (workoutSessionUI) setWorkoutSessionUI({ ...workoutSessionUI, isPaused: false });
          }}
          className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-brand-400/30 bg-brand-600 px-4 py-3 font-bold text-white shadow-lg transition-colors hover:bg-brand-500"
        >
          <WorkoutIcon name="play" className="h-5 w-5" />
          <span className="flex-1 text-center text-sm">Resume saved workout</span>
          <span className="text-xs opacity-90">{isPaused ? "Paused" : "In progress"}</span>
        </Link>
      </div>
    </div>
  );
}
