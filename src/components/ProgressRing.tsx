"use client";
import React from "react";

type Props = {
  size?: number;
  stroke?: number;
  progress: number; // 0-100
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
};

export default function ProgressRing({ size = 64, stroke = 8, progress, color = "#38bdf8", trackColor = "#1f2937", children }: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ width: size, height: size }} className="relative inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{children}</div>
      )}
    </div>
  );
}
