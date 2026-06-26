// ═══════════════════════════════════════════════════════
//  LOCAL STORAGE UTILITIES
// ═══════════════════════════════════════════════════════

const KEYS = {
  HIGH_SCORE: 'cannabisManHighScore',
  MUTED:      'cannabisManMuted',
};

export function getHighScore() {
  return parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || '0');
}

export function saveHighScore(score) {
  localStorage.setItem(KEYS.HIGH_SCORE, score);
}

export function getMuted() {
  return localStorage.getItem(KEYS.MUTED) === '1';
}

export function saveMuted(muted) {
  localStorage.setItem(KEYS.MUTED, muted ? '1' : '0');
}
