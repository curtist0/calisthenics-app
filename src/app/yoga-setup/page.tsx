"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkout } from "@/context/WorkoutContext";
import { Difficulty } from "@/lib/types";
import PageBackground from "@/components/PageBackground";

const yogaQuestions = [
  { id: "toes", name: "Touching Toes", question: "Can you touch your toes in a forward fold?", options: [{ label: "No — can't reach", value: 0 }, { label: "Fingertips only", value: 1 }, { label: "Yes — palms flat", value: 2 }] },
  { id: "splits", name: "Splits", question: "How close are you to the splits?", options: [{ label: "Not close at all", value: 0 }, { label: "Halfway down", value: 1 }, { label: "Almost there", value: 2 }, { label: "Full splits!", value: 3 }] },
  { id: "backbend", name: "Backbend", question: "Can you do a bridge / wheel pose?", options: [{ label: "No", value: 0 }, { label: "Basic bridge only", value: 1 }, { label: "Full wheel pose", value: 2 }] },
];

export default function YogaSetupPage() {
  const router = useRouter();
  const { profile, setProfile } = useWorkout();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const current = step < yogaQuestions.length ? yogaQuestions[step] : null;
  const progress = ((step + 1) / (yogaQuestions.length + 1)) * 100;

  const handleAnswer = (id: string, value: number) => {
    setAnswers((p) => ({ ...p, [id]: value }));
    if (step < yogaQuestions.length - 1) setStep((s) => s + 1);
    else finishSetup();
  };

  const finishSetup = () => {
    if (!profile) return;
    const score = Object.values({ ...answers, [yogaQuestions[yogaQuestions.length - 1].id]: Object.values(answers).slice(-1)[0] || 0 }).reduce((s, v) => s + v, 0);
    const yogaLevel: Difficulty = score >= 5 ? "advanced" : score >= 2 ? "intermediate" : "beginner";
    setProfile({ ...profile, yogaSetUp: true, yogaLevel });
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageBackground variant="progress" />
      <div className="max-w-lg mx-auto px-4 pt-8 w-full flex-1 flex flex-col">
        <div className="mb-8">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Yoga Setup — Step {step + 1} of {yogaQuestions.length}</p>
        </div>

        {current && (
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-8">
              <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-bold mb-3 inline-block">YOGA SETUP</span>
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
      </div>
    </div>
  );
}
