// ═══════════════════════════════════════════════════════
//  INPUT — D-PAD (mobile on-screen buttons)
// ═══════════════════════════════════════════════════════
import { player } from '../game/state.js';

const BUTTONS = [
  { id: 'dUp',    qx:  0, qy: -1 },
  { id: 'dDown',  qx:  0, qy:  1 },
  { id: 'dLeft',  qx: -1, qy:  0 },
  { id: 'dRight', qx:  1, qy:  0 },
];

export function initDpad() {
  BUTTONS.forEach(({ id, qx, qy }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    ['touchstart', 'mousedown'].forEach(evt => {
      btn.addEventListener(evt, e => {
        e.preventDefault();
        player.queueX = qx;
        player.queueY = qy;
      });
    });
  });
}
