import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/lib/gameState';

const Q = [
  ['hoof', ['Hoofs', 'Hooves', 'Hoove'], 1],
  ['child', ['Childs', 'Childrens', 'Children'], 2],
  ['mouse', ['Mice', 'Mouses', 'Meese'], 0],
  ['leaf', ['Leafs', 'Leaves', 'Leafes'], 1],
  ['tooth', ['Tooths', 'Teeth', 'Teeths'], 1],
  ['foot', ['Foots', 'Feet', 'Feets'], 1],
  ['wolf', ['Wolves', 'Wolfs', 'Wolfes'], 0],
  ['person', ['Persons', 'Peoples', 'People'], 2],
  ['knife', ['Knifes', 'Knives', 'Knive'], 1],
  ['goose', ['Gooses', 'Geese', 'Geeses'], 1],
];

const MAT = {
  wood: { hp: 14, c: '#c98946', d: '#8a5a28' },
  stone: { hp: 28, c: '#8b969c', d: '#5c666c' },
  glass: { hp: 6, c: '#8fe3f2', d: '#4aaec4' },
};

const styles = `
  :root { --ink: #12395a; --red: #ff5a4d; --sun: #ffc93c; --grass: #4fa83d; }
  * { box-sizing: border-box; margin: 0; }
  html, body { height: 100%; overflow: hidden; background: #8fd3f4; font-family: Fredoka, 'Trebuchet MS', sans-serif; color: var(--ink); touch-action: none; }
  .bird-blast-root { position: relative; width: 100%; height: 100vh; overflow: hidden; background: #8fd3f4; }
  canvas { position: fixed; inset: 0; width: 100%; height: 100%; }
  #hud { position: fixed; top: max(14px, env(safe-area-inset-top)); left: 16px; right: 16px; display: flex; justify-content: space-between; gap: 10px; pointer-events: none; }
  .pill { background: #fff; border-radius: 999px; padding: 8px 18px; font-weight: 700; box-shadow: 0 4px 0 #12395a26; display: flex; align-items: center; gap: 8px; }
  #logo { color: var(--red); font-size: 24px; }
  .dot { width: 14px; height: 14px; border-radius: 50%; background: var(--red); box-shadow: inset -3px -3px #0002; }
  .dot.off { background: #d5dde3; }
  #card { position: fixed; left: 50%; bottom: max(16px, env(safe-area-inset-bottom)); transform: translateX(-50%); width: min(620px, 92vw); background: #fff; border-radius: 26px; padding: 16px 18px; text-align: center; box-shadow: 0 6px 0 #12395a33; z-index: 5; }
  #q { font-size: 19px; font-weight: 700; margin-bottom: 10px; }
  #ans { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
  #card.locked #ans { display: none; }
  #card.locked #q { margin: 0; }
  button { border: 0; font: inherit; font-weight: 700; color: var(--ink); background: #eaf4fa; padding: 10px 22px; border-radius: 14px; cursor: pointer; box-shadow: 0 4px 0 #12395a26; transition: transform .12s; }
  button:hover:not(:disabled) { transform: translateY(-2px); }
  button:active:not(:disabled) { transform: translateY(2px); box-shadow: none; }
  button:focus-visible { outline: 3px solid var(--sun); outline-offset: 2px; }
  button.ok { background: var(--grass); color: #fff; }
  button.no { background: var(--red); color: #fff; animation: sh .35s; }
  @keyframes sh { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
  #ov { position: fixed; inset: 0; display: none; place-items: center; background: #12395a99; z-index: 10; }
  #ov.on { display: grid; }
  #panel { background: #fff; border-radius: 30px; padding: 30px 44px; text-align: center; box-shadow: 0 10px 0 #12395a33; animation: pop .45s cubic-bezier(.2, 1.4, .4, 1); }
  @keyframes pop { from { transform: scale(.7); opacity: 0; } }
  #panel h1 { font-size: 40px; color: var(--red); }
  #stars { font-size: 46px; letter-spacing: 6px; margin: 6px 0; color: var(--sun); text-shadow: 0 3px 0 #12395a26; }
  #panel p { margin-bottom: 16px; font-size: 18px; }
  #panel button { background: var(--sun); font-size: 20px; padding: 12px 30px; }
  @media (max-width: 700px) { #logo { font-size: 17px; } .pill { padding: 6px 12px; font-size: 14px; } #q { font-size: 16px; } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
`;

