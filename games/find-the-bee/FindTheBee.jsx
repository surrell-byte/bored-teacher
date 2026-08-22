import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Find The Bee — React port
 * Drop into your game engine like any other game component.
 * Expects an `onComplete` callback prop (matches your existing 33-game pattern):
 *   onComplete({ score, stars, level })
 *
 * No external deps. Confetti drawn on an absolutely-positioned canvas.
 * Sounds via WebAudio (no audio files needed).
 */

const PALETTES = [
  ['#ff9dc2', '#e8679c', '#ffd84d'],
  ['#ffb08c', '#e8825a', '#ffcc5c'],
  ['#c9a8e8', '#a06bc9', '#ffeaa7'],
  ['#ffccb5', '#e89a6e', '#ffdb6d'],
  ['#f9a8d4', '#d968a3', '#fff3b0'],
  ['#ffeaa7', '#e8b93a', '#ffb347'],
  ['#b8e0f7', '#7bb3d9', '#fff8dc'],
];
const OFFSETS = { 3: [0, -20, 8], 5: [0, -16, 6, -12, 3], 7: [0, -14, 6, -10, 3, -16, 8] };
const TILTS = [-3, 2, -5, 4, -2, 3, -4];
const FLOWER_COUNTS = [3, 5, 7]; // per level (1-indexed)

function flowerCount(level) {
  return FLOWER_COUNTS[level - 1] || 7;
}

function buildFlowerSVG(palette) {
  const [petal, shade, center] = palette;
  const petalPath =
    'M100,102 C78,86 66,54 78,20 C86,2 114,2 122,20 C134,54 122,86 100,102 Z';
  const petals = [];
  for (let a = 0; a < 8; a++) {
    const rot = a * 45;
    const isShade = a % 2 === 1;
    petals.push(
      <path
        key={a}
        d={petalPath}
        fill={isShade ? shade : petal}
        opacity={isShade ? 0.92 : 1}
        transform={`rotate(${rot} 100 100)`}
      />
    );
  }
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.9">{petals}</g>
      <circle cx="100" cy="100" r="30" fill={center} />
      <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
      <circle cx="88" cy="90" r="2.6" fill="rgba(120,80,20,0.45)" />
      <circle cx="104" cy="86" r="2.2" fill="rgba(120,80,20,0.4)" />
      <circle cx="112" cy="100" r="2.4" fill="rgba(120,80,20,0.45)" />
      <circle cx="96" cy="108" r="2.2" fill="rgba(120,80,20,0.4)" />
      <circle cx="82" cy="102" r="2" fill="rgba(120,80,20,0.4)" />
      <circle cx="106" cy="112" r="1.8" fill="rgba(120,80,20,0.35)" />
    </svg>
  );
}

// ── WebAudio SFX (lazy singleton context) ──
function useSfx() {
  const ctxRef = useRef(null);
  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  };

  const playBuzz = useCallback(() => {
    try {
      const c = getCtx(), t = c.currentTime;
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.linearRampToValueAtTime(280, t + 0.12);
      osc.frequency.linearRampToValueAtTime(200, t + 0.25);
      osc.frequency.linearRampToValueAtTime(350, t + 0.4);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.08);
      gain.gain.linearRampToValueAtTime(0.03, t + 0.5);
      gain.gain.linearRampToValueAtTime(0, t + 0.6);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(t); osc.stop(t + 0.6);
    } catch (e) {}
  }, []);

  const playWrong = useCallback(() => {
    try {
      const c = getCtx(), t = c.currentTime;
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.3);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.35);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(t); osc.stop(t + 0.4);
      const osc2 = c.createOscillator(), gain2 = c.createGain();
      osc2.type = 'sine'; osc2.frequency.setValueAtTime(55, t);
      gain2.gain.setValueAtTime(0.15, t);
      gain2.gain.linearRampToValueAtTime(0, t + 0.25);
      osc2.connect(gain2); gain2.connect(c.destination);
      osc2.start(t); osc2.stop(t + 0.25);
    } catch (e) {}
  }, []);

  const playWinChime = useCallback(() => {
    try {
      const c = getCtx(), t = c.currentTime;
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = c.createOscillator(), gain = c.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        const st = t + i * 0.1;
        gain.gain.setValueAtTime(0.13, st);
        gain.gain.linearRampToValueAtTime(0, st + 0.35);
        osc.connect(gain); gain.connect(c.destination);
        osc.start(st); osc.stop(st + 0.4);
      });
    } catch (e) {}
  }, []);

  const playClick = useCallback(() => {
    try {
      const c = getCtx(), t = c.currentTime;
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.linearRampToValueAtTime(300, t + 0.08);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.1);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(t); osc.stop(t + 0.1);
    } catch (e) {}
  }, []);

  return { playBuzz, playWrong, playWinChime, playClick };
}

