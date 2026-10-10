import { WeeklyPlan, WorkoutLog } from "./types";

export const PLAN_LENGTH_WEEKS = 6;

export interface PlanProgress {
  completedSessions: number;
  totalSessions: number;
  currentWeek: number;
  percentage: number;
}

export function getPlanProgress(plan: WeeklyPlan, logs: WorkoutLog[]): PlanProgress {
  const sessionsPerWeek = plan.days.filter((day) => !day.isRest).length;
  const completedSessions = logs.filter((log) => log.planId === plan.id && log.completed).length;
  const totalSessions = sessionsPerWeek * PLAN_LENGTH_WEEKS;

  if (sessionsPerWeek === 0) {
    return { completedSessions, totalSessions, currentWeek: 1, percentage: 0 };
  }

  return {
    completedSessions,
    totalSessions,
    currentWeek: Math.min(PLAN_LENGTH_WEEKS, Math.floor(completedSessions / sessionsPerWeek) + 1),
    percentage: Math.min(100, Math.round((completedSessions / totalSessions) * 100)),
  };
}
