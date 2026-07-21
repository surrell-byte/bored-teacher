#!/bin/bash
# Milestone 1 (Combat) — Critical Hits + Improved Enemy AI
# Run from the project root: bash apply-block-fight-crit-aggro-ai.sh
set -e

TARGET="games/block-fight"

if [ ! -d "$TARGET" ]; then
  echo "Error: run this script from your project root (expects $TARGET to exist)."
  exit 1
fi

echo "Applying critical hits + enemy aggro AI to $TARGET ..."

cat > "$TARGET/systems/types.ts" << 'FILE_EOF'
export type GameStatus = 'playing' | 'dead' | 'win';

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Platform = readonly [x: number, y: number, w: number, h: number];

export type Player = Rect & {
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  attackTimer: number;
  hp: number;
  invincible: number;
  jumpsUsed: number;
  dashTimer: number;
  dashCooldown: number;
};

export type Enemy = Rect & {
  vx: number;
  vy: number;
  alive: boolean;
  dying: boolean;
  deathTimer: number;
  platIdx: number;
  /** Base patrol speed (magnitude) — preserved separately from vx so chase can override direction/speed freely. */
  baseSpeed: number;
  /** True once the enemy has noticed the player and is actively chasing. */
  aggro: boolean;
};

export type Coin = {
  x: number;
  y: number;
  collected: boolean;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

export type FloatingText = {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  color: string;
  /** Crit labels render bigger, bolder, and with a glow. */
  crit?: boolean;
};

export type GameState = {
  player: Player;
  enemies: Enemy[];
  coins: Coin[];
  score: number;
  shake: number;
  hitStop: number;
  /** Frames remaining of post-hitstop slow motion (crit only) — simulation runs at half rate while this is active. */
  slowMo: number;
  /** Screen-flash overlay strength, 0..1, decays each frame — crit only. */
  flashAlpha: number;
  particles: Particle[];
  floatingTexts: FloatingText[];
  coyoteTime: number;
  jumpBuffer: number;
  dashBuffer: number;
  comboCount: number;
  comboTimer: number;
  gameState: GameStatus;
};

export type GameUi = {
  score: number;
  hp: number;
  state: GameStatus;
};

export type ControlsState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  dash: boolean;
};
FILE_EOF

cat > "$TARGET/systems/constants.ts" << 'FILE_EOF'
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
FILE_EOF

cat > "$TARGET/systems/effects.ts" << 'FILE_EOF'
import { CRIT_FLASH_DECAY } from './constants';
import { type GameState } from './types';

/** Bursts a ring of small particles outward from a point — used for hit sparks. */
export function spawnParticles(state: GameState, x: number, y: number, count: number, color: string) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const speed = 2 + Math.random() * 3.5;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 18 + Math.random() * 6,
      maxLife: 24,
      color,
      size: 2 + Math.random() * 2,
    });
  }
}

/** Spawns a floating combat-text label (e.g. "+50", "-1") that drifts up and fades. */
export function spawnFloatingText(state: GameState, x: number, y: number, text: string, color: string, crit = false) {
  state.floatingTexts.push({
    x,
    y,
    vy: crit ? -1.9 : -1.4,
    life: crit ? 52 : 40,
    maxLife: crit ? 52 : 40,
    text,
    color,
    crit,
  });
}

/** Advances all active particles and floating texts by one simulation frame. */
export function updateEffects(state: GameState) {
  state.particles = state.particles.filter(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.25;
    particle.vx *= 0.94;
    particle.life -= 1;
    return particle.life > 0;
  });

  state.floatingTexts = state.floatingTexts.filter(text => {
    text.y += text.vy;
    text.vy *= 0.96;
    text.life -= 1;
    return text.life > 0;
  });

  if (state.flashAlpha > 0) {
    state.flashAlpha = Math.max(0, state.flashAlpha - CRIT_FLASH_DECAY);
  }
}
FILE_EOF

cat > "$TARGET/systems/rendering.ts" << 'FILE_EOF'
import { type Coin, type Enemy, type FloatingText, type GameState, type Particle, type Platform, type Player } from './types';

function drawPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[]) {
  platforms.forEach(([px, py, pw, ph]) => {
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(px, py, pw, ph);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(px, py, pw, 4);
  });
}

