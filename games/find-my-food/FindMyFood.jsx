import { useState, useCallback, useRef, useEffect } from "react";
import { useGame } from "@/lib/gameState";

const PAIRS = [
  { animal:"🐕", animalWord:"DOG",    food:"🦴", foodWord:"BONE" },
  { animal:"🐴", animalWord:"HORSE",  food:"🍎", foodWord:"APPLE" },
  { animal:"🐱", animalWord:"CAT",    food:"🐟", foodWord:"FISH" },
  { animal:"🐭", animalWord:"MOUSE",  food:"🧀", foodWord:"CHEESE" },
  { animal:"🐦", animalWord:"BIRD",   food:"🪱", foodWord:"WORM" },
  { animal:"🦁", animalWord:"LION",   food:"🍗", foodWord:"DRUMSTICK" },
  { animal:"🐰", animalWord:"RABBIT", food:"🥕", foodWord:"CARROT" },
  { animal:"🐵", animalWord:"MONKEY", food:"🍌", foodWord:"BANANA" },
];

const THEMES = [
  { name:"Gold",     key:"gold",     front:"linear-gradient(135deg,#c4a45a,#e8c97a)", border:"rgba(232,201,122,0.4)", emoji:"✨" },
  { name:"Emerald",  key:"emerald",  front:"linear-gradient(135deg,#2ecc71,#1abc9c)", border:"rgba(46,204,113,0.4)",  emoji:"🌿" },
  { name:"Sapphire", key:"sapphire", front:"linear-gradient(135deg,#3498db,#2980b9)", border:"rgba(52,152,219,0.4)",  emoji:"💎" },
  { name:"Rose",     key:"rose",     front:"linear-gradient(135deg,#e91e63,#c2185b)", border:"rgba(233,30,99,0.4)",   emoji:"🌹" },
  { name:"Violet",   key:"violet",   front:"linear-gradient(135deg,#9b59b6,#8e44ad)", border:"rgba(155,89,182,0.4)",  emoji:"💜" },
];

const AVATARS = ["🐶","🐼","🦊","🐯","🐸","🐧","🦁","🐨"];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

