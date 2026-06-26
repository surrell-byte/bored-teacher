// ═══════════════════════════════════════════════════════
//  MAIN — entry point
// ═══════════════════════════════════════════════════════
import { session }                    from './game/state.js';
import { initLevel, setCanvas, fitCanvasToWindow } from './game/initLevel.js';
import { setContext, startGameLoop }  from './game/loop.js';
import { showOverlay, hideOverlay }   from './render/drawUI.js';
import { initKeyboard }               from './input/keyboard.js';
import { initTouch }                  from './input/touch.js';
import { initDpad }                   from './input/dpad.js';
import { isMuted, toggleMute, unlockAudio } from './utils/audio.js';
import { TILE }                       from './utils/constants.js';
import { currentMap }                 from './game/state.js';

// ── Canvas & context ──────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
setCanvas(canvas);
setContext(ctx);

// ── Responsive: refit on resize ───────────────────────
window.addEventListener('resize', () => {
  if (!currentMap.length) return;
  const cols = currentMap[0].length;
  const rows = currentMap.length;
  fitCanvasToWindow(canvas, cols, rows);
});

// ── Input ─────────────────────────────────────────────
initKeyboard();
initTouch(canvas);
initDpad();

// ── Mute button ───────────────────────────────────────
const muteBtn = document.getElementById('muteBtn');

function applyMuteUI() {
  const muted = isMuted();
  muteBtn.textContent = muted ? '🔇' : '🔊';
  muteBtn.classList.toggle('muted', muted);
}

applyMuteUI();
muteBtn.addEventListener('click', () => { toggleMute(); applyMuteUI(); });

// ── Boot ──────────────────────────────────────────────
initLevel();

showOverlay(
  '🌿 CANNABIS MAN',
  '',
  'COLLECT ALL PELLETS\nAVOID THE GHOSTS\nGRAB POWER-UPS TO FIGHT BACK',
  'START GAME',
);

document.getElementById('overlayBtn').onclick = () => {
  unlockAudio();
  hideOverlay();
  session.gameRunning = true;
  startGameLoop();
};
