import { type WorldId } from './types';

const SAVE_KEY = 'block-fight-save-v1';
const WORLD_IDS: WorldId[] = ['village', 'forest', 'mines'];

export type SaveData = {
  unlocked: Record<WorldId, boolean>;
  score: number;
};

/** Some browsers (private/incognito mode, storage disabled by policy) expose `localStorage` but
 *  throw on first access — so we probe with a real read/write rather than just checking it exists. */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const probeKey = '__block_fight_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

/** Guards against a corrupted/hand-edited save carrying NaN, Infinity, a negative number, or a string. */
function isValidScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/** Reads saved progress from localStorage. Returns null if there's nothing saved, storage isn't
 *  usable, or the saved data doesn't match the shape we expect — a truncated write, hand-edited
 *  JSON, or an old/foreign save should never crash a run, just fall back to a fresh start. */
export function loadSave(): SaveData | null {
  if (!isStorageAvailable()) return null;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Unparseable JSON (partial write, hand-edited, truncated by a full disk) will fail forever
    // if left in place — wipe it so the next save starts clean instead of getting stuck.
    clearSave();
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const candidate = parsed as Partial<SaveData>;
  if (!candidate.unlocked || typeof candidate.unlocked !== 'object') return null;
  const rawUnlocked = candidate.unlocked as Record<string, unknown>;

  // Village and Forest are always available; only Mines (and any future gated world) is ever
  // locked behind a save. Every flag is coerced to a strict boolean so a corrupted or hand-edited
  // value (the string "true", 1, null, a missing key) can only ever come out as true or false.
  const unlocked = WORLD_IDS.reduce((acc, id) => {
    acc[id] = id === 'village' || id === 'forest' ? true : !!rawUnlocked[id];
    return acc;
  }, {} as Record<WorldId, boolean>);

  return {
    unlocked,
    score: isValidScore(candidate.score) ? candidate.score : 0,
  };
}

/** Writes current unlocks + score to localStorage. Best-effort — failures (private browsing,
 *  storage disabled, quota exceeded) are swallowed since saving is a nice-to-have, not worth
 *  crashing the run over. */
export function saveProgress(data: SaveData): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Likely a quota error, or storage went away mid-session — nothing to do but skip this save.
  }
}

/** Wipes any saved progress. Used internally to self-heal a corrupted save, and available as a
 *  hook for a future "reset progress" control. */
export function clearSave(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore — nothing meaningful to recover from here.
  }
}
