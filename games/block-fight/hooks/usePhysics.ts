import {
  ACCEL,
  AIR_JUMP_POWER_MULT,
  ATTACK_FRAMES,
  COYOTE_FRAMES,
  DASH_COOLDOWN_FRAMES,
  DASH_FRAMES,
  DASH_SPEED,
  FALL_LIMIT,
  FRICTION,
  GRAVITY,
  HITSTOP_HURT_FRAMES,
  JUMP_POWER,
  MAX_JUMPS,
  MAX_SPEED,
  PLAYER_START,
  SHAKE_HURT,
  SPARK_COUNT_DASH,
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
  if (player.dashCooldown > 0) player.dashCooldown--;
  if (state.dashBuffer > 0) state.dashBuffer--;
  if (state.comboTimer > 0) {
    state.comboTimer--;
    if (state.comboTimer === 0) state.comboCount = 0;
  }

  // Trigger a new dash on a buffered press, once any previous dash and its cooldown have cleared.
  if (state.dashBuffer > 0 && player.dashCooldown <= 0 && player.dashTimer <= 0) {
    player.dashTimer = DASH_FRAMES;
    player.dashCooldown = DASH_COOLDOWN_FRAMES;
    player.vx = DASH_SPEED * player.facing;
    player.invincible = Math.max(player.invincible, DASH_FRAMES);
    state.dashBuffer = 0;
    spawnParticles(state, player.x + player.w / 2, player.y + player.h / 2, SPARK_COUNT_DASH, '#818cf8');
  }

  if (player.dashTimer > 0) {
    // Velocity is locked to the dash burst — no accel/friction/jump input while it's active.
    player.dashTimer--;
    if (player.dashTimer % 2 === 0) {
      spawnParticles(state, player.x + player.w / 2, player.y + player.h / 2, 2, '#a5b4fc');
    }
  } else {
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

    if (player.onGround) {
      state.coyoteTime = COYOTE_FRAMES;
      player.jumpsUsed = 0;
    }

    const canGroundJump = state.coyoteTime > 0;
    const canAirJump = !canGroundJump && player.jumpsUsed < MAX_JUMPS;

    if (state.jumpBuffer > 0 && (canGroundJump || canAirJump)) {
      player.vy = canGroundJump ? JUMP_POWER : JUMP_POWER * AIR_JUMP_POWER_MULT;
      player.jumpsUsed += 1;
      state.coyoteTime = 0;
      state.jumpBuffer = 0;
      spawnParticles(state, player.x + player.w / 2, player.y + player.h, 5, '#c7d2fe');
    }
  }

  if (controls.attack) player.attackTimer = ATTACK_FRAMES;

  // Gravity always applies, dash or not — this keeps ground detection correct
  // (resolvePlatformCollisions only sets onGround while vy is actually falling).
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
    player.jumpsUsed = 0;
    player.dashTimer = 0;
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
