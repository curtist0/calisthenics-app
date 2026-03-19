"use client";

import { getExerciseById } from "@/data/exercises";

interface Props {
  exerciseId: string;
  size?: number;
}

export default function ExerciseAnimation({ exerciseId, size = 140 }: Props) {
  const ex = getExerciseById(exerciseId);
  if (!ex) return null;

  const s = size;

  if (ex.imageUrl) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative rounded-2xl overflow-hidden bg-white" style={{ width: s, height: s }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ex.imageUrl} alt={ex.name} width={s} height={s} className="object-contain w-full h-full" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-[10px] text-white font-bold text-center">Follow along</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl bg-gray-800/50 flex items-center justify-center" style={{ width: s, height: s }}>
        <span className="text-5xl">{ex.image}</span>
      </div>
    </div>
  );
}
