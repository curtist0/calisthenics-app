"use client";

import { getExerciseById } from "@/data/exercises";

interface Props {
  exerciseId: string;
  size?: number;
  showBorder?: boolean;
}

export default function ExerciseGifIcon({ exerciseId, size = 40, showBorder = true }: Props) {
  const ex = getExerciseById(exerciseId);
  if (!ex || !ex.imageUrl) return null;

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex-shrink-0 rounded-xl overflow-hidden bg-white flex items-center justify-center ${showBorder ? "border border-gray-200/20" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ex.imageUrl} alt={ex.name} width={size} height={size} className="object-contain w-full h-full" />
    </div>
  );
}
