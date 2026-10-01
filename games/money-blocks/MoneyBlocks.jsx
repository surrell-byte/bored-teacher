import { useEffect, useRef, useState } from "react";
import "./MoneyBlocks.css";

const GOAL = 1_000_000;
const AVATARS = [
  "🦁", "🐯", "🐺", "🦊", "🐻",
  "🐼", "🦅", "🦋", "🐲", "🦄",
  "👑", "💀", "🎩", "🤖", "👾",
  "🎭", "🌟", "⚡", "🔥", "💎"
];

const BOARD_LAYOUT = [
  { type: "green", c: "1/4", r: "1/3" },
  { type: "red", c: "4/6", r: "1/3" },
  { type: "blue", c: "6/9", r: "1/3" },
  { type: "yellow", c: "9/13", r: "1/3" },
  { type: "purple", c: "1/3", r: "3/5" },
  { type: "black", c: "3/7", r: "3/5" },
  { type: "green", c: "7/9", r: "3/5" },
  { type: "red", c: "9/13", r: "3/5" },
  { type: "blue", c: "1/4", r: "5/7" },
  { type: "yellow", c: "4/5", r: "5/7" },
  { type: "purple", c: "5/8", r: "5/7" },
  { type: "black", c: "8/11", r: "5/7" },
  { type: "green", c: "11/13", r: "5/7" },
  { type: "red", c: "1/5", r: "7/9" },
  { type: "blue", c: "5/7", r: "7/9" },
  { type: "yellow", c: "7/10", r: "7/9" },
  { type: "purple", c: "10/13", r: "7/9" },
  { type: "black", c: "1/4", r: "9/11" },
  { type: "green", c: "4/7", r: "9/11" },
  { type: "red", c: "7/8", r: "9/11" },
  { type: "blue", c: "8/10", r: "9/11" },
  { type: "yellow", c: "10/13", r: "9/11" },
  { type: "purple", c: "1/4", r: "11/13" },
  { type: "black", c: "4/7", r: "11/13" },
  { type: "green", c: "7/11", r: "11/13" },
  { type: "red", c: "11/13", r: "11/13" }
];

const TYPE_SYMBOLS = {
  green: "💵",
  red: "💸",
  blue: "🥷",
  yellow: "💎",
  purple: "🛡️",
  black: "🎲"
};

const LETTER_COLORS = {
  A: "#000000",
  B: "#FFFFFF",
  C: "#FF0000",
  D: "#FFFF00",
  E: "#0000FF",
  F: "#008000",
  G: "#FFA500",
  H: "#800080",
  I: "#964B00",
  J: "#FFC0CB",
  K: "#00FFFF",
  L: "#808080",
  M: "#00FF00",
  N: "#000080",
  O: "#008080",
  P: "#FF00FF",
  Q: "#800000",
  R: "rainbow",
  S: "#808000",
  T: "#FFD700",
  U: "#C0C0C0",
  V: "#4B0082",
  W: "#40E0D0",
  X: "#FF7F50",
  Y: "#E6E6FA",
  Z: "#F5F5DC"
};

const random = (items) => items[Math.floor(Math.random() * items.length)];
const moneyText = (value) => `$${Math.max(0, Math.round(value)).toLocaleString()}`;

function shade(hex, amount) {
  const parsed = Number.parseInt(hex.slice(1), 16);
  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;

  return `rgb(${Math.max(0, Math.min(255, Math.round(red * (1 + amount))))}, ${Math.max(0, Math.min(255, Math.round(green * (1 + amount))))}, ${Math.max(0, Math.min(255, Math.round(blue * (1 + amount))))})`;
}

function luminance(hex) {
  const parsed = Number.parseInt(hex.slice(1), 16);
  return ((0.299 * ((parsed >> 16) & 255)) + (0.587 * ((parsed >> 8) & 255)) + (0.114 * (parsed & 255))) / 255;
}

function getTileColor(tile) {
  const hex = LETTER_COLORS[tile.letter];
  if (hex === "rainbow") {
    return {
      background: "linear-gradient(90deg, #ff0000, #ff9900, #ffee00, #33ff00, #00ffee, #3300ff, #cc00ff, #ff0000)",
      color: "#ffffff",
      glow: "rgba(255, 200, 100, 0.7)"
    };
  }

  return {
    background: `linear-gradient(150deg, ${hex}, ${shade(hex, -0.38)})`,
    color: luminance(hex) > 0.58 ? "#14161E" : "#F3EFE6",
    glow: `${hex}88`
  };
}

