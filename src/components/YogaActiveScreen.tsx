"use client";

import { useState, useEffect, useRef } from "react";
import { YogaPose } from "@/lib/types";
import { getYogaPoseById } from "@/data/yoga";

interface YogaActiveScreenProps {
  currentPose: YogaPose;
  currentSet: number;
  totalSets: number;
  onPoseComplete: () => void;
  onPause: () => void;
  imageUrl: string;
}

export default function YogaActiveScreen({
  currentPose,
  currentSet,
  totalSets,
  onPoseComplete,
  onPause,
  imageUrl,
}: YogaActiveScreenProps) {
  const [remainingTime, setRemainingTime] = useState(currentPose.holdSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          // Auto-complete when timer reaches 0
          setTimeout(() => onPoseComplete(), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onPoseComplete]);

  const progressPercent = ((currentPose.holdSeconds - remainingTime) / currentPose.holdSeconds) * 100;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-20 flex flex-col h-screen">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-white/60 uppercase tracking-widest mb-2">Set {currentSet} of {totalSets}</p>
        <h1 className="text-3xl font-extrabold text-white">{currentPose.name}</h1>
        {currentPose.sanskrit && (
          <p className="text-sm text-purple-400 italic mt-1">{currentPose.sanskrit}</p>
        )}
      </div>

      {/* Pose Image/GIF */}
      <div className="flex-1 flex items-center justify-center mb-6">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={currentPose.name}
            className="max-w-full max-h-96 object-contain rounded-2xl"
          />
        ) : (
          <div className="text-8xl">{currentPose.image}</div>
        )}
      </div>

      {/* Description */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="text-white/80 text-sm leading-relaxed">{currentPose.description}</p>
      </div>

      {/* Timer Display */}
      <div className="glass-card rounded-2xl p-8 mb-6 text-center">
        <p className="text-xs text-white/60 uppercase tracking-wider mb-3">Time Remaining</p>
        <p className="text-6xl font-black text-emerald-400 font-mono mb-4">
          {remainingTime.toString().padStart(2, "0")}
        </p>
        
        {/* Progress Ring */}
        <div className="w-40 h-40 mx-auto relative mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray={`${(progressPercent / 100) * 282.74} 282.74`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p className="text-sm text-white/60">
          {isRunning ? "Breathe deeply and hold..." : "Pose complete!"}
        </p>
      </div>

      {/* Target Areas */}
      {currentPose.targetAreas && currentPose.targetAreas.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Target Areas</p>
          <div className="flex flex-wrap gap-2">
            {currentPose.targetAreas.map((area) => (
              <span
                key={area}
                className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 capitalize"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-slate-950/95 border-t border-white/10 flex gap-3">
        {isRunning ? (
          <>
            <button
              onClick={() => setIsRunning(false)}
              className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold transition-colors border border-white/20"
            >
              ⏸ Pause
            </button>
            <button
              onClick={onPause}
              className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold transition-colors border border-white/20"
            >
              ↪ Resume Later
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsRunning(true)}
              className="flex-1 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl font-bold transition-colors border border-emerald-500/30"
            >
              ▶ Resume
            </button>
            <button
              onClick={onPoseComplete}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors"
            >
              ✓ Next Pose
            </button>
          </>
        )}
      </div>
    </div>
  );
}
