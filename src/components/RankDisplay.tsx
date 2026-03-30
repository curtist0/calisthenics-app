"use client";

import { Rank } from "@/lib/types";
import type { EnhancedRanks } from "@/lib/rankingSystem";

interface RankDisplayProps {
  ranks: any; // EnhancedRanks or basic { push, pull, core, legs }
  size?: "sm" | "md" | "lg";
  hideFlexibilityIfNoYoga?: boolean;
  yogaSetUp?: boolean;
}

const rankEmojis: Record<string, string> = {
  push: "💪",
  pull: "🤝",
  core: "🔥",
  legs: "🦵",
  balance: "⚖️",
  flexibility: "🤸",
};

const rankLabels: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  core: "Core",
  legs: "Legs",
  balance: "Balance",
  flexibility: "Flexibility",
};

const rankColors: Record<Rank, string> = {
  F: "from-gray-600 to-gray-700",
  E: "from-blue-600 to-blue-700",
  D: "from-cyan-600 to-cyan-700",
  C: "from-green-600 to-green-700",
  B: "from-yellow-600 to-yellow-700",
  A: "from-orange-600 to-orange-700",
  S: "from-rose-600 to-rose-700",
};

const rankGlow: Record<Rank, string> = {
  F: "",
  E: "",
  D: "",
  C: "",
  B: "shadow-lg shadow-yellow-500/30",
  A: "shadow-lg shadow-orange-500/30",
  S: "shadow-lg shadow-rose-500/30",
};

const sizeMaps = {
  sm: { badge: "w-12 h-12", text: "text-sm", emoji: "text-lg" },
  md: { badge: "w-16 h-16", text: "text-base", emoji: "text-2xl" },
  lg: { badge: "w-20 h-20", text: "text-lg", emoji: "text-3xl" },
};

export default function RankDisplay({
  ranks,
  size = "md",
  hideFlexibilityIfNoYoga = false,
  yogaSetUp = true,
}: RankDisplayProps) {
  const sizeConfig = sizeMaps[size];
  
  // Always include flexibility in display
  const planes: Array<"push" | "pull" | "core" | "legs" | "balance" | "flexibility"> = [
    "push",
    "pull",
    "core",
    "legs",
    "balance",
    "flexibility",
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {planes.map((plane) => {
        const isFlexibility = plane === "flexibility";
        const isUnlocked = !isFlexibility || yogaSetUp;
        const rankData = ranks[plane];
        // Handle both EnhancedRank objects and simple Rank strings
        const rank = (rankData?.rank || rankData || "F") as Rank;
        const bgGradient = rankColors[rank];
        const glow = rankGlow[rank];

        return (
          <div
            key={plane}
            className="flex flex-col items-center gap-2"
          >
            <div 
              className={`relative flex flex-col items-center justify-center ${sizeConfig.badge} rounded-full bg-gradient-to-br ${bgGradient} border-2 border-white/20 ${glow} transition-all ${
                !isUnlocked ? "opacity-50" : ""
              }`}
            >
              <span className={`${sizeConfig.emoji}`}>{rankEmojis[plane]}</span>
              <span className={`absolute bottom-1 font-bold text-white ${sizeConfig.text}`}>
                {rank}
              </span>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <span className="text-lg">🔒</span>
                </div>
              )}
            </div>
            <p className={`text-xs sm:text-sm font-medium text-center ${
              isUnlocked ? "text-gray-300" : "text-gray-500"
            }`}>
              {rankLabels[plane]}
            </p>
            {!isUnlocked && (
              <p className="text-[10px] text-gray-500 text-center max-w-[80px]">
                Set up Yoga to progress
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
