import React, { useState, useRef, useEffect } from 'react';

const WIN_TARGET = 200;
const COLORS = {
  red: { body: '#c0392b', sleeve: '#922b21', hair: '#3d1108', skin: '#f5c6a0', bow: '#8b4513', name: 'Red' },
  green: { body: '#27ae60', sleeve: '#1e8449', hair: '#3e2723', skin: '#f5c6a0', bow: '#6d4c41', name: 'Green' },
  yellow: { body: '#f39c12', sleeve: '#d68910', hair: '#4e342e', skin: '#f5c6a0', bow: '#795548', name: 'Yellow' },
  blue: { body: '#2471a3', sleeve: '#1a5276', hair: '#212121', skin: '#f5c6a0', bow: '#37474f', name: 'Blue' },
};
const COLOR_KEYS = Object.keys(COLORS);
const SHOT_POOLS = [
  [{ label: "Bull's-eye!", icon: '🎯', pts: 30, desc: 'Dead centre — perfect form' }, { label: 'Inner ring', icon: '⭕', pts: 15, desc: 'Solid hit on the red' }, { label: 'Wide miss', icon: '💨', pts: -10, desc: 'Arrow sails past the boss' }],
  [{ label: 'Gold!', icon: '✨', pts: 40, desc: 'Strikes the gold centre' }, { label: 'Graze', icon: '〰', pts: 5, desc: 'Clips the outer white' }, { label: 'Lost arrow', icon: '❌', pts: -15, desc: 'Completely off target' }],
  [{ label: 'Black ring', icon: '◉', pts: 20, desc: 'Solid black ring hit' }, { label: 'Outer miss', icon: '🌀', pts: 0, desc: 'Arrow hits the backing — no score' }, { label: 'Stumble', icon: '😬', pts: -10, desc: 'Slipped on release' }],
  [{ label: 'Double gold', icon: '🌟', pts: 50, desc: 'Back-to-back golds — legendary!' }, { label: 'Blue ring', icon: '🔵', pts: 10, desc: 'Hits the blue zone' }, { label: 'Foul shot', icon: '⚠️', pts: -20, desc: 'Line fault — heavy penalty' }],
  [{ label: 'Steady hand', icon: '🤚', pts: 25, desc: 'Calm, controlled release' }, { label: 'Wind deflect', icon: '🌬️', pts: 0, desc: 'Gust pushes it wide — no score' }, { label: 'Dropped nock', icon: '💢', pts: -5, desc: 'Arrow slips off the string' }],
];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

function ArcherSvg({ colorKey, facing, ...props }) {
  if (!colorKey) return <svg {...props} aria-hidden="true" />;
  const c = COLORS[colorKey];
  const transform = facing === 'right' ? 'scale(-1,1) translate(-72,0)' : undefined;
  return (
    <svg {...props} aria-label={`${c.name} archer`} role="img">
      <g transform={transform}>
        <rect x="24" y="74" width="10" height="28" rx="5" fill="#2c2c2c" /><rect x="38" y="74" width="10" height="28" rx="5" fill="#2c2c2c" />
        <rect x="21" y="95" width="14" height="8" rx="3" fill="#1a1a1a" /><rect x="37" y="95" width="14" height="8" rx="3" fill="#1a1a1a" />
        <rect x="22" y="44" width="28" height="34" rx="7" fill={c.body} />
        <rect x="8" y="46" width="11" height="20" rx="5" fill={c.sleeve} /><rect x="53" y="46" width="11" height="20" rx="5" fill={c.sleeve} />
        <circle cx="13" cy="67" r="5" fill={c.skin} /><circle cx="58" cy="67" r="5" fill={c.skin} />
        <ellipse cx="36" cy="30" rx="14" ry="15" fill={c.skin} /><ellipse cx="36" cy="17" rx="14" ry="8" fill={c.hair} /><rect x="22" y="17" width="28" height="8" fill={c.hair} />
        <circle cx="31" cy="30" r="2" fill="#2c1a0e" /><circle cx="41" cy="30" r="2" fill="#2c1a0e" />
        <path d="M8 38 Q0 60 8 82" fill="none" stroke={c.bow} strokeWidth="3" strokeLinecap="round" /><line x1="8" y1="38" x2="8" y2="82" stroke={c.bow} strokeWidth="1.5" strokeDasharray="3,2" opacity=".5" />
        <line x1="8" y1="60" x2="55" y2="60" stroke="#8b6914" strokeWidth="2" strokeLinecap="round" /><polygon points="55,57 62,60 55,63" fill="#8b6914" />
      </g>
    </svg>
  );
}