function drawCoins(ctx: CanvasRenderingContext2D, coins: Coin[]) {
  coins.forEach(coin => {
    if (coin.collected) return;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(coin.x + 8, coin.y + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(coin.x + 6, coin.y + 6, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]) {
  enemies.forEach(enemy => {
    if (!enemy.alive) return;

    const flashing = enemy.dying && enemy.deathTimer > 14;
    const bodyAlpha = enemy.dying ? Math.max(enemy.deathTimer / 18, 0) : 1;

    ctx.globalAlpha = bodyAlpha;

    // Aggro tell: a pulsing orange outline so the player can read "this one is chasing me" at a glance.
    if (enemy.aggro && !enemy.dying) {
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2;
      ctx.strokeRect(enemy.x - 3, enemy.y - 3, enemy.w + 6, enemy.h + 6);
    }

    ctx.fillStyle = flashing ? '#fef2f2' : '#ef4444';
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = flashing ? '#ffffff' : '#fca5a5';
    ctx.fillRect(enemy.x + 4, enemy.y + 4, 8, 7);
    ctx.fillRect(enemy.x + 16, enemy.y + 4, 8, 7);
    ctx.fillStyle = flashing ? '#fecaca' : '#7f1d1d';
    ctx.fillRect(enemy.x + 8, enemy.y + 16, 12, 4);
    ctx.globalAlpha = 1;
  });
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(particle => {
    ctx.globalAlpha = Math.max(particle.life / particle.maxLife, 0);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  ctx.textAlign = 'center';
  texts.forEach(text => {
    ctx.globalAlpha = Math.max(text.life / text.maxLife, 0);
    if (text.crit) {
      ctx.font = 'bold 22px sans-serif';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
    } else {
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  const playerAlpha = player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0 ? 0.4 : 1;
  ctx.globalAlpha = playerAlpha;
  ctx.fillStyle = player.dashTimer > 0 ? '#818cf8' : '#6366f1';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#a5b4fc';
  const eyeX = player.facing > 0 ? player.x + 18 : player.x + 6;
  ctx.fillRect(eyeX, player.y + 7, 6, 6);
  if (player.attackTimer > 0) {
    ctx.fillStyle = '#fbbf24';
    const hitX = player.facing > 0 ? player.x + player.w : player.x - 20;
    ctx.fillRect(hitX, player.y + 4, 20, player.h - 8);
  }
  ctx.globalAlpha = 1;
}

function drawCombo(ctx: CanvasRenderingContext2D, state: GameState) {
  if (state.comboCount <= 1 || state.comboTimer <= 0) return;

  ctx.globalAlpha = Math.min(state.comboTimer / 20, 1);
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#f472b6';
  ctx.fillText(`x${state.comboCount} COMBO`, 780, 36);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState, platforms: Platform[]) {
  const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
  const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 800, 424);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  [[50, 30], [150, 60], [300, 20], [500, 45], [650, 25], [720, 55], [400, 35]].forEach(([x, y]) => {
    ctx.fillRect(x, y, 2, 2);
  });

  drawPlatforms(ctx, platforms);
  drawCoins(ctx, state.coins);
  drawEnemies(ctx, state.enemies);
  drawPlayer(ctx, state.player);
  drawParticles(ctx, state.particles);
  drawFloatingTexts(ctx, state.floatingTexts);

  ctx.restore();

  // Crit screen flash — drawn in screen space (after restore) so shake doesn't move the overlay.
  if (state.flashAlpha > 0) {
    ctx.globalAlpha = state.flashAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 424);
    ctx.globalAlpha = 1;
  }

  drawCombo(ctx, state);
}
FILE_EOF

cat > "$TARGET/hooks/useEnemies.ts" << 'FILE_EOF'
import {
  AGGRO_RANGE_X,
  AGGRO_RANGE_Y,
  CHASE_SPEED_MULT,
  COMBO_BASE_SCORE,
  COMBO_BONUS_PER_STACK,
  COMBO_MAX_STACKS,
  COMBO_WINDOW_FRAMES,
  CRIT_BASE_CHANCE,
  CRIT_CHANCE_PER_STACK,
  CRIT_FLASH_ALPHA,
  CRIT_HITSTOP_FRAMES,
  CRIT_KNOCKBACK_MULT,
  CRIT_MAX_CHANCE,
  CRIT_SCORE_MULT,
  CRIT_SHAKE,
  CRIT_SLOWMO_FRAMES,
  CRIT_SPARK_COUNT,
  DEAGGRO_RANGE_X,
  ENEMY_DEATH_FRAMES,
  ENEMY_DEATH_GRAVITY,
  HITSTOP_HURT_FRAMES,
  HITSTOP_KO_FRAMES,
  KNOCKBACK_ENEMY_VX,
  KNOCKBACK_ENEMY_VY,
  KNOCKBACK_PLAYER_VX,
  KNOCKBACK_PLAYER_VY,
  SHAKE_HIT,
  SHAKE_HURT,
  SPARK_COUNT_HIT,
  SPARK_COUNT_HURT,
} from '../systems/constants';
import { intersects } from '../systems/collisions';
import { spawnFloatingText, spawnParticles } from '../systems/effects';
import { type GameState, type GameUi, type Platform, type Rect } from '../systems/types';

type UiSetter = React.Dispatch<React.SetStateAction<GameUi>>;

function getAttackHitbox(player: GameState['player']): Rect {
  return {
    x: player.x + (player.facing > 0 ? player.w : -24),
    y: player.y + 4,
    w: 24,
    h: player.h - 8,
  };
}

export function updateEnemies(state: GameState, platforms: Platform[], setUi: UiSetter) {
  const player = state.player;

  state.enemies.forEach(enemy => {
    if (!enemy.alive) return;

    // Already-defeated enemies just play out their knockback arc and fade — no more collisions.
    if (enemy.dying) {
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
      enemy.vy += ENEMY_DEATH_GRAVITY;
      enemy.vx *= 0.96;
      enemy.deathTimer -= 1;
      if (enemy.deathTimer <= 0) enemy.alive = false;
      return;
    }

    // --- Aggro detection, with hysteresis so enemies don't flicker in/out of chase at the range boundary ---
    const dxToPlayer = player.x + player.w / 2 - (enemy.x + enemy.w / 2);
    const dyToPlayer = Math.abs(player.y + player.h / 2 - (enemy.y + enemy.h / 2));
    const distXToPlayer = Math.abs(dxToPlayer);

    if (!enemy.aggro && distXToPlayer < AGGRO_RANGE_X && dyToPlayer < AGGRO_RANGE_Y) {
      enemy.aggro = true;
    } else if (enemy.aggro && distXToPlayer > DEAGGRO_RANGE_X) {
      enemy.aggro = false;
    }

    if (enemy.aggro) {
      // Chase: accelerate straight toward the player, faster than the idle patrol speed.
      enemy.vx = Math.sign(dxToPlayer || 1) * enemy.baseSpeed * CHASE_SPEED_MULT;
    }

    enemy.x += enemy.vx;
    const platform = platforms[enemy.platIdx];
    const [px, , pw] = platform;

    // Enemies never leave their home platform, chasing or not — an edge just turns a patroller around;
    // a chaser gets pinned at the edge for a frame and immediately re-aims next frame.
    if (enemy.x < px) {
      enemy.x = px;
      enemy.vx = enemy.aggro ? 0 : Math.abs(enemy.vx);
    }
    if (enemy.x + enemy.w > px + pw) {
      enemy.x = px + pw - enemy.w;
      enemy.vx = enemy.aggro ? 0 : -Math.abs(enemy.vx);
    }

    if (player.attackTimer > 0 && intersects(getAttackHitbox(player), enemy)) {
      enemy.dying = true;
      enemy.deathTimer = ENEMY_DEATH_FRAMES;

      // Kills within the combo window chain together for escalating score, juice, and crit odds.
      state.comboCount = Math.min(state.comboCount + 1, COMBO_MAX_STACKS);
      state.comboTimer = COMBO_WINDOW_FRAMES;
      const stack = state.comboCount;
      const bonusStacks = Math.min(stack - 1, 3);

      const critChance = Math.min(CRIT_BASE_CHANCE + (stack - 1) * CRIT_CHANCE_PER_STACK, CRIT_MAX_CHANCE);
      const isCrit = Math.random() < critChance;

      const basePoints = COMBO_BASE_SCORE + (stack - 1) * COMBO_BONUS_PER_STACK;
      const points = isCrit ? Math.round(basePoints * CRIT_SCORE_MULT) : basePoints;
      const knockbackMult = isCrit ? CRIT_KNOCKBACK_MULT : 1;

      enemy.vx = KNOCKBACK_ENEMY_VX * knockbackMult * player.facing;
      enemy.vy = KNOCKBACK_ENEMY_VY * knockbackMult;

      const sparkColor = isCrit ? '#fef08a' : stack > 1 ? '#f472b6' : '#fde68a';
      const label = stack > 1 ? `+${points} x${stack}` : `+${points}`;

      state.score += points;

      if (isCrit) {
        // Crits get a harder snap, then real slow motion (the sim runs at half rate) instead of just a longer freeze.
        state.shake = Math.max(state.shake, CRIT_SHAKE);
        state.hitStop = CRIT_HITSTOP_FRAMES;
        state.slowMo = CRIT_SLOWMO_FRAMES;
        state.flashAlpha = CRIT_FLASH_ALPHA;
        spawnParticles(state, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, CRIT_SPARK_COUNT, sparkColor);
        spawnFloatingText(state, enemy.x + enemy.w / 2, enemy.y - 14, 'CRIT!', '#fde047', true);
        spawnFloatingText(state, enemy.x + enemy.w / 2, enemy.y + 12, label, sparkColor);
      } else {
        state.shake = Math.max(state.shake, SHAKE_HIT + bonusStacks * 1.5);
        state.hitStop = HITSTOP_KO_FRAMES + bonusStacks;
        spawnParticles(state, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, SPARK_COUNT_HIT + bonusStacks * 2, sparkColor);
        spawnFloatingText(state, enemy.x + enemy.w / 2, enemy.y, label, sparkColor);
      }

      setUi(ui => ({ ...ui, score: state.score }));
      return;
    }

    if (player.invincible === 0 && intersects(player, enemy)) {
      player.hp--;
      player.invincible = 60;

      const pushDir = player.x + player.w / 2 < enemy.x + enemy.w / 2 ? -1 : 1;
      player.vx = KNOCKBACK_PLAYER_VX * pushDir;
      player.vy = KNOCKBACK_PLAYER_VY;

      state.shake = SHAKE_HURT;
      state.hitStop = HITSTOP_HURT_FRAMES;
      spawnParticles(state, player.x + player.w / 2, player.y + player.h / 2, SPARK_COUNT_HURT, '#f87171');
      spawnFloatingText(state, player.x + player.w / 2, player.y, '-1', '#f87171');
      setUi(ui => ({ ...ui, hp: player.hp }));
      if (player.hp <= 0) {
        state.gameState = 'dead';
        setUi(ui => ({ ...ui, state: 'dead', hp: 0 }));
      }
    }
  });
}
FILE_EOF

cat > "$TARGET/data/enemies.ts" << 'FILE_EOF'
import { type Enemy } from '../systems/types';

const ENEMIES_INIT: Enemy[] = [
  { x: 300, y: 304, vx: 1.5, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 2, baseSpeed: 1.5, aggro: false },
  { x: 560, y: 224, vx: -1.2, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 4, baseSpeed: 1.2, aggro: false },
  { x: 200, y: 384, vx: 1.8, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 0, baseSpeed: 1.8, aggro: false },
  { x: 450, y: 304, vx: -1.5, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 3, baseSpeed: 1.5, aggro: false },
  { x: 620, y: 284, vx: 1.2, vy: 0, w: 28, h: 28, alive: true, dying: false, deathTimer: 0, platIdx: 5, baseSpeed: 1.2, aggro: false },
];

export function createEnemies(): Enemy[] {
  return ENEMIES_INIT.map(enemy => ({ ...enemy }));
}
FILE_EOF

cat > "$TARGET/systems/spawning.ts" << 'FILE_EOF'
import { PLAYER_MAX_HP, PLAYER_START } from './constants';
import { type GameState, type GameUi } from './types';
import { createEnemies } from '../data/enemies';
import { createCoins } from '../data/levels';

export function createInitialState(): GameState {
  return {
    player: {
      ...PLAYER_START,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      attackTimer: 0,
      hp: PLAYER_MAX_HP,
      invincible: 0,
      jumpsUsed: 0,
      dashTimer: 0,
      dashCooldown: 0,
    },
    enemies: createEnemies(),
    coins: createCoins(),
    score: 0,
    shake: 0,
    hitStop: 0,
    slowMo: 0,
    flashAlpha: 0,
    particles: [],
    floatingTexts: [],
    coyoteTime: 0,
    jumpBuffer: 0,
    dashBuffer: 0,
    comboCount: 0,
    comboTimer: 0,
    gameState: 'playing',
  };
}

export function createInitialUi(): GameUi {
  return { score: 0, hp: PLAYER_MAX_HP, state: 'playing' };
}
FILE_EOF

cat > "$TARGET/BlockFight.tsx" << 'FILE_EOF'
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameLayout } from '@/engine';
import HUD from './components/HUD';
import GameOver from './components/GameOver';
import { PLATFORMS } from './data/levels';
import { updateEffects } from './systems/effects';
import { drawGame } from './systems/rendering';
import { createInitialState, createInitialUi } from './systems/spawning';
import { type GameState, type GameUi } from './systems/types';
import { updateCollectibles, updateWinCondition } from './hooks/useCollision';
import { useControls } from './hooks/useControls';
import { updateEnemies } from './hooks/useEnemies';
import { updatePhysics } from './hooks/usePhysics';

type BlockFightProps = {
  onComplete?: (score: number, accuracy: number) => void;
};

export default function BlockFight({ onComplete }: BlockFightProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const [ui, setUi] = useState<GameUi>(createInitialUi);

    const restart = useCallback(() => {
    stateRef.current = createInitialState();
    setUi(createInitialUi());
  }, []);

  const controlsRef = useControls(stateRef, restart);

  // Report the result back to the game page once the run ends.
  useEffect(() => {
    if (ui.state === 'win') onComplete?.(ui.score, 100);
    else if (ui.state === 'dead') onComplete?.(ui.score, 0);
  }, [ui.state, ui.score, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;
    const ctx: CanvasRenderingContext2D = context;

    let animationId = 0;
    stateRef.current = createInitialState();

    function update() {
      const state = stateRef.current;
      if (!state || state.gameState !== 'playing') return;

      // Freeze the whole simulation for a few frames on impact — this is what gives hits "weight".
      if (state.hitStop > 0) {
        state.hitStop -= 1;
        return;
      }

      // Crit follow-through: real slow motion (simulation runs at half rate) rather than another freeze,
      // so the launch and particles are still visibly playing out, just stretched.
      if (state.slowMo > 0) {
        state.slowMo -= 1;
        if (state.slowMo % 2 === 0) return;
      }

      updatePhysics(state, controlsRef.current, PLATFORMS, setUi);
      if (state.gameState !== 'playing') return;

      updateEnemies(state, PLATFORMS, setUi);
      updateCollectibles(state, setUi);
      updateWinCondition(state, setUi);
      updateEffects(state);
    }

    function loop() {
      const state = stateRef.current;
      if (state) {
        update();
        drawGame(ctx, state, PLATFORMS);
      }
      animationId = requestAnimationFrame(loop);
    }

    loop();

    return () => cancelAnimationFrame(animationId);
  }, [controlsRef]);

  return (
    <GameLayout
      header={<HUD score={ui.score} hp={ui.hp} />}
      controls={
        <p style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
          ← → Move &nbsp;·&nbsp; ↑ / Space Jump (x2 in air) &nbsp;·&nbsp; X / Shift Attack &nbsp;·&nbsp; C Dash &nbsp;·&nbsp; R Restart
        </p>
      }
    >
      <div style={{
        minHeight: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#020617', fontFamily: "'Segoe UI', sans-serif", padding: 16, borderRadius: 12,
      }}>
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={424}
            style={{ border: '2px solid #1e293b', borderRadius: 12, display: 'block', maxWidth: '100%', height: 'auto' }}
          />

          {ui.state !== 'playing' && (
            <GameOver score={ui.score} state={ui.state} onRestart={restart} />
          )}
        </div>
      </div>
    </GameLayout>
  );
}
FILE_EOF

echo "Done. Changes applied:"
echo "  - systems/types.ts       (Enemy.aggro/baseSpeed, GameState.slowMo/flashAlpha, FloatingText.crit)"
echo "  - systems/constants.ts   (CRIT_* and AGGRO_*/DEAGGRO_*/CHASE_SPEED_MULT tuning)"
echo "  - systems/effects.ts     (crit-styled floating text, flash decay)"
echo "  - systems/rendering.ts   (crit text glow, aggro outline, screen flash overlay)"
echo "  - hooks/useEnemies.ts    (aggro/chase logic, critical hit roll + effects)"
echo "  - data/enemies.ts        (baseSpeed + aggro seed fields)"
echo "  - systems/spawning.ts    (init slowMo/flashAlpha)"
echo "  - BlockFight.tsx         (half-rate slow-motion loop handling)"
echo ""
echo "Test: build combo stacks (chain kills within the combo window) — crit odds climb"
echo "with your stack, topping out at 65%. Get close to an enemy and watch for the"
echo "orange aggro outline as it starts chasing you."
