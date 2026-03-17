"use client";

import { useState, useRef } from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { getExerciseById } from "@/data/exercises";

export default function ProgressPage() {
  const { personalRecords, photos, addPhoto, removePhoto } = useWorkout();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoNote, setPhotoNote] = useState("");
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [tab, setTab] = useState<"prs" | "photos">("prs");

  const repPRs = personalRecords.filter((p) => p.type === "reps");
  const holdPRs = personalRecords.filter((p) => p.type === "hold");
  const weightPRs = personalRecords.filter((p) => p.type === "weight");

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addPhoto(reader.result as string, photoNote);
      setPhotoNote("");
      setShowPhotoForm(false);
    };
    reader.readAsDataURL(file);
  };

  const PRCard = ({ pr }: { pr: typeof personalRecords[0] }) => {
    const ex = getExerciseById(pr.exerciseId);
    if (!ex) return null;
    const improved = pr.previousValue !== null ? pr.value - pr.previousValue : null;
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{ex.image}</span>
            <div>
              <p className="font-semibold text-white text-sm">{ex.name}</p>
              <p className="text-xs text-gray-400">{new Date(pr.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-brand-400">
              {pr.value}{pr.type === "hold" ? "s" : pr.type === "weight" ? "kg" : ""}
            </p>
            <p className="text-xs text-gray-400">{pr.type === "hold" ? "hold" : pr.type === "weight" ? "weight" : "reps"}</p>
            {improved !== null && improved > 0 && (
              <p className="text-xs text-green-400 font-medium">↑ +{improved}{pr.type === "hold" ? "s" : pr.type === "weight" ? "kg" : ""}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      <h1 className="text-3xl font-bold text-white mb-1">Progress</h1>
      <p className="text-gray-400 mb-6">Your personal records & physical progress</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("prs")} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${tab === "prs" ? "bg-brand-500 text-white" : "bg-gray-800 text-gray-300"}`}>
          🏆 Personal Records
        </button>
        <button onClick={() => setTab("photos")} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${tab === "photos" ? "bg-brand-500 text-white" : "bg-gray-800 text-gray-300"}`}>
          📸 Body Progress
        </button>
      </div>

      {tab === "prs" && (
        <>
          {personalRecords.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-gray-300 font-semibold mb-1">No records yet</p>
              <p className="text-gray-500 text-sm">Complete workouts to start setting personal records</p>
            </div>
          ) : (
            <>
              {/* Rep PRs */}
              {repPRs.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">💪 Max Reps</h2>
                  <div className="space-y-2">{repPRs.map((pr) => <PRCard key={`${pr.exerciseId}-reps`} pr={pr} />)}</div>
                </div>
              )}

              {/* Hold PRs */}
              {holdPRs.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">⏱️ Max Holds</h2>
                  <div className="space-y-2">{holdPRs.map((pr) => <PRCard key={`${pr.exerciseId}-hold`} pr={pr} />)}</div>
                </div>
              )}

              {/* Weight PRs */}
              {weightPRs.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">🏋️ Max Weight</h2>
                  <div className="space-y-2">{weightPRs.map((pr) => <PRCard key={`${pr.exerciseId}-weight`} pr={pr} />)}</div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === "photos" && (
        <>
          <button onClick={() => setShowPhotoForm(!showPhotoForm)} className="w-full py-3 mb-4 bg-gray-800 text-gray-300 rounded-2xl font-medium hover:bg-gray-700 transition-colors border border-gray-700/50 border-dashed">
            {showPhotoForm ? "Cancel" : "📸 Add Progress Photo"}
          </button>

          {showPhotoForm && (
            <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 mb-6">
              <input type="text" value={photoNote} onChange={(e) => setPhotoNote(e.target.value)} placeholder="Add a note (e.g. Week 4, front pose)" className="w-full p-3 mb-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-brand-500 focus:outline-none" />
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors">
                📷 Take Photo / Choose from Gallery
              </button>
            </div>
          )}

          {photos.length === 0 && !showPhotoForm && (
            <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <p className="text-4xl mb-3">📸</p>
              <p className="text-gray-300 font-semibold mb-1">No progress photos</p>
              <p className="text-gray-500 text-sm">Track your physical transformation over time</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.dataUrl} alt={photo.note || "Progress photo"} className="w-full aspect-[3/4] object-cover rounded-xl" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 rounded-b-xl">
                  <p className="text-white text-xs font-medium truncate">{photo.note || "No note"}</p>
                  <p className="text-gray-400 text-xs">{new Date(photo.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
                <button onClick={() => removePhoto(photo.id)} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full text-gray-300 hover:text-red-400 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