function ArenaScene() {
  return (
    <svg className="ad-arena-scene" viewBox="0 0 1100 280" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ad-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b8d4f0" /><stop offset="100%" stopColor="#d8ead0" /></linearGradient>
        <linearGradient id="ad-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7ab84a" /><stop offset="100%" stopColor="#4a8020" /></linearGradient>
      </defs>
      <rect width="1100" height="280" fill="url(#ad-sky)" />
      <g fill="white" opacity=".72"><ellipse cx="180" cy="42" rx="65" ry="20" /><ellipse cx="220" cy="35" rx="42" ry="15" /><ellipse cx="720" cy="48" rx="60" ry="18" /><ellipse cx="765" cy="40" rx="35" ry="13" /></g>
      <rect y="205" width="1100" height="75" fill="url(#ad-ground)" /><rect y="205" width="1100" height="5" fill="#5a9030" />
      <g fill="#3a6825"><polygon points="360,48 330,130 390,130" /><polygon points="360,25 322,105 398,105" /><polygon points="470,70 442,140 498,140" /><polygon points="820,54 790,135 850,135" /></g>
      <g fill="#4a7030"><rect x="355" y="110" width="10" height="100" /><rect x="465" y="120" width="8" height="90" /><rect x="815" y="110" width="9" height="100" /></g>
      <rect x="970" y="170" width="5" height="40" fill="#8b6914" /><rect x="955" y="170" width="35" height="18" rx="2" fill="#c8a84b" /><text x="972" y="182" textAnchor="middle" fontSize="10" fontFamily="serif" fill="#3a2a08" fontWeight="bold">50m</text>
    </svg>
  );
}

function TargetSvg({ shakeKey, targetRef }) {
  return <svg ref={targetRef} className={`ad-target ${shakeKey ? 'target-shake' : ''}`} viewBox="0 0 90 130" aria-label="archery target" role="img">
    <rect x="38" y="80" width="6" height="50" fill="#7a5c18" rx="2" /><rect x="25" y="120" width="32" height="7" rx="3" fill="#5a3e10" />
    <ellipse cx="44" cy="46" rx="38" ry="42" fill="#c8a030" /><circle cx="44" cy="46" r="34" fill="white" stroke="#ccc" strokeWidth=".5" /><circle cx="44" cy="46" r="28" fill="#111" /><circle cx="44" cy="46" r="22" fill="#1a1aaa" /><circle cx="44" cy="46" r="16" fill="#cc2222" /><circle cx="44" cy="46" r="10" fill="#ffcc00" /><circle cx="44" cy="46" r="5" fill="#ffee88" />
  </svg>;
}

