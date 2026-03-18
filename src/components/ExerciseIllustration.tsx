"use client";

import { useState } from "react";

interface Props {
  exerciseId: string;
  size?: number;
  className?: string;
  animated?: boolean;
}

function MuscleBody({ phase, color, accent, pose }: { phase: 0 | 1; color: string; accent: string; pose: string }) {
  const poses: Record<string, [React.ReactNode, React.ReactNode]> = {
    "push-up": [
      // Phase 0: up position
      <g key="up">
        <ellipse cx="64" cy="24" rx="7" ry="8.5" fill={color} />
        <path d="M57,30 C50,32 30,34 14,36" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="36" cy="34" rx="14" ry="6" fill={accent} opacity="0.5" />
        <path d="M52,34 L48,52 L52,60" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14,36 L10,52 L8,60" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="48" cy="36" rx="5" ry="3" fill={accent} opacity="0.35" />
      </g>,
      // Phase 1: down position
      <g key="down">
        <ellipse cx="64" cy="36" rx="7" ry="8.5" fill={color} />
        <path d="M57,42 C50,43 30,44 14,45" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="36" cy="43" rx="14" ry="6" fill={accent} opacity="0.6" />
        <path d="M50,44 L44,54 L48,62" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14,45 L8,56 L6,62" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="44" cy="46" rx="6" ry="3.5" fill={accent} opacity="0.45" />
        <ellipse cx="58" cy="38" rx="4" ry="3" fill={accent} opacity="0.3" />
      </g>,
    ],
    "pull-up": [
      <g key="hang">
        <rect x="16" y="8" width="48" height="5" rx="2.5" fill="#475569" />
        <ellipse cx="40" cy="24" rx="7" ry="8.5" fill={color} />
        <path d="M40,33 L40,56" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="44" rx="7" ry="9" fill={accent} opacity="0.4" />
        <path d="M36,30 L26,10" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,30 L54,10" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M37,56 L30,70" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M43,56 L50,70" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>,
      <g key="up">
        <rect x="16" y="8" width="48" height="5" rx="2.5" fill="#475569" />
        <ellipse cx="40" cy="16" rx="7" ry="8.5" fill={color} />
        <path d="M40,24 L40,46" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="36" rx="7" ry="9" fill={accent} opacity="0.55" />
        <ellipse cx="32" cy="22" rx="5" ry="4" fill={accent} opacity="0.5" />
        <ellipse cx="48" cy="22" rx="5" ry="4" fill={accent} opacity="0.5" />
        <path d="M36,22 L22,12" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,22 L58,12" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M37,46 L30,62" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M43,46 L50,62" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>,
    ],
    "squat": [
      <g key="stand">
        <ellipse cx="40" cy="14" rx="7" ry="8.5" fill={color} />
        <path d="M40,22 L40,44" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="34" rx="6" ry="7" fill={accent} opacity="0.3" />
        <path d="M38,44 L36,60 L36,72" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42,44 L44,60 L44,72" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="36" cy="58" rx="4" ry="6" fill={accent} opacity="0.3" />
        <ellipse cx="44" cy="58" rx="4" ry="6" fill={accent} opacity="0.3" />
      </g>,
      <g key="down">
        <ellipse cx="40" cy="18" rx="7" ry="8.5" fill={color} />
        <path d="M40,26 L40,44" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="36" rx="6" ry="7" fill={accent} opacity="0.35" />
        <path d="M38,44 L28,56 L28,70" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42,44 L52,56 L52,70" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="30" cy="54" rx="5" ry="7" fill={accent} opacity="0.55" />
        <ellipse cx="50" cy="54" rx="5" ry="7" fill={accent} opacity="0.55" />
        <ellipse cx="40" cy="40" rx="5" ry="4" fill={accent} opacity="0.3" />
      </g>,
    ],
    "dip": [
      <g key="up">
        <rect x="8" y="34" width="16" height="5" rx="2.5" fill="#475569" />
        <rect x="56" y="34" width="16" height="5" rx="2.5" fill="#475569" />
        <ellipse cx="40" cy="16" rx="7" ry="8.5" fill={color} />
        <path d="M40,24 L40,44" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="36" rx="6" ry="7" fill={accent} opacity="0.3" />
        <path d="M36,28 L20,36" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,28 L60,36" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M38,44 L34,60" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M42,44 L46,60" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>,
      <g key="down">
        <rect x="8" y="34" width="16" height="5" rx="2.5" fill="#475569" />
        <rect x="56" y="34" width="16" height="5" rx="2.5" fill="#475569" />
        <ellipse cx="40" cy="26" rx="7" ry="8.5" fill={color} />
        <path d="M40,34 L40,52" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="44" rx="6" ry="7" fill={accent} opacity="0.4" />
        <path d="M36,34 L22,36" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,34 L58,36" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <ellipse cx="30" cy="34" rx="4" ry="3" fill={accent} opacity="0.5" />
        <ellipse cx="50" cy="34" rx="4" ry="3" fill={accent} opacity="0.5" />
        <path d="M38,52 L34,66" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M42,52 L46,66" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>,
    ],
    "plank": [
      <g key="hold">
        <ellipse cx="66" cy="28" rx="7" ry="8.5" fill={color} />
        <path d="M59,34 C48,36 28,37 14,37" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="36" rx="14" ry="5.5" fill={accent} opacity="0.5" />
        <path d="M52,38 L48,54" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M14,37 L12,52 L8,52" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>,
      <g key="hold2">
        <ellipse cx="66" cy="30" rx="7" ry="8.5" fill={color} />
        <path d="M59,36 C48,37 28,38 14,38" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="37" rx="14" ry="5.5" fill={accent} opacity="0.55" />
        <path d="M52,39 L48,55" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M14,38 L12,53 L8,53" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>,
    ],
    "handstand": [
      <g key="up">
        <rect x="62" y="8" width="4" height="64" rx="2" fill="#475569" />
        <ellipse cx="40" cy="60" rx="7" ry="8.5" fill={color} />
        <path d="M40,52 L40,28" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="38" rx="6" ry="8" fill={accent} opacity="0.4" />
        <path d="M36,28 L28,14" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,28 L52,14" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M36,52 L28,66" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,52 L52,66" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <ellipse cx="34" cy="36" rx="4" ry="3" fill={accent} opacity="0.45" />
        <ellipse cx="46" cy="36" rx="4" ry="3" fill={accent} opacity="0.45" />
      </g>,
      <g key="down">
        <rect x="62" y="8" width="4" height="64" rx="2" fill="#475569" />
        <ellipse cx="40" cy="66" rx="7" ry="8.5" fill={color} />
        <path d="M40,58 L40,34" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="44" rx="6" ry="8" fill={accent} opacity="0.5" />
        <path d="M36,34 L26,22" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,34 L54,22" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M36,58 L28,70" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,58 L52,70" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <ellipse cx="34" cy="42" rx="5" ry="4" fill={accent} opacity="0.55" />
        <ellipse cx="46" cy="42" rx="5" ry="4" fill={accent} opacity="0.55" />
      </g>,
    ],
    "lever": [
      <g key="tuck">
        <rect x="16" y="14" width="48" height="5" rx="2.5" fill="#475569" />
        <ellipse cx="40" cy="36" rx="7" ry="8.5" fill={color} />
        <path d="M40,44 L40,50" stroke={color} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="46" rx="5" ry="4" fill={accent} opacity="0.4" />
        <path d="M36,34 L34,16" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,34 L46,16" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M40,50 Q48,46 44,40" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>,
      <g key="full">
        <rect x="16" y="14" width="48" height="5" rx="2.5" fill="#475569" />
        <ellipse cx="62" cy="36" rx="7" ry="8.5" fill={color} />
        <path d="M55,38 C44,39 28,39 16,38" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="38" rx="12" ry="5" fill={accent} opacity="0.55" />
        <path d="M34,38 L34,16" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M42" y1="38" x2="42" y2="16" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="36" rx="6" ry="3" fill={accent} opacity="0.35" />
      </g>,
    ],
    "planche": [
      <g key="tuck">
        <ellipse cx="50" cy="28" rx="7" ry="8.5" fill={color} />
        <path d="M44,34 L34,40" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="38" rx="6" ry="5" fill={accent} opacity="0.4" />
        <path d="M34,40 Q42,46 38,50" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M36,38 L32,54" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M32,38 L28,54" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="34" rx="5" ry="3" fill={accent} opacity="0.45" />
      </g>,
      <g key="full">
        <ellipse cx="66" cy="32" rx="7" ry="8.5" fill={color} />
        <path d="M59,36 C48,38 28,38 14,37" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="37" rx="14" ry="5.5" fill={accent} opacity="0.55" />
        <path d="M36,38 L34,56" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M30,38 L28,56" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="42" cy="34" rx="6" ry="4" fill={accent} opacity="0.5" />
      </g>,
    ],
    "lunge": [
      <g key="stand">
        <ellipse cx="40" cy="12" rx="7" ry="8.5" fill={color} />
        <path d="M40,20 L40,42" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M38,42 L36,60 L36,72" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42,42 L44,60 L44,72" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>,
      <g key="deep">
        <ellipse cx="40" cy="14" rx="7" ry="8.5" fill={color} />
        <path d="M40,22 L40,42" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M38,42 L26,54 L26,70" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42,42 L56,56 L60,70" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="28" cy="52" rx="5" ry="6" fill={accent} opacity="0.55" />
        <ellipse cx="54" cy="54" rx="5" ry="6" fill={accent} opacity="0.45" />
      </g>,
    ],
    "hang-leg": [
      <g key="hang">
        <rect x="16" y="8" width="48" height="5" rx="2.5" fill="#475569" />
        <ellipse cx="40" cy="22" rx="7" ry="8.5" fill={color} />
        <path d="M40,30 L40,50" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M36,28 L26,10" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,28 L54,10" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M38,50 L32,66" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M42,50 L48,66" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>,
      <g key="raise">
        <rect x="16" y="8" width="48" height="5" rx="2.5" fill="#475569" />
        <ellipse cx="40" cy="22" rx="7" ry="8.5" fill={color} />
        <path d="M40,30 L40,48" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="42" rx="6" ry="5" fill={accent} opacity="0.6" />
        <path d="M36,28 L26,10" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M44,28 L54,10" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M40,48 L58,44 L68,44" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>,
    ],
    "static": [
      <g key="a">
        <ellipse cx="40" cy="20" rx="7" ry="8.5" fill={color} />
        <path d="M40,28 L40,50" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="40" rx="6" ry="7" fill={accent} opacity="0.4" />
        <path d="M36,32 L24,28" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M44,32 L56,28" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M38,50 L32,66" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M42,50 L48,66" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>,
      <g key="b">
        <ellipse cx="40" cy="20" rx="7" ry="8.5" fill={color} />
        <path d="M40,28 L40,50" stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="40" rx="6" ry="7" fill={accent} opacity="0.5" />
        <path d="M36,32 L22,26" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M44,32 L58,26" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M38,50 L32,66" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M42,50 L48,66" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>,
    ],
  };

  const frames = poses[pose] || poses["static"];
  return <>{frames[phase]}</>;
}