function getPreviewText({ tileType, multiplier, amount, yellowReward, blackEvent, opponentShields }) {
  const note = multiplier > 1 ? ` ×${multiplier}` : "";

  switch (tileType) {
    case "green":
      return `+${moneyText(amount)}${note}`;
    case "red":
      return `-${moneyText(amount)}${note}`;
    case "blue":
      return opponentShields > 0 ? "Raid blocked!" : `+${moneyText(amount)}${note} stolen`;
    case "yellow":
      return yellowReward === "double" ? "Holdings doubled!" : `+${moneyText(yellowReward)}`;
    case "purple":
      return "Guard raised 🛡️";
    case "black": {
      if (blackEvent === "swap") return "Fortunes swapped!";
      if (blackEvent === "extra") return "Encore — go again!";
      if (blackEvent === "jackpot") return "+$300,000 Jackpot!";
      if (blackEvent === "tax") return "-$200,000 Audit";
      if (blackEvent === "robbery") return "-$150,000 Robbed";
      if (blackEvent === "inheritance") return "+$500,000 Inheritance";
      if (blackEvent === "bankrupt") return "Bankrupt — halved!";
      return "Wild card";
    }
    default:
      return "";
  }
}

function buildBoard() {
  return BOARD_LAYOUT.map((tile, index) => ({
    ...tile,
    id: index,
    letter: String.fromCharCode(65 + index),
    used: false
  }));
}

function PlayerCard({ player, name, avatar, active }) {
  return (
    <div className={`account-card ${active ? "active" : ""}`}>
      <div className="account-top">
        <div className="avatar">{avatar}</div>
        <div>
          <div className="account-name">{name}</div>
          <div className="account-tag">Private Account</div>
        </div>
        {player.shields > 0 && (
          <div className="shield-badge show">{player.shields > 1 ? `🛡️ ×${player.shields}` : "Guarded"}</div>
        )}
      </div>
      <div className="account-balance">{moneyText(player.money)}</div>
      <div className="progress-wrap">
        <div className="progress-fill" style={{ width: `${Math.min(100, (player.money / GOAL) * 100)}%` }} />
      </div>
      <div className="progress-ticks">
        <span>$0</span>
        <span>$250K</span>
        <span>$500K</span>
        <span>$750K</span>
        <span>$1M</span>
      </div>
    </div>
  );
}

