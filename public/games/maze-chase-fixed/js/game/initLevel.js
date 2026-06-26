// ═══════════════════════════════════════════════════════
//  LEVEL INITIALISATION
// ═══════════════════════════════════════════════════════
import { MAPS }       from '../../data/maps.js';
import { TILE, BOSS as BOSS_CFG } from '../utils/constants.js';
import {
  session, power, player, boss,
  setCurrentMap, setPellets, setPelletsLeft,
  setPowerUps, setBonusItems, setEnemies,
} from './state.js';
import { updateHUD } from '../render/drawUI.js';

let _canvas = null;
export function setCanvas(c) { _canvas = c; }

// ── Enemy progression ─────────────────────────────────
//  Level 1 → 2 enemies (both dumb)
//  Level 2 → 2 enemies (1 smart)
//  Level 3 → 3 enemies (2 smart)
//  Level 4 → 3 enemies (all smart)
//  Level 5+ → 3 enemies (all smart) + Boss
function buildEnemies(cols, rows, level) {
  const allSpawns = [
    { x: cols - 2, y: 1,                                      dirX: -1, dirY: 0 },
    { x: cols - 2, y: rows - 2,                               dirX: -1, dirY: 0 },
    { x: Math.floor(cols / 2), y: Math.floor(rows / 2) + 1,  dirX:  1, dirY: 0 },
  ];

  // How many enemies to spawn at this level
  const count = level === 1 ? 2 : 3;

  // How many of those are "smart" (chasing)
  const smartCount = level <= 1 ? 0 : level === 2 ? 1 : level === 3 ? 2 : 3;

  return allSpawns.slice(0, count).map((spawn, i) => ({
    ...spawn,
    smart: i < smartCount,
  }));
}

export function initLevel() {
  // ── Reset per-level state ─────────────────────────────
  session.frameCount = 0;
  power.active = false;
  power.timer  = 0;

  player.x = 1; player.y = 1;
  player.dirX = 0; player.dirY = 0;
  player.queueX = 0; player.queueY = 0;
  player.facing = 0;
  player.mouthAngle = 0;
  player.mouthDir   = 1;

  // ── Load map ──────────────────────────────────────────
  const mapIdx = (session.level - 1) % MAPS.length;
  const rawMap = MAPS[mapIdx];
  const cols   = Math.max(...rawMap.map(r => r.length));
  const map    = rawMap.map(r => r.padEnd(cols, '#'));
  const rows   = map.length;
  setCurrentMap(map);

  if (_canvas) {
    _canvas.width  = cols * TILE;
    _canvas.height = rows * TILE;
    fitCanvasToWindow(_canvas, cols, rows);
  }

  // ── Pellets ───────────────────────────────────────────
  const pelletArr = [];
  let count = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (map[y][x] === '.') {
        pelletArr.push({ x, y, collected: false });
        count++;
      }
    }
  }
  setPellets(pelletArr);
  setPelletsLeft(count);

  // ── Power-ups (4 corners) ─────────────────────────────
  const puArr = [];
  const corners = [[1, 1], [cols - 2, 1], [1, rows - 2], [cols - 2, rows - 2]];
  corners.forEach(([px, py]) => {
    if (map[py]?.[px] === '.') puArr.push({ x: px, y: py, active: true });
  });
  setPowerUps(puArr);

  // ── Bonus item (centre) ───────────────────────────────
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  setBonusItems([{ x: cx, y: cy, active: true, value: 250, timer: 600 }]);

  // ── Enemies ───────────────────────────────────────────
  setEnemies(buildEnemies(cols, rows, session.level));

  // ── Boss (level 5+) ───────────────────────────────────
  if (session.level >= 5) {
    boss.active     = true;
    boss.health     = BOSS_CFG.BASE_HEALTH_BONUS + session.level;
    boss.maxHealth  = boss.health;
    boss.x          = cols - 2;
    boss.y          = rows - 2;
    boss.flashTimer = 0;
  } else {
    boss.active = false;
  }

  updateHUD();
}

// ── Responsive canvas scaling ─────────────────────────
//  Scales the canvas element via CSS so it fills the
//  available viewport without distorting the pixel grid.
export function fitCanvasToWindow(canvas, cols, rows) {
  const TILE_PX = TILE;
  const nativeW  = cols * TILE_PX;
  const nativeH  = rows * TILE_PX;

  // Available space: viewport minus HUD/dpad/legend (~200px headroom)
  const maxW = window.innerWidth  * 0.97;
  const maxH = window.innerHeight * 0.70;

  const scale = Math.min(maxW / nativeW, maxH / nativeH, 1); // never upscale past 1:1

  canvas.style.width  = `${nativeW * scale}px`;
  canvas.style.height = `${nativeH * scale}px`;
}
