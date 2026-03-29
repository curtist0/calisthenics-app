"use client";

import { useState, useEffect } from "react";
import { exercises, getExerciseById } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import { generateWeeklyPlan, generateYogaPlanFromGoal } from "@/lib/planGenerator";
import PageBackground from "@/components/PageBackground";
import ExerciseIllustration from "@/components/ExerciseIllustration";
import Link from "next/link";
import { TrainingGoal, Exercise } from "@/lib/types";

const goalOptions: { value: TrainingGoal; label: string; description: string; icon: string }[] = [
  {
    value: "strength-skill",
    label: "Strength & Skill",
    description: "Neurological adaptation, 3-8 reps, 3 min rest",
    icon: "⚡",
  },
  {
    value: "hypertrophy",
    label: "Muscle Growth",
    description: "Muscle hypertrophy, 8-15 reps, 90s rest",
    icon: "💪",
  },
  {
    value: "endurance",
    label: "Stamina & Endurance",
    description: "Work capacity, 15-25 reps, 60s rest",
    icon: "🏃",
  },
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

function userCanDoExercise(exercise: Exercise, userEquipment?: string[]): boolean {
  if (!userEquipment || userEquipment.length === 0) return true;
  if (!exercise.equipment || exercise.equipment.length === 0) return true;
  return exercise.equipment.some((eq) => userEquipment.includes(eq));
}

const skillExercises = exercises.filter(
  (e) => e.category === "skill" || e.id === "handstand-push-up" || e.id === "pistol-squat" || e.id === "dragon-flag"
);

const yogaGoalPresets = [
  { label: "Improve overall flexibility", icon: "🧘", goal: "flexibility" },
  { label: "Achieve the splits", icon: "🤸", goal: "flexibility" },
  { label: "Reduce stress & anxiety", icon: "😌", goal: "relaxation" },
  { label: "Better sleep", icon: "😴", goal: "relaxation" },
  { label: "Improve balance & coordination", icon: "⚖️", goal: "balance" },
  { label: "Fix posture", icon: "🧍", goal: "core" },
  { label: "Morning energy boost", icon: "☀️", goal: "core" },
  { label: "Deep backbend flexibility", icon: "🔄", goal: "flexibility" },
];

export default function WorkoutsPage() {
  const { savedPlans, addPlan, removePlan, profile } = useWorkout();
  const [view, setView] = useState<"library" | "type" | "pick" | "goal" | "yoga-goal">("library");
  const [workoutType, setWorkoutType] = useState<"calisthenics" | "flexibility" | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal>("strength-skill");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [selectedYogaGoal, setSelectedYogaGoal] = useState<{ label: string; goal: string } | null>(null);
  const [yogaDuration, setYogaDuration] = useState(60);

  useEffect(() => { if (savedPlans.length === 0) setView("type"); }, [savedPlans.length]);

  const yogaUnlocked = profile?.yogaSetUp ?? false;
  const userEquipment = profile?.userEquipment || [];

  const userGauged = diffOrder[profile?.overallLevel ?? "beginner"] ?? 0;

  // Filter skills by equipment, then by level
  const availableSkills = skillExercises.filter((ex) => userCanDoExercise(ex, userEquipment));

  // Plan generator: show only skills at your gauged level; expandable box shows recommended next skills (higher difficulties) first, then less likely (lower difficulties).
  const currentLevel = availableSkills
    .filter((ex) => diffOrder[ex.difficulty] === userGauged)
    .sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
  const higherLevel = availableSkills
    .filter((ex) => diffOrder[ex.difficulty] > userGauged)
    .sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
  const lowerLevel = availableSkills
    .filter((ex) => diffOrder[ex.difficulty] < userGauged)
    .sort((a, b) => diffOrder[b.difficulty] - diffOrder[a.difficulty]);
  const archived = [...higherLevel, ...lowerLevel];

  const toggle = (id: string) => { setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const handleGenerateCalisthenics = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    addPlan(generateWeeklyPlan(ids, selectedGoal));
    setSelected(new Set()); setView("library"); setWorkoutType(null); setShowMore(false);
  };

  const handleGenerateYoga = () => {
    if (!selectedYogaGoal) return;
    addPlan(generateYogaPlanFromGoal(selectedYogaGoal.goal, yogaDuration));
    setSelectedYogaGoal(null); setView("library"); setWorkoutType(null);
  };

  const renderSkillButton = (ex: Exercise) => {
    const canDo = userCanDoExercise(ex, userEquipment);
    const isSel = selected.has(ex.id);
    const endpoint = getProgressionEndpoint(ex.id);
    const equipmentLabel = ex.equipment?.length
      ? ex.equipment.map((eq) => 
          eq === "pull-up-bar" ? "🏋️ Bar" : 
          eq === "rings" ? "🔗 Rings" : 
          eq === "wall" ? "🧗 Wall" : 
          eq === "parallettes" ? "📐 Bars" : 
          "⚙️ " + eq
        ).join(", ")
      : null;

    return (
      <button 
        key={ex.id} 
        onClick={() => canDo && toggle(ex.id)} 
        disabled={!canDo}
        className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
          !canDo 
            ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed" 
            : isSel 
            ? "border-emerald-400 bg-emerald-400/10 glass-card" 
            : "border-white/10 bg-white/5 glass hover:bg-white/8"
        }`}>
        <ExerciseIllustration exerciseId={ex.id} size={50} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm">{ex.name}</h3>
          <span className={`text-xs font-medium capitalize ${diffText[ex.difficulty]}`}>{ex.difficulty}</span>
          {!canDo && equipmentLabel && <p className="text-xs text-red-400 mt-0.5">Requires: {equipmentLabel}</p>}
          {canDo && endpoint && <p className="text-xs text-white/50 mt-0.5">→ <span className="text-emerald-400">{endpoint}</span></p>}
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSel ? "border-emerald-400 bg-emerald-400" : "border-white/30"}`}>
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
          <p className="text-white/60 text-sm">{view === "library" ? `${savedPlans.length} plan${savedPlans.length !== 1 ? "s" : ""}` : view === "type" ? "Choose type" : view === "yoga-goal" ? "Yoga setup" : view === "pick" ? "Select skills" : "Choose goal"}</p>
        </div>
        {view === "library" ? (
          <button onClick={() => setView("type")} className="glass px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10">+ New</button>
        ) : savedPlans.length > 0 ? (
          <button onClick={() => { setView("library"); setWorkoutType(null); setSelected(new Set()); setShowMore(false); }} className="glass px-4 py-2 rounded-full text-sm font-medium">My Plans</button>
        ) : null}
      </div>

      {/* Library */}
      {view === "library" && (
        <div className="space-y-4">
          {savedPlans.map((plan) => (
            <div key={plan.id} className="glass-card overflow-hidden">
              <Link href={`/workouts/plan?id=${plan.id}`} className="block p-5 hover:bg-white/8">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 capitalize">{plan.difficulty}</span>
                </div>
                <p className="text-white/60 text-sm mb-1">{plan.description}</p>
                <div className="flex gap-3 text-xs text-white/60 mt-2">
                  <span>📅 {plan.days.filter((d) => !d.isRest).length} days/wk</span>
                  <span>⏱ ~{plan.estimatedWeeklyMinutes} min/wk</span>
                </div>
              </Link>
              <div className="px-5 pb-4 flex gap-2">
                <Link href={`/workouts/plan?id=${plan.id}`} className="flex-1 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-semibold rounded-xl text-center text-sm hover:shadow-lg hover:shadow-emerald-500/30">Open</Link>
                {confirmDelete === plan.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => { removePlan(plan.id); setConfirmDelete(null); }} className="px-4 py-2 bg-red-500/30 text-red-300 rounded-xl text-sm font-semibold border border-red-500/50 hover:bg-red-500/50">Delete</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-2 glass text-sm">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(plan.id)} className="px-3 py-2 glass text-sm hover:bg-red-500/10 hover:text-red-400">🗑</button>
                )}
              </div>
            </div>
          ))}
          {savedPlans.length === 0 && <div className="text-center py-12 glass-card"><p className="text-4xl mb-3">📋</p><p className="text-white/70 font-semibold">No plans yet</p></div>}
        </div>
      )}

      {/* Choose Type */}
      {view === "type" && (
        <div className="space-y-4">
          <button onClick={() => { setWorkoutType("calisthenics"); setView("pick"); setSelected(new Set()); }} className="w-full glass-card p-6 text-left hover:bg-white/8 hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-4"><span className="text-4xl">💪</span><div><p className="text-white font-extrabold text-lg">Calisthenics</p><p className="text-white/60 text-sm">Strength & skill progressions</p></div></div>
          </button>
          {yogaUnlocked ? (
            <button onClick={() => { setWorkoutType("flexibility"); setView("yoga-goal"); }} className="w-full glass-card p-6 text-left hover:bg-white/8 hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-4"><span className="text-4xl">🧘</span><div><p className="text-white font-extrabold text-lg">Yoga & Flexibility</p><p className="text-white/60 text-sm">Custom yoga routine for your goals</p></div></div>
            </button>
          ) : (
            <div className="w-full glass-card p-6 opacity-60"><div className="flex items-center gap-4"><span className="text-4xl">🔒</span><div><p className="text-white font-bold">Yoga</p><p className="text-white/60 text-sm">Set up yoga to unlock</p></div></div></div>
          )}
        </div>
      )}

      {/* Yoga Goal Input */}
      {view === "yoga-goal" && (
        <div className="space-y-6">
          <div>
            <p className="text-white font-bold mb-3">What do you want from yoga?</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {yogaGoalPresets.map((p) => (
                <button key={p.label} onClick={() => setSelectedYogaGoal(p)}
                  className={`p-3 rounded-xl text-left text-sm transition-all ${selectedYogaGoal?.label === p.label ? "glass-card border-2 border-emerald-400" : "glass border-2 border-transparent hover:border-white/20"}`}>
                  <span className="text-lg">{p.icon}</span>
                  <p className="text-white font-medium mt-1 text-xs">{p.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-bold mb-2">Session length</p>
            <p className="text-white/60 text-xs mb-3">How long would you like each yoga session?</p>
            <div className="flex gap-2">
              {[10, 20, 30, 45, 60].map((min) => (
                <button key={min} onClick={() => setYogaDuration(min)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${yogaDuration === min ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900" : "glass"}`}>
                  {min}m
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerateYoga} disabled={!selectedYogaGoal}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${selectedYogaGoal ? "glass-button" : "glass opacity-50 cursor-not-allowed"}`}>
            Generate Yoga Routine 🧘
          </button>
        </div>
      )}

      {/* Calisthenics Skill Pick */}
      {view === "pick" && workoutType === "calisthenics" && (
        <>
          <p className="text-white/60 text-sm font-medium mb-1">Skills at your level</p>
          <p className="text-xs text-white/40 mb-3 capitalize">Your profile: {profile?.overallLevel ?? "beginner"}</p>
          <div className="space-y-2 mb-4">{currentLevel.map(renderSkillButton)}</div>

          {archived.length > 0 && (
            <>
              <button type="button" onClick={() => setShowMore(!showMore)} className="w-full py-3 glass rounded-xl text-sm font-medium text-white/60 hover:text-white mb-2 flex items-center justify-center gap-2">
                {showMore ? "Hide" : "Show"} other skill levels ({archived.length}) <span className="text-xs">{showMore ? "▲" : "▼"}</span>
              </button>
              {showMore && (
                <div className="space-y-2 mb-4">
                  {higherLevel.length > 0 && (
                    <>
                      <p className="text-xs text-emerald-400 font-medium mb-2">🚀 Highly recommended next skills</p>
                      <div className="space-y-2 mb-3">{higherLevel.map(renderSkillButton)}</div>
                    </>
                  )}
                  {lowerLevel.length > 0 && (
                    <>
                      <p className="text-xs text-white/40 font-medium mb-2">📌 Skills to revisit first</p>
                      <div className="space-y-2">{lowerLevel.map(renderSkillButton)}</div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          <div className="sticky bottom-20 z-40 pb-2">
            <button onClick={() => { if (selected.size > 0) setView("goal"); }} disabled={selected.size === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg ${selected.size > 0 ? "glass-button" : "glass opacity-50 cursor-not-allowed"}`}>
              {selected.size === 0 ? "Select skills" : "Next: Choose Goal →"}
            </button>
          </div>
        </>
      )}

      {/* Goal Selection */}
      {view === "goal" && (
        <>
          <p className="text-white/60 text-sm mb-4">Which Overcoming Gravity approach fits your goals?</p>
          <div className="space-y-3 mb-6">
            {goalOptions.map((g) => (
              <button
                key={g.value}
                onClick={() => setSelectedGoal(g.value)}
                className={`w-full p-4 rounded-2xl text-left flex items-start gap-4 border-2 transition-all ${
                  selectedGoal === g.value ? "border-emerald-400 bg-emerald-400/10 glass-card" : "border-white/10 glass hover:border-white/20"
                }`}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{g.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold">{g.label}</p>
                  <p className="text-white/60 text-xs mt-1">{g.description}</p>
                </div>
                {selectedGoal === g.value && <span className="ml-auto text-emerald-400 text-lg flex-shrink-0 mt-0.5">✓</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-3 sticky bottom-20 z-40 pb-2">
            <button onClick={() => setView("pick")} className="glass px-6 py-4 rounded-2xl font-bold">← Back</button>
            <button onClick={handleGenerateCalisthenics} className="glass-button flex-1 py-4 text-lg">Generate Plan 🚀</button>
          </div>
        </>
      )}
    </div>
  );
}
