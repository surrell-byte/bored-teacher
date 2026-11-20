'use client';

import React, { useRef, useEffect, useState } from "react";
import "./SpellcheckersOfAsgard.css";

/* =========================================================
   SPELLCHECKERS OF ASGARD — 128-bit (React/JSX port)
   ========================================================= */

const W = 640, H = 360;
const PORTRAIT_W = 360, PORTRAIT_H = 640;
const HORIZON = 190, BRIDGE_TOP = 220, FEET_Y = 244, UI_Y = 258;
const GATE_X0 = 36, GATE_Y0 = 76, GATE_W = 148, GATE_H = 170;
const GATE_CX = GATE_X0 + GATE_W / 2;
const HEIMDALL_HOME = 110, HEIMDALL_ASIDE = 208;
const PLAYER_START = 560, PLAYER_END = 300, PLAYER_THROUGH = 126;
const GOAL = 10;

const LEVELS = [
  {
    name: "ASGARD",
    words: [
      ["recieve", "receive"], ["seperate", "separate"],
      ["definately", "definitely"], ["occured", "occurred"],
      ["neccessary", "necessary"], ["wierd", "weird"],
      ["beleive", "believe"], ["acheive", "achieve"],
      ["begining", "beginning"], ["calender", "calendar"],
      ["tommorow", "tomorrow"], ["freind", "friend"],
      ["grammer", "grammar"], ["existance", "existence"],
      ["thier", "their"], ["untill", "until"],
      ["truely", "truly"], ["arguement", "argument"],
      ["goverment", "government"], ["enviroment", "environment"],
    ],
  },
  {
    name: "MIDGARD",
    words: [
      ["acommodate", "accommodate"], ["embarass", "embarrass"],
      ["rythm", "rhythm"], ["concience", "conscience"],
      ["millenium", "millennium"], ["pronounciation", "pronunciation"],
      ["questionaire", "questionnaire"], ["occurrance", "occurrence"],
      ["maintainance", "maintenance"], ["independant", "independent"],
      ["apparant", "apparent"], ["comittee", "committee"],
      ["garantee", "guarantee"], ["harrass", "harass"],
      ["liason", "liaison"], ["noticable", "noticeable"],
      ["priviledge", "privilege"], ["sucessful", "successful"],
      ["tolarance", "tolerance"], ["restaraunt", "restaurant"],
    ],
  },
  {
    name: "JOTUNHEIM",
    words: [
      ["bureacracy", "bureaucracy"], ["conscientous", "conscientious"],
      ["exagerate", "exaggerate"], ["innoculate", "inoculate"],
      ["pavillion", "pavilion"], ["perseverence", "perseverance"],
      ["playwrite", "playwright"], ["sacreligious", "sacrilegious"],
      ["supercede", "supersede"], ["threshhold", "threshold"],
      ["vaccuum", "vacuum"], ["withold", "withhold"],
      ["idiosyncracy", "idiosyncrasy"], ["congradulate", "congratulate"],
      ["dissapoint", "disappoint"], ["fourty", "forty"],
      ["mischevious", "mischievous"], ["neice", "niece"],
      ["posession", "possession"], ["tendancy", "tendency"],
      ["ragnorok", "ragnarok"], ["ygdrasil", "yggdrasil"],
      ["mjolnier", "mjolnir"], ["valhala", "valhalla"],
      ["asgaurd", "asgard"],
    ],
  },
  {
    name: "VANAHEIM",
    words: [
      ["happyness", "happiness"], ["beautifull", "beautiful"],
      ["occassion", "occasion"], ["completly", "completely"],
      ["diffrent", "different"], ["fourtunate", "fortunate"],
      ["confidance", "confidence"], ["libary", "library"],
      ["febuary", "February"], ["suprise", "surprise"],
      ["reccomend", "recommend"], ["exellent", "excellent"],
      ["embarassment", "embarrassment"], ["independantly", "independently"],
      ["arguements", "arguments"],
    ],
  },
  {
    name: "ALFHEIM",
    words: [
      ["relevent", "relevant"], ["immediatly", "immediately"],
      ["similiar", "similar"], ["inteligent", "intelligent"],
      ["neccessarily", "necessarily"], ["refered", "referred"],
      ["prefered", "preferred"], ["suround", "surround"],
      ["adition", "addition"], ["posible", "possible"],
      ["repitition", "repetition"], ["disapear", "disappear"],
      ["proffessional", "professional"], ["origional", "original"],
      ["indispensible", "indispensable"], ["archetecture", "architecture"],
    ],
  },
  {
    name: "SVARTALFHEIM",
    words: [
      ["acheivment", "achievement"], ["conveniant", "convenient"],
      ["excersize", "exercise"], ["strenght", "strength"],
      ["oppurtunity", "opportunity"], ["bussiness", "business"],
      ["ocurrance", "occurrence"], ["maintainance", "maintenance"],
      ["caluculate", "calculate"], ["recomendation", "recommendation"],
      ["comming", "coming"], ["permision", "permission"],
      ["perserverance", "perseverance"], ["equiptment", "equipment"],
      ["gague", "gauge"], ["embarased", "embarrassed"],
    ],
  },
  {
    name: "NIFLHEIM",
    words: [
      ["cemetary", "cemetery"], ["foriegn", "foreign"],
      ["concensus", "consensus"], ["embarassing", "embarrassing"],
      ["sence", "sense"], ["writting", "writing"],
      ["bizzare", "bizarre"], ["definate", "definite"],
      ["referance", "reference"], ["enought", "enough"],
      ["occurence", "occurrence"], ["sucess", "success"],
      ["aquire", "acquire"], ["releive", "relieve"],
      ["collegue", "colleague"], ["grammaticaly", "grammatically"],
    ],
  },
  {
    name: "MUSPELHEIM",
    words: [
      ["pharoah", "pharaoh"], ["ecstacy", "ecstasy"],
      ["auxillary", "auxiliary"], ["flourescent", "fluorescent"],
      ["publically", "publicly"], ["inocculate", "inoculate"],
      ["miniscule", "minuscule"], ["irresistable", "irresistible"],
      ["deteriate", "deteriorate"], ["reconnaisance", "reconnaissance"],
      ["entreprenuer", "entrepreneur"], ["manouver", "maneuver"],
      ["supress", "suppress"], ["restaraunt", "restaurant"],
      ["occassionally", "occasionally"], ["privelege", "privilege"],
    ],
  },
  {
    name: "HELHEIM",
    words: [
      ["accomodation", "accommodation"], ["conscientous", "conscientious"],
      ["idiosyncracy", "idiosyncrasy"], ["mischevious", "mischievous"],
      ["sacreligious", "sacrilegious"], ["vaccuum", "vacuum"],
      ["bureacracy", "bureaucracy"], ["perseverence", "perseverance"],
      ["supercede", "supersede"], ["threshhold", "threshold"],
      ["withold", "withhold"], ["conspicious", "conspicuous"],
      ["unecessary", "unnecessary"], ["unforseen", "unforeseen"],
      ["millenia", "millennia"], ["wierdness", "weirdness"],
    ],
  },
];

const RUNES = [
  [[0.5, 0.05, 0.5, 0.95], [0.5, 0.2, 0.86, 0.46], [0.5, 0.5, 0.86, 0.76]],
  [[0.5, 0.05, 0.14, 0.5], [0.5, 0.05, 0.86, 0.5], [0.5, 0.05, 0.5, 0.95]],
  [[0.14, 0.1, 0.86, 0.9], [0.86, 0.1, 0.14, 0.9]],
  [[0.5, 0.05, 0.86, 0.5], [0.86, 0.5, 0.5, 0.95], [0.5, 0.95, 0.14, 0.5], [0.14, 0.5, 0.5, 0.05]],
  [[0.5, 0.05, 0.5, 0.95], [0.14, 0.34, 0.86, 0.34]],
  [[0.14, 0.2, 0.86, 0.2], [0.86, 0.2, 0.14, 0.52], [0.14, 0.52, 0.86, 0.84]],
];

const BIFROST = ["#ff4d4d", "#ff8c3a", "#ffe14d", "#5be07a", "#4dabff", "#7a5bff", "#c86bff", "#ff6bd0"];

