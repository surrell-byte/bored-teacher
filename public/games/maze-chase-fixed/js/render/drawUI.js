// ═══════════════════════════════════════════════════════
//  RENDER — HUD & OVERLAY  (sprite version)
//  Lives now render as <img> leaf icons instead of ❤️ emoji.
//  Spritesheet row 2, col 3 = cool-leaf = life icon.
// ═══════════════════════════════════════════════════════
import { session, pelletsLeft } from '../game/state.js';

// ── Element references (resolved on first call) ───────
const el = {
  score:     () => document.getElementById('scoreEl'),
  lives:     () => document.getElementById('livesEl'),
  level:     () => document.getElementById('levelEl'),
  pellets:   () => document.getElementById('pelletsEl'),
  highscore: () => document.getElementById('highscoreEl'),
  overlay:   () => document.getElementById('overlay'),
  title:     () => document.getElementById('overlayTitle'),
  msg:       () => document.getElementById('overlayMsg'),
  btn:       () => document.getElementById('overlayBtn'),
};

// ── Life-icon sprite (row 2, col 3 of the spritesheet) ─
//    We render it as a tiny canvas snippet so no extra
//    <img> assets need to be distributed — just the sheet.
const SHEET_COLS = 4;
const SHEET_ROWS = 3;
const LIFE_COL   = 3;
const LIFE_ROW   = 2;
const LIFE_SIZE  = 22;   // px — rendered icon height in the HUD

const _sheet = new Image();
let   _sheetReady = false;
_sheet.onload = () => { _sheetReady = true; };
_sheet.src    = 'assets/sprites/spritesheet.png';

/** Returns a data-URL for a single life-icon cell, sized to LIFE_SIZE. */
function _makeLifeIcon() {
  const cw = _sheet.naturalWidth  / SHEET_COLS;
  const ch = _sheet.naturalHeight / SHEET_ROWS;
  const offscreen = document.createElement('canvas');
  offscreen.width  = LIFE_SIZE;
  offscreen.height = LIFE_SIZE;
  const oc = offscreen.getContext('2d');
  oc.drawImage(
    _sheet,
    LIFE_COL * cw, LIFE_ROW * ch, cw, ch,
    0, 0, LIFE_SIZE, LIFE_SIZE,
  );
  return offscreen.toDataURL();
}

// ── HUD ──────────────────────────────────────────────────

export function updateHUD() {
  el.score().textContent     = session.score;
  el.level().textContent     = session.level;
  el.highscore().textContent = session.highScore;
  el.pellets().textContent   = pelletsLeft;

  const livesEl = el.lives();

  if (_sheetReady) {
    // Build icon list using the spritesheet crop
    const iconSrc = _makeLifeIcon();
    if (session.lives > 0) {
      livesEl.innerHTML = Array.from({ length: session.lives })
        .map(() => `<img src="${iconSrc}" alt="life" style="width:${LIFE_SIZE}px;height:${LIFE_SIZE}px;vertical-align:middle;margin-right:2px;">`)
        .join('');
    } else {
      livesEl.textContent = '💀';
    }
  } else {
    // Fallback: emoji while spritesheet loads
    let hearts = '';
    for (let i = 0; i < session.lives; i++) hearts += '🌿';
    livesEl.textContent = hearts || '💀';
  }
}

export function popStat(statEl) {
  if (!statEl) return;
  statEl.classList.remove('pop');
  void statEl.offsetWidth; // reflow
  statEl.classList.add('pop');
}

// ── Overlay ──────────────────────────────────────────────

export function showOverlay(title, titleClass = '', msg = '', btnText = 'OK', btnClass = '') {
  el.title().textContent = title;
  el.title().className   = titleClass;
  el.msg().textContent   = msg;
  el.msg().style.whiteSpace = 'pre-line';
  el.btn().textContent   = btnText;
  el.btn().className     = btnClass;
  el.overlay().classList.add('show');
}

export function hideOverlay() {
  el.overlay().classList.remove('show');
}
