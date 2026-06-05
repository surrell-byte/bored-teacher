import { useEffect, useRef, useState } from "react";

const TILE = 32;
const GRAVITY = 0.6;
const JUMP_POWER = -15;
const ACCEL = 0.5;
const FRICTION = 0.8;
const MAX_SPEED = 5;

// Platform layout: [x, y, w, h]
const PLATFORMS = [
  [0, 400, 800, 24],    // ground
  [100, 320, 120, 16],
  [280, 260, 100, 16],
  [420, 320, 120, 16],
  [560, 240, 100, 16],
  [200, 180, 80, 16],
  [400, 160, 80, 16],
  [600, 300, 120, 16],
  [50, 200, 60, 16],
  [680, 180, 80, 16],
];

const ENEMIES_INIT = [
  { x: 300, y: 304, vx: 1.5, w: 28, h: 28, alive: true, platIdx: 2 },
  { x: 560, y: 224, vx: -1.2, w: 28, h: 28, alive: true, platIdx: 4 },
  { x: 200, y: 384, vx: 1.8, w: 28, h: 28, alive: true, platIdx: 0 },
  { x: 450, y: 304, vx: -1.5, w: 28, h: 28, alive: true, platIdx: 3 },
  { x: 620, y: 284, vx: 1.2, w: 28, h: 28, alive: true, platIdx: 5 },
];