/* ---------- helpers ---------- */
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function AsgardGameCanvas({ onWin, playerName }) {
  const canvasRef = useRef(null);
  const portraitRef = useRef(false);
  const stateRef = useRef(null);
  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;
  const answerInputRef = useRef(null);
  const submitRef = useRef(null);
  const [answerValue, setAnswerValue] = useState("");
  const [clue, setClue] = useState("");

  /* -------- canvas scale on resize -------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const onResize = () => {
      const isPortrait = window.matchMedia("(max-width: 760px) and (orientation: portrait)").matches;
      portraitRef.current = isPortrait;
      const logicalWidth = isPortrait ? PORTRAIT_W : W;
      const logicalHeight = isPortrait ? PORTRAIT_H : H;
      const maxW = Math.max(1, window.innerWidth - 32);
      const maxH = Math.max(1, window.innerHeight - (isPortrait ? 260 : 200));
      const fit = Math.min(maxW / logicalWidth, maxH / logicalHeight, 1.5);
      const s = fit >= 1 ? Math.floor(fit) : fit;
      if (canvas.width !== logicalWidth || canvas.height !== logicalHeight) {
        canvas.width = logicalWidth;
        canvas.height = logicalHeight;
        canvas.getContext("2d").imageSmoothingEnabled = false;
      }
      canvas.style.width = logicalWidth * s + "px";
      canvas.style.height = logicalHeight * s + "px";
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* -------- game boot -------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    /* ====================== helpers ====================== */
    const rect = (x, y, w, h, c) => {
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    };

    const archPath = (x0, y0, w, h) => {
      const cx = x0 + w / 2;
      const r = w / 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0 + h);
      ctx.lineTo(x0, y0 + r);
      ctx.arc(cx, y0 + r, r, Math.PI, 0, false);
      ctx.lineTo(x0 + w, y0 + h);
      ctx.closePath();
    };

    const drawRune = (x, y, s, idx, color, alpha) => {
      const p = RUNES[idx % RUNES.length];
      ctx.globalAlpha = alpha == null ? 1 : alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, s * 0.13);
      ctx.lineCap = "round";
      for (let i = 0; i < p.length; i++) {
        const l = p[i];
        ctx.beginPath();
        ctx.moveTo(x + l[0] * s, y + l[1] * s);
        ctx.lineTo(x + l[2] * s, y + l[3] * s);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    /* ====================== audio ====================== */
    let actx = null;
    let noiseBuf = null;
    const ac = () => {
      if (!actx) {
        try {
          actx = new (window.AudioContext || window.webkitAudioContext)();
        } catch { return null; }
      }
      if (actx.state === "suspended") actx.resume();
      return actx;
    };
    const tone = (freq, dur, type, vol, delay) => {
      const a = ac(); if (!a) return;
      const t0 = a.currentTime + (delay || 0);
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.05, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t0 + dur + 0.04);
    };
    const getNoise = (a) => {
      if (!noiseBuf) {
        noiseBuf = a.createBuffer(1, Math.floor(a.sampleRate * 0.6), a.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      return noiseBuf;
    };
    const noiseHit = (dur, vol, delay, freq, q) => {
      const a = ac(); if (!a) return;
      const t0 = a.currentTime + (delay || 0);
      const src = a.createBufferSource(); src.buffer = getNoise(a);
      const f = a.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = freq || 340; f.Q.value = q || 0.9;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(a.destination);
      src.start(t0); src.stop(t0 + dur + 0.06);
    };

    /* ====================== state ====================== */
    const S = {
      screen: "title",
      level: 0,
      streak: 0,
      typed: "",
      correctAnswers: 0,
      attempts: 0,
      winReported: false,
      word: null,
      pool: [],
      t: 0,
      playerX: PLAYER_START,
      playerTX: PLAYER_START,
      playerAlpha: 1,
      heimdallX: HEIMDALL_HOME,
      heimdallTX: HEIMDALL_HOME,
      msg: null,
      shake: 0,
      flash: 0,
      failT: 0,
      clearT: 0,
      charge: 0,
    };
    stateRef.current = S;

    /* ====================== particles ====================== */
    const P = [];
    const addP = (o) => { if (P.length > 500) P.shift(); P.push(o); };
    const burst = (x, y, n, color, speed, life, size, grav) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = speed * (0.3 + Math.random() * 0.9);
        addP({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          g: grav == null ? 60 : grav,
          drag: 1.4,
          life: life * (0.6 + Math.random() * 0.7),
          maxLife: life,
          color,
          s: size * (0.6 + Math.random() * 0.8),
          alpha: 1,
        });
      }
    };
    const updateP = (dt) => {
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.life -= dt;
        if (p.life <= 0) { P.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += p.g * dt;
        p.vx *= Math.max(0, 1 - p.drag * dt);
      }
    };
    const drawP = () => {
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const a = Math.min(1, p.life / (p.maxLife * 0.6));
        ctx.globalAlpha = a * p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
    };

    /* ====================== backdrop layers ====================== */
    const LW = W + 96;

    const makeLayer = (w, h, fn) => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const g = c.getContext("2d");
      g.imageSmoothingEnabled = false;
      fn(g, w, h);
      return c;
    };

    const nebulaLayer = makeLayer(LW, 240, (g) => {
      g.globalCompositeOperation = "lighter";
      const rnd = mulberry32(99);
      const blobs = [
        [130, 60, 160, "rgba(96,42,168,0.55)"],
        [330, 108, 190, "rgba(42,64,178,0.45)"],
        [520, 50, 170, "rgba(158,44,148,0.42)"],
        [700, 118, 150, "rgba(32,126,168,0.42)"],
        [240, 164, 130, "rgba(126,32,116,0.34)"],
        [440, 30, 120, "rgba(60,180,200,0.22)"],
        [620, 90, 100, "rgba(180,90,220,0.28)"],
      ];
      for (const b of blobs) {
        const rg = g.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
        rg.addColorStop(0, b[3]);
        rg.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = rg;
        g.fillRect(b[0] - b[2], b[1] - b[2], b[2] * 2, b[2] * 2);
      }
      g.globalCompositeOperation = "source-over";
      for (let i = 0; i < 260; i++) {
        const x = rnd() * LW, y = rnd() * 210, r = rnd();
        g.fillStyle = "rgba(200,220,255," + (0.04 + r * 0.16).toFixed(3) + ")";
        g.fillRect(x | 0, y | 0, r < 0.85 ? 1 : 2, r < 0.85 ? 1 : 2);
      }
    });

    const cityLayer = makeLayer(LW, 240, (g) => {
      const rnd = mulberry32(4242);

      g.fillStyle = "#241546";
      g.beginPath();
      g.moveTo(0, HORIZON + 4);
      let x = 0;
      while (x < LW + 40) {
        const w = 50 + rnd() * 90;
        const h = 16 + rnd() * 44;
        g.lineTo(x + w * 0.45, HORIZON + 4 - h);
        g.lineTo(x + w, HORIZON + 4);
        x += w;
      }
      g.lineTo(LW, 240); g.lineTo(0, 240); g.closePath(); g.fill();

      g.fillStyle = "#1a0f34";
      g.beginPath();
      g.moveTo(0, HORIZON + 10);
      x = -20;
      while (x < LW + 60) {
        const w = 70 + rnd() * 110;
        const h = 8 + rnd() * 26;
        g.lineTo(x + w * 0.5, HORIZON + 10 - h);
        g.lineTo(x + w, HORIZON + 10);
        x += w;
      }
      g.lineTo(LW, 240); g.lineTo(0, 240); g.closePath(); g.fill();

      const n = 26;
      for (let i = 0; i < n; i++) {
        const sx = 20 + (i * (LW - 40)) / (n - 1) + (rnd() - 0.5) * 16;
        const sh = 20 + rnd() * 62;
        const sw = 9 + rnd() * 11;
        const baseY = HORIZON + 6;
        const topY = baseY - sh;
        g.fillStyle = "#2b1650";
        g.fillRect(sx, topY, sw, sh);
        g.fillStyle = "rgba(120,80,180,0.35)";
        g.fillRect(sx, topY, Math.max(1, sw * 0.4), sh);
        g.fillStyle = "#3d2270";
        g.fillRect(sx + sw / 2 - 1, topY - 5, 2, 5);
        g.fillRect(sx + sw / 2 - 2.5, topY - 8, 5, 3);
        const rows = Math.floor(sh / 7);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < 2; c++) {
            const wx = sx + 2 + (c * (sw - 4)) / 2;
            const wy = topY + 5 + r * 7;
            if (wx + 2 > sx + sw - 1) continue;
            const lit = (r * 7 + c * 5 + i * 13) % 7 < 3;
            g.fillStyle = lit ? "rgba(255,206,90,0.95)" : "rgba(30,16,58,1)";
            g.fillRect(wx | 0, wy | 0, 2, 2);
            if (lit) {
              g.fillStyle = "rgba(255,206,90,0.18)";
              g.fillRect((wx | 0) - 1, (wy | 0) - 1, 4, 4);
            }
          }
        }
      }
    });

    const skyGrad = (() => {
      const g = ctx.createLinearGradient(0, 0, 0, HORIZON + 30);
      g.addColorStop(0.0, "#04020e");
      g.addColorStop(0.3, "#130a30");
      g.addColorStop(0.58, "#2b1150");
      g.addColorStop(0.8, "#4e1b58");
      g.addColorStop(1.0, "#7d2f5e");
      return g;
    })();

    const stars = (() => {
      const rnd = mulberry32(2024);
      const arr = [];
      for (let i = 0; i < 150; i++) {
        const layer = i < 70 ? 0 : i < 120 ? 1 : 2;
        arr.push({
          x: rnd() * LW,
          y: rnd() * (HORIZON - 10),
          layer,
          s: layer === 2 ? (rnd() < 0.35 ? 2 : 1) : 1,
          ph: rnd() * Math.PI * 2,
          sp: 0.6 + rnd() * 2.2,
        });
      }
      return arr;
    })();

    /* ====================== game flow ====================== */
    let emberTimer = 0;

    const resetLevel = (i) => {
      S.level = i;
      S.streak = 0;
      S.typed = "";
      S.pool = shuffle(LEVELS[i].words.slice());
      S.playerX = PLAYER_START;
      S.playerTX = PLAYER_START;
      S.playerAlpha = 1;
      S.heimdallX = HEIMDALL_HOME;
      S.heimdallTX = HEIMDALL_HOME;
      S.screen = "play";
      S.charge = 0;
      S.msg = { text: "LEVEL " + (i + 1), sub: LEVELS[i].name, color: "#e8c34a", t: 2.4 };
      if (!S.pool.length) S.pool = shuffle(LEVELS[i].words.slice());
      S.word = S.pool.pop();
      setClue(S.word[0]);
      P.length = 0;
    };

    const nextWord = () => {
      if (!S.pool.length) S.pool = shuffle(LEVELS[S.level].words.slice());
      S.word = S.pool.pop();
      setClue(S.word[0]);
    };

    const submit = () => {
      if (S.screen !== "play" || !S.word) return;
      S.attempts++;
      const typed = S.typed.trim().toLowerCase().replace(/\s+/g, " ");
      const answer = S.word[1].toLowerCase();

      if (typed === answer) {
        S.correctAnswers++;
        S.streak++;
        S.playerTX = PLAYER_START - ((PLAYER_START - PLAYER_END) * S.streak) / GOAL;
        S.typed = "";
        setAnswerValue("");
        S.flash = 0.16;
        burst(GATE_CX, 150, 14, "#a8f0ff", 110, 0.75, 2, 40);
        tone(880, 0.09, "square", 0.045);
        tone(1320, 0.11, "square", 0.04, 0.075);

        if (S.streak >= GOAL) {
          S.screen = "levelclear";
          S.clearT = 3.4;
          S.playerTX = PLAYER_THROUGH;
          S.heimdallTX = HEIMDALL_ASIDE;
          S.msg = { text: "PASS, WARRIOR.", sub: "", color: "#7fe8ff", t: 2.8 };
          burst(GATE_CX, 170, 60, "#b8f6ff", 160, 1.4, 3, 30);
          burst(GATE_CX, 200, 40, "#ffe14d", 130, 1.2, 2, 20);
          tone(660, 0.14, "triangle", 0.055);
          tone(880, 0.16, "triangle", 0.055, 0.16);
          tone(1320, 0.34, "triangle", 0.055, 0.34);
        } else {
          S.msg = { text: "CORRECT!", sub: "", color: "#5be07a", t: 0.7 };
          nextWord();
        }
      } else {
        S.screen = "fail";
        S.failT = 2.7;
        S.shake = 1;
        S.typed = "";
        setAnswerValue("");
        S.playerTX = PLAYER_START;
        S.msg = {
          text: "THOU SHALT NOT PASS!",
          sub: "The correct rune was: " + S.word[1],
          color: "#ff5a5a",
          t: 2.7,
        };
        burst(GATE_CX, 160, 26, "#ff5a5a", 150, 0.9, 2, 90);
        noiseHit(0.3, 0.09, 0, 260, 0.7);
        tone(150, 0.3, "sawtooth", 0.055, 0.02);
        tone(98, 0.38, "sawtooth", 0.05, 0.16);
      }
    };
    submitRef.current = submit;

    /* ====================== input ====================== */
    const onKey = (e) => {
      if (e.target === answerInputRef.current) return;
      if (e.target instanceof Element && e.target.closest("button")) return;
      const k = e.key;
      if (["Backspace", " ", "Enter", "Tab", "/", "'"].includes(k)) e.preventDefault();

      if (S.screen === "title") {
        if (k === "Enter" || k === " ") { ac(); resetLevel(0); }
        return;
      }
      if (S.screen === "win") {
        if (k === "Enter" || k === "r" || k === "R") { S.screen = "title"; }
        return;
      }
      if (S.screen !== "play") return;

      if (k === "Enter") submit();
      else if (k === "Backspace") {
        if (S.typed.length) {
          S.typed = S.typed.slice(0, -1);
          setAnswerValue(S.typed);
          tone(220, 0.04, "square", 0.025);
        }
      } else if (k.length === 1 && /[a-zA-Z'\- ]/.test(k)) {
        if (S.typed.length < 26) {
          S.typed += k;
          setAnswerValue(S.typed);
          tone(540 + Math.random() * 260, 0.03, "square", 0.018);
        }
      }
    };
    window.addEventListener("keydown", onKey);

    /* ====================== update ====================== */
    const update = (dt) => {
      S.t += dt;
      const speed = S.screen === "levelclear" ? 3.0 : 7.0;
      S.playerX = lerp(S.playerX, S.playerTX, Math.min(1, dt * speed));
      S.heimdallX = lerp(S.heimdallX, S.heimdallTX, Math.min(1, dt * 3.4));

      const targetCharge =
        (S.streak / GOAL) * 0.35 +
        (S.screen === "levelclear" ? (1 - clamp(S.clearT / 3.4, 0, 1)) * 0.9 : 0);
      S.charge = lerp(S.charge, targetCharge, Math.min(1, dt * 4));

      if (S.screen === "levelclear") {
        S.playerAlpha = clamp((S.playerX - PLAYER_THROUGH) / 95, 0, 1);
      } else {
        S.playerAlpha = 1;
      }

      if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 2.8);
      if (S.flash > 0) S.flash = Math.max(0, S.flash - dt * 1.6);

      if (S.msg) {
        S.msg.t -= dt;
        if (S.msg.t <= 0) S.msg = null;
      }

      emberTimer -= dt;
      if (emberTimer <= 0) {
        emberTimer = 0.05 + Math.random() * 0.08;
        addP({
          x: GATE_CX + (Math.random() - 0.5) * 90,
          y: FEET_Y - 6 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 14,
          vy: -18 - Math.random() * 34,
          g: -6,
          drag: 0.5,
          life: 1.2 + Math.random() * 1.2,
          maxLife: 2.4,
          color: Math.random() < 0.5 ? "#a8f0ff" : "#ffe14d",
          s: 1 + Math.random() * 1.6,
          alpha: 0.55,
        });
      }

      updateP(dt);

      if (S.screen === "fail") {
        S.failT -= dt;
        if (S.failT <= 0) {
          S.streak = 0;
          S.playerTX = PLAYER_START;
          S.pool = shuffle(LEVELS[S.level].words.slice());
          nextWord();
          S.screen = "play";
        }
      }

      if (S.screen === "levelclear") {
        S.clearT -= dt;
        if (S.clearT <= 0) {
          if (S.level < LEVELS.length - 1) {
            resetLevel(S.level + 1);
          } else {
            S.screen = "win";
            S.heimdallTX = HEIMDALL_HOME;
            S.playerX = PLAYER_THROUGH;
            S.playerTX = PLAYER_THROUGH;
            S.playerAlpha = 0;
            if (!S.winReported) {
              S.winReported = true;
              const accuracy = Math.round((S.correctAnswers / Math.max(1, S.attempts)) * 100);
              onWinRef.current?.(S.correctAnswers * 10, accuracy);
            }
          }
        }
      }
    };

    /* ====================== drawing ====================== */
    const drawSky = (t) => {
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, HORIZON + 30);
      const camX = Math.sin(t * 0.11) * 10;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(nebulaLayer, -48 + camX * 0.5, 0);
      ctx.globalAlpha = 1;
      for (const s of stars) {
        const par = s.layer === 0 ? 0.25 : s.layer === 1 ? 0.5 : 0.8;
        const x = s.x - 48 + camX * par;
        if (x < -4 || x > W + 4) continue;
        const tw = 0.28 + 0.72 * Math.abs(Math.sin(t * s.sp + s.ph));
        ctx.globalAlpha = tw * (s.layer === 2 ? 1 : 0.8);
        ctx.fillStyle = s.layer === 2 ? "#ffffff" : "#cfe4ff";
        ctx.fillRect(x | 0, s.y | 0, s.s, s.s);
        if (s.layer === 2 && tw > 0.85) {
          ctx.globalAlpha = 0.35;
          ctx.fillRect((x | 0) - 1, s.y | 0, 3, 1);
          ctx.fillRect(x | 0, (s.y | 0) - 1, 1, 3);
        }
      }
      ctx.globalAlpha = 1;
      for (let b = 0; b < 3; b++) {
        const yBase = 40 + b * 26;
        ctx.globalAlpha = 0.06;
        for (let x = 0; x < W; x += 3) {
          const yy =
            yBase +
            Math.sin(x * 0.014 + t * 0.55 + b * 1.9) * 16 +
            Math.sin(x * 0.041 - t * 0.3 + b) * 6;
          const hgt = 10 + Math.sin(x * 0.02 + t + b) * 6;
          ctx.fillStyle = b === 0 ? "#7fe8ff" : b === 1 ? "#c86bff" : "#5be07a";
          ctx.fillRect(x, yy, 3, hgt);
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawBackdrop = (t) => {
      const camX = Math.sin(t * 0.11) * 10;
      const hz = ctx.createLinearGradient(0, HORIZON - 40, 0, HORIZON + 12);
      hz.addColorStop(0, "rgba(140,60,140,0)");
      hz.addColorStop(1, "rgba(200,110,170,0.30)");
      ctx.fillStyle = hz;
      ctx.fillRect(0, HORIZON - 40, W, 52);
      ctx.drawImage(cityLayer, -48 + camX * 0.8, 0);
      const cg = ctx.createLinearGradient(0, HORIZON - 70, 0, HORIZON + 6);
      cg.addColorStop(0, "rgba(255,190,80,0)");
      cg.addColorStop(1, "rgba(255,190,80,0.14)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, HORIZON - 70, W, 76);
    };

    const drawBridge = (t) => {
      const n = BIFROST.length;
      const bh = (FEET_Y - BRIDGE_TOP + 2) / n;
      for (let i = 0; i < n; i++) {
        const y = BRIDGE_TOP + i * bh;
        rect(0, y, W, bh + 1, BIFROST[i]);
        ctx.globalAlpha = 0.22;
        rect(0, y, W, 1, "#ffffff");
        ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < n; i++) {
        const y = BRIDGE_TOP + i * bh;
        const shift = ((t * 90 + i * 34) % 220) - 60;
        for (let x = -60; x < W + 120; x += 220) {
          const gx = x + shift;
          const g = ctx.createLinearGradient(gx, 0, gx + 70, 0);
          g.addColorStop(0, "rgba(255,255,255,0)");
          g.addColorStop(0.5, "rgba(255,255,255,1)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(gx, y, 70, bh + 0.5);
        }
      }
      ctx.globalAlpha = 1;
      const eg = ctx.createLinearGradient(0, BRIDGE_TOP - 8, 0, BRIDGE_TOP + 4);
      eg.addColorStop(0, "rgba(255,255,255,0)");
      eg.addColorStop(1, "rgba(255,255,255,0.35)");
      ctx.fillStyle = eg;
      ctx.fillRect(0, BRIDGE_TOP - 8, W, 12);
      const gg = ctx.createLinearGradient(0, FEET_Y, 0, UI_Y);
      gg.addColorStop(0, "#120a24");
      gg.addColorStop(1, "#08040f");
      ctx.fillStyle = gg;
      ctx.fillRect(0, FEET_Y, W, UI_Y - FEET_Y);
      ctx.globalAlpha = 0.5;
      rect(0, FEET_Y, W, 1, "#3a2a6a");
      ctx.globalAlpha = 1;
    };

    const drawGate = (t, charge) => {
      ctx.save();
      archPath(GATE_X0, GATE_Y0, GATE_W, GATE_H);
      ctx.clip();
      const fg = ctx.createLinearGradient(0, GATE_Y0, 0, FEET_Y + 4);
      fg.addColorStop(0.0, "#f3df8a");
      fg.addColorStop(0.2, "#d8b03c");
      fg.addColorStop(0.55, "#a07c1c");
      fg.addColorStop(0.85, "#6a4a10");
      fg.addColorStop(1.0, "#3a2608");
      ctx.fillStyle = fg;
      ctx.fillRect(GATE_X0, GATE_Y0, GATE_W, GATE_H);
      ctx.strokeStyle = "rgba(38,24,0,0.55)";
      ctx.lineWidth = 1;
      for (let y = GATE_Y0; y < FEET_Y + 6; y += 17) {
        ctx.beginPath();
        ctx.moveTo(GATE_X0, Math.round(y) + 0.5);
        ctx.lineTo(GATE_X0 + GATE_W, Math.round(y) + 0.5);
        ctx.stroke();
      }
      for (let row = 0; row < 11; row++) {
        const y = GATE_Y0 + row * 17;
        const off = (row % 2) * 13;
        for (let x = GATE_X0 + off; x < GATE_X0 + GATE_W; x += 26) {
          ctx.beginPath();
          ctx.moveTo(Math.round(x) + 0.5, y);
          ctx.lineTo(Math.round(x) + 0.5, y + 17);
          ctx.stroke();
        }
      }
      ctx.strokeStyle = "rgba(255,240,170,0.35)";
      ctx.beginPath();
      ctx.moveTo(GATE_X0 + 2, FEET_Y);
      ctx.lineTo(GATE_X0 + 2, GATE_Y0 + GATE_W / 2);
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i < 4; i++) {
        const yy = 150 + i * 24;
        const glow = 0.35 + 0.35 * Math.sin(t * 2.2 + i * 0.9) + charge * 0.5;
        drawRune(GATE_X0 + 5, yy, 12, i, "#ffd75e", Math.min(1, glow));
        drawRune(GATE_X0 + GATE_W - 17, yy, 12, i + 3, "#ffd75e", Math.min(1, glow));
      }

      const px0 = GATE_X0 + 16, py0 = GATE_Y0 + 16;
      const pw = GATE_W - 32, ph = GATE_H - 16;

      ctx.save();
      archPath(px0, py0, pw, ph);
      ctx.clip();
      const pg = ctx.createRadialGradient(GATE_CX, FEET_Y - 34, 4, GATE_CX, FEET_Y - 52, 118);
      pg.addColorStop(0.0, "#ffffff");
      pg.addColorStop(0.16, "#c8f8ff");
      pg.addColorStop(0.36, "#5cc4ff");
      pg.addColorStop(0.58, "#3a56d8");
      pg.addColorStop(0.8, "#2a1a78");
      pg.addColorStop(1.0, "#100828");
      ctx.fillStyle = pg;
      ctx.fillRect(px0, py0, pw, ph);

      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 7; i++) {
        const a = t * (0.6 + i * 0.09) + i * 1.13;
        const rr = 26 + i * 11 + Math.sin(t * 1.4 + i) * 7;
        const ox = GATE_CX + Math.cos(a * 0.7) * 14;
        const oy = FEET_Y - 58 + Math.sin(a * 0.9) * 18;
        ctx.beginPath();
        ctx.arc(ox, oy, rr, a, a + 1.35);
        ctx.strokeStyle = "rgba(170,240,255," + (0.2 - i * 0.021).toFixed(3) + ")";
        ctx.lineWidth = 2.5 + i * 1.4;
        ctx.stroke();
      }
      const core = ctx.createRadialGradient(
        GATE_CX, FEET_Y - 40, 0,
        GATE_CX, FEET_Y - 40, 58 + charge * 26
      );
      core.addColorStop(0, "rgba(255,255,255," + (0.55 + charge * 0.4) + ")");
      core.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = core;
      ctx.fillRect(px0, py0, pw, ph);
      for (let i = 0; i < 16; i++) {
        const seed = i * 37.7;
        const yy = FEET_Y - ((t * 34 + seed) % (ph + 10));
        const xx = GATE_CX + Math.sin(t * 1.6 + seed) * (28 + (i % 4) * 8);
        const aa = clamp((yy - py0) / ph, 0, 1);
        ctx.globalAlpha = 0.45 * aa;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(xx | 0, yy | 0, 2, 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();

      ctx.save();
      archPath(px0, py0, pw, ph);
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      const ks = ctx.createLinearGradient(0, GATE_Y0 - 4, 0, GATE_Y0 + 22);
      ks.addColorStop(0, "#fff3b0");
      ks.addColorStop(1, "#b8912a");
      ctx.fillStyle = ks;
      ctx.beginPath();
      ctx.moveTo(GATE_CX, GATE_Y0 - 10);
      ctx.lineTo(GATE_CX + 13, GATE_Y0 + 4);
      ctx.lineTo(GATE_CX + 9, GATE_Y0 + 24);
      ctx.lineTo(GATE_CX - 9, GATE_Y0 + 24);
      ctx.lineTo(GATE_CX - 13, GATE_Y0 + 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(60,38,0,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const gemGlow = 0.55 + 0.45 * Math.sin(t * 3.4) + charge * 0.6;
      ctx.globalAlpha = Math.min(1, gemGlow);
      rect(GATE_CX - 3, GATE_Y0 + 6, 6, 6, "#7fe8ff");
      ctx.globalAlpha = 1;
      rect(GATE_CX - 2, GATE_Y0 + 7, 4, 4, "#ffffff");

      ctx.globalCompositeOperation = "lighter";
      const bloom = ctx.createRadialGradient(
        GATE_CX, FEET_Y - 70, 10,
        GATE_CX, FEET_Y - 70, 190 + charge * 70
      );
      bloom.addColorStop(0, "rgba(150,235,255," + (0.2 + charge * 0.3) + ")");
      bloom.addColorStop(0.5, "rgba(90,140,255," + (0.09 + charge * 0.14) + ")");
      bloom.addColorStop(1, "rgba(60,90,200,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, FEET_Y + 10);
      ctx.globalCompositeOperation = "source-over";
    };

    const drawHeimdall = (cx, fy, t) => {
      const y = Math.round(fy + Math.sin(t * 1.35) * 0.9);
      const x = Math.round(cx);
      ctx.globalAlpha = 0.34;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.ellipse(x, fy - 2, 26, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      const sw = Math.sin(t * 1.75) * 3.4;
      const capeG = ctx.createLinearGradient(x - 26, y - 60, x + 26, y - 2);
      capeG.addColorStop(0.0, "#b02a2a");
      capeG.addColorStop(0.45, "#8b1a1a");
      capeG.addColorStop(1.0, "#4a0a0a");
      ctx.fillStyle = capeG;
      ctx.beginPath();
      ctx.moveTo(x - 15, y - 60);
      ctx.quadraticCurveTo(x - 32, y - 34, x - 27 + sw, y - 1);
      ctx.lineTo(x + 27 + sw, y - 1);
      ctx.quadraticCurveTo(x + 32, y - 34, x + 15, y - 60);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(216,168,40,0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "#3a0808";
      ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 10, y - 54);
        ctx.quadraticCurveTo(x + i * 16 + sw * 0.5, y - 28, x + i * 19 + sw, y - 3);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      rect(x - 15, y - 9, 13, 9, "#3a2c0c");
      rect(x + 2, y - 9, 13, 9, "#3a2c0c");
      rect(x - 15, y - 9, 13, 2, "#6a5220");
      rect(x + 2, y - 9, 13, 2, "#6a5220");

      const legG = ctx.createLinearGradient(x, y - 28, x, y - 8);
      legG.addColorStop(0, "#d8a828");
      legG.addColorStop(1, "#8a6a20");
      ctx.fillStyle = legG;
      ctx.fillRect(x - 13, y - 28, 11, 20);
      ctx.fillRect(x + 2, y - 28, 11, 20);
      rect(x - 13, y - 22, 11, 3, "#f0d060");
      rect(x + 2, y - 22, 11, 3, "#f0d060");

      const torsoG = ctx.createLinearGradient(x - 18, y - 56, x + 18, y - 26);
      torsoG.addColorStop(0.0, "#f5e08a");
      torsoG.addColorStop(0.35, "#e8c34a");
      torsoG.addColorStop(0.75, "#b8912a");
      torsoG.addColorStop(1.0, "#7a5c14");
      ctx.fillStyle = torsoG;
      ctx.beginPath();
      ctx.moveTo(x - 17, y - 56);
      ctx.lineTo(x + 17, y - 56);
      ctx.lineTo(x + 14, y - 26);
      ctx.lineTo(x - 14, y - 26);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(90,60,0,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 13, y - 50); ctx.lineTo(x + 13, y - 50);
      ctx.moveTo(x - 12, y - 44); ctx.lineTo(x + 12, y - 44);
      ctx.stroke();
      rect(x - 16, y - 30, 32, 5, "#5a3f0a");
      rect(x - 4, y - 31, 8, 7, "#e8c34a");
      rect(x - 2, y - 29, 4, 3, "#7fe8ff");

      const gemA = 0.6 + 0.4 * Math.sin(t * 3.1);
      ctx.globalAlpha = gemA;
      rect(x - 4, y - 48, 8, 8, "#7fe8ff");
      ctx.globalAlpha = 1;
      rect(x - 3, y - 47, 6, 6, "#d8ffff");
      rect(x - 2, y - 46, 4, 4, "#ffffff");

      const pauldG = ctx.createLinearGradient(x - 26, y - 58, x - 10, y - 44);
      pauldG.addColorStop(0, "#fdf0a0");
      pauldG.addColorStop(1, "#a07c1c");
      ctx.fillStyle = pauldG;
      ctx.beginPath();
      ctx.ellipse(x - 17, y - 53, 10, 7, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 17, y - 53, 10, 7, 0.25, 0, Math.PI * 2);
      ctx.fill();

      const armG = ctx.createLinearGradient(0, y - 54, 0, y - 26);
      armG.addColorStop(0, "#d8a828");
      armG.addColorStop(1, "#8a6a20");
      ctx.fillStyle = armG;
      ctx.fillRect(x - 25, y - 50, 8, 22);
      ctx.fillRect(x + 17, y - 50, 8, 22);
      rect(x - 25, y - 30, 8, 7, "#e8b98a");
      rect(x + 17, y - 30, 8, 7, "#e8b98a");

      const hx = x + 22, hy = y - 46;
      const hornG = ctx.createLinearGradient(hx, hy, hx + 16, hy + 26);
      hornG.addColorStop(0, "#fdf0a0");
      hornG.addColorStop(0.5, "#d8b030");
      hornG.addColorStop(1, "#8a6a20");
      ctx.fillStyle = hornG;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + 5, hy);
      ctx.lineTo(hx + 15, hy + 24);
      ctx.lineTo(hx + 9, hy + 26);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(60,38,0,0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.strokeStyle = "rgba(60,38,0,0.5)";
      for (let i = 1; i <= 3; i++) {
        const p = i / 4;
        ctx.beginPath();
        ctx.moveTo(hx + p * 12, hy + p * 22);
        ctx.lineTo(hx + 3 + p * 12, hy + 2 + p * 22);
        ctx.stroke();
      }

      const skinG = ctx.createLinearGradient(x - 9, y - 60, x + 9, y - 44);
      skinG.addColorStop(0, "#f5cfa8");
      skinG.addColorStop(1, "#c99a6a");
      ctx.fillStyle = skinG;
      ctx.fillRect(x - 8, y - 60, 16, 13);

      const beardG = ctx.createLinearGradient(0, y - 52, 0, y - 38);
      beardG.addColorStop(0, "#ffffff");
      beardG.addColorStop(1, "#c8c4bc");
      ctx.fillStyle = beardG;
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 51);
      ctx.lineTo(x + 9, y - 51);
      ctx.lineTo(x + 7, y - 38);
      ctx.lineTo(x - 7, y - 38);
      ctx.closePath();
      ctx.fill();
      rect(x - 7, y - 52, 14, 2, "#ffffff");

      const helmG = ctx.createLinearGradient(x - 11, y - 72, x + 11, y - 58);
      helmG.addColorStop(0.0, "#fff5b8");
      helmG.addColorStop(0.45, "#e8c34a");
      helmG.addColorStop(1.0, "#9a7618");
      ctx.fillStyle = helmG;
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 60);
      ctx.lineTo(x - 9, y - 70);
      ctx.lineTo(x + 9, y - 70);
      ctx.lineTo(x + 11, y - 60);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(70,48,0,0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
      rect(x - 1.5, y - 62, 3, 9, "#d8b03c");

      ctx.fillStyle = "#f3e6b0";
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 68);
      ctx.quadraticCurveTo(x - 20, y - 74, x - 18, y - 84);
      ctx.quadraticCurveTo(x - 13, y - 78, x - 8, y - 70);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 10, y - 68);
      ctx.quadraticCurveTo(x + 20, y - 74, x + 18, y - 84);
      ctx.quadraticCurveTo(x + 13, y - 78, x + 8, y - 70);
      ctx.closePath();
      ctx.fill();

      const eyeGlow = 0.55 + 0.45 * Math.sin(t * 4.2);
      ctx.globalAlpha = eyeGlow;
      rect(x - 6, y - 57, 4, 3, "#7fe8ff");
      rect(x + 2, y - 57, 4, 3, "#7fe8ff");
      ctx.globalAlpha = 1;
      rect(x - 6, y - 57, 4, 1, "#ffffff");
      rect(x + 2, y - 57, 4, 1, "#ffffff");

      ctx.globalCompositeOperation = "lighter";
      const eg = ctx.createRadialGradient(x, y - 56, 0, x, y - 56, 16);
      eg.addColorStop(0, "rgba(127,232,255," + 0.22 * eyeGlow + ")");
      eg.addColorStop(1, "rgba(127,232,255,0)");
      ctx.fillStyle = eg;
      ctx.fillRect(x - 20, y - 76, 40, 40);
      ctx.globalCompositeOperation = "source-over";
    };

    const drawPlayer = (cx, fy, t, moving) => {
      const bob = moving ? Math.abs(Math.sin(t * 13)) * 1.8 : Math.sin(t * 2) * 0.6;
      const y = Math.round(fy - bob);
      const x = Math.round(cx);
      const step = moving ? Math.sin(t * 13) : 0;

      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.ellipse(x, fy - 1, 17, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      const sw = Math.sin(t * 3.2 + step) * 2.4;
      const capeG = ctx.createLinearGradient(x - 4, y - 42, x + 20, y - 2);
      capeG.addColorStop(0, "#25406b");
      capeG.addColorStop(1, "#101c38");
      ctx.fillStyle = capeG;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 40);
      ctx.quadraticCurveTo(x + 15 + sw, y - 26, x + 11 + sw, y - 2);
      ctx.lineTo(x + 1, y - 4);
      ctx.lineTo(x + 1, y - 39);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(90,146,204,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const legOffA = step * 2.2;
      const legOffB = -step * 2.2;
      rect(x - 7 + legOffA, y - 20, 6, 14, "#4a3a26");
      rect(x + 1 + legOffB, y - 20, 6, 14, "#4a3a26");
      rect(x - 9 + legOffA, y - 7, 9, 7, "#2a1e10");
      rect(x - 1 + legOffB, y - 7, 9, 7, "#2a1e10");
      rect(x - 9 + legOffA, y - 7, 9, 1, "#4a3a26");
      rect(x - 1 + legOffB, y - 7, 9, 1, "#4a3a26");

      const tunicG = ctx.createLinearGradient(x - 11, y - 38, x + 11, y - 20);
      tunicG.addColorStop(0, "#5a92cc");
      tunicG.addColorStop(0.5, "#3a6ea5");
      tunicG.addColorStop(1, "#244a75");
      ctx.fillStyle = tunicG;
      ctx.fillRect(x - 11, y - 38, 22, 18);
      rect(x - 11, y - 38, 22, 2, "#8ab4e0");
      rect(x - 11, y - 24, 22, 3, "#8a6a20");
      rect(x - 3, y - 25, 6, 5, "#d8a828");
      rect(x - 2, y - 24, 4, 3, "#fdf0a0");

      rect(x - 14, y - 37, 4, 14, "#35648f");
      rect(x + 10, y - 37, 4, 14, "#35648f");
      rect(x - 14, y - 25, 4, 4, "#f0c090");
      rect(x + 10, y - 25, 4, 4, "#f0c090");

      const skinG = ctx.createLinearGradient(x - 8, y - 50, x + 6, y - 36);
      skinG.addColorStop(0, "#ffd8b0");
      skinG.addColorStop(1, "#d8a878");
      ctx.fillStyle = skinG;
      ctx.fillRect(x - 8, y - 50, 14, 12);
      rect(x + 4, y - 48, 3, 8, "#8a5a2a");

      const helmG = ctx.createLinearGradient(x - 9, y - 56, x + 7, y - 46);
      helmG.addColorStop(0, "#e8eef6");
      helmG.addColorStop(0.5, "#b8c4d0");
      helmG.addColorStop(1, "#7a8794");
      ctx.fillStyle = helmG;
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 48);
      ctx.lineTo(x - 8, y - 54);
      ctx.lineTo(x + 5, y - 54);
      ctx.lineTo(x + 7, y - 48);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(50,62,74,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
      rect(x - 2, y - 49, 2, 6, "#9aa4b0");
      rect(x - 4, y - 57, 8, 3, "#d8a828");

      rect(x - 6, y - 45, 2, 2, "#1a1a2a");
      rect(x - 2, y - 45, 2, 2, "#1a1a2a");

      ctx.save();
      ctx.translate(x + 9, y - 30);
      ctx.rotate(-0.55);
      rect(-2, -18, 3, 34, "#8a6a20");
      rect(-3, -22, 5, 5, "#c8d0d8");
      rect(-5, 10, 9, 3, "#d8a828");
      ctx.restore();
    };

    const drawPortraitScene = (t) => {
      const pw = PORTRAIT_W, ph = PORTRAIT_H;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pw, ph);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      const sky = ctx.createLinearGradient(0, 0, 0, ph);
      sky.addColorStop(0, "#05030f");
      sky.addColorStop(0.42, "#171039");
      sky.addColorStop(0.75, "#29104a");
      sky.addColorStop(1, "#080512");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, pw, ph);

      const nebula = ctx.createRadialGradient(180, 240, 15, 180, 240, 240);
      nebula.addColorStop(0, "rgba(102,68,207,.34)");
      nebula.addColorStop(1, "rgba(20,12,52,0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, pw, ph);
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const x = (star.x / LW) * pw;
        const y = 70 + (star.y / HORIZON) * 270;
        const twinkle = 0.4 + 0.6 * Math.sin(t * star.sp + star.ph);
        ctx.globalAlpha = 0.25 + 0.65 * twinkle;
        ctx.fillStyle = star.layer === 2 ? "#b8f6ff" : "#ffffff";
        ctx.fillRect(x, y, star.s, star.s);
      }
      ctx.globalAlpha = 1;

      const horizon = 445;
      const skyline = ctx.createLinearGradient(0, horizon, 0, ph);
      skyline.addColorStop(0, "#1c1535");
      skyline.addColorStop(1, "#080611");
      ctx.fillStyle = skyline;
      ctx.beginPath();
      ctx.moveTo(0, ph);
      for (let x = 0; x <= pw; x += 24) {
        const height = 28 + ((x * 37) % 70);
        ctx.lineTo(x, horizon + height);
        ctx.lineTo(x + 12, horizon + height);
      }
      ctx.lineTo(pw, ph);
      ctx.closePath();
      ctx.fill();

      const bridgeTop = 224;
      const bridgeBottom = 584;
      const halfWidthAt = y => 38 + ((y - bridgeTop) / (bridgeBottom - bridgeTop)) * 58;
      for (let i = 0; i < BIFROST.length; i++) {
        const y0 = bridgeTop + (bridgeBottom - bridgeTop) * (i / BIFROST.length);
        const y1 = bridgeTop + (bridgeBottom - bridgeTop) * ((i + 1) / BIFROST.length);
        const w0 = halfWidthAt(y0), w1 = halfWidthAt(y1);
        ctx.beginPath();
        ctx.moveTo(pw / 2 - w0, y0);
        ctx.lineTo(pw / 2 + w0, y0);
        ctx.lineTo(pw / 2 + w1, y1);
        ctx.lineTo(pw / 2 - w1, y1);
        ctx.closePath();
        ctx.fillStyle = BIFROST[i];
        ctx.fill();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = "rgba(195,237,255,.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(180 - halfWidthAt(bridgeTop), bridgeTop);
      ctx.lineTo(180 - halfWidthAt(bridgeBottom), bridgeBottom);
      ctx.moveTo(180 + halfWidthAt(bridgeTop), bridgeTop);
      ctx.lineTo(180 + halfWidthAt(bridgeBottom), bridgeBottom);
      ctx.stroke();

      const drawPortraitArch = (x, y, width, height, fill, stroke, lineWidth) => {
        const radius = width / 2;
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x, y + radius);
        ctx.arc(x + radius, y + radius, radius, Math.PI, 0);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };
      const gateGlow = ctx.createRadialGradient(180, 178, 10, 180, 178, 128);
      gateGlow.addColorStop(0, "rgba(143,234,255,.42)");
      gateGlow.addColorStop(1, "rgba(58,79,211,0)");
      ctx.fillStyle = gateGlow;
      ctx.fillRect(42, 70, 276, 240);
      drawPortraitArch(90, 90, 180, 180, "#875f18", "#f0d26c", 6);
      const portal = ctx.createRadialGradient(180, 200, 8, 180, 190, 100);
      portal.addColorStop(0, "#f5ffff");
      portal.addColorStop(0.24, "#83e5ff");
      portal.addColorStop(0.62, "#475fe3");
      portal.addColorStop(1, "#170b3c");
      drawPortraitArch(111, 116, 138, 150, portal, "#c7f5ff", 3);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 7; i++) {
        const angle = t * (0.6 + i * 0.09) + i * 1.13;
        ctx.beginPath();
        ctx.arc(180 + Math.cos(angle) * 10, 201 + Math.sin(angle) * 8, 26 + i * 8, angle, angle + 1.2);
        ctx.strokeStyle = `rgba(185,245,255,${0.18 - i * 0.016})`;
        ctx.lineWidth = 2 + i;
        ctx.stroke();
      }
      ctx.restore();
      for (let i = 0; i < 6; i++) {
        const y = 148 + i * 23;
        drawRune(96, y, 12, i, "#ffd75e", 0.7 + 0.3 * Math.sin(t * 2 + i));
        drawRune(253, y, 12, i + 2, "#ffd75e", 0.7 + 0.3 * Math.sin(t * 2 + i));
      }

      const heimdallX = 180 + (S.heimdallX - HEIMDALL_HOME) * 0.75;
      drawHeimdall(heimdallX, 386, t);
      const progress = clamp((PLAYER_START - S.playerX) / (PLAYER_START - PLAYER_THROUGH), 0, 1);
      const playerY = 570 - progress * 224;
      if (S.playerAlpha > 0.01) {
        ctx.globalAlpha = S.playerAlpha;
        drawPlayer(180, playerY, t, Math.abs(S.playerTX - S.playerX) > 2);
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = "rgba(8,5,20,.88)";
      ctx.fillRect(14, 12, 332, 48);
      ctx.strokeStyle = "rgba(232,195,74,.65)";
      ctx.strokeRect(14.5, 12.5, 331, 47);
      ctx.textAlign = "left";
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#8ce9ff";
      ctx.fillText(`REALM ${S.level + 1} / ${LEVELS.length}`, 26, 31);
      ctx.textAlign = "right";
      ctx.fillStyle = "#f5df99";
      ctx.fillText(`STREAK ${S.streak} / ${GOAL}`, 334, 31);
      ctx.textAlign = "center";
      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(LEVELS[S.level].name, 180, 50);

      if (S.word) {
        ctx.fillStyle = "rgba(8,5,20,.9)";
        ctx.fillRect(24, 590, 312, 34);
        ctx.strokeStyle = "#4a3a6e";
        ctx.strokeRect(24.5, 590.5, 311, 33);
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = S.screen === "fail" ? "#ff9a9a" : "#ffe14d";
        ctx.fillText(`SPELL: ${S.word[0]}`, 180, 612);
      }

      if (S.msg) {
        const message = S.msg.text.length > 27 ? S.msg.text.slice(0, 27) : S.msg.text;
        ctx.fillStyle = "rgba(8,5,20,.9)";
        ctx.fillRect(32, 70, 296, 28);
        ctx.strokeStyle = S.msg.color;
        ctx.strokeRect(32.5, 70.5, 295, 27);
        ctx.textAlign = "center";
        ctx.font = "bold 10px monospace";
        ctx.fillStyle = S.msg.color;
        ctx.fillText(message, 180, 88);
      }
      if (S.screen === "title" || S.screen === "win") {
        ctx.fillStyle = "rgba(5,3,15,.88)";
        ctx.fillRect(18, 270, 324, 76);
        ctx.strokeStyle = "#e8c34a";
        ctx.strokeRect(18.5, 270.5, 323, 75);
        ctx.textAlign = "center";
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#fff3c4";
        ctx.fillText(S.screen === "win" ? "NINE REALMS CLEARED" : "SPELLCHECKERS OF ASGARD", 180, 302);
        ctx.font = "bold 10px monospace";
        ctx.fillStyle = "#8ce9ff";
        ctx.fillText("CORRECT THE RUNES TO CROSS THE BIFROST", 180, 326);
      }
      if (S.flash > 0) {
        ctx.globalAlpha = S.flash * 0.55;
        ctx.fillStyle = "#bff6ff";
        ctx.fillRect(0, 0, pw, ph);
        ctx.globalAlpha = 1;
      }
    };

    /* ====================== UI ====================== */
    const drawUI = (t) => {
      const pg = ctx.createLinearGradient(0, UI_Y, 0, H);
      pg.addColorStop(0, "#0f0922");
      pg.addColorStop(0.5, "#0a0518");
      pg.addColorStop(1, "#05020c");
      ctx.fillStyle = pg;
      ctx.fillRect(0, UI_Y, W, H - UI_Y);

      rect(0, UI_Y, W, 2, "#e8c34a");
      rect(0, UI_Y + 2, W, 1, "#6a4a10");
      ctx.globalAlpha = 0.18;
      rect(0, UI_Y + 3, W, 2, "#e8c34a");
      ctx.globalAlpha = 1;

      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#e8c34a";
      ctx.fillText("LEVEL " + (S.level + 1) + " / " + LEVELS.length, 20, UI_Y + 22);

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#8a7fc0";
      ctx.fillText("\u00B7 " + LEVELS[S.level].name, 122, UI_Y + 22);

      ctx.textAlign = "right";
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = S.streak > 0 ? "#7fe8ff" : "#4a5570";
      ctx.fillText("STREAK " + S.streak + " / " + GOAL, W - 20, UI_Y + 22);

      const pipW = 18, pipH = 24, gap = 10;
      const totalW = GOAL * pipW + (GOAL - 1) * gap;
      const startX = Math.round((W - totalW) / 2);
      const pipY = UI_Y + 28;
      for (let i = 0; i < GOAL; i++) {
        const x = startX + i * (pipW + gap);
        const filled = i < S.streak;
        archPath(x, pipY, pipW, pipH);
        ctx.fillStyle = "#1b1236";
        ctx.fill();
        if (filled) {
          const pulse = 0.75 + 0.25 * Math.sin(t * 5 + i * 0.5);
          archPath(x + 1.5, pipY + 1.5, pipW - 3, pipH - 3);
          const fg = ctx.createLinearGradient(x, pipY, x, pipY + pipH);
          fg.addColorStop(0, "#fff5b8");
          fg.addColorStop(0.5, "#e8c34a");
          fg.addColorStop(1, "#a07c1c");
          ctx.globalAlpha = pulse;
          ctx.fillStyle = fg;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "lighter";
          const gg = ctx.createRadialGradient(
            x + pipW / 2, pipY + pipH / 2, 0,
            x + pipW / 2, pipY + pipH / 2, 22
          );
          gg.addColorStop(0, "rgba(255,220,120," + 0.32 * pulse + ")");
          gg.addColorStop(1, "rgba(255,220,120,0)");
          ctx.fillStyle = gg;
          ctx.fillRect(x - 14, pipY - 10, pipW + 28, pipH + 20);
          ctx.globalCompositeOperation = "source-over";
        } else {
          archPath(x, pipY, pipW, pipH);
          ctx.strokeStyle = "#2e2354";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      const bx = 108, by = UI_Y + 58, bw = W - 216, bh = 28;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#150e28";
      ctx.fillRect(bx, by, bw, bh);
      ctx.globalAlpha = 1;

      const borderCol =
        S.screen === "fail" ? "#ff5a5a"
        : S.screen === "levelclear" ? "#7fe8ff"
        : "#4a3a6e";
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      ctx.globalAlpha = 0.25;
      rect(bx + 4, by + 1, bw - 8, 1, borderCol);
      ctx.globalAlpha = 1;

      if (S.word) {
        ctx.textAlign = "center";
        ctx.font = 'bold 20px "Courier New", monospace';
        const word = S.word[0];
        const wcol = S.screen === "fail" ? "#ff9a9a" : "#ffe14d";
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillText(word, W / 2 + 1, by + 21);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = wcol;
        ctx.fillText(word, W / 2, by + 20);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = wcol;
        ctx.fillText(word, W / 2, by + 20);
      }

      const iy = by + bh + 8;
      const blink = Math.floor(t * 2.4) % 2 === 0;
      ctx.textAlign = "center";
      ctx.font = 'bold 13px "Courier New", monospace';
      if (S.typed.length === 0) {
        ctx.fillStyle = "#3e3560";
        ctx.fillText("type the correct spelling \u2026", W / 2, iy);
        if (blink && S.screen === "play") {
          const cw = ctx.measureText("type the correct spelling \u2026").width;
          rect(W / 2 - cw / 2 - 8, iy - 10, 2, 12, "#7fe8ff");
        }
      } else {
        const tw = ctx.measureText(S.typed).width;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = "#7fe8ff";
        ctx.fillText(S.typed, W / 2, iy);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(S.typed, W / 2, iy);
        if (blink && S.screen === "play") {
          rect(W / 2 + tw / 2 + 2, iy - 10, 7, 12, "#7fe8ff");
        }
      }

      ctx.textAlign = "left";
      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#5a7fa8";
      ctx.fillText("\u203A", 92, iy);

      ctx.textAlign = "right";
      ctx.fillStyle = "#3e3560";
      ctx.font = "bold 10px monospace";
      ctx.fillText("ENTER \u23CE", W - 92, iy);
    };

    const drawOverlays = () => {
      if (S.screen === "fail") {
        const a = clamp(S.failT / 2.7, 0, 1) * 0.26;
        ctx.globalAlpha = a;
        rect(0, 0, W, UI_Y, "#ff0000");
        ctx.globalAlpha = 1;
      }
      if (S.flash > 0) {
        ctx.globalAlpha = S.flash * 1.6;
        rect(0, 0, W, H, "#bff6ff");
        ctx.globalAlpha = 1;
      }
      if (S.screen === "levelclear") {
        const a = clamp(1 - S.clearT / 3.4, 0, 1) * 0.22;
        ctx.globalAlpha = a;
        rect(0, 0, W, UI_Y, "#7fe8ff");
        ctx.globalAlpha = 1;
      }
      if (S.msg) {
        const fade = clamp(S.msg.t * 3, 0, 1);
        ctx.globalAlpha = fade;
        const hasSub = !!S.msg.sub;
        const boxH = hasSub ? 48 : 32;
        const boxY = 24;
        ctx.font = "bold 16px monospace";
        const tw = ctx.measureText(S.msg.text).width;
        let subW = 0;
        if (hasSub) {
          ctx.font = "bold 11px monospace";
          subW = ctx.measureText(S.msg.sub).width;
        }
        const boxW = Math.max(tw, subW) + 44;
        const boxX = (W - boxW) / 2;
        const bg = ctx.createLinearGradient(0, boxY, 0, boxY + boxH);
        bg.addColorStop(0, "rgba(10,5,26,0.94)");
        bg.addColorStop(1, "rgba(4,2,12,0.94)");
        ctx.fillStyle = bg;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = S.msg.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);
        ctx.fillStyle = S.msg.color;
        ctx.fillRect(boxX - 2, boxY - 2, 5, 2);
        ctx.fillRect(boxX - 2, boxY - 2, 2, 5);
        ctx.fillRect(boxX + boxW - 3, boxY - 2, 5, 2);
        ctx.fillRect(boxX + boxW - 1, boxY - 2, 2, 5);
        ctx.fillRect(boxX - 2, boxY + boxH, 5, 2);
        ctx.fillRect(boxX - 2, boxY + boxH - 3, 2, 5);
        ctx.fillRect(boxX + boxW - 3, boxY + boxH, 5, 2);
        ctx.fillRect(boxX + boxW - 1, boxY + boxH - 3, 2, 5);
        ctx.textAlign = "center";
        ctx.font = "bold 16px monospace";
        ctx.fillStyle = S.msg.color;
        ctx.fillText(S.msg.text, W / 2, boxY + 21);
        if (hasSub) {
          ctx.font = "bold 11px monospace";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(S.msg.sub, W / 2, boxY + 38);
        }
        ctx.globalAlpha = 1;
      }
      const vg = ctx.createRadialGradient(W / 2, 110, 120, W / 2, 110, 420);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.52)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, UI_Y);
    };

    /* ====================== title / win ====================== */
    const drawTitle = (t) => {
      ctx.globalAlpha = 0.76;
      rect(0, 0, W, H, "#05030d");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#e8c34a";
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 34, W - 80, 250);
      ctx.strokeStyle = "rgba(232,195,74,0.28)";
      ctx.lineWidth = 1;
      ctx.strokeRect(46, 40, W - 92, 238);
      for (let i = 0; i < 4; i++) {
        const cx = i % 2 === 0 ? 58 : W - 58;
        const cy = i < 2 ? 52 : H - 96;
        drawRune(cx - 6, cy - 6, 12, i, "#e8c34a", 0.55 + 0.35 * Math.sin(t * 2 + i));
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      const pulse = 0.72 + 0.28 * Math.sin(t * 2.2);
      ctx.font = 'bold 34px "Courier New", monospace';
      ctx.fillStyle = "#2a1a00";
      ctx.fillText("SPELLCHECKERS", W / 2 + 2, 106);
      const lg = ctx.createLinearGradient(0, 74, 0, 108);
      lg.addColorStop(0, "#fff5b8");
      lg.addColorStop(0.5, "#e8c34a");
      lg.addColorStop(1, "#a07c1c");
      ctx.fillStyle = lg;
      ctx.fillText("SPELLCHECKERS", W / 2, 104);
      ctx.font = 'bold 30px "Courier New", monospace';
      ctx.fillStyle = "#2a1a00";
      ctx.fillText("OF ASGARD", W / 2 + 2, 146);
      const lg2 = ctx.createLinearGradient(0, 122, 0, 150);
      lg2.addColorStop(0, "#d8f8ff");
      lg2.addColorStop(0.5, "#7fe8ff");
      lg2.addColorStop(1, "#3a7fa8");
      ctx.fillStyle = lg2;
      ctx.fillText("OF ASGARD", W / 2, 144);
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#b39ddb";
      ctx.fillText("CORRECT " + GOAL + " RUNES IN A ROW  \u00B7  " + LEVELS.length + " REALMS  \u00B7  128-BIT", W / 2, 176);
      ctx.globalAlpha = pulse;
      ctx.font = "bold 14px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("PRESS ENTER TO APPROACH THE GATE", W / 2, 224);
      ctx.globalAlpha = 1;
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 7; i++) {
        archPath(W / 2 - 30 + i * 8, 240, 8, 26);
        ctx.fillStyle = BIFROST[i];
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "#3e3560";
      ctx.textAlign = "right";
      ctx.fillText("v2.0", W - 50, H - 106);
      ctx.textAlign = "center";
    };

    const drawWin = (t) => {
      ctx.globalAlpha = 0.82;
      rect(0, 0, W, H, "#05030d");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#e8c34a";
      ctx.lineWidth = 2;
      ctx.strokeRect(52, 46, W - 104, 226);
      ctx.strokeStyle = "rgba(232,195,74,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(58, 52, W - 116, 214);
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      const pulse = 0.7 + 0.3 * Math.sin(t * 3);
      ctx.font = 'bold 30px "Courier New", monospace';
      ctx.fillStyle = "#2a1a00";
      ctx.fillText("WELCOME TO ASGARD", W / 2 + 2, 108);
      const lg = ctx.createLinearGradient(0, 80, 0, 112);
      lg.addColorStop(0, "#fff5b8");
      lg.addColorStop(0.5, "#e8c34a");
      lg.addColorStop(1, "#a07c1c");
      ctx.fillStyle = lg;
      ctx.fillText("WELCOME TO ASGARD", W / 2, 106);
      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#7fe8ff";
      ctx.fillText("HEIMDALL BOWS. THE GATE IS OPEN.", W / 2, 144);
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#5be07a";
      ctx.fillText("ALL " + LEVELS.length + " REALMS CLEARED  \u00B7  " + (LEVELS.length * GOAL) + " RUNES CORRECTED", W / 2, 166);
      for (let i = 0; i < 10; i++) {
        drawRune(W / 2 - 105 + i * 23, 186, 14, i, "#e8c34a", 0.5 + 0.5 * Math.sin(t * 3 + i * 0.4));
      }
      ctx.globalAlpha = pulse;
      ctx.font = "bold 13px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("PRESS ENTER TO PLAY AGAIN", W / 2, 232);
      ctx.globalAlpha = 1;
    };

    /* ====================== render ====================== */
    const render = (t) => {
      if (portraitRef.current) {
        drawPortraitScene(t);
        return;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      if (S.shake > 0.01) {
        ctx.translate(
          (Math.random() - 0.5) * S.shake * 8,
          (Math.random() - 0.5) * S.shake * 6
        );
      }
      drawSky(t);
      drawBackdrop(t);
      drawBridge(t);
      drawGate(t, S.charge);
      drawHeimdall(S.heimdallX, FEET_Y, t);
      if (S.playerAlpha > 0.01) {
        ctx.globalAlpha = S.playerAlpha;
        const moving = Math.abs(S.playerTX - S.playerX) > 2;
        drawPlayer(S.playerX, FEET_Y, t, moving);
        ctx.globalAlpha = 1;
      }
      drawP();
      ctx.restore();

      drawUI(t);
      drawOverlays();
      if (S.screen === "title") drawTitle(t);
      if (S.screen === "win") drawWin(t);
    };

    /* ====================== loop ====================== */
    let raf = 0;
    let last = 0;
    const loop = (ts) => {
      const t = ts / 1000;
      let dt = last ? t - last : 0.016;
      last = t;
      if (dt > 0.06) dt = 0.06;
      update(dt);
      render(t);
      raf = requestAnimationFrame(loop);
    };

    resetLevel(0);
    raf = requestAnimationFrame(loop);

    /* ====================== cleanup ====================== */
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      if (actx && actx.state !== "closed") actx.close().catch(() => {});
      actx = null;
      noiseBuf = null;
      stateRef.current = null;
      submitRef.current = null;
    };
  }, []);

  return (
    <div className="soag-game-layout">
      <header className="soag-game-toolbar">
        <p>Warrior <strong>{playerName}</strong></p>
      </header>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        aria-label="Spellcheckers of Asgard game board"
        className="soag-game-canvas"
      />
      <p className="soag-sr-only" id="soag-current-clue" role="status" aria-live="polite">
        Spell “{clue}” correctly.
      </p>
      <p className="soag-game-hint">Type the correct spelling and press Enter.</p>
      <form
        className="soag-answer-form"
        onSubmit={event => {
          event.preventDefault();
          submitRef.current?.();
        }}
      >
        <label className="soag-sr-only" htmlFor="soag-answer">Correct spelling</label>
        <input
          ref={answerInputRef}
          id="soag-answer"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={26}
          placeholder="Type the correct spelling"
          aria-describedby="soag-current-clue"
          value={answerValue}
          onChange={event => {
            if (stateRef.current?.screen !== "play") return;
            const value = event.target.value.slice(0, 26);
            setAnswerValue(value);
            stateRef.current.typed = value;
          }}
          onKeyDown={event => {
            event.stopPropagation();
            if (event.key === "Enter") {
              event.preventDefault();
              submitRef.current?.();
            }
          }}
        />
        <button className="soag-primary-button" type="submit" disabled={!answerValue.trim()}>
          Submit spelling
        </button>
      </form>
    </div>
  );
}

