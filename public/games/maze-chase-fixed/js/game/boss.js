// ═══════════════════════════════════════════════════════
//  BOSS  (movement tick only — drawing is in render/drawEffects.js)
// ═══════════════════════════════════════════════════════
import { TIMING } from '../utils/constants.js';
import { session, player, boss } from './state.js';
import { canMove } from './movement.js';

export function moveBoss() {
  if (!boss.active) return;
  if (session.frameCount % TIMING.BOSS_SPEED_TICK !== 0) return;

  const dx = player.x - boss.x;
  const dy = player.y - boss.y;
  let mx = 0, my = 0;
  if (Math.abs(dx) >= Math.abs(dy)) mx = dx > 0 ? 1 : -1;
  else my = dy > 0 ? 1 : -1;

  if (canMove(boss.x + mx, boss.y + my)) {
    boss.x += mx;
    boss.y += my;
  } else {
    // Try perpendicular
    const altX = mx ? 0 : 1;
    const altY = my ? 0 : 1;
    if (canMove(boss.x + altX, boss.y + altY)) {
      boss.x += altX;
      boss.y += altY;
    }
  }

  boss.flashTimer = Math.max(0, boss.flashTimer - 1);
}
