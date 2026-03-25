"use client";

import { Rank } from "@/lib/types";

interface RankDisplayProps {
  ranks: { push: Rank; pull: Rank; core: Rank; legs: Rank };
  size?: "sm" | "md" | "lg";
}

const rankEmojis: Record<string, string> = {
  push: "💪",
  pull: "🤝",
  core: "🔥",
  legs: "🦵",
};

const rankLabels: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  core: "Core",
  legs: "Legs",
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
}: RankDisplayProps) {
  const sizeConfig = sizeMaps[size];
  const planes: Array<"push" | "pull" | "core" | "legs"> = [
    "push",
    "pull",
    "core",
    "legs",
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {planes.map((plane) => {
        const rank = ranks[plane];
        const bgGradient = rankColors[rank];
        const glow = rankGlow[rank];

        return (
          <div
            key={plane}
            className="flex flex-col items-center gap-2"
          >
            <div className={`relative flex flex-col items-center justify-center ${sizeConfig.badge} rounded-full bg-gradient-to-br ${bgGradient} border-2 border-white/20 ${glow} transition-all`}>
              <span className={`${sizeConfig.emoji}`}>{rankEmojis[plane]}</span>
              <span className={`absolute bottom-1 font-bold text-white ${sizeConfig.text}`}>
                {rank}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-300 text-center">
              {rankLabels[plane]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
