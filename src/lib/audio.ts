let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function playTimerBeep() {
  try {
    const ctx = getCtx();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.value = 0.3;
      const start = ctx.currentTime + i * 0.2;
      osc.start(start);
      osc.stop(start + 0.12);
    }
  } catch {
    // Audio not available
  }
  try {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
  } catch {
    // Vibrate not available
  }
}