export default function ArchersDuel({ onComplete }) {
  const [screen, setScreen] = useState('setup');
  const [setupStep, setSetupStep] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [picks, setPicks] = useState({});
  const [scores, setScores] = useState({ student: 0, teacher: 0 });
  const [currentTurn, setCurrentTurn] = useState('student');
  const [currentShots, setCurrentShots] = useState([]);
  const [revealedIdx, setRevealedIdx] = useState(null);
  const [chosenIdx, setChosenIdx] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resultText, setResultText] = useState('The range is ready. Choose a tile to reveal your fate.');
  const [resultCls, setResultCls] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [floatingPoints, setFloatingPoints] = useState(null);
  const canvasRef = useRef(null);
  const arenaRef = useRef(null);
  const targetRef = useRef(null);
  const animationRef = useRef(null);

  const newRound = (turn) => {
    setCurrentShots(shuffle(SHOT_POOLS[Math.floor(Math.random() * SHOT_POOLS.length)]));
    setRevealedIdx(null); setChosenIdx(null); setResultCls(''); setBusy(false);
    setResultText(`${turn === 'student' ? 'Student' : 'Teacher'} — choose your shot.`);
  };

  const startGame = (finalPicks) => {
    setPicks(finalPicks); setScores({ student: 0, teacher: 0 }); setCurrentTurn('student'); setScreen('game'); newRound('student');
  };

  const confirmPick = () => {
    if (!selectedColor) return;
    if (setupStep === 0) { setPicks({ student: selectedColor }); setSetupStep(1); setSelectedColor(null); }
    else startGame({ ...picks, teacher: selectedColor });
  };

  const drawArrow = (ctx, x, y, angle, pts) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(10, 0); ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(18, -3); ctx.lineTo(22, 0); ctx.lineTo(18, 3); ctx.closePath(); ctx.fillStyle = '#c0a030'; ctx.fill(); ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-16, -5); ctx.lineTo(-14, 0); ctx.lineTo(-16, 5); ctx.closePath(); ctx.fillStyle = pts >= 0 ? '#c0392b' : '#555'; ctx.fill(); ctx.restore();
  };

  const impact = (x, y, pts) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); const start = performance.now(); const color = pts >= 40 ? '#ffe36e' : pts >= 25 ? '#ffcc44' : '#ff8844';
    const frame = (now) => {
      const t = Math.min((now - start) / 700, 1); ctx.clearRect(0, 0, canvas.width, canvas.height); drawArrow(ctx, x - 8, y, Math.PI, pts);
      ctx.save(); ctx.globalAlpha = (1 - t) * .85; ctx.beginPath(); ctx.arc(x, y, t * 65, 0, Math.PI * 2); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.shadowBlur = 18; ctx.shadowColor = color; ctx.stroke();
      ctx.globalAlpha = (1 - t) * .9;
      for (let index = 0; index < 8; index += 1) {
        const angle = (Math.PI * 2 * index) / 8;
        const distance = 18 + t * 42;
        ctx.beginPath(); ctx.arc(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      }
      ctx.restore();
      if (t < 1) animationRef.current = requestAnimationFrame(frame);
    };
    animationRef.current = requestAnimationFrame(frame); setShakeKey((key) => key + 1);
  };

  const animateArrow = (pts, done) => {
    const canvas = canvasRef.current; const wrap = arenaRef.current; if (!canvas || !wrap) { done(); return; }
    const width = wrap.offsetWidth || 900; const height = 280; canvas.width = width; canvas.height = height;
    const wrapRect = wrap.getBoundingClientRect();
    const targetRect = targetRef.current?.getBoundingClientRect();
    const archerRect = document.querySelector('.ad-active-archer')?.getBoundingClientRect();
    const startX = archerRect ? archerRect.left - wrapRect.left + archerRect.width * .13 : 48;
    const startY = archerRect ? archerRect.top - wrapRect.top + archerRect.height * .55 : height - 78;
    const targetX = targetRect ? targetRect.left - wrapRect.left + targetRect.width * .49 : width * .86;
    const targetY = targetRect ? targetRect.top - wrapRect.top + targetRect.height * .35 : height * .58;
    const endX = pts > 0 ? targetX : targetX + 80;
    const endY = pts > 0 ? targetY : targetY - 38;
    const started = performance.now(); const ctx = canvas.getContext('2d');
    const frame = (now) => { const raw = Math.min((now - started) / 560, 1); const t = 1 - Math.pow(1 - raw, 3); ctx.clearRect(0, 0, width, height); const x = startX + (endX - startX) * t; const y = startY + (endY - startY) * t - Math.sin(raw * Math.PI) * 35; drawArrow(ctx, x, y, Math.atan2(endY - startY, endX - startX) + Math.PI, pts); if (raw < 1) animationRef.current = requestAnimationFrame(frame); else { if (pts > 0) impact(endX, endY, pts); setTimeout(() => { ctx.clearRect(0, 0, width, height); done(); }, pts > 0 ? 850 : 350); } };
    animationRef.current = requestAnimationFrame(frame);
  };

  const chooseTile = (idx) => {
    if (busy) return;
    const shot = currentShots[idx]; const role = currentTurn === 'student' ? 'Student' : 'Teacher';
    setBusy(true); setRevealedIdx(idx); setChosenIdx(idx); setFloatingPoints({ value: shot.pts, id: Date.now() });
    setResultText(shot.pts > 0 ? `🎯 ${shot.label.toUpperCase()}` : shot.pts === 0 ? `💨 ${shot.label.toUpperCase()}` : `💥 ${shot.label.toUpperCase()}`);
    setResultCls(shot.pts > 0 ? 'hit' : shot.pts < 0 ? 'miss' : '');
    setTimeout(() => animateArrow(shot.pts, () => {
      setScores((previous) => {
        const next = { ...previous, [currentTurn]: Math.max(0, previous[currentTurn] + shot.pts) };
        if (next.student >= WIN_TARGET || next.teacher >= WIN_TARGET) { setScreen('win'); onComplete?.(next[currentTurn], Math.round((next[currentTurn] / WIN_TARGET) * 100)); }
        else { const nextTurn = currentTurn === 'student' ? 'teacher' : 'student'; setCurrentTurn(nextTurn); setTimeout(() => newRound(nextTurn), 850); }
        return next;
      });
    }), 350);
  };

  const restartGame = () => { setPicks({}); setSetupStep(0); setSelectedColor(null); setScreen('setup'); };
  useEffect(() => () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }, []);

  const winner = scores.student >= WIN_TARGET ? 'student' : 'teacher';
  const winnerName = picks[winner] ? `${COLORS[picks[winner]].name} Archer (${winner === 'student' ? 'Student' : 'Teacher'})` : '';

  return <div className="archer-duel-root">
    <style>{`
      .archer-duel-root{--bg0:#07130d;--bg1:#0d2116;--bg2:#153522;--gold:#d8ad45;--gold-light:#ffe49a;--gold-dark:#73551c;--cream:#fff7df;--muted:#bbaf8c;--red:#e94b4b;--blue:#3e9ee8;min-height:100vh;width:100%;color:var(--cream);font-family:'Nunito','Segoe UI',sans-serif;background:radial-gradient(circle at 50% -10%,rgba(216,173,69,.18),transparent 35%),radial-gradient(circle at 10% 80%,rgba(32,105,63,.25),transparent 35%),linear-gradient(180deg,var(--bg2),var(--bg1) 42%,var(--bg0));overflow-x:hidden;position:relative}.archer-duel-root *{box-sizing:border-box}.ad-header{width:100%;padding:18px 20px 14px;text-align:center;border-bottom:1px solid var(--gold-dark);background:linear-gradient(180deg,#0e1e16,transparent)}.ad-header:after{content:'';display:block;width:220px;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:10px auto 0}.ad-h1{font-family:Georgia,serif;font-size:clamp(1.6rem,4vw,2.5rem);font-weight:900;letter-spacing:.15em;color:var(--gold-light);text-shadow:0 2px 12px rgba(200,168,75,.4);margin:0}.ad-h1 span{color:var(--gold);font-size:.5em;display:block;letter-spacing:.4em;font-weight:400;margin-top:4px}#setupScreen{width:min(100%,760px);padding:42px 20px}.setup-title{font-family:Georgia,serif;font-size:1.3rem;color:var(--gold-light);text-align:center;letter-spacing:.12em;margin:0 0 8px}.setup-sub{color:var(--muted);font-size:1rem;font-style:italic;text-align:center;margin:0 0 24px}.sprite-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}.sprite-card{background:linear-gradient(160deg,#2a4030,#1a2e22);border:1px solid var(--gold-dark);border-radius:14px;padding:16px 8px 12px;text-align:center;cursor:pointer;transition:.2s}.sprite-card:hover{border-color:var(--gold);transform:translateY(-4px);box-shadow:0 12px 28px #0006}.sprite-card.selected{border:2px solid var(--gold-light);box-shadow:0 0 24px #c8a84b66}.sprite-card.taken{opacity:.3;pointer-events:none}.sprite-card svg{display:block;margin:0 auto 8px}.sprite-card-label{font-family:Georgia,serif;font-size:.8rem;letter-spacing:.12em;color:var(--gold)}.confirm-btn,.play-again-btn{display:block;width:100%;background:linear-gradient(135deg,var(--gold-dark),var(--gold));border:0;border-radius:10px;padding:14px;font-family:Georgia,serif;font-size:1rem;font-weight:700;letter-spacing:.12em;color:#1a1208;cursor:pointer;transition:.2s}.confirm-btn:disabled{opacity:.35;cursor:not-allowed}.confirm-btn:not(:disabled):hover,.play-again-btn:hover{transform:translateY(-2px)}#gameScreen{width:min(1100px,calc(100% - 28px));margin:0 auto;padding:22px 0 46px}.scoreboard{display:flex;align-items:stretch;margin-bottom:18px;border:1px solid var(--gold-dark);border-radius:14px;overflow:hidden;box-shadow:0 14px 30px #0005}.score-panel{flex:1;padding:16px 20px;position:relative}.score-panel.student{background:linear-gradient(135deg,#351717,#17281d);border-right:1px solid var(--gold-dark)}.score-panel.teacher{background:linear-gradient(135deg,#151f35,#17231d)}.score-panel .role{font-family:Georgia,serif;font-size:.68rem;letter-spacing:.25em;color:var(--gold);text-transform:uppercase}.player-name{font-family:Georgia,serif;font-size:1.05rem;color:var(--gold-light);margin:3px 0 7px}.pts-value{font-family:Georgia,serif;font-size:2.4rem;font-weight:900;color:#fff;line-height:1}.pts-label{font-size:.75rem;color:var(--muted);font-style:italic}.progress-track{height:6px;background:#ffffff14;border-radius:4px;margin-top:10px;overflow:hidden}.progress-fill-s,.progress-fill-t{height:100%;border-radius:4px;transition:width .5s ease}.progress-fill-s{background:linear-gradient(90deg,#c0392b,#e74c3c)}.progress-fill-t{background:linear-gradient(90deg,#1a5276,#2980b9)}.active-turn:after{content:'▶ YOUR TURN';font-family:Georgia,serif;font-size:.6rem;letter-spacing:.12em;color:var(--gold);position:absolute;top:14px;right:16px}.score-divider{width:58px;display:flex;align-items:center;justify-content:center;background:#1a2820;font-family:Georgia,serif;font-size:1.4rem;color:var(--gold-dark);border-inline:1px solid var(--gold-dark)}.arena-wrap{position:relative;width:100%;height:280px;border-radius:16px;overflow:hidden;border:1px solid var(--gold-dark);margin-bottom:16px;background:#d4e8c0;box-shadow:0 18px 38px #0006}.ad-arena-scene{position:absolute;inset:0;width:100%;height:100%}.ad-target{position:absolute;width:110px;height:160px;right:8%;bottom:13px;z-index:3}.arena-wrap svg:not(.ad-arena-scene){overflow:visible}.turn-banner{background:linear-gradient(135deg,#1a3020f5,#1a3020d9);border:1px solid var(--gold-dark);border-radius:10px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}.turn-name{font-family:Georgia,serif;font-size:1rem;color:var(--gold-light);letter-spacing:.08em}.turn-instruction{font-size:.9rem;color:var(--muted);font-style:italic}.tiles-section{margin-bottom:16px}.tiles-label{font-family:Georgia,serif;font-size:.72rem;letter-spacing:.2em;color:var(--gold);margin-bottom:9px;text-align:center}.tiles-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.tile{position:relative;height:116px;border-radius:14px;cursor:pointer;overflow:hidden;border:2px solid transparent;transition:.2s}.tile:hover:not(.disabled){transform:translateY(-5px) scale(1.025);box-shadow:0 14px 30px #0008}.tile.disabled{cursor:not-allowed;pointer-events:none}.tile-face,.tile-back{position:absolute;inset:0;border-radius:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;backface-visibility:hidden}.tile-1 .tile-face{background:linear-gradient(145deg,#8b1a1a,#c0392b)}.tile-2 .tile-face{background:linear-gradient(145deg,#1a5276,#2471a3)}.tile-3 .tile-face{background:linear-gradient(145deg,#1a5c1a,#27ae60)}.tile-num{font-family:Georgia,serif;font-size:3rem;font-weight:900;color:#ffffff55;line-height:1}.tile-q{font-size:.7rem;letter-spacing:.2em;color:#ffffff66;font-family:Georgia,serif;margin-top:3px}.tile-back{opacity:0;pointer-events:none;background:linear-gradient(145deg,#2a3a20,#1e2c18);border:1px solid var(--gold-dark);padding:8px}.tile-back .rev-icon{font-size:2rem;margin-bottom:4px}.rev-label{font-family:Georgia,serif;font-size:.72rem;letter-spacing:.1em;color:var(--gold);text-align:center}.rev-pts{font-family:Georgia,serif;font-size:1.25rem;font-weight:700;margin-top:4px}.rev-pts.pos{color:#6fcf6f}.rev-pts.neg{color:#e07070}.rev-pts.zero{color:#aaa}.tile.revealed .tile-face{opacity:0}.tile.revealed .tile-back{opacity:1;pointer-events:auto}.tile.chosen{border-color:var(--gold);box-shadow:0 0 20px #c8a84b66}#resultBox{background:linear-gradient(135deg,#142218f7,#0f1814e8);border:1px solid var(--gold-dark);border-radius:12px;padding:18px;min-height:64px;font-size:1.08rem;color:var(--cream);font-style:italic;text-align:center;line-height:1.5;transition:.3s}#resultBox.hit{border-color:#6fcf6f;box-shadow:0 0 20px #6fcf6f33}#resultBox.miss{border-color:#e07070;box-shadow:0 0 20px #e0707033}.floating-points{position:fixed;left:50%;top:48%;transform:translate(-50%,-50%);z-index:100;pointer-events:none;font-family:Georgia,serif;font-size:clamp(3rem,10vw,6rem);font-weight:900;text-shadow:0 5px 20px #000b;animation:pointsFly 1s cubic-bezier(.16,1,.3,1) forwards}.floating-points.positive{color:#8cff9a;text-shadow:0 0 15px #64ff7899,0 5px 20px #000b}.floating-points.negative{color:#ff7272;text-shadow:0 0 15px #ff505066,0 5px 20px #000b}@keyframes pointsFly{0%{opacity:0;transform:translate(-50%,-35%) scale(.55)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}55%{opacity:1;transform:translate(-50%,-60%) scale(1)}100%{opacity:0;transform:translate(-50%,-100%) scale(.9)}}#winScreen{width:min(100%,560px);padding:54px 24px;text-align:center}.win-crown{font-size:4rem;margin-bottom:8px}.win-title{font-family:Georgia,serif;font-size:clamp(1.7rem,5vw,2.4rem);font-weight:900;color:var(--gold-light);letter-spacing:.08em;margin-bottom:5px}.win-sub{color:var(--muted);font-size:1.1rem;font-style:italic;margin-bottom:28px}.final-scores{display:flex;gap:16px;justify-content:center;margin-bottom:28px}.final-card{background:linear-gradient(160deg,#2a3a20,#1a2a18);border:1px solid var(--gold-dark);border-radius:12px;padding:18px 28px;min-width:140px}.fc-role{font-family:Georgia,serif;font-size:.65rem;letter-spacing:.2em;color:var(--gold)}.fc-name{font-family:Georgia,serif;font-size:.95rem;color:var(--gold);margin:3px 0 8px}.fc-pts{font-family:Georgia,serif;font-size:2.3rem;font-weight:900;color:#fff}@keyframes targetShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px) rotate(-2deg)}40%{transform:translateX(5px) rotate(2deg)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}.target-shake{animation:targetShake .5s ease}@media(max-width:700px){.sprite-grid{grid-template-columns:repeat(2,1fr)}#gameScreen{width:calc(100% - 24px);padding-top:14px}.arena-wrap{height:210px}.ad-target{width:82px;height:120px;right:4%;bottom:8px}.score-panel{padding:13px 12px}.pts-value{font-size:1.8rem}.active-turn:after{position:static;display:block;margin-top:7px}.score-divider{width:38px}.turn-banner{align-items:flex-start;flex-direction:column}.tiles-row{gap:8px}.tile{height:100px}.tile-num{font-size:2.3rem}.final-scores{gap:8px}.final-card{min-width:0;flex:1;padding:16px 10px}.fc-name{font-size:.8rem}}@media(prefers-reduced-motion:reduce){.archer-duel-root *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      .ad-student,.ad-teacher{position:absolute;bottom:12px;z-index:5}.ad-student,.ad-teacher{left:35px}.ad-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6}
      @keyframes targetFlash{0%,100%{filter:brightness(1) drop-shadow(0 0 0 transparent)}25%{filter:brightness(1.8) drop-shadow(0 0 18px #ffe36e)}55%{filter:brightness(1.25) drop-shadow(0 0 9px #ffcc44)}}.target-shake{animation:targetShake .5s ease,targetFlash .7s ease}
    `}</style>
    <header className="ad-header"><h1 className="ad-h1">ARCHER'S DUEL<span>A CLASSROOM CHALLENGE</span></h1></header>
    {screen === 'setup' && <div id="setupScreen"><p className="setup-title">{setupStep === 0 ? 'Student — Choose Your Archer' : 'Teacher — Choose Your Archer'}</p><p className="setup-sub">{setupStep === 0 ? 'Select your colour. First to 200 points wins the range!' : 'Student has chosen. Now pick your colour!'}</p><div className="sprite-grid">{COLOR_KEYS.map((key) => { const taken = setupStep === 1 && key === picks.student; return <button key={key} className={`sprite-card${selectedColor === key ? ' selected' : ''}${taken ? ' taken' : ''}`} disabled={taken} onClick={() => setSelectedColor(key)}><ArcherSvg colorKey={key} facing="right" width="72" height="100" viewBox="0 0 72 110" /><div className="sprite-card-label">{COLORS[key].name}</div></button>; })}</div><button className="confirm-btn" disabled={!selectedColor} onClick={confirmPick}>Confirm Selection ›</button></div>}
    {screen === 'game' && <div id="gameScreen"><div className="scoreboard"><div className={`score-panel student${currentTurn === 'student' ? ' active-turn' : ''}`}><div className="role">Student</div><div className="player-name">{COLORS[picks.student].name} Archer</div><div className="pts-value">{scores.student}</div><div className="pts-label">points</div><div className="progress-track"><div className="progress-fill-s" style={{ width: `${Math.min(100, scores.student / WIN_TARGET * 100)}%` }} /></div></div><div className="score-divider">⚔</div><div className={`score-panel teacher${currentTurn === 'teacher' ? ' active-turn' : ''}`}><div className="role">Teacher</div><div className="player-name">{COLORS[picks.teacher].name} Archer</div><div className="pts-value">{scores.teacher}</div><div className="pts-label">points</div><div className="progress-track"><div className="progress-fill-t" style={{ width: `${Math.min(100, scores.teacher / WIN_TARGET * 100)}%` }} /></div></div></div><div className="arena-wrap" ref={arenaRef}><ArenaScene /><TargetSvg shakeKey={shakeKey} targetRef={targetRef} />{currentTurn === 'student' ? <ArcherSvg colorKey={picks.student} facing="right" width="95" height="145" viewBox="0 0 72 110" className="ad-active-archer ad-student" /> : <ArcherSvg colorKey={picks.teacher} facing="right" width="95" height="145" viewBox="0 0 72 110" className="ad-active-archer ad-teacher" />}<canvas ref={canvasRef} className="ad-canvas" /></div>{floatingPoints && <div key={floatingPoints.id} className={`floating-points ${floatingPoints.value >= 0 ? 'positive' : 'negative'}`} onAnimationEnd={() => setFloatingPoints(null)}>{floatingPoints.value > 0 ? '+' : ''}{floatingPoints.value}</div>}<div className="turn-banner"><div className="turn-name">{COLORS[picks[currentTurn]].name} Archer ({currentTurn === 'student' ? 'Student' : 'Teacher'})'s turn</div><div className="turn-instruction">Pick a numbered tile — what's hidden inside?</div></div><div className="tiles-section"><div className="tiles-label">— SELECT A TILE —</div><div className="tiles-row">{currentShots.map((shot, index) => { const isRevealed = revealedIdx === index; const isChosen = chosenIdx === index; return <button key={`${shot.label}-${index}`} className={`tile tile-${index + 1}${isRevealed ? ' revealed' : ''}${isChosen ? ' chosen' : ''}${busy && !isChosen ? ' disabled' : ''}`} disabled={busy} onClick={() => chooseTile(index)}><div className="tile-face"><div className="tile-num">{index + 1}</div><div className="tile-q">TAP TO REVEAL</div></div><div className="tile-back"><div className="rev-icon">{shot.icon}</div><div className="rev-label">{shot.label}</div><div className={`rev-pts ${shot.pts > 0 ? 'pos' : shot.pts < 0 ? 'neg' : 'zero'}`}>{shot.pts > 0 ? '+' : ''}{shot.pts} pts</div></div></button>; })}</div></div><div id="resultBox" className={resultCls}>{resultText}</div></div>}
    {screen === 'win' && <div id="winScreen"><div className="win-crown">🏆</div><div className="win-title">{winnerName} Wins!</div><div className="win-sub">First to reach {WIN_TARGET} points — magnificent!</div><div className="final-scores"><div className="final-card"><div className="fc-role">STUDENT</div><div className="fc-name">{COLORS[picks.student].name} Archer</div><div className="fc-pts">{scores.student}</div></div><div className="final-card"><div className="fc-role">TEACHER</div><div className="fc-name">{COLORS[picks.teacher].name} Archer</div><div className="fc-pts">{scores.teacher}</div></div></div><button className="play-again-btn" onClick={restartGame}>Play Again ›</button></div>}
  </div>;
}
