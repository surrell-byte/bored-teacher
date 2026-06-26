// ═══════════════════════════════════════════════════════
//  GAME STATE  (single source of truth)
// ═══════════════════════════════════════════════════════
import { getHighScore } from '../utils/storage.js';

// ── Session ─────────────────────────────────────────────
export const session = {
  score:       0,
  lives:       3,
  level:       1,
  highScore:   getHighScore(),
  gameRunning: false,
  frameCount:  0,
};

// ── Power mode ───────────────────────────────────────────
export const power = {
  active: false,
  timer:  0,
};

// ── Player ───────────────────────────────────────────────
export const player = {
  x:       1,
  y:       1,
  dirX:    0,
  dirY:    0,
  queueX:  0,
  queueY:  0,
  facing:  0,
  // mouth animation (used by drawPlayer)
  mouthAngle: 0,
  mouthDir:   1,
};

// ── Enemies ──────────────────────────────────────────────
export let enemies = [];
export function setEnemies(arr) { enemies = arr; }

// ── Boss ─────────────────────────────────────────────────
export const boss = {
  x:          18,
  y:          9,
  health:     10,
  maxHealth:  10,
  active:     false,
  flashTimer: 0,
};

// ── Map & collectibles ───────────────────────────────────
export let currentMap  = [];
export let pellets     = [];
export let pelletsLeft = 0;
export let powerUps    = [];
export let bonusItems  = [];

export function setCurrentMap(map)  { currentMap  = map;  }
export function setPellets(arr)     { pellets     = arr;  }
export function setPelletsLeft(n)   { pelletsLeft = n;    }
export function decrementPellets()  { pelletsLeft--;      }
export function setPowerUps(arr)    { powerUps    = arr;  }
export function setBonusItems(arr)  { bonusItems  = arr;  }
