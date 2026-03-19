"use client";

import { WeeklyPlan } from "@/lib/types";
import Link from "next/link";

interface WorkoutCardProps {
  plan: WeeklyPlan;
}

const difficultyColors = {
  beginner: "from-green-500/20 to-green-600/10 border-green-500/30",
  intermediate: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
  advanced: "from-red-500/20 to-red-600/10 border-red-500/30",
  elite: "from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30",
};

const difficultyBadge = {
  beginner: "bg-green-500/20 text-green-400",
  intermediate: "bg-yellow-500/20 text-yellow-400",
  advanced: "bg-red-500/20 text-red-400",
  elite: "bg-fuchsia-500/20 text-fuchsia-400",
};

export default function WorkoutCard({ plan }: WorkoutCardProps) {
  const trainingDays = plan.days.filter((d) => !d.isRest).length;
  const restDays = plan.days.filter((d) => d.isRest).length;

  return (
    <Link
      href={`/workouts/${plan.id}`}
      className={`block p-5 rounded-2xl bg-gradient-to-br ${
        difficultyColors[plan.difficulty]
      } border hover:scale-[1.02] transition-all`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-white text-lg">{plan.name}</h3>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            difficultyBadge[plan.difficulty]
          }`}
        >
          {plan.difficulty}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-1">{plan.description}</p>
      <p className="text-xs text-brand-400 font-medium mb-3">
        Goal: {plan.goal}
      </p>
      <div className="flex gap-4 text-sm text-gray-300">
        <span>📅 {trainingDays} days/wk</span>
        <span>😴 {restDays} rest</span>
        <span>⏱ ~{plan.estimatedWeeklyMinutes} min/wk</span>
      </div>
    </Link>
  );
}
