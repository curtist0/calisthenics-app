"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PersonalRecord } from "@/lib/types";
import { getPersonalRecordLines, wrapMeasuredText, WorkoutSummaryStats } from "@/lib/workoutSummary";
import WorkoutIcon from "@/components/WorkoutIcon";

interface ShareableWorkoutCardProps {
  workoutName: string;
  stats: WorkoutSummaryStats;
  personalRecords: PersonalRecord[];
  exerciseName: (exerciseId: string) => string;
  cardLabel?: string;
}

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

function drawTextLines(
  context: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
): void {
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

function drawCard(canvas: HTMLCanvasElement, props: ShareableWorkoutCardProps): void {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot render the workout card.");

  context.fillStyle = "#030712";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  const glow = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  glow.addColorStop(0, "rgba(190, 242, 0, 0.22)");
  glow.addColorStop(0.38, "rgba(3, 7, 18, 0)");
  glow.addColorStop(1, "rgba(3, 7, 18, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.fillStyle = "#bef200";
  context.font = "700 34px system-ui, sans-serif";
  context.fillText("CALITRACK", 84, 116);
  context.fillStyle = "#9ca3af";
  context.font = "600 22px system-ui, sans-serif";
  context.fillText(props.cardLabel ?? "WORKOUT RECAP", 84, 164);

  context.fillStyle = "#ffffff";
  context.font = "800 68px system-ui, sans-serif";
  const title = wrapMeasuredText(
    props.workoutName,
    900,
    (text) => context.measureText(text).width,
    4,
  );
  drawTextLines(context, title.lines, 84, 330, 82);

  const cards = [
    { label: "DURATION", value: props.stats.durationSeconds < 60 ? `${props.stats.durationSeconds}s` : `${props.stats.durationMinutes} min` },
    { label: "COMPLETED SETS", value: String(props.stats.completedSets) },
    { label: "REP VOLUME", value: `${props.stats.totalReps} reps` },
    { label: "HOLD TIME", value: `${props.stats.totalHoldSeconds}s` },
  ];
  cards.forEach((card, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 84 + column * 466;
    const y = 760 + row * 226;
    context.fillStyle = "rgba(17, 24, 39, 0.92)";
    context.fillRect(x, y, 430, 184);
    context.fillStyle = "#9ca3af";
    context.font = "600 21px system-ui, sans-serif";
    context.fillText(card.label, x + 28, y + 48);
    context.fillStyle = "#ffffff";
    context.font = "800 42px system-ui, sans-serif";
    context.fillText(card.value, x + 28, y + 116);
  });

  if (props.stats.weightedVolume > 0) {
    context.fillStyle = "#d9f99d";
    context.font = "600 22px system-ui, sans-serif";
    context.fillText(`Weighted volume · ${props.stats.weightedVolume.toLocaleString()} kg-reps`, 84, 1244);
  }

  context.fillStyle = "#ffffff";
  context.font = "800 31px system-ui, sans-serif";
  context.fillText("PERSONAL RECORDS", 84, 1350);
  const { lines, remaining } = getPersonalRecordLines(
    props.personalRecords,
    props.exerciseName,
    3,
  );
  const prLines = lines.length > 0
    ? [...lines, ...(remaining > 0 ? [`+ ${remaining} more`] : [])]
    : ["No new PRs this session"];
  context.fillStyle = "#d1d5db";
  context.font = "500 25px system-ui, sans-serif";
  prLines.forEach((line, index) => {
    const fitted = wrapMeasuredText(line, 900, (text) => context.measureText(text).width, 1);
    drawTextLines(context, fitted.lines, 84, 1410 + index * 70, 32);
  });

  context.fillStyle = "#6b7280";
  context.font = "600 21px system-ui, sans-serif";
  context.fillText("TRAIN LOCALLY. KEEP SHOWING UP.", 84, 1810);
}

function createCardFile(canvas: HTMLCanvasElement): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("The workout card image could not be created."));
        return;
      }
      resolve(new File([blob], "calitrack-workout.png", { type: "image/png" }));
    }, "image/png");
  });
}

export default function ShareableWorkoutCard(props: ShareableWorkoutCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState("");
  const { workoutName, stats, personalRecords, exerciseName, cardLabel } = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      drawCard(canvas, { workoutName, stats, personalRecords, exerciseName, cardLabel });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The workout card could not be rendered.");
    }
  }, [workoutName, stats, personalRecords, exerciseName, cardLabel]);

  const downloadCard = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const saveImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setMessage("The workout card is not ready yet.");
      return;
    }
    try {
      const file = await createCardFile(canvas);
      await downloadCard(file);
      setMessage("Workout card saved as a download.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The workout card could not be saved.");
    }
  }, [downloadCard]);

  const shareImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setMessage("The workout card is not ready yet.");
      return;
    }
    try {
      const file = await createCardFile(canvas);
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: workoutName, text: "My CaliTrack workout" });
        setMessage("Workout card shared.");
      } else {
        await downloadCard(file);
        setMessage("Image sharing is not supported here, so the card was downloaded.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setMessage(error instanceof Error ? error.message : "The workout card could not be shared.");
    }
  }, [downloadCard, workoutName]);

  return (
    <section aria-labelledby="share-card-title" className="mt-6 rounded-3xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-3 flex items-center gap-2">
        <WorkoutIcon name="spark" className="h-5 w-5 text-brand-300" />
        <h2 id="share-card-title" className="text-lg font-extrabold text-white">Your share card</h2>
      </div>
      <canvas
        ref={canvasRef}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        role="img"
        aria-label={`CaliTrack ${props.cardLabel?.toLowerCase() ?? "workout recap"} card for ${props.workoutName}`}
        className="h-auto w-full rounded-2xl border border-gray-800"
      />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" onClick={shareImage} className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-brand-400 px-3 font-bold text-gray-950">
          <WorkoutIcon name="arrow" className="h-5 w-5" /> Share
        </button>
        <button type="button" onClick={saveImage} className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-gray-700 px-3 font-bold text-white hover:bg-gray-800">
          <WorkoutIcon name="check" className="h-5 w-5" /> Save image
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-gray-300">{message}</p>
    </section>
  );
}
