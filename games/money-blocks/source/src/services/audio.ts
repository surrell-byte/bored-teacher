export type SoundId = 'cash' | 'lose' | 'jackpot';

const SOURCES: Record<SoundId, string> = {
  cash: '/src/assets/sounds/cash.mp3',
  lose: '/src/assets/sounds/lose.mp3',
  jackpot: '/src/assets/sounds/jackpot.mp3',
};

const cache = new Map<SoundId, HTMLAudioElement>();

function getAudio(id: SoundId): HTMLAudioElement {
  let el = cache.get(id);
  if (!el) {
    el = new Audio(SOURCES[id]);
    cache.set(id, el);
  }
  return el;
}

/** Plays a sound effect, silently ignoring autoplay/load errors. */
export function playSound(id: SoundId): void {
  try {
    const el = getAudio(id);
    el.currentTime = 0;
    const p = el.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    // ignore — audio is non-critical
  }
}

