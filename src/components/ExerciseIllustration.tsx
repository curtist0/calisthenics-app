"use client";

interface Props {
  exerciseId: string;
  size?: number;
  className?: string;
}

function HumanFigure({ color, pose }: { color: string; pose: string }) {
  const light = color;
  const dark = color + "cc";

  const poses: Record<string, React.ReactNode> = {
    "push-up-up": (
      <g>
        <ellipse cx="62" cy="28" rx="7" ry="8" fill={light} />
        <path d="M55,34 Q45,36 20,38 Q15,38 12,40" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="37" rx="10" ry="5" fill={dark} opacity="0.3" />
        <path d="M54,38 L50,55 L54,62" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12,40 L8,55 L6,62" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    "push-up-down": (
      <g>
        <ellipse cx="62" cy="36" rx="7" ry="8" fill={light} />
        <path d="M55,40 Q40,42 20,43 Q15,43 12,44" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="42" rx="10" ry="5" fill={dark} opacity="0.3" />
        <path d="M50,44 L46,56 L50,62" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12,44 L8,56 L6,62" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    "pull-up": (
      <g>
        <rect x="18" y="10" width="44" height="4" rx="2" fill="#475569" />
        <ellipse cx="40" cy="22" rx="7" ry="8" fill={light} />
        <path d="M40,30 L40,52" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="42" rx="6" ry="8" fill={dark} opacity="0.2" />
        <path d="M36,32 L24,12" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M44,32 L56,12" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M38,52 L32,68" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M42,52 L48,68" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    ),
    "dip": (
      <g>
        <rect x="10" y="38" width="14" height="4" rx="2" fill="#475569" />
        <rect x="56" y="38" width="14" height="4" rx="2" fill="#475569" />
        <ellipse cx="40" cy="20" rx="7" ry="8" fill={light} />
        <path d="M40,28 L40,48" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="40" rx="6" ry="7" fill={dark} opacity="0.2" />
        <path d="M36,32 L22,40" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M44,32 L58,40" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M38,48 L33,64" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M42,48 L47,64" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    ),
    "handstand": (
      <g>
        <rect x="62" y="10" width="4" height="60" rx="2" fill="#475569" />
        <ellipse cx="40" cy="60" rx="7" ry="8" fill={light} />
        <path d="M40,52 L40,28" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="38" rx="6" ry="8" fill={dark} opacity="0.2" />
        <path d="M36,28 L28,14" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M44,28 L52,14" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M36,52 L28,66" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M44,52 L52,66" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    ),
    "squat": (
      <g>
        <ellipse cx="40" cy="18" rx="7" ry="8" fill={light} />
        <path d="M40,26 L40,44" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="36" rx="6" ry="7" fill={dark} opacity="0.2" />
        <path d="M38,44 L28,56 L28,68" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42,44 L52,56 L52,68" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36,30 L24,28" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M44,30 L56,28" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "lunge": (
      <g>
        <ellipse cx="40" cy="16" rx="7" ry="8" fill={light} />
        <path d="M40,24 L40,42" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="34" rx="6" ry="7" fill={dark} opacity="0.2" />
        <path d="M38,42 L26,54 L26,68" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42,42 L56,56 L60,68" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    "plank": (
      <g>
        <ellipse cx="66" cy="32" rx="7" ry="8" fill={light} />
        <path d="M59,36 Q42,38 18,38" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="37" rx="12" ry="5" fill={dark} opacity="0.2" />
        <path d="M52,40 L48,56" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M18,38 L14,54 L10,54" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    "hollow": (
      <g>
        <ellipse cx="18" cy="40" rx="7" ry="8" fill={light} />
        <path d="M25,42 Q40,26 60,40" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M25,38 L12,34" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M60,40 L72,36" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "hang-leg": (
      <g>
        <rect x="18" y="8" width="44" height="4" rx="2" fill="#475569" />
        <ellipse cx="40" cy="22" rx="7" ry="8" fill={light} />
        <path d="M40,30 L40,48" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="40" rx="6" ry="7" fill={dark} opacity="0.2" />
        <path d="M36,30 L28,10" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M44,30 L52,10" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M40,48 L58,44 L68,44" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    "dragon": (
      <g>
        <rect x="36" y="52" width="30" height="4" rx="2" fill="#475569" />
        <ellipse cx="62" cy="48" rx="7" ry="8" fill={light} />
        <path d="M56,52 L40,52" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M40,52 L30,28 L26,14" stroke={light} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    "l-sit": (
      <g>
        <rect x="26" y="44" width="6" height="18" rx="2" fill="#475569" />
        <rect x="48" y="44" width="6" height="18" rx="2" fill="#475569" />
        <ellipse cx="40" cy="24" rx="7" ry="8" fill={light} />
        <path d="M40,32 L40,46" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="40" rx="5" ry="6" fill={dark} opacity="0.2" />
        <path d="M36,34 L28,44" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M44,34 L52,44" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M40,46 L60,46 L70,46" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    ),
    "v-sit": (
      <g>
        <ellipse cx="40" cy="46" rx="7" ry="8" fill={light} />
        <path d="M40,54 L40,64" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M40,64 L50,22" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M36,58 L28,68" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M44,58 L52,68" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "planche": (
      <g>
        <ellipse cx="64" cy="34" rx="7" ry="8" fill={light} />
        <path d="M57,38 Q40,40 16,38" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="38" rx="12" ry="5" fill={dark} opacity="0.2" />
        <path d="M36,40 L34,58" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M30,40 L28,58" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "tuck-pl": (
      <g>
        <ellipse cx="50" cy="30" rx="7" ry="8" fill={light} />
        <path d="M44,36 L34,42" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="40" rx="5" ry="5" fill={dark} opacity="0.2" />
        <path d="M34,42 Q42,48 38,52" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M36,40 L32,56" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M32,40 L28,56" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "front-lever": (
      <g>
        <rect x="18" y="14" width="44" height="4" rx="2" fill="#475569" />
        <ellipse cx="62" cy="36" rx="7" ry="8" fill={light} />
        <path d="M56,38 Q40,40 18,38" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="38" rx="10" ry="5" fill={dark} opacity="0.2" />
        <path d="M34,38 L34,16" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M42,38 L42,16" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "back-lever": (
      <g>
        <rect x="18" y="14" width="44" height="4" rx="2" fill="#475569" />
        <ellipse cx="18" cy="36" rx="7" ry="8" fill={light} />
        <path d="M24,38 Q40,40 62,38" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="42" cy="38" rx="10" ry="5" fill={dark} opacity="0.2" />
        <path d="M38,38 L38,16" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M46,38 L46,16" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "flag": (
      <g>
        <rect x="16" y="6" width="4" height="68" rx="2" fill="#475569" />
        <ellipse cx="46" cy="38" rx="8" ry="7" fill={light} />
        <path d="M38,38 L20,38" stroke={light} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M54,38 L70,38" stroke={light} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M30,38 L20,24" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M30,38 L20,52" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "ninety": (
      <g>
        <ellipse cx="54" cy="30" rx="7" ry="8" fill={light} />
        <path d="M48,36 Q36,38 18,36" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="34" cy="36" rx="8" ry="4" fill={dark} opacity="0.2" />
        <path d="M36,38 L32,52 L28,62" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28,38 L24,52 L20,62" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    "pike": (
      <g>
        <ellipse cx="40" cy="18" rx="7" ry="8" fill={light} />
        <path d="M40,26 L40,44" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="36" rx="5" ry="6" fill={dark} opacity="0.2" />
        <path d="M38,44 L24,58 L20,66" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42,44 L56,58 L60,66" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36,34 L24,48" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M44,34 L56,48" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "burpee": (
      <g>
        <ellipse cx="16" cy="20" rx="5" ry="6" fill={light} opacity="0.3" />
        <path d="M16,26 L16,42" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.3" />
        <ellipse cx="40" cy="38" rx="5" ry="6" fill={light} opacity="0.5" />
        <path d="M28,40 L52,40" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.5" />
        <ellipse cx="64" cy="16" rx="5" ry="6" fill={light} />
        <path d="M64,22 L64,42" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M62,42 L58,54" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M66,42 L70,54" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "crawl": (
      <g>
        <ellipse cx="22" cy="26" rx="7" ry="8" fill={light} />
        <path d="M28,32 Q40,38 56,42" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <ellipse cx="42" cy="38" rx="8" ry="5" fill={dark} opacity="0.2" />
        <path d="M32,36 L22,54" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M38,38 L30,56" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M48,40 L54,56" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M54,42 L62,56" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "calf": (
      <g>
        <rect x="28" y="58" width="24" height="4" rx="2" fill="#475569" />
        <ellipse cx="40" cy="14" rx="7" ry="8" fill={light} />
        <path d="M40,22 L40,48" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="36" rx="6" ry="7" fill={dark} opacity="0.2" />
        <path d="M40,48 L40,56" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    ),
    "pistol": (
      <g>
        <ellipse cx="36" cy="18" rx="7" ry="8" fill={light} />
        <path d="M36,26 L36,44" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="36" cy="36" rx="6" ry="7" fill={dark} opacity="0.2" />
        <path d="M34,44 L26,58 L28,68" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38,44 L56,44 L68,42" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    "manna": (
      <g>
        <ellipse cx="40" cy="46" rx="7" ry="8" fill={light} />
        <path d="M40,54 L40,66" stroke={light} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M40,66 L36,24" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M36,58 L26,68" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M44,58 L54,68" stroke={light} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    ),
    "muscle-up": (
      <g>
        <rect x="18" y="32" width="44" height="4" rx="2" fill="#475569" />
        <ellipse cx="40" cy="16" rx="7" ry="8" fill={light} />
        <path d="M40,24 L40,42" stroke={light} strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="40" cy="34" rx="6" ry="7" fill={dark} opacity="0.2" />
        <path d="M36,28 L22,34" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M44,28 L58,34" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M38,42 L32,58" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M42,42 L48,58" stroke={light} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    ),
  };

  return poses[pose] || poses["squat"];
}

const poseMap: Record<string, { pose: string; color: string }> = {
  "push-up": { pose: "push-up-up", color: "#60a5fa" },
  "diamond-push-up": { pose: "push-up-down", color: "#60a5fa" },
  "pike-push-up": { pose: "pike", color: "#60a5fa" },
  "dips": { pose: "dip", color: "#60a5fa" },
  "handstand-push-up": { pose: "handstand", color: "#818cf8" },
  "freestanding-hspu": { pose: "handstand", color: "#c084fc" },
  "pseudo-planche-push-up": { pose: "push-up-down", color: "#f59e0b" },
  "pull-up": { pose: "pull-up", color: "#a78bfa" },
  "chin-up": { pose: "pull-up", color: "#a78bfa" },
  "australian-pull-up": { pose: "push-up-up", color: "#a78bfa" },
  "muscle-up": { pose: "muscle-up", color: "#c084fc" },
  "squat": { pose: "squat", color: "#fb923c" },
  "pistol-squat": { pose: "pistol", color: "#fb923c" },
  "lunge": { pose: "lunge", color: "#fb923c" },
  "calf-raise": { pose: "calf", color: "#fb923c" },
  "jump-squat": { pose: "squat", color: "#fb923c" },
  "plank": { pose: "plank", color: "#f472b6" },
  "hollow-body-hold": { pose: "hollow", color: "#f472b6" },
  "hanging-leg-raise": { pose: "hang-leg", color: "#f472b6" },
  "dragon-flag": { pose: "dragon", color: "#ef4444" },
  "l-sit": { pose: "l-sit", color: "#fbbf24" },
  "v-sit": { pose: "v-sit", color: "#fbbf24" },
  "manna": { pose: "manna", color: "#fbbf24" },
  "tuck-planche": { pose: "tuck-pl", color: "#ef4444" },
  "straddle-planche": { pose: "planche", color: "#ef4444" },
  "full-planche": { pose: "planche", color: "#ef4444" },
  "tuck-front-lever": { pose: "front-lever", color: "#a78bfa" },
  "front-lever": { pose: "front-lever", color: "#a78bfa" },
  "back-lever": { pose: "back-lever", color: "#a78bfa" },
  "90-degree-hold": { pose: "ninety", color: "#ef4444" },
  "human-flag": { pose: "flag", color: "#ef4444" },
  "burpee": { pose: "burpee", color: "#38bdf8" },
  "bear-crawl": { pose: "crawl", color: "#38bdf8" },
};

export default function ExerciseIllustration({ exerciseId, size = 200, className }: Props) {
  const mapping = poseMap[exerciseId] || { pose: "squat", color: "#9ca3af" };
  const s = size;
  const scale = s / 80;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className={`rounded-2xl overflow-hidden ${className || ""}`}>
      <defs>
        <radialGradient id={`bg-${exerciseId}-${s}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={mapping.color} stopOpacity="0.15" />
          <stop offset="100%" stopColor="#111827" stopOpacity="0.95" />
        </radialGradient>
        <linearGradient id={`floor-${exerciseId}-${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mapping.color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={mapping.color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={s} height={s} fill={`url(#bg-${exerciseId}-${s})`} />
      <rect x="0" y={s * 0.85} width={s} height={s * 0.15} fill={`url(#floor-${exerciseId}-${s})`} />
      <g transform={`scale(${scale})`}>
        <HumanFigure color={mapping.color} pose={mapping.pose} />
      </g>
    </svg>
  );
}
