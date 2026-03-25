"use client";

import { useEffect, useState } from "react";

interface CoachToastProps {
  visible: boolean;
  message: string;
  type?: "encouragement" | "form" | "rest" | "progress";
  duration?: number;
  onDismiss?: () => void;
}

const coachMessages = {
  encouragement: [
    "Progress can't always be seen in a month, but it can be felt. Your connective tissue is adapting.",
    "Consistency is kingdom. Your body remembers every rep.",
    "Every session gets you stronger, even when the numbers don't move.",
    "Trust the process. The gains are stacking up.",
  ],
  form: [
    "Form over ego—dropping a rep to maintain perfect form is a massive win.",
    "Perfect form builds perfect strength. Solid foundation first.",
    "Your nervous system is learning. Every controlled rep counts.",
  ],
  rest: [
    "Rest days are training days. Recovery is when the magic happens.",
    "Your muscles grow during rest, not during the workout.",
    "Active recovery today means strength gains tomorrow.",
  ],
  progress: [
    "Personal record! You're getting stronger.",
    "Nice! You're making progress consistently.",
    "That's solid work. Keep building on this.",
  ],
};

export default function CoachToast({
  visible,
  message,
  type = "encouragement",
  duration = 5000,
  onDismiss,
}: CoachToastProps) {
  const [isShowing, setIsShowing] = useState(visible);

  useEffect(() => {
    setIsShowing(visible);
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setIsShowing(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!isShowing) return null;

  const typeColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    encouragement: {
      bg: "bg-gradient-to-r from-brand-600/20 to-brand-500/20",
      border: "border-brand-500/40",
      text: "text-brand-200",
      icon: "💪",
    },
    form: {
      bg: "bg-gradient-to-r from-amber-600/20 to-orange-600/20",
      border: "border-amber-500/40",
      text: "text-amber-100",
      icon: "🎯",
    },
    rest: {
      bg: "bg-gradient-to-r from-purple-600/20 to-purple-500/20",
      border: "border-purple-500/40",
      text: "text-purple-100",
      icon: "😴",
    },
    progress: {
      bg: "bg-gradient-to-r from-emerald-600/20 to-green-600/20",
      border: "border-emerald-500/40",
      text: "text-emerald-100",
      icon: "🚀",
    },
  };

  const colors = typeColors[type];

  return (
    <div
      className={`fixed bottom-6 left-4 right-4 max-w-md mx-auto transform transition-all duration-300 ${
        isShowing ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`${colors.bg} border ${colors.border} rounded-2xl p-4 backdrop-blur-md shadow-2xl`}
      >
        <div className="flex gap-3">
          <div className="text-2xl flex-shrink-0">{colors.icon}</div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${colors.text} leading-relaxed`}>{message}</p>
          </div>
          <button
            onClick={() => {
              setIsShowing(false);
              onDismiss?.();
            }}
            className={`flex-shrink-0 text-xl hover:opacity-70 transition-opacity`}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export function useCoachToast() {
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "encouragement" | "form" | "rest" | "progress";
  }>({
    visible: false,
    message: "",
    type: "encouragement",
  });

  const show = (
    message: string,
    type: "encouragement" | "form" | "rest" | "progress" = "encouragement",
    duration?: number
  ) => {
    setToast({ visible: true, message, type });
  };

  const showRandom = (type: "encouragement" | "form" | "rest" | "progress" = "encouragement") => {
    const messages = coachMessages[type];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    show(randomMessage, type);
  };

  const dismiss = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return {
    toast,
    show,
    showRandom,
    dismiss,
    CoachToastComponent: (
      <CoachToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={dismiss}
      />
    ),
  };
}
