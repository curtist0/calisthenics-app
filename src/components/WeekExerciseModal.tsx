"use client";

import { DayWorkout } from "@/lib/types";
import { getExerciseById } from "@/data/exercises";
import { getYogaPoseById } from "@/data/yoga";
import ExerciseCard from "./ExerciseCard";

interface WeekExerciseModalProps {
  day: DayWorkout | null;
  visible: boolean;
  onClose: () => void;
}

export default function WeekExerciseModal({ day, visible, onClose }: WeekExerciseModalProps) {
  if (!visible || !day) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="max-w-md w-full bg-slate-900 rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">{day.name}</h3>
            <p className="text-xs text-white/60 mt-1">{day.day}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Focus description if exists */}
        {day.focus && !day.isRest && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-blue-300 text-sm font-semibold">{day.focus}</p>
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-3">
          {day.isRest ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">😴</p>
              <p className="text-white/60 text-sm">Rest day — recover and recharge!</p>
            </div>
          ) : (
            day.exercises.map((we, idx) => {
              const ex = getExerciseById(we.exerciseId);
              const yoga = getYogaPoseById(we.exerciseId);
              const isCond = we.exerciseId.startsWith("cond-");
              const name = ex?.name || yoga?.name || we.progressionLevel?.replace("🔧 ", "") || "Exercise";

              return (
                <div
                  key={`${we.exerciseId}-${idx}`}
                  className="glass rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{name}</p>
                    {isCond && <span className="text-xs text-yellow-400">conditioning</span>}
                    {yoga && <span className="text-xs text-purple-400">{yoga.sanskrit}</span>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">
                      {we.sets} × {we.holdSeconds ? `${we.holdSeconds}s` : we.reps}
                    </p>
                    {we.progressionLevel && (
                      <p className="text-brand-400 text-[10px] mt-1">{we.progressionLevel}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Close button at bottom */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 rounded-xl font-bold hover:from-emerald-300 hover:to-cyan-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
