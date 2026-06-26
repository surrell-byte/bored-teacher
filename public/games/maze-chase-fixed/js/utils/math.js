// ═══════════════════════════════════════════════════════
//  MATH UTILITIES
// ═══════════════════════════════════════════════════════

/** Clamp n between lo and hi */
export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/** Manhattan distance between two grid cells */
export function manhattan(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

/** Return a random integer in [lo, hi) */
export function randInt(lo, hi) {
  return lo + Math.floor(Math.random() * (hi - lo));
}

/** Pick a random element from an array (returns undefined for empty array) */
export function randomPick(arr) {
  if (!arr.length) return undefined;
  return arr[randInt(0, arr.length)];
}

/**
 * Find the first open tile ('.' cell) spiralling outward from (cx, cy).
 * Returns {x, y}.
 */
export function findNearestOpen(map, cx, cy) {
  const rows = map.length;
  const cols = map[0].length;
  const maxR = Math.max(rows, cols);

  for (let r = 0; r < maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        // Only check the shell of the current radius
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const x = cx + dx, y = cy + dy;
        if (y >= 0 && y < rows && x >= 0 && x < cols && map[y][x] === '.') {
          return { x, y };
        }
      }
    }
  }
  return { x: 1, y: 1 }; // ultimate fallback
}
