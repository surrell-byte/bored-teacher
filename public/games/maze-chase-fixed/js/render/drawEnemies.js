// ═══════════════════════════════════════════════════════
//  RENDER — ENEMIES  (sprite version)
//  Spritesheet row 1:
//    col 0 — smoke enemy, red eyes   (normal, enemy 0 colour)
//    col 1 — smoke enemy, red eyes   (normal, enemy 1 colour — dimmer)
//    col 2 — smoke enemy, white eyes (frightened / blink-light state)
//    col 3 — smoke enemy, white eyes (frightened / blink-dark state)
// ═══════════════════════════════════════════════════════
import { TILE, TIMING } from '../utils/constants.js';
import { enemies, power } from '../game/state.js';

const SHEET_COLS = 4;
const SHEET_ROWS = 3;
const ENEMY_ROW  = 1;

// ── Sprite loader (singleton) ─────────────────────────
const _sheet = new Image();
let   _ready  = false;
_sheet.onload = () => { _ready = true; };
_sheet.src    = 'assets/sprites/spritesheet.png';

function _cellW(img) { return img.naturalWidth  / SHEET_COLS; }
function _cellH(img) { return img.naturalHeight / SHEET_ROWS; }

export function drawEnemies(ctx) {
  if (!_ready) {
    _drawEnemiesFallback(ctx);
    return;
  }

  const cw = _cellW(_sheet);
  const ch = _cellH(_sheet);
  const sy = ENEMY_ROW * ch;
  const drawSize = TILE * 1.5;

  enemies.forEach((e, i) => {
    const ex = e.x * TILE + TILE / 2;
    const ey = e.y * TILE + TILE / 2;
    const frightened = power.active;

    let col;   // spritesheet column
    if (frightened) {
      const blink = Math.floor(performance.now() / TIMING.POWER_BLINK_MS) % 2;
      if (power.timer > TIMING.POWER_BLINK_WARN) {
        // Solid frightened state — white-eye smoke (col 2)
        col = 2;
      } else {
        // Blinking warning — alternate col 2 / col 3
        col = blink ? 2 : 3;
      }
    } else {
      // Normal: alternate between col 0 and col 1 to vary enemy look
      col = i % 2 === 0 ? 0 : 1;
    }

    const sx = col * cw;

    ctx.save();
    ctx.shadowColor = frightened ? '#0044ff' : '#ff4444';
    ctx.shadowBlur  = 10;
    ctx.drawImage(
      _sheet,
      sx, sy, cw, ch,
      ex - drawSize / 2, ey - drawSize / 2,
      drawSize, drawSize,
    );
    ctx.restore();
    ctx.shadowBlur = 0;
  });
}

// ── Canvas fallback ───────────────────────────────────
function _drawEnemiesFallback(ctx) {
  const { COLORS } = { COLORS: { ENEMY: ['#ff4444','#ff8800','#ff44ff'], ENEMY_FRIGHTENED: '#0044ff', ENEMY_FRIGHTENED_BLINK: '#ffffff' } };
  enemies.forEach((e, i) => {
    const ex = e.x * TILE + TILE / 2;
    const ey = e.y * TILE + TILE / 2;
    const r  = 13;
    const frightened = power.active;
    let col = frightened ? COLORS.ENEMY_FRIGHTENED : COLORS.ENEMY[i % COLORS.ENEMY.length];

    ctx.fillStyle   = col;
    ctx.shadowColor = col;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.arc(ex, ey - 2, r, Math.PI, 0);
    ctx.lineTo(ex + r, ey + r);
    for (let j = 0; j < 3; j++) {
      const sx = ex + r - (j + 0.5) * (2 * r / 3);
      ctx.arc(sx, ey + r, r / 3, 0, Math.PI, true);
    }
    ctx.lineTo(ex - r, ey - 2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}
