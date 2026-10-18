import { useState, useEffect, useRef } from "react";
import { drawBurger } from "./burger-sprite";

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
const W = 720, LH = 210, GY = 175;
const SUITS = ["♠", "♥", "♦", "♣"];
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
    <button disabled={disabled} onClick={onClick} className="flex flex-col items-center justify-center gap-1"
      style={{ width: compact ? "100%" : "clamp(76px,21vw,140px)", aspectRatio: "2/3", borderRadius: 10, padding: 4, font: "inherit", border: `3px solid ${pick ? "#fff" : "#666"}`, background: face ? face.bg : "#000", color: face ? face.fg : "#fff", opacity: dim ? 0.4 : 1, transform: pick ? "translateY(-8px)" : "none", transition: "all .2s", cursor: disabled ? "default" : "pointer" }}>
      {face ? (
        <>
          <span style={{ fontSize: "clamp(26px,8vw,44px)" }}>{face.e}</span>
          <b style={{ fontSize: 13 }}>{face.n}</b>
          <small style={{ fontSize: 10 }}>{face.d}</small>
        </>
      ) : (
        <span style={{ fontSize: "clamp(34px,10vw,56px)" }}>{suit}</span>
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
    <div className="flex flex-col items-center gap-3">
      <div className="fixed inset-0" style={{ pointerEvents: "none", overflow: "hidden" }}>
        {cf.map((c, i) => <span key={i} style={{ position: "absolute", top: -40, left: c.l + "%", fontSize: 28, animation: `fall 4s linear ${c.dl}s infinite` }}>{c.e === "burger" ? <BurgerPic bun={bun} size={32} /> : c.e}</span>)}
      </div>
      <div style={{ fontSize: 90, animation: "bob 1.2s ease-in-out infinite" }}>🏆</div>
      <h1 className="text-4xl font-bold">{d.title}</h1>
      <Sub>{d.sub}</Sub>
      <Btn pri onClick={onAgain}>Play again</Btn>
      <Btn onClick={onMenu}>Main menu</Btn>
    </div>
  );
}

