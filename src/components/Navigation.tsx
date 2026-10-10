"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WorkoutIcon, { WorkoutIconName } from "./WorkoutIcon";
import { useWorkout } from "@/context/WorkoutContext";

const navItems: { href: string; label: string; icon: WorkoutIconName }[] = [
  { href: "/", label: "Home", icon: "heart" },
  { href: "/exercises", label: "Library", icon: "target" },
  { href: "/workouts", label: "Workouts", icon: "dumbbell" },
  { href: "/progress", label: "Progress", icon: "calendar" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { activeWorkout, workoutSessionUI } = useWorkout();
  if (pathname === "/onboarding" || pathname === "/yoga-setup") return null;
  if (pathname === "/workouts/plan" && activeWorkout && workoutSessionUI?.isPaused !== true) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto px-3 pb-2">
        <div className="glass rounded-2xl flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex min-h-11 min-w-16 flex-col items-center justify-center rounded-xl px-3 py-2 text-xs transition-all duration-200 ${
                  isActive ? "text-brand-400 bg-brand-500/10 scale-105" : "text-gray-400 hover:text-gray-200"
                }`}>
                <WorkoutIcon name={item.icon} className="mb-0.5 h-5 w-5" />
                <span className="font-semibold text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
