"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { WorkoutLog, UserStats, PersonalRecord, WeeklyPlan, ProgressPhoto } from "@/lib/types";
import {
  getWorkoutLogs, saveWorkoutLog, getUserStats, recalculateStats, generateId,
  getPersonalRecords, getRecentPRs,
  getSavedPlans, savePlan, deletePlan as deletePlanFromStorage,
  getProgressPhotos, saveProgressPhoto, deleteProgressPhoto as deletePhotoFromStorage,
} from "@/lib/storage";

interface WorkoutContextType {
  logs: WorkoutLog[];
  stats: UserStats;
  personalRecords: PersonalRecord[];
  recentPRs: PersonalRecord[];
  savedPlans: WeeklyPlan[];
  photos: ProgressPhoto[];
  activeWorkout: WorkoutLog | null;
  addPlan: (plan: WeeklyPlan) => void;
  removePlan: (planId: string) => void;
  startDayWorkout: (plan: WeeklyPlan, dayIndex: number) => WorkoutLog;
  completeSet: (exerciseIndex: number, setIndex: number, reps: number | null, holdSeconds: number | null, weightKg: number | null) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  refreshData: () => void;
  addPhoto: (dataUrl: string, note: string) => void;
  removePhoto: (id: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalWorkouts: 0, totalExercises: 0, currentStreak: 0, longestStreak: 0, lastWorkoutDate: null });
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [savedPlans, setSavedPlans] = useState<WeeklyPlan[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutLog | null>(null);

  const refreshData = useCallback(() => {
    setLogs(getWorkoutLogs());
    setStats(recalculateStats());
    setPersonalRecords(getPersonalRecords());
    setRecentPRs(getRecentPRs());
    setSavedPlans(getSavedPlans());
    setPhotos(getProgressPhotos());
  }, []);

  useEffect(() => {
    setLogs(getWorkoutLogs());
    setStats(getUserStats());
    setPersonalRecords(getPersonalRecords());
    setRecentPRs(getRecentPRs());
    setSavedPlans(getSavedPlans());
    setPhotos(getProgressPhotos());
  }, []);

  const addPlan = useCallback((plan: WeeklyPlan) => {
    savePlan(plan);
    setSavedPlans(getSavedPlans());
  }, []);

  const removePlan = useCallback((planId: string) => {
    deletePlanFromStorage(planId);
    setSavedPlans(getSavedPlans());
  }, []);

  const startDayWorkout = useCallback((plan: WeeklyPlan, dayIndex: number): WorkoutLog => {
    const day = plan.days[dayIndex];
    if (!day || day.isRest) throw new Error("Cannot start a rest day");
    const log: WorkoutLog = {
      id: generateId(), planId: plan.id, dayIndex, date: new Date().toISOString(),
      startTime: new Date().toISOString(), endTime: null, completed: false,
      exercises: day.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: Array.from({ length: ex.sets }, () => ({ reps: null, holdSeconds: null, weightKg: null, completed: false })),
      })),
    };
    setActiveWorkout(log);
    return log;
  }, []);

  const completeSet = useCallback((exerciseIndex: number, setIndex: number, reps: number | null, holdSeconds: number | null, weightKg: number | null) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, exercises: [...prev.exercises] };
      updated.exercises[exerciseIndex] = { ...updated.exercises[exerciseIndex], sets: [...updated.exercises[exerciseIndex].sets] };
      updated.exercises[exerciseIndex].sets[setIndex] = { reps, holdSeconds, weightKg, completed: true };
      return updated;
    });
  }, []);

  const finishWorkout = useCallback(() => {
    if (!activeWorkout) return;
    const finished: WorkoutLog = { ...activeWorkout, endTime: new Date().toISOString(), completed: true };
    saveWorkoutLog(finished);
    setActiveWorkout(null);
    refreshData();
  }, [activeWorkout, refreshData]);

  const cancelWorkout = useCallback(() => { setActiveWorkout(null); }, []);

  const addPhoto = useCallback((dataUrl: string, note: string) => {
    saveProgressPhoto({ id: generateId(), date: new Date().toISOString(), dataUrl, note });
    setPhotos(getProgressPhotos());
  }, []);

  const removePhoto = useCallback((id: string) => {
    deletePhotoFromStorage(id);
    setPhotos(getProgressPhotos());
  }, []);

  return (
    <WorkoutContext.Provider value={{
      logs, stats, personalRecords, recentPRs, savedPlans, photos, activeWorkout,
      addPlan, removePlan, startDayWorkout, completeSet, finishWorkout, cancelWorkout,
      refreshData, addPhoto, removePhoto,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextType {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider");
  return ctx;
}
