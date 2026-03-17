"use client";

import { StrengthDataPoint } from "@/lib/types";

interface Props {
  data: StrengthDataPoint[];
  label: string;
  color?: string;
}

export default function StrengthChart({ data, label, color = "#4ade80" }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xs text-gray-500 mt-2">No data yet — complete workouts to track progress</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value));
  const range = Math.max(maxVal - minVal, 1);

  const chartW = 280;
  const chartH = 80;
  const padding = 5;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (chartW - padding * 2);
    const y = chartH - padding - ((d.value - minVal) / range) * (chartH - padding * 2);
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  const trend = data.length >= 2
    ? data[data.length - 1].value - data[0].value
    : 0;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-white">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color }}>
            {data[data.length - 1].value}
          </span>
          {trend !== 0 && (
            <span
              className={`text-xs font-medium ${
                trend > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}
            </span>
          )}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full"
        style={{ height: "80px" }}
      >
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}
        {/* Baseline */}
        <line
          x1={padding}
          y1={chartH - padding}
          x2={chartW - padding}
          y2={chartH - padding}
          stroke="#374151"
          strokeWidth="0.5"
        />
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{data[0].date.slice(5)}</span>
        <span>{data[data.length - 1].date.slice(5)}</span>
      </div>
    </div>
  );
}
