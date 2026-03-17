"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { WorkoutLog, UserStats } from "@/lib/types";
import {
  getWorkoutLogs,
  saveWorkoutLog,
  getUserStats,
  recalculateStats,
  generateId,
} from "@/lib/storage";
import { getWorkoutById } from "@/data/workouts";

interface WorkoutContextType {
  logs: WorkoutLog[];
  stats: UserStats;
  activeWorkout: WorkoutLog | null;
  startWorkout: (workoutId: string) => WorkoutLog;
  completeSet: (
    exerciseIndex: number,
    setIndex: number,
    reps: number | null,
    holdSeconds: number | null
  ) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  refreshStats: () => void;
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
  const [activeWorkout, setActiveWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    setLogs(getWorkoutLogs());
    setStats(getUserStats());
  }, []);

  const refreshStats = useCallback(() => {
    setStats(recalculateStats());
    setLogs(getWorkoutLogs());
  }, []);

  const startWorkout = useCallback((workoutId: string): WorkoutLog => {
    const workout = getWorkoutById(workoutId);
    if (!workout) throw new Error(`Workout ${workoutId} not found`);

    const log: WorkoutLog = {
      id: generateId(),
      workoutId,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      endTime: null,
      completed: false,
      exercises: workout.exercises.map((ex) => ({
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

  return (
    <WorkoutContext.Provider
      value={{
        logs,
        stats,
        activeWorkout,
        startWorkout,
        completeSet,
        finishWorkout,
        cancelWorkout,
        refreshStats,
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
