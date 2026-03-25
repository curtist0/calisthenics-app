"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkout } from "@/context/WorkoutContext";
import { Difficulty, UserProfile, SkillLevels, Equipment } from "@/lib/types";
import PageBackground from "@/components/PageBackground";

const assessmentQuestions = [
  // PUSH STRENGTH
  { id: "push-up", category: "push", name: "Push-Ups", question: "How many push-ups can you do in one set?",
    options: [{ label: "0–5", value: 0 }, { label: "6–15", value: 1 }, { label: "16–30", value: 2 }, { label: "30+", value: 3 }] },
  // PULL STRENGTH
  { id: "pull-up", category: "pull", name: "Pull-Ups", question: "How many pull-ups can you do?",
    options: [{ label: "0", value: 0 }, { label: "1–5", value: 1 }, { label: "6–12", value: 2 }, { label: "12+", value: 3 }] },
  // LEGS
  { id: "squat", category: "legs", name: "Squats", question: "How many squats can you do in one set?",
    options: [{ label: "0–10", value: 0 }, { label: "11–25", value: 1 }, { label: "26–50", value: 2 }, { label: "50+", value: 3 }] },
  // CORE
  { id: "plank", category: "core", name: "Plank Hold", question: "How long can you hold a plank?",
    options: [{ label: "< 15s", value: 0 }, { label: "15–30s", value: 1 }, { label: "30–60s", value: 2 }, { label: "60s+", value: 3 }] },
  // BALANCE
  { id: "balance", category: "balance", name: "Single-Leg Balance", question: "Can you stand on one leg with eyes closed for 15 seconds?",
    options: [{ label: "No — I wobble immediately", value: 0 }, { label: "A few seconds", value: 1 }, { label: "Yes, 15s each side", value: 2 }, { label: "Easily 30s+", value: 3 }] },
  // FLEXIBILITY
  { id: "flex", category: "flexibility", name: "Forward Fold", question: "Can you touch your toes standing?",
    options: [{ label: "No — not close", value: 0 }, { label: "Fingertips to shins", value: 1 }, { label: "Touch toes", value: 2 }, { label: "Palms flat on floor", value: 3 }] },
];

const equipmentOptions: { id: Equipment; label: string; icon: string; description: string }[] = [
  { id: "calisthenics", label: "Bodyweight Only", icon: "🏃", description: "Push-ups, squats, pull-ups on a bar" },
  { id: "pull-up-bar", label: "Pull-Up Bar", icon: "🍌", description: "Includes standard bar exercises" },
  { id: "parallettes", label: "Parallettes", icon: "║", description: "Parallel bars for L-sits and dips" },
  { id: "rings", label: "Gymnastic Rings", icon: "🔴", description: "Ring push-ups, muscle-ups, levers" },
  { id: "wall", label: "Wall Space", icon: "🧱", description: "Handstands, wall-assisted exercises" },
  { id: "weights", label: "Dumbbells/Weights", icon: "⚖️", description: "Weighted variations" },
];

type Phase = "assess" | "equipment" | "yoga-ask";

