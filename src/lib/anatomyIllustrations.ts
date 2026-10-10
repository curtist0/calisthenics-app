export const ANATOMY_EXERCISE_IDS = [
  "freestanding-hspu",
  "manna",
  "tuck-planche",
  "skin-the-cat",
  "tucked-l-sit",
  "negative-pull-up",
  "planche-lean",
  "tuck-fl-raise",
  "90-degree-hold",
  "dead-hang",
] as const;

export type AnatomyExerciseId = (typeof ANATOMY_EXERCISE_IDS)[number];

export function isAnatomyExerciseId(id: string): id is AnatomyExerciseId {
  return (ANATOMY_EXERCISE_IDS as readonly string[]).includes(id);
}
