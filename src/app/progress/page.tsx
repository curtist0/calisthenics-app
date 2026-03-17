"use client";

import { useWorkout } from "@/context/WorkoutContext";
import { workouts } from "@/data/workouts";

export default function ProgressPage() {
  const { logs, stats } = useWorkout();

  const completedLogs = logs
    .filter((l) => l.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const workoutsByDay = last7Days.map((day) => ({
    day,
    label: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
    count: completedLogs.filter((l) => l.date.split("T")[0] === day).length,
  }));

  const maxCount = Math.max(...workoutsByDay.map((d) => d.count), 1);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="text-3xl font-bold text-white mb-1">Progress</h1>
      <p className="text-gray-400 mb-8">Track your training journey</p>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          <p className="text-3xl font-bold text-brand-400">
            {stats.totalWorkouts}
          </p>
          <p className="text-sm text-gray-400 mt-1">Total Workouts</p>
        </div>
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          <p className="text-3xl font-bold text-blue-400">
            {stats.totalExercises}
          </p>
          <p className="text-sm text-gray-400 mt-1">Total Exercises</p>
        </div>
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          <p className="text-3xl font-bold text-orange-400">
            {stats.currentStreak}
          </p>
          <p className="text-sm text-gray-400 mt-1">Current Streak 🔥</p>
        </div>
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          <p className="text-3xl font-bold text-purple-400">
            {stats.longestStreak}
          </p>
          <p className="text-sm text-gray-400 mt-1">Longest Streak</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">This Week</h2>
        <div className="flex items-end justify-between gap-2 h-32">
          {workoutsByDay.map((day) => (
            <div key={day.day} className="flex flex-col items-center flex-1 gap-2">
              <div className="w-full flex flex-col items-center justify-end h-20">
                <div
                  className={`w-full max-w-[2rem] rounded-t-lg transition-all ${
                    day.count > 0 ? "bg-brand-500" : "bg-gray-700"
                  }`}
                  style={{
                    height: day.count > 0
                      ? `${Math.max((day.count / maxCount) * 100, 20)}%`
                      : "8px",
                  }}
                />
              </div>
              <span className="text-xs text-gray-400">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Workout History</h2>

        {completedLogs.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-gray-300 font-semibold mb-1">
              No workouts logged yet
            </p>
            <p className="text-gray-500 text-sm">
              Complete your first workout to start tracking progress
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedLogs.map((log) => {
              const workout = workouts.find((w) => w.id === log.workoutId);
              const totalSets = log.exercises.reduce(
                (s, e) => s + e.sets.length,
                0
              );
              const completedSets = log.exercises.reduce(
                (s, e) => s + e.sets.filter((set) => set.completed).length,
                0
              );
              const startTime = new Date(log.startTime);
              const endTime = log.endTime ? new Date(log.endTime) : null;
              const durationMin = endTime
                ? Math.round(
                    (endTime.getTime() - startTime.getTime()) / 60000
                  )
                : null;

              return (
                <div
                  key={log.id}
                  className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        {workout?.name || "Unknown Workout"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-brand-400 text-xs font-medium bg-brand-500/10 px-2 py-1 rounded-full">
                      ✓ Done
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 mt-3">
                    <span>
                      {completedSets}/{totalSets} sets
                    </span>
                    <span>{log.exercises.length} exercises</span>
                    {durationMin && <span>{durationMin} min</span>}
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