function scoreToLevel(score: number): Difficulty {
  if (score >= 3) return "advanced";
  if (score >= 2) return "intermediate";
  return "beginner";
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useWorkout();
  const [phase, setPhase] = useState<Phase>("assess");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedEquipment, setSelectedEquipment] = useState<Set<Equipment>>(new Set(["calisthenics"]));

  const totalSteps = assessmentQuestions.length + 2; // +2 for equipment and yoga
  const currentStep = phase === "assess" ? step + 1 : phase === "equipment" ? assessmentQuestions.length + 1 : totalSteps;
  const progress = (currentStep / totalSteps) * 100;

  const handleAnswer = (id: string, value: number) => {
    setAnswers((p) => ({ ...p, [id]: value }));
    if (step < assessmentQuestions.length - 1) setStep((s) => s + 1);
    else setPhase("equipment");
  };

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

  const finishEquipment = () => {
    setPhase("yoga-ask");
  };

  const finish = (wantsYoga: boolean) => {
    const catScores: Record<string, number> = {};
    for (const q of assessmentQuestions) {
      catScores[q.category] = answers[q.id] ?? 0;
    }

    const skillLevels: SkillLevels = {
      push: scoreToLevel(catScores["push"] ?? 0),
      pull: scoreToLevel(catScores["pull"] ?? 0),
      legs: scoreToLevel(catScores["legs"] ?? 0),
      core: scoreToLevel(catScores["core"] ?? 0),
      balance: scoreToLevel(catScores["balance"] ?? 0),
      flexibility: scoreToLevel(catScores["flexibility"] ?? 0),
    };

    const allScores = Object.values(catScores);
    const avgScore = allScores.reduce((s, v) => s + v, 0) / allScores.length;
    const overallLevel: Difficulty = avgScore >= 2.5 ? "advanced" : avgScore >= 1.5 ? "intermediate" : "beginner";

    const exerciseLevels = assessmentQuestions.filter((q) => q.category !== "balance" && q.category !== "flexibility").map((q) => ({
      exerciseId: q.id,
      level: scoreToLevel(answers[q.id] ?? 0),
      bestReps: q.id === "plank" ? 0 : ([3, 10, 25, 35][answers[q.id] ?? 0]),
      bestHold: q.id === "plank" ? ([10, 22, 45, 75][answers[q.id] ?? 0]) : 0,
      lastUpdated: new Date().toISOString(),
    }));

    const profile: UserProfile = {
      onboarded: true, overallLevel, skillLevels, exerciseLevels,
      trainingGoal: "balanced",
      userEquipment: Array.from(selectedEquipment),
      yogaSetUp: wantsYoga, yogaLevel: skillLevels.flexibility,
      createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    if (wantsYoga) router.push("/yoga-setup");
    else router.push("/");
  };

  const current = phase === "assess" && step < assessmentQuestions.length ? assessmentQuestions[step] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <PageBackground variant="home" />
      <div className="max-w-lg mx-auto px-4 pt-8 w-full flex-1 flex flex-col">
        <div className="mb-8">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Step {currentStep} of {totalSteps}</p>
        </div>

        {phase === "assess" && current && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-white mb-2">{current.name}</h2>
              <p className="text-gray-400">{current.question}</p>
            </div>
            <div className="space-y-3 flex-1">
              {current.options.map((opt) => (
                <button key={opt.label} onClick={() => handleAnswer(current.id, opt.value)} className="w-full p-5 glass rounded-2xl text-left hover:scale-[1.02] transition-all">
                  <span className="text-white font-bold text-lg">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "equipment" && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-2xl font-extrabold text-white mb-2">What Equipment Do You Have?</h2>
              <p className="text-gray-400 text-sm">Select all that apply. Bodyweight is always included.</p>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {equipmentOptions.map((eq) => {
                const isSelected = selectedEquipment.has(eq.id);
                const isRequired = eq.id === "calisthenics";
                return (
                  <button
                    key={eq.id}
                    onClick={() => toggleEquipment(eq.id)}
                    disabled={isRequired}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50"
                    } ${isRequired ? "opacity-100" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{eq.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{eq.label}</h3>
                        <p className="text-xs text-gray-400">{eq.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-brand-500 bg-brand-500" : "border-gray-600"}`}>
                        {isSelected && <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={finishEquipment}
              className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold mt-6 hover:bg-brand-600 transition-all"
            >
              Continue →
            </button>
          </div>
        )}

        {phase === "yoga-ask" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-6">🧘</div>
            <h2 className="text-2xl font-extrabold text-white mb-3">Set up Yoga & Flexibility?</h2>
            <p className="text-gray-400 mb-8 max-w-xs">Unlock yoga workouts and rest day recovery flows.</p>
            <div className="space-y-3 w-full max-w-xs">
              <button onClick={() => finish(true)} className="w-full py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600">Yes, set it up 🧘</button>
              <button onClick={() => finish(false)} className="w-full py-4 bg-gray-800 text-gray-300 rounded-2xl font-bold hover:bg-gray-700">Skip for now</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
