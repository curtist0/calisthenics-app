"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getExerciseById } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseModal from "@/components/ExerciseModal";
import Timer from "@/components/Timer";
import RestTimer from "@/components/RestTimer";
import ExerciseAnimation from "@/components/ExerciseAnimation";
import { Exercise } from "@/lib/types";
import Link from "next/link";

function PlanContent() {
  const params = useSearchParams();
  const router = useRouter();
  const planId = params.get("id");
  const { savedPlans, activeWorkout, startDayWorkout, completeSet, finishWorkout, cancelWorkout } = useWorkout();

  const plan = savedPlans.find((p) => p.id === planId);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [curEx, setCurEx] = useState(0);
  const [curSet, setCurSet] = useState(0);
  const [showRest, setShowRest] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [weightInput, setWeightInput] = useState("");

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center">
        <p className="text-gray-400">Plan not found</p>
        <Link href="/workouts" className="mt-4 inline-block px-6 py-2 bg-brand-500 text-white rounded-full">Back</Link>
      </div>
    );
  }

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Mon=0..Sun=6
  const todayDay = plan.days[todayIndex];

  const activeDay = isActive ? plan.days[activeDayIndex] : null;
  const curWE = activeDay?.exercises[curEx];
  const curExercise = curWE ? getExerciseById(curWE.exerciseId) : null;

  const handleStart = (dayIndex: number) => {
    startDayWorkout(plan, dayIndex);
    setActiveDayIndex(dayIndex);
    setIsActive(true);
    setCurEx(0);
    setCurSet(0);
    setWeightInput("");
  };

  const handleCompleteReps = () => {
    if (!curWE || !curExercise) return;
    const w = curExercise.supportsWeight && weightInput ? parseFloat(weightInput) : null;
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
      setShowRest(true);
      setCurSet((s) => s + 1);
      setWeightInput("");
    } else if (curEx < activeDay.exercises.length - 1) {
      setShowRest(true);
      setCurEx((e) => e + 1);
      setCurSet(0);
      setWeightInput("");
    } else {
      finishWorkout();
      setIsActive(false);
      router.push("/progress");
    }
  };

  const handleCancel = () => { cancelWorkout(); setIsActive(false); };

  // Active workout
  if (isActive && activeWorkout && curExercise && curWE && activeDay) {
    const totalSets = activeDay.exercises.reduce((s, e) => s + e.sets, 0);
    const doneSets = activeWorkout.exercises.reduce((s, e) => s + e.sets.filter((x) => x.completed).length, 0);

    return (
      <div className="max-w-lg mx-auto px-4 pt-8">
        {showRest && <RestTimer seconds={curWE.restSeconds} onComplete={() => setShowRest(false)} />}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{activeDay.name}</span>
            <span>{doneSets}/{totalSets} sets</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(doneSets / totalSets) * 100}%` }} />
          </div>
        </div>

        <div className="text-center mb-2">
          <div className="flex justify-center mb-3">
            <ExerciseAnimation exerciseId={curExercise.id} size={140} />
          </div>
          <h2 className="text-2xl font-bold text-white">{curExercise.name}</h2>
          <p className="text-gray-400 text-sm">Set {curSet + 1} of {curWE.sets}</p>
          {curWE.progressionLevel && <span className="inline-block mt-2 text-xs bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full">{curWE.progressionLevel}</span>}
        </div>

        {curExercise.isHold && curWE.holdSeconds ? (
          <div className="flex flex-col items-center mt-4">
            <Timer targetSeconds={curWE.holdSeconds} onComplete={handleCompleteHold} label={`Hold for ${curWE.holdSeconds}s`} setNumber={curSet + curEx * 100} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="bg-gray-800/50 rounded-2xl p-6 text-center w-full">
              <p className="text-5xl font-bold text-white mb-1">{curWE.reps}</p>
              <p className="text-gray-400">reps</p>
            </div>
            {curExercise.supportsWeight && (
              <div className="w-full">
                <label className="text-xs text-gray-400 mb-1 block">Added weight (kg) — optional</label>
                <input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} placeholder="0" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-lg font-mono focus:border-brand-500 focus:outline-none" />
              </div>
            )}
            <button onClick={handleCompleteReps} className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 transition-colors">
              Complete Set ✓
            </button>
          </div>
        )}
        <button onClick={handleCancel} className="w-full mt-4 py-3 bg-gray-800 text-gray-400 rounded-2xl font-medium hover:bg-gray-700 transition-colors">Cancel Workout</button>
      </div>
    );
  }

  // Plan overview
  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <button onClick={() => router.push("/workouts")} className="text-gray-400 hover:text-white transition-colors mb-4 inline-block">← Back</button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{plan.name}</h1>
        <p className="text-gray-400 text-sm mb-1">{plan.description}</p>
        <p className="text-brand-400 text-sm font-medium">Goal: {plan.goal}</p>
      </div>

      {/* Today's Workout Quick Start */}
      {todayDay && !todayDay.isRest && (
        <div className="mb-6 glass rounded-2xl p-5 border-2 border-brand-500/40">
          <p className="text-xs text-brand-400 font-bold uppercase tracking-wider mb-1">Today — {todayDay.day}</p>
          <h2 className="text-xl font-extrabold text-white mb-1">{todayDay.name}</h2>
          {todayDay.focus && <p className="text-gray-400 text-xs mb-3">{todayDay.focus}</p>}
          <button onClick={() => handleStart(todayIndex)} className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors">
            Start Today&apos;s Workout 🚀
          </button>
        </div>
      )}
      {todayDay && todayDay.isRest && (
        <div className="mb-6 glass rounded-2xl p-5 border-2 border-gray-600/40">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Today — {todayDay.day}</p>
          <h2 className="text-lg font-bold text-white mb-1">😴 Rest & Recovery</h2>
          <p className="text-gray-400 text-xs">Take it easy! Check out the suggested activities below.</p>
        </div>
      )}

      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Full Week Overview</h3>
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
            {day.focus && !day.isRest && <p className="text-xs text-gray-400 mt-1 ml-10">{day.focus}</p>}
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
                      {day.warmUp.exercises.map((w, wi) => (
                        <li key={wi} className="text-gray-400 text-xs">• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="space-y-2 mb-4">
                  {day.exercises.map((we, ei) => {
                    const ex = getExerciseById(we.exerciseId);
                    if (!ex) return null;
                    return (
                      <div key={`${we.exerciseId}-${ei}`} className="flex items-center gap-3">
                        <span className="text-gray-500 font-mono text-xs w-5">{ei + 1}.</span>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedExercise(ex); }} className="flex-1"><ExerciseCard exercise={ex} compact /></button>
                        <div className="text-right text-xs text-gray-400 flex-shrink-0">
                          <p className="text-white font-semibold">{we.sets} × {we.holdSeconds ? `${we.holdSeconds}s` : we.reps}</p>
                          {we.progressionLevel && <p className="text-brand-400">{we.progressionLevel}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleStart(i); }} className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors">Start {day.name} 🚀</button>
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
