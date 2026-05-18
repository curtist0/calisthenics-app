"use client";

import { useMemo } from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { exercises } from "@/data/exercises";

interface SkillClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  plane: "push" | "pull" | "core" | "legs" | "flexibility" | "balance";
}

const planeLabels: Record<string, string> = {
  push: "💪 Push Strength",
  pull: "🤝 Pull Strength",
  core: "🔥 Core",
  legs: "🦵 Legs",
  flexibility: "🤸 Flexibility",
  balance: "⚖️ Balance",
};

const rankTiers = [
  { rank: "S", label: "Elite", color: "from-rose-500 to-pink-500", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/30" },
  { rank: "A", label: "Advanced", color: "from-orange-500 to-amber-500", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
  { rank: "B", label: "Intermediate", color: "from-yellow-500 to-amber-400", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" },
  { rank: "C", label: "Beginner", color: "from-cyan-500 to-blue-500", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
  { rank: "D", label: "Novice", color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
];

export default function SkillClaimModal({ isOpen, onClose, plane }: SkillClaimModalProps) {
  const { logs } = useWorkout();

  // Get exercises for this plane
  const exercisesByDifficulty = useMemo(() => {
    if (plane === "flexibility" || plane === "balance") {
      // Yoga poses - for now return empty structure
      return {
        elite: [],
        advanced: [],
        intermediate: [],
        beginner: [],
        novice: [],
      };
    } else {
      // Regular exercises
      const categoryMap: Record<string, string> = {
        push: "push",
        pull: "pull",
        core: "core",
        legs: "legs",
      };

      const category = categoryMap[plane];
      const categoryExercises = exercises.filter((ex) => ex.category === category);

      return {
        elite: categoryExercises.filter((e) => e.difficulty === "elite"),
        advanced: categoryExercises.filter((e) => e.difficulty === "advanced"),
        intermediate: categoryExercises.filter((e) => e.difficulty === "intermediate"),
        beginner: categoryExercises.filter((e) => e.difficulty === "beginner"),
        novice: [],
      };
    }
  }, [plane]);

  // Get completed exercises in this plane from workout logs
  const completedExercises = useMemo(() => {
    const completed = new Set<string>();
    for (const log of logs) {
      if (log.completed) {
        for (const ex of log.exercises) {
          if (ex.sets.some((s) => s.completed)) {
            completed.add(ex.exerciseId);
          }
        }
      }
    }
    return completed;
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-slate-900 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{planeLabels[plane]}</h2>
            <p className="text-sm text-white/60 mt-1">Exercises required for each rank tier</p>
          </div>
          <button
            onClick={onClose}
            className="text-3xl text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Info Text */}
        <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs text-white/70">
            🎯 Your rank automatically updates as you complete workouts and progress through exercises. Complete higher difficulty exercises to unlock higher ranks!
          </p>
        </div>

        {/* Rank Tiers */}
        <div className="space-y-4">
          {rankTiers.map((tier) => {
            const tierKey = tier.rank.toLowerCase() === "s" ? "elite" : tier.rank.toLowerCase() === "a" ? "advanced" : tier.rank.toLowerCase() === "b" ? "intermediate" : tier.rank.toLowerCase() === "c" ? "beginner" : "novice";
            const tierExercises = exercisesByDifficulty[tierKey as keyof typeof exercisesByDifficulty];
            const completedCount = tierExercises.filter((ex) => completedExercises.has(ex.id)).length;

            return (
              <div
                key={tier.rank}
                className={`p-4 rounded-2xl border ${tier.borderColor} ${tier.bgColor} glass-card`}
              >
                {/* Tier Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                      <span className="text-xl font-bold text-white">{tier.rank}</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">{tier.label}</p>
                      <p className="text-xs text-white/60">
                        {tierExercises.length === 0
                          ? "No exercises available"
                          : `${completedCount}/${tierExercises.length} exercises completed`}
                      </p>
                    </div>
                  </div>
                  {completedCount > 0 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500">
                      <span className="text-xs font-bold text-emerald-400">✓</span>
                    </div>
                  )}
                </div>

                {/* Exercises List */}
                {tierExercises.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {tierExercises.map((ex) => {
                      const isCompleted = completedExercises.has(ex.id);
                      return (
                        <div
                          key={ex.id}
                          className={`p-2.5 rounded-lg flex items-center gap-2 text-sm transition-all ${
                            isCompleted
                              ? "bg-emerald-500/20 border border-emerald-500/30"
                              : "bg-white/5 border border-white/10"
                          }`}
                        >
                          <span className="text-lg">{isCompleted ? "✓" : "○"}</span>
                          <div className="flex-1">
                            <p className={isCompleted ? "text-emerald-300 font-semibold" : "text-white/80"}>
                              {ex.name}
                            </p>
                            <p className="text-xs text-white/50">{ex.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
