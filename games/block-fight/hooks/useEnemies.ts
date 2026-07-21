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
import { getAttackHitbox } from '../systems/combat';
import { intersects } from '../systems/collisions';
import { spawnFloatingText, spawnParticles } from '../systems/effects';
import { type GameState, type GameUi, type Platform } from '../systems/types';

type UiSetter = React.Dispatch<React.SetStateAction<GameUi>>;

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
