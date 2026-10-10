"use client";

import { useEffect, useState } from "react";
import { exercises, getExerciseById } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import { generateWeeklyPlan, generateYogaPlanFromGoal, generateGuidedPlan, generateQuickWorkout, guidedGoalSkills, GuidedEquipment } from "@/lib/planGenerator";
import { getPlanProgress } from "@/lib/planProgress";
import PageBackground from "@/components/PageBackground";
import ExerciseIllustration from "@/components/ExerciseIllustration";
import WorkoutIcon, { WorkoutIconName } from "@/components/WorkoutIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Difficulty, TrainingGoal, Exercise, WeeklyPlan } from "@/lib/types";
import { generateId } from "@/lib/storage";

const goalOptions: { value: TrainingGoal; label: string; icon: WorkoutIconName }[] = [
  { value: "muscle", label: "Build Muscle", icon: "dumbbell" },
  { value: "skills", label: "Master Skills", icon: "target" },
  { value: "weight-loss", label: "Lose Weight", icon: "heart" },
  { value: "endurance", label: "Endurance", icon: "bar" },
  { value: "balanced", label: "Balanced", icon: "spark" },
];

const diffOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2, elite: 3 };
const diffText: Record<string, string> = { beginner: "text-green-400", intermediate: "text-yellow-400", advanced: "text-red-400", elite: "text-fuchsia-400" };

function getProgressionEndpoint(exerciseId: string): string | null {
  let current = getExerciseById(exerciseId);
  if (!current) return null;
  let last = current;
  const visited = new Set<string>();
  while (current?.progressionTo && !visited.has(current.progressionTo)) {
    visited.add(current.id);
    const next = getExerciseById(current.progressionTo);
    if (!next) break;
    last = next;
    current = next;
  }
  return last.id !== exerciseId ? last.name : null;
}

const skillExercises = exercises.filter(
  (e) => e.category === "skill" || e.id === "handstand-push-up" || e.id === "pistol-squat" || e.id === "dragon-flag"
);

const yogaGoalPresets: { label: string; icon: WorkoutIconName }[] = [
  { label: "Improve overall flexibility", icon: "yoga" },
  { label: "Achieve the splits", icon: "target" },
  { label: "Reduce stress & anxiety", icon: "heart" },
  { label: "Better sleep", icon: "clock" },
  { label: "Improve balance & coordination", icon: "spark" },
  { label: "Fix posture", icon: "bar" },
  { label: "Morning energy boost", icon: "arrow" },
  { label: "Deep backbend flexibility", icon: "yoga" },
];

const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getTodayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

function nextPlannedDay(plan: WeeklyPlan, logs: ReturnType<typeof useWorkout>["logs"]): number {
  const today = getTodayIndex();
  for (let offset = 0; offset < 7; offset++) {
    const index = (today + offset) % 7;
    const completed = logs.some((log) => log.planId === plan.id && log.dayIndex === index && log.completed);
    if (!plan.days[index].isRest && !completed) return index;
  }
  return plan.days.findIndex((day) => !day.isRest);
}

