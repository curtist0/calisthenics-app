"use client";

interface Props {
  exerciseId: string;
  size?: number;
  className?: string;
}

function Human({
  cx,
  cy,
  scale = 1,
  color = "#e2e8f0",
  pose,
}: {
  cx: number;
  cy: number;
  scale?: number;
  color?: string;
  pose: string;
}) {
  const s = scale;
  const headR = 6 * s;
  const sw = 2.5 * s;

  const poses: Record<string, React.ReactNode> = {
    "push-up-down": (
      <g>
        <circle cx={cx + 32 * s} cy={cy - 4 * s} r={headR} fill={color} />
        <line x1={cx + 26 * s} y1={cy} x2={cx - 5 * s} y2={cy + 3 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 5 * s} y1={cy + 3 * s} x2={cx - 30 * s} y2={cy + 3 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 20 * s} y1={cy + 2 * s} x2={cx + 15 * s} y2={cy + 16 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 15 * s} y1={cy + 16 * s} x2={cx + 20 * s} y2={cy + 24 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 30 * s} y1={cy + 3 * s} x2={cx - 35 * s} y2={cy + 15 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 35 * s} y1={cy + 15 * s} x2={cx - 38 * s} y2={cy + 24 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "push-up-up": (
      <g>
        <circle cx={cx + 32 * s} cy={cy - 12 * s} r={headR} fill={color} />
        <line x1={cx + 26 * s} y1={cy - 7 * s} x2={cx - 10 * s} y2={cy - 3 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 10 * s} y1={cy - 3 * s} x2={cx - 35 * s} y2={cy - 3 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 20 * s} y1={cy - 5 * s} x2={cx + 20 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 20 * s} y1={cy + 14 * s} x2={cx + 20 * s} y2={cy + 24 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 35 * s} y1={cy - 3 * s} x2={cx - 35 * s} y2={cy + 10 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 35 * s} y1={cy + 10 * s} x2={cx - 38 * s} y2={cy + 24 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "pull-up": (
      <g>
        <line x1={cx - 20 * s} y1={cy - 28 * s} x2={cx + 20 * s} y2={cy - 28 * s} stroke="#4b5563" strokeWidth={3 * s} strokeLinecap="round" />
        <circle cx={cx} cy={cy - 18 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 12 * s} x2={cx} y2={cy + 8 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 8 * s} x2={cx - 14 * s} y2={cy - 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 8 * s} x2={cx + 14 * s} y2={cy - 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 8 * s} x2={cx - 8 * s} y2={cy + 24 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 8 * s} x2={cx + 8 * s} y2={cy + 24 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "hanging": (
      <g>
        <line x1={cx - 20 * s} y1={cy - 28 * s} x2={cx + 20 * s} y2={cy - 28 * s} stroke="#4b5563" strokeWidth={3 * s} strokeLinecap="round" />
        <circle cx={cx} cy={cy - 12 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 6 * s} x2={cx} y2={cy + 12 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 4 * s} x2={cx - 8 * s} y2={cy - 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 4 * s} x2={cx + 8 * s} y2={cy - 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 12 * s} x2={cx - 6 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 12 * s} x2={cx + 6 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "hanging-leg-raise": (
      <g>
        <line x1={cx - 20 * s} y1={cy - 28 * s} x2={cx + 20 * s} y2={cy - 28 * s} stroke="#4b5563" strokeWidth={3 * s} strokeLinecap="round" />
        <circle cx={cx} cy={cy - 12 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 6 * s} x2={cx} y2={cy + 10 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 4 * s} x2={cx - 8 * s} y2={cy - 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 4 * s} x2={cx + 8 * s} y2={cy - 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 10 * s} x2={cx + 20 * s} y2={cy + 5 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 20 * s} y1={cy + 5 * s} x2={cx + 30 * s} y2={cy + 5 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "dip": (
      <g>
        <rect x={cx - 30 * s} y={cy + 2 * s} width={14 * s} height={3 * s} rx={1} fill="#4b5563" />
        <rect x={cx + 16 * s} y={cy + 2 * s} width={14 * s} height={3 * s} rx={1} fill="#4b5563" />
        <circle cx={cx} cy={cy - 18 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 12 * s} x2={cx} y2={cy + 5 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 6 * s} x2={cx - 16 * s} y2={cy + 3 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 6 * s} x2={cx + 16 * s} y2={cy + 3 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 5 * s} x2={cx - 6 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 6 * s} y1={cy + 18 * s} x2={cx - 4 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 5 * s} x2={cx + 6 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 6 * s} y1={cy + 18 * s} x2={cx + 4 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "handstand": (
      <g>
        <circle cx={cx} cy={cy + 22 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy + 16 * s} x2={cx} y2={cy - 5 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 5 * s} x2={cx - 10 * s} y2={cy - 24 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 5 * s} x2={cx + 10 * s} y2={cy - 24 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 10 * s} x2={cx - 12 * s} y2={cy + 26 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 10 * s} x2={cx + 12 * s} y2={cy + 26 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "squat": (
      <g>
        <circle cx={cx} cy={cy - 16 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 10 * s} x2={cx} y2={cy + 4 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 4 * s} x2={cx - 12 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 12 * s} y1={cy + 14 * s} x2={cx - 12 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 4 * s} x2={cx + 12 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 12 * s} y1={cy + 14 * s} x2={cx + 12 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 4 * s} x2={cx + 16 * s} y2={cy - 2 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 4 * s} x2={cx - 16 * s} y2={cy - 2 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "lunge": (
      <g>
        <circle cx={cx} cy={cy - 18 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 12 * s} x2={cx} y2={cy + 2 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 2 * s} x2={cx - 14 * s} y2={cy + 12 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 14 * s} y1={cy + 12 * s} x2={cx - 14 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 2 * s} x2={cx + 14 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 14 * s} y1={cy + 14 * s} x2={cx + 20 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "plank": (
      <g>
        <circle cx={cx + 30 * s} cy={cy - 2 * s} r={headR} fill={color} />
        <line x1={cx + 24 * s} y1={cy + 2 * s} x2={cx - 28 * s} y2={cy + 2 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 18 * s} y1={cy + 2 * s} x2={cx + 14 * s} y2={cy + 16 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 28 * s} y1={cy + 2 * s} x2={cx - 28 * s} y2={cy + 16 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 28 * s} y1={cy + 16 * s} x2={cx - 32 * s} y2={cy + 16 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "hollow-body": (
      <g>
        <circle cx={cx - 24 * s} cy={cy + 4 * s} r={headR} fill={color} />
        <path d={`M${cx - 18 * s},${cy + 6 * s} Q${cx},${cy - 8 * s} ${cx + 22 * s},${cy + 4 * s}`} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />
        <line x1={cx - 18 * s} y1={cy + 4 * s} x2={cx - 32 * s} y2={cy - 2 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 22 * s} y1={cy + 4 * s} x2={cx + 34 * s} y2={cy} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "l-sit": (
      <g>
        <rect x={cx - 12 * s} y={cy + 8 * s} width={4 * s} height={16 * s} rx={1} fill="#4b5563" />
        <rect x={cx + 8 * s} y={cy + 8 * s} width={4 * s} height={16 * s} rx={1} fill="#4b5563" />
        <circle cx={cx} cy={cy - 12 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 6 * s} x2={cx} y2={cy + 8 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 2 * s} x2={cx - 10 * s} y2={cy + 8 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 2 * s} x2={cx + 10 * s} y2={cy + 8 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 8 * s} x2={cx + 26 * s} y2={cy + 8 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "planche": (
      <g>
        <circle cx={cx + 28 * s} cy={cy - 2 * s} r={headR} fill={color} />
        <line x1={cx + 22 * s} y1={cy + 2 * s} x2={cx - 26 * s} y2={cy + 2 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 4 * s} y1={cy + 2 * s} x2={cx + 2 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 4 * s} y1={cy + 2 * s} x2={cx - 6 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "tuck-planche": (
      <g>
        <circle cx={cx + 10 * s} cy={cy - 6 * s} r={headR} fill={color} />
        <line x1={cx + 5 * s} y1={cy} x2={cx - 6 * s} y2={cy + 4 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 6 * s} y1={cy + 4 * s} x2={cx + 4 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 2 * s} y1={cy + 2 * s} x2={cx - 8 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 2 * s} y1={cy + 2 * s} x2={cx + 6 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "front-lever": (
      <g>
        <line x1={cx - 20 * s} y1={cy - 20 * s} x2={cx + 20 * s} y2={cy - 20 * s} stroke="#4b5563" strokeWidth={3 * s} strokeLinecap="round" />
        <circle cx={cx + 24 * s} cy={cy} r={headR} fill={color} />
        <line x1={cx + 18 * s} y1={cy + 2 * s} x2={cx - 24 * s} y2={cy + 2 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 4 * s} y1={cy + 2 * s} x2={cx - 6 * s} y2={cy - 20 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 4 * s} y1={cy + 2 * s} x2={cx + 6 * s} y2={cy - 20 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "back-lever": (
      <g>
        <line x1={cx - 20 * s} y1={cy - 20 * s} x2={cx + 20 * s} y2={cy - 20 * s} stroke="#4b5563" strokeWidth={3 * s} strokeLinecap="round" />
        <circle cx={cx - 24 * s} cy={cy} r={headR} fill={color} />
        <line x1={cx - 18 * s} y1={cy + 2 * s} x2={cx + 24 * s} y2={cy + 2 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 4 * s} y1={cy + 2 * s} x2={cx - 6 * s} y2={cy - 20 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 4 * s} y1={cy + 2 * s} x2={cx + 6 * s} y2={cy - 20 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "dragon-flag": (
      <g>
        <rect x={cx - 4 * s} y={cy + 14 * s} width={40 * s} height={4 * s} rx={2} fill="#4b5563" />
        <circle cx={cx + 32 * s} cy={cy + 12 * s} r={headR} fill={color} />
        <line x1={cx + 28 * s} y1={cy + 12 * s} x2={cx + 4 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 4 * s} y1={cy + 14 * s} x2={cx - 10 * s} y2={cy - 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 10 * s} y1={cy - 14 * s} x2={cx - 14 * s} y2={cy - 26 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "muscle-up": (
      <g>
        <line x1={cx - 20 * s} y1={cy - 4 * s} x2={cx + 20 * s} y2={cy - 4 * s} stroke="#4b5563" strokeWidth={3 * s} strokeLinecap="round" />
        <circle cx={cx} cy={cy - 18 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 12 * s} x2={cx} y2={cy + 4 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 8 * s} x2={cx - 16 * s} y2={cy - 4 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 8 * s} x2={cx + 16 * s} y2={cy - 4 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 4 * s} x2={cx - 8 * s} y2={cy + 22 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 4 * s} x2={cx + 8 * s} y2={cy + 22 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "v-sit": (
      <g>
        <circle cx={cx} cy={cy + 10 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy + 16 * s} x2={cx} y2={cy + 26 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 26 * s} x2={cx + 14 * s} y2={cy - 6 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 20 * s} x2={cx - 10 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 20 * s} x2={cx + 10 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "flag": (
      <g>
        <line x1={cx - 20 * s} y1={cy - 28 * s} x2={cx - 20 * s} y2={cy + 28 * s} stroke="#4b5563" strokeWidth={3 * s} strokeLinecap="round" />
        <circle cx={cx + 8 * s} cy={cy} r={headR} fill={color} />
        <line x1={cx + 2 * s} y1={cy} x2={cx - 20 * s} y2={cy} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 14 * s} y1={cy} x2={cx + 34 * s} y2={cy} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 8 * s} y1={cy} x2={cx - 20 * s} y2={cy - 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 8 * s} y1={cy} x2={cx - 20 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "ninety-degree": (
      <g>
        <circle cx={cx + 16 * s} cy={cy - 4 * s} r={headR} fill={color} />
        <line x1={cx + 10 * s} y1={cy} x2={cx - 18 * s} y2={cy} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 2 * s} y1={cy} x2={cx - 2 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 2 * s} y1={cy + 14 * s} x2={cx - 6 * s} y2={cy + 26 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 8 * s} y1={cy} x2={cx - 12 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 12 * s} y1={cy + 14 * s} x2={cx - 16 * s} y2={cy + 26 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "pike": (
      <g>
        <circle cx={cx} cy={cy - 14 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 8 * s} x2={cx} y2={cy + 8 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 8 * s} x2={cx + 20 * s} y2={cy + 20 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 20 * s} y1={cy + 20 * s} x2={cx + 24 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 8 * s} x2={cx - 20 * s} y2={cy + 20 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 20 * s} y1={cy + 20 * s} x2={cx - 24 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 2 * s} x2={cx - 14 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy - 2 * s} x2={cx + 14 * s} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "burpee": (
      <g>
        <circle cx={cx - 22 * s} cy={cy - 18 * s} r={5 * s} fill={color} opacity={0.4} />
        <line x1={cx - 22 * s} y1={cy - 13 * s} x2={cx - 22 * s} y2={cy + 4 * s} stroke={color} strokeWidth={2 * s} strokeLinecap="round" opacity={0.4} />
        <circle cx={cx} cy={cy + 2 * s} r={5 * s} fill={color} opacity={0.6} />
        <line x1={cx - 16 * s} y1={cy + 4 * s} x2={cx + 16 * s} y2={cy + 4 * s} stroke={color} strokeWidth={2 * s} strokeLinecap="round" opacity={0.6} />
        <circle cx={cx + 22 * s} cy={cy - 22 * s} r={5 * s} fill={color} />
        <line x1={cx + 22 * s} y1={cy - 17 * s} x2={cx + 22 * s} y2={cy - 2 * s} stroke={color} strokeWidth={2 * s} strokeLinecap="round" />
        <line x1={cx + 22 * s} y1={cy - 2 * s} x2={cx + 16 * s} y2={cy + 10 * s} stroke={color} strokeWidth={2 * s} strokeLinecap="round" />
        <line x1={cx + 22 * s} y1={cy - 2 * s} x2={cx + 28 * s} y2={cy + 10 * s} stroke={color} strokeWidth={2 * s} strokeLinecap="round" />
      </g>
    ),
    "bear-crawl": (
      <g>
        <circle cx={cx - 16 * s} cy={cy - 6 * s} r={headR} fill={color} />
        <line x1={cx - 10 * s} y1={cy - 2 * s} x2={cx + 8 * s} y2={cy + 8 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 8 * s} y1={cy + 8 * s} x2={cx + 24 * s} y2={cy + 8 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 4 * s} y1={cy + 2 * s} x2={cx - 16 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 4 * s} y1={cy + 6 * s} x2={cx + 8 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx + 16 * s} y1={cy + 8 * s} x2={cx + 22 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 4 * s} y1={cy + 2 * s} x2={cx - 8 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "calf-raise": (
      <g>
        <rect x={cx - 12 * s} y={cy + 18 * s} width={24 * s} height={4 * s} rx={2} fill="#4b5563" />
        <circle cx={cx} cy={cy - 20 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy - 14 * s} x2={cx} y2={cy + 4 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 4 * s} x2={cx} y2={cy + 14 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 14 * s} x2={cx} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "pistol-squat": (
      <g>
        <circle cx={cx - 4 * s} cy={cy - 14 * s} r={headR} fill={color} />
        <line x1={cx - 4 * s} y1={cy - 8 * s} x2={cx - 4 * s} y2={cy + 6 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 4 * s} y1={cy + 6 * s} x2={cx - 14 * s} y2={cy + 18 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 14 * s} y1={cy + 18 * s} x2={cx - 10 * s} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx - 4 * s} y1={cy + 6 * s} x2={cx + 22 * s} y2={cy + 6 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
    "manna": (
      <g>
        <circle cx={cx} cy={cy + 12 * s} r={headR} fill={color} />
        <line x1={cx} y1={cy + 18 * s} x2={cx} y2={cy + 28 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 28 * s} x2={cx - 6 * s} y2={cy - 10 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 22 * s} x2={cx - 10 * s} y2={cy + 30 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1={cx} y1={cy + 22 * s} x2={cx + 10 * s} y2={cy + 30 * s} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      </g>
    ),
  };

  return <>{poses[pose] || poses["squat"]}</>;
}

const exercisePoseMap: Record<string, { pose: string; color: string }> = {
  "push-up": { pose: "push-up-up", color: "#60a5fa" },
  "diamond-push-up": { pose: "push-up-down", color: "#60a5fa" },
  "pike-push-up": { pose: "pike", color: "#60a5fa" },
  "dips": { pose: "dip", color: "#60a5fa" },
  "handstand-push-up": { pose: "handstand", color: "#60a5fa" },
  "freestanding-hspu": { pose: "handstand", color: "#f59e0b" },
  "pseudo-planche-push-up": { pose: "push-up-down", color: "#f59e0b" },
  "pull-up": { pose: "pull-up", color: "#a78bfa" },
  "chin-up": { pose: "pull-up", color: "#a78bfa" },
  "australian-pull-up": { pose: "push-up-up", color: "#a78bfa" },
  "muscle-up": { pose: "muscle-up", color: "#f59e0b" },
  "squat": { pose: "squat", color: "#fb923c" },
  "pistol-squat": { pose: "pistol-squat", color: "#fb923c" },
  "lunge": { pose: "lunge", color: "#fb923c" },
  "calf-raise": { pose: "calf-raise", color: "#fb923c" },
  "jump-squat": { pose: "squat", color: "#fb923c" },
  "plank": { pose: "plank", color: "#ec4899" },
  "hollow-body-hold": { pose: "hollow-body", color: "#ec4899" },
  "hanging-leg-raise": { pose: "hanging-leg-raise", color: "#ec4899" },
  "dragon-flag": { pose: "dragon-flag", color: "#ef4444" },
  "l-sit": { pose: "l-sit", color: "#f59e0b" },
  "v-sit": { pose: "v-sit", color: "#f59e0b" },
  "manna": { pose: "manna", color: "#f59e0b" },
  "tuck-planche": { pose: "tuck-planche", color: "#ef4444" },
  "straddle-planche": { pose: "planche", color: "#ef4444" },
  "full-planche": { pose: "planche", color: "#ef4444" },
  "tuck-front-lever": { pose: "front-lever", color: "#a78bfa" },
  "front-lever": { pose: "front-lever", color: "#a78bfa" },
  "back-lever": { pose: "back-lever", color: "#a78bfa" },
  "90-degree-hold": { pose: "ninety-degree", color: "#ef4444" },
  "human-flag": { pose: "flag", color: "#ef4444" },
  "burpee": { pose: "burpee", color: "#38bdf8" },
  "bear-crawl": { pose: "bear-crawl", color: "#38bdf8" },
};

export default function ExerciseIllustration({ exerciseId, size = 200, className }: Props) {
  const s = size;
  const mid = s / 2;
  const mapping = exercisePoseMap[exerciseId] || { pose: "squat", color: "#9ca3af" };

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className={`rounded-xl bg-gray-800/60 ${className || ""}`}
    >
      <Human cx={mid} cy={mid} scale={s / 100} color={mapping.color} pose={mapping.pose} />
    </svg>
  );
}
