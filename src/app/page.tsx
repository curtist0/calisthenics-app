"use client";

import { useWorkout } from "@/context/WorkoutContext";
import { getExerciseById } from "@/data/exercises";
import Link from "next/link";

const quotes = [
  "The body achieves what the mind believes.",
  "Strength doesn't come from what you can do — it comes from overcoming what you once thought you couldn't.",
  "Every rep counts. Every hold matters. Every day you show up, you're building something extraordinary.",
  "Calisthenics isn't just training — it's mastering your own body.",
  "The only bad workout is the one that didn't happen.",
  "Your body is the ultimate gym. No excuses.",
  "Discipline is choosing between what you want now and what you want most.",
];

export default function Home() {
  const { stats, recentPRs, savedPlans } = useWorkout();
  const activePlan = savedPlans.length > 0 ? savedPlans[0] : null;
  const quote = quotes[new Date().getDay() % quotes.length];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-brand-600/30 via-brand-800/20 to-gray-900 border border-brand-500/20 animate-pulse-glow">
        <div className="absolute inset-0 shimmer-bg" />
        <div className="relative p-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-2xl shadow-lg shadow-brand-500/25">
              💪
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">CaliTrack</h1>
              <p className="text-brand-300 text-xs font-medium">Master your bodyweight</p>
            </div>
          </div>
          <p className="text-gray-300/90 text-sm italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="glass rounded-2xl p-4 text-center animate-count-up">
          <p className="text-3xl font-black text-brand-400">{stats.totalWorkouts}</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Workouts</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center animate-count-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-3xl font-black text-orange-400">{stats.currentStreak}</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Streak 🔥</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center animate-count-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-3xl font-black text-purple-400">{recentPRs.length}</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Records</p>
        </div>
      </div>

      {/* Quick Action Card */}
      {activePlan ? (
        <Link href={`/workouts/plan?id=${activePlan.id}`} className="block mb-8 group">
          <div className="relative rounded-2xl overflow-hidden glass hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-transparent to-brand-500/5" />
            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-brand-500/20 text-brand-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Active Plan</span>
              </div>
              <h2 className="font-extrabold text-white text-xl mb-1">{activePlan.name}</h2>
              <p className="text-gray-400 text-sm">{activePlan.goal}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-brand-400 text-sm font-bold group-hover:translate-x-1 transition-transform">Start today&apos;s workout</span>
                <span className="text-brand-400 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <Link href="/workouts" className="block mb-8 group">
          <div className="relative rounded-2xl overflow-hidden glass hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-purple-500/10" />
            <div className="relative p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center text-3xl animate-float">🎯</div>
              <p className="text-white font-extrabold text-lg mb-1">Build Your First Plan</p>
              <p className="text-gray-400 text-sm">Pick skills → get a progression-based 7-day program</p>
            </div>
          </div>
        </Link>
      )}

      {/* Motivation Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 glass">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-purple-500/10" />
        <div className="relative p-5 flex items-center gap-4">
          <div className="text-4xl animate-float" style={{ animationDelay: "0.5s" }}>🔥</div>
          <div>
            <p className="text-white font-bold text-sm">
              {stats.currentStreak > 0
                ? `${stats.currentStreak} day streak! Keep the momentum!`
                : "Start your streak today!"}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {stats.totalWorkouts === 0
                ? "Your calisthenics journey begins with one workout"
                : `${stats.totalWorkouts} workout${stats.totalWorkouts !== 1 ? "s" : ""} completed so far`}
            </p>
          </div>
        </div>
      </div>

      {/* Recent PRs */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-extrabold text-white">Recent Records 🏆</h2>
          {recentPRs.length > 0 && <Link href="/progress" className="text-brand-400 text-xs font-bold">View all →</Link>}
        </div>

        {recentPRs.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-sm">Complete workouts to set personal records</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPRs.slice(0, 5).map((pr, i) => {
              const ex = getExerciseById(pr.exerciseId);
              if (!ex) return null;
              const improved = pr.previousValue !== null ? pr.value - pr.previousValue : null;
              return (
                <div key={`${pr.exerciseId}-${pr.type}-${i}`} className="glass rounded-xl p-3 flex items-center justify-between hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ex.image}</span>
                    <div>
                      <p className="font-bold text-white text-sm">{ex.name}</p>
                      <p className="text-xs text-gray-500">{new Date(pr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {pr.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-brand-400">{pr.value}{pr.type === "hold" ? "s" : pr.type === "weight" ? "kg" : ""}</p>
                    {improved !== null && improved > 0 && <p className="text-xs text-green-400 font-bold">+{improved}</p>}
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
