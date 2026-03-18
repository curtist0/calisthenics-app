"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkout } from "@/context/WorkoutContext";
import { Difficulty, TrainingGoal, UserProfile } from "@/lib/types";
import PageBackground from "@/components/PageBackground";

const assessmentExercises = [
  { id: "push-up", name: "Push-Ups", question: "How many push-ups can you do in one set?", options: [{ label: "0–5", value: 3 }, { label: "6–15", value: 10 }, { label: "16–30", value: 25 }, { label: "30+", value: 35 }] },
  { id: "pull-up", name: "Pull-Ups", question: "How many pull-ups can you do?", options: [{ label: "0", value: 0 }, { label: "1–5", value: 3 }, { label: "6–12", value: 9 }, { label: "12+", value: 15 }] },
  { id: "squat", name: "Squats", question: "How many squats can you do in one set?", options: [{ label: "0–10", value: 5 }, { label: "11–25", value: 18 }, { label: "26–50", value: 38 }, { label: "50+", value: 55 }] },
  { id: "plank", name: "Plank Hold", question: "How long can you hold a plank?", isHold: true, options: [{ label: "< 15s", value: 10 }, { label: "15–30s", value: 22 }, { label: "30–60s", value: 45 }, { label: "60s+", value: 75 }] },
];

const goals: { value: TrainingGoal; label: string; icon: string; desc: string }[] = [
  { value: "muscle", label: "Build Muscle", icon: "💪", desc: "Hypertrophy-focused — higher volume, moderate rest" },
  { value: "skills", label: "Master Skills", icon: "🤸", desc: "Skill-focused — technique work with long rest" },
  { value: "weight-loss", label: "Lose Weight", icon: "🔥", desc: "High intensity — short rest, cardio elements" },
  { value: "endurance", label: "Build Endurance", icon: "🏃", desc: "High reps — minimal rest, conditioning" },
  { value: "balanced", label: "Balanced", icon: "⚖️", desc: "Well-rounded — mix of everything" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile } = useWorkout();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal | null>(null);

  const totalSteps = assessmentExercises.length + 1;
  const progress = ((step + 1) / (totalSteps + 1)) * 100;

  const handleAnswer = (exerciseId: string, value: number) => {
    setAnswers((p) => ({ ...p, [exerciseId]: value }));
    setStep((s) => s + 1);
  };

  const handleFinish = () => {
    if (!selectedGoal) return;
    const levels = assessmentExercises.map((ex) => ({
      exerciseId: ex.id,
      level: (answers[ex.id] >= 25 ? "advanced" : answers[ex.id] >= 10 ? "intermediate" : "beginner") as Difficulty,
      bestReps: ex.isHold ? 0 : (answers[ex.id] || 0),
      bestHold: ex.isHold ? (answers[ex.id] || 0) : 0,
      lastUpdated: new Date().toISOString(),
    }));

    const avgLevel = levels.reduce((s, l) => s + (l.level === "advanced" ? 2 : l.level === "intermediate" ? 1 : 0), 0) / levels.length;
    const overallLevel: Difficulty = avgLevel >= 1.5 ? "advanced" : avgLevel >= 0.5 ? "intermediate" : "beginner";

    const profile: UserProfile = {
      onboarded: true, overallLevel, exerciseLevels: levels,
      trainingGoal: selectedGoal, createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    router.push("/");
  };

  const currentExercise = step < assessmentExercises.length ? assessmentExercises[step] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <PageBackground variant="home" />
      <div className="max-w-lg mx-auto px-4 pt-8 w-full flex-1 flex flex-col">
        {/* Progress */}
        <div className="mb-8">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Step {step + 1} of {totalSteps + 1}</p>
        </div>

        {/* Welcome */}
        {step === 0 && !currentExercise && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-6 animate-float">💪</div>
            <h1 className="text-3xl font-extrabold text-white mb-3">Welcome to CaliTrack</h1>
            <p className="text-gray-400 mb-8 max-w-xs">Let&apos;s assess your current fitness level so we can personalize your experience.</p>
            <button onClick={() => setStep(0)} className="px-8 py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 transition-colors">
              Let&apos;s Go 🚀
            </button>
          </div>
        )}

        {/* Assessment Questions */}
        {currentExercise && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-white mb-2">{currentExercise.name}</h2>
              <p className="text-gray-400">{currentExercise.question}</p>
            </div>
            <div className="space-y-3 flex-1">
              {currentExercise.options.map((opt) => (
                <button key={opt.label} onClick={() => handleAnswer(currentExercise.id, opt.value)}
                  className="w-full p-5 glass rounded-2xl text-left hover:scale-[1.02] transition-all group">
                  <span className="text-white font-bold text-lg group-hover:text-brand-400 transition-colors">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Goal Selection */}
        {step >= assessmentExercises.length && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-white mb-2">What&apos;s Your Goal?</h2>
              <p className="text-gray-400">This shapes how your workouts are structured</p>
            </div>
            <div className="space-y-3 flex-1">
              {goals.map((g) => (
                <button key={g.value} onClick={() => setSelectedGoal(g.value)}
                  className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 ${
                    selectedGoal === g.value ? "glass border-2 border-brand-500 scale-[1.02]" : "glass hover:scale-[1.01]"
                  }`}>
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <p className="text-white font-bold">{g.label}</p>
                    <p className="text-gray-400 text-xs">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleFinish} disabled={!selectedGoal}
              className={`w-full py-4 rounded-2xl font-bold text-lg mt-6 mb-4 transition-all ${
                selectedGoal ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}>
              Start Training 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
