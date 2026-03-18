"use client";

interface Props {
  exerciseId: string;
  size?: number;
  className?: string;
}

function Body({ cx, cy, s, color, children }: { cx: number; cy: number; s: number; color: string; children: React.ReactNode }) {
  return <g transform={`translate(${cx},${cy}) scale(${s})`}>{children}</g>;
}

function Head({ x, y, color }: { x: number; y: number; color: string }) {
  return <ellipse cx={x} cy={y} rx="5" ry="6" fill={color} />;
}

function Torso({ x1, y1, x2, y2, color, w = 3.5 }: { x1: number; y1: number; x2: number; y2: number; color: string; w?: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" />;
}

function Limb({ points, color, w = 2.5 }: { points: [number, number][]; color: string; w?: number }) {
  if (points.length < 2) return null;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

const exerciseRenderers: Record<string, (color: string) => React.ReactNode> = {
  "push-up": (c) => (
    <>
      <Head x={30} y={-3} color={c} />
      <Torso x1={25} y1={0} x2={-20} y2={2} color={c} />
      <Limb points={[[22, 1], [18, 14], [22, 22]]} color={c} />
      <Limb points={[[-20, 2], [-24, 14], [-28, 22]]} color={c} />
      <Limb points={[[18, 1], [14, 10]]} color={c} />
      <Limb points={[[14, 10], [20, 18]]} color={c} />
    </>
  ),
  "diamond-push-up": (c) => (
    <>
      <Head x={28} y={2} color={c} />
      <Torso x1={23} y1={5} x2={-18} y2={7} color={c} />
      <Limb points={[[20, 6], [14, 18], [18, 24]]} color={c} />
      <Limb points={[[-18, 7], [-22, 18], [-26, 24]]} color={c} />
      <Limb points={[[14, 6], [6, 16]]} color={c} />
      <Limb points={[[8, 6], [6, 16]]} color={c} />
      <circle cx={6} cy={18} r={2} fill={c} opacity={0.4} />
    </>
  ),
  "pike-push-up": (c) => (
    <>
      <Head x={0} y={-18} color={c} />
      <Torso x1={0} y1={-12} x2={0} y2={6} color={c} />
      <Limb points={[[0, 6], [-16, 18], [-20, 26]]} color={c} />
      <Limb points={[[0, 6], [16, 18], [20, 26]]} color={c} />
      <Limb points={[[0, -6], [-10, 10]]} color={c} />
      <Limb points={[[0, -6], [10, 10]]} color={c} />
    </>
  ),
  "dips": (c) => (
    <>
      <rect x={-28} y={3} width={12} height={3} rx={1.5} fill="#374151" />
      <rect x={16} y={3} width={12} height={3} rx={1.5} fill="#374151" />
      <Head x={0} y={-18} color={c} />
      <Torso x1={0} y1={-12} x2={0} y2={6} color={c} />
      <Limb points={[[0, -6], [-18, 4]]} color={c} />
      <Limb points={[[0, -6], [18, 4]]} color={c} />
      <Limb points={[[0, 6], [-6, 16], [-4, 26]]} color={c} />
      <Limb points={[[0, 6], [6, 16], [4, 26]]} color={c} />
    </>
  ),
  "handstand-push-up": (c) => (
    <>
      <rect x={18} y={-28} width={3} height={56} rx={1.5} fill="#374151" />
      <Head x={0} y={22} color={c} />
      <Torso x1={0} y1={16} x2={0} y2={-8} color={c} />
      <Limb points={[[0, -8], [-10, -22], [-8, -28]]} color={c} />
      <Limb points={[[0, -8], [10, -22], [8, -28]]} color={c} />
      <Limb points={[[0, 10], [-10, 24]]} color={c} />
      <Limb points={[[0, 10], [10, 24]]} color={c} />
    </>
  ),
  "freestanding-hspu": (c) => (
    <>
      <Head x={0} y={22} color={c} />
      <Torso x1={0} y1={16} x2={0} y2={-8} color={c} />
      <Limb points={[[0, -8], [-10, -22], [-8, -28]]} color={c} />
      <Limb points={[[0, -8], [10, -22], [8, -28]]} color={c} />
      <Limb points={[[0, 10], [-10, 24]]} color={c} />
      <Limb points={[[0, 10], [10, 24]]} color={c} />
      <circle cx={-3} cy={-30} r={1.5} fill={c} opacity={0.3} />
      <circle cx={5} cy={-32} r={1} fill={c} opacity={0.2} />
    </>
  ),
  "pseudo-planche-push-up": (c) => (
    <>
      <Head x={28} y={0} color={c} />
      <Torso x1={23} y1={3} x2={-16} y2={3} color={c} />
      <Limb points={[[20, 4], [16, 16], [20, 24]]} color={c} />
      <Limb points={[[-16, 3], [-20, 16], [-24, 24]]} color={c} />
      <Limb points={[[4, 3], [0, 14]]} color={c} />
      <Limb points={[[-2, 3], [-4, 14]]} color={c} />
      <path d="M-6,12 L6,12" stroke="#facc15" strokeWidth={1} strokeDasharray="2" opacity={0.5} />
    </>
  ),
  "pull-up": (c) => (
    <>
      <line x1={-22} y1={-28} x2={22} y2={-28} stroke="#374151" strokeWidth={3} strokeLinecap="round" />
      <Head x={0} y={-16} color={c} />
      <Torso x1={0} y1={-10} x2={0} y2={10} color={c} />
      <Limb points={[[0, -6], [-14, -28]]} color={c} />
      <Limb points={[[0, -6], [14, -28]]} color={c} />
      <Limb points={[[0, 10], [-7, 22], [-6, 28]]} color={c} />
      <Limb points={[[0, 10], [7, 22], [6, 28]]} color={c} />
    </>
  ),
  "chin-up": (c) => (
    <>
      <line x1={-22} y1={-28} x2={22} y2={-28} stroke="#374151" strokeWidth={3} strokeLinecap="round" />
      <Head x={0} y={-16} color={c} />
      <Torso x1={0} y1={-10} x2={0} y2={10} color={c} />
      <Limb points={[[0, -6], [-12, -28]]} color={c} />
      <Limb points={[[0, -6], [12, -28]]} color={c} />
      <Limb points={[[0, 10], [-7, 22], [-6, 28]]} color={c} />
      <Limb points={[[0, 10], [7, 22], [6, 28]]} color={c} />
      <path d="M-14,-26 Q-12,-23 -10,-26" stroke="#facc15" strokeWidth={1} fill="none" opacity={0.5} />
      <path d="M10,-26 Q12,-23 14,-26" stroke="#facc15" strokeWidth={1} fill="none" opacity={0.5} />
    </>
  ),
  "australian-pull-up": (c) => (
    <>
      <line x1={-24} y1={-4} x2={24} y2={-4} stroke="#374151" strokeWidth={3} strokeLinecap="round" />
      <Head x={-20} y={4} color={c} />
      <Torso x1={-16} y1={7} x2={16} y2={22} color={c} w={3} />
      <Limb points={[[-12, 6], [-6, -4]]} color={c} />
      <Limb points={[[-8, 7], [2, -4]]} color={c} />
      <Limb points={[[16, 22], [20, 28]]} color={c} />
      <Limb points={[[16, 22], [12, 28]]} color={c} />
    </>
  ),
  "muscle-up": (c) => (
    <>
      <line x1={-22} y1={-2} x2={22} y2={-2} stroke="#374151" strokeWidth={3} strokeLinecap="round" />
      <Head x={0} y={-18} color={c} />
      <Torso x1={0} y1={-12} x2={0} y2={6} color={c} />
      <Limb points={[[0, -8], [-18, -2]]} color={c} />
      <Limb points={[[0, -8], [18, -2]]} color={c} />
      <Limb points={[[0, 6], [-7, 18], [-6, 26]]} color={c} />
      <Limb points={[[0, 6], [7, 18], [6, 26]]} color={c} />
      <path d="M-8,28 L0,24 L8,28" stroke="#facc15" strokeWidth={1} fill="none" opacity={0.4} />
    </>
  ),
  "squat": (c) => (
    <>
      <Head x={0} y={-16} color={c} />
      <Torso x1={0} y1={-10} x2={0} y2={4} color={c} />
      <Limb points={[[0, 4], [-12, 14], [-12, 26]]} color={c} />
      <Limb points={[[0, 4], [12, 14], [12, 26]]} color={c} />
      <Limb points={[[0, -4], [14, -2]]} color={c} />
      <Limb points={[[0, -4], [-14, -2]]} color={c} />
    </>
  ),
  "pistol-squat": (c) => (
    <>
      <Head x={-2} y={-14} color={c} />
      <Torso x1={-2} y1={-8} x2={-2} y2={6} color={c} />
      <Limb points={[[-2, 6], [-12, 18], [-8, 28]]} color={c} />
      <Limb points={[[-2, 6], [20, 6], [28, 4]]} color={c} />
      <Limb points={[[-2, -2], [10, -6]]} color={c} />
      <Limb points={[[-2, -2], [-14, -6]]} color={c} />
    </>
  ),
  "lunge": (c) => (
    <>
      <Head x={0} y={-18} color={c} />
      <Torso x1={0} y1={-12} x2={0} y2={4} color={c} />
      <Limb points={[[0, 4], [-14, 14], [-14, 28]]} color={c} />
      <Limb points={[[0, 4], [14, 16], [18, 28]]} color={c} />
      <Limb points={[[0, -6], [8, -12]]} color={c} />
      <Limb points={[[0, -6], [-8, -12]]} color={c} />
    </>
  ),
  "calf-raise": (c) => (
    <>
      <rect x={-10} y={20} width={20} height={3} rx={1.5} fill="#374151" />
      <Head x={0} y={-22} color={c} />
      <Torso x1={0} y1={-16} x2={0} y2={4} color={c} />
      <Limb points={[[0, 4], [0, 14], [0, 18]]} color={c} />
      <Limb points={[[0, -10], [-8, -14]]} color={c} />
      <Limb points={[[0, -10], [8, -14]]} color={c} />
    </>
  ),
  "jump-squat": (c) => (
    <>
      <Head x={0} y={-24} color={c} />
      <Torso x1={0} y1={-18} x2={0} y2={-2} color={c} />
      <Limb points={[[0, -2], [-10, 10], [-8, 18]]} color={c} />
      <Limb points={[[0, -2], [10, 10], [8, 18]]} color={c} />
      <Limb points={[[0, -10], [-10, -16]]} color={c} />
      <Limb points={[[0, -10], [10, -16]]} color={c} />
      <path d="M-6,22 L0,18 L6,22" stroke="#facc15" strokeWidth={1} fill="none" opacity={0.4} />
      <path d="M-4,26 L0,23 L4,26" stroke="#facc15" strokeWidth={0.8} fill="none" opacity={0.25} />
    </>
  ),
  "plank": (c) => (
    <>
      <Head x={28} y={-2} color={c} />
      <Torso x1={22} y1={1} x2={-22} y2={1} color={c} />
      <Limb points={[[16, 1], [12, 14]]} color={c} />
      <Limb points={[[-22, 1], [-22, 14]]} color={c} />
      <Limb points={[[-22, 14], [-26, 14]]} color={c} />
    </>
  ),
  "hollow-body-hold": (c) => (
    <>
      <Head x={-22} y={4} color={c} />
      <path d="M-16,6 Q0,-8 20,4" stroke={c} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Limb points={[[-16, 4], [-28, 0]]} color={c} />
      <Limb points={[[20, 4], [30, 0]]} color={c} />
    </>
  ),
  "hanging-leg-raise": (c) => (
    <>
      <line x1={-22} y1={-28} x2={22} y2={-28} stroke="#374151" strokeWidth={3} strokeLinecap="round" />
      <Head x={0} y={-14} color={c} />
      <Torso x1={0} y1={-8} x2={0} y2={8} color={c} />
      <Limb points={[[0, -4], [-8, -28]]} color={c} />
      <Limb points={[[0, -4], [8, -28]]} color={c} />
      <Limb points={[[0, 8], [18, 4]]} color={c} />
      <Limb points={[[18, 4], [28, 4]]} color={c} />
    </>
  ),
  "dragon-flag": (c) => (
    <>
      <rect x={0} y={14} width={32} height={3} rx={1.5} fill="#374151" />
      <Head x={28} y={12} color={c} />
      <Torso x1={24} y1={14} x2={4} y2={14} color={c} />
      <Limb points={[[4, 14], [-6, -8], [-10, -22]]} color={c} />
    </>
  ),
  "l-sit": (c) => (
    <>
      <rect x={-10} y={8} width={4} height={14} rx={1} fill="#374151" />
      <rect x={6} y={8} width={4} height={14} rx={1} fill="#374151" />
      <Head x={0} y={-12} color={c} />
      <Torso x1={0} y1={-6} x2={0} y2={8} color={c} />
      <Limb points={[[0, -2], [-8, 8]]} color={c} />
      <Limb points={[[0, -2], [8, 8]]} color={c} />
      <Limb points={[[0, 8], [22, 8]]} color={c} />
    </>
  ),
  "v-sit": (c) => (
    <>
      <Head x={0} y={8} color={c} />
      <Torso x1={0} y1={14} x2={0} y2={26} color={c} />
      <Limb points={[[0, 26], [12, -4]]} color={c} />
      <Limb points={[[0, 20], [-8, 28]]} color={c} />
      <Limb points={[[0, 20], [8, 28]]} color={c} />
    </>
  ),
  "manna": (c) => (
    <>
      <Head x={0} y={10} color={c} />
      <Torso x1={0} y1={16} x2={0} y2={28} color={c} />
      <Limb points={[[0, 28], [-4, -8]]} color={c} />
      <Limb points={[[0, 22], [-8, 30]]} color={c} />
      <Limb points={[[0, 22], [8, 30]]} color={c} />
    </>
  ),
  "tuck-planche": (c) => (
    <>
      <Head x={10} y={-6} color={c} />
      <Torso x1={6} y1={-2} x2={-4} y2={4} color={c} />
      <Limb points={[[-4, 4], [4, 12]]} color={c} />
      <Limb points={[[-2, 2], [-6, 16]]} color={c} />
      <Limb points={[[-2, 2], [4, 16]]} color={c} />
    </>
  ),
  "straddle-planche": (c) => (
    <>
      <Head x={24} y={-2} color={c} />
      <Torso x1={18} y1={1} x2={-16} y2={1} color={c} />
      <Limb points={[[-16, 1], [-26, -8]]} color={c} />
      <Limb points={[[-16, 1], [-26, 12]]} color={c} />
      <Limb points={[[2, 1], [-2, 16]]} color={c} />
      <Limb points={[[-4, 1], [-8, 16]]} color={c} />
    </>
  ),
  "full-planche": (c) => (
    <>
      <Head x={26} y={-2} color={c} />
      <Torso x1={20} y1={1} x2={-22} y2={1} color={c} />
      <Limb points={[[2, 1], [0, 16]]} color={c} />
      <Limb points={[[-4, 1], [-6, 16]]} color={c} />
    </>
  ),
  "tuck-front-lever": (c) => (
    <>
      <line x1={-22} y1={-20} x2={22} y2={-20} stroke="#374151" strokeWidth={3} strokeLinecap="round" />
      <Head x={0} y={0} color={c} />
      <Torso x1={0} y1={6} x2={0} y2={14} color={c} />
      <Limb points={[[0, -2], [-6, -20]]} color={c} />
      <Limb points={[[0, -2], [6, -20]]} color={c} />
      <path d="M0,14 Q6,10 4,6" stroke={c} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </>
  ),
  "front-lever": (c) => (
    <>
      <line x1={-22} y1={-20} x2={22} y2={-20} stroke="#374151" strokeWidth={3} strokeLinecap="round" />
      <Head x={22} y={0} color={c} />
      <Torso x1={16} y1={1} x2={-18} y2={1} color={c} />
      <Limb points={[[-4, 1], [-4, -20]]} color={c} />
      <Limb points={[[4, 1], [4, -20]]} color={c} />
    </>
  ),
  "back-lever": (c) => (
    <>
      <line x1={-22} y1={-20} x2={22} y2={-20} stroke="#374151" strokeWidth={3} strokeLinecap="round" />
      <Head x={-22} y={0} color={c} />
      <Torso x1={-16} y1={1} x2={18} y2={1} color={c} />
      <Limb points={[[-4, 1], [-4, -20]]} color={c} />
      <Limb points={[[4, 1], [4, -20]]} color={c} />
    </>
  ),
  "90-degree-hold": (c) => (
    <>
      <Head x={14} y={-4} color={c} />
      <Torso x1={10} y1={0} x2={-16} y2={0} color={c} />
      <Limb points={[[0, 0], [-2, 12], [-6, 22]]} color={c} />
      <Limb points={[[-6, 0], [-10, 12], [-14, 22]]} color={c} />
      <path d="M-4,10 A4,4 0 0,1 -4,4" stroke="#facc15" strokeWidth={1} fill="none" opacity={0.5} />
    </>
  ),
  "human-flag": (c) => (
    <>
      <line x1={-20} y1={-28} x2={-20} y2={28} stroke="#374151" strokeWidth={3} strokeLinecap="round" />
      <Head x={6} y={0} color={c} />
      <Torso x1={0} y1={0} x2={-20} y2={0} color={c} w={2.5} />
      <Limb points={[[12, 0], [28, 0]]} color={c} />
      <Limb points={[[-6, 0], [-20, -12]]} color={c} />
      <Limb points={[[-6, 0], [-20, 12]]} color={c} />
    </>
  ),
  "burpee": (c) => (
    <>
      <Head x={-20} y={-16} color={c} />
      <line x1={-20} y1={-10} x2={-20} y2={2} stroke={c} strokeWidth={2} strokeLinecap="round" opacity={0.35} />
      <Head x={0} y={4} color={c} />
      <line x1={-12} y1={6} x2={12} y2={6} stroke={c} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
      <Head x={20} y={-20} color={c} />
      <Torso x1={20} y1={-14} x2={20} y2={0} color={c} w={2} />
      <Limb points={[[20, 0], [14, 10]]} color={c} w={2} />
      <Limb points={[[20, 0], [26, 10]]} color={c} w={2} />
    </>
  ),
  "bear-crawl": (c) => (
    <>
      <Head x={-14} y={-6} color={c} />
      <Torso x1={-8} y1={-2} x2={10} y2={6} color={c} w={3} />
      <Limb points={[[-4, 0], [-14, 14]]} color={c} />
      <Limb points={[[0, 2], [-6, 16]]} color={c} />
      <Limb points={[[6, 4], [14, 16]]} color={c} />
      <Limb points={[[10, 6], [18, 16]]} color={c} />
    </>
  ),
};

const colorMap: Record<string, string> = {
  "push-up": "#60a5fa", "diamond-push-up": "#60a5fa", "pike-push-up": "#60a5fa",
  "dips": "#60a5fa", "handstand-push-up": "#818cf8", "freestanding-hspu": "#c084fc",
  "pseudo-planche-push-up": "#f59e0b",
  "pull-up": "#a78bfa", "chin-up": "#a78bfa", "australian-pull-up": "#a78bfa", "muscle-up": "#c084fc",
  "squat": "#fb923c", "pistol-squat": "#fb923c", "lunge": "#fb923c", "calf-raise": "#fb923c", "jump-squat": "#fb923c",
  "plank": "#f472b6", "hollow-body-hold": "#f472b6", "hanging-leg-raise": "#f472b6", "dragon-flag": "#ef4444",
  "l-sit": "#fbbf24", "v-sit": "#fbbf24", "manna": "#fbbf24",
  "tuck-planche": "#ef4444", "straddle-planche": "#ef4444", "full-planche": "#ef4444",
  "tuck-front-lever": "#a78bfa", "front-lever": "#a78bfa", "back-lever": "#a78bfa",
  "90-degree-hold": "#ef4444", "human-flag": "#ef4444",
  "burpee": "#38bdf8", "bear-crawl": "#38bdf8",
};

export default function ExerciseIllustration({ exerciseId, size = 200, className }: Props) {
  const s = size;
  const mid = s / 2;
  const scale = s / 100;
  const color = colorMap[exerciseId] || "#9ca3af";
  const renderer = exerciseRenderers[exerciseId];

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className={`rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 ${className || ""}`}>
      <defs>
        <radialGradient id={`glow-${exerciseId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={mid} cy={mid} r={mid * 0.7} fill={`url(#glow-${exerciseId})`} />
      <Body cx={mid} cy={mid} s={scale} color={color}>
        {renderer ? renderer(color) : exerciseRenderers["squat"](color)}
      </Body>
    </svg>
  );
}
