// ═══════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════

export const TILE = 32;

export const SCORE = {
  PELLET:    10,
  POWER_UP:  100,
  BONUS:     250,
  EAT_GHOST: 250,
  BOSS_HIT:  500,
  BOSS_KILL: 5000,
};

export const TIMING = {
  POWER_MODE_DURATION: 480,   // frames (~8s at 60fps)
  POWER_BLINK_MS:      120,   // ms per blink half-cycle
  POWER_BLINK_WARN:    120,   // frames remaining when blinking starts
  BONUS_LIFETIME:      480,   // frames
  // Player moves 1 tile every PLAYER_TICK frames (higher = slower)
  PLAYER_TICK:         6,     // ~10 tiles/sec — comfortable casual pace
  // Enemy base tick: move every N frames, loses 1 every 2 levels
  ENEMY_SPEED_BASE:    8,     // was 4 — doubled for slower start
  BOSS_SPEED_TICK:     5,     // was 2 — boss now much less frantic
  BOSS_FLASH_FRAMES:   12,
  SYNC_INTERVAL:       30,    // frames between pellet-counter sanity sync
};

export const PLAYER = {
  START_X:       1,
  START_Y:       1,
  RADIUS:        13,
  MOUTH_MAX:     0.35,
  MOUTH_MIN:     0.02,
  MOUTH_SPEED:   0.12,   // slower mouth animation to match pace
};

export const BOSS = {
  BASE_HEALTH_BONUS: 5,
  RADIUS_BASE:       18,
  RADIUS_PULSE:      2,
  SPIKE_COUNT:       5,
};

export const COLORS = {
  GREEN:   '#00ff88',
  GOLD:    '#FFD700',
  RED:     '#ff4444',
  CYAN:    '#00ffff',
  PURPLE:  '#cc00ff',
  PELLET:  '#7CFC00',
  WALL_A:  '#0a1628',
  WALL_B:  '#0d1e38',
  WALL_EDGE: 'rgba(0,150,255,0.25)',
  ENEMY:   ['#ff4444', '#ff8800', '#ff44ff'],
  ENEMY_FRIGHTENED:     '#0044ff',
  ENEMY_FRIGHTENED_BLINK: '#ffffff',
};
