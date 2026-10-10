"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { REST_DURATION_OPTIONS, getRestRemainingSeconds, RestDuration } from "@/lib/workoutSession";

interface RestTimerProps {
  seconds: RestDuration;
  startedAt: string;
  onDurationChange: (seconds: RestDuration) => void;
  onComplete: () => void;
  onSkip: () => void;
  nextName: string;
  nextPreview: ReactNode;
  cue?: string;
}

export default function RestTimer({ seconds, startedAt, onDurationChange, onComplete, onSkip, nextName, nextPreview, cue }: RestTimerProps) {
  const [remaining, setRemaining] = useState(() => getRestRemainingSeconds(startedAt, seconds));
  const completeRef = useRef(onComplete);
  const didComplete = useRef(false);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    didComplete.current = false;
    const update = () => {
      const next = getRestRemainingSeconds(startedAt, seconds);
      setRemaining(next);
      if (next === 0 && !didComplete.current) {
        didComplete.current = true;
        completeRef.current();
      }
    };
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [seconds, startedAt]);

  const progress = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-950/95 px-4 pb-8 pt-6 backdrop-blur-sm">
      <section aria-label="Rest timer" className="w-full max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Rest & reset</p>
            <h2 className="mt-1 text-2xl font-extrabold text-white">Next up</h2>
          </div>
          <button type="button" onClick={onSkip} className="min-h-12 rounded-xl bg-gray-800 px-4 text-sm font-bold text-white hover:bg-gray-700">
            Skip rest
          </button>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-4">
          {nextPreview}
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Coming up</p>
            <h3 className="mt-1 break-words text-lg font-bold text-white">{nextName}</h3>
            {cue && <p className="mt-2 text-sm text-gray-400">{cue}</p>}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-3xl border border-gray-800 bg-gray-900 p-6">
          <div className="relative h-36 w-36">
            <svg aria-hidden="true" className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#374151" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent-color)" strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)} className="transition-[stroke-dashoffset] duration-200 motion-reduce:transition-none" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span role="timer" aria-live="off" className="font-mono text-4xl font-extrabold text-white">{remaining}</span>
            </div>
          </div>
          <fieldset className="w-full">
            <legend className="mb-2 text-center text-xs font-semibold text-gray-400">Rest duration</legend>
            <div className="grid grid-cols-4 gap-2">
              {REST_DURATION_OPTIONS.map((duration) => (
                <button key={duration} type="button" aria-pressed={seconds === duration} onClick={() => onDurationChange(duration)} className={`min-h-11 rounded-xl text-sm font-bold ${seconds === duration ? "bg-brand-500 text-gray-950" : "bg-gray-800 text-gray-300"}`}>
                  {duration}s
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </section>
    </div>
  );
}
