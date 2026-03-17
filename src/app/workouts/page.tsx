"use client";

import { useState, useEffect } from "react";
import { exercises } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import { generateWeeklyPlan } from "@/lib/planGenerator";
import ExerciseIllustration from "@/components/ExerciseIllustration";
import Link from "next/link";

const skillExercises = exercises.filter(
  (e) =>
    e.category === "skill" ||
    e.id === "handstand-push-up" ||
    e.id === "pistol-squat" ||
    e.id === "dragon-flag"
);

const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2, elite: 3 };

const sortedSkills = [...skillExercises].sort(
  (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
);

const difficultyColors = {
  beginner: "border-green-500/40 bg-green-500/5",
  intermediate: "border-yellow-500/40 bg-yellow-500/5",
  advanced: "border-red-500/40 bg-red-500/5",
  elite: "border-fuchsia-500/40 bg-fuchsia-500/5",
};

const difficultyText = {
  beginner: "text-green-400",
  intermediate: "text-yellow-400",
  advanced: "text-red-400",
  elite: "text-fuchsia-400",
};

export default function WorkoutsPage() {
  const {
    activePlan,
    selectedSkills,
    updateSelectedSkills,
    setActivePlanFromGenerator,
  } = useWorkout();

  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set());
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    if (selectedSkills.length > 0) {
      setLocalSelected(new Set(selectedSkills));
    }
  }, [selectedSkills]);

  useEffect(() => {
    if (activePlan) {
      setShowPlan(true);
    }
  }, [activePlan]);

  const toggleSkill = (id: string) => {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShowPlan(false);
  };

  const handleGenerate = () => {
    const ids = Array.from(localSelected);
    if (ids.length === 0) return;
    updateSelectedSkills(ids);
    const plan = generateWeeklyPlan(ids);
    setActivePlanFromGenerator(plan);
    setShowPlan(true);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="text-3xl font-bold text-white mb-1">Build Your Plan</h1>
      <p className="text-gray-400 mb-6">
        Select the skills you want to master and we&apos;ll generate your optimal 7-day program
      </p>

      {/* Skill Selection */}
      {!showPlan && (
        <>
          <div className="space-y-3 mb-8">
            {sortedSkills.map((ex) => {
              const isSelected = localSelected.has(ex.id);
              return (
                <button
                  key={ex.id}
                  onClick={() => toggleSkill(ex.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/30"
                      : `${difficultyColors[ex.difficulty]} hover:bg-gray-800/50`
                  }`}
                >
                  <ExerciseIllustration exerciseId={ex.id} size={64} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white">{ex.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
                      {ex.description}
                    </p>
                    <span
                      className={`text-xs font-medium capitalize ${difficultyText[ex.difficulty]}`}
                    >
                      {ex.difficulty}
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "border-brand-500 bg-brand-500"
                        : "border-gray-600"
                    }`}
                  >
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
                </button>
              );
            })}
          </div>

          {/* Generate Button */}
          <div className="sticky bottom-20 z-40 pb-2">
            <button
              onClick={handleGenerate}
              disabled={localSelected.size === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                localSelected.size > 0
                  ? "bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/25"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              {localSelected.size === 0
                ? "Select skills to continue"
                : `Generate Plan for ${localSelected.size} skill${
                    localSelected.size > 1 ? "s" : ""
                  } 🚀`}
            </button>
          </div>
        </>
      )}

      {/* Generated Plan Display */}
      {showPlan && activePlan && (
        <div>
          {/* Plan Header */}
          <div className="bg-gradient-to-br from-brand-500/20 to-brand-600/10 rounded-2xl p-5 border border-brand-500/30 mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              {activePlan.name}
            </h2>
            <p className="text-gray-400 text-sm mb-2">{activePlan.description}</p>
            <p className="text-brand-400 text-sm font-medium mb-3">
              Goal: {activePlan.goal}
            </p>
            <div className="flex gap-4 text-sm text-gray-300">
              <span>
                📅 {activePlan.days.filter((d) => !d.isRest).length} days/wk
              </span>
              <span>⏱ ~{activePlan.estimatedWeeklyMinutes} min/wk</span>
              <span className="capitalize">📊 {activePlan.difficulty}</span>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Your Weekly Schedule
            </h3>
            <div className="space-y-2">
              {activePlan.days.map((day, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 ${
                    day.isRest
                      ? "bg-gray-800/30 border border-gray-700/30"
                      : "bg-gray-800/50 border border-gray-700/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-mono w-8">
                        {day.day.slice(0, 3)}
                      </span>
                      <span
                        className={`font-semibold ${
                          day.isRest ? "text-gray-500" : "text-white"
                        }`}
                      >
                        {day.name}
                      </span>
                    </div>
                    {day.isRest ? (
                      <span className="text-xs text-gray-500">😴</span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {day.exercises.length} exercises
                      </span>
                    )}
                  </div>
                  {day.focus && !day.isRest && (
                    <p className="text-xs text-gray-400 mt-1 ml-11">
                      {day.focus}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <Link
              href={`/workouts/active`}
              className="block w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg text-center hover:bg-brand-600 transition-colors"
            >
              Start Training 🚀
            </Link>
            <button
              onClick={() => setShowPlan(false)}
              className="w-full py-3 bg-gray-800 text-gray-300 rounded-2xl font-medium hover:bg-gray-700 transition-colors"
            >
              ← Change Skills
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
