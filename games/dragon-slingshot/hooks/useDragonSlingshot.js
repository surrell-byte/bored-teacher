import { useCallback, useEffect, useRef, useState } from 'react';
import { dragonFor } from '../data/dragons';
import { LEVELS } from '../data/levels';
import { WORLD, boundedPull, createLevel, pointInBlock } from '../engine/physics';

const cloneLevel = index => ({ blocks: LEVELS[index].blocks.map(block => ({ ...block, alive: true })), enemies: LEVELS[index].enemies.map(enemy => ({ ...enemy, alive: true, maxHp: enemy.hp })) });
const buildQueue = (chosen, count) => [chosen, ...Array.from({ length: count - 1 }, (_, index) => ['ember', 'frost', 'storm', 'shadow', 'nature'].filter(id => id !== chosen)[index % 4])];

export function useDragonSlingshot(onComplete) {
  const game = useRef(null);
  const [hud, setHud] = useState({ score: 0, level: 1, dragons: 0, ability: '' });
  const [overlay, setOverlay] = useState({ type: 'choose' });
  const frame = useRef();

  const sync = useCallback(() => {
    const state = game.current;
    if (!state) return;
    const dragon = dragonFor(state.queue[state.dragonIndex]);
    setHud({ score: state.score, level: state.level + 1, dragons: Math.max(0, state.queue.length - state.dragonIndex), ability: state.phase === 'flying' ? `${dragon.ability} — double tap to use` : dragon.ability });
  }, []);
  const loadLevel = useCallback((index, keepScore = true) => {
    const current = game.current;
    const chosen = current?.chosen ?? 'ember';
    const state = createLevel(index, chosen);
    Object.assign(state, cloneLevel(index), { chosen, queue: buildQueue(chosen, LEVELS[index].dragons), dragonIndex: 0, score: keepScore ? current?.score ?? 0 : 0 });
    game.current = state;
    sync();
  }, [sync]);
  const start = useCallback(chosen => {
    game.current = { chosen, score: 0 };
    loadLevel(0, false);
    setOverlay(null);
  }, [loadLevel]);
  const restart = useCallback(() => {
    if (game.current) loadLevel(game.current.level, false);
  }, [loadLevel]);
  const pointer = useCallback((kind, point) => {
    const state = game.current;
    if (!state || state.phase === 'over') return;
    if (kind === 'start' && state.phase === 'aim') state.dragging = true;
    if (kind === 'move' && state.dragging) state.pull = boundedPull(point);
    if (kind === 'end' && state.dragging) {
      state.dragging = false;
      if (Math.hypot(state.pull.x, state.pull.y) < 8) { state.pull = { x: 0, y: 0 }; return; }
      state.dragon = { x: WORLD.sling.x + state.pull.x, y: WORLD.sling.y + state.pull.y, vx: -state.pull.x * WORLD.stiffness, vy: -state.pull.y * WORLD.stiffness };
      state.pull = { x: 0, y: 0 };
      state.phase = 'flying';
      sync();
    }
  }, [sync]);
  const ability = useCallback(() => {
    const state = game.current;
    if (!state?.dragon || state.phase !== 'flying' || state.abilityUsed) return;
    state.abilityUsed = true;
    const dragon = dragonFor(state.queue[state.dragonIndex]);
    if (dragon.id === 'ember') state.enemies.forEach(enemy => { if (enemy.alive && Math.hypot(enemy.x - state.dragon.x, enemy.y - state.dragon.y) < 160) { enemy.hp -= 100; if (enemy.hp <= 0) { enemy.alive = false; state.score += 200; } } });
    if (dragon.id === 'frost') state.blocks.forEach(block => { if (block.alive) { block.alive = false; state.score += 55; } });
    if (dragon.id === 'storm') state.enemies.forEach(enemy => { if (enemy.alive) { enemy.alive = false; state.score += 200; } });
    if (dragon.id === 'shadow') { state.dragon.vx *= 2.3; state.dragon.vy *= -0.4; }
    if (dragon.id === 'nature') { state.blocks.filter(block => block.alive).slice(0, 3).forEach(block => { block.alive = false; state.score += 80; }); state.dragon.vy = -Math.abs(state.dragon.vy) * 1.4; }
    sync();
  }, [sync]);

  useEffect(() => {
    const update = () => {
      const state = game.current;
      if (state?.phase === 'flying' && state.dragon) {
        const dragon = state.dragon;
        dragon.x += dragon.vx; dragon.y += dragon.vy; dragon.vy += WORLD.gravity;
        state.blocks.forEach(block => { if (block.alive && pointInBlock(dragon, block)) { block.alive = false; state.score += 50; dragon.vx *= .65; dragon.vy *= .65; } });
        state.enemies.forEach(enemy => {
          if (!enemy.alive || Math.hypot(dragon.x - enemy.x, dragon.y - enemy.y) > (enemy.type === 'boss' ? 38 : 22)) return;
          enemy.hp -= enemy.type === 'boss' ? 50 : 1;
          dragon.vx *= -.4; dragon.vy = -Math.abs(dragon.vy) * .5;
          if (enemy.hp <= 0) { enemy.alive = false; state.score += enemy.type === 'boss' ? 4000 : 300; }
        });
        if (state.enemies.every(enemy => !enemy.alive)) {
          state.score += (state.queue.length - state.dragonIndex) * 100;
          state.phase = 'over';
          const complete = state.level === LEVELS.length - 1;
          setOverlay({ type: complete ? 'victory' : 'level', level: state.level + 1 });
          if (complete) onComplete?.(state.score, 100);
          sync();
        } else if (dragon.y > WORLD.height + 60 || dragon.x > WORLD.width + 60 || dragon.x < -80) {
          state.dragonIndex += 1; state.dragon = null; state.abilityUsed = false;
          if (state.dragonIndex >= state.queue.length) { state.phase = 'over'; setOverlay({ type: 'gameover' }); } else state.phase = 'aim';
          sync();
        }
      }
      frame.current = requestAnimationFrame(update);
    };
    frame.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame.current);
  }, [onComplete, sync]);

  return { game, hud, overlay, start, restart, loadLevel, pointer, ability, setOverlay };
}
