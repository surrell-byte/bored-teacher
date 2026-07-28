import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useGame } from "@/lib/gameState";
import styles from "./Connect4.module.css";

const ROWS = 6;
const COLS = 7;

const THEMES = {
  crimson: { light: "#ff5b73", dark: "#b31733" },
  amber:   { light: "#ffd65a", dark: "#c48b08" },
  cobalt:  { light: "#57a9ff", dark: "#215bd8" },
  jade:    { light: "#49f3af", dark: "#13824f" },
  violet:  { light: "#c78fff", dark: "#7026d9" },
};
const THEME_KEYS = Object.keys(THEMES);

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function checkWin(board, player) {
  const check = (r, c, dr, dc) => {
    for (let i = 0; i < 4; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== player) return false;
    }
    return true;
  };
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]])
        if (check(r, c, dr, dc)) return true;
  return false;
}

function getWinCells(board, player) {
  const cells = [];
  const check = (r, c, dr, dc) => {
    const line = [];
    for (let i = 0; i < 4; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== player) return null;
      line.push(`${nr},${nc}`);
    }
    return line;
  };
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const line = check(r, c, dr, dc);
        if (line) line.forEach((k) => cells.push(k));
      }
  return new Set(cells);
}

function dropPiece(board, col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      const nb = board.map((row) => [...row]);
      nb[r][col] = player;
      return { board: nb, row: r };
    }
  }
  return null;
}

function isBoardFull(board) {
  return board.every((row) => row.every((cell) => cell !== 0));
}

function availableColumns(board) {
  const moves = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) moves.push(c);
  }
  return moves;
}

function simulateDrop(board, col, player) {
  const copy = cloneBoard(board);
  for (let r = ROWS - 1; r >= 0; r--) {
    if (copy[r][col] === 0) {
      copy[r][col] = player;
      return { board: copy, row: r };
    }
  }
  return null;
}

function previewRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function evaluateWindow(window, player) {
  const opponent = player === 1 ? 2 : 1;
  let score = 0;
  const playerCount = window.filter((v) => v === player).length;
  const opponentCount = window.filter((v) => v === opponent).length;
  const emptyCount = window.filter((v) => v === 0).length;

  if (playerCount === 4) score += 100;
  else if (playerCount === 3 && emptyCount === 1) score += 5;
  else if (playerCount === 2 && emptyCount === 2) score += 2;

  if (opponentCount === 3 && emptyCount === 1) score -= 4;

  return score;
}

function scorePosition(board, player) {
  let score = 0;

  for (let c = 0; c < COLS; c++) {
    const col = [];
    for (let r = 0; r < ROWS; r++) col.push(board[r][c]);
    const centreCount = col.filter((v) => v === player).length;
    score += centreCount * 3;
  }

  for (let r = 0; r < ROWS; r++) {
    const row = board[r];
    for (let c = 0; c <= COLS - 4; c++) {
      score += evaluateWindow(row.slice(c, c + 4), player);
    }
  }

  for (let c = 0; c <= COLS - 4; c++) {
    for (let r = 0; r < ROWS; r++) {
      const col = [];
      for (let i = 0; i < 4 && r + i < ROWS; i++) col.push(board[r + i][c]);
      if (col.length === 4) score += evaluateWindow(col, player);
    }
  }

  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const diag = [];
      for (let i = 0; i < 4; i++) diag.push(board[r + i][c + i]);
      score += evaluateWindow(diag, player);
    }
  }

  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 3; c < COLS; c++) {
      const diag = [];
      for (let i = 0; i < 4; i++) diag.push(board[r + i][c - i]);
      score += evaluateWindow(diag, player);
    }
  }

  return score;
}