// ── Confetti canvas ──
function ConfettiCanvas({ triggerKey }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!triggerKey) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const shapes = ['rect', 'circle', 'triangle'];
    const pieces = [];
    for (let i = 0; i < 220; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * 700 - 50,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 5 + 3,
        size: Math.random() * 10 + 5,
        color: `hsl(${Math.random() * 360},85%,${55 + Math.random() * 30}%)`,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        shape: shapes[Math.floor(Math.random() * 3)],
        opacity: 0.85 + Math.random() * 0.15,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        else if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.rotation += p.rotSpeed; p.vx *= 0.998;
      });
      const active = pieces.filter((p) => p.y < canvas.height + 100 && p.opacity > 0.01);
      if (active.length > 0) animRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.width !== window.innerWidth) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }}
    />
  );
}

export default function FindTheBee({ onComplete }) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [beeIndex, setBeeIndex] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [doneMap, setDoneMap] = useState({});     // index -> 'wrong' | 'correct'
  const [elapsed, setElapsed] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [toast, setToast] = useState(null);
  const [scorePulse, setScorePulse] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [popup, setPopup] = useState(null); // { points, x, y }
  const [revealIndex, setRevealIndex] = useState(null);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);
  const { playBuzz, playWrong, playWinChime, playClick } = useSfx();

  const count = flowerCount(level);
  const offsets = OFFSETS[count] || OFFSETS[7];

  const startLevel = useCallback((lvl) => {
    const c = flowerCount(lvl);
    setGameActive(true);
    setAttempts(3);
    setDoneMap({});
    setShowNext(false);
    setGameOver(false);
    setRevealIndex(null);
    setBeeIndex(Math.floor(Math.random() * c));
    startTimeRef.current = Date.now();
    setElapsed(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 200);
  }, []);

  useEffect(() => {
    startLevel(1);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback((finalScore) => {
    setShowNext(false);
    setGameOver(true);
    let starCount = 1;
    if (finalScore > 600) starCount = 2;
    if (finalScore > 1000) starCount = 3;
    setConfettiKey((k) => k + 1);
    if (onComplete) onComplete({ score: finalScore, stars: starCount, level });
  }, [onComplete, level]);

  const handleWin = useCallback((index, event) => {
    playBuzz();
    playWinChime();
    setRevealIndex(index);

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const timeBonus = Math.max(0, 60 - timeTaken * 3);
    const earnedPoints = attempts * 120 + timeBonus + 50;

    setScore((s) => {
      const next = s + earnedPoints;
      if (level >= 3) setTimeout(() => finish(next), 900);
      return next;
    });
    setScorePulse(true);
    setTimeout(() => setScorePulse(false), 350);

    const rect = event.currentTarget.getBoundingClientRect();
    setPopup({ points: earnedPoints, x: rect.left + rect.width / 2 - 30, y: rect.top - 10 });
    setTimeout(() => setPopup(null), 1500);

    if (level < 3) setShowNext(true);
  }, [attempts, level, finish, playBuzz, playWinChime]);

  const guess = useCallback((index, event) => {
    if (!gameActive) return;
    if (doneMap[index]) return;
    playClick();

    if (index === beeIndex) {
      setGameActive(false);
      clearInterval(timerRef.current);
      setDoneMap((m) => ({ ...m, [index]: 'correct' }));
      handleWin(index, event);
    } else {
      setDoneMap((m) => ({ ...m, [index]: 'wrong' }));
      playWrong();
      setAttempts((a) => {
        const next = a - 1;
        if (next === 0) {
          setGameActive(false);
          clearInterval(timerRef.current);
          setToast(`😢 The bee was behind Flower ${beeIndex + 1}!`);
          setRevealIndex(beeIndex);
          setTimeout(() => setToast(null), 2100);
          setTimeout(() => startLevel(level), 1800);
        } else {
          setTimeout(() => {
            setDoneMap((m) => {
              const copy = { ...m };
              delete copy[index];
              return copy;
            });
          }, 500);
        }
        return next;
      });
    }
  }, [gameActive, doneMap, beeIndex, level, startLevel, handleWin, playClick, playWrong]);

  const handleNext = () => {
    playClick();
    const nextLevel = level + 1;
    setLevel(nextLevel);
    startLevel(nextLevel);
  };

  const handleRestart = () => {
    playClick();
    setLevel(1);
    setScore(0);
    startLevel(1);
  };

  return (
    <div className="ftb-root">
      <style>{`
        .ftb-root {
          font-family: 'Inter', system-ui, sans-serif;
          text-align: center;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          color: #2c2233;
          min-height: 100%;
          padding: clamp(14px, 2.5vh, 28px) clamp(14px, 4vw, 40px) clamp(16px, 3vh, 28px);
          max-width: 1180px;
          margin: 0 auto;
          position: relative;
          width: 100%;
          background: url('/assets/images/find-the-bee-game-screen-bg.webp') center / cover;
          border-radius: 0;
        }
        .ftb-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(.68rem, 1.6vw, .78rem);
          font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
          color: #5c4f63; background: rgba(255,255,255,.55);
          border: 1px solid rgba(255,255,255,.7);
          padding: 5px 16px; border-radius: 20px; margin-bottom: 10px;
        }
        .ftb-h1 {
          font-family: Georgia, serif; font-weight: 800;
          font-size: clamp(1.8rem, 5.4vw, 3.4rem);
          color: #2c2233; margin: 2px 0 6px;
        }
        .ftb-h1 em { font-style: italic; color: #b9791e; }
        .ftb-subtitle {
          font-size: clamp(.85rem, 1.8vw, 1.05rem);
          color: #5c4f63; font-weight: 500;
          max-width: 560px; margin: 0 auto 20px;
        }
        .ftb-hud {
          display: flex; justify-content: center; align-items: stretch;
          gap: clamp(6px, 2vw, 14px); flex-wrap: wrap;
          margin: 0 auto 22px; background: rgba(255,250,238,.78);
          border: 1.5px solid rgba(255,255,255,.9);
          border-radius: 34px; padding: clamp(10px, 1.8vh, 16px);
          box-shadow: 0 20px 60px rgba(44,34,51,.22);
          max-width: 680px;
        }
        .ftb-hud-item { display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 3px; padding: 4px clamp(12px,3vw,22px); min-width: 84px; }
        .ftb-hud-label {
          font-family: 'JetBrains Mono', monospace; font-size: .7rem;
          letter-spacing: .1em; text-transform: uppercase; color: #5c4f63;
          font-weight: 700; opacity: .75;
        }
        .ftb-hud-value {
          font-size: clamp(1.15rem, 3vw, 1.4rem); font-weight: 800;
          color: #2c2233; display: flex; align-items: center; gap: 5px;
          transition: transform .25s cubic-bezier(.175,.885,.32,1.275);
        }
        .ftb-hud-value.pulse { transform: scale(1.3); color: #b9791e; }
        .ftb-flowers {
          display: flex; justify-content: center; align-items: flex-end;
          flex-wrap: wrap; gap: 10px 22px; padding: 30px 4px 10px;
        }
        .ftb-flower-wrapper {
          width: 118px; display: flex; flex-direction: column; align-items: center;
          transform: translateY(var(--offset, 0px)) rotate(var(--tilt, 0deg));
        }
        .ftb-bloom {
          width: 100%; aspect-ratio: 1; cursor: pointer; position: relative;
          transition: transform .15s ease;
        }
        .ftb-bloom:hover { transform: scale(1.06) rotate(-2deg); }
        .ftb-bloom.wrong { animation: ftb-shake .4s ease; filter: grayscale(.5) brightness(.85); }
        @keyframes ftb-shake {
          0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .ftb-stem { width: 4px; height: 40px; background: linear-gradient(#4c7a4f,#2e5330); margin: 0 auto; border-radius: 2px; }
        .ftb-label { font-size: .78rem; font-weight: 600; color: #5c4f63; margin-top: 4px; }
        .ftb-bee { position: absolute; top: 50%; left: 50%; font-size: 1.6rem;
          transform: translate(-50%,-50%); animation: ftb-bee-pop .5s ease-out; }
        @keyframes ftb-bee-pop { from { transform: translate(-50%,-50%) scale(0); } to { transform: translate(-50%,-50%) scale(1); } }
        .ftb-next, .ftb-restart {
          margin-top: 14px; padding: 15px 36px; font-weight: 700; color: #fff;
          border: none; border-radius: 30px; cursor: pointer; font-size: 1.05rem;
        }
        .ftb-next { background: linear-gradient(135deg,#e8a838,#b9791e); box-shadow: 0 10px 28px rgba(185,121,30,.4); }
        .ftb-restart { background: linear-gradient(135deg,#4c7a4f,#2e5330); box-shadow: 0 10px 26px rgba(46,83,48,.35); }
        .ftb-gameover {
          margin: 20px auto 0; background: rgba(255,250,238,.78);
          border: 2px solid rgba(255,255,255,.9); border-radius: 26px;
          padding: 30px; max-width: 440px; box-shadow: 0 20px 60px rgba(44,34,51,.22);
        }
        .ftb-stars { font-size: clamp(2.2rem, 8vw, 3.4rem); margin: 8px 0; letter-spacing: 4px; }
        .ftb-toast {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
          background: rgba(44,34,51,.92); color: #fff; padding: 11px 26px;
          border-radius: 24px; font-weight: 600; z-index: 60;
        }
        .ftb-popup {
          position: fixed; font-weight: 800; font-size: 1.3rem; color: #b9791e;
          z-index: 60; pointer-events: none; animation: ftb-popup-float 1.5s ease-out forwards;
        }
        @keyframes ftb-popup-float { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-50px); } }
      `}</style>

      <span className="ftb-eyebrow">🐝 garden puzzle · 3 levels</span>
      <h1 className="ftb-h1">Find The <em>Bee</em></h1>
      <p className="ftb-subtitle">One flower is hiding a buzzing bee — narrow it down before you're out of hearts.</p>

      <div className="ftb-hud">
        <div className="ftb-hud-item"><div><strong>Level {level}</strong></div></div>
        <div className="ftb-hud-item">
          <span className="ftb-hud-label">Score</span>
          <span className={`ftb-hud-value${scorePulse ? ' pulse' : ''}`}>⭐ {score}</span>
        </div>
        <div className="ftb-hud-item">
          <span className="ftb-hud-label">Hearts</span>
          <span className="ftb-hud-value">
            {[0, 1, 2].map((i) => (i < attempts ? '❤️' : '💔'))}
          </span>
        </div>
        <div className="ftb-hud-item">
          <span className="ftb-hud-label">Time</span>
          <span className="ftb-hud-value">⏱ {elapsed}s</span>
        </div>
      </div>

      {!gameOver && (
        <div className="ftb-flowers">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="ftb-flower-wrapper"
              style={{ '--offset': `${offsets[i % offsets.length]}px`, '--tilt': `${TILTS[i % TILTS.length]}deg` }}
            >
              <div
                className={`ftb-bloom${doneMap[i] === 'wrong' ? ' wrong' : ''}`}
                onClick={(e) => guess(i, e)}
              >
                {buildFlowerSVG(PALETTES[i % PALETTES.length])}
                {revealIndex === i && <div className="ftb-bee">🐝</div>}
              </div>
              <div className="ftb-stem" />
              <span className="ftb-label">Flower {i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {showNext && !gameOver && (
        <button className="ftb-next" onClick={handleNext}>🌟 Next Level →</button>
      )}

      {gameOver && (
        <div className="ftb-gameover">
          <h2>Amazing!</h2>
          <div className="ftb-stars">
            {'⭐'.repeat(score > 1000 ? 3 : score > 600 ? 2 : 1)}
          </div>
          <h3>🏆 Final Score: {score}</h3>
          <button className="ftb-restart" onClick={handleRestart}>🔄 Play Again</button>
        </div>
      )}

      {toast && <div className="ftb-toast">{toast}</div>}
      {popup && (
        <div className="ftb-popup" style={{ left: popup.x, top: popup.y }}>
          +{popup.points}
        </div>
      )}

      <ConfettiCanvas triggerKey={confettiKey} />
    </div>
  );
}
