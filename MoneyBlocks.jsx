import React, { useEffect, useMemo, useState } from "react";
import "./MoneyBlocks.css";

const GOAL = 1_000_000;

const AVATARS = [
  "🦁", "🐯", "🐺", "🦊", "🐻",
  "🐼", "🦅", "🦋", "🐲", "🦄",
  "👑", "💀", "🎩", "🤖", "👾",
  "🎭", "🌟", "⚡", "🔥", "💎"
];

const themes = [
  { key: "black", name: "Black", swatch: "#111215", border: "#555" },
  { key: "white", name: "White", swatch: "#F0EDE6", border: "#bbb" },
  { key: "red", name: "Red", swatch: "#EF4444", border: "#FF7A7A" },
  { key: "blue", name: "Blue", swatch: "#3B82F6", border: "#7AAEFF" },
  { key: "green", name: "Green", swatch: "#22C55E", border: "#4ADE80" },
  { key: "yellow", name: "Yellow", swatch: "#FACC15", border: "#FDE047" }
];

const symbols = {
  green: "💵",
  red: "💸",
  blue: "🥷",
  yellow: "💎",
  purple: "🛡️",
  black: "🎲"
};

const blockLayout = [
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

const colorMap = {
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

const random = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const moneyText = (n) =>
  "$" + Math.max(0, Math.round(n)).toLocaleString();

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);

  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;

  return `rgb(
    ${Math.max(0, Math.min(255, Math.round(r * (1 + amount))))},
    ${Math.max(0, Math.min(255, Math.round(g * (1 + amount))))},
    ${Math.max(0, Math.min(255, Math.round(b * (1 + amount))))}
  )`;
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);

  return (
    0.299 * ((n >> 16) & 255) +
    0.587 * ((n >> 8) & 255) +
    0.114 * (n & 255)
  ) / 255;
}

