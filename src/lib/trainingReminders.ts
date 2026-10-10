import { TrainingReminder } from "./types";

export const DEFAULT_TRAINING_REMINDER: TrainingReminder = {
  enabled: false,
  time: "18:00",
  snoozedDate: null,
  lastSentDate: null,
};

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getNextReminderDelayMs(time: string, now: Date, skipToday = false): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) throw new Error("Choose a valid reminder time.");
  const next = new Date(now);
  next.setHours(Number(match[1]), Number(match[2]), 0, 0);
  if (skipToday || next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function isReminderSnoozedForToday(reminder: TrainingReminder, now: Date): boolean {
  return reminder.snoozedDate === getLocalDateKey(now);
}
