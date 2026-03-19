"use client";

import { useState, useEffect } from "react";
import { exercises, getExerciseById } from "@/data/exercises";
import { yogaPoses } from "@/data/yoga";
import { useWorkout } from "@/context/WorkoutContext";
import { generateWeeklyPlan } from "@/lib/planGenerator";
import PageBackground from "@/components/PageBackground";
import ExerciseIllustration from "@/components/ExerciseIllustration";
import Link from "next/link";
import { TrainingGoal, Exercise } from "@/lib/types";

const goalOptions: { value: TrainingGoal; label: string; icon: string }[] = [
  { value: "muscle", label: "Build Muscle", icon: "💪" },
  { value: "skills", label: "Master Skills", icon: "🤸" },
  { value: "weight-loss", label: "Lose Weight", icon: "🔥" },
  { value: "endurance", label: "Endurance", icon: "🏃" },
  { value: "balanced", label: "Balanced", icon: "⚖️" },
];

const diffOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2, elite: 3 };
const diffText: Record<string, string> = { beginner: "text-green-400", intermediate: "text-yellow-400", advanced: "text-red-400", elite: "text-fuchsia-400" };

function getProgressionEndpoint(exerciseId: string): string | null {
  let current = getExerciseById(exerciseId);
  if (!current) return null;
  let last = current;
  const visited = new Set<string>();
  while (current?.progressionTo && !visited.has(current.progressionTo)) {
    visited.add(current.id);
    const next = getExerciseById(current.progressionTo);
    if (!next) break;
    last = next;
    current = next;
  }
  return last.id !== exerciseId ? last.name : null;
}

const skillExercises = exercises.filter(
  (e) => e.category === "skill" || e.id === "handstand-push-up" || e.id === "pistol-squat" || e.id === "dragon-flag"
);

function getExerciseRelevantLevel(ex: Exercise, skillLevels: Record<string, string>): number {
  const cats: string[] = ex.muscles.map((m) => {
    if (["chest", "shoulders", "triceps"].includes(m)) return "push";
    if (["back", "biceps"].includes(m)) return "pull";
    if (["quads", "hamstrings", "glutes", "calves"].includes(m)) return "legs";
    if (m === "core") return "core";
    return "push";
  });
  if (ex.id.includes("handstand") || ex.id.includes("crow") || ex.id.includes("flag")) cats.push("balance");
  if (ex.id.includes("lever") || ex.id.includes("planche") || ex.id.includes("l-sit") || ex.id.includes("v-sit")) cats.push("balance");

  const uniqueCats = [...new Set(cats)];
  let maxLevel = 0;
  for (const cat of uniqueCats) {
    const lvl = skillLevels[cat] || "beginner";
    maxLevel = Math.max(maxLevel, diffOrder[lvl] || 0);
  }
  return maxLevel;
}

