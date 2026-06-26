// ═══════════════════════════════════════════════════════
//  RENDER — EFFECTS  (sprite version)
//  Spritesheet row 2:
//    col 0 — gold orb        → pellet dot
//    col 1 — gold leaf       → power-up
//    col 2 — bong + joint    → bonus item
//    col 3 — cool-leaf       → (reserved / boss override unused here)
// ═══════════════════════════════════════════════════════
import { TILE, COLORS, BOSS as BOSS_CFG } from '../utils/constants.js';
import { session, pellets, powerUps, bonusItems, boss } from '../game/state.js';

const SHEET_COLS = 4;
const SHEET_ROWS = 3;
const ITEM_ROW   = 2;

// ── Sprite loader (singleton) ─────────────────────────
const _sheet = new Image();
let   _ready  = false;
_sheet.onload = () => { _ready = true; };
_sheet.src    = 'assets/sprites/spritesheet.png';

function _cellW(img) { return img.naturalWidth  / SHEET_COLS; }
function _cellH(img) { return img.naturalHeight / SHEET_ROWS; }

// ── Public entry ──────────────────────────────────────
export function drawEffects(ctx) {
  _drawPellets(ctx);
  _drawPowerUps(ctx);
  _drawBonusItems(ctx);
  _drawBoss(ctx);
}

// ── Pellets ───────────────────────────────────────────
function _drawPellets(ctx) {
  if (_ready) {
    const cw = _cellW(_sheet);
    const ch = _cellH(_sheet);
    const sx = 0 * cw;           // col 0 — gold orb
    const sy = ITEM_ROW * ch;
    const sz = TILE * 0.55;      // small — pellets are tiny pickups

    pellets.forEach(p => {
      if (p.collected) return;
      const cx = p.x * TILE + TILE / 2;
      const cy = p.y * TILE + TILE / 2;
      ctx.save();
      ctx.shadowColor = COLORS.GOLD;
      ctx.shadowBlur  = 4;
      ctx.drawImage(_sheet, sx, sy, cw, ch, cx - sz / 2, cy - sz / 2, sz, sz);
      ctx.restore();
      ctx.shadowBlur = 0;
    });
  } else {
    // Fallback
    ctx.fillStyle   = COLORS.PELLET;
    ctx.shadowColor = COLORS.PELLET;
    ctx.shadowBlur  = 4;
    pellets.forEach(p => {
      if (p.collected) return;
      ctx.beginPath();
      ctx.arc(p.x * TILE + TILE / 2, p.y * TILE + TILE / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }
}

// ── Power-ups ─────────────────────────────────────────
function _drawPowerUps(ctx) {
  const pulse = 1 + 0.15 * Math.sin(session.frameCount * 0.12);

  if (_ready) {
    const cw = _cellW(_sheet);
    const ch = _cellH(_sheet);
    const sx = 1 * cw;           // col 1 — gold leaf
    const sy = ITEM_ROW * ch;

    powerUps.forEach(pu => {
      if (!pu.active) return;
      const cx  = pu.x * TILE + TILE / 2;
      const cy  = pu.y * TILE + TILE / 2;
      const sz  = TILE * 1.1 * pulse;

      ctx.save();
      ctx.shadowColor = COLORS.GOLD;
      ctx.shadowBlur  = 14;
      ctx.drawImage(_sheet, sx, sy, cw, ch, cx - sz / 2, cy - sz / 2, sz, sz);
      ctx.restore();
      ctx.shadowBlur = 0;
    });
  } else {
    ctx.fillStyle   = COLORS.GOLD;
    ctx.shadowColor = COLORS.GOLD;
    ctx.shadowBlur  = 12;
    powerUps.forEach(pu => {
      if (!pu.active) return;
      ctx.beginPath();
      ctx.arc(pu.x * TILE + TILE / 2, pu.y * TILE + TILE / 2, 7 * pulse, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }
}

// ── Bonus items ───────────────────────────────────────
function _drawBonusItems(ctx) {
  const bob = Math.sin(session.frameCount * 0.15) * 2;

  bonusItems.forEach(item => {
    if (!item.active) return;
    const cx = item.x * TILE + TILE / 2;
    const cy = item.y * TILE + TILE / 2 + bob;

    if (_ready) {
      const cw = _cellW(_sheet);
      const ch = _cellH(_sheet);
      const sx = 2 * cw;         // col 2 — bong + joint
      const sy = ITEM_ROW * ch;
      const sz = TILE * 1.6;     // bonus items are big and tempting

      ctx.save();
      ctx.shadowColor = COLORS.CYAN;
      ctx.shadowBlur  = 14;
      ctx.drawImage(_sheet, sx, sy, cw, ch, cx - sz / 2, cy - sz / 2, sz, sz);
      ctx.restore();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle   = COLORS.CYAN;
      ctx.shadowColor = COLORS.CYAN;
      ctx.shadowBlur  = 14;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(session.frameCount * 0.05);
      ctx.fillRect(-7, -7, 14, 14);
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    // Timer bar (same regardless of sprite readiness)
    const frac = item.timer / 600;
    ctx.fillStyle = `rgba(0,255,255,${0.35 * frac})`;
    ctx.fillRect(item.x * TILE + 2, item.y * TILE + TILE - 5, (TILE - 4) * frac, 3);
  });
}

// ── Boss  (canvas drawing — no spritesheet cell used) ─
function _drawBoss(ctx) {
  if (!boss.active) return;

  const bx    = boss.x * TILE + TILE / 2;
  const by    = boss.y * TILE + TILE / 2;
  const r     = BOSS_CFG.RADIUS_BASE + Math.sin(session.frameCount * 0.1) * BOSS_CFG.RADIUS_PULSE;
  const flash = boss.flashTimer > 0;

  ctx.fillStyle   = flash ? '#ffffff' : COLORS.PURPLE;
  ctx.shadowColor = COLORS.PURPLE;
  ctx.shadowBlur  = 22;
  ctx.beginPath();
  ctx.arc(bx, by, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Crown spikes
  ctx.fillStyle = COLORS.GOLD;
  for (let i = 0; i < BOSS_CFG.SPIKE_COUNT; i++) {
    const a = (i / BOSS_CFG.SPIKE_COUNT) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(bx + Math.cos(a - 0.2) * r,     by + Math.sin(a - 0.2) * r);
    ctx.lineTo(bx + Math.cos(a) * r * 1.5,      by + Math.sin(a) * r * 1.5);
    ctx.lineTo(bx + Math.cos(a + 0.2) * r,     by + Math.sin(a + 0.2) * r);
    ctx.fill();
  }

  // Health bar
  const barW  = 3 * TILE;
  const barH  = 5;
  const bLeft = boss.x * TILE - TILE;
  const bTop  = boss.y * TILE + TILE + 2;
  ctx.fillStyle = '#333';
  ctx.fillRect(bLeft, bTop, barW, barH);
  ctx.fillStyle = COLORS.PURPLE;
  ctx.fillRect(bLeft, bTop, barW * (boss.health / boss.maxHealth), barH);
}
