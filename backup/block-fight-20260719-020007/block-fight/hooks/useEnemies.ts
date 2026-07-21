import {
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

    enemy.x += enemy.vx;
    const platform = platforms[enemy.platIdx];
    const [px, , pw] = platform;

    if (enemy.x < px) {
      enemy.x = px;
      enemy.vx *= -1;
    }
    if (enemy.x + enemy.w > px + pw) {
      enemy.x = px + pw - enemy.w;
      enemy.vx *= -1;
    }

    if (player.attackTimer > 0 && intersects(getAttackHitbox(player), enemy)) {
      enemy.dying = true;
      enemy.deathTimer = ENEMY_DEATH_FRAMES;
      enemy.vx = KNOCKBACK_ENEMY_VX * player.facing;
      enemy.vy = KNOCKBACK_ENEMY_VY;

      state.score += 50;
      state.shake = Math.max(state.shake, SHAKE_HIT);
      state.hitStop = HITSTOP_KO_FRAMES;
      spawnParticles(state, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, SPARK_COUNT_HIT, '#fde68a');
      spawnFloatingText(state, enemy.x + enemy.w / 2, enemy.y, '+50', '#fbbf24');
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
