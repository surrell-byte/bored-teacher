import { useState, useRef, useEffect, useReducer } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
.cc{--bg-deep:#000000;--bg-panel:rgba(0,0,0,.78);--border:rgba(255,255,255,.28);--border-hi:#FFFFFF;--accent1:#FFFF00;--accent2:#FF7F00;--accent3:#FF00FF;--text:#FFFFFF;--muted:#FFFFFF;--radius-lg:28px;--radius-sm:14px;--a1-rgb:255,255,0;--a2-rgb:255,127,0;--a3-rgb:255,0,255;
font-family:'DM Sans',sans-serif;background:var(--bg-deep);color:var(--text);height:100%;min-height:0;overflow-x:hidden;position:relative}
.cc[data-theme="red"]{--accent1:#FF0000;--a1-rgb:255,0,0}
.cc[data-theme="orange"]{--accent1:#FF7F00;--a1-rgb:255,127,0}
.cc[data-theme="yellow"]{--accent1:#FFFF00;--a1-rgb:255,255,0}
.cc[data-theme="green"]{--accent1:#00C853;--a1-rgb:0,200,83}
.cc[data-theme="cyan"]{--accent1:#00FFFF;--a1-rgb:0,255,255}
.cc[data-theme="blue"]{--accent1:#0000FF;--a1-rgb:0,0,255}
.cc[data-theme="purple"]{--accent1:#8000FF;--a1-rgb:128,0,255}
.cc[data-theme="magenta"]{--accent1:#FF00FF;--a1-rgb:255,0,255}
.cc[data-theme="hot-pink"]{--accent1:#FF69B4;--a1-rgb:255,105,180}
.cc[data-theme="brown"]{--accent1:#8B4513;--a1-rgb:139,69,19}
.cc[data-theme="white"]{--accent1:#FFFFFF;--a1-rgb:255,255,255}
.cc[data-theme="black"]{--accent1:#FFFFFF;--a1-rgb:255,255,255}
.cc *,.cc *::before,.cc *::after{margin:0;padding:0;box-sizing:border-box}
.cc::before,.cc::after{display:none}
.cc .screen{display:flex;height:100%;min-height:100%;padding:24px 20px;justify-content:center;align-items:center;flex-direction:column;text-align:center;position:relative;z-index:1;animation:ccFadeUp .5s cubic-bezier(.22,1,.36,1)}
.cc[data-screen="welcome"] .screen{width:100%;height:100%;padding:0;background:url('/assets/games/colour-clash-2/colour-clash-2-welcome-bg.webp') center/cover no-repeat}
.cc[data-screen="setup"] .screen{background:url('/assets/games/colour-clash-2/colour-clash-2-user-input-bg.webp') center/cover no-repeat}
.cc[data-screen="how"] .screen{background:url('/assets/games/colour-clash-2/colour-clash-2-main-menu-bg.webp') center/cover no-repeat}
.cc[data-screen="game"],.cc[data-screen="winner"]{background:#000000 url('/assets/games/colour-clash-2/colour-clash-2-game-screen-bg.webp') center/cover no-repeat}
.cc .welcome-start-hitbox{position:absolute;left:37%;top:78%;width:26%;height:16%;margin:0;padding:0;border:0;border-radius:999px;background:transparent;cursor:pointer}
.cc .welcome-start-hitbox:focus-visible{outline:4px solid #fff;outline-offset:5px}
.cc .game-screen{height:100%;min-height:0;box-sizing:border-box;overflow-y:auto;padding:12px clamp(12px,3vw,40px)}
.cc .game-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,300px);align-items:center;gap:clamp(16px,3vw,40px);width:min(1280px,100%);height:100%;text-align:left}
.cc .board-panel{min-width:0}
.cc .player-panel{display:flex;flex-direction:column;gap:16px}
@keyframes ccFadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.cc .logo{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(3rem,9vw,5.5rem);letter-spacing:-.03em;line-height:1;margin-bottom:14px;background:linear-gradient(135deg,var(--accent1) 0%,var(--accent2) 50%,var(--accent3) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 30px rgba(var(--a1-rgb),.3));transition:filter .5s}
.cc h2{font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(1.3rem,4vw,2rem);margin-bottom:20px;color:var(--text);letter-spacing:-.01em}
.cc h3{font-family:'Syne',sans-serif;font-weight:700;font-size:1.05rem;margin-bottom:12px;color:var(--accent1);letter-spacing:.05em;text-transform:uppercase}
.cc p{color:#FFFFFF;line-height:1.65}
.cc .btn{display:inline-flex;align-items:center;gap:8px;padding:14px 36px;border:none;border-radius:50px;font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.04em;cursor:pointer;margin-top:20px;transition:all .25s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent}
.cc .btn-primary{background:var(--accent1);color:#000000;box-shadow:0 4px 24px rgba(var(--a1-rgb),.35)}
.cc .btn-primary:hover{transform:translateY(-3px);box-shadow:0 8px 36px rgba(var(--a1-rgb),.5)}
.cc .btn-primary:active{transform:scale(.96)}
.cc .btn-primary::after{content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:rgba(255,255,255,.3);transform:skewX(-20deg);transition:left .5s ease}
.cc .btn-primary:hover::after{left:130%}
.cc .btn-ghost{background:var(--bg-panel);color:var(--text);border:1px solid var(--border);backdrop-filter:blur(12px);box-shadow:0 4px 20px rgba(0,0,0,.3)}
.cc .btn-ghost:hover{border-color:var(--border-hi);transform:translateY(-2px)}
.cc input,.cc select{padding:12px 18px;border:1px solid var(--border);border-radius:var(--radius-sm);margin:6px 0;width:min(260px,82vw);font-family:'DM Sans',sans-serif;font-size:.95rem;background:var(--bg-panel);color:var(--text);transition:all .25s;outline:none;backdrop-filter:blur(8px);display:block}
.cc input:focus,.cc select:focus{border-color:var(--accent1);box-shadow:0 0 0 3px rgba(var(--a1-rgb),.12)}
.cc input::placeholder{color:var(--muted)}
.cc select option{background:#000000;color:var(--text)}
.cc .players{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;margin-top:8px}
.cc .player-card{background:var(--bg-panel);padding:26px 22px;border-radius:var(--radius-lg);backdrop-filter:blur(24px);border:1px solid var(--border);box-shadow:0 12px 40px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.06);transition:all .3s ease;width:min(320px,88vw);display:flex;flex-direction:column;align-items:center}
.cc .player-card:hover{border-color:var(--border-hi)}
.cc .avatars{display:flex;gap:8px;justify-content:center;margin:12px 0;flex-wrap:wrap}
.cc .avatar{font-size:2rem;cursor:pointer;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);transition:all .2s;border:2px solid transparent;user-select:none}
.cc .avatar:hover{background:rgba(255,255,255,.1);transform:scale(1.1)}
.cc .avatar.selected{border-color:var(--accent1);background:rgba(var(--a1-rgb),.12);box-shadow:0 0 20px rgba(var(--a1-rgb),.3)}
.cc .grid-wrapper{width:min(100%,860px,calc((100dvh - 170px) * 1.2 + 70px));margin:0 auto}
.cc .grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:clamp(7px,2vw,14px);margin-top:20px;width:100%}
.cc .tile{aspect-ratio:1;width:100%;background:#000000;border-radius:18px;display:flex;justify-content:center;align-items:center;cursor:pointer;color:var(--muted);border:1px solid rgba(255,255,255,.45);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 6px 18px rgba(0,0,0,.6);transition:transform .22s ease,border-color .22s,box-shadow .22s;user-select:none;-webkit-tap-highlight-color:transparent;position:relative;overflow:hidden}
.cc .tile::before{display:none}
.cc .tile-num{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(.85rem,2.6vw,1.3rem);color:#FFFFFF;letter-spacing:-.02em;line-height:1;transition:color .2s;position:relative;z-index:1}
.cc .tile:hover:not(.revealed):not(.peeking) .tile-num{color:var(--accent1)}
.cc .tile:hover:not(.revealed):not(.peeking){transform:translateY(-5px) scale(1.03);border-color:rgba(var(--a1-rgb),.3);box-shadow:0 12px 28px rgba(0,0,0,.5),0 0 20px rgba(var(--a1-rgb),.12)}
.cc .tile:active:not(.revealed):not(.peeking){transform:scale(.93)}
.cc .tile.revealed{background:#FFFFFF;border-color:#FFFFFF;cursor:default;animation:ccFlipReveal .48s cubic-bezier(.175,.885,.32,1.275)}
.cc .tile.peeking{background:#FFFFFF;border-color:rgba(var(--a1-rgb),.6);cursor:default;box-shadow:0 0 22px rgba(var(--a1-rgb),.35),0 6px 18px rgba(0,0,0,.4);animation:ccFlipReveal .48s cubic-bezier(.175,.885,.32,1.275)}
.cc .tile.peek-hide{animation:ccFlipHide .4s cubic-bezier(.4,0,.2,1) forwards}
@keyframes ccFlipHide{0%{transform:perspective(400px) rotateY(0) scale(1);opacity:1}40%{transform:perspective(400px) rotateY(80deg) scale(.85);opacity:.5}100%{transform:perspective(400px) rotateY(0) scale(1);opacity:1}}
@keyframes ccFlipReveal{0%{transform:perspective(400px) rotateY(0) scale(1)}35%{transform:perspective(400px) rotateY(80deg) scale(.85)}100%{transform:perspective(400px) rotateY(0) scale(1)}}
.cc .circle{width:clamp(26px,9vw,48px);height:clamp(26px,9vw,48px);border-radius:50%;box-shadow:inset 0 2px 8px rgba(255,255,255,.5),0 3px 12px rgba(0,0,0,.4)}
.cc .power-icon{font-size:clamp(1.5rem,5vw,2.2rem);animation:ccPowerBounce .55s ease}
@keyframes ccPowerBounce{0%{transform:scale(0);opacity:0}60%{transform:scale(1.35);opacity:1}100%{transform:scale(1);opacity:1}}
.cc .scoreboard{display:flex;flex-direction:column;gap:12px;background:#000000;padding:16px;border-radius:20px;border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.12);width:100%}
.cc .scoreboard>div{text-align:left;min-width:0}
.cc .player-score{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px 12px;padding:12px 14px;border:1px solid var(--border);border-radius:14px;background:rgba(255,255,255,.025)}
.cc .player-info{display:flex;align-items:center;gap:10px;min-width:0}
.cc .player-avatar{font-size:1.6rem;flex-shrink:0}
.cc .player-name{font-family:'Syne',sans-serif;display:block;overflow-wrap:anywhere}
.cc .player-score .player-name,.cc .player-score .remaining-indicator{color:inherit}
.cc .player-score .remaining-indicator{opacity:.88}
.cc .player-score .score-num{grid-column:2;grid-row:1;font-size:1.8rem}
.cc .player-score .score-num{color:inherit}
.cc .player-score .remaining-indicator{grid-column:1/-1}
.cc .score-num{font-family:'Syne',sans-serif;font-size:2.2rem;font-weight:800;color:var(--accent1);display:inline-block;transition:all .3s}
.cc .score-num.bump{animation:ccScoreBump .5s ease}
@keyframes ccScoreBump{0%,100%{transform:scale(1)}40%{transform:scale(1.5);color:var(--accent2)}}
.cc .remaining-indicator{font-size:.8rem;color:var(--muted);margin-top:3px}
.cc .remaining-indicator.urgent{color:var(--accent2);font-weight:600;animation:ccUrgent 1s ease infinite}
@keyframes ccUrgent{0%,100%{opacity:1}50%{opacity:.45}}
.cc .vs-divider{font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;color:var(--muted);letter-spacing:.05em}
.cc .turn{font-family:'Syne',sans-serif;font-size:clamp(1rem,2.8vw,1.35rem);font-weight:700;color:var(--accent1);padding:14px 18px;border-radius:18px;background:#000000;border:1px solid rgba(var(--a1-rgb),.62);box-shadow:0 8px 24px rgba(0,0,0,.4),0 0 22px rgba(var(--a1-rgb),.12);letter-spacing:.01em;animation:ccTurnFade .4s ease;text-align:center}
@keyframes ccTurnFade{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
.cc .extra-turn-banner{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:500;font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.6rem,5vw,2.8rem);color:var(--accent1);text-shadow:0 0 40px rgba(var(--a1-rgb),.8);background:rgba(0,0,0,.88);backdrop-filter:blur(20px);border:2px solid rgba(var(--a1-rgb),.4);border-radius:20px;padding:18px 36px;pointer-events:none;text-align:center;animation:ccBannerPop 1.4s cubic-bezier(.22,1,.36,1) forwards}
@keyframes ccBannerPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}80%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.9)}}
.cc .how-screen{gap:clamp(10px,2vh,20px);padding:clamp(12px,2vh,22px) clamp(16px,3vw,36px);overflow-y:auto}
.cc .how-screen h2{margin-bottom:0;padding:8px 18px;border-radius:14px;background:#000000;border:1px solid rgba(255,255,255,.45);box-shadow:0 8px 24px rgba(0,0,0,.5)}
.cc .how-content{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.85fr);align-items:stretch;gap:clamp(16px,3vw,36px);width:min(1080px,100%);min-height:0}
.cc .how-text{max-width:none;display:flex;flex-direction:column;justify-content:space-around;gap:clamp(10px,2vh,20px);font-size:clamp(1.15rem,1.8vw,1.5rem);line-height:1.5;background:#000000;padding:clamp(18px,2.5vw,34px);border-radius:20px;border:1px solid rgba(255,255,255,.45);box-shadow:0 16px 40px rgba(0,0,0,.7);text-align:left}
.cc .how-text p{color:#FFFFFF}
.cc .how-text strong{color:#FFFFFF}
.cc .power-legend{display:flex;flex-direction:column;justify-content:center;gap:clamp(10px,1.8vh,18px);margin:0;font-size:clamp(1rem,1.5vw,1.2rem)}
.cc .power-legend span{display:flex;align-items:center;min-height:56px;background:#000000;padding:12px 18px;border-radius:16px;border:1px solid rgba(255,255,255,.4);color:#FFFFFF;text-align:left}
.cc[data-screen="how"] .btn-primary{width:auto;min-width:0;max-width:100%;align-self:center;margin-top:0;padding:16px 32px;font-size:1.15rem}
.cc[data-screen="setup"] .btn-primary{width:min(664px,100%);justify-content:center}
.cc[data-screen="winner"] .btn{width:min(208px,100%);justify-content:center}
.cc .winner-badge{font-family:'Syne',sans-serif;font-size:clamp(2.2rem,7vw,4.5rem);font-weight:800;letter-spacing:-.02em;background:linear-gradient(135deg,var(--accent1),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:ccWinnerBounce .9s ease infinite;line-height:1.1;margin-bottom:10px}
@keyframes ccWinnerBounce{0%,100%{transform:translateY(0);filter:drop-shadow(0 0 20px rgba(var(--a1-rgb),.4))}30%{transform:translateY(-20px);filter:drop-shadow(0 0 40px rgba(var(--a1-rgb),.7))}50%{transform:translateY(0)}70%{transform:translateY(-10px)}}
.cc .final-score{font-size:1.1rem;color:#FFFFFF;margin-top:8px}
.cc .final-score strong{color:var(--accent1)}
.cc .confetti{position:fixed;top:-20px;z-index:9999;pointer-events:none;animation:ccFall linear forwards}
@keyframes ccFall{0%{transform:translateY(0) rotate(0) scale(1);opacity:1}70%{opacity:1}100%{transform:translateY(115vh) rotate(900deg) scale(.25);opacity:0}}
.cc .tag{display:inline-block;font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent3);border:1px solid rgba(var(--a3-rgb),.3);border-radius:50px;padding:4px 14px;margin-bottom:18px}
.cc .warn{color:var(--accent2);font-size:.9rem;margin-top:14px}
.cc .theme-picker{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 0 18px;color:#FFFFFF;font-size:.78rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.cc .theme-picker select{width:min(240px,70vw);margin:0;border-color:rgba(var(--a1-rgb),.7);color:var(--text)}
@media(max-width:760px){.cc .game-screen{height:100%;min-height:0;padding:12px 14px}.cc .game-layout{height:auto;grid-template-columns:minmax(0,1fr);gap:20px}.cc .board-panel{grid-row:1}.cc .player-panel{grid-row:2}.cc .scoreboard{display:grid;grid-template-columns:1fr;gap:8px;padding:10px}.cc .scoreboard>div{min-width:0}.cc .scoreboard .vs-divider{text-align:center}.cc .player-score{padding:8px}.cc .grid-wrapper{width:min(100%,520px,calc((100dvh - 170px) * 1.2 + 70px))}}
@media(max-width:700px){.cc .how-screen{justify-content:flex-start}.cc .how-content{grid-template-columns:minmax(0,1fr)}.cc .power-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.cc .power-legend span{min-height:0;padding:10px 12px;font-size:.95rem}}
@media(max-width:480px){.cc .player-card{width:90vw;padding:18px 14px}.cc .avatar{font-size:1.6rem;padding:8px 10px;border-radius:10px}.cc .btn{padding:13px 26px;font-size:.9rem}.cc .power-legend{font-size:.88rem;gap:6px}.cc .power-legend span{padding:7px 8px}}
@media(max-width:350px){.cc .grid{gap:5px}.cc .tile{border-radius:12px}.cc .circle{width:20px;height:20px}}
@media(max-width:900px) and (max-height:600px){.cc .screen{height:auto;min-height:100%;padding:12px 18px}.cc .logo{font-size:clamp(2rem,8vh,3rem);margin-bottom:8px}.cc h2{font-size:clamp(1.1rem,4vh,1.6rem);margin-bottom:10px}.cc .btn{margin-top:10px;padding:10px 26px}.cc .game-screen{height:100%;min-height:0;padding:8px 12px}.cc .game-layout{height:auto;grid-template-columns:minmax(0,1fr) minmax(200px,260px);gap:12px}.cc .grid{margin-top:10px;gap:clamp(5px,1.2vw,10px)}.cc .player-panel{gap:8px}.cc .turn{padding:9px 12px}.cc .scoreboard{padding:8px;gap:6px}.cc .player-score{padding:7px 9px}.cc .grid-wrapper{width:min(100%,calc((100dvh - 130px) * 1.2 + 70px))}}
@media(max-height:600px){.cc .how-screen{height:100%;min-height:100%;gap:8px;padding:8px 18px}.cc .how-screen h2{font-size:1.2rem}.cc .how-text{gap:6px;padding:12px;font-size:1rem}.cc .power-legend{gap:6px}.cc .power-legend span{min-height:0;padding:7px 10px;font-size:.9rem}.cc[data-screen="how"] .btn-primary{padding:9px 24px;font-size:1rem}}
@media(max-width:639px) and (orientation:portrait){
.cc[data-screen="welcome"] .screen{background-image:url('/assets/games/colour-clash-2/colour-clash-2-welcome-phone-bg.webp');background-position:center;background-size:cover}
.cc[data-screen="setup"] .screen,.cc[data-screen="how"] .screen,.cc[data-screen="game"],.cc[data-screen="winner"]{background-image:url('/assets/games/colour-clash-2/colour-clash-2-general-phone-bg.webp');background-position:center;background-size:cover}
}
`;

const COLOR_OPTIONS = [
  ["#FF0000", "Red"], ["#FF7F00", "Orange"], ["#FFFF00", "Yellow"], ["#00C853", "Green"],
  ["#00FFFF", "Cyan"], ["#0000FF", "Blue"], ["#8000FF", "Purple"], ["#FF00FF", "Magenta"],
  ["#FF69B4", "Hot Pink"], ["#8B4513", "Brown"], ["#FFFFFF", "White"], ["#000000", "Black"],
];
const EXTRA = COLOR_OPTIONS.map(([color]) => color);
const POWER_TYPES = ["star", "bomb", "swap", "eye"];
const POWER_ICONS = { star: "⭐", bomb: "💣", swap: "🔄", eye: "👁️" };
const AV1 = ["🦁", "🐼", "🐸", "🐯"]; 
const AV2 = ["🐵", "🐶", "🦊", "🐻"];
const C1 = COLOR_OPTIONS;
const C2 = COLOR_OPTIONS;
const COLOR_NAMES = Object.fromEntries(COLOR_OPTIONS);
const DARK_TEXT_COLORS = ["#FF0000", "#FF7F00", "#FFFF00", "#00C853", "#00FFFF", "#FF00FF", "#FF69B4", "#FFFFFF"];
const THEME_OPTIONS = [
  ["red", "Red", "🔴"], ["orange", "Orange", "🟠"], ["yellow", "Yellow", "🟡"], ["green", "Green", "🟢"],
  ["cyan", "Cyan", "🔵"], ["blue", "Blue", "🔵"], ["purple", "Purple", "🟣"], ["magenta", "Magenta", "🟣"],
  ["hot-pink", "Hot Pink", "🩷"], ["brown", "Brown", "🟤"], ["white", "White", "⚪"], ["black", "Black", "⚫"],
];
const COLOR_SWATCHES = {
  "#FF0000": "🔴", "#FF7F00": "🟠", "#FFFF00": "🟡", "#00C853": "🟢",
  "#00FFFF": "🔵", "#0000FF": "🔵", "#8000FF": "🟣", "#FF00FF": "🟣",
  "#FF69B4": "🩷", "#8B4513": "🟤", "#FFFFFF": "⚪", "#000000": "⚫",
};

function makeTiles(c1, c2) {
  const t = [];
  for (let i = 0; i < 5; i++) t.push(c1);
  for (let i = 0; i < 5; i++) t.push(c2);
  const pool = EXTRA.filter((c) => c !== c1 && c !== c2);
  for (let i = 0; i < 16; i++) t.push(pool[Math.floor(Math.random() * pool.length)]);
  POWER_TYPES.forEach((p) => t.push(p));
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t.map((color) => ({ color, revealed: false, fx: "", peek: null, peekContent: false }));
}

function adjacent(index, len) {
  const cols = 6, row = Math.floor(index / cols), col = index % cols, adj = [];
  if (row > 0) adj.push(index - cols);
  if (index + cols < len) adj.push(index + cols);
  if (col > 0) adj.push(index - 1);
  if (col < cols - 1) adj.push(index + 1);
  return adj;
}

const blankGame = () => ({
  tiles: [], cur: 1, over: false, can: true, turnKey: 0, b1: 0, b2: 0,
  p1: { name: "", avatar: "", color: "", score: 0, streak: 0 },
  p2: { name: "", avatar: "", color: "", score: 0, streak: 0 },
});

const snd = { ctx: null, on: true };
function getCtx() {
  if (!snd.ctx) snd.ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (snd.ctx.state === "suspended") snd.ctx.resume();
  return snd.ctx;
}
function beep(freq, dur, type = "sine", vol = 0.08) {
  if (!snd.on) return;
  try {
    const c = getCtx(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + dur);
  } catch (e) {}
}
const T = (fn, ms) => setTimeout(fn, ms);
const sfxClick = () => { beep(800, 0.09, "sine", 0.06); T(() => beep(1000, 0.07, "sine", 0.04), 40); };
const sfxSuccess = () => { beep(600, 0.12, "sine", 0.07); T(() => beep(900, 0.14, "sine", 0.07), 80); T(() => beep(1200, 0.1, "triangle", 0.05), 180); };
const sfxWrong = () => { beep(200, 0.2, "sawtooth", 0.06); T(() => beep(150, 0.25, "sawtooth", 0.05), 80); };
const sfxPower = () => { beep(400, 0.08, "square", 0.05); T(() => beep(600, 0.08, "square", 0.05), 80); T(() => beep(800, 0.12, "triangle", 0.06), 160); };
const sfxBomb = () => { beep(80, 0.35, "sawtooth", 0.1); T(() => beep(50, 0.4, "triangle", 0.08), 60); };
const sfxStar = () => { beep(880, 0.1, "triangle", 0.07); T(() => beep(1100, 0.12, "triangle", 0.08), 100); T(() => beep(1320, 0.18, "triangle", 0.09), 220); };
const sfxPeek = () => { beep(1200, 0.06, "sine", 0.05); T(() => beep(900, 0.08, "sine", 0.04), 80); };
const sfxVictory = () => [523, 659, 784, 1047].forEach((f, i) => T(() => beep(f, 0.18, "triangle", 0.09), i * 160));

export default function ColourClash2({ profileName = '' }) {
  const [screen, setScreen] = useState("welcome");
  const [theme, setTheme] = useState("yellow");
  const [form, setForm] = useState({ n1: profileName, n2: "", a1: AV1[0], a2: AV2[0], c1: "#FF0000", c2: "#0000FF" });
  const [warn, setWarn] = useState(false);
  const [banner, setBanner] = useState(null);
  const [winner, setWinner] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [, force] = useReducer((x) => x + 1, 0);
  const G = useRef(blankGame());
  const timers = useRef([]);
  const bannerKey = useRef(0);

  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const goSetup = () => {
    const g = G.current;
    g.p1.score = g.p1.streak = 0; g.p2.score = g.p2.streak = 0;
    setScreen("setup");
  };

  const playAgain = () => {
    clearTimers();
    G.current = blankGame();
    setForm({ n1: profileName, n2: "", a1: AV1[0], a2: AV2[0], c1: "#FF0000", c2: "#0000FF" });
    setBanner(null); setWinner(null); setConfetti([]); setWarn(false);
    setScreen("welcome");
  };

  const startHowTo = () => {
    if (form.c1 === form.c2) { setWarn(true); return; }
    setWarn(false);
    const g = G.current;
    g.p1.name = form.n1.trim() || "Player 1"; g.p2.name = form.n2.trim() || "Player 2";
    g.p1.color = form.c1; g.p2.color = form.c2;
    g.p1.avatar = form.a1; g.p2.avatar = form.a2;
    setScreen("how");
  };

  const startGame = () => {
    clearTimers();
    const g = G.current;
    g.p1.score = g.p1.streak = 0; g.p2.score = g.p2.streak = 0;
    g.cur = 1; g.over = false; g.can = true; g.b1 = 0; g.b2 = 0;
    g.tiles = makeTiles(g.p1.color, g.p2.color);
    g.turnKey++;
    setScreen("game");
  };

  const bump = (p) => {
    const g = G.current;
    if (p === g.p1) g.b1++; else if (p === g.p2) g.b2++; else { g.b1++; g.b2++; }
  };

  const turnUI = () => { G.current.turnKey++; };
  const flip = () => { G.current.cur = G.current.cur === 1 ? 2 : 1; };

  const showBanner = (name) => {
    const key = ++bannerKey.current;
    setBanner({ name, key });
    later(() => setBanner((b) => (b && b.key === key ? null : b)), 1500);
  };

  const confettiBurst = () => {
    const pal = ["#FF0000", "#FF7F00", "#FFFF00", "#00C853", "#00FFFF", "#0000FF", "#8000FF", "#FF00FF", "#FF69B4", "#8B4513", "#FFFFFF", "#000000"];
    const arr = Array.from({ length: 180 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      dur: +(Math.random() * 2.8 + 2).toFixed(2),
      del: +(Math.random() * 1.4).toFixed(2),
      bg: pal[Math.floor(Math.random() * pal.length)],
      w: Math.random() * 10 + 6,
      h: Math.random() * 10 + 6,
      round: Math.random() > 0.5,
    }));
    setConfetti(arr);
    later(() => setConfetti([]), 6700);
  };

  const showWinner = (p) => { setWinner(p); setScreen("winner"); sfxVictory(); confettiBurst(); };
  const win = (p) => { G.current.over = true; later(() => showWinner(p), 500); };

  const peekAdjacent = (indices) => {
    const g = G.current, HOLD = 1000;
    indices.forEach((adj, i) => {
      const t = g.tiles[adj];
      if (!t || t.revealed || t.peek) return;
      const d = i * 80;
      later(() => { if (t.revealed) return; t.peek = "show"; t.peekContent = true; force(); }, d);
      later(() => {
        if (t.revealed) return;
        t.peek = "hide"; force();
        later(() => { t.peekContent = false; force(); }, 200);
        later(() => { t.peek = null; t.peekContent = false; force(); }, 420);
      }, d + HOLD);
    });
  };

  const handlePower = (type, me, opp, index, tile) => {
    const g = G.current;
    switch (type) {
      case "star":
        sfxStar(); tile.fx += " extra-turn"; showBanner(me.name);
        me.streak = 0;
        later(() => { turnUI(); if (!g.over) g.can = true; force(); }, 500);
        break;
      case "bomb":
        me.score = Math.max(0, me.score - 1); me.streak = 0;
        sfxBomb(); bump(me); flip(); turnUI();
        later(() => { if (!g.over) g.can = true; }, 400);
        break;
      case "swap": {
        const tmp = g.p1.score; g.p1.score = g.p2.score; g.p2.score = tmp;
        me.streak = 0; opp.streak = 0;
        sfxPower(); bump(null);
        if (g.p1.score >= 5) { win(g.p1); return; }
        if (g.p2.score >= 5) { win(g.p2); return; }
        flip(); turnUI();
        later(() => { if (!g.over) g.can = true; }, 400);
        break;
      }
      case "eye": {
        sfxPeek(); me.streak = 0;
        const adj = adjacent(index, g.tiles.length);
        peekAdjacent(adj);
        flip(); turnUI();
        later(() => { if (!g.over) g.can = true; }, adj.length * 80 + 80 + 1000 + 450);
        break;
      }
    }
  };

  const reveal = (index) => {
    const g = G.current, t = g.tiles[index];
    if (g.over || !g.can) return;
    if (t.revealed || t.peek) return;
    g.can = false; sfxClick();
    const me = g.cur === 1 ? g.p1 : g.p2, opp = g.cur === 1 ? g.p2 : g.p1;
    t.revealed = true;

    if (POWER_TYPES.includes(t.color)) {
      t.fx = "power-tile"; sfxPower();
      handlePower(t.color, me, opp, index, t);
      force(); return;
    }

    if (t.color === me.color) {
      me.score++; me.streak++;
      t.fx = "score-boost"; sfxSuccess(); bump(me);
      if (me.score >= 5) { win(me); force(); return; }
      if (me.streak >= 3) {
        me.streak = 0; showBanner(me.name);
        later(() => { turnUI(); g.can = true; force(); }, 400);
        force(); return;
      }
    } else if (t.color === opp.color) {
      opp.score++; me.streak = 0;
      t.fx = "opponent-scored"; sfxWrong(); bump(opp);
      if (opp.score >= 5) { win(opp); force(); return; }
    } else {
      me.streak = 0;
    }
    flip(); turnUI();
    later(() => { g.can = true; }, 350);
    force();
  };

  const g = G.current;
  const cur = g.cur === 1 ? g.p1 : g.p2;
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const scoreInfo = (p, bk, rem) => (
    <div className="player-score" style={{ backgroundColor: p.color, color: DARK_TEXT_COLORS.includes(p.color) ? "#000000" : "#FFFFFF" }} aria-label={`${p.name} is looking for ${COLOR_NAMES[p.color]}`}>
      <div className="player-info">
        <span className="player-avatar">{p.avatar}</span>
        <div><strong className="player-name">{p.name}</strong></div>
      </div>
      <span key={bk} className={"score-num" + (bk > 0 ? " bump" : "")}>{p.score}</span>
      <div className={"remaining-indicator" + (rem <= 2 && rem > 0 ? " urgent" : "")}>
        {rem === 0 ? "🏆 Done!" : `Need ${rem} more`}
      </div>
    </div>
  );

  const tileContent = (t, i) => {
    const show = t.revealed || t.peekContent;
    if (!show) return <span className="tile-num">{i + 1}</span>;
    if (POWER_TYPES.includes(t.color)) return <span className="power-icon">{POWER_ICONS[t.color]}</span>;
    return <div className="circle" style={{ background: t.color }} />;
  };

  return (
    <div className="cc" data-theme={theme} data-screen={screen}>
      <style>{CSS}</style>

      {banner && <div key={banner.key} className="extra-turn-banner">⭐ {banner.name} gets an EXTRA TURN!</div>}

      {screen === "welcome" && (
        <div className="screen">
          <button className="welcome-start-hitbox" type="button" aria-label="Start Colour Clash 2.0" onClick={() => setScreen("setup")} />
        </div>
      )}

      {screen === "setup" && (
        <div className="screen">
          <h2>⚙️ Player Setup</h2>
          <label className="theme-picker" htmlFor="cc-theme">
            Game Theme
            <select id="cc-theme" value={theme} onChange={(event) => setTheme(event.target.value)}>
              {THEME_OPTIONS.map(([id, name, swatch]) => <option key={id} value={id}>{swatch} {name}</option>)}
            </select>
          </label>
          <div className="players">
            {[[1, AV1, C1], [2, AV2, C2]].map(([n, av, cs]) => (
              <div className="player-card" key={n}>
                <h3>Player {n}</h3>
                <input placeholder="Enter name" maxLength={16} autoComplete="off" value={form["n" + n]} onChange={(e) => setF("n" + n, e.target.value)} />
                <div className="avatars">
                  {av.map((a) => (
                    <div key={a} className={"avatar" + (form["a" + n] === a ? " selected" : "")} onClick={() => setF("a" + n, a)}>{a}</div>
                  ))}
                </div>
                <select value={form["c" + n]} onChange={(e) => setF("c" + n, e.target.value)}>
                  {cs.map(([v, l]) => <option key={v} value={v}>{COLOR_SWATCHES[v]} {l}</option>)}
                </select>
              </div>
            ))}
          </div>
          {warn && <div className="warn">⚠️ Players must choose different colours!</div>}
          <button className="btn btn-primary" onClick={startHowTo}>Next →</button>
        </div>
      )}

      {screen === "how" && (
        <div className="screen how-screen">
          <h2>📖 How To Play</h2>
          <div className="how-content">
            <div className="how-text">
              <p>🔢 Tap a <strong>numbered tile</strong> to reveal its hidden colour.</p>
              <p>🎯 Find <strong>5 of YOUR colour</strong> to win.</p>
              <p>⚠️ Reveal your <strong>opponent's colour</strong> — they get the point!</p>
              <p>🔥 Score <strong>3 in a row</strong> of your colour for an extra turn!</p>
              <p>🏆 First to <strong>5 points</strong> wins.</p>
            </div>
            <div className="power-legend">
              <span>⭐ Star = Extra turn</span>
              <span>💣 Bomb = Lose 1 point</span>
              <span>🔄 Swap = Swap scores</span>
              <span>👁️ Eye = Peek nearby (no score)</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={startGame}>🚀 &nbsp;Start Game</button>
        </div>
      )}

      {screen === "game" && (
        <div className="screen game-screen">
          <div className="game-layout">
            <div className="board-panel">
              <div className="grid-wrapper">
                <div className="grid">
                  {g.tiles.map((t, i) => (
                    <div
                      key={i}
                      className={["tile", t.revealed && "revealed " + t.fx, t.peek && "peeking", t.peek === "hide" && "peek-hide"].filter(Boolean).join(" ")}
                      onClick={() => reveal(i)}
                    >
                      {tileContent(t, i)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="player-panel">
              <div className="turn" key={g.turnKey}>{cur.avatar} <strong>{cur.name}</strong>'s Turn</div>
              <div className="scoreboard">
                <div>{scoreInfo(g.p1, g.b1, Math.max(0, 5 - g.p1.score))}</div>
                <div className="vs-divider">VS</div>
                <div>{scoreInfo(g.p2, g.b2, Math.max(0, 5 - g.p2.score))}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === "winner" && winner && (
        <div className="screen">
          <div className="winner-badge">🏆 {winner.name.toUpperCase()} WINS!</div>
          <p className="final-score">
            {g.p1.avatar} {g.p1.name}: <strong>{g.p1.score}</strong>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            {g.p2.avatar} {g.p2.name}: <strong>{g.p2.score}</strong>
          </p>
          <button className="btn btn-primary" onClick={playAgain}>🔄 Play Again</button>
          <button className="btn btn-ghost" onClick={goSetup} style={{ marginTop: 10 }}>Change Players</button>
        </div>
      )}

      {confetti.map((c) => (
        <div key={c.id} className="confetti" style={{
          left: c.left + "vw", animationDuration: c.dur + "s", animationDelay: c.del + "s",
          background: c.bg, width: c.w, height: c.h, borderRadius: c.round ? "50%" : "3px",
        }} />
      ))}
    </div>
  );
}
