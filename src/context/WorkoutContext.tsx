"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { WorkoutLog, UserStats, PersonalRecord, WeeklyPlan, ProgressPhoto, UserProfile, WorkoutSessionUIState, YogaSession } from "@/lib/types";
import {
  getWorkoutLogs, saveWorkoutLog, getUserStats, recalculateStats, generateId,
  getPersonalRecords, getRecentPRs,
  getSavedPlans, savePlan, deletePlan as deletePlanStorage,
  getProgressPhotos, saveProgressPhoto, deleteProgressPhoto as deletePhotoStorage,
  getUserProfile, saveUserProfile,
  getWorkoutSessionUI, saveWorkoutSessionUI,
  getActiveCalisthenicsSession, saveActiveCalisthenicsSession,
  getActiveYogaSession, saveActiveYogaSession,
} from "@/lib/storage";
import { calculateRanks } from "@/lib/rankingSystem";

interface WorkoutContextType {
  logs: WorkoutLog[];
  stats: UserStats;
  personalRecords: PersonalRecord[];
  recentPRs: PersonalRecord[];
  savedPlans: WeeklyPlan[];
  photos: ProgressPhoto[];
  profile: UserProfile | null;
  activeCalisthenicsSession: WorkoutLog | null;
  activeYogaSession: YogaSession | null;
  // Backward compatibility - maps to activeCalisthenicsSession
  activeWorkout: WorkoutLog | null;
  addPlan: (plan: WeeklyPlan) => void;
  removePlan: (planId: string) => void;
  startCalisthenicsWorkout: (plan: WeeklyPlan, dayIndex: number) => WorkoutLog;
  startYogaSession: (plan: WeeklyPlan, dayIndex: number, flowId: string) => YogaSession;
  // Backward compatibility - maps to startCalisthenicsWorkout
  startDayWorkout: (plan: WeeklyPlan, dayIndex: number) => WorkoutLog;
  completeCalisthenicsSet: (ei: number, si: number, reps: number | null, hold: number | null, weight: number | null) => void;
  undoCalisthenicsSet: (ei: number, si: number) => void;
  // Backward compatibility - maps to completeCalisthenicsSet and undoCalisthenicsSet
  completeSet: (ei: number, si: number, reps: number | null, hold: number | null, weight: number | null) => void;
  undoSet: (ei: number, si: number) => void;
  logYogaPose: (poseId: string, duration: number) => void;
  pauseCalisthenicsSession: () => void;
  pauseYogaSession: () => void;
  resumeCalisthenicsSession: () => void;
  resumeYogaSession: () => void;
  finishCalisthenicsSession: () => void;
  finishYogaSession: () => void;
  cancelCalisthenicsSession: () => void;
  cancelYogaSession: () => void;
  // Backward compatibility - maps to finishCalisthenicsSession and cancelCalisthenicsSession
  finishWorkout: () => void;
  cancelWorkout: () => void;
  refreshData: () => void;
  addPhoto: (dataUrl: string, note: string) => void;
  removePhoto: (id: string) => void;
  setProfile: (profile: UserProfile) => void;
  workoutSessionUI: WorkoutSessionUIState | null;
  setWorkoutSessionUI: (state: WorkoutSessionUIState | null) => void;
  resetAppState: () => void; // CRITICAL: Reset all in-memory state to blank slates
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
  const [activeCalisthenicsSession, setActiveCalisthenicsSession] = useState<WorkoutLog | null>(null);
  const [activeYogaSession, setActiveYogaSession] = useState<YogaSession | null>(null);
  const [workoutSessionUI, setWorkoutSessionUIState] = useState<WorkoutSessionUIState | null>(null);

  const setWorkoutSessionUI = useCallback((state: WorkoutSessionUIState | null) => {
    saveWorkoutSessionUI(state);
    setWorkoutSessionUIState(state);
  }, []);

  const calculateUserRanks = useCallback((logsData: WorkoutLog[], profileData: UserProfile | null) => {
    if (!profileData) return;
    const ranks = calculateRanks(profileData, logsData);
    const updatedProfile = { ...profileData, ranks };
    saveUserProfile(updatedProfile);
    setProfileState(updatedProfile);
  }, []);

