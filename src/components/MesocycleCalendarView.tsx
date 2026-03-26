"use client";

import { useState } from "react";
import { WeeklyPlan, DayWorkout } from "@/lib/types";

interface MesocycleCalendarViewProps {
  plan: WeeklyPlan;
  onSelectDay?: (dayIndex: number, day: DayWorkout) => void;
}

export default function MesocycleCalendarView({ plan, onSelectDay }: MesocycleCalendarViewProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);

  const totalWeeks = Math.ceil(plan.days.length / 7);
  const weeks = Array.from({ length: totalWeeks }, (_, i) =>
    plan.days.slice(i * 7, (i + 1) * 7)
  );

  const currentWeek = weeks[selectedWeek] || [];

  const isToday = (dayIndex: number): boolean => {
    const jsDay = new Date().getDay();
    const appDay = jsDay === 0 ? 6 : jsDay - 1;
    return appDay === dayIndex % 7;
  };

  // Count workout types in the week
  const workoutCounts = {
    training: currentWeek.filter(d => !d.isRest).length,
    rest: currentWeek.filter(d => d.isRest).length,
  };

  return (
    <div className="space-y-6">
      {/* Mesocycle Progress */}
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-lg">6-Week Mesocycle</h3>
            <p className="text-xs text-white/60">View your complete training program</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-400">{selectedWeek + 1}/6</p>
            <p className="text-xs text-white/60">Current Week</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
            style={{ width: `${((selectedWeek + 1) / totalWeeks) * 100}%` }}
          />
        </div>

        {/* Week Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
            disabled={selectedWeek === 0}
            className="px-4 py-2 glass rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 text-sm font-medium"
          >
            ← Prev
          </button>
          <div className="flex-1 flex gap-1">
            {weeks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedWeek(idx)}
                className={`flex-1 py-2 rounded-lg font-medium transition-all text-xs ${
                  selectedWeek === idx
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900"
                    : "glass hover:bg-white/10 text-white"
                }`}
              >
                W{idx + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedWeek(Math.min(totalWeeks - 1, selectedWeek + 1))}
            disabled={selectedWeek === totalWeeks - 1}
            className="px-4 py-2 glass rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 text-sm font-medium"
          >
            Next →
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{workoutCounts.training}</p>
            <p className="text-xs text-white/60 mt-1">Training Days</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{workoutCounts.rest}</p>
            <p className="text-xs text-white/60 mt-1">Rest Days</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {currentWeek.reduce((sum, d) => sum + (d.isRest ? 0 : d.exercises?.length || 0), 0)}
            </p>
            <p className="text-xs text-white/60 mt-1">Total Exercises</p>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="font-bold text-white mb-4">Week {selectedWeek + 1} Schedule</h3>
        <div className="space-y-2">
          {currentWeek.map((day, idx) => {
            const globalIndex = selectedWeek * 7 + idx;
            const isSelected = isToday(idx);
            return (
              <button
                key={globalIndex}
                onClick={() => !day.isRest && onSelectDay?.(globalIndex, day)}
                className={`w-full p-4 rounded-xl transition-all text-left border ${
                  day.isRest
                    ? "bg-gray-800/20 border-gray-700/30 cursor-default"
                    : isSelected
                    ? "glass-card border-emerald-400 bg-emerald-500/10"
                    : "glass border-white/10 hover:bg-white/8"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{day.day}</p>
                      {isSelected && (
                        <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2 py-1 rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${day.isRest ? "text-gray-500" : "text-white/70"}`}>
                      {day.isRest ? "Rest day" : day.name}
                    </p>
                  </div>

                  <div className="text-right">
                    {day.isRest ? (
                      <div className="text-2xl">😴</div>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-medium">
                          {day.exercises?.length || 0} exercises
                        </span>
                        <span className="text-xs text-white/50">
                          {Math.ceil((day.exercises?.length || 0) * 15 / 60)} min
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full 6-Week Grid */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="font-bold text-white mb-4">Full 6-Week Overview</h3>
        <div className="space-y-3">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx}>
              <p className="text-xs font-bold text-emerald-400 mb-2">Week {weekIdx + 1}</p>
              <div className="grid grid-cols-7 gap-1">
                {week.map((day, dayIdx) => (
                  <button
                    key={dayIdx}
                    onClick={() => !day.isRest && onSelectDay?.(weekIdx * 7 + dayIdx, day)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      day.isRest
                        ? "bg-gray-700/30 text-gray-500 cursor-default"
                        : "glass-card border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 text-white"
                    }`}
                  >
                    {day.day.slice(0, 1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-white/10 flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400" />
            <span className="text-white/70">Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-700/30" />
            <span className="text-white/70">Rest</span>
          </div>
        </div>
      </div>
    </div>
  );
}
