import { useState, useRef, useEffect, useCallback } from "react";

/* ==================== BOARD DATA ==================== */
const BOARD = [
  "start", 1, 2, 3, 4,
  "mushroom", 6, 7, 8,
  "ice", 10, 11, 12, 13, 14, 15,
  "mushroom", 17, 18, 19, 20, 21,
  "bomb", 23, 24, 25,
  "ice", 27, 28, 29,
  "bomb", 31,
  "finish",
];
const FINISH = BOARD.length - 1; // 32

// Snaking layout, 7 columns: rows alternate direction
const VISUAL_ORDER = [
  0, 1, 2, 3, 4, 5, 6,
  13, 12, 11, 10, 9, 8, 7,
  14, 15, 16, 17, 18, 19, 20,
  27, 26, 25, 24, 23, 22, 21,
  28, 29, 30, 31, 32,
];

const AVATARS = ["🏀", "👟", "🧑‍🚀", "🐱", "🐸", "🐼", "🧙‍♂️"];
const MAX_PLAYERS = 4;
const STEP_MS = 200;
const EFFECT_MS = 450;

const tileType = (i) =>
  i === FINISH ? "finish" : typeof BOARD[i] === "string" ? BOARD[i] : "normal";

const tileDisplay = (i) => {
  const v = BOARD[i];
  if (i === 0) return { label: "START", icon: "🏁" };
  if (i === FINISH) return { label: "🏆", icon: "🎯" };
  if (typeof v === "number") return { label: v, icon: "📍" };
  if (v === "mushroom") return { label: "🍄", icon: "⚡" };
  if (v === "ice") return { label: "❄️", icon: "🧊" };
  if (v === "bomb") return { label: "💣", icon: "💥" };
  return { label: "?", icon: "🔹" };
};

const makePlayer = (id, emoji) => ({ id, emoji, position: 0, frozen: false });

const resetOf = (g) => ({
  ...g,
  players: g.players.map((p) => ({ ...p, position: 0, frozen: false })),
  current: 0,
  status: "ready",
  dice: null,
  fx: null,
  winner: null,
});

const freshGame = () => ({
  players: [makePlayer(0, "🏀"), makePlayer(1, "👟")],
  current: 0,
  status: "ready", // "ready" | "moving" | "over"
  dice: null,
  fx: null,
  winner: null,
});

