'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";

/* ---------- config ---------- */
const SIZE = 600, CELL = 4, COLS = SIZE / CELL, ROWS = SIZE / CELL;
const TOL = 32, PASS = 0.6, CWF = 2;
const FONT = (fs) => `900 ${fs}px "Arial Black","Arial Bold",Gadget,"Trebuchet MS",Arial,sans-serif`;
const CONFETTI_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#B983FF", "#FF9F45"];
const MODES = [
  { id: "letters", icon: "🔤", name: "Letters", detail: "Trace all 26 letters." },
  { id: "numbers", icon: "🔢", name: "Numbers", detail: "Practice numbers 0 to 20." },
  { id: "mixed", icon: "🎨", name: "Mixed level", detail: "Switch between letters and numbers." },
];

const OFFS = (() => {
  const out = [], n = Math.ceil(TOL / CELL);
  for (let dy = -n; dy <= n; dy++)
    for (let dx = -n; dx <= n; dx++)
      if ((dx * CELL) ** 2 + (dy * CELL) ** 2 <= TOL * TOL) out.push([dx, dy]);
  return out;
})();

/* ---------- engine helpers (operate on the mutable engine object `s`) ---------- */
function buildGlyph(s, ch) {
  const m0 = s.mctx;
  m0.setTransform(1, 0, 0, 1, 0, 0);
  m0.clearRect(0, 0, SIZE, SIZE);
  let fs = 400;
  m0.font = FONT(fs);
  let m = m0.measureText(ch);
  const w = Math.max(m.width, 1);
  const h = Math.max(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, 1);
  fs = Math.max(60, Math.floor(fs * Math.min((SIZE * 0.58) / w, (SIZE * 0.66) / h)));
  m0.font = FONT(fs);
  m0.textAlign = "center";
  m0.textBaseline = "alphabetic";
  m0.fillStyle = "#000";
  m = m0.measureText(ch);
  const asc = m.actualBoundingBoxAscent || fs * 0.7;
  const desc = m.actualBoundingBoxDescent || 0;
  const cy = SIZE / 2 + (asc - desc) / 2;
  m0.fillText(ch, SIZE / 2, cy);
  s.glyph = { ch, fs, cy, asc, desc };

  const d = m0.getImageData(0, 0, SIZE, SIZE).data;
  s.ink = new Set();
  s.near = new Set();
  for (let gy = 0; gy < ROWS; gy++) {
    const py = (gy * CELL + CELL / 2) | 0;
    for (let gx = 0; gx < COLS; gx++) {
      const px = (gx * CELL + CELL / 2) | 0;
      if (d[(py * SIZE + px) * 4 + 3] > 100) s.ink.add(gx + "," + gy);
    }
  }
  const skeleton = new Uint8Array(COLS * ROWS);
  s.ink.forEach((key) => {
    const comma = key.indexOf(",");
    skeleton[+key.slice(comma + 1) * COLS + +key.slice(0, comma)] = 1;
  });

  // Thin the glyph mask into centerline paths for the dotted tracing guide.
  let changed = true;
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      const remove = [];
      for (let y = 1; y < ROWS - 1; y++) {
        for (let x = 1; x < COLS - 1; x++) {
          const i = y * COLS + x;
          if (!skeleton[i]) continue;

          const p2 = skeleton[i - COLS];
          const p3 = skeleton[i - COLS + 1];
          const p4 = skeleton[i + 1];
          const p5 = skeleton[i + COLS + 1];
          const p6 = skeleton[i + COLS];
          const p7 = skeleton[i + COLS - 1];
          const p8 = skeleton[i - 1];
          const p9 = skeleton[i - COLS - 1];
          const neighbors = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (neighbors < 2 || neighbors > 6) continue;

          const transitions =
            (p2 === 0 && p3 === 1 ? 1 : 0) +
            (p3 === 0 && p4 === 1 ? 1 : 0) +
            (p4 === 0 && p5 === 1 ? 1 : 0) +
            (p5 === 0 && p6 === 1 ? 1 : 0) +
            (p6 === 0 && p7 === 1 ? 1 : 0) +
            (p7 === 0 && p8 === 1 ? 1 : 0) +
            (p8 === 0 && p9 === 1 ? 1 : 0) +
            (p9 === 0 && p2 === 1 ? 1 : 0);
          if (transitions !== 1) continue;
          if (pass === 0 ? p2 * p4 * p6 !== 0 || p4 * p6 * p8 !== 0 : p2 * p4 * p8 !== 0 || p2 * p6 * p8 !== 0) continue;
          remove.push(i);
        }
      }

      if (remove.length) {
        changed = true;
        remove.forEach((i) => { skeleton[i] = 0; });
      }
    }
  }

  const neighborsOf = (index) => {
    const x = index % COLS, y = Math.floor(index / COLS), neighbors = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && skeleton[ny * COLS + nx]) {
          neighbors.push(ny * COLS + nx);
        }
      }
    }
    return neighbors;
  };
  const toPoint = (index) => ({
    x: (index % COLS) * CELL + CELL / 2,
    y: Math.floor(index / COLS) * CELL + CELL / 2,
  });
  const addGuidePoint = (index) => {
    s.guideInk.add((index % COLS) + "," + Math.floor(index / COLS));
  };
  s.guideInk = new Set();
  s.guideDots = [];
  s.guideMarkers = [];
  const visited = new Uint8Array(skeleton.length);
  for (let i = 0; i < skeleton.length; i++) {
    if (!skeleton[i]) continue;
    if (visited[i]) continue;
    const component = [], queue = [i];
    visited[i] = 1;
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      component.push(current);
      for (const neighbor of neighborsOf(current)) {
        if (!visited[neighbor]) {
          visited[neighbor] = 1;
          queue.push(neighbor);
        }
      }
    }

    for (const index of component) {
      const x = index % COLS, y = Math.floor(index / COLS);
      if ((x + 2 * y) % 4 === 0) {
        s.guideDots.push(toPoint(index));
        addGuidePoint(index);
      }
    }

    const endpoints = component.filter((index) => neighborsOf(index).length === 1);
    if (endpoints.length) {
      endpoints.sort((a, b) => Math.floor(a / COLS) - Math.floor(b / COLS) || a % COLS - b % COLS);
      addGuidePoint(endpoints[0]);
      s.guideMarkers.push({ type: "start", ...toPoint(endpoints[0]) });
      for (const endpoint of endpoints.slice(1)) {
        addGuidePoint(endpoint);
        const neighbor = neighborsOf(endpoint)[0];
        const point = toPoint(endpoint), previous = toPoint(neighbor);
        s.guideMarkers.push({ type: "arrow", ...point, dx: point.x - previous.x, dy: point.y - previous.y });
      }
    } else {
      component.sort((a, b) => Math.floor(a / COLS) - Math.floor(b / COLS) || a % COLS - b % COLS);
      const start = toPoint(component[0]);
      addGuidePoint(component[0]);
      s.guideMarkers.push({ type: "start", ...start });
      if (component.length > 1) {
        const endIndex = component.reduce((left, right) => left % COLS < right % COLS ? left : right);
        addGuidePoint(endIndex);
        const neighbor = neighborsOf(endIndex)[0];
        const point = toPoint(endIndex), previous = toPoint(neighbor);
        s.guideMarkers.push({ type: "arrow", ...point, dx: point.x - previous.x, dy: point.y - previous.y });
      }
    }
  }
  s.ink.forEach((k) => {
    const i = k.indexOf(",");
    const gx = +k.slice(0, i), gy = +k.slice(i + 1);
    for (let j = 0; j < OFFS.length; j++) s.near.add(gx + OFFS[j][0] + "," + (gy + OFFS[j][1]));
  });
}

