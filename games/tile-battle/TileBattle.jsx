import { useState, useCallback, useRef, useEffect } from "react";
import { useGame } from "@/lib/gameState";

// ── Data (ported 1:1 from the original index.html) ──
const COLORS = [
  { n: "Red", v: "#EF4444" }, { n: "Yellow", v: "#FACC15" },
  { n: "Blue", v: "#3B82F6" }, { n: "Orange", v: "#F97316" },
  { n: "Green", v: "#22C55E" }, { n: "Purple", v: "#A855F7" },
  { n: "Black", v: "#1F2937" }, { n: "White", v: "#FFFFFF" },
];
const AVATARS = ["🧙", "🦊", "🐉", "🤖", "👾", "🧝", "🐺", "🦁", "👽", "🎭"];
const OD = {
  1: { e: "🔥🔥🔥", l: "Heavy attack −20%" },
  2: { e: "👊", l: "Light attack −10%" },
  3: { e: "🩸", l: "Lifesteal −15%/+15%" },
  4: { e: "💚", l: "Heal +20%" },
  5: { e: "✨", l: "Recover +10%" },
  6: { e: "💀", l: "DEVASTATION −50%" },
};
// colour used for particles / banner glow per outcome
const OUTCOME_COLOR = { 1: "#EF4444", 2: "#F97316", 3: "#A855F7", 4: "#22C55E", 5: "#3B82F6", 6: "#111827" };
const PARTICLE_SHAPES = ["●", "✦", "✧", "★", "✸", "✹"];
const TILE_COUNT = 24; // 6x4 board
const TILE_DIST = [7, 7, 3, 2, 3, 2]; // count of each outcome 1-6

export const THEMES = {
  default: { bg: "#f5f5f7", surface: "#ffffff", surface2: "#f0f0f4", border: "#e0e0e6", border2: "#c8c8d2", text: "#1a1a2e", text2: "#6b6b80", accent: "#534AB7", accent2: "#3C3489" },
  dusk:    { bg: "#1a1025", surface: "#261835", surface2: "#321f45", border: "#4a3060", border2: "#6a4888", text: "#f0e6ff", text2: "#b09ac8", accent: "#9b59b6", accent2: "#7d3c98" },
  fire:    { bg: "#1a0a00", surface: "#2a1000", surface2: "#3d1800", border: "#6b2800", border2: "#a03a00", text: "#ffe8d0", text2: "#c48050", accent: "#e05a00", accent2: "#b04500" },
  ocean:   { bg: "#001825", surface: "#002235", surface2: "#003048", border: "#004a6e", border2: "#006a9e", text: "#d0f0ff", text2: "#70b8d8", accent: "#0088cc", accent2: "#006699" },
  forest:  { bg: "#061a06", surface: "#0c250c", surface2: "#123012", border: "#1e4a1e", border2: "#2e6a2e", text: "#d8f0d0", text2: "#80b878", accent: "#2e8b2e", accent2: "#1e6b1e" },
  rose:    { bg: "#1a0812", surface: "#280d1c", surface2: "#381228", border: "#601838", border2: "#8a2050", text: "#ffe0ee", text2: "#c878a0", accent: "#c0305a", accent2: "#9a2048" },
  slate:   { bg: "#0e1117", surface: "#161b25", surface2: "#1e2535", border: "#2a3348", border2: "#3c4d68", text: "#e0e8f8", text2: "#7888a8", accent: "#4a7abf", accent2: "#375e99" },
};
const THEME_KEYS = Object.keys(THEMES);

// ── Sound effects ── (drop matching mp3s in public/assets/sounds/tile-battle/ — missing files fail silently)
const SFX_FILES = {
  flip: "flip.mp3", heavy: "heavy.mp3", attack: "attack.mp3", heal: "heal.mp3",
  recover: "recover.mp3", steal: "steal.mp3", explosion: "explosion.mp3",
  win: "win.mp3", click: "click.mp3", music: "music.mp3",
};
const SFX_FOR_OUTCOME = { 1: "heavy", 2: "attack", 3: "steal", 4: "heal", 5: "recover", 6: "explosion" };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildTiles() {
  const out = [];
  TILE_DIST.forEach((c, i) => { for (let j = 0; j < c; j++) out.push(i + 1); });
  return shuffle(out);
}

