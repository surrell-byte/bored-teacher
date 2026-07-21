import {
  ACCEL,
  ATTACK_FRAMES,
  COYOTE_FRAMES,
  FALL_LIMIT,
  FRICTION,
  GRAVITY,
  HITSTOP_HURT_FRAMES,
  JUMP_POWER,
  MAX_SPEED,
  PLAYER_START,
  SHAKE_HURT,
  SPARK_COUNT_HURT,
} from '../systems/constants';
import { resolvePlatformCollisions } from '../systems/collisions';
import { spawnFloatingText, spawnParticles } from '../systems/effects';
import { type ControlsState, type GameState, type GameUi, type Platform } from '../systems/types';

type UiSetter = React.Dispatch<React.SetStateAction<GameUi>>;

export function updatePhysics(
  state: GameState,
  controls: ControlsState,
  platforms: Platform[],
  setUi: UiSetter,
) {
  const player = state.player;

  if (player.invincible > 0) player.invincible--;
  if (state.shake > 0) state.shake -= 1.5;
  if (state.coyoteTime > 0) state.coyoteTime--;
  if (state.jumpBuffer > 0) state.jumpBuffer--;
  if (player.attackTimer > 0) player.attackTimer--;

  if (controls.left) {
    player.vx -= ACCEL;
    player.facing = -1;
  }
  if (controls.right) {
    player.vx += ACCEL;
    player.facing = 1;
  }

  player.vx *= FRICTION;
  player.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, player.vx));

  if (player.onGround) state.coyoteTime = COYOTE_FRAMES;
  if (state.jumpBuffer > 0 && state.coyoteTime > 0) {
    player.vy = JUMP_POWER;
    state.coyoteTime = 0;
    state.jumpBuffer = 0;
  }

  if (controls.attack) player.attackTimer = ATTACK_FRAMES;

  player.vy += GRAVITY;
  resolvePlatformCollisions(player, platforms);

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > 800) player.x = 800 - player.w;
  if (player.y > FALL_LIMIT) {
    player.hp--;
    player.x = PLAYER_START.x;
    player.y = PLAYER_START.y;
    player.vx = 0;
    player.vy = 0;
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
}