function resetTrace(s) {
  s.covered = new Set();
  s.guideCovered = new Set();
  s.strokes = [];
  s.onN = 0;
  s.offN = 0;
  s.covDirty = true;
}

function stamp(s, x, y) {
  const cx0 = Math.floor(x / CELL), cy0 = Math.floor(y / CELL);
  if (s.near.has(cx0 + "," + cy0)) s.onN++; else s.offN++;
  for (let i = 0; i < OFFS.length; i++) {
    const key = cx0 + OFFS[i][0] + "," + (cy0 + OFFS[i][1]);
    if (s.ink.has(key) && !s.covered.has(key)) { s.covered.add(key); s.covDirty = true; }
    if (s.guideInk.has(key) && !s.guideCovered.has(key)) { s.guideCovered.add(key); s.covDirty = true; }
  }
}

function stampLine(s, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (CELL * 0.5)));
  for (let i = 1; i <= n; i++) stamp(s, a.x + (dx * i) / n, a.y + (dy * i) / n);
}

function rebuildCovered(s) {
  s.covered = new Set();
  s.guideCovered = new Set();
  s.onN = 0;
  s.offN = 0;
  s.covDirty = true;
  for (const st of s.strokes)
    for (let i = 0; i < st.length; i++) {
      stamp(s, st[i].x, st[i].y);
      if (i > 0) stampLine(s, st[i - 1], st[i]);
    }
}

const coverage = (s) => {
  const guideMode = s.showGuide && s.guideInk?.size;
  const target = guideMode ? s.guideInk : s.ink;
  const covered = guideMode ? s.guideCovered : s.covered;
  return target && target.size ? covered.size / target.size : 0;
};

function starRating(s) {
  const stray = s.offN / Math.max(1, s.onN + s.offN);
  return stray < 0.12 ? 3 : stray < 0.3 ? 2 : 1;
}

