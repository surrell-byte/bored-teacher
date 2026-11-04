"use client";

import { useEffect, useRef } from "react";

/* =========================================================
   DUEL OF THE VOID — React port
   Drop-in component: <DuelOfTheVoid />
   The game is contained by the shared GameShell play area.
   ========================================================= */

const CSS = `
:where(.dov) * { margin: 0; padding: 0; box-sizing: border-box; }
.dov {
  position: relative; isolation: isolate; flex: 1 1 0; min-width: 0; min-height: 0;
  width: 100%; height: 100%; overflow: hidden;
  background: #04050b url('/assets/games/duel-of-the-void/duel-of-the-void-general-bg.webp') center / cover no-repeat;
  color: #e8f2ff;
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  user-select: none; -webkit-user-select: none;
}
.dov[data-screen="splash"] {
  background-image: url('/assets/games/duel-of-the-void/duel-of-the-void-welcome-bg.webp');
}
.dov[data-screen="play"] {
  background-image: url('/assets/games/duel-of-the-void/duel-of-the-void-game-bg.webp');
}
.dov #game { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

.dov .screen {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  opacity: 0; pointer-events: none;
  transition: opacity .35s ease;
  overflow-y: auto;
  background: transparent;
}
.dov .screen.active { opacity: 1; pointer-events: auto; }
.dov[data-screen="splash"] .splash-inner { position: absolute; inset: 0; pointer-events: none; }
.dov[data-screen="splash"] .splash-inner > :not(#btn-start) { display: none; }
.dov[data-screen="splash"] #btn-start {
  position: absolute; top: 75%; left: 50%; width: 34%; height: 14%; padding: 0;
  transform: translate(-50%, -50%); border: 0; border-radius: 0; outline-offset: 4px;
  background: transparent; box-shadow: none; color: transparent; font-size: 0;
  letter-spacing: 0; pointer-events: auto; transition: none;
}
.dov[data-screen="splash"] #btn-start:hover,
.dov[data-screen="splash"] #btn-start:active { transform: translate(-50%, -50%); box-shadow: none; }

.dov .splash-inner { text-align: center; }
.dov .title {
  font-size: clamp(42px, 9vw, 104px);
  font-weight: 900; line-height: .92; letter-spacing: .02em;
  background: linear-gradient(180deg, #ffffff 0%, #9fd8ff 45%, #4be0ff 100%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 34px rgba(75,224,255,.45));
  margin-bottom: 8px;
}
.dov .title span {
  display: block; font-size: .28em; letter-spacing: .48em;
  color: #ff4d9d; -webkit-text-fill-color: #ff4d9d;
  text-indent: .48em; margin: 10px 0 6px;
  text-shadow: 0 0 24px rgba(255,77,157,.6);
}
.dov .subtitle {
  color: #7f93b5; letter-spacing: .3em; font-size: 12px;
  text-transform: uppercase; margin: 26px 0 40px;
}
.dov .hint {
  margin-top: 20px; font-size: 11px; letter-spacing: .3em;
  color: #5d6f8f; text-transform: uppercase;
  animation: dov-pulse 1.8s ease-in-out infinite;
}
@keyframes dov-pulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }

.dov .btn-big {
  font: 700 15px/1 "Segoe UI", system-ui, sans-serif;
  letter-spacing: .22em; color: #04050b;
  background: linear-gradient(180deg, #8ee9ff, #4be0ff);
  border: none; border-radius: 12px; padding: 17px 44px; cursor: pointer;
  box-shadow: 0 0 0 1px rgba(140,230,255,.4), 0 12px 34px rgba(75,224,255,.28);
  transition: transform .15s ease, box-shadow .2s ease;
}
.dov .btn-big:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px rgba(140,230,255,.7), 0 18px 44px rgba(75,224,255,.45); }
.dov .btn-big:active { transform: translateY(0); }

.dov .btn-ghost {
  font: 600 12px/1 "Segoe UI", system-ui, sans-serif;
  letter-spacing: .2em; color: #7f93b5; background: transparent;
  border: 1px solid rgba(120,180,255,.18); border-radius: 10px;
  padding: 12px 26px; margin-top: 14px; cursor: pointer;
  transition: all .18s ease;
}
.dov .btn-ghost:hover { color: #cfe6ff; border-color: rgba(120,180,255,.45); background: rgba(120,180,255,.07); }

.dov .panel {
  width: min(480px, 100%);
  background: rgba(10,16,32,.84);
  border: 1px solid rgba(120,180,255,.16);
  border-radius: 20px; padding: 36px 34px 30px;
  box-shadow: 0 34px 90px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.06);
  text-align: center;
}
.dov .panel h2 {
  font-size: 15px; letter-spacing: .34em; color: #9fc4e8;
  font-weight: 700; margin-bottom: 28px; text-transform: uppercase;
}

.dov .field { text-align: left; margin-bottom: 20px; }
.dov .field label {
  display: block; font-size: 10px; letter-spacing: .26em;
  color: #6b81a6; margin-bottom: 8px; text-transform: uppercase;
}
.dov .field input {
  width: 100%; padding: 14px 16px;
  font: 600 15px "Segoe UI", system-ui, sans-serif;
  color: #e8f2ff; background: rgba(255,255,255,.04);
  border: 1px solid rgba(120,180,255,.18); border-radius: 10px;
  outline: none; transition: all .18s ease;
  user-select: text; -webkit-user-select: text;
}
.dov .field input:focus { border-color: #4be0ff; background: rgba(75,224,255,.07); box-shadow: 0 0 0 3px rgba(75,224,255,.12); }
.dov .field:nth-of-type(2) input:focus { border-color: #ff4d9d; background: rgba(255,77,157,.07); box-shadow: 0 0 0 3px rgba(255,77,157,.12); }

.dov .menu-panel { width: min(520px, 100%); }
.dov .mode-list { display: flex; flex-direction: column; gap: 12px; }
.dov .mode-btn {
  display: flex; align-items: center; gap: 16px; text-align: left;
  padding: 18px 20px; background: rgba(255,255,255,.03);
  border: 1px solid rgba(120,180,255,.14); border-radius: 14px;
  cursor: pointer; color: inherit; transition: all .18s ease;
  position: relative; overflow: hidden;
}
.dov .mode-btn::after {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: #4be0ff; transform: scaleY(0);
  transform-origin: center; transition: transform .2s ease;
}
.dov .mode-btn:hover { background: rgba(75,224,255,.07); border-color: rgba(75,224,255,.4); transform: translateX(4px); }
.dov .mode-btn:hover::after { transform: scaleY(1); }
.dov .mode-btn[data-mode="ai"]:hover { background: rgba(255,209,102,.07); border-color: rgba(255,209,102,.4); }
.dov .mode-btn[data-mode="ai"]:hover::after { background: #ffd166; }
.dov .mode-btn[data-mode="card"]:hover { background: rgba(255,77,157,.07); border-color: rgba(255,77,157,.4); }
.dov .mode-btn[data-mode="card"]:hover::after { background: #ff4d9d; }
.dov .mode-icon { font-size: 26px; width: 34px; text-align: center; flex-shrink: 0; }
.dov .mode-text { display: flex; flex-direction: column; gap: 3px; }
.dov .mode-text b { font-size: 14px; letter-spacing: .16em; }
.dov .mode-text small { font-size: 11px; color: #7f93b5; letter-spacing: .04em; }

.dov #screen-card { padding: 20px; }
.dov .card-wrap { width: min(1000px, 100%); display: flex; flex-direction: column; gap: 18px; }
.dov .card-hud { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 18px; }
.dov .fighter { min-width: 0; }
.dov .fighter.right { text-align: right; }
.dov .fname {
  font-size: 13px; font-weight: 800; letter-spacing: .18em; margin-bottom: 7px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dov .hpbar {
  height: 14px; border-radius: 7px; background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12); overflow: hidden; position: relative;
}
.dov .hpbar i { display: block; height: 100%; width: 100%; border-radius: 6px; transition: width .5s cubic-bezier(.2,.8,.3,1); }
.dov .fighter.right .hpbar i { margin-left: auto; }
.dov .hpnum { font: 700 12px "Consolas", monospace; color: #7f93b5; margin-top: 6px; letter-spacing: .1em; }
.dov .round-badge {
  font-size: 11px; font-weight: 700; letter-spacing: .24em; color: #6b81a6;
  padding: 10px 16px; border: 1px solid rgba(120,180,255,.16); border-radius: 10px;
  white-space: nowrap; background: rgba(10,16,32,.6);
}
.dov .turn-banner { text-align: center; font-size: 13px; font-weight: 800; letter-spacing: .26em; min-height: 18px; transition: color .3s ease; }
.dov .hand { display: flex; justify-content: center; gap: clamp(8px, 1.8vw, 20px); flex-wrap: wrap; padding: 8px 0 4px; }
.dov .card {
  position: relative; width: clamp(120px, 17vw, 168px); height: clamp(172px, 24vw, 224px);
  border-radius: 16px; padding: 18px 12px 14px;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  gap: 10px; cursor: pointer; color: #e8f2ff;
  background:
    radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--c) 30%, transparent), transparent 62%),
    linear-gradient(180deg, rgba(18,26,48,.96), rgba(8,12,24,.98));
  border: 1px solid color-mix(in srgb, var(--c) 55%, transparent);
  box-shadow: 0 14px 34px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.07);
  transition: transform .18s cubic-bezier(.2,.9,.3,1.2), box-shadow .2s ease, opacity .3s ease, filter .3s ease;
  font-family: inherit;
}
.dov .card:hover:not(.used) { transform: translateY(-12px) scale(1.03); box-shadow: 0 26px 54px rgba(0,0,0,.65), 0 0 34px color-mix(in srgb, var(--c) 55%, transparent); }
.dov .card:active:not(.used) { transform: translateY(-6px) scale(1.01); }
.dov .card.used { opacity: .22; filter: grayscale(1); pointer-events: none; transform: scale(.94); }
.dov .card-icon { font-size: clamp(30px, 4vw, 42px); line-height: 1; filter: drop-shadow(0 0 14px var(--c)); }
.dov .card-name { font-size: clamp(9px, 1.05vw, 11.5px); font-weight: 800; letter-spacing: .12em; text-align: center; color: var(--c); text-shadow: 0 0 16px color-mix(in srgb, var(--c) 60%, transparent); }
.dov .card-desc { font-size: clamp(9px, 1vw, 11px); line-height: 1.4; text-align: center; color: #8ba2c4; letter-spacing: .02em; }
.dov .card-key { position: absolute; top: 8px; left: 10px; font: 700 10px "Consolas", monospace; color: #5d6f8f; border: 1px solid rgba(120,180,255,.2); border-radius: 5px; padding: 2px 5px; }
.dov .card-msg { text-align: center; font-size: 13px; font-weight: 700; letter-spacing: .12em; min-height: 20px; color: #cfe6ff; opacity: 0; transition: opacity .25s ease; }
.dov .card-msg.show { opacity: 1; }
.dov .card-quit { align-self: center; margin-top: 2px; }

.dov .card-over {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 26px;
  background: rgba(2,3,10,.88);
  opacity: 0; pointer-events: none; transition: opacity .45s ease; z-index: 20;
}
.dov .card-over.show { opacity: 1; pointer-events: auto; }
.dov .card-over h3 { font-size: clamp(28px, 5vw, 54px); font-weight: 900; letter-spacing: .04em; text-align: center; padding: 0 20px; }
.dov .card-over .row { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }

@media (max-width: 640px) {
  .dov .panel { padding: 26px 20px; }
  .dov .card-hud { gap: 8px; }
  .dov .round-badge { padding: 8px 10px; font-size: 9px; }
}

/* ---------- Card mode v2 ---------- */
.dov #screen-card {
  padding: 18px 20px;
  align-items: stretch;
  background: linear-gradient(180deg, rgba(3,4,10,.6), rgba(3,4,10,0) 24%, rgba(3,4,10,0) 48%, rgba(3,4,10,.82));
  backdrop-filter: none; -webkit-backdrop-filter: none;
}
.dov .card-wrap { height: 100%; margin: 0 auto; justify-content: space-between; gap: 0; }
.dov .card-bottom { display: flex; flex-direction: column; gap: 14px; }
.dov .round-badge small { display: block; font-size: 9px; letter-spacing: .2em; color: #4d5f80; margin-top: 4px; }
.dov .wins { display: flex; gap: 7px; margin-top: 8px; }
.dov .fighter.right .wins { justify-content: flex-end; }
.dov .pip { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,.25); }
.dov .pip.on { background: var(--c); border-color: var(--c); box-shadow: 0 0 12px var(--c); }
.dov .hand.busy { pointer-events: none; }
.dov .card.back { justify-content: center; align-items: center; }
.dov .card-num {
  font-size: clamp(44px, 7vw, 72px); font-weight: 900; line-height: 1;
  color: #cfe6ff; text-shadow: 0 0 24px rgba(126,166,216,.6);
}
.dov .card-q { font-size: 11px; letter-spacing: .3em; color: #5d6f8f; }
.dov .card.reveal { animation: dov-flipIn .38s ease-out; }
@keyframes dov-flipIn { from { transform: rotateY(90deg) scale(.9); } to { transform: rotateY(0) scale(1); } }
.dov .card-over .sub { font-size: 14px; letter-spacing: .34em; color: #9fc4e8; margin-top: -10px; text-align: center; }

/* ---------- Card mode v3 ---------- */
.dov #screen-card {
  background: linear-gradient(180deg, rgba(3,4,10,.6), rgba(3,4,10,0) 24%),
              linear-gradient(90deg, rgba(3,4,10,0) 52%, rgba(3,4,10,.82));
}
.dov .card-wrap { width: 100%; max-width: none; justify-content: flex-start; }
.dov .card-hud { width: 100%; max-width: 1000px; margin: 0 auto; }
.dov .card-bottom { width: clamp(300px, 34vw, 470px); margin: auto 0 auto auto; align-items: center; }
.dov .hand { display: grid; grid-template-columns: repeat(2, auto); justify-content: center; gap: 14px; padding: 4px 0; }
.dov .card { width: clamp(120px, 14vw, 170px); height: clamp(130px, 21vh, 210px); }
.dov .super-btn {
  font: 800 13px "Segoe UI", system-ui, sans-serif; letter-spacing: .2em;
  color: #1a1200; background: linear-gradient(180deg, #fff0a8, #ffd166);
  border: none; border-radius: 12px; padding: 14px 26px; cursor: pointer;
  box-shadow: 0 0 24px rgba(255,209,102,.55);
  animation: dov-superPulse 1.2s ease-in-out infinite;
}
.dov .super-btn:disabled {
  animation: none; box-shadow: none; cursor: default;
  background: rgba(255,255,255,.05); color: #4d5f80;
  border: 1px solid rgba(120,180,255,.14);
}
@keyframes dov-superPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }

/* ---------- Theme layer ---------- */
.dov { color: var(--text); }
.dov .screen { background: transparent; }
.dov #screen-card {
  background: linear-gradient(180deg, rgba(var(--fade),.6), rgba(var(--fade),0) 24%),
              linear-gradient(90deg, rgba(var(--fade),0) 52%, rgba(var(--fade),.82));
}
.dov .title { background: var(--title); -webkit-background-clip: text; background-clip: text; filter: drop-shadow(0 0 34px var(--title-glow)); }
.dov .title span { color: var(--p2); -webkit-text-fill-color: var(--p2); text-shadow: 0 0 24px color-mix(in srgb, var(--p2) 60%, transparent); }
.dov .subtitle { color: var(--dim); }
.dov .hint { color: var(--dim3); }
.dov .btn-big { color: var(--btn-text); background: var(--btn-bg); box-shadow: 0 0 0 1px rgba(255,255,255,.25), 0 12px 34px var(--btn-glow); }
.dov .btn-big:hover { box-shadow: 0 0 0 1px rgba(255,255,255,.4), 0 18px 44px var(--btn-glow); }
.dov .btn-ghost { color: var(--dim); border-color: var(--line); }
.dov .btn-ghost:hover { color: var(--text); border-color: var(--dim2); background: var(--surface); }
.dov .panel { background: var(--panel); border-color: var(--line); box-shadow: var(--panel-shadow); }
.dov .panel h2 { color: var(--h); }
.dov .field label { color: var(--dim2); }
.dov .field input { color: var(--text); background: var(--surface); border-color: var(--line); }
.dov .field input:focus { border-color: var(--p1); background: color-mix(in srgb, var(--p1) 8%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--p1) 14%, transparent); }
.dov .field:nth-of-type(2) input:focus { border-color: var(--p2); background: color-mix(in srgb, var(--p2) 8%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--p2) 14%, transparent); }
.dov .mode-btn { background: var(--surface); border-color: var(--line); }
.dov .mode-btn::after { background: var(--p1); }
.dov .mode-btn:hover { background: color-mix(in srgb, var(--p1) 8%, transparent); border-color: color-mix(in srgb, var(--p1) 45%, transparent); }
.dov .mode-btn[data-mode="ai"]:hover { background: color-mix(in srgb, var(--gold) 9%, transparent); border-color: color-mix(in srgb, var(--gold) 45%, transparent); }
.dov .mode-btn[data-mode="ai"]:hover::after { background: var(--gold); }
.dov .mode-btn[data-mode="card"]:hover { background: color-mix(in srgb, var(--p2) 8%, transparent); border-color: color-mix(in srgb, var(--p2) 45%, transparent); }
.dov .mode-btn[data-mode="card"]:hover::after { background: var(--p2); }
.dov .mode-text small { color: var(--dim); }
.dov .hpbar { background: var(--track); border-color: var(--trackline); }
.dov .hpnum { color: var(--dim); }
.dov .round-badge { color: var(--dim2); border-color: var(--line); background: var(--panel); }
.dov .round-badge small { color: var(--dim3); }
.dov .card {
  color: var(--text);
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--c) 30%, transparent), transparent 62%), var(--card-bg);
  box-shadow: 0 14px 34px var(--card-shadow), inset 0 1px 0 rgba(255,255,255,.07);
}
.dov .card-desc { color: var(--desc); }
.dov .card-key, .dov .card-q { color: var(--dim3); }
.dov .card-msg { color: var(--num); }
.dov .card-num { color: var(--num); text-shadow: 0 0 24px var(--num-glow); }
.dov .card-over { background: var(--over); }
.dov .card-over .sub { color: var(--h); }
.dov .pip { border-color: var(--trackline); }
.dov .super-btn:disabled { color: var(--dim3); background: var(--surface); border-color: var(--line); }

.dov .theme-row { display: flex; gap: 10px; justify-content: center; align-items: center; flex-wrap: wrap; margin-top: 22px; }
.dov .theme-dot {
  width: 26px; height: 26px; border-radius: 50%; padding: 0; cursor: pointer;
  border: 2px solid var(--line);
  background: linear-gradient(135deg, var(--a) 50%, var(--b) 50%);
  transition: transform .15s ease, box-shadow .15s ease;
}
.dov .theme-dot:hover { transform: scale(1.15); }
.dov .theme-dot.on { border-color: var(--text); box-shadow: 0 0 0 3px color-mix(in srgb, var(--text) 18%, transparent); }
.dov .theme-label { width: 100%; text-align: center; font-size: 10px; letter-spacing: .26em; color: var(--dim3); text-transform: uppercase; margin-top: 2px; }

/* ---------- Ship colour swatches + ESL mode ---------- */
.dov .swatches { display: flex; gap: 9px; margin-top: 10px; }
.dov .swatch { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; transition: transform .15s ease; }
.dov .swatch:hover { transform: scale(1.15); }
.dov .swatch.on { border-color: var(--text); box-shadow: 0 0 0 3px color-mix(in srgb, var(--text) 18%, transparent); }
.dov .swatch.taken { opacity: .35; }
.dov .esl-q {
  display: none; width: 100%; padding: 16px 18px; text-align: center;
  font-size: clamp(14px, 1.5vw, 19px); font-weight: 700; line-height: 1.4;
  color: var(--text); background: var(--panel); border: 1px solid var(--line); border-radius: 14px;
}
.dov .card.opt { height: clamp(84px, 13vh, 120px); justify-content: center; padding: 12px 10px; gap: 6px; }
.dov .opt-num { font: 800 11px "Consolas", monospace; color: var(--dim3); letter-spacing: .2em; }
.dov .opt-text { font-size: clamp(13px, 1.3vw, 17px); font-weight: 700; text-align: center; color: var(--text); line-height: 1.25; }
.dov .touch-controls { display: none; }

@media (max-width: 639px) and (orientation: portrait) {
  .dov {
    background-image: url('/assets/games/duel-of-the-void/duel-of-the-void-general-bg-phone.webp');
  }
  .dov[data-screen="splash"] {
    background-image: url('/assets/games/duel-of-the-void/duel-of-the-void-welcome-bg-phone.webp');
  }
  .dov[data-screen="play"] {
    background-image: url('/assets/games/duel-of-the-void/duel-of-the-void-game-bg-phone.webp');
  }
  .dov[data-screen="splash"] #btn-start { width: 66%; height: 12%; }
}

@media (max-width: 760px), (pointer: coarse) {
  .dov.is-playing .touch-controls {
    position: absolute; z-index: 8; right: 0; bottom: max(10px, env(safe-area-inset-bottom));
    left: 0; display: flex; align-items: flex-end; justify-content: space-between;
    gap: 8px; padding: 0 10px; pointer-events: none;
  }
  .dov .touch-group { display: grid; grid-template-columns: minmax(0, 1fr) 48px; align-items: end; gap: 6px; width: calc(50% - 4px); }
  .dov .touch-group-label { grid-column: 1 / -1; color: #fff; font-size: 9px; font-weight: 800; letter-spacing: .12em; text-shadow: 0 1px 5px #000; }
  .dov .touch-pad { display: grid; grid-template-columns: repeat(3, 34px); grid-template-rows: repeat(2, 34px); gap: 3px; justify-content: center; }
  .dov .touch-key {
    display: grid; place-items: center; min-width: 34px; min-height: 34px; padding: 0;
    border: 1px solid rgba(255,255,255,.35); border-radius: 9px; background: rgba(7,14,30,.76);
    color: #fff; font: 800 14px/1 system-ui, sans-serif; touch-action: none; pointer-events: auto;
  }
  .dov .touch-key:active, .dov .touch-key.is-down { background: color-mix(in srgb, var(--p1) 60%, #08101f); }
  .dov .touch-group--p2 .touch-key:active, .dov .touch-group--p2 .touch-key.is-down { background: color-mix(in srgb, var(--p2) 60%, #08101f); }
  .dov .touch-key[data-key="w"], .dov .touch-key[data-key="arrowup"] { grid-column: 2; grid-row: 1; }
  .dov .touch-key[data-key="a"], .dov .touch-key[data-key="arrowleft"] { grid-column: 1; grid-row: 2; }
  .dov .touch-key[data-key="s"], .dov .touch-key[data-key="arrowdown"] { grid-column: 2; grid-row: 2; }
  .dov .touch-key[data-key="d"], .dov .touch-key[data-key="arrowright"] { grid-column: 3; grid-row: 2; }
  .dov .touch-fire { min-height: 74px; border-radius: 14px; color: #07101f; background: var(--p1); font-size: 10px; font-weight: 900; letter-spacing: .08em; touch-action: none; pointer-events: auto; }
  .dov .touch-group--p2 .touch-fire { background: var(--p2); }
}
`;

