'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Shared localStorage-backed state hook.
 *
 * Replaces the ad-hoc `localStorage.getItem`/`setItem` pairs that were
 * duplicated across ~10 games (DeepSeaReveal, Flagmaster, FoodWordHunt,
 * FruitWordHunt, PacMan, ShuttlecockSmash, UnicornRun, GrammarHoopSlam,
 * WordFusion, WordMatch). Values are JSON-encoded, so plain numbers,
 * strings, arrays, and objects all work the same way previously-stored
 * plain values (e.g. "42") still parse correctly with JSON.parse.
 *
 * Usage:
 *   const [best, setBest] = useStorage('pacman-high-score', 0);
 *   const [unlocked, setUnlocked] = useStorage('word-fusion-v1', []);
 */
export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  // Read from localStorage once on mount (client-side only, SSR-safe).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw));
      }
    } catch {
      // Corrupt or missing data — fall back to defaultValue silently.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // localStorage unavailable (private mode, quota, etc) — ignore.
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue];
}
