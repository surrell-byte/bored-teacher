import { useState, useEffect, useRef } from "react";
import { drawBurger } from "./burger-sprite";
import { createRunnerViewport, runnerBoxesOverlap } from "./runner-coordinate.mjs";
import { finishDuelBonusRound, resolveDuelPick } from "./duel-round.mjs";

const BG = "#202124", FG = "#d6d6d6", MUTE = "#80868b", ACC = "#e8a24a";
const BUNS = [
  { name: "Black", color: "#111111" },
  { name: "Red", color: "#d0463a" },
  { name: "Blue", color: "#2f7de1" },
  { name: "Yellow", color: "#d99b00" },
  { name: "Green", color: "#248342" },
  { name: "Purple", color: "#8b55b5" },
  { name: "Pink", color: "#df6b9b" },
  { name: "Orange", color: "#e88732" },
];
const W = 720, LANE_HEIGHT = 210, GY = 175;
const SUITS = ["♠", "♥", "♦", "♣"];
const SUIT_LABELS = { "♠": "Spades", "♥": "Hearts", "♦": "Diamonds", "♣": "Clubs" };
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

/* ---------------- solo card-mode effects ---------------- */
const CARDS = [
  { id: "shield", e: "🥒", n: "Pickle Shield", d: "Blocks your next hit", g: 1 },
  { id: "float", e: "🧀", n: "Cheese Float", d: "Floaty jumps", t: 600, g: 1 },
  { id: "x2", e: "🥬", n: "Lettuce Boost", d: "Double points", t: 600, g: 1 },
  { id: "tiny", e: "🥓", n: "Bacon Shrink", d: "You become tiny", t: 600, g: 1 },
  { id: "slow", e: "🍯", n: "Honey Slow", d: "World slows down", t: 480, g: 1 },
  { id: "fast", e: "🌶️", n: "Hot Sauce", d: "Everything speeds up!", t: 480 },
  { id: "big", e: "⬆️", n: "Mega Size", d: "You grow huge", t: 480 },
  { id: "sticky", e: "🍅", n: "Ketchup Boots", d: "Weak, stubby jumps", t: 480 },
];
const CLASH = { slow: "fast", fast: "slow", tiny: "big", big: "tiny", float: "sticky", sticky: "float" };

/* ---------------- 2P card duel effects (colours are shuffled onto these every round) ---------------- */
const EFX = [
  { id: "freeze", e: "❄️", n: "FREEZE", d: "Stay frozen and skip your next turn", mv: 0, pts: -100 },
  { id: "turbo", e: "🍅", n: "TURBO!", d: "Move forward 3 steps", mv: 3, pts: 200 },
  { id: "boost", e: "🥬", n: "BOOST", d: "Move forward 2 steps", mv: 2, pts: 100 },
  { id: "slow", e: "🍟", n: "SLOW", d: "Move back 2 steps", mv: -2, pts: -100 },
];
const COLS = [["#2f7de1", "Blue", "#fff"], ["#d0463a", "Red", "#fff"], ["#3fa34d", "Green", "#fff"], ["#f2c230", "Yellow", "#222"]];
const DUEL_PORTRAIT_ART = { width: 941, height: 1671, laneYs: [697, 1460] };
const DUEL_LANDSCAPE_ART = { width: 1672, height: 941, laneYs: [452, 901] };
const createPlayerStatus = (player, scoreLabel = "0 pts", lives = null, status = "Ready") => ({
  name: player.name,
  bun: player.bun,
  scoreLabel,
  progress: 0,
  lives,
  status,
  active: false,
  bonusActive: false,
});
const RUN_BACKGROUNDS = {
  classic: {
    desktop: "burger-run-game-bg-p1.webp",
    mobile: "burger-run-game-phone-bg.webp",
  },
  card: {
    desktop: "burger-run-game-bg-p1.webp",
    mobile: "burger-run-game-phone-bg.webp",
  },
  race: {
    desktop: "burger-run-game-2p-bg.webp",
    mobile: "burger-run-game-bg-phone.webp",
  },
  duel: {
    desktop: "burger-run-game-2p-bg.webp",
    mobile: "burger-run-game-bg-phone.webp",
  },
};
const RUNNER_ART = {
  classic: {
    desktop: { width: 1672, height: 940, laneYs: [560], laneBounds: [[0, 940]] },
    mobile: { width: 940, height: 1672, laneYs: [1078], laneBounds: [[0, 1672]] },
  },
  card: {
    desktop: { width: 1672, height: 940, laneYs: [560], laneBounds: [[0, 940]] },
    mobile: { width: 940, height: 1672, laneYs: [1078], laneBounds: [[0, 1672]] },
  },
  race: {
    desktop: { width: 1672, height: 941, laneYs: [452, 900], laneBounds: [[0, 478], [478, 941]] },
    mobile: { width: 941, height: 1671, laneYs: [697, 1460], laneBounds: [[0, 835], [835, 1671]] },
  },
};

function advanceDuelTurn(state, currentTurn) {
  let nextTurn = 1 - currentTurn;
  while (state.pl[nextTurn].skip) {
    state.pl[nextTurn].skip = false;
    state.pl[nextTurn].frozen = false;
    nextTurn = 1 - nextTurn;
  }
  return nextTurn;
}

/* ---------------- small UI pieces ---------------- */
function Btn({ children, pri, sm, ...r }) {
  return (
    <button {...r} style={{ font: "inherit", fontWeight: 700, fontSize: sm ? 13 : 16, padding: sm ? "6px 12px" : "12px 22px", minWidth: sm ? 0 : 240, border: `3px solid ${FG}`, borderRadius: 6, background: pri ? ACC : BG, color: pri ? "#222" : FG, cursor: "pointer", touchAction: "manipulation" }}>
      {children}
    </button>
  );
}
const Modal = ({ children }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 text-center p-3" style={{ background: "rgba(32,33,36,.94)" }}>{children}</div>
);
const Sub = ({ children }) => <p style={{ color: MUTE, fontSize: 13, margin: 0 }}>{children}</p>;