export default function SpellcheckersOfAsgard({ onComplete }) {
  const [screen, setScreen] = useState("splash");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const returnToMenu = () => setScreen("menu");
    window.addEventListener("spellcheckersofasgard:main-menu", returnToMenu);
    return () => window.removeEventListener("spellcheckersofasgard:main-menu", returnToMenu);
  }, []);

  const completeGame = React.useCallback((score, accuracy) => {
    setResult({ score, accuracy });
    onComplete?.(score, accuracy);
    setScreen("victory");
  }, [onComplete]);

  const savePlayer = event => {
    event.preventDefault();
    const name = nameInput.trim();
    if (!name) {
      setNameError("Enter a name to continue.");
      return;
    }
    setPlayerName(name);
    setNameError("");
    setScreen("menu");
  };

  const startGame = () => {
    setResult(null);
    setScreen("game");
  };

  if (screen === "game") {
    return (
      <main className="soag-page soag-page--game" data-screen="game">
        <AsgardGameCanvas
          key={result === null ? "active-game" : "restarted-game"}
          playerName={playerName}
          onWin={completeGame}
        />
      </main>
    );
  }

  return (
    <main className={`soag-page soag-page--${screen}`} data-screen={screen}>
      <section className="soag-panel" aria-live="polite">
        {screen === "splash" && (
          <div className="soag-screen soag-screen--splash">
            <p className="soag-eyebrow">A SPELLING QUEST THROUGH THE NINE REALMS</p>
            <div className="soag-rune-mark" aria-hidden="true">ᚨ</div>
            <h1>Spellcheckers <span>of Asgard</span></h1>
            <p className="soag-lede">Correct the runes, cross the Bifrost, and prove your spelling skills to Heimdall.</p>
            <button className="soag-primary-button" type="button" onClick={() => setScreen("player-info")}>
              Begin your quest
            </button>
          </div>
        )}

        {screen === "player-info" && (
          <div className="soag-screen soag-screen--player-info">
            <p className="soag-eyebrow">BEFORE YOU CROSS THE BIFROST</p>
            <h1>Who is taking the quest?</h1>
            <p className="soag-lede">Heimdall needs a name for the hero entering Asgard.</p>
            <form className="soag-player-form" onSubmit={savePlayer}>
              <label htmlFor="soag-player-name">Your name</label>
              <input
                autoFocus
                id="soag-player-name"
                type="text"
                autoComplete="nickname"
                maxLength={24}
                placeholder="Enter your name"
                value={nameInput}
                aria-describedby={nameError ? "soag-name-error" : undefined}
                aria-invalid={Boolean(nameError)}
                onChange={event => {
                  setNameInput(event.target.value);
                  if (nameError) setNameError("");
                }}
              />
              {nameError && <p className="soag-error" id="soag-name-error">{nameError}</p>}
              <div className="soag-button-row">
                <button className="soag-secondary-button" type="button" onClick={() => setScreen("splash")}>
                  Back
                </button>
                <button className="soag-primary-button" type="submit" disabled={!nameInput.trim()}>
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {screen === "menu" && (
          <div className="soag-screen soag-screen--menu">
            <p className="soag-eyebrow">WELCOME, {playerName.toUpperCase()}</p>
            <h1>Your quest awaits</h1>
            <p className="soag-lede">Spell each corrected word to guide your warrior across the rainbow bridge.</p>
            <div className="soag-quest-details">
              <article><strong>{LEVELS.length}</strong><span>Norse realms</span></article>
              <article><strong>{GOAL}</strong><span>correct spellings in a row per realm</span></article>
              <article><strong>{LEVELS.length * GOAL}</strong><span>runes to correct in total</span></article>
            </div>
            <p className="soag-instructions">A miss resets your streak for the current realm. Type the answer and press Enter, or use the on-screen spelling box.</p>
            <div className="soag-button-row">
              <button className="soag-secondary-button" type="button" onClick={() => setScreen("player-info")}>
                Change player
              </button>
              <button className="soag-primary-button" type="button" onClick={startGame}>
                Enter the Bifrost
              </button>
            </div>
          </div>
        )}

        {screen === "victory" && (
          <div className="soag-screen soag-screen--victory">
            <p className="soag-eyebrow">THE BIFROST IS OPEN</p>
            <div className="soag-rune-mark" aria-hidden="true">ᛟ</div>
            <h1>Victory, {playerName}!</h1>
            <p className="soag-lede">All {LEVELS.length} realms are cleared. Heimdall welcomes you to Asgard.</p>
            <div className="soag-result">
              <strong>{result?.score ?? 0}</strong><span>spelling points</span>
              <strong>{result?.accuracy ?? 0}%</strong><span>accuracy</span>
            </div>
            <div className="soag-button-row">
              <button className="soag-secondary-button" type="button" onClick={() => setScreen("menu")}>
                Main menu
              </button>
              <button className="soag-primary-button" type="button" onClick={startGame}>
                Play again
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}