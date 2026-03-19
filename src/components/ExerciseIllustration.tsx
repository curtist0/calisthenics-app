"use client";

import { getExerciseById } from "@/data/exercises";

interface Props {
  exerciseId: string;
  size?: number;
  className?: string;
}

export default function ExerciseIllustration({ exerciseId, size = 200, className }: Props) {
  const exercise = getExerciseById(exerciseId);
  const imageUrl = exercise?.imageUrl;
  const s = size;

  if (!imageUrl) {
    return (
      <div className={`rounded-2xl bg-gray-800/60 flex items-center justify-center ${className || ""}`} style={{ width: s, height: s }}>
        <span className="text-4xl">{exercise?.image || "💪"}</span>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-white ${className || ""}`} style={{ width: s, height: s }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={exercise?.name || "Exercise"} width={s} height={s} className="object-contain w-full h-full" loading="lazy" />
    </div>
  );
}