export default function MoneyBlocks() {
  const [screen, setScreen] = useState("welcome");

  const [theme, setTheme] = useState("black");

  const [p1Name, setP1Name] = useState("");
  const [p2Name, setP2Name] = useState("");

  const [p1Avatar, setP1Avatar] = useState(AVATARS[0]);
  const [p2Avatar, setP2Avatar] = useState(AVATARS[1]);

  const [players, setPlayers] = useState({
    1: {
      money: 100000,
      shields: 0
    },
    2: {
      money: 100000,
      shields: 0
    }
  });

  const [currentPlayer, setCurrentPlayer] = useState(1);

  const [tiles, setTiles] = useState(
    blockLayout.map((tile, index) => ({
      ...tile,
      id: index,
      letter: String.fromCharCode(65 + index),
      used: false
    }))
  );

  const [message, setMessage] = useState(
    "The table is set.\nPlayer One opens play."
  );

  const [headline, setHeadline] = useState("Table Set");
  const [headlineAmount, setHeadlineAmount] = useState(null);

  const [reveal, setReveal] = useState(null);
  const [winner, setWinner] = useState(null);

  const [showHowTo, setShowHowTo] = useState(false);

  const playerName =
    currentPlayer === 1
      ? p1Name || "Player One"
      : p2Name || "Player Two";

  const opponentId = currentPlayer === 1 ? 2 : 1;

  const names = {
    1: p1Name || "Player One",
    2: p2Name || "Player Two"
  };

  const avatars = {
    1: p1Avatar,
    2: p2Avatar
  };

  const availableTiles = useMemo(
    () => tiles.filter((tile) => !tile.used),
    [tiles]
  );

  useEffect(() => {
    document.body.dataset.theme = theme;

    return () => {
      delete document.body.dataset.theme;
    };
  }, [theme]);

  function startGame() {
    setScreen("setup");
  }

  function openTable() {
    setScreen("game");
    setMessage(
      `The table is set.\n${p1Name.trim() || "Player One"} opens play.`
    );
  }

  function resetGame() {
    setPlayers({
      1: { money: 100000, shields: 0 },
      2: { money: 100000, shields: 0 }
    });

    setCurrentPlayer(1);

    setTiles(
      blockLayout.map((tile, index) => ({
        ...tile,
        id: index,
        letter: String.fromCharCode(65 + index),
        used: false
      }))
    );

    setMessage(
      `The table is set.\n${p1Name.trim() || "Player One"} opens play.`
    );

    setHeadline("Table Set");
    setHeadlineAmount(null);
    setWinner(null);
    setReveal(null);
    setScreen("game");
  }

  function chooseTile(tile) {
    if (tile.used || reveal || winner) return;

    const multiplier = random([1, 1, 1, 1, 2, 2, 3]);

    let amount = 0;
    let yellowReward = null;
    let blackEvent = null;

    if (tile.type === "green") {
      amount =
        random([25000, 50000, 75000, 100000, 150000]) *
        multiplier;
    }

    if (tile.type === "red") {
      amount =
        random([25000, 50000, 75000, 100000]) *
        multiplier;
    }

    if (tile.type === "blue") {
      amount =
        random([25000, 50000, 75000, 100000]) *
        multiplier;
    }

    if (tile.type === "yellow") {
      yellowReward = random(["double", 250000, 500000]);
    }

    if (tile.type === "black") {
      blackEvent = random([
        "swap",
        "extra",
        "jackpot",
        "tax",
        "robbery",
        "inheritance",
        "bankrupt"
      ]);
    }

    let previewText = "";

    switch (tile.type) {
      case "green":
        previewText = `+${moneyText(amount)}${
          multiplier > 1 ? ` ×${multiplier}` : ""
        }`;
        break;

      case "red":
        previewText = `-${moneyText(amount)}${
          multiplier > 1 ? ` ×${multiplier}` : ""
        }`;
        break;

      case "blue":
        previewText =
          players[opponentId].shields > 0
            ? "Raid blocked!"
            : `+${moneyText(amount)}${
                multiplier > 1 ? ` ×${multiplier}` : ""
              } stolen`;
        break;

      case "yellow":
        previewText =
          yellowReward === "double"
            ? "Holdings doubled!"
            : `+${moneyText(yellowReward)}`;
        break;

      case "purple":
        previewText = "Guard raised 🛡️";
        break;

      case "black":
        previewText = {
          swap: "Fortunes swapped!",
          extra: "Encore — go again!",
          jackpot: "+$300,000 Jackpot!",
          tax: "-$200,000 Audit",
          robbery: "-$150,000 Robbed",
          inheritance: "+$500,000 Inheritance",
          bankrupt: "Bankrupt — halved!"
        }[blackEvent];
        break;

      default:
        break;
    }

    setReveal({
      tile,
      multiplier,
      amount,
      yellowReward,
      blackEvent,
      previewText
    });

    setTiles((prev) =>
      prev.map((item) =>
        item.id === tile.id
          ? { ...item, used: true }
          : item
      )
    );

    setTimeout(() => {
      resolveTurn({
        tile,
        multiplier,
        amount,
        yellowReward,
        blackEvent
      });

      setReveal(null);
    }, 2700);
  }

  function resolveTurn({
    tile,
    multiplier,
    amount,
    yellowReward,
    blackEvent
  }) {
    const player = players[currentPlayer];
    const enemy = players[opponentId];

    const before = player.money;
    let again = false;
    let resultMessage = "";

    const nextPlayers = {
      1: { ...players[1] },
      2: { ...players[2] }
    };

    const me = nextPlayers[currentPlayer];
    const other = nextPlayers[opponentId];

    switch (tile.type) {
      case "green":
        me.money += amount;
        resultMessage = `${playerName} books a gain of ${moneyText(
          amount
        )}${multiplier > 1 ? ` (×${multiplier})` : ""}.`;
        break;

      case "red":
        me.money = Math.max(0, me.money - amount);
        resultMessage = `${playerName} takes a loss of ${moneyText(
          amount
        )}${multiplier > 1 ? ` (×${multiplier})` : ""}.`;
        break;

      case "blue":
        if (other.shields > 0) {
          other.shields -= 1;
          resultMessage = `${playerName} attempts a raid — blocked by the guard.`;
        } else {
          const stolen = Math.min(amount, other.money);

          other.money -= stolen;
          me.money += stolen;

          resultMessage = `${playerName} raids the vault for ${moneyText(
            stolen
          )}${multiplier > 1 ? ` (×${multiplier})` : ""}.`;
        }
        break;

      case "yellow":
        if (yellowReward === "double") {
          me.money *= 2;
          resultMessage = `${playerName} doubles their holdings.`;
        } else {
          me.money += yellowReward;
          resultMessage = `${playerName} draws a wild gain of ${moneyText(
            yellowReward
          )}.`;
        }
        break;

      case "purple":
        me.shields += 1;
        resultMessage = `${playerName} is granted a guard.${
          me.shields > 1
            ? ` (Now holding ${me.shields} shields)`
            : ""
        }`;
        break;

      case "black":
        if (blackEvent === "swap") {
          const temp = me.money;
          me.money = other.money;
          other.money = temp;

          resultMessage = `${playerName} swaps fortunes with the table.`;
        }

        if (blackEvent === "extra") {
          resultMessage = `${playerName} is granted an encore move.`;
          again = true;
        }

        if (blackEvent === "jackpot") {
          me.money += 300000;
          resultMessage = `${playerName} hits the jackpot — $300,000.`;
        }

        if (blackEvent === "tax") {
          me.money = Math.max(0, me.money - 200000);
          resultMessage = `${playerName} is audited for $200,000.`;
        }

        if (blackEvent === "robbery") {
          me.money = Math.max(0, me.money - 150000);
          resultMessage = `${playerName} is robbed of $150,000.`;
        }

        if (blackEvent === "inheritance") {
          me.money += 500000;
          resultMessage = `${playerName} receives an inheritance of $500,000.`;
        }

        if (blackEvent === "bankrupt") {
          me.money = Math.floor(me.money * 0.5);
          resultMessage = `${playerName} is declared bankrupt — holdings halved.`;
        }

        break;

      default:
        break;
    }

    setPlayers(nextPlayers);

    const netChange = me.money - before;

    setHeadline(
      netChange > 0
        ? "GAIN SECURED"
        : netChange < 0
        ? "LOSS TAKEN"
        : tile.type === "purple"
        ? "GUARD RAISED"
        : "NO CHANGE"
    );

    setHeadlineAmount(netChange === 0 ? null : netChange);

    if (me.money >= GOAL) {
      finishGame(
        "Table Closed",
        "Victory",
        `${playerName} holds the table`,
        me.money
      );
      return;
    }

    if (other.money >= GOAL) {
      finishGame(
        "Table Closed",
        "Victory",
        `${names[opponentId]} holds the table`,
        other.money
      );
      return;
    }

    if (again) {
      setMessage(
        `${resultMessage}\n${playerName} moves again.`
      );
    } else {
      const nextPlayer = currentPlayer === 1 ? 2 : 1;

      setCurrentPlayer(nextPlayer);

      setMessage(
        `${resultMessage}\n${names[nextPlayer]} to move.`
      );
    }

    if (availableTiles.length <= 1) {
      const p1 = nextPlayers[1].money;
      const p2 = nextPlayers[2].money;

      if (p1 > p2) {
        finishGame(
          "Board Empty",
          "Victory",
          `${names[1]} holds the table`,
          p1
        );
      } else if (p2 > p1) {
        finishGame(
          "Board Empty",
          "Victory",
          `${names[2]} holds the table`,
          p2
        );
      } else {
        finishGame(
          "Board Empty",
          "Stalemate",
          "The table closes even — no winner",
          null
        );
      }
    }
  }

  function finishGame(eyebrow, title, nameLine, money) {
    setWinner({
      eyebrow,
      title,
      nameLine,
      money
    });
  }

  function renderTile(tile) {
    const hex = colorMap[tile.letter];

    const style =
      hex === "rainbow"
        ? {}
        : {
            background: `linear-gradient(150deg, ${hex}, ${shade(
              hex,
              -0.38
            )})`,
            color:
              luminance(hex) > 0.58
                ? "#14161E"
                : "#F3EFE6",
            "--glow-color": `${hex}88`
          };

    return (
      <button
        key={tile.id}
        className={`block ${
          hex === "rainbow" ? "rainbow-tile" : ""
        } ${tile.used ? "used" : ""}`}
        style={{
          gridColumn: tile.c,
          gridRow: tile.r,
          ...style
        }}
        onClick={() => chooseTile(tile)}
        disabled={tile.used || !!reveal || !!winner}
      >
        <span className="tile-letter">
          {tile.used ? symbols[tile.type] : tile.letter}
        </span>
      </button>
    );
  }

  if (winner) {
    return (
      <div className="winner-overlay">
        <div className="winner-eyebrow">
          {winner.eyebrow}
        </div>

        <div className="winner-title">
          {winner.title}
        </div>

        <div className="winner-rule" />

        <div className="winner-name">
          {winner.nameLine}
        </div>

        {winner.money !== null && (
          <div className="winner-amount">
            {moneyText(winner.money)}
          </div>
        )}

        <button
          className="play-again"
          onClick={resetGame}
        >
          Reset Table
        </button>

        <div className="winner-confetti">
          {Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.2}s`,
                animationDuration: `${
                  2.5 + Math.random() * 2
                }s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="money-blocks">
      {screen === "welcome" && (
        <div className="screen-overlay">
          <div className="welcome-box">
            <div className="welcome-eyebrow">
              Private Table
            </div>

            <div className="welcome-title">
              Money
              <br />
              Blocks
            </div>

            <div className="welcome-rule" />

            <p className="welcome-sub">
              Two players. Hidden tiles. Every flip
              changes the table. First to a million
              takes it all.
            </p>

            <button
              className="welcome-btn"
              onClick={startGame}
            >
              Take a Seat
            </button>
          </div>
        </div>
      )}

      {screen === "setup" && (
        <div className="screen-overlay">
          <div className="setup-box">
            <div className="setup-header">
              <div className="setup-eyebrow">
                Before We Begin
              </div>

              <h2 className="setup-title">
                Set Your Players
              </h2>
            </div>

            <div className="setup-players">
              {[1, 2].map((player) => {
                const isOne = player === 1;
                const name = isOne ? p1Name : p2Name;
                const setName = isOne
                  ? setP1Name
                  : setP2Name;
                const selected = isOne
                  ? p1Avatar
                  : p2Avatar;
                const setAvatar = isOne
                  ? setP1Avatar
                  : setP2Avatar;

                return (
                  <div
                    className="setup-player"
                    key={player}
                  >
                    <div className="setup-player-label">
                      Player {isOne ? "One" : "Two"}
                    </div>

                    <input
                      className="setup-name-input"
                      value={name}
                      maxLength={18}
                      placeholder="Enter name…"
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                    />

                    <div>
                      <div className="setup-avatar-label">
                        Choose Avatar
                      </div>

                      <div className="avatar-grid">
                        {AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            className={`avatar-btn ${
                              selected === emoji
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setAvatar(emoji)
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

            <button
              className="setup-start"
              onClick={openTable}
            >
              Open the Table →
            </button>
          </div>
        </div>
      )}

      {screen === "game" && (
        <div className="game">
          <div className="topbar">
            <div className="brand">
              <div className="eyebrow">
                Private Table
              </div>

              <h1>Money Blocks</h1>
            </div>
          </div>

          <div className="layout">
            <div className="board">
              {tiles.map(renderTile)}
            </div>

            <aside className="side">
              <div className="side-controls">
                <div className="side-buttons">
                  <button
                    className="side-btn"
                    onClick={() =>
                      setShowHowTo(true)
                    }
                  >
                    How to Play
                  </button>

                  <button
                    className="side-btn"
                    onClick={resetGame}
                  >
                    Reset Table
                  </button>
                </div>

                <div className="theme-picker">
                  <span className="theme-picker-label">
                    Theme
                  </span>

                  <div className="theme-swatches">
                    {themes.map((item) => (
                      <button
                        key={item.key}
                        className={`theme-swatch ${
                          theme === item.key
                            ? "active"
                            : ""
                        }`}
                        title={item.name}
                        style={{
                          background: item.swatch,
                          borderColor: item.border
                        }}
                        onClick={() =>
                          setTheme(item.key)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="turn-pill">
                  <span className="dot" />
                  {playerName} to move
                </div>
              </div>

              <div className="side-panels">
                <PlayerCard
                  player={players[1]}
                  name={p1Name || "Player One"}
                  avatar={p1Avatar}
                  active={currentPlayer === 1}
                />

                <div className="ledger">
                  <div className="ledger-rule" />

                  <div className="ledger-eyebrow">
                    {headline}
                  </div>

                  {headlineAmount !== null && (
                    <>
                      <div className="ledger-amount">
                        {headlineAmount > 0
                          ? "+"
                          : "-"}
                        {moneyText(
                          Math.abs(headlineAmount)
                        )}
                      </div>

                      <div className="ledger-name">
                        {playerName}
                      </div>
                    </>
                  )}

                  <div className="ledger-text">
                    {message}
                  </div>
                </div>

                <PlayerCard
                  player={players[2]}
                  name={p2Name || "Player Two"}
                  avatar={p2Avatar}
                  active={currentPlayer === 2}
                />
              </div>
            </aside>
          </div>
        </div>
      )}

      {reveal && (
        <div className="reveal-backdrop show">
          <div className="reveal-overlay">
            <div className="reveal-card flipped">
              <div
                className={`reveal-face front ${
                  colorMap[reveal.tile.letter] ===
                  "rainbow"
                    ? "rainbow-tile"
                    : ""
                }`}
                style={
                  colorMap[reveal.tile.letter] !==
                  "rainbow"
                    ? {
                        background: `linear-gradient(150deg, ${
                          colorMap[reveal.tile.letter]
                        }, ${shade(
                          colorMap[reveal.tile.letter],
                          -0.38
                        )})`
                      }
                    : {}
                }
              >
                <span className="tile-letter">
                  {reveal.tile.letter}
                </span>
              </div>

              <div
                className={`reveal-face back reveal-back-${reveal.tile.type}`}
              >
                <span className="reveal-symbol">
                  {symbols[reveal.tile.type]}
                </span>

                <span className="reveal-result">
                  {reveal.previewText}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHowTo && (
        <HowToPlay
          onClose={() => setShowHowTo(false)}
        />
      )}
    </div>
  );
}

function PlayerCard({
  player,
  name,
  avatar,
  active
}) {
  return (
    <div
      className={`account-card ${
        active ? "active" : ""
      }`}
    >
      <div className="account-top">
        <div className="avatar">{avatar}</div>

        <div>
          <div className="account-name">
            {name}
          </div>

          <div className="account-tag">
            Private Account
          </div>
        </div>

        {player.shields > 0 && (
          <div className="shield-badge show">
            {player.shields > 1
              ? `🛡️ ×${player.shields}`
              : "Guarded"}
          </div>
        )}
      </div>

      <div className="account-balance">
        {moneyText(player.money)}
      </div>

      <div className="progress-wrap">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(
              100,
              (player.money / GOAL) * 100
            )}%`
          }}
        />
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
      text:
        "Bank a cash windfall of $25K–$150K. A hidden multiplier may double or triple the amount."
    },
    {
      type: "red",
      icon: "💸",
      title: "Red — Loss",
      text:
        "Suffer a setback of $25K–$100K, with a chance the multiplier magnifies the hit."
    },
    {
      type: "blue",
      icon: "🥷",
      title: "Blue — Raid",
      text:
        "Steal $25K–$100K directly from your opponent's account. Blocked if they hold a Guard."
    },
    {
      type: "yellow",
      icon: "💎",
      title: "Yellow — Wild",
      text:
        "Draw a wild reward — $250K, $500K, or double your entire holdings instantly."
    },
    {
      type: "purple",
      icon: "🛡️",
      title: "Purple — Guard",
      text:
        "Raise a shield. Your next Raid from the opponent is automatically deflected."
    },
    {
      type: "black",
      icon: "🎲",
      title: "Black — Wild Card",
      text:
        "Spin the wheel: Jackpot, Inheritance, Swap, Encore, Audit, Robbery, or Bankrupt."
    }
  ];

  return (
    <div
      className="htp-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="htp-modal">
        <div className="htp-header">
          <div>
            <div className="htp-eyebrow">
              Private Table
            </div>

            <h2 className="htp-title">
              How to Play
            </h2>
          </div>

          <button
            className="htp-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="htp-rule" />

        <p className="htp-intro">
          Two players take turns picking hidden tiles
          from the board. Each tile conceals a coloured
          block — and every colour triggers a different
          event. First to reach{" "}
          <strong>$1,000,000</strong> wins. If the board
          empties first, the richer player takes the
          table.
        </p>

        <div className="htp-rule htp-rule-sm" />

        <div className="htp-grid">
          {rules.map((rule) => (
            <div className="htp-row" key={rule.type}>
              <span
                className={`htp-icon type-${rule.type}`}
              >
                {rule.icon}
              </span>

              <div>
                <div className="htp-block-name">
                  {rule.title}
                </div>

                <div className="htp-block-desc">
                  {rule.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="htp-rule htp-rule-sm" />

        <div className="htp-tips">
          <div className="htp-tip">
            🔠 Each tile shows a letter A–Z. The letter
            gives no clue about the colour hidden
            beneath.
          </div>

          <div className="htp-tip">
            ⚡ A hidden multiplier (×2 or ×3) lurks
            behind some tiles.
          </div>

          <div className="htp-tip">
            🌈 R is the special Rainbow tile.
          </div>
        </div>

        <button
          className="htp-start"
          onClick={onClose}
        >
          Got It — Let's Play
        </button>
      </div>
    </div>
  );
}