const COINS_INIT = [
  { x: 140, y: 300 }, { x: 310, y: 240 }, { x: 460, y: 300 },
  { x: 590, y: 220 }, { x: 230, y: 160 }, { x: 420, y: 140 },
  { x: 710, y: 160 }, { x: 70, y: 180 }, { x: 640, y: 280 },
];

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export default function BlockFight() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const keysRef = useRef({});
  const [ui, setUi] = useState({ score: 0, hp: 3, state: "playing" });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    function initState() {
      return {
        player: { x: 100, y: 340, w: 28, h: 28, vx: 0, vy: 0, onGround: false, facing: 1, attackTimer: 0, hp: 3, invincible: 0 },
        enemies: ENEMIES_INIT.map(e => ({ ...e })),
        coins: COINS_INIT.map(c => ({ ...c, collected: false })),
        score: 0,
        shake: 0,
        coyoteTime: 0,
        jumpBuffer: 0,
        gameState: "playing",
      };
    }

    stateRef.current = initState();

    function handleKeyDown(e) {
      keysRef.current[e.code] = true;
      if (e.code === "Space" || e.code === "ArrowUp") stateRef.current.jumpBuffer = 10;
      if (e.code === "KeyR") { stateRef.current = initState(); setUi({ score: 0, hp: 3, state: "playing" }); }
      if (["Space","ArrowLeft","ArrowRight","ArrowUp"].includes(e.code)) e.preventDefault();
    }
    function handleKeyUp(e) {
      keysRef.current[e.code] = false;
      const p = stateRef.current?.player;
      if (p && (e.code === "Space" || e.code === "ArrowUp") && p.vy < -6) p.vy *= 0.5;
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function resolveCollisions(obj, plats) {
      obj.x += obj.vx;
      for (const [px, py, pw, ph] of plats) {
        if (rectsOverlap(obj, { x: px, y: py, w: pw, h: ph })) {
          if (obj.vx > 0) obj.x = px - obj.w;
          else if (obj.vx < 0) obj.x = px + pw;
          obj.vx = 0;
        }
      }
      obj.y += obj.vy;
      obj.onGround = false;
      for (const [px, py, pw, ph] of plats) {
        if (rectsOverlap(obj, { x: px, y: py, w: pw, h: ph })) {
          if (obj.vy > 0) { obj.y = py - obj.h; obj.onGround = true; obj.vy = 0; }
          else if (obj.vy < 0) { obj.y = py + ph; obj.vy = 0; }
        }
      }
    }

    function update() {
      const s = stateRef.current;
      if (s.gameState !== "playing") return;
      const p = s.player;

      if (p.invincible > 0) p.invincible--;
      if (s.shake > 0) s.shake -= 1.5;
      if (s.coyoteTime > 0) s.coyoteTime--;
      if (s.jumpBuffer > 0) s.jumpBuffer--;
      if (p.attackTimer > 0) p.attackTimer--;

      if (keysRef.current.ArrowLeft) { p.vx -= ACCEL; p.facing = -1; }
      if (keysRef.current.ArrowRight) { p.vx += ACCEL; p.facing = 1; }
      p.vx *= FRICTION;
      p.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, p.vx));
      if (p.onGround) s.coyoteTime = 6;
      if (s.jumpBuffer > 0 && s.coyoteTime > 0) { p.vy = JUMP_POWER; s.coyoteTime = 0; s.jumpBuffer = 0; }
      if (keysRef.current.KeyX || keysRef.current.ShiftLeft) p.attackTimer = 10;
      p.vy += GRAVITY;
      resolveCollisions(p, PLATFORMS);
      if (p.x < 0) p.x = 0;
      if (p.x + p.w > 800) p.x = 800 - p.w;
      if (p.y > 450) { p.hp--; p.x = 100; p.y = 340; p.vx = 0; p.vy = 0; s.shake = 12; if (p.hp <= 0) { s.gameState = "dead"; setUi(u => ({ ...u, state: "dead" })); } }

      // Enemies
      s.enemies.forEach(en => {
        if (!en.alive) return;
        en.x += en.vx;
        const plat = PLATFORMS[en.platIdx];
        if (en.x < plat[0]) { en.x = plat[0]; en.vx *= -1; }
        if (en.x + en.w > plat[0] + plat[2]) { en.x = plat[0] + plat[2] - en.w; en.vx *= -1; }
        // Attack hitbox
        const hitbox = { x: p.x + (p.facing > 0 ? p.w : -24), y: p.y + 4, w: 24, h: p.h - 8 };
        if (p.attackTimer > 0 && rectsOverlap(hitbox, { x: en.x, y: en.y, w: en.w, h: en.h })) {
          en.alive = false; s.score += 50; setUi(u => ({ ...u, score: s.score }));
        }
        // Enemy hurts player
        if (p.invincible === 0 && rectsOverlap(p, { x: en.x, y: en.y, w: en.w, h: en.h })) {
          p.hp--; p.invincible = 60; s.shake = 12;
          setUi(u => ({ ...u, hp: p.hp }));
          if (p.hp <= 0) { s.gameState = "dead"; setUi(u => ({ ...u, state: "dead", hp: 0 })); }
        }
      });

      // Coins
      s.coins.forEach(c => {
        if (!c.collected && rectsOverlap(p, { x: c.x, y: c.y, w: 16, h: 16 })) {
          c.collected = true; s.score += 10; setUi(u => ({ ...u, score: s.score }));
        }
      });

      if (s.enemies.every(e => !e.alive) && s.coins.every(c => c.collected)) {
        s.gameState = "win"; setUi(u => ({ ...u, state: "win" }));
      }
    }

    function draw() {
      const s = stateRef.current;
      const p = s.player;
      const sx = s.shake > 0 ? (Math.random() - 0.5) * s.shake : 0;
      const sy = s.shake > 0 ? (Math.random() - 0.5) * s.shake : 0;
      ctx.save();
      ctx.translate(sx, sy);

      // Sky
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 800, 424);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      [[50,30],[150,60],[300,20],[500,45],[650,25],[720,55],[400,35]].forEach(([x,y]) => {
        ctx.fillRect(x, y, 2, 2);
      });

      // Platforms
      PLATFORMS.forEach(([px, py, pw, ph]) => {
        ctx.fillStyle = "#1e40af";
        ctx.fillRect(px, py, pw, ph);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(px, py, pw, 4);
      });

      // Coins
      s.coins.forEach(c => {
        if (c.collected) return;
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(c.x + 8, c.y + 8, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(c.x + 6, c.y + 6, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Enemies
      s.enemies.forEach(en => {
        if (!en.alive) return;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(en.x, en.y, en.w, en.h);
        ctx.fillStyle = "#fca5a5";
        ctx.fillRect(en.x + 4, en.y + 4, 8, 7);
        ctx.fillRect(en.x + 16, en.y + 4, 8, 7);
        ctx.fillStyle = "#7f1d1d";
        ctx.fillRect(en.x + 8, en.y + 16, 12, 4);
      });

      // Player
      const pAlpha = p.invincible > 0 && Math.floor(p.invincible / 5) % 2 === 0 ? 0.4 : 1;
      ctx.globalAlpha = pAlpha;
      ctx.fillStyle = "#6366f1";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#a5b4fc";
      const eyeX = p.facing > 0 ? p.x + 18 : p.x + 6;
      ctx.fillRect(eyeX, p.y + 7, 6, 6);
      if (p.attackTimer > 0) {
        ctx.fillStyle = "#fbbf24";
        const hx = p.facing > 0 ? p.x + p.w : p.x - 20;
        ctx.fillRect(hx, p.y + 4, 20, p.h - 8);
      }
      ctx.globalAlpha = 1;

      ctx.restore();
    }

    function loop() {
      update();
      draw();
      animId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const restart = () => {
    stateRef.current = (() => {
      const s = {
        player: { x: 100, y: 340, w: 28, h: 28, vx: 0, vy: 0, onGround: false, facing: 1, attackTimer: 0, hp: 3, invincible: 0 },
        enemies: ENEMIES_INIT.map(e => ({ ...e })),
        coins: COINS_INIT.map(c => ({ ...c, collected: false })),
        score: 0, shake: 0, coyoteTime: 0, jumpBuffer: 0, gameState: "playing",
      };
      return s;
    })();
    setUi({ score: 0, hp: 3, state: "playing" });
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#020617", fontFamily: "'Segoe UI', sans-serif", padding: 16,
    }}>
      <div style={{ marginBottom: 12, display: "flex", gap: 24, alignItems: "center" }}>
        <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: "1.1rem" }}>⭐ {ui.score}</span>
        <span style={{ color: "#6366f1", fontWeight: 800, fontSize: "1.3rem", letterSpacing: 2 }}>BLOCK FIGHT</span>
        <span style={{ color: "#f87171" }}>{Array.from({ length: 3 }, (_, i) => i < ui.hp ? "❤️" : "🖤").join("")}</span>
      </div>

      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} width={800} height={424} style={{ border: "2px solid #1e293b", borderRadius: 12, display: "block" }} />

        {(ui.state === "dead" || ui.state === "win") && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.75)", borderRadius: 12,
          }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 8 }}>{ui.state === "win" ? "🏆" : "💀"}</div>
            <h2 style={{ color: ui.state === "win" ? "#fbbf24" : "#f87171", fontSize: "2rem", margin: "0 0 8px" }}>
              {ui.state === "win" ? "Stage Clear!" : "Game Over"}
            </h2>
            <p style={{ color: "#94a3b8", marginBottom: 20 }}>Score: {ui.score}</p>
            <button onClick={restart} style={{
              padding: "12px 28px", borderRadius: 999, border: "none",
              background: "linear-gradient(135deg,#6366f1,#4f46e5)",
              color: "#fff", fontWeight: 800, cursor: "pointer",
            }}>🔄 Play Again</button>
          </div>
        )}
      </div>

      <p style={{ color: "#475569", fontSize: "0.85rem", marginTop: 10 }}>
        ← → Move &nbsp;·&nbsp; ↑ / Space Jump &nbsp;·&nbsp; X / Shift Attack &nbsp;·&nbsp; R Restart
      </p>
    </div>
  );
}