  const refreshData = useCallback(() => {
    const newLogs = getWorkoutLogs();
    const newProfile = getUserProfile();
    setLogs(newLogs);
    setStats(recalculateStats());
    setPersonalRecords(getPersonalRecords());
    setRecentPRs(getRecentPRs());
    setSavedPlans(getSavedPlans());
    setPhotos(getProgressPhotos());
    setProfileState(newProfile);
    setWorkoutSessionUIState(getWorkoutSessionUI());
    setActiveCalisthenicsSession(getActiveCalisthenicsSession());
    setActiveYogaSession(getActiveYogaSession());
    // Calculate and update ranks
    if (newProfile) {
      calculateUserRanks(newLogs, newProfile);
    }
  }, [calculateUserRanks]);

  useEffect(() => {
    const logsData = getWorkoutLogs();
    const profileData = getUserProfile();
    setLogs(logsData);
    setStats(getUserStats());
    setPersonalRecords(getPersonalRecords());
    setRecentPRs(getRecentPRs());
    setSavedPlans(getSavedPlans());
    setPhotos(getProgressPhotos());
    setProfileState(profileData);
    setWorkoutSessionUIState(getWorkoutSessionUI());
    setActiveCalisthenicsSession(getActiveCalisthenicsSession());
    setActiveYogaSession(getActiveYogaSession());
    // Calculate and update ranks on initial load
    if (profileData) {
      calculateUserRanks(logsData, profileData);
    }
  }, [calculateUserRanks]);

  const setProfile = useCallback((p: UserProfile) => { saveUserProfile(p); setProfileState(p); }, []);
  
  const resetAppState = useCallback(() => {
    // CRITICAL: Reset all in-memory React state to blank slates
    // This MUST happen at the same time as storage wipe
    setLogs([]);
    setStats({ totalWorkouts: 0, totalExercises: 0, currentStreak: 0, longestStreak: 0, lastWorkoutDate: null });
    setPersonalRecords([]);
    setRecentPRs([]);
    setSavedPlans([]);
    setPhotos([]);
    setProfileState(null);
    setActiveCalisthenicsSession(null);
    setActiveYogaSession(null);
    setWorkoutSessionUIState(null);
  }, []);

  const addPlan = useCallback((plan: WeeklyPlan) => { savePlan(plan); setSavedPlans(getSavedPlans()); }, []);
  const removePlan = useCallback((id: string) => { deletePlanStorage(id); setSavedPlans(getSavedPlans()); }, []);

  // ── Calisthenics Workout Methods ──

  const startCalisthenicsWorkout = useCallback((plan: WeeklyPlan, dayIndex: number): WorkoutLog => {
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
    setActiveCalisthenicsSession(log);
    saveActiveCalisthenicsSession(log);
    setWorkoutSessionUIState(null);
    saveWorkoutSessionUI(null);
    return log;
  }, []);

  const completeCalisthenicsSet = useCallback((ei: number, si: number, reps: number | null, hold: number | null, weight: number | null) => {
    setActiveCalisthenicsSession((prev) => {
      if (!prev) return prev;
      const u = { ...prev, exercises: [...prev.exercises] };
      u.exercises[ei] = { ...u.exercises[ei], sets: [...u.exercises[ei].sets] };
      u.exercises[ei].sets[si] = { reps, holdSeconds: hold, weightKg: weight, completed: true };
      saveActiveCalisthenicsSession(u);
      return u;
    });
  }, []);

  const undoCalisthenicsSet = useCallback((ei: number, si: number) => {
    setActiveCalisthenicsSession((prev) => {
      if (!prev) return prev;
      const u = { ...prev, exercises: [...prev.exercises] };
      u.exercises[ei] = { ...u.exercises[ei], sets: [...u.exercises[ei].sets] };
      u.exercises[ei].sets[si] = { reps: null, holdSeconds: null, weightKg: null, completed: false };
      saveActiveCalisthenicsSession(u);
      return u;
    });
  }, []);

  const pauseCalisthenicsSession = useCallback(() => {
    // Mark session as paused in UI state if needed
    setWorkoutSessionUIState((prev) => {
      const newState = prev ? { ...prev, isPaused: true } : null;
      saveWorkoutSessionUI(newState);
      return newState;
    });
  }, []);

