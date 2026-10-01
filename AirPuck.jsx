import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { isSoundEnabled } from "@/lib/sound/beep";

/* =========================================================
   AIR PUCK — React port (welcome → name → menu → normal / card mode)
  Single default-exported component. Styles are scoped under .ap
  (uses native CSS nesting). Game physics live in refs; React state
  only drives the UI, while DOM sprite transforms follow the physics loop.
   ========================================================= */

const W = 1000, H = 500, GOAL_HEIGHT = 220, WIN_SCORE = 7;
const FIELD = { left: 12, right: W - 12, top: 12, bottom: H - 12 };
const GOAL_T = H / 2 - GOAL_HEIGHT / 2, GOAL_B = H / 2 + GOAL_HEIGHT / 2;
const BOARD = { left: 0.19, top: 0.225, width: 0.62, height: 0.55 };
const ASSETS = {
  welcome: "/games/air-puck/air-puck-welcome-screen-bg.webp",
  name: "/games/air-puck/air-puck-user-input-bg.webp",
  menu: "/games/air-puck/air-puck-main-menu-bg.webp",
  board: "/games/air-puck/air-hockey-game-screen-bg.webp",
  cardBoard: "/games/air-puck/air-hockey-game-screen-card-mode-bg.webp",
  player: "/games/air-puck/air-hockey-blue-mallet.webp",
  ai: "/games/air-puck/air-hockey-red-mallet.webp",
  puck: "/games/air-puck/air-hockey-red-puck.webp",
};

const DIFFICULTY = {
  easy:   { speed: 0.045, error: 55, reaction: 0.75, maxSpeedMult: 0.85 },
  medium: { speed: 0.07,  error: 28, reaction: 1.0,  maxSpeedMult: 1.0 },
  hard:   { speed: 0.10,  error: 8,  reaction: 1.25, maxSpeedMult: 1.15 },
};

const CARD_TYPES = {
  circle:   { label: "MISS",    desc: "No shot on goal" },
  triangle: { label: "GOAL",    desc: "Clean shot — scores!" },
  star:     { label: "PENALTY", desc: "50/50 shootout for you" },
  square:   { label: "REVERSE", desc: "50/50 shootout for opponent" },
};
const CARD_ORDER = ["circle", "triangle", "star", "square"];
const GLYPH = { circle: "●", triangle: "▲", star: "★", square: "■" };
const AI_CARD_WEIGHTS = {
  easy:   { circle: 0.40, triangle: 0.15, star: 0.20, square: 0.25 },
  medium: { circle: 0.25, triangle: 0.25, star: 0.25, square: 0.25 },
  hard:   { circle: 0.15, triangle: 0.40, star: 0.25, square: 0.20 },
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const decodedAssets = new Map();
function loadDecodedAsset(src, fetchPriority) {
  const cached = decodedAssets.get(src);
  if (cached) return cached;
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = fetchPriority;
    const loaded = () => image.decode().catch(() => {}).then(() => resolve(src));
    image.addEventListener("load", loaded, { once: true });
    image.addEventListener("error", reject, { once: true });
    image.src = src;
    if (image.complete && image.naturalWidth > 0) loaded();
  });
  decodedAssets.set(src, promise);
  promise.catch(() => decodedAssets.delete(src));
  return promise;
}

const boardBounds = (portrait) => portrait
  ? { left: 1 - BOARD.top - BOARD.height, top: BOARD.left, width: BOARD.height, height: BOARD.width }
  : BOARD;
const spriteTransform = (object, portrait) => {
  const bounds = boardBounds(portrait);
  const x = bounds.left + (portrait ? 1 - object.y / H : object.x / W) * bounds.width;
  const y = bounds.top + (portrait ? object.x / W : object.y / H) * bounds.height;
  return `translate3d(${x * 100}cqw,${y * 100}cqh,0) translate(-50%,-50%)`;
};

/* ---------------- AUDIO ---------------- */
let audioCtx = null;
const SFX = {
  hit:       { f: 240, g: 0.07, d: 0.07 },
  wall:      { f: 150, g: 0.045, d: 0.05 },
  goal:      { t: "triangle", f: 550, f2: 880, r: 0.18, g: 0.09, d: 0.35 },
  lose:      { t: "sawtooth", f: 300, f2: 120, r: 0.4, g: 0.07, d: 0.45 },
  countdown: { f: 440, g: 0.05, d: 0.1 },
  go:        { f: 440, f2: 880, r: 0.15, g: 0.08, d: 0.2 },
};
function playSound(type, muted) {
  if (muted) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const s = SFX[type], osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    if (s.t) osc.type = s.t;
    if (s.f2) {
      osc.frequency.setValueAtTime(s.f, now);
      osc.frequency.exponentialRampToValueAtTime(s.f2, now + s.r);
    } else osc.frequency.value = s.f;
    gain.gain.setValueAtTime(s.g, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + s.d);
    osc.start(now); osc.stop(now + 0.5);
  } catch (e) { /* audio is optional */ }
}