const poseMap: Record<string, { pose: string; color: string; accent: string }> = {
  "push-up": { pose: "push-up", color: "#60a5fa", accent: "#ef4444" },
  "diamond-push-up": { pose: "push-up", color: "#60a5fa", accent: "#ef4444" },
  "pike-push-up": { pose: "handstand", color: "#60a5fa", accent: "#f59e0b" },
  "dips": { pose: "dip", color: "#60a5fa", accent: "#ef4444" },
  "handstand-push-up": { pose: "handstand", color: "#818cf8", accent: "#ef4444" },
  "freestanding-hspu": { pose: "handstand", color: "#c084fc", accent: "#ef4444" },
  "pseudo-planche-push-up": { pose: "push-up", color: "#f59e0b", accent: "#ef4444" },
  "pull-up": { pose: "pull-up", color: "#a78bfa", accent: "#ef4444" },
  "chin-up": { pose: "pull-up", color: "#a78bfa", accent: "#ef4444" },
  "australian-pull-up": { pose: "push-up", color: "#a78bfa", accent: "#ef4444" },
  "muscle-up": { pose: "pull-up", color: "#c084fc", accent: "#f59e0b" },
  "squat": { pose: "squat", color: "#fb923c", accent: "#ef4444" },
  "pistol-squat": { pose: "squat", color: "#fb923c", accent: "#ef4444" },
  "lunge": { pose: "lunge", color: "#fb923c", accent: "#ef4444" },
  "calf-raise": { pose: "squat", color: "#fb923c", accent: "#ef4444" },
  "jump-squat": { pose: "squat", color: "#fb923c", accent: "#f59e0b" },
  "plank": { pose: "plank", color: "#f472b6", accent: "#ef4444" },
  "hollow-body-hold": { pose: "plank", color: "#f472b6", accent: "#ef4444" },
  "hanging-leg-raise": { pose: "hang-leg", color: "#f472b6", accent: "#ef4444" },
  "dragon-flag": { pose: "plank", color: "#ef4444", accent: "#f59e0b" },
  "l-sit": { pose: "static", color: "#fbbf24", accent: "#ef4444" },
  "v-sit": { pose: "static", color: "#fbbf24", accent: "#ef4444" },
  "manna": { pose: "static", color: "#fbbf24", accent: "#f59e0b" },
  "tuck-planche": { pose: "planche", color: "#ef4444", accent: "#f59e0b" },
  "straddle-planche": { pose: "planche", color: "#ef4444", accent: "#f59e0b" },
  "full-planche": { pose: "planche", color: "#ef4444", accent: "#f59e0b" },
  "tuck-front-lever": { pose: "lever", color: "#a78bfa", accent: "#ef4444" },
  "front-lever": { pose: "lever", color: "#a78bfa", accent: "#ef4444" },
  "back-lever": { pose: "lever", color: "#a78bfa", accent: "#ef4444" },
  "90-degree-hold": { pose: "push-up", color: "#ef4444", accent: "#f59e0b" },
  "human-flag": { pose: "static", color: "#ef4444", accent: "#f59e0b" },
  "burpee": { pose: "squat", color: "#38bdf8", accent: "#ef4444" },
  "bear-crawl": { pose: "push-up", color: "#38bdf8", accent: "#f59e0b" },
};

