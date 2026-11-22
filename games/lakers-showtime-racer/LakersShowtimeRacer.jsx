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
  width: 100%; height: 100%; min-height: 0;
  background: linear-gradient(145deg, #1a1a2e 0%, #0a0a15 100%);
  display: flex; justify-content: center; align-items: center;
  font-family: 'Segoe UI', 'Poppins', system-ui, sans-serif;
  padding: clamp(6px, 1vw, 14px); color: #fff;
}
.lsr-game {
  display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(250px, 0.8fr);
  grid-template-rows: minmax(0, 1fr) auto min-content;
  max-width: 1400px; width: 100%; height: 100%; min-height: 0; overflow: hidden;
  background: rgba(85, 37, 131, 0.3);
  border-radius: 22px; padding: clamp(8px, 1.2vw, 16px);
  box-shadow: 0 25px 45px rgba(0,0,0,0.5), inset 0 1px 1px rgba(253,185,39,0.3);
  border: 2px solid #FDB927;
}
.lsr-root button { font-family: inherit; }
.lsr-root button:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }

/* Players */
.lsr-players {
  grid-column: 2; grid-row: 1; min-height: 0; overflow: auto;
  background: rgba(0,0,0,0.6); border-radius: 18px; padding: 8px;
  display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 8px;
  border: 1px solid #FDB927;
}
.lsr-card {
  background: linear-gradient(135deg, #2a1e3a, #1a1128);
  border-radius: 14px; padding: 7px; min-width: 0;
  display: grid; justify-items: center; gap: 5px;
  box-shadow: 0 8px 18px rgba(0,0,0,0.5);
  transition: background-color 0.2s, box-shadow 0.2s; border-left: 4px solid #FDB927;
}
.lsr-card.lsr-active {
  background: linear-gradient(135deg, #3e2a5a, #2a1e3e);
  box-shadow: 0 0 0 2px #FDB927, 0 10px 20px black;
}
.lsr-selector {
  display: flex; justify-content: center; gap: 2px; max-width: 100%;
  background: #000000aa; padding: 2px 5px; border-radius: 60px; flex-wrap: wrap;
}
.lsr-avatar-btn {
  background: none; border: none; font-size: 1.2rem; cursor: pointer; transition: 0.1s;
  border-radius: 50%; padding: 2px; color: inherit; line-height: 1.15;
}
.lsr-avatar-btn:hover:not(:disabled) { transform: scale(1.2); background: #FDB92755; }
.lsr-avatar-btn.lsr-selected { background: #FDB927; }
.lsr-avatar-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.lsr-info { width: 100%; min-width: 0; }
.lsr-name-row { display: flex; align-items: center; gap: 8px; }
.lsr-pos { font-size: 0.75rem; }
.lsr-emoji-big { font-size: 1.5rem; filter: drop-shadow(2px 4px 6px black); }
.lsr-frozen {
  background: #7bc5ff; color: #013; font-size: 0.7rem; border-radius: 30px;
  padding: 2px 8px; font-weight: bold; margin-left: 8px;
}

/* Controls */
.lsr-dice-area {
  grid-column: 2; grid-row: 2; align-self: center;
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px; padding: 10px 2px;
}
.lsr-dice {
  background: radial-gradient(circle at 30% 20%, #FDB927, #d48f1b);
  justify-self: center; width: 64px; height: 64px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.4rem; font-weight: bold; cursor: pointer;
  box-shadow: 0 7px 0 #8b5a00; transition: 0.08s linear; border: none; color: #2d1b00;
}
.lsr-dice.lsr-rolled { font-size: 1.9rem; }
.lsr-dice:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 4px 0 #8b5a00; }
.lsr-dice.lsr-dim { opacity: 0.5; }
.lsr-dice:disabled { pointer-events: none; }
.lsr-btn {
  min-height: 38px; background: #2a3b44; border: none; padding: 6px 8px; border-radius: 3rem;
  font-weight: bold; color: #FDB927; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 8px black;
}
.lsr-btn:hover:not(:disabled) { filter: brightness(1.15); }
.lsr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.lsr-btn.lsr-add { background: #3c6e47; }
.lsr-btn.lsr-remove { background: #964b3a; }
.lsr-turn {
  grid-column: 1 / -1; background: #000000aa; padding: 8px 10px;
  border-radius: 60px; font-weight: bold; font-size: 0.95rem; color: #FDB927; text-align: center;
}
.lsr-dice-area > :first-child { grid-column: 1; grid-row: 1; }
.lsr-dice-area > :nth-child(2) { grid-column: 2; grid-row: 1; }
.lsr-dice-area > :nth-child(3) { grid-column: 1 / -1; grid-row: 2; }
.lsr-dice-area > :nth-child(4) { grid-column: 1; grid-row: 3; }
.lsr-dice-area > :nth-child(5) { grid-column: 2; grid-row: 3; }

/* Snaking board */
.lsr-viewport {
  grid-column: 1; grid-row: 1 / 4; min-height: 0; min-width: 0;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  width: 100%; background: #4d7a23; padding: clamp(5px, 0.8vw, 12px); border-radius: 18px;
  border: 5px solid #2d4a15; box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
}
.lsr-track {
  display: grid; grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: repeat(5, minmax(0, 1fr)); gap: clamp(3px, 0.55vw, 8px);
  padding: 4px; width: min(100%, calc((100dvh - 180px) * 1.4)); aspect-ratio: 7 / 5;
}
.lsr-tile {
  min-width: 0; min-height: 0; width: 100%;
  background: linear-gradient(145deg, #3a3a3a, #222);
  border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; font-weight: bold; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,215,0,0.3);
}
.lsr-tile::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: repeating-linear-gradient(90deg, #d32f2f, #d32f2f 10px, #fff 10px, #fff 20px);
  border-radius: 10px 10px 0 0; opacity: 0.9;
}
.lsr-tile[data-type="start"]    { background: linear-gradient(145deg, #552583, #3a1b5a); border: 2px solid #FDB927; }
.lsr-tile[data-type="finish"]   { background: radial-gradient(circle, #FDB927, #d48f1b); border: 2px solid gold; }
.lsr-tile[data-type="mushroom"] { background: linear-gradient(145deg, #5cb85c, #3e8e41); box-shadow: 0 0 8px #8bc34a; }
.lsr-tile[data-type="ice"]      { background: linear-gradient(145deg, #80deea, #4fc3f7); box-shadow: 0 0 8px #7bc5ff; }
.lsr-tile[data-type="bomb"]     { background: linear-gradient(145deg, #d9534f, #c9302c); box-shadow: 0 0 8px #ff5e4a; }
.lsr-tile-label { font-size: clamp(0.52rem, 0.75vw, 0.8rem); font-weight: 800; color: #fff; text-shadow: 0 1px 2px black; }
.lsr-tile-icon { font-size: clamp(0.72rem, 1.1vw, 1.15rem); filter: drop-shadow(2px 2px 2px black); }
.lsr-on-tile {
  display: flex; gap: 1px; justify-content: center; margin-top: 2px; font-size: 0.85rem;
  background: #00000066; border-radius: 30px; padding: 1px 3px; min-height: 1.3em; min-width: 1.3em;
}
.lsr-token { font-size: 0.9rem; filter: drop-shadow(0 2px 2px black); margin: 0; }

@keyframes lsr-pop { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
@keyframes lsr-shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } 100% { transform: translateX(0); } }
@keyframes lsr-chill { 0% { transform: scale(1); } 50% { transform: scale(0.94); } 100% { transform: scale(1); } }
.lsr-fx-mushroom { animation: lsr-pop 0.3s ease; }
.lsr-fx-bomb { animation: lsr-shake 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
.lsr-fx-ice { animation: lsr-chill 0.25s ease; }

.lsr-log {
  grid-column: 2; grid-row: 3; background: #0a121cee; border-radius: 14px;
  padding: 8px 10px; font-size: 0.8rem; font-weight: 500; text-align: center; transition: color 0.3s;
}

@media (max-width: 780px) {
  .lsr-game {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto auto;
    align-content: center;
    gap: 5px; padding: 6px; border-radius: 14px;
  }
  .lsr-players {
    grid-column: 1; grid-row: 1; max-height: min(25dvh, 170px);
    grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; padding: 5px;
    border-radius: 10px;
  }
  .lsr-card { gap: 3px; padding: 4px; border-left-width: 2px; border-radius: 8px; }
  .lsr-selector { gap: 0; padding: 1px 3px; }
  .lsr-avatar-btn { font-size: 0.95rem; padding: 1px; }
  .lsr-emoji-big { font-size: 1.15rem; }
  .lsr-name-row { gap: 4px; font-size: 0.8rem; }
  .lsr-pos { font-size: 0.68rem; }
  .lsr-frozen { font-size: 0.56rem; padding: 1px 4px; margin-left: auto; }
  .lsr-viewport {
    grid-column: 1; grid-row: 2; align-self: center;
    padding: 4px; border-width: 3px; border-radius: 12px;
  }
  .lsr-track { width: min(100%, calc((100dvh - 330px) * 1.4)); gap: 3px; padding: 2px; }
  .lsr-tile { border-radius: 6px; }
  .lsr-tile-icon { font-size: clamp(0.65rem, 3.2vw, 1rem); }
  .lsr-tile-label { font-size: clamp(0.48rem, 2.2vw, 0.7rem); }
  .lsr-on-tile { font-size: 0.65rem; }
  .lsr-token { font-size: 0.7rem; }
  .lsr-dice-area {
    grid-column: 1; grid-row: 3; grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 5px; padding: 2px 0;
  }
  .lsr-dice-area > :first-child { grid-column: 1 / 3; grid-row: 1; }
  .lsr-dice-area > :nth-child(2) { grid-column: 3 / 5; grid-row: 1; }
  .lsr-dice-area > :nth-child(3) { grid-column: 1 / -1; grid-row: 2; }
  .lsr-dice-area > :nth-child(4) { grid-column: 1 / 3; grid-row: 3; }
  .lsr-dice-area > :nth-child(5) { grid-column: 3 / 5; grid-row: 3; }
  .lsr-dice { width: 44px; height: 44px; border-radius: 12px; font-size: 1.7rem; box-shadow: 0 4px 0 #8b5a00; }
  .lsr-dice.lsr-rolled { font-size: 1.2rem; }
  .lsr-btn { min-height: 32px; padding: 4px 5px; font-size: 0.66rem; }
  .lsr-turn { padding: 5px 7px; font-size: 0.78rem; }
  .lsr-log { grid-column: 1; grid-row: 4; padding: 5px 7px; font-size: 0.7rem; }
}
@media (max-width: 380px) {
  .lsr-game { gap: 3px; padding: 4px; }
  .lsr-players { grid-template-columns: minmax(0, 1fr); max-height: 22dvh; }
  .lsr-card { grid-template-columns: auto minmax(0, 1fr); justify-items: stretch; align-items: center; }
  .lsr-selector { grid-row: 1; grid-column: 1; }
  .lsr-info { grid-row: 1; grid-column: 2; }
  .lsr-viewport { padding: 2px; border-width: 2px; }
  .lsr-track { width: min(100%, calc((100dvh - 300px) * 1.4)); gap: 2px; }
}
@media (prefers-reduced-motion: reduce) {
  .lsr-root *, .lsr-root *::before { animation: none !important; transition: none !important; }
}
`;