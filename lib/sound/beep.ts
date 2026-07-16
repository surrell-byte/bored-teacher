/**
 * Shared Web Audio "beep" tone generator.
 *
 * Extracted from two nearly-identical `playBeep()` implementations that
 * were hand-rolled inside ColourClash.jsx and AnimalClassQuest.jsx.
 * Behavior is unchanged — same oscillator/gain ramp shape, same silent
 * failure if AudioContext is unavailable/blocked.
 */
export function playBeep(frequency: number, duration = 0.2, gain = 0.3) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gainNode.gain.value = gain;
    osc.start();
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), Math.max(500, duration * 1000 + 300));
  } catch {
    // Audio not supported/blocked — fail silently, matches prior behavior.
  }
}
