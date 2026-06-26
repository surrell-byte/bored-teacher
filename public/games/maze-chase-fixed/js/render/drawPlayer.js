// ═══════════════════════════════════════════════════════
//  RENDER — PLAYER  (sprite version)
//  Spritesheet: assets/sprites/spritesheet.png
//  Row 0, cols 0–3 = walk animation frames
//  Each cell is 256×256 px (spritesheet is 1024×768, 4×3 grid)
// ═══════════════════════════════════════════════════════
import { TILE, PLAYER } from '../utils/constants.js';
import { player, power, session } from '../game/state.js';

const SHEET_COLS  = 4;
const SHEET_ROWS  = 3;
const FRAME_COUNT = 4;   // frames in row 0

// ── Sprite loader (singleton) ─────────────────────────
const _sheet = new Image();
let   _ready  = false;
_sheet.onload = () => { _ready = true; };
_sheet.src    = 'assets/sprites/spritesheet.png';

// ── Helpers ───────────────────────────────────────────
function _cellW(img) { return img.naturalWidth  / SHEET_COLS; }
function _cellH(img) { return img.naturalHeight / SHEET_ROWS; }

export function drawPlayer(ctx) {
  const px = player.x * TILE + TILE / 2;
  const py = player.y * TILE + TILE / 2;

  // Advance mouth animation (kept for future use / fallback timing)
  player.mouthAngle += PLAYER.MOUTH_SPEED * player.mouthDir;
  if (player.mouthAngle > PLAYER.MOUTH_MAX) player.mouthDir = -1;
  if (player.mouthAngle < PLAYER.MOUTH_MIN) player.mouthDir =  1;

  // ── Sprite path ──────────────────────────────────────
  if (_ready) {
    // Walk frame cycles every 8 game-frames; power mode locks to frame 3
    const frame = power.active
      ? 3
      : Math.floor(session.frameCount / 8) % FRAME_COUNT;

    const cw = _cellW(_sheet);
    const ch = _cellH(_sheet);
    const sx = frame * cw;   // row 0
    const sy = 0;

    const drawSize = TILE * 1.4;  // slightly larger than tile for visual pop

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(player.facing);

    // Glow
    ctx.shadowColor = power.active ? '#FFD700' : '#00ff88';
    ctx.shadowBlur  = power.active ? 18 : 10;

    ctx.drawImage(
      _sheet,
      sx, sy, cw, ch,               // source cell
      -drawSize / 2, -drawSize / 2, // dest top-left (centred)
      drawSize, drawSize,            // dest size
    );

    ctx.restore();
    ctx.shadowBlur = 0;
    return;
  }

  // ── Canvas fallback (spritesheet not loaded yet) ─────
  const color = power.active ? '#FFD700' : '#00ff88';
  ctx.fillStyle   = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = power.active ? 18 : 10;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(player.facing);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, PLAYER.RADIUS, player.mouthAngle, Math.PI * 2 - player.mouthAngle);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.shadowBlur = 0;
}