/* black card with white suit; when `face` is given it is flipped to its colour */
function Card({ suit, face, onClick, dim, pick, disabled, compact = false }) {
  return (
    <button disabled={disabled} onClick={onClick} aria-label={!face ? `${SUIT_LABELS[suit]} card` : undefined} className="flex flex-col items-center justify-center gap-1"
      style={{ width: compact ? "100%" : "clamp(76px,21vw,140px)", aspectRatio: "2/3", borderRadius: 10, padding: 4, font: "inherit", border: `3px solid ${pick ? "#ffe08a" : "#dcecff"}`, boxShadow: "0 0 0 2px #172033, 0 5px 12px rgba(0,0,0,.55)", background: face ? face.bg : "#05070b", color: face ? face.fg : "#fff", opacity: dim ? 0.4 : 1, transform: pick ? "translateY(-8px)" : "none", transition: "all .2s", cursor: disabled ? "default" : "pointer" }}>
      {face ? (
        <>
          <span style={{ fontSize: "clamp(26px,8vw,44px)" }}>{face.e}</span>
          <b style={{ minHeight: 28, display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, fontSize: 13, lineHeight: "14px" }}>{face.n}</b>
          <small style={{ minHeight: 30, display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 3, fontSize: 10, lineHeight: "10px" }}>{face.d}</small>
        </>
      ) : (
        <>
          <span style={{ fontSize: "clamp(34px,10vw,56px)", lineHeight: 1 }}>{suit}</span>
          <small style={{ fontSize: "clamp(10px,2.5vw,14px)", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>{SUIT_LABELS[suit]}</small>
        </>
      )}
    </button>
  );
}

function BurgerPic({ bun, size = 112 }) {
  const ref = useRef(null);
  useEffect(() => {
    const context = ref.current?.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, 80, 70);
    drawBurger(context, 16, 62, false, 0, false, bun);
  }, [bun]);
  return <canvas ref={ref} width={80} height={70} role="img" aria-label={`${bun} pixel burger`} style={{ width: size, height: size * .875, imageRendering: "pixelated" }} />;
}

function PlayerStatusPanels({ players }) {
  return (
    <section className="burger-run-player-status-panels" aria-label="Player status">
      {players.map((player, index) => (
        <article className={`burger-run-player-status${player.active ? " is-active" : ""}${player.bonusActive ? " is-bonus" : ""}`} key={`${index}-${player.name}`}>
          <BurgerPic bun={player.bun} size={58} />
          <div className="burger-run-player-status-main">
            <div className="burger-run-player-status-heading">
              <strong>{player.name}</strong>
              <span className={`burger-run-player-status-label${player.active ? " is-active" : ""}${player.bonusActive ? " is-bonus" : ""}`}>
                {player.bonusActive ? "2× BONUS!" : player.active && player.status === "Choose a card" ? "YOUR TURN · CHOOSE A CARD" : player.status}
              </span>
            </div>
            <div className="burger-run-player-status-meta">
              <span>{player.scoreLabel}</span>
              {player.lives !== null && <span aria-label={`${player.lives} lives remaining`}>{"♥".repeat(player.lives)}{"♡".repeat(Math.max(0, 3 - player.lives))}</span>}
            </div>
            <div className="burger-run-player-status-progress" role="progressbar" aria-label={`${player.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={player.progress}>
              <span style={{ width: `${player.progress}%` }} />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function Info({ P, P2, onSave }) {
  const [n1, setN1] = useState(P.name), [n2, setN2] = useState(P2.name);
  const [bun1, setBun1] = useState(P.bun), [bun2, setBun2] = useState(P2.bun);
  const save = () => onSave({ name: n1.trim() || "Chef", bun: bun1 }, { name: n2.trim() || "Player 2", bun: bun2 });
  const inp = { font: "inherit", fontSize: 18, textAlign: "center", padding: 10, border: `3px solid ${FG}`, background: BG, color: FG, borderRadius: 6, width: 260, maxWidth: "80vw" };
  const key = (e) => e.key === "Enter" && save();
  const bunPicker = (player, selected, onSelect) => (
    <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
      <legend style={{ margin: "0 auto 8px", color: FG, fontWeight: 700 }}>{player} bun colour</legend>
      <div className="burger-run-bun-options">
        {BUNS.map(({ name, color }) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(color)}
            aria-label={`${player}: ${name} bun`}
            aria-pressed={selected === color}
            title={`${name} bun`}
            style={{ background: color, border: `3px solid ${selected === color ? FG : MUTE}`, boxShadow: selected === color ? `0 0 0 2px ${BG},0 0 0 4px ${FG}` : "none" }}
          />
        ))}
      </div>
    </fieldset>
  );
  return (
    <div className="burger-run-info">
      <h2 className="text-2xl font-bold">Who's cooking?</h2>
      <div className="burger-run-info-grid">
        <section className="burger-run-player-setup">
          <div className="flex flex-col items-center gap-1"><BurgerPic bun={bun1} size={96} /><Sub>{n1.trim() || "Chef"}</Sub></div>
          <input style={inp} maxLength={14} placeholder="Player 1 name" value={n1} onChange={(e) => setN1(e.target.value)} onKeyDown={key} autoFocus />
          {bunPicker("Player 1", bun1, setBun1)}
        </section>
        <section className="burger-run-player-setup">
          <div className="flex flex-col items-center gap-1"><BurgerPic bun={bun2} size={96} /><Sub>{n2.trim() || "Player 2"}</Sub></div>
          <input style={inp} maxLength={14} placeholder="Player 2 name" value={n2 === "Player 2" ? "" : n2} onChange={(e) => setN2(e.target.value)} onKeyDown={key} />
          {bunPicker("Player 2", bun2, setBun2)}
        </section>
      </div>
      <Btn pri onClick={save}>Save &amp; continue</Btn>
    </div>
  );
}

function Win({ d, onAgain, onMenu, bun }) {
  const [cf] = useState(() => Array.from({ length: 18 }, () => ({ l: Math.random() * 100, dl: Math.random() * 3, e: ["🍟", "🥤", "burger", "🎉"][Math.floor(Math.random() * 4)] })));
  return (
    <div className="burger-run-victory-content">
      <div className="fixed inset-0" style={{ pointerEvents: "none", overflow: "hidden" }}>
        {cf.map((c, i) => <span key={i} style={{ position: "absolute", top: -40, left: c.l + "%", fontSize: 28, animation: `fall 4s linear ${c.dl}s infinite` }}>{c.e === "burger" ? <BurgerPic bun={bun} size={32} /> : c.e}</span>)}
      </div>
      <section className="burger-run-victory-panel">
        <h1>{d.title}</h1>
        <Sub>{d.sub}</Sub>
        <Btn pri onClick={onAgain}>Play again</Btn>
        <Btn onClick={onMenu}>Main menu</Btn>
      </section>
    </div>
  );
}

/* ================= RUNNER: classic, solo card mode, 2P race (1-2 lanes) ================= */
function Runner({ mode, P, P2, onBest, onExit, onRestart, onWin, onComplete, onStatus }) {
  const race = mode === "race", N = race ? 2 : 1, LIVES = race ? 3 : 1, GOAL = race ? 1200 : 1000;
  const cv = useRef(null), G = useRef(null), controlsRef = useRef(null);
  const completionRef = useRef(onComplete);
  completionRef.current = onComplete;
  const [fxText, setFx] = useState("");
  const [over, setOver] = useState(null);
  const [hand, setHand] = useState(null);
  const KEYS = race
    ? [{ j: ["KeyW"], d: ["KeyS"] }, { j: ["ArrowUp"], d: ["ArrowDown"] }]
    : [{ j: ["Space", "ArrowUp", "KeyW"], d: ["ArrowDown", "KeyS"] }];
  const jump = (i) => {
    const g = G.current, L = g && g.L[i];
    if (L && g.state === "run" && !L.out && L.y >= GY) L.vy = L.fx.float ? -9 : L.fx.sticky ? -9.5 : -12.5;
  };
  const duck = (i, v) => { const L = G.current && G.current.L[i]; if (L) L.duck = v; };

  useEffect(() => {
    const names = [P.name, P2.name], buns = [P.bun, P2.bun];
    const mk = (i) => ({ name: names[i], bun: buns[i], x: 70, y: GY, vy: 0, duck: false, score: 0, obs: [], next: 90, lives: LIVES, inv: 0, stun: 0, fx: {}, shield: false, flash: 0, out: false, ground: 0 });
    const g = (G.current = { state: race ? "count" : "run", cd: 180, t: 0, nextCard: 200, L: Array.from({ length: N }, (_, i) => mk(i)), clouds: [{ x: 200, y: 40 }, { x: 500, y: 70 }], viewport: null, laneOffsets: [] });
    const canvas = cv.current;
    const ctx = canvas.getContext("2d");
    const portraitQuery = window.matchMedia("(max-width: 760px) and (orientation: portrait)");
    let renderSize = "";
    let lastStatusUpdate = 0;
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const dpr = window.devicePixelRatio || 1;
      const art = RUNNER_ART[mode][portraitQuery.matches ? "mobile" : "desktop"];
      const viewport = createRunnerViewport({
        width: rect.width,
        height: rect.height,
        dpr,
        art,
        fit: race && !portraitQuery.matches ? "fill" : "cover",
      });
      const backingWidth = Math.round(rect.width * dpr);
      const backingHeight = Math.round(rect.height * dpr);
      const signature = `${backingWidth}:${backingHeight}:${dpr}`;
      if (signature !== renderSize) {
        canvas.width = backingWidth;
        canvas.height = backingHeight;
        renderSize = signature;
      }
      g.viewport = viewport;
      g.laneOffsets = viewport.laneGrounds.map((ground) => ground - GY);
      g.L.forEach((player) => { player.x = viewport.viewLeft + 70; });
      const controlsTop = viewport.offsetY + viewport.laneGrounds[0] * viewport.scaleY - 20;
      if (controlsRef.current && controlsRef.current.style.top !== `${controlsTop}px`) {
        controlsRef.current.style.top = `${controlsTop}px`;
      }
      return viewport;
    };
    const invalidateCanvasSize = () => { renderSize = ""; };
    const resizeObserver = new ResizeObserver(invalidateCanvasSize);
    resizeObserver.observe(canvas.parentElement);
    portraitQuery.addEventListener("change", invalidateCanvasSize);
    window.addEventListener("resize", invalidateCanvasSize);
    const sc = (l) => Math.floor(l.score);
    const sizeOf = (L) => (L.fx.big ? 1.35 : L.fx.tiny ? 0.7 : 1);
    const boxOf = (L) => {
      const k = sizeOf(L) * 1.35, cx = L.x;
      const b = L.duck && L.y >= GY
        ? { x: cx - 22, y: L.y - 36, w: 54, h: 36 }
        : { x: cx - 22, y: L.y - 44, w: 46, h: 44 };
      return { x: cx + (b.x - cx) * k, y: L.y + (b.y - L.y) * k, w: b.w * k, h: b.h * k };
    };
    const step = (L) => {
      const fx = L.fx;
      for (const k in fx) if (--fx[k] <= 0) delete fx[k];
      let sp = Math.min(14, 6 + L.score / 250);
      if (fx.fast) sp *= 1.35; if (fx.slow) sp *= 0.7; if (L.stun > 0) { L.stun--; sp *= 0.4; }
      if (L.inv > 0) L.inv--; if (L.flash > 0) L.flash--;
      L.score += (sp / 12) * (fx.x2 ? 2 : 1); L.ground = (L.ground + sp) % W;
      if (L.y < GY || L.vy < 0) { L.vy += (fx.float ? 0.32 : 0.65) + (L.duck ? 0.8 : 0); L.y += L.vy; if (L.y >= GY) { L.y = GY; L.vy = 0; } }
      if (--L.next <= 0) {
        const spawnX = (g.viewport?.viewRight ?? W) + 20;
        if (L.score > 300 && Math.random() < 0.3) { const hs = [GY - 20, GY - 45, GY - 75]; L.obs.push({ b: 1, x: spawnX, y: hs[Math.floor(Math.random() * 3)], w: 34, h: 24 }); }
        else { const n = 1 + Math.floor(Math.random() * 3); L.obs.push({ x: spawnX, y: GY, w: 16 * n + (n - 1) * 4, h: 30 + Math.floor(Math.random() * 22), n }); }
        L.next = Math.floor((55 + Math.random() * 60) * (sp / 6));
      }
      const b = boxOf(L);
      for (const o of L.obs) {
        o.x -= sp;
        if (o.x > -900 && runnerBoxesOverlap(b, o)) {
          if (L.shield) { L.shield = false; L.flash = 30; o.x = -999; }
          else if (L.inv <= 0) { L.lives--; L.inv = 90; L.stun = 40; o.x = -999; if (L.lives <= 0) L.out = true; }
        }
      }
      L.obs = L.obs.filter((o) => o.x > (g.viewport?.viewLeft ?? 0) - 60);
    };
    const update = () => {
      g.t++;
      g.clouds.forEach((c) => { c.x -= 1; if (c.x < -50) { c.x = W + 30; c.y = 20 + Math.random() * 60; } });
      if (g.state === "count") { if (--g.cd <= 0) g.state = "run"; return; }
      if (g.state !== "run") return;
      g.L.forEach((l) => { if (!l.out) step(l); });
      const top = g.L.reduce((a, b) => (b.score > a.score ? b : a));
      if (race) {
        const alive = g.L.filter((l) => !l.out), done = g.L.filter((l) => l.score >= GOAL);
        if (done.length || alive.length < 2) {
          g.state = "done";
          const w = done.length ? top : alive[0] || top;
          onWin({ mode, title: w.name + " wins!", sub: `${done.length ? "Crossed the finish line" : "Last burger standing"} · Score ${sc(w)} · ♥ ${Math.max(0, w.lives)} left` });
        }
      } else {
        const l = g.L[0];
        if (l.out) { g.state = "over"; onBest(mode, sc(l)); completionRef.current?.(sc(l), Math.round((sc(l) / GOAL) * 100)); setOver(`Score ${sc(l)} / ${GOAL}`); }
        else if (l.score >= GOAL) { g.state = "done"; onBest(mode, GOAL); onWin({ mode, title: `You did it, ${l.name}!`, sub: `Score ${sc(l)} · Time ${(g.t / 60).toFixed(1)}s` }); }
        else if (mode === "card" && l.score >= g.nextCard) { g.nextCard += 200; g.state = "card"; setHand({ cards: shuffle(CARDS).slice(0, 3), pick: -1 }); }
      }
    };
    const updatePlayerStatus = (now) => {
      if (!race || now - lastStatusUpdate < 100) return;
      lastStatusUpdate = now;
      onStatus(g.L.map((player) => ({
        name: player.name,
        bun: player.bun,
        scoreLabel: `${Math.floor(player.score)} pts`,
        progress: Math.min(100, Math.floor(player.score / GOAL * 100)),
        lives: Math.max(0, player.lives),
        status: player.out ? "Out" : "Racing",
        active: false,
      })));
    };
    const drawLane = (L, laneOffset, laneBounds) => {
      g.clouds.forEach((c) => {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#24558a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x - 8, c.y + 10);
        ctx.lineTo(c.x + 4, c.y - 4);
        ctx.lineTo(c.x + 16, c.y - 4);
        ctx.lineTo(c.x + 26, c.y - 14);
        ctx.lineTo(c.x + 44, c.y - 14);
        ctx.lineTo(c.x + 58, c.y + 2);
        ctx.lineTo(c.x + 68, c.y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      ctx.fillRect(0, GY, W, 2);
      for (let k = 0; k < 24; k++) ctx.fillRect((k * 97 - L.ground + W * 2) % W, GY + 8 + (k % 3) * 6, 3 + (k % 4) * 2, 2);
      for (const o of L.obs) {
        if (!o.b) for (let k = 0; k < o.n; k++) { const x = o.x + k * 20, t = o.y - o.h; ctx.fillRect(x + 5, t, 7, o.h); ctx.fillRect(x, t + 12, 5, 5); ctx.fillRect(x, t + 12, 3, 12); ctx.fillRect(x + 12, t + 6, 5, 5); ctx.fillRect(x + 14, t + 6, 3, 14); }
        else { const f = Math.floor(g.t / 10) % 2; ctx.fillRect(o.x + 6, o.y - 16, 22, 8); ctx.fillRect(o.x, o.y - 14, 8, 4); ctx.fillRect(o.x + 28, o.y - 18, 6, 4); f ? ctx.fillRect(o.x + 10, o.y - 26, 12, 10) : ctx.fillRect(o.x + 10, o.y - 8, 12, 8); }
      }
      if (!(L.inv > 0 && Math.floor(g.t / 4) % 2)) {
        const k = sizeOf(L) * 1.35;
        ctx.save(); ctx.translate(L.x, L.y); ctx.scale(k, k); ctx.translate(-L.x, -L.y);
        ctx.shadowColor = "#111827";
        ctx.shadowBlur = 5;
        drawBurger(ctx, L.x - 20, L.y, L.duck && L.y >= GY, Math.floor(g.t / 5) % 2, L.y < GY, L.bun);
        ctx.shadowBlur = 0;
        if (L.shield) { ctx.strokeStyle = "#3fa34d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(L.x, L.y - 22, 36, 0, 7); ctx.stroke(); }
        ctx.restore();
      }
      if (L.flash) { ctx.globalAlpha = L.flash / 60; ctx.fillStyle = "#3fa34d"; ctx.fillRect(0, laneBounds[0] - laneOffset, W, laneBounds[1] - laneBounds[0]); ctx.globalAlpha = 1; }
    };
    const drawHud = (L) => {
      if (race) return;
      const viewport = g.viewport;
      const hudY = viewport.viewTop + 24;
      const hudLeft = viewport.viewLeft + 14, hudRight = viewport.viewRight - 14;
      ctx.fillStyle = "rgba(12,18,30,.88)";
      ctx.fillRect(hudLeft - 8, hudY - 22, hudRight - hudLeft + 16, 42);
      ctx.strokeStyle = "rgba(255,255,255,.72)";
      ctx.lineWidth = 2;
      ctx.strokeRect(hudLeft - 8, hudY - 22, hudRight - hudLeft + 16, 42);
      ctx.fillStyle = FG; ctx.strokeStyle = FG; ctx.lineWidth = 2; ctx.font = 'bold 16px "Courier New",monospace';
      ctx.textAlign = "left";       ctx.fillText(L.name, hudLeft, hudY);
      ctx.textAlign = "right"; ctx.fillText(String(sc(L)).padStart(4, "0"), hudRight, hudY);
      ctx.strokeRect(hudLeft, hudY + 10, hudRight - hudLeft, 8); ctx.fillRect(hudLeft + 2, hudY + 12, (hudRight - hudLeft - 4) * Math.min(1, L.score / GOAL), 4);
      ctx.textAlign = "right"; ctx.fillText("🏁", hudRight + 10, hudY + 28);
    };
    let last = "";
    const draw = () => {
      const viewport = resizeCanvas();
      if (!viewport) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(viewport.scaleX * viewport.dpr, 0, 0, viewport.scaleY * viewport.dpr, viewport.offsetX * viewport.dpr, viewport.offsetY * viewport.dpr);
      ctx.clearRect(viewport.viewLeft, viewport.viewTop, viewport.viewRight - viewport.viewLeft, viewport.viewBottom - viewport.viewTop);
      g.L.forEach((L, i) => {
        const laneBounds = viewport.laneBounds[i];
        const clipTop = Math.max(viewport.viewTop, laneBounds[0]);
        const clipBottom = Math.min(viewport.viewBottom, laneBounds[1]);
        ctx.save();
        ctx.beginPath(); ctx.rect(viewport.viewLeft, clipTop, viewport.viewRight - viewport.viewLeft, clipBottom - clipTop); ctx.clip();
        ctx.translate(0, g.laneOffsets[i]);
        drawLane(L, g.laneOffsets[i], laneBounds);
        ctx.restore();
        drawHud(L);
      });
      if (g.state === "count") { ctx.fillStyle = ACC; ctx.font = 'bold 64px "Courier New",monospace'; ctx.textAlign = "center"; ctx.fillText(Math.ceil(g.cd / 60), (viewport.viewLeft + viewport.viewRight) / 2, (viewport.viewTop + viewport.viewBottom) / 2 + 20); }
      const L = g.L[0];
      const txt = Object.keys(L.fx).map((k) => { const c = CARDS.find((x) => x.id === k); return `${c.e} ${c.n} ${Math.ceil(L.fx[k] / 60)}s`; }).concat(L.shield ? ["🥒 Shield"] : []).join("   ");
      if (txt !== last) { last = txt; setFx(txt); }
    };
    let raf;
    const loop = (now) => { update(); updatePlayerStatus(now); draw(); raf = requestAnimationFrame(loop); };
    loop();
    const kd = (e) => {
      const km = KEYS.findIndex((k) => k.j.includes(e.code) || k.d.includes(e.code));
      if (km >= 0 || e.code === "Space") e.preventDefault();
      if (km >= 0) { if (KEYS[km].j.includes(e.code)) jump(km); else duck(km, true); }
      if (e.code === "KeyR" && !race) onRestart();
    };
    const ku = (e) => KEYS.forEach((k, i) => { if (k.d.includes(e.code)) duck(i, false); });
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("keydown", kd);
      removeEventListener("keyup", ku);
      portraitQuery.removeEventListener("change", invalidateCanvasSize);
      window.removeEventListener("resize", invalidateCanvasSize);
      resizeObserver.disconnect();
    };
  }, []);

  const pickCard = (i) => {
    const g = G.current;
    if (!hand || hand.pick >= 0 || g.state !== "card") return;
    const c = hand.cards[i], L = g.L[0];
    if (c.id === "shield") L.shield = true; else { delete L.fx[CLASH[c.id]]; L.fx[c.id] = c.t; }
    setHand({ ...hand, pick: i });
    setTimeout(() => { setHand(null); if (G.current === g && g.state === "card") g.state = "run"; }, 1700);
  };

  return (
    <div className="w-full h-full min-h-0" style={{ position: "relative", overflow: "hidden" }}>
      <canvas ref={cv} width={W} height={LANE_HEIGHT * N} className={`w-full${race ? " burger-run-race-track" : ""}`}
        style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", imageRendering: "pixelated", touchAction: "manipulation" }}
        onPointerDown={(e) => {
          e.preventDefault();
          const viewport = G.current?.viewport;
          if (!viewport) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const worldY = (e.clientY - rect.top - viewport.offsetY) / viewport.scaleY;
          const lane = viewport.laneBounds.findIndex(([top, bottom]) => worldY >= top && worldY < bottom);
          jump(lane < 0 ? 0 : lane);
        }} />
      <div ref={controlsRef} className="absolute z-10 flex w-full flex-col items-center gap-3" style={{ left: "50%", top: 0, transform: "translateX(-50%)", pointerEvents: "none" }}>
        <div style={{ minHeight: 20, fontSize: 14 }}>{fxText}</div>
        <div className="burger-run-control-buttons flex gap-2 flex-wrap justify-center" style={{ pointerEvents: "auto" }}>
          {Array.from({ length: N }, (_, i) => (
            <Btn key={i} sm onPointerDown={(e) => { e.preventDefault(); duck(i, true); }} onPointerUp={() => duck(i, false)} onPointerLeave={() => duck(i, false)}>▼ Duck{race ? " " + [P.name, P2.name][i] : ""}</Btn>
          ))}
          <Btn sm onClick={onExit}>☰ Menu</Btn>
        </div>
        {race ? (
          <div className="burger-run-race-controls" aria-label="Keyboard controls">
            <div><b>{P.name}</b><span><kbd>W</kbd> Jump</span><span><kbd>S</kbd> Duck</span></div>
            <div><b>{P2.name}</b><span><kbd>↑</kbd> Jump</span><span><kbd>↓</kbd> Duck</span></div>
          </div>
        ) : <Sub>Space / ↑ / tap = jump · ↓ = duck · R = restart</Sub>}
      </div>
      {hand && (
        <Modal>
          <h2 className="text-2xl font-bold">Pick a card…</h2>
          <div className="flex gap-3">
            {hand.cards.map((c, i) => (
              <Card key={i} suit={SUITS[i]} pick={hand.pick === i} dim={hand.pick >= 0 && hand.pick !== i} disabled={hand.pick >= 0} onClick={() => pickCard(i)}
                face={hand.pick >= 0 ? { bg: c.g ? "#3fa34d" : "#d0463a", fg: "#fff", e: c.e, n: c.n, d: c.d } : null} />
            ))}
          </div>
        </Modal>
      )}
      {over && (
        <Modal>
          <div style={{ fontSize: 64 }}>💥</div>
          <h2 className="text-2xl font-bold">Game over</h2>
          <Sub>{over}</Sub>
          <Btn pri onClick={onRestart}>Try again</Btn>
          <Btn onClick={onExit}>Main menu</Btn>
        </Modal>
      )}
    </div>
  );
}

/* ================= 2P CARD DUEL ================= */
function CardDuel({ P, P2, onWin, onStatus }) {
  const GOAL = 18;
  const newDeal = () => { const e = shuffle(EFX), c = shuffle(COLS); return e.map((x, i) => ({ x, c: c[i] })); };
  const mkP = (q, pos = 0, hazardOffset = 0) => ({ name: q.name, bun: q.bun, pos, dp: pos, pts: 0, skip: false, frozen: false, safeRounds: 0, bonusActive: false, bonusAnimating: false, hazards: [], nextHazard: 1.4 + hazardOffset, jumpFrom: 0, jumpUntil: 0, duckUntil: 0 });
  const st = useRef({ pl: [mkP(P, 0.45), mkP(P2)], turn: 0, pick: -1, deal: newDeal(), t: 0, lastAt: 0, done: false });
  const [, rr] = useState(0);
  const re = () => rr((n) => n + 1);
  const cv = useRef(null), timers = useRef([]);
  const mobilePortrait = useRef(false);
  mobilePortrait.current = typeof window !== "undefined" && window.matchMedia("(max-width: 760px) and (orientation: portrait)").matches;

  useEffect(() => {
    const portraitQuery = window.matchMedia("(max-width: 760px) and (orientation: portrait)");
    const ctx = cv.current.getContext("2d");
    const canvas = cv.current;
    let raf;
    let lastStatusUpdate = 0;
    let renderSize = "";
    let resizeCanvas;
    const invalidateCanvasSize = () => {
      renderSize = "";
      if (resizeCanvas) resizeCanvas();
    };
    const updatePortraitLayout = () => {
      mobilePortrait.current = portraitQuery.matches;
      invalidateCanvasSize();
    };
    portraitQuery.addEventListener("change", updatePortraitLayout);
    const resizeObserver = new ResizeObserver(invalidateCanvasSize);
    resizeObserver.observe(canvas.parentElement);
    window.addEventListener("resize", invalidateCanvasSize);
    resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const art = mobilePortrait.current ? DUEL_PORTRAIT_ART : DUEL_LANDSCAPE_ART;
      const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
      const signature = `${width}:${height}:${dpr}:${art.width}:${art.height}`;
      const fitScale = mobilePortrait.current
        ? Math.max(rect.width / art.width, rect.height / art.height)
        : Math.min(rect.width / art.width, rect.height / art.height);
      const scaleX = mobilePortrait.current ? fitScale : rect.width / art.width;
      const scaleY = mobilePortrait.current ? fitScale : rect.height / art.height;
      const offsetX = mobilePortrait.current ? (rect.width - art.width * fitScale) / 2 : 0;
      const offsetY = mobilePortrait.current ? (rect.height - art.height * fitScale) / 2 : 0;
      if (signature !== renderSize) {
        canvas.width = width;
        canvas.height = height;
        renderSize = signature;
      }
      return {
        ...art,
        scale: scaleX,
        scaleX,
        scaleY,
        offsetX,
        offsetY,
        visibleLeft: Math.max(0, -offsetX / scaleX),
        visibleRight: Math.min(art.width, (rect.width - offsetX) / scaleX),
        dpr,
      };
    };
    const drawHazard = (hazard, frozen, trackY) => {
      const { x, type } = hazard;
      ctx.save();
      ctx.translate(x, trackY);
      ctx.scale(1.5, 1.5);
      ctx.translate(-x, -trackY);
      ctx.shadowColor = "#102033";
      ctx.shadowBlur = 5;
      ctx.fillStyle = "#267a36";
      ctx.strokeStyle = "#183b2a";
      ctx.lineWidth = 2;
      if (type === "cactus") {
        ctx.fillRect(x + 10, trackY - 34, 10, 34);
        ctx.fillRect(x + 2, trackY - 25, 9, 7);
        ctx.fillRect(x + 2, trackY - 30, 5, 10);
        ctx.fillRect(x + 19, trackY - 20, 9, 7);
        ctx.fillRect(x + 23, trackY - 25, 5, 11);
      } else if (type === "dinosaur") {
        ctx.fillStyle = "#7cbd55";
        ctx.fillRect(x + 7, trackY - 27, 24, 19);
        ctx.fillRect(x + 22, trackY - 36, 12, 13);
        ctx.fillRect(x + 29, trackY - 33, 12, 6);
        ctx.fillRect(x, trackY - 16, 12, 5);
        ctx.fillRect(x + 11, trackY - 9, 6, 9);
        ctx.fillRect(x + 25, trackY - 9, 6, 9);
        ctx.fillStyle = "#101820";
        ctx.fillRect(x + 33, trackY - 31, 3, 3);
      } else {
        const y = frozen ? trackY - 4 : trackY - 42;
        ctx.fillStyle = "#f3fbff";
        ctx.fillRect(x + 6, y - 5, 28, 8);
        ctx.fillRect(x + 27, y - 8, 12, 6);
        ctx.fillRect(x + 1, y - 2, 9, 4);
        ctx.fillRect(x + 11, y - 14, 15, 8);
        ctx.fillRect(x + 16, y - 20, 5, 6);
        ctx.fillRect(x + 17, y - 20, 3, 8);
      }
      ctx.restore();
    };
    const drawCloud = (x, y, size) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size, size);
      ctx.fillStyle = "#f7fbff";
      ctx.strokeStyle = "#315f86";
      ctx.lineWidth = 5;
      ctx.shadowColor = "rgba(13,38,68,.45)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(-86, 16);
      ctx.lineTo(-70, -2);
      ctx.lineTo(-50, -2);
      ctx.lineTo(-35, -27);
      ctx.lineTo(-8, -27);
      ctx.lineTo(8, -8);
      ctx.lineTo(23, -34);
      ctx.lineTo(55, -34);
      ctx.lineTo(75, -4);
      ctx.lineTo(92, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    const loop = (now) => {
      const art = resizeCanvas();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(art.scaleX * art.dpr, 0, 0, art.scaleY * art.dpr, art.offsetX * art.dpr, art.offsetY * art.dpr);
      const s = st.current, dt = Math.min((now - (s.lastAt || now)) / 1000, 0.05);
      s.lastAt = now;
      s.t += dt;
      if (now - lastStatusUpdate >= 100) {
        lastStatusUpdate = now;
        onStatus(s.pl.map((player, index) => ({
          name: player.name,
          bun: player.bun,
          scoreLabel: `${player.pts} pts`,
          progress: Math.min(100, Math.floor(player.dp / GOAL * 100)),
          lives: null,
          status: player.bonusActive || player.bonusAnimating
            ? "Double points bonus"
            : player.frozen
              ? "Frozen"
              : s.turn === index ? "Choose a card" : `${player.safeRounds}/3 safe rounds`,
          bonusActive: player.bonusActive || player.bonusAnimating,
          active: s.turn === index && !s.done,
        })));
      }
      ctx.clearRect(0, 0, art.width, art.height);
      if (mobilePortrait.current) {
        drawCloud(art.visibleLeft + (art.visibleRight - art.visibleLeft) * 0.36, 410, 1.35);
        drawCloud(art.visibleLeft + (art.visibleRight - art.visibleLeft) * 0.78, 520, 0.95);
      } else {
        drawCloud(art.visibleLeft + (art.visibleRight - art.visibleLeft) * 0.32, 250, 1.25);
        drawCloud(art.visibleLeft + (art.visibleRight - art.visibleLeft) * 0.72, 345, 0.95);
      }
      s.pl.forEach((p, i) => {
        const trackY = art.laneYs[i];
        const winning = s.winning?.player === i;
        const finishRun = winning ? Math.min(84, (s.t - s.winning.at) * 150) : 0;
        const margin = mobilePortrait.current ? 24 : 42;
        const startX = art.visibleLeft + margin;
        const finishX = art.visibleRight - (mobilePortrait.current ? 90 : 120);
        const runnerX = startX + (p.dp / GOAL) * (finishX - startX) + finishRun;
        if (!s.done && !s.winning && s.t >= p.nextHazard) {
          const types = ["cactus", "dinosaur", "pterodactyl"];
          p.hazards.push({ type: types[Math.floor(Math.random() * types.length)], x: art.width + 30, actioned: false });
          p.nextHazard = s.t + 2.4 + Math.random() * 1.4;
        }
        p.hazards.forEach((hazard) => {
          hazard.x -= 190 * dt;
          if (hazard.actioned || p.frozen || hazard.x > runnerX + 170 || hazard.x < runnerX + 60) return;
          hazard.actioned = true;
          const passDuration = (hazard.x + 72 - runnerX) / 190 + 0.08;
          if (hazard.type === "pterodactyl") p.duckUntil = Math.max(p.duckUntil, s.t + passDuration);
          else { p.jumpFrom = s.t; p.jumpUntil = s.t + passDuration + 0.25; }
        });
        p.hazards = p.hazards.filter((hazard) => hazard.x > -55);
        p.dp += (p.pos - p.dp) * Math.min(1, dt * 8);
        ctx.fillStyle = "#172033";
        ctx.fillRect(0, trackY - 2, art.width, 12);
        ctx.fillStyle = "#ffe08a";
        ctx.fillRect(0, trackY, art.width, 5);
        for (let x = -100; x < art.width; x += 100) {
          const dashX = x - ((s.t * 100) % 100);
          ctx.fillStyle = "#f8fbff";
          ctx.fillRect(dashX, trackY + 17, 55, 6);
          ctx.strokeStyle = "#233247";
          ctx.lineWidth = 2;
          ctx.strokeRect(dashX, trackY + 17, 55, 6);
        }
        p.hazards.forEach((hazard) => drawHazard(hazard, p.frozen, trackY));
        const finish = { left: finishX - 14, right: finishX + 82, top: trackY - 96 };
        const flash = winning && Math.floor((s.t - s.winning.at) * 10) % 2 === 0;
        const gateColor = winning ? (flash ? "#fff27a" : "#ff8a3d") : FG;
        ctx.save();
        ctx.shadowColor = winning ? gateColor : "transparent";
        ctx.shadowBlur = winning ? 28 : 12;
        ctx.fillStyle = gateColor;
        ctx.fillStyle = "#172033";
        ctx.fillRect(finish.left - 4, finish.top - 4, 16, trackY - finish.top + 8);
        ctx.fillRect(finish.right - 4, finish.top - 4, 16, trackY - finish.top + 8);
        ctx.fillStyle = gateColor;
        ctx.fillRect(finish.left, finish.top, 8, trackY - finish.top);
        ctx.fillRect(finish.right, finish.top, 8, trackY - finish.top);
        ctx.fillRect(finish.left - 4, finish.top - 4, finish.right - finish.left + 16, 8);
        for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) {
          ctx.fillStyle = winning
            ? ((r + c) % 2 === 0 ? (flash ? "#fff27a" : "#ff8a3d") : (flash ? "#fff" : "#ffb3d1"))
            : ((r + c) % 2 === 0 ? "#fff3d6" : "#162438");
          ctx.fillRect(finish.left + 8 + c * 12, finish.top + r * 12, 12, 12);
        }
        ctx.restore();
        const x = runnerX;
        const jumping = !p.frozen && p.jumpUntil > s.t;
        const ducking = !p.frozen && p.duckUntil > s.t;
        const jumpHeight = jumping ? Math.sin(((s.t - p.jumpFrom) / (p.jumpUntil - p.jumpFrom)) * Math.PI) * 72 : 0;
        const bonusFlight = p.bonusActive || p.bonusAnimating;
        const flightHeight = bonusFlight ? 62 + Math.sin(s.t * 8) * 14 : 0;
        const y = p.frozen ? trackY - 55 + Math.sin(s.t * 5) * 2 : trackY - jumpHeight - flightHeight;
        ctx.save();
        if (bonusFlight) {
          ctx.fillStyle = "#fff3b0";
          ctx.font = "24px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("✦", x - 31, y - 12 + Math.sin(s.t * 9) * 4);
          ctx.fillText("✦", x + 34, y - 28 + Math.sin(s.t * 7) * 5);
        }
        ctx.translate(x, y);
        if (bonusFlight) ctx.rotate(Math.sin(s.t * 5) * 0.1);
        ctx.scale(1.45, 1.45);
        ctx.translate(-x, -y);
        ctx.shadowColor = "#101820";
        ctx.shadowBlur = 6;
        drawBurger(ctx, x, y, ducking, p.frozen ? 0 : Math.floor(s.t * 12) % 2, jumping, p.bun);
        ctx.shadowBlur = 0;
        ctx.restore();
        if (p.frozen) {
          ctx.fillStyle = "rgba(120,190,255,.35)"; ctx.fillRect(x - 8, y - 52, 64, 58);
          ctx.strokeStyle = "#9cf"; ctx.lineWidth = 2; ctx.strokeRect(x - 8, y - 52, 64, 58);
          ctx.font = "22px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.fillText("❄️", x + 20, y - 57);
        }
      });
      if (s.winning && s.t - s.winning.at >= 1.6) {
        s.done = true;
        onWin(s.winning.result);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      portraitQuery.removeEventListener("change", updatePortraitLayout);
      resizeObserver.disconnect();
      window.removeEventListener("resize", invalidateCanvasSize);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const pick = (i) => {
    const s = st.current;
    if (s.pick >= 0 || s.done) return;
    const { x } = s.deal[i], T = s.turn, p = s.pl[T];
    p.pos = Math.min(GOAL, Math.max(0, p.pos + x.mv));
    resolveDuelPick(p, x);
    if (x.id === "freeze") { p.frozen = true; p.skip = true; }
    s.pick = i; re();
    timers.current.push(setTimeout(() => {
      if (s.done || s.winning) return;
      finishDuelBonusRound(p);
      if (p.pos >= GOAL) {
        s.winning = {
          player: T,
          at: s.t,
          result: { mode: "duel", title: p.name + " wins!", sub: `Reached the finish line with ${p.pts} pts` },
        };
        re();
        return;
      }
      s.turn = advanceDuelTurn(s, T); s.pick = -1; s.deal = newDeal(); re();
    }, 2000));
  };

  const s = st.current;
  return (
    <div className="burger-run-duel">
      <style>{`.burger-run-duel{position:relative;width:100%;height:100%;min-height:0;overflow:hidden}.burger-run-duel-track{position:absolute;inset:0;width:100%;height:100%;display:block;image-rendering:pixelated}.burger-run-duel-controls{position:absolute;top:46%;left:50%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:6px;width:min(520px,70%);height:52%;min-width:0;box-sizing:border-box;transform:translateX(-50%);text-align:center}.burger-run-duel-controls h2{min-height:0!important;margin:0;color:#fff!important;font-size:clamp(16px,2.2vw,24px)!important;text-shadow:0 2px 4px #202124,0 0 8px #202124}.burger-run-duel-controls h2 canvas{width:34px!important;height:30px!important}.burger-run-duel-controls p{color:#fff!important;font-size:clamp(10px,1.2vw,13px)!important;text-shadow:0 1px 4px #202124}.burger-run-duel-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;width:100%;max-width:520px}.burger-run-duel-cards button{aspect-ratio:3/4!important;min-width:0}@media(max-width:760px) and (orientation:portrait){.burger-run-duel-controls{top:46%;width:94%;height:52%;gap:4px}.burger-run-duel-controls h2{font-size:16px!important}.burger-run-duel-controls h2 canvas{width:24px!important;height:21px!important}.burger-run-duel-cards{gap:8px}.burger-run-duel-cards button{border-radius:12px!important}}`}</style>
      <style>{`@media(min-width:761px){.burger-run-duel-controls{top:52%;height:48%}}`}</style>
      <canvas ref={cv} className="burger-run-duel-track" />
      <section className="burger-run-duel-controls">
        <div className="burger-run-duel-cards">
          {s.deal.map(({ x, c }, i) => (
            <Card key={i} suit={SUITS[i]} compact disabled={s.pick >= 0} pick={s.pick === i} dim={s.pick >= 0 && s.pick !== i} onClick={() => pick(i)}
              face={s.pick >= 0 ? { bg: c[0], fg: c[2], e: x.e, n: x.n, d: x.d } : null} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ================= APP ================= */
export default function BurgerRun({ onComplete, startAtMenu = false }) {
  const [scr, setScr] = useState(startAtMenu ? "menu" : "splash");
  const completionRef = useRef(onComplete);
  completionRef.current = onComplete;
  const [P, setP] = useState({ name: startAtMenu ? "Chef" : "", bun: BUNS[7].color });
  const [P2, setP2] = useState({ name: "Player 2", bun: BUNS[2].color });
  const [best, setBest] = useState({ classic: 0, card: 0 });
  const [win, setWin] = useState(null);
  const [mode, setMode] = useState("classic");
  const [playerStatuses, setPlayerStatuses] = useState(() => [createPlayerStatus(P), createPlayerStatus(P2)]);
  const [run, setRun] = useState(0);
  const go = () => setScr(P.name ? "menu" : "info");
  const play = (m) => {
    setMode(m);
    setPlayerStatuses(m === "duel"
      ? [createPlayerStatus(P, "0 pts", null, "Choose a card"), createPlayerStatus(P2, "0 pts", null, "Waiting")]
      : [createPlayerStatus(P, "0 pts", 3, "Racing"), createPlayerStatus(P2, "0 pts", 3, "Racing")]);
    setRun((r) => r + 1);
    setScr(m === "duel" ? "duel" : "game");
  };
  const onBest = (m, v) => setBest((b) => ({ ...b, [m]: Math.max(b[m] || 0, v) }));
  const reportCompletion = (score, accuracy) => completionRef.current?.(score, accuracy);
  const onWin = (d) => { setWin(d); setScr("win"); reportCompletion(100, 100); };
  const menu = () => setScr("menu");
  const isPlaying = scr === "game" || scr === "duel";
  const isTwoPlayerRun = mode === "race" || mode === "duel";
  const gameplayBackground = RUN_BACKGROUNDS[mode];
  const background = scr === "splash"
    ? "/assets/games/burger-run/burger-run-welcome-bg.webp"
    : scr === "win"
      ? "/assets/games/burger-run/burger-run-victory-bg.webp"
      : isPlaying
        ? `/assets/games/burger-run/${gameplayBackground.desktop}`
        : "/assets/games/burger-run/burger-run-general-bg.webp";

  useEffect(() => {
    if (scr !== "splash") return;
    const f = (e) => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); go(); } };
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, [scr, P.name]);

  return (
    <div data-burger-run-mode={mode} className={`w-full flex items-center justify-center${scr === "splash" ? " burger-run-splash" : ""}${isPlaying ? ` burger-run-play-screen ${isTwoPlayerRun ? "burger-run-play-screen-two-player" : "burger-run-play-screen-single"}` : ""}`} style={{ height: "100%", minHeight: "100%", overflow: isPlaying || scr === "splash" ? "hidden" : "auto", position: "relative", backgroundColor: BG, backgroundImage: `url("${background}")`, backgroundSize: isPlaying && isTwoPlayerRun ? "100% 100%" : "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", "--burger-run-mobile-background": `url("/assets/games/burger-run/${gameplayBackground.mobile}")`, color: FG, fontFamily: '"Courier New",ui-monospace,monospace', userSelect: "none" }}>
      <style>{`@keyframes bob{50%{transform:translateY(-12px)}}@keyframes fall{to{transform:translateY(110vh) rotate(360deg)}}@keyframes bl{50%{opacity:.25}}@keyframes burger-run-bonus-flash{0%,100%{border-color:#ffd166;background:rgba(38,34,21,.97);box-shadow:0 0 0 3px rgba(255,209,102,.34),0 0 18px rgba(255,209,102,.52),0 3px 10px rgba(0,0,0,.5)}50%{border-color:#fff3b0;background:rgba(112,72,20,.98);box-shadow:0 0 0 5px rgba(255,243,176,.55),0 0 28px rgba(255,209,102,.9),0 3px 10px rgba(0,0,0,.5)}}.burger-run-player-status.is-bonus{animation:burger-run-bonus-flash .48s steps(2,end) infinite}.burger-run-player-status-label.is-bonus{background:#ffd166;border-color:#fff3b0;color:#152033;text-shadow:none;box-shadow:0 0 12px rgba(255,209,102,.75)}`}</style>
      <style>{`.burger-run-splash-art{display:contents}.burger-run-start-hitbox{position:absolute;z-index:1;left:50%;top:58.5%;width:21%;height:11.6%;transform:translate(-50%,-50%);padding:0;border:0;border-radius:14px;background:transparent;cursor:pointer;touch-action:manipulation}@media(max-width:760px) and (orientation:portrait){.burger-run-splash{background-image:none!important}.burger-run-splash-art{display:block;position:absolute;left:50%;top:50%;width:max(100%,calc((100dvh - 61px)*.5628));aspect-ratio:941/1672;transform:translate(-50%,-50%);background:url("/assets/games/burger-run/burger-run-welcome-phone-bg.webp") center/100% 100% no-repeat}.burger-run-splash-art .burger-run-start-hitbox{left:50.8%;top:54.5%;width:37.2%;height:6.9%}.burger-run-play-screen{background-image:var(--burger-run-mobile-background)!important;background-size:cover!important;background-position:center;background-repeat:no-repeat}}`}</style>
      <style>{`.burger-run-info{display:flex;flex-direction:column;align-items:center;gap:24px;width:min(100%,900px);padding:28px 20px}.burger-run-info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;width:100%}.burger-run-player-setup{display:flex;flex-direction:column;align-items:center;gap:18px;padding:24px 18px;border:2px solid ${MUTE};border-radius:12px;background:#25272a}.burger-run-player-setup input{width:100%!important;max-width:360px!important}.burger-run-menu{display:flex;flex-direction:column;align-items:stretch;gap:26px;width:100%;padding:28px clamp(16px,4vw,48px)}.burger-run-menu-hero{display:flex;align-items:center;justify-content:center;gap:24px}.burger-run-menu-hero h2{font-size:clamp(30px,4vw,48px)}.burger-run-menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;width:100%}.burger-run-menu-mode{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:150px;padding:22px;border:2px solid ${MUTE};border-radius:12px;background:#25272a}.burger-run-menu-mode button{width:100%;min-height:68px;font-size:clamp(18px,2vw,22px)}.burger-run-menu-mode p{font-size:15px}.burger-run-menu-footer{display:flex;justify-content:center;gap:18px;flex-wrap:wrap}.burger-run-menu-footer button{min-height:58px}.burger-run-race-controls{display:flex;justify-content:center;gap:clamp(20px,6vw,72px);flex-wrap:wrap}.burger-run-race-controls>div{display:flex;align-items:center;gap:12px;padding:8px 14px;border:2px solid ${MUTE};border-radius:8px;background:#25272a}.burger-run-race-controls span{display:inline-flex;align-items:center;gap:5px;color:${FG};font-size:14px}.burger-run-race-controls kbd{min-width:28px;padding:3px 6px;border:1px solid ${FG};border-radius:4px;background:${BG};font:700 14px \"Courier New\",monospace;text-align:center}@media(max-width:640px){.burger-run-info{gap:16px;padding:16px 10px}.burger-run-info-grid{grid-template-columns:1fr;gap:14px}.burger-run-player-setup{gap:12px;padding:16px}.burger-run-menu{gap:16px;padding:16px 12px}.burger-run-menu-grid{grid-template-columns:1fr;gap:12px}.burger-run-menu-mode{min-height:120px;padding:16px}.burger-run-menu-hero{gap:12px}.burger-run-menu-hero canvas{width:72px!important;height:63px!important}.burger-run-race-controls{gap:8px}.burger-run-race-controls>div{gap:8px;padding:6px 8px}.burger-run-race-controls span{font-size:12px}}`}</style>
      <style>{`.burger-run-player-status-panels{position:absolute;z-index:5;top:8px;left:8px;right:8px;display:grid;gap:8px;pointer-events:none}.burger-run-player-status{display:flex;align-items:center;gap:12px;min-height:68px;padding:6px 14px;border:3px solid rgba(255,255,255,.64);border-radius:12px;background:rgba(12,18,30,.94);color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.5);text-shadow:0 1px 2px #000}.burger-run-player-status.is-active{border:4px solid #ffd166;background:rgba(38,34,21,.97);box-shadow:0 0 0 3px rgba(255,209,102,.34),0 0 18px rgba(255,209,102,.52),0 3px 10px rgba(0,0,0,.5)}.burger-run-player-status>canvas{flex:0 0 58px;width:58px!important;height:51px!important;background:#fff;border:2px solid rgba(255,255,255,.75);border-radius:9px}.burger-run-player-status-main{display:grid;gap:3px;flex:1;min-width:0}.burger-run-player-status-heading,.burger-run-player-status-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}.burger-run-player-status-heading strong{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:clamp(14px,3.4vw,18px)}.burger-run-player-status-label{flex:0 0 auto;max-width:60%;padding:4px 8px;border:1px solid rgba(255,255,255,.55);border-radius:999px;background:#28364b;color:#fff;font-size:clamp(10px,2.5vw,13px);font-weight:900;letter-spacing:.04em;text-align:center;text-transform:uppercase;white-space:nowrap}.burger-run-player-status-label.is-active{background:#ffd166;border-color:#fff3d6;color:#152033;text-shadow:none;box-shadow:0 0 12px rgba(255,209,102,.55)}.burger-run-player-status-meta{font-size:clamp(11px,2.8vw,14px);font-weight:800}.burger-run-player-status-meta span:last-child{color:#ff7b91;letter-spacing:2px}.burger-run-player-status-progress{height:8px;overflow:hidden;border:1px solid rgba(255,255,255,.72);border-radius:999px;background:#202124}.burger-run-player-status-progress span{display:block;height:100%;background:${ACC};transition:width 120ms linear}@media(max-width:640px){.burger-run-control-buttons{display:none!important}.burger-run-player-status-panels{top:6px;left:6px;right:6px;gap:6px}.burger-run-player-status{min-height:60px;gap:8px;padding:4px 9px;border-width:3px}.burger-run-player-status.is-active{border-width:4px}.burger-run-player-status>canvas{flex-basis:50px;width:50px!important;height:44px!important}.burger-run-player-status-label,.burger-run-player-status-meta{font-size:10px}.burger-run-player-status-label{padding:3px 6px;letter-spacing:0}.burger-run-player-status-progress{height:7px}}`}</style>
      <style>{`.burger-run-victory-content{position:absolute;inset:0;z-index:2;display:flex;align-items:flex-start;justify-content:center;box-sizing:border-box;padding:max(18px,4vh) 16px 0;pointer-events:none}.burger-run-victory-panel{display:grid;justify-items:center;gap:12px;width:min(100%,480px);padding:18px 20px;border:3px solid #ffe08a;border-radius:18px;background:rgba(13,28,47,.92);color:#fff;box-shadow:0 8px 28px rgba(0,0,0,.55);text-align:center;pointer-events:auto}.burger-run-victory-panel h1{margin:0;color:#ffe08a;font-size:clamp(1.5rem,6vw,2.4rem);line-height:1.1;text-shadow:0 2px 3px #101820}.burger-run-victory-panel p{color:#f3f7ff;font-size:clamp(.85rem,3vw,1rem)}.burger-run-victory-panel button{width:min(100%,320px);min-height:48px;border-color:#fff3d6;box-shadow:0 3px 0 #79421c}.burger-run-player-status{border-color:#f3ead6}.burger-run-player-status.is-active{border-color:#ffd166}.burger-run-player-status-progress{border:2px solid #f3ead6;background:#172033}.burger-run-player-status-progress span{background:linear-gradient(90deg,#f6ad38,#ffe08a)}@media(max-width:640px){.burger-run-victory-content{padding:14px 12px 0}.burger-run-victory-panel{gap:9px;padding:14px 14px;border-width:3px}}`}</style>
      {isPlaying && isTwoPlayerRun && <PlayerStatusPanels players={playerStatuses} />}
      {scr === "splash" && (
        <div className="burger-run-splash-art">
          <button type="button" aria-label="Start Burger Run" title="Start Burger Run" className="burger-run-start-hitbox" onClick={go} />
        </div>
      )}
      {scr !== "splash" && <div className="w-full p-3 flex flex-col items-center gap-3 text-center" style={{ flex: isPlaying ? "1 1 auto" : undefined, width: "100%", height: isPlaying ? "100%" : "auto", minHeight: 0, maxWidth: isPlaying ? "none" : scr === "menu" ? "68rem" : "60rem", padding: isPlaying ? 0 : undefined, boxSizing: "border-box" }}>
        {scr === "info" && <Info P={P} P2={P2} onSave={(a, b) => { setP(a); setP2(b); menu(); }} />}
        {scr === "menu" && (
          <section className="burger-run-menu">
            <header className="burger-run-menu-hero">
              <BurgerPic bun={P.bun} size={132} />
              <h2 className="font-bold">Hi, {P.name}!</h2>
            </header>
            <div className="burger-run-menu-grid">
              <article className="burger-run-menu-mode">
                <Btn pri onClick={() => play("classic")}>▶ Classic Run</Btn>
                <Sub>Solo race to 1000 points</Sub>
              </article>
              <article className="burger-run-menu-mode">
                <Btn pri onClick={() => play("card")}>🃏 Card Mode</Btn>
                <Sub>Solo · pick a card every 200 points</Sub>
              </article>
              <article className="burger-run-menu-mode">
                <Btn pri onClick={() => play("duel")}>🃏🃏 2P Card Duel</Btn>
                <Sub>Pick cards to move forward, move back or freeze</Sub>
              </article>
              <article className="burger-run-menu-mode">
                <Btn pri onClick={() => play("race")}>🏁 2P Race</Btn>
                <Sub>Same screen · 3 lives each · W/S vs ↑/↓</Sub>
              </article>
            </div>
            <div className="burger-run-menu-footer">
              <Btn onClick={() => setScr("howto")}>📖 How to Play</Btn>
              <Btn onClick={() => setScr("info")}>👤 Edit profiles</Btn>
            </div>
            <Sub>Best — Classic: {best.classic} · Card: {best.card}</Sub>
          </section>
        )}
        {scr === "howto" && (
          <section style={{ width: "100%", maxWidth: 760, maxHeight: "85vh", overflowY: "auto", padding: 20, boxSizing: "border-box", border: `2px solid ${MUTE}`, borderRadius: 10, textAlign: "left" }}>
            <h2 className="text-2xl font-bold" style={{ textAlign: "center", color: ACC, marginTop: 0 }}>How to Play Burger Run</h2>
            <p>Choose a mode from the main menu. In runner modes, jump over cacti and dinosaurs, duck under pterodactyls, and reach the goal.</p>
            <h3 style={{ color: ACC }}>Classic Run</h3>
            <p>Run solo and aim for 1,000 points. Use <b>Space</b>, <b>↑</b>, or tap the track to jump. Hold <b>↓</b> or press the Duck button to crouch. Press <b>R</b> to restart.</p>
            <h3 style={{ color: ACC }}>Solo Card Mode</h3>
            <p>Run solo and choose one of three cards each time you reach another 200 points. Pickle Shield blocks a hit; Cheese Float changes your jumps; Lettuce Boost doubles points; Bacon Shrink makes you smaller; Honey Slow slows the run; Hot Sauce speeds it up; Mega Size makes you bigger; and Ketchup Boots weaken your jumps. Keep dodging between picks.</p>
            <h3 style={{ color: ACC }}>2P Card Duel</h3>
            <p>Take turns picking one of four cards. Turbo moves forward 3 steps, Boost moves forward 2, Slow moves back 2, and Freeze holds position and skips that player&apos;s next turn. If both players are due to skip, each frozen turn is skipped before play resumes. First to 18 steps wins. Both burgers automatically jump cacti and dinosaurs and duck under pterodactyls; frozen burgers are safe from low-flying pterodactyls.</p>
            <h3 style={{ color: ACC }}>2P Race</h3>
            <p>Race side by side to 1,200 points with three lives each. Player 1 uses <b>W</b> to jump and <b>S</b> to duck; Player 2 uses <b>↑</b> to jump and <b>↓</b> to duck. First to the finish wins, or the last burger standing wins if the other runs out of lives.</p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <Btn pri onClick={menu}>Back to modes</Btn>
            </div>
          </section>
        )}
        {scr === "game" && <Runner key={run} mode={mode} P={P} P2={P2} onBest={onBest} onExit={menu} onRestart={() => setRun((r) => r + 1)} onWin={onWin} onComplete={reportCompletion} onStatus={setPlayerStatuses} />}
        {scr === "duel" && <CardDuel key={run} P={P} P2={P2} onWin={onWin} onStatus={setPlayerStatuses} />}
        {scr === "win" && win && <Win d={win} onAgain={() => play(win.mode)} onMenu={menu} bun={P.bun} />}
      </div>}
    </div>
  );
}