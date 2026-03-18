"use client";

import { useState, useEffect } from "react";
import { exercises } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import { generateWeeklyPlan, generateFlexibilityPlan } from "@/lib/planGenerator";
import PageBackground from "@/components/PageBackground";
import ExerciseIllustration from "@/components/ExerciseIllustration";
import Link from "next/link";
import { TrainingGoal } from "@/lib/types";

const skillExercises = exercises.filter(
  (e) => e.category === "skill" || e.id === "handstand-push-up" || e.id === "pistol-squat" || e.id === "dragon-flag"
);
const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2, elite: 3 };
const sortedSkills = [...skillExercises].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
const difficultyText: Record<string, string> = { beginner: "text-green-400", intermediate: "text-yellow-400", advanced: "text-red-400", elite: "text-fuchsia-400" };

const goalOptions: { value: TrainingGoal; label: string; icon: string; desc: string }[] = [
  { value: "muscle", label: "Build Muscle", icon: "💪", desc: "Higher volume, moderate rest" },
  { value: "skills", label: "Master Skills", icon: "🤸", desc: "Technique focus, long rest" },
  { value: "weight-loss", label: "Lose Weight", icon: "🔥", desc: "High intensity, short rest" },
  { value: "endurance", label: "Endurance", icon: "🏃", desc: "High reps, minimal rest" },
  { value: "balanced", label: "Balanced", icon: "⚖️", desc: "Well-rounded mix" },
];

export default function WorkoutsPage() {
  const { savedPlans, addPlan, removePlan, profile } = useWorkout();
  const [view, setView] = useState<"library" | "skills" | "goal">(savedPlans.length === 0 ? "skills" : "library");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal>(profile?.trainingGoal || "balanced");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { if (savedPlans.length === 0) setView("skills"); }, [savedPlans.length]);

  const toggle = (id: string) => { setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const handleGenerate = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const plan = generateWeeklyPlan(ids, selectedGoal);
    addPlan(plan);
    setSelected(new Set());
    setView("library");
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <PageBackground variant="workouts" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Workouts</h1>
          <p className="text-gray-400 text-sm">{view === "library" ? `${savedPlans.length} plan${savedPlans.length !== 1 ? "s" : ""}` : view === "skills" ? "Select skills" : "Choose your goal"}</p>
        </div>
        {view === "library" ? (
          <button onClick={() => setView("skills")} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-medium hover:bg-gray-700">+ New Plan</button>
        ) : (
          savedPlans.length > 0 && <button onClick={() => setView("library")} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-medium hover:bg-gray-700">My Plans</button>
        )}
      </div>

      {/* Library */}
      {view === "library" && (
        <div className="space-y-4">
          {savedPlans.map((plan) => (
            <div key={plan.id} className="glass rounded-2xl overflow-hidden">
              <Link href={`/workouts/plan?id=${plan.id}`} className="block p-5 hover:bg-gray-800/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-400 capitalize">{plan.difficulty}</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{plan.description}</p>
                <div className="flex gap-3 text-xs text-gray-300 mt-2">
                  <span>📅 {plan.days.filter((d) => !d.isRest).length} days/wk</span>
                  <span>⏱ ~{plan.estimatedWeeklyMinutes} min/wk</span>
                  <span>📆 {new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </Link>
              <div className="px-5 pb-4 flex gap-2">
                <Link href={`/workouts/plan?id=${plan.id}`} className="flex-1 py-2 bg-brand-500 text-white rounded-xl text-center text-sm font-semibold hover:bg-brand-600">Open</Link>
                {confirmDelete === plan.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => { removePlan(plan.id); setConfirmDelete(null); }} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold">Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(plan.id)} className="px-3 py-2 bg-gray-700 text-gray-400 rounded-xl text-sm hover:bg-red-500/20 hover:text-red-400">🗑</button>
                )}
              </div>
            </div>
          ))}
          {/* Flexibility Plan Option */}
          <button onClick={() => { addPlan(generateFlexibilityPlan()); }} className="w-full glass rounded-2xl p-5 text-left hover:scale-[1.02] transition-all border-2 border-dashed border-purple-500/30">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🧘</span>
              <div>
                <p className="text-white font-bold">Generate Flexibility Plan</p>
                <p className="text-gray-400 text-xs">5-day yoga & flexibility program working toward splits</p>
              </div>
            </div>
          </button>
          {savedPlans.length === 0 && (
            <div className="text-center py-12 glass rounded-2xl"><p className="text-4xl mb-3">📋</p><p className="text-gray-300 font-semibold">No plans yet</p></div>
          )}
        </div>
      )}

      {/* Skill Selection */}
      {view === "skills" && (
        <>
          <p className="text-gray-400 text-sm mb-4">Pick the skills you want to master:</p>
          <div className="space-y-3 mb-6">
            {sortedSkills.map((ex) => {
              const isSel = selected.has(ex.id);
              return (
                <button key={ex.id} onClick={() => toggle(ex.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left ${isSel ? "border-brand-500 bg-brand-500/10" : "border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50"}`}>
                  <ExerciseIllustration exerciseId={ex.id} size={50} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm">{ex.name}</h3>
                    <span className={`text-xs font-medium capitalize ${difficultyText[ex.difficulty]}`}>{ex.difficulty}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSel ? "border-brand-500 bg-brand-500" : "border-gray-600"}`}>
                    {isSel && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="sticky bottom-20 z-40 pb-2">
            <button onClick={() => { if (selected.size > 0) setView("goal"); }} disabled={selected.size === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${selected.size > 0 ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}>
              {selected.size === 0 ? "Select skills to continue" : `Next: Choose Goal →`}
            </button>
          </div>
        </>
      )}

      {/* Goal Selection */}
      {view === "goal" && (
        <>
          <p className="text-gray-400 text-sm mb-4">How should your plan be optimized?</p>
          <div className="space-y-3 mb-6">
            {goalOptions.map((g) => (
              <button key={g.value} onClick={() => setSelectedGoal(g.value)}
                className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${
                  selectedGoal === g.value ? "glass border-2 border-brand-500" : "glass border-2 border-transparent hover:border-gray-600"
                }`}>
                <span className="text-3xl">{g.icon}</span>
                <div>
                  <p className="text-white font-bold">{g.label}</p>
                  <p className="text-gray-400 text-xs">{g.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3 sticky bottom-20 z-40 pb-2">
            <button onClick={() => setView("skills")} className="px-6 py-4 bg-gray-800 text-gray-300 rounded-2xl font-bold">← Back</button>
            <button onClick={handleGenerate}
              className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 transition-all shadow-lg">
              Generate Plan 🚀
            </button>
          </div>
        </>
      )}
    </div>
  );
}
