import { intersects } from '../engine/collisions';
import { type GameState, type GameUi, type Platform, type Rect } from '../engine/types';

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
      enemy.alive = false;
      state.score += 50;
      setUi(ui => ({ ...ui, score: state.score }));
    }

    if (player.invincible === 0 && intersects(player, enemy)) {
      player.hp--;
      player.invincible = 60;
      state.shake = 12;
      setUi(ui => ({ ...ui, hp: player.hp }));
      if (player.hp <= 0) {
        state.gameState = 'dead';
        setUi(ui => ({ ...ui, state: 'dead', hp: 0 }));
      }
    }
  });
}
