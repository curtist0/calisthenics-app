export function triggerHaptic(pattern: number | number[] = 35): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    return;
  }
}
