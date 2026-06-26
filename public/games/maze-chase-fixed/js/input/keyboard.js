// ═══════════════════════════════════════════════════════
//  INPUT — KEYBOARD
// ═══════════════════════════════════════════════════════
import { player } from '../game/state.js';

export function initKeyboard() {
  document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e) {
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      player.queueX = -1; player.queueY = 0;
      break;
    case 'ArrowRight':
      e.preventDefault();
      player.queueX = 1;  player.queueY = 0;
      break;
    case 'ArrowUp':
      e.preventDefault();
      player.queueX = 0;  player.queueY = -1;
      break;
    case 'ArrowDown':
      e.preventDefault();
      player.queueX = 0;  player.queueY = 1;
      break;
    case 'f': case 'F':
      if (document.fullscreenElement) document.exitFullscreen?.();
      else document.documentElement.requestFullscreen?.();
      break;
  }
}
