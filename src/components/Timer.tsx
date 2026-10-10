"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TimerProps {
  targetSeconds: number;
  onComplete: (actualSeconds: number) => void;
  label?: string;
  setNumber?: number;
}

export default function Timer({ targetSeconds, onComplete, label, setNumber }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const autoFinishedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setSeconds(0);
    setIsRunning(false);
    startedAtRef.current = null;
    autoFinishedRef.current = false;
  }, [setNumber]);

  const complete = useCallback((actualSeconds: number) => {
    if (autoFinishedRef.current) return;
    autoFinishedRef.current = true;
    setIsRunning(false);
    onCompleteRef.current(actualSeconds);
  }, []);

  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now();
    setIsRunning(true);
  }, []);

  const stopAndRecord = useCallback(() => {
    const elapsed = startedAtRef.current === null ? seconds : Math.max(seconds, Math.floor((Date.now() - startedAtRef.current) / 1000));
    setSeconds(elapsed);
    setIsRunning(false);
    complete(elapsed);
  }, [complete, seconds]);

  useEffect(() => {
    if (!isRunning) return;
    const update = () => {
      if (startedAtRef.current === null) return;
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setSeconds(elapsed);
      if (targetSeconds > 0 && elapsed >= targetSeconds) complete(targetSeconds);
    };
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [complete, isRunning, targetSeconds]);

  const progress = targetSeconds <= 0 ? 100 : Math.min((seconds / targetSeconds) * 100, 100);
  const formatTime = (value: number) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-4">
      {label && <p className="text-sm text-gray-400">{label}</p>}
      <div className="relative h-36 w-36">
        <svg aria-hidden="true" className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#374151" strokeWidth="8" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent-color)" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)} className="transition-[stroke-dashoffset] duration-200 motion-reduce:transition-none" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span role="timer" aria-live="off" className="font-mono text-3xl font-bold text-white">{formatTime(seconds)}</span>
          <span className="text-xs text-gray-400">target {formatTime(targetSeconds)}</span>
        </div>
      </div>
      {!isRunning ? (
        <button type="button" onClick={startTimer} className="min-h-14 rounded-2xl bg-brand-500 px-8 text-lg font-bold text-gray-950 hover:bg-brand-400">
          {seconds > 0 ? "Resume hold" : "Start hold"}
        </button>
      ) : (
        <button type="button" onClick={stopAndRecord} className="min-h-14 rounded-2xl bg-gray-800 px-8 text-base font-bold text-white hover:bg-gray-700">
          Complete hold · {seconds}s
        </button>
      )}
    </div>
  );
}