/* ─────────────────────────────────────────────────────────────────
   Global styles — ported from the premium edition's design system.
   Everything is scoped under .ff-root / [data-ff-theme] so it can't
   leak into (or be leaked into by) the host page.
   ───────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

.ff-root {
  --bg: #0d0d0f;
  --surface: #141416;
  --surface2: #1c1c20;
  --surface3: #252529;
  --border: rgba(255,255,255,0.07);
  --border-bright: rgba(255,255,255,0.15);
  --text: #f0ede8;
  --text-muted: rgba(240,237,232,0.45);
  --text-dim: rgba(240,237,232,0.25);
  --accent: #e8c97a;
  --accent2: #d4b86a;
  --accent-glow: rgba(232,201,122,0.18);
  --accent-glow2: rgba(232,201,122,0.08);
  --green: #6fcf97;
  --green-glow: rgba(111,207,151,0.2);
  --red: #eb5757;
  --tile-front: linear-gradient(135deg,#c4a45a,#e8c97a);
  --tile-front-border: rgba(232,201,122,0.4);
  --radius-sm: 10px;
  --radius-md: 18px;
  --radius-lg: 28px;
  --shadow: 0 24px 64px rgba(0,0,0,0.5);
  --shadow-sm: 0 8px 24px rgba(0,0,0,0.35);

  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  overflow-x: hidden;
  user-select: none;
  box-sizing: border-box;
  transition: background 0.3s, color 0.3s;
}
.ff-root *, .ff-root *::before, .ff-root *::after { box-sizing: border-box; }

.ff-root[data-ff-theme="light"] {
  --bg: #f4f1eb;
  --surface: #ffffff;
  --surface2: #f0ede6;
  --surface3: #e4e0d8;
  --border: rgba(0,0,0,0.08);
  --border-bright: rgba(0,0,0,0.16);
  --text: #1a1814;
  --text-muted: rgba(26,24,20,0.5);
  --text-dim: rgba(26,24,20,0.3);
  --accent: #b8962a;
  --accent2: #a07d1a;
  --accent-glow: rgba(184,150,42,0.15);
  --accent-glow2: rgba(184,150,42,0.08);
  --green: #1a7a45;
  --green-glow: rgba(26,122,69,0.15);
  --red: #c0392b;
  --shadow: 0 24px 64px rgba(0,0,0,0.12);
  --shadow-sm: 0 8px 24px rgba(0,0,0,0.08);
}

.ff-noise {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none; opacity: 0.6; z-index: 1;
}

.ff-ambient { position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
.ff-ambient-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(232,201,122,0.06) 0%, transparent 70%); top: -200px; right: -200px; animation: ffDrift1 20s ease-in-out infinite; }
.ff-ambient-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(111,207,151,0.04) 0%, transparent 70%); bottom: -200px; left: -100px; animation: ffDrift2 25s ease-in-out infinite; }
[data-ff-theme="light"] .ff-ambient-1 { background: radial-gradient(circle, rgba(184,150,42,0.08) 0%, transparent 70%); }
[data-ff-theme="light"] .ff-ambient-2 { background: radial-gradient(circle, rgba(26,122,69,0.05) 0%, transparent 70%); }
[data-ff-theme="light"] .ff-noise { opacity: 0.25; }
@keyframes ffDrift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,30px)} }
@keyframes ffDrift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }

.ff-theme-toggle {
  position: absolute; top: 16px; right: 16px; z-index: 20;
  width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid var(--border-bright); background: var(--surface); color: var(--text);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; box-shadow: var(--shadow-sm);
  transition: background 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.2s;
}
.ff-theme-toggle:hover { transform: scale(1.1); border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
.ff-theme-toggle:active { transform: scale(0.95); }

.ff-screen { width: 100%; max-width: 560px; position: relative; z-index: 10; animation: ffScreenIn 0.5s cubic-bezier(0.23,1,0.32,1) both; }
@keyframes ffScreenIn { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }

.ff-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 36px 32px; box-shadow: var(--shadow); position: relative; overflow: hidden;
  transition: background 0.3s, border-color 0.3s;
}
.ff-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); }

.ff-logo-badge {
  display: inline-flex; align-items: center; gap: 8px; background: var(--surface2);
  border: 1px solid var(--border-bright); border-radius: 100px; padding: 8px 18px;
  margin-bottom: 22px; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--accent);
}

.ff-hero-title {
  font-family: 'Playfair Display', serif; font-size: 3.2rem; font-weight: 900; line-height: 1.05;
  background: linear-gradient(135deg, var(--text) 30%, var(--accent) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  margin-bottom: 10px;
}
.ff-hero-sub { color: var(--text-muted); font-size: 1rem; margin-bottom: 28px; line-height: 1.5; }

.ff-pair-preview { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:28px; }
.ff-pair-chip { background: var(--surface2); border: 1px solid var(--border); border-radius: 100px; padding: 6px 14px; font-size: 1.1rem; display:flex; align-items:center; gap:4px; animation: ffChipFloat 3s ease-in-out infinite; }
.ff-pair-chip:nth-child(2) { animation-delay: .4s; } .ff-pair-chip:nth-child(3) { animation-delay: .8s; } .ff-pair-chip:nth-child(4) { animation-delay: 1.2s; } .ff-pair-chip:nth-child(5) { animation-delay: 1.6s; }
@keyframes ffChipFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
.ff-connector { color: var(--text-dim); font-size: 0.7rem; }

.ff-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:14px 32px; font-family:'DM Sans',sans-serif; font-size:0.95rem; font-weight:600; border:none; border-radius:100px; cursor:pointer; transition: all 0.22s cubic-bezier(0.23,1,0.32,1); letter-spacing:0.01em; position:relative; overflow:hidden; }
.ff-btn:active { transform: scale(0.97); }
.ff-btn-gold { background: linear-gradient(135deg, var(--accent) 0%, #c4a45a 100%); color:#1a1400; box-shadow: 0 4px 24px rgba(232,201,122,0.35), 0 1px 0 rgba(255,255,255,0.2) inset; }
.ff-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(232,201,122,0.45); }
.ff-btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border-bright); }
.ff-btn-outline:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-1px); }
.ff-btn-ghost { background: var(--surface2); color: var(--text-muted); border: 1px solid var(--border); font-size:0.85rem; padding:10px 20px; }
.ff-btn-ghost:hover { color: var(--text); border-color: var(--border-bright); }
.ff-btn-green { background: linear-gradient(135deg, #6fcf97 0%, #43b070 100%); color:#0a1f12; box-shadow: 0 4px 24px var(--green-glow); }
.ff-btn-green:hover { transform: translateY(-2px); box-shadow: 0 8px 32px var(--green-glow); }
.ff-btn-row { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:8px; }

.ff-divider { height:1px; background: var(--border); margin: 24px 0; }
.ff-section-label { font-size:0.72rem; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color: var(--text-dim); margin-bottom:14px; }

.ff-theme-grid { display:grid; grid-template-columns: repeat(5,1fr); gap:10px; margin-bottom:28px; }
.ff-theme-swatch { aspect-ratio:1; border-radius: var(--radius-sm); cursor:pointer; border:2px solid transparent; transition: all 0.2s; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.ff-theme-swatch::after { content:'✓'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:white; opacity:0; transition: opacity 0.2s; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
.ff-theme-swatch.selected { border-color:#fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.25); }
.ff-theme-swatch.selected::after { opacity:1; }
.ff-theme-swatch:hover { transform: scale(1.08); }

.ff-player-setup { display:flex; flex-direction:column; gap:20px; }
.ff-input-group { display:flex; flex-direction:column; gap:8px; text-align:left; }
.ff-input-group label { font-size:0.78rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color: var(--text-muted); }
.ff-fancy-input { width:100%; padding:14px 18px; background: var(--surface2); border:1px solid var(--border-bright); border-radius: var(--radius-sm); color: var(--text); font-family:'DM Sans',sans-serif; font-size:1rem; outline:none; transition: border-color 0.2s, box-shadow 0.2s; }
.ff-fancy-input::placeholder { color: var(--text-dim); }
.ff-fancy-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow2); }

.ff-avatar-row { display:flex; gap:8px; flex-wrap:wrap; }
.ff-avatar-btn { width:48px; height:48px; border-radius:50%; background: var(--surface2); border:2px solid var(--border); font-size:1.5rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition: all 0.2s; padding:0; line-height:1; font-family:inherit; }
.ff-avatar-btn:hover { border-color: var(--border-bright); transform: scale(1.1); }
.ff-avatar-btn.selected { border-color: var(--accent); background: var(--accent-glow); box-shadow: 0 0 0 3px var(--accent-glow2); }

.ff-scoreboard { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
.ff-score-card { background: var(--surface2); border:1px solid var(--border); border-radius: var(--radius-md); padding:14px 16px; transition: all 0.3s cubic-bezier(0.23,1,0.32,1); position:relative; overflow:hidden; }
.ff-score-card::before { content:''; position:absolute; inset:0; background: linear-gradient(135deg, var(--accent-glow), transparent); opacity:0; transition: opacity 0.3s; }
.ff-score-card.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 8px 32px var(--accent-glow); }
.ff-score-card.active::before { opacity:1; }
.ff-sc-top { display:flex; align-items:center; gap:8px; margin-bottom:8px; position:relative; z-index:1; }
.ff-sc-avatar { font-size:1.4rem; }
.ff-sc-name { font-weight:600; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ff-sc-score { font-family:'DM Mono',monospace; font-size:2rem; font-weight:500; color: var(--accent); line-height:1; position:relative; z-index:1; }
.ff-sc-label { font-size:0.72rem; letter-spacing:0.08em; color: var(--text-dim); text-transform:uppercase; position:relative; z-index:1; }

.ff-turn-bar { display:flex; align-items:center; gap:10px; background: var(--surface2); border:1px solid var(--border); border-radius:100px; padding:10px 18px; margin-bottom:14px; font-size:0.9rem; font-weight:500; justify-content:center; }
.ff-turn-dot { width:8px; height:8px; border-radius:50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); animation: ffPulseDot 1.5s ease-in-out infinite; }
@keyframes ffPulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.7); } }

.ff-progress-row { display:flex; align-items:center; gap:10px; margin-bottom:14px; font-size:0.78rem; color: var(--text-dim); font-weight:500; font-family:'DM Mono',monospace; }
.ff-progress-track { flex:1; height:4px; background: var(--surface3); border-radius:100px; overflow:hidden; }
.ff-progress-fill { height:100%; background: linear-gradient(90deg, var(--accent2), var(--accent)); border-radius:100px; transition: width 0.6s cubic-bezier(0.23,1,0.32,1); }

.ff-match-popup { text-align:center; font-weight:600; font-size:0.95rem; min-height:28px; margin-bottom:12px; color: var(--green); letter-spacing:0.01em; transition: all 0.3s; }
.ff-match-popup.mismatch { color: var(--red); }

.ff-grid { display:grid; gap:10px; width:100%; margin:0 auto; grid-template-columns: repeat(4, 1fr); }

.ff-tile { width:100%; aspect-ratio:1; cursor:pointer; position:relative; transform-style:preserve-3d; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.ff-tile:not(.flipped):not(.matched):hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.35); }
.ff-tile-inner { position:absolute; inset:0; border-radius:14px; transform-style:preserve-3d; transition: transform 0.5s cubic-bezier(0.23,1,0.32,1); }
.ff-tile.flipped .ff-tile-inner { transform: rotateY(180deg); }
.ff-tile-front, .ff-tile-back { position:absolute; inset:0; border-radius:14px; display:flex; align-items:center; justify-content:center; backface-visibility:hidden; -webkit-backface-visibility:hidden; }
.ff-tile-front { background: var(--tile-front); border:1px solid var(--tile-front-border); color:#fff; font-family:'DM Mono',monospace; font-size:1.3rem; font-weight:700; text-shadow: 0 2px 6px rgba(0,0,0,0.35); box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 18px rgba(0,0,0,0.25); overflow:hidden; }
.ff-tile-front::before { content:''; position:absolute; inset:0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 60%); pointer-events:none; }
.ff-tile:not(.flipped):not(.matched):hover .ff-tile-front { box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.5); }
.ff-tile-back { background: var(--surface2); border:1px solid var(--border-bright); transform: rotateY(180deg); flex-direction:column; gap:4px; padding:6px; }
.ff-tile-back .ff-emoji { font-size:2rem; }
.ff-tile-back .ff-word { font-family:'DM Mono',monospace; font-size:0.6rem; font-weight:500; letter-spacing:0.08em; text-transform:uppercase; color: var(--text-muted); }
.ff-tile.matched .ff-tile-back { background: var(--surface3); border-color: var(--green); box-shadow: 0 0 0 1px var(--green), 0 4px 20px var(--green-glow); }
.ff-tile.matched .ff-tile-back .ff-word { color: var(--green); }
.ff-tile.matched { animation: ffMatchPop 0.45s cubic-bezier(0.23,1,0.32,1); }
@keyframes ffMatchPop { 0% {transform:scale(1);} 50% {transform:scale(1.1);} 100% {transform:scale(1);} }
.ff-tile.wrong-shake .ff-tile-inner { animation: ffShake 0.5s ease both; }
@keyframes ffShake { 0%,100% {transform:translateX(0) rotateY(180deg);} 20% {transform:translateX(-6px) rotateY(180deg);} 40% {transform:translateX(6px) rotateY(180deg);} 60% {transform:translateX(-4px) rotateY(180deg);} 80% {transform:translateX(4px) rotateY(180deg);} }
.ff-tile.locked, .ff-tile.matched { pointer-events:none; }

.ff-winner-display { text-align:center; padding:20px 0; }
.ff-winner-crown { font-size:3rem; margin-bottom:10px; display:block; }
.ff-winner-name { font-family:'Playfair Display',serif; font-size:2.1rem; font-weight:700; background: linear-gradient(135deg, var(--text) 30%, var(--accent) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.ff-winner-sub { color: var(--text-muted); margin-top:6px; }
.ff-final-scores { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:20px 0; }
.ff-final-score-item { background: var(--surface2); border:1px solid var(--border); border-radius: var(--radius-md); padding:14px; text-align:center; }
.ff-final-score-item.winner-item { border-color: var(--accent); background: var(--accent-glow2); }
.ff-fsi-avatar { font-size:1.8rem; }
.ff-fsi-name { font-size:0.85rem; font-weight:600; margin:4px 0; }
.ff-fsi-score { font-family:'DM Mono',monospace; font-size:1.8rem; color: var(--accent); font-weight:500; }

@media (max-width:400px) {
  .ff-card { padding:24px 18px; }
  .ff-hero-title { font-size:2.4rem; }
  .ff-tile-back .ff-emoji { font-size:1.5rem; }
  .ff-tile-back .ff-word { font-size:0.52rem; }
}
`;

export default function FindMyFood({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("welcome");
  const [theme, setTheme] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [p1, setP1] = useState({ name:"Player 1", avatar:"🐶" });
  const [p2, setP2] = useState({ name:"Player 2", avatar:"🐼" });
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [wrongPair, setWrongPair] = useState([]);
  const [locked, setLocked] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ 1:0, 2:0 });
  const [moveCount, setMoveCount] = useState(0);
  const [pairCount, setPairCount] = useState(4);
  const [popup, setPopup] = useState({ msg:"", mismatch:false });
  const popupTimeout = useRef(null);

  useEffect(() => () => clearTimeout(popupTimeout.current), []);

  const showPopup = (msg, mismatch) => {
    clearTimeout(popupTimeout.current);
    setPopup({ msg, mismatch });
    popupTimeout.current = setTimeout(() => setPopup({ msg:"", mismatch:false }), 2200);
  };

  const startGame = useCallback((numPairs) => {
    const chosen = shuffle(PAIRS).slice(0, numPairs);
    const deck = shuffle([
      ...chosen.map((p, i) => ({ id: i*2, pairId:i, emoji:p.animal, label:p.animalWord })),
      ...chosen.map((p, i) => ({ id: i*2+1, pairId:i, emoji:p.food,  label:p.foodWord })),
    ]);
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setWrongPair([]);
    setLocked(false);
    setCurrentPlayer(1);
    setScores({ 1:0, 2:0 });
    setMoveCount(0);
    setPopup({ msg:"", mismatch:false });
    setScreen("game");
  }, []);

  const flip = (idx) => {
    const card = cards[idx];
    if (locked || flipped.includes(idx) || matched.has(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      setLocked(true);
      const nextMoves = moveCount + 1;
      setMoveCount(nextMoves);
      const [a, b] = next.map(i => cards[i]);
      if (a.pairId === b.pairId) {
        const newMatched = new Set([...matched, next[0], next[1]]);
        setMatched(newMatched);
        const nextScore = scores[currentPlayer] + 10;
        setScores(s => ({ ...s, [currentPlayer]: nextScore }));
        showPopup(`Matched! +10 for ${currentPlayer===1?p1.name:p2.name}`, false);
        setFlipped([]);
        setLocked(false);
        if (newMatched.size === cards.length) {
          const finalScores = { ...scores, [currentPlayer]: nextScore };
          const accuracy = finalScores[1] > finalScores[2] ? 100 : finalScores[1] === finalScores[2] ? 50 : 0;
          completeGame('find-my-food', accuracy, nextMoves);
            onComplete?.(accuracy, nextMoves);
          setScreen("end");
        }
      } else {
        showPopup("No match — turn switches!", true);
        setWrongPair(next);
        setTimeout(() => {
          setFlipped([]);
          setWrongPair([]);
          setLocked(false);
          setCurrentPlayer(p => p === 1 ? 2 : 1);
        }, 900);
      }
    }
  };

  const t = THEMES[theme];
  const cssVarOverrides = { "--tile-front": t.front, "--tile-front-border": t.border };

  if (screen === "welcome") return (
    <div className="ff-root" data-ff-theme={isDark ? "dark" : "light"} style={cssVarOverrides}>
      <style>{STYLES}</style>
      <div className="ff-noise" />
      <div className="ff-ambient ff-ambient-1" />
      <div className="ff-ambient ff-ambient-2" />
      <button className="ff-theme-toggle" onClick={() => setIsDark(d => !d)} aria-label="Toggle light/dark mode">
        {isDark ? "🌙" : "☀️"}
      </button>

      <div className="ff-screen">
        <div className="ff-card" style={{ textAlign:"center" }}>
          <div className="ff-logo-badge">🌿 Two-Player Edition</div>
          <h1 className="ff-hero-title">Find My<br/>Food</h1>
          <p className="ff-hero-sub">Match each animal with the food it loves.<br/>Compete with a friend to see who knows best.</p>

          <div className="ff-pair-preview">
            <div className="ff-pair-chip">🐕<span className="ff-connector">×</span>🦴</div>
            <div className="ff-pair-chip">🐱<span className="ff-connector">×</span>🐟</div>
            <div className="ff-pair-chip">🐰<span className="ff-connector">×</span>🥕</div>
            <div className="ff-pair-chip">🐵<span className="ff-connector">×</span>🍌</div>
          </div>

          <div className="ff-section-label">Select a theme</div>
          <div className="ff-theme-grid">
            {THEMES.map((th, i) => (
              <div key={th.key} onClick={() => setTheme(i)}
                className={`ff-theme-swatch${theme===i?" selected":""}`}
                style={{ background: th.front }} title={th.name}>
                <span style={{ fontSize:"1.3rem", position:"relative", zIndex:1 }}>{th.emoji}</span>
              </div>
            ))}
          </div>

          <div className="ff-divider" />

          <div className="ff-player-setup" style={{ flexDirection:"row", flexWrap:"wrap", gap:16, justifyContent:"center", marginBottom:8 }}>
            {[p1, p2].map((p, pi) => (
              <div key={pi} style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"var(--radius-md)", padding:"16px 18px", minWidth:190, textAlign:"left" }}>
                <div className="ff-input-group" style={{ marginBottom:12 }}>
                  <label>Player {pi+1}</label>
                  <input className="ff-fancy-input" placeholder="Enter name…" value={p.name}
                    onChange={e => pi===0?setP1(x=>({...x,name:e.target.value})):setP2(x=>({...x,name:e.target.value}))} />
                </div>
                <div className="ff-avatar-row">
                  {AVATARS.map(av => (
                    <button key={av} type="button" onClick={() => pi===0?setP1(x=>({...x,avatar:av})):setP2(x=>({...x,avatar:av}))}
                      className={`ff-avatar-btn${p.avatar===av?" selected":""}`}>
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="ff-divider" />
          <div className="ff-section-label">Choose pairs</div>
          <div className="ff-btn-row">
            {[4,6,8].map(n => (
              <button key={n} className="ff-btn ff-btn-gold" onClick={() => { setPairCount(n); startGame(n); }}>
                {n} Pairs →
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === "end") {
    const winner = scores[1] > scores[2] ? p1 : scores[2] > scores[1] ? p2 : null;
    return (
      <div className="ff-root" data-ff-theme={isDark ? "dark" : "light"} style={cssVarOverrides}>
        <style>{STYLES}</style>
        <div className="ff-noise" />
        <div className="ff-ambient ff-ambient-1" />
        <div className="ff-ambient ff-ambient-2" />
        <button className="ff-theme-toggle" onClick={() => setIsDark(d => !d)} aria-label="Toggle light/dark mode">
          {isDark ? "🌙" : "☀️"}
        </button>

        <div className="ff-screen">
          <div className="ff-card">
            <div className="ff-winner-display">
              <span className="ff-winner-crown">{winner ? "🏆" : "🤝"}</span>
              <div className="ff-winner-name">{winner ? `${winner.name} wins!` : "It's a Tie!"}</div>
              {winner && <div className="ff-winner-sub">{winner.avatar} · {Math.max(scores[1], scores[2])} points</div>}
            </div>

            <div className="ff-final-scores">
              <div className={`ff-final-score-item${scores[1]>scores[2]?" winner-item":""}`}>
                <div className="ff-fsi-avatar">{p1.avatar}</div>
                <div className="ff-fsi-name">{p1.name}</div>
                <div className="ff-fsi-score">{scores[1]}</div>
              </div>
              <div className={`ff-final-score-item${scores[2]>scores[1]?" winner-item":""}`}>
                <div className="ff-fsi-avatar">{p2.avatar}</div>
                <div className="ff-fsi-name">{p2.name}</div>
                <div className="ff-fsi-score">{scores[2]}</div>
              </div>
            </div>

            <div className="ff-btn-row">
              <button className="ff-btn ff-btn-gold" onClick={() => startGame(pairCount)}>↺ Play Again</button>
              <button className="ff-btn ff-btn-outline" onClick={() => setScreen("welcome")}>🏠 Menu</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPairs = cards.length / 2;
  const matchedPairs = matched.size / 2;

  return (
    <div className="ff-root" data-ff-theme={isDark ? "dark" : "light"} style={cssVarOverrides}>
      <style>{STYLES}</style>
      <div className="ff-noise" />
      <div className="ff-ambient ff-ambient-1" />
      <div className="ff-ambient ff-ambient-2" />
      <button className="ff-theme-toggle" onClick={() => setIsDark(d => !d)} aria-label="Toggle light/dark mode">
        {isDark ? "🌙" : "☀️"}
      </button>

      <div className="ff-screen">
        <div className="ff-card">
          <div className="ff-scoreboard">
            <div className={`ff-score-card${currentPlayer===1?" active":""}`}>
              <div className="ff-sc-top">
                <span className="ff-sc-avatar">{p1.avatar}</span>
                <span className="ff-sc-name">{p1.name}</span>
              </div>
              <div className="ff-sc-score">{scores[1]}</div>
              <div className="ff-sc-label">points</div>
            </div>
            <div className={`ff-score-card${currentPlayer===2?" active":""}`}>
              <div className="ff-sc-top">
                <span className="ff-sc-avatar">{p2.avatar}</span>
                <span className="ff-sc-name">{p2.name}</span>
              </div>
              <div className="ff-sc-score">{scores[2]}</div>
              <div className="ff-sc-label">points</div>
            </div>
          </div>

          <div className="ff-turn-bar">
            <div className="ff-turn-dot" />
            <span>{currentPlayer===1?p1.avatar:p2.avatar} {currentPlayer===1?p1.name:p2.name}'s turn</span>
          </div>

          <div className="ff-progress-row">
            <span>{matchedPairs} / {totalPairs} pairs</span>
            <div className="ff-progress-track">
              <div className="ff-progress-fill" style={{ width: `${(matchedPairs/totalPairs)*100}%` }} />
            </div>
          </div>

          <div className={`ff-match-popup${popup.mismatch?" mismatch":""}`}>{popup.msg}</div>

          <div className="ff-grid">
            {cards.map((card, idx) => {
              const isFlipped = flipped.includes(idx) || matched.has(idx);
              const isMatched = matched.has(idx);
              const isWrong = wrongPair.includes(idx);
              return (
                <div key={idx} onClick={() => flip(idx)}
                  className={`ff-tile${isFlipped?" flipped":""}${isMatched?" matched":""}${locked&&!isMatched?" locked":""}${isWrong?" wrong-shake":""}`}>
                  <div className="ff-tile-inner">
                    <div className="ff-tile-front">?</div>
                    <div className="ff-tile-back">
                      <div className="ff-emoji">{card.emoji}</div>
                      <div className="ff-word">{card.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign:"center", marginTop:16 }}>
            <button className="ff-btn ff-btn-ghost" onClick={() => startGame(pairCount)}>↺ New Game</button>
          </div>
        </div>
      </div>
    </div>
  );
}