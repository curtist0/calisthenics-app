"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { exercises, getExerciseById } from "@/data/exercises";
import { getYogaPoseById } from "@/data/yoga";
import { useWorkout } from "@/context/WorkoutContext";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseModal from "@/components/ExerciseModal";
import ExerciseAnimation from "@/components/ExerciseAnimation";
import WorkoutIcon from "@/components/WorkoutIcon";
import Timer from "@/components/Timer";
import RestTimer from "@/components/RestTimer";
import { Exercise, PersonalRecord, WorkoutExercise, WorkoutLog } from "@/lib/types";
import Link from "next/link";
import { getRestDuration, saveRestDuration } from "@/lib/storage";
import { findNextIncompleteSet, isRestDuration, RestDuration } from "@/lib/workoutSession";
import { triggerHaptic } from "@/lib/haptics";
import ShareableWorkoutCard from "@/components/ShareableWorkoutCard";
import { formatPersonalRecord, summarizeWorkout } from "@/lib/workoutSummary";

function PlanContent() {
  const params = useSearchParams();
  const router = useRouter();
  const planId = params.get("id");
  const { savedPlans, activeWorkout, logs, gamification, isHydrated, startDayWorkout, completeSet, addSessionExercise, finishWorkout, cancelWorkout, workoutSessionUI, setWorkoutSessionUI } = useWorkout();

  const plan = savedPlans.find((p) => p.id === planId);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [curEx, setCurEx] = useState(0);
  const [curSet, setCurSet] = useState(0);
  const [showRest, setShowRest] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [repValue, setRepValue] = useState(0);
  const [holdValue, setHoldValue] = useState(0);
  const [bandAssistance, setBandAssistance] = useState("");
  const [tempoNote, setTempoNote] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [showMedia, setShowMedia] = useState(true);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [addExerciseSearch, setAddExerciseSearch] = useState("");
  const [confirmExit, setConfirmExit] = useState(false);
  const [restStartedAt, setRestStartedAt] = useState<string | null>(null);
  const [restDurationSeconds, setRestDurationSeconds] = useState<RestDuration>(() => getRestDuration());
  const [sessionAddedExercises, setSessionAddedExercises] = useState<WorkoutExercise[]>([]);
  const [celebration, setCelebration] = useState<PersonalRecord | null>(null);
  const [finishedWorkout, setFinishedWorkout] = useState<WorkoutLog | null>(null);
  const [finishedPersonalRecords, setFinishedPersonalRecords] = useState<PersonalRecord[]>([]);
  const [showWarmUpPrompt, setShowWarmUpPrompt] = useState(false);
  const [pendingDayIndex, setPendingDayIndex] = useState<number | null>(null);
  const sessionRestoreKey = useRef<string | null>(null);
  const autoStartKey = useRef<string | null>(null);
  const initializedWorkoutId = useRef<string | null>(null);
  const sessionPersonalRecords = useRef<PersonalRecord[]>([]);

  useEffect(() => {
    if (!plan || !activeWorkout || activeWorkout.planId !== plan.id) return;
    if (!isHydrated) return;
    if (initializedWorkoutId.current === activeWorkout.id) return;
    const s = workoutSessionUI;
    if (!s || s.planId !== plan.id || s.dayIndex !== activeWorkout.dayIndex) {
      const cursor = findNextIncompleteSet(activeWorkout);
      setActiveDayIndex(activeWorkout.dayIndex);
      setCurEx(cursor?.exerciseIndex ?? Math.max(0, activeWorkout.exercises.length - 1));
      setCurSet(cursor?.setIndex ?? 0);
      setIsPaused(true);
      setIsActive(false);
      setWorkoutSessionUI({
        planId: plan.id,
        dayIndex: activeWorkout.dayIndex,
        curEx: cursor?.exerciseIndex ?? Math.max(0, activeWorkout.exercises.length - 1),
        curSet: cursor?.setIndex ?? 0,
        showRest: false,
        isPaused: true,
        addedExercises: [],
      });
      initializedWorkoutId.current = activeWorkout.id;
      sessionRestoreKey.current = `${plan.id}-${activeWorkout.dayIndex}-restored`;
      return;
    }
    const key = `${plan.id}-${activeWorkout.dayIndex}-${s.isPaused}`;
    if (sessionRestoreKey.current === key) return;
    const savedSetIsComplete = activeWorkout.exercises[s.curEx]?.sets[s.curSet]?.completed;
    const restoredCursor = savedSetIsComplete ? findNextIncompleteSet(activeWorkout) : null;
    setActiveDayIndex(s.dayIndex);
    setCurEx(restoredCursor?.exerciseIndex ?? s.curEx);
    setCurSet(restoredCursor?.setIndex ?? s.curSet);
    setShowRest(restoredCursor ? false : s.showRest);
    setIsPaused(s.isPaused);
    setRestStartedAt(s.restStartedAt ?? null);
    setRestDurationSeconds(s.restDurationSeconds !== undefined && isRestDuration(s.restDurationSeconds) ? s.restDurationSeconds : getRestDuration());
    setSessionAddedExercises(s.addedExercises ?? []);
    initializedWorkoutId.current = activeWorkout.id;
    // Paused sessions show the plan overview + resume entry; resumed sessions open the active workout UI.
    setIsActive(!s.isPaused);
    sessionRestoreKey.current = key;
  }, [isHydrated, plan, activeWorkout, workoutSessionUI, setWorkoutSessionUI]);

  useEffect(() => {
    sessionRestoreKey.current = null;
  }, [plan?.id]);

  useEffect(() => {
    if (!plan) return;
    const dayParam = params.get("day");
    if (dayParam === null) return;
    const dayIndex = Number(dayParam);
    if (Number.isInteger(dayIndex) && dayIndex >= 0 && dayIndex < plan.days.length) {
      setSelectedDay(dayIndex);
    }
  }, [params, plan]);

  useEffect(() => {
    if (!isHydrated || !isActive || !plan || !activeWorkout || activeWorkout.planId !== plan.id) return;
    setWorkoutSessionUI({
      planId: plan.id,
      dayIndex: activeDayIndex,
      curEx,
      curSet,
      showRest,
      isPaused,
      restStartedAt,
      restDurationSeconds,
      addedExercises: sessionAddedExercises,
    });
  }, [isHydrated, isActive, plan, activeWorkout, activeDayIndex, curEx, curSet, showRest, isPaused, restStartedAt, restDurationSeconds, sessionAddedExercises, setWorkoutSessionUI]);

  const beginWorkout = useCallback((dayIndex: number) => {
    if (!plan) return;
    const started = startDayWorkout(plan, dayIndex);
    setFinishedWorkout(null);
    setFinishedPersonalRecords([]);
    sessionPersonalRecords.current = [];
    initializedWorkoutId.current = started.id;
    setActiveDayIndex(dayIndex); setIsActive(true); setIsPaused(false);
    setCurEx(0); setCurSet(0); setWeightInput("");
    setSessionAddedExercises([]);
    setRestStartedAt(null);
    setShowWarmUpPrompt(false); setPendingDayIndex(null);
  }, [plan, startDayWorkout]);

  const handleStart = useCallback((dayIndex: number) => {
    if (!plan) return;
    const day = plan.days[dayIndex];
    if (!day || day.isRest) return;
    if (day.warmUp) { setPendingDayIndex(dayIndex); setShowWarmUpPrompt(true); }
    else beginWorkout(dayIndex);
  }, [beginWorkout, plan]);

  useEffect(() => {
    if (!isHydrated || !plan || activeWorkout || params.get("start") !== "1" || isActive) return;
    const dayParam = params.get("day");
    const dayIndex = dayParam === null ? -1 : Number(dayParam);
    const key = `${plan.id}:${dayIndex}`;
    if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= plan.days.length || plan.days[dayIndex].isRest || autoStartKey.current === key) return;

    autoStartKey.current = key;
    handleStart(dayIndex);
    router.replace(`/workouts/plan?id=${encodeURIComponent(plan.id)}&day=${dayIndex}`);
  }, [activeWorkout, handleStart, isActive, isHydrated, params, plan, router]);

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const todayDay = plan?.days[todayIndex];
  const baseActiveDay = isActive ? plan?.days[activeDayIndex] : null;
  const activeDay = baseActiveDay ? { ...baseActiveDay, exercises: [...baseActiveDay.exercises, ...sessionAddedExercises] } : null;
  const curWE = activeDay?.exercises[curEx];
  const curExData = curWE ? getExerciseById(curWE.exerciseId) : null;
  const curYogaPose = curWE ? getYogaPoseById(curWE.exerciseId) : null;
  const curName = curExData?.name || curYogaPose?.name || curWE?.progressionLevel || "Exercise";
  const lastLoggedSet = curWE ? logs
    .filter((log) => log.completed)
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap((log) => [...log.exercises].reverse())
    .find((exercise) => exercise.exerciseId === curWE.exerciseId)
    ?.sets.slice().reverse().find((set) => set.completed) : undefined;

  useEffect(() => {
    if (!isActive || !curWE) return;
    const mostRecent = logs
      .filter((log) => log.completed)
      .sort((a, b) => b.date.localeCompare(a.date))
      .flatMap((log) => [...log.exercises].reverse())
      .find((exercise) => exercise.exerciseId === curWE.exerciseId);
    const lastSet = mostRecent?.sets.slice().reverse().find((set) => set.completed);
    setRepValue(lastSet?.reps ?? curWE.reps ?? 0);
    setHoldValue(lastSet?.holdSeconds ?? curWE.holdSeconds ?? 0);
    setWeightInput(lastSet?.weightKg ? String(lastSet.weightKg) : "");
    setBandAssistance(lastSet?.bandAssistance ?? "");
    setTempoNote(lastSet?.tempoNote ?? "");
    setShowMore(false);
  }, [isActive, curEx, curSet, curWE, logs]);

  useEffect(() => {
    if (!celebration) return;
    const timeout = window.setTimeout(() => setCelebration(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [celebration]);

  if (!isHydrated) {
    return <div role="status" className="mx-auto max-w-lg px-4 pt-10 text-sm text-gray-400">Loading workout…</div>;
  }

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center">
        <p className="text-gray-400">Plan not found</p>
        <Link href="/workouts" className="mt-4 inline-block px-6 py-2 bg-brand-500 text-white rounded-full">Back</Link>
      </div>
    );
  }

  if (finishedWorkout) {
    const summaryStats = summarizeWorkout(finishedWorkout);
    const workoutName = plan.days[finishedWorkout.dayIndex]?.name ?? "Training session";
    const personalRecordLines = finishedPersonalRecords.slice(0, 3);
    const additionalRecords = Math.max(0, finishedPersonalRecords.length - personalRecordLines.length);

    return (
      <main className="fixed inset-0 z-[60] overflow-y-auto bg-gray-950 text-white">
        <div className="mx-auto w-full max-w-lg px-4 pb-10 pt-[max(env(safe-area-inset-top),1rem)]">
          <div className="mb-6 text-center">
            <WorkoutIcon name="check" className="mx-auto mb-3 h-12 w-12 rounded-full bg-brand-400/15 p-2 text-brand-300" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300">Session complete</p>
            <h1 className="mt-2 text-3xl font-extrabold text-white">{workoutName}</h1>
            <p className="mt-2 text-sm text-gray-400">A session toward {plan.goal}</p>
          </div>

          <section aria-label="Workout summary" className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-3 text-center">
              <p className="text-2xl font-extrabold tabular-nums text-white">
                {summaryStats.durationSeconds < 60 ? `${summaryStats.durationSeconds}s` : summaryStats.durationMinutes}
              </p>
              <p className="mt-1 text-xs text-gray-400">{summaryStats.durationSeconds < 60 ? "duration" : "minutes"}</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-3 text-center">
              <p className="text-2xl font-extrabold tabular-nums text-white">{summaryStats.completedSets}</p>
              <p className="mt-1 text-xs text-gray-400">sets</p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-3 text-center">
              <p className="text-2xl font-extrabold tabular-nums text-white">{summaryStats.totalReps}</p>
              <p className="mt-1 text-xs text-gray-400">rep volume</p>
            </div>
          </section>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-300">
            {summaryStats.totalHoldSeconds > 0 && (
              <span className="rounded-full bg-gray-900 px-3 py-2">Hold time · {summaryStats.totalHoldSeconds}s</span>
            )}
            {summaryStats.weightedVolume > 0 && (
              <span className="rounded-full bg-gray-900 px-3 py-2">Weighted volume · {summaryStats.weightedVolume.toLocaleString()} kg-reps</span>
            )}
          </div>

          <section aria-labelledby="summary-prs" className="mt-6 rounded-2xl border border-brand-400/30 bg-brand-400/5 p-4">
            <h2 id="summary-prs" className="font-extrabold text-white">Personal records</h2>
            {personalRecordLines.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-gray-200">
                {personalRecordLines.map((record) => (
                  <li key={`${record.exerciseId}-${record.type}`} className="flex items-start gap-2">
                    <WorkoutIcon name="spark" className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-300" />
                    {formatPersonalRecord(record, getExerciseById(record.exerciseId)?.name ?? record.exerciseId)}
                  </li>
                ))}
                {additionalRecords > 0 && <li className="text-gray-400">And {additionalRecords} more</li>}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-400">No new personal records this session. Keep building.</p>
            )}
          </section>

          <section aria-label="Progress notes" className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <p className="font-bold text-white">Skill progression</p>
              {finishedWorkout.masteredSkills && finishedWorkout.masteredSkills.length > 0 ? (
                <ul className="mt-1 space-y-1 text-sm text-brand-200">
                  {finishedWorkout.masteredSkills.map((skill) => (
                    <li key={skill.exerciseId}>{getExerciseById(skill.exerciseId)?.name ?? skill.exerciseId}: {skill.fromLevel} → {skill.toLevel}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-gray-400">No exercise progression levels advanced this session.</p>
              )}
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <p className="font-bold text-white">XP earned</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-300">+{finishedWorkout.xpEarned ?? 0} XP</p>
              <p className="mt-1 text-sm text-gray-400">{gamification.totalXp} total · {gamification.rank}</p>
              <div className="mt-2 flex justify-between gap-2 text-xs text-gray-500">
                <span>{gamification.nextRank ? `${gamification.xpToNextRank} XP to ${gamification.nextRank}` : "Top rank reached"}</span>
                <span>{gamification.rankProgressPercent}%</span>
              </div>
              <div
                role="progressbar"
                aria-label={`Progress from ${gamification.rank}${gamification.nextRank ? ` toward ${gamification.nextRank}` : ""}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={gamification.rankProgressPercent}
                className="mt-1 h-2 overflow-hidden rounded-full bg-gray-800"
              >
                <div className="h-full rounded-full bg-brand-400 transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${gamification.rankProgressPercent}%` }} />
              </div>
            </div>
          </section>

          <ShareableWorkoutCard
            workoutName={workoutName}
            stats={summaryStats}
            personalRecords={finishedPersonalRecords}
            exerciseName={(exerciseId) => getExerciseById(exerciseId)?.name ?? exerciseId}
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => router.push("/progress")} className="min-h-14 rounded-xl border border-gray-700 px-3 font-bold text-white hover:bg-gray-900">
              View progress
            </button>
            <button type="button" onClick={() => router.push("/workouts")} className="min-h-14 rounded-xl bg-brand-400 px-3 font-bold text-gray-950">
              Done
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleCompleteReps = () => {
    if (!curWE) return;
    const parsedWeight = weightInput.trim() ? Number(weightInput) : null;
    if (parsedWeight !== null && (!Number.isFinite(parsedWeight) || parsedWeight < 0)) return;
    const w = curExData?.supportsWeight ? parsedWeight : null;
    const records = completeSet(curEx, curSet, repValue, null, w, {
      bandAssistance: bandAssistance.trim() || null,
      tempoNote: tempoNote.trim() || null,
    });
    onSetCompleted(records);
  };

  const handleCompleteHold = (seconds: number) => {
    const records = completeSet(curEx, curSet, null, seconds, null, {
      bandAssistance: bandAssistance.trim() || null,
      tempoNote: tempoNote.trim() || null,
    });
    onSetCompleted(records);
  };

  const onSetCompleted = (records: PersonalRecord[]) => {
    triggerHaptic(35);
    const bestRecord = records.find((record) => record.type === "weighted-reps") ?? records[0];
    if (bestRecord) setCelebration(bestRecord);
    for (const record of records) {
      const existingIndex = sessionPersonalRecords.current.findIndex(
        (existing) => existing.exerciseId === record.exerciseId && existing.type === record.type,
      );
      if (existingIndex < 0) sessionPersonalRecords.current.push(record);
      else if (
        record.value > sessionPersonalRecords.current[existingIndex].value
        || (record.type === "weighted-reps"
          && record.value === sessionPersonalRecords.current[existingIndex].value
          && (record.weightKg ?? 0) > (sessionPersonalRecords.current[existingIndex].weightKg ?? 0))
      ) {
        sessionPersonalRecords.current[existingIndex] = record;
      }
    }
    advance();
  };

  const finishSession = () => {
    const completed = finishWorkout();
    if (completed) {
      setFinishedWorkout(completed);
      setFinishedPersonalRecords([...sessionPersonalRecords.current]);
    }
    setIsActive(false);
    sessionRestoreKey.current = null;
  };

  const advance = () => {
    if (!activeDay || !curWE) return;
    if (curSet < curWE.sets - 1) {
      setCurEx((index) => index);
      setCurSet((s) => s + 1);
      startRest();
    } else if (curEx < activeDay.exercises.length - 1) {
      setCurEx((e) => e + 1); setCurSet(0);
      startRest();
    } else {
      finishSession();
    }
  };

  const startRest = () => {
    setRestStartedAt(new Date().toISOString());
    setShowRest(true);
  };

  const skipExercise = () => {
    if (!activeDay) return;
    if (curEx < activeDay.exercises.length - 1) {
      setCurEx((index) => index + 1);
      setCurSet(0);
      setShowRest(false);
      setRestStartedAt(null);
    } else {
      finishSession();
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const addition: WorkoutExercise = {
      exerciseId: exercise.id,
      sets: 2,
      reps: exercise.isHold ? null : 8,
      holdSeconds: exercise.isHold ? 20 : null,
      restSeconds: restDurationSeconds,
    };
    addSessionExercise(addition);
    setWorkoutSessionUI({
      planId: plan.id,
      dayIndex: activeDayIndex,
      curEx,
      curSet,
      showRest,
      isPaused: false,
      restStartedAt,
      restDurationSeconds,
      addedExercises: [...sessionAddedExercises, addition],
    });
    setSessionAddedExercises((previous) => [...previous, addition]);
    setShowAddExercise(false);
  };

  const handleCancel = () => { cancelWorkout(); setIsActive(false); setConfirmExit(false); initializedWorkoutId.current = null; sessionRestoreKey.current = null; };

  const handlePauseExplore = () => {
    if (!plan) return;
    setIsPaused(true);
    setWorkoutSessionUI({
      planId: plan.id,
      dayIndex: activeDayIndex,
      curEx,
      curSet,
      showRest,
      isPaused: true,
      restStartedAt,
      restDurationSeconds,
      addedExercises: sessionAddedExercises,
    });
    router.push("/");
  };

  // Helper to render an exercise row (handles both real exercises and conditioning)
  const renderExerciseRow = (we: typeof plan.days[0]["exercises"][0], idx: number, showManualEntry?: boolean) => {
    const ex = getExerciseById(we.exerciseId);
    const yoga = getYogaPoseById(we.exerciseId);
    const isCond = we.exerciseId.startsWith("cond-");
    const name = ex?.name || yoga?.name || we.progressionLevel?.replace(/^[^\p{L}\p{N}]+\s*/u, "") || "Exercise";

    return (
      <div key={`${we.exerciseId}-${idx}`} className="glass rounded-xl p-3 mb-2">
        <div className="flex items-center gap-3">
          {ex ? (
            <button onClick={(e) => { e.stopPropagation(); setSelectedExercise(ex); }} className="flex-shrink-0">
              <ExerciseCard exercise={ex} compact />
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <WorkoutIcon name={yoga ? "yoga" : "dumbbell"} className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-white font-bold text-sm">{name}</p>
                {isCond && <span className="text-xs text-yellow-400">conditioning</span>}
                {yoga && <span className="text-xs text-purple-400">{yoga.sanskrit}</span>}
              </div>
            </div>
          )}
          <div className="text-right text-xs text-gray-400 flex-shrink-0 ml-auto">
            <p className="text-white font-semibold">{we.sets} × {we.holdSeconds ? `${we.holdSeconds}s` : we.reps}</p>
            {we.progressionLevel && <p className="text-brand-400 text-[10px]">{we.progressionLevel}</p>}
          </div>
        </div>
      </div>
    );
  };

  // Warm-up prompt
  if (showWarmUpPrompt && pendingDayIndex !== null) {
    const warmUp = plan.days[pendingDayIndex].warmUp;
    return (
      <div className="max-w-lg mx-auto px-4 pt-8">
        <div className="text-center mb-6">
          <WorkoutIcon name="spark" className="mx-auto mb-4 h-12 w-12 text-brand-300" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Warm Up First?</h2>
        </div>
        {warmUp && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h3 className="text-white font-bold mb-1">{warmUp.name}</h3>
            <p className="text-gray-400 text-xs mb-3">{warmUp.duration}</p>
            <ul className="space-y-2">
              {warmUp.exercises.map((w, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-gray-300">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="space-y-3">
          <button onClick={() => beginWorkout(pendingDayIndex)} className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg"><WorkoutIcon name="check" className="mr-2 inline h-5 w-5" />Start Workout</button>
          <button onClick={() => beginWorkout(pendingDayIndex)} className="w-full py-3 bg-gray-800 text-gray-400 rounded-2xl font-medium">Skip Warm-Up →</button>
        </div>
      </div>
    );
  }

  // Active workout (running)
  if (isActive && activeWorkout && curWE && activeDay) {
    const totalSets = activeDay.exercises.reduce((s, e) => s + e.sets, 0);
    const doneSets = activeWorkout.exercises.reduce((s, e) => s + e.sets.filter((x) => x.completed).length, 0);
    const progressPercent = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;
    const isHold = Boolean(curExData?.isHold || curWE.holdSeconds !== null);
    const restNextExercise = showRest && activeDay.exercises[curEx];
    const restNextData = restNextExercise ? getExerciseById(restNextExercise.exerciseId) : null;
    const restNextYoga = restNextExercise ? getYogaPoseById(restNextExercise.exerciseId) : null;
    const availableToAdd = exercises
      .filter((exercise) => exercise.name.toLowerCase().includes(addExerciseSearch.toLowerCase()))
      .slice(0, 12);

    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto bg-gray-950 text-white">
        <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 pb-8 pt-[max(env(safe-area-inset-top),1rem)]">
          <header className="sticky top-0 z-10 -mx-4 mb-5 border-b border-gray-800 bg-gray-950/95 px-4 pb-4 pt-2 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-300">{doneSets} of {totalSets} sets</span>
              <button type="button" onClick={() => setConfirmExit(true)} className="flex min-h-11 items-center gap-2 rounded-xl bg-gray-800 px-3 text-sm font-semibold text-gray-200 hover:bg-gray-700">
                <WorkoutIcon name="close" className="h-4 w-4" /> Exit
              </button>
            </div>
            <div role="progressbar" aria-label="Workout session progress" aria-valuemin={0} aria-valuemax={totalSets} aria-valuenow={doneSets} className="h-2 overflow-hidden rounded-full bg-gray-800">
              <div className="h-full rounded-full bg-brand-400 transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${progressPercent}%` }} />
            </div>
          </header>

          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Exercise {curEx + 1} of {activeDay.exercises.length}</p>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight text-white">{curName}</h1>
              <p className="mt-1 text-sm text-gray-400">Set {curSet + 1} of {curWE.sets}</p>
            </div>
            {curWE.progressionLevel && <span className="max-w-32 rounded-full bg-brand-500/10 px-3 py-1 text-right text-xs text-brand-300">{curWE.progressionLevel}</span>}
          </div>

          <div className="mb-5">
            <button type="button" aria-expanded={showMedia} onClick={() => setShowMedia((visible) => !visible)} className="mb-2 flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold text-gray-300 hover:bg-gray-900">
              <span>{showMedia ? "Hide exercise media" : "Show exercise media"}</span>
              <span aria-hidden="true">{showMedia ? "−" : "+"}</span>
            </button>
            {showMedia && (
              <div className="flex min-h-60 items-center justify-center overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
                {curExData ? <ExerciseAnimation exerciseId={curExData.id} size={260} /> : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <WorkoutIcon name={curYogaPose ? "yoga" : "dumbbell"} className="h-14 w-14" />
                    <span className="text-sm font-semibold text-gray-200">{curName}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {curExData?.instructions[0] && <p className="mb-5 rounded-xl border border-gray-800 bg-gray-900/60 p-3 text-sm leading-relaxed text-gray-300">{curExData.instructions[0]}</p>}

          {isHold ? (
            <div className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-300">Hold target</span>
                <div className="flex items-center gap-3">
                  <button type="button" aria-label="Decrease hold target" onClick={() => setHoldValue((value) => Math.max(1, value - 5))} className="min-h-11 min-w-11 rounded-xl bg-gray-800 text-xl font-bold">−</button>
                  <span className="min-w-16 text-center text-2xl font-extrabold tabular-nums">{holdValue}s</span>
                  <button type="button" aria-label="Increase hold target" onClick={() => setHoldValue((value) => value + 5)} className="min-h-11 min-w-11 rounded-xl bg-gray-800 text-xl font-bold">+</button>
                </div>
              </div>
              {lastLoggedSet && (
                <button type="button" onClick={() => setHoldValue(lastLoggedSet.holdSeconds ?? curWE.holdSeconds ?? 1)} className="mb-4 min-h-11 w-full rounded-xl border border-gray-700 text-sm font-semibold text-brand-200 hover:border-brand-300">
                  Same as last time · {lastLoggedSet.holdSeconds ?? 0}s
                </button>
              )}
              <Timer targetSeconds={holdValue} onComplete={handleCompleteHold} label="Count up to your target; complete early to log actual time." setNumber={curSet + curEx * 100} />
            </div>
          ) : (
            <div className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
              <p className="mb-3 text-center text-sm font-semibold text-gray-300">Target reps</p>
              <div className="flex items-center justify-center gap-6">
                <button type="button" aria-label="Decrease reps" onClick={() => setRepValue((value) => Math.max(1, value - 1))} className="min-h-14 min-w-14 rounded-2xl bg-gray-800 text-2xl font-bold transition-transform duration-150 active:scale-95 motion-reduce:transition-none">−</button>
                <output aria-live="polite" className="min-w-20 text-center text-5xl font-extrabold tabular-nums">{repValue}</output>
                <button type="button" aria-label="Increase reps" onClick={() => setRepValue((value) => value + 1)} className="min-h-14 min-w-14 rounded-2xl bg-gray-800 text-2xl font-bold transition-transform duration-150 active:scale-95 motion-reduce:transition-none">+</button>
              </div>
              {lastLoggedSet && (
                <button type="button" onClick={() => {
                  setRepValue(lastLoggedSet.reps ?? curWE.reps ?? 1);
                  setHoldValue(lastLoggedSet.holdSeconds ?? curWE.holdSeconds ?? 0);
                  setWeightInput(lastLoggedSet.weightKg ? String(lastLoggedSet.weightKg) : "");
                  setBandAssistance(lastLoggedSet.bandAssistance ?? "");
                  setTempoNote(lastLoggedSet.tempoNote ?? "");
                }} className="mt-4 min-h-11 w-full rounded-xl border border-gray-700 text-sm font-semibold text-brand-200 hover:border-brand-300">
                  Same as last time · {lastLoggedSet.reps ?? 0} reps
                </button>
              )}
              <button type="button" onClick={() => setShowMore((visible) => !visible)} aria-expanded={showMore} className="mt-3 min-h-11 w-full text-sm font-semibold text-gray-400 hover:text-white">
                {showMore ? "Hide optional details" : "More · weight, assistance, tempo"}
              </button>
              {showMore && (
                <div className="mt-3 space-y-3 border-t border-gray-800 pt-4">
                  {curExData?.supportsWeight && (
                    <label className="block text-sm font-semibold text-gray-300">
                      Added weight (kg)
                      <input type="number" min="0" step="0.5" inputMode="decimal" value={weightInput} onChange={(event) => setWeightInput(event.target.value)} placeholder="0" className="mt-2 min-h-12 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                    </label>
                  )}
                  <label className="block text-sm font-semibold text-gray-300">
                    Band assistance
                    <input value={bandAssistance} onChange={(event) => setBandAssistance(event.target.value)} placeholder="e.g. light band" className="mt-2 min-h-12 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                  </label>
                  <label className="block text-sm font-semibold text-gray-300">
                    Tempo note
                    <input value={tempoNote} onChange={(event) => setTempoNote(event.target.value)} placeholder="e.g. 3-second lowering" className="mt-2 min-h-12 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
                  </label>
                </div>
              )}
            </div>
          )}

          {!isHold && (
            <button type="button" onClick={handleCompleteReps} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-400 px-5 text-lg font-extrabold text-gray-950 transition-transform duration-150 hover:bg-brand-300 active:scale-[0.99] motion-reduce:transition-none">
              Complete set <WorkoutIcon name="check" className="h-5 w-5" />
            </button>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setShowAddExercise((shown) => !shown)} className="min-h-12 rounded-xl bg-gray-900 px-3 text-sm font-semibold text-gray-300 hover:bg-gray-800">
              <WorkoutIcon name="plus" className="mr-1 inline h-4 w-4" />Add exercise
            </button>
            <button type="button" onClick={skipExercise} className="min-h-12 rounded-xl bg-gray-900 px-3 text-sm font-semibold text-gray-300 hover:bg-gray-800">
              Skip exercise
            </button>
          </div>

          {showAddExercise && (
            <section aria-label="Add an exercise" className="mt-3 rounded-2xl border border-gray-800 bg-gray-900 p-4">
              <label className="block text-sm font-semibold text-gray-200">
                Find an exercise
                <input value={addExerciseSearch} onChange={(event) => setAddExerciseSearch(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 text-white" />
              </label>
              <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                {availableToAdd.map((exercise) => (
                  <button key={exercise.id} type="button" onClick={() => handleAddExercise(exercise)} className="flex min-h-12 w-full items-center justify-between rounded-xl bg-gray-800 px-3 text-left text-sm font-semibold text-white hover:bg-gray-700">
                    {exercise.name}<WorkoutIcon name="plus" className="h-4 w-4 text-brand-300" />
                  </button>
                ))}
                {availableToAdd.length === 0 && <p className="py-3 text-sm text-gray-400">No matching exercises.</p>}
              </div>
            </section>
          )}
        </div>

        {showRest && restStartedAt && restNextExercise && (
          <RestTimer
            seconds={restDurationSeconds}
            startedAt={restStartedAt}
            onDurationChange={(seconds) => { setRestDurationSeconds(seconds); saveRestDuration(seconds); }}
            onComplete={() => { setShowRest(false); setRestStartedAt(null); }}
            onSkip={() => { setShowRest(false); setRestStartedAt(null); }}
            nextName={restNextData?.name || restNextYoga?.name || restNextExercise.exerciseId}
            nextPreview={restNextData ? <ExerciseAnimation exerciseId={restNextData.id} size={72} /> : <WorkoutIcon name={restNextYoga ? "yoga" : "dumbbell"} className="h-12 w-12 flex-shrink-0 text-gray-400" />}
            cue={restNextData?.instructions[0]}
          />
        )}

        {celebration && (
          <div role="status" className="fixed left-4 right-4 top-[max(env(safe-area-inset-top),1rem)] z-[80] mx-auto max-w-lg rounded-2xl border border-brand-300/60 bg-gray-900 px-4 py-3 shadow-[0_0_32px_rgba(var(--accent-rgb),0.25)] transition-opacity duration-200 motion-reduce:transition-none">
            <div className="flex items-center gap-3">
              <WorkoutIcon name="spark" className="h-6 w-6 flex-shrink-0 text-brand-300" />
              <p className="flex-1 font-bold text-white">
                New PR: {curName} · {celebration.type === "weighted-reps"
                  ? `${celebration.value} reps at ${celebration.weightKg}kg`
                  : `${celebration.value}${celebration.type === "hold" ? "s" : celebration.type === "weight" ? "kg" : " reps"}`}
              </p>
              <button type="button" onClick={() => setCelebration(null)} aria-label="Dismiss personal record" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-800"><WorkoutIcon name="close" className="h-5 w-5" /></button>
            </div>
          </div>
        )}

        {confirmExit && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
            <section role="dialog" aria-modal="true" aria-labelledby="exit-title" className="w-full max-w-sm rounded-3xl border border-gray-700 bg-gray-900 p-5">
              <h2 id="exit-title" className="text-xl font-extrabold text-white">Exit workout?</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">Your completed sets are saved on this device. You can resume later.</p>
              <button type="button" onClick={() => { handlePauseExplore(); setConfirmExit(false); }} className="mt-5 min-h-14 w-full rounded-xl bg-brand-400 px-4 font-bold text-gray-950">Pause and save</button>
              <button type="button" onClick={() => { handleCancel(); router.push("/workouts"); }} className="mt-2 min-h-12 w-full rounded-xl bg-red-950/50 px-4 font-semibold text-red-200">End and discard this session</button>
              <button type="button" autoFocus onClick={() => setConfirmExit(false)} className="mt-2 min-h-12 w-full rounded-xl px-4 font-semibold text-gray-300 hover:bg-gray-800">Keep working out</button>
            </section>
          </div>
        )}
      </div>
    );
  }

  // Plan overview
  const pausedSamePlan =
    activeWorkout &&
    workoutSessionUI?.isPaused &&
    workoutSessionUI.planId === plan.id &&
    activeWorkout.planId === plan.id &&
    activeWorkout.dayIndex === workoutSessionUI.dayIndex;

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <button onClick={() => router.push("/workouts")} className="text-gray-400 hover:text-white transition-colors mb-4 inline-block">← Back</button>
      {pausedSamePlan && workoutSessionUI && (
        <div className="mb-4 glass rounded-2xl p-4 border border-amber-500/35">
          <p className="text-amber-200 font-bold text-sm mb-1">Workout paused</p>
          <p className="text-gray-400 text-xs mb-3">Browse the app anytime — resume when you&apos;re ready.</p>
          <button
            type="button"
            onClick={() => {
              setWorkoutSessionUI({ ...workoutSessionUI, isPaused: false });
              setIsPaused(false);
              setIsActive(true);
            }}
            className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600"
          >
            <WorkoutIcon name="play" className="mr-2 inline h-5 w-5" />Resume workout
          </button>
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{plan.name}</h1>
        <p className="text-gray-400 text-sm mb-1">{plan.description}</p>
        <p className="text-brand-400 text-sm font-medium">{plan.goal}</p>
      </div>

      {/* Today's Quick Start */}
      {todayDay && !todayDay.isRest && (
        <div className="mb-6 glass rounded-2xl p-5 border-2 border-brand-500/40">
          <p className="text-xs text-brand-400 font-bold uppercase tracking-wider mb-1">Today — {todayDay.day}</p>
          <h2 className="text-lg font-extrabold text-white mb-1">{todayDay.name}</h2>
          <p className="text-gray-400 text-xs mb-3">{todayDay.exercises.length} exercises</p>
          <button onClick={() => handleStart(todayIndex)} className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600">Start Workout</button>
        </div>
      )}
      {todayDay && todayDay.isRest && (
        <div className="mb-6 glass rounded-2xl p-5 border-2 border-gray-600/40">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Today — {todayDay.day}</p>
          <p className="flex items-center gap-2 text-lg font-bold text-white"><WorkoutIcon name="moon" className="h-5 w-5 text-gray-400" />Rest Day</p>
        </div>
      )}

      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Full Week</h3>
      <div className="space-y-3 mb-8">
        {plan.days.map((day, i) => (
          <div key={i} className={`rounded-xl border transition-all ${day.isRest ? "bg-gray-800/30 border-gray-700/30 p-4" : selectedDay === i ? "bg-gray-800 border-brand-500/50 p-4" : "bg-gray-800/50 border-gray-700/50 p-4 hover:bg-gray-800/70 cursor-pointer"}`} onClick={() => !day.isRest && setSelectedDay(selectedDay === i ? null : i)}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono w-8">{day.day.slice(0, 3)}</span>
                <span className={`font-semibold ${day.isRest ? "text-gray-500" : "text-white"}`}>{day.name}</span>
              </div>
              {day.isRest ? <WorkoutIcon name="moon" className="h-4 w-4 text-gray-500" /> : <span className="text-xs text-gray-400">{day.exercises.length} ex {selectedDay === i ? "▲" : "▼"}</span>}
            </div>
            {day.isRest && day.restDayActivities && (
              <div className="mt-3 space-y-2">
                {day.restDayActivities.map((act, ai) => (
                  <div key={ai} className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-white text-xs font-semibold">{act.name}</p>
                    <p className="text-gray-500 text-xs">{act.description} · {act.duration}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedDay === i && !day.isRest && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                {day.warmUp && (
                  <div className="mb-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                    <p className="text-orange-400 text-xs font-bold mb-1"><WorkoutIcon name="spark" className="mr-1 inline h-4 w-4" />{day.warmUp.name} ({day.warmUp.duration})</p>
                    <ul className="space-y-1">
                      {day.warmUp.exercises.map((w, wi) => <li key={wi} className="text-gray-400 text-xs">• {w}</li>)}
                    </ul>
                  </div>
                )}
                {/* Exercise list — no numbering */}
                <div className="mb-4">
                  {day.exercises.map((we, ei) => renderExerciseRow(we, ei))}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleStart(i); }} className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600">Start {day.name}</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedExercise && <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
    </div>
  );
}

export default function PlanPage() {
  return <Suspense fallback={<div className="max-w-lg mx-auto px-4 pt-8 text-gray-400">Loading...</div>}><PlanContent /></Suspense>;
}