function minimax(board, depth, alpha, beta, maximizing, player) {
  const opponent = player === 1 ? 2 : 1;
  const isTerminal = checkWin(board, player) || checkWin(board, opponent) || isBoardFull(board);

  if (depth === 0 || isTerminal) {
    if (isTerminal) {
      if (checkWin(board, player)) return { score: 100000 };
      if (checkWin(board, opponent)) return { score: -100000 };
      return { score: 0 };
    }
    return { score: scorePosition(board, player) };
  }

  const validCols = availableColumns(board);

  if (maximizing) {
    let maxScore = -Infinity;
    let bestCol = validCols[Math.floor(validCols.length / 2)];

    for (const col of validCols) {
      const result = simulateDrop(board, col, player);
      if (!result) continue;
      const score = minimax(result.board, depth - 1, alpha, beta, false, player).score;
      if (score > maxScore) {
        maxScore = score;
        bestCol = col;
      }
      alpha = Math.max(alpha, score);
      if (alpha >= beta) break;
    }

    return { score: maxScore, col: bestCol };
  } else {
    let minScore = Infinity;
    let bestCol = validCols[Math.floor(validCols.length / 2)];

    for (const col of validCols) {
      const result = simulateDrop(board, col, opponent);
      if (!result) continue;
      const score = minimax(result.board, depth - 1, alpha, beta, true, player).score;
      if (score < minScore) {
        minScore = score;
        bestCol = col;
      }
      beta = Math.min(beta, score);
      if (alpha >= beta) break;
    }

    return { score: minScore, col: bestCol };
  }
}

function aiMove(board, difficulty) {
  const legal = availableColumns(board);
  if (legal.length === 0) return null;

  switch (difficulty) {
    case "easy": {
      return legal[Math.floor(Math.random() * legal.length)];
    }
    case "medium": {
      for (const col of legal) {
        const result = simulateDrop(board, col, 2);
        if (result && checkWin(result.board, 2)) return col;
      }
      for (const col of legal) {
        const result = simulateDrop(board, col, 1);
        if (result && checkWin(result.board, 1)) return col;
      }
      return legal[Math.floor(Math.random() * legal.length)];
    }
    default: {
      const depth = 5;
      const result = minimax(board, depth, -Infinity, Infinity, true, 2);
      return result.col;
    }
  }
}

