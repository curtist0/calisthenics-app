"use client";

import { useWorkout } from "@/context/WorkoutContext";
import { getExerciseById } from "@/data/exercises";
import Link from "next/link";

export default function Home() {
  const { stats, recentPRs, savedPlans } = useWorkout();
  const activePlan = savedPlans.length > 0 ? savedPlans[0] : null;

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">CaliTrack</h1>
        <p className="text-gray-400">Your calisthenics companion</p>
      </div>

      {/* Simplified Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 text-center">
          <p className="text-2xl font-bold text-brand-400">{stats.totalWorkouts}</p>
          <p className="text-xs text-gray-400 mt-1">Workouts</p>
        </div>
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 text-center">
          <p className="text-2xl font-bold text-orange-400">{stats.currentStreak}</p>
          <p className="text-xs text-gray-400 mt-1">Streak 🔥</p>
        </div>
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 text-center">
          <p className="text-2xl font-bold text-purple-400">{recentPRs.length}</p>
          <p className="text-xs text-gray-400 mt-1">Records</p>
        </div>
      </div>

      {/* Quick Action */}
      {activePlan ? (
        <Link href={`/workouts/plan?id=${activePlan.id}`} className="block mb-8 bg-gradient-to-br from-brand-500/20 to-brand-600/10 rounded-2xl p-5 border border-brand-500/30 hover:scale-[1.02] transition-all">
          <p className="text-xs text-brand-400 font-medium mb-1">CURRENT PLAN</p>
          <h2 className="font-bold text-white text-lg mb-1">{activePlan.name}</h2>
          <p className="text-gray-400 text-sm mb-2">{activePlan.goal}</p>
          <p className="text-brand-400 text-sm font-medium">Continue training →</p>
        </Link>
      ) : (
        <Link href="/workouts" className="block mb-8 bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:bg-gray-800/70 transition-colors text-center">
          <p className="text-4xl mb-2">🎯</p>
          <p className="text-white font-semibold">Create Your First Plan</p>
          <p className="text-gray-400 text-sm mt-1">Pick skills and generate a progression-based program</p>
        </Link>
      )}

      {/* Recent PRs */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Recent Records 🏆</h2>
          {recentPRs.length > 0 && <Link href="/progress" className="text-brand-400 text-sm font-medium">View all →</Link>}
        </div>

        {recentPRs.length === 0 ? (
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 text-center">
            <p className="text-gray-500 text-sm">Complete workouts to set personal records</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPRs.slice(0, 5).map((pr, i) => {
              const ex = getExerciseById(pr.exerciseId);
              if (!ex) return null;
              const improved = pr.previousValue !== null ? pr.value - pr.previousValue : null;
              return (
                <div key={`${pr.exerciseId}-${pr.type}-${i}`} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ex.image}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{ex.name}</p>
                      <p className="text-xs text-gray-400">{new Date(pr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {pr.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-400">{pr.value}{pr.type === "hold" ? "s" : pr.type === "weight" ? "kg" : ""}</p>
                    {improved !== null && improved > 0 && <p className="text-xs text-green-400">+{improved}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
