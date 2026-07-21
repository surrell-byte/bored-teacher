export const TILE = 32;
export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 424;
export const FALL_LIMIT = 450;

export const GRAVITY = 0.6;
export const JUMP_POWER = -15;
export const ACCEL = 0.5;
export const FRICTION = 0.8;
export const MAX_SPEED = 5;

export const PLAYER_START = {
  x: 100,
  y: 340,
  w: 28,
  h: 28,
};

export const PLAYER_MAX_HP = 3;
export const ATTACK_FRAMES = 10;
export const INVINCIBLE_FRAMES = 60;
export const COYOTE_FRAMES = 6;
export const JUMP_BUFFER_FRAMES = 10;

// --- Combat feel ---
export const HITSTOP_KO_FRAMES = 6;
export const HITSTOP_HURT_FRAMES = 8;

export const KNOCKBACK_ENEMY_VX = 7;
export const KNOCKBACK_ENEMY_VY = -5;
export const KNOCKBACK_PLAYER_VX = 6;
export const KNOCKBACK_PLAYER_VY = -6;

export const SHAKE_HIT = 6;
export const SHAKE_HURT = 12;

export const ENEMY_DEATH_FRAMES = 18;
export const ENEMY_DEATH_GRAVITY = 0.6;

export const SPARK_COUNT_HIT = 10;
export const SPARK_COUNT_HURT = 8;

// --- Double jump ---
export const MAX_JUMPS = 2;
export const AIR_JUMP_POWER_MULT = 0.85;

// --- Dash ---
export const DASH_FRAMES = 10;
export const DASH_COOLDOWN_FRAMES = 32;
export const DASH_BUFFER_FRAMES = 6;
export const DASH_SPEED = 11;
export const SPARK_COUNT_DASH = 8;

// --- Kill combo ---
export const COMBO_WINDOW_FRAMES = 90;
export const COMBO_BASE_SCORE = 50;
export const COMBO_BONUS_PER_STACK = 25;
export const COMBO_MAX_STACKS = 5;

// --- Critical hits ---
// Odds climb with combo stack, rewarding sustained aggression instead of being pure luck.
export const CRIT_BASE_CHANCE = 0.08;
export const CRIT_CHANCE_PER_STACK = 0.09;
export const CRIT_MAX_CHANCE = 0.65;
export const CRIT_SCORE_MULT = 2.5;
export const CRIT_KNOCKBACK_MULT = 2.1;
export const CRIT_HITSTOP_FRAMES = 12;
export const CRIT_SLOWMO_FRAMES = 22;
export const CRIT_SHAKE = 16;
export const CRIT_SPARK_COUNT = 26;
export const CRIT_FLASH_ALPHA = 0.55;
export const CRIT_FLASH_DECAY = 0.05;

// --- Enemy aggro / chase AI ---
export const AGGRO_RANGE_X = 170;
export const AGGRO_RANGE_Y = 60;
// Deaggro range is larger than aggro range so enemies don't flicker in/out of chase at the boundary.
export const DEAGGRO_RANGE_X = 260;
export const CHASE_SPEED_MULT = 2.1;
