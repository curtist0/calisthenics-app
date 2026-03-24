"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getExerciseById } from "@/data/exercises";
import { getYogaPoseById } from "@/data/yoga";
import { useWorkout } from "@/context/WorkoutContext";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseModal from "@/components/ExerciseModal";
import ExerciseAnimation from "@/components/ExerciseAnimation";
import SetLogCard from "@/components/SetLogCard";
import Timer from "@/components/Timer";
import RestTimer from "@/components/RestTimer";
import { Exercise } from "@/lib/types";
import Link from "next/link";

function PlanContent() {
  const params = useSearchParams();
  const router = useRouter();
  const planId = params.get("id");
  const { savedPlans, activeWorkout, startDayWorkout, completeSet, undoSet, finishWorkout, cancelWorkout, workoutSessionUI, setWorkoutSessionUI } = useWorkout();

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
  const [showWarmUpPrompt, setShowWarmUpPrompt] = useState(false);
  const [pendingDayIndex, setPendingDayIndex] = useState<number | null>(null);
  const sessionRestoreKey = useRef<string | null>(null);

  useEffect(() => {
    if (!plan || !activeWorkout || activeWorkout.planId !== plan.id) return;
    const s = workoutSessionUI;
    if (!s || s.planId !== plan.id || s.dayIndex !== activeWorkout.dayIndex) return;
    const key = `${plan.id}-${activeWorkout.dayIndex}-${s.isPaused}`;
    if (sessionRestoreKey.current === key) return;
    setActiveDayIndex(s.dayIndex);
    setCurEx(s.curEx);
    setCurSet(s.curSet);
    setShowRest(s.showRest);
    setIsPaused(s.isPaused);
    // Paused sessions show the plan overview + resume entry; resumed sessions open the active workout UI.
    setIsActive(!s.isPaused);
    sessionRestoreKey.current = key;
  }, [plan, activeWorkout, workoutSessionUI]);

  useEffect(() => {
    sessionRestoreKey.current = null;
  }, [plan?.id]);

  useEffect(() => {
    if (!isActive || !plan || !activeWorkout || activeWorkout.planId !== plan.id) return;
    setWorkoutSessionUI({
      planId: plan.id,
      dayIndex: activeDayIndex,
      curEx,
      curSet,
      showRest,
      isPaused,
    });
  }, [isActive, plan, activeWorkout, activeDayIndex, curEx, curSet, showRest, isPaused, setWorkoutSessionUI]);

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center">
        <p className="text-gray-400">Plan not found</p>
        <Link href="/workouts" className="mt-4 inline-block px-6 py-2 bg-brand-500 text-white rounded-full">Back</Link>
      </div>
    );
  }

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const todayDay = plan.days[todayIndex];
  const activeDay = isActive ? plan.days[activeDayIndex] : null;
  const curWE = activeDay?.exercises[curEx];
  const curExData = curWE ? getExerciseById(curWE.exerciseId) : null;
  const curYogaPose = curWE ? getYogaPoseById(curWE.exerciseId) : null;
  const curName = curExData?.name || curYogaPose?.name || curWE?.progressionLevel || "Exercise";
  const curImage = curExData?.image || curYogaPose?.image || "💪";

  const handleStart = (dayIndex: number) => {
    const day = plan.days[dayIndex];
    if (day.warmUp) { setPendingDayIndex(dayIndex); setShowWarmUpPrompt(true); }
    else beginWorkout(dayIndex);
  };

  const beginWorkout = (dayIndex: number) => {
    startDayWorkout(plan, dayIndex);
    setActiveDayIndex(dayIndex); setIsActive(true); setIsPaused(false);
    setCurEx(0); setCurSet(0); setWeightInput("");
    setShowWarmUpPrompt(false); setPendingDayIndex(null);
  };

  const handleCompleteReps = () => {
    if (!curWE) return;
    const w = curExData?.supportsWeight && weightInput ? parseFloat(weightInput) : null;
    completeSet(curEx, curSet, curWE.reps, null, w);
    advance();
  };

  const handleCompleteHold = (seconds: number) => {
    completeSet(curEx, curSet, null, seconds, null);
    advance();
  };

  const advance = () => {
    if (!activeDay || !curWE) return;
    if (curSet < curWE.sets - 1) {
      setShowRest(true); setCurSet((s) => s + 1); setWeightInput("");
    } else if (curEx < activeDay.exercises.length - 1) {
      setShowRest(true); setCurEx((e) => e + 1); setCurSet(0); setWeightInput("");
    } else {
      finishWorkout(); setIsActive(false); sessionRestoreKey.current = null; router.push("/progress");
    }
  };

  const handleCancel = () => { cancelWorkout(); setIsActive(false); sessionRestoreKey.current = null; };

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
    });
    router.push("/");
  };

  // Helper to render an exercise row (handles both real exercises and conditioning)
  const renderExerciseRow = (we: typeof plan.days[0]["exercises"][0], idx: number, showManualEntry?: boolean) => {
    const ex = getExerciseById(we.exerciseId);
    const yoga = getYogaPoseById(we.exerciseId);
    const isCond = we.exerciseId.startsWith("cond-");
    const name = ex?.name || yoga?.name || we.progressionLevel?.replace("🔧 ", "") || "Exercise";
    const image = ex?.image || yoga?.image || "🔧";

    return (
      <div key={`${we.exerciseId}-${idx}`} className="glass rounded-xl p-3 mb-2">
        <div className="flex items-center gap-3">
          {ex ? (
            <button onClick={(e) => { e.stopPropagation(); setSelectedExercise(ex); }} className="flex-shrink-0">
              <ExerciseCard exercise={ex} compact />
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xl">{image}</span>
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
          <span className="text-5xl mb-4 block">🔥</span>
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
          <button onClick={() => beginWorkout(pendingDayIndex)} className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg">✅ Start Workout</button>
          <button onClick={() => beginWorkout(pendingDayIndex)} className="w-full py-3 bg-gray-800 text-gray-400 rounded-2xl font-medium">Skip Warm-Up →</button>
        </div>
      </div>
    );
  }

  // Active workout (flexible set logging mode)
  if (isActive && activeWorkout && activeDay) {
    const totalSets = activeDay.exercises.reduce((s, e) => s + e.sets, 0);
    const doneSets = activeWorkout.exercises.reduce((s, e) => s + e.sets.filter((x) => x.completed).length, 0);
    const allExercisesLogged = activeWorkout.exercises.every(ex => ex.sets.every(s => s.completed));

    return (
      <div className="max-w-lg mx-auto px-4 pt-8 pb-20">
        {/* Progress Bar */}
        <div className="mb-6 sticky top-0 bg-gray-900/95 py-4 -mx-4 px-4 z-10">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Workout Progress</span>
            <span>{doneSets}/{totalSets} sets logged</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all" style={{ width: `${(doneSets / totalSets) * 100}%` }} />
          </div>
        </div>

        {/* Exercise List with Inline Logging */}
        <div className="space-y-6 mb-6">
          {activeDay.exercises.map((workoutExercise, exerciseIndex) => {
            const completedEx = activeWorkout.exercises[exerciseIndex];
            const exercise = getExerciseById(workoutExercise.exerciseId);
            const completedSets = completedEx?.sets || [];
            const exerciseProgress = completedSets.filter(s => s.completed).length;

            return (
              <div key={exerciseIndex} className="space-y-3">
                {/* Exercise Header */}
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-4 mb-3">
                    {exercise && <ExerciseAnimation exerciseId={exercise.id} size={60} />}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold">{exercise?.name || "Exercise"}</h3>
                      {workoutExercise.progressionLevel && (
                        <p className="text-brand-400 text-xs mt-1">{workoutExercise.progressionLevel}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-2">
                        {workoutExercise.sets} sets × {workoutExercise.holdSeconds ? `${workoutExercise.holdSeconds}s` : `${workoutExercise.reps} reps`}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 transition-all"
                      style={{ width: `${(exerciseProgress / workoutExercise.sets) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Set Logging Cards */}
                <div className="space-y-2">
                  {Array.from({ length: workoutExercise.sets }).map((_, setIndex) => (
                    <SetLogCard
                      key={setIndex}
                      exerciseIndex={exerciseIndex}
                      setIndex={setIndex}
                      workoutExercise={workoutExercise}
                      setData={completedSets[setIndex]}
                      exercise={exercise}
                      onLogSet={completeSet}
                      onUndoSet={undoSet}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-gray-900/95 border-t border-gray-800 flex gap-3">
          <button
            onClick={handlePauseExplore}
            className="flex-1 py-3 bg-gray-800 text-gray-400 rounded-2xl font-medium hover:bg-gray-700"
          >
            ⏸ Pause
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-3 bg-gray-800 text-red-400 rounded-2xl font-medium hover:bg-red-500/10"
          >
            ✕ End
          </button>
          {allExercisesLogged && (
            <button
              onClick={() => { finishWorkout(); router.push("/progress"); }}
              className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-semibold hover:bg-green-600"
            >
              ✓ Finish
            </button>
          )}
        </div>
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
            ▶ Resume workout
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
          <button onClick={() => handleStart(todayIndex)} className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600">Start Workout 🚀</button>
        </div>
      )}
      {todayDay && todayDay.isRest && (
        <div className="mb-6 glass rounded-2xl p-5 border-2 border-gray-600/40">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Today — {todayDay.day}</p>
          <p className="text-lg font-bold text-white">😴 Rest Day</p>
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
              {day.isRest ? <span className="text-xs text-gray-500">😴</span> : <span className="text-xs text-gray-400">{day.exercises.length} ex {selectedDay === i ? "▲" : "▼"}</span>}
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
                    <p className="text-orange-400 text-xs font-bold mb-1">🔥 {day.warmUp.name} ({day.warmUp.duration})</p>
                    <ul className="space-y-1">
                      {day.warmUp.exercises.map((w, wi) => <li key={wi} className="text-gray-400 text-xs">• {w}</li>)}
                    </ul>
                  </div>
                )}
                {/* Exercise list — no numbering */}
                <div className="mb-4">
                  {day.exercises.map((we, ei) => renderExerciseRow(we, ei))}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleStart(i); }} className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600">Start {day.name} 🚀</button>
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
