"use client";

import { useState } from "react";
import { WeeklyPlan, DayWorkout } from "@/lib/types";
import { getYogaPoseById } from "@/data/yoga";

interface YogaPlanCalendarViewProps {
  plan: WeeklyPlan;
  onSelectDay?: (dayIndex: number, day: DayWorkout) => void;
}

export default function YogaPlanCalendarView({ plan, onSelectDay }: YogaPlanCalendarViewProps) {
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

  // Get primary yoga focus from the week
  const getWeekFocus = (week: DayWorkout[]) => {
    const focuses = week
      .filter(d => !d.isRest)
      .map(d => d.focus?.toLowerCase() || "")
      .filter(Boolean);
    
    if (focuses.some(f => f.includes("flexibility"))) return "🧘 Flexibility";
    if (focuses.some(f => f.includes("strength"))) return "💪 Strength";
    if (focuses.some(f => f.includes("balance"))) return "⚖️ Balance";
    if (focuses.some(f => f.includes("relaxation"))) return "😌 Relaxation";
    return "🧘 Yoga";
  };

  // Count yoga types in the week
  const yogaCounts = {
    training: currentWeek.filter(d => !d.isRest).length,
    rest: currentWeek.filter(d => d.isRest).length,
  };

  return (
    <div className="space-y-6">
      {/* 4-Week Program Overview */}
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-lg">4-Week Yoga Program</h3>
            <p className="text-xs text-white/60">Daily flows for {plan.goal.toLowerCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-400">{selectedWeek + 1}/{totalWeeks}</p>
            <p className="text-xs text-white/60">Current Week</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all"
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
                    ? "bg-gradient-to-r from-purple-400 to-pink-400 text-slate-900"
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
            <p className="text-2xl font-bold text-purple-400">{yogaCounts.training}</p>
            <p className="text-xs text-white/60 mt-1">Yoga Days</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{yogaCounts.rest}</p>
            <p className="text-xs text-white/60 mt-1">Rest Days</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {currentWeek.reduce((sum, d) => sum + (d.isRest ? 0 : d.exercises?.length || 0), 0)}
            </p>
            <p className="text-xs text-white/60 mt-1">Total Poses</p>
          </div>
        </div>
      </div>

      {/* Week Schedule */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <span>Week {selectedWeek + 1} — {getWeekFocus(currentWeek)}</span>
        </h3>
        <div className="space-y-2">
          {currentWeek.map((day, idx) => {
            const globalIndex = selectedWeek * 7 + idx;
            const isSelected = isToday(idx);
            const topPoses = day.exercises
              .slice(0, 2)
              .map(ex => getYogaPoseById(ex.exerciseId)?.name.split(" ")[0] || "Pose")
              .join(" • ");

            return (
              <button
                key={globalIndex}
                onClick={() => !day.isRest && onSelectDay?.(globalIndex, day)}
                className={`w-full p-4 rounded-xl transition-all text-left border ${
                  day.isRest
                    ? "bg-slate-800/20 border-slate-700/30 cursor-default"
                    : isSelected
                    ? "glass-card border-purple-400 bg-purple-500/10"
                    : "glass border-white/10 hover:bg-white/8"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{day.day}</p>
                      {isSelected && (
                        <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${day.isRest ? "text-slate-400" : "text-white/70"}`}>
                      {day.isRest ? "Rest & Recovery" : day.name}
                    </p>
                    {!day.isRest && topPoses && (
                      <p className="text-xs text-white/50 mt-1">{topPoses}</p>
                    )}
                  </div>

                  <div className="text-right">
                    {day.isRest ? (
                      <div className="text-2xl">😌</div>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-medium">
                          {day.exercises?.length || 0} poses
                        </span>
                        <span className="text-xs text-white/50">
                          {day.exercises?.[0]?.holdSeconds || 15} sec holds
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

      {/* Full 4-Week Grid */}
      <div className="glass-card p-5 rounded-2xl">
        <h3 className="font-bold text-white mb-4">Full 4-Week Overview</h3>
        <div className="space-y-3">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx}>
              <p className="text-xs font-bold text-purple-400 mb-2">Week {weekIdx + 1} — {getWeekFocus(week)}</p>
              <div className="grid grid-cols-7 gap-1">
                {week.map((day, dayIdx) => (
                  <button
                    key={dayIdx}
                    onClick={() => !day.isRest && onSelectDay?.(weekIdx * 7 + dayIdx, day)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      day.isRest
                        ? "bg-slate-700/30 text-slate-500 cursor-default"
                        : "glass-card border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 text-white"
                    }`}
                  >
                    🧘
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-white/10 flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-400" />
            <span className="text-white/70">Yoga Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-700/30" />
            <span className="text-white/70">Rest Day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
