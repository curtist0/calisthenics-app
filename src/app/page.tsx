"use client";

import { useWorkout } from "@/context/WorkoutContext";
import { getExerciseById } from "@/data/exercises";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageBackground from "@/components/PageBackground";
import WorkoutIcon from "@/components/WorkoutIcon";
import { getDailyQuote } from "@/data/quotes";
import { formatDisplayDate } from "@/lib/formatDate";
import { ACCENT_THEMES } from "@/lib/gamificationConfig";
import { isAccentThemeUnlocked } from "@/lib/gamification";
import { getDaysSinceLastWorkout, getHomeGreeting, getProgressionSuggestion, createWelcomeBackPlan } from "@/lib/homePersonalization";
import { dismissSuggestion, generateId, getDismissedSuggestions } from "@/lib/storage";
import { getLocalDateKey } from "@/lib/trainingReminders";

export default function Home() {
  const router = useRouter();
  const {
    isHydrated, stats, logs, recentPRs, personalRecords, savedPlans, profile, gamification, setAccentTheme, addPlan,
    trainingReminder, reminderError, setTrainingReminder,
  } = useWorkout();
  const activePlan = savedPlans.length > 0 ? savedPlans[0] : null;
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [reminderTime, setReminderTime] = useState(trainingReminder.time);
  const quote = getDailyQuote();
  const now = new Date();
  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const daysSinceLastWorkout = getDaysSinceLastWorkout(logs, now);
  const progressionSuggestion = getProgressionSuggestion(logs, savedPlans);
  const suggestionKey = progressionSuggestion ? `${progressionSuggestion.logId}:${progressionSuggestion.exerciseId}` : "";
  const showProgressionSuggestion = Boolean(progressionSuggestion && !dismissedSuggestions.includes(suggestionKey));
  const isWelcomeBack = Boolean(activePlan && daysSinceLastWorkout !== null && daysSinceLastWorkout >= 7);

  useEffect(() => {
    setDismissedSuggestions(getDismissedSuggestions());
  }, []);

  useEffect(() => {
    setReminderTime(trainingReminder.time);
  }, [trainingReminder.time]);

  useEffect(() => {
    if (isHydrated && profile === null && typeof window !== "undefined") {
      const stored = localStorage.getItem("calisthenics_profile");
      if (!stored) router.push("/onboarding");
    }
  }, [isHydrated, profile, router]);

  const startWelcomeBackSession = () => {
    if (!activePlan) return;
    const welcomePlan = createWelcomeBackPlan(activePlan, todayIndex, `welcome-${generateId()}`);
    addPlan(welcomePlan);
    router.push(`/workouts/plan?id=${encodeURIComponent(welcomePlan.id)}&day=${todayIndex}&start=1`);
  };

  const enableReminder = async () => {
    setNotificationMessage("");
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(reminderTime)) {
      setNotificationMessage("Choose a valid reminder time first.");
      return;
    }
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationMessage("This browser does not support notifications.");
      return;
    }
    if (Notification.permission === "denied") {
      setNotificationMessage("Notifications are blocked in browser settings. Allow them there before opting in.");
      return;
    }
    setIsRequestingPermission(true);
    try {
      const permission = Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();
      if (permission !== "granted") {
        setNotificationMessage("Notifications were not enabled. You can opt in later.");
        return;
      }
      setTrainingReminder({ ...trainingReminder, time: reminderTime, enabled: true, snoozedDate: null });
      setNotificationMessage("Daily reminder enabled.");
    } catch (error) {
      setNotificationMessage(error instanceof Error ? error.message : "Unable to enable notifications.");
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const dismissProgressionSuggestion = () => {
    if (!progressionSuggestion) return;
    const id = `${progressionSuggestion.logId}:${progressionSuggestion.exerciseId}`;
    dismissSuggestion(id);
    setDismissedSuggestions((current) => current.includes(id) ? current : [...current, id]);
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <PageBackground variant="home" />
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-brand-600/30 via-brand-800/20 to-gray-900 border border-brand-500/20 animate-pulse-glow">
        <div className="absolute inset-0 shimmer-bg" />
        <div className="relative p-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-gray-950 shadow-lg shadow-brand-500/25">
            <WorkoutIcon name="dumbbell" className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">CaliTrack</h1>
              <p className="text-brand-300 text-xs font-medium">Master your bodyweight</p>
            </div>
          </div>
          {quote.trim() && <p className="text-gray-300/90 text-sm italic leading-relaxed">&ldquo;{quote}&rdquo;</p>}
          <p className="mt-3 text-sm font-semibold leading-relaxed text-white" aria-live="polite">
            {getHomeGreeting(profile, activePlan, stats.currentStreak, now)}
          </p>
        </div>
      </div>

      {showProgressionSuggestion && progressionSuggestion && (
        <section aria-labelledby="progression-suggestion-heading" className="glass mb-6 rounded-2xl border border-brand-500/30 p-4">
          <div className="flex items-start gap-3">
            <WorkoutIcon name="target" className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-300" />
            <div className="min-w-0 flex-1">
              <h2 id="progression-suggestion-heading" className="font-extrabold text-white">Ready for the next step?</h2>
              <p className="mt-1 text-sm text-gray-300">
                You reached your {progressionSuggestion.currentName} target in every set. Consider trying {progressionSuggestion.nextName} next week.
              </p>
            </div>
          </div>
          <button type="button" onClick={dismissProgressionSuggestion} className="mt-3 min-h-11 rounded-xl px-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400">
            Dismiss suggestion
          </button>
        </section>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="glass rounded-2xl p-4 text-center animate-count-up">
          <p className="text-3xl font-black text-brand-400">{stats.totalWorkouts}</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Workouts</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center animate-count-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-3xl font-black text-orange-400">{stats.currentStreak}</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Streak</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center animate-count-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-3xl font-black text-purple-400">{personalRecords.length}</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Records</p>
        </div>
      </div>

      <section aria-label="Training rank and rewards" className="glass mb-6 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Training rank</p>
            <h2 className="mt-1 text-xl font-extrabold text-white">{gamification.rank}</h2>
          </div>
          <p className="rounded-full bg-brand-500/15 px-3 py-1 text-sm font-bold text-brand-300">{gamification.totalXp} XP</p>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex justify-between gap-3 text-xs text-gray-400">
            <span>{gamification.nextRank ? `${gamification.xpToNextRank} XP to ${gamification.nextRank}` : "Top rank reached"}</span>
            <span>{gamification.rankProgressPercent}%</span>
          </div>
          <div
            role="progressbar"
            aria-label={`Progress from ${gamification.rank}${gamification.nextRank ? ` toward ${gamification.nextRank}` : ""}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={gamification.rankProgressPercent}
            className="h-2 overflow-hidden rounded-full bg-gray-800"
          >
            <div className="h-full rounded-full bg-brand-400 transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${gamification.rankProgressPercent}%` }} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-300">
          <WorkoutIcon name="calendar" className="h-4 w-4 text-brand-300" />
          <span>Forgiving streak · {gamification.currentStreak} planned days</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-800 px-2 py-1 text-xs" aria-label={`${gamification.freezesHeld} streak freezes held`}>
            <WorkoutIcon name="lock" className="h-3 w-3" /> {gamification.freezesHeld}
          </span>
        </div>
        <p className="mt-1 pl-6 text-xs text-gray-500">Rest days do not interrupt your streak. Freezes cover a missed planned day.</p>
      </section>

      <section aria-labelledby="accent-themes-heading" className="glass mb-6 rounded-2xl p-4">
        <h2 id="accent-themes-heading" className="font-extrabold text-white">Accent themes</h2>
        <p className="mt-1 text-xs text-gray-400">Unlock palettes as your training rank grows.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {ACCENT_THEMES.map((theme) => {
            const unlocked = isAccentThemeUnlocked(theme.id, gamification.totalXp);
            const selected = gamification.accentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                disabled={!unlocked}
                aria-pressed={selected}
                aria-label={`${theme.name}${unlocked ? selected ? ", selected" : ", unlocked" : `, unlock at ${theme.unlockXp} XP`}`}
                onClick={() => setAccentTheme(theme.id)}
                className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 text-left text-xs font-semibold transition-colors duration-200 motion-reduce:transition-none ${
                  selected ? "border-brand-400 bg-brand-500/10 text-white" : unlocked ? "border-gray-700 text-gray-200 hover:bg-gray-800" : "cursor-not-allowed border-gray-800 text-gray-500"
                }`}
              >
                <span aria-hidden="true" className="h-4 w-4 flex-shrink-0 rounded-full" style={{ backgroundColor: `rgb(${theme.rgb})` }} />
                <span className="min-w-0">
                  <span className="block truncate">{theme.name}</span>
                  {!unlocked && <span className="block font-normal">Unlock at {theme.unlockXp} XP</span>}
                </span>
                {selected && <WorkoutIcon name="check" className="ml-auto h-4 w-4 flex-shrink-0 text-brand-300" />}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="weekly-challenge-heading" className="glass mb-8 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <WorkoutIcon name="target" className="h-5 w-5 text-brand-300" />
          <h2 id="weekly-challenge-heading" className="font-extrabold text-white">Weekly challenge</h2>
        </div>
        {gamification.weeklyChallenge ? (
          <>
            <p className="mt-2 text-sm text-gray-200">
              {gamification.weeklyChallenge.metric === "reps" ? "Complete" : "Hold for"}{" "}
              <strong>{gamification.weeklyChallenge.target}{gamification.weeklyChallenge.metric === "reps" ? " reps" : " seconds"}</strong>{" "}
              of {getExerciseById(gamification.weeklyChallenge.exerciseId)?.name ?? "your exercise"} this week.
            </p>
            <div
              role="progressbar"
              aria-label="Weekly challenge progress"
              aria-valuemin={0}
              aria-valuemax={gamification.weeklyChallenge.target}
              aria-valuenow={Math.min(gamification.weeklyChallenge.progress, gamification.weeklyChallenge.target)}
              className="mt-3 h-2 overflow-hidden rounded-full bg-gray-800"
            >
              <div className="h-full rounded-full bg-brand-400 transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${Math.min(100, gamification.weeklyChallenge.progress / gamification.weeklyChallenge.target * 100)}%` }} />
            </div>
            {gamification.weeklyChallenge.progress >= gamification.weeklyChallenge.target ? (
              <p role="status" className="mt-2 flex items-center gap-2 text-xs font-bold text-brand-300">
                <WorkoutIcon name="spark" className="h-4 w-4" /> Challenge complete — nice work.
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-400">
                {gamification.weeklyChallenge.progress} / {gamification.weeklyChallenge.target} {gamification.weeklyChallenge.metric === "reps" ? "reps" : "seconds"}
              </p>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-400">Complete a workout to generate a challenge from your recent training.</p>
        )}
      </section>

      <section aria-labelledby="training-reminder-heading" className="glass mb-8 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <WorkoutIcon name="calendar" className="h-5 w-5 text-brand-300" />
          <h2 id="training-reminder-heading" className="font-extrabold text-white">Training reminder</h2>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Optional browser notification. It can only fire while CaliTrack is open in this browser; there is no push service or background delivery.
        </p>
        <label htmlFor="training-reminder-time" className="mt-4 block text-sm font-semibold text-gray-200">Reminder time</label>
        <input
          id="training-reminder-time"
          type="time"
          value={reminderTime}
          onChange={(event) => {
            const time = event.target.value;
            setReminderTime(time);
            if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
              setTrainingReminder({ ...trainingReminder, time });
            }
          }}
          className="mt-2 min-h-12 w-full rounded-xl border border-gray-700 bg-gray-900 px-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400"
        />
        {trainingReminder.enabled ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTrainingReminder({ ...trainingReminder, enabled: false })}
              className="min-h-11 rounded-xl border border-gray-700 px-4 text-sm font-bold text-gray-200 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400"
            >
              Turn off
            </button>
            <button
              type="button"
              onClick={() => {
                setTrainingReminder({ ...trainingReminder, snoozedDate: getLocalDateKey(new Date()) });
                setNotificationMessage("Reminder snoozed for today.");
              }}
              className="min-h-11 rounded-xl border border-gray-700 px-4 text-sm font-bold text-gray-200 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400"
            >
              Not today
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isRequestingPermission}
            onClick={enableReminder}
            className="mt-3 min-h-12 w-full rounded-xl bg-brand-500 px-4 text-sm font-extrabold text-gray-950 hover:bg-brand-400 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
          >
            {isRequestingPermission ? "Waiting for permission…" : "Opt in to daily reminders"}
          </button>
        )}
        {(notificationMessage || reminderError) && (
          <p role={reminderError ? "alert" : "status"} className="mt-3 text-sm text-gray-300">
            {reminderError ?? notificationMessage}
          </p>
        )}
      </section>

      {/* Skill Level Display */}
      {profile?.skillLevels && (
        <div className="glass rounded-2xl p-4 mb-8">
          <h3 className="text-white font-bold text-sm mb-3">Your Skill Levels</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["push", "pull", "legs", "core", "balance", "flexibility"] as const).map((cat) => {
              const lvl = profile.skillLevels[cat];
              const colors: Record<string, string> = { beginner: "text-green-400", intermediate: "text-yellow-400", advanced: "text-red-400", elite: "text-fuchsia-400" };
              const icons: Record<string, "dumbbell" | "bar" | "target" | "yoga"> = { push: "dumbbell", pull: "bar", legs: "dumbbell", core: "target", balance: "target", flexibility: "yoga" };
              return (
                <div key={cat} className="text-center p-2 bg-gray-800/50 rounded-xl">
                  <WorkoutIcon name={icons[cat]} className="mx-auto h-5 w-5 text-brand-300" />
                  <p className="text-[10px] text-gray-400 uppercase font-bold mt-0.5">{cat}</p>
                  <p className={`text-xs font-bold capitalize ${colors[lvl]}`}>{lvl}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Action Card */}
      {isWelcomeBack && activePlan ? (
        <section aria-labelledby="welcome-back-heading" className="mb-8 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-5">
          <div className="flex items-start gap-3">
            <WorkoutIcon name="spark" className="mt-1 h-6 w-6 flex-shrink-0 text-brand-300" />
            <div>
              <h2 id="welcome-back-heading" className="text-lg font-extrabold text-white">Ease back in</h2>
              <p className="mt-1 text-sm text-gray-300">It has been a while. Start with a lighter session adapted from {activePlan.name}; your saved plan stays unchanged.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={startWelcomeBackSession}
            className="mt-4 min-h-14 w-full rounded-xl bg-brand-500 px-4 text-base font-extrabold text-gray-950 hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
          >
            Start a lighter session
          </button>
          <Link href={`/workouts/plan?id=${activePlan.id}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400">
            View my saved plan
          </Link>
        </section>
      ) : activePlan ? (
        <Link href={`/workouts/plan?id=${activePlan.id}`} className="block mb-8 group">
          <div className="relative rounded-2xl overflow-hidden glass hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-transparent to-brand-500/5" />
            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-brand-500/20 text-brand-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Active Plan</span>
              </div>
              <h2 className="font-extrabold text-white text-xl mb-1">{activePlan.name}</h2>
              <p className="text-gray-400 text-sm">{activePlan.goal}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-brand-400 text-sm font-bold group-hover:translate-x-1 transition-transform">Start today&apos;s workout</span>
                <span className="text-brand-400 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <Link href="/workouts" className="block mb-8 group">
          <div className="relative rounded-2xl overflow-hidden glass hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-purple-500/10" />
            <div className="relative p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20">
                <WorkoutIcon name="target" className="h-8 w-8 text-brand-300" />
              </div>
              <p className="text-white font-extrabold text-lg mb-1">Build Your First Plan</p>
              <p className="text-gray-400 text-sm">Pick skills → get a progression-based 7-day program</p>
            </div>
          </div>
        </Link>
      )}

      {/* Motivation Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 glass">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-purple-500/10" />
        <div className="relative p-5 flex items-center gap-4">
          <WorkoutIcon name="calendar" className="h-9 w-9 flex-shrink-0 text-brand-300" />
          <div>
            <p className="text-white font-bold text-sm">
              {stats.currentStreak > 0
                ? `${stats.currentStreak} day streak! Keep the momentum!`
                : "Start your streak today!"}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {stats.totalWorkouts === 0
                ? "Your calisthenics journey begins with one workout"
                : `${stats.totalWorkouts} workout${stats.totalWorkouts !== 1 ? "s" : ""} completed so far`}
            </p>
          </div>
        </div>
      </div>

      {/* Yoga Setup Prompt */}
      {profile && !profile.yogaSetUp && (
        <Link href="/yoga-setup" className="block mb-6 glass rounded-2xl p-4 border border-purple-500/30 hover:bg-purple-500/10 transition-colors">
          <div className="flex items-center gap-3">
            <WorkoutIcon name="yoga" className="h-7 w-7 flex-shrink-0 text-purple-300" />
            <div>
              <p className="text-white font-bold text-sm">Set Up Yoga & Flexibility</p>
              <p className="text-gray-400 text-xs">Unlock yoga-based workouts and rest day recovery flows</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </div>
        </Link>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-white"><WorkoutIcon name="trophy" className="h-5 w-5 text-brand-300" />Recent Records</h2>
          {recentPRs.length > 0 && <Link href="/progress" className="text-brand-400 text-xs font-bold">View all →</Link>}
        </div>

        {recentPRs.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-sm">Complete workouts to set personal records</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPRs.slice(0, 5).map((pr, i) => {
              const ex = getExerciseById(pr.exerciseId);
              if (!ex) return null;
              const improved = pr.previousValue !== null ? pr.value - pr.previousValue : null;
              return (
                <div key={`${pr.exerciseId}-${pr.type}-${i}`} className="glass rounded-xl p-3 flex items-center justify-between hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-3">
                    <WorkoutIcon name="dumbbell" className="h-5 w-5 text-brand-300" />
                    <div>
                      <p className="font-bold text-white text-sm">{ex.name}</p>
                      <p className="text-xs text-gray-500">{formatDisplayDate(pr.date)} · {pr.type === "weighted-reps" ? `weighted reps at ${pr.weightKg}kg` : pr.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-brand-400 whitespace-nowrap">{pr.value}{pr.type === "hold" ? "s" : pr.type === "weight" ? "kg" : pr.type === "weighted-reps" ? " reps" : ""}</p>
                    {improved !== null && improved > 0 && <p className="text-xs text-green-400 font-bold">+{improved}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
