import { useState, useEffect, useRef, useReducer } from "react";

/* ════════════════════════════════════════════════════════════════
   BLOCK FIGHT — React port
   Splash → Main menu → Adventure (platformer) / Card Duel (2P)

   Props (all optional):
     onExit()      called by the 🏠 Hub button (falls back to href="/hub")
     onComplete(r) called when Adventure is won:
                   { gameId: 'blockfight', score, accuracy, questions }
   ════════════════════════════════════════════════════════════════ */

const CSS = `
.bf-root, .bf-root * { box-sizing: border-box; user-select: none; -webkit-tap-highlight-color: transparent; }
.bf-root {
  position: relative; min-height: 0; height: 100%; width: 100%;
  background: radial-gradient(circle at 30% 20%, #1f3b73, #0a1428 70%);
  display: flex; justify-content: center; align-items: center; padding: 16px;
  font-family: system-ui, 'Segoe UI', sans-serif; color: #fff; overflow: hidden;
}
.bf-root-duel { justify-content: stretch; align-items: stretch; padding: 0; }

.bf-game-card {
  background: rgba(255,255,255,.05); backdrop-filter: blur(12px); border-radius: 28px; padding: 14px;
  border: 1px solid rgba(255,255,255,.1); box-shadow: 0 20px 60px rgba(0,0,0,.6);
}
.bf-canvas {
  display: block; margin: 0 auto; border-radius: 18px; width: 100%; height: auto; cursor: pointer;
  box-shadow: 0 10px 30px rgba(0,0,0,.6), 0 0 20px rgba(255,180,80,.15);
  image-rendering: crisp-edges; image-rendering: pixelated;
}

/* Adventure HUD */
.bf-plat { position: relative; display: inline-block; max-width: 100%; }
.bf-stats {
  position: absolute; top: 20px; left: 20px; z-index: 20; pointer-events: none;
  background: rgba(0,0,0,.55); backdrop-filter: blur(10px); padding: 8px 20px; border-radius: 999px;
  font: 600 18px system-ui, sans-serif; border: 1px solid rgba(255,255,255,.1); letter-spacing: .5px;
}
.bf-stats span { color: #ffd166; font-size: 22px; font-weight: 700; margin-left: 6px; }
.bf-tip {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); z-index: 20; pointer-events: none; white-space: nowrap;
  background: rgba(0,0,0,.5); backdrop-filter: blur(8px); padding: 6px 16px; border-radius: 999px;
  font: 12px system-ui, sans-serif; color: #ddd; border: 1px solid rgba(255,255,255,.08);
}
.bf-tip kbd, .bf-howto-box kbd {
  background: rgba(0,0,0,.6); padding: 2px 8px; border-radius: 30px; color: #ffd966; font: bold 11px monospace;
  margin: 0 4px; display: inline-block; border: 1px solid rgba(255,215,0,.3);
}
@media (max-width: 860px) {
  .bf-stats { font-size: 14px; top: 12px; left: 12px; padding: 4px 14px; }
  .bf-stats span { font-size: 18px; }
  .bf-tip { font-size: 10px; bottom: 8px; }
  .bf-tip kbd { padding: 1px 5px; font-size: 9px; }
}
.bf-pill {
  background: rgba(0,0,0,.55); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.18); border-radius: 999px;
  color: #fff; font: 700 12px system-ui, sans-serif; padding: 6px 14px; cursor: pointer; z-index: 20;
}
.bf-pill:hover { background: rgba(0,0,0,.75); }
.bf-plat-menu { position: absolute; top: 22px; left: 50%; transform: translateX(-50%); }

/* Splash + menu */
.bf-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: min(100%, 820px); min-height: min(82vh, 580px); }
.bf-mini { position: relative; width: min(100%, 420px); height: 56px; margin-bottom: 8px; }
.bf-blk { position: absolute; bottom: 0; width: 48px; height: 48px; border-radius: 6px; box-shadow: 0 6px 14px rgba(0,0,0,.4); }
.bf-blk::after { content: ''; position: absolute; top: 12px; width: 13px; height: 13px; background: #fff; border-radius: 2px; box-shadow: inset 4px 3px 0 #1a2a32; }
.bf-blk.p1 { left: 0; background: #ff77b5; animation: bf-lungeL 2.4s ease-in-out infinite; }
.bf-blk.p1::after { right: 6px; }
.bf-blk.p2 { right: 0; background: #5db8ff; animation: bf-lungeR 2.4s ease-in-out infinite 1.2s; }
.bf-blk.p2::after { left: 6px; box-shadow: inset -4px 3px 0 #1a2a32; }
.bf-spark { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); font-size: 26px; opacity: .85; animation: bf-blink 1.2s steps(2) infinite; }
@keyframes bf-lungeL { 0%,55%,100% { transform: translateX(0); } 28% { transform: translateX(min(34vw, 150px)); } }
@keyframes bf-lungeR { 0%,55%,100% { transform: translateX(0); } 28% { transform: translateX(max(-34vw, -150px)); } }
@keyframes bf-blink { 50% { opacity: .15; } }
.bf-logo {
  font-size: clamp(48px, 11vw, 104px); line-height: .92; margin: 18px 0 8px; font-weight: 900; letter-spacing: .04em;
  background: linear-gradient(180deg, #fff3bf, #ffb347 55%, #ff4d6d); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 6px 0 rgba(0,0,0,.35));
}
.bf-logo span { display: block; }
.bf-tagline { color: #a9c3ff; letter-spacing: .3em; text-transform: uppercase; font-size: 13px; margin: 0 0 30px; }
.bf-hint { color: rgba(255,255,255,.4); font-size: 12px; margin-top: 14px; }
.bf-big {
  border: 0; border-radius: 999px; padding: 14px 38px; font: 800 18px system-ui, sans-serif; cursor: pointer; color: #1a1200;
  background: linear-gradient(135deg, #ffd166, #ff9f43); box-shadow: 0 8px 24px rgba(255,159,67,.35); transition: transform .15s, box-shadow .15s;
}
.bf-big:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(255,159,67,.45); }
.bf-big:active { transform: scale(.96); }
.bf-pulse { animation: bf-pulse 1.4s ease-in-out infinite; }
@keyframes bf-pulse { 50% { transform: scale(1.06); } }
.bf-link { background: none; border: 0; color: #a9c3ff; cursor: pointer; font: 14px system-ui, sans-serif; margin-top: 18px; }
.bf-link:hover { color: #fff; }
.bf-menu-title { font-size: clamp(28px, 6vw, 44px); font-weight: 900; letter-spacing: .08em; margin: 0 0 24px; color: #ffd166; text-shadow: 0 4px 0 rgba(0,0,0,.35); }
.bf-menu-grid { display: grid; gap: 14px; width: min(100%, 460px); }
.bf-menu-btn {
  display: grid; grid-template-columns: 56px 1fr; column-gap: 14px; align-items: center; text-align: left; padding: 16px 20px;
  border-radius: 20px; color: #fff; cursor: pointer; font-family: inherit; border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06); backdrop-filter: blur(10px); transition: transform .15s, background .15s, border-color .15s;
}
.bf-menu-btn .ico { grid-row: 1 / 3; font-size: 34px; text-align: center; }
.bf-menu-btn b { font-size: 18px; }
.bf-menu-btn small { color: #a9c3ff; font-size: 13px; }
.bf-menu-btn:hover { transform: translateY(-3px); background: rgba(255,255,255,.11); border-color: rgba(255,209,102,.55); }
.bf-menu-btn:active { transform: scale(.98); }

/* How to play */
.bf-howto { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px; }
.bf-howto-box { background: linear-gradient(145deg, #172a55, #0f1c3d); border: 1px solid rgba(255,255,255,.15); border-radius: 22px; padding: 26px 28px; width: min(100%, 520px); max-height: 90vh; overflow: auto; color: #e8eeff; font: 14px/1.55 system-ui, sans-serif; }
.bf-howto-box h3 { margin: 0 0 8px; color: #ffd166; }
.bf-howto-box h4 { margin: 18px 0 6px; color: #fff; }
.bf-howto-box ul { margin: 0; padding-left: 20px; }
.bf-howto-box .bf-big { margin-top: 20px; width: 100%; }

/* Card Duel */
.bf-cardwrap { width: 100%; height: 100%; min-width: 0; min-height: 0; }
.bf-cm {
  position: relative; display: grid; grid-template-columns: minmax(220px, 25vw) minmax(0, 1fr);
  width: 100%; height: 100%; min-width: 0; min-height: 0;
  padding: 0; border: 0; border-radius: 0; box-shadow: none; background: transparent; backdrop-filter: none;
}
.bf-cm-side {
  display: flex; flex-direction: column; gap: 8px; min-width: 0; min-height: 0;
  padding: 14px; background: rgba(4, 10, 30, .24);
}
.bf-cm-arena { display: flex; min-width: 0; min-height: 0; }
.bf-root-duel .bf-cm-arena .bf-canvas {
  width: 100%; height: 100%; max-width: none; border-radius: 0; box-shadow: none; image-rendering: auto;
}
.bf-cm-status { text-align: center; margin: 0; font-size: 18px; font-weight: 700; min-height: 26px; }
.bf-cm-result { text-align: center; font-size: 14px; color: #ffd98a; min-height: 20px; }
.bf-p1c { color: #ff77b5; } .bf-p2c { color: #5db8ff; }
.bf-cm-cards {
  display: grid; flex: 1; min-height: 0; grid-template-columns: 1fr;
  grid-template-rows: repeat(4, minmax(0, 1fr)); gap: 10px;
}
.bf-cm-cards.locked { pointer-events: none; }
.bf-card { position: relative; min-height: 0; height: auto; background: none; border: 0; padding: 0; cursor: pointer; perspective: 700px; font: inherit; color: #fff; animation: bf-dealIn .35s both; }
.bf-card:nth-child(2) { animation-delay: .06s; } .bf-card:nth-child(3) { animation-delay: .12s; } .bf-card:nth-child(4) { animation-delay: .18s; }
@keyframes bf-dealIn { from { opacity: 0; transform: translateY(24px) scale(.9); } to { opacity: 1; transform: none; } }
.bf-inner { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform .5s, opacity .3s; }
.bf-card.flipped .bf-inner { transform: rotateY(180deg); }
.bf-card:not(.flipped):hover .bf-inner { transform: translateY(-8px); }
.bf-card.dim .bf-inner { opacity: .5; }
.bf-card.chosen .bf-face { box-shadow: 0 0 22px rgba(255,209,102,.8); }
.bf-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: 2px solid rgba(255,255,255,.28); padding: 6px; box-shadow: 0 8px 20px rgba(0,0,0,.4); }
.bf-back { background: repeating-linear-gradient(45deg, #3a2a7a, #3a2a7a 8px, #2b1f5c 8px, #2b1f5c 16px); }
.bf-q { font-size: 46px; font-weight: 900; color: rgba(255,255,255,.75); }
.bf-num { position: absolute; top: 6px; left: 10px; font-size: 13px; font-weight: 800; color: #ffd166; }
.bf-front { transform: rotateY(180deg); text-align: center; }
.bf-front.atk { background: linear-gradient(160deg, #ff7a45, #c0262d); }
.bf-front.safe { background: linear-gradient(160deg, #4aa3ff, #2a4f9e); }
.bf-front.bomb { background: linear-gradient(160deg, #8a4bd6, #2b1450); }
.bf-emoji { font-size: 42px; line-height: 1; }
.bf-front b { font-size: 14px; }
.bf-front small { font-size: 11px; opacity: .9; line-height: 1.25; }
.bf-over { position: absolute; inset: 0; z-index: 30; border-radius: 28px; background: rgba(5,10,25,.82); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; text-align: center; animation: bf-fade .3s both; }
@keyframes bf-fade { from { opacity: 0; } to { opacity: 1; } }
.bf-over .trophy { font-size: 64px; }
.bf-over h3 { font-size: 30px; margin: 6px 0; }
.bf-over p { color: #a9c3ff; margin: 0 0 18px; }
.bf-over .bf-link { display: block; margin: 14px auto 0; }
@media (max-width: 560px) {
  .bf-card { height: 118px; } .bf-emoji { font-size: 30px; } .bf-q { font-size: 34px; }
  .bf-front b { font-size: 11px; } .bf-front small { font-size: 9px; }
  .bf-cm-cards { gap: 8px; } .bf-cm-status { font-size: 15px; }
}
@media (max-width: 760px) {
  .bf-cm { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; }
  .bf-cm-arena { grid-row: 1; }
  .bf-cm-side { grid-row: 2; gap: 4px; padding: 8px; max-height: 38vh; }
  .bf-cm-cards { flex: 0 0 auto; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-template-rows: minmax(80px, 1fr); }
  .bf-root-duel .bf-card { height: clamp(80px, 20vh, 118px); }
  .bf-cm-status { min-height: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .bf-pulse, .bf-blk, .bf-spark, .bf-card { animation: none !important; }
}
`;

