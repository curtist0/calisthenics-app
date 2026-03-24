"use client";
import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  unlocked?: boolean;
  emoji?: string;
};

export default function Badge({ title, subtitle, unlocked = false, emoji }: Props) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${unlocked ? "bg-gradient-to-r from-amber-500/20 via-pink-500/10 to-indigo-500/10 border-amber-400/50 shadow-[0_0_20px_rgba(250,204,21,0.08)]" : "bg-gray-800/40 border-gray-700/60"}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${unlocked ? "bg-amber-400/10" : "bg-gray-900/40"}`}>
        <span className="text-lg">{emoji || "🏅"}</span>
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-semibold ${unlocked ? "text-amber-300" : "text-gray-200"}`}>{title}</span>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
}
