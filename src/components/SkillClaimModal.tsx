"use client";

import { useState, useMemo } from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { exercises, getExerciseById } from "@/data/exercises";
import { getYogaPoseById } from "@/data/yoga";
import { Difficulty } from "@/lib/types";

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

const difficultyColors: Record<Difficulty, string> = {
  beginner: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  intermediate: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  advanced: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  elite: "text-rose-400 border-rose-400/30 bg-rose-400/10",
};

const difficultyRank: Record<Difficulty, string> = {
  beginner: "C",
  intermediate: "B",
  advanced: "A",
  elite: "S",
};

export default function SkillClaimModal({ isOpen, onClose, plane }: SkillClaimModalProps) {
  const { profile, setProfile } = useWorkout();
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set(profile?.claimedSkills?.[plane] || [])
  );

  // Get available skills for this plane
  const availableSkills = useMemo(() => {
    if (plane === "flexibility" || plane === "balance") {
      // Yoga poses
      if (!profile?.yogaSetUp) return [];
      // Import yoga poses and filter
      // For now, return empty - will need yoga data
      return [];
    } else {
      // Regular exercises in this category
      return exercises.filter((ex) => {
        if (plane === "push") return ex.category === "push";
        if (plane === "pull") return ex.category === "pull";
        if (plane === "core") return ex.category === "core";
        if (plane === "legs") return ex.category === "legs";
        return false;
      });
    }
  }, [plane, profile?.yogaSetUp]);

  const handleToggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (profile) {
      const updatedClaimedSkills = {
        ...profile.claimedSkills,
        [plane]: Array.from(selectedSkills),
      };
      setProfile({
        ...profile,
        claimedSkills: updatedClaimedSkills,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const highestRank = selectedSkills.size > 0
    ? difficultyRank[
        availableSkills
          .filter((s) => selectedSkills.has(s.id))
          .reduce((maxDiff: Difficulty, skill) => {
            const diffScale = { beginner: 0, intermediate: 1, advanced: 2, elite: 3 };
            return diffScale[skill.difficulty] > diffScale[maxDiff] ? skill.difficulty : maxDiff;
          }, "beginner" as Difficulty)
      ]
    : "F";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-slate-900 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{planeLabels[plane]}</h2>
            <p className="text-sm text-white/60 mt-1">Click to claim achievements you&apos;ve unlocked</p>
          </div>
          <button
            onClick={onClose}
            className="text-3xl text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Rank Preview */}
        <div className="mb-6 p-4 glass-card rounded-2xl border border-white/10">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Your Rank</p>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{highestRank}</span>
            </div>
            <div>
              <p className="text-sm text-white/80">{selectedSkills.size} skills claimed</p>
              <p className="text-xs text-white/60">Higher difficulty skills = higher rank</p>
            </div>
          </div>
        </div>

        {/* Skills List */}
        <div className="space-y-2">
          {availableSkills.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <p>No skills available for this category</p>
              {(plane === "flexibility" || plane === "balance") && (
                <p className="text-sm mt-2">Set up Yoga in settings to unlock</p>
              )}
            </div>
          ) : (
            availableSkills.map((skill) => {
              const isClaimed = selectedSkills.has(skill.id);
              return (
                <button
                  key={skill.id}
                  onClick={() => handleToggleSkill(skill.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                    isClaimed
                      ? "border-emerald-400 bg-emerald-400/10 glass-card"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isClaimed ? "border-emerald-400 bg-emerald-400" : "border-white/30"
                      }`}
                    >
                      {isClaimed && (
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M3 7L6 10L11 4"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Skill Info */}
                    <div className="flex-1">
                      <p className="font-bold text-white">{skill.name}</p>
                      <p className="text-xs text-white/60">{skill.description}</p>
                    </div>

                    {/* Difficulty Badge */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${difficultyColors[skill.difficulty]}`}
                    >
                      {skill.difficulty.charAt(0).toUpperCase() + skill.difficulty.slice(1)}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold transition-colors border border-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors"
          >
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
}
