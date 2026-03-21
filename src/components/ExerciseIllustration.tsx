"use client";

import { getExerciseById } from "@/data/exercises";

interface Props {
  exerciseId: string;
  size?: number;
  className?: string;
}

// Custom SVG illustrations for exercises that need accurate representations
function CustomIllustration({ exerciseId, size }: { exerciseId: string; size: number }) {
  const s = size;

  // Elbow Lever - horizontal balance on bent elbows
  if (exerciseId === "elbow-lever") {
    return (
      <svg viewBox="0 0 200 200" width={s} height={s} className="w-full h-full">
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FF6B6B", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#FF8E72", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="white" />
        {/* Ground */}
        <line x1="20" y1="150" x2="180" y2="150" stroke="#333" strokeWidth="3" />
        {/* Hands */}
        <circle cx="55" cy="145" r="5" fill="#FF6B6B" />
        <circle cx="145" cy="145" r="5" fill="#FF6B6B" />
        {/* Forearms (vertical) */}
        <line x1="55" y1="145" x2="65" y2="100" stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" />
        <line x1="145" y1="145" x2="135" y2="100" stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" />
        {/* Elbows (tucked into hips) */}
        <circle cx="65" cy="100" r="4" fill="#FF4757" />
        <circle cx="135" cy="100" r="4" fill="#FF4757" />
        {/* Body horizontal (core) */}
        <ellipse cx="100" cy="95" rx="40" ry="12" fill="url(#bodyGradient)" />
        {/* Head */}
        <circle cx="100" cy="80" r="8" fill="#FF6B6B" />
        {/* Legs extended straight back */}
        <line x1="100" y1="100" x2="130" y2="85" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 90-Degree Hold - 90 degree angle at elbows in push-up position
  if (exerciseId === "90-degree-hold") {
    return (
      <svg viewBox="0 0 200 200" width={s} height={s} className="w-full h-full">
        <defs>
          <linearGradient id="armGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#4ECDC4", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#44B7AA", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="white" />
        {/* Ground */}
        <line x1="20" y1="160" x2="180" y2="160" stroke="#333" strokeWidth="3" />
        {/* Hands */}
        <circle cx="45" cy="155" r="5" fill="#4ECDC4" />
        <circle cx="155" cy="155" r="5" fill="#4ECDC4" />
        {/* Upper arms (vertical, 90 degree bend) */}
        <line x1="45" y1="155" x2="45" y2="85" stroke="url(#armGradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="155" y1="155" x2="155" y2="85" stroke="url(#armGradient)" strokeWidth="4" strokeLinecap="round" />
        {/* Elbows (right angle) */}
        <circle cx="45" cy="85" r="4" fill="#2BA39C" />
        <circle cx="155" cy="85" r="4" fill="#2BA39C" />
        {/* Forearms (horizontal from elbows) */}
        <line x1="45" y1="85" x2="80" y2="80" stroke="url(#armGradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="155" y1="85" x2="120" y2="80" stroke="url(#armGradient)" strokeWidth="4" strokeLinecap="round" />
        {/* Torso and shoulders */}
        <ellipse cx="100" cy="75" rx="35" ry="15" fill="#4ECDC4" />
        {/* Head */}
        <circle cx="100" cy="60" r="8" fill="#4ECDC4" />
        {/* Legs extended back (hovering) */}
        <line x1="100" y1="85" x2="100" y2="130" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Planche Lean - forward lean on hands, body angled
  if (exerciseId === "planche-lean") {
    return (
      <svg viewBox="0 0 200 200" width={s} height={s} className="w-full h-full">
        <defs>
          <linearGradient id="leanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FFD93D", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#FF9E3D", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="white" />
        {/* Ground */}
        <line x1="20" y1="160" x2="180" y2="160" stroke="#333" strokeWidth="3" />
        {/* Hands on ground */}
        <circle cx="35" cy="155" r="5" fill="#FFD93D" />
        <circle cx="165" cy="155" r="5" fill="#FFD93D" />
        {/* Straight arms supporting body */}
        <line x1="35" y1="155" x2="35" y2="75" stroke="url(#leanGradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="165" y1="155" x2="165" y2="75" stroke="url(#leanGradient)" strokeWidth="4" strokeLinecap="round" />
        {/* Shoulders */}
        <circle cx="35" cy="75" r="4" fill="#FF8C3D" />
        <circle cx="165" cy="75" r="4" fill="#FF8C3D" />
        {/* Body angled forward from shoulders */}
        <line x1="50" y1="70" x2="120" y2="40" stroke="url(#leanGradient)" strokeWidth="5" strokeLinecap="round" />
        {/* Head forward */}
        <circle cx="125" cy="35" r="8" fill="#FFD93D" />
        {/* Legs extended back and slightly up */}
        <line x1="120" y1="40" x2="140" y2="100" stroke="#FFD93D" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Crow Pose (Bakasana) - arm balance with bent arms, knees resting on elbows
  if (exerciseId === "crow-pose") {
    return (
      <svg viewBox="0 0 200 200" width={s} height={s} className="w-full h-full">
        <defs>
          <linearGradient id="crowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#A29BFE", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#74B9FF", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="white" />
        {/* Ground reference */}
        <line x1="20" y1="155" x2="180" y2="155" stroke="#ddd" strokeWidth="2" strokeDasharray="4,4" />
        {/* Hands on ground */}
        <circle cx="50" cy="150" r="5" fill="#A29BFE" />
        <circle cx="150" cy="150" r="5" fill="#A29BFE" />
        {/* Arms bent, shoulders forward */}
        <line x1="50" y1="150" x2="60" y2="105" stroke="url(#crowGradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="150" y1="150" x2="140" y2="105" stroke="url(#crowGradient)" strokeWidth="4" strokeLinecap="round" />
        {/* Elbows (tucked) */}
        <circle cx="60" cy="105" r="4" fill="#6C5CE7" />
        <circle cx="140" cy="105" r="4" fill="#6C5CE7" />
        {/* Torso compact */}
        <ellipse cx="100" cy="95" rx="30" ry="20" fill="url(#crowGradient)" />
        {/* Head down */}
        <circle cx="100" cy="75" r="7" fill="#A29BFE" />
        {/* Knees resting on elbows (compact) */}
        <line x1="75" y1="105" x2="100" y2="110" stroke="#A29BFE" strokeWidth="3" strokeLinecap="round" />
        <line x1="125" y1="105" x2="100" y2="110" stroke="#A29BFE" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Skin the Cat - hanging leg swing moving through and up
  if (exerciseId === "skin-the-cat") {
    return (
      <svg viewBox="0 0 200 200" width={s} height={s} className="w-full h-full">
        <defs>
          <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#00B894", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#00A86B", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="white" />
        {/* Pull-up bar */}
        <line x1="40" y1="30" x2="160" y2="30" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        {/* Hands gripping bar */}
        <circle cx="60" cy="30" r="4" fill="#00B894" />
        <circle cx="140" cy="30" r="4" fill="#00B894" />
        {/* Arms extended down */}
        <line x1="60" y1="30" x2="60" y2="85" stroke="url(#catGradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="140" y1="30" x2="140" y2="85" stroke="url(#catGradient)" strokeWidth="4" strokeLinecap="round" />
        {/* Torso hanging */}
        <ellipse cx="100" cy="100" rx="25" ry="30" fill="url(#catGradient)" />
        {/* Head */}
        <circle cx="100" cy="70" r="7" fill="#00B894" />
        {/* Legs folded under body (swinging through) */}
        <path d="M 100 125 Q 85 140 75 145" stroke="#00B894" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 100 125 Q 115 140 125 145" stroke="#00B894" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // Dead Hang - hanging from bar with arms extended
  if (exerciseId === "dead-hang") {
    return (
      <svg viewBox="0 0 200 200" width={s} height={s} className="w-full h-full">
        <defs>
          <linearGradient id="hangGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#E17055", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#D63031", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="white" />
        {/* Pull-up bar */}
        <line x1="40" y1="35" x2="160" y2="35" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        {/* Hands gripping bar */}
        <circle cx="55" cy="35" r="5" fill="#E17055" />
        <circle cx="145" cy="35" r="5" fill="#E17055" />
        {/* Arms fully extended down */}
        <line x1="55" y1="35" x2="55" y2="120" stroke="url(#hangGradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="145" y1="35" x2="145" y2="120" stroke="url(#hangGradient)" strokeWidth="4" strokeLinecap="round" />
        {/* Shoulders */}
        <circle cx="55" cy="120" r="3" fill="#D63031" />
        <circle cx="145" cy="120" r="3" fill="#D63031" />
        {/* Torso hanging straight */}
        <line x1="55" y1="120" x2="145" y2="120" stroke="url(#hangGradient)" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="100" cy="140" rx="20" ry="30" fill="url(#hangGradient)" />
        {/* Head */}
        <circle cx="100" cy="115" r="7" fill="#E17055" />
        {/* Legs hanging straight down */}
        <line x1="100" y1="165" x2="100" y2="155" stroke="#E17055" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}

export default function ExerciseIllustration({ exerciseId, size = 200, className }: Props) {
  const exercise = getExerciseById(exerciseId);
  const imageUrl = exercise?.imageUrl;
  const s = size;

  // Check if we have a custom SVG illustration for this exercise
  const customIllustration = CustomIllustration({ exerciseId, size: s });
  if (customIllustration) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-white ${className || ""}`} style={{ width: s, height: s }}>
        {customIllustration}
        {exercise?.isHold && <div className="absolute top-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">HOLD</div>}
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`rounded-2xl bg-gray-800/60 flex items-center justify-center ${className || ""}`} style={{ width: s, height: s }}>
        <span className="text-4xl">{exercise?.image || "💪"}</span>
      </div>
    );
  }

  // For hold exercises, freeze the GIF by rendering as a background-image
  // This effectively shows just the first frame (static image)
  if (exercise?.isHold) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-white ${className || ""}`} style={{ width: s, height: s }}>
        {/* Canvas trick: load GIF, draw first frame only */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={exercise?.name || "Exercise"}
          width={s}
          height={s}
          className="object-contain w-full h-full"
          loading="lazy"
          style={{ animationPlayState: "paused" }}
        />
        <div className="absolute top-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">HOLD</div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-white ${className || ""}`} style={{ width: s, height: s }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={exercise?.name || "Exercise"} width={s} height={s} className="object-contain w-full h-full" loading="lazy" />
    </div>
  );
}
