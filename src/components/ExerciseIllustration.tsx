"use client";

interface Props {
  exerciseId: string;
  size?: number;
}

export default function ExerciseIllustration({ exerciseId, size = 200 }: Props) {
  const s = size;
  const mid = s / 2;

  const illustrations: Record<string, () => React.ReactNode> = {
    "push-up": () => (
      <g>
        <line x1={mid - 40} y1={mid + 10} x2={mid + 40} y2={mid + 10} stroke="#4ade80" strokeWidth="3" />
        <circle cx={mid + 40} cy={mid + 5} r="8" fill="#4ade80" />
        <line x1={mid - 40} y1={mid + 10} x2={mid - 45} y2={mid + 30} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid - 45} y1={mid + 30} x2={mid - 40} y2={mid + 40} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid + 35} y1={mid + 10} x2={mid + 30} y2={mid + 30} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid + 30} y1={mid + 30} x2={mid + 35} y2={mid + 40} stroke="#4ade80" strokeWidth="3" />
        <text x={mid} y={mid - 20} textAnchor="middle" fill="#9ca3af" fontSize="11">arms extend → lower → push</text>
      </g>
    ),
    "diamond-push-up": () => (
      <g>
        <line x1={mid - 40} y1={mid + 10} x2={mid + 40} y2={mid + 10} stroke="#4ade80" strokeWidth="3" />
        <circle cx={mid + 40} cy={mid + 5} r="8" fill="#4ade80" />
        <polygon points={`${mid - 5},${mid + 35} ${mid},${mid + 25} ${mid + 5},${mid + 35}`} fill="none" stroke="#facc15" strokeWidth="2" />
        <text x={mid} y={mid - 20} textAnchor="middle" fill="#9ca3af" fontSize="11">hands form diamond</text>
      </g>
    ),
    "pike-push-up": () => (
      <g>
        <line x1={mid - 25} y1={mid + 30} x2={mid} y2={mid - 15} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid} y1={mid - 15} x2={mid + 25} y2={mid + 30} stroke="#4ade80" strokeWidth="3" />
        <circle cx={mid} cy={mid - 22} r="8" fill="#4ade80" />
        <text x={mid} y={mid + 50} textAnchor="middle" fill="#9ca3af" fontSize="11">inverted V position</text>
      </g>
    ),
    "dips": () => (
      <g>
        <rect x={mid - 45} y={mid + 5} width="20" height="4" fill="#6b7280" rx="2" />
        <rect x={mid + 25} y={mid + 5} width="20" height="4" fill="#6b7280" rx="2" />
        <circle cx={mid} cy={mid - 20} r="8" fill="#4ade80" />
        <line x1={mid} y1={mid - 12} x2={mid} y2={mid + 15} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid - 10} y2={mid + 35} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid + 10} y2={mid + 35} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid - 25} y2={mid + 5} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid + 25} y2={mid + 5} stroke="#4ade80" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">lower between bars</text>
      </g>
    ),
    "handstand-push-up": () => (
      <g>
        <rect x={mid + 15} y={mid - 40} width="4" height="80" fill="#6b7280" rx="2" />
        <circle cx={mid} cy={mid + 30} r="8" fill="#4ade80" />
        <line x1={mid} y1={mid + 22} x2={mid} y2={mid - 10} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid} y1={mid - 10} x2={mid - 12} y2={mid - 30} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid} y1={mid - 10} x2={mid + 12} y2={mid - 30} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid - 15} y2={mid + 35} stroke="#4ade80" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid + 15} y2={mid + 35} stroke="#4ade80" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">press up in handstand</text>
      </g>
    ),
    "freestanding-hspu": () => (
      <g>
        <circle cx={mid} cy={mid + 30} r="8" fill="#f59e0b" />
        <line x1={mid} y1={mid + 22} x2={mid} y2={mid - 10} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid - 10} x2={mid - 12} y2={mid - 30} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid - 10} x2={mid + 12} y2={mid - 30} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid - 15} y2={mid + 38} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid + 15} y2={mid + 38} stroke="#f59e0b" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">no wall support</text>
        <circle cx={mid - 5} cy={mid - 35} r="2" fill="#f59e0b" opacity="0.5" />
        <circle cx={mid + 8} cy={mid - 38} r="1.5" fill="#f59e0b" opacity="0.4" />
      </g>
    ),
    "pseudo-planche-push-up": () => (
      <g>
        <line x1={mid - 40} y1={mid + 5} x2={mid + 40} y2={mid + 5} stroke="#4ade80" strokeWidth="3" />
        <circle cx={mid + 40} cy={mid} r="8" fill="#4ade80" />
        <line x1={mid - 10} y1={mid + 5} x2={mid - 15} y2={mid + 25} stroke="#4ade80" strokeWidth="3" />
        <path d={`M${mid - 15},${mid + 25} L${mid - 5},${mid + 25}`} stroke="#facc15" strokeWidth="2" strokeDasharray="3" />
        <text x={mid} y={mid - 20} textAnchor="middle" fill="#9ca3af" fontSize="11">lean forward past wrists</text>
        <path d={`M${mid - 20},${mid + 15} L${mid - 5},${mid + 15}`} stroke="#facc15" strokeWidth="1" markerEnd="url(#arrow)" />
      </g>
    ),
    "pull-up": () => (
      <g>
        <line x1={mid - 35} y1={mid - 35} x2={mid + 35} y2={mid - 35} stroke="#6b7280" strokeWidth="4" />
        <circle cx={mid} cy={mid - 15} r="8" fill="#a78bfa" />
        <line x1={mid} y1={mid - 7} x2={mid} y2={mid + 15} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid - 10} y2={mid + 35} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid + 10} y2={mid + 35} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid - 18} y2={mid - 35} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid + 18} y2={mid - 35} stroke="#a78bfa" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">pull chin over bar</text>
      </g>
    ),
    "chin-up": () => (
      <g>
        <line x1={mid - 35} y1={mid - 35} x2={mid + 35} y2={mid - 35} stroke="#6b7280" strokeWidth="4" />
        <circle cx={mid} cy={mid - 15} r="8" fill="#a78bfa" />
        <line x1={mid} y1={mid - 7} x2={mid} y2={mid + 15} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid - 10} y2={mid + 35} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid + 10} y2={mid + 35} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid - 15} y2={mid - 35} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid + 15} y2={mid - 35} stroke="#a78bfa" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">underhand grip</text>
        <path d={`M${mid - 17},${mid - 32} Q${mid - 15},${mid - 28} ${mid - 13},${mid - 32}`} stroke="#facc15" strokeWidth="1.5" fill="none" />
        <path d={`M${mid + 13},${mid - 32} Q${mid + 15},${mid - 28} ${mid + 17},${mid - 32}`} stroke="#facc15" strokeWidth="1.5" fill="none" />
      </g>
    ),
    "australian-pull-up": () => (
      <g>
        <line x1={mid - 35} y1={mid - 5} x2={mid + 35} y2={mid - 5} stroke="#6b7280" strokeWidth="4" />
        <line x1={mid - 35} y1={mid + 30} x2={mid + 35} y2={mid + 30} stroke="#6b7280" strokeWidth="2" strokeDasharray="4" />
        <circle cx={mid - 25} cy={mid + 5} r="7" fill="#a78bfa" />
        <line x1={mid - 25} y1={mid + 12} x2={mid + 10} y2={mid + 26} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid - 20} y1={mid + 7} x2={mid - 10} y2={mid - 5} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid - 20} y1={mid + 7} x2={mid + 5} y2={mid - 5} stroke="#a78bfa" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">inverted row</text>
      </g>
    ),
    "muscle-up": () => (
      <g>
        <line x1={mid - 35} y1={mid - 10} x2={mid + 35} y2={mid - 10} stroke="#6b7280" strokeWidth="4" />
        <circle cx={mid} cy={mid - 25} r="8" fill="#f59e0b" />
        <line x1={mid} y1={mid - 17} x2={mid} y2={mid + 5} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 5} x2={mid - 10} y2={mid + 25} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 5} x2={mid + 10} y2={mid + 25} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid - 12} x2={mid - 20} y2={mid - 10} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid - 12} x2={mid + 20} y2={mid - 10} stroke="#f59e0b" strokeWidth="3" />
        <path d={`M${mid - 10},${mid + 35} L${mid},${mid + 30} L${mid + 10},${mid + 35}`} stroke="#facc15" strokeWidth="1.5" fill="none" />
        <text x={mid} y={mid + 50} textAnchor="middle" fill="#9ca3af" fontSize="11">pull + transition + dip</text>
      </g>
    ),
    "squat": () => (
      <g>
        <circle cx={mid} cy={mid - 25} r="8" fill="#fb923c" />
        <line x1={mid} y1={mid - 17} x2={mid} y2={mid + 5} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid} y1={mid + 5} x2={mid - 15} y2={mid + 20} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid} y1={mid + 5} x2={mid + 15} y2={mid + 20} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid - 15} y1={mid + 20} x2={mid - 15} y2={mid + 38} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid + 15} y1={mid + 20} x2={mid + 15} y2={mid + 38} stroke="#fb923c" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">sit back and down</text>
      </g>
    ),
    "pistol-squat": () => (
      <g>
        <circle cx={mid - 5} cy={mid - 20} r="8" fill="#fb923c" />
        <line x1={mid - 5} y1={mid - 12} x2={mid - 5} y2={mid + 5} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid - 5} y1={mid + 5} x2={mid - 15} y2={mid + 25} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid - 15} y1={mid + 25} x2={mid - 15} y2={mid + 40} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid - 5} y1={mid + 5} x2={mid + 30} y2={mid + 5} stroke="#fb923c" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">single leg, other extended</text>
      </g>
    ),
    "lunge": () => (
      <g>
        <circle cx={mid} cy={mid - 25} r="8" fill="#fb923c" />
        <line x1={mid} y1={mid - 17} x2={mid} y2={mid + 5} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid} y1={mid + 5} x2={mid - 18} y2={mid + 25} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid - 18} y1={mid + 25} x2={mid - 18} y2={mid + 40} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid} y1={mid + 5} x2={mid + 18} y2={mid + 25} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid + 18} y1={mid + 25} x2={mid + 18} y2={mid + 40} stroke="#fb923c" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">step forward, both 90°</text>
      </g>
    ),
    "calf-raise": () => (
      <g>
        <rect x={mid - 20} y={mid + 25} width="40" height="6" fill="#6b7280" rx="2" />
        <circle cx={mid} cy={mid - 25} r="8" fill="#fb923c" />
        <line x1={mid} y1={mid - 17} x2={mid} y2={mid + 10} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid} y1={mid + 10} x2={mid} y2={mid + 22} stroke="#fb923c" strokeWidth="3" />
        <path d={`M${mid},${mid + 10} L${mid - 12},${mid + 10}`} stroke="#fb923c" strokeWidth="2" />
        <path d={`M${mid},${mid + 10} L${mid + 12},${mid + 10}`} stroke="#fb923c" strokeWidth="2" />
        <path d={`M${mid - 2},${mid + 15} L${mid + 2},${mid + 15}`} stroke="#facc15" strokeWidth="4" />
        <text x={mid} y={mid + 50} textAnchor="middle" fill="#9ca3af" fontSize="11">rise onto toes</text>
      </g>
    ),
    "jump-squat": () => (
      <g>
        <circle cx={mid} cy={mid - 30} r="8" fill="#fb923c" />
        <line x1={mid} y1={mid - 22} x2={mid} y2={mid - 5} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid - 12} y2={mid + 15} stroke="#fb923c" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid + 12} y2={mid + 15} stroke="#fb923c" strokeWidth="3" />
        <path d={`M${mid - 5},${mid + 25} L${mid},${mid + 20} L${mid + 5},${mid + 25}`} stroke="#facc15" strokeWidth="1.5" fill="none" />
        <path d={`M${mid - 8},${mid + 30} L${mid},${mid + 25} L${mid + 8},${mid + 30}`} stroke="#facc15" strokeWidth="1" fill="none" opacity="0.5" />
        <text x={mid} y={mid + 50} textAnchor="middle" fill="#9ca3af" fontSize="11">explode upward</text>
      </g>
    ),
    "plank": () => (
      <g>
        <line x1={mid - 40} y1={mid + 5} x2={mid + 40} y2={mid + 5} stroke="#ec4899" strokeWidth="3" />
        <circle cx={mid + 40} cy={mid} r="7" fill="#ec4899" />
        <line x1={mid - 40} y1={mid + 5} x2={mid - 45} y2={mid + 25} stroke="#ec4899" strokeWidth="3" />
        <line x1={mid - 30} y1={mid + 5} x2={mid - 35} y2={mid + 25} stroke="#ec4899" strokeWidth="3" />
        <text x={mid} y={mid - 20} textAnchor="middle" fill="#9ca3af" fontSize="11">hold rigid, forearms down</text>
      </g>
    ),
    "hollow-body-hold": () => (
      <g>
        <path d={`M${mid - 35},${mid + 10} Q${mid},${mid - 10} ${mid + 35},${mid + 10}`} stroke="#ec4899" strokeWidth="3" fill="none" />
        <circle cx={mid - 30} cy={mid + 12} r="7" fill="#ec4899" />
        <line x1={mid + 25} y1={mid + 12} x2={mid + 45} y2={mid + 5} stroke="#ec4899" strokeWidth="3" />
        <line x1={mid - 25} y1={mid + 12} x2={mid - 42} y2={mid + 5} stroke="#ec4899" strokeWidth="3" />
        <text x={mid} y={mid + 40} textAnchor="middle" fill="#9ca3af" fontSize="11">lower back pressed down</text>
      </g>
    ),
    "hanging-leg-raise": () => (
      <g>
        <line x1={mid - 35} y1={mid - 35} x2={mid + 35} y2={mid - 35} stroke="#6b7280" strokeWidth="4" />
        <circle cx={mid} cy={mid - 18} r="7" fill="#ec4899" />
        <line x1={mid} y1={mid - 11} x2={mid} y2={mid + 5} stroke="#ec4899" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid - 12} y2={mid - 35} stroke="#ec4899" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid + 12} y2={mid - 35} stroke="#ec4899" strokeWidth="3" />
        <line x1={mid} y1={mid + 5} x2={mid - 25} y2={mid + 5} stroke="#ec4899" strokeWidth="3" />
        <text x={mid} y={mid + 40} textAnchor="middle" fill="#9ca3af" fontSize="11">legs to 90° while hanging</text>
      </g>
    ),
    "dragon-flag": () => (
      <g>
        <rect x={mid - 5} y={mid - 30} width="55" height="6" fill="#6b7280" rx="2" />
        <circle cx={mid + 45} cy={mid - 30} r="7" fill="#ef4444" />
        <line x1={mid + 40} y1={mid - 30} x2={mid - 5} y2={mid - 30} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid - 5} y1={mid - 30} x2={mid - 15} y2={mid + 15} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid - 15} y1={mid + 15} x2={mid - 20} y2={mid + 35} stroke="#ef4444" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">rigid body, pivot at shoulders</text>
      </g>
    ),
    "l-sit": () => (
      <g>
        <rect x={mid - 15} y={mid + 5} width="6" height="20" fill="#6b7280" rx="1" />
        <rect x={mid + 10} y={mid + 5} width="6" height="20" fill="#6b7280" rx="1" />
        <circle cx={mid} cy={mid - 15} r="7" fill="#f59e0b" />
        <line x1={mid} y1={mid - 8} x2={mid} y2={mid + 5} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 5} x2={mid + 30} y2={mid + 5} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid - 2} x2={mid - 12} y2={mid + 5} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid - 2} x2={mid + 12} y2={mid + 5} stroke="#f59e0b" strokeWidth="3" />
        <text x={mid} y={mid + 45} textAnchor="middle" fill="#9ca3af" fontSize="11">legs parallel to ground</text>
      </g>
    ),
    "v-sit": () => (
      <g>
        <circle cx={mid} cy={mid + 5} r="7" fill="#f59e0b" />
        <line x1={mid} y1={mid + 12} x2={mid} y2={mid + 25} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 25} x2={mid + 20} y2={mid - 15} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 18} x2={mid - 15} y2={mid + 30} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 18} x2={mid + 15} y2={mid + 30} stroke="#f59e0b" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">V shape — legs above horizontal</text>
      </g>
    ),
    "manna": () => (
      <g>
        <circle cx={mid} cy={mid + 15} r="7" fill="#f59e0b" />
        <line x1={mid} y1={mid + 22} x2={mid} y2={mid + 35} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 35} x2={mid - 8} y2={mid - 15} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 28} x2={mid - 15} y2={mid + 38} stroke="#f59e0b" strokeWidth="3" />
        <line x1={mid} y1={mid + 28} x2={mid + 15} y2={mid + 38} stroke="#f59e0b" strokeWidth="3" />
        <circle cx={mid + 5} cy={mid - 20} r="2" fill="#f59e0b" opacity="0.4" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">legs behind and above torso</text>
      </g>
    ),
    "tuck-planche": () => (
      <g>
        <circle cx={mid} cy={mid} r="7" fill="#ef4444" />
        <line x1={mid} y1={mid + 7} x2={mid} y2={mid + 20} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 12} x2={mid + 15} y2={mid + 5} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 20} x2={mid - 10} y2={mid + 35} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 20} x2={mid + 10} y2={mid + 35} stroke="#ef4444" strokeWidth="3" />
        <path d={`M${mid + 15},${mid + 5} Q${mid + 10},${mid + 18} ${mid + 5},${mid + 15}`} stroke="#ef4444" strokeWidth="2" fill="none" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">knees tucked, body horizontal</text>
      </g>
    ),
    "straddle-planche": () => (
      <g>
        <circle cx={mid} cy={mid} r="7" fill="#ef4444" />
        <line x1={mid} y1={mid + 7} x2={mid} y2={mid + 20} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 20} x2={mid - 25} y2={mid + 10} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 20} x2={mid + 25} y2={mid + 10} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 12} x2={mid - 12} y2={mid + 35} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 12} x2={mid + 12} y2={mid + 35} stroke="#ef4444" strokeWidth="3" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">legs straddled wide</text>
      </g>
    ),
    "full-planche": () => (
      <g>
        <line x1={mid - 40} y1={mid} x2={mid + 40} y2={mid} stroke="#ef4444" strokeWidth="3" />
        <circle cx={mid + 40} cy={mid - 5} r="7" fill="#ef4444" />
        <line x1={mid - 5} y1={mid} x2={mid - 12} y2={mid + 20} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid + 5} y1={mid} x2={mid + 12} y2={mid + 20} stroke="#ef4444" strokeWidth="3" />
        <circle cx={mid - 38} cy={mid + 3} r="3" fill="#ef4444" opacity="0.4" />
        <circle cx={mid - 32} cy={mid + 5} r="2" fill="#ef4444" opacity="0.3" />
        <text x={mid} y={mid + 45} textAnchor="middle" fill="#9ca3af" fontSize="11">full horizontal hold</text>
      </g>
    ),
    "tuck-front-lever": () => (
      <g>
        <line x1={mid - 35} y1={mid - 30} x2={mid + 35} y2={mid - 30} stroke="#6b7280" strokeWidth="4" />
        <circle cx={mid} cy={mid} r="7" fill="#a78bfa" />
        <line x1={mid} y1={mid + 7} x2={mid} y2={mid + 15} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid - 10} y2={mid - 30} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid} y1={mid - 5} x2={mid + 10} y2={mid - 30} stroke="#a78bfa" strokeWidth="3" />
        <path d={`M${mid},${mid + 15} Q${mid + 10},${mid + 10} ${mid + 5},${mid + 5}`} stroke="#a78bfa" strokeWidth="2" fill="none" />
        <text x={mid} y={mid + 40} textAnchor="middle" fill="#9ca3af" fontSize="11">tucked, back horizontal</text>
      </g>
    ),
    "front-lever": () => (
      <g>
        <line x1={mid - 35} y1={mid - 30} x2={mid + 35} y2={mid - 30} stroke="#6b7280" strokeWidth="4" />
        <line x1={mid - 35} y1={mid} x2={mid + 35} y2={mid} stroke="#a78bfa" strokeWidth="3" />
        <circle cx={mid + 30} cy={mid - 5} r="7" fill="#a78bfa" />
        <line x1={mid - 5} y1={mid} x2={mid - 10} y2={mid - 30} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid + 5} y1={mid} x2={mid + 10} y2={mid - 30} stroke="#a78bfa" strokeWidth="3" />
        <text x={mid} y={mid + 30} textAnchor="middle" fill="#9ca3af" fontSize="11">body horizontal under bar</text>
      </g>
    ),
    "back-lever": () => (
      <g>
        <line x1={mid - 35} y1={mid - 30} x2={mid + 35} y2={mid - 30} stroke="#6b7280" strokeWidth="4" />
        <line x1={mid - 35} y1={mid} x2={mid + 35} y2={mid} stroke="#a78bfa" strokeWidth="3" />
        <circle cx={mid - 30} cy={mid - 5} r="7" fill="#a78bfa" />
        <line x1={mid - 5} y1={mid} x2={mid - 10} y2={mid - 30} stroke="#a78bfa" strokeWidth="3" />
        <line x1={mid + 5} y1={mid} x2={mid + 10} y2={mid - 30} stroke="#a78bfa" strokeWidth="3" />
        <text x={mid} y={mid + 30} textAnchor="middle" fill="#9ca3af" fontSize="11">face-down horizontal hold</text>
      </g>
    ),
    "90-degree-hold": () => (
      <g>
        <circle cx={mid} cy={mid - 5} r="7" fill="#ef4444" />
        <line x1={mid} y1={mid + 2} x2={mid} y2={mid + 15} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 15} x2={mid + 30} y2={mid + 15} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 8} x2={mid - 12} y2={mid + 20} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid - 12} y1={mid + 20} x2={mid - 12} y2={mid + 35} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid} y1={mid + 8} x2={mid + 12} y2={mid + 20} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid + 12} y1={mid + 20} x2={mid + 12} y2={mid + 35} stroke="#ef4444" strokeWidth="3" />
        <path d={`M${mid - 5},${mid + 20} A5,5 0 0,1 ${mid - 5},${mid + 10}`} stroke="#facc15" strokeWidth="1.5" fill="none" />
        <text x={mid} y={mid + 55} textAnchor="middle" fill="#9ca3af" fontSize="11">arms 90°, body horizontal</text>
      </g>
    ),
    "human-flag": () => (
      <g>
        <line x1={mid - 25} y1={mid - 40} x2={mid - 25} y2={mid + 40} stroke="#6b7280" strokeWidth="4" />
        <circle cx={mid} cy={mid} r="7" fill="#ef4444" />
        <line x1={mid + 7} y1={mid} x2={mid + 40} y2={mid} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid - 7} y1={mid} x2={mid - 25} y2={mid - 15} stroke="#ef4444" strokeWidth="3" />
        <line x1={mid - 7} y1={mid} x2={mid - 25} y2={mid + 15} stroke="#ef4444" strokeWidth="3" />
        <text x={mid + 10} y={mid + 40} textAnchor="middle" fill="#9ca3af" fontSize="11">sideways on pole</text>
      </g>
    ),
    "burpee": () => (
      <g>
        <circle cx={mid - 25} cy={mid - 20} r="6" fill="#38bdf8" />
        <line x1={mid - 25} y1={mid - 14} x2={mid - 25} y2={mid + 5} stroke="#38bdf8" strokeWidth="2" />
        <circle cx={mid} cy={mid + 10} r="6" fill="#38bdf8" />
        <line x1={mid - 15} y1={mid + 10} x2={mid + 15} y2={mid + 10} stroke="#38bdf8" strokeWidth="2" />
        <circle cx={mid + 25} cy={mid - 25} r="6" fill="#38bdf8" />
        <line x1={mid + 25} y1={mid - 19} x2={mid + 25} y2={mid} stroke="#38bdf8" strokeWidth="2" />
        <path d={`M${mid - 15},${mid - 15} L${mid - 8},${mid} L${mid + 8},${mid} L${mid + 15},${mid - 15}`} stroke="#facc15" strokeWidth="1" fill="none" strokeDasharray="3" />
        <text x={mid} y={mid + 40} textAnchor="middle" fill="#9ca3af" fontSize="11">squat → plank → push → jump</text>
      </g>
    ),
    "bear-crawl": () => (
      <g>
        <circle cx={mid - 15} cy={mid - 10} r="7" fill="#38bdf8" />
        <line x1={mid - 15} y1={mid - 3} x2={mid - 5} y2={mid + 10} stroke="#38bdf8" strokeWidth="3" />
        <line x1={mid - 5} y1={mid + 10} x2={mid + 15} y2={mid + 10} stroke="#38bdf8" strokeWidth="3" />
        <line x1={mid - 10} y1={mid + 3} x2={mid - 20} y2={mid + 18} stroke="#38bdf8" strokeWidth="2" />
        <line x1={mid - 10} y1={mid + 3} x2={mid} y2={mid + 18} stroke="#38bdf8" strokeWidth="2" />
        <line x1={mid + 5} y1={mid + 10} x2={mid + 20} y2={mid + 22} stroke="#38bdf8" strokeWidth="2" />
        <line x1={mid + 5} y1={mid + 10} x2={mid - 5} y2={mid + 22} stroke="#38bdf8" strokeWidth="2" />
        <text x={mid} y={mid + 45} textAnchor="middle" fill="#9ca3af" fontSize="11">crawl on all fours</text>
      </g>
    ),
  };

  const renderDefault = () => (
    <g>
      <circle cx={mid} cy={mid - 15} r="10" fill="#6b7280" />
      <line x1={mid} y1={mid - 5} x2={mid} y2={mid + 15} stroke="#6b7280" strokeWidth="3" />
      <line x1={mid} y1={mid + 15} x2={mid - 12} y2={mid + 35} stroke="#6b7280" strokeWidth="3" />
      <line x1={mid} y1={mid + 15} x2={mid + 12} y2={mid + 35} stroke="#6b7280" strokeWidth="3" />
      <line x1={mid} y1={mid + 2} x2={mid - 15} y2={mid + 12} stroke="#6b7280" strokeWidth="3" />
      <line x1={mid} y1={mid + 2} x2={mid + 15} y2={mid + 12} stroke="#6b7280" strokeWidth="3" />
    </g>
  );

  const render = illustrations[exerciseId] || renderDefault;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="rounded-xl bg-gray-800/50"
    >
      {render()}
    </svg>
  );
}