/* ==================== COMPONENT ==================== */
export default function LakersShowtimeRacer({ onComplete, profileName = "Player 1" }) {
  const starterName = profileName || "Player 1";
  const [game, setGame] = useState(freshGame);
  const [msg, setMsg] = useState({
    text: `✨ ${starterName} is ready to race! Pick your avatar and roll! ✨`,
    error: false,
  });

  const gameRef = useRef(game);
  const runRef = useRef(0);
  const fxKey = useRef(0);
  const nextId = useRef(2);
  const msgTimer = useRef(null);
  const timers = useRef(new Set());

  // Keep a ref in lockstep with state so async turn logic never reads stale data
  const update = useCallback((fn) => {
    gameRef.current = fn(gameRef.current);
    setGame(gameRef.current);
  }, []);

  const patchPlayer = useCallback(
    (idx, patch) =>
      update((g) => ({
        ...g,
        players: g.players.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
      })),
    [update]
  );

  const say = useCallback((text, error = false) => {
    setMsg({ text, error });
    clearTimeout(msgTimer.current);
    if (error) {
      msgTimer.current = setTimeout(
        () => setMsg((m) => (m.text === text ? { ...m, error: false } : m)),
        2500
      );
    }
  }, []);

  const sleep = useCallback(
    (ms) =>
      new Promise((resolve) => {
        const t = setTimeout(() => {
          timers.current.delete(t);
          resolve();
        }, ms);
        timers.current.add(t);
      }),
    []
  );

  const flash = useCallback(
    (idx, type) => {
      const key = ++fxKey.current;
      update((g) => ({ ...g, fx: { idx, type, key } }));
      const t = setTimeout(() => {
        timers.current.delete(t);
        if (gameRef.current.fx?.key === key) update((g) => ({ ...g, fx: null }));
      }, 400);
      timers.current.add(t);
    },
    [update]
  );

  // Cancel everything on unmount
  useEffect(() => {
    const pending = timers.current;
    return () => {
      runRef.current++;
      pending.forEach(clearTimeout);
      pending.clear();
      clearTimeout(msgTimer.current);
    };
  }, []);

  const advanceTurn = useCallback(
    (lead = "") => {
      const next = (gameRef.current.current + 1) % gameRef.current.players.length;
      update((g) => ({ ...g, current: next, status: "ready", dice: null }));
      say(`${lead}${gameRef.current.players[next].emoji}'s turn — Roll the dice!`);
    },
    [update, say]
  );

  const roll = useCallback(async () => {
    const g = gameRef.current;
    if (g.status === "over") return say("Race finished! Press RESTART RACE.", true);
    if (g.status === "moving") return;

    const idx = g.current;
    const player = g.players[idx];

    if (player.frozen) {
      patchPlayer(idx, { frozen: false });
      advanceTurn(`❄️ ${player.emoji} was frozen — turn skipped. `);
      return;
    }

    const run = ++runRef.current;
    const alive = () => runRef.current === run;
    const dice = 1 + Math.floor(Math.random() * 6);

    update((s) => ({ ...s, status: "moving", dice }));
    say(`${player.emoji} rolls ${dice}! Moving ${dice} steps...`);

    // Step-by-step movement
    let pos = player.position;
    const target = Math.min(pos + dice, FINISH);
    while (pos < target) {
      await sleep(STEP_MS);
      if (!alive()) return;
      pos += 1;
      patchPlayer(idx, { position: pos });
    }

    // Tile effect chain (mushroom / bomb can chain; ice ends the chain)
    for (let i = 0; i < 10 && pos < FINISH; i++) {
      const tile = BOARD[pos];
      if (tile === "mushroom") {
        const from = pos;
        pos = Math.min(FINISH, pos + 3);
        say(`🍄 MUSHROOM BOOST! +3 steps → ${player.emoji} jumps to tile ${pos} 🍄`);
        flash(from, "mushroom");
        patchPlayer(idx, { position: pos });
      } else if (tile === "bomb") {
        const from = pos;
        pos = Math.max(0, pos - 1);
        say(`💣 BOMB! ${player.emoji} bounces back to tile ${pos} 💣`);
        flash(from, "bomb");
        patchPlayer(idx, { position: pos });
      } else if (tile === "ice") {
        patchPlayer(idx, { frozen: true });
        say(`❄️ ICE! ${player.emoji} is FROZEN! Next turn skipped ❄️`);
        flash(pos, "ice");
        await sleep(EFFECT_MS);
        if (!alive()) return;
        break;
      } else {
        break;
      }
      await sleep(EFFECT_MS);
      if (!alive()) return;
    }

    if (pos >= FINISH) {
      update((s) => ({ ...s, status: "over", winner: idx }));
      onComplete?.(100, 100);
      say(`🏆✨ ${player.emoji} REACHES THE FINISH! LAKERS WIN! ✨🏆`);
      return;
    }
    advanceTurn();
  }, [update, patchPlayer, say, sleep, flash, advanceTurn]);

  const restart = useCallback(() => {
    runRef.current++;
    update(resetOf);
    say("🏁 Race restarted! First to finish wins! 🏁");
  }, [update, say]);

  const addPlayer = useCallback(() => {
    const g = gameRef.current;
    if (g.status === "moving") return;
    if (g.players.length >= MAX_PLAYERS) return say("Max 4 racers on the court!", true);
    const base = g.status === "over" ? resetOf(g) : g;
    const used = new Set(base.players.map((p) => p.emoji));
    const emoji = AVATARS.find((a) => !used.has(a)) ?? "🐸";
    update(() => ({
      ...base,
      players: [...base.players, makePlayer(nextId.current++, emoji)],
    }));
    say("➕ New racer joins the Lakers!");
  }, [update, say]);

  const removePlayer = useCallback(() => {
    const g = gameRef.current;
    if (g.status === "moving") return;
    if (g.players.length <= 1) return say("Need at least 1 racer!", true);
    const base = g.status === "over" ? resetOf(g) : g;
    const players = base.players.slice(0, -1);
    update(() => ({
      ...base,
      players,
      current: base.current >= players.length ? 0 : base.current,
    }));
    say("➖ A racer leaves the court.");
  }, [update, say]);

  const pickAvatar = useCallback(
    (idx, emoji) => {
      if (gameRef.current.status === "moving") {
        return say("⏳ Race in progress, cannot change avatar!", true);
      }
      patchPlayer(idx, { emoji });
      say(`${emoji} is ready to race!`);
    },
    [patchPlayer, say]
  );

  /* ---------- derived UI ---------- */
  const { players, current, status, dice, fx, winner } = game;
  const moving = status === "moving";
  const over = status === "over";

  let turnText;
  if (over) turnText = `🏆 GAME OVER - ${players[winner]?.emoji ?? ""} WINS 🏆`;
  else if (moving) turnText = "🏀 MOVING...";
  else {
    const c = players[current];
    turnText = `${c.emoji}'s TURN ${c.frozen ? "❄️ (FROZEN - skip)" : "🎲 ROLL DICE"}`;
  }

  return (
    <div className="lsr-root">
      <style>{CSS}</style>
      <div className="lsr-game">
        {/* Players */}
        <div className="lsr-players">
          {players.map((p, i) => (
            <div
              key={p.id}
              className={`lsr-card${!over && current === i ? " lsr-active" : ""}`}
            >
              <div className="lsr-selector" role="group" aria-label={`Racer ${i + 1} avatar`}>
                {AVATARS.map((a) => {
                  const taken = players.some((o, j) => j !== i && o.emoji === a);
                  return (
                    <button
                      key={a}
                      type="button"
                      className={`lsr-avatar-btn${p.emoji === a ? " lsr-selected" : ""}`}
                      disabled={taken}
                      aria-pressed={p.emoji === a}
                      title={taken ? "Taken by another racer" : "Choose avatar"}
                      onClick={() => pickAvatar(i, a)}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              <div className="lsr-info">
                <div className="lsr-name-row">
                  <span className="lsr-emoji-big">{p.emoji}</span>
                  <span>Racer {i + 1}</span>
                  {p.frozen && <span className="lsr-frozen">❄️ FROZEN</span>}
                </div>
                <div className="lsr-pos">
                  🏁 pos {p.position}/{FINISH}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="lsr-dice-area">
          <button type="button" className="lsr-btn" onClick={restart}>
            🔄 RESTART RACE
          </button>
          <button
            type="button"
            className={`lsr-dice${moving || over ? " lsr-dim" : ""}${dice ? " lsr-rolled" : ""}`}
            disabled={moving}
            onClick={roll}
            aria-label="Roll dice"
          >
            {dice ? `🎲 ${dice}` : "🎲"}
          </button>
          <div className="lsr-turn" aria-live="polite">
            {turnText}
          </div>
          <button
            type="button"
            className="lsr-btn lsr-add"
            onClick={addPlayer}
            disabled={moving}
          >
            ➕ ADD RACER
          </button>
          <button
            type="button"
            className="lsr-btn lsr-remove"
            onClick={removePlayer}
            disabled={moving}
          >
            ➖ REMOVE
          </button>
        </div>

        {/* Snaking board */}
        <div className="lsr-viewport">
          <div className="lsr-track">
            {VISUAL_ORDER.map((idx) => {
              const { label, icon } = tileDisplay(idx);
              const here = players.filter((p) => p.position === idx);
              const fxClass = fx && fx.idx === idx ? ` lsr-fx-${fx.type}` : "";
              return (
                <div
                  key={idx}
                  className={`lsr-tile${fxClass}`}
                  data-type={tileType(idx)}
                >
                  <div className="lsr-tile-icon">{icon}</div>
                  <div className="lsr-tile-label">{label}</div>
                  <div className="lsr-on-tile">
                    {here.map((p) => (
                      <span
                        key={p.id}
                        className="lsr-token"
                        style={p.frozen ? { opacity: 0.6 } : undefined}
                      >
                        {p.emoji}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lsr-log" style={{ color: msg.error ? "#ffb7a0" : "#FDB927" }} aria-live="polite">
          {msg.text}
        </div>
      </div>
    </div>
  );
}

/* ==================== STYLES ==================== */
const CSS = `
.lsr-root, .lsr-root * { margin: 0; padding: 0; box-sizing: border-box; user-select: none; }
.lsr-root {
  min-height: 100vh;
  background: linear-gradient(145deg, #1a1a2e 0%, #0a0a15 100%);
  display: flex; justify-content: center; align-items: center;
  font-family: 'Segoe UI', 'Poppins', system-ui, sans-serif;
  padding: 2rem; color: #fff;
}
.lsr-game {
  max-width: 1100px; width: 100%;
  background: rgba(85, 37, 131, 0.3);
  backdrop-filter: blur(4px);
  border-radius: 3rem; padding: 1.5rem;
  box-shadow: 0 25px 45px rgba(0,0,0,0.5), inset 0 1px 1px rgba(253,185,39,0.3);
  border: 2px solid #FDB927;
}
.lsr-root button { font-family: inherit; }
.lsr-root button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }

/* Players */
.lsr-players {
  background: rgba(0,0,0,0.6); border-radius: 2rem; padding: 1.2rem; margin-bottom: 2rem;
  display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; border: 1px solid #FDB927;
}
.lsr-card {
  background: linear-gradient(135deg, #2a1e3a, #1a1128);
  border-radius: 1.8rem; padding: 0.7rem 1.2rem; min-width: 180px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 8px 18px rgba(0,0,0,0.5);
  transition: all 0.2s; border-left: 4px solid #FDB927;
}
.lsr-card.lsr-active {
  background: linear-gradient(135deg, #3e2a5a, #2a1e3e);
  box-shadow: 0 0 0 2px #FDB927, 0 10px 20px black;
  transform: scale(1.02);
}
.lsr-selector {
  display: flex; gap: 5px; background: #000000aa; padding: 4px 8px; border-radius: 60px; flex-wrap: wrap;
}
.lsr-avatar-btn {
  background: none; border: none; font-size: 1.5rem; cursor: pointer; transition: 0.1s;
  border-radius: 50%; padding: 4px; color: inherit;
}
.lsr-avatar-btn:hover:not(:disabled) { transform: scale(1.2); background: #FDB92755; }
.lsr-avatar-btn.lsr-selected { background: #FDB927; }
.lsr-avatar-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.lsr-info { flex: 1; }
.lsr-name-row { display: flex; align-items: center; gap: 8px; }
.lsr-pos { font-size: 0.75rem; }
.lsr-emoji-big { font-size: 2rem; filter: drop-shadow(2px 4px 6px black); }
.lsr-frozen {
  background: #7bc5ff; color: #013; font-size: 0.7rem; border-radius: 30px;
  padding: 2px 8px; font-weight: bold; margin-left: 8px;
}

/* Controls */
.lsr-dice-area {
  display: flex; justify-content: center; gap: 1.5rem; align-items: center;
  margin-bottom: 2rem; flex-wrap: wrap;
}
.lsr-dice {
  background: radial-gradient(circle at 30% 20%, #FDB927, #d48f1b);
  width: 90px; height: 90px; border-radius: 24px;
  display: flex; align-items: center; justify-content: center;
  font-size: 3rem; font-weight: bold; cursor: pointer;
  box-shadow: 0 12px 0 #8b5a00; transition: 0.08s linear; border: none; color: #2d1b00;
}
.lsr-dice.lsr-rolled { font-size: 1.9rem; }
.lsr-dice:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 6px 0 #8b5a00; }
.lsr-dice.lsr-dim { opacity: 0.5; }
.lsr-dice:disabled { pointer-events: none; }
.lsr-btn {
  background: #2a3b44; border: none; padding: 0.7rem 1.5rem; border-radius: 3rem;
  font-weight: bold; color: #FDB927; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 8px black;
}
.lsr-btn:hover:not(:disabled) { filter: brightness(1.15); }
.lsr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.lsr-btn.lsr-add { background: #3c6e47; }
.lsr-btn.lsr-remove { background: #964b3a; }
.lsr-turn {
  background: #000000aa; backdrop-filter: blur(8px); padding: 0.6rem 1.4rem;
  border-radius: 60px; font-weight: bold; font-size: 1.2rem; color: #FDB927;
}

/* Snaking board */
.lsr-viewport {
  width: 100%; background: #4d7a23; padding: 30px; border-radius: 40px;
  border: 12px solid #2d4a15; box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
}
.lsr-track { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; padding: 10px; width: 100%; }
.lsr-tile {
  aspect-ratio: 1 / 1; width: 100%;
  background: linear-gradient(145deg, #3a3a3a, #222);
  border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; font-weight: bold; box-shadow: 0 8px 12px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,215,0,0.3);
}
.lsr-tile::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px;
  background: repeating-linear-gradient(90deg, #d32f2f, #d32f2f 10px, #fff 10px, #fff 20px);
  border-radius: 10px 10px 0 0; opacity: 0.9;
}
.lsr-tile[data-type="start"]    { background: linear-gradient(145deg, #552583, #3a1b5a); border: 2px solid #FDB927; }
.lsr-tile[data-type="finish"]   { background: radial-gradient(circle, #FDB927, #d48f1b); border: 2px solid gold; }
.lsr-tile[data-type="mushroom"] { background: linear-gradient(145deg, #5cb85c, #3e8e41); box-shadow: 0 0 8px #8bc34a; }
.lsr-tile[data-type="ice"]      { background: linear-gradient(145deg, #80deea, #4fc3f7); box-shadow: 0 0 8px #7bc5ff; }
.lsr-tile[data-type="bomb"]     { background: linear-gradient(145deg, #d9534f, #c9302c); box-shadow: 0 0 8px #ff5e4a; }
.lsr-tile-label { font-size: 0.9rem; font-weight: 800; color: #fff; text-shadow: 0 1px 2px black; }
.lsr-tile-icon { font-size: 1.4rem; filter: drop-shadow(2px 2px 2px black); }
.lsr-on-tile {
  display: flex; gap: 4px; justify-content: center; margin-top: 4px; font-size: 1.1rem;
  background: #00000066; border-radius: 30px; padding: 2px 6px; min-height: 1.6em; min-width: 1.6em;
}
.lsr-token { font-size: 1.2rem; filter: drop-shadow(0 2px 2px black); margin: 0 2px; }

@keyframes lsr-pop { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
@keyframes lsr-shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } 100% { transform: translateX(0); } }
@keyframes lsr-chill { 0% { transform: scale(1); } 50% { transform: scale(0.94); } 100% { transform: scale(1); } }
.lsr-fx-mushroom { animation: lsr-pop 0.3s ease; }
.lsr-fx-bomb { animation: lsr-shake 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
.lsr-fx-ice { animation: lsr-chill 0.25s ease; }

.lsr-log {
  background: #0a121cee; border-radius: 2rem; padding: 0.8rem 1.5rem; margin-top: 1rem;
  font-size: 0.9rem; font-weight: 500; text-align: center; transition: color 0.3s;
}

@media (max-width: 780px) {
  .lsr-root { padding: 1rem; }
  .lsr-viewport { padding: 15px; }
  .lsr-track { gap: 6px; padding: 4px; }
  .lsr-tile-icon { font-size: 1rem; }
  .lsr-tile-label { font-size: 0.7rem; }
  .lsr-on-tile { font-size: 0.9rem; }
  .lsr-token { font-size: 0.9rem; margin: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .lsr-root *, .lsr-root *::before { animation: none !important; transition: none !important; }
}
`;