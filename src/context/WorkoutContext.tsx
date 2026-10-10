"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { WorkoutExercise, WorkoutLog, UserStats, PersonalRecord, WeeklyPlan, ProgressPhoto, UserProfile, WorkoutSessionUIState, TrainingReminder } from "@/lib/types";
import {
  getWorkoutLogs, saveWorkoutLog, getActiveWorkout, saveActiveWorkout, getUserStats, recalculateStats, generateId,
  getPersonalRecords, getRecentPRs,
  getSavedPlans, savePlan, deletePlan as deletePlanStorage,
  getProgressPhotos, saveProgressPhoto, deleteProgressPhoto as deletePhotoStorage,
  getUserProfile, saveUserProfile,
  getWorkoutSessionUI, saveWorkoutSessionUI,
  getTrainingReminder, saveTrainingReminder,
} from "@/lib/storage";
import { getLivePersonalRecord } from "@/lib/workoutSession";
import {
  getAccentTheme,
  getWeeklyChallenge,
  saveAccentTheme as saveAccentThemeStorage,
} from "@/lib/storage";
import { ACCENT_THEMES, AccentThemeId } from "@/lib/gamificationConfig";
import { GamificationOverview, getGamificationOverview, isAccentThemeUnlocked } from "@/lib/gamification";
import { DEFAULT_TRAINING_REMINDER, getLocalDateKey, getNextReminderDelayMs, isReminderSnoozedForToday } from "@/lib/trainingReminders";

