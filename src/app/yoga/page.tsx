"use client";

import { useState } from "react";
import { yogaPoses } from "@/data/yoga";
import { YogaPose } from "@/lib/types";
import PageBackground from "@/components/PageBackground";

const categories = [
  { value: "all", label: "All" },
  { value: "flexibility", label: "Flexibility" },
  { value: "balance", label: "Balance" },
  { value: "strength", label: "Strength" },
  { value: "relaxation", label: "Relaxation" },
];

const diffColors: Record<string, string> = {
  beginner: "bg-green-500/15 text-green-400",
  intermediate: "bg-yellow-500/15 text-yellow-400",
  advanced: "bg-red-500/15 text-red-400",
  elite: "bg-fuchsia-500/15 text-fuchsia-400",
};

export default function YogaPage() {
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState<YogaPose | null>(null);

  const filtered = cat === "all" ? yogaPoses : yogaPoses.filter((p) => p.category === cat);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <PageBackground variant="yoga" />
      <h1 className="text-3xl font-extrabold text-white mb-1">Yoga & Flexibility</h1>
      <p className="text-white/60 mb-6 text-sm">{yogaPoses.length} poses for recovery, flexibility, and balance</p>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((c) => (
          <button key={c.value} onClick={() => setCat(c.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              cat === c.value ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900" : "glass"
            }`}>{c.label}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((pose) => (
          <button key={pose.id} onClick={() => setSelected(pose)}
            className="w-full glass-card p-4 text-left hover:bg-white/8 hover:scale-[1.01] transition-all">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{pose.image}</span>
              <div className="flex-1">
                <h3 className="font-bold text-white">{pose.name}</h3>
                <p className="text-white/50 text-xs italic">{pose.sanskrit}</p>
                <p className="text-white/60 text-xs mt-1 line-clamp-1">{pose.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${diffColors[pose.difficulty]}`}>{pose.difficulty}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300">{pose.category}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300">{pose.holdSeconds}s hold</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Pose Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}>
          <div className="glass-card rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">{selected.name}</h2>
                <p className="text-sm text-white/60 italic">{selected.sanskrit}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-2xl">✕</button>
            </div>
            <div className="text-center text-6xl mb-4">{selected.image}</div>
            <p className="text-white/80 mb-4">{selected.description}</p>
            <div className="glass-card rounded-xl p-4 mb-4 text-center">
              <p className="text-3xl font-black text-emerald-400">{selected.holdSeconds}s</p>
              <p className="text-xs text-white/60">recommended hold time</p>
            </div>
            <div className="mb-4">
              <h3 className="font-bold text-white mb-2">Target Areas</h3>
              <div className="flex flex-wrap gap-2">
                {selected.targetAreas.map((a) => (
                  <span key={a} className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full capitalize">{a}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Instructions</h3>
              <ol className="space-y-2">
                {selected.instructions.map((s, i) => (
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
    </div>
  );
}
