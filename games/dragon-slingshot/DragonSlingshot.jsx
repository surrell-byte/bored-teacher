'use client';

import { useEffect, useRef, useState } from 'react';
import { DRAGONS } from './data/dragons';
import { LEVELS } from './data/levels';

const WIDTH = 700;
const HEIGHT = 420;
const SLING = { x: 130, y: 305 };
const GRAVITY = 0.44;
const STIFFNESS = 0.155;
const MAX_PULL = 78;

function readStoredObject(key) {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export default function DragonSlingshot({ onComplete }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const frameRef = useRef(null);
  const [screen, setScreen] = useState('landing');
  const [hud, setHud] = useState({ score: 0, level: 1, dragons: 0, stars: 0 });
  const [bestScores, setBestScores] = useState(() => readStoredObject('ds_best_scores'));
  const [levelStars, setLevelStars] = useState(() => readStoredObject('ds_level_stars'));
  const currentLevelStars = Number(levelStars?.[hud.level] ?? 0);
  const starsForLevel = Number(hud.stars ?? currentLevelStars ?? 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let dragging = false;
    let lastTap = 0;

    const saveProgress = () => {
      localStorage.setItem('ds_best_scores', JSON.stringify(bestScores));
      localStorage.setItem('ds_level_stars', JSON.stringify(levelStars));
    };
    const floatingText = (x, y, label, color = '#fff') => {
      const game = gameRef.current;
      if (game) game.parts.push({ x, y, vx: 0, vy: -1.3, life: 1.2, color, size: 14, text: true, label });
    };
    const addCombo = (points, x, y) => {
      const game = gameRef.current;
      if (!game) return;
      game.combo += 1;
      game.maxCombo = Math.max(game.maxCombo, game.combo);
      const multiplier = Math.min(game.combo, 10);
      const bonus = Math.floor(points * multiplier);
      game.score += bonus;
      if (game.combo >= 2) floatingText(x, y, `COMBO x${multiplier} +${bonus}`, multiplier >= 5 ? '#ffcc22' : '#ffaa44');
    };

    const position = event => {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * WIDTH / rect.width, y: (event.clientY - rect.top) * HEIGHT / rect.height };
    };
    const pull = point => {
      const game = gameRef.current;
      if (!game) return;
      const dx = point.x - SLING.x;
      const dy = point.y - SLING.y;
      const distance = Math.min(Math.hypot(dx, dy), MAX_PULL);
      const angle = Math.atan2(dy, dx);
      game.pull = { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
    };
    const release = () => {
      const game = gameRef.current;
      if (!game || !dragging) return;
      dragging = false;
      if (Math.hypot(game.pull.x, game.pull.y) < 8) { game.pull = { x: 0, y: 0 }; return; }
      game.dragon = { x: SLING.x + game.pull.x, y: SLING.y + game.pull.y, vx: -game.pull.x * STIFFNESS * 2, vy: -game.pull.y * STIFFNESS * 2 };
      game.pull = { x: 0, y: 0 };
      game.phase = 'flying';
    };
    const ability = () => {
      const game = gameRef.current;
      const now = Date.now();
      if (!game?.dragon || game.abilityUsed || now - lastTap > 350) { lastTap = now; return; }
      game.abilityUsed = true;
      const dragon = DRAGONS.find(item => item.id === game.dragonId);
      if (dragon?.id === 'frost') game.blocks.forEach(block => { if (block.alive) { block.alive = false; game.destroyedBlocks += 1; addCombo(55, block.x, block.y); } });
      if (dragon?.id === 'storm') game.enemies.forEach(enemy => { if (enemy.alive) { enemy.alive = false; game.destroyedEnemies += 1; addCombo(200, enemy.x, enemy.y); } });
      if (dragon?.id === 'shadow') game.dragon.vx *= 2.3;
      lastTap = 0;
    };
    const down = event => {
      const game = gameRef.current;
      if (!game || game.phase !== 'aim') return;
      dragging = true;
      canvas.setPointerCapture?.(event.pointerId);
      pull(position(event));
    };
    const move = event => { if (dragging) pull(position(event)); };
    const update = () => {
      const game = gameRef.current;
      if (game?.phase === 'flying' && game.dragon) {
        const dragon = game.dragon;
        dragon.x += dragon.vx; dragon.y += dragon.vy; dragon.vy += GRAVITY;
        game.blocks.forEach(block => {
          if (block.alive && dragon.x > block.x - 16 && dragon.x < block.x + block.w + 16 && dragon.y > block.y - 16 && dragon.y < block.y + block.h + 16) {
            block.hp -= 1;
            game.destroyedBlocks += 1;
            const points = block.type === 'crystal' ? 150 : block.type === 'explosive' ? 100 : block.type === 'stone' ? 80 : 50;
            if (block.type === 'explosive') {
              game.blocks.forEach(other => {
                if (other !== block && other.alive && Math.hypot(other.x - block.x, other.y - block.y) < 75) { other.alive = false; other.hp = 0; game.destroyedBlocks += 1; game.score += 35; }
              });
            }
            if (block.hp <= 0) addCombo(points, block.x + block.w / 2, block.y); else game.combo = 0;
            dragon.vx *= block.type === 'stone' ? .75 : .65; dragon.vy *= .65;
          }
        });
        game.enemies.forEach(enemy => {
          if (enemy.alive && Math.hypot(dragon.x - enemy.x, dragon.y - enemy.y) < 26) { enemy.alive = false; game.destroyedEnemies += 1; addCombo(enemy.type === 'boss' ? 1000 : 300, enemy.x, enemy.y); dragon.vx *= .5; dragon.vy *= -.4; }
        });
        if (game.enemies.every(enemy => !enemy.alive)) {
          game.phase = 'complete';
          const source = LEVELS[game.level - 1];
          const efficiency = game.dragonIndex / Math.max(game.dragons, 1);
          const stars = Math.min(3, 1 + (efficiency <= .5 ? 1 : 0) + (game.destroyedBlocks >= (source?.blocks.length || 1) * .9 ? 1 : 0));
          const nextBestScores = { ...(bestScores || {}), [game.level]: Math.max(Number(bestScores?.[game.level] ?? 0), game.score) };
          const nextLevelStars = { ...(levelStars || {}), [game.level]: Math.max(Number(levelStars?.[game.level] ?? 0), stars) };
          setBestScores(nextBestScores);
          setLevelStars(nextLevelStars);
          localStorage.setItem('ds_best_scores', JSON.stringify(nextBestScores));
          localStorage.setItem('ds_level_stars', JSON.stringify(nextLevelStars));
          setHud({ score: game.score, level: game.level, dragons: game.dragons, combo: game.maxCombo, stars: Math.max(Number(levelStars?.[game.level] ?? 0), stars) });
          if (game.level >= Math.min(10, LEVELS.length)) { onComplete?.(game.score, 100); setScreen('victory'); }
          else setScreen('level');
        } else if (dragon.y > HEIGHT + 50 || dragon.x > WIDTH + 50 || dragon.x < -80) {
          game.dragonIndex += 1; game.dragon = null; game.abilityUsed = false;
          if (game.dragonIndex >= game.dragons) { game.phase = 'over'; setScreen('gameover'); } else game.phase = 'aim';
        }
        setHud({ score: game.score, level: game.level, dragons: Math.max(0, game.dragons - game.dragonIndex), combo: game.combo, stars: Number(levelStars?.[game.level] ?? 0) });
      }
      frameRef.current = requestAnimationFrame(update);
    };
    const draw = () => {
      const game = gameRef.current;
      ctx.fillStyle = '#05091a'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#0d1a2a'; ctx.fillRect(0, HEIGHT - 42, WIDTH, 42);
      if (game) {
        game.blocks.forEach(block => { if (block.alive) { const colors = { wood: ['#6a3008', '#9a541d', '#3a1a04'], stone: ['#565d66', '#858d98', '#252a30'], explosive: ['#762000', '#ff661c', '#ff2200'], crystal: ['#14566a', '#66eaff', '#44ccff'] }; const color = colors[block.type] || colors.wood; ctx.fillStyle = color[0]; ctx.fillRect(block.x, block.y, block.w, block.h); ctx.fillStyle = color[1]; ctx.fillRect(block.x + 2, block.y + 2, block.w - 4, Math.min(6, block.h - 4)); ctx.strokeStyle = color[2]; ctx.strokeRect(block.x, block.y, block.w, block.h); } });
        game.enemies.forEach(enemy => { if (enemy.alive) { ctx.fillStyle = '#448800'; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff4400'; ctx.fillRect(enemy.x - 7, enemy.y - 3, 4, 4); ctx.fillRect(enemy.x + 3, enemy.y - 3, 4, 4); } });
        ctx.strokeStyle = '#6a3a10'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(SLING.x - 12, HEIGHT - 42); ctx.lineTo(SLING.x - 7, SLING.y + 12); ctx.moveTo(SLING.x + 12, HEIGHT - 42); ctx.lineTo(SLING.x + 7, SLING.y + 12); ctx.stroke();
        const point = game.dragon || { x: SLING.x + game.pull.x, y: SLING.y + game.pull.y };
        ctx.fillStyle = DRAGONS.find(item => item.id === game.dragonId)?.color || '#ff6030'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(point.x, point.y, 18, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        if (game.phase === 'aim' && dragging) { ctx.strokeStyle = '#ffcc44'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(SLING.x - 7, SLING.y + 12); ctx.lineTo(point.x, point.y); ctx.moveTo(SLING.x + 7, SLING.y + 12); ctx.lineTo(point.x, point.y); ctx.stroke(); }
        if (game.phase === 'aim') { const power = Math.min(Math.hypot(game.pull.x, game.pull.y) / MAX_PULL, 1); ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(20, 20, 150, 12); const gradient = ctx.createLinearGradient(20, 0, 170, 0); gradient.addColorStop(0, '#44cc55'); gradient.addColorStop(.55, '#ffcc22'); gradient.addColorStop(1, '#ff3322'); ctx.fillStyle = gradient; ctx.fillRect(20, 20, 150 * power, 12); ctx.strokeStyle = 'rgba(255,220,150,.5)'; ctx.strokeRect(20, 20, 150, 12); ctx.fillStyle = '#e8d5a0'; ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.fillText(`POWER ${Math.round(power * 100)}%`, 20, 15); }
        if (game.combo >= 2) { ctx.save(); ctx.textAlign = 'center'; ctx.font = `bold ${20 + Math.min(game.combo, 8) * 2}px Georgia,serif`; ctx.fillStyle = game.combo >= 5 ? '#ffcc22' : '#ffaa44'; ctx.shadowColor = '#ff5500'; ctx.shadowBlur = 18; ctx.fillText(`COMBO x${game.combo}`, WIDTH / 2, 42); ctx.restore(); }
        for (let index = game.parts.length - 1; index >= 0; index -= 1) { const part = game.parts[index]; part.x += part.vx; part.y += part.vy; if (!part.text) part.vy += .2; part.life -= part.text ? .018 : .022; ctx.globalAlpha = Math.max(0, part.life); ctx.fillStyle = part.color; if (part.text) { ctx.font = `bold ${part.size}px Georgia,serif`; ctx.textAlign = 'center'; ctx.fillText(part.label, part.x, part.y); } else { ctx.beginPath(); ctx.arc(part.x, part.y, part.size || 3, 0, Math.PI * 2); ctx.fill(); } if (part.life <= 0) game.parts.splice(index, 1); }
        ctx.globalAlpha = 1; ctx.textAlign = 'left';
      }
      frameRef.current = requestAnimationFrame(draw);
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('dblclick', ability);
    const updateFrame = requestAnimationFrame(update);
    const drawFrame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(updateFrame); cancelAnimationFrame(drawFrame); cancelAnimationFrame(frameRef.current); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', release); canvas.removeEventListener('dblclick', ability); };
  }, [onComplete]);

  function loadLevel(level, score = gameRef.current?.score || 0) {
    const source = LEVELS[level - 1];
    const game = { phase: 'aim', level, dragonId: gameRef.current?.dragonId || DRAGONS[0].id, score, dragonIndex: 0, dragons: source?.dragons || 3, pull: { x: 0, y: 0 }, dragon: null, abilityUsed: false, combo: 0, maxCombo: 0, destroyedBlocks: 0, destroyedEnemies: 0, parts: [], blocks: (source?.blocks || []).map((block, index) => ({ ...block, hp: block.hp || 1, type: block.type || (index % 13 === 0 ? 'explosive' : index % 7 === 0 ? 'crystal' : index % 5 === 0 ? 'stone' : 'wood'), alive: true })), enemies: (source?.enemies || []).map(enemy => ({ ...enemy, alive: true })) };
    gameRef.current = game;
    setHud({ score, level, dragons: game.dragons, combo: 0, stars: Number(levelStars?.[level] ?? 0) });
    setScreen(source?.biome === 'boss' ? 'boss' : 'game');
  }

  function begin(dragonId) { gameRef.current = { dragonId, score: 0 }; loadLevel(1, 0); }
  function nextLevel() { loadLevel(Math.min((gameRef.current?.level || 1) + 1, Math.min(10, LEVELS.length))); }

  const visibleStars = Math.max(0, Number(hud.stars ?? levelStars?.[hud.level] ?? currentLevelStars ?? 0));

  return <main className="dragon-replacement"><style>{STYLES}</style><canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="dragon-canvas" aria-label="Dragon slingshot game board" />{screen === 'landing' && <section className="dragon-landing"><h1>Dragon<br />Slingshot</h1><p>⚔ FIRE · FURY · FLIGHT ⚔</p><button onClick={() => setScreen('select')}>⚔ Enter, Dragon Warrior ⚔</button></section>}{screen === 'select' && <section className="dragon-modal"><span>🐉</span><h2>Choose Your Dragon</h2><p>Double-click while flying to unleash your ability!</p><div className="dragon-grid">{DRAGONS.map(dragon => <button key={dragon.id} onClick={() => begin(dragon.id)}><b style={{ color: dragon.color }}>{dragon.emoji}</b><strong>{dragon.name}</strong><small>{dragon.ability}</small></button>)}</div></section>}{screen !== 'landing' && screen !== 'select' && <div className="dragon-hud"><span>SCORE <b>{hud.score}</b></span><span>LEVEL <b>{hud.level}</b></span><span>DRAGONS <b>{hud.dragons}</b></span><span>COMBO <b>x{hud.combo || 0}</b></span><span>STARS <b>{'★'.repeat(visibleStars || 0)}</b></span></div>}{screen === 'game' && <p className="dragon-hint">Pull back a dragon, then release to launch. Double-click while flying to unleash its ability.</p>}{screen === 'boss' && <section className="dragon-modal boss-intro"><strong>⚠ BOSS BATTLE ⚠</strong><h2>{LEVELS[hud.level - 1]?.name}</h2><span>☠</span><p>Prepare your dragons. This enemy will not fall easily.</p><button onClick={() => setScreen('game')}>ENTER THE BATTLE</button></section>}{screen === 'level' && <section className="dragon-modal"><h2>Level {hud.level} Complete!</h2><div className="stars">{'★'.repeat(visibleStars || 1)}{'☆'.repeat(3 - (visibleStars || 1))}</div><p>Best score: {bestScores[hud.level]}</p><button onClick={nextLevel}>Next Realm ▶</button></section>}{screen === 'victory' && <section className="dragon-modal"><h2>🏆 Dragon World Saved!</h2><button onClick={() => setScreen('select')}>Play Again</button></section>}{screen === 'gameover' && <section className="dragon-modal"><h2>Out of Dragons</h2><button onClick={() => setScreen('select')}>Try Again</button></section>}</main>;
}

const STYLES = `
.dragon-replacement{min-height:100%;position:relative;background:#06080f;color:#e8d5a0;font-family:Georgia,serif;text-align:center}.dragon-canvas{display:block;width:min(96vw,1100px);height:auto;margin:0 auto;border-radius:10px;cursor:crosshair;touch-action:none;box-shadow:0 12px 40px rgba(0,0,0,.4)}.dragon-landing,.dragon-modal{position:absolute;inset:0;z-index:3;display:grid;place-content:center;justify-items:center;gap:18px;padding:24px;background:radial-gradient(circle at 50% 70%,#7d1d05,#050003 65%);text-align:center}.dragon-landing h1{color:#ff5500;font-size:clamp(2.5rem,8vw,5rem);line-height:1.05;text-shadow:0 0 35px #ff3300;margin:0}.dragon-landing p{color:#ffbb77;letter-spacing:.25em}.dragon-landing button,.dragon-modal button{padding:13px 24px;border:1px solid #ff8833;border-radius:9px;background:#bb2200;color:#fff5dd;font:inherit;cursor:pointer}.dragon-modal{background:#000b;backdrop-filter:blur(5px)}.dragon-modal>span{font-size:3rem}.dragon-modal h2{margin:0;color:#ffcc66}.dragon-modal p{color:#bda47b}.dragon-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;width:min(92vw,650px)}.dragon-grid button{display:grid;gap:5px;justify-items:center;min-height:125px;padding:12px 5px;border:1px solid rgba(255,170,60,.2);border-radius:12px;background:linear-gradient(180deg,rgba(255,150,50,.1),rgba(255,100,20,.035));color:#e8c880;font:inherit;cursor:pointer;transition:transform .15s,border-color .15s,background .15s,box-shadow .15s}.dragon-grid button:hover{transform:translateY(-4px);border-color:#ff9d32;background:rgba(255,140,40,.15);box-shadow:0 10px 25px rgba(0,0,0,.3)}.dragon-grid b{font-size:2.6rem}.dragon-grid strong{font-size:.8rem;color:#ffe0a0}.dragon-grid small{color:#d18d52;font-size:.68rem}.dragon-hud{position:absolute;top:12px;left:50%;z-index:1;display:flex;gap:0;transform:translateX(-50%);padding:7px;border:1px solid rgba(255,180,60,.18);border-radius:10px;background:linear-gradient(180deg,rgba(20,28,45,.96),rgba(5,10,20,.96));color:#806f56;font:700 9px monospace;white-space:nowrap}.dragon-hud span{padding:5px 12px;border-right:1px solid rgba(255,180,60,.12)}.dragon-hud span:last-child{border:0}.dragon-hud b{color:#ffcc66;font-size:14px;margin-left:3px}.dragon-hint{color:#a89070}.boss-intro{border:1px solid rgba(255,30,60,.5);box-shadow:0 0 60px rgba(255,0,40,.15)}.boss-intro>strong{color:#ff3344;letter-spacing:.3em}.boss-intro>span{font-size:4rem;filter:drop-shadow(0 0 20px rgba(255,40,20,.8))}.stars{color:#ffcc22;font-size:1.8rem;letter-spacing:5px}@media(max-width:540px){.dragon-grid{grid-template-columns:repeat(3,1fr)}.dragon-hud{font-size:.72rem}.dragon-hud span{padding:5px 6px}.dragon-hud b{font-size:11px}}
`;
