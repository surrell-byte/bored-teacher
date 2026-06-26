// All audio is generated with the Web Audio API — no sound files needed.
// This module owns its own AudioContext and mute flag so nothing else
// in the codebase needs to know how sound is produced.

let actx = null;
let muted = false;

function ensureAudio() {
  if (!actx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) actx = new Ctx();
  }
}

function tone(freq, dur, type, vol, delay) {
  if (muted || !actx) return;
  const t0 = actx.currentTime + (delay || 0);
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = type || "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol || 0.15, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(actx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** Call once on the first user gesture (e.g. Start button click) to unlock audio. */
export function initAudio() {
  ensureAudio();
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

/** Soft click while the die is spinning. */
export function playTick() {
  tone(180 + Math.random() * 220, 0.045, "square", 0.08);
}

/** Sharp double-blip when a rope is cut. */
export function playSnip() {
  tone(950, 0.07, "square", 0.18);
  setTimeout(() => tone(1300, 0.05, "square", 0.12), 55);
}

/** Low rumble for the splash when a player drops into the water. */
export function playSplash() {
  tone(110, 0.4, "sawtooth", 0.2);
  tone(70, 0.5, "sine", 0.16, 0.05);
}
