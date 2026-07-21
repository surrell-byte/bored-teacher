import {
  instantiateCoins,
  instantiateEnemies,
  instantiateGates,
  instantiateNpc,
  instantiateSavePoint,
  instantiateSecretWalls,
  WORLDS,
} from '../data/worlds';
import { getAttackHitbox } from './combat';
import { intersects } from './collisions';
import { setToast, spawnFloatingText, spawnParticles } from './effects';
import { saveProgress } from './save';
import { type GameState, type GameUi, type Platform, type WorldId } from './types';

type UiSetter = React.Dispatch<React.SetStateAction<GameUi>>;

/** Swaps in a new world's enemies/coins/gates/etc and drops the player at its entry point. */
export function applyWorld(state: GameState, worldId: WorldId, setUi?: UiSetter) {
  const world = WORLDS[worldId];

  state.worldId = worldId;
  state.enemies = instantiateEnemies(world);
  state.coins = instantiateCoins(world);
  state.gates = instantiateGates(world, state.unlocked);
  state.secretWalls = instantiateSecretWalls(world);
  state.npc = instantiateNpc(world, state.unlocked);
  state.savePoint = instantiateSavePoint(world);
  state.justSaved = false;
  state.worldClearTimer = 0;

  state.player.x = world.playerStart.x;
  state.player.y = world.playerStart.y;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.jumpsUsed = 0;
  state.player.dashTimer = 0;

  setUi?.(ui => ({ ...ui, worldName: world.theme.name }));
}

/** The world's base platforms plus any unbroken secret walls, which act as solid terrain until destroyed. */
export function getActivePlatforms(state: GameState): Platform[] {
  const world = WORLDS[state.worldId];
  const wallPlatforms = state.secretWalls
    .filter(wall => !wall.broken)
    .map((wall): Platform => [wall.x, wall.y, wall.w, wall.h]);
  return wallPlatforms.length ? [...world.platforms, ...wallPlatforms] : world.platforms;
}

export function updateWorld(state: GameState, setUi: UiSetter) {
  const world = WORLDS[state.worldId];
  const player = state.player;

  // Counting down after a world-clear: either hand control back to the village, or — if this
  // was the last world — trigger the overall win screen.
  if (state.worldClearTimer > 0) {
    state.worldClearTimer -= 1;
    if (state.worldClearTimer === 0) {
      if (!world.unlocksOnClear && state.worldId !== 'village') {
        state.gameState = 'win';
        setUi(ui => ({ ...ui, state: 'win' }));
      } else {
        applyWorld(state, 'village', setUi);
      }
    }
    return;
  }

  // Gates — walking into one travels to that world, if it's unlocked. The village's gates lead
  // out to combat worlds; each combat world has one gate leading back, always unlocked.
  for (const gate of state.gates) {
    if (intersects(player, gate)) {
      if (gate.locked) {
        setToast(state, `Locked — clear ${WORLDS[state.worldId].theme.name} first`, '#f87171');
      } else {
        applyWorld(state, gate.targetWorld, setUi);
      }
      return;
    }
  }

  // Secret walls — chip away at them with attacks; breaking one reveals bonus coins.
  state.secretWalls.forEach(wall => {
    if (wall.broken) return;
    if (wall.hitCooldown > 0) wall.hitCooldown -= 1;
    if (wall.hitCooldown === 0 && player.attackTimer > 0 && intersects(getAttackHitbox(player), wall)) {
      wall.hp -= 1;
      wall.hitCooldown = 20;
      spawnParticles(state, wall.x + wall.w / 2, wall.y + wall.h / 2, 8, '#a8a29e');
      state.shake = Math.max(state.shake, 5);
      if (wall.hp <= 0) {
        wall.broken = true;
        state.coins.push(
          { x: wall.x, y: wall.y - 10, collected: false },
          { x: wall.x + 16, y: wall.y - 10, collected: false },
        );
        spawnFloatingText(state, wall.x + wall.w / 2, wall.y, 'Secret found!', '#fde047');
        setToast(state, 'A hidden passage crumbles away...', '#fde047');
      }
    }
  });

  // Save point — touch it to write progress to localStorage. justSaved debounces so it
  // only writes once per visit instead of every frame you're standing on it.
  if (state.savePoint) {
    const onSavePoint = intersects(player, state.savePoint);
    if (onSavePoint && !state.justSaved) {
      saveProgress({ unlocked: state.unlocked, score: state.score });
      state.justSaved = true;
      setToast(state, 'Game saved', world.theme.accent);
    } else if (!onSavePoint) {
      state.justSaved = false;
    }
  }

  // World cleared? (combat worlds only — the village hub has no enemies to trigger this.)
  if (world.enemies.length > 0 && state.enemies.every(enemy => !enemy.alive) && state.coins.every(coin => coin.collected)) {
    if (world.unlocksOnClear) state.unlocked[world.unlocksOnClear] = true;
    saveProgress({ unlocked: state.unlocked, score: state.score });
    setToast(
      state,
      world.unlocksOnClear
        ? `${world.theme.name} cleared! ${WORLDS[world.unlocksOnClear].theme.name} is now open.`
        : `${world.theme.name} cleared!`,
      world.theme.accent,
    );
    state.worldClearTimer = 90;
  }
}
