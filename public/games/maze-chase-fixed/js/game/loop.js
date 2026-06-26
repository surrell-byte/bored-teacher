// ═══════════════════════════════════════════════════════
//  MAIN GAME LOOP
// ═══════════════════════════════════════════════════════
import { TIMING }    from '../utils/constants.js';
import { session, power, pellets, setPelletsLeft, pelletsLeft } from './state.js';
import { movePlayer, collectPellets, collectPowerUps, collectBonusItems, updateBonusItems } from './movement.js';
import { moveEnemies }  from './enemies.js';
import { moveBoss }     from './boss.js';
import { checkEnemyCollisions, checkBossCollision } from './collisions.js';
import { checkLevelComplete } from './scoring.js';
import { drawMaze }     from '../render/drawMaze.js';
import { drawPlayer }   from '../render/drawPlayer.js';
import { drawEnemies }  from '../render/drawEnemies.js';
import { drawEffects }  from '../render/drawEffects.js';
import { updateHUD }    from '../render/drawUI.js';

let _ctx = null;

export function setContext(ctx) { _ctx = ctx; }

export function startGameLoop() {
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!session.gameRunning) return;

  session.frameCount++;

  _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);

  // ── Logic ──────────────────────────────────────────
  movePlayer();
  moveEnemies();
  moveBoss();

  updateBonusItems();
  collectPellets();
  collectPowerUps();
  collectBonusItems();
  checkEnemyCollisions();
  checkBossCollision();
  checkLevelComplete();

  // ── Power-mode countdown ───────────────────────────
  if (power.active) {
    power.timer--;
    if (power.timer <= 0) { power.active = false; power.timer = 0; }
  }

  // ── Periodic pellet-counter sync (safety net) ──────
  if (session.frameCount % TIMING.SYNC_INTERVAL === 0) {
    const actual = pellets.filter(p => !p.collected).length;
    if (actual !== pelletsLeft) {
      setPelletsLeft(actual);
      updateHUD();
    }
  }

  // ── Render ─────────────────────────────────────────
  drawMaze(_ctx);
  drawEffects(_ctx);   // pellets, power-ups, bonus items, boss
  drawPlayer(_ctx);
  drawEnemies(_ctx);

  requestAnimationFrame(gameLoop);
}
