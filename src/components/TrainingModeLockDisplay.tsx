"use client";

import { useState, useEffect } from "react";
import { RankingDecision, TrainingMode } from "@/lib/types";
import { isTrainingModeLocked, getTimeUntilUnlock } from "@/lib/rankingSystem";

interface TrainingModeLockDisplayProps {
  rankingDecision: RankingDecision | undefined;
  onChangeMode: () => void;
}

export default function TrainingModeLockDisplay({ rankingDecision, onChangeMode }: TrainingModeLockDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const isLocked = isTrainingModeLocked(rankingDecision);

  useEffect(() => {
    if (!rankingDecision) return;

    const updateTimer = () => {
      const time = getTimeUntilUnlock(rankingDecision);
      if (!time) {
        setTimeRemaining("");
        return;
      }
      
      const formatted = `${time.hours}h ${time.minutes}m`;
      setTimeRemaining(formatted);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [rankingDecision]);

  if (!rankingDecision) return null;

  const modeLabel = rankingDecision.trainingMode === "strength" ? "💪 Strength" : "🏃 Endurance";
  const decidedTime = new Date(rankingDecision.decidedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="glass-card p-4 mb-4 border-l-4 border-emerald-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-white">🎯 Training Mode: {modeLabel}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${isLocked ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
              {isLocked ? "🔒 Locked" : "🔓 Unlocked"}
            </span>
          </div>
          {isLocked && timeRemaining && (
            <p className="text-xs text-white/60">
              Decided at {decidedTime} • Can change in {timeRemaining}
            </p>
          )}
          {!isLocked && (
            <p className="text-xs text-white/60">
              Decision is no longer locked
            </p>
          )}
        </div>
        
        {!isLocked && (
          <button
            onClick={onChangeMode}
            className="flex-shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm"
          >
            Change Mode
          </button>
        )}
      </div>
    </div>
  );
}