/* ---------------- STYLES ---------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
.ap{
  --panel:rgba(15,22,36,.82);--border:rgba(255,255,255,.08);--border-strong:rgba(255,255,255,.14);
  --text:#f5f8ff;--muted:#7f8ba3;--muted-2:#59657b;--cyan:#35e7ff;--pink:#ff4f8b;--gold:#ffc857;
  --radius-lg:22px;--radius-md:14px;--radius-sm:10px;
  --shadow:0 25px 80px rgba(0,0,0,.42),0 8px 25px rgba(0,0,0,.25);
  position:relative;isolation:isolate;container-type:size;width:100%;height:100%;min-height:0;max-height:100%;padding:20px;overflow:hidden;
  display:flex;justify-content:center;align-items:center;color:var(--text);
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  background:radial-gradient(circle at 50% -20%,rgba(53,231,255,.09),transparent 38%),
    radial-gradient(circle at 100% 100%,rgba(255,79,139,.06),transparent 32%),linear-gradient(180deg,#090e18,#070b14);

  &[data-screen="welcome"]{background:#090e18 url('/games/air-puck/air-puck-welcome-screen-bg.webp') center/cover no-repeat;cursor:pointer}
  &[data-screen="name"]{background:#090e18 url('/games/air-puck/air-puck-user-input-bg.webp') center/cover no-repeat}
  &[data-screen="menu"]{background:#090e18 url('/games/air-puck/air-puck-main-menu-bg.webp') center/cover no-repeat}
  &[data-screen="game"]::before{background:url('/games/air-puck/air-hockey-game-screen-bg.webp') center/100% 100% no-repeat}
  &[data-screen="game"][data-mode="card"]::before{background-image:url('/games/air-puck/air-hockey-game-screen-card-mode-bg.webp')}

  &::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:-1;
    background:radial-gradient(circle at 50% 45%,rgba(53,231,255,.035),transparent 40%)}
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;user-select:none}
  &.asset-gate{padding:20px}
  .asset-loader{display:flex;flex-direction:column;align-items:center;gap:16px;color:var(--muted);font-size:11px;
    letter-spacing:1px}
  .asset-loader-mark{font-size:36px;color:var(--cyan)}

  /* ---- screens ---- */
  .app-screen{width:100%;height:100%;max-width:560px;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:26px;text-align:center;margin:0 auto}
  .welcome-hitbox{position:absolute;inset:0;z-index:1;width:100%;height:100%;padding:0;border:0;
    background:transparent;cursor:pointer}
  .app-panel{width:100%;padding:30px 28px;border-radius:var(--radius-lg);border:1px solid var(--border-strong);
    background:linear-gradient(180deg,rgba(20,29,46,.9),rgba(10,16,27,.92));box-shadow:var(--shadow);
    h2{font-size:20px;font-weight:800;letter-spacing:-.4px;margin-bottom:6px}
    p.hint{color:var(--muted);font-size:12px;margin-bottom:20px}}
  .app-screen .btn{width:100%}
  .name-input{width:100%;padding:15px 16px;border-radius:12px;border:1px solid var(--border);
    background:rgba(255,255,255,.04);color:var(--text);font-family:inherit;font-size:15px;font-weight:600;
    text-align:center;margin-bottom:18px;transition:border-color .18s,background .18s;user-select:text;
    &:focus{outline:none;border-color:var(--cyan);background:rgba(53,231,255,.06)}
    &::placeholder{color:var(--muted-2);font-weight:500}}
  .app-back{margin-top:4px;background:none;border:none;color:var(--muted);font-size:11px;font-weight:700;
    letter-spacing:.5px;cursor:pointer;&:hover{color:var(--text)}}
  .mode-select{display:flex;gap:12px;width:100%;margin-bottom:22px}
  .mode-card{flex:1;padding:20px 14px;border-radius:var(--radius-md);border:1px solid var(--border);
    background:rgba(255,255,255,.035);color:var(--text);font-family:inherit;cursor:pointer;display:flex;
    flex-direction:column;align-items:center;gap:8px;transition:border-color .18s,background .18s,transform .18s;
    &:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.2)}
    .mode-icon{font-size:26px}
    .mode-name{font-size:13px;font-weight:800;letter-spacing:.3px}
    .mode-desc{font-size:10.5px;color:var(--muted);line-height:1.4}
    &.active{border-color:var(--cyan);background:rgba(53,231,255,.1);box-shadow:0 0 0 1px rgba(53,231,255,.3) inset;
      .mode-name{color:var(--cyan)}}}
  .welcome-name-tag{color:var(--cyan)}

  /* ---- game shell ---- */
  .game-wrapper{position:absolute;inset:0;width:100%;height:100%;max-width:none;display:flex;flex-direction:column;
    gap:0;min-height:0}
  .header,.scoreboard,.bottom-bar{flex:0 0 auto}
  .header{display:flex;align-items:center;justify-content:space-between;gap:20px}
  .title-block{display:flex;flex-direction:column;gap:5px}
  .title{font-size:clamp(25px,3vw,38px);font-weight:900;letter-spacing:-1.8px;line-height:1;color:#f7fbff;
    text-shadow:0 0 30px rgba(53,231,255,.14)}
  .subtitle{color:var(--muted);font-size:10px;font-weight:700;letter-spacing:1.6px}
  .header-controls{display:flex;align-items:center;gap:8px}
  .icon-btn{width:42px;height:42px;border-radius:var(--radius-sm);border:1px solid var(--border);
    background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.025));color:#d9e4f7;font-size:16px;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:transform .18s,background .18s,border-color .18s,box-shadow .18s;
    &:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18);transform:translateY(-2px);
      box-shadow:0 8px 25px rgba(0,0,0,.25)}
    &:active{transform:scale(.94)}}
  .difficulty-select{display:flex;align-items:center;padding:4px;border-radius:12px;gap:2px;
    background:rgba(255,255,255,.035);border:1px solid var(--border)}
  .diff-btn{border:0;background:transparent;color:var(--muted);font-family:inherit;font-size:10px;font-weight:800;
    letter-spacing:.7px;padding:8px 11px;border-radius:8px;cursor:pointer;transition:background .18s,color .18s;
    &:hover{color:#fff}
    &.active{color:#071018;background:linear-gradient(135deg,#65efff,#2fd8f2);box-shadow:0 4px 15px rgba(53,231,255,.22)}}

  .scoreboard{align-self:center;display:flex;align-items:center;justify-content:center;gap:26px;min-width:210px;
    padding:10px 26px;border-radius:18px;border:1px solid var(--border-strong);
    background:linear-gradient(180deg,rgba(19,28,45,.92),rgba(11,17,29,.92));
    box-shadow:0 12px 40px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.035)}
  .score{text-align:center;min-width:55px}
  .score-label{font-size:9px;font-weight:800;color:var(--muted);letter-spacing:1.5px;margin-bottom:1px}
  .score-number{font-size:34px;font-weight:900;line-height:1;transition:transform .2s,filter .2s;
    &.pop{transform:scale(1.35)}}
  .player-score{color:var(--cyan);text-shadow:0 0 20px rgba(53,231,255,.38)}
  .ai-score{color:var(--pink);text-shadow:0 0 20px rgba(255,79,139,.32)}
  .score-divider{color:#465268;font-size:20px;font-weight:800}
  .streak-badge{min-height:15px;text-align:center;color:var(--gold);font-size:9px;font-weight:800;
    letter-spacing:1px;text-transform:uppercase;opacity:.9}

  .arena-container{position:absolute;inset:0;width:100%;height:100%;padding:0;border-radius:0;flex:none;
    display:block;overflow:hidden;isolation:isolate;background:transparent;box-shadow:none}
  .playfield{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;container-type:size;
    background:transparent;touch-action:none;cursor:crosshair;isolation:isolate}
  .sprite{position:absolute;left:0;top:0;display:block;object-fit:contain;pointer-events:none;will-change:transform;
    transform:translate3d(0,0,0) translate(-50%,-50%);z-index:1}
  .sprite-mallet{width:20.8cqw;aspect-ratio:1}
  .sprite-puck{width:8.4cqw;aspect-ratio:1}
  .playfield.portrait .sprite-mallet{width:20.8cqh}
  .playfield.portrait .sprite-puck{width:8.4cqh}

  .message{position:absolute;inset:5px;display:flex;align-items:center;justify-content:center;padding:20px;
    pointer-events:none;border-radius:20px;background:rgba(4,8,15,.48);backdrop-filter:blur(5px);
    -webkit-backdrop-filter:blur(5px);z-index:5}
  .message-card{position:relative;width:min(420px,90%);text-align:center;padding:34px 32px 30px;border-radius:22px;
    background:linear-gradient(180deg,rgba(20,29,46,.96),rgba(10,16,27,.97));border:1px solid rgba(255,255,255,.12);
    box-shadow:0 30px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.05);pointer-events:auto;
    &::before{content:"";position:absolute;top:0;left:15%;right:15%;height:2px;border-radius:99px;opacity:.8;
      background:linear-gradient(90deg,transparent,var(--cyan),transparent)}
    h2{font-size:clamp(27px,5vw,42px);font-weight:900;letter-spacing:-1px;margin-bottom:9px}
    p{color:#8d9ab0;font-size:13px;line-height:1.6;margin-bottom:22px}}
  .countdown-num{font-size:clamp(80px,13vw,140px);font-weight:900;color:#fff;letter-spacing:-6px;
    text-shadow:0 0 40px rgba(53,231,255,.45),0 10px 50px rgba(0,0,0,.5)}

  .bottom-bar{display:flex;align-items:center;justify-content:space-between;gap:20px}
  .instructions{color:var(--muted);font-size:11px;font-weight:500;line-height:1.7;
    &::first-line{color:#aab5c8}}

  .btn{border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:13px 20px;font-family:inherit;font-size:11px;
    font-weight:800;letter-spacing:.7px;color:#061018;background:linear-gradient(135deg,#63edff,#2bd4ee);
    cursor:pointer;white-space:nowrap;box-shadow:0 8px 25px rgba(53,231,255,.14);
    transition:transform .18s,filter .18s,box-shadow .18s;
    &:hover{filter:brightness(1.08);transform:translateY(-2px);box-shadow:0 12px 32px rgba(53,231,255,.2)}
    &:active{transform:scale(.97)}
    &.secondary{color:#dce5f4;background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.1);box-shadow:none;
      &:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16)}}}

  .shake{animation:ap-shake .35s ease}
  @keyframes ap-shake{
    0%,100%{transform:translate3d(0,0,0)}20%{transform:translate3d(-5px,3px,0)}
    40%{transform:translate3d(5px,-3px,0)}60%{transform:translate3d(-4px,-2px,0)}80%{transform:translate3d(4px,2px,0)}}

  /* ---- card mode ---- */
  .card-mode-layout{position:absolute;inset:0;pointer-events:none}
  .card-board{position:absolute;inset:0;padding:0;background:transparent;pointer-events:none}
  .card-board-inner{position:absolute;inset:0;border-radius:0;background:transparent;display:block;overflow:visible;pointer-events:none}
  .card-board-goal{position:absolute;top:50%;z-index:2;text-align:center;padding:10px 7px;font-size:10px;font-weight:800;
    letter-spacing:1px;transform:translateY(-50%);
    &.ai{right:19%;color:rgba(255,105,153,.95);background:rgba(8,16,32,.74);border-right:3px solid #ff4f8b}
    &.you{left:19%;color:rgba(53,231,255,.95);background:rgba(8,16,32,.74);border-left:3px solid #35e7ff}}
  .card-board-field{position:absolute;inset:0;pointer-events:none}
  .card-log{position:absolute;left:5%;bottom:5%;width:min(48vw,600px);max-height:14%;overflow:auto;padding:10px 14px;
    border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(5,13,30,.72);font-size:11px;line-height:1.7;color:var(--muted)}
  .card-log div:last-child{color:var(--text)}
  .card-sidebar{position:absolute;top:14%;right:4%;bottom:10%;width:min(340px,28vw);min-width:0;
    display:flex;flex-direction:column;gap:12px;overflow-y:auto;padding:14px;border-radius:14px;
    border:1px solid rgba(255,255,255,.14);background:rgba(5,13,30,.84);backdrop-filter:blur(8px);pointer-events:auto}
  .pending-card{width:100%;min-height:106px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
    border:1px solid rgba(105,210,255,.55);border-radius:10px;color:#f6fbff;font:inherit;font-weight:900;
    background:linear-gradient(145deg,#06427a,#071a3b 55%,#4c1454);box-shadow:0 8px 26px rgba(0,0,0,.35);cursor:pointer}
  .pending-card:disabled{cursor:default}
  .pending-card-back{font-size:26px;color:#7beaff}
  .pending-card-reveal{font-size:11px;letter-spacing:.08em;text-transform:uppercase}
  .pending-card .card-shape{width:30px;height:30px}
  .pending-card .card-desc{font-size:10px;color:#c5d7ea;text-align:center}
  @keyframes ap-puck-miss{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}}
  .card-log{flex:0 0 auto;max-height:96px;overflow-y:auto;padding:10px 14px;border-top:1px solid var(--border);
    background:rgba(0,0,0,.18);font-size:11px;line-height:1.7;color:var(--muted);
    div:last-child{color:var(--text)}}

  .card-status{flex:0 0 auto;padding:16px 18px;border-radius:var(--radius-md);background:var(--panel);border:1px solid var(--border)}
  .card-panel-heading{padding:8px;border:1px solid rgba(53,231,255,.45);border-radius:9px;background:linear-gradient(180deg,rgba(8,69,126,.8),rgba(5,27,66,.8));
    color:#eafaff;text-align:center;font-size:14px;font-weight:900;letter-spacing:.04em}
  .card-status-row{display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:700;padding:4px 0;
    .value{font-size:20px;font-weight:900}
    &.you .value{color:var(--cyan)}&.ai .value{color:var(--pink)}}
  .card-streak{min-height:15px;text-align:center;color:var(--gold);font-size:10px;font-weight:800;letter-spacing:.6px;
    text-transform:uppercase;margin-top:6px}
  .card-turn-indicator{margin-top:10px;text-align:center;font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.3px}
  .card-hand{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .play-card{border-radius:var(--radius-md);border:1px solid var(--border);color:var(--text);font-family:inherit;
    background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:8px;padding:10px;cursor:pointer;
    transition:transform .16s,border-color .16s,background .16s,box-shadow .16s;
    &:hover:not(:disabled){transform:translateY(-3px);border-color:rgba(255,255,255,.22);box-shadow:0 10px 24px rgba(0,0,0,.3)}
    &:disabled{opacity:.4;cursor:default}
    .card-shape{width:34px;height:34px;
      &.shape-circle{border-radius:50%;background:linear-gradient(135deg,#7f8ba3,#59657b)}
      &.shape-triangle{width:0;height:0;border-left:17px solid transparent;border-right:17px solid transparent;
        border-bottom:30px solid #35e7ff}
      &.shape-star{background:var(--gold);
        clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
      &.shape-square{border-radius:6px;background:linear-gradient(135deg,#ff4f8b,#c93868)}}
    .card-label{font-size:10px;font-weight:800;letter-spacing:.6px}
    .card-desc{font-size:9px;color:var(--muted);text-align:center;line-height:1.3}}
  .card-penalty{flex:0 0 auto;padding:14px 16px;border-radius:var(--radius-md);text-align:center;
    background:rgba(255,200,87,.08);border:1px solid rgba(255,200,87,.3);
    p{font-size:11.5px;font-weight:700;margin-bottom:12px;color:#ffd98a}}
  .penalty-cards{display:flex;justify-content:center;gap:14px}
  .penalty-card{width:58px;height:78px;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-weight:900;
    font-size:11px;color:#fff;display:flex;align-items:center;justify-content:center;transition:transform .16s,box-shadow .16s;
    &:disabled{opacity:.5;cursor:default}
    &:hover:not(:disabled){transform:translateY(-4px)}
    &.red{background:linear-gradient(160deg,#ff5b7a,#b3234a);box-shadow:0 8px 20px rgba(255,79,139,.25)}
    &.blue{background:linear-gradient(160deg,#56d6ff,#1489b8);box-shadow:0 8px 20px rgba(53,231,255,.25)}
    &.revealed{opacity:1}
    &.revealed.win{box-shadow:0 0 0 3px #ffc857}}
}

@media (max-width:700px){
  .ap{padding:10px;align-items:flex-start;
    .game-wrapper{gap:10px}
    .header{align-items:flex-start}
    .title{font-size:24px}
    .subtitle{font-size:8px;letter-spacing:1.2px}
    .header-controls{gap:5px}
    .icon-btn{width:38px;height:38px}
    .difficulty-select{order:3;width:100%;justify-content:center;margin-top:2px}
    .scoreboard{padding:9px 22px;min-width:190px;gap:22px}
    .score-number{font-size:29px}
    .arena-container{padding:4px;border-radius:20px}
    .playfield{border-radius:16px}
    .message{inset:4px;border-radius:16px}
    .message-card{padding:27px 22px 23px;border-radius:18px}
    .bottom-bar{flex-direction:column;align-items:stretch;gap:10px}
    .instructions{text-align:center;font-size:10px}
    .btn{width:100%}
    .app-panel{padding:24px 20px}
    .mode-select{flex-direction:column}
    .card-sidebar{left:4%;right:4%;top:auto;bottom:4%;width:auto;max-height:44%;padding:8px;gap:8px}
    .card-log{display:none}
    .card-hand{gap:6px}
    .play-card{gap:5px;padding:6px}
    .card-board-goal{font-size:8px;padding:5px}}
}
@media (max-width:700px) and (orientation:portrait){
  .ap[data-screen="game"]::before{inset:auto;left:50%;top:50%;width:100cqh;height:100cqw;
    transform:translate(-50%,-50%) rotate(90deg)}
}
@media (max-width:420px){
  .ap{padding:7px;
    .header{gap:8px}
    .title{font-size:21px}
    .subtitle{display:none}
    .difficulty-select{width:auto;margin-left:auto}
    .diff-btn{padding:7px 8px;font-size:9px}
    .icon-btn{width:34px;height:34px;font-size:14px}
    .scoreboard{padding:8px 18px}
    .score-number{font-size:26px}
    .instructions{font-size:9px}}
}
@media (prefers-reduced-motion:reduce){
  .ap *,.ap *::before,.ap *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}`;

/* ---------------- COMPONENT ---------------- */
const restart = (el, cls) => {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // restart CSS animation
  el.classList.add(cls);
};

export default function AirPuck({ onHudUpdate } = {}) {
  /* ---- UI state ---- */
  const [screen, setScreen] = useState("welcome"); // welcome | name | menu | game
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetsFailed, setAssetsFailed] = useState(false);
  const [assetAttempt, setAssetAttempt] = useState(0);
  const [mode, setMode] = useState("normal");      // normal | card
  const [name, setName] = useState("Player");
  const [nameInput, setNameInput] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [countdown, setCountdown] = useState(null);
  const [result, setResult] = useState(null);      // normal-mode game over {title,text}
  const [scores, setScores] = useState({ p: 0, a: 0, streak: 0, pop: null });

  const [card, setCard] = useState({ p: 0, a: 0, streak: 0, over: false, busy: false, turn: "player" });
  const [pendingCard, setPendingCard] = useState(null);
  const [cardResult, setCardResult] = useState(null);
  const [pen, setPen] = useState(null);            // {initiator, shooter, revealed, success}
  const [log, setLog] = useState([]);

  /* ---- mutable game state (never triggers re-render) ---- */
  const arenaRef = useRef(null);
  const playfieldRef = useRef(null);
  const playerElRef = useRef(null);
  const aiElRef = useRef(null);
  const puckElRef = useRef(null);
  const logRef = useRef(null);
  const timers = useRef([]);
  const nameRef = useRef("Player");
  const C = useRef({ p: 0, a: 0, streak: 0, over: false, busy: false, turn: "player" });
  const penLock = useRef(false);
  const G = useRef({
    player: { x: 190, y: H / 2, tx: 190, ty: H / 2, r: 168, speed: 0.28 },
    ai: { x: W - 190, y: H / 2, r: 168, ex: 0, et: 0 },
    puck: { x: W / 2, y: H / 2, r: 68, vx: 0, vy: 0, max: 900, stuckFor: 0 },
    rally: 0,
    over: false, paused: false, counting: false, goalPause: 0,
    p: 0, a: 0, streak: 0, diff: "medium", muted: false,
  });
  const g = G.current;

  useLayoutEffect(() => {
    let cancelled = false;
    setAssetsReady(false);
    setAssetsFailed(false);
    const required = screen === "welcome" ? [ASSETS.welcome]
      : screen === "name" ? [ASSETS.name]
        : screen === "menu" ? [ASSETS.menu]
          : mode === "card" ? [ASSETS.cardBoard, ASSETS.player, ASSETS.ai, ASSETS.puck]
            : [ASSETS.board, ASSETS.player, ASSETS.ai, ASSETS.puck];
    const deferred = Object.values(ASSETS).filter((src) => !required.includes(src));
    let idleHandle;
    let idleIsCallback = false;
    const warmDeferred = () => {
      if (cancelled) return;
      void Promise.all(deferred.map((src) => loadDecodedAsset(src, "low"))).catch(() => {});
    };
    Promise.all(required.map((src) => loadDecodedAsset(src, "high"))).then(() => {
      if (cancelled) return;
      setAssetsReady(true);
      if (typeof window.requestIdleCallback === "function") {
        idleIsCallback = true;
        idleHandle = window.requestIdleCallback(warmDeferred, { timeout: 1000 });
      } else {
        idleHandle = window.setTimeout(warmDeferred, 120);
      }
    }).catch(() => {
      if (!cancelled) setAssetsFailed(true);
    });
    return () => {
      cancelled = true;
      if (idleHandle === undefined) return;
      if (idleIsCallback && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleHandle);
      else window.clearTimeout(idleHandle);
    };
  }, [assetAttempt, screen, mode]);

  useEffect(() => { g.diff = difficulty; }, [difficulty, g]);

  const sfx = (t) => playSound(t, !isSoundEnabled());
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);

  /* ================= NORMAL MODE ================= */
  const syncScores = (scorer) => {
    setScores({ p: g.p, a: g.a, streak: g.streak, pop: scorer });
    setTimeout(() => setScores((s) => ({ ...s, pop: null })), 220);
  };

  const runCountdown = (dir) => {
    g.counting = true;
    let count = 3;
    setCountdown("3"); sfx("countdown");
    const step = () => {
      count--;
      if (count > 0) { setCountdown(String(count)); sfx("countdown"); later(step, 550); return; }
      setCountdown("GO!"); sfx("go");
      later(() => {
        setCountdown(null);
        g.counting = false;
        const ang = (Math.random() - 0.5) * 0.8;
        g.puck.vx = Math.cos(ang) * 360 * dir;
        g.puck.vy = Math.sin(ang) * 360;
      }, 350);
    };
    later(step, 550);
  };

  const serve = (dir) => {
    const { puck, player, ai } = g;
    puck.x = W / 2; puck.y = H / 2; puck.vx = 0; puck.vy = 0;
    puck.stuckFor = 0;
    g.rally = 0;
    player.x = 190; player.y = H / 2; player.tx = player.x; player.ty = player.y;
    ai.x = W - 190; ai.y = H / 2;
    runCountdown(dir);
  };

  const resetGame = () => {
    clearTimers();
    g.p = 0; g.a = 0; g.streak = 0; g.over = false; g.goalPause = 0; g.paused = false;
    setResult(null);
    setScores({ p: 0, a: 0, streak: 0, pop: null });
    serve(Math.random() > 0.5 ? 1 : -1);
  };

  const endGame = (winner) => {
    g.over = true; g.puck.vx = 0; g.puck.vy = 0;
    if (winner === "player") {
      setResult({ title: "YOU WIN! 🎉", text: `Final score ${g.p} - ${g.a}. Nice reflexes!` });
      sfx("goal");
    } else {
      setResult({ title: "AI WINS 🤖", text: `Final score ${g.p} - ${g.a}. Try a lower difficulty or run it back.` });
      sfx("lose");
    }
  };

  const scoreGoal = (who) => {
    if (g.goalPause > 0 || g.over || g.counting) return;
    if (who === "player") { g.p++; g.streak = g.streak > 0 ? g.streak + 1 : 1; }
    else { g.a++; g.streak = g.streak < 0 ? g.streak - 1 : -1; }
    syncScores(who); sfx("goal"); restart(arenaRef.current, "shake");
    if (g.p >= WIN_SCORE) return endGame("player");
    if (g.a >= WIN_SCORE) return endGame("ai");
    g.goalPause = 0.6;
    serve(who === "player" ? -1 : 1);
  };

  const movePlayer = (clientX, clientY) => {
    const rect = playfieldRef.current.getBoundingClientRect();
    const portrait = playfieldRef.current.classList.contains("portrait");
    const bounds = boardBounds(portrait);
    const x = clamp((clientX - rect.left) / rect.width, bounds.left, bounds.left + bounds.width);
    const y = clamp((clientY - rect.top) / rect.height, bounds.top, bounds.top + bounds.height);
    const localX = (x - bounds.left) / bounds.width;
    const localY = (y - bounds.top) / bounds.height;
    const targetX = portrait ? localY * W : localX * W;
    const targetY = portrait ? (1 - localX) * H : localY * H;
    g.player.tx = clamp(targetX, FIELD.left + g.player.r, W / 2 - g.player.r);
    g.player.ty = clamp(targetY, FIELD.top + g.player.r, FIELD.bottom - g.player.r);
  };

  const updatePlayer = (dt) => {
    const p = g.player, k = 1 - Math.pow(1 - p.speed, dt * 60);
    p.x = clamp(p.x + (p.tx - p.x) * k, FIELD.left + p.r, W / 2 - p.r);
    p.y = clamp(p.y + (p.ty - p.y) * k, FIELD.top + p.r, FIELD.bottom - p.r);
  };

  const updateAI = (dt) => {
    const cfg = DIFFICULTY[g.diff], { ai, puck } = g;
    let tx = W - 190, ty = H / 2;
    ai.et -= dt;
    if (ai.et <= 0) { ai.ex = (Math.random() - 0.5) * 2 * cfg.error; ai.et = 0.25 + Math.random() * 0.35; }
    if (puck.x > W * 0.34 && puck.vx > 0) {
      tx = Math.min(W - ai.r, puck.x + 65);
      const t = Math.max(0, (tx - puck.x) / Math.max(puck.vx, 30));
      ty = clamp(puck.y + puck.vy * t * cfg.reaction + ai.ex, FIELD.top + ai.r, FIELD.bottom - ai.r);
    } else if (puck.x > W * 0.34) {
      ty = clamp(puck.y + ai.ex * 0.5, FIELD.top + ai.r, FIELD.bottom - ai.r);
    }
    tx = clamp(tx, W / 2 + ai.r, FIELD.right - ai.r);
    const k = 1 - Math.pow(1 - cfg.speed, dt * 60);
    ai.x += (tx - ai.x) * k; ai.y += (ty - ai.y) * k;
  };

  const paddleHit = (pad) => {
    const { puck } = g;
    const dx = puck.x - pad.x, dy = puck.y - pad.y, min = puck.r + pad.r, dist = Math.hypot(dx, dy);
    if (dist >= min) return;
    const nx = dist === 0 ? (pad === g.player ? 1 : -1) : dx / dist;
    const ny = dist === 0 ? 0 : dy / dist;
    const overlap = min - dist;
    puck.x += nx * overlap; puck.y += ny * overlap;
    const vn = puck.vx * nx + puck.vy * ny;
    if (vn < 0) { puck.vx -= 2 * vn * nx; puck.vy -= 2 * vn * ny; }
    puck.vx += nx * 12; puck.vy += ny * 12;
    g.rally++;

    let speed = Math.hypot(puck.vx, puck.vy);
    if (speed < 320) { const f = 320 / Math.max(speed, 1); puck.vx *= f; puck.vy *= f; }
    const maxSpeed = puck.max * DIFFICULTY[g.diff].maxSpeedMult * (1 + Math.min(g.rally, 8) * 0.02);
    speed = Math.hypot(puck.vx, puck.vy);
    if (speed > maxSpeed) { const f = maxSpeed / speed; puck.vx *= f; puck.vy *= f; }

    sfx("hit");
  };

  const updatePuck = (dt) => {
    const { puck } = g;
    const speed = Math.hypot(puck.vx, puck.vy);
    const nearCorner = (puck.x < FIELD.left + puck.r * 2 || puck.x > FIELD.right - puck.r * 2)
      && (puck.y < FIELD.top + puck.r * 2 || puck.y > FIELD.bottom - puck.r * 2);
    puck.stuckFor = speed < 85 || (nearCorner && speed < 280) ? puck.stuckFor + dt : 0;
    if (puck.stuckFor >= 0.85) {
      const towardCenterX = W / 2 - puck.x;
      const towardCenterY = H / 2 - puck.y;
      const centerLength = Math.hypot(towardCenterX, towardCenterY) || 1;
      const angleKick = (Math.random() - 0.5) * 100;
      puck.vx = towardCenterX / centerLength * 380 + angleKick;
      puck.vy = towardCenterY / centerLength * 380 - angleKick;
      puck.stuckFor = 0;
    }

    const steps = 8, sub = dt / steps;
    for (let s = 0; s < steps; s++) {
      puck.x += puck.vx * sub; puck.y += puck.vy * sub;

      if (puck.y - puck.r <= FIELD.top) { puck.y = FIELD.top + puck.r; puck.vy = Math.abs(puck.vy); sfx("wall"); }
      if (puck.y + puck.r >= FIELD.bottom) { puck.y = FIELD.bottom - puck.r; puck.vy = -Math.abs(puck.vy); sfx("wall"); }

      paddleHit(g.player);
      paddleHit(g.ai);

      const inGoal = puck.y - puck.r >= GOAL_T && puck.y + puck.r <= GOAL_B;
      if (puck.x - puck.r <= FIELD.left) {
        if (inGoal) return scoreGoal("ai");
        puck.x = FIELD.left + puck.r; puck.vx = Math.abs(puck.vx); sfx("wall");
      }
      if (puck.x + puck.r >= FIELD.right) {
        if (inGoal) return scoreGoal("player");
        puck.x = FIELD.right - puck.r; puck.vx = -Math.abs(puck.vx); sfx("wall");
      }
    }
  };

  useLayoutEffect(() => {
    if (screen !== "game") return;
    const arena = arenaRef.current;
    const field = playfieldRef.current;
    if (!arena || !field) return;

    const fitField = () => {
      const portrait = window.matchMedia("(max-width: 700px) and (orientation: portrait)").matches;
      field.classList.toggle("portrait", portrait);
      const place = (element, object) => {
        if (element) element.style.transform = spriteTransform(object, portrait);
      };
      place(aiElRef.current, g.ai);
      place(playerElRef.current, g.player);
      place(puckElRef.current, g.puck);
    };

    fitField();
    const observer = new ResizeObserver(fitField);
    observer.observe(arena);
    const orientation = window.matchMedia("(max-width: 700px) and (orientation: portrait)");
    orientation.addEventListener("change", fitField);
    return () => {
      observer.disconnect();
      orientation.removeEventListener("change", fitField);
    };
  }, [screen, mode, assetsReady]);

  // Keep the physics loop independent from React's render cycle.
  useEffect(() => {
    if (screen !== "game" || mode !== "normal") return;
    let raf, last = performance.now();
    const frame = (t) => {
      const dt = Math.min((t - last) / 1000 || 0, 0.033);
      last = t;
      if (!g.over && !g.paused && !g.counting) {
        updatePlayer(dt); updateAI(dt);
        if (g.goalPause > 0) g.goalPause -= dt; else updatePuck(dt);
      }
      const field = playfieldRef.current;
      if (field) {
        const portrait = field.classList.contains("portrait");
        const place = (element, object) => {
          if (element) element.style.transform = spriteTransform(object, portrait);
        };
        place(aiElRef.current, g.ai);
        place(playerElRef.current, g.player);
        place(puckElRef.current, g.puck);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, mode]);

  /* ================= CARD MODE ================= */
  const patch = (o) => { Object.assign(C.current, o); setCard({ ...C.current }); };
  const logEvent = (t) => setLog((l) => [...l, t].slice(-30));
  const who = (a) => (a === "player" ? nameRef.current : "AI");

  const animateSpritePath = (element, points, duration) => {
    if (!element || !playfieldRef.current) return;
    const portrait = playfieldRef.current.classList.contains("portrait");
    const frames = points.map((point) => ({ transform: spriteTransform(point, portrait) }));
    const animation = element.animate(frames, { duration, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" });
    later(() => {
      element.style.transform = spriteTransform(points[points.length - 1], portrait);
      animation.cancel();
    }, duration + 20);
  };

  const animateCardPaddles = (actor) => {
    const active = actor === "player" ? g.player : g.ai;
    const home = { x: active.x, y: active.y };
    const lunge = {
      x: actor === "player" ? Math.min(W / 2 - active.r, g.puck.x - 90) : Math.max(W / 2 + active.r, g.puck.x + 90),
      y: clamp(g.puck.y, FIELD.top + active.r, FIELD.bottom - active.r),
    };
    animateSpritePath(actor === "player" ? playerElRef.current : aiElRef.current, [home, lunge], 260);
    later(() => animateSpritePath(actor === "player" ? playerElRef.current : aiElRef.current, [lunge, home], 300), 280);
  };

  const animatePuck = (kind, actor) => {
    const puck = g.puck;
    const home = { x: W / 2, y: H / 2 };
    const scores = kind === "player-score" || kind === "ai-score";
    const target = scores
      ? { x: actor === "player" ? W - puck.r - 2 : puck.r + 2, y: clamp(puck.y, GOAL_T + puck.r, GOAL_B - puck.r) }
      : { x: actor === "player" ? W * 0.4 : W * 0.6, y: clamp(puck.y + (Math.random() - 0.5) * 70, FIELD.top + puck.r, FIELD.bottom - puck.r) };
    const path = kind === "miss"
      ? [{ x: puck.x, y: puck.y }, target, { x: puck.x, y: puck.y }]
      : [{ x: puck.x, y: puck.y }, { x: (puck.x + target.x) / 2, y: (puck.y + target.y) / 2 }, target];
    animateSpritePath(puckElRef.current, path, kind === "miss" ? 420 : 650);
    later(() => {
      puck.x = home.x; puck.y = home.y; puck.vx = 0; puck.vy = 0; puck.stuckFor = 0;
      if (puckElRef.current && playfieldRef.current) {
        puckElRef.current.style.transform = spriteTransform(home, playfieldRef.current.classList.contains("portrait"));
      }
    }, 720);
  };

  const startCardMode = () => {
    clearTimers();
    penLock.current = false;
    setPendingCard(null);
    C.current = { p: 0, a: 0, streak: 0, over: false, busy: false, turn: "player" };
    setCard({ ...C.current });
    setCardResult(null); setPen(null);
    setLog([`New card match — ${nameRef.current} vs AI. First to ${WIN_SCORE} wins.`]);
  };

  const endCardGame = (winner) => {
    patch({ over: true });
    setPendingCard(null);
    if (winner === "player") {
      setCardResult({ title: "YOU WIN! 🎉", text: `Final score ${C.current.p} - ${C.current.a}. Nice card play, ${nameRef.current}!` });
      sfx("goal");
    } else {
      setCardResult({ title: "AI WINS 🤖", text: `Final score ${C.current.p} - ${C.current.a}. Try a lower difficulty or run it back.` });
      sfx("lose");
    }
    setPen(null);
  };

  const cardScore = (scorer) => {
    const c = C.current;
    if (scorer === "player") { c.p++; c.streak = c.streak > 0 ? c.streak + 1 : 1; animatePuck("player-score", scorer); }
    else { c.a++; c.streak = c.streak < 0 ? c.streak - 1 : -1; animatePuck("ai-score", scorer); }
    restart(arenaRef.current, "shake");
    sfx("goal");
    patch({});
    if (c.p >= WIN_SCORE) endCardGame("player");
    else if (c.a >= WIN_SCORE) endCardGame("ai");
  };

  const finishTurn = (actor) => {
    if (C.current.over) { patch({ busy: false }); return; }
    const next = actor === "player" ? "ai" : "player";
    patch({ busy: next === "ai", turn: next });
    if (next === "ai") {
      later(() => {
        if (C.current.turn === "ai" && C.current.busy && !C.current.over) aiCardTurn();
      }, 900);
    }
  };

  const resolvePenalty = (initiator, shooter) => {
    const success = Math.random() < 0.5;
    setPen((current) => current ? { ...current, revealed: true, success } : current);
    later(() => {
      setPen(null);
      penLock.current = false;
      if (success) { logEvent(`${who(shooter)} scores the penalty! ⚡`); cardScore(shooter); }
      else { logEvent(`${who(shooter)} missed the penalty.`); animatePuck("miss", shooter); }
      finishTurn(initiator);
    }, 700);
  };

  const startPenalty = (initiator, shooter) => {
    penLock.current = false;
    setPen({ initiator, shooter, selected: null, revealed: false, success: null });
    if (shooter !== "player") {
      later(() => {
        setPen((current) => current ? { ...current, selected: Math.random() < 0.5 ? "red" : "blue" } : current);
        later(() => {
          if (penLock.current) return;
          penLock.current = true;
          resolvePenalty(initiator, shooter);
        }, 350);
      }, 800);
    }
  };

  const handleCardChoice = (type, actor) => {
    const c = C.current;
    const isAiTurn = actor === "ai" && c.turn === "ai";
    if ((c.busy && !isAiTurn) || c.over) return;
    if (actor === "player" && c.turn !== "player") return;
    patch({ busy: true });
    setPendingCard({ type, actor, revealed: false });
    logEvent(actor === "player" ? `${who(actor)} selected a card. Tap to reveal.` : "AI selected a card.");
    if (actor === "ai") later(() => revealSelectedCard({ type, actor, revealed: false }), 650);
  };

  const revealSelectedCard = (selectedCard = pendingCard) => {
    if (!selectedCard || selectedCard.revealed) return;
    const { type, actor } = selectedCard;
    setPendingCard({ type, actor, revealed: true });
    logEvent(`${who(actor)} reveals ${GLYPH[type]} ${CARD_TYPES[type].label}`);
    animateCardPaddles(actor);
    later(() => {
      setPendingCard(null);
      if (type === "circle") {
        logEvent(`${who(actor)} missed.`);
        animatePuck("miss", actor);
        finishTurn(actor);
      } else if (type === "triangle") {
        logEvent(`${who(actor)} scores! ⚡`);
        cardScore(actor);
        finishTurn(actor);
      } else {
        const opponent = actor === "player" ? "ai" : "player";
        startPenalty(actor, type === "star" ? actor : opponent);
      }
    }, 480);
  };

  const aiCardTurn = () => {
    if (C.current.over) return;
    const w = AI_CARD_WEIGHTS[G.current.diff] || AI_CARD_WEIGHTS.medium;
    const roll = Math.random();
    let acc = 0, pick = CARD_ORDER[CARD_ORDER.length - 1];
    for (const t of CARD_ORDER) { acc += w[t]; if (roll <= acc) { pick = t; break; } }
    handleCardChoice(pick, "ai");
  };

  const pickPenaltyCard = (color) => {
    if (!pen || pen.shooter !== "player" || pen.revealed || pen.selected !== null) return;
    setPen((current) => current ? { ...current, selected: color } : current);
  };

  const revealPenaltyCard = () => {
    if (!pen || pen.selected === null || pen.revealed || penLock.current) return;
    penLock.current = true;
    animateCardPaddles(pen.shooter);
    resolvePenalty(pen.initiator, pen.shooter);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  /* ================= NAVIGATION ================= */
  const commitName = () => {
    const v = nameInput.trim().slice(0, 16) || "Player";
    nameRef.current = v;
    setName(v);
    setScreen("menu");
  };

  const startGame = () => {
    setScreen("game");
    if (mode === "card") startCardMode(); else resetGame();
  };

  const goMenu = () => {
    clearTimers();
    g.paused = false; setCountdown(null);
    setScreen("menu");
  };

  useEffect(() => {
    const onSession = (event) => {
      if (event.detail?.gameId !== "airpuck") return;
      if (event.detail.event === "paused") g.paused = true;
      if (event.detail.event === "resumed") g.paused = false;
    };
    const onRestart = () => mode === "card" ? startCardMode() : resetGame();
    const onDifficulty = (event) => {
      if (DIFFICULTY[event.detail]) setDifficulty(event.detail);
    };
    window.addEventListener("esl-game-session", onSession);
    window.addEventListener("air-puck:main-menu", goMenu);
    window.addEventListener("air-puck:restart", onRestart);
    window.addEventListener("air-puck:set-difficulty", onDifficulty);
    return () => {
      window.removeEventListener("esl-game-session", onSession);
      window.removeEventListener("air-puck:main-menu", goMenu);
      window.removeEventListener("air-puck:restart", onRestart);
      window.removeEventListener("air-puck:set-difficulty", onDifficulty);
    };
  }, [screen, mode]);

  useEffect(() => {
    if (!onHudUpdate) return;
    if (screen !== "game") { onHudUpdate(null); return; }
    onHudUpdate({
      mode,
      name,
      playerScore: mode === "normal" ? scores.p : card.p,
      aiScore: mode === "normal" ? scores.a : card.a,
      difficulty,
      turn: card.over ? "Match over"
        : pendingCard ? "Tap to reveal"
          : pen ? pen.selected === null ? "Choose penalty" : "Tap to reveal penalty"
            : card.turn === "player" ? "Your turn" : "AI turn",
    });
  }, [onHudUpdate, screen, mode, name, scores.p, scores.a, card.p, card.a, card.turn, card.busy, card.over, pendingCard, pen, difficulty]);

  /* ================= RENDER ================= */
  const streakText = (s, you) =>
    Math.abs(s) >= 2 ? `🔥 ${s > 0 ? you : "AI IS"} ON A ${Math.abs(s)}-GOAL STREAK` : "";

  const penWinner = pen && pen.revealed ? (pen.success ? "red" : "blue") : null;

  if (!assetsReady) {
    return (
      <div className="ap asset-gate">
        <style>{CSS}</style>
        <div className="asset-loader" role={assetsFailed ? "alert" : "status"}>
          <span className="asset-loader-mark">🏒</span>
          <strong>{assetsFailed ? "ARTWORK DID NOT LOAD" : "PREPARING THE RINK"}</strong>
          {assetsFailed && <button className="btn" onClick={() => setAssetAttempt((attempt) => attempt + 1)}>RETRY</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="ap" data-screen={screen} data-mode={mode}>
      <style>{CSS}</style>

      {screen === "welcome" && (
        <button className="welcome-hitbox" type="button" aria-label="Start Air Puck" onClick={() => setScreen("name")} />
      )}

      {screen === "name" && (
        <div className="app-screen">
          <div className="app-panel">
            <h2>Who's playing?</h2>
            <p className="hint">This is shown on the scoreboard.</p>
            <input className="name-input" type="text" placeholder="Enter your name" maxLength={16}
              autoComplete="off" autoFocus value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitName()} />
            <button className="btn" onClick={commitName}>CONTINUE →</button>
          </div>
          <button className="app-back" onClick={() => setScreen("welcome")}>← BACK</button>
        </div>
      )}

      {screen === "menu" && (
        <div className="app-screen">
          <div className="app-panel">
            <h2>Welcome, <span className="welcome-name-tag">{name}</span> 👋</h2>
            <p className="hint">Choose how you want to play.</p>
            <div className="mode-select">
              <button className={"mode-card" + (mode === "normal" ? " active" : "")} onClick={() => setMode("normal")}>
                <span className="mode-icon">🏒</span>
                <span className="mode-name">NORMAL MODE</span>
                <span className="mode-desc">Real-time paddle &amp; puck action</span>
              </button>
              <button className={"mode-card" + (mode === "card" ? " active" : "")} onClick={() => setMode("card")}>
                <span className="mode-icon">🃏</span>
                <span className="mode-name">CARD MODE</span>
                <span className="mode-desc">Turn-based shots decided by cards</span>
              </button>
            </div>
            <button className="btn" onClick={startGame}>START GAME</button>
          </div>
          <button className="app-back" onClick={() => setScreen("name")}>← CHANGE NAME</button>
        </div>
      )}

      {screen === "game" && (
        <div className="game-wrapper">
          {mode === "normal" ? (
            <>
              <div className="arena-container" ref={arenaRef}>
                <div className="playfield" ref={playfieldRef}
                  onPointerMove={(e) => movePlayer(e.clientX, e.clientY)}
                  onPointerDown={(e) => { movePlayer(e.clientX, e.clientY); if (!audioCtx) sfx("hit"); }}>
                  <img ref={aiElRef} className="sprite sprite-mallet" src={ASSETS.ai} alt="AI mallet" draggable="false"
                    style={{ transform: "translate3d(89cqw,50cqh,0) translate(-50%,-50%)" }} />
                  <img ref={playerElRef} className="sprite sprite-mallet" src={ASSETS.player} alt={`${name} mallet`} draggable="false"
                    style={{ transform: "translate3d(11cqw,50cqh,0) translate(-50%,-50%)" }} />
                  <img ref={puckElRef} className="sprite sprite-puck" src={ASSETS.puck} alt="Puck" draggable="false"
                    style={{ transform: "translate3d(50cqw,50cqh,0) translate(-50%,-50%)" }} />
                </div>

                {result && (
                  <div className="message">
                    <div className="message-card">
                      <h2>{result.title}</h2>
                      <p>{result.text}</p>
                      <button className="btn" onClick={resetGame}>↻ PLAY AGAIN</button>
                    </div>
                  </div>
                )}
                {countdown && (
                  <div className="message"><div className="countdown-num">{countdown}</div></div>
                )}
              </div>
            </>
          ) : (
            <div className="card-mode-layout">
              <div className="card-board" ref={arenaRef}>
                <div className="card-board-inner">
                  <div className="playfield card-board-field" ref={playfieldRef}>
                    <div className="card-board-goal ai">AI GOAL</div>
                    <div className="card-board-goal you">YOUR GOAL</div>
                    <img ref={aiElRef} className="sprite sprite-mallet" src={ASSETS.ai} alt="AI mallet" draggable="false"
                      style={{ transform: "translate3d(74.2cqw,50cqh,0) translate(-50%,-50%)" }} />
                    <img ref={playerElRef} className="sprite sprite-mallet" src={ASSETS.player} alt={`${name} mallet`} draggable="false"
                      style={{ transform: "translate3d(25.8cqw,50cqh,0) translate(-50%,-50%)" }} />
                    <img ref={puckElRef} className="sprite sprite-puck card-puck" src={ASSETS.puck} alt="Puck" draggable="false"
                      style={{ transform: "translate3d(50cqw,50cqh,0) translate(-50%,-50%)" }} />
                  </div>
                  <div className="card-log" ref={logRef}>
                    {log.map((t, i) => <div key={i}>{t}</div>)}
                  </div>
                </div>
                {cardResult && (
                  <div className="message">
                    <div className="message-card">
                      <h2>{cardResult.title}</h2>
                      <p>{cardResult.text}</p>
                      <button className="btn" onClick={startCardMode}>↻ PLAY AGAIN</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-sidebar">
                <div className="card-status">
                  <div className="card-panel-heading">YOUR GOAL</div>
                  <div className="card-turn-indicator">
                    {card.over ? "Match over"
                      : pendingCard ? `${who(pendingCard.actor)} selected a card`
                        : pen ? pen.selected === null ? "Choose a penalty card" : "Penalty card selected"
                          : card.turn === "player" ? "Your turn — choose a card" : "AI is choosing a card…"}
                  </div>
                </div>

                {pendingCard ? (
                  <button className="pending-card" type="button" onClick={() => revealSelectedCard()} disabled={pendingCard.revealed}
                    aria-label={pendingCard.revealed ? `Revealed ${CARD_TYPES[pendingCard.type].label}` : "Tap to reveal card"}>
                    {pendingCard.revealed ? (
                      <>
                        <div className={`card-shape shape-${pendingCard.type}`} />
                        <span>{CARD_TYPES[pendingCard.type].label}</span>
                        <span className="card-desc">{CARD_TYPES[pendingCard.type].desc}</span>
                      </>
                    ) : (
                      <><span className="pending-card-back">🂠</span><span className="pending-card-reveal">TAP TO REVEAL</span></>
                    )}
                  </button>
                ) : !pen && (
                  <div className="card-hand">
                    {CARD_ORDER.map((type) => (
                      <button key={type} className="play-card"
                        disabled={card.busy || card.turn !== "player" || card.over}
                        onClick={() => handleCardChoice(type, "player")}>
                        <div className={`card-shape shape-${type}`} />
                        <div className="card-label">{CARD_TYPES[type].label}</div>
                        <div className="card-desc">{CARD_TYPES[type].desc}</div>
                      </button>
                    ))}
                  </div>
                )}

                {pen && (
                  <div className="card-penalty">
                    <p>{pen.revealed ? (pen.success ? "Penalty scored" : "Penalty missed")
                      : pen.selected === null ? `${pen.shooter === "player" ? name : "AI"} selects a penalty card`
                        : pen.shooter === "player" ? "Tap to reveal the penalty" : "AI reveals the penalty…"}</p>
                    <div className="penalty-cards">
                      {["red", "blue"].map((color) => (
                        <button key={color}
                          className={`penalty-card ${color}` + (pen.revealed ? " revealed" : "") + (penWinner === color ? " win" : "")}
                          aria-label={pen.revealed ? `${color} penalty ${penWinner === color ? (pen.success ? "scored" : "missed") : "card"}` : `Penalty card ${color}`}
                          disabled={pen.shooter !== "player" || pen.selected !== null || pen.revealed}
                          onClick={() => pickPenaltyCard(color)}>
                          {pen.revealed ? (penWinner === color ? (pen.success ? "SCORE!" : "MISS") : "—") : pen.selected === color ? "SELECTED" : "?"}
                        </button>
                      ))}
                    </div>
                    {pen.shooter === "player" && pen.selected !== null && !pen.revealed && (
                      <button className="game-shell-header-action" type="button" onClick={revealPenaltyCard}>TAP TO REVEAL</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