export default function Connect4({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("welcome");
  const [mode, setMode] = useState("pvp");
  const [board, setBoard] = useState(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [winCells, setWinCells] = useState(new Set());
  const [hoverColumn, setHoverColumn] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
  const [player1, setPlayer1] = useState({ name: "Player 1", theme: "crimson" });
  const [player2, setPlayer2] = useState({ name: "Player 2", theme: "amber" });
  const [thinking, setThinking] = useState(false);
  const [dropping, setDropping] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [moveCount, setMoveCount] = useState(0);

  const t1 = THEMES[player1.theme];
  const t2 = THEMES[player2.theme];
  const playerColor = (p) => (p === 1 ? t1.light : t2.light);

  const startGame = useCallback(() => {
    setBoard(emptyBoard);
    setWinner(null);
    setCurrentPlayer(1);
    setThinking(false);
    setDropping(null);
    setConfetti([]);
    setMoveCount(0);
    setScreen("game");
  }, []);

  const playAgain = useCallback(() => {
    setBoard(emptyBoard);
    setWinner(null);
    setCurrentPlayer(1);
    setThinking(false);
    setDropping(null);
    setConfetti([]);
    setMoveCount(0);
    setScreen("game");
  }, []);

  const goHome = useCallback(() => {
    setScreen("welcome");
  }, []);

  const spawnConfetti = useCallback(() => {
    const colors = [t1.light, t2.light, "#ffd65a", "#57a9ff", "#49f3af", "#c78fff"];
    const pieces = [];
    for (let i = 0; i < 60; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        speedY: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 3,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    setConfetti(pieces);
  }, [t1.light, t2.light]);

  const handleDrop = useCallback(
    (col) => {
      if (winner || thinking) return;

      const result = dropPiece(board, col, currentPlayer);
      if (!result) return;

      setDropping(col);

      setTimeout(() => {
        const nextBoard = result.board;
        const row = result.row;

        setBoard(nextBoard);
        setMoveCount((prev) => prev + 1);

        if (checkWin(nextBoard, currentPlayer)) {
          setWinCells(getWinCells(nextBoard, currentPlayer));
          setWinner(currentPlayer);
          setScores((prev) => ({
            ...prev,
            [currentPlayer === 1 ? "p1" : "p2"]:
              prev[currentPlayer === 1 ? "p1" : "p2"] + 1,
          }));
          spawnConfetti();
          completeGame("connect-4", currentPlayer === 1 ? 100 : 0, moveCount + 1);
          onComplete?.(currentPlayer === 1 ? 100 : 0, moveCount + 1);
          setTimeout(() => setScreen("winner"), 700);
          return;
        }

        if (isBoardFull(nextBoard)) {
          setWinner(0);
          setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
          completeGame("connect-4", 50, moveCount + 1);
          onComplete?.(50, moveCount + 1);
          setTimeout(() => setScreen("winner"), 700);
          return;
        }

        setCurrentPlayer((p) => (p === 1 ? 2 : 1));
        setDropping(null);
      }, 300);
    },
    [board, currentPlayer, winner, thinking, moveCount, completeGame, onComplete, spawnConfetti]
  );

  useEffect(() => {
    if (mode !== "ai" || currentPlayer !== 2 || winner || thinking) return;

    setThinking(true);
    const timer = setTimeout(() => {
      const move = aiMove(board, difficulty);
      setThinking(false);
      if (move !== null && move !== undefined) {
        handleDrop(move);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [board, currentPlayer, difficulty, winner, thinking, mode, handleDrop]);

  const winnerText = useMemo(() => {
    if (winner === 0) return "Draw";
    if (winner === 1) return player1.name;
    if (winner === 2) return mode === "ai" ? "AI" : player2.name;
    return null;
  }, [winner, player1.name, player2.name, mode]);

  const winnerColor = useMemo(() => {
    if (winner === 1) return t1.light;
    if (winner === 2) return t2.light;
    return "#94a3b8";
  }, [winner, t1.light, t2.light]);

  return (
    <div className={styles.page}>

      {screen === "welcome" && (
        <div className={styles.welcome}>
          <div className={styles.emoji}>🔴🟡</div>
          <h1 className={styles.title}>CONNECT FOUR</h1>
          <p className={styles.subtitle}>Prestige Edition</p>
          <div className={styles.buttonGroup}>
            <button
              onClick={() => { setMode("pvp"); setScreen("setup"); }}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              👥 Two Players
            </button>
            <button
              onClick={() => { setMode("ai"); setScreen("setup"); }}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              🤖 Play vs AI
            </button>
          </div>
        </div>
      )}

      {screen === "setup" && (
        <div className={styles.setup}>
          <h2 className={styles.setupTitle}>Game Setup</h2>
          <div className={styles.setupGrid}>
            <div className={styles.setupColumn}>
              <label className={styles.label}>PLAYER 1</label>
              <input
                value={player1.name}
                onChange={(e) => setPlayer1({ ...player1, name: e.target.value })}
                className={styles.input}
                maxLength={16}
              />
              <label className={styles.labelTop}>COLOR</label>
              <div className={styles.themeGrid}>
                {THEME_KEYS.map((k) => (
                  <div
                    key={k}
                    onClick={() => setPlayer1({ ...player1, theme: k })}
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${THEMES[k].light}, ${THEMES[k].dark})`,
                    }}
                    className={`${styles.themeSwatch} ${player1.theme === k ? styles.themeSwatchActive : ""}`}
                  />
                ))}
              </div>
            </div>
            {mode === "pvp" && (
              <div className={styles.setupColumn}>
                <label className={styles.label}>PLAYER 2</label>
                <input
                  value={player2.name}
                  onChange={(e) => setPlayer2({ ...player2, name: e.target.value })}
                  className={styles.input}
                  maxLength={16}
                />
                <label className={styles.labelTop}>COLOR</label>
                <div className={styles.themeGrid}>
                  {THEME_KEYS.map((k) => (
                    <div
                      key={k}
                      onClick={() => setPlayer2({ ...player2, theme: k })}
                      style={{
                        background: `radial-gradient(circle at 35% 30%, ${THEMES[k].light}, ${THEMES[k].dark})`,
                      }}
                      className={`${styles.themeSwatch} ${player2.theme === k ? styles.themeSwatchActive : ""}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {mode === "ai" && (
              <div>
                <label className={styles.label}>DIFFICULTY</label>
                <div className={styles.diffGrid}>
                  {["easy", "medium", "hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`${styles.diffButton} ${difficulty === d ? styles.diffButtonActive : ""}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={styles.buttonGroupSmall}>
            <button onClick={goHome} className={`${styles.button} ${styles.buttonGhost}`}>
              ← Back
            </button>
            <button onClick={startGame} className={`${styles.button} ${styles.buttonPrimary}`}>
              🎮 Start Match
            </button>
          </div>
        </div>
      )}

      {screen === "game" && (
        <>
          <header className={styles.hud}>
            <div className={`${styles.player} ${currentPlayer === 1 ? styles.active : ""}`}>
              <span
                className={styles.avatar}
                style={{ background: `radial-gradient(circle at 35% 30%, ${t1.light}, ${t1.dark})` }}
              />
              <span className={styles.playerName}>{player1.name}</span>
              <span className={styles.playerScore}>{scores.p1}</span>
            </div>
            <div className={styles.vs}>VS</div>
            <div className={`${styles.player} ${currentPlayer === 2 ? styles.active : ""}`}>
              <span
                className={styles.avatar}
                style={{ background: `radial-gradient(circle at 35% 30%, ${t2.light}, ${t2.dark})` }}
              />
              <span className={styles.playerName}>{mode === "ai" ? "🤖 AI" : player2.name}</span>
              <span className={styles.playerScore}>{scores.p2}</span>
            </div>
          </header>

          {thinking && (
            <div className={styles.thinking}>🤖 AI is thinking...</div>
          )}

          <div className={styles.board}>
            <div className={styles.hoverRow}>
              {Array.from({ length: COLS }, (_, c) => (
                <div
                  key={c}
                  className={styles.hoverCell}
                  onMouseEnter={() => setHoverColumn(c)}
                  onMouseLeave={() => setHoverColumn(null)}
                  onClick={() => handleDrop(c)}
                >
                  {hoverColumn === c &&
                    !winner &&
                    !(mode === "ai" && currentPlayer === 2) &&
                    previewRow(board, c) !== -1 && (
                      <div
                        className={styles.hoverDot}
                        style={{
                          background: playerColor(currentPlayer),
                          top: `${(previewRow(board, c) / ROWS) * 100}%`,
                        }}
                      />
                    )}
                </div>
              ))}
            </div>

            {board.map((row, r) => (
              <div key={r} className={styles.boardRow}>
                {row.map((cell, c) => {
                  const isWin = winner && winCells.has(`${r},${c}`);
                  const isDisabled = winner || (mode === "ai" && currentPlayer === 2);
                  const previewR = previewRow(board, c);
                  const isDropping = dropping === c && r === previewR;
                  return (
                    <div
                      key={c}
                      onClick={() => handleDrop(c)}
                      className={`${styles.cell} ${cell === 0 ? styles.cellEmpty : styles.cellFilled} ${isWin ? styles.cellWin : ""} ${isDisabled ? styles.cellDisabled : ""} ${isDropping ? styles.cellDropping : ""}`}
                      style={
                        cell !== 0
                          ? {
                              "--cell-a": cell === 1 ? t1.light : t2.light,
                              "--cell-b": cell === 1 ? t1.dark : t2.dark,
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className={styles.buttonGroupSmall}>
            <button onClick={playAgain} className={`${styles.button} ${styles.buttonSecondary}`}>
              🔄 New Game
            </button>
            <button
              onClick={() => {
                setScreen("welcome");
                setScores({ p1: 0, p2: 0, draws: 0 });
              }}
              className={`${styles.button} ${styles.buttonGhost}`}
            >
              🏠 Menu
            </button>
          </div>
        </>
      )}

      {screen === "winner" && (
        <div className={styles.winnerOverlay}>
          <div className={styles.winnerCard}>
            <h1 className={styles.winnerTitle} style={{ color: winnerColor }}>
              {winnerText}
            </h1>
            {winner !== 0 && (
              <p className={styles.winnerSubtitle}>
                {winner === 1 ? player1.name : mode === "ai" ? "AI" : player2.name} takes the round!
              </p>
            )}
            {winner === 0 && <p className={styles.winnerSubtitle}>It's a draw!</p>}
            <div className={styles.buttonGroup}>
              <button onClick={playAgain} className={`${styles.button} ${styles.buttonPrimary}`}>
                Play Again
              </button>
              <button onClick={goHome} className={`${styles.button} ${styles.buttonSecondary}`}>
                Home
              </button>
            </div>
          </div>
        </div>
      )}

      {confetti.length > 0 && (
        <div className={styles.confettiContainer}>
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className={styles.confettiPiece}
              style={{
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                backgroundColor: piece.color,
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                transform: `rotate(${piece.rotation}deg)`,
                animationDuration: `${0.8 + Math.random() * 0.6}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}