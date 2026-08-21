/**
 * Shared Web Audio helpers.
 *
 * These keep sound state consistent across the app shell and game screens.
 */
const SOUND_KEY = 'boredTeacherSoundEnabled';

export function isSoundEnabled() {
  if (typeof window === 'undefined') return true;
  const value = window.localStorage.getItem(SOUND_KEY);
  return value === null ? true : value !== 'false';
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SOUND_KEY, String(enabled));
}

export function playBeep(frequency: number, duration = 0.2, gain = 0.3) {
  if (!isSoundEnabled() || typeof window === 'undefined') return;
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
