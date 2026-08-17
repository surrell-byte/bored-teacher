import { useState, useCallback, useRef } from "react";

/* ============================================================
   BOARD CONFIG — 5x6 snake path, 30 tiles
   ============================================================ */
const BOARD_COLS = 5;
const BOARD_ROWS = 6;
const BOARD_SIZE = BOARD_COLS * BOARD_ROWS; // 30

const SPECIAL_TILES = {
  4: "bonus",
  8: "trap",
  13: "treasure",
  17: "trap",
  21: "boost",
  26: "bonus",
};

const TILE_ICONS = { bonus: "⭐", trap: "🐌", treasure: "🎁", boost: "🚀" };

const TILE_MESSAGES = {
  bonus: { text: "Bonus tile! +15 points", points: 15, move: 0 },
  trap: { text: "Slowed down! Move back 2", points: 0, move: -2 },
  treasure: { text: "Treasure found! +30 points", points: 30, move: 0 },
  boost: { text: "Boost tile! Move forward 3", points: 0, move: 3 },
};

const EFFECT_POOL = [
  { text: "Move forward 2", move: 2, points: 0, weight: 4 },
  { text: "Move forward 3", move: 3, points: 5, weight: 3 },
  { text: "Move back 2", move: -2, points: 0, weight: 3 },
  { text: "Stay where you are", move: 0, points: 0, weight: 2 },
  { text: "Bonus +25 points", move: 0, points: 25, weight: 2 },
  { text: "Move forward 5", move: 5, points: 20, weight: 1 },
  { text: "Jackpot! +50 points", move: 0, points: 50, weight: 1 },
];

const COLOURS = ["red", "yellow", "green", "blue"];
const COLOUR_EMOJI = { red: "🔴", yellow: "🟡", green: "🟢", blue: "🔵" };

const AVATARS = [
  { emoji: "🐸", label: "Frog" },
  { emoji: "🦊", label: "Fox" },
  { emoji: "🐼", label: "Panda" },
  { emoji: "🐵", label: "Monkey" },
  { emoji: "🦁", label: "Lion" },
  { emoji: "🐯", label: "Tiger" },
  { emoji: "🐧", label: "Penguin" },
  { emoji: "🐰", label: "Rabbit" },
  { emoji: "🐨", label: "Koala" },
  { emoji: "🐻", label: "Bear" },
  { emoji: "🦄", label: "Unicorn" },
  { emoji: "🐘", label: "Elephant" },
];

// snake path: row r, col c (0-indexed) -> position index 0..29
function snakePosition(row, col) {
  if (row % 2 === 0) return row * BOARD_COLS + col;
  return row * BOARD_COLS + (BOARD_COLS - 1 - col);
}

function pickWeightedEffect() {
  const totalWeight = EFFECT_POOL.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const effect of EFFECT_POOL) {
    roll -= effect.weight;
    if (roll <= 0) return effect;
  }
  return EFFECT_POOL[EFFECT_POOL.length - 1];
}

