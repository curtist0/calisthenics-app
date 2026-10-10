export type WorkoutIconName =
  | "arrow"
  | "bar"
  | "calendar"
  | "camera"
  | "check"
  | "clock"
  | "close"
  | "dumbbell"
  | "heart"
  | "lock"
  | "moon"
  | "pause"
  | "play"
  | "plus"
  | "spark"
  | "target"
  | "trash"
  | "trophy"
  | "yoga";

const iconPaths: Record<WorkoutIconName, ReactNode> = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  bar: <><path d="M4 9v6m4-9v12m8-12v12m4-9v6M8 12h8" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  camera: <><path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="4" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  dumbbell: <><path d="M6 8v8m-3-6v4m18-4v4m-3-6v8M6 12h12" /></>,
  heart: <path d="M20.8 8.6c0 5.2-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.6a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" />,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2" /></>,
  moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  play: <path d="m8 5 12 7-12 7V5Z" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  trash: <><path d="M4 7h16m-10 4v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" /></>,
  trophy: <><path d="M8 21h8m-4-4v4m-5-18h10v5a5 5 0 0 1-10 0V3Z" /><path d="M7 5H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4" /></>,
  yoga: <><circle cx="12" cy="5" r="2" /><path d="m12 8-3 4-4 1m7-5 4 4 4 1m-11-1 2 4-3 4m8-8-2 4 3 4m-8-4h6" /></>,
};

export default function WorkoutIcon({
  name,
  className = "h-6 w-6",
}: {
  name: WorkoutIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  );
}
import type { ReactNode } from "react";
