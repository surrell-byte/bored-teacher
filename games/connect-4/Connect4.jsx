import { useState, useCallback, useEffect } from "react";
import { useGame } from "@/lib/gameState";
import styles from "./Connect4.module.css";

const ROWS = 6, COLS = 7;
const THEMES = {
  crimson: { a: "#e8445a", b: "#8b1a2a" },
  amber:   { a: "#f5c842", b: "#a86d0a" },
  cobalt:  { a: "#4d9aff", b: "#1a4db5" },
  jade:    { a: "#3de8a0", b: "#0a7a4a" },
  violet:  { a: "#b87dff", b: "#5c1fb5" },
  coral:   { a: "#ff7c52", b: "#b53a1a" },
  neon:    { a: "#39ff14", b: "#00852e" },
};
const THEME_KEYS = Object.keys(THEMES);

function emptyBoard() { return Array.from({ length: ROWS }, () => Array(COLS).fill(0)); }

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
      for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]])
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
      for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
        const line = check(r, c, dr, dc);
        if (line) line.forEach(k => cells.push(k));
      }
  return new Set(cells);
}

function dropPiece(board, col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      const nb = board.map(row => [...row]);
      nb[r][col] = player;
      return nb;
    }
  }
  return null;
}

function isFull(board) { return board[0].every(c => c !== 0); }

function aiMove(board, diff) {
  const opponent = 1;
  for (let c = 0; c < COLS; c++) {
    const nb = dropPiece(board, c, 2);
    if (nb && checkWin(nb, 2)) return c;
  }
  if (diff !== "easy") {
    for (let c = 0; c < COLS; c++) {
      const nb = dropPiece(board, c, opponent);
      if (nb && checkWin(nb, opponent)) return c;
    }
  }
  if (diff === "hard") {
    const order = [3,2,4,1,5,0,6];
    for (const c of order) if (dropPiece(board, c, 2)) return c;
  }
  const valid = Array.from({ length: COLS }, (_, i) => i).filter(c => dropPiece(board, c, 2));
  return valid[Math.floor(Math.random() * valid.length)];
}