  const resumeCalisthenicsSession = useCallback(() => {
    // Mark session as resumed in UI state if needed
    setWorkoutSessionUIState((prev) => {
      const newState = prev ? { ...prev, isPaused: false } : null;
      saveWorkoutSessionUI(newState);
      return newState;
    });
  }, []);

  const finishCalisthenicsSession = useCallback(() => {
    if (!activeCalisthenicsSession) return;
    saveWorkoutLog({ ...activeCalisthenicsSession, endTime: new Date().toISOString(), completed: true });
    setActiveCalisthenicsSession(null);
    saveActiveCalisthenicsSession(null);
    saveWorkoutSessionUI(null);
    setWorkoutSessionUIState(null);
    refreshData();
  }, [activeCalisthenicsSession, refreshData]);

  const cancelCalisthenicsSession = useCallback(() => {
    setActiveCalisthenicsSession(null);
    saveActiveCalisthenicsSession(null);
    saveWorkoutSessionUI(null);
    setWorkoutSessionUIState(null);
  }, []);

  // ── Yoga Session Methods ──

  const startYogaSession = useCallback((plan: WeeklyPlan, dayIndex: number, flowId: string): YogaSession => {
    const session: YogaSession = {
      id: generateId(),
      planId: plan.id,
      dayIndex,
      currentPoseIndex: 0,
      flowId,
      startTime: Date.now(),
      completedPoses: [],
    };
    setActiveYogaSession(session);
    saveActiveYogaSession(session);
    return session;
  }, []);

  const logYogaPose = useCallback((poseId: string, duration: number) => {
    setActiveYogaSession((prev) => {
      if (!prev) return prev;
      const u = { ...prev, completedPoses: [...prev.completedPoses, { poseId, duration }], currentPoseIndex: prev.currentPoseIndex + 1 };
      saveActiveYogaSession(u);
      return u;
    });
  }, []);

  const pauseYogaSession = useCallback(() => {
    setActiveYogaSession((prev) => {
      if (!prev) return prev;
      const u = { ...prev, pausedTime: Date.now() };
      saveActiveYogaSession(u);
      return u;
    });
  }, []);

  const resumeYogaSession = useCallback(() => {
    setActiveYogaSession((prev) => {
      if (!prev) return prev;
      const u = { ...prev, pausedTime: undefined };
      saveActiveYogaSession(u);
      return u;
    });
  }, []);

  const finishYogaSession = useCallback(() => {
    if (!activeYogaSession) return;
    // For now, just clear the session. Actual logging can be added later
    setActiveYogaSession(null);
    saveActiveYogaSession(null);
    refreshData();
  }, [activeYogaSession, refreshData]);

  const cancelYogaSession = useCallback(() => {
    setActiveYogaSession(null);
    saveActiveYogaSession(null);
  }, []);

  const addPhoto = useCallback((dataUrl: string, note: string) => { saveProgressPhoto({ id: generateId(), date: new Date().toISOString(), dataUrl, note }); setPhotos(getProgressPhotos()); }, []);
  const removePhoto = useCallback((id: string) => { deletePhotoStorage(id); setPhotos(getProgressPhotos()); }, []);

  return (
    <WorkoutContext.Provider value={{
      logs, stats, personalRecords, recentPRs, savedPlans, photos, profile,
      activeCalisthenicsSession, activeYogaSession,
      // Backward compatibility
      activeWorkout: activeCalisthenicsSession,
      addPlan, removePlan,
      startCalisthenicsWorkout, startYogaSession,
      // Backward compatibility
      startDayWorkout: startCalisthenicsWorkout,
      completeCalisthenicsSet, undoCalisthenicsSet, logYogaPose,
      // Backward compatibility
      completeSet: completeCalisthenicsSet,
      undoSet: undoCalisthenicsSet,
      pauseCalisthenicsSession, pauseYogaSession,
      resumeCalisthenicsSession, resumeYogaSession,
      finishCalisthenicsSession, finishYogaSession,
      cancelCalisthenicsSession, cancelYogaSession,
      // Backward compatibility
      finishWorkout: finishCalisthenicsSession,
      cancelWorkout: cancelCalisthenicsSession,
      refreshData, addPhoto, removePhoto, setProfile, workoutSessionUI, setWorkoutSessionUI, resetAppState,
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
