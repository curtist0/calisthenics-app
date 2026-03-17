"use client";

import { useState, useEffect, useRef } from "react";

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
}

export default function RestTimer({ seconds, onComplete }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds, onComplete]);

  const progress = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-3xl p-8 flex flex-col items-center gap-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white">Rest</h3>

        <div className="relative w-40 h-40">
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
              stroke="#4ade80"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white font-mono">
              {remaining}
            </span>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="px-8 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600 transition-colors"
        >
          Skip Rest
        </button>
      </div>
    </div>
  );
}
