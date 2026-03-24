"use client";

import { getExerciseById } from "@/data/exercises";
import ExerciseGifIcon from "./ExerciseGifIcon";

interface Props {
  exerciseId: string;
  size?: number;
  className?: string;
}

/**
 * ExerciseIllustration - Now uses GitHub GIFs exclusively
 * Previously contained custom SVG stick figures, but per requirements
 * all exercise visuals now come from omercotkd/exercises-gifs repository
 */
export default function ExerciseIllustration({ exerciseId, size = 100, className = "" }: Props) {
  const ex = getExerciseById(exerciseId);
  if (!ex) return null;

  return (
    <div className={className}>
      <ExerciseGifIcon exerciseId={exerciseId} size={size} showBorder={true} />
    </div>
  );
}
