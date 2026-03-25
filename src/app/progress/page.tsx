"use client";

import { useState, useRef } from "react";
import PageBackground from "@/components/PageBackground";
import ProgressRing from "@/components/ProgressRing";
import Sparkline from "@/components/Sparkline";
import Badge from "@/components/Badge";
import RankDisplay from "@/components/RankDisplay";
import ExerciseGifIcon from "@/components/ExerciseGifIcon";
import { ArrowUpIcon, PhotoIcon, TrophyIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useWorkout } from "@/context/WorkoutContext";
import {
  mockProgressData,
  achievements,
  formatGrowthDelta,
  calculateProgressPercentage,
  type ProgressData,
} from "@/lib/progressHelpers";

export default function ProgressPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { profile } = useWorkout();
  const [photos, setPhotos] = useState<Array<{ id: string; date: string; dataUrl: string; note: string }>>([]);
  const [photoNote, setPhotoNote] = useState("");
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [tab, setTab] = useState<"prs" | "ranks" | "photos" | "achievements">("prs");

  // Use stable mock data instead of random data
  const repPRs = mockProgressData.filter((p) => p.type === "reps");
  const holdPRs = mockProgressData.filter((p) => p.type === "hold");

  // Default ranks for new users
  const userRanks = profile?.ranks || { push: "F", pull: "F", core: "F", legs: "F" };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotos([
        ...photos,
        {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          dataUrl: reader.result as string,
          note: photoNote,
        },
      ]);
      setPhotoNote("");
      setShowPhotoForm(false);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const ProgressCard = ({ data }: { data: ProgressData }) => {
    const delta = data.current - data.previous;
    const deltaFormatted = formatGrowthDelta(delta);
    const percentage = calculateProgressPercentage(data.current, data.goal);

    return (
      <div className="bg-gray-900/40 rounded-2xl p-4 border border-gray-800/60 hover:border-gray-700/80 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between gap-4">
          {/* Exercise Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <ExerciseGifIcon exerciseId={data.exerciseId} size={48} showBorder={true} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm sm:text-base whitespace-normal">{data.exerciseName}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Sparkline & Growth */}
            <div className="flex flex-col items-end gap-1">
              <Sparkline data={data.trend} width={100} height={24} />
              <span className={`text-xs font-semibold ${delta >= 0 ? "text-green-400" : "text-rose-400"}`}>
                {delta >= 0 ? "+" : ""}{deltaFormatted}
              </span>
            </div>

            {/* Progress Ring */}
            <ProgressRing
              progress={percentage}
              size={56}
              stroke={5}
              color={percentage >= 80 ? "#10b981" : percentage >= 50 ? "#3b82f6" : "#f97316"}
              trackColor="#1f2937"
            >
              <span className="text-xs font-bold text-white text-center">
                {data.current}
                <br />
                <span className="text-gray-400 text-[10px]">{data.type === "hold" ? "s" : ""}</span>
              </span>
            </ProgressRing>
          </div>
        </div>

        {/* Progress Bar Info */}
        <div className="mt-3 text-xs text-gray-400">
          {data.current} / {data.goal} {data.type === "hold" ? "seconds" : "reps"} ({Math.round(percentage)}%)
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-20">
      <PageBackground variant="progress" />
      <h1 className="text-4xl font-bold text-white mb-2">Progress</h1>
      <p className="text-gray-400 mb-8">Track your personal records & achievements</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { id: "prs", label: "Records", icon: TrophyIcon },
          { id: "ranks", label: "Ranks", icon: null },
          { id: "achievements", label: "Achievements", icon: ClockIcon },
          { id: "photos", label: "Photos", icon: PhotoIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              tab === id
                ? "bg-gradient-to-r from-brand-500 to-indigo-500 text-white shadow-lg"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {Icon ? (
              <Icon className="w-4 h-4" />
            ) : (
              <span className="text-lg">⚔️</span>
            )}
            {label}
          </button>
        ))}
      </div>

      {/* Personal Records Tab */}
      {tab === "prs" && (
        <div className="space-y-8">
          {repPRs.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ArrowUpIcon className="w-5 h-5 text-green-400" />
                Max Reps
              </h2>
              <div className="space-y-3">{repPRs.map((data) => <ProgressCard key={data.exerciseId} data={data} />)}</div>
            </section>
          )}

          {holdPRs.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-400" />
                Max Holds
              </h2>
              <div className="space-y-3">{holdPRs.map((data) => <ProgressCard key={data.exerciseId} data={data} />)}</div>
            </section>
          )}

          {mockProgressData.length === 0 && (
            <div className="text-center py-12 bg-gray-800/20 rounded-2xl border border-gray-700/50">
              <TrophyIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No personal records yet</p>
              <p className="text-sm text-gray-500">Complete workouts to start tracking progress</p>
            </div>
          )}
        </div>
      )}

      {/* Ranks Tab */}
      {tab === "ranks" && (
        <section className="space-y-6">
          <div className="bg-gray-900/40 rounded-2xl p-6 border border-gray-800/60">
            <h2 className="text-xl font-bold text-white mb-6">RPG Rank System</h2>
            <p className="text-gray-400 text-sm mb-6">
              Track your progress across 4 movement planes. Complete more workouts in each category to level up!
            </p>
            <RankDisplay ranks={userRanks} size="lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg p-4 border border-white/10">
              <span className="font-bold text-white">F</span>
              <p className="text-gray-300 text-xs mt-1">0-2 avg reps</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 border border-white/10">
              <span className="font-bold text-white">E</span>
              <p className="text-gray-300 text-xs mt-1">2-4 avg reps</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg p-4 border border-white/10">
              <span className="font-bold text-white">D</span>
              <p className="text-gray-300 text-xs mt-1">4-6 avg reps</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 border border-white/10">
              <span className="font-bold text-white">C</span>
              <p className="text-gray-300 text-xs mt-1">6-8 avg reps</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4 border border-white/10">
              <span className="font-bold text-white">B</span>
              <p className="text-gray-300 text-xs mt-1">8-10 avg reps</p>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4 border border-white/10 shadow-lg shadow-orange-500/30">
              <span className="font-bold text-white">A</span>
              <p className="text-gray-300 text-xs mt-1">10-12 avg reps</p>
            </div>
            <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg p-4 border border-white/10 shadow-lg shadow-rose-500/30 sm:col-span-2">
              <span className="font-bold text-white">S</span>
              <p className="text-gray-300 text-xs mt-1">12+ avg reps (Elite)</p>
            </div>
          </div>
        </section>
      )}

      {/* Achievements Tab */}
      {tab === "achievements" && (
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-6">Milestones & Badges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Badge
                key={achievement.id}
                title={achievement.title}
                subtitle={achievement.description}
                unlocked={achievement.unlocked}
                emoji={achievement.emoji}
              />
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <h3 className="text-white font-semibold mb-2">💡 Next Milestone</h3>
            <p className="text-gray-300 text-sm">
              Keep pushing! You&apos;re close to unlocking <span className="font-bold">Quadzilla</span> &mdash; just need 72 more squats!
            </p>
          </div>
        </section>
      )}

      {/* Photos Tab */}
      {tab === "photos" && (
        <section className="space-y-6">
          <button
            onClick={() => setShowPhotoForm(!showPhotoForm)}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-indigo-500 text-white rounded-2xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
          >
            <PhotoIcon className="w-5 h-5" />
            Add Progress Photo
          </button>

          {showPhotoForm && (
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 space-y-4">
              <input
                type="text"
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
                placeholder="Add a note (e.g. Week 4, front pose)"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-brand-500 focus:outline-none"
              />
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-indigo-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                <PhotoIcon className="w-4 h-4 inline mr-2" />
                Take Photo / Choose from Gallery
              </button>
            </div>
          )}

          {photos.length === 0 && !showPhotoForm && (
            <div className="text-center py-12 bg-gray-800/20 rounded-2xl border border-gray-700/50">
              <PhotoIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No progress photos</p>
              <p className="text-sm text-gray-500">Track your physical transformation over time</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.dataUrl} alt={photo.note || "Progress photo"} className="w-full aspect-[3/4] object-cover rounded-xl" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-xl">
                  <p className="text-white text-xs font-medium truncate">{photo.note || "No note"}</p>
                  <p className="text-gray-300 text-xs">{new Date(photo.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full text-gray-300 hover:text-red-400 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
