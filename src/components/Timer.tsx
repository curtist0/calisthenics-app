"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TimerProps {
  targetSeconds: number;
  onComplete: (actualSeconds: number) => void;
  label?: string;
}

export default function Timer({ targetSeconds, onComplete, label }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = Math.min((seconds / targetSeconds) * 100, 100);
  const isComplete = seconds >= targetSeconds;

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onComplete(seconds);
  }, [seconds, onComplete]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {label && <p className="text-gray-400 text-sm">{label}</p>}

      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={isComplete ? "#22c55e" : "#4ade80"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white font-mono">
            {formatTime(seconds)}
          </span>
          <span className="text-xs text-gray-400">
            / {formatTime(targetSeconds)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="px-6 py-2 bg-brand-500 text-white rounded-full font-semibold hover:bg-brand-600 transition-colors"
          >
            {seconds > 0 ? "Resume" : "Start"}
          </button>
        ) : (
          <button
            onClick={stopTimer}
            className="px-6 py-2 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors"
          >
            Stop
          </button>
        )}
        {seconds > 0 && !isRunning && (
          <button
            onClick={resetTimer}
            className="px-6 py-2 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
