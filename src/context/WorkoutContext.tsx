"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { WorkoutLog, UserStats, PersonalRecord, WeeklyPlan, ProgressPhoto, UserProfile, WorkoutSessionUIState } from "@/lib/types";
import {
  getWorkoutLogs, saveWorkoutLog, getUserStats, recalculateStats, generateId,
  getPersonalRecords, getRecentPRs,
  getSavedPlans, savePlan, deletePlan as deletePlanStorage,
  getProgressPhotos, saveProgressPhoto, deleteProgressPhoto as deletePhotoStorage,
  getUserProfile, saveUserProfile,
  getWorkoutSessionUI, saveWorkoutSessionUI,
} from "@/lib/storage";

interface WorkoutContextType {
  logs: WorkoutLog[];
  stats: UserStats;
  personalRecords: PersonalRecord[];
  recentPRs: PersonalRecord[];
  savedPlans: WeeklyPlan[];
  photos: ProgressPhoto[];
  profile: UserProfile | null;
  activeWorkout: WorkoutLog | null;
  addPlan: (plan: WeeklyPlan) => void;
  removePlan: (planId: string) => void;
  startDayWorkout: (plan: WeeklyPlan, dayIndex: number) => WorkoutLog;
  completeSet: (ei: number, si: number, reps: number | null, hold: number | null, weight: number | null) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  refreshData: () => void;
  addPhoto: (dataUrl: string, note: string) => void;
  removePhoto: (id: string) => void;
  setProfile: (profile: UserProfile) => void;
  workoutSessionUI: WorkoutSessionUIState | null;
  setWorkoutSessionUI: (state: WorkoutSessionUIState | null) => void;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalWorkouts: 0, totalExercises: 0, currentStreak: 0, longestStreak: 0, lastWorkoutDate: null });
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [savedPlans, setSavedPlans] = useState<WeeklyPlan[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutLog | null>(null);
  const [workoutSessionUI, setWorkoutSessionUIState] = useState<WorkoutSessionUIState | null>(null);

  const setWorkoutSessionUI = useCallback((state: WorkoutSessionUIState | null) => {
    saveWorkoutSessionUI(state);
    setWorkoutSessionUIState(state);
  }, []);

  const refreshData = useCallback(() => {
    setLogs(getWorkoutLogs()); setStats(recalculateStats()); setPersonalRecords(getPersonalRecords());
    setRecentPRs(getRecentPRs()); setSavedPlans(getSavedPlans()); setPhotos(getProgressPhotos());
    setProfileState(getUserProfile());
    setWorkoutSessionUIState(getWorkoutSessionUI());
  }, []);

  useEffect(() => {
    setLogs(getWorkoutLogs()); setStats(getUserStats()); setPersonalRecords(getPersonalRecords());
    setRecentPRs(getRecentPRs()); setSavedPlans(getSavedPlans()); setPhotos(getProgressPhotos());
    setProfileState(getUserProfile());
    setWorkoutSessionUIState(getWorkoutSessionUI());
  }, []);

  const setProfile = useCallback((p: UserProfile) => { saveUserProfile(p); setProfileState(p); }, []);
  const addPlan = useCallback((plan: WeeklyPlan) => { savePlan(plan); setSavedPlans(getSavedPlans()); }, []);
  const removePlan = useCallback((id: string) => { deletePlanStorage(id); setSavedPlans(getSavedPlans()); }, []);

  const startDayWorkout = useCallback((plan: WeeklyPlan, dayIndex: number): WorkoutLog => {
    const day = plan.days[dayIndex];
    if (!day || day.isRest) throw new Error("Cannot start rest day");
    const log: WorkoutLog = {
      id: generateId(), planId: plan.id, dayIndex, date: new Date().toISOString(),
      startTime: new Date().toISOString(), endTime: null, completed: false,
      exercises: day.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: Array.from({ length: ex.sets }, () => ({ reps: null, holdSeconds: null, weightKg: null, completed: false })),
      })),
    };
    setActiveWorkout(log);
    setWorkoutSessionUIState(null);
    saveWorkoutSessionUI(null);
    return log;
  }, []);

  const completeSet = useCallback((ei: number, si: number, reps: number | null, hold: number | null, weight: number | null) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      const u = { ...prev, exercises: [...prev.exercises] };
      u.exercises[ei] = { ...u.exercises[ei], sets: [...u.exercises[ei].sets] };
      u.exercises[ei].sets[si] = { reps, holdSeconds: hold, weightKg: weight, completed: true };
      return u;
    });
  }, []);

  const finishWorkout = useCallback(() => {
    if (!activeWorkout) return;
    saveWorkoutLog({ ...activeWorkout, endTime: new Date().toISOString(), completed: true });
    setActiveWorkout(null);
    saveWorkoutSessionUI(null);
    setWorkoutSessionUIState(null);
    refreshData();
  }, [activeWorkout, refreshData]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
    saveWorkoutSessionUI(null);
    setWorkoutSessionUIState(null);
  }, []);
  const addPhoto = useCallback((dataUrl: string, note: string) => { saveProgressPhoto({ id: generateId(), date: new Date().toISOString(), dataUrl, note }); setPhotos(getProgressPhotos()); }, []);
  const removePhoto = useCallback((id: string) => { deletePhotoStorage(id); setPhotos(getProgressPhotos()); }, []);

  return (
    <WorkoutContext.Provider value={{
      logs, stats, personalRecords, recentPRs, savedPlans, photos, profile, activeWorkout,
      addPlan, removePlan, startDayWorkout, completeSet, finishWorkout, cancelWorkout,
      refreshData, addPhoto, removePhoto, setProfile, workoutSessionUI, setWorkoutSessionUI,
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
