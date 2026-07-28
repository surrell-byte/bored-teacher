import { useEffect, useRef } from 'react';
import { dragonFor } from '../data/dragons';
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
        state.blocks.filter(block => block.alive).forEach(block => { context.fillStyle = '#a86734'; context.fillRect(block.x, block.y, block.w, block.h); context.strokeStyle = '#e8b36e'; context.strokeRect(block.x, block.y, block.w, block.h); });
        state.enemies.filter(enemy => enemy.alive).forEach(enemy => { context.save(); context.translate(enemy.x, enemy.y + Math.sin(tick / 210 + enemy.x) * 3); context.fillStyle = enemy.type === 'boss' ? '#7a113d' : '#3c7a14'; context.shadowColor = enemy.type === 'boss' ? '#ff1593' : '#a8ff44'; context.shadowBlur = 16; context.beginPath(); context.arc(0, 0, enemy.type === 'boss' ? 30 : 14, 0, Math.PI * 2); context.fill(); context.shadowBlur = 0; context.fillStyle = '#ffdd48'; context.fillRect(-7, -3, 4, 4); context.fillRect(3, -3, 4, 4); if (enemy.type === 'boss') { context.fillStyle = '#251020'; context.fillRect(-32, -47, 64, 7); context.fillStyle = '#ec4668'; context.fillRect(-32, -47, 64 * (enemy.hp / enemy.maxHp), 7); } context.restore(); });
        const pull = state.pull;
        const dragon = state.dragon ?? { x: WORLD.sling.x + pull.x, y: WORLD.sling.y + pull.y };
        context.strokeStyle = '#a76e3c'; context.lineWidth = 8; context.beginPath(); context.moveTo(105, 350); context.lineTo(WORLD.sling.x, WORLD.sling.y); context.lineTo(155, 350); context.stroke();
        context.strokeStyle = '#ebd0a1'; context.lineWidth = 2; context.beginPath(); context.moveTo(105, 350); context.lineTo(dragon.x, dragon.y); context.lineTo(155, 350); context.stroke();
        const dragonData = dragonFor(state.queue[state.dragonIndex]); context.font = '38px sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.shadowColor = dragonData.color; context.shadowBlur = 18; context.fillText(dragonData.emoji, dragon.x, dragon.y); context.shadowBlur = 0;
        if (state.dragging) { context.setLineDash([5, 7]); context.strokeStyle = 'rgba(255,220,130,.75)'; context.beginPath(); let x = dragon.x, y = dragon.y, vx = -pull.x * .31, vy = -pull.y * .31; for (let index = 0; index < 28; index += 1) { x += vx; y += vy; vy += .44; index ? context.lineTo(x, y) : context.moveTo(x, y); } context.stroke(); context.setLineDash([]); }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [game]);
  const position = event => { const rect = canvasRef.current.getBoundingClientRect(); return { x: (event.clientX - rect.left) * WORLD.width / rect.width, y: (event.clientY - rect.top) * WORLD.height / rect.height }; };
  return <canvas ref={canvasRef} className="dragon-sling-canvas" width={WORLD.width} height={WORLD.height} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); onPointer('start', position(event)); }} onPointerMove={event => onPointer('move', position(event))} onPointerUp={event => onPointer('end', position(event))} onDoubleClick={onAbility} aria-label="Dragon slingshot game board" />;
}