/* ═══════════════════════════ ADVENTURE (platformer) ═══════════════════════════ */

function Adventure({ onMenu, onComplete }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const menuRef = useRef(onMenu);
  const completeRef = useRef(onComplete);
  menuRef.current = onMenu;
  completeRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let gameState = "playing"; // playing | dead | win
    let scoreVal = 0;
    let reported = false;
    let cameraX = 0, targetCameraX = 0;

    const GRAVITY = 0.6, JUMP_POWER = -15, ACCEL = 0.5, FRICTION = 0.8, MAX_SPEED = 5;
    let coyoteTime = 0, jumpBuffer = 0, shake = 0;
    const keys = {};

    let player;
    let platforms = [], enemies = [], gems = [];

    const addScore = (n) => { scoreVal += n; setScore(scoreVal); };

    class Player {
      constructor() {
        this.x = 100; this.y = 200; this.w = 32; this.h = 32;
        this.vx = 0; this.vy = 0; this.onGround = false; this.facing = 1;
        this.attackTimer = 0; this.hp = 3; this.invincible = 0;
      }
      takeDamage() {
        if (this.invincible > 0) return;
        this.hp--;
        this.invincible = 60;
        shake = 12;
        if (this.hp <= 0) gameState = "dead";
      }
      update() {
        if (gameState !== "playing") return;
        if (this.invincible > 0) this.invincible--;

        if (keys.ArrowLeft) this.vx -= ACCEL;
        if (keys.ArrowRight) this.vx += ACCEL;
        this.vx *= FRICTION;
        this.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vx));

        if (this.onGround) coyoteTime = 6; else coyoteTime--;

        if (jumpBuffer > 0) jumpBuffer--;
        if (jumpBuffer > 0 && coyoteTime > 0) {
          this.vy = JUMP_POWER; jumpBuffer = 0; coyoteTime = 0;
        }

        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;
        if (this.vx !== 0) this.facing = Math.sign(this.vx);

        if (this.attackTimer > 0) this.attackTimer--;
        if (keys.KeyX && this.attackTimer === 0 && gameState === "playing") {
          this.attackTimer = 10;
          shake = 6;
        }
      }
      draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(this.x - cameraX + this.w / 2, this.y + this.h - 4, this.w * 0.7, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const flash = this.invincible > 0 && Math.floor(Date.now() / 50) % 2 === 0;
        ctx.fillStyle = flash ? "#ffffff" : "#ff77b5";
        ctx.fillRect(this.x - cameraX, this.y, this.w, this.h);

        if (this.attackTimer > 0) {
          ctx.fillStyle = "#ffcc44";
          ctx.shadowBlur = 6;
          ctx.shadowColor = "orange";
          const slashX = this.x - cameraX + (this.facing === 1 ? this.w : -24);
          ctx.fillRect(slashX, this.y + 10, 28, 8);
          ctx.fillStyle = "#ffaa33";
          ctx.fillRect(slashX + (this.facing === 1 ? 20 : -8), this.y + 8, 12, 12);
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = "#FFFFFF";
        const eyeX = this.x - cameraX + (this.facing === 1 ? 20 : 6);
        ctx.fillRect(eyeX, this.y + 8, 7, 7);
        ctx.fillStyle = "#1a2a32";
        ctx.fillRect(eyeX + 2, this.y + 10, 3, 4);
        ctx.fillStyle = "#b87c4a";
        ctx.fillRect(this.x - cameraX + 5, this.y + 25, 22, 5);
      }
      bounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
    }

    class Platform {
      constructor(x, y, w, h) { this.x = x; this.y = y; this.w = w; this.h = h; }
      draw() {
        ctx.fillStyle = "#8B5A2B";
        ctx.fillRect(this.x - cameraX, this.y, this.w, this.h);
        ctx.fillStyle = "#C98F5E";
        ctx.fillRect(this.x - cameraX + 3, this.y - 3, this.w - 6, 6);
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = "#E0AC77";
          ctx.fillRect(this.x - cameraX + 6 + i * 18, this.y + 4, 6, this.h - 6);
        }
        ctx.fillStyle = "#6F9E3F";
        ctx.fillRect(this.x - cameraX, this.y - 5, this.w, 5);
      }
      getBounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
    }

    class Enemy {
      constructor(x, y) {
        this.x = x; this.y = y; this.w = 28; this.h = 28;
        this.vx = Math.random() < 0.5 ? -1 : 1;
        this.alive = true;
      }
      update() {
        if (!this.alive) return;
        this.x += this.vx;
        if (this.x < 0 || this.x > 2000) this.vx *= -1;

        if (gameState === "playing") {
          const p = player.bounds();
          if (p.x < this.x + this.w && p.x + p.w > this.x && p.y < this.y + this.h && p.y + p.h > this.y) {
            player.takeDamage();
          }
        }

        if (player.attackTimer > 0 && this.alive && gameState === "playing") {
          const attackRange = player.facing === 1 ? 40 : -40;
          const attackLeft = player.x + (player.facing === 1 ? player.w : attackRange);
          const attackRight = player.x + (player.facing === 1 ? player.w + 30 : player.w);
          if (attackLeft < this.x + this.w && attackRight > this.x && player.y < this.y + this.h && player.y + player.h > this.y) {
            this.alive = false;
            addScore(50);
            shake = 10;
          }
        }
      }
      draw() {
        if (!this.alive) return;
        ctx.fillStyle = "#3cff5c";
        ctx.fillRect(this.x - cameraX, this.y, this.w, this.h);
        ctx.fillStyle = "#2a8c3a";
        ctx.fillRect(this.x - cameraX + 4, this.y + 6, 6, 8);
        ctx.fillRect(this.x - cameraX + 18, this.y + 6, 6, 8);
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x - cameraX + 8, this.y + 12, 4, 4);
        ctx.fillRect(this.x - cameraX + 16, this.y + 12, 4, 4);
      }
    }

    class Gem {
      constructor(x, y) {
        this.x = x; this.y = y; this.size = 12; this.collected = false;
        this.floatOffset = Math.random() * Math.PI * 2;
      }
      update() {
        if (this.collected) return;
        const p = player.bounds();
        if (p.x < this.x + this.size && p.x + p.w > this.x && p.y < this.y + this.size && p.y + p.h > this.y) {
          this.collected = true;
          addScore(10);
          shake = 4;
        }
      }
      draw(time) {
        if (this.collected) return;
        const bob = Math.sin(time * 0.008 + this.floatOffset) * 3;
        ctx.fillStyle = "#2effbc";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#b0ffd0";
        ctx.fillRect(this.x - cameraX, this.y + bob, this.size, this.size);
        ctx.fillStyle = "#FFE484";
        ctx.fillRect(this.x - cameraX + 2, this.y + bob + 2, this.size - 4, this.size - 4);
        ctx.fillStyle = "#FFB347";
        ctx.fillRect(this.x - cameraX + 4, this.y + bob + 4, 4, 4);
        ctx.shadowBlur = 0;
      }
    }

    function buildWorld() {
      player = new Player();
      platforms = [
        new Platform(0, 360, 2000, 40),
        new Platform(300, 300, 100, 20),
        new Platform(600, 250, 120, 20),
        new Platform(900, 210, 100, 20),
        new Platform(1200, 270, 140, 20),
        new Platform(1500, 230, 100, 20),
        new Platform(1700, 320, 80, 20),
      ];
      enemies = [new Enemy(500, 332), new Enemy(1000, 332), new Enemy(1400, 332), new Enemy(1750, 292)];
      gems = [
        new Gem(320, 260), new Gem(650, 210), new Gem(950, 170),
        new Gem(1300, 230), new Gem(1550, 190), new Gem(1780, 280),
      ];
    }

    function resolveCollisions() {
      if (!player) return;
      const wasOnGround = player.onGround;
      player.onGround = false;

      for (const p of platforms) {
        const b = player.bounds();
        const plat = p.getBounds();
        if (b.x < plat.x + plat.w && b.x + b.w > plat.x && b.y < plat.y + plat.h && b.y + b.h > plat.y) {
          if (player.vy >= 0 && b.y + b.h - player.vy <= plat.y) {
            player.y = plat.y - b.h;
            player.vy = 0;
            player.onGround = true;
            if (!wasOnGround && player.vy > 8) shake = 6;
          } else if (player.vy < 0 && b.y - player.vy >= plat.y + plat.h) {
            player.y = plat.y + plat.h;
            player.vy = 0;
          } else if (b.x < plat.x) {
            player.x = plat.x - b.w;
          } else if (b.x + b.w > plat.x + plat.w) {
            player.x = plat.x + plat.w;
          }
        }
      }

      if (player.x < 0) player.x = 0;
      if (player.x + player.w > 2000) player.x = 2000 - player.w;

      if (player.y + player.h > canvas.height + 100 && gameState === "playing") {
        player.takeDamage();
        if (player.hp > 0) {
          player.x = 100; player.y = 300; player.vy = 0; player.vx = 0;
        }
      }
      if (player.y < 0) player.y = 0;
    }

    function updateGame() {
      if (gameState !== "playing") return;
      player.update();
      resolveCollisions();
      for (const e of enemies) e.update();
      for (const g of gems) g.update();

      if (gems.every((g) => g.collected) && gameState === "playing") {
        gameState = "win";
        if (!reported) {
          reported = true;
          if (completeRef.current) {
            completeRef.current({ gameId: "blockfight", score: scoreVal, accuracy: 100, questions: 1 });
          }
        }
      }

      let desiredCam = player.x - canvas.width / 2;
      desiredCam = Math.max(0, Math.min(desiredCam, 2000 - canvas.width));
      targetCameraX = desiredCam;
      cameraX += (targetCameraX - cameraX) * 0.08;
    }

    function draw() {
      ctx.save();
      if (shake > 0) {
        ctx.translate(Math.random() * shake - shake / 2, Math.random() * shake - shake / 2);
        shake *= 0.9;
      }

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#83c5ff");
      grad.addColorStop(1, "#4696e5");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffffd9";
      ctx.beginPath();
      ctx.ellipse(90 - cameraX * 0.3, 55, 45, 32, 0, 0, Math.PI * 2);
      ctx.ellipse(140 - cameraX * 0.3, 45, 52, 38, 0, 0, Math.PI * 2);
      ctx.ellipse(185 - cameraX * 0.3, 60, 40, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(640 - cameraX * 0.3, 75, 58, 38, 0, 0, Math.PI * 2);
      ctx.ellipse(700 - cameraX * 0.3, 65, 50, 35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffc0";
      ctx.beginPath();
      ctx.arc(730 - cameraX * 0.2, 38, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe68f";
      ctx.beginPath();
      ctx.arc(730 - cameraX * 0.2, 38, 22, 0, Math.PI * 2);
      ctx.fill();

      for (const p of platforms) p.draw();
      for (const g of gems) g.draw(performance.now());
      for (const e of enemies) e.draw();
      player.draw();

      const remaining = gems.filter((g) => !g.collected).length;
      ctx.font = "bold 14px system-ui, monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = "#2e3820";
      ctx.fillText(`✨ ${remaining} left`, canvas.width - 88, 28);
      ctx.fillStyle = "#fff3bf";
      ctx.fillText(`✨ ${remaining} left`, canvas.width - 90, 26);

      for (let i = 0; i < player.hp; i++) {
        ctx.fillStyle = "#ff4d4d";
        ctx.fillRect(20 + i * 28, 20, 22, 22);
        ctx.fillStyle = "#ff8888";
        ctx.fillRect(23 + i * 28, 24, 16, 14);
      }

      ctx.textAlign = "center";
      if (gameState === "dead") {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff4d4d";
        ctx.font = "bold 38px system-ui, monospace";
        ctx.fillText("💀 GAME OVER 💀", canvas.width / 2, 160);
        ctx.font = "18px system-ui";
        ctx.fillStyle = "#ffaa66";
        ctx.fillText("Press [ R ] to restart  ·  [ Esc ] menu", canvas.width / 2, 230);
      }
      if (gameState === "win") {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffe066";
        ctx.font = "bold 38px system-ui, monospace";
        ctx.fillText("✨ VICTORY! ✨", canvas.width / 2, 160);
        ctx.font = "18px system-ui";
        ctx.fillStyle = "#ffdd88";
        ctx.fillText("All gems collected!", canvas.width / 2, 220);
        ctx.font = "16px system-ui";
        ctx.fillStyle = "white";
        ctx.fillText("Press R to play again  ·  Esc for menu", canvas.width / 2, 280);
      }
      ctx.restore();
    }

    function resetGame() {
      gameState = "playing";
      scoreVal = 0;
      reported = false;
      setScore(0);
      buildWorld();
      cameraX = 0; targetCameraX = 0; shake = 0; coyoteTime = 0; jumpBuffer = 0;
    }

    const onKeyDown = (e) => {
      if (e.code === "Escape") {
        if (menuRef.current) menuRef.current();
        return;
      }
      keys[e.code] = true;
      if (e.code === "Space" || e.code === "ArrowUp") jumpBuffer = 10;
      if (e.code === "KeyR") resetGame();
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyX"].includes(e.code)) e.preventDefault();
    };
    const onKeyUp = (e) => {
      keys[e.code] = false;
      if ((e.code === "Space" || e.code === "ArrowUp") && player && player.vy < -6) player.vy *= 0.5;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    buildWorld();
    let raf;
    const loop = () => {
      updateGame();
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="bf-plat">
      <div className="bf-stats">💎 GEMS: <span>{score}</span></div>
      <button className="bf-pill bf-plat-menu" onClick={onMenu}>☰ Menu</button>
      <div className="bf-game-card">
        <canvas ref={canvasRef} className="bf-canvas" width={800} height={400} />
      </div>
      <div className="bf-tip">
        🎮 <kbd>◀</kbd> <kbd>▶</kbd> move &nbsp;|&nbsp; <kbd>␣</kbd> / <kbd>▲</kbd> jump (hold for higher) &nbsp;|&nbsp; <kbd>X</kbd> slash &nbsp;|&nbsp; <kbd>R</kbd> restart &nbsp;|&nbsp; <kbd>Esc</kbd> menu
      </div>
    </div>
  );
}

/* ═══════════════════════════ CARD DUEL ═══════════════════════════ */

const W = 800, GROUND = 330, FS = 64, MAX_HP = 5;
const BASE = [150, 586];
const COL = ["#ff77b5", "#5db8ff"];
const NAMES = ["Player 1", "Player 2"];
const TYPES = {
  sword:  { emoji: "⚔️", name: "Sword Strike", desc: "Opponent loses 2 hearts", cls: "atk" },
  fire:   { emoji: "🔥", name: "Fireball", desc: "Opponent loses a heart", cls: "atk" },
  shield: { emoji: "🛡️", name: "Shield", desc: "Nothing happens", cls: "safe" },
  bomb:   { emoji: "💣", name: "Bomb", desc: "Backfires! You lose a heart", cls: "bomb" },
};
const POOL = ["sword", "fire", "shield", "bomb"];
const STARS = Array.from({ length: 45 }, (_, i) => ({ x: (i * 173) % W, y: ((i * 97) % 200) + 8, r: (i % 3) * 0.5 + 0.6 }));

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Game logic + canvas renderer. `update()` asks React to re-render. */
function createDuel(update) {
  const s = {
    hp: [MAX_HP, MAX_HP], turn: 0, phase: "pick", deck: [], round: 1, wins: [0, 0],
    picked: -1, revealAll: false, result: "", over: null, dealId: 0,
    fx: [], floaters: [], shakeUntil: 0, flashUntil: [0, 0], deadAt: [0, 0],
  };
  let timers = [];

  const later = (fn, ms) => {
    const id = setTimeout(() => { timers = timers.filter((t) => t !== id); fn(); }, ms);
    timers.push(id);
  };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  function deal() {
    s.deck = shuffle(POOL.slice());
    s.picked = -1;
    s.revealAll = false;
    s.dealId++;
  }

  function newMatch(resetWins) {
    clearTimers();
    if (resetWins) s.wins = [0, 0];
    Object.assign(s, {
      hp: [MAX_HP, MAX_HP], turn: 0, phase: "pick", round: 1, result: "", over: null,
      fx: [], floaters: [], shakeUntil: 0, flashUntil: [0, 0], deadAt: [0, 0],
    });
    deal();
    update();
  }

  function damage(idx, amount = 1) {
    const now = performance.now();
    s.hp[idx] = Math.max(0, s.hp[idx] - amount);
    s.flashUntil[idx] = now + 350;
    s.shakeUntil = now + 320;
    s.floaters.push({ x: BASE[idx] + FS / 2, y: GROUND - FS - 20, text: `−${amount} ❤`, color: "#ff5a5a", t0: now });
    if (s.hp[idx] === 0) s.deadAt[idx] = now;
    update();
  }

  function endTurn() {
    if (s.hp[0] <= 0 || s.hp[1] <= 0) {
      const w = s.hp[0] <= 0 ? 1 : 0;
      s.wins[w]++;
      s.phase = "over";
      update();
      later(() => { s.over = { w, hp: s.hp[w], round: s.round }; update(); }, 600);
      return;
    }
    s.turn = 1 - s.turn;
    if (s.turn === 0) s.round++;
    s.phase = "pick";
    deal();
    update();
  }

  function resolve(i) {
    const t = s.deck[i], me = s.turn, foe = 1 - s.turn, now = performance.now();
    later(() => { s.revealAll = true; update(); }, 350);
    let dur;
    if (t === "sword") {
      dur = 800; s.fx.push({ kind: "sword", a: me, t0: now, dur });
      later(() => damage(foe, 2), 380);
      s.result = `⚔️ Sword Strike! ${NAMES[foe]} loses 2 hearts.`;
    } else if (t === "fire") {
      dur = 850; s.fx.push({ kind: "fire", a: me, t0: now, dur });
      later(() => damage(foe), 720);
      s.result = `🔥 Fireball! ${NAMES[foe]} loses a heart.`;
    } else if (t === "shield") {
      dur = 1000; s.fx.push({ kind: "shield", a: me, t0: now, dur });
      s.floaters.push({ x: BASE[me] + FS / 2, y: GROUND - FS - 20, text: "Nothing!", color: "#9fe0ff", t0: now });
      s.result = "🛡️ Shield — nothing happens.";
    } else {
      dur = 1000; s.fx.push({ kind: "bomb", a: me, t0: now, dur });
      later(() => damage(me), 450);
      s.result = `💣 Bomb backfired! ${NAMES[me]} loses a heart.`;
    }
    update();
    later(endTurn, dur + 900);
  }

  function pick(i) {
    if (s.phase !== "pick") return;
    s.phase = "busy";
    s.picked = i;
    s.result = "";
    update();
    later(() => resolve(i), 650);
  }

  /* ---------- rendering ---------- */
  function heart(g, cx, y, sz, filled, color) {
    g.beginPath();
    g.moveTo(cx, y + sz * 0.35);
    g.bezierCurveTo(cx, y, cx - sz * 0.55, y, cx - sz * 0.55, y + sz * 0.35);
    g.bezierCurveTo(cx - sz * 0.55, y + sz * 0.65, cx - sz * 0.15, y + sz * 0.85, cx, y + sz);
    g.bezierCurveTo(cx + sz * 0.15, y + sz * 0.85, cx + sz * 0.55, y + sz * 0.65, cx + sz * 0.55, y + sz * 0.35);
    g.bezierCurveTo(cx + sz * 0.55, y, cx, y, cx, y + sz * 0.35);
    g.closePath();
    if (filled) {
      g.fillStyle = color; g.fill();
      g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.arc(cx - sz * 0.2, y + sz * 0.28, sz * 0.1, 0, 7); g.fill();
    } else {
      g.fillStyle = "rgba(0,0,0,.35)"; g.fill();
      g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 2; g.stroke();
    }
  }

  function computeOffsets(now) {
    const off = [0, 0];
    for (const e of s.fx) {
      const p = (now - e.t0) / e.dur, a = e.a, f = a === 0 ? 1 : -1, t = 1 - a;
      if (e.kind === "sword") {
        const lunge = p < 0.4 ? p / 0.4 : p < 0.55 ? 1 : Math.max(0, 1 - (p - 0.55) / 0.45);
        off[a] += f * 330 * lunge * lunge * (3 - 2 * lunge);
        if (p > 0.45 && p < 0.9) off[t] += f * 14 * Math.sin(((p - 0.45) / 0.45) * Math.PI);
      } else if (e.kind === "fire") {
        off[a] -= f * 10 * Math.sin(Math.min(p / 0.2, 1) * Math.PI);
        if (p > 0.85 && p < 0.97) off[t] += f * 12;
      }
    }
    return off;
  }

  function drawFighter(g, i, now, off) {
    const f = i === 0 ? 1 : -1;
    const dead = s.hp[i] <= 0;
    const bob = dead ? 0 : Math.sin(now / 280 + i * 2) * 2;
    const x = BASE[i] + off[i];
    let y = GROUND - FS + bob;

    g.fillStyle = "rgba(0,0,0,.3)";
    g.beginPath(); g.ellipse(x + FS / 2, GROUND + 2, FS * 0.6, 7, 0, 0, 7); g.fill();

    g.save();
    if (dead) {
      const k = Math.min(1, (now - s.deadAt[i]) / 400);
      g.translate(x + FS / 2, GROUND);
      g.rotate((-f * Math.PI / 2) * k);
      g.translate(-(x + FS / 2), -GROUND);
      y = GROUND - FS;
      g.globalAlpha = 0.75;
    }
    const flashing = now < s.flashUntil[i] && Math.floor(now / 50) % 2 === 0;
    if (s.phase !== "over" && i === s.turn) { g.shadowBlur = 20; g.shadowColor = COL[i]; }
    g.fillStyle = flashing ? "#fff" : COL[i];
    g.fillRect(x, y, FS, FS);
    g.shadowBlur = 0;
    g.fillStyle = "rgba(0,0,0,.18)";
    g.fillRect(x, y + FS - 12, FS, 12);

    const ex = x + (f > 0 ? 36 : 12);
    if (dead) {
      g.strokeStyle = "#1a2a32"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(ex, y + 14); g.lineTo(ex + 16, y + 30); g.moveTo(ex + 16, y + 14); g.lineTo(ex, y + 30); g.stroke();
    } else {
      g.fillStyle = "#fff"; g.fillRect(ex, y + 14, 16, 16);
      g.fillStyle = "#1a2a32"; g.fillRect(ex + (f > 0 ? 7 : 1), y + 17, 8, 11);
      g.fillStyle = "#7a3a52"; g.fillRect(x + 14, y + 46, 36, 5);
    }
    g.restore();

    if (s.phase !== "over" && i === s.turn && !dead) {
      g.fillStyle = COL[i]; g.font = "bold 22px system-ui"; g.textAlign = "center"; g.textBaseline = "alphabetic";
      g.fillText("▼", x + FS / 2, y - 12 + Math.sin(now / 150) * 4);
    }
  }

  function drawEffects(g, now, off) {
    for (const e of s.fx) {
      const p = (now - e.t0) / e.dur, a = e.a, f = a === 0 ? 1 : -1, t = 1 - a;
      const midY = GROUND - FS / 2;
      if (e.kind === "sword") {
        if (p > 0.33 && p < 0.65) {
          const q = (p - 0.33) / 0.32;
          const cx = BASE[a] + off[a] + (f > 0 ? FS : 0);
          g.save(); g.strokeStyle = "#ffe27a"; g.lineWidth = 9; g.lineCap = "round";
          g.shadowBlur = 14; g.shadowColor = "#ffb347"; g.globalAlpha = 1 - q * 0.6;
          g.beginPath();
          if (f > 0) g.arc(cx, midY, 46, -1.1, -1.1 + 2.2 * q);
          else g.arc(cx, midY, 46, Math.PI + 1.1, Math.PI + 1.1 - 2.2 * q, true);
          g.stroke(); g.restore();
        }
      } else if (e.kind === "fire") {
        const sx = BASE[a] + (f > 0 ? FS + 10 : -10), ex = BASE[t] + FS / 2;
        const ball = (bx, by, r, al) => {
          const gr = g.createRadialGradient(bx, by, 0, bx, by, r);
          gr.addColorStop(0, `rgba(255,255,200,${al})`); gr.addColorStop(0.5, `rgba(255,150,40,${al})`); gr.addColorStop(1, "rgba(255,60,20,0)");
          g.fillStyle = gr; g.beginPath(); g.arc(bx, by, r, 0, 7); g.fill();
        };
        if (p < 0.15) ball(sx, midY, 6 + (p / 0.15) * 12, 1);
        else if (p < 0.85) {
          const q = (p - 0.15) / 0.7;
          for (let k = 5; k >= 0; k--) {
            const qq = Math.max(0, q - k * 0.03);
            ball(sx + (ex - sx) * qq, midY - Math.sin(qq * Math.PI) * 28, 18 - k * 2, 1 - k * 0.15);
          }
        } else {
          const q = (p - 0.85) / 0.15;
          g.save(); g.strokeStyle = `rgba(255,170,60,${1 - q})`; g.lineWidth = 6;
          g.beginPath(); g.arc(ex, midY, 10 + q * 50, 0, 7); g.stroke(); g.restore();
        }
      } else if (e.kind === "shield") {
        const al = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1;
        const cx = BASE[a] + FS / 2 + off[a], r = 54 + Math.sin(now / 90) * 3;
        const gr = g.createRadialGradient(cx, midY, r * 0.3, cx, midY, r);
        gr.addColorStop(0, "rgba(120,200,255,0)"); gr.addColorStop(1, `rgba(120,200,255,${0.45 * al})`);
        g.fillStyle = gr; g.beginPath(); g.arc(cx, midY, r, 0, 7); g.fill();
        g.strokeStyle = `rgba(159,224,255,${al})`; g.lineWidth = 3; g.stroke();
      } else if (e.kind === "bomb") {
        const cx = BASE[a] + FS / 2 + off[a];
        g.textAlign = "center"; g.textBaseline = "middle";
        if (p < 0.45) {
          const by = -60 + (GROUND - FS - 24 + 60) * (p / 0.45) * (p / 0.45);
          g.font = "36px serif"; g.fillText("💣", cx, by);
        } else {
          const q = (p - 0.45) / 0.55, r = q * 90;
          const gr = g.createRadialGradient(cx, midY, 0, cx, midY, Math.max(r, 1));
          gr.addColorStop(0, `rgba(255,240,150,${1 - q})`); gr.addColorStop(0.6, `rgba(255,120,30,${(1 - q) * 0.9})`); gr.addColorStop(1, "rgba(120,30,10,0)");
          g.fillStyle = gr; g.beginPath(); g.arc(cx, midY, r, 0, 7); g.fill();
          g.globalAlpha = 1 - q; g.font = "44px serif"; g.fillText("💥", cx, midY); g.globalAlpha = 1;
        }
      }
    }
  }

  function draw(g, now) {
    s.fx = s.fx.filter((e) => now - e.t0 < e.dur);
    g.save();
    if (now < s.shakeUntil) g.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);

    const sky = g.createLinearGradient(0, 0, 0, 400);
    sky.addColorStop(0, "#0b1230"); sky.addColorStop(1, "#2a3a7a");
    g.fillStyle = sky; g.fillRect(-10, -10, 820, 420);
    g.fillStyle = "#fff";
    STARS.forEach((st, k) => {
      g.globalAlpha = 0.5 + 0.5 * Math.sin(now / 600 + k);
      g.beginPath(); g.arc(st.x, st.y, st.r, 0, 7); g.fill();
    });
    g.globalAlpha = 1;
    g.fillStyle = "#ffffc0"; g.beginPath(); g.arc(400, 70, 26, 0, 7); g.fill();
    g.fillStyle = "#0b1230"; g.beginPath(); g.arc(412, 64, 24, 0, 7); g.fill();

    g.fillStyle = "rgba(255,255,255,.07)"; g.font = "bold 120px system-ui"; g.textAlign = "center"; g.textBaseline = "alphabetic";
    g.fillText("VS", 400, 250);

    g.fillStyle = "#8B5A2B"; g.fillRect(-10, GROUND, 820, 80);
    g.fillStyle = "#6F9E3F"; g.fillRect(-10, GROUND, 820, 8);

    const off = computeOffsets(now);
    drawFighter(g, 0, now, off); drawFighter(g, 1, now, off);
    drawEffects(g, now, off);

    g.textBaseline = "alphabetic";
    for (let i = 0; i < 2; i++) {
      g.font = "bold 16px system-ui"; g.fillStyle = COL[i]; g.textAlign = i ? "right" : "left";
      g.fillText(NAMES[i].toUpperCase(), i ? W - 16 : 16, 28);
      for (let h = 0; h < MAX_HP; h++) heart(g, i ? W - 30 - h * 32 : 30 + h * 32, 38, 24, h < s.hp[i], "#ff4d6d");
    }

    s.floaters = s.floaters.filter((fl) => now - fl.t0 < 900);
    for (const fl of s.floaters) {
      const q = (now - fl.t0) / 900;
      g.globalAlpha = 1 - q * q; g.fillStyle = fl.color; g.font = "bold 26px system-ui"; g.textAlign = "center";
      g.fillText(fl.text, fl.x, fl.y - q * 44);
    }
    g.globalAlpha = 1;
    g.restore();
  }

  return { s, pick, newMatch, draw, dispose: clearTimers };
}

function CardDuel({ onMenu, onHudUpdate }) {
  const [, force] = useReducer((x) => x + 1, 0);
  const canvasRef = useRef(null);
  const duelRef = useRef(null);
  if (!duelRef.current) duelRef.current = createDuel(force);
  const menuRef = useRef(onMenu);
  menuRef.current = onMenu;
  const d = duelRef.current;
  const s = d.s;

  useEffect(() => {
    const g = canvasRef.current.getContext("2d");
    d.newMatch(true);
    let raf;
    const loop = () => { d.draw(g, performance.now()); raf = requestAnimationFrame(loop); };
    loop();
    const restart = () => d.newMatch(false);
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (menuRef.current) menuRef.current();
        return;
      }
      if (d.s.phase === "pick" && /^[1-4]$/.test(e.key)) d.pick(+e.key - 1);
    };
    window.addEventListener("block-fight:restart-duel", restart);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      d.dispose();
      window.removeEventListener("block-fight:restart-duel", restart);
      window.removeEventListener("keydown", onKey);
      onHudUpdate?.(null);
    };
  }, [d, onHudUpdate]);

  const playerOneWins = s.wins[0];
  const playerTwoWins = s.wins[1];
  useEffect(() => {
    onHudUpdate?.({ round: s.round, wins: [playerOneWins, playerTwoWins] });
  }, [onHudUpdate, s.round, playerOneWins, playerTwoWins]);

  const t = s.turn;
  return (
    <div className="bf-cardwrap">
      <div className="bf-game-card bf-cm">
        <div className="bf-cm-side">
          <div className="bf-cm-status">
            {s.phase === "pick" && <><span className={`bf-p${t + 1}c`}>{NAMES[t]}</span> — pick a card</>}
            {s.phase === "busy" && <><span className={`bf-p${t + 1}c`}>{NAMES[t]}</span> picked card {s.picked + 1}…</>}
          </div>
          <div className="bf-cm-result" aria-live="polite">{s.result}</div>
          <div className={`bf-cm-cards${s.phase !== "pick" ? " locked" : ""}`}>
            {s.deck.map((type, i) => {
              const T = TYPES[type];
              const chosen = s.picked === i;
              const flipped = chosen || (s.revealAll && s.picked >= 0);
              const cls = ["bf-card", flipped ? "flipped" : "", chosen ? "chosen" : "", flipped && !chosen ? "dim" : ""].join(" ");
              return (
                <button key={`${s.dealId}-${i}`} type="button" className={cls} aria-label={`Card ${i + 1}`} onClick={() => d.pick(i)}>
                  <div className="bf-inner">
                    <div className="bf-face bf-back"><span className="bf-num">{i + 1}</span><span className="bf-q">?</span></div>
                    <div className={`bf-face bf-front ${T.cls}`}>
                      <span className="bf-emoji">{T.emoji}</span><b>{T.name}</b><small>{T.desc}</small>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bf-cm-arena">
          <canvas ref={canvasRef} className="bf-canvas" width={800} height={400} />
        </div>

        {s.over && (
          <div className="bf-over">
            <div>
              <div className="trophy">🏆</div>
              <h3><span className={`bf-p${s.over.w + 1}c`}>{NAMES[s.over.w]}</span> wins!</h3>
              <p>
                with {s.over.hp} heart{s.over.hp === 1 ? "" : "s"} left after {s.over.round} round{s.over.round === 1 ? "" : "s"}
              </p>
              <button className="bf-big" onClick={() => d.newMatch(false)}>↻ Rematch</button>
              <button className="bf-link" onClick={onMenu}>Main menu</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════ SCREENS ═══════════════════════════ */

function HowTo({ onClose }) {
  return (
    <div className="bf-howto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bf-howto-box">
        <h3>🗡️ Adventure</h3>
        <ul>
          <li><kbd>◀</kbd> <kbd>▶</kbd> move · <kbd>␣</kbd> / <kbd>▲</kbd> jump (hold for higher)</li>
          <li><kbd>X</kbd> slash enemies · <kbd>R</kbd> restart · <kbd>Esc</kbd> menu</li>
          <li>Collect every gem to win. You have 3 hearts.</li>
        </ul>
        <h4>🃏 Card Duel (2 players, same screen)</h4>
        <ul>
          <li>Both players start with 5 hearts and take turns.</li>
          <li>On your turn, pick 1 of 4 face-down cards (click, tap or press <kbd>1</kbd>–<kbd>4</kbd>). The cards are shuffled every turn.</li>
          <li>⚔️ Sword Strike — your opponent loses 2 hearts. 🔥 Fireball — your opponent loses 1 heart.</li>
          <li>🛡️ Shield — nothing happens.</li>
          <li>💣 Bomb — it backfires, <b>you</b> lose a heart!</li>
          <li>First player to reach 0 hearts loses.</li>
        </ul>
        <button className="bf-big" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

export default function BlockFight({ onComplete, onHudUpdate }) {
  const [screen, setScreen] = useState("splash"); // splash | menu | adventure | cards
  const [howto, setHowto] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (howto) {
        if (e.key === "Escape" || e.key === "Enter") setHowto(false);
        return;
      }
      if (screen === "splash" && !e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey) setScreen("menu");
      else if (screen === "menu") {
        if (e.key === "1") setScreen("adventure");
        else if (e.key === "2") setScreen("cards");
        else if (e.key === "3") setHowto(true);
      }
    };
    const showMenu = () => setScreen("menu");
    window.addEventListener("keydown", onKey);
    window.addEventListener("block-fight:main-menu", showMenu);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("block-fight:main-menu", showMenu);
    };
  }, [screen, howto]);

  const toMenu = () => setScreen("menu");

  return (
    <div className={`bf-root${screen === "cards" ? " bf-root-duel" : ""}`}>
      <style>{CSS}</style>

      {screen === "splash" && (
        <section className="bf-screen" onClick={() => setScreen("menu")}>
          <div className="bf-mini"><div className="bf-blk p1" /><span className="bf-spark">💥</span><div className="bf-blk p2" /></div>
          <h1 className="bf-logo">BLOCK<span>FIGHT</span></h1>
          <p className="bf-tagline">Platform · Slash · Duel</p>
          <button className="bf-big bf-pulse" onClick={(e) => { e.stopPropagation(); setScreen("menu"); }}>▶ Press Start</button>
          <p className="bf-hint">or press any key</p>
        </section>
      )}

      {screen === "menu" && (
        <section className="bf-screen">
          <h2 className="bf-menu-title">BLOCK FIGHT</h2>
          <div className="bf-menu-grid">
            <button className="bf-menu-btn" onClick={() => setScreen("adventure")}>
              <span className="ico">🗡️</span><b>Adventure</b><small>Solo platformer — slash enemies, grab every gem</small>
            </button>
            <button className="bf-menu-btn" onClick={() => setScreen("cards")}>
              <span className="ico">🃏</span><b>Card Duel</b><small>2 players · pick a card, risk a heart</small>
            </button>
            <button className="bf-menu-btn" onClick={() => setHowto(true)}>
              <span className="ico">❓</span><b>How to Play</b><small>Controls and card rules</small>
            </button>
          </div>
          <button className="bf-link" onClick={() => setScreen("splash")}>← Title screen</button>
        </section>
      )}

      {screen === "adventure" && <Adventure onMenu={toMenu} onComplete={onComplete} />}
      {screen === "cards" && <CardDuel onMenu={toMenu} onHudUpdate={onHudUpdate} />}
      {howto && <HowTo onClose={() => setHowto(false)} />}
    </div>
  );
}