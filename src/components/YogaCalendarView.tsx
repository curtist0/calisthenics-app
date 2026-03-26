"use client";

import { useState } from "react";
import { WeeklyPlan, DayWorkout } from "@/lib/types";

interface YogaCalendarViewProps {
  plan: WeeklyPlan;
  onSelectDay?: (dayIndex: number, day: DayWorkout) => void;
}

export default function YogaCalendarView({ plan, onSelectDay }: YogaCalendarViewProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedWeek, setSelectedWeek] = useState(0);

  const totalWeeks = Math.ceil(plan.days.length / 7);
  const weeks = Array.from({ length: totalWeeks }, (_, i) =>
    plan.days.slice(i * 7, (i + 1) * 7)
  );

  const currentWeek = weeks[selectedWeek] || [];

  const isToday = (dayIndex: number): boolean => {
    if (viewMode === "week") {
      const jsDay = new Date().getDay();
      const appDay = jsDay === 0 ? 6 : jsDay - 1;
      return appDay === dayIndex % 7;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("week")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === "week"
              ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900"
              : "glass hover:bg-white/10"
          }`}
        >
          Week View
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            viewMode === "month"
              ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900"
              : "glass hover:bg-white/10"
          }`}
        >
          Month View
        </button>
      </div>

      {/* Week View */}
      {viewMode === "week" && (
        <div className="space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between glass-card p-4 rounded-2xl">
            <button
              onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
              disabled={selectedWeek === 0}
              className="px-3 py-2 glass rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
            >
              ← Previous
            </button>
            <span className="text-white font-bold">
              Week {selectedWeek + 1} of {totalWeeks}
            </span>
            <button
              onClick={() => setSelectedWeek(Math.min(totalWeeks - 1, selectedWeek + 1))}
              disabled={selectedWeek === totalWeeks - 1}
              className="px-3 py-2 glass rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
            >
              Next →
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {currentWeek.map((day, idx) => {
              const globalIndex = selectedWeek * 7 + idx;
              const isSelected = isToday(idx);
              return (
                <button
                  key={globalIndex}
                  onClick={() => !day.isRest && onSelectDay?.(globalIndex, day)}
                  className={`p-3 rounded-lg transition-all text-center ${
                    day.isRest
                      ? "bg-gray-700/30 border border-gray-600/30 text-gray-500 cursor-default"
                      : isSelected
                      ? "glass-card border-2 border-emerald-400 bg-emerald-500/10 text-white"
                      : "glass border border-white/10 hover:bg-white/10 text-white"
                  }`}
                >
                  <div className="text-xs font-bold uppercase mb-1">
                    {day.day.split(" ")[0]}
                  </div>
                  <div className="text-xs line-clamp-2">
                    {day.isRest ? "Rest" : day.name}
                  </div>
                  {day.isRest && <div className="text-lg mt-1">😴</div>}
                  {!day.isRest && isSelected && <div className="text-lg mt-1">✓</div>}
                </button>
              );
            })}
          </div>

          {/* Day Details */}
          {currentWeek.length > 0 && (
            <div className="glass-card p-5 rounded-2xl">
              <h3 className="font-bold text-white mb-3">Week {selectedWeek + 1} Overview</h3>
              <div className="space-y-2">
                {currentWeek.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      day.isRest
                        ? "border-gray-700/30 bg-gray-800/20"
                        : "border-emerald-500/20 bg-emerald-500/5"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">{day.day}</p>
                        <p className="text-sm text-white/70">{day.name}</p>
                      </div>
                      {!day.isRest && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">
                          {day.exercises.length} poses
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Month View */}
      {viewMode === "month" && (
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="font-bold text-white mb-4">4-Week Overview</h3>
            <div className="space-y-4">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="border-b border-white/10 pb-4 last:border-0">
                  <h4 className="text-sm font-bold text-emerald-400 mb-2">Week {weekIdx + 1}</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {week.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`p-2 rounded text-center text-xs transition-all cursor-pointer ${
                          day.isRest
                            ? "bg-gray-700/30 text-gray-500"
                            : "glass-card border border-emerald-500/30 hover:border-emerald-400 text-white hover:bg-emerald-500/10"
                        }`}
                        onClick={() => !day.isRest && onSelectDay?.(weekIdx * 7 + dayIdx, day)}
                      >
                        <div className="font-bold">{day.day.slice(0, 3)}</div>
                        <div className="text-[10px] line-clamp-1">
                          {day.isRest ? "Rest" : "Yoga"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">
                    {plan.days.filter(d => !d.isRest).length}
                  </p>
                  <p className="text-xs text-white/60">Training Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">
                    {totalWeeks}
                  </p>
                  <p className="text-xs text-white/60">Weeks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {plan.estimatedWeeklyMinutes || 60}
                  </p>
                  <p className="text-xs text-white/60">Min/Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