function shuffleEffects() {
  const next = {};
  COLOURS.forEach((c) => (next[c] = pickWeightedEffect()));
  return next;
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function AnimalAdventureRace({ onComplete }) {
  const [phase, setPhase] = useState("mode"); // mode | avatar | game | win
  const [numPlayers, setNumPlayers] = useState(1);
  const [pickingIndex, setPickingIndex] = useState(0);
  const [chosenAvatars, setChosenAvatars] = useState([]);

  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [shuffledEffects, setShuffledEffects] = useState({});
  const [message, setMessage] = useState("Pick one of the four cards.");
  const [effectLabel, setEffectLabel] = useState("Waiting...");
  const [cardsEnabled, setCardsEnabled] = useState(true);
  const [flip, setFlip] = useState(null); // { colour, effect } | null
  const [winner, setWinner] = useState(null);

  // guards async move animations against stale closures
  const playersRef = useRef(players);
  playersRef.current = players;
  const currentRef = useRef(currentPlayerIndex);
  currentRef.current = currentPlayerIndex;

  /* ---------- setup flow ---------- */
  function chooseMode(n) {
    setNumPlayers(n);
    setPickingIndex(0);
    setChosenAvatars([]);
    setPhase("avatar");
  }

  function pickAvatar(emoji) {
    const next = [...chosenAvatars, emoji];
    setChosenAvatars(next);
    if (next.length < numPlayers) {
      setPickingIndex(next.length);
    } else {
      beginGame(next);
    }
  }

  function beginGame(avatars) {
    const initialPlayers = avatars.map((avatar) => ({
      avatar,
      position: 0,
      points: 0,
    }));
    setPlayers(initialPlayers);
    setCurrentPlayerIndex(0);
    setShuffledEffects(shuffleEffects());
    setMessage("Pick one of the four cards.");
    setEffectLabel("Waiting...");
    setCardsEnabled(true);
    setWinner(null);
    setPhase("game");
  }

  function resetGame() {
    setPlayers((prev) => prev.map((p) => ({ ...p, position: 0, points: 0 })));
    setCurrentPlayerIndex(0);
    setShuffledEffects(shuffleEffects());
    setMessage("Pick one of the four cards.");
    setEffectLabel("Waiting...");
    setCardsEnabled(true);
    setWinner(null);
    setPhase("game");
  }

  function updatePlayer(idx, patch) {
    setPlayers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  /* ---------- move animation: one tile at a time ---------- */
  async function animateMove(idx, steps) {
    let direction = steps > 0 ? 1 : -1;
    let remaining = Math.abs(steps);

    while (remaining > 0) {
      let current = playersRef.current[idx].position;
      let nextPos = current + direction;
      if (nextPos > BOARD_SIZE - 1) {
        direction = -1;
        nextPos = current - 1;
      }
      if (nextPos < 0) {
        nextPos = 0;
        direction = 1;
      }
      updatePlayer(idx, { position: nextPos });
      playersRef.current[idx] = { ...playersRef.current[idx], position: nextPos };
      remaining--;
      await sleep(300);
    }
  }

  /* ---------- special tile check ---------- */
  async function checkTile(idx) {
    const tileNumber = playersRef.current[idx].position + 1;
    const specialType = SPECIAL_TILES[tileNumber];
    if (!specialType) return;

    const effect = TILE_MESSAGES[specialType];
    setMessage(effect.text);
    updatePlayer(idx, { points: playersRef.current[idx].points + effect.points });
    playersRef.current[idx] = {
      ...playersRef.current[idx],
      points: playersRef.current[idx].points + effect.points,
    };

    if (effect.move !== 0) {
      await sleep(500);
      await animateMove(idx, effect.move);
    } else {
      await sleep(700);
    }
  }

  /* ---------- turn resolution ---------- */
  async function endTurn(idx) {
    await checkTile(idx);

    const finalPlayer = playersRef.current[idx];
    if (finalPlayer.position >= BOARD_SIZE - 1) {
      setWinner({ index: idx, avatar: finalPlayer.avatar });
      setPhase("win");
      onComplete?.({
        winnerIndex: idx,
        winnerAvatar: finalPlayer.avatar,
        players: playersRef.current,
      });
      return;
    }

    const nextIdx = (idx + 1) % playersRef.current.length;
    setCurrentPlayerIndex(nextIdx);
    setShuffledEffects(shuffleEffects());
    setCardsEnabled(true);
    setMessage(
      numPlayers === 2
        ? `Player ${nextIdx + 1}, choose a coloured card.`
        : "Choose another coloured card."
    );
  }

  /* ---------- card click ---------- */
  const playCard = useCallback(
    async (colour) => {
      if (!cardsEnabled || phase !== "game") return;
      setCardsEnabled(false);
      const idx = currentRef.current;
      const effect = shuffledEffects[colour];

      setFlip({ colour, effect });
      await sleep(1400);
      setFlip(null);

      setMessage(`${colour.toUpperCase()} card revealed!`);

      const newPoints = playersRef.current[idx].points + effect.points;
      updatePlayer(idx, { points: newPoints });
      playersRef.current[idx] = { ...playersRef.current[idx], points: newPoints };

      if (effect.move === 0) {
        await sleep(800);
        await endTurn(idx);
      } else {
        await animateMove(idx, effect.move);
        await endTurn(idx);
      }
    },
    [cardsEnabled, phase, shuffledEffects, numPlayers]
  );

  /* ============================================================
     RENDER
     ============================================================ */
  if (phase === "mode") {
    return (
      <Screen>
        <h2>Who's Playing?</h2>
        <p className="sub">Choose how many animals are racing today.</p>
        <div className="btnRow">
          <button className="bigBtn primary" onClick={() => chooseMode(1)}>
            🙋 1 Player
          </button>
          <button className="bigBtn secondary" onClick={() => chooseMode(2)}>
            🙋‍♀️🙋‍♂️ 2 Players
          </button>
        </div>
        <Styles />
      </Screen>
    );
  }

  if (phase === "avatar") {
    return (
      <Screen>
        <h2>Choose Your Animal</h2>
        <div className="pickingFor">
          Player {pickingIndex + 1}, pick your animal
        </div>
        <div className="avatars">
          {AVATARS.map((a) => (
            <button
              key={a.emoji}
              className="avatar"
              disabled={chosenAvatars.includes(a.emoji)}
              onClick={() => pickAvatar(a.emoji)}
            >
              <span>{a.emoji}</span>
              <span className="label">{a.label}</span>
            </button>
          ))}
        </div>
        <Styles />
      </Screen>
    );
  }

  if (phase === "win" && winner) {
    return (
      <div className="winScreen">
        <div className="winBox">
          <div className="trophy">🏆</div>
          <h1>
            {numPlayers === 2 ? `Player ${winner.index + 1} Wins!` : "You Win!"}
          </h1>
          <div className="winner">{winner.avatar}</div>
          <div className="stars">⭐⭐⭐⭐⭐</div>
          <p>Congratulations!</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
        <Styles />
      </div>
    );
  }

  // phase === "game"
  const current = players[currentPlayerIndex];
  return (
    <div className="gameArea">
      <div className="boardWrap">
        <div className="progressWrap">
          {players.map((p, i) => (
            <div className="progressBar" key={i}>
              <div
                className={`progressFill p${i + 1}`}
                style={{ width: `${(p.position / (BOARD_SIZE - 1)) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <Board players={players} />
      </div>

      <aside className="sidebar">
        <div className="scorebar">
          {players.map((p, i) => (
            <div key={i} className={`scoreChip ${currentPlayerIndex === i ? "turn" : ""}`}>
              <div className="tokenMini">{p.avatar}</div>
              <div className="statLine">
                <b>{p.position + 1} / {BOARD_SIZE}</b>
                <span>{p.points} pts</span>
              </div>
            </div>
          ))}
        </div>

        <div className="currentPlayer">
          <div className="bigToken">{current?.avatar}</div>
          <h3>
            {numPlayers === 2 ? `Player ${currentPlayerIndex + 1}'s Turn` : "Your Turn"}
          </h3>
        </div>

        <div className="message">{message}</div>

        <div className="cards">
          {COLOURS.map((colour) => (
            <button
              key={colour}
              className={`card ${colour}`}
              disabled={!cardsEnabled}
              onClick={() => playCard(colour)}
            >
              <span className="cardIcon">{COLOUR_EMOJI[colour]}</span>
              {colour[0].toUpperCase() + colour.slice(1)}
            </button>
          ))}
        </div>

        <div className="effectBox">{effectLabel}</div>

        <button className="restartBtn" onClick={resetGame}>
          Restart Game
        </button>
      </aside>

      {flip && <FlipOverlay colour={flip.colour} effect={flip.effect} />}
      <Styles />
    </div>
  );
}

/* ============================================================
   BOARD SUBCOMPONENT
   ============================================================ */
function Board({ players }) {
  const tiles = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const position = snakePosition(row, col);
      const specialType = SPECIAL_TILES[position + 1];
      const occupants = players.filter((p) => p.position === position);
      tiles[position] = (
        <div
          key={position}
          className={[
            "space",
            position === 0 && "start",
            position === BOARD_SIZE - 1 && "finish",
            specialType,
            occupants.length && "active",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {specialType && <div className="tileIcon">{TILE_ICONS[specialType]}</div>}
          <div className="number">{position + 1}</div>
          <div className="tokenStack">
            {occupants.map((p, i) => (
              <div key={i} className={`token hop ${i === 1 ? "p2" : ""}`}>
                {p.avatar}
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
  return <div className="board">{tiles}</div>;
}

/* ============================================================
   FLIP OVERLAY
   ============================================================ */
function FlipOverlay({ colour, effect }) {
  return (
    <div className="flipOverlay">
      <div className="flipCard">
        <div className={`flipFace flipFront ${colour}`}>{COLOUR_EMOJI[colour]}</div>
        <div className={`flipFace flipBack ${colour}`}>
          <div className="flipLabel">{colour} card</div>
          <div className="flipEffectText">{effect.text}</div>
        </div>
      </div>
    </div>
  );
}

function Screen({ children }) {
  return <section className="screen">{children}</section>;
}

/* ============================================================
   STYLES — scoped inline <style>; swap for your engine's
   design-token / CSS-module system as needed
   ============================================================ */
function Styles() {
  return (
    <style>{`
      .screen{ background:#fff; border-radius:20px; padding:30px; box-shadow:0 10px 25px rgba(0,0,0,.15); max-width:900px; margin:0 auto; }
      .screen h2{ text-align:center; margin-bottom:18px; }
      .sub{ text-align:center; color:#666; margin-bottom:25px; line-height:1.5; }
      .btnRow{ display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-top:18px; }
      .bigBtn{ border:none; border-radius:16px; padding:16px 32px; font-size:18px; font-weight:bold; cursor:pointer; color:#fff; transition:.2s; box-shadow:0 6px 14px rgba(0,0,0,.15); }
      .bigBtn:hover{ transform:translateY(-3px) scale(1.03); }
      .bigBtn.primary{ background:#4d8dff; }
      .bigBtn.secondary{ background:#39c86d; }

      .pickingFor{ text-align:center; font-weight:700; margin-bottom:16px; color:#444; }
      .avatars{ display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:16px; }
      .avatar{ display:flex; flex-direction:column; align-items:center; gap:6px; font-size:44px; padding:16px 8px 12px; border:3px solid #e3ecfb; border-radius:18px; cursor:pointer; background:#f8faff; transition:.2s; }
      .avatar:hover:not(:disabled){ transform:translateY(-4px); border-color:#a9c8ff; }
      .avatar:disabled{ opacity:.35; cursor:not-allowed; }
      .avatar .label{ font-size:.72rem; color:#777; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }

      .gameArea{ display:flex; gap:20px; flex-wrap:wrap; align-items:flex-start; }
      .boardWrap{ flex:2; min-width:320px; }
      .progressWrap{ margin-bottom:12px; }
      .progressBar{ height:10px; border-radius:6px; background:#e6edfb; overflow:hidden; margin-bottom:6px; }
      .progressFill{ height:100%; border-radius:6px; transition:width .3s; }
      .progressFill.p1{ background:#4d8dff; }
      .progressFill.p2{ background:#ff8a4d; }

      .board{ display:grid; grid-template-columns:repeat(${BOARD_COLS},1fr); gap:6px; background:#eaf6ff; padding:10px; border-radius:16px; }
      .space{ position:relative; aspect-ratio:1; background:#fff; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,.08); }
      .space.start{ background:#e4ffe9; }
      .space.finish{ background:#ffe9e4; }
      .space.bonus{ background:#fff8e0; }
      .space.trap{ background:#ffe4e4; }
      .space.treasure{ background:#e4f0ff; }
      .space.boost{ background:#e9e4ff; }
      .space.active{ outline:2px solid #4d8dff; }
      .tileIcon{ position:absolute; top:2px; left:2px; font-size:14px; }
      .number{ position:absolute; bottom:2px; right:4px; font-size:.6rem; color:#999; }
      .tokenStack{ display:flex; gap:2px; }
      .token{ font-size:20px; transition:transform .2s; }
      .token.hop{ animation:hop .3s ease; }
      @keyframes hop{ 0%{transform:translateY(0);} 50%{transform:translateY(-6px);} 100%{transform:translateY(0);} }

      .sidebar{ flex:1; min-width:260px; background:#fff; border-radius:18px; padding:18px; box-shadow:0 8px 20px rgba(0,0,0,.12); }
      .scorebar{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
      .scoreChip{ display:flex; align-items:center; gap:8px; background:#f4f8ff; border-radius:30px; padding:6px 14px 6px 6px; border:2px solid transparent; }
      .scoreChip.turn{ border-color:#4d8dff; background:#e4efff; }
      .tokenMini{ width:34px; height:34px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff, #dfeaff 60%, #b9cdf5); display:flex; align-items:center; justify-content:center; font-size:19px; }
      .statLine{ display:flex; flex-direction:column; line-height:1.15; }
      .statLine b{ font-size:.9rem; }
      .statLine span{ font-size:.7rem; color:#777; }

      .currentPlayer{ text-align:center; margin-bottom:12px; }
      .bigToken{ font-size:60px; }
      .message{ text-align:center; min-height:24px; margin-bottom:14px; font-weight:600; color:#444; }

      .cards{ display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:14px; }
      .card{ border:none; border-radius:14px; padding:16px 8px; font-weight:700; color:#fff; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; transition:.15s; }
      .card:disabled{ opacity:.4; cursor:not-allowed; }
      .card:not(:disabled):hover{ transform:translateY(-2px); }
      .card.red{ background:#ff5656; }
      .card.yellow{ background:#f2b90c; }
      .card.green{ background:#39c86d; }
      .card.blue{ background:#4d8dff; }
      .cardIcon{ font-size:22px; }

      .effectBox{ text-align:center; font-size:.85rem; color:#888; margin-bottom:14px; }
      .restartBtn{ width:100%; border:none; border-radius:12px; padding:12px; background:#eef2f7; color:#444; font-weight:700; cursor:pointer; }

      .winScreen{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:100; }
      .winBox{ background:#fff; border-radius:24px; padding:40px; text-align:center; max-width:340px; }
      .trophy{ font-size:60px; }
      .winner{ font-size:50px; margin:10px 0; }
      .stars{ margin-bottom:10px; }
      .winBox button{ margin-top:16px; border:none; border-radius:14px; padding:14px 28px; background:#4d8dff; color:#fff; font-weight:700; font-size:16px; cursor:pointer; }

      .flipOverlay{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:200; }
      .flipCard{ position:relative; width:180px; height:240px; }
      .flipFace{ position:absolute; inset:0; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:60px; color:#fff; box-shadow:0 10px 30px rgba(0,0,0,.3); animation:flipReveal 1.4s ease forwards; }
      .flipBack{ opacity:0; flex-direction:column; font-size:16px; animation:flipRevealBack 1.4s ease forwards; }
      .flipLabel{ text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:8px; }
      .flipEffectText{ font-size:15px; text-align:center; padding:0 12px; }
      .red{ background:#ff5656; } .yellow{ background:#f2b90c; } .green{ background:#39c86d; } .blue{ background:#4d8dff; }
      @keyframes flipReveal{ 0%,45%{opacity:1;} 55%,100%{opacity:0;} }
      @keyframes flipRevealBack{ 0%,45%{opacity:0;} 55%,100%{opacity:1;} }
    `}</style>
  );
}