/* ================= RUNNER: classic, solo card mode, 2P race (1-2 lanes) ================= */
function Runner({ mode, P, P2, onBest, onExit, onRestart, onWin, onComplete }) {
  const race = mode === "race", N = race ? 2 : 1, LIVES = race ? 3 : 1, GOAL = race ? 1200 : 1000;
  const cv = useRef(null), G = useRef(null);
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
    const mk = (i) => ({ name: names[i], bun: buns[i], y: GY, vy: 0, duck: false, score: 0, obs: [], next: 90, lives: LIVES, inv: 0, stun: 0, fx: {}, shield: false, flash: 0, out: false, ground: 0 });
    const g = (G.current = { state: race ? "count" : "run", cd: 180, t: 0, nextCard: 200, L: Array.from({ length: N }, (_, i) => mk(i)), clouds: [{ x: 200, y: 40 }, { x: 500, y: 70 }] });
    const ctx = cv.current.getContext("2d");
    const sc = (l) => Math.floor(l.score);
    const sizeOf = (L) => (L.fx.big ? 1.35 : L.fx.tiny ? 0.7 : 1);
    const boxOf = (L) => {
      const k = sizeOf(L), cx = 70;
      const b = L.duck && L.y >= GY ? { x: 48, y: L.y - 34, w: 54, h: 34 } : { x: 54, y: L.y - 42, w: 34, h: 42 };
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
        if (L.score > 300 && Math.random() < 0.3) { const hs = [GY - 20, GY - 45, GY - 75]; L.obs.push({ b: 1, x: W + 20, y: hs[Math.floor(Math.random() * 3)], w: 34, h: 24 }); }
        else { const n = 1 + Math.floor(Math.random() * 3); L.obs.push({ x: W + 20, y: GY, w: 16 * n + (n - 1) * 4, h: 30 + Math.floor(Math.random() * 22), n }); }
        L.next = Math.floor((55 + Math.random() * 60) * (sp / 6));
      }
      const b = boxOf(L);
      for (const o of L.obs) {
        o.x -= sp;
        if (o.x > -900 && b.x < o.x + o.w - 3 && b.x + b.w > o.x + 3 && b.y < o.y - 3 && b.y + b.h > o.y - o.h + 3) {
          if (L.shield) { L.shield = false; L.flash = 30; o.x = -999; }
          else if (L.inv <= 0) { L.lives--; L.inv = 90; L.stun = 40; o.x = -999; if (L.lives <= 0) L.out = true; }
        }
      }
      L.obs = L.obs.filter((o) => o.x > -60);
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
    const drawLane = (L) => {
      ctx.fillStyle = FG;
      ctx.globalAlpha = 0.3; g.clouds.forEach((c) => { ctx.fillRect(c.x, c.y, 44, 10); ctx.fillRect(c.x + 10, c.y - 8, 24, 8); }); ctx.globalAlpha = 1;
      ctx.fillRect(0, GY, W, 2);
      for (let k = 0; k < 24; k++) ctx.fillRect((k * 97 - L.ground + W * 2) % W, GY + 8 + (k % 3) * 6, 3 + (k % 4) * 2, 2);
      for (const o of L.obs) {
        if (!o.b) for (let k = 0; k < o.n; k++) { const x = o.x + k * 20, t = o.y - o.h; ctx.fillRect(x + 5, t, 7, o.h); ctx.fillRect(x, t + 12, 5, 5); ctx.fillRect(x, t + 12, 3, 12); ctx.fillRect(x + 12, t + 6, 5, 5); ctx.fillRect(x + 14, t + 6, 3, 14); }
        else { const f = Math.floor(g.t / 10) % 2; ctx.fillRect(o.x + 6, o.y - 16, 22, 8); ctx.fillRect(o.x, o.y - 14, 8, 4); ctx.fillRect(o.x + 28, o.y - 18, 6, 4); f ? ctx.fillRect(o.x + 10, o.y - 26, 12, 10) : ctx.fillRect(o.x + 10, o.y - 8, 12, 8); }
      }
      if (!(L.inv > 0 && Math.floor(g.t / 4) % 2)) {
        const k = sizeOf(L);
        ctx.save(); ctx.translate(70, L.y); ctx.scale(k, k); ctx.translate(-70, -L.y);
        drawBurger(ctx, 50, L.y, L.duck && L.y >= GY, Math.floor(g.t / 5) % 2, L.y < GY, L.bun);
        if (L.shield) { ctx.strokeStyle = "#3fa34d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(70, L.y - 22, 36, 0, 7); ctx.stroke(); }
        ctx.restore();
      }
      if (L.flash) { ctx.globalAlpha = L.flash / 60; ctx.fillStyle = "#3fa34d"; ctx.fillRect(0, 0, W, LH); ctx.globalAlpha = 1; }
      ctx.fillStyle = FG; ctx.strokeStyle = FG; ctx.lineWidth = 2; ctx.font = 'bold 16px "Courier New",monospace';
      const lv = Math.max(0, L.lives);
      ctx.textAlign = "left"; ctx.fillText(L.name + (race ? "  " + "♥".repeat(lv) + "♡".repeat(LIVES - lv) : ""), 14, 24);
      ctx.textAlign = "right"; ctx.fillText(String(sc(L)).padStart(4, "0"), W - 14, 24);
      ctx.strokeRect(14, 34, W - 28, 8); ctx.fillRect(16, 36, (W - 32) * Math.min(1, L.score / GOAL), 4);
      ctx.textAlign = "right"; ctx.fillText("🏁", W - 4, 52);
    };
    let last = "";
    const draw = () => {
      ctx.clearRect(0, 0, W, LH * N);
      g.L.forEach((L, i) => {
        ctx.save(); ctx.translate(0, i * LH); ctx.beginPath(); ctx.rect(0, 0, W, LH); ctx.clip(); drawLane(L); ctx.restore();
        if (i) { ctx.fillStyle = MUTE; ctx.fillRect(0, i * LH - 1, W, 2); }
      });
      if (g.state === "count") { ctx.fillStyle = ACC; ctx.font = 'bold 64px "Courier New",monospace'; ctx.textAlign = "center"; ctx.fillText(Math.ceil(g.cd / 60), W / 2, (LH * N) / 2 + 20); }
      const L = g.L[0];
      const txt = Object.keys(L.fx).map((k) => { const c = CARDS.find((x) => x.id === k); return `${c.e} ${c.n} ${Math.ceil(L.fx[k] / 60)}s`; }).concat(L.shield ? ["🥒 Shield"] : []).join("   ");
      if (txt !== last) { last = txt; setFx(txt); }
    };
    let raf;
    const loop = () => { update(); draw(); raf = requestAnimationFrame(loop); };
    loop();
    const kd = (e) => {
      const km = KEYS.findIndex((k) => k.j.includes(e.code) || k.d.includes(e.code));
      if (km >= 0 || e.code === "Space") e.preventDefault();
      if (km >= 0) { if (KEYS[km].j.includes(e.code)) jump(km); else duck(km, true); }
      if (e.code === "KeyR" && !race) onRestart();
    };
    const ku = (e) => KEYS.forEach((k, i) => { if (k.d.includes(e.code)) duck(i, false); });
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    return () => { cancelAnimationFrame(raf); removeEventListener("keydown", kd); removeEventListener("keyup", ku); };
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
    <div className="flex flex-col items-center gap-3 w-full h-full min-h-0">
      <canvas ref={cv} width={W} height={LH * N} className={`w-full${race ? " burger-run-race-track" : ""}`} style={{ imageRendering: "pixelated", touchAction: "manipulation", ...(race ? { maxHeight: "calc(100dvh - 230px)", objectFit: "contain", flex: "0 1 auto" } : {}) }}
        onPointerDown={(e) => { e.preventDefault(); const r = e.currentTarget.getBoundingClientRect(); jump(Math.min(N - 1, Math.floor(((e.clientY - r.top) / r.height) * N))); }} />
      <div style={{ minHeight: 20, fontSize: 14 }}>{fxText}</div>
      <div className="flex gap-2 flex-wrap justify-center">
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
function CardDuel({ P, P2, onWin }) {
  const GOAL = 18, TRACK_LH = 250, TRACK_GY = 215;
  const newDeal = () => { const e = shuffle(EFX), c = shuffle(COLS); return e.map((x, i) => ({ x, c: c[i] })); };
  const mkP = (q, pos = 0, hazardOffset = 0) => ({ name: q.name, bun: q.bun, pos, dp: pos, pts: 0, skip: false, frozen: false, hazards: [], nextHazard: 1.4 + hazardOffset, jumpFrom: 0, jumpUntil: 0, duckUntil: 0 });
  const st = useRef({ pl: [mkP(P, 0.45), mkP(P2)], turn: 0, pick: -1, deal: newDeal(), msg: "", t: 0, lastAt: 0, done: false });
  const [, rr] = useState(0);
  const re = () => rr((n) => n + 1);
  const cv = useRef(null), timers = useRef([]);

  useEffect(() => {
    const ctx = cv.current.getContext("2d");
    let raf;
    const drawHazard = (hazard, frozen) => {
      const { x, type } = hazard;
      if (type === "cactus") {
        ctx.fillStyle = "#5aa83a";
        ctx.fillRect(x + 10, TRACK_GY - 34, 10, 34);
        ctx.fillRect(x + 2, TRACK_GY - 25, 9, 7);
        ctx.fillRect(x + 2, TRACK_GY - 30, 5, 10);
        ctx.fillRect(x + 19, TRACK_GY - 20, 9, 7);
        ctx.fillRect(x + 23, TRACK_GY - 25, 5, 11);
      } else if (type === "dinosaur") {
        ctx.fillStyle = "#75a64b";
        ctx.fillRect(x + 7, TRACK_GY - 27, 24, 19);
        ctx.fillRect(x + 22, TRACK_GY - 36, 12, 13);
        ctx.fillRect(x + 29, TRACK_GY - 33, 12, 6);
        ctx.fillRect(x, TRACK_GY - 16, 12, 5);
        ctx.fillRect(x + 11, TRACK_GY - 9, 6, 9);
        ctx.fillRect(x + 25, TRACK_GY - 9, 6, 9);
        ctx.fillStyle = BG;
        ctx.fillRect(x + 33, TRACK_GY - 31, 3, 3);
      } else {
        const y = frozen ? TRACK_GY - 4 : TRACK_GY - 42;
        ctx.fillStyle = "#b4c5d8";
        ctx.fillRect(x + 6, y - 5, 28, 8);
        ctx.fillRect(x + 27, y - 8, 12, 6);
        ctx.fillRect(x + 1, y - 2, 9, 4);
        ctx.fillRect(x + 11, y - 14, 15, 8);
        ctx.fillRect(x + 16, y - 20, 5, 6);
        ctx.fillRect(x + 17, y - 20, 3, 8);
      }
    };
    const loop = (now) => {
      const s = st.current, dt = Math.min((now - (s.lastAt || now)) / 1000, 0.05);
      s.lastAt = now;
      s.t += dt;
      ctx.clearRect(0, 0, W, TRACK_LH * 2);
      s.pl.forEach((p, i) => {
        const winning = s.winning?.player === i;
        const finishRun = winning ? Math.min(84, (s.t - s.winning.at) * 150) : 0;
        const runnerX = 20 + (p.dp / GOAL) * (W - 130) + finishRun;
        if (!s.done && !s.winning && s.t >= p.nextHazard) {
          const types = ["cactus", "dinosaur", "pterodactyl"];
          p.hazards.push({ type: types[Math.floor(Math.random() * types.length)], x: W + 30, actioned: false });
          p.nextHazard = s.t + 2.4 + Math.random() * 1.4;
        }
        p.hazards.forEach((hazard) => {
          hazard.x -= 190 * dt;
          if (hazard.actioned || p.frozen || hazard.x > runnerX + 150 || hazard.x < runnerX + 35) return;
          hazard.actioned = true;
          const passDuration = (hazard.x + 48 - runnerX) / 190 + 0.08;
          if (hazard.type === "pterodactyl") p.duckUntil = Math.max(p.duckUntil, s.t + passDuration);
          else { p.jumpFrom = s.t; p.jumpUntil = s.t + passDuration + 0.25; }
        });
        p.hazards = p.hazards.filter((hazard) => hazard.x > -55);
        p.dp += (p.pos - p.dp) * Math.min(1, dt * 8);
        ctx.save(); ctx.translate(0, i * TRACK_LH);
        ctx.fillStyle = FG; ctx.fillRect(0, TRACK_GY, W, 2);
        for (let x = -80; x < W; x += 80) ctx.fillRect(x - ((s.t * 100) % 80), TRACK_GY + 13, 40, 3);
        p.hazards.forEach((hazard) => drawHazard(hazard, p.frozen));
        const finish = { left: W - 88, right: W - 20, top: TRACK_GY - 128 };
        const flash = winning && Math.floor((s.t - s.winning.at) * 10) % 2 === 0;
        const gateColor = winning ? (flash ? "#fff27a" : "#ff8a3d") : FG;
        ctx.save();
        ctx.shadowColor = winning ? gateColor : "transparent";
        ctx.shadowBlur = winning ? 22 : 0;
        ctx.fillStyle = gateColor;
        ctx.fillRect(finish.left, finish.top, 4, TRACK_GY - finish.top);
        ctx.fillRect(finish.right, finish.top, 4, TRACK_GY - finish.top);
        for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
          ctx.fillStyle = winning
            ? ((r + c) % 2 === 0 ? (flash ? "#fff27a" : "#ff8a3d") : (flash ? "#fff" : "#ffb3d1"))
            : ((r + c) % 2 === 0 ? FG : BG);
          ctx.fillRect(finish.left + 4 + c * 8, finish.top + r * 8, 8, 8);
        }
        ctx.restore();
        const x = runnerX;
        const jumping = !p.frozen && p.jumpUntil > s.t;
        const ducking = !p.frozen && p.duckUntil > s.t;
        const jumpHeight = jumping ? Math.sin(((s.t - p.jumpFrom) / (p.jumpUntil - p.jumpFrom)) * Math.PI) * 72 : 0;
        const y = p.frozen ? TRACK_GY - 55 + Math.sin(s.t * 5) * 2 : TRACK_GY - jumpHeight;
        drawBurger(ctx, x, y, ducking, p.frozen ? 0 : Math.floor(s.t * 12) % 2, jumping, p.bun);
        if (p.frozen) {
          ctx.fillStyle = "rgba(120,190,255,.35)"; ctx.fillRect(x - 8, y - 52, 64, 58);
          ctx.strokeStyle = "#9cf"; ctx.lineWidth = 2; ctx.strokeRect(x - 8, y - 52, 64, 58);
          ctx.font = "22px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.fillText("❄️", x + 20, y - 57);
        }
        const act = s.turn === i && !s.done;
        ctx.fillStyle = act ? ACC : FG; ctx.strokeStyle = act ? ACC : FG; ctx.lineWidth = 2; ctx.font = 'bold 16px "Courier New",monospace';
        ctx.textAlign = "left"; ctx.fillText(p.name + (act ? "  ◀ TURN" : "") + (p.frozen ? "  ❄️ frozen" : ""), 14, 24);
        ctx.textAlign = "right"; ctx.fillText(p.pts + " pts", W - 14, 24);
        ctx.strokeRect(14, 34, W - 28, 8); ctx.fillRect(16, 36, (W - 32) * Math.min(1, p.dp / GOAL), 4);
        ctx.restore();
        if (i) { ctx.fillStyle = MUTE; ctx.fillRect(0, i * TRACK_LH - 1, W, 2); }
      });
      if (s.winning && s.t - s.winning.at >= 1.6) {
        s.done = true;
        onWin(s.winning.result);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); timers.current.forEach(clearTimeout); };
  }, []);

  const pick = (i) => {
    const s = st.current;
    if (s.pick >= 0 || s.done) return;
    const { x, c } = s.deal[i], T = s.turn, p = s.pl[T];
    p.pos = Math.min(GOAL, Math.max(0, p.pos + x.mv)); p.pts = Math.max(0, p.pts + x.pts);
    if (x.id === "freeze") { p.frozen = true; p.skip = true; }
    s.pick = i; s.msg = `${c[1]} card = ${x.e} ${x.n}`; re();
    timers.current.push(setTimeout(() => {
      if (s.done || s.winning) return;
      if (p.pos >= GOAL) {
        s.winning = {
          player: T,
          at: s.t,
          result: { mode: "duel", title: p.name + " wins!", sub: `Reached the finish line with ${p.pts} pts` },
        };
        re();
        return;
      }
      s.turn = advanceDuelTurn(s, T); s.pick = -1; s.deal = newDeal(); s.msg = ""; re();
    }, 2000));
  };

  const s = st.current, p = s.pl[s.turn];
  return (
    <div className="burger-run-duel">
      <style>{`.burger-run-duel{display:flex;flex-direction:row;align-items:stretch;gap:16px;width:100%;height:100%;min-height:0}.burger-run-duel-track{flex:1 1 0;width:0;height:100%;min-width:0;min-height:0;object-fit:contain;image-rendering:pixelated}.burger-run-duel-controls{display:flex;flex:0 0 min(340px,30vw);flex-direction:column;align-items:center;justify-content:center;gap:12px;min-width:0}.burger-run-duel-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;width:100%}@media(max-width:760px){.burger-run-duel{flex-direction:column;align-items:center;gap:8px}.burger-run-duel-track{flex:1 1 0;width:100%;height:0;min-height:0}.burger-run-duel-controls{flex:0 0 auto;width:100%;gap:8px}.burger-run-duel-cards{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}}`}</style>
      <canvas ref={cv} width={W} height={TRACK_LH * 2} className="burger-run-duel-track" />
      <section className="burger-run-duel-controls">
        <h2 className="text-xl font-bold flex items-center justify-center gap-2" style={{ color: ACC, fontSize: "calc(var(--text-xl) * 0.9)", minHeight: 36, textAlign: "center" }}>{s.pick < 0 ? <><BurgerPic bun={p.bun} size={34} /> {p.name}, pick a card!</> : s.msg}</h2>
        <div className="burger-run-duel-cards">
          {s.deal.map(({ x, c }, i) => (
            <Card key={i} suit={SUITS[i]} compact disabled={s.pick >= 0} pick={s.pick === i} dim={s.pick >= 0 && s.pick !== i} onClick={() => pick(i)}
              face={s.pick >= 0 ? { bg: c[0], fg: c[2], e: x.e, n: x.n, d: x.d } : null} />
          ))}
        </div>
        <Sub>18-step race · auto-jump cacti and dinosaurs, duck under pterodactyls · cards control progress</Sub>
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
  const [run, setRun] = useState(0);
  const go = () => setScr(P.name ? "menu" : "info");
  const play = (m) => { setMode(m); setRun((r) => r + 1); setScr(m === "duel" ? "duel" : "game"); };
  const onBest = (m, v) => setBest((b) => ({ ...b, [m]: Math.max(b[m] || 0, v) }));
  const reportCompletion = (score, accuracy) => completionRef.current?.(score, accuracy);
  const onWin = (d) => { setWin(d); setScr("win"); reportCompletion(100, 100); };
  const menu = () => setScr("menu");
  const isPlaying = scr === "game" || scr === "duel";
  const background = scr === "splash"
    ? "/assets/games/burger-run/burger-run-welcome-bg.webp"
    : scr === "win"
      ? "/assets/games/burger-run/burger-run-victory-bg.webp"
      : "/assets/games/burger-run/burger-run-general-bg.webp";

  useEffect(() => {
    if (scr !== "splash") return;
    const f = (e) => { if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); go(); } };
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, [scr, P.name]);

  return (
    <div className="w-full flex items-center justify-center" style={{ height: "100%", minHeight: "100%", overflow: isPlaying ? "hidden" : "auto", backgroundColor: BG, backgroundImage: `url("${background}")`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", color: FG, fontFamily: '"Courier New",ui-monospace,monospace', userSelect: "none" }}>
      <style>{`@keyframes bob{50%{transform:translateY(-12px)}}@keyframes fall{to{transform:translateY(110vh) rotate(360deg)}}@keyframes bl{50%{opacity:.25}}`}</style>
      <style>{`.burger-run-info{display:flex;flex-direction:column;align-items:center;gap:24px;width:min(100%,900px);padding:28px 20px}.burger-run-info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;width:100%}.burger-run-player-setup{display:flex;flex-direction:column;align-items:center;gap:18px;padding:24px 18px;border:2px solid ${MUTE};border-radius:12px;background:#25272a}.burger-run-player-setup input{width:100%!important;max-width:360px!important}.burger-run-menu{display:flex;flex-direction:column;align-items:stretch;gap:26px;width:100%;padding:28px clamp(16px,4vw,48px)}.burger-run-menu-hero{display:flex;align-items:center;justify-content:center;gap:24px}.burger-run-menu-hero h2{font-size:clamp(30px,4vw,48px)}.burger-run-menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;width:100%}.burger-run-menu-mode{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:150px;padding:22px;border:2px solid ${MUTE};border-radius:12px;background:#25272a}.burger-run-menu-mode button{width:100%;min-height:68px;font-size:clamp(18px,2vw,22px)}.burger-run-menu-mode p{font-size:15px}.burger-run-menu-footer{display:flex;justify-content:center;gap:18px;flex-wrap:wrap}.burger-run-menu-footer button{min-height:58px}.burger-run-race-controls{display:flex;justify-content:center;gap:clamp(20px,6vw,72px);flex-wrap:wrap}.burger-run-race-controls>div{display:flex;align-items:center;gap:12px;padding:8px 14px;border:2px solid ${MUTE};border-radius:8px;background:#25272a}.burger-run-race-controls span{display:inline-flex;align-items:center;gap:5px;color:${FG};font-size:14px}.burger-run-race-controls kbd{min-width:28px;padding:3px 6px;border:1px solid ${FG};border-radius:4px;background:${BG};font:700 14px \"Courier New\",monospace;text-align:center}@media(max-width:640px){.burger-run-info{gap:16px;padding:16px 10px}.burger-run-info-grid{grid-template-columns:1fr;gap:14px}.burger-run-player-setup{gap:12px;padding:16px}.burger-run-menu{gap:16px;padding:16px 12px}.burger-run-menu-grid{grid-template-columns:1fr;gap:12px}.burger-run-menu-mode{min-height:120px;padding:16px}.burger-run-menu-hero{gap:12px}.burger-run-menu-hero canvas{width:72px!important;height:63px!important}.burger-run-race-controls{gap:8px}.burger-run-race-controls>div{gap:8px;padding:6px 8px}.burger-run-race-controls span{font-size:12px}}`}</style>
      <div className="w-full p-3 flex flex-col items-center gap-3 text-center" style={{ flex: isPlaying ? "1 1 auto" : undefined, width: "100%", height: isPlaying ? "100%" : "auto", minHeight: 0, maxWidth: isPlaying ? "none" : scr === "menu" ? "68rem" : "60rem", padding: isPlaying ? 0 : undefined, boxSizing: "border-box" }}>
        {scr === "splash" && (
          <>
            <h1 className="text-5xl font-bold" style={{ letterSpacing: ".12em" }}>BURGER RUN</h1>
            <div style={{ animation: "bob 1.2s ease-in-out infinite" }}><BurgerPic bun={P.bun} size={160} /></div>
            <div style={{ animation: "bl 1s steps(2) infinite" }}><Btn pri onClick={go}>PRESS START</Btn></div>
            <Sub>Dodge the cacti. Outrun the birds. Reach the finish.</Sub>
          </>
        )}
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
        {scr === "game" && <Runner key={run} mode={mode} P={P} P2={P2} onBest={onBest} onExit={menu} onRestart={() => setRun((r) => r + 1)} onWin={onWin} onComplete={reportCompletion} />}
        {scr === "duel" && <CardDuel key={run} P={P} P2={P2} onWin={onWin} />}
        {scr === "win" && win && <Win d={win} onAgain={() => play(win.mode)} onMenu={menu} bun={P.bun} />}
      </div>
    </div>
  );
}