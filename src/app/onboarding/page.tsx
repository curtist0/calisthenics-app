"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkout } from "@/context/WorkoutContext";
import { Difficulty, TrainingGoal, UserProfile } from "@/lib/types";
import PageBackground from "@/components/PageBackground";

const calisAssessment = [
  { id: "push-up", name: "Push-Ups", question: "How many push-ups can you do?", options: [{ label: "0–5", value: 3 }, { label: "6–15", value: 10 }, { label: "16–30", value: 25 }, { label: "30+", value: 35 }] },
  { id: "pull-up", name: "Pull-Ups", question: "How many pull-ups can you do?", options: [{ label: "0", value: 0 }, { label: "1–5", value: 3 }, { label: "6–12", value: 9 }, { label: "12+", value: 15 }] },
  { id: "squat", name: "Squats", question: "How many squats in one set?", options: [{ label: "0–10", value: 5 }, { label: "11–25", value: 18 }, { label: "26–50", value: 38 }, { label: "50+", value: 55 }] },
  { id: "plank", name: "Plank", question: "How long can you hold a plank?", isHold: true, options: [{ label: "< 15s", value: 10 }, { label: "15–30s", value: 22 }, { label: "30–60s", value: 45 }, { label: "60s+", value: 75 }] },
];

const yogaAssessment = [
  { id: "forward-fold", name: "Touching Toes", question: "Can you touch your toes in a forward fold?", options: [{ label: "No", value: 0 }, { label: "Barely — fingertips", value: 1 }, { label: "Yes — palms flat", value: 2 }] },
  { id: "splits", name: "Splits Progress", question: "How close are you to doing the splits?", options: [{ label: "Not close at all", value: 0 }, { label: "Halfway down", value: 1 }, { label: "Almost there", value: 2 }, { label: "Full splits!", value: 3 }] },
];

const goals: { value: TrainingGoal; label: string; icon: string; desc: string }[] = [
  { value: "muscle", label: "Build Muscle", icon: "💪", desc: "Higher volume, moderate rest" },
  { value: "skills", label: "Master Skills", icon: "🤸", desc: "Technique focus, long rest" },
  { value: "weight-loss", label: "Lose Weight", icon: "🔥", desc: "High intensity, short rest" },
  { value: "endurance", label: "Endurance", icon: "🏃", desc: "High reps, minimal rest" },
  { value: "balanced", label: "Balanced", icon: "⚖️", desc: "Well-rounded mix" },
];