interface WorkoutContextType {
  isHydrated: boolean;
  dataLoadError: string | null;
  logs: WorkoutLog[];
  stats: UserStats;
  personalRecords: PersonalRecord[];
  recentPRs: PersonalRecord[];
  savedPlans: WeeklyPlan[];
  photos: ProgressPhoto[];
  profile: UserProfile | null;
  gamification: GamificationOverview;
  activeWorkout: WorkoutLog | null;
  addPlan: (plan: WeeklyPlan) => void;
  removePlan: (planId: string) => void;
  startDayWorkout: (plan: WeeklyPlan, dayIndex: number) => WorkoutLog;
  completeSet: (ei: number, si: number, reps: number | null, hold: number | null, weight: number | null, metadata?: { bandAssistance: string | null; tempoNote: string | null }) => PersonalRecord[];
  addSessionExercise: (exercise: WorkoutExercise) => void;
  finishWorkout: () => WorkoutLog | null;
  cancelWorkout: () => void;
  refreshData: () => void;
  addPhoto: (dataUrl: string, note: string) => void;
  removePhoto: (id: string) => void;
  setProfile: (profile: UserProfile) => void;
  trainingReminder: TrainingReminder;
  reminderError: string | null;
  setTrainingReminder: (reminder: TrainingReminder) => void;
  setAccentTheme: (themeId: AccentThemeId) => void;
  workoutSessionUI: WorkoutSessionUIState | null;
  setWorkoutSessionUI: (state: WorkoutSessionUIState | null) => void;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalWorkouts: 0, totalExercises: 0, currentStreak: 0, longestStreak: 0, lastWorkoutDate: null });
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [savedPlans, setSavedPlans] = useState<WeeklyPlan[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [gamification, setGamification] = useState<GamificationOverview>(() => getGamificationOverview([], [], "lime", null));
  const [activeWorkout, setActiveWorkout] = useState<WorkoutLog | null>(null);
  const activeWorkoutRef = useRef<WorkoutLog | null>(null);
  const [workoutSessionUI, setWorkoutSessionUIState] = useState<WorkoutSessionUIState | null>(null);
  const [trainingReminder, setTrainingReminderState] = useState<TrainingReminder>({ ...DEFAULT_TRAINING_REMINDER });
  const [reminderError, setReminderError] = useState<string | null>(null);

  const setWorkoutSessionUI = useCallback((state: WorkoutSessionUIState | null) => {
    saveWorkoutSessionUI(state);
    setWorkoutSessionUIState(state);
  }, []);

  const refreshData = useCallback(() => {
    const nextLogs = getWorkoutLogs();
    const nextPlans = getSavedPlans();
    const accentTheme = getAccentTheme();
    setLogs(nextLogs); setStats(recalculateStats()); setPersonalRecords(getPersonalRecords());
    setRecentPRs(getRecentPRs()); setSavedPlans(nextPlans); setPhotos(getProgressPhotos());
    setProfileState(getUserProfile());
    setTrainingReminderState(getTrainingReminder());
    setGamification(getGamificationOverview(nextLogs, nextPlans, accentTheme, getWeeklyChallenge(nextLogs)));
    document.documentElement.style.setProperty(
      "--accent-rgb",
      ACCENT_THEMES.find((theme) => theme.id === accentTheme)?.rgb ?? ACCENT_THEMES[0].rgb,
    );
    setWorkoutSessionUIState(getWorkoutSessionUI());
    const restoredWorkout = getActiveWorkout();
    activeWorkoutRef.current = restoredWorkout;
    setActiveWorkout(restoredWorkout);
  }, []);

  useEffect(() => {
    try {
      const initialLogs = getWorkoutLogs();
      const initialPlans = getSavedPlans();
      const accentTheme = getAccentTheme();
      setLogs(initialLogs); setStats(getUserStats()); setPersonalRecords(getPersonalRecords());
      setRecentPRs(getRecentPRs()); setSavedPlans(initialPlans); setPhotos(getProgressPhotos());
      setProfileState(getUserProfile());
      setTrainingReminderState(getTrainingReminder());
      setGamification(getGamificationOverview(initialLogs, initialPlans, accentTheme, getWeeklyChallenge(initialLogs)));
      document.documentElement.style.setProperty(
        "--accent-rgb",
        ACCENT_THEMES.find((theme) => theme.id === accentTheme)?.rgb ?? ACCENT_THEMES[0].rgb,
      );
      setWorkoutSessionUIState(getWorkoutSessionUI());
      const restoredWorkout = getActiveWorkout();
      activeWorkoutRef.current = restoredWorkout;
      setActiveWorkout(restoredWorkout);
    } catch (error) {
      setDataLoadError(error instanceof Error ? error.message : "Unable to load saved workout data.");
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || !trainingReminder.enabled || typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const today = getLocalDateKey(now);
    const alreadyHandledToday = isReminderSnoozedForToday(trainingReminder, now) || trainingReminder.lastSentDate === today;
    const timer = window.setTimeout(() => {
      const now = new Date();
      const today = getLocalDateKey(now);
      if (isReminderSnoozedForToday(trainingReminder, now) || trainingReminder.lastSentDate === today) return;
      try {
        new Notification("Time to train", { body: "Your calisthenics session is ready whenever you are." });
        const nextReminder = { ...trainingReminder, lastSentDate: today };
        saveTrainingReminder(nextReminder);
        setTrainingReminderState(nextReminder);
      } catch (error) {
        setReminderError(error instanceof Error ? error.message : "Unable to show the training reminder.");
      }
    }, getNextReminderDelayMs(trainingReminder.time, now, alreadyHandledToday));
    return () => window.clearTimeout(timer);
  }, [isHydrated, trainingReminder]);

  const setProfile = useCallback((p: UserProfile) => { saveUserProfile(p); setProfileState(p); }, []);
  const setTrainingReminder = useCallback((reminder: TrainingReminder) => {
    saveTrainingReminder(reminder);
    setTrainingReminderState(reminder);
    setReminderError(null);
  }, []);
  const setAccentTheme = useCallback((themeId: AccentThemeId) => {
    if (!isAccentThemeUnlocked(themeId, gamification.totalXp)) {
      throw new Error("This accent theme has not been unlocked yet.");
    }
    saveAccentThemeStorage(themeId);
    const theme = ACCENT_THEMES.find((item) => item.id === themeId);
    if (!theme) throw new Error("Choose an available accent theme.");
    document.documentElement.style.setProperty("--accent-rgb", theme.rgb);
    setGamification((previous) => ({ ...previous, accentTheme: themeId }));
  }, [gamification.totalXp]);
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
    activeWorkoutRef.current = log;
    setActiveWorkout(log);
    saveActiveWorkout(log);
    setWorkoutSessionUIState(null);
    saveWorkoutSessionUI(null);
    return log;
  }, []);

  const completeSet = useCallback((
    ei: number,
    si: number,
    reps: number | null,
    hold: number | null,
    weight: number | null,
    metadata?: { bandAssistance: string | null; tempoNote: string | null },
  ): PersonalRecord[] => {
    const previous = activeWorkoutRef.current;
    const exercise = previous?.exercises[ei];
    const priorSet = exercise?.sets[si];
    if (!previous || !exercise || !priorSet || priorSet.completed) return [];

    const completedSet = { reps, holdSeconds: hold, weightKg: weight, ...metadata, completed: true };
    const records = personalRecords.filter((record) => record.exerciseId === exercise.exerciseId);
    const previousWeightedSets = exercise.sets.filter((set, index) => index !== si && set.completed && set.weightKg !== null && set.weightKg > 0 && set.reps !== null);
    const weightedReps = Math.max(0, ...records.filter((record) => record.type === "weighted-reps").map((record) => record.value),
      ...previousWeightedSets.map((set) => set.reps!));
    const existingValues = {
      reps: Math.max(0, ...records.filter((record) => record.type === "reps").map((record) => record.value),
        ...exercise.sets.filter((set, index) => index !== si && set.completed && set.reps !== null).map((set) => set.reps!)),
      hold: Math.max(0, ...records.filter((record) => record.type === "hold").map((record) => record.value),
        ...exercise.sets.filter((set, index) => index !== si && set.completed && set.holdSeconds !== null).map((set) => set.holdSeconds!)),
      weight: Math.max(0, ...records.filter((record) => record.type === "weight").map((record) => record.value),
        ...exercise.sets.filter((set, index) => index !== si && set.completed && set.weightKg !== null).map((set) => set.weightKg!)),
      weightedReps,
      weightedRepWeight: Math.max(0,
        ...records.filter((record) => record.type === "weighted-reps" && record.value === weightedReps).map((record) => record.weightKg ?? 0),
        ...previousWeightedSets.filter((set) => set.reps === weightedReps).map((set) => set.weightKg ?? 0)),
    };
    const liveRecords = getLivePersonalRecord(exercise.exerciseId, completedSet, existingValues);
    const next = { ...previous, exercises: [...previous.exercises] };
    next.exercises[ei] = { ...exercise, sets: [...exercise.sets] };
    next.exercises[ei].sets[si] = completedSet;
    activeWorkoutRef.current = next;
    setActiveWorkout(next);
    saveActiveWorkout(next);
    return liveRecords;
  }, [personalRecords]);

  const addSessionExercise = useCallback((exercise: WorkoutExercise) => {
    const previous = activeWorkoutRef.current;
    if (!previous) return;
    const next = {
      ...previous,
      exercises: [...previous.exercises, {
        exerciseId: exercise.exerciseId,
        sets: Array.from({ length: exercise.sets }, () => ({ reps: null, holdSeconds: null, weightKg: null, completed: false })),
      }],
    };
    activeWorkoutRef.current = next;
    setActiveWorkout(next);
    saveActiveWorkout(next);
  }, []);

  const finishWorkout = useCallback((): WorkoutLog | null => {
    const workout = activeWorkoutRef.current;
    if (!workout) return null;
    const completedWorkout = { ...workout, endTime: new Date().toISOString(), completed: true };
    const savedWorkout = saveWorkoutLog(completedWorkout, true);
    activeWorkoutRef.current = null;
    setActiveWorkout(null);
    saveActiveWorkout(null);
    saveWorkoutSessionUI(null);
    setWorkoutSessionUIState(null);
    refreshData();
    return savedWorkout;
  }, [refreshData]);

  const cancelWorkout = useCallback(() => {
    activeWorkoutRef.current = null;
    setActiveWorkout(null);
    saveActiveWorkout(null);
    saveWorkoutSessionUI(null);
    setWorkoutSessionUIState(null);
  }, []);
  const addPhoto = useCallback((dataUrl: string, note: string) => { saveProgressPhoto({ id: generateId(), date: new Date().toISOString(), dataUrl, note }); setPhotos(getProgressPhotos()); }, []);
  const removePhoto = useCallback((id: string) => { deletePhotoStorage(id); setPhotos(getProgressPhotos()); }, []);

  return (
    <WorkoutContext.Provider value={{
      isHydrated, dataLoadError,
      logs, stats, personalRecords, recentPRs, savedPlans, photos, profile, activeWorkout, gamification,
      addPlan, removePlan, startDayWorkout, completeSet, addSessionExercise, finishWorkout, cancelWorkout,
      refreshData, addPhoto, removePhoto, setProfile, setAccentTheme, workoutSessionUI, setWorkoutSessionUI,
      trainingReminder, reminderError, setTrainingReminder,
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
