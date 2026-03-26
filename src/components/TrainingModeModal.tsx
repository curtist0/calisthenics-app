"use client";

import { TrainingMode } from "@/lib/types";

interface TrainingModeModalProps {
  isOpen: boolean;
  onSelectMode: (mode: TrainingMode) => void;
}

export default function TrainingModeModal({ isOpen, onSelectMode }: TrainingModeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-card rounded-3xl p-8 w-full max-w-sm mx-4">
        <h2 className="text-2xl font-extrabold text-white mb-2">🎯 Choose Your Training Focus</h2>
        <p className="text-white/60 text-sm mb-6">
          This determines how your ranks are calculated. You can change this after 24 hours.
        </p>

        {/* Warning Section */}
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 mb-6">
          <p className="text-amber-300 text-sm">
            <span className="font-bold">⚠️ Important:</span> Strength and Endurance training are at opposite ends of the spectrum. Choose the one that matches your current goals — you'll be locked into this for 24 hours.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* Strength Option */}
          <button
            onClick={() => onSelectMode("strength")}
            className="w-full glass-card p-5 text-left hover:bg-emerald-500/20 border-2 border-transparent hover:border-emerald-500 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl group-hover:scale-110 transition-transform">💪</div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Strength</h3>
                <p className="text-white/60 text-sm mt-1">
                  Master elite skills and progressions. Ranked by the hardest exercises you can perform.
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">Skill-based</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">Progression</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">Elite Focus</span>
                </div>
              </div>
            </div>
          </button>

          {/* Endurance Option */}
          <button
            onClick={() => onSelectMode("endurance")}
            className="w-full glass-card p-5 text-left hover:bg-cyan-500/20 border-2 border-transparent hover:border-cyan-500 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl group-hover:scale-110 transition-transform">🏃</div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Endurance</h3>
                <p className="text-white/60 text-sm mt-1">
                  Build work capacity and volume. Ranked by total reps and stamina across exercises.
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">Volume-based</span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">Reps</span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">Stamina</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Confirmation Note */}
        <p className="text-white/50 text-xs text-center">
          After selecting, you'll be locked in for 24 hours. Choose wisely!
        </p>
      </div>
    </div>
  );
}
