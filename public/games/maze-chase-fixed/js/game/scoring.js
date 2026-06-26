// ═══════════════════════════════════════════════════════
//  SCORING, LIVES & WIN/LOSE CONDITIONS
// ═══════════════════════════════════════════════════════
import { session, power, player, pelletsLeft } from './state.js';
import { saveHighScore }      from '../utils/storage.js';
import { SFX }                from '../utils/audio.js';
import { updateHUD, popStat, showOverlay, hideOverlay } from '../render/drawUI.js';
import { initLevel }          from './initLevel.js';
import { startGameLoop }      from './loop.js';

// ── Score ────────────────────────────────────────────────

export function addScore(n) {
  session.score += n;
  if (session.score > session.highScore) {
    session.highScore = session.score;
    saveHighScore(session.highScore);
  }
  updateHUD();
  popStat(document.getElementById('scoreEl'));
}

// ── Lives ─────────────────────────────────────────────────

export function loseLife() {
  session.lives--;
  updateHUD();
  SFX.die();

  // Reset player position
  player.x = 1; player.y = 1;
  player.dirX = 0; player.dirY = 0;
  power.active = false;
  power.timer  = 0;

  if (session.lives <= 0) endGame();
}

// ── Level complete ────────────────────────────────────────

export function checkLevelComplete() {
  if (pelletsLeft > 0) return;
  session.gameRunning = false;
  SFX.levelUp();
  session.level++;
  showOverlay(
    `LEVEL ${session.level - 1} CLEAR!`,
    'gold',
    `Score: ${session.score}\nBest: ${session.highScore}`,
    'NEXT LEVEL',
  );
  document.getElementById('overlayBtn').onclick = () => {
    hideOverlay();
    initLevel();
    session.gameRunning = true;
    startGameLoop();
  };
}

// ── Game over ─────────────────────────────────────────────

export function endGame() {
  session.gameRunning = false;
  SFX.gameOver();
  saveHighScore(session.highScore);
  showOverlay(
    'GAME OVER',
    'red',
    `Score: ${session.score}\nBest: ${session.highScore}`,
    'PLAY AGAIN',
    'red',
  );
  document.getElementById('overlayBtn').onclick = () => {
    session.score = 0;
    session.lives = 3;
    session.level = 1;
    hideOverlay();
    initLevel();
    session.gameRunning = true;
    startGameLoop();
  };
}