export default function Connect4({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("menu");
  const [mode, setMode] = useState("pvp");
  const [diff, setDiff] = useState("medium");
  const [p1Theme, setP1Theme] = useState("crimson");
  const [p2Theme, setP2Theme] = useState("amber");
  const [p1Name, setP1Name] = useState("Player 1");
  const [p2Name, setP2Name] = useState("Player 2");
  const [board, setBoard] = useState(emptyBoard());
  const [current, setCurrent] = useState(1);
  const [status, setStatus] = useState("");
  const [winCells, setWinCells] = useState(new Set());
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
  const [hoverCol, setHoverCol] = useState(-1);
  const [moveCount, setMoveCount] = useState(0);

  const t1 = THEMES[p1Theme], t2 = THEMES[p2Theme];
  const playerColor = (p) => p === 1 ? t1.a : t2.a;

  const startGame = useCallback(() => {
    setBoard(emptyBoard());
    setCurrent(1);
    setStatus("");
    setWinCells(new Set());
    setMoveCount(0);
    setScreen("game");
  }, []);

  const drop = useCallback((col) => {
    if (status || (mode === "ai" && current === 2)) return;
    const nb = dropPiece(board, col, current);
    if (!nb) return;
    setBoard(nb);

    const nextMoves = moveCount + 1;
    setMoveCount(nextMoves);

    if (checkWin(nb, current)) {
      setWinCells(getWinCells(nb, current));
      setStatus(current === 1 ? "win1" : "win2");
      setScores(s => ({ ...s, [current === 1 ? "p1" : "p2"]: s[current === 1 ? "p1" : "p2"] + 1 }));
      completeGame('connect-4', current === 1 ? 100 : 0, nextMoves);
      onComplete?.(current === 1 ? 100 : 0, nextMoves);
    } else if (isFull(nb)) {
      setStatus("draw");
      setScores(s => ({ ...s, draws: s.draws + 1 }));
      completeGame('connect-4', 50, nextMoves);
      onComplete?.(50, nextMoves);
    } else {
      setCurrent(current === 1 ? 2 : 1);
    }
  }, [board, current, status, mode, moveCount, completeGame]);

  useEffect(() => {
    if (screen !== "game" || mode !== "ai" || current !== 2 || status) return;
    const timer = setTimeout(() => {
      const col = aiMove(board, diff);
      if (col == null) return;
      const nb = dropPiece(board, col, 2);
      if (!nb) return;
      setBoard(nb);

      const nextMoves = moveCount + 1;
      setMoveCount(nextMoves);

      if (checkWin(nb, 2)) {
        setWinCells(getWinCells(nb, 2));
        setStatus("win2");
        setScores(s => ({ ...s, p2: s.p2 + 1 }));
        completeGame('connect-4', 0, nextMoves);
        onComplete?.(0, nextMoves);
      } else if (isFull(nb)) {
        setStatus("draw");
        setScores(s => ({ ...s, draws: s.draws + 1 }));
        completeGame('connect-4', 50, nextMoves);
        onComplete?.(50, nextMoves);
      } else {
        setCurrent(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [screen, mode, current, board, diff, status, moveCount, completeGame]);

  if (screen === "menu") return (
    <div className={styles.page}>
      <div className={styles.emoji}>🔴🟡</div>
      <h1 className={styles.title}>CONNECT FOUR</h1>
      <p className={styles.subtitle}>Prestige Edition</p>
      <div className={styles.buttonGroup}>
        <button onClick={() => { setMode("pvp"); setScreen("setup"); }} className={`${styles.button} ${styles.buttonPrimary}`}>👥 2 Players</button>
        <button onClick={() => { setMode("ai"); setScreen("setup"); }} className={`${styles.button} ${styles.buttonPrimary}`}>🤖 vs AI</button>
      </div>
    </div>
  );

  if (screen === "setup") return (
    <div className={styles.page}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem", color: "#a5b4fc" }}>Setup Game</h2>
      <div className={styles.setupGrid}>
        <div className={styles.setupColumn}>
          <label className={styles.label}>PLAYER 1</label>
          <input value={p1Name} onChange={e => setP1Name(e.target.value)} className={styles.input} />
          <label className={styles.labelTop}>COLOR</label>
          <div className={styles.themeGrid}>
            {THEME_KEYS.map(k => (
              <div key={k} onClick={() => setP1Theme(k)} style={{
                background: `radial-gradient(circle at 35% 30%,${THEMES[k].a},${THEMES[k].b})`,
              }} className={`${styles.themeSwatch} ${p1Theme === k ? styles.themeSwatchActive : ""}`} />
            ))}
          </div>
        </div>
        {mode === "pvp" && (
          <div className={styles.setupColumn}>
            <label className={styles.label}>PLAYER 2</label>
            <input value={p2Name} onChange={e => setP2Name(e.target.value)} className={styles.input} />
            <label className={styles.labelTop}>COLOR</label>
            <div className={styles.themeGrid}>
              {THEME_KEYS.map(k => (
                <div key={k} onClick={() => setP2Theme(k)} style={{
                  background: `radial-gradient(circle at 35% 30%,${THEMES[k].a},${THEMES[k].b})`,
                }} className={`${styles.themeSwatch} ${p2Theme === k ? styles.themeSwatchActive : ""}`} />
              ))}
            </div>
          </div>
        )}
        {mode === "ai" && (
          <div>
            <label className={styles.label}>DIFFICULTY</label>
            <div className={styles.diffGrid}>
              {["easy","medium","hard"].map(d => (
                <button key={d} onClick={() => setDiff(d)} className={`${styles.diffButton} ${diff === d ? styles.diffButtonActive : ""}`}>{d}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={styles.buttonGroupSmall}>
        <button onClick={() => setScreen("menu")} className={`${styles.button} ${styles.buttonGhost}`}>← Back</button>
        <button onClick={startGame} className={`${styles.button} ${styles.buttonPrimary}`}>🎮 Start Game</button>
      </div>
    </div>
  );

  const actualP2Name = mode === "ai" ? `🤖 AI (${diff})` : p2Name;
  return (
    <div className={styles.page}>
      <div className={styles.scorePanel}>
        <div className={styles.scoreCard}>
          <div className={styles.scoreAvatar} style={{ background: t1.a, boxShadow: `0 0 8px ${t1.a}` }} />
          <div className={styles.scoreName}>{p1Name}</div>
          <div className={styles.scoreValue} style={{ color: t1.a }}>{scores.p1}</div>
        </div>
        <div className={styles.scoreDraws}>{scores.draws} draw{scores.draws !== 1 ? "s" : ""}</div>
        <div className={styles.scoreCard}>
          <div className={styles.scoreAvatar} style={{ background: t2.a, boxShadow: `0 0 8px ${t2.a}` }} />
          <div className={styles.scoreName}>{actualP2Name}</div>
          <div className={styles.scoreValue} style={{ color: t2.a }}>{scores.p2}</div>
        </div>
      </div>

      <div className={styles.status}>
        {status === "win1" && <span style={{ color: t1.a }}>🎉 {p1Name} wins!</span>}
        {status === "win2" && <span style={{ color: t2.a }}>🎉 {actualP2Name} wins!</span>}
        {status === "draw" && <span style={{ color: "#94a3b8" }}>🤝 Draw!</span>}
        {!status && (
          <span style={{ color: playerColor(current) }}>
            ● {current === 1 ? p1Name : actualP2Name}'s turn
            {mode === "ai" && current === 2 ? " (thinking...)" : ""}
          </span>
        )}
      </div>

      <div className={styles.board}>
        <div className={styles.hoverRow}>
          {Array.from({ length: COLS }, (_, c) => (
            <div key={c} className={styles.hoverCell}>
              {hoverCol === c && !status && !(mode === "ai" && current === 2) && (
                <div className={styles.hoverDot} style={{ background: playerColor(current) }} />
              )}
            </div>
          ))}
        </div>

        {board.map((row, r) => (
          <div key={r} className={styles.boardRow}>
            {row.map((cell, c) => {
              const isWin = winCells.has(`${r},${c}`);
              const isDisabled = status || (mode === "ai" && current === 2);
              return (
                <div
                  key={c}
                  onClick={() => drop(c)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(-1)}
                  className={`${styles.cell} ${cell === 0 ? styles.cellEmpty : styles.cellFilled} ${isWin ? styles.cellWin : ""} ${isDisabled ? styles.cellDisabled : ""}`}
                  style={cell !== 0 ? { "--cell-a": cell === 1 ? t1.a : t2.a, "--cell-b": cell === 1 ? t1.b : t2.b } : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.buttonGroupSmall}>
        <button onClick={startGame} className={`${styles.button} ${styles.buttonSecondary}`}>🔄 New Game</button>
        <button onClick={() => { setScreen("menu"); setScores({ p1: 0, p2: 0, draws: 0 }); }} className={`${styles.button} ${styles.buttonGhost}`}>🏠 Menu</button>
      </div>
    </div>
  );
}