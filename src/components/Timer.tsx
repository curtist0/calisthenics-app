"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { playTimerBeep } from "@/lib/audio";

interface TimerProps {
  targetSeconds: number;
  onComplete: (actualSeconds: number) => void;
  label?: string;
  setNumber?: number;
}

export default function Timer({ targetSeconds, onComplete, label, setNumber }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const autoFinishedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset timer when setNumber changes
  useEffect(() => {
    setSeconds(0);
    setIsRunning(false);
    autoFinishedRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [setNumber]);

  const progress = targetSeconds <= 0 ? 100 : Math.min((seconds / targetSeconds) * 100, 100);

  const startTimer = useCallback(() => {
    autoFinishedRef.current = false;
    setIsRunning(true);
  }, []);

  const stopAndRecord = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    playTimerBeep();
    onCompleteRef.current(seconds);
  }, [seconds]);

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

  // When the hold reaches the target time, finish automatically (rest → next exercise follows from parent).
  useEffect(() => {
    if (!isRunning || autoFinishedRef.current) return;
    if (seconds < targetSeconds) return;
    autoFinishedRef.current = true;
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    playTimerBeep();
    onCompleteRef.current(targetSeconds);
  }, [seconds, targetSeconds, isRunning]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-4">
      {label && <p className="text-gray-400 text-sm">{label}</p>}

      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#374151" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={seconds >= targetSeconds ? "#22c55e" : "#4ade80"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white font-mono">{formatTime(seconds)}</span>
          <span className="text-xs text-gray-400">target {formatTime(targetSeconds)}</span>
        </div>
      </div>

      {!isRunning ? (
        <button
          onClick={startTimer}
          className="px-8 py-3 bg-brand-500 text-white rounded-full font-semibold hover:bg-brand-600 transition-colors text-lg"
        >
          {seconds > 0 ? "Resume" : "Start"}
        </button>
      ) : (
        <button
          onClick={stopAndRecord}
          className="px-8 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors text-lg"
        >
          Stop & Record ({seconds}s)
        </button>
      )}

      {seconds > 0 && !isRunning && (
        <p className="text-sm text-brand-400 font-medium">Recorded: {seconds}s</p>
      )}
    </div>
  );
}