// applies an outcome, MUTATES the hp array passed in, returns both description and floating numbers info
function applyOutcome(type, actor, target, hp, names) {
  const p = names[actor], o = names[target];
  const floatingNumbers = [];
  let desc = "";
  switch (type) {
    case 1:
      hp[target] -= 20;
      floatingNumbers.push({ player: target, amount: 20, heal: false });
      desc = `${p} lands a HEAVY ATTACK! −20% to ${o}`;
      break;
    case 2:
      hp[target] -= 10;
      floatingNumbers.push({ player: target, amount: 10, heal: false });
      desc = `${p} lands a light attack. −10% to ${o}`;
      break;
    case 3:
      hp[target] -= 15;
      hp[actor] = Math.min(100, hp[actor] + 15);
      floatingNumbers.push({ player: target, amount: 15, heal: false });
      floatingNumbers.push({ player: actor, amount: 15, heal: true });
      desc = `${p} steals 15% health from ${o}!`;
      break;
    case 4:
      hp[actor] = Math.min(100, hp[actor] + 20);
      floatingNumbers.push({ player: actor, amount: 20, heal: true });
      desc = `${p} heals! +20% health.`;
      break;
    case 5:
      hp[actor] = Math.min(100, hp[actor] + 10);
      floatingNumbers.push({ player: actor, amount: 10, heal: true });
      desc = `${p} recovers! +10% health.`;
      break;
    case 6:
      hp[target] -= 50;
      floatingNumbers.push({ player: target, amount: 50, heal: false });
      desc = `DEVASTATION! ${p} deals 50% damage to ${o}!`;
      break;
    default:
      desc = "";
  }
  return { desc, floatingNumbers };
}

// one-time global stylesheet for keyframe animations (can't express these as inline style objects)
const FX_STYLE = `
@keyframes tb-particleFly { 0% { opacity:1; transform:translate(0,0) scale(1); } 100% { opacity:0; transform:translate(var(--tb-x),var(--tb-y)) scale(0); } }
@keyframes tb-bannerShow { 0% { opacity:0; transform:translateY(25px) scale(.85); } 70% { opacity:1; transform:translateY(-4px) scale(1.04); } 100% { opacity:1; transform:translateY(0) scale(1); } }
@keyframes tb-bannerHide { to { opacity:0; transform:translateY(-12px) scale(.95); } }
@keyframes tb-victoryPop { 0% { opacity:0; transform:scale(.65) translateY(40px); } 60% { opacity:1; transform:scale(1.08) translateY(-6px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
@keyframes tb-winnerBounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
@keyframes tb-confettiFall { to { transform:translateY(110vh) rotate(720deg); opacity:0; } }
@keyframes tb-floatNumber { 0% { opacity:0; transform:translate(-50%,-50%) scale(.5); } 20% { opacity:1; transform:translate(-50%,-65%) scale(1.25); } 100% { opacity:0; transform:translate(-50%,-140%) scale(.9); } }
@keyframes tb-tileBounce { 0% { transform:translateY(0); } 40% { transform:translateY(-8px); } 70% { transform:translateY(2px); } 100% { transform:translateY(0); } }
@keyframes tb-flipFlash { 0% { opacity:0; } 25% { opacity:.75; } 100% { opacity:0; } }
.tb-banner-show { animation: tb-bannerShow .6s forwards; }
.tb-banner-hide { animation: tb-bannerHide .35s forwards; }
.tb-floating-number { position:fixed; transform:translate(-50%,-50%); pointer-events:none; font-weight:800; font-size:clamp(22px,2vw,34px); z-index:9999; text-shadow:0 2px 8px rgba(0,0,0,.35); animation:tb-floatNumber .9s forwards; }
.tb-floating-number.damage { color:#EF4444; }
.tb-floating-number.heal { color:#22C55E; }
`;

