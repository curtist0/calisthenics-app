"use client";

import { getDayOfWeekName } from "@/lib/storage";

export interface ScheduleOverrideModalProps {
  workoutName: string;
  scheduledDate: string; // day of week name like "Monday"
  onStartToday: () => void;
  onFollowSchedule: () => void;
  onCancel: () => void;
}

export default function ScheduleOverrideModal({
  workoutName,
  scheduledDate,
  onStartToday,
  onFollowSchedule,
  onCancel,
}: ScheduleOverrideModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onCancel}>
      <div
        className="glass-card rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white">Schedule Mismatch</h2>
            <p className="text-sm text-white/60">This workout isn&apos;t scheduled for today</p>
          </div>
          <button onClick={onCancel} className="text-white/60 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        {/* Info Card */}
        <div className="glass rounded-2xl p-5 mb-6 border border-emerald-500/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📅</span>
            <div>
              <p className="text-white font-bold">{workoutName}</p>
              <p className="text-sm text-emerald-300">Scheduled for {scheduledDate}</p>
            </div>
          </div>
          <p className="text-xs text-white/70">
            Follow your plan for best results, or override to start this workout today.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary: Start Today's Workout */}
          <button
            onClick={onStartToday}
            className="w-full py-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-bold rounded-2xl text-center hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            ✅ Start Today&apos;s Workout
          </button>

          {/* Secondary: Follow Schedule */}
          <button
            onClick={onFollowSchedule}
            className="w-full py-3 glass border border-emerald-500/50 text-emerald-300 font-medium rounded-2xl hover:bg-emerald-500/10 transition-all"
          >
            🔄 Follow Schedule Anyway
          </button>

          {/* Tertiary: Cancel */}
          <button
            onClick={onCancel}
            className="w-full py-3 glass text-white/60 font-medium rounded-2xl hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