export default function WorkoutsPage() {
  const { savedPlans, addPlan, removePlan, profile } = useWorkout();
  const [view, setView] = useState<"library" | "type" | "pick" | "goal">("library");
  const [workoutType, setWorkoutType] = useState<"calisthenics" | "flexibility" | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal>("balanced");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdvancedYoga, setShowAdvancedYoga] = useState(false);

  useEffect(() => { if (savedPlans.length === 0) setView("type"); }, [savedPlans.length]);

  const yogaUnlocked = profile?.yogaSetUp ?? false;
  const skillLevels = profile?.skillLevels ?? { push: "beginner", pull: "beginner", legs: "beginner", core: "beginner", balance: "beginner", flexibility: "beginner" };

  const recommended: Exercise[] = [];
  const advanced: Exercise[] = [];
  for (const ex of skillExercises) {
    const userLvl = getExerciseRelevantLevel(ex, skillLevels as unknown as Record<string, string>);
    if (diffOrder[ex.difficulty] <= userLvl + 1) recommended.push(ex);
    else advanced.push(ex);
  }
  recommended.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
  advanced.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);

  const flexLevel = diffOrder[skillLevels.flexibility] || 0;
  const balanceLevel = diffOrder[skillLevels.balance] || 0;
  const yogaMaxLevel = Math.max(flexLevel, balanceLevel);
  const recommendedYoga = yogaPoses.filter((p) => diffOrder[p.difficulty] <= yogaMaxLevel + 1);
  const advancedYoga = yogaPoses.filter((p) => diffOrder[p.difficulty] > yogaMaxLevel + 1);

  const toggle = (id: string) => { setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const handleGenerate = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const plan = generateWeeklyPlan(ids, workoutType === "flexibility" ? "balanced" : selectedGoal);
    addPlan(plan);
    setSelected(new Set());
    setView("library");
    setWorkoutType(null);
    setShowAdvanced(false);
    setShowAdvancedYoga(false);
  };

  const renderSkillButton = (ex: Exercise) => {
    const isSel = selected.has(ex.id);
    const endpoint = getProgressionEndpoint(ex.id);
    return (
      <button key={ex.id} onClick={() => toggle(ex.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${isSel ? "border-brand-500 bg-brand-500/10" : "border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50"}`}>
        <ExerciseIllustration exerciseId={ex.id} size={50} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm">{ex.name}</h3>
          <span className={`text-xs font-medium capitalize ${diffText[ex.difficulty]}`}>{ex.difficulty}</span>
          {endpoint && <p className="text-xs text-gray-500 mt-0.5">Leads to → <span className="text-brand-400">{endpoint}</span></p>}
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSel ? "border-brand-500 bg-brand-500" : "border-gray-600"}`}>
          {isSel && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
      </button>
    );
  };

  const renderYogaButton = (pose: typeof yogaPoses[0]) => {
    const isSel = selected.has(pose.id);
    return (
      <button key={pose.id} onClick={() => toggle(pose.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${isSel ? "border-purple-500 bg-purple-500/10" : "border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50"}`}>
        {pose.imageUrl ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pose.imageUrl} alt={pose.name} className="w-full h-full object-contain" loading="lazy" />
          </div>
        ) : <span className="text-2xl">{pose.image}</span>}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm">{pose.name}</h3>
          <span className={`text-xs font-medium capitalize ${diffText[pose.difficulty]}`}>{pose.difficulty}</span>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSel ? "border-purple-500 bg-purple-500" : "border-gray-600"}`}>
          {isSel && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <PageBackground variant="workouts" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Workouts</h1>
          <p className="text-gray-400 text-sm">
            {view === "library" ? `${savedPlans.length} plan${savedPlans.length !== 1 ? "s" : ""}` : view === "type" ? "Choose type" : view === "pick" ? "Select exercises" : "Choose goal"}
          </p>
        </div>
        {view === "library" ? (
          <button onClick={() => setView("type")} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-medium hover:bg-gray-700">+ New Plan</button>
        ) : (
          savedPlans.length > 0 && <button onClick={() => { setView("library"); setWorkoutType(null); setSelected(new Set()); }} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-medium hover:bg-gray-700">My Plans</button>
        )}
      </div>

      {/* Library */}
      {view === "library" && (
        <div className="space-y-4">
          {savedPlans.map((plan) => (
            <div key={plan.id} className="glass rounded-2xl overflow-hidden">
              <Link href={`/workouts/plan?id=${plan.id}`} className="block p-5 hover:bg-gray-800/30">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-400 capitalize">{plan.difficulty}</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{plan.description}</p>
                <div className="flex gap-3 text-xs text-gray-300 mt-2">
                  <span>📅 {plan.days.filter((d) => !d.isRest).length} days/wk</span>
                  <span>⏱ ~{plan.estimatedWeeklyMinutes} min/wk</span>
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
          {savedPlans.length === 0 && (
            <div className="text-center py-12 glass rounded-2xl"><p className="text-4xl mb-3">📋</p><p className="text-gray-300 font-semibold">No plans yet</p></div>
          )}
        </div>
      )}

      {/* Choose Type */}
      {view === "type" && (
        <div className="space-y-4">
          <button onClick={() => { setWorkoutType("calisthenics"); setView("pick"); setSelected(new Set()); }} className="w-full glass rounded-2xl p-6 text-left hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-4">
              <span className="text-4xl">💪</span>
              <div><p className="text-white font-extrabold text-lg">Calisthenics</p><p className="text-gray-400 text-sm">Strength & skill progressions</p></div>
            </div>
          </button>
          {yogaUnlocked ? (
            <button onClick={() => { setWorkoutType("flexibility"); setView("pick"); setSelected(new Set()); }} className="w-full glass rounded-2xl p-6 text-left hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🧘</span>
                <div><p className="text-white font-extrabold text-lg">Flexibility & Yoga</p><p className="text-gray-400 text-sm">Work toward your desired poses</p></div>
              </div>
            </button>
          ) : (
            <div className="w-full glass rounded-2xl p-6 opacity-50"><div className="flex items-center gap-4"><span className="text-4xl">🔒</span><div><p className="text-white font-bold text-lg">Flexibility & Yoga</p><p className="text-gray-400 text-sm">Set up yoga to unlock</p></div></div></div>
          )}
        </div>
      )}

      {/* Calisthenics Pick */}
      {view === "pick" && workoutType === "calisthenics" && (
        <>
          <p className="text-xs text-gray-500 mb-1">Based on your push, pull, balance & core levels:</p>
          <p className="text-gray-400 text-sm font-medium mb-3">Recommended for you ({recommended.length})</p>
          <div className="space-y-2 mb-4">{recommended.map(renderSkillButton)}</div>

          {advanced.length > 0 && (
            <>
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full py-3 glass rounded-xl text-sm font-medium text-gray-300 hover:text-white mb-2 flex items-center justify-center gap-2">
                {showAdvanced ? "Hide" : "Show"} advanced skills ({advanced.length}) <span className="text-xs">{showAdvanced ? "▲" : "▼"}</span>
              </button>
              {showAdvanced && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-yellow-400 mb-2">⚠️ Above your current level — progress at your own pace</p>
                  {advanced.map(renderSkillButton)}
                </div>
              )}
            </>
          )}

          <div className="sticky bottom-20 z-40 pb-2">
            <button onClick={() => { if (selected.size > 0) setView("goal"); }} disabled={selected.size === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg ${selected.size > 0 ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}>
              {selected.size === 0 ? "Select skills to continue" : "Next: Choose Goal →"}
            </button>
          </div>
        </>
      )}

      {/* Flexibility Pick — no goals */}
      {view === "pick" && workoutType === "flexibility" && (
        <>
          <p className="text-xs text-gray-500 mb-1">Based on your flexibility & balance levels:</p>
          <p className="text-gray-400 text-sm font-medium mb-3">Recommended for you ({recommendedYoga.length})</p>
          <div className="space-y-2 mb-4">{recommendedYoga.map(renderYogaButton)}</div>

          {advancedYoga.length > 0 && (
            <>
              <button onClick={() => setShowAdvancedYoga(!showAdvancedYoga)} className="w-full py-3 glass rounded-xl text-sm font-medium text-gray-300 hover:text-white mb-2 flex items-center justify-center gap-2">
                {showAdvancedYoga ? "Hide" : "Show"} advanced poses ({advancedYoga.length}) <span className="text-xs">{showAdvancedYoga ? "▲" : "▼"}</span>
              </button>
              {showAdvancedYoga && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-yellow-400 mb-2">⚠️ Above your current flexibility/balance level</p>
                  {advancedYoga.map(renderYogaButton)}
                </div>
              )}
            </>
          )}

          <div className="sticky bottom-20 z-40 pb-2">
            <button onClick={handleGenerate} disabled={selected.size === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg ${selected.size > 0 ? "bg-purple-500 text-white hover:bg-purple-600" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}>
              {selected.size === 0 ? "Select poses to continue" : "Generate Yoga Plan 🧘"}
            </button>
          </div>
        </>
      )}

      {/* Goal Selection (calisthenics only) */}
      {view === "goal" && (
        <>
          <p className="text-gray-400 text-sm mb-4">How should your plan be optimized?</p>
          <div className="space-y-3 mb-6">
            {goalOptions.map((g) => (
              <button key={g.value} onClick={() => setSelectedGoal(g.value)}
                className={`w-full p-4 rounded-2xl text-left flex items-center gap-4 border-2 ${
                  selectedGoal === g.value ? "border-brand-500 bg-brand-500/10 glass" : "border-transparent glass hover:border-gray-600"
                }`}>
                <span className="text-2xl">{g.icon}</span>
                <p className="text-white font-bold">{g.label}</p>
                {selectedGoal === g.value && <span className="ml-auto text-brand-400 text-sm">✓</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-3 sticky bottom-20 z-40 pb-2">
            <button onClick={() => setView("pick")} className="px-6 py-4 bg-gray-800 text-gray-300 rounded-2xl font-bold">← Back</button>
            <button onClick={handleGenerate} className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 shadow-lg">Generate Plan 🚀</button>
          </div>
        </>
      )}
    </div>
  );
}