function drawStroke(ctx, st) {
  if (st.length === 1) {
    ctx.beginPath();
    ctx.arc(st[0].x, st[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(st[0].x, st[0].y);
  for (let i = 0; i < st.length - 1; i++) {
    const previous = st[Math.max(0, i - 1)];
    const current = st[i];
    const next = st[i + 1];
    const following = st[Math.min(st.length - 1, i + 2)];
    ctx.bezierCurveTo(
      current.x + (next.x - previous.x) / 6,
      current.y + (next.y - previous.y) / 6,
      next.x - (following.x - current.x) / 6,
      next.y - (following.y - current.y) / 6,
      next.x,
      next.y,
    );
  }
  ctx.stroke();
}

function draw(ctx, s, dpr) {
  const g = s.glyph;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.font = FONT(g.fs);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  ctx.fillText(g.ch, SIZE / 2, g.cy);

  if (s.covDirty) {
    s.covCtx.clearRect(0, 0, s.covCv.width, s.covCv.height);
    s.covCtx.fillStyle = "#00B894";
    const visibleCoverage = s.showGuide ? s.guideCovered : s.covered;
    visibleCoverage.forEach((k) => {
      const i = k.indexOf(",");
      s.covCtx.fillRect(+k.slice(0, i) * CWF, +k.slice(i + 1) * CWF, CWF, CWF);
    });
    s.covDirty = false;
  }
  if (s.covered.size) {
    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(s.covCv, 0, 0, SIZE, SIZE);
    ctx.restore();
  }

  ctx.font = FONT(g.fs);
  ctx.setLineDash([]);
  ctx.lineWidth = 3.5;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#17202A";
  ctx.strokeText(g.ch, SIZE / 2, g.cy);

  if (s.showGuide && s.guideDots?.length) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.fillStyle = "#17202A";
    for (const dot of s.guideDots) {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#008F72";
    for (const marker of s.guideMarkers) {
      if (marker.type === "start") {
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      const length = Math.hypot(marker.dx, marker.dy) || 1;
      const dx = marker.dx / length, dy = marker.dy / length;
      const arrowLength = 12, arrowWidth = 7;
      ctx.beginPath();
      ctx.moveTo(marker.x, marker.y);
      ctx.lineTo(marker.x - dx * arrowLength - dy * arrowWidth, marker.y - dy * arrowLength + dx * arrowWidth);
      ctx.lineTo(marker.x - dx * arrowLength + dy * arrowWidth, marker.y - dy * arrowLength - dx * arrowWidth);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 26;
  ctx.strokeStyle = ctx.fillStyle = "rgba(108,92,231,0.14)";
  for (const st of s.strokes) drawStroke(ctx, st);
  ctx.lineWidth = 15;
  ctx.strokeStyle = ctx.fillStyle = "rgba(108,92,231,0.94)";
  for (const st of s.strokes) drawStroke(ctx, st);
}

const hintFor = (c, showGuide) =>
  showGuide && c < 1 ? "Follow the dotted paths from their green start dots toward the arrows to trace the whole character."
  : c === 0 ? "Trace the outlined character with your finger or mouse."
  : c < 0.3 ? "Great start — follow the outline!"
  : c < 0.5 ? "Nice! Keep going."
  : "So close — fill in the last bits!";

/* ---------- component ---------- */
/**
 * Props (all optional):
 *  initialSolved: { [char]: 1|2|3 }  — saved star ratings to start from
 *  onProgress(solved)                — called whenever a character is solved, so you can persist it
 */
export default function TracingTrials({ initialSolved = {}, onProgress, onHudUpdate }) {
  const [screen, setScreen] = useState("player");
  const [nameDraft, setNameDraft] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [mode, setMode] = useState("letters");
  const [upper, setUpper] = useState(true);
  const [sound, setSound] = useState(true);
  const [showGuide, setShowGuide] = useState(true);
  const [solved, setSolved] = useState(initialSolved);
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [won, setWon] = useState(false);
  const [stars, setStars] = useState(3);
  const [confetti, setConfetti] = useState([]);
  const [shake, setShake] = useState(false);

  const canvasRef = useRef(null);
  const trayRef = useRef(null);
  const acRef = useRef(null);
  const soundRef = useRef(true);
  const engine = useRef({
    ink: new Set(), near: new Set(), covered: new Set(), guideInk: new Set(), guideCovered: new Set(), strokes: [],
    onN: 0, offN: 0, covDirty: true, won: false, drawing: false,
    guideDots: [], guideMarkers: [],
    glyph: { ch: "a", fs: 400, cy: 300, asc: 200, desc: 0 },
    mctx: null, covCv: null, covCtx: null,
  });
  const act = useRef({});

  soundRef.current = sound;
  if (engine.current.showGuide !== showGuide) {
    engine.current.showGuide = showGuide;
    engine.current.covDirty = true;
  }

  const items = useMemo(() => {
    const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode((upper ? 65 : 97) + i));
    const numbers = Array.from({ length: 21 }, (_, i) => String(i));
    if (mode === "numbers") return numbers;
    if (mode === "mixed") return [...letters, ...numbers];
    return letters;
  }, [mode, upper]);

  /* ----- audio ----- */
  const ensureAudio = () => {
    if (acRef.current || !soundRef.current) return;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;
    acRef.current = new AudioContextConstructor();
    if (acRef.current && acRef.current.state === "suspended") acRef.current.resume();
  };
  const tone = (freq, when, dur, type = "sine", vol = 0.18) => {
    const ac = acRef.current;
    if (!ac || !soundRef.current) return;
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + when;
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  };
  /* ----- mount: canvases + render loop ----- */
  useEffect(() => {
    const s = engine.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const canvas = canvasRef.current;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext("2d");

    const mask = document.createElement("canvas");
    mask.width = SIZE;
    mask.height = SIZE;
    s.mctx = mask.getContext("2d", { willReadFrequently: true });
    s.covCv = document.createElement("canvas");
    s.covCv.width = COLS * CWF;
    s.covCv.height = ROWS * CWF;
    s.covCtx = s.covCv.getContext("2d");

    buildGlyph(s, "a");
    resetTrace(s);

    let raf;
    const loop = () => { draw(ctx, s, dpr); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ----- load a glyph whenever the item or case changes ----- */
  useEffect(() => {
    const s = engine.current;
    if (screen !== "game" || !s.mctx) return;
    buildGlyph(s, items[idx]);
    resetTrace(s);
    s.won = false;
    s.drawing = false;
    setWon(false);
    setPct(0);
    const tray = trayRef.current;
    const chip = tray && tray.querySelector(".tl-chip.active");
    if (tray && chip) {
      const chipOffset = chip.getBoundingClientRect().left - tray.getBoundingClientRect().left;
      tray.scrollTo({
        left: tray.scrollLeft + chipOffset - (tray.clientWidth - chip.clientWidth) / 2,
        behavior: "smooth",
      });
    }
  }, [idx, items, screen]);

  /* ----- actions ----- */
  const go = (i) => {
    const n = ((i % items.length) + items.length) % items.length;
    setIdx(n);
  };
  const clearBoard = () => {
    const s = engine.current;
    resetTrace(s);
    s.won = false;
    setWon(false);
    setPct(0);
  };
  const startMode = (nextMode) => {
    setMode(nextMode);
    setUpper(true);
    setIdx(0);
    clearBoard();
    setScreen("game");
  };
  const undo = () => {
    const s = engine.current;
    if (!s.strokes.length) {
      setShake(true);
      setTimeout(() => setShake(false), 380);
      return;
    }
    s.strokes.pop();
    s.won = false;
    setWon(false);
    rebuildCovered(s);
    setPct(Math.min(100, Math.round(coverage(s) * 100)));
  };
  const returnToMenu = () => {
    clearBoard();
    setScreen("menu");
  };
  const toggleSound = () => {
    soundRef.current = !soundRef.current;
    setSound(soundRef.current);
    ensureAudio();
  };
  const toggleCase = () => setUpper((value) => !value);
  const toggleGuide = () => setShowGuide((value) => !value);
  const handleNameSubmit = (event) => {
    event.preventDefault();
    const name = nameDraft.trim();
    if (!name) return;
    setPlayerName(name);
    setScreen("menu");
  };
  const resetProgress = () => {
    if (!window.confirm("Reset all stars and progress?")) return;
    setSolved({});
    if (onProgress) onProgress({});
  };

  const checkWin = () => {
    const s = engine.current;
    const targetCoverage = s.showGuide ? 1 : PASS;
    if (s.won || coverage(s) < targetCoverage) return;
    s.won = true;
    const ch = items[idx], st = starRating(s);
    setWon(true);
    setStars(st);
    setSolved((prev) => {
      if (prev[ch] && prev[ch] >= st) return prev;
      const next = { ...prev, [ch]: st };
      if (onProgress) onProgress(next);
      return next;
    });
    const n = 16 + st * 10;
    setConfetti(
      Array.from({ length: n }, (_, i) => ({
        id: i + "-" + Date.now(),
        left: Math.random() * 100 + "%",
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        width: 6 + Math.random() * 8,
        height: 9 + Math.random() * 11,
        animationDelay: Math.random() * 0.45 + "s",
        animationDuration: 1.5 + Math.random() * 0.9 + "s",
      }))
    );
    setTimeout(() => setConfetti([]), 2900);
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, "triangle", 0.2));
  };

  /* keyboard (handlers read latest closures through a ref) */
  act.current = { go, idx, clearBoard, undo, won, screen, returnToMenu, toggleSound, toggleCase, toggleGuide };
  useEffect(() => {
    const onKey = (e) => {
      const a = act.current;
      if (a.screen !== "game") return;
      if (e.key === "ArrowRight") a.go(a.idx + 1);
      else if (e.key === "ArrowLeft") a.go(a.idx - 1);
      else if (e.key === "Escape" || e.key === "c" || e.key === "C") a.clearBoard();
      else if (e.key === "u" || e.key === "U") a.undo();
      else if (e.key === "Enter" && a.won) a.go(a.idx + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const actions = {
      "tracing-trials:main-menu": () => act.current.returnToMenu(),
      "tracing-trials:toggle-sound": () => act.current.toggleSound(),
      "tracing-trials:toggle-case": () => act.current.toggleCase(),
      "tracing-trials:toggle-guide": () => act.current.toggleGuide(),
      "tracing-trials:undo": () => act.current.undo(),
      "tracing-trials:clear": () => act.current.clearBoard(),
    };
    Object.entries(actions).forEach(([name, handler]) => window.addEventListener(name, handler));
    return () => Object.entries(actions).forEach(([name, handler]) => window.removeEventListener(name, handler));
  }, []);

  /* ----- pointer input ----- */
  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (SIZE / r.width), y: (e.clientY - r.top) * (SIZE / r.height) };
  };
  const syncPct = () => setPct(Math.min(100, Math.round(coverage(engine.current) * 100)));

  const onDown = (e) => {
    const s = engine.current;
    if (s.won) return;
    e.preventDefault();
    ensureAudio();
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    s.drawing = true;
    const p = pos(e);
    s.strokes.push([p]);
    stamp(s, p.x, p.y);
    syncPct();
  };
  const onMove = (e) => {
    const s = engine.current;
    if (!s.drawing || s.won) return;
    const st = s.strokes[s.strokes.length - 1];
    if (!st) return;
    const p = pos(e), last = st[st.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 3) return;
    stampLine(s, last, p);
    st.push(p);
    syncPct();
  };
  const onUp = (e) => {
    const s = engine.current;
    if (!s.drawing) return;
    s.drawing = false;
    if (e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId);
    checkWin();
    syncPct();
  };

  /* ----- derived ----- */
  const ch = items[idx];
  const totalStars = Object.values(solved).reduce((a, v) => a + (v || 0), 0);
  const doneN = items.filter((x) => solved[x]).length;
  useEffect(() => {
    onHudUpdate?.({
      screen,
      character: ch,
      mode,
      totalStars,
      done: doneN,
      total: items.length,
      upper,
      sound,
      showGuide,
      canSwitchCase: mode !== "numbers",
    });
  }, [onHudUpdate, screen, ch, mode, totalStars, doneN, items.length, upper, sound, showGuide]);
  const praiseMessages = [
    `Nice tracing, ${playerName}!`,
    `Awesome work, ${playerName}!`,
    `Perfect tracing, ${playerName}!`,
  ];

  return (
    <div className="tl-app">
      <style>{CSS}</style>

      {screen === "player" && (
        <main className="tl-screen">
          <section className="tl-screen-card">
            <div className="tl-logo tl-screen-logo" aria-hidden="true">✏️</div>
            <p className="tl-eyebrow">Welcome to</p>
            <h1>Let&apos;s get started</h1>
            <p className="tl-screen-copy">A little practice goes a long way. First, what should we call you?</p>
            <form className="tl-name-form" onSubmit={handleNameSubmit}>
              <label htmlFor="tl-player-name">Your name</label>
              <input
                autoComplete="given-name"
                autoFocus
                id="tl-player-name"
                maxLength={32}
                onChange={(event) => setNameDraft(event.target.value)}
                placeholder="Type your name"
                required
                value={nameDraft}
              />
              <button className="tl-btn primary wide" type="submit">Continue to the menu →</button>
            </form>
          </section>
        </main>
      )}

      {screen === "menu" && (
        <main className="tl-screen">
          <section className="tl-menu">
            <p className="tl-eyebrow">Ready when you are, {playerName}!</p>
            <h1>Choose your practice</h1>
            <p className="tl-screen-copy">Pick a level to get started.</p>
            <div className="tl-mode-grid">
              {MODES.map((option) => (
                <button className="tl-mode-card" key={option.id} onClick={() => startMode(option.id)} type="button">
                  <span className="tl-mode-icon" aria-hidden="true">{option.icon}</span>
                  <span className="tl-mode-name">{option.name}</span>
                  <span className="tl-mode-detail">{option.detail}</span>
                  <span className="tl-mode-start">Start level →</span>
                </button>
              ))}
            </div>
            <div className="tl-menu-footer">
              <span>⭐ {totalStars} stars earned</span>
              <button className="tl-link" onClick={() => setScreen("player")} type="button">Change name</button>
            </div>
          </section>
        </main>
      )}

      <div className="tl-game-screen" hidden={screen !== "game"}>
        <main className="tl-stage">
          <div className={"tl-board-wrap" + (shake ? " shake" : "")}>
            <canvas
              ref={canvasRef}
              className="tl-canvas"
              aria-label={`Trace ${ch}. ${showGuide ? "Follow the dotted paths from their green start dots toward the arrows." : "Follow the letter outline."}`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onContextMenu={(e) => e.preventDefault()}
            />
            {won && (
              <div className="tl-win show">
                <div className="tl-win-card">
                  <div className="tl-win-stars">
                    {[0, 1, 2].map((i) => (
                      <i key={i} className={i < stars ? "on" : ""}>★</i>
                    ))}
                  </div>
                  <h2>{praiseMessages[stars - 1]}</h2>
                  <p>You traced <b>{ch}</b>, {playerName}!</p>
                  <div className="tl-win-btns">
                    <button className="tl-btn ghost" onClick={returnToMenu}>Main menu</button>
                    <button className="tl-btn ghost" onClick={clearBoard}>Try again</button>
                    <button className="tl-btn primary" onClick={() => go(idx + 1)}>Next →</button>
                  </div>
                </div>
                {confetti.map((c) => (
                  <i
                    key={c.id}
                    className="tl-confetti"
                    style={{
                      left: c.left, background: c.background, width: c.width, height: c.height,
                      animationDelay: c.animationDelay, animationDuration: c.animationDuration,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="tl-side">
            <div className="tl-card">
              <div className="tl-label">Coverage</div>
              <div className="tl-bar">
                <div className="tl-bar-fill" style={{ width: pct + "%" }} />
                <div className="tl-bar-mark" style={{ left: (showGuide ? 100 : PASS * 100) + "%" }} />
              </div>
              <div className="tl-cov">{pct}%</div>
              <div className="tl-hint">{won ? `Perfect tracing, ${playerName}! 🎉` : hintFor(pct / 100, showGuide)}</div>
            </div>
          </aside>
        </main>

        <nav className="tl-tray">
          <div className="tl-tray-head">
            <span>{doneN} / {items.length} done</span>
            <button className="tl-link" onClick={resetProgress}>Reset progress</button>
          </div>
          <div className="tl-tray-scroll" ref={trayRef}>
            {items.map((c, i) => (
              <React.Fragment key={c}>
                <button
                  className={"tl-chip" + (i === idx ? " active" : "") + (solved[c] ? " done" : "")}
                  aria-label={"Trace " + c}
                  onClick={() => go(i)}
                >
                  {c}
                  {solved[c] ? <span className="dots">{"★".repeat(solved[c])}</span> : null}
                </button>
                {mode === "mixed" && i === 25 && <div className="tl-divider" />}
              </React.Fragment>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ---------- styles (scoped under .tl-app) ---------- */
const CSS = `
.tl-app{--purple:#6C5CE7;--green:#00B894;--gold:#F5B301;--ink:#2D3436;--muted:#8798AD;--line:#E3EAF6;
  font-family:"Segoe UI",system-ui,-apple-system,"Trebuchet MS",sans-serif;color:var(--ink);
  background:radial-gradient(1100px 700px at 15% -5%,#EAF3FF 0%,rgba(234,243,255,0) 60%),radial-gradient(900px 700px at 90% 0%,#F6ECFF 0%,rgba(246,236,255,0) 55%),radial-gradient(900px 700px at 50% 110%,#E9FBF3 0%,rgba(233,251,243,0) 60%),#FBFDFF;
  min-height:100%;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none;overflow-x:hidden}
.tl-app *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.tl-app button:focus-visible{outline:3px solid #A99BFF;outline-offset:2px}
.tl-game-screen{display:flex;flex:1;flex-direction:column;min-height:0}
.tl-game-screen[hidden]{display:none}
.tl-screen{width:min(100%,1120px);flex:1;display:grid;place-items:center;margin:0 auto;padding:clamp(24px,6vw,64px) 20px}
.tl-screen-card,.tl-menu{width:min(100%,760px);padding:clamp(26px,5vw,48px);border:2px solid #E3EAF6;border-radius:28px;background:#fff;box-shadow:0 24px 60px -28px rgba(59,46,140,.35);text-align:center}
.tl-screen-logo{width:54px;height:54px;margin:0 auto 16px;border-radius:18px;font-size:26px}
.tl-eyebrow{margin:0 0 8px;color:#00a987;font-size:13px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase}
.tl-screen h1{margin:0;color:#3B2E8C;font-size:clamp(30px,5vw,46px);font-weight:900;letter-spacing:-1.6px}
.tl-screen-copy{max-width:520px;margin:12px auto 24px;color:#71829a;font-size:16px;font-weight:600;line-height:1.55}
.tl-name-form{display:grid;gap:10px;max-width:420px;margin:0 auto;text-align:left}
.tl-name-form label{color:#4A5A70;font-size:13px;font-weight:800}
.tl-name-form input{width:100%;border:2px solid var(--line);border-radius:14px;padding:14px 16px;background:#FBFDFF;color:var(--ink);font:inherit;font-size:16px;user-select:text;-webkit-user-select:text}
.tl-name-form input:focus{border-color:#7C6CF0;outline:3px solid rgba(124,108,240,.18)}
.tl-name-form .tl-btn{margin-top:8px}
.tl-menu{width:min(100%,960px)}
.tl-mode-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:30px}
.tl-mode-card{min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:22px 18px;border:2px solid var(--line);border-radius:22px;background:#FBFDFF;color:var(--ink);font:inherit;text-align:center;cursor:pointer;transition:transform .16s,border-color .16s,box-shadow .16s}
.tl-mode-card:hover{transform:translateY(-4px);border-color:#A99BFF;box-shadow:0 14px 28px -16px rgba(59,46,140,.45)}
.tl-mode-icon{font-size:38px;line-height:1}
.tl-mode-name{color:#3B2E8C;font-size:20px;font-weight:900}
.tl-mode-detail{color:var(--muted);font-size:13px;font-weight:600;line-height:1.45}
.tl-mode-start{margin-top:4px;color:#0A8F72;font-size:13px;font-weight:900}
.tl-menu-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:24px;color:#D99A00;font-size:14px;font-weight:800}
.tl-topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px 6px;max-width:1120px;width:100%;margin:0 auto}
.tl-brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:20px;letter-spacing:-.3px}
.tl-logo{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:linear-gradient(135deg,#7C6CF0,#00B894);font-size:17px;box-shadow:0 8px 16px -8px rgba(108,92,231,.8)}
.tl-brand span{background:linear-gradient(90deg,#5B4BD6,#00B894);-webkit-background-clip:text;background-clip:text;color:transparent}
.tl-pills{display:flex;gap:8px;align-items:center}
.tl-pill{background:#fff;border:2px solid var(--line);padding:7px 14px;border-radius:999px;font-weight:800;font-size:14px;color:#4A5A70;white-space:nowrap}
.tl-pill.tl-stars{color:#D99A00;transition:transform .2s}.tl-pill.tl-stars.bump{transform:scale(1.18)}
.tl-icon-btn{font:inherit;font-weight:900;font-size:15px;width:38px;height:38px;border-radius:50%;border:2px solid var(--line);background:#fff;color:#4A5A70;cursor:pointer;transition:transform .12s,background .15s}
.tl-icon-btn:hover{background:#F1F5FC}.tl-icon-btn:active{transform:scale(.92)}.tl-icon-btn.off{opacity:.5}
.tl-stage{display:flex;gap:22px;align-items:flex-start;width:100%;max-width:1120px;margin:0 auto;padding:10px 20px 6px;flex:1}
.tl-board-wrap{position:relative;width:100%;max-width:560px;aspect-ratio:1/1;margin:0 auto;border-radius:28px;background:#fff;overflow:hidden;flex:1 1 auto;
  box-shadow:0 0 0 6px #fff,0 0 0 8px var(--line),0 24px 50px -20px rgba(59,46,140,.4)}
.tl-canvas{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair;border-radius:28px;image-rendering:auto}
.tl-board-wrap.shake{animation:tl-shake .35s}
@keyframes tl-shake{20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.tl-side{width:250px;flex:0 0 250px;display:flex;flex-direction:column;gap:14px;padding-top:6px}
.tl-card{background:#fff;border:2px solid var(--line);border-radius:20px;padding:16px;box-shadow:0 8px 22px -14px rgba(59,46,140,.35)}
.tl-label{font-size:12px;font-weight:800;letter-spacing:.9px;text-transform:uppercase;color:var(--muted)}
.tl-bar{position:relative;height:14px;border-radius:999px;background:#EEF2FA;margin:10px 0 8px}
.tl-bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#6C5CE7,#00B894);transition:width .16s ease-out}
.tl-bar-mark{position:absolute;top:-4px;bottom:-4px;width:3px;border-radius:2px;background:#C9D5EA}
.tl-cov{font-size:28px;font-weight:900;color:var(--purple);letter-spacing:-1px}
.tl-hint{margin-top:8px;font-size:13px;line-height:1.45;color:var(--muted);font-weight:600;min-height:38px}
.tl-card.row{display:flex;gap:10px}.tl-card.row .tl-btn{flex:1}
.tl-btn{font:inherit;font-weight:800;font-size:15px;border:none;border-radius:15px;padding:12px 18px;cursor:pointer;transition:transform .12s,box-shadow .12s,background .15s,filter .15s}
.tl-btn:active{transform:scale(.95)}.tl-btn.wide{width:100%}
.tl-btn.ghost{background:#EEF2FA;color:#4A5A70}.tl-btn.ghost:hover{background:#E1E9F6}
.tl-btn.primary{background:linear-gradient(180deg,#7C6CF0,#5B4BD6);color:#fff;box-shadow:0 10px 22px -8px rgba(108,92,231,.9)}.tl-btn.primary:hover{filter:brightness(1.07)}
.tl-tray{width:100%;max-width:1120px;margin:0 auto;padding:4px 12px 18px}
.tl-tray-head{display:flex;justify-content:space-between;align-items:center;padding:0 10px;font-size:13px;font-weight:800;color:var(--muted)}
.tl-link{font:inherit;font-weight:700;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline}.tl-link:hover{color:var(--purple)}
.tl-tray-scroll{display:flex;gap:8px;align-items:center;overflow-x:auto;overflow-y:hidden;padding:12px 8px 14px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}
.tl-tray-scroll::-webkit-scrollbar{height:8px}.tl-tray-scroll::-webkit-scrollbar-thumb{background:#D9E2F0;border-radius:99px}
.tl-chip{flex:0 0 auto;position:relative;width:46px;height:46px;border-radius:15px;border:2px solid var(--line);background:#fff;color:#5A6B80;font:inherit;font-size:20px;font-weight:900;display:grid;place-items:center;cursor:pointer;transition:transform .14s,border-color .14s,background .14s,color .14s}
.tl-chip:hover{border-color:#C2D0E8;transform:translateY(-2px)}
.tl-chip.done{background:#F2FCF8;border-color:#BFEBDD;color:#0A8F72}
.tl-chip.active,.tl-chip.done.active{background:linear-gradient(180deg,#7C6CF0,#5B4BD6);color:#fff;border-color:transparent;box-shadow:0 10px 20px -8px rgba(108,92,231,.95);transform:translateY(-2px)}
.tl-chip .dots{position:absolute;bottom:-9px;left:0;right:0;text-align:center;font-size:10px;line-height:1;color:var(--gold);letter-spacing:-1px}
.tl-divider{flex:0 0 auto;width:2px;height:30px;border-radius:2px;background:var(--line);margin:0 6px}
.tl-win{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:rgba(255,255,255,.74);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);border-radius:28px;overflow:hidden;animation:tl-fade .22s ease both}
@keyframes tl-fade{from{opacity:0}to{opacity:1}}
.tl-win-card{position:relative;z-index:2;background:#fff;border-radius:26px;padding:24px 30px;text-align:center;max-width:84%;box-shadow:0 24px 60px -20px rgba(59,46,140,.5);animation:tl-pop .34s cubic-bezier(.2,1.4,.5,1) both}
@keyframes tl-pop{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}
.tl-win-stars{display:flex;justify-content:center;gap:6px;font-size:46px;line-height:1}
.tl-win-stars i{font-style:normal;color:#E3EAF6;display:inline-block}
.tl-win-stars i.on{color:var(--gold);text-shadow:0 6px 14px rgba(245,179,1,.45);animation:tl-star .5s cubic-bezier(.2,1.6,.5,1) both}
.tl-win-stars i.on:nth-child(2){animation-delay:.15s}.tl-win-stars i.on:nth-child(3){animation-delay:.3s}
@keyframes tl-star{from{transform:scale(0) rotate(-120deg)}to{transform:scale(1) rotate(0)}}
.tl-win-card h2{margin:8px 0 2px;font-size:26px;letter-spacing:-.6px;color:#3B2E8C}
.tl-win-card p{margin:0 0 18px;color:var(--muted);font-weight:700;font-size:15px}
.tl-win-card p b{color:var(--purple);font-size:19px}
.tl-win-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.tl-confetti{position:absolute;top:-24px;border-radius:2px;animation:tl-fall 1.9s cubic-bezier(.3,.6,.6,1) forwards}
@keyframes tl-fall{0%{opacity:1}100%{transform:translateY(620px) rotate(620deg);opacity:0}}
@media (max-width:820px){
  .tl-stage{flex-direction:column;align-items:center;padding:6px 14px;gap:14px}
  .tl-side{width:100%;flex:0 0 auto;max-width:560px;flex-direction:row;flex-wrap:wrap}
  .tl-side .tl-card{flex:1}.tl-side .tl-card.row{flex:0 0 auto;flex-direction:column}
  .tl-card.row .tl-btn{padding:11px 12px;font-size:14px}
  .tl-brand{font-size:17px}.tl-pill{font-size:12.5px;padding:6px 11px}
}
@media (max-width:520px){
  .tl-screen{padding:24px 14px}
  .tl-screen-card,.tl-menu{padding:26px 18px;border-radius:22px}
  .tl-screen-logo{display:grid}
  .tl-mode-grid{grid-template-columns:1fr;margin-top:22px}
  .tl-mode-card{min-height:150px}
  .tl-menu-footer{font-size:12px}
  .tl-topbar{flex-wrap:wrap;justify-content:center;padding:10px 12px 6px}
  .tl-pills{gap:5px}
  .tl-icon-btn{width:34px;height:34px;font-size:14px}
  .tl-pill{padding:5px 9px}
  .tl-win-card{padding:20px 16px}
  .tl-side{flex-direction:column}.tl-side .tl-card.row{flex-direction:row}
  .tl-cov{font-size:22px}.tl-logo{display:none}
}
@media (prefers-reduced-motion:reduce){.tl-app *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;