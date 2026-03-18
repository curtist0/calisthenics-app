"use client";

import { useState, useEffect } from "react";
import { exercises } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import { generateWeeklyPlan } from "@/lib/planGenerator";
import PageBackground from "@/components/PageBackground";
import ExerciseIllustration from "@/components/ExerciseIllustration";
import Link from "next/link";

const skillExercises = exercises.filter(
  (e) => e.category === "skill" || e.id === "handstand-push-up" || e.id === "pistol-squat" || e.id === "dragon-flag"
);
const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2, elite: 3 };
const sortedSkills = [...skillExercises].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
const difficultyText: Record<string, string> = { beginner: "text-green-400", intermediate: "text-yellow-400", advanced: "text-red-400", elite: "text-fuchsia-400" };

export default function WorkoutsPage() {
  const { savedPlans, addPlan, removePlan } = useWorkout();
  const [view, setView] = useState<"library" | "create">(savedPlans.length === 0 ? "create" : "library");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (savedPlans.length === 0) setView("create");
  }, [savedPlans.length]);

  const toggle = (id: string) => { setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const handleGenerate = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const plan = generateWeeklyPlan(ids);
    addPlan(plan);
    setSelected(new Set());
    setView("library");
  };

  const handleDelete = (id: string) => { removePlan(id); setConfirmDelete(null); };

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <PageBackground variant="workouts" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Workouts</h1>
          <p className="text-gray-400 text-sm">{view === "library" ? `${savedPlans.length} saved plan${savedPlans.length !== 1 ? "s" : ""}` : "Build a new plan"}</p>
        </div>
        <button onClick={() => setView(view === "library" ? "create" : "library")} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors">
          {view === "library" ? "+ New Plan" : savedPlans.length > 0 ? "My Plans" : ""}
        </button>
      </div>

      {/* Plan Library View */}
      {view === "library" && (
        <div className="space-y-4">
          {savedPlans.map((plan) => (
            <div key={plan.id} className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
              <Link href={`/workouts/plan?id=${plan.id}`} className="block p-5 hover:bg-gray-800/70 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-400 capitalize">{plan.difficulty}</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{plan.description}</p>
                <p className="text-brand-400 text-xs font-medium mb-3">Goal: {plan.goal}</p>
                <div className="flex gap-4 text-xs text-gray-300">
                  <span>📅 {plan.days.filter((d) => !d.isRest).length} days/wk</span>
                  <span>⏱ ~{plan.estimatedWeeklyMinutes} min/wk</span>
                  <span>📆 {new Date(plan.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </Link>
              <div className="px-5 pb-4 flex gap-2">
                <Link href={`/workouts/plan?id=${plan.id}`} className="flex-1 py-2 bg-brand-500 text-white rounded-xl text-center text-sm font-semibold hover:bg-brand-600 transition-colors">
                  Open Plan
                </Link>
                {confirmDelete === plan.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(plan.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold">Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(plan.id)} className="px-4 py-2 bg-gray-700 text-gray-400 rounded-xl text-sm hover:bg-red-500/20 hover:text-red-400 transition-colors">🗑</button>
                )}
              </div>
            </div>
          ))}
          {savedPlans.length === 0 && (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-300 font-semibold mb-1">No plans yet</p>
              <p className="text-gray-500 text-sm">Create your first progression-based workout plan</p>
            </div>
          )}
        </div>
      )}

      {/* Create Plan View */}
      {view === "create" && (
        <>
          <p className="text-gray-400 text-sm mb-4">Select the skills you want to master. We&apos;ll build a progression-based 7-day plan with exercises leading up to each skill.</p>
          <div className="space-y-3 mb-8">
            {sortedSkills.map((ex) => {
              const isSelected = selected.has(ex.id);
              return (
                <button key={ex.id} onClick={() => toggle(ex.id)} className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left ${isSelected ? "border-brand-500 bg-brand-500/10" : "border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50"}`}>
                  <ExerciseIllustration exerciseId={ex.id} size={56} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm">{ex.name}</h3>
                    <span className={`text-xs font-medium capitalize ${difficultyText[ex.difficulty]}`}>{ex.difficulty}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-brand-500 bg-brand-500" : "border-gray-600"}`}>
                    {isSelected && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="sticky bottom-20 z-40 pb-2">
            <button onClick={handleGenerate} disabled={selected.size === 0} className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${selected.size > 0 ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}>
              {selected.size === 0 ? "Select skills to continue" : `Generate Plan for ${selected.size} skill${selected.size > 1 ? "s" : ""} 🚀`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
