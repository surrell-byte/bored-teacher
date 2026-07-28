import { useEffect, useRef } from 'react';
import { dragonFor } from '../data/dragons';
import { ATLAS_URL, createAtlasSprites, createDragonSprite, dragonAnimation } from '../data/atlas';
import { LEVELS } from '../data/levels';
import { WORLD } from '../engine/physics';

const BACKGROUNDS = {
  volcano: ['#1b0710', '#6d1708'], ice: ['#07182a', '#237da5'], storm: ['#15092c', '#48217b'], forest: ['#071a11', '#245a28'], desert: ['#2b1705', '#9f5a18'], ocean: ['#061a31', '#086a8f'], sky: ['#122a57', '#4c83c6'], lavacore: ['#240406', '#8c1808'], crystal: ['#120a2e', '#5b2f8f'], boss: ['#17020b', '#64002a'],
};

export default function DragonCanvas({ game, onPointer, onAbility }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const atlas = new Image();
    atlas.src = ATLAS_URL;
    let sprites = null;
    let dragonSprite = null;
    let lastDragonId = null;
    let lastPhase = null;
    let frame;
    const draw = tick => {
      const state = game.current;
      const level = state ? LEVELS[state.level] : LEVELS[0];
      const [top, bottom] = BACKGROUNDS[level.biome];
      const gradient = context.createLinearGradient(0, 0, 0, WORLD.height);
      gradient.addColorStop(0, top); gradient.addColorStop(1, bottom);
      context.fillStyle = gradient; context.fillRect(0, 0, WORLD.width, WORLD.height);
      context.fillStyle = 'rgba(255,225,165,.65)';
      for (let index = 0; index < 55; index += 1) { const x = (index * 97) % WORLD.width; const y = (index * 43) % 240; context.globalAlpha = .25 + Math.sin(tick / 500 + index) * .15; context.fillRect(x, y, 2, 2); }
      context.globalAlpha = 1;
      context.fillStyle = '#1a1010'; context.fillRect(0, 378, WORLD.width, 42);
      if (state) {
        state.blocks.filter(block => block.alive).forEach(block => {
          sprites.tower.draw(context, block.x + block.w / 2, block.y + block.h / 2, 0, { scale: Math.max(block.w / 93, block.h / 162) * 1.15 });
        });
        state.enemies.filter(enemy => enemy.alive).forEach(enemy => {
          const y = enemy.y + Math.sin(tick / 210 + enemy.x) * 3;
          (enemy.type === 'boss' ? sprites.boss : sprites.goblin).draw(context, enemy.x, y);
          if (enemy.type === 'boss') { context.fillStyle = '#251020'; context.fillRect(enemy.x - 32, y - 54, 64, 7); context.fillStyle = '#ec4668'; context.fillRect(enemy.x - 32, y - 54, 64 * (enemy.hp / enemy.maxHp), 7); }
        });
        const pull = state.pull;
        const dragon = state.dragon ?? { x: WORLD.sling.x + pull.x, y: WORLD.sling.y + pull.y };
        context.strokeStyle = '#a76e3c'; context.lineWidth = 8; context.beginPath(); context.moveTo(105, 350); context.lineTo(WORLD.sling.x, WORLD.sling.y); context.lineTo(155, 350); context.stroke();
        context.strokeStyle = '#ebd0a1'; context.lineWidth = 2; context.beginPath(); context.moveTo(105, 350); context.lineTo(dragon.x, dragon.y); context.lineTo(155, 350); context.stroke();
        const dragonData = dragonFor(state.queue[state.dragonIndex]);
        const animationState = state.phase === 'flying' ? 'fly' : 'idle';
        if (dragonSprite === null || lastDragonId !== dragonData.id || lastPhase !== animationState) {
          dragonSprite = createDragonSprite(atlas, dragonData.id, animationState);
          lastDragonId = dragonData.id;
          lastPhase = animationState;
        }
        dragonSprite.draw(context, dragon.x, dragon.y, dragonAnimation.frameAt(tick));
        if (state.dragging) { context.setLineDash([5, 7]); context.strokeStyle = 'rgba(255,220,130,.75)'; context.beginPath(); let x = dragon.x, y = dragon.y, vx = -pull.x * .31, vy = -pull.y * .31; for (let index = 0; index < 28; index += 1) { x += vx; y += vy; vy += .44; index ? context.lineTo(x, y) : context.moveTo(x, y); } context.stroke(); context.setLineDash([]); }
      }
      frame = requestAnimationFrame(draw);
    };
    atlas.onload = () => { sprites = createAtlasSprites(atlas); dragonSprite = null; lastDragonId = null; lastPhase = null; frame = requestAnimationFrame(draw); };
    return () => cancelAnimationFrame(frame);
  }, [game]);
  const position = event => { const rect = canvasRef.current.getBoundingClientRect(); return { x: (event.clientX - rect.left) * WORLD.width / rect.width, y: (event.clientY - rect.top) * WORLD.height / rect.height }; };
  return <canvas ref={canvasRef} className="dragon-sling-canvas" width={WORLD.width} height={WORLD.height} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); onPointer('start', position(event)); }} onPointerMove={event => onPointer('move', position(event))} onPointerUp={event => onPointer('end', position(event))} onDoubleClick={onAbility} aria-label="Dragon slingshot game board" />;
}
