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
    <div
      className={`group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
        unlocked
          ? "bg-gradient-to-b from-amber-500/20 via-amber-400/5 to-transparent border-amber-400/40 shadow-lg hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] hover:border-amber-400/60"
          : "bg-gradient-to-b from-gray-600/10 to-gray-700/10 border-gray-600/30 shadow-none"
      }`}
    >
      <div className={`text-4xl mb-2 transition-transform ${unlocked ? "group-hover:scale-110" : "opacity-60"}`}>
        {emoji || "🏅"}
      </div>
      <h3 className={`text-sm font-bold text-center ${unlocked ? "text-amber-300" : "text-gray-400"}`}>{title}</h3>
      {subtitle && <p className={`text-xs text-center mt-1 ${unlocked ? "text-gray-300" : "text-gray-500"}`}>{subtitle}</p>}
      {!unlocked && <p className="text-xs text-gray-500 mt-2">🔒 Locked</p>}
    </div>
  );
}