/* =========================================================
   GAME ENGINE (imperative canvas + DOM driver, scoped to `root`)
   Returns a destroy() function for React cleanup.
   ========================================================= */
function createGame(root) {
  const $ = id => root.querySelector('#' + id);
  const $$ = sel => root.querySelectorAll(sel);

  let alive = true;
  let raf = 0;
  const disposers = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    disposers.push(() => target.removeEventListener(type, fn, opts));
  };

  const canvas = $('game');
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = 1;
  let stars = [];

  /* ---------------- Utils ---------------- */
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const rand = (a, b) => a + Math.random() * (b - a);
  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  function rr(x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------------- Themes ---------------- */
  const DARK_CSS = {
    '--text': '#e8f2ff', '--h': '#9fc4e8', '--dim': '#7f93b5', '--dim2': '#6b81a6', '--dim3': '#5d6f8f', '--desc': '#8ba2c4',
    '--line': 'rgba(120,180,255,.16)', '--surface': 'rgba(255,255,255,.04)', '--panel': 'rgba(10,16,32,.84)',
    '--panel-shadow': '0 34px 90px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.06)',
    '--ov1': '12,20,48', '--ov2': '3,4,10', '--fade': '3,4,10', '--p1': '#4be0ff', '--p2': '#ff4d9d',
    '--btn-bg': 'linear-gradient(180deg,#8ee9ff,#4be0ff)', '--btn-text': '#04050b', '--btn-glow': 'rgba(75,224,255,.28)',
    '--title': 'linear-gradient(180deg,#ffffff 0%,#9fd8ff 45%,#4be0ff 100%)', '--title-glow': 'rgba(75,224,255,.45)',
    '--card-bg': 'linear-gradient(180deg, rgba(18,26,48,.96), rgba(8,12,24,.98))', '--card-shadow': 'rgba(0,0,0,.55)',
    '--track': 'rgba(255,255,255,.06)', '--trackline': 'rgba(255,255,255,.12)', '--over': 'rgba(2,3,10,.78)',
    '--gold': '#ffd166', '--num': '#cfe6ff', '--num-glow': 'rgba(126,166,216,.6)', '--back': '#7ea6d8'
  };

  function mkDark(name, bg, p1, p2, star, css) {
    return {
      name, dark: true, bg, p1, p2, star,
      hull: 'rgba(8,14,28,0.95)', hullLine: 'rgba(255,255,255,0.55)',
      track: 'rgba(255,255,255,0.06)', trackLine: 'rgba(255,255,255,0.16)',
      text: '#ffffff', dim: 'rgba(255,255,255,0.55)', veil: 'rgba(2,3,10,0.55)',
      fight: '#ffe066', sup: '#ffe066',
      cards: { heavy: '#ff7a45', light: '#ffd166', heal: '#4be0ff', asteroid: '#c084fc' },
      css: Object.assign({ '--p1': p1, '--p2': p2 }, css)
    };
  }

  function mkLight(name, bg, p1, p2, ink, ov2, fade, ttl) {
    const a = n => `rgba(${ink},${n})`;
    return {
      name, dark: false, bg, p1, p2,
      star: [a(.8), a(.45)],
      hull: 'rgba(255,255,255,.96)', hullLine: a(.45),
      track: a(.08), trackLine: a(.18),
      text: `rgb(${ink})`, dim: a(.6), veil: 'rgba(255,255,255,.55)',
      fight: '#c98a00', sup: '#c98a00',
      cards: { heavy: '#e0531f', light: '#c98a00', heal: '#0b9a74', asteroid: '#8a3fd1' },
      css: {
        '--text': `rgb(${ink})`, '--h': a(.82), '--dim': a(.66), '--dim2': a(.56), '--dim3': a(.44), '--desc': a(.72),
        '--line': a(.2), '--surface': 'rgba(255,255,255,.72)', '--panel': 'rgba(255,255,255,.88)',
        '--panel-shadow': `0 24px 60px ${a(.2)}, inset 0 1px 0 rgba(255,255,255,.9)`,
        '--ov1': '255,255,255', '--ov2': ov2, '--fade': fade, '--p1': p1, '--p2': p2,
        '--btn-bg': `linear-gradient(180deg, color-mix(in srgb, ${p1} 78%, #fff), ${p1})`,
        '--btn-text': '#ffffff', '--btn-glow': `color-mix(in srgb, ${p1} 35%, transparent)`,
        '--title': ttl, '--title-glow': a(.14),
        '--card-bg': 'linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,255,255,.9))', '--card-shadow': a(.24),
        '--track': a(.08), '--trackline': a(.16), '--over': 'rgba(255,255,255,.84)',
        '--gold': '#b87a00', '--num': `rgb(${ink})`, '--num-glow': a(.25), '--back': p1
      }
    };
  }

  const THEMES = {
    void: mkDark('Void', ['#0c1330', '#070a18', '#03040a'], '#4be0ff', '#ff4d9d', ['#dff0ff', '#9fc4e8'], {}),
    nebula: mkDark('Nebula', ['#2a1457', '#150a35', '#080419'], '#7dd3fc', '#f472b6', ['#f3e8ff', '#c4b5fd'], {
      '--ov1': '44,20,92', '--ov2': '8,4,20', '--fade': '8,4,20', '--panel': 'rgba(24,12,52,.86)',
      '--btn-bg': 'linear-gradient(180deg,#c4b5fd,#8b5cf6)', '--btn-text': '#0b0420', '--btn-glow': 'rgba(139,92,246,.35)',
      '--title': 'linear-gradient(180deg,#ffffff 0%,#e0c8ff 45%,#a78bfa 100%)', '--title-glow': 'rgba(167,139,250,.5)',
      '--card-bg': 'linear-gradient(180deg, rgba(38,20,78,.96), rgba(16,8,36,.98))', '--back': '#a78bfa', '--num': '#e9ddff'
    }),
    daylight: mkLight('Daylight', ['#ffffff', '#eaf3ff', '#d3e4fa'], '#0a84c6', '#d6246e', '22,37,63', '214,230,250', '234,243,255',
      'linear-gradient(180deg,#0b2a5b 0%,#1565c0 50%,#0a9fd8 100%)'),
    peach: mkLight('Peach', ['#fffaf5', '#ffe9da', '#ffd2bd'], '#0f8b8d', '#e0452b', '59,36,24', '255,214,190', '255,238,226',
      'linear-gradient(180deg,#5a2a14 0%,#c2410c 55%,#e8590c 100%)'),
    mint: mkLight('Mint', ['#fbfffd', '#e3f8ee', '#c4ecd9'], '#00896b', '#d63384', '18,54,43', '190,236,214', '226,248,238',
      'linear-gradient(180deg,#0c3b2e 0%,#0b7a5e 55%,#12b886 100%)'),
    lavender: mkLight('Lavender', ['#fdfbff', '#efe8ff', '#dccffa'], '#6d4aff', '#e11d74', '36,26,77', '220,207,250', '240,234,255',
      'linear-gradient(180deg,#241a4d 0%,#5b3fd6 55%,#8b6cff 100%)')
  };
  const THEME_IDS = Object.keys(THEMES);
  let THEME = THEMES.void;
  let THEME_ID = 'void';

  const SHIP_COLORS = {
    cyan:   { d: '#4be0ff', l: '#0a84c6' },
    yellow: { d: '#ffd23f', l: '#c98a00' },
    pink:   { d: '#ff4d9d', l: '#d6246e' },
    green:  { d: '#4ade80', l: '#12945a' },
    orange: { d: '#ff8a3d', l: '#d9560b' },
    purple: { d: '#b388ff', l: '#7a3fe0' }
  };
  function shipCol(i) {
    const c = SHIP_COLORS[App.colors[i ? 'p2' : 'p1']];
    return THEME.dark ? c.d : c.l;
  }
  function refreshShipColors() {
    game.ships.forEach((sh, i) => { sh.color = shipCol(i); });
    if (CardGame.fighters.length) {
      CardGame.fighters.forEach((f, i) => { f.color = shipCol(i); });
      if (App.screen === 'card') renderCardUI();
    }
  }
  function buildSwatches() {
    $$('.swatches').forEach(row => {
      row.innerHTML = '';
      Object.keys(SHIP_COLORS).forEach(key => {
        const b = document.createElement('button');
        b.className = 'swatch'; b.dataset.color = key; b.title = key;
        b.addEventListener('click', () => { pickShipColor(row.dataset.player, key); b.blur(); });
        row.appendChild(b);
      });
    });
  }
  function refreshSwatches() {
    $$('.swatches').forEach(row => {
      const me = row.dataset.player, other = me === 'p1' ? 'p2' : 'p1';
      row.querySelectorAll('.swatch').forEach(b => {
        const c = SHIP_COLORS[b.dataset.color];
        b.style.background = THEME.dark ? c.d : c.l;
        b.classList.toggle('on', App.colors[me] === b.dataset.color);
        b.classList.toggle('taken', App.colors[other] === b.dataset.color);
      });
    });
  }
  function pickShipColor(player, key) {
    const other = player === 'p1' ? 'p2' : 'p1';
    if (App.colors[other] === key) App.colors[other] = App.colors[player];   // swap if taken
    App.colors[player] = key;
    try { localStorage.setItem('duelColors', JSON.stringify(App.colors)); } catch (e) {}
    refreshSwatches();
    refreshShipColors();
  }

  function applyTheme(id) {
    if (!THEMES[id]) id = 'void';
    THEME = THEMES[id]; THEME_ID = id;
    const vars = Object.assign({}, DARK_CSS, THEME.css);
    for (const k in vars) root.style.setProperty(k, vars[k]);
    try { localStorage.setItem('duelTheme', id); } catch (e) {}

    CARD_DEFS.forEach(c => { c.color = THEME.cards[c.id]; });
    refreshShipColors();
    refreshSwatches();
    $$('.theme-dot').forEach(d => d.classList.toggle('on', d.dataset.theme === id));
    $$('.theme-label').forEach(l => { l.textContent = 'THEME · ' + THEME.name + '  (T)'; });
  }

  function cycleTheme() {
    applyTheme(THEME_IDS[(THEME_IDS.indexOf(THEME_ID) + 1) % THEME_IDS.length]);
  }

  function buildThemePickers() {
    $$('.theme-row').forEach(row => {
      row.innerHTML = '';
      THEME_IDS.forEach(id => {
        const t = THEMES[id];
        const b = document.createElement('button');
        b.className = 'theme-dot'; b.dataset.theme = id; b.title = t.name;
        b.style.setProperty('--a', t.bg[1]); b.style.setProperty('--b', t.p1);
        b.addEventListener('click', () => { applyTheme(id); b.blur(); });
        row.appendChild(b);
      });
      const l = document.createElement('div'); l.className = 'theme-label'; row.appendChild(l);
    });
  }

  /* ---------------- App state ---------------- */
  const App = {
    screen: 'splash',
    mode: null,
    names: { p1: 'PLAYER 1', p2: 'PLAYER 2' },
    colors: { p1: 'cyan', p2: 'pink' }
  };

  function showScreen(name) {
    $$('.screen').forEach(el => el.classList.remove('active'));
    if (name) {
      const el = $('screen-' + name);
      if (el) el.classList.add('active');
    }
    App.screen = name;
    root.dataset.screen = name || '';
    root.classList.toggle('is-playing', name === 'play');
    clearKeys();
  }

  /* ---------------- Input ---------------- */
  const keys = {};
  const BLOCKED = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', '/']);
  function clearKeys() { for (const k in keys) keys[k] = false; }

  on(window, 'keydown', e => {
    const k = e.key.toLowerCase();
    if (BLOCKED.has(k) && !(e.target && e.target.tagName === 'INPUT')) e.preventDefault();
    keys[k] = true;
    if (k === 't' && App.screen !== 'info') cycleTheme();

    switch (App.screen) {
      case 'splash':
        if (k === 'enter' || k === ' ') goInfo();
        break;
      case 'info':
        if (k === 'enter') goMenu();
        break;
      case 'menu':
        if (k === '1') startMode('pvp');
        else if (k === '2') startMode('ai');
        else if (k === '3') startMode('card');
        else if (k === '4') startMode('esl');
        else if (k === 'escape') showScreen('info');
        break;
      case 'play':
        if (k === 'escape') {
          e.preventDefault();
          e.stopPropagation();
          quitToMenu();
        }
        else if (k === 'r' && game.state === 'over') resetShooter();
        break;
      case 'card':
        if (k === 'escape') {
          e.preventDefault();
          e.stopPropagation();
          quitToMenu();
        }
        else if (k >= '1' && k <= '4') pickCard(parseInt(k, 10) - 1);
        else if (k === 's') useSuper();
        break;
    }
  }, true);

  on(window, 'keyup', e => { keys[e.key.toLowerCase()] = false; });
  on(window, 'blur', clearKeys);

  $$('.touch-key').forEach(button => {
    const key = button.dataset.key;
    if (!key) return;
    const release = () => {
      keys[key] = false;
      button.classList.remove('is-down');
    };
    on(button, 'pointerdown', event => {
      event.preventDefault();
      keys[key] = true;
      button.classList.add('is-down');
      button.setPointerCapture(event.pointerId);
    });
    on(button, 'pointerup', release);
    on(button, 'pointercancel', release);
    on(button, 'lostpointercapture', release);
  });

  /* ---------------- Screen navigation ---------------- */
  function goInfo() {
    const p1 = $('in-p1');
    const p2 = $('in-p2');
    p1.value = App.names.p1;
    p2.value = App.names.p2;
    showScreen('info');
    setTimeout(() => { if (alive) p1.select(); }, 60);
  }

  function goMenu() {
    const p1 = ($('in-p1').value || '').trim().toUpperCase();
    const p2 = ($('in-p2').value || '').trim().toUpperCase();
    App.names.p1 = (p1 || 'PLAYER 1').slice(0, 14);
    App.names.p2 = (p2 || 'PLAYER 2').slice(0, 14);
    showScreen('menu');
  }

  function quitToMenu() {
    game.state = 'idle';
    CardGame.active = false;
    CardGame.token++;
    game.bullets = [];
    $('card-over').classList.remove('show');
    showScreen('menu');
  }

  on($('btn-start'), 'click', goInfo);
  on($('btn-info-continue'), 'click', goMenu);
  on($('btn-info-back'), 'click', () => showScreen('splash'));
  on($('btn-menu-back'), 'click', () => showScreen('info'));
  on($('card-quit'), 'click', quitToMenu);
  on(window, 'duel-of-the-void:main-menu', quitToMenu);

  $$('.mode-btn').forEach(btn => {
    on(btn, 'click', () => startMode(btn.dataset.mode));
  });

  on($('in-p1'), 'keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); goMenu(); }
  });
  on($('in-p2'), 'keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); goMenu(); }
  });

  function startMode(mode) {
    App.mode = mode;
    if (mode === 'card' || mode === 'esl') startCardGame(mode);
    else startShooter(mode);
  }

  /* =========================================================
     STARFIELD
     ========================================================= */
  function makeStars() {
    stars = [];
    const n = Math.floor((W * H) / 7000);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        z: rand(0.25, 1), r: rand(0.3, 1.5),
        tw: rand(0.6, 2.4), ph: Math.random() * Math.PI * 2
      });
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    makeStars();
    if (game.ships && game.ships.length) {
      for (const s of game.ships) {
        s.x = clamp(s.x, 40, W - 40);
        s.y = clamp(s.y, 40, H - 40);
      }
    }
  }
  on(window, 'resize', resize);
  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    disposers.push(() => resizeObserver.disconnect());
  }

  /* =========================================================
     SHOOTER  (2-player & AI)
     ========================================================= */
  const ACCEL = 1650;
  const DAMPING = 3.6;
  const MAX_SPEED = 430;
  const BULLET_SPEED = 780;
  const BULLET_DMG = 10;
  const FIRE_COOLDOWN = 0.22;
  const SHIP_R = 17;
  const MAX_HP = 100;

  const game = {
    mode: 'pvp',
    state: 'idle',
    timer: 3,
    overTimer: 0,
    winner: null,
    shake: 0,
    time: 0,
    bullets: [],
    particles: [],
    ships: []
  };

  function createShips() {
    return [
      {
        id: 0, name: App.names.p1, color: shipCol(0),
        x: W * 0.22, y: H * 0.5, vx: 0, vy: 0, angle: 0,
        hp: MAX_HP, maxHp: MAX_HP, cool: 0, thrust: 0, alive: true, r: SHIP_R,
        keys: { up: 'w', down: 's', left: 'a', right: 'd' },
        fireKeys: [' ']
      },
      {
        id: 1,
        name: game.mode === 'ai' ? (App.names.p2 + ' [AI]') : App.names.p2,
        color: shipCol(1),
        x: W * 0.78, y: H * 0.5, vx: 0, vy: 0, angle: Math.PI,
        hp: MAX_HP, maxHp: MAX_HP, cool: 0, thrust: 0, alive: true, r: SHIP_R,
        keys: { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' },
        fireKeys: ['enter', '/'],
        orbitDir: Math.random() < 0.5 ? 1 : -1,
        flipTimer: rand(1.6, 3.2)
      }
    ];
  }

  function startShooter(mode) {
    game.mode = mode;
    resetShooter();
    showScreen('play');
  }

  function resetShooter() {
    game.bullets = [];
    game.particles = [];
    game.ships = createShips();
    game.state = 'countdown';
    game.timer = 3.0;
    game.overTimer = 0;
    game.winner = null;
    game.shake = 0;
  }

  /* ---------------- Particles ---------------- */
  function spawnParticles(x, y, color, count, speed, life = 0.6, size = 3) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rand(speed * 0.25, speed);
      game.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: rand(life * 0.5, life), maxLife: life, color,
        size: rand(size * 0.5, size)
      });
    }
  }

  /* ---------------- AI brain ---------------- */
  function aiInput(ai, target) {
    ai.flipTimer -= 1 / 60;
    if (ai.flipTimer <= 0) {
      ai.orbitDir *= -1;
      ai.flipTimer = rand(1.6, 3.4);
    }

    const dx = target.x - ai.x;
    const dy = target.y - ai.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d, ny = dy / d;
    const ox = -ny * ai.orbitDir;
    const oy = nx * ai.orbitDir;

    const aimAngle = Math.atan2(ny, nx);
    let diff = ((aimAngle - ai.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const facingErr = Math.abs(diff);

    const wantToShoot = ai.cool <= 0.28 && d < 680;
    const fireNow = ai.cool <= 0 && facingErr < 0.30 && d < 760;

    let mx, my;
    if (d > 340) { mx = nx; my = ny; }
    else if (d < 195) { mx = -nx; my = -ny; }
    else { mx = ox * 0.85 + nx * 0.35; my = oy * 0.85 + ny * 0.35; }

    if (wantToShoot) {
      mx = mx * 0.30 + nx * 1.0;
      my = my * 0.30 + ny * 1.0;
    }

    mx += rand(-0.10, 0.10);
    my += rand(-0.10, 0.10);

    const len = Math.hypot(mx, my) || 1;
    return { dx: mx / len, dy: my / len, fire: fireNow };
  }

  /* ---------------- Ship update ---------------- */
  function updateShip(s, dt) {
    s.cool = Math.max(0, s.cool - dt);

    let dx = 0, dy = 0, wantsFire = false;

    if (game.mode === 'ai' && s.id === 1) {
      const inp = aiInput(s, game.ships[0]);
      dx = inp.dx; dy = inp.dy; wantsFire = inp.fire;
    } else {
      if (keys[s.keys.left]) dx -= 1;
      if (keys[s.keys.right]) dx += 1;
      if (keys[s.keys.up]) dy -= 1;
      if (keys[s.keys.down]) dy += 1;
      wantsFire = s.fireKeys.some(k => keys[k]);
    }

    const len = Math.hypot(dx, dy);

    if (len > 0.001) {
      const nx = dx / len, ny = dy / len;
      s.vx += nx * ACCEL * dt;
      s.vy += ny * ACCEL * dt;

      const target = Math.atan2(ny, nx);
      let diff = ((target - s.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      s.angle += diff * Math.min(1, dt * 13);
      s.thrust = Math.min(1, s.thrust + dt * 8);
    } else {
      s.thrust = Math.max(0, s.thrust - dt * 6);
    }

    const d = Math.exp(-DAMPING * dt);
    s.vx *= d; s.vy *= d;

    const sp = Math.hypot(s.vx, s.vy);
    if (sp > MAX_SPEED) {
      s.vx = (s.vx / sp) * MAX_SPEED;
      s.vy = (s.vy / sp) * MAX_SPEED;
    }

    s.x += s.vx * dt;
    s.y += s.vy * dt;

    const m = s.r + 3;
    if (s.x < m) { s.x = m; s.vx = Math.abs(s.vx) * 0.35; }
    if (s.x > W - m) { s.x = W - m; s.vx = -Math.abs(s.vx) * 0.35; }
    if (s.y < m) { s.y = m; s.vy = Math.abs(s.vy) * 0.35; }
    if (s.y > H - m) { s.y = H - m; s.vy = -Math.abs(s.vy) * 0.35; }

    if (game.state === 'playing' && s.cool <= 0 && wantsFire) fire(s);
  }

  function fire(s) {
    s.cool = FIRE_COOLDOWN;
    const nx = Math.cos(s.angle), ny = Math.sin(s.angle);

    game.bullets.push({
      x: s.x + nx * 24, y: s.y + ny * 24,
      vx: nx * BULLET_SPEED + s.vx * 0.35,
      vy: ny * BULLET_SPEED + s.vy * 0.35,
      owner: s.id, color: s.color, life: 2.5, r: 4
    });

    s.vx -= nx * 55;
    s.vy -= ny * 55;

    spawnParticles(s.x + nx * 26, s.y + ny * 26, s.color, 5, 220, 0.22, 2.4);
    game.shake = Math.min(game.shake + 1.6, 12);
  }

  function resolveShipCollision(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    const minD = a.r + b.r;
    if (d > 0 && d < minD) {
      const nx = dx / d, ny = dy / d;
      const push = (minD - d) / 2;
      a.x -= nx * push; a.y -= ny * push;
      b.x += nx * push; b.y += ny * push;

      const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
      const sep = rvx * nx + rvy * ny;
      if (sep < 0) {
        const imp = -sep * 0.8;
        a.vx -= nx * imp; a.vy -= ny * imp;
        b.vx += nx * imp; b.vy += ny * imp;
      }
      game.shake = Math.min(game.shake + 2, 12);
      spawnParticles((a.x + b.x) / 2, (a.y + b.y) / 2, '#ffffff', 8, 180, 0.3, 2);
    }
  }

  function hitShip(s, b) {
    s.hp -= BULLET_DMG;
    spawnParticles(b.x, b.y, s.color, 10, 260, 0.5, 2.8);
    spawnParticles(b.x, b.y, '#ffffff', 4, 180, 0.3, 2);
    game.shake = Math.min(game.shake + 5, 15);

    if (s.hp <= 0) {
      s.hp = 0;
      s.alive = false;
      explode(s);
      game.state = 'over';
      game.overTimer = 0;
      game.winner = game.ships[1 - s.id];
      game.shake = 22;
    }
  }

  function explode(s) {
    spawnParticles(s.x, s.y, s.color, 46, 520, 1.1, 4.5);
    spawnParticles(s.x, s.y, '#ffffff', 22, 340, 0.7, 3);
    spawnParticles(s.x, s.y, '#ffc24d', 26, 420, 0.9, 3.5);
  }

  /* ---------------- Update shooter ---------------- */
  function updateGame(dt) {
    game.shake *= Math.exp(-7 * dt);
    if (game.shake < 0.15) game.shake = 0;

    for (let i = game.particles.length - 1; i >= 0; i--) {
      const p = game.particles[i];
      p.life -= dt;
      if (p.life <= 0) { game.particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.exp(-2.2 * dt);
      p.vy *= Math.exp(-2.2 * dt);
    }

    if (game.state === 'countdown') {
      game.timer -= dt;
      if (game.timer <= 0) { game.state = 'playing'; game.timer = 0; }
      return;
    }
    if (game.state === 'over') { game.overTimer += dt; return; }

    for (const s of game.ships) updateShip(s, dt);
    resolveShipCollision(game.ships[0], game.ships[1]);

    for (let i = game.bullets.length - 1; i >= 0; i--) {
      const b = game.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      if (b.life <= 0 || b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30) {
        game.bullets.splice(i, 1);
        continue;
      }

      let hit = false;
      for (const s of game.ships) {
        if (!s.alive || s.id === b.owner) continue;
        if (Math.hypot(s.x - b.x, s.y - b.y) < s.r + b.r) {
          hitShip(s, b);
          hit = true;
          break;
        }
      }
      if (hit) game.bullets.splice(i, 1);
      if (game.state === 'over') break;
    }
  }

  /* ---------------- Draw shooter ---------------- */
  function drawShip(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);

    if (s.thrust > 0.04) {
      const flick = 0.7 + Math.random() * 0.5;
      const tl = (10 + 22 * s.thrust) * flick;
      const grad = ctx.createLinearGradient(-8, 0, -8 - tl, 0);
      grad.addColorStop(0, 'rgba(255,230,140,0.95)');
      grad.addColorStop(0.45, 'rgba(255,150,60,0.75)');
      grad.addColorStop(1, 'rgba(255,80,0,0)');
      ctx.beginPath();
      ctx.moveTo(-8, -6.5);
      ctx.lineTo(-8 - tl, 0);
      ctx.lineTo(-8, 6.5);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff9a3c';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.shadowBlur = 18;
    ctx.shadowColor = s.color;
    ctx.beginPath();
    ctx.moveTo(21, 0);
    ctx.lineTo(-13, -14);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-13, 14);
    ctx.closePath();
    ctx.fillStyle = THEME.hull;
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = s.color;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(3, 0, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-2, -7); ctx.lineTo(8, -4);
    ctx.moveTo(-2, 7);  ctx.lineTo(8, 4);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = THEME.hullLine;
    ctx.stroke();

    ctx.restore();
  }

  function drawBullets() {
    for (const b of game.bullets) {
      const ang = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = b.color;

      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 2.1, b.r * 0.85, ang, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.55;
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 1.1, b.r * 0.6, ang, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of game.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawBar(s, x, y, w, h, alignRight) {
    rr(x, y, w, h, h / 2);
    ctx.fillStyle = THEME.track;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = THEME.trackLine;
    ctx.stroke();

    const pct = clamp(s.hp / s.maxHp, 0, 1);
    if (pct > 0) {
      const innerW = (w - 6) * pct;
      const ix = alignRight ? (x + w - 3 - innerW) : (x + 3);
      rr(ix, y + 3, innerW, h - 6, (h - 6) / 2);
      ctx.shadowBlur = 14;
      ctx.shadowColor = s.color;
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      rr(ix, y + 3, innerW, (h - 6) / 2.2, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fill();
    }

    ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = s.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = s.color;
    ctx.textAlign = alignRight ? 'right' : 'left';
    ctx.fillText(s.name, alignRight ? x + w : x, y - 8);
    ctx.shadowBlur = 0;

    ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = THEME.dim;
    ctx.textAlign = alignRight ? 'left' : 'right';
    ctx.fillText(Math.ceil(s.hp), alignRight ? x : x + w, y - 8);
  }

  function drawHUD() {
    const pad = Math.max(20, W * 0.03);
    const bw = Math.min(360, W * 0.34);
    const bh = 16;
    const top = 30;

    drawBar(game.ships[0], pad, top, bw, bh, false);
    drawBar(game.ships[1], W - pad - bw, top, bw, bh, true);

    if (W > 760) {
      ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = THEME.trackLine;
      ctx.fillText('VS', W / 2, top + bh / 2);
    }

    if (game.state === 'countdown') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      const y = H - 44;
      if (game.mode === 'ai') {
        ctx.fillStyle = shipCol(0);
        ctx.fillText('WASD to fly  ·  SPACE to fire  ·  ESC to quit', W / 2, y);
      } else {
        ctx.fillStyle = shipCol(0);
        ctx.fillText('P1  ·  WASD to fly  ·  SPACE to fire', W / 2, y);
        ctx.fillStyle = shipCol(1);
        ctx.fillText('P2  ·  ARROWS to fly  ·  ENTER to fire', W / 2, y + 22);
      }
    }
  }

  function drawShooterOverlay() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (game.state === 'countdown') {
      const t = game.timer;
      let txt, scale, color;
      if (t > 0.6) {
        txt = String(Math.ceil(t));
        const frac = t - Math.floor(t);
        scale = 1 + 0.35 * (1 - frac);
        color = THEME.text;
      } else {
        txt = 'FIGHT!';
        scale = 1 + 0.55 * (t / 0.6);
        color = THEME.fight;
      }
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(scale, scale);
      ctx.font = 'bold 96px "Segoe UI", system-ui, sans-serif';
      ctx.shadowBlur = 40;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.92;
      ctx.fillText(txt, 0, 0);
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    if (game.state === 'over' && game.overTimer > 0.65) {
      const a = Math.min(1, (game.overTimer - 0.65) / 0.45);
      const w = game.winner;
      ctx.globalAlpha = a;
      ctx.fillStyle = THEME.veil;
      ctx.fillRect(0, 0, W, H);

      ctx.font = 'bold 62px "Segoe UI", system-ui, sans-serif';
      ctx.shadowBlur = 45;
      ctx.shadowColor = w.color;
      ctx.fillStyle = w.color;
      ctx.fillText(w.name + ' WINS', W / 2, H / 2 - 24);
      ctx.shadowBlur = 0;

      const pulse = 0.55 + 0.45 * Math.sin(game.time * 4);
      ctx.globalAlpha = a * pulse;
      ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = THEME.text;
      ctx.fillText('Press  R  to play again  ·  ESC for menu', W / 2, H / 2 + 52);
      ctx.globalAlpha = 1;
    }
  }

  /* =========================================================
     CARD MODE  (ships idle-dodge in the background; cards trigger real hits)
     ========================================================= */
  const WINS_NEEDED = 3;
  const CARD_DEFS = [
    { id: 'heavy', icon: '☄️', name: 'HEAVY ATTACK', desc: 'Deal 35% damage to your opponent',
      color: '#ff7a45', kind: 'attack', pct: 0.35, shots: 3 },
    { id: 'light', icon: '✦', name: 'LIGHT ATTACK', desc: 'Deal 25% damage to your opponent',
      color: '#ffd166', kind: 'attack', pct: 0.25, shots: 1 },
    { id: 'heal', icon: '✚', name: 'HEAL', desc: 'Recover 10% of your own health',
      color: '#4be0ff', kind: 'heal', pct: 0.10 },
    { id: 'asteroid', icon: '☄️', name: 'ASTEROID HIT', desc: 'Asteroids hit you for 20 damage',
      color: '#c084fc', kind: 'asteroid', damage: 20 }
  ];

  const CardGame = {
    active: false, fighters: [], first: 0, turn: 0, turnCount: 0,
    hand: [], picked: -1, busy: false, over: false,
    token: 0, pending: 0, dmg: 0, superShot: false, mode: 'card', q: null
  };

  const elHand = $('hand');
  const elMsg = $('card-msg');
  const elBanner = $('turn-banner');
  const elRound = $('round-num');
  const elOver = $('card-over');
  const elOverTitle = $('card-over-title');
  const elOverSub = $('card-over-sub');
  const elQ = $('esl-q');

  function later(fn, ms) {
    const t = CardGame.token;
    setTimeout(() => { if (alive && t === CardGame.token) fn(); }, ms);
  }

  function cardBounds() {
    const hud = root.querySelector('.card-hud').getBoundingClientRect();
    const bot = root.querySelector('.card-bottom').getBoundingClientRect();
    const rootBox = root.getBoundingClientRect();
    const y0 = hud.bottom - rootBox.top + 30;
    const y1 = Math.max(y0 + 110, H - 60);
    const x1 = Math.max(260, bot.left - rootBox.left - 40);
    return { y0, y1, x1 };
  }

  function placeCardShips() {
    const bd = cardBounds();
    const my = (bd.y0 + bd.y1) / 2;
    game.ships.forEach((s, i) => {
      s.x = bd.x1 * (i === 0 ? 0.2 : 0.8);
      s.y = my; s.vx = 0; s.vy = 0;
      s.angle = i === 0 ? 0 : Math.PI;
      s.alive = true; s.cool = rand(0.3, 0.8);
    });
  }

  function startCardGame(mode) {
    CardGame.mode = mode || 'card';
    CardGame.token++;
    CardGame.active = true;
    CardGame.over = false;
    CardGame.superShot = false;
    CardGame.fighters = [
      { name: App.names.p1, hp: 100, maxHp: 100, color: shipCol(0), wins: 0, superUsed: false },
      { name: App.names.p2, hp: 100, maxHp: 100, color: shipCol(1), wins: 0, superUsed: false }
    ];
    CardGame.first = 0;
    elOver.classList.remove('show');

    game.mode = 'card';
    game.state = 'idle';
    game.bullets = [];
    game.particles = [];
    game.ships = createShips();
    game.ships.forEach(sh => {
      sh.orbitDir = Math.random() < 0.5 ? 1 : -1;
      sh.flipTimer = rand(1.4, 3);
      sh.missOff = rand(0.2, 0.32) * (Math.random() < 0.5 ? 1 : -1);
    });

    showScreen('card');
    newFight();
  }

  function newFight() {
    CardGame.fighters.forEach(f => { f.hp = f.maxHp; });
    CardGame.turnCount = 0;
    CardGame.turn = CardGame.first;
    placeCardShips();
    startTurn();
  }

  function startTurn() {
    if (CardGame.mode === 'esl') {
      CardGame.q = nextQuestion();
      CardGame.hand = CardGame.q.opts.map(t => ({ text: t }));
    } else {
      CardGame.hand = shuffle(CARD_DEFS);   // fresh deck every turn
    }
    CardGame.picked = -1;
    CardGame.busy = false;
    elMsg.classList.remove('show');
    elMsg.textContent = '';
    renderCardUI();
  }

  function renderCardUI() {
    CardGame.fighters.forEach((f, i) => {
      const nameEl = $('fname-' + i);
      nameEl.textContent = f.name;
      nameEl.style.color = f.color;

      const bar = $('hpbar-' + i);
      bar.style.width = (Math.max(0, f.hp) / f.maxHp * 100) + '%';
      bar.style.background = f.color;
      bar.style.boxShadow = `0 0 16px ${f.color}`;
      $('hpnum-' + i).textContent = Math.ceil(Math.max(0, f.hp));

      let pips = '';
      for (let k = 0; k < WINS_NEEDED; k++) {
        pips += `<span class="pip${k < f.wins ? ' on' : ''}" style="--c:${f.color}"></span>`;
      }
      $('wins-' + i).innerHTML = pips;
    });
    elRound.textContent = Math.floor(CardGame.turnCount / 2) + 1;

    if (CardGame.over || CardGame.picked !== -1) {
      elBanner.textContent = '';
    } else {
      const f = CardGame.fighters[CardGame.turn];
      elBanner.textContent = f.name + (CardGame.mode === 'esl' ? '  —  ANSWER TO ATTACK' : '  —  PICK A NUMBER');
      elBanner.style.color = f.color;
      elBanner.style.textShadow = `0 0 20px ${f.color}`;
    }

    const esl = CardGame.mode === 'esl';
    elQ.style.display = esl ? 'block' : 'none';
    if (esl && CardGame.q) elQ.textContent = CardGame.q.text;

    const sb = $('super-btn');
    const cur = CardGame.fighters[CardGame.turn];
    const low = cur.hp < cur.maxHp * 0.5;
    sb.disabled = !(low && !cur.superUsed && !CardGame.busy && !CardGame.over && CardGame.picked === -1);
    sb.textContent = cur.superUsed ? 'SUPER SHOT USED' : (low ? 'SUPER SHOT [S]' : 'SUPER SHOT · LOCKED');

    renderHand();
  }

  function renderHand() {
    elHand.innerHTML = '';
    elHand.classList.toggle('busy', CardGame.busy);
    CardGame.hand.forEach((card, i) => {
      const btn = document.createElement('button');
      if (CardGame.mode === 'esl') {
        btn.className = 'card opt';
        let col = 'var(--back)';
        if (CardGame.picked !== -1) {
          if (i === CardGame.q.ans) col = goodCol();
          else if (i === CardGame.picked) col = badCol();
          else btn.classList.add('used');
        } else {
          btn.addEventListener('click', () => pickCard(i));
        }
        btn.style.setProperty('--c', col);
        btn.innerHTML = `<span class="opt-num">${i + 1}</span><span class="opt-text">${card.text}</span>`;
        elHand.appendChild(btn);
        return;
      }
      if (CardGame.picked === i) {
        btn.className = 'card reveal';
        btn.style.setProperty('--c', card.color);
        btn.innerHTML =
          `<span class="card-icon">${card.icon}</span>` +
          `<span class="card-name">${card.name}</span>` +
          `<span class="card-desc">${card.desc}</span>`;
      } else {
        btn.className = 'card back' + (CardGame.picked !== -1 ? ' used' : '');
        btn.style.setProperty('--c', 'var(--back)');
        btn.innerHTML = `<span class="card-num">${i + 1}</span><span class="card-q">? ? ?</span>`;
        btn.addEventListener('click', () => pickCard(i));
      }
      elHand.appendChild(btn);
    });
  }

  function pickCard(index) {
    if (!CardGame.active || CardGame.busy || CardGame.over) return;
    if (index < 0 || index > 3) return;
    if (CardGame.mode === 'esl') { answerQuestion(index); return; }

    CardGame.busy = true;
    CardGame.picked = index;

    const card = CardGame.hand[index];
    const me = CardGame.turn, opp = 1 - me;
    const self = CardGame.fighters[me], foe = CardGame.fighters[opp];
    let text;

    if (card.kind === 'attack') {
      text = `${foe.name} is under fire! −${Math.round(foe.maxHp * card.pct)} HP`;
      CardGame.pending = card.shots;
      CardGame.dmg = foe.maxHp * card.pct / card.shots;
      for (let k = 0; k < card.shots; k++) later(() => spawnStrike(me), 350 + k * 230);
    } else if (card.kind === 'heal') {
      const before = self.hp;
      self.hp = Math.min(self.maxHp, self.hp + self.maxHp * card.pct);
      text = `${self.name} recovers ${Math.round(self.hp - before)} HP!`;
      const sh = game.ships[me];
      spawnParticles(sh.x, sh.y, card.color, 26, 170, 0.9, 3);
      spawnParticles(sh.x, sh.y, '#ffffff', 10, 110, 0.7, 2);
      later(finishTurn, 1300);
    } else if (card.kind === 'asteroid') {
      self.hp = Math.max(0, self.hp - card.damage);
      text = `${self.name} is hit by asteroids! −${card.damage} HP`;
      const sh = game.ships[me];
      spawnParticles(sh.x, sh.y, '#9ca3af', 32, 430, 0.85, 5);
      spawnParticles(sh.x, sh.y, '#ffc24d', 20, 340, 0.7, 3.5);
      game.shake = Math.max(game.shake, 13);
      sh.vx += rand(-260, 260); sh.vy += rand(-160, 160);
      later(finishTurn, 1300);
    }

    elMsg.textContent = card.name + '  ·  ' + text;
    elMsg.style.color = card.color;
    elMsg.classList.add('show');
    renderCardUI();
  }

  const ESL_DMG = 0.25;
  const ESL_BANK = [
    ["She ___ to school every day.", "goes", "go", "going", "gone"],
    ["They ___ playing football now.", "are", "is", "am", "be"],
    ["I ___ a sandwich yesterday.", "ate", "eat", "eaten", "eating"],
    ["What is the opposite of \"hot\"?", "cold", "warm", "soft", "dry"],
    ["There ___ two cats on the sofa.", "are", "is", "am", "be"],
    ["My brother is ___ than me.", "taller", "tall", "tallest", "more tall"],
    ["The plural of \"child\" is ___.", "children", "childs", "childes", "childrens"],
    ["We usually have lunch ___ noon.", "at", "in", "on", "by"],
    ["I was born ___ July.", "in", "on", "at", "to"],
    ["Which word is a fruit?", "banana", "carrot", "potato", "onion"],
    ["He ___ his homework already.", "has finished", "have finished", "finish", "finishing"],
    ["___ you like some tea?", "Would", "Do", "Are", "Is"],
    ["This is ___ umbrella.", "an", "a", "two", "some"],
    ["She is good ___ maths.", "at", "in", "on", "for"],
    ["The past tense of \"go\" is ___.", "went", "goed", "gone", "going"],
    ["How ___ apples are there?", "many", "much", "long", "far"],
    ["I can't find ___ keys.", "my", "me", "I", "mine"],
    ["Which is a day of the week?", "Tuesday", "April", "Summer", "Morning"],
    ["The sun ___ in the east.", "rises", "rise", "rising", "risen"],
    ["What do you use to write on paper?", "a pen", "a spoon", "a shoe", "a cup"],
    ["The book is ___ the table.", "on", "in", "at", "to"],
    ["\"Happy\" means the same as ___.", "glad", "angry", "tired", "slow"],
    ["She ___ TV when I called.", "was watching", "watches", "watch", "has watch"],
    ["If it rains, we ___ at home.", "will stay", "stayed", "staying", "have stay"],
    ["Which is a vegetable?", "carrot", "apple", "grape", "lemon"],
    ["My mother is a doctor. ___ works at a hospital.", "She", "He", "It", "They"],
    ["I have ___ money.", "no", "none", "not", "nothing"],
    ["Choose the correct sentence.", "He doesn't like pizza.", "He don't like pizza.", "He not like pizza.", "He doesn't likes pizza."],
    ["The opposite of \"early\" is ___.", "late", "fast", "quick", "short"],
    ["We ___ to the beach last summer.", "went", "go", "going", "goes"],
    ["Which place sells food and groceries?", "supermarket", "library", "museum", "stadium"],
    ["She is the ___ student in the class.", "smartest", "smarter", "most smart", "smart"],
    ["How do you say 2nd?", "second", "twoth", "twice", "two"],
    ["___ is your name?", "What", "Where", "When", "Why"],
    ["I'm hungry. I want ___ eat.", "to", "for", "at", "of"],
    ["Where can you borrow books?", "a library", "a bakery", "a pharmacy", "a cinema"],
    ["They ___ never been to Japan.", "have", "has", "is", "are"],
    ["Which word is a colour?", "purple", "square", "Monday", "winter"],
    ["There isn't ___ milk in the fridge.", "any", "some", "a", "an"],
    ["He runs ___ than I do.", "faster", "fast", "fastest", "more fast"]
  ];
  let eslQueue = [];

  function nextQuestion() {
    if (!eslQueue.length) eslQueue = shuffle(ESL_BANK.map((_, i) => i));
    const [text, ...opts] = ESL_BANK[eslQueue.pop()];
    const correct = opts[0];
    const mixed = shuffle(opts);
    return { text, opts: mixed, ans: mixed.indexOf(correct) };
  }
  const goodCol = () => THEME.dark ? '#4ade80' : '#12945a';
  const badCol = () => THEME.dark ? '#ff6b6b' : '#d62d2d';

  function answerQuestion(index) {
    if (CardGame.busy || CardGame.over) return;
    CardGame.busy = true;
    CardGame.picked = index;
    const me = CardGame.turn;
    const foe = CardGame.fighters[1 - me];
    const q = CardGame.q;
    let text, col;
    if (index === q.ans) {
      col = goodCol();
      text = `CORRECT!  ·  ${foe.name} takes ${Math.round(foe.maxHp * ESL_DMG)} damage!`;
      CardGame.superShot = false;
      CardGame.pending = 2;
      CardGame.dmg = foe.maxHp * ESL_DMG / 2;
      for (let k = 0; k < 2; k++) later(() => spawnStrike(me), 350 + k * 230);
    } else {
      col = badCol();
      text = `NOT QUITE  ·  the answer was "${q.opts[q.ans]}"`;
      const sh = game.ships[me];
      spawnParticles(sh.x, sh.y, '#8899aa', 12, 140, 0.6, 2.4);
      later(finishTurn, 2200);
    }
    elMsg.textContent = text;
    elMsg.style.color = col;
    elMsg.classList.add('show');
    renderCardUI();
  }

  function useSuper() {
    if (!CardGame.active || CardGame.busy || CardGame.over || CardGame.picked !== -1) return;
    const me = CardGame.turn;
    const self = CardGame.fighters[me], foe = CardGame.fighters[1 - me];
    if (self.superUsed || self.hp >= self.maxHp * 0.5) return;
    self.superUsed = true;
    CardGame.busy = true;
    CardGame.superShot = true;
    CardGame.pending = 4;
    CardGame.dmg = foe.maxHp * 0.50 / 4;
    for (let k = 0; k < 4; k++) later(() => spawnStrike(me, true), 250 + k * 140);
    elMsg.textContent = `SUPER SHOT  ·  ${foe.name} takes ${Math.round(foe.maxHp * 0.50)} damage!`;
    elMsg.style.color = THEME.sup;
    elMsg.classList.add('show');
    renderCardUI();
  }

  function afterSuper() {
    CardGame.superShot = false;
    if (CardGame.fighters.some(f => f.hp <= 0)) { resolveKO(); return; }
    CardGame.busy = false;      // super shot is a bonus action: still this player's turn
    elMsg.classList.remove('show');
    renderCardUI();
  }

  function spawnStrike(me, big) {
    const s = game.ships[me], t = game.ships[1 - me];
    if (!s.alive || !t.alive) return;
    const a = Math.atan2(t.y - s.y, t.x - s.x);
    const nx = Math.cos(a), ny = Math.sin(a);
    s.angle = a;
    game.bullets.push({
      x: s.x + nx * 24, y: s.y + ny * 24,
      vx: nx * 900, vy: ny * 900,
      owner: me, color: big ? THEME.sup : s.color, life: 2.5, r: big ? 7 : 5, strike: true
    });
    spawnParticles(s.x + nx * 26, s.y + ny * 26, s.color, 7, 240, 0.25, 2.6);
    game.shake = Math.min(game.shake + 2, 12);
  }

  function strikeLanded(b) {
    const idx = 1 - b.owner;
    const f = CardGame.fighters[idx], sh = game.ships[idx];
    f.hp = Math.max(0, f.hp - CardGame.dmg);
    spawnParticles(b.x, b.y, sh.color, 14, 300, 0.55, 3);
    spawnParticles(b.x, b.y, '#ffffff', 6, 200, 0.3, 2);
    game.shake = Math.min(game.shake + 6, 16);
    sh.vx += b.vx * 0.15; sh.vy += b.vy * 0.15;
    renderCardUI();
    CardGame.pending--;
    if (CardGame.pending <= 0) later(CardGame.superShot ? afterSuper : finishTurn, 900);
  }

  function finishTurn() {
    if (CardGame.fighters.some(f => f.hp <= 0)) { resolveKO(); return; }
    CardGame.turnCount++;
    CardGame.turn = 1 - CardGame.turn;
    startTurn();
  }

  function resolveKO() {
    const loser = CardGame.fighters[0].hp <= 0 ? 0 : 1;
    const winner = 1 - loser;
    const wf = CardGame.fighters[winner];
    wf.wins++;

    const ls = game.ships[loser];
    ls.alive = false;
    explode(ls);
    game.shake = 18;
    CardGame.busy = true;
    renderCardUI();

    if (wf.wins >= WINS_NEEDED) {
      later(() => endCardMatch(winner), 1500);
    } else {
      elMsg.textContent = `${wf.name} SCORES!  ${CardGame.fighters[0].wins} – ${CardGame.fighters[1].wins}`;
      elMsg.style.color = wf.color;
      elMsg.classList.add('show');
      CardGame.first = loser;
      later(newFight, 2300);
    }
  }

  function endCardMatch(winnerIdx) {
    CardGame.over = true;
    const [a, b] = CardGame.fighters;
    const w = CardGame.fighters[winnerIdx];
    elBanner.textContent = '';
    elOverTitle.textContent = w.name + ' WINS';
    elOverTitle.style.color = w.color;
    elOverTitle.style.textShadow = `0 0 44px ${w.color}`;
    elOverSub.textContent = `VICTORY  ·  ${a.wins} – ${b.wins}`;
    elOver.classList.add('show');
  }

  on($('super-btn'), 'click', useSuper);
  on($('card-again'), 'click', () => startCardGame(CardGame.mode));
  on($('card-menu'), 'click', () => {
    elOver.classList.remove('show');
    quitToMenu();
  });

  /* ---------- idle ship sim: shoot & dodge, never hit ---------- */
  function updateParticles(dt) {
    for (let i = game.particles.length - 1; i >= 0; i--) {
      const p = game.particles[i];
      p.life -= dt;
      if (p.life <= 0) { game.particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= Math.exp(-2.2 * dt); p.vy *= Math.exp(-2.2 * dt);
    }
  }

  function updateCardSim(dt) {
    if (!game.ships || game.ships.length < 2) return;
    game.shake *= Math.exp(-7 * dt);
    if (game.shake < 0.15) game.shake = 0;
    updateParticles(dt);

    const bd = cardBounds();

    for (const s of game.ships) {
      if (!s.alive) continue;
      const o = game.ships[1 - s.id];
      s.cool = Math.max(0, s.cool - dt);
      s.flipTimer -= dt;
      if (s.flipTimer <= 0) {
        s.orbitDir *= -1;
        s.flipTimer = rand(1.4, 3.2);
        s.missOff = rand(0.2, 0.32) * (Math.random() < 0.5 ? 1 : -1);
      }

      const tx = o.alive ? o.x : bd.x1 / 2, ty = o.alive ? o.y : s.y;
      const dx = tx - s.x, dy = ty - s.y;
      const d = Math.hypot(dx, dy) || 1;
      const nx = dx / d, ny = dy / d;

      let mx = (d > 430 ? nx : d < 280 ? -nx : 0) + Math.cos(game.time * 0.7 + s.id) * 0.35;
      let my = Math.sin(game.time * (1.1 + s.id * 0.35) + s.id * 2.1) * 0.9;
      if (s.y < bd.y0 + 20) my = Math.abs(my) + 0.5;
      if (s.y > bd.y1 - 20) my = -Math.abs(my) - 0.5;

      // dodge incoming ambient shots (strike shots are meant to land)
      for (const b of game.bullets) {
        if (b.strike || b.owner === s.id) continue;
        const bs = Math.hypot(b.vx, b.vy) || 1;
        const bx = b.vx / bs, by = b.vy / bs;
        const rx = s.x - b.x, ry = s.y - b.y;
        const along = rx * bx + ry * by;
        const cross = rx * by - ry * bx;
        if (along > 0 && along < 300 && Math.abs(cross) < 65) {
          const sg = cross >= 0 ? 1 : -1;
          mx += by * sg * 2.4;
          my += -bx * sg * 2.4;
        }
      }

      const len = Math.hypot(mx, my);
      if (len > 1) { mx /= len; my /= len; }
      s.vx += mx * ACCEL * 0.6 * dt;
      s.vy += my * ACCEL * 0.6 * dt;
      const dmp = Math.exp(-DAMPING * dt);
      s.vx *= dmp; s.vy *= dmp;
      const sp = Math.hypot(s.vx, s.vy);
      if (sp > 320) { s.vx = s.vx / sp * 320; s.vy = s.vy / sp * 320; }
      s.x += s.vx * dt; s.y += s.vy * dt;

      const m = s.r + 3;
      if (s.x < m) { s.x = m; s.vx = Math.abs(s.vx) * 0.35; }
      if (s.x > bd.x1 - m) { s.x = bd.x1 - m; s.vx = -Math.abs(s.vx) * 0.35; }
      if (s.y < bd.y0) { s.y = bd.y0; s.vy = Math.abs(s.vy) * 0.35; }
      if (s.y > bd.y1) { s.y = bd.y1; s.vy = -Math.abs(s.vy) * 0.35; }

      s.thrust += ((sp > 40 ? 1 : 0) - s.thrust) * Math.min(1, dt * 8);

      // aim slightly off-target on purpose so idle shots miss
      const aimA = Math.atan2(dy, dx) + s.missOff;
      const diff = ((aimA - s.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      s.angle += diff * Math.min(1, dt * 8);

      if (o.alive && s.cool <= 0 && Math.abs(diff) < 0.12 && d < 760) {
        s.cool = rand(0.5, 0.95);
        const ax = Math.cos(s.angle), ay = Math.sin(s.angle);
        game.bullets.push({
          x: s.x + ax * 24, y: s.y + ay * 24,
          vx: ax * 640, vy: ay * 640,
          owner: s.id, color: s.color, life: 2.2, r: 4, ambient: true
        });
        spawnParticles(s.x + ax * 26, s.y + ay * 26, s.color, 3, 160, 0.18, 2);
      }
    }

    for (let i = game.bullets.length - 1; i >= 0; i--) {
      const b = game.bullets[i];
      if (b.strike) {
        const t = game.ships[1 - b.owner];
        const ddx = t.x - b.x, ddy = t.y - b.y;
        const dd = Math.hypot(ddx, ddy) || 1;
        const sp = Math.hypot(b.vx, b.vy) || 900;
        const k = Math.min(1, dt * 10);
        b.vx += (ddx / dd * sp - b.vx) * k;
        b.vy += (ddy / dd * sp - b.vy) * k;
        const ns = Math.hypot(b.vx, b.vy) || 1;
        b.vx = b.vx / ns * sp; b.vy = b.vy / ns * sp;
      }
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;

      if (b.strike) {
        const t = game.ships[1 - b.owner];
        if (Math.hypot(t.x - b.x, t.y - b.y) < t.r + b.r + 3 || b.life <= 0) {
          game.bullets.splice(i, 1);
          strikeLanded(b);
        }
        continue;
      }
      if (b.life <= 0 || b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30) {
        game.bullets.splice(i, 1);
      }
    }
  }

  function renderCardScene() {
    ctx.save();
    if (game.shake > 0.15) {
      ctx.translate((Math.random() - 0.5) * game.shake * 2, (Math.random() - 0.5) * game.shake * 2);
    }
    drawParticles();
    drawBullets();
    for (const sh of game.ships) if (sh.alive) drawShip(sh);
    ctx.restore();
  }

  /* =========================================================
     RENDER LOOP
     ========================================================= */
  /* ---------------- Background comets (purely decorative) ---------------- */
  const comets = [];

  function spawnComet(onScreen) {
    const ang = rand(0, Math.PI * 2);
    const sp = rand(35, 105);
    const dx = Math.cos(ang), dy = Math.sin(ang);
    let x, y;
    if (onScreen) {
      x = rand(0, W); y = rand(0, H);
    } else {
      const back = Math.max(W, H) * 0.7;
      x = W / 2 - dx * back + rand(-W * 0.4, W * 0.4);
      y = H / 2 - dy * back + rand(-H * 0.4, H * 0.4);
    }
    comets.push({
      x, y, vx: dx * sp, vy: dy * sp,
      r: rand(1.8, 3.6), tail: rand(90, 210), a: rand(0.55, 0.95)
    });
  }

  function updateComets(dt) {
    const target = clamp(Math.round((W * H) / 260000), 3, 7);
    if (comets.length === 0) { for (let i = 0; i < target; i++) spawnComet(true); }
    else if (comets.length < target && Math.random() < dt * 0.5) spawnComet(false);

    const m = 320;
    for (let i = comets.length - 1; i >= 0; i--) {
      const c = comets[i];
      c.x += c.vx * dt; c.y += c.vy * dt;
      const out = c.x < -m || c.x > W + m || c.y < -m || c.y > H + m;
      const away = (c.x - W / 2) * c.vx + (c.y - H / 2) * c.vy > 0;
      if (out && away) comets.splice(i, 1);
    }
  }

  function drawComets() {
    const col = THEME.star[0];
    ctx.fillStyle = col;
    for (const c of comets) {
      const sp = Math.hypot(c.vx, c.vy) || 1;
      const ux = c.vx / sp, uy = c.vy / sp;
      const n = 16;
      for (let i = n; i >= 1; i--) {
        const t = i / n;
        ctx.globalAlpha = (1 - t) * 0.3 * c.a;
        ctx.beginPath();
        ctx.arc(c.x - ux * c.tail * t, c.y - uy * c.tail * t, c.r * (1 - t * 0.75) * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.95 * c.a;
      ctx.shadowBlur = 14;
      ctx.shadowColor = col;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  function updateStars(dt) {
    for (const st of stars) {
      st.y += st.z * 8 * dt;
      if (st.y > H + 2) { st.y = -2; st.x = Math.random() * W; }
    }
  }

  function drawBackground() {
    ctx.clearRect(0, 0, W, H);

    for (const st of stars) {
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(game.time * st.tw + st.ph));
      ctx.globalAlpha = tw * st.z * 0.9;
      ctx.fillStyle = THEME.star[st.z > 0.75 ? 0 : 1];
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawComets();
  }

  function renderShooter() {
    ctx.save();
    if (game.shake > 0.15) {
      ctx.translate(
        (Math.random() - 0.5) * game.shake * 2,
        (Math.random() - 0.5) * game.shake * 2
      );
    }
    drawParticles();
    drawBullets();
    for (const s of game.ships) if (s.alive) drawShip(s);
    ctx.restore();

    drawHUD();
    drawShooterOverlay();
  }

  let last = performance.now();

  function loop(now) {
    if (!alive) return;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;

    game.time += dt;
    updateStars(dt);
    updateComets(dt);

    if (App.screen === 'play' && game.state !== 'idle') {
      updateGame(dt);
    }
    if (App.screen === 'card') updateCardSim(dt);

    drawBackground();
    if (App.screen === 'play' && game.state !== 'idle') {
      renderShooter();
    }
    if (App.screen === 'card') renderCardScene();

    raf = requestAnimationFrame(loop);
  }

  /* ---------------- Boot ---------------- */
  buildThemePickers();
  buildSwatches();
  try {
    const c = JSON.parse(localStorage.getItem('duelColors'));
    if (c && SHIP_COLORS[c.p1] && SHIP_COLORS[c.p2] && c.p1 !== c.p2) App.colors = c;
  } catch (e) {}
  let savedTheme = 'void';
  try { savedTheme = localStorage.getItem('duelTheme') || 'void'; } catch (e) {}
  applyTheme(savedTheme);
  elOver.classList.remove('show');
  showScreen('splash');
  resize();
  raf = requestAnimationFrame(loop);

  /* ---------------- Teardown ---------------- */
  return () => {
    alive = false;
    CardGame.token++;
    cancelAnimationFrame(raf);
    disposers.forEach(d => d());
  };
}

/* =========================================================
   REACT COMPONENT
   ========================================================= */
export default function DuelOfTheVoid() {
  const rootRef = useRef(null);

  useEffect(() => {
    const destroy = createGame(rootRef.current);
    return destroy;
  }, []);

  return (
    <div className="dov" ref={rootRef}>
      <style>{CSS}</style>

      <canvas id="game" aria-label="Space battle game field" />
      <div className="touch-controls" aria-label="Touch controls">
        <div className="touch-group touch-group--p1">
          <span className="touch-group-label">P1 MOVE</span>
          <div className="touch-pad">
            <button type="button" className="touch-key" data-key="w" aria-label="Player one thrust up">▲</button>
            <button type="button" className="touch-key" data-key="a" aria-label="Player one turn left">◀</button>
            <button type="button" className="touch-key" data-key="s" aria-label="Player one thrust down">▼</button>
            <button type="button" className="touch-key" data-key="d" aria-label="Player one turn right">▶</button>
          </div>
          <button type="button" className="touch-fire touch-key" data-key=" " aria-label="Player one fire">FIRE</button>
        </div>
        <div className="touch-group touch-group--p2">
          <span className="touch-group-label">P2 MOVE</span>
          <div className="touch-pad">
            <button type="button" className="touch-key" data-key="arrowup" aria-label="Player two thrust up">▲</button>
            <button type="button" className="touch-key" data-key="arrowleft" aria-label="Player two turn left">◀</button>
            <button type="button" className="touch-key" data-key="arrowdown" aria-label="Player two thrust down">▼</button>
            <button type="button" className="touch-key" data-key="arrowright" aria-label="Player two turn right">▶</button>
          </div>
          <button type="button" className="touch-fire touch-key" data-key="enter" aria-label="Player two fire">FIRE</button>
        </div>
      </div>

      {/* ================= SPLASH ================= */}
      <section className="screen active" id="screen-splash">
        <div className="splash-inner">
          <h1 className="title">DUEL<span>OF THE</span>VOID</h1>
          <p className="subtitle">Two ships · One void · No mercy</p>
          <button className="btn-big" id="btn-start">ENTER THE VOID</button>
          <p className="hint">click or press enter</p>
          <div className="theme-row"></div>
        </div>
      </section>

      {/* ================= USER INFO ================= */}
      <section className="screen" id="screen-info">
        <div className="panel">
          <h2>Pilot Registration</h2>
          <div className="field">
            <label htmlFor="in-p1">Pilot 1</label>
            <input id="in-p1" maxLength={14} defaultValue="PLAYER 1" autoComplete="off" spellCheck={false} />
            <div className="swatches" data-player="p1"></div>
          </div>
          <div className="field">
            <label htmlFor="in-p2">Pilot 2 / AI</label>
            <input id="in-p2" maxLength={14} defaultValue="PLAYER 2" autoComplete="off" spellCheck={false} />
            <div className="swatches" data-player="p2"></div>
          </div>
          <button className="btn-big" id="btn-info-continue">CONTINUE</button>
          <div><button className="btn-ghost" id="btn-info-back">BACK</button></div>
        </div>
      </section>

      {/* ================= MAIN MENU ================= */}
      <section className="screen" id="screen-menu">
        <div className="panel menu-panel">
          <h2>Select Mode</h2>
          <div className="mode-list">
            <button className="mode-btn" data-mode="pvp">
              <span className="mode-icon">⚔️</span>
              <span className="mode-text"><b>2 PLAYER MODE</b><small>Local duel — WASD vs Arrow keys</small></span>
            </button>
            <button className="mode-btn" data-mode="ai">
              <span className="mode-icon">🤖</span>
              <span className="mode-text"><b>AI MODE</b><small>One pilot against the machine</small></span>
            </button>
            <button className="mode-btn" data-mode="card">
              <span className="mode-icon">🃏</span>
              <span className="mode-text"><b>CARD MODE</b><small>Take turns playing fate cards</small></span>
            </button>
            <button className="mode-btn" data-mode="esl">
              <span className="mode-icon">📚</span>
              <span className="mode-text"><b>ESL MODE</b><small>Answer English questions to power your shots</small></span>
            </button>
          </div>
          <div className="theme-row"></div>
          <div><button className="btn-ghost" id="btn-menu-back">BACK</button></div>
        </div>
      </section>

      {/* ================= CARD MODE ================= */}
      <section className="screen" id="screen-card">
        <div className="card-wrap">
          <div className="card-hud">
            <div className="fighter">
              <div className="fname" id="fname-0">PLAYER 1</div>
              <div className="hpbar"><i id="hpbar-0"></i></div>
              <div className="hpnum" id="hpnum-0">100</div>
              <div className="wins" id="wins-0"></div>
            </div>
            <div className="round-badge">ROUND <span id="round-num">1</span><small>FIRST TO 3</small></div>
            <div className="fighter right">
              <div className="fname" id="fname-1">PLAYER 2</div>
              <div className="hpbar"><i id="hpbar-1"></i></div>
              <div className="hpnum" id="hpnum-1">100</div>
              <div className="wins" id="wins-1"></div>
            </div>
          </div>

          <div className="card-bottom">
            <div className="turn-banner" id="turn-banner"></div>
            <div className="esl-q" id="esl-q"></div>
            <div className="hand" id="hand"></div>
            <button className="super-btn" id="super-btn" disabled>SUPER SHOT · LOCKED</button>
            <div className="card-msg" id="card-msg"></div>
            <button className="btn-ghost card-quit" id="card-quit">QUIT (ESC)</button>
          </div>
        </div>
      </section>

      {/* Card mode game over */}
      <div className="card-over" id="card-over">
        <h3 id="card-over-title">WINNER</h3>
        <div className="sub" id="card-over-sub"></div>
        <div className="row">
          <button className="btn-big" id="card-again">PLAY AGAIN</button>
          <button className="btn-ghost" id="card-menu" style={{ marginTop: 0 }}>MAIN MENU</button>
        </div>
      </div>
    </div>
  );
}