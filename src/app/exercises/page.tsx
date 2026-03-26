"use client";

import { useState } from "react";
import { exercises } from "@/data/exercises";
import { yogaPoses } from "@/data/yoga";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseModal from "@/components/ExerciseModal";
import { Exercise, ExerciseCategory, Difficulty, YogaPose } from "@/lib/types";
import PageBackground from "@/components/PageBackground";
import { useWorkout } from "@/context/WorkoutContext";

const exCategories: { value: ExerciseCategory | "all"; label: string }[] = [
  { value: "all", label: "All" }, { value: "push", label: "Push" }, { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" }, { value: "core", label: "Core" }, { value: "skill", label: "Skills" },
];

const difficulties: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All" }, { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" }, { value: "advanced", label: "Advanced" }, { value: "elite", label: "Elite" },
];

const yogaCategories = [
  { value: "all", label: "All" }, { value: "flexibility", label: "Flexibility" },
  { value: "balance", label: "Balance" }, { value: "strength", label: "Strength" }, { value: "relaxation", label: "Relaxation" },
];

const diffColors: Record<string, string> = {
  beginner: "bg-green-500/15 text-green-400", intermediate: "bg-yellow-500/15 text-yellow-400",
  advanced: "bg-red-500/15 text-red-400", elite: "bg-fuchsia-500/15 text-fuchsia-400",
};

const difficultyRank: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  elite: 3,
};

export default function ExercisesPage() {
  const { profile } = useWorkout();
  const yogaUnlocked = profile?.yogaSetUp ?? false;
  const [tab, setTab] = useState<"exercises" | "yoga">("exercises");
  const [selCat, setSelCat] = useState<ExerciseCategory | "all">("all");
  const [selDiff, setSelDiff] = useState<Difficulty | "all">("all");
  const [selExercise, setSelExercise] = useState<Exercise | null>(null);
  const [yogaCat, setYogaCat] = useState("all");
  const [selYoga, setSelYoga] = useState<YogaPose | null>(null);

  const filteredEx = exercises
    .filter((e) => {
      if (selCat !== "all" && e.category !== selCat) return false;
      if (selDiff !== "all" && e.difficulty !== selDiff) return false;
      return true;
    })
    .sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty]);

  const filteredYoga = (yogaCat === "all" ? yogaPoses : yogaPoses.filter((p) => p.category === yogaCat)).sort(
    (a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty]
  );

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <PageBackground variant="exercises" />
      <h1 className="text-3xl font-extrabold text-white mb-1">Library</h1>
      <p className="text-white/60 mb-4 text-sm">{exercises.length} exercises + {yogaPoses.length} yoga poses</p>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab("exercises")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === "exercises" ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900" : "glass"}`}>
          💪 Exercises
        </button>
        {yogaUnlocked ? (
          <button onClick={() => setTab("yoga")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === "yoga" ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900" : "glass"}`}>
            🧘 Yoga & Flexibility
          </button>
        ) : (
          <div className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white/5 text-white/50 text-center border border-white/10">🔒 Yoga (not set up)</div>
        )}
      </div>

      {/* Exercises Tab */}
      {tab === "exercises" && (
        <>
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
            {exCategories.map((c) => (
              <button key={c.value} onClick={() => setSelCat(c.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selCat === c.value ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900" : "glass"}`}>{c.label}</button>
            ))}
          </div>
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
            {difficulties.map((d) => (
              <button key={d.value} onClick={() => setSelDiff(d.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selDiff === d.value ? "bg-white/15 text-white border border-white/20" : "glass"}`}>{d.label}</button>
            ))}
          </div>
          <p className="text-xs text-white/60 mb-3">{filteredEx.length} exercises</p>
          <div className="space-y-3">
            {filteredEx.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} onClick={() => setSelExercise(ex)} />
            ))}
          </div>
          {selExercise && <ExerciseModal exercise={selExercise} onClose={() => setSelExercise(null)} />}
        </>
      )}

      {/* Yoga Tab */}
      {tab === "yoga" && (
        <>
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
            {yogaCategories.map((c) => (
              <button key={c.value} onClick={() => setYogaCat(c.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${yogaCat === c.value ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900" : "glass"}`}>{c.label}</button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredYoga.map((pose) => (
              <button key={pose.id} onClick={() => setSelYoga(pose)} className="w-full glass-card p-4 text-left hover:bg-white/8 hover:scale-[1.01] transition-all">
                <div className="flex items-center gap-4">
                  {pose.imageUrl ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pose.imageUrl} alt={pose.name} className="w-full h-full object-contain" loading="lazy" />
                    </div>
                  ) : (
                    <span className="text-3xl">{pose.image}</span>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{pose.name}</h3>
                    <p className="text-white/50 text-xs italic">{pose.sanskrit}</p>
                    <div className="flex gap-1.5 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${diffColors[pose.difficulty]}`}>{pose.difficulty}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300">{pose.category}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300">{pose.holdSeconds}s</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {/* Yoga Pose Modal */}
          {selYoga && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setSelYoga(null)}>
              <div className="glass-card rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{selYoga.name}</h2>
                    <p className="text-sm text-white/60 italic">{selYoga.sanskrit}</p>
                  </div>
                  <button onClick={() => setSelYoga(null)} className="text-white/60 hover:text-white text-2xl">✕</button>
                </div>
                {selYoga.imageUrl ? (
                  <div className="flex justify-center mb-4">
                    <div className="w-48 h-48 rounded-2xl overflow-hidden bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selYoga.imageUrl} alt={selYoga.name} className="w-full h-full object-contain" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-6xl mb-4">{selYoga.image}</div>
                )}
                <p className="text-white/80 mb-4">{selYoga.description}</p>
                <div className="glass-card rounded-xl p-4 mb-4 text-center">
                  <p className="text-3xl font-black text-emerald-400">{selYoga.holdSeconds}s</p>
                  <p className="text-xs text-white/60">recommended hold</p>
                </div>
                <div className="mb-4">
                  <h3 className="font-bold text-white mb-2">Target Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selYoga.targetAreas.map((a) => (
                      <span key={a} className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full capitalize">{a}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">Instructions</h3>
                  <ol className="space-y-2">
                    {selYoga.instructions.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        <span className="text-white/80 text-sm">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
