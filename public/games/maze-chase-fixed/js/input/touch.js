// ═══════════════════════════════════════════════════════
//  INPUT — TOUCH / SWIPE
// ═══════════════════════════════════════════════════════
import { player } from '../game/state.js';

const MIN_SWIPE = 20; // px

export function initTouch(canvas) {
  let touchX = 0, touchY = 0;

  canvas.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;

    if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      player.queueX = dx > 0 ? 1 : -1;
      player.queueY = 0;
    } else {
      player.queueY = dy > 0 ? 1 : -1;
      player.queueX = 0;
    }
    e.preventDefault();
  }, { passive: false });
}
