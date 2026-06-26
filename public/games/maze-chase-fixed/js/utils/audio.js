// ═══════════════════════════════════════════════════════
//  SOUND ENGINE  (Web Audio — no external files needed)
// ═══════════════════════════════════════════════════════
import { getMuted, saveMuted } from './storage.js';

let audioCtx = null;
let _muted = getMuted();

// ── Internal helpers ────────────────────────────────────

function getAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Play a single synthesised tone.
 * @param {number}  freq     - frequency in Hz
 * @param {string}  type     - OscillatorType ('sine'|'square'|'sawtooth'|'triangle')
 * @param {number}  duration - seconds
 * @param {number}  vol      - peak gain (0–1)
 * @param {boolean} decay    - ramp gain to near-zero over duration
 */
function playTone(freq, type, duration, vol = 0.18, decay = true) {
  if (_muted) return;
  try {
    const ac   = getAudio();
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    if (decay) {
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    }
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (e) {
    // Silently ignore — AudioContext not available or suspended
  }
}

// ── Public SFX API ──────────────────────────────────────

export const SFX = {
  pellet:   () => playTone(880, 'square', 0.06, 0.10),

  powerUp:  () => {
    playTone(440, 'sawtooth', 0.15, 0.20);
    setTimeout(() => playTone(660, 'sawtooth', 0.15, 0.20), 100);
    setTimeout(() => playTone(880, 'sawtooth', 0.20, 0.25), 200);
  },

  bonus:    () => [523, 659, 784, 1047].forEach((f, i) =>
              setTimeout(() => playTone(f, 'triangle', 0.12, 0.22), i * 60)),

  die:      () => [400, 300, 200, 100].forEach((f, i) =>
              setTimeout(() => playTone(f, 'sawtooth', 0.18, 0.25), i * 80)),

  eatGhost: () => {
    playTone(200, 'sine', 0.08, 0.30);
    setTimeout(() => playTone(600, 'sine', 0.12, 0.15), 80);
  },

  bossHit:  () => {
    playTone(150, 'sawtooth', 0.12, 0.35);
    setTimeout(() => playTone(80, 'sawtooth', 0.18, 0.20), 100);
  },

  bossKill: () => [100, 200, 400, 800, 400, 200, 100].forEach((f, i) =>
              setTimeout(() => playTone(f, 'sawtooth', 0.10, 0.30), i * 60)),

  levelUp:  () => [523, 659, 784, 1047, 1318].forEach((f, i) =>
              setTimeout(() => playTone(f, 'triangle', 0.15, 0.28), i * 80)),

  gameOver: () => [300, 250, 200, 150, 100].forEach((f, i) =>
              setTimeout(() => playTone(f, 'sawtooth', 0.22, 0.30), i * 100)),
};

// ── Mute control ────────────────────────────────────────

export function isMuted() { return _muted; }

export function toggleMute() {
  _muted = !_muted;
  saveMuted(_muted);
  if (!_muted) {
    try { getAudio().resume(); } catch (e) {}
  }
  return _muted;
}

/** Call on first user gesture to unlock AudioContext on iOS/Safari */
export function unlockAudio() {
  try { getAudio().resume(); } catch (e) {}
}