export default function WorkoutsPage() {
  const router = useRouter();
  const { savedPlans, addPlan, removePlan, profile, logs, isHydrated, dataLoadError } = useWorkout();
  const [view, setView] = useState<"library" | "type" | "pick" | "goal" | "yoga-goal" | "guided" | "quick">("library");
  const [workoutType, setWorkoutType] = useState<"calisthenics" | "flexibility" | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal>("balanced");
  const [guidedGoalSkill, setGuidedGoalSkill] = useState<string>("pull-up");
  const [guidedDays, setGuidedDays] = useState(3);
  const [equipment, setEquipment] = useState<GuidedEquipment>("pull-up-bar");
  const [level, setLevel] = useState<Difficulty>("beginner");
  const [quickDuration, setQuickDuration] = useState<15 | 30 | 45>(15);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [yogaGoalText, setYogaGoalText] = useState("");
  const [yogaDuration, setYogaDuration] = useState(60);

  useEffect(() => {
    if (isHydrated && profile) setLevel(profile.overallLevel);
  }, [isHydrated, profile]);

  const yogaUnlocked = profile?.yogaSetUp ?? false;

  const userGauged = diffOrder[profile?.overallLevel ?? "beginner"] ?? 0;
  const displayedPlan = savedPlans.find((plan) => plan.id === selectedPlanId) ?? savedPlans[0] ?? null;
  const activeWeekday = selectedDay ?? (displayedPlan ? nextPlannedDay(displayedPlan, logs) : 0);

  // Plan generator: show only skills at your gauged level; expandable box shows recommended next skills (higher difficulties) first, then less likely (lower difficulties).
  const currentLevel = skillExercises
    .filter((ex) => diffOrder[ex.difficulty] === userGauged)
    .sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
  const higherLevel = skillExercises
    .filter((ex) => diffOrder[ex.difficulty] > userGauged)
    .sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
  const lowerLevel = skillExercises
    .filter((ex) => diffOrder[ex.difficulty] < userGauged)
    .sort((a, b) => diffOrder[b.difficulty] - diffOrder[a.difficulty]);
  const archived = [...higherLevel, ...lowerLevel];

  const toggle = (id: string) => { setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const handleGenerateCalisthenics = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    addPlan(generateWeeklyPlan(ids, selectedGoal));
    setSelected(new Set()); setView("library"); setWorkoutType(null); setShowMore(false);
  };

  const handleGenerateYoga = () => {
    if (!yogaGoalText.trim()) return;
    addPlan(generateYogaPlanFromGoal(yogaGoalText, yogaDuration));
    setYogaGoalText(""); setView("library"); setWorkoutType(null);
  };

  const createAndStartPlan = (plan: WeeklyPlan) => {
    setActionError(null);
    try {
      const savedPlan = { ...plan, id: generateId(), createdAt: new Date().toISOString() };
      const dayIndex = nextPlannedDay(savedPlan, logs);
      addPlan(savedPlan);
      setSelectedPlanId(savedPlan.id);
      setSelectedDay(dayIndex);
      setView("library");
      router.push(`/workouts/plan?id=${encodeURIComponent(savedPlan.id)}&day=${dayIndex}&start=1`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to save this workout plan.");
    }
  };

  const handleGenerateGuidedPlan = () => {
    try {
      createAndStartPlan(generateGuidedPlan({
        goalSkillId: guidedGoalSkill,
        daysPerWeek: guidedDays,
        equipment,
        level,
      }));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to build this plan.");
    }
  };

  const handleQuickWorkout = () => {
    try {
      createAndStartPlan(generateQuickWorkout({
        durationMinutes: quickDuration,
        equipment,
        level,
        dayIndex: getTodayIndex(),
      }));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to build this workout.");
    }
  };

  const renderSkillButton = (ex: Exercise) => {
    const isSel = selected.has(ex.id);
    const endpoint = getProgressionEndpoint(ex.id);
    return (
      <button key={ex.id} onClick={() => toggle(ex.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${isSel ? "border-brand-500 bg-brand-500/10" : "border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50"}`}>
        <ExerciseIllustration exerciseId={ex.id} size={50} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm">{ex.name}</h3>
          <span className={`text-xs font-medium capitalize ${diffText[ex.difficulty]}`}>{ex.difficulty}</span>
          {endpoint && <p className="text-xs text-gray-500 mt-0.5">→ <span className="text-brand-400">{endpoint}</span></p>}
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSel ? "border-brand-500 bg-brand-500" : "border-gray-600"}`}>
          {isSel && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <PageBackground variant="workouts" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Workouts</h1>
          <p className="text-gray-400 text-sm">
            {view === "library" ? `${savedPlans.length} plan${savedPlans.length !== 1 ? "s" : ""}` : view === "type" ? "Choose type" : view === "yoga-goal" ? "Yoga setup" : view === "pick" ? "Select skills" : view === "guided" ? "Set your direction" : view === "quick" ? "A session that fits your day" : "Choose goal"}
          </p>
        </div>
        {view === "library" ? (
          savedPlans.length > 0 && (
            <button onClick={() => { setActionError(null); setView("type"); }} className="min-h-11 px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors duration-200 motion-reduce:transition-none">
              <span className="inline-flex items-center gap-2"><WorkoutIcon name="plus" className="h-4 w-4" /> New plan</span>
            </button>
          )
        ) : savedPlans.length > 0 ? (
          <button onClick={() => { setView("library"); setWorkoutType(null); setSelected(new Set()); setShowMore(false); setActionError(null); }} className="min-h-11 px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">My Plans</button>
        ) : null}
      </div>

      {!isHydrated ? (
        <div role="status" aria-label="Loading saved workouts" className="space-y-3">
          <div className="h-32 rounded-2xl bg-gray-800/70 animate-pulse motion-reduce:animate-none" />
          <div className="h-32 rounded-2xl bg-gray-800/70 animate-pulse motion-reduce:animate-none" />
          <span className="sr-only">Loading your saved workouts…</span>
        </div>
      ) : dataLoadError ? (
        <div role="alert" className="rounded-2xl border border-red-400/30 bg-red-950/30 p-5 text-sm text-red-200">
          <p className="font-bold">Saved workouts could not be loaded.</p>
          <p className="mt-1 break-words">{dataLoadError}</p>
        </div>
      ) : (
        <>
      {actionError && (
        <p role="alert" className="mb-4 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {actionError}
        </p>
      )}

      {/* Library */}
      {view === "library" && (savedPlans.length === 0 ? (
        <div>
          <section className="relative overflow-hidden rounded-3xl border border-brand-500/25 bg-gradient-to-br from-brand-500/15 via-gray-900 to-gray-950 p-5 sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-brand-400/20" />
            <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300">
              <WorkoutIcon name="target" className="h-7 w-7" />
            </div>
            <h2 className="relative text-2xl font-extrabold tracking-tight text-white">Let&apos;s build your first week</h2>
            <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-gray-300">Start with a skill, fit in a quick session, or shape every detail yourself.</p>
          </section>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => { setActionError(null); setView("guided"); }}
              className="group flex min-h-[104px] w-full items-center gap-4 rounded-2xl border border-gray-700/70 bg-gray-900/80 p-4 text-left transition-all duration-200 hover:border-brand-400/60 hover:bg-gray-800/90 motion-reduce:transition-none"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300"><WorkoutIcon name="target" className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-white">Start from a goal</span>
                <span className="mt-1 block text-sm text-gray-400">Build a week around a skill you want</span>
              </span>
              <WorkoutIcon name="arrow" className="h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </button>
            <button
              type="button"
              onClick={() => { setActionError(null); setView("quick"); }}
              className="group flex min-h-[104px] w-full items-center gap-4 rounded-2xl border border-gray-700/70 bg-gray-900/80 p-4 text-left transition-all duration-200 hover:border-brand-400/60 hover:bg-gray-800/90 motion-reduce:transition-none"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300"><WorkoutIcon name="clock" className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-white">Quick workout</span>
                <span className="mt-1 block text-sm text-gray-400">Choose your time and get moving</span>
              </span>
              <WorkoutIcon name="arrow" className="h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </button>
            <button
              type="button"
              onClick={() => { setActionError(null); setView("type"); }}
              className="group flex min-h-[104px] w-full items-center gap-4 rounded-2xl border border-gray-700/70 bg-gray-900/80 p-4 text-left transition-all duration-200 hover:border-brand-400/60 hover:bg-gray-800/90 motion-reduce:transition-none"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300"><WorkoutIcon name="dumbbell" className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-white">Build my own</span>
                <span className="mt-1 block text-sm text-gray-400">Use the existing plan builder</span>
              </span>
              <WorkoutIcon name="arrow" className="h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedPlan && (
            <section aria-label="This week's schedule" className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">This week</h2>
                <span className="text-xs text-gray-500">{displayedPlan.name}</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {displayedPlan.days.map((day, index) => {
                  const completed = logs.some((log) => log.planId === displayedPlan.id && log.dayIndex === index && log.completed);
                  const selectedDayIndex = activeWeekday === index;
                  const today = getTodayIndex() === index;
                  return (
                    <button
                      key={`${displayedPlan.id}-${index}`}
                      type="button"
                      onClick={() => setSelectedDay(index)}
                      aria-label={`${day.day}: ${day.isRest ? "rest day" : day.name}${completed ? ", completed" : ""}${today ? ", today" : ""}`}
                      aria-pressed={selectedDayIndex}
                      className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border text-xs transition-colors duration-200 motion-reduce:transition-none ${
                        completed ? "border-brand-400 bg-brand-400 text-gray-950"
                          : day.isRest ? "border-gray-800 bg-gray-900/50 text-gray-600"
                            : selectedDayIndex ? "border-brand-300 bg-brand-500/15 text-brand-200"
                              : "border-gray-600 bg-gray-900 text-gray-300"
                      } ${today ? "ring-2 ring-brand-300 ring-offset-2 ring-offset-gray-950" : ""}`}
                    >
                      <span className="font-semibold">{weekdayNames[index]}</span>
                      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${completed ? "bg-gray-950" : day.isRest ? "bg-gray-700" : "bg-brand-400"}`} />
                    </button>
                  );
                })}
              </div>
              {displayedPlan.days[activeWeekday] && (
                <div className="mt-4 rounded-xl bg-gray-900/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">{displayedPlan.days[activeWeekday].day}{getTodayIndex() === activeWeekday ? " · Today" : ""}</p>
                  <h3 className="mt-1 font-bold text-white">{displayedPlan.days[activeWeekday].name}</h3>
                  {!displayedPlan.days[activeWeekday].isRest ? (
                    <>
                      <p className="mt-1 text-sm text-gray-400">{displayedPlan.days[activeWeekday].exercises.length} exercises</p>
                      <Link
                        href={`/workouts/plan?id=${encodeURIComponent(displayedPlan.id)}&day=${activeWeekday}`}
                        className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-center font-bold text-gray-950 transition-colors duration-200 hover:bg-brand-400 motion-reduce:transition-none"
                      >
                        Continue <WorkoutIcon name="arrow" className="h-5 w-5" />
                      </Link>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">A recovery day. Your plan is ready when you are.</p>
                  )}
                </div>
              )}
            </section>
          )}

          <div className="grid gap-4">
            {savedPlans.map((plan) => {
              const progress = getPlanProgress(plan, logs);
              const nextDayIndex = nextPlannedDay(plan, logs);
              const nextDay = plan.days[nextDayIndex];
              const circumference = 2 * Math.PI * 22;
              return (
                <article key={plan.id} className="overflow-hidden rounded-2xl border border-gray-700/70 bg-gray-900/80 p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center" role="img" aria-label={`Plan progress ${progress.percentage}%`}>
                      <svg aria-hidden="true" className="-rotate-90" viewBox="0 0 52 52">
                        <circle cx="26" cy="26" r="22" fill="none" stroke="rgb(55 65 81)" strokeWidth="4" />
                        <circle cx="26" cy="26" r="22" fill="none" stroke="var(--accent-color)" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress.percentage / 100)} />
                      </svg>
                      <span className="absolute text-xs font-bold text-white">{progress.percentage}%</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-lg font-extrabold text-white">{plan.name}</h2>
                      <p className="mt-1 text-sm text-gray-300">{plan.goal}</p>
                      <p className="mt-2 text-xs font-semibold text-brand-300">Week {progress.currentWeek} of 6 · {progress.percentage}%</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => confirmDelete === plan.id ? (removePlan(plan.id), setConfirmDelete(null)) : setConfirmDelete(plan.id)}
                      aria-label={confirmDelete === plan.id ? `Confirm delete ${plan.name}` : `Delete ${plan.name}`}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-800 text-gray-400 transition-colors duration-200 hover:text-red-300 motion-reduce:transition-none"
                    >
                      {confirmDelete === plan.id ? "Delete" : <WorkoutIcon name="trash" className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmDelete === plan.id && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-950/20 p-3">
                      <span className="text-sm text-gray-300">Remove this plan?</span>
                      <button type="button" onClick={() => setConfirmDelete(null)} className="min-h-11 rounded-lg px-4 text-sm font-semibold text-gray-300">Keep plan</button>
                    </div>
                  )}
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Up next</p>
                    <p className="mt-1 text-sm font-semibold text-white">{nextDay.name} <span className="font-normal text-gray-400">· {nextDay.day}</span></p>
                    <Link
                      href={`/workouts/plan?id=${encodeURIComponent(plan.id)}&day=${nextDayIndex}`}
                      className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 font-bold text-gray-950 transition-colors duration-200 hover:bg-brand-400 motion-reduce:transition-none"
                    >
                      Continue <WorkoutIcon name="arrow" className="h-5 w-5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}

      {view === "guided" && (
        <section aria-labelledby="guided-title" className="space-y-5">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => setView("library")} aria-label="Back to workout options" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-800 text-gray-300">
              <span aria-hidden="true">←</span>
            </button>
            <div>
              <h2 id="guided-title" className="text-xl font-extrabold text-white">What skill are you chasing?</h2>
              <p className="mt-1 text-sm text-gray-400">We&apos;ll build a balanced week around it.</p>
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-gray-200">Choose your goal</legend>
            <div className="grid grid-cols-2 gap-2">
              {guidedGoalSkills.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  aria-pressed={guidedGoalSkill === goal.id}
                  onClick={() => setGuidedGoalSkill(goal.id)}
                  className={`flex min-h-14 items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none ${
                    guidedGoalSkill === goal.id ? "border-brand-400 bg-brand-500/15 text-brand-200" : "border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500"
                  }`}
                >
                  <WorkoutIcon name="target" className="h-4 w-4 flex-shrink-0" />
                  {goal.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-gray-200">Training days per week</legend>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={guidedDays === count}
                  onClick={() => setGuidedDays(count)}
                  className={`min-h-12 rounded-xl text-sm font-bold transition-colors duration-200 motion-reduce:transition-none ${guidedDays === count ? "bg-brand-500 text-gray-950" : "bg-gray-800 text-gray-300"}`}
                >
                  {count}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-gray-200">Equipment</legend>
            <div className="grid gap-2">
              {([
                ["pull-up-bar", "Pull-up bar", "A bar is needed for the pulling movements in the exercise library."],
                ["pull-up-bar-and-dip-bars", "Pull-up + dip bars", "Adds parallel-bar options where they fit."],
              ] as const).map(([value, label, description]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={equipment === value}
                  onClick={() => setEquipment(value)}
                  className={`min-h-14 rounded-xl border px-4 py-3 text-left transition-colors duration-200 motion-reduce:transition-none ${equipment === value ? "border-brand-400 bg-brand-500/10" : "border-gray-700 bg-gray-900"}`}
                >
                  <span className="block text-sm font-semibold text-white">{label}</span>
                  <span className="mt-1 block text-xs text-gray-400">{description}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-bold text-gray-200">
            Training level
            <select value={level} onChange={(event) => setLevel(event.target.value as Difficulty)} className="mt-2 min-h-12 w-full rounded-xl border border-gray-700 bg-gray-900 px-4 text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40">
              {(["beginner", "intermediate", "advanced", "elite"] as const).map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty[0].toUpperCase() + difficulty.slice(1)}</option>)}
            </select>
          </label>

          <button type="button" onClick={handleGenerateGuidedPlan} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-4 text-base font-extrabold text-gray-950 transition-colors duration-200 hover:bg-brand-400 motion-reduce:transition-none">
            Build my week <WorkoutIcon name="arrow" className="h-5 w-5" />
          </button>
        </section>
      )}

      {view === "quick" && (
        <section aria-labelledby="quick-title" className="space-y-5">
          <div className="flex items-start gap-3">
            <button type="button" onClick={() => setView("library")} aria-label="Back to workout options" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-gray-800 text-gray-300">
              <span aria-hidden="true">←</span>
            </button>
            <div>
              <h2 id="quick-title" className="text-xl font-extrabold text-white">How much time have you got?</h2>
              <p className="mt-1 text-sm text-gray-400">One balanced session, made for today.</p>
            </div>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-gray-200">Session length</legend>
            <div className="grid grid-cols-3 gap-2">
              {([15, 30, 45] as const).map((minutes) => (
                <button key={minutes} type="button" aria-pressed={quickDuration === minutes} onClick={() => setQuickDuration(minutes)} className={`min-h-14 rounded-xl text-base font-bold transition-colors duration-200 motion-reduce:transition-none ${quickDuration === minutes ? "bg-brand-500 text-gray-950" : "bg-gray-800 text-gray-300"}`}>
                  {minutes} min
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-bold text-gray-200">Equipment</legend>
            <div className="grid gap-2">
              {([
                ["pull-up-bar", "Pull-up bar"],
                ["pull-up-bar-and-dip-bars", "Pull-up + dip bars"],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={equipment === value} onClick={() => setEquipment(value)} className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none ${equipment === value ? "border-brand-400 bg-brand-500/10 text-white" : "border-gray-700 bg-gray-900 text-gray-300"}`}>
                  <WorkoutIcon name="bar" className="h-5 w-5 text-brand-300" />{label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">A pull-up bar keeps every session balanced with a pulling movement.</p>
          </fieldset>
          <p className="text-sm text-gray-400">Using your saved level: <span className="font-semibold capitalize text-gray-200">{level}</span></p>
          <button type="button" onClick={handleQuickWorkout} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-4 text-base font-extrabold text-gray-950 transition-colors duration-200 hover:bg-brand-400 motion-reduce:transition-none">
            Start {quickDuration}-minute workout <WorkoutIcon name="arrow" className="h-5 w-5" />
          </button>
        </section>
      )}

      {/* Choose Type */}
      {view === "type" && (
        <div className="space-y-4">
          <button onClick={() => { setWorkoutType("calisthenics"); setView("pick"); setSelected(new Set()); }} className="w-full glass rounded-2xl p-6 text-left hover:scale-[1.02] transition-all">
            <div className="flex items-center gap-4"><WorkoutIcon name="dumbbell" className="h-8 w-8 text-brand-300" /><div><p className="text-white font-extrabold text-lg">Calisthenics</p><p className="text-gray-400 text-sm">Strength & skill progressions</p></div></div>
          </button>
          {yogaUnlocked ? (
            <button onClick={() => { setWorkoutType("flexibility"); setView("yoga-goal"); }} className="w-full glass rounded-2xl p-6 text-left hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-4"><WorkoutIcon name="yoga" className="h-8 w-8 text-brand-300" /><div><p className="text-white font-extrabold text-lg">Yoga & Flexibility</p><p className="text-gray-400 text-sm">Custom yoga routine for your goals</p></div></div>
            </button>
          ) : (
            <div className="w-full glass rounded-2xl p-6 opacity-50"><div className="flex items-center gap-4"><WorkoutIcon name="lock" className="h-8 w-8 text-gray-400" /><div><p className="text-white font-bold">Yoga</p><p className="text-gray-400 text-sm">Set up yoga to unlock</p></div></div></div>
          )}
        </div>
      )}

      {/* Yoga Goal Input */}
      {view === "yoga-goal" && (
        <div className="space-y-6">
          <div>
            <p className="text-white font-bold mb-3">What do you want from yoga?</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {yogaGoalPresets.map((p) => (
                <button key={p.label} onClick={() => setYogaGoalText(p.label)}
                  className={`p-3 rounded-xl text-left text-sm transition-all ${yogaGoalText === p.label ? "glass border-2 border-brand-500" : "glass border-2 border-transparent hover:border-gray-600"}`}>
                  <WorkoutIcon name={p.icon} className="h-5 w-5 text-brand-300" />
                  <p className="text-white font-medium mt-1 text-xs">{p.label}</p>
                </button>
              ))}
            </div>
            <input type="text" value={yogaGoalText} onChange={(e) => setYogaGoalText(e.target.value)} placeholder="Or type your own goal..." className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-brand-500 focus:outline-none" />
          </div>

          <div>
            <p className="text-white font-bold mb-2">Session length</p>
            <p className="text-gray-400 text-xs mb-3">How long would you like each yoga session?</p>
            <div className="flex gap-2">
              {[10, 20, 30, 45, 60].map((min) => (
                <button key={min} onClick={() => setYogaDuration(min)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${yogaDuration === min ? "bg-brand-500 text-white" : "glass text-gray-300"}`}>
                  {min}m
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerateYoga} disabled={!yogaGoalText.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${yogaGoalText.trim() ? "bg-purple-500 text-white hover:bg-purple-600" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}>
            Generate Yoga Routine
          </button>
        </div>
      )}

      {/* Calisthenics Skill Pick */}
      {view === "pick" && workoutType === "calisthenics" && (
        <>
          <p className="text-gray-400 text-sm font-medium mb-1">Skills at your level</p>
          <p className="text-xs text-gray-500 mb-3 capitalize">Your profile: {profile?.overallLevel ?? "beginner"}</p>
          <div className="space-y-2 mb-4">{currentLevel.map(renderSkillButton)}</div>

          {archived.length > 0 && (
            <>
              <button type="button" onClick={() => setShowMore(!showMore)} className="w-full py-3 glass rounded-xl text-sm font-medium text-gray-300 hover:text-white mb-2 flex items-center justify-center gap-2">
                {showMore ? "Hide" : "Show"} other skill levels ({archived.length}) <span className="text-xs">{showMore ? "▲" : "▼"}</span>
              </button>
              {showMore && (
                <div className="space-y-2 mb-4">
                  {higherLevel.length > 0 && (
                    <>
                      <p className="text-xs text-brand-400 font-medium mb-2">Highly recommended next skills</p>
                      <div className="space-y-2 mb-3">{higherLevel.map(renderSkillButton)}</div>
                    </>
                  )}
                  {lowerLevel.length > 0 && (
                    <>
                      <p className="text-xs text-gray-500 font-medium mb-2"><WorkoutIcon name="target" className="mr-1 inline h-3 w-3" />Skills to revisit first</p>
                      <div className="space-y-2">{lowerLevel.map(renderSkillButton)}</div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          <div className="sticky bottom-20 z-40 pb-2">
            <button onClick={() => { if (selected.size > 0) setView("goal"); }} disabled={selected.size === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg ${selected.size > 0 ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}>
              {selected.size === 0 ? "Select skills" : "Next: Choose Goal →"}
            </button>
          </div>
        </>
      )}

      {/* Goal Selection */}
      {view === "goal" && (
        <>
          <p className="text-gray-400 text-sm mb-4">How should your plan be optimized?</p>
          <div className="space-y-3 mb-6">
            {goalOptions.map((g) => (
              <button key={g.value} onClick={() => setSelectedGoal(g.value)}
                className={`w-full p-4 rounded-2xl text-left flex items-center gap-4 border-2 ${selectedGoal === g.value ? "border-brand-500 bg-brand-500/10 glass" : "border-transparent glass hover:border-gray-600"}`}>
                <WorkoutIcon name={g.icon} className="h-6 w-6 text-brand-300" />
                <p className="text-white font-bold">{g.label}</p>
                {selectedGoal === g.value && <span className="ml-auto text-brand-400">✓</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-3 sticky bottom-20 z-40 pb-2">
            <button onClick={() => setView("pick")} className="px-6 py-4 bg-gray-800 text-gray-300 rounded-2xl font-bold">← Back</button>
            <button onClick={handleGenerateCalisthenics} className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600">Generate Plan</button>
          </div>
        </>
      )}
        </>
      )}
    </div>
  );
}
