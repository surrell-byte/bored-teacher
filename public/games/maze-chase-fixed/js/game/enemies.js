// ═══════════════════════════════════════════════════════
//  ENEMY AI & MOVEMENT
// ═══════════════════════════════════════════════════════
import { TIMING } from '../utils/constants.js';
import { session, player, enemies, currentMap } from './state.js';
import { canMove } from './movement.js';
import { randomPick, findNearestOpen } from '../utils/math.js';

const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];

// ── Pathfinding helpers ───────────────────────────────────

function validDirs(ex, ey) {
  return DIRS.filter(([dx, dy]) => canMove(ex + dx, ey + dy));
}

function chaseDir(enemy) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  let mx = 0, my = 0;
  if (Math.abs(dx) >= Math.abs(dy)) mx = dx > 0 ? 1 : -1;
  else my = dy > 0 ? 1 : -1;

  if (canMove(enemy.x + mx, enemy.y + my)) return [mx, my];

  // Primary blocked — pick from all valid directions
  const valid = validDirs(enemy.x, enemy.y);
  return randomPick(valid) ?? [0, 0];
}

function randomDir(enemy) {
  // Keep momentum if possible
  if (canMove(enemy.x + enemy.dirX, enemy.y + enemy.dirY)) {
    return [enemy.dirX, enemy.dirY];
  }
  const valid = validDirs(enemy.x, enemy.y);
  return randomPick(valid) ?? [0, 0];
}

// ── Public movement tick ─────────────────────────────────

export function moveEnemies() {
  const speedTick = Math.max(1, TIMING.ENEMY_SPEED_BASE - Math.floor(session.level / 2));
  if (session.frameCount % speedTick !== 0) return;

  enemies.forEach(enemy => {
    const [mx, my] = enemy.smart ? chaseDir(enemy) : randomDir(enemy);
    if (!enemy.smart) { enemy.dirX = mx; enemy.dirY = my; }
    if (canMove(enemy.x + mx, enemy.y + my)) {
      enemy.x += mx;
      enemy.y += my;
    }
  });
}

// ── Safe spawn ────────────────────────────────────────────

export function findSafeSpawn() {
  const rows = currentMap.length;
  const cols = currentMap[0].length;
  return findNearestOpen(currentMap, Math.floor(cols / 2), Math.floor(rows / 2));
}