export default function ExerciseIllustration({ exerciseId, size = 200, className, animated = false }: Props) {
  const [phase, setPhase] = useState<0 | 1>(0);
  const [animating, setAnimating] = useState(false);
  const mapping = poseMap[exerciseId] || { pose: "static", color: "#9ca3af", accent: "#ef4444" };
  const s = size;
  const sc = s / 80;

  const handleClick = () => {
    if (!animated) return;
    if (animating) return;
    setAnimating(true);
    let count = 0;
    const interval = setInterval(() => {
      setPhase((p) => (p === 0 ? 1 : 0));
      count++;
      if (count >= 6) { clearInterval(interval); setAnimating(false); }
    }, 500);
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}
      className={`rounded-2xl overflow-hidden ${animated ? "cursor-pointer" : ""} ${className || ""}`}
      onClick={handleClick}
    >
      <defs>
        <radialGradient id={`bg-${exerciseId}-${s}`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor={mapping.color} stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.98" />
        </radialGradient>
      </defs>
      <rect width={s} height={s} fill={`url(#bg-${exerciseId}-${s})`} />
      <g transform={`scale(${sc})`}>
        <MuscleBody phase={phase} color={mapping.color} accent={mapping.accent} pose={mapping.pose} />
      </g>
      {animated && (
        <g>
          <circle cx={s - 14} cy={14} r={8} fill="rgba(0,0,0,0.5)" />
          <text x={s - 14} y={18} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">▶</text>
        </g>
      )}
    </svg>
  );
}
