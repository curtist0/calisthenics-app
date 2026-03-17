"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { WorkoutLog, UserStats, PlateauInfo, ExerciseRecord, StrengthDataPoint } from "@/lib/types";
import {
  getWorkoutLogs,
  saveWorkoutLog,
  getUserStats,
  recalculateStats,
  generateId,
  detectPlateaus,
  getExerciseRecords,
  getStrengthHistory,
} from "@/lib/storage";
import { getPlanById } from "@/data/workouts";

interface WorkoutContextType {
  logs: WorkoutLog[];
  stats: UserStats;
  plateaus: PlateauInfo[];
  records: ExerciseRecord[];
  activeWorkout: WorkoutLog | null;
  startDayWorkout: (planId: string, dayIndex: number) => WorkoutLog;
  completeSet: (
    exerciseIndex: number,
    setIndex: number,
    reps: number | null,
    holdSeconds: number | null
  ) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  refreshStats: () => void;
  getStrengthData: (exerciseId: string) => StrengthDataPoint[];
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalWorkouts: 0,
    totalExercises: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
  });
  const [plateaus, setPlateaus] = useState<PlateauInfo[]>([]);
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    setLogs(getWorkoutLogs());
    setStats(getUserStats());
    setPlateaus(detectPlateaus());
    setRecords(getExerciseRecords());
  }, []);

  const refreshStats = useCallback(() => {
    setStats(recalculateStats());
    setLogs(getWorkoutLogs());
    setPlateaus(detectPlateaus());
    setRecords(getExerciseRecords());
  }, []);

  const startDayWorkout = useCallback((planId: string, dayIndex: number): WorkoutLog => {
    const plan = getPlanById(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    const day = plan.days[dayIndex];
    if (!day || day.isRest) throw new Error("Cannot start a rest day");

    const log: WorkoutLog = {
      id: generateId(),
      planId,
      dayIndex,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      endTime: null,
      completed: false,
      exercises: day.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: Array.from({ length: ex.sets }, () => ({
          reps: null,
          holdSeconds: null,
          completed: false,
        })),
      })),
    };

    setActiveWorkout(log);
    return log;
  }, []);

  const completeSet = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      reps: number | null,
      holdSeconds: number | null
    ) => {
      setActiveWorkout((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.exercises = [...prev.exercises];
        updated.exercises[exerciseIndex] = {
          ...updated.exercises[exerciseIndex],
          sets: [...updated.exercises[exerciseIndex].sets],
        };
        updated.exercises[exerciseIndex].sets[setIndex] = {
          reps,
          holdSeconds,
          completed: true,
        };
        return updated;
      });
    },
    []
  );

  const finishWorkout = useCallback(() => {
    if (!activeWorkout) return;
    const finished: WorkoutLog = {
      ...activeWorkout,
      endTime: new Date().toISOString(),
      completed: true,
    };
    saveWorkoutLog(finished);
    setActiveWorkout(null);
    refreshStats();
  }, [activeWorkout, refreshStats]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  const getStrengthData = useCallback((exerciseId: string) => {
    return getStrengthHistory(exerciseId);
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        logs,
        stats,
        plateaus,
        records,
        activeWorkout,
        startDayWorkout,
        completeSet,
        finishWorkout,
        cancelWorkout,
        refreshStats,
        getStrengthData,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextType {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
