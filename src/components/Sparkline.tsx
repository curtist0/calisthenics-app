"use client";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  positiveColor?: string;
  negativeColor?: string;
  showGrowth?: boolean;
}

export default function Sparkline({
  data,
  width = 100,
  height = 24,
  color = "#a78bfa",
  positiveColor = "#10b981",
  negativeColor = "#f87171",
  showGrowth = true,
}: Props) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Calculate points for the path
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  // Calculate growth
  const first = data[0];
  const last = data[data.length - 1];
  const growth = last - first;
  const growthColor = growth >= 0 ? positiveColor : negativeColor;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Fill area under line */}
        <defs>
          <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>

        {/* Line */}
        <path d={pathData} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Start point */}
        <circle cx={0} cy={height - ((first - min) / range) * (height - 4) - 2} r={2} fill={color} opacity={0.5} />

        {/* End point */}
        <circle
          cx={width}
          cy={height - ((last - min) / range) * (height - 4) - 2}
          r={2}
          fill={growthColor}
          opacity={0.8}
        />
      </svg>
    </div>
  );
}
