"use client";

import { getExerciseById } from "@/data/exercises";

interface Props {
  exerciseId: string;
  size?: number;
}

const animations: Record<string, { frames: [string, string]; label: string }> = {
  "push-up": { frames: ["M58,26 Q40,28 14,32 L48,50 L10,50", "M58,36 Q40,38 14,42 L44,54 L8,56"], label: "Push up & down" },
  "pull-up": { frames: ["M40,28 L40,56 M26,10 L36,28 M44,28 L54,10", "M40,18 L40,44 M22,10 L36,18 M44,18 L58,10"], label: "Pull chin over bar" },
  "squat": { frames: ["M40,22 L40,44 L28,60 M40,44 L52,60", "M40,26 L40,44 L28,56 L28,68 M40,44 L52,56 L52,68"], label: "Sit back & stand" },
  "dip": { frames: ["M40,20 L40,40 M22,36 L36,28 M44,28 L58,36", "M40,30 L40,50 M22,36 L36,34 M44,34 L58,36"], label: "Lower & press up" },
  "plank": { frames: ["M60,30 Q40,32 14,32 L48,48 L12,48", "M60,32 Q40,34 14,34 L48,50 L12,50"], label: "Hold rigid" },
  "lunge": { frames: ["M40,20 L40,42 L26,56 L26,70 M40,42 L54,58 L58,70", "M40,18 L40,40 L28,52 L28,68 M40,40 L52,54 L56,68"], label: "Step & lower" },
  "hold": { frames: ["M40,22 L40,48 M28,30 L24,24 M52,30 L56,24", "M40,22 L40,48 M28,30 L22,22 M52,30 L58,22"], label: "Hold position" },
};

export default function ExerciseAnimation({ exerciseId, size = 120 }: Props) {
  const ex = getExerciseById(exerciseId);
  if (!ex) return null;

  let anim = animations["hold"];
  if (exerciseId.includes("push") || exerciseId.includes("planche")) anim = animations["push-up"];
  else if (exerciseId.includes("pull") || exerciseId.includes("chin") || exerciseId.includes("muscle") || exerciseId.includes("lever") || exerciseId.includes("row")) anim = animations["pull-up"];
  else if (exerciseId.includes("squat") || exerciseId.includes("pistol") || exerciseId.includes("jump")) anim = animations["squat"];
  else if (exerciseId.includes("dip")) anim = animations["dip"];
  else if (exerciseId.includes("plank") || exerciseId.includes("hollow") || exerciseId.includes("dragon")) anim = animations["plank"];
  else if (exerciseId.includes("lunge") || exerciseId.includes("calf") || exerciseId.includes("crawl")) anim = animations["lunge"];

  const s = size;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={s} height={s} viewBox="0 0 80 80" className="rounded-xl bg-gray-800/50">
        <defs>
          <radialGradient id="anim-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="30" fill="url(#anim-glow)" />
        {/* Phase 1 figure */}
        <g opacity="0">
          <ellipse cx="40" cy="16" rx="6" ry="7" fill="#4ade80" />
          <path d={anim.frames[0]} stroke="#4ade80" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <animate attributeName="opacity" values="1;0;1;0" dur="2s" repeatCount="indefinite" />
        </g>
        {/* Phase 2 figure */}
        <g opacity="0">
          <ellipse cx="40" cy="20" rx="6" ry="7" fill="#22c55e" />
          <path d={anim.frames[1]} stroke="#22c55e" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <animate attributeName="opacity" values="0;1;0;1" dur="2s" repeatCount="indefinite" />
        </g>
      </svg>
      <p className="text-xs text-brand-400 font-medium">{anim.label}</p>
    </div>
  );
}