function getBest() {
  try {
    return Number(localStorage.getItem('bb-best')) || 0;
  } catch {
    return 0;
  }
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function AngryVerbs({ onComplete }) {
  const { completeGame } = useGame();
  const canvasRef = useRef(null);
  const bestRef = useRef(getBest());
  const gameRef = useRef({
    W: 0,
    H: 0,
    u: 0,
    gy: 0,
    sx: 0,
    sy: 0,
    blocks: [],
    pigs: [],
    parts: [],
    pops: [],
    order: [],
    qn: 0,
    cur: '',
    score: 0,
    birds: 3,
    streak: 0,
    state: 'ask',
    drag: false,
    shake: 0,
    frames: 0,
    still: 0,
    over: false,
    best: 0,
    ac: null,
    bird: { x: 0, y: 0, vx: 0, vy: 0, r: 0 },
    clouds: [
      { x: 0.1, y: 0.14, s: 1, v: 0.00004 },
      { x: 0.55, y: 0.24, s: 0.7, v: 0.00003 },
      { x: 0.85, y: 0.1, s: 0.9, v: 0.00005 },
    ],
  });

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bestRef.current);
  const [birds, setBirds] = useState(3);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]);
  const [answerState, setAnswerState] = useState({});
  const [overlay, setOverlay] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [stars, setStars] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const [gameState, setGameState] = useState('ask');

  const syncHud = () => {
    const G = gameRef.current;
    setScore(G.score);
    setBirds(G.birds);
    setBest(G.best);
    setGameState(G.state);
  };

  const snd = (frequency, duration, type = 'sine', volume = 0.07) => {
    try {
      const G = gameRef.current;
      G.ac = G.ac || new AudioContext();
      const audioContext = G.ac;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch {
      // No-op if AudioContext is unavailable.
    }
  };

  const pop = (x, y, text, color) => {
    const G = gameRef.current;
    G.pops.push({ x, y, t: text, c: color, l: 70 });
  };

  const burst = (x, y, color, count) => {
    const G = gameRef.current;
    for (let i = 0; i < count; i += 1) {
      G.parts.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 9 * G.u,
        vy: (Math.random() - 0.9) * 8 * G.u,
        l: 40 + Math.random() * 25,
        c: color,
        s: (3 + Math.random() * 6) * G.u,
      });
    }
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  const layout = () => {
    const G = gameRef.current;
    G.W = window.innerWidth;
    G.H = window.innerHeight;
    G.u = Math.min(G.W / 1280, G.H / 720);
    G.gy = G.H * 0.8;
    G.sx = G.W * 0.17;
    G.sy = G.gy - 120 * G.u;
  };

  const resetBird = () => {
    const G = gameRef.current;
    G.bird.x = G.sx;
    G.bird.y = G.sy;
    G.bird.r = 18 * G.u;
    G.bird.vx = 0;
    G.bird.vy = 0;
  };

  const buildScene = () => {
    const G = gameRef.current;
    layout();
    resizeCanvas();
    G.blocks = [];
    G.pigs = [];
    G.parts = [];
    G.pops = [];
    const ox = Math.max(G.sx + 380 * G.u, G.W - 520 * G.u);
    const B = (t, x, yb, w, h) => {
      G.blocks.push({ t, x: ox + x * G.u, y: G.gy - (yb + h) * G.u, w: w * G.u, h: h * G.u, hp: MAT[t].hp, max: MAT[t].hp, vy: 0 });
    };
    const P = (x, yb) => {
      G.pigs.push({ x: ox + x * G.u, y: G.gy - (yb + 28) * G.u, r: 28 * G.u, hp: 10, max: 10, vy: 0 });
    };
    B('wood', 0, 0, 40, 120);
    B('wood', 200, 0, 40, 120);
    B('stone', -10, 120, 260, 34);
    B('glass', 30, 154, 36, 96);
    B('glass', 174, 154, 36, 96);
    B('wood', 20, 250, 200, 30);
    P(120, 0);
    P(120, 280);
    P(330, 0);
    B('wood', 300, 0, 60, 50);
    resetBird();
  };

  const rectHit = (circle, rect) => {
    const nx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    const ny = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
    let dx = circle.x - nx;
    let dy = circle.y - ny;
    let d = Math.hypot(dx, dy);
    if (d >= circle.r) return null;
    if (!d) {
      dx = 0;
      dy = -1;
      d = 1;
    }
    return { nx: dx / d, ny: dy / d, pen: circle.r - d };
  };

  const renderQuestion = () => {
    const G = gameRef.current;
    if (G.birds <= 0) return;
    G.state = 'ask';
    setGameState('ask');
    setAnswerState({});
    setQuestionText('');
    setOptions([]);
    if (G.qn >= G.order.length) {
      G.order.sort(() => Math.random() - 0.5);
      G.qn = 0;
    }
    const [word, optionSet, choiceIndex] = Q[G.order[G.qn++]];
    G.cur = word;
    const correct = optionSet[choiceIndex];
    const shuffled = shuffle(optionSet).map((value) => ({ value, isCorrect: value === correct }));
    setQuestionText(`What is the plural of “${word}”?`);
    setOptions(shuffled);
    setAnswerState({ correct });
    setGameState('ask');
  };

  const finish = (won) => {
    const G = gameRef.current;
    G.state = 'end';
    const starsCount = won ? (G.birds >= 2 ? 3 : G.birds >= 1 ? 2 : 1) : 0;
    if (G.score > G.best) {
      G.best = G.score;
      try {
        localStorage.setItem('bb-best', String(G.best));
      } catch {
        // No-op if storage is not available.
      }
    }
    setBest(G.best);
    setResultTitle(won ? 'Level complete!' : 'Out of birds');
    setStars('★'.repeat(starsCount) + '☆'.repeat(3 - starsCount));
    setResultSummary(won ? `Score ${G.score}` : `Score ${G.score}. Clear every pig to win.`);
    setOverlay(true);
    snd(won ? 784 : 200, 0.5, won ? 'triangle' : 'sawtooth');
    completeGame('angryverbs', won ? 100 : Math.min(100, Math.round((G.score / 2000) * 100)), G.score || 1, 0, 0);
    onComplete?.(G.score, won ? 100 : Math.min(100, Math.round((G.score / 2000) * 100)));
  };

  const endShot = () => {
    const G = gameRef.current;
    G.state = 'end';
    setTimeout(() => {
      if (G.over) return;
      resetBird();
      if (G.birds > 0) {
        renderQuestion();
      } else {
        G.over = true;
        setTimeout(() => finish(false), 500);
      }
    }, 700);
  };

  const handleAnswer = (option, isCorrect) => {
    const G = gameRef.current;
    if (G.state !== 'ask' || !option) return;
    if (isCorrect) {
      G.streak += 1;
      const gained = 100 + (G.streak - 1) * 25;
      G.score += gained;
      snd(660, 0.15);
      snd(880, 0.2);
      pop(G.W / 2, G.H - 120, `+${gained}${G.streak > 1 ? `  streak x${G.streak}` : ''}`, '#4fa83d');
      setAnswerState({ correct: option });
      G.state = 'aim';
      setGameState('aim');
      setQuestionText('Pull the bird back, then let go!');
      setOptions([]);
      setTimeout(() => {
        if (G.state === 'aim') {
          setQuestionText('Pull the bird back, then let go!');
        }
      }, 450);
    } else {
      G.streak = 0;
      G.score = Math.max(0, G.score - 50);
      snd(160, 0.25, 'sawtooth');
      setAnswerState({ wrong: option });
      pop(G.W / 2, G.H - 120, '−50', '#ff5a4d');
      syncHud();
    }
    syncHud();
  };

  const pull = (event) => {
    const G = gameRef.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = event.clientX - G.sx;
    const dy = event.clientY - G.sy;
    const distance = Math.hypot(dx, dy);
    const max = 100 * G.u;
    const nx = distance > max ? (dx * max) / distance : dx;
    const ny = distance > max ? (dy * max) / distance : dy;
    G.bird.x = G.sx + nx;
    G.bird.y = Math.min(G.sy + ny, G.gy - G.bird.r);
  };

  const reset = () => {
    const G = gameRef.current;
    G.score = 0;
    G.birds = 3;
    G.streak = 0;
    G.over = false;
    G.qn = 99;
    G.order = Q.map((_, index) => index);
    setOverlay(false);
    buildScene();
    syncHud();
    renderQuestion();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const step = () => {
      const G = gameRef.current;
      const g = 0.5 * G.u;
      const floorFor = (object, width, self) => {
        let floor = G.gy;
        for (const block of G.blocks) {
          if (block === self) continue;
          if (
            object.x + (width || 0) / 2 > block.x &&
            object.x - (width || 0) / 2 < block.x + block.w &&
            block.y >= (self ? self.y + self.h - 3 * G.u : object.y)
          ) {
            floor = Math.min(floor, block.y);
          }
        }
        return floor;
      };

      for (const block of G.blocks) {
        const floor = floorFor({ x: block.x + block.w / 2 }, block.w * 0.9, block);
        if (block.y + block.h < floor - 1) {
          block.vy += g;
          block.y += block.vy;
          for (const pig of G.pigs) {
            if (
              Math.abs(pig.x - (block.x + block.w / 2)) < block.w / 2 + pig.r &&
              block.y + block.h > pig.y - pig.r &&
              block.y < pig.y + pig.r &&
              block.vy > 2 * G.u
            ) {
              pig.hp -= (block.vy / G.u) * 2;
            }
          }
        }
        if (block.y + block.h >= floor - 1 && block.vy) {
          if (block.vy / G.u > 9 && block.t === 'glass') block.hp = 0;
          block.y = floor - block.h;
          block.vy = 0;
        }
      }

      for (const pig of G.pigs) {
        const floor = floorFor(pig, 0, null);
        if (pig.y + pig.r < floor - 1) {
          pig.vy += g;
          pig.y += pig.vy;
        }
        if (pig.y + pig.r >= floor - 1 && pig.vy) {
          if (pig.vy / G.u > 7) pig.hp -= (pig.vy / G.u) * 1.5;
          pig.y = floor - pig.r;
          pig.vy = 0;
        }
      }

      if (G.state === 'fly') {
        const b = G.bird;
        b.vy += g;
        b.x += b.vx;
        b.y += b.vy;
        G.frames += 1;

        for (const block of G.blocks) {
          const hit = rectHit(b, block);
          if (!hit) continue;
          const vn = b.vx * hit.nx + b.vy * hit.ny;
          if (vn < 0) {
            const impulse = -vn / G.u;
            b.vx -= 1.25 * vn * hit.nx;
            b.vy -= 1.25 * vn * hit.ny;
            b.vx *= 0.9;
            if (impulse > 2.5) {
              block.hp -= impulse;
              G.shake = Math.min(8, impulse / 2);
              snd(block.t === 'glass' ? 1200 : 220, 0.12, block.t === 'glass' ? 'triangle' : 'square', 0.05);
            }
          }
          b.x += hit.nx * hit.pen;
          b.y += hit.ny * hit.pen;
        }

        for (const pig of G.pigs) {
          if (Math.hypot(b.x - pig.x, b.y - pig.y) < b.r + pig.r) {
            const speed = Math.hypot(b.vx, b.vy) / G.u;
            if (speed > 2) {
              pig.hp -= speed * 1.5;
              b.vx *= 0.7;
              b.vy *= 0.7;
              snd(300, 0.1, 'triangle');
            }
          }
        }

        if (b.y > G.gy - b.r) {
          b.y = G.gy - b.r;
          b.vy *= -0.35;
          b.vx *= 0.8;
        }

        G.still = Math.hypot(b.vx, b.vy) < 0.4 * G.u && b.y >= G.gy - b.r - 1 ? G.still + 1 : 0;
        if (G.still > 40 || G.frames > 600 || b.x > G.W + 100 || b.x < -100) {
          endShot();
        }
      }

      G.blocks = G.blocks.filter((block) => {
        if (block.hp > 0) return true;
        burst(block.x + block.w / 2, block.y + block.h / 2, MAT[block.t].c, 12);
        G.score += 100;
        syncHud();
        return false;
      });

      G.pigs = G.pigs.filter((pig) => {
        if (pig.hp > 0) return true;
        burst(pig.x, pig.y, '#7cc642', 18);
        G.score += 500;
        snd(520, 0.2, 'triangle');
        pop(pig.x, pig.y - 40 * G.u, '+500', '#12395a');
        syncHud();
        return false;
      });

      if (!G.pigs.length && !G.over && G.state !== 'end') {
        G.over = true;
        setTimeout(() => finish(true), 900);
      }

      G.parts.forEach((particle) => {
        particle.vy += 0.4 * G.u;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.l -= 1;
      });
      G.parts = G.parts.filter((particle) => particle.l > 0);

      G.pops.forEach((particle) => {
        particle.y -= 0.8;
        particle.l -= 1;
      });
      G.pops = G.pops.filter((particle) => particle.l > 0);
      G.shake *= 0.9;
    };

    const draw = () => {
      const G = gameRef.current;
      const sky = ctx.createLinearGradient(0, 0, 0, G.gy);
      sky.addColorStop(0, '#59bdf0');
      sky.addColorStop(1, '#d6f1ff');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, G.W, G.H);
      ctx.save();
      ctx.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);

      const sun = ctx.createRadialGradient(G.W * 0.8, G.H * 0.18, 0, G.W * 0.8, G.H * 0.18, 160 * G.u);
      sun.addColorStop(0, '#fff8c8');
      sun.addColorStop(0.25, '#ffe27a');
      sun.addColorStop(1, '#ffe27a00');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, G.W, G.H);

      G.clouds.forEach((cloud) => {
        cloud.x = (cloud.x + cloud.v * 16) % 1.2;
        ctx.fillStyle = '#ffffffcc';
        const x = cloud.x * G.W - 100;
        const y = cloud.y * G.H;
        const scale = cloud.s * G.u;
        [[0, 0, 34], [38, -14, 44], [84, 0, 32], [44, 8, 34]].forEach(([ax, ay, radius]) => {
          ctx.beginPath();
          ctx.arc(x + ax * scale * 1.4, y + ay * scale * 1.4, radius * scale * 1.4, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      [['#9fd98a', 0.62, 0.08, 70], ['#7cc05f', 0.7, 0.06, 45]].forEach(([color, base, amp, len], index) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, G.gy);
        for (let x = 0; x <= G.W; x += 20) {
          ctx.lineTo(x, G.gy - G.H * (base - 0.58) - Math.sin(x / (len * G.u) + index * 2) * G.H * amp * 0.5 - G.H * 0.04);
        }
        ctx.lineTo(G.W, G.gy);
        ctx.fill();
      });

      const ground = ctx.createLinearGradient(0, G.gy, 0, G.H);
      ground.addColorStop(0, '#5fbf3f');
      ground.addColorStop(0.12, '#4fa83d');
      ground.addColorStop(0.13, '#7a5230');
      ground.addColorStop(1, '#4d311c');
      ctx.fillStyle = ground;
      ctx.fillRect(0, G.gy, G.W, G.H - G.gy);

      ctx.lineCap = 'round';
      ctx.strokeStyle = '#5a3416';
      ctx.lineWidth = 12 * G.u;
      ctx.beginPath();
      ctx.moveTo(G.sx + 14 * G.u, G.sy - 8 * G.u);
      ctx.lineTo(G.sx + 2 * G.u, G.sy + 55 * G.u);
      ctx.stroke();

      const leftSling = { x: G.sx - 16 * G.u, y: G.sy - 8 * G.u };
      const rightSling = { x: G.sx + 16 * G.u, y: G.sy - 8 * G.u };
      const drawBand = (point) => {
        ctx.strokeStyle = '#3b1f10';
        ctx.lineWidth = 7 * G.u;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(G.bird.x, G.bird.y);
        ctx.stroke();
      };
      if (G.state !== 'fly') drawBand(rightSling);

      G.blocks.forEach((block) => {
        const material = MAT[block.t];
        ctx.fillStyle = material.c;
        ctx.beginPath();
        ctx.roundRect(block.x, block.y, block.w, block.h, 6 * G.u);
        ctx.fill();
        ctx.lineWidth = 3 * G.u;
        ctx.strokeStyle = material.d;
        ctx.stroke();
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = `${material.d}66`;
        ctx.lineWidth = 2 * G.u;
        if (block.t === 'wood') {
          for (let i = 1; i < 4; i += 1) {
            ctx.beginPath();
            ctx.moveTo(block.x, block.y + (block.h * i) / 4);
            ctx.lineTo(block.x + block.w, block.y + (block.h * i) / 4 + 3 * G.u);
            ctx.stroke();
          }
        }
        if (block.t === 'glass') {
          ctx.fillStyle = '#ffffff77';
          ctx.beginPath();
          ctx.moveTo(block.x + block.w * 0.1, block.y + block.h);
          ctx.lineTo(block.x + block.w * 0.6, block.y);
          ctx.lineTo(block.x + block.w * 0.9, block.y);
          ctx.lineTo(block.x + block.w * 0.4, block.y + block.h);
          ctx.fill();
        }
        ctx.fillStyle = '#ffffff40';
        ctx.fillRect(block.x, block.y, block.w, 5 * G.u);
        if (block.hp < block.max * 0.6) {
          ctx.strokeStyle = '#0006';
          ctx.beginPath();
          ctx.moveTo(block.x + block.w * 0.3, block.y);
          ctx.lineTo(block.x + block.w * 0.45, block.y + block.h * 0.4);
          ctx.lineTo(block.x + block.w * 0.3, block.y + block.h * 0.7);
          ctx.lineTo(block.x + block.w * 0.55, block.y + block.h);
          ctx.stroke();
        }
        ctx.restore();
      });

      G.pigs.forEach((pig) => {
        ctx.fillStyle = '#86d14a';
        ctx.beginPath();
        ctx.arc(pig.x, pig.y, pig.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3 * G.u;
        ctx.strokeStyle = '#4f8f26';
        ctx.stroke();
        ctx.fillStyle = '#6fb93a';
        ctx.beginPath();
        ctx.arc(pig.x - pig.r * 0.8, pig.y - pig.r * 0.7, pig.r * 0.25, 0, Math.PI * 2);
        ctx.arc(pig.x + pig.r * 0.8, pig.y - pig.r * 0.7, pig.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.arc(pig.x + side * pig.r * 0.36, pig.y - pig.r * 0.18, pig.r * 0.24, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = '#111';
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.arc(pig.x + side * pig.r * 0.32, pig.y - pig.r * 0.14 + (pig.hp < pig.max * 0.6 ? 3 * G.u : 0), pig.r * 0.1, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.fillStyle = '#a5e06a';
        ctx.beginPath();
        ctx.ellipse(pig.x, pig.y + pig.r * 0.3, pig.r * 0.34, pig.r * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#4f8f26';
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.ellipse(pig.x + side * pig.r * 0.12, pig.y + pig.r * 0.3, pig.r * 0.05, pig.r * 0.09, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      if (G.drag) {
        let x = G.bird.x;
        let y = G.bird.y;
        let vx = (G.sx - G.bird.x) * 0.19;
        let vy = (G.sy - G.bird.y) * 0.19;
        for (let i = 0; i < 34; i += 1) {
          vy += 0.5 * G.u;
          x += vx;
          y += vy;
          if (y > G.gy) break;
          if (i % 2 === 0) {
            ctx.fillStyle = `rgba(255,255,255,${0.9 - i / 40})`;
            ctx.beginPath();
            ctx.arc(x, y, (5 - i / 10) * G.u, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      const bird = G.bird;
      const radius = bird.r;
      ctx.save();
      ctx.translate(bird.x, bird.y);
      if (G.state === 'fly') ctx.rotate(Math.atan2(bird.vy, bird.vx) * 0.35);
      ctx.fillStyle = '#ff5a4d';
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a7a';
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.4, radius * 0.65, radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c93a2f';
      ctx.beginPath();
      ctx.moveTo(-radius * 0.2, -radius);
      ctx.lineTo(-radius * 0.1, -radius * 1.4);
      ctx.lineTo(radius * 0.1, -radius * 0.95);
      ctx.lineTo(radius * 0.3, -radius * 1.3);
      ctx.lineTo(radius * 0.35, -radius * 0.9);
      ctx.fill();
      ctx.fillStyle = '#fff';
      [0.1, 0.55].forEach((offset) => {
        ctx.beginPath();
        ctx.arc(radius * offset, -radius * 0.2, radius * 0.28, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#111';
      [0.2, 0.62].forEach((offset) => {
        ctx.beginPath();
        ctx.arc(radius * offset, -radius * 0.18, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = '#5a1a14';
      ctx.lineWidth = 3 * G.u;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.15, -radius * 0.62);
      ctx.lineTo(radius * 0.85, -radius * 0.4);
      ctx.stroke();
      ctx.fillStyle = '#ffc93c';
      ctx.beginPath();
      ctx.moveTo(radius * 0.7, 0);
      ctx.lineTo(radius * 1.35, radius * 0.2);
      ctx.lineTo(radius * 0.7, radius * 0.4);
      ctx.fill();
      ctx.restore();

      if (G.state !== 'fly') drawBand(leftSling);

      ctx.strokeStyle = '#7a461f';
      ctx.lineWidth = 13 * G.u;
      ctx.beginPath();
      ctx.moveTo(G.sx - 14 * G.u, G.sy - 8 * G.u);
      ctx.lineTo(G.sx - 2 * G.u, G.sy + 55 * G.u);
      ctx.lineTo(G.sx, G.gy + 4 * G.u);
      ctx.stroke();

      G.parts.forEach((particle) => {
        ctx.globalAlpha = Math.min(1, particle.l / 25);
        ctx.fillStyle = particle.c;
        ctx.fillRect(particle.x, particle.y, particle.s, particle.s);
      });
      ctx.globalAlpha = 1;
      ctx.font = `700 ${24 * Math.max(0.8, G.u)}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      G.pops.forEach((particle) => {
        ctx.globalAlpha = Math.min(1, particle.l / 30);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#fff';
        ctx.strokeText(particle.t, particle.x, particle.y);
        ctx.fillStyle = particle.c;
        ctx.fillText(particle.t, particle.x, particle.y);
      });
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    let lastFrame = performance.now();
    let accumulator = 0;
    const loop = (time) => {
      accumulator += Math.min(time - lastFrame, 50);
      lastFrame = time;
      while (accumulator >= 16.667) {
        step();
        accumulator -= 16.667;
      }
      draw();
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => {
      // no-op to allow effect cleanup silent exit
    };
  }, []);

  useEffect(() => {
    const G = gameRef.current;
    G.best = bestRef.current;
    G.order = Q.map((_, index) => index);
    G.qn = 0;
    buildScene();
    syncHud();
    renderQuestion();
  }, []);

  const handlePointerDown = (event) => {
    const G = gameRef.current;
    if (G.state !== 'aim') return;
    const clickX = event.clientX;
    const clickY = event.clientY;
    if (Math.hypot(clickX - G.bird.x, clickY - G.bird.y) < 70 * G.u + 12) {
      G.drag = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      pull(event);
    }
  };

  const handlePointerMove = (event) => {
    const G = gameRef.current;
    if (G.drag) pull(event);
  };

  const handleRelease = () => {
    const G = gameRef.current;
    if (!G.drag) return;
    G.drag = false;
    const dx = G.sx - G.bird.x;
    const dy = G.sy - G.bird.y;
    if (Math.hypot(dx, dy) < 22 * G.u) {
      resetBird();
      return;
    }
    G.bird.vx = dx * 0.19;
    G.bird.vy = dy * 0.19;
    G.state = 'fly';
    G.birds -= 1;
    G.frames = 0;
    G.still = 0;
    snd(400, 0.2, 'triangle');
    setQuestionText('');
    setOptions([]);
    setGameState('fly');
    syncHud();
  };

  useEffect(() => {
    const onResize = () => {
      const G = gameRef.current;
      if (!G.W) return;
      if (Math.abs(window.innerWidth - G.W) > 40) {
        const stateKeep = G.state;
        buildScene();
        G.state = stateKeep;
      } else {
        const previousGy = G.gy;
        G.H = window.innerHeight;
        G.gy = G.H * 0.8;
        G.sy = G.gy - 120 * G.u;
        const delta = G.gy - previousGy;
        G.blocks.forEach((block) => {
          block.y += delta;
        });
        G.pigs.forEach((pig) => {
          pig.y += delta;
        });
        G.bird.y += delta;
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="bird-blast-root">
      <style>{styles}</style>
      <canvas ref={canvasRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handleRelease} onPointerCancel={handleRelease} />
      <div id="hud">
        <div className="pill" id="logo">Bird Blast</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="pill" aria-label="Birds left">
            {Array.from({ length: 3 }).map((_, index) => (
              <span key={index} className={`dot${index < birds ? '' : ' off'}`} />
            ))}
          </div>
          <div className="pill">Score <span id="score">{score}</span></div>
          <div className="pill">Best <span id="best">{best}</span></div>
        </div>
      </div>
      <div id="card" className={gameState === 'aim' || gameState === 'fly' ? 'locked' : ''}>
        <div id="q">{questionText}</div>
        <div id="ans">
          {options.map(({ value, isCorrect }) => (
            <button
              key={value}
              type="button"
              className={answerState.correct === value ? 'ok' : answerState.wrong === value ? 'no' : ''}
              onClick={() => handleAnswer(value, isCorrect)}
              disabled={gameState !== 'ask'}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div id="ov" className={overlay ? 'on' : ''}>
        <div id="panel">
          <h1 id="t">{resultTitle}</h1>
          <div id="stars">{stars}</div>
          <p id="fs">{resultSummary}</p>
          <button id="again" type="button" onClick={reset}>Play again</button>
        </div>
      </div>
    </div>
  );
}