function HowToPlay({ onClose }) {
  const rules = [
    {
      type: "green",
      icon: "💵",
      title: "Green — Gain",
      text: "Bank a cash windfall of $25K–$150K. A hidden multiplier may double or triple the amount."
    },
    {
      type: "red",
      icon: "💸",
      title: "Red — Loss",
      text: "Suffer a setback of $25K–$100K, with a chance the multiplier magnifies the hit."
    },
    {
      type: "blue",
      icon: "🥷",
      title: "Blue — Raid",
      text: "Steal $25K–$100K directly from your opponent's account. Blocked if they hold a Guard."
    },
    {
      type: "yellow",
      icon: "💎",
      title: "Yellow — Wild",
      text: "Draw a wild reward — $250K, $500K, or double your entire holdings instantly."
    },
    {
      type: "purple",
      icon: "🛡️",
      title: "Purple — Guard",
      text: "Raise a shield. Your next Raid from the opponent is automatically deflected."
    },
    {
      type: "black",
      icon: "🎲",
      title: "Black — Wild Card",
      text: "Spin the wheel: Jackpot (+$300K), Inheritance (+$500K), Swap, Encore, Audit, Robbery, or Bankrupt."
    }
  ];

  return (
    <div
      className="htp-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="htp-modal">
        <div className="htp-header">
          <div>
            <div className="htp-eyebrow">Private Table</div>
            <h2 className="htp-title">How to Play</h2>
          </div>
          <button className="htp-close" type="button" onClick={onClose}>✕</button>
        </div>

        <div className="htp-rule" />

        <p className="htp-intro">
          Two players take turns picking hidden tiles from the board. Each tile conceals a coloured block — and every colour triggers a different event. First to reach <strong>$1,000,000</strong> wins. If the board empties first, the richer player takes the table.
        </p>

        <div className="htp-rule htp-rule-sm" />

        <div className="htp-grid">
          {rules.map((rule) => (
            <div className="htp-row" key={rule.type}>
              <span className={`htp-icon type-${rule.type}`}>{rule.icon}</span>
              <div>
                <div className="htp-block-name">{rule.title}</div>
                <div className="htp-block-desc">{rule.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="htp-rule htp-rule-sm" />

        <div className="htp-tips">
          <div className="htp-tip">🔠 Each tile shows a letter A–Z. The letter gives no clue about the colour hidden beneath.</div>
          <div className="htp-tip">⚡ A hidden multiplier (×2 or ×3) lurks behind some tiles.</div>
          <div className="htp-tip">🌈 One tile is Rainbow — a special black wild card with animated colour.</div>
        </div>

        <button className="htp-start" type="button" onClick={onClose}>Got It — Let&apos;s Play</button>
      </div>
    </div>
  );
}

export default function MoneyBlocks({ themeId = "black" }) {
  const [theme, setTheme] = useState(themeId || "black");
  const [screen, setScreen] = useState("welcome");
  const [showHowTo, setShowHowTo] = useState(false);
  const [playerNames, setPlayerNames] = useState({ 1: "", 2: "" });
  const [playerAvatars, setPlayerAvatars] = useState({ 1: AVATARS[0], 2: AVATARS[1] });
  const [players, setPlayers] = useState({
    1: { money: 100000, shields: 0 },
    2: { money: 100000, shields: 0 }
  });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [board, setBoard] = useState(() => buildBoard());
  const [reveal, setReveal] = useState(null);
  const [revealPhase, setRevealPhase] = useState("idle");
  const revealTimers = useRef([]);
  const revealFrame = useRef(0);
  const [message, setMessage] = useState("The table is set.\nPlayer One opens play.");
  const [headline, setHeadline] = useState("Table Set");
  const [headlineAmount, setHeadlineAmount] = useState(null);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (themeId) {
      setTheme(themeId);
    }
  }, [themeId]);

  useEffect(() => () => {
    revealTimers.current.forEach((timer) => window.clearTimeout(timer));
    window.cancelAnimationFrame(revealFrame.current);
  }, []);

  const nameFor = (playerNumber) => playerNames[playerNumber]?.trim() || `Player ${playerNumber}`;
  const avatarFor = (playerNumber) => playerAvatars[playerNumber] || AVATARS[playerNumber - 1] || "🦊";

  function startGame() {
    setScreen("setup");
  }

  function clearRevealSequence() {
    revealTimers.current.forEach((timer) => window.clearTimeout(timer));
    revealTimers.current = [];
    window.cancelAnimationFrame(revealFrame.current);
  }

  function resetBoardState() {
    clearRevealSequence();
    setBoard(buildBoard());
    setPlayers({
      1: { money: 100000, shields: 0 },
      2: { money: 100000, shields: 0 }
    });
    setCurrentPlayer(1);
    setMessage(`The table is set.\n${nameFor(1)} opens play.`);
    setHeadline("Table Set");
    setHeadlineAmount(null);
    setWinner(null);
    setReveal(null);
    setRevealPhase("idle");
    setScreen("game");
  }

  function openTable() {
    clearRevealSequence();
    setPlayers({
      1: { money: 100000, shields: 0 },
      2: { money: 100000, shields: 0 }
    });
    setCurrentPlayer(1);
    setBoard(buildBoard());
    setHeadline("Table Set");
    setHeadlineAmount(null);
    setReveal(null);
    setRevealPhase("idle");
    setWinner(null);
    setMessage(`The table is set.\n${nameFor(1)} opens play.`);
    setScreen("game");
  }

  function finishGame(eyebrow, title, nameLine, money) {
    setWinner({ eyebrow, title, nameLine, money });
  }

  function resolveTurn({ tile, multiplier, amount, yellowReward, blackEvent, remainingBefore }) {
    const opponentId = currentPlayer === 1 ? 2 : 1;
    const nextPlayers = {
      1: { ...players[1] },
      2: { ...players[2] }
    };
    const me = nextPlayers[currentPlayer];
    const other = nextPlayers[opponentId];

    let resultMessage = "";
    let again = false;
    const before = me.money;

    switch (tile.type) {
      case "green": {
        me.money += amount;
        resultMessage = `${nameFor(currentPlayer)} books a gain of ${moneyText(amount)}${multiplier > 1 ? ` (×${multiplier})` : ""}.`;
        break;
      }
      case "red": {
        me.money = Math.max(0, me.money - amount);
        resultMessage = `${nameFor(currentPlayer)} takes a loss of ${moneyText(amount)}${multiplier > 1 ? ` (×${multiplier})` : ""}.`;
        break;
      }
      case "blue": {
        if (other.shields > 0) {
          other.shields -= 1;
          resultMessage = `${nameFor(currentPlayer)} attempts a raid — blocked by the guard.`;
        } else {
          const stolen = Math.min(amount, other.money);
          other.money -= stolen;
          me.money += stolen;
          resultMessage = `${nameFor(currentPlayer)} raids the vault for ${moneyText(stolen)}${multiplier > 1 ? ` (×${multiplier})` : ""}.`;
        }
        break;
      }
      case "yellow": {
        if (yellowReward === "double") {
          me.money *= 2;
          resultMessage = `${nameFor(currentPlayer)} doubles their holdings.`;
        } else {
          me.money += yellowReward;
          resultMessage = `${nameFor(currentPlayer)} draws a wild gain of ${moneyText(yellowReward)}.`;
        }
        break;
      }
      case "purple": {
        me.shields += 1;
        resultMessage = `${nameFor(currentPlayer)} is granted a guard.${me.shields > 1 ? ` (Now holding ${me.shields} shields)` : ""}`;
        break;
      }
      case "black": {
        if (blackEvent === "swap") {
          const temp = me.money;
          me.money = other.money;
          other.money = temp;
          resultMessage = `${nameFor(currentPlayer)} swaps fortunes with the table.`;
        }

        if (blackEvent === "extra") {
          resultMessage = `${nameFor(currentPlayer)} is granted an encore move.`;
          again = true;
        }

        if (blackEvent === "jackpot") {
          me.money += 300000;
          resultMessage = `${nameFor(currentPlayer)} hits the jackpot — ${moneyText(300000)}.`;
        }

        if (blackEvent === "tax") {
          me.money = Math.max(0, me.money - 200000);
          resultMessage = `${nameFor(currentPlayer)} is audited for ${moneyText(200000)}.`;
        }

        if (blackEvent === "robbery") {
          me.money = Math.max(0, me.money - 150000);
          resultMessage = `${nameFor(currentPlayer)} is robbed of ${moneyText(150000)}.`;
        }

        if (blackEvent === "inheritance") {
          me.money += 500000;
          resultMessage = `${nameFor(currentPlayer)} receives an inheritance of ${moneyText(500000)}.`;
        }

        if (blackEvent === "bankrupt") {
          me.money = Math.floor(me.money * 0.5);
          resultMessage = `${nameFor(currentPlayer)} is declared bankrupt — holdings halved.`;
        }
        break;
      }
      default:
        break;
    }

    const delta = me.money - before;
    setHeadline(delta > 0 ? "GAIN SECURED" : delta < 0 ? "LOSS TAKEN" : tile.type === "purple" ? "GUARD RAISED" : "NO CHANGE");
    setHeadlineAmount(delta === 0 ? null : delta);

    setPlayers(nextPlayers);

    if (me.money >= GOAL) {
      finishGame("Table Closed", "Victory", `${nameFor(currentPlayer)} holds the table`, me.money);
      return;
    }

    if (other.money >= GOAL) {
      finishGame("Table Closed", "Victory", `${nameFor(opponentId)} holds the table`, other.money);
      return;
    }

    if (again) {
      setMessage(`${resultMessage}\n${nameFor(currentPlayer)} moves again.`);
      return;
    }

    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    setCurrentPlayer(nextPlayer);
    setMessage(`${resultMessage}\n${nameFor(nextPlayer)} to move.`);

    if (remainingBefore <= 1) {
      if (nextPlayers[1].money > nextPlayers[2].money) {
        finishGame("Board Empty", "Victory", `${nameFor(1)} holds the table`, nextPlayers[1].money);
      } else if (nextPlayers[2].money > nextPlayers[1].money) {
        finishGame("Board Empty", "Victory", `${nameFor(2)} holds the table`, nextPlayers[2].money);
      } else {
        finishGame("Board Empty", "Stalemate", "The table closes even — no winner", null);
      }
    }
  }

  function chooseTile(tile, event) {
    if (tile.used || reveal || winner) {
      return;
    }

    const multiplier = random([1, 1, 1, 1, 2, 2, 3]);
    const opponentId = currentPlayer === 1 ? 2 : 1;
    const opponent = players[opponentId];

    let amount = 0;
    let yellowReward = null;
    let blackEvent = null;

    if (tile.type === "green") {
      amount = random([25000, 50000, 75000, 100000, 150000]) * multiplier;
    }

    if (tile.type === "red") {
      amount = random([25000, 50000, 75000, 100000]) * multiplier;
    }

    if (tile.type === "blue") {
      amount = random([25000, 50000, 75000, 100000]) * multiplier;
    }

    if (tile.type === "yellow") {
      yellowReward = random(["double", 250000, 500000]);
    }

    if (tile.type === "black") {
      blackEvent = random(["swap", "extra", "jackpot", "tax", "robbery", "inheritance", "bankrupt"]);
    }

    const previewText = getPreviewText({
      tileType: tile.type,
      multiplier,
      amount,
      yellowReward,
      blackEvent,
      opponentShields: opponent.shields
    });
    const tileColor = getTileColor(tile);
    const bounds = event.currentTarget.getBoundingClientRect();

    setReveal({
      tile,
      multiplier,
      amount,
      yellowReward,
      blackEvent,
      previewText,
      tileBackground: tileColor.background,
      tileTextColor: tileColor.color,
      origin: { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height }
    });
    setRevealPhase("opening");

    const remainingBefore = board.filter((item) => !item.used).length;
    setBoard((currentBoard) => currentBoard.map((item) => (item.id === tile.id ? { ...item, used: true } : item)));

    revealFrame.current = window.requestAnimationFrame(() => setRevealPhase("centered"));
    revealTimers.current = [window.setTimeout(() => {
      setRevealPhase("closing");
      revealTimers.current = [window.setTimeout(() => {
        resolveTurn({ tile, multiplier, amount, yellowReward, blackEvent, remainingBefore });
        setReveal(null);
        setRevealPhase("idle");
        revealTimers.current = [];
      }, 600)];
    }, 2600)];
  }

  function renderTile(tile) {
    const color = getTileColor(tile);
    const showSymbol = tile.used ? TYPE_SYMBOLS[tile.type] : tile.letter;

    return (
      <button
        key={tile.id}
        type="button"
        className={`block ${tile.used ? "used" : ""} ${tile.used ? "revealed" : ""}`}
        style={{
          gridColumn: tile.c,
          gridRow: tile.r,
          background: color.background,
          color: tile.used ? "#fff" : color.color,
          boxShadow: tile.used ? "none" : `0 0 26px ${color.glow}`
        }}
        onClick={(event) => chooseTile(tile, event)}
        disabled={tile.used || !!reveal || !!winner}
      >
        <span className="tile-letter">{showSymbol}</span>
      </button>
    );
  }

  if (winner) {
    return (
      <div className={`money-blocks theme-${theme}`}>
        <div className="winner-overlay">
          <div className="winner-eyebrow">{winner.eyebrow}</div>
          <div className="winner-title">{winner.title}</div>
          <div className="winner-rule" />
          <div className="winner-name">{winner.nameLine}</div>
          {winner.money !== null && <div className="winner-amount">{moneyText(winner.money)}</div>}
          <button className="play-again" type="button" onClick={resetBoardState}>Reset Table</button>
          <div className="winner-confetti">
            {Array.from({ length: 60 }).map((_, index) => (
              <span
                key={`${winner.eyebrow}-${index}`}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1.2}s`,
                  animationDuration: `${2.5 + Math.random() * 2}s`,
                  background: ["#E8C97A", "#C9A961", "#F3EFE6", "#8C6B33"][index % 4]
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`money-blocks theme-${theme}`}>
      {screen === "welcome" && (
        <div className="screen-overlay">
          <div className="welcome-box">
            <div className="welcome-eyebrow">Private Table</div>
            <div className="welcome-title">
              Money
              <br />
              Blocks
            </div>
            <div className="welcome-rule" />
            <p className="welcome-sub">Two players. Hidden tiles. Every flip changes the table. First to a million takes it all.</p>
            <button className="welcome-btn" type="button" onClick={startGame}>Take a Seat</button>
          </div>
        </div>
      )}

      {screen === "setup" && (
        <div className="screen-overlay">
          <div className="setup-box">
            <div className="setup-header">
              <div className="setup-eyebrow">Before We Begin</div>
              <h2 className="setup-title">Set Your Players</h2>
            </div>

            <div className="setup-players">
              {[1, 2].map((playerNumber) => {
                const selectedAvatar = avatarFor(playerNumber);
                return (
                  <div className="setup-player" key={playerNumber}>
                    <div className="setup-player-label">Player {playerNumber === 1 ? "One" : "Two"}</div>
                    <input
                      className="setup-name-input"
                      value={playerNames[playerNumber]}
                      maxLength={18}
                      placeholder="Enter name…"
                      onChange={(event) =>
                        setPlayerNames((current) => ({
                          ...current,
                          [playerNumber]: event.target.value
                        }))
                      }
                    />

                    <div>
                      <div className="setup-avatar-label">Choose Avatar</div>
                      <div className="avatar-grid">
                        {AVATARS.map((emoji) => (
                          <button
                            key={`${playerNumber}-${emoji}`}
                            type="button"
                            className={`avatar-btn ${selectedAvatar === emoji ? "selected" : ""}`}
                            onClick={() =>
                              setPlayerAvatars((current) => ({
                                ...current,
                                [playerNumber]: emoji
                              }))
                            }
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="setup-start" type="button" onClick={openTable}>Open the Table →</button>
          </div>
        </div>
      )}

      {screen === "game" && (
        <div className="game">
          <div className="topbar">
            <div className="brand">
              <div className="eyebrow">Private Table</div>
              <h1>Money Blocks</h1>
            </div>
          </div>

          <div className="layout">
            <div className="board">{board.map(renderTile)}</div>

            <div className="side">
              <div className="side-controls">
                <div className="side-buttons">
                  <button className="side-btn" type="button" onClick={() => setShowHowTo(true)}>How to Play</button>
                  <button className="side-btn" type="button" onClick={resetBoardState}>Reset Table</button>
                </div>

                <div className="turn-pill">
                  <span className="dot" />
                  {nameFor(currentPlayer)} to move
                </div>
              </div>

              <div className="side-panels">
                <PlayerCard
                  player={players[1]}
                  name={nameFor(1)}
                  avatar={avatarFor(1)}
                  active={currentPlayer === 1}
                />

                <div className="ledger">
                  <div className="ledger-rule" />
                  <div className="ledger-eyebrow">{headline}</div>
                  {headlineAmount !== null && (
                    <>
                      <div className="ledger-amount">{headlineAmount > 0 ? "+" : "-"}{moneyText(Math.abs(headlineAmount))}</div>
                      <div className="ledger-name">{nameFor(currentPlayer)}</div>
                    </>
                  )}
                  <div className="ledger-text">{message}</div>
                </div>

                <PlayerCard
                  player={players[2]}
                  name={nameFor(2)}
                  avatar={avatarFor(2)}
                  active={currentPlayer === 2}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {reveal && (
        <div className="reveal-backdrop show">
          <div
            className={`reveal-overlay ${revealPhase === "centered" ? "centered" : ""}`}
            style={{
              "--origin-left": `${reveal.origin.left}px`,
              "--origin-top": `${reveal.origin.top}px`,
              "--origin-width": `${reveal.origin.width}px`,
              "--origin-height": `${reveal.origin.height}px`
            }}
          >
            <div className={`reveal-card ${revealPhase === "centered" ? "flipped" : ""}`}>
              <div
                className="reveal-face front"
                style={{ background: reveal.tileBackground, color: reveal.tileTextColor }}
              >
                <span className="tile-letter">{reveal.tile.letter}</span>
              </div>

              <div className="reveal-face back" style={{ background: reveal.tileBackground, color: reveal.tileTextColor }}>
                <span className="reveal-symbol">{TYPE_SYMBOLS[reveal.tile.type]}</span>
                <span className="reveal-preview">{reveal.previewText}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
    </div>
  );
}
