"use client";

import { useWorkout } from "@/context/WorkoutContext";
import { workouts } from "@/data/workouts";
import WorkoutCard from "@/components/WorkoutCard";
import Link from "next/link";

export default function Home() {
  const { stats, logs } = useWorkout();

  const recentLogs = logs
    .filter((l) => l.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const recommendedWorkouts = workouts.slice(0, 3);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">CaliTrack</h1>
        <p className="text-gray-400">Your calisthenics companion</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-gradient-to-br from-brand-500/20 to-brand-600/10 rounded-2xl p-4 border border-brand-500/30">
          <p className="text-3xl font-bold text-white">{stats.totalWorkouts}</p>
          <p className="text-sm text-gray-400 mt-1">Workouts</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-4 border border-blue-500/30">
          <p className="text-3xl font-bold text-white">{stats.currentStreak}</p>
          <p className="text-sm text-gray-400 mt-1">Day Streak 🔥</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-4 border border-purple-500/30">
          <p className="text-3xl font-bold text-white">{stats.totalExercises}</p>
          <p className="text-sm text-gray-400 mt-1">Exercises Done</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-4 border border-orange-500/30">
          <p className="text-3xl font-bold text-white">{stats.longestStreak}</p>
          <p className="text-sm text-gray-400 mt-1">Best Streak</p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Quick Start</h2>
          <Link
            href="/workouts"
            className="text-brand-400 text-sm font-medium hover:text-brand-300"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {recommendedWorkouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentLogs.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Link
              href="/progress"
              className="text-brand-400 text-sm font-medium hover:text-brand-300"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const workout = workouts.find((w) => w.id === log.workoutId);
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {workout?.name || "Unknown Workout"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-brand-400 text-sm font-medium">
                    ✓ Complete
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentLogs.length === 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
          <p className="text-4xl mb-3">🏃</p>
          <p className="text-gray-300 font-semibold mb-1">No workouts yet</p>
          <p className="text-gray-500 text-sm mb-4">
            Start your first workout to see your progress here
          </p>
          <Link
            href="/workouts"
            className="inline-block px-6 py-2.5 bg-brand-500 text-white rounded-full font-semibold hover:bg-brand-600 transition-colors"
          >
            Browse Workouts
          </Link>
        </div>
      )}
    </div>
  );
}