type Phase = "calis" | "yoga-ask" | "yoga-assess" | "goal" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useWorkout();
  const [phase, setPhase] = useState<Phase>("calis");
  const [calisStep, setCalisStep] = useState(0);
  const [yogaStep, setYogaStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [yogaAnswers, setYogaAnswers] = useState<Record<string, number>>({});
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal | null>(null);
  const [wantsYoga, setWantsYoga] = useState<boolean | null>(null);

  const handleCalisAnswer = (id: string, value: number) => {
    setAnswers((p) => ({ ...p, [id]: value }));
    if (calisStep < calisAssessment.length - 1) setCalisStep((s) => s + 1);
    else setPhase("yoga-ask");
  };

  const handleYogaAnswer = (id: string, value: number) => {
    setYogaAnswers((p) => ({ ...p, [id]: value }));
    if (yogaStep < yogaAssessment.length - 1) setYogaStep((s) => s + 1);
    else setPhase("goal");
  };

  const handleFinish = () => {
    if (!selectedGoal) return;
    const levels = calisAssessment.map((ex) => ({
      exerciseId: ex.id, level: (answers[ex.id] >= 25 ? "advanced" : answers[ex.id] >= 10 ? "intermediate" : "beginner") as Difficulty,
      bestReps: ex.isHold ? 0 : (answers[ex.id] || 0), bestHold: ex.isHold ? (answers[ex.id] || 0) : 0, lastUpdated: new Date().toISOString(),
    }));
    const avgLevel = levels.reduce((s, l) => s + (l.level === "advanced" ? 2 : l.level === "intermediate" ? 1 : 0), 0) / levels.length;
    const overallLevel: Difficulty = avgLevel >= 1.5 ? "advanced" : avgLevel >= 0.5 ? "intermediate" : "beginner";

    let yogaLevel: Difficulty = "beginner";
    if (wantsYoga) {
      const yogaScore = Object.values(yogaAnswers).reduce((s, v) => s + v, 0);
      yogaLevel = yogaScore >= 4 ? "advanced" : yogaScore >= 2 ? "intermediate" : "beginner";
    }

    const profile: UserProfile = {
      onboarded: true, overallLevel, exerciseLevels: levels, trainingGoal: selectedGoal,
      yogaSetUp: !!wantsYoga, yogaLevel, createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    router.push("/");
  };

  const currentCalis = calisStep < calisAssessment.length ? calisAssessment[calisStep] : null;
  const currentYoga = yogaStep < yogaAssessment.length ? yogaAssessment[yogaStep] : null;
  const totalSteps = calisAssessment.length + (wantsYoga ? yogaAssessment.length : 0) + 2;
  const currentStep = phase === "calis" ? calisStep + 1 : phase === "yoga-ask" ? calisAssessment.length + 1 : phase === "yoga-assess" ? calisAssessment.length + 1 + yogaStep : totalSteps;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <PageBackground variant="home" />
      <div className="max-w-lg mx-auto px-4 pt-8 w-full flex-1 flex flex-col">
        <div className="mb-8">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Calisthenics Assessment */}
        {phase === "calis" && currentCalis && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-white mb-2">{currentCalis.name}</h2>
              <p className="text-gray-400">{currentCalis.question}</p>
            </div>
            <div className="space-y-3 flex-1">
              {currentCalis.options.map((opt) => (
                <button key={opt.label} onClick={() => handleCalisAnswer(currentCalis.id, opt.value)} className="w-full p-5 glass rounded-2xl text-left hover:scale-[1.02] transition-all">
                  <span className="text-white font-bold text-lg">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Yoga Setup Ask */}
        {phase === "yoga-ask" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-6">🧘</div>
            <h2 className="text-2xl font-extrabold text-white mb-3">Want to set up Yoga & Flexibility?</h2>
            <p className="text-gray-400 mb-8 max-w-xs">We&apos;ll assess your flexibility and unlock yoga-based workouts and rest day flows.</p>
            <div className="space-y-3 w-full max-w-xs">
              <button onClick={() => { setWantsYoga(true); setPhase("yoga-assess"); }} className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600">Yes, set it up 🧘</button>
              <button onClick={() => { setWantsYoga(false); setPhase("goal"); }} className="w-full py-4 bg-gray-800 text-gray-300 rounded-2xl font-bold hover:bg-gray-700">Skip for now</button>
            </div>
          </div>
        )}

        {/* Yoga Assessment */}
        {phase === "yoga-assess" && currentYoga && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-8">
              <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-bold mb-3 inline-block">YOGA SETUP</span>
              <h2 className="text-2xl font-extrabold text-white mb-2">{currentYoga.name}</h2>
              <p className="text-gray-400">{currentYoga.question}</p>
            </div>
            <div className="space-y-3 flex-1">
              {currentYoga.options.map((opt) => (
                <button key={opt.label} onClick={() => handleYogaAnswer(currentYoga.id, opt.value)} className="w-full p-5 glass rounded-2xl text-left hover:scale-[1.02] transition-all">
                  <span className="text-white font-bold text-lg">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Goal Selection */}
        {phase === "goal" && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-white mb-2">What&apos;s Your Goal?</h2>
              <p className="text-gray-400">This shapes your workout structure</p>
            </div>
            <div className="space-y-3 flex-1">
              {goals.map((g) => (
                <button key={g.value} onClick={() => setSelectedGoal(g.value)} className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${selectedGoal === g.value ? "glass border-2 border-brand-500" : "glass border-2 border-transparent"}`}>
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <p className="text-white font-bold">{g.label}</p>
                    <p className="text-gray-400 text-xs">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleFinish} disabled={!selectedGoal} className={`w-full py-4 rounded-2xl font-bold text-lg mt-6 mb-4 ${selectedGoal ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}>
              Start Training 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
