"use client";
import React from "react";

type Props = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
};

export default function Sparkline({ data, width = 120, height = 28, color = "#34d399" }: Props) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const len = data.length;
  const points = data
    .map((d, i) => {
      const x = (i / (len - 1 || 1)) * width;
      const y = height - ((d - min) / ((max - min) || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const last = data[data.length - 1];
  const first = data[0];
  const growth = last - first;
  const growthSign = growth >= 0 ? "+" : "";

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`text-xs font-medium ${growth >= 0 ? "text-green-400" : "text-rose-400"}`}>{growthSign}{growth}</span>
    </div>
  );
}
