"use client";

import { useWorkout } from "@/context/WorkoutContext";
import { getExerciseById } from "@/data/exercises";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageBackground from "@/components/PageBackground";
import { getRandomQuote } from "@/data/quotes";
import ExerciseGifIcon from "@/components/ExerciseGifIcon";
import { Equipment } from "@/lib/types";

const equipmentOptions: { id: Equipment; label: string; icon: string; description: string }[] = [
  { id: "calisthenics", label: "Bodyweight Only", icon: "🏃", description: "Push-ups, squats, planks, handstands" },
  { id: "pull-up-bar", label: "Pull-Up Bar", icon: "🍌", description: "Includes standard bar exercises" },
  { id: "parallettes", label: "Parallettes", icon: "║", description: "Parallel bars for L-sits and dips" },
  { id: "rings", label: "Gymnastic Rings", icon: "🔴", description: "Ring push-ups, muscle-ups, levers" },
  { id: "wall", label: "Wall Space", icon: "🧱", description: "Handstands, wall-assisted exercises" },
  { id: "weights", label: "Dumbbells/Weights", icon: "⚖️", description: "Weighted variations" },
];

export default function Home() {
  const router = useRouter();
  const { stats, recentPRs, savedPlans, profile, setProfile } = useWorkout();
  const activePlan = savedPlans.length > 0 ? savedPlans[0] : null;
  const [quote, setQuote] = useState("");
  const [showEquipmentEditor, setShowEquipmentEditor] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<Equipment>>(
    new Set(profile?.userEquipment || ["calisthenics"])
  );

  useEffect(() => { setQuote(getRandomQuote()); }, []);

  useEffect(() => {
    if (profile === null && typeof window !== "undefined") {
      const stored = localStorage.getItem("calisthenics_profile");
      if (!stored) router.push("/onboarding");
    }
  }, [profile, router]);

  const toggleEquipment = (eq: Equipment) => {
    setSelectedEquipment((prev) => {
      const next = new Set(prev);
      if (next.has(eq)) next.delete(eq);
      else next.add(eq);
      // Always include calisthenics
      next.add("calisthenics");
      return next;
    });
  };

  const saveEquipment = () => {
    if (profile) {
      setProfile({ ...profile, userEquipment: Array.from(selectedEquipment) });
      setShowEquipmentEditor(false);
    }
  };
  // quote is set via useEffect above

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <PageBackground variant="home" />
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 border border-emerald-400/30 animate-pulse-glow">
        <div className="absolute inset-0 shimmer-bg" />
        <div className="relative p-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/40">
              💪
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">CaliTrack</h1>
              <p className="text-cyan-300 text-xs font-medium">Master your bodyweight</p>
            </div>
          </div>
          <p className="text-white/80 text-sm italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="glass-card p-4 text-center animate-count-up">
          <p className="text-3xl font-black text-emerald-400">{stats.totalWorkouts}</p>
          <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-1">Workouts</p>
        </div>
        <div className="glass-card p-4 text-center animate-count-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-3xl font-black text-orange-400">{stats.currentStreak}</p>
          <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-1">Streak 🔥</p>
        </div>
        <div className="glass-card p-4 text-center animate-count-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-3xl font-black text-purple-400">{recentPRs.length}</p>
          <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider mt-1">Records</p>
        </div>
      </div>

      {/* My Equipment Section */}
      <div className="mb-6 glass-card p-4 border-cyan-400/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="font-bold text-white text-sm">My Equipment</h3>
          </div>
          <button
            onClick={() => setShowEquipmentEditor(!showEquipmentEditor)}
            className="text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full hover:bg-cyan-500/30 transition-colors"
          >
            {showEquipmentEditor ? "Close" : "Edit"}
          </button>
        </div>

        {!showEquipmentEditor && (
          <div className="flex flex-wrap gap-2">
            {selectedEquipment.size === 0 ? (
              <p className="text-xs text-white/60">No equipment selected</p>
            ) : (
              Array.from(selectedEquipment)
                .filter((eq) => eq !== "calisthenics" || selectedEquipment.size === 1)
                .map((eq) => {
                  const opt = equipmentOptions.find((o) => o.id === eq);
                  return (
                    <span
                      key={eq}
                      className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      {opt?.icon} {opt?.label}
                    </span>
                  );
                })
            )}
          </div>
        )}

        {showEquipmentEditor && (
          <div className="mt-4 space-y-2">
            {equipmentOptions.map((eq) => {
              const isSelected = selectedEquipment.has(eq.id);
              const isRequired = eq.id === "calisthenics";
              return (
                <button
                  key={eq.id}
                  onClick={() => toggleEquipment(eq.id)}
                  disabled={isRequired}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-400/10 glass-card"
                      : "border-white/10 bg-white/5 glass hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{eq.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{eq.label}</p>
                      <p className="text-xs text-white/60">{eq.description}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "border-emerald-400 bg-emerald-400" : "border-white/30"
                      }`}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M3 7L6 10L11 4"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            <button
              onClick={saveEquipment}
              className="w-full py-2 mt-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm"
            >
              ✓ Save Equipment
            </button>
          </div>
        )}
      </div>

      {/* Quick Action Card */}
      {activePlan ? (
        <Link href={`/workouts/plan?id=${activePlan.id}`} className="block mb-8 group">
          <div className="glass-card relative overflow-hidden hover:bg-white/8 hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-transparent to-cyan-400/5" />
            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Active Plan</span>
              </div>
              <h2 className="font-extrabold text-white text-xl mb-1">{activePlan.name}</h2>
              <p className="text-white/60 text-sm">{activePlan.goal}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-emerald-400 text-sm font-bold group-hover:translate-x-1 transition-transform">Start today&apos;s workout</span>
                <span className="text-emerald-400 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <Link href="/workouts" className="block mb-8 group">
          <div className="glass-card relative overflow-hidden hover:bg-white/8 hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-purple-400/10" />
            <div className="relative p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-purple-400/20 flex items-center justify-center text-3xl animate-float">🎯</div>
              <p className="text-white font-extrabold text-lg mb-1">Build Your First Plan</p>
              <p className="text-white/60 text-sm">Pick skills → get a progression-based 7-day program</p>
            </div>
          </div>
        </Link>
      )}

      {/* Motivation Banner */}
      <div className="glass-card relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-purple-500/10" />
        <div className="relative p-5 flex items-center gap-4">
          <div className="text-4xl animate-float" style={{ animationDelay: "0.5s" }}>🔥</div>
          <div>
            <p className="text-white font-bold text-sm">
              {stats.currentStreak > 0
                ? `${stats.currentStreak} day streak! Keep the momentum!`
                : "Start your streak today!"}
            </p>
            <p className="text-white/60 text-xs mt-0.5">
              {stats.totalWorkouts === 0
                ? "Your calisthenics journey begins with one workout"
                : `${stats.totalWorkouts} workout${stats.totalWorkouts !== 1 ? "s" : ""} completed so far`}
            </p>
          </div>
        </div>
      </div>

      {/* Yoga Setup Prompt */}
      {profile && !profile.yogaSetUp && (
        <Link href="/yoga-setup" className="block mb-6 glass-card p-4 border-purple-400/30 hover:bg-purple-500/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧘</span>
            <div>
              <p className="text-white font-bold text-sm">Set Up Yoga & Flexibility</p>
              <p className="text-white/60 text-xs">Unlock yoga-based workouts and rest day recovery flows</p>
            </div>
            <span className="ml-auto text-white/60">→</span>
          </div>
        </Link>
      )}

      {/* Apple Watch Banner */}
      <div className="mb-6 glass-card p-4 flex items-center gap-3 border-white/20">
        <span className="text-2xl">⌚</span>
        <div>
          <p className="text-white font-bold text-sm">Apple Watch Integration</p>
          <p className="text-white/60 text-xs">Coming soon — auto-track reps, heart rate, and workout duration from your wrist.</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-extrabold text-white">Recent Records 🏆</h2>
          {recentPRs.length > 0 && <Link href="/progress" className="text-emerald-400 text-xs font-bold">View all →</Link>}
        </div>

        {recentPRs.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-white/50 text-sm">Complete workouts to set personal records</p>
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
                    <ExerciseGifIcon exerciseId={pr.exerciseId} size={32} showBorder={false} />
                    <div>
                      <p className="font-bold text-white text-sm">{ex.name}</p>
                      <p className="text-xs text-white/50">{new Date(pr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {pr.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-400">{pr.value}{pr.type === "hold" ? "s" : pr.type === "weight" ? "kg" : ""}</p>
                    {improved !== null && improved > 0 && <p className="text-xs text-emerald-400 font-bold">+{improved}</p>}
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
