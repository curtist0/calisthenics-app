import { WeeklyPlan } from "@/lib/types";

// Legacy static plans are no longer used in the UI.
// Plans are now dynamically generated via planGenerator.ts and stored in localStorage.
// This file is kept for backward compatibility with any code that imports from it.
export const weeklyPlans: WeeklyPlan[] = [];

export function getPlanById(id: string): WeeklyPlan | undefined {
  return weeklyPlans.find((w) => w.id === id);
}
