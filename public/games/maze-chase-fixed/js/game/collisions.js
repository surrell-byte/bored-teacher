// ═══════════════════════════════════════════════════════
//  COLLISION DETECTION & RESOLUTION
// ═══════════════════════════════════════════════════════
import { SCORE } from '../utils/constants.js';
import { player, power, boss, enemies } from './state.js';
import { addScore }      from './scoring.js';
import { loseLife }      from './scoring.js';
import { findSafeSpawn } from './enemies.js';
import { SFX }           from '../utils/audio.js';

export function checkEnemyCollisions() {
  enemies.forEach(e => {
    if (e.x !== player.x || e.y !== player.y) return;

    if (power.active) {
      const spawn = findSafeSpawn();
      e.x = spawn.x;
      e.y = spawn.y;
      addScore(SCORE.EAT_GHOST);
      SFX.eatGhost();
    } else {
      loseLife();
    }
  });
}

export function checkBossCollision() {
  if (!boss.active) return;
  if (boss.x !== player.x || boss.y !== player.y) return;

  if (power.active) {
    boss.health--;
    boss.flashTimer = 12;
    addScore(SCORE.BOSS_HIT);
    SFX.bossHit();
    if (boss.health <= 0) {
      boss.active = false;
      addScore(SCORE.BOSS_KILL);
      SFX.bossKill();
    }
  } else {
    loseLife();
  }
}