export default function TileBattle({ onComplete, themeId }) {
  const { completeGame } = useGame();

  const [screen, setScreen] = useState("setup"); // setup | howto | game | end
  const [howtoReturn, setHowtoReturn] = useState("setup");
  const [localThemeKey] = useState("default");
  const themeKey = themeId && THEMES[themeId] ? themeId : localThemeKey;
  const t = THEMES[themeKey];

  const [names, setNames] = useState(["Player 1", "Player 2"]);
  const [avatars, setAvatars] = useState(["🧙", "🧝"]);
  const [colors, setColors] = useState([COLORS[0].v, COLORS[2].v]);

  const [hp, setHp] = useState([100, 100]);
  const [turn, setTurn] = useState(0);
  const [tiles, setTiles] = useState(() => buildTiles());
  const [flipped, setFlipped] = useState(() => new Set());
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState({ icon: "", text: "Choose a tile to begin!", color: null, show: true, key: 0 });
  const [end, setEnd] = useState(null); // { emoji, title, msg, winner, hp }
  const [particles, setParticles] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [muted, setMuted] = useState(false);
  const flipsRef = useRef(0);
  const bannerHideTimer = useRef(null);
  const bannerKeyRef = useRef(0);

  // ── sound ──
  const sfxRef = useRef({});
  useEffect(() => {
    Object.entries(SFX_FILES).forEach(([key, file]) => {
      const a = new Audio(`/assets/sounds/tile-battle/${file}`);
      a.volume = key === "music" ? 0.18 : 0.55;
      if (key === "music") a.loop = true;
      sfxRef.current[key] = a;
    });
    return () => { Object.values(sfxRef.current).forEach((a) => a.pause()); };
  }, []);
  const playSound = useCallback((key) => {
    const a = sfxRef.current[key];
    if (!a || muted) return;
    a.pause();
    a.currentTime = 0;
    a.play().catch(() => {}); // ignore missing/blocked audio
  }, [muted]);
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      Object.values(sfxRef.current).forEach((a) => { a.muted = next; });
      return next;
    });
  }, []);

  // ── particles ──
  const spawnParticles = useCallback((x, y, color, count = 18) => {
    const batch = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 70;
      batch.push({
        id: `${Date.now()}-${i}-${Math.random()}`,
        x, y, color,
        dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist,
        shape: PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)],
        size: 8 + Math.random() * 10,
      });
    }
    setParticles((prev) => [...prev, ...batch]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !batch.some((b) => b.id === p.id)));
    }, 800);
  }, []);

  // ── animated banner ──
  const showBanner = useCallback((icon, text, color) => {
    clearTimeout(bannerHideTimer.current);
    bannerKeyRef.current += 1;
    setBanner({ icon, text, color, show: true, key: bannerKeyRef.current });
    bannerHideTimer.current = setTimeout(() => {
      setBanner((prev) => ({ ...prev, show: false }));
    }, 1700);
  }, []);

  // ── confetti ──
  const launchConfetti = useCallback(() => {
    const palette = ["#EF4444", "#FACC15", "#3B82F6", "#22C55E", "#A855F7", "#F97316"];
    const pieces = Array.from({ length: 120 }, (_, i) => ({
      id: `${i}-${Math.random()}`,
      left: Math.random() * 100,
      color: palette[Math.floor(Math.random() * palette.length)],
      duration: 3 + Math.random() * 2,
      rotate: Math.random() * 360,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 5000);
  }, []);

  // ── floating numbers ──
  const showFloatingNumber = useCallback((player, amount, heal = false) => {
    const pillarId = player === 0 ? "pillar1" : "pillar2";
    const pillar = document.getElementById(pillarId);
    if (!pillar) return;
    const rect = pillar.getBoundingClientRect();
    const id = `${Date.now()}-${Math.random()}`;
    const fontSize = amount >= 50 ? "42px" : amount >= 20 ? "34px" : "clamp(22px,2vw,34px)";
    setFloatingNumbers((prev) => [...prev, {
      id,
      left: rect.left + rect.width / 2,
      top: rect.top + 40,
      text: (heal ? "+" : "-") + amount,
      heal,
      fontSize,
    }]);
    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((n) => n.id !== id));
    }, 900);
  }, []);

  const selectAvatar = useCallback((pi, av) => {
    setAvatars((prev) => {
      const next = [...prev];
      const other = 1 - pi;
      if (next[other] === av) next[other] = next[pi];
      next[pi] = av;
      return next;
    });
  }, []);

  const startGame = useCallback(() => {
    setHp([100, 100]);
    setTurn(0);
    setBusy(false);
    setTiles(buildTiles());
    setFlipped(new Set());
    flipsRef.current = 0;
    setBanner({ icon: "", text: "Choose a tile to begin!", color: null, show: true, key: 0 });
    setEnd(null);
    setConfetti([]);
    setScreen("game");
    sfxRef.current.music?.play().catch(() => {});
  }, []);

  const finishGame = useCallback((p1Dead, p2Dead, finalHp) => {
    let emoji, title, msg, winner = null;
    const [n1, n2] = names;
    if (p1Dead && p2Dead) { emoji = "🤝"; title = "Draw!"; msg = "Both players fell at the same time!"; }
    else if (p1Dead) { emoji = avatars[1]; title = `${n2} Wins!`; msg = `${n1} has been defeated!`; winner = 1; }
    else if (p2Dead) { emoji = avatars[0]; title = `${n1} Wins!`; msg = `${n2} has been defeated!`; winner = 0; }
    else if (finalHp[0] > finalHp[1]) { emoji = avatars[0]; title = `${n1} Wins!`; msg = `All tiles used. ${n1}: ${Math.round(finalHp[0])}% vs ${n2}: ${Math.round(finalHp[1])}%`; winner = 0; }
    else if (finalHp[1] > finalHp[0]) { emoji = avatars[1]; title = `${n2} Wins!`; msg = `All tiles used. ${n2}: ${Math.round(finalHp[1])}% vs ${n1}: ${Math.round(finalHp[0])}%`; winner = 1; }
    else { emoji = "🤝"; title = "Draw!"; msg = `All tiles used — both at ${Math.round(finalHp[0])}%!`; }

    setEnd({ emoji, title, msg, winner, hp: finalHp });
    setScreen("end");
    sfxRef.current.music?.pause();
    if (sfxRef.current.music) sfxRef.current.music.currentTime = 0;
    playSound("win");
    launchConfetti();

    const moves = flipsRef.current;
    let score;
    if (p1Dead && p2Dead) score = 50;
    else if (p1Dead) score = 0;
    else if (p2Dead) score = 100;
    else if (finalHp[0] > finalHp[1]) score = 100;
    else if (finalHp[1] > finalHp[0]) score = 0;
    else score = 50;

    completeGame?.("tile-battle", score, moves);
    onComplete?.(score, moves);
  }, [names, avatars, completeGame, onComplete, playSound, launchConfetti]);

  const onTile = useCallback((idx, e) => {
    if (busy || flipped.has(idx)) return;
    setBusy(true);
    setFlipped((prev) => new Set(prev).add(idx));
    flipsRef.current += 1;
    const thisFlipCount = flipsRef.current;

    const actor = turn, target = 1 - actor, type = tiles[idx];
    const tileEl = e.currentTarget;

    // Lift animation
    tileEl.animate([
      { transform: "translateY(0px) scale(1)" },
      { transform: "translateY(-12px) scale(1.05)" }
    ], {
      duration: 180,
      easing: "ease-out",
      fill: "forwards"
    });

    playSound("flip");
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    spawnParticles(cx, cy, OUTCOME_COLOR[type], type === 6 ? 45 : 20);

    // Flip after lift
    setTimeout(() => {
      setHp((prevHp) => {
        const newHp = [...prevHp];
        const { desc, floatingNumbers: nums } = applyOutcome(type, actor, target, newHp, names);
        newHp[0] = Math.max(0, Math.min(100, newHp[0]));
        newHp[1] = Math.max(0, Math.min(100, newHp[1]));
        
        // Show floating numbers
        nums.forEach(({ player, amount, heal }) => {
          setTimeout(() => {
            showFloatingNumber(player, amount, heal);
          }, 100);
        });
        
        showBanner(OD[type].e, desc, OUTCOME_COLOR[type]);
        playSound(SFX_FOR_OUTCOME[type]);

        // Landing animation
        setTimeout(() => {
          tileEl.animate([
            { transform: "translateY(-12px) scale(1.05)" },
            { transform: "translateY(3px) scale(.98)" },
            { transform: "translateY(0px) scale(1)" }
          ], {
            duration: 220,
            easing: "ease-out"
          });
        }, 650);

        setTimeout(() => {
          const p1Dead = newHp[0] <= 0, p2Dead = newHp[1] <= 0;
          if (p1Dead || p2Dead || thisFlipCount >= TILE_COUNT) {
            finishGame(p1Dead, p2Dead, newHp);
          } else {
            setTurn(target);
            setBusy(false);
          }
        }, 900);

        return newHp;
      });
    }, 180);
  }, [busy, flipped, turn, tiles, names, finishGame, playSound, spawnParticles, showBanner, showFloatingNumber]);

  // ── shared styling helpers (glass look — translucent surfaces over a themed gradient backdrop) ──
  const pageBg = {
    background:
      `radial-gradient(circle at top left, ${t.accent}33, transparent 40%),` +
      `radial-gradient(circle at bottom right, ${t.accent2}33, transparent 35%),` +
      `${t.bg}`,
  };
  const glass = {
    background: `${t.surface}cc`,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: `1px solid ${t.border2}66`,
    boxShadow: "0 18px 45px rgba(0,0,0,.18)",
  };
  const screenWrap = {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: "1.5rem",
    ...pageBg, color: t.text, padding: "2rem", textAlign: "center",
    fontFamily: "Inter, system-ui, sans-serif", transition: "background .3s,color .3s",
    position: "relative", overflow: "hidden",
  };
  const primaryBtn = {
    padding: "13px 36px", borderRadius: 999,
    background: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`, color: "#fff",
    border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer",
    boxShadow: `0 12px 28px ${t.accent}55`, transition: "transform .15s ease, filter .15s ease",
  };
  const ghostBtn = {
    padding: "13px 36px", borderRadius: 999, background: "transparent", color: t.text2,
    border: `1.5px solid ${t.border2}`, fontSize: 16, fontWeight: 500, cursor: "pointer",
  };
  const card = {
    ...glass, borderRadius: 18,
    padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem",
    flex: 1, minWidth: 320, maxWidth: 560, alignItems: "center",
  };

  // shared particle burst layer + mute toggle (rendered on every screen)
  const fx = (
    <>
      <style>{FX_STYLE}</style>
      <button onClick={toggleMute} style={{
        position: "fixed", top: 18, right: 18, width: 46, height: 46, borderRadius: "50%",
        border: "none", cursor: "pointer", fontSize: 19, zIndex: 9999,
        background: `${t.surface}cc`, backdropFilter: "blur(12px)", color: t.text,
        boxShadow: "0 8px 20px rgba(0,0,0,.2)",
      }}>{muted ? "🔇" : "🔊"}</button>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "fixed", left: p.x, top: p.y, color: p.color, fontSize: p.size,
          pointerEvents: "none", zIndex: 9999, "--tb-x": `${p.dx}px`, "--tb-y": `${p.dy}px`,
          animation: "tb-particleFly .8s forwards ease-out", textShadow: `0 0 10px ${p.color}`,
        }}>{p.shape}</div>
      ))}
      {confetti.map((c) => (
        <div key={c.id} style={{
          position: "fixed", top: -20, left: `${c.left}vw`, width: 10, height: 16, borderRadius: 3,
          background: c.color, zIndex: 9999, pointerEvents: "none",
          transform: `rotate(${c.rotate}deg)`,
          animation: `tb-confettiFall ${c.duration}s linear forwards`,
        }} />
      ))}
      {floatingNumbers.map((n) => (
        <div key={n.id} className={`tb-floating-number ${n.heal ? "heal" : "damage"}`} style={{
          left: `${n.left}px`,
          top: `${n.top}px`,
          fontSize: n.fontSize,
        }}>{n.text}</div>
      ))}
    </>
  );

  // ── SETUP ──
  if (screen === "setup") return (
    <div style={screenWrap}>
      {fx}
      <h1 style={{ fontSize: "2.2rem", fontWeight: 500 }}>⚔️ Tile Battle</h1>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 1200 }}>
        {[0, 1].map((pi) => (
          <div key={pi} style={card}>
            <input
              value={names[pi]}
              maxLength={16}
              placeholder={`Player ${pi + 1}`}
              onChange={(e) => setNames((prev) => { const n = [...prev]; n[pi] = e.target.value.trim() || `Player ${pi + 1}`; return n; })}
              style={{ fontSize: 16, fontWeight: 500, color: t.text, textAlign: "center", background: "transparent", border: "none", borderBottom: `2px solid ${t.border2}`, padding: "2px 4px 4px", width: "100%", maxWidth: 200, fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {AVATARS.map((av) => (
                <span key={av} onClick={() => selectAvatar(pi, av)} style={{
                  width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, borderRadius: 10, cursor: "pointer",
                  border: avatars[pi] === av ? `2px solid ${t.accent}` : "2px solid transparent",
                  background: avatars[pi] === av ? t.surface : t.surface2,
                }}>{av}</span>
              ))}
            </div>
            <p style={{ color: t.text2, fontSize: 13 }}>Health bar colour</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {COLORS.map((c) => (
                <div key={c.n} title={c.n} onClick={() => setColors((prev) => { const n = [...prev]; n[pi] = c.v; return n; })} style={{
                  width: 26, height: 26, borderRadius: "50%", background: c.v, cursor: "pointer",
                  boxShadow: `inset 0 0 0 1px ${t.border2}`,
                  border: colors[pi] === c.v ? `2.5px solid ${t.text}` : "2.5px solid transparent",
                  transform: colors[pi] === c.v ? "scale(1.18)" : "scale(1)",
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button style={ghostBtn} onClick={() => { playSound("click"); setHowtoReturn("setup"); setScreen("howto"); }}>How to Play</button>
        <button style={primaryBtn} onClick={() => { playSound("click"); startGame(); }}>Start Battle</button>
      </div>
    </div>
  );

  // ── HOW TO PLAY ──
  if (screen === "howto") return (
    <div style={screenWrap}>
      {fx}
      <h1 style={{ fontSize: "1.8rem", fontWeight: 500 }}>📖 How to Play</h1>
      <p style={{ color: t.text2, maxWidth: 900, lineHeight: 1.6, fontSize: 17 }}>
        Players take turns flipping a tile on the board. Every tile hides one of these effects —
        you never know which until you flip it. Knock your opponent&rsquo;s health to 0% (or have
        the most health left when all tiles are flipped) to win!
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1.25rem", width: "100%", maxWidth: 1200 }}>
        {Object.keys(OD).map((k) => (
          <div key={k} style={{ ...glass, borderRadius: 14, padding: "1.6rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 36 }}>{OD[k].e}</span>
            <span style={{ fontSize: 15, color: t.text2, fontWeight: 500 }}>{OD[k].l}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button style={ghostBtn} onClick={() => { playSound("click"); setScreen(howtoReturn); }}>Back</button>
        <button style={primaryBtn} onClick={() => { playSound("click"); startGame(); }}>Start Battle ⚔️</button>
      </div>
    </div>
  );

  // ── GAME ──
  if (screen === "game") {
    const panel = (pi) => (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        ...glass, border: `1.5px solid ${turn === pi ? t.accent : t.border2}66`,
        boxShadow: turn === pi ? `0 0 35px ${t.accent}66, 0 18px 45px rgba(0,0,0,.18)` : glass.boxShadow,
        borderRadius: 16, padding: "1.8rem 1.4rem", minWidth: 150, transition: "border-color .25s,box-shadow .25s",
      }}>
        <div style={{ fontSize: 44 }}>{avatars[pi]}</div>
        <div style={{ fontSize: 17, fontWeight: 500, textAlign: "center" }}>{names[pi]}</div>
        <div id={pi === 0 ? "pillar1" : "pillar2"} style={{ width: 34, flex: "0 0 180px", height: 180, background: t.surface2, borderRadius: 99, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: `${Math.max(0, Math.min(100, hp[pi]))}%`, background: colors[pi], borderRadius: 99, transition: "height .5s cubic-bezier(.4,0,.2,1)" }} />
        </div>
        <div style={{ fontSize: 15, color: t.text2 }}>{Math.round(Math.max(0, hp[pi]))}%</div>
      </div>
    );

    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
        gap: "1.2rem", ...pageBg, color: t.text, padding: "1.5rem", fontFamily: "Inter, system-ui, sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        {fx}
        <div style={{ fontSize: 17, color: t.text2 }}>{names[turn]}&rsquo;s turn — pick a tile</div>

        <div style={{ display: "flex", gap: "3rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 1500 }}>
          {panel(0)}

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(6, clamp(70px, 13vw, 130px))",
            gridAutoRows: "clamp(70px, 13vw, 130px)", gap: 14, justifyContent: "center", flex: "1 1 auto",
            padding: 20, borderRadius: 24, ...glass,
          }}>
            {tiles.map((type, i) => {
              const isFlipped = flipped.has(i);
              const od = OD[type];
              const gradients = {
                1: "linear-gradient(180deg,#ff6b6b,#dc2626)",
                2: "linear-gradient(180deg,#ff9f43,#f97316)",
                3: "linear-gradient(180deg,#a855f7,#7e22ce)",
                4: "linear-gradient(180deg,#4ade80,#16a34a)",
                5: "linear-gradient(180deg,#60a5fa,#2563eb)",
                6: "linear-gradient(180deg,#4b5563,#111827)"
              };
              return (
                <div key={i} onClick={(e) => onTile(i, e)} style={{
                  aspectRatio: "1", borderRadius: 18, cursor: isFlipped || busy ? "default" : "pointer",
                  perspective: 1200, position: "relative", userSelect: "none",
                  transformStyle: "preserve-3d",
                  transition: ".18s",
                }}>
                  {/* Flash overlay for flip effect */}
                  <div style={{
                    content: "",
                    position: "absolute",
                    inset: 0,
                    borderRadius: 18,
                    background: "white",
                    opacity: isFlipped ? 1 : 0,
                    pointerEvents: "none",
                    zIndex: 50,
                    animation: isFlipped ? "tb-flipFlash .35s ease" : "none",
                  }} />
                  
                  {/* Shadow */}
                  <div style={{
                    position: "absolute",
                    left: "10%",
                    right: "10%",
                    bottom: "-8px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,.18)",
                    filter: "blur(10px)",
                    zIndex: -1,
                    transform: isFlipped ? "scale(1.15)" : "scale(1)",
                    opacity: isFlipped ? 0.6 : 1,
                    transition: ".18s",
                  }} />
                  
                  <div style={{
                    width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d",
                    transition: "transform .65s cubic-bezier(.22,1,.36,1), filter .35s ease",
                    transform: isFlipped ? "translateY(-10px) rotateY(180deg) scale(1.04)" : "rotateY(0deg)",
                    animation: isFlipped ? "tb-tileBounce .35s .55s ease-out forwards" : "none",
                  }}>
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: 18, display: "flex",
                      alignItems: "center", justifyContent: "center", backfaceVisibility: "hidden",
                      background: `linear-gradient(180deg, ${t.surface}, ${t.surface2})`,
                      border: `1.5px solid ${t.border}`,
                      fontSize: 24, fontWeight: 500,
                      boxShadow: "0 12px 24px rgba(0,0,0,.15), inset -1px -1px 2px rgba(255,255,255,.6)",
                    }}>{i + 1}</div>
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: 18, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: 8,
                      backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                      background: gradients[type],
                      border: `1.5px solid rgba(255,255,255,.2)`,
                      fontSize: 26,
                      color: "white",
                      boxShadow: "0 12px 28px rgba(0,0,0,.25), inset -1px 1px 2px rgba(255,255,255,.3)",
                    }}>
                      <span style={{ fontSize: "calc(var(--tile-size, 130px)/3.2)" }}>{od.e}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,.95)", lineHeight: 1.2, fontWeight: 700 }}>{od.l}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {panel(1)}
        </div>

        <div key={banner.key} className={banner.show ? "tb-banner-show" : "tb-banner-hide"} style={{
          ...glass, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
          padding: "16px 24px", textAlign: "center", fontSize: 16, fontWeight: 700, minHeight: 40, width: "100%", maxWidth: 1000,
          borderColor: banner.color ? `${banner.color}88` : undefined,
          boxShadow: banner.color ? `0 0 20px ${banner.color}55, 0 12px 35px rgba(0,0,0,.2)` : glass.boxShadow,
        }}>
          {banner.icon && (
            <span style={{
              fontSize: banner.icon === "💀" ? 40 : banner.icon === "🔥🔥🔥" ? 34 : 28,
              color: banner.color, filter: banner.color ? `drop-shadow(0 0 8px ${banner.color})` : undefined,
            }}>{banner.icon}</span>
          )}
          <span>{banner.text}</span>
        </div>
      </div>
    );
  }

  // ── END (premium victory card with confetti + stats) ──
  const winnerColor = end?.winner != null ? colors[end.winner] : t.accent;
  return (
    <div style={screenWrap}>
      {fx}
      <div style={{
        position: "relative", ...glass, borderRadius: 28, padding: "2.5rem 2rem",
        width: "min(92vw, 520px)",
        boxShadow: `0 30px 60px rgba(0,0,0,.25), 0 0 30px ${winnerColor}55`,
        animation: "tb-victoryPop .8s cubic-bezier(.22,1,.36,1)",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ fontSize: "clamp(72px,14vw,110px)", lineHeight: 1, marginBottom: 8, animation: "tb-winnerBounce 1.6s ease-in-out infinite" }}>{end?.emoji}</div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 800, marginBottom: 6 }}>{end?.title}</h1>
        <p style={{ color: t.text2, fontSize: "clamp(14px,2vw,18px)", lineHeight: 1.6, marginBottom: "1.5rem" }}>{end?.msg}</p>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1.8rem", width: "100%" }}>
          {[0, 1].map((pi) => (
            <div key={pi} style={{ flex: 1, background: t.surface2, borderRadius: 16, padding: "1rem" }}>
              <div style={{ fontSize: 13, color: t.text2, marginBottom: 4 }}>{names[pi]}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{Math.round(Math.max(0, end?.hp?.[pi] ?? 0))}%</div>
            </div>
          ))}
        </div>

        <button style={{ ...primaryBtn, width: "100%" }} onClick={() => { playSound("click"); setScreen("setup"); }}>Play Again</button>
      </div>
    </div>
  );
}

