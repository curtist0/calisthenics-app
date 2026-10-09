"use client";

import { useState } from "react";
import { exercises } from "@/data/exercises";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseModal from "@/components/ExerciseModal";
import { Exercise, ExerciseCategory, Difficulty } from "@/lib/types";
import PageBackground from "@/components/PageBackground";

const exCategories: { value: ExerciseCategory | "all"; label: string }[] = [
  { value: "all", label: "All" }, { value: "push", label: "Push" }, { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" }, { value: "core", label: "Core" }, { value: "skill", label: "Skills" },
  { value: "full-body", label: "Full Body" },
];

const difficulties: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All" }, { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" }, { value: "advanced", label: "Advanced" }, { value: "elite", label: "Elite" },
];

const difficultyRank: Record<Difficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  elite: 3,
};

export default function ExercisesPage() {
  const [selCat, setSelCat] = useState<ExerciseCategory | "all">("all");
  const [selDiff, setSelDiff] = useState<Difficulty | "all">("all");
  const [selExercise, setSelExercise] = useState<Exercise | null>(null);

  const filteredEx = exercises
    .filter((e) => {
      if (selCat !== "all" && e.category !== selCat) return false;
      if (selDiff !== "all" && e.difficulty !== selDiff) return false;
      return true;
    })
    .sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <PageBackground variant="exercises" />
      <h1 className="text-3xl font-extrabold text-white mb-1">Library</h1>
      <p className="text-gray-400 mb-4 text-sm">{exercises.length} exercises</p>

      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
        {exCategories.map((c) => (
          <button key={c.value} onClick={() => setSelCat(c.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${selCat === c.value ? "bg-brand-500 text-white" : "bg-gray-800 text-gray-300"}`}>{c.label}</button>
        ))}
      </div>
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {difficulties.map((d) => (
          <button key={d.value} onClick={() => setSelDiff(d.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${selDiff === d.value ? "bg-gray-600 text-white" : "bg-gray-800/50 text-gray-400"}`}>{d.label}</button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-3">{filteredEx.length} exercises</p>
      <div className="space-y-3">
        {filteredEx.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} onClick={() => setSelExercise(ex)} />
        ))}
      </div>
      {selExercise && <ExerciseModal exercise={selExercise} onClose={() => setSelExercise(null)} />}
    </div>
  );
}
