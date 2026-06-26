// ═══════════════════════════════════════════════════════
//  MOVEMENT & COLLECTION
// ═══════════════════════════════════════════════════════
import { TIMING, SCORE } from '../utils/constants.js';
import {
  player, power, session,
  currentMap, pellets, powerUps, bonusItems,
  decrementPellets, setBonusItems,
} from './state.js';
import { addScore } from './scoring.js';
import { updateHUD } from '../render/drawUI.js';
import { SFX } from '../utils/audio.js';

// ── Helpers ───────────────────────────────────────────

export function canMove(x, y) {
  if (y < 0 || y >= currentMap.length)     return false;
  if (x < 0 || x >= currentMap[0].length)  return false;
  return currentMap[y][x] !== '#';
}

// ── Player movement (throttled by PLAYER_TICK) ────────

export function movePlayer() {
  // Only advance on the correct frame interval
  if (session.frameCount % TIMING.PLAYER_TICK !== 0) return;

  // Consume queued direction if valid
  if (canMove(player.x + player.queueX, player.y + player.queueY)) {
    player.dirX   = player.queueX;
    player.dirY   = player.queueY;
    player.queueX = 0;
    player.queueY = 0;
  }
  const nx = player.x + player.dirX;
  const ny = player.y + player.dirY;
  if (canMove(nx, ny)) {
    player.x = nx;
    player.y = ny;
    if (player.dirX !== 0 || player.dirY !== 0) {
      player.facing = Math.atan2(player.dirY, player.dirX);
    }
  }
}

// ── Collection ────────────────────────────────────────

export function collectPellets() {
  pellets.forEach(p => {
    if (!p.collected && p.x === player.x && p.y === player.y) {
      p.collected = true;
      decrementPellets();
      addScore(SCORE.PELLET);
      updateHUD();
      SFX.pellet();
    }
  });
}

export function collectPowerUps() {
  powerUps.forEach(pu => {
    if (pu.active && pu.x === player.x && pu.y === player.y) {
      pu.active    = false;
      power.active = true;
      power.timer  = TIMING.POWER_MODE_DURATION;
      addScore(SCORE.POWER_UP);
      updateHUD();
      SFX.powerUp();
    }
  });
}

export function collectBonusItems() {
  bonusItems.forEach(item => {
    if (item.active && item.x === player.x && item.y === player.y) {
      item.active = false;
      addScore(item.value);
      updateHUD();
      SFX.bonus();
    }
  });
  setBonusItems(bonusItems.filter(item => item.active));
}

export function updateBonusItems() {
  bonusItems.forEach(item => { if (item.active) item.timer--; });
  setBonusItems(bonusItems.filter(item => item.active && item.timer > 0));
}
