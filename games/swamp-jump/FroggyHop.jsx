"use client";

import React, { useEffect, useRef, useState } from "react";

const WIDTH = 480;
const HEIGHT = 640;
const GROUND_Y = 510;
const FROG_X = 130;
const GRAVITY = 0.55;
const JUMP_FORCE = -11;
const SKINS = { classic: "#4caf50", golden: "#ffcd4a", poison: "#39ff14", robot: "#b0b0b0", ninja: "#2c2c2c" };
const ACHIEVEMENTS = ["First Jump", "Score 10", "Score 50", "Score 100", "Combo 10x", "Close Call Master"];
const OBSTACLE_TYPES = ["log", "crocodile", "snake", "vine", "sinkingLog", "mosquito"];

const random = (min, max) => Math.random() * (max - min) + min;
const readList = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

export default function FroggyHop({ onComplete }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const frameRef = useRef(null);
  const [, refresh] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const audioRef = { current: null };
    const state = (stateRef.current = {
      frogY: GROUND_Y, velocity: 0, score: 0, best: Number(localStorage.getItem("froggyBest") || 0),
      combo: 0, started: false, over: false, frame: 0, speed: 4.2, obstacles: [], powerUps: [],
      particles: [], achievements: readList("froggyAchievements", []), skins: readList("froggySkins", ["classic"]),
      skin: localStorage.getItem("froggySkin") || "classic", menu: "main", sound: localStorage.getItem("froggySound") !== "false",
      shield: false, cooldown: 0, closeCalls: 0, highScores: readList("froggyHighScores", []), toast: "",
    });

    const beep = (frequency, duration, type = "sine") => {
      if (!state.sound) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioRef.current) audioRef.current = new AudioContext();
      const audio = audioRef.current;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type; oscillator.frequency.value = frequency; gain.gain.value = 0.035;
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration); oscillator.stop(audio.currentTime + duration);
    };
    const toast = (message) => { state.toast = message; window.setTimeout(() => { if (state.toast === message) state.toast = ""; }, 1900); };
    const unlock = (name) => {
      if (state.achievements.includes(name)) return;
      state.achievements.push(name); localStorage.setItem("froggyAchievements", JSON.stringify(state.achievements)); toast(`ACHIEVEMENT: ${name}`);
    };
    const particles = (x, y, count, color) => { for (let index = 0; index < count; index += 1) state.particles.push({ x, y, vx: random(-4, 4), vy: random(-5, 1), life: 35, color }); };
    const reset = () => {
      Object.assign(state, { frogY: GROUND_Y, velocity: 0, score: 0, combo: 0, started: false, over: false, frame: 0, speed: 4.2, obstacles: [], powerUps: [], particles: [], shield: false, cooldown: 0, closeCalls: 0, toast: "" });
    };
    const createObstacle = () => {
      const type = OBSTACLE_TYPES[Math.min(OBSTACLE_TYPES.length - 1, Math.floor(state.score / 18))] || "log";
      const sizes = { log: [65, 28], crocodile: [70, 32], snake: [68, 24], vine: [20, 160], sinkingLog: [60, 26], mosquito: [40, 25] };
      const [width, height] = sizes[type];
      state.obstacles.push({ type, x: WIDTH + 30, y: type === "vine" ? 120 : random(270, GROUND_Y - 25), width, height, passed: false, phase: random(0, 6) });
    };
    const jump = () => {
      if (state.menu !== "game") return;
      if (state.over) { reset(); state.started = true; return; }
      state.started = true; state.velocity = JUMP_FORCE; beep(420, 0.08, "square"); particles(FROG_X, state.frogY, 10, "#bbffaa"); unlock("First Jump");
    };
    const finish = () => {
      state.over = true; beep(130, 0.5, "sawtooth"); particles(FROG_X, state.frogY, 45, "#ff8844");
      if (state.score > state.best) { state.best = state.score; localStorage.setItem("froggyBest", String(state.best)); }
      state.highScores = [...state.highScores, state.score].sort((a, b) => b - a).slice(0, 5); localStorage.setItem("froggyHighScores", JSON.stringify(state.highScores));
      onCompleteRef.current?.(state.score, Math.min(100, state.score));
    };
    const collect = (power) => { if (power.type === "shield") { state.shield = true; toast("SHIELD ACTIVE"); } else { state.score += 5; toast("GOLDEN FLY +5"); } beep(880, 0.07); };
    const update = () => {
      if (state.menu !== "game" || !state.started || state.over) return;
      state.frame += 1; state.speed = Math.min(10, state.speed + 0.001);
      if (state.frame % 78 === 0) createObstacle();
      if (state.cooldown <= 0 && Math.random() < 0.006) { state.powerUps.push({ x: WIDTH + 20, y: random(180, 400), type: Math.random() > 0.5 ? "shield" : "fly" }); state.cooldown = 300; } else state.cooldown -= 1;
      state.velocity += GRAVITY; state.frogY += state.velocity;
      if (state.frogY >= GROUND_Y) { state.frogY = GROUND_Y; state.velocity = 0; }
      state.obstacles.forEach((obstacle) => {
        obstacle.x -= state.speed;
        if (obstacle.type === "snake") obstacle.y = GROUND_Y - 45 + Math.sin(state.frame * 0.05 + obstacle.phase) * 20;
        if (obstacle.type === "mosquito") obstacle.y = GROUND_Y - 70 + Math.sin(state.frame * 0.06 + obstacle.phase) * 25;
        if (!obstacle.passed && obstacle.x + obstacle.width < FROG_X) { obstacle.passed = true; state.combo += 1; state.score += state.combo; beep(760, 0.08); if (state.score >= 10) unlock("Score 10"); if (state.score >= 50) unlock("Score 50"); if (state.score >= 100) unlock("Score 100"); if (state.combo >= 10) unlock("Combo 10x"); }
      });
      state.obstacles = state.obstacles.filter((obstacle) => obstacle.x > -100);
      state.powerUps.forEach((power) => { power.x -= state.speed * 0.8; if (Math.abs(power.x - FROG_X) < 32 && Math.abs(power.y - state.frogY) < 32) { collect(power); power.x = -100; } });
      state.powerUps = state.powerUps.filter((power) => power.x > -40);
      state.particles.forEach((particle) => { particle.x += particle.vx; particle.y += particle.vy; particle.vy += 0.14; particle.life -= 1; }); state.particles = state.particles.filter((particle) => particle.life > 0);
      const frog = { x: FROG_X - 16, y: state.frogY - 14, width: 32, height: 28 };
      for (const obstacle of state.obstacles) {
        if (frog.x < obstacle.x + obstacle.width && frog.x + frog.width > obstacle.x && frog.y < obstacle.y + obstacle.height && frog.y + frog.height > obstacle.y) {
          if (state.shield) { state.shield = false; obstacle.x = -100; particles(FROG_X, state.frogY, 18, "#aaffcc"); toast("SHIELD BROKEN"); } else finish(); return;
        }
        if (Math.abs(frog.y + frog.height - obstacle.y) < 14 && obstacle.x < FROG_X + 35 && obstacle.x > FROG_X - 45) { state.closeCalls += 1; state.combo += 1; if (state.closeCalls >= 5) unlock("Close Call Master"); }
      }
    };
    const drawFrog = () => {
      ctx.save(); ctx.translate(FROG_X, state.frogY); ctx.fillStyle = SKINS[state.skin] || SKINS.classic; ctx.beginPath(); ctx.ellipse(0, 0, 19, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(-9, -11, 7, 0, Math.PI * 2); ctx.arc(9, -11, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(-9, -11, 3, 0, Math.PI * 2); ctx.arc(9, -11, 3, 0, Math.PI * 2); ctx.fill();
      if (state.shield) { ctx.strokeStyle = "#ffdd88"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke(); } ctx.restore();
    };
    const drawMenu = () => {
      ctx.fillStyle = "#102017ee"; ctx.fillRect(0, 0, WIDTH, HEIGHT); ctx.textAlign = "center";
      ctx.fillStyle = "#c9f0b2"; ctx.font = "bold 36px system-ui"; ctx.fillText("🐸 FROGGY HOP", WIDTH / 2, 95);
      const labels = state.menu === "main" ? ["PLAY", "SKINS", "ACHIEVEMENTS", "SETTINGS", "HIGH SCORES"] : state.menu === "skins" ? Object.keys(SKINS).map((skin) => `${skin.toUpperCase()}${state.skins.includes(skin) ? "" : " (LOCKED)"}`) : state.menu === "achievements" ? ACHIEVEMENTS.map((name) => `${state.achievements.includes(name) ? "✓" : "○"} ${name}`) : state.menu === "scores" ? (state.highScores.length ? state.highScores : [state.best]).map((score, index) => `${index + 1}. ${score}`) : [`SOUND: ${state.sound ? "ON" : "OFF"}`];
      labels.forEach((label, index) => { const y = 190 + index * 58; ctx.fillStyle = "#2b4128"; ctx.fillRect(WIDTH / 2 - 145, y - 27, 290, 48); ctx.fillStyle = "#ffedb5"; ctx.font = "bold 18px monospace"; ctx.fillText(label, WIDTH / 2, y + 6); });
      ctx.font = "13px monospace"; ctx.fillStyle = "#aacf99"; ctx.fillText(state.menu === "main" ? "ESC to return · SPACE to select" : "CLICK THE LAST ROW TO GO BACK", WIDTH / 2, HEIGHT - 36); ctx.textAlign = "left";
    };
    const draw = () => {
      if (state.menu !== "game") { drawMenu(); return; }
      const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT); sky.addColorStop(0, state.score < 12 ? "#c8e4aa" : "#3b376e"); sky.addColorStop(1, state.score < 12 ? "#5b8c5a" : "#182834"); ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "#42653b"; for (let index = 0; index < 9; index += 1) ctx.fillRect((index * 150 - state.frame * 0.25) % (WIDTH + 150), 340, 80, 170);
      ctx.fillStyle = "#3f6d75"; ctx.fillRect(0, GROUND_Y + 12, WIDTH, HEIGHT - GROUND_Y); ctx.fillStyle = "#4f8a96"; ctx.fillRect(0, GROUND_Y + 12, WIDTH, 8);
      state.obstacles.forEach((obstacle) => { ctx.fillStyle = obstacle.type === "crocodile" ? "#2c8740" : obstacle.type === "vine" ? "#406e32" : obstacle.type === "mosquito" ? "#3f2b1a" : "#9a632d"; ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height); });
      state.powerUps.forEach((power) => { ctx.fillStyle = power.type === "shield" ? "#88ccff" : "#ffcc33"; ctx.beginPath(); ctx.arc(power.x, power.y, 12, 0, Math.PI * 2); ctx.fill(); });
      state.particles.forEach((particle) => { ctx.globalAlpha = particle.life / 35; ctx.fillStyle = particle.color; ctx.fillRect(particle.x, particle.y, 4, 4); }); ctx.globalAlpha = 1; drawFrog();
      if (!state.started && !state.over) { ctx.fillStyle = "#0008"; ctx.fillRect(0, 0, WIDTH, HEIGHT); ctx.fillStyle = "white"; ctx.font = "bold 22px monospace"; ctx.textAlign = "center"; ctx.fillText("PRESS SPACE / TAP", WIDTH / 2, HEIGHT / 2); ctx.textAlign = "left"; }
      if (state.over) { ctx.fillStyle = "#000b"; ctx.fillRect(0, 0, WIDTH, HEIGHT); ctx.fillStyle = "white"; ctx.font = "bold 38px system-ui"; ctx.textAlign = "center"; ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 20); ctx.font = "18px monospace"; ctx.fillStyle = "#ffdf7e"; ctx.fillText(`Score: ${state.score}`, WIDTH / 2, HEIGHT / 2 + 25); ctx.textAlign = "left"; }
    };
    const loop = () => { update(); draw(); refresh((value) => value + 1); frameRef.current = requestAnimationFrame(loop); }; loop();
    const click = (event) => {
      const bounds = canvas.getBoundingClientRect(); const x = ((event.clientX - bounds.left) / bounds.width) * WIDTH; const y = ((event.clientY - bounds.top) / bounds.height) * HEIGHT;
      if (state.menu === "main") { if (y > 170 && y < 245) { reset(); state.menu = "game"; } else if (y > 250 && y < 315) state.menu = "skins"; else if (y > 320 && y < 385) state.menu = "achievements"; else if (y > 390 && y < 455) state.menu = "settings"; else if (y > 460 && y < 530) state.menu = "scores"; }
      else if (state.menu === "game") jump(); else if (y > HEIGHT - 85) state.menu = "main"; else if (state.menu === "settings" && y > 140 && y < 240) { state.sound = !state.sound; localStorage.setItem("froggySound", String(state.sound)); } else if (state.menu === "skins") { const index = Math.floor((y - 115) / 55); const skin = Object.keys(SKINS)[index]; if (skin && state.skins.includes(skin)) { state.skin = skin; localStorage.setItem("froggySkin", skin); } }
    };
    const keydown = (event) => { if (["Space", "ArrowUp", "KeyW"].includes(event.code)) { event.preventDefault(); if (state.menu === "main") state.menu = "game"; else jump(); } if (event.code === "Escape") state.menu = "main"; };
    canvas.addEventListener("click", click); window.addEventListener("keydown", keydown);
    return () => { canvas.removeEventListener("click", click); window.removeEventListener("keydown", keydown); cancelAnimationFrame(frameRef.current); audioRef.current?.close(); };
  }, []);

  return <main className="froggy-hop"><style>{` .froggy-hop{min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at top,#0c2b1a,#051008);color:#f9f3c1;font-family:Georgia,serif;padding:18px}.froggy-wrap{width:min(95vw,480px);text-align:center}.froggy-head{display:flex;justify-content:center;gap:14px;margin-bottom:12px}.froggy-stat{background:#0009;border:1px solid #fff3;border-radius:16px;padding:8px 20px;min-width:100px}.froggy-stat small{display:block;color:#c2f0b0;font:11px monospace;letter-spacing:2px}.froggy-stat strong{display:block;color:#ffdf7e;font:800 30px system-ui}.froggy-canvas{display:block;width:100%;height:auto;aspect-ratio:480/640;border-radius:24px;box-shadow:0 24px 50px #0009;cursor:pointer}.froggy-hint{color:#cef0b5;font:13px monospace;margin-top:12px}.froggy-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#1e2a1c;color:#f9f3c1;border-left:5px solid #ffdf7e;border-radius:20px;padding:10px 18px;font:bold 13px monospace}.froggy-hop button{background:#2b4128;border:1px solid #d8ad45;color:#ffedb5;border-radius:22px;padding:12px 30px;margin:6px;font:700 18px Georgia,serif;cursor:pointer}`}</style><div className="froggy-wrap"><div className="froggy-head"><div className="froggy-stat"><small>SCORE</small><strong>{stateRef.current?.score || 0}</strong></div><div className="froggy-stat"><small>BEST</small><strong>{stateRef.current?.best || 0}</strong></div></div><canvas ref={canvasRef} className="froggy-canvas" width={WIDTH} height={HEIGHT} /><p className="froggy-hint">🐸 JUMP / SPACE — CLICK TO PLAY</p>{stateRef.current?.toast && <div className="froggy-toast">{stateRef.current.toast}</div>}</div></main>;
}
