import { useState, useCallback, useEffect } from "react";

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

// Simple AI: prioritize wins/blocks then center
function aiMove(board, diff) {
  const opponent = 1;
  // Check win
  for (let c = 0; c < COLS; c++) {
    const nb = dropPiece(board, c, 2);
    if (nb && checkWin(nb, 2)) return c;
  }
  if (diff !== "easy") {
    // Block opponent
    for (let c = 0; c < COLS; c++) {
      const nb = dropPiece(board, c, opponent);
      if (nb && checkWin(nb, opponent)) return c;
    }
  }
  if (diff === "hard") {
    // Prefer center
    const order = [3,2,4,1,5,0,6];
    for (const c of order) if (dropPiece(board, c, 2)) return c;
  }
  const valid = Array.from({ length: COLS }, (_, i) => i).filter(c => dropPiece(board, c, 2));
  return valid[Math.floor(Math.random() * valid.length)];
}

export default function Connect4() {
  const [screen, setScreen] = useState("menu"); // menu | setup | game
  const [mode, setMode] = useState("pvp");
  const [diff, setDiff] = useState("medium");
  const [p1Theme, setP1Theme] = useState("crimson");
  const [p2Theme, setP2Theme] = useState("amber");
  const [p1Name, setP1Name] = useState("Player 1");
  const [p2Name, setP2Name] = useState("Player 2");
  const [board, setBoard] = useState(emptyBoard());
  const [current, setCurrent] = useState(1);
  const [status, setStatus] = useState(""); // "" | "win1" | "win2" | "draw"
  const [winCells, setWinCells] = useState(new Set());
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
  const [hoverCol, setHoverCol] = useState(-1);

  const t1 = THEMES[p1Theme], t2 = THEMES[p2Theme];
  const playerColor = (p) => p === 1 ? t1.a : t2.a;

  const startGame = useCallback(() => {
    setBoard(emptyBoard());
    setCurrent(1);
    setStatus("");
    setWinCells(new Set());
    setScreen("game");
  }, []);

  const drop = useCallback((col) => {
    if (status || (mode === "ai" && current === 2)) return;
    const nb = dropPiece(board, col, current);
    if (!nb) return;
    setBoard(nb);

    if (checkWin(nb, current)) {
      setWinCells(getWinCells(nb, current));
      setStatus(current === 1 ? "win1" : "win2");
      setScores(s => ({ ...s, [current === 1 ? "p1" : "p2"]: s[current === 1 ? "p1" : "p2"] + 1 }));
    } else if (isFull(nb)) {
      setStatus("draw");
      setScores(s => ({ ...s, draws: s.draws + 1 }));
    } else {
      setCurrent(current === 1 ? 2 : 1);
    }
  }, [board, current, status, mode]);

  // AI move
  useEffect(() => {
    if (screen !== "game" || mode !== "ai" || current !== 2 || status) return;
    const timer = setTimeout(() => {
      const col = aiMove(board, diff);
      if (col == null) return;
      const nb = dropPiece(board, col, 2);
      if (!nb) return;
      setBoard(nb);
      if (checkWin(nb, 2)) {
        setWinCells(getWinCells(nb, 2));
        setStatus("win2");
        setScores(s => ({ ...s, p2: s.p2 + 1 }));
      } else if (isFull(nb)) {
        setStatus("draw");
        setScores(s => ({ ...s, draws: s.draws + 1 }));
      } else {
        setCurrent(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [screen, mode, current, board, diff, status]);

  if (screen === "menu") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
      fontFamily: "'Segoe UI', sans-serif", color: "#f1f5f9", padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: "3rem", marginBottom: 8 }}>🔴🟡</div>
      <h1 style={{ fontSize: "2.5rem", margin: "0 0 8px", letterSpacing: 3, color: "#e2e8f0" }}>CONNECT FOUR</h1>
      <p style={{ color: "#94a3b8", marginBottom: 40 }}>Prestige Edition</p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => { setMode("pvp"); setScreen("setup"); }} style={{
          padding: "18px 40px", borderRadius: 16, border: "none",
          background: "linear-gradient(135deg,#e8445a,#8b1a2a)",
          color: "#fff", fontWeight: 800, fontSize: "1.2rem", cursor: "pointer",
          boxShadow: "0 4px 20px #e8445a44",
        }}>👥 2 Players</button>
        <button onClick={() => { setMode("ai"); setScreen("setup"); }} style={{
          padding: "18px 40px", borderRadius: 16, border: "none",
          background: "linear-gradient(135deg,#4d9aff,#1a4db5)",
          color: "#fff", fontWeight: 800, fontSize: "1.2rem", cursor: "pointer",
          boxShadow: "0 4px 20px #4d9aff44",
        }}>🤖 vs AI</button>
      </div>
    </div>
  );

  if (screen === "setup") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
      fontFamily: "'Segoe UI', sans-serif", color: "#f1f5f9", padding: 24,
    }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: 24, color: "#a5b4fc" }}>Setup Game</h2>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
        <div style={{ minWidth: 200 }}>
          <label style={{ display: "block", color: "#94a3b8", marginBottom: 6, fontSize: "0.85rem" }}>PLAYER 1</label>
          <input value={p1Name} onChange={e => setP1Name(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", fontSize: "1rem", boxSizing: "border-box" }} />
          <label style={{ display: "block", color: "#94a3b8", marginTop: 12, marginBottom: 6, fontSize: "0.85rem" }}>COLOR</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {THEME_KEYS.map(k => (
              <div key={k} onClick={() => setP1Theme(k)} style={{
                width: 32, height: 32, borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%,${THEMES[k].a},${THEMES[k].b})`,
                cursor: "pointer", border: p1Theme === k ? "3px solid #fff" : "3px solid transparent",
                boxSizing: "border-box",
              }} />
            ))}
          </div>
        </div>
        {mode === "pvp" && (
          <div style={{ minWidth: 200 }}>
            <label style={{ display: "block", color: "#94a3b8", marginBottom: 6, fontSize: "0.85rem" }}>PLAYER 2</label>
            <input value={p2Name} onChange={e => setP2Name(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", fontSize: "1rem", boxSizing: "border-box" }} />
            <label style={{ display: "block", color: "#94a3b8", marginTop: 12, marginBottom: 6, fontSize: "0.85rem" }}>COLOR</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {THEME_KEYS.map(k => (
                <div key={k} onClick={() => setP2Theme(k)} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 30%,${THEMES[k].a},${THEMES[k].b})`,
                  cursor: "pointer", border: p2Theme === k ? "3px solid #fff" : "3px solid transparent",
                  boxSizing: "border-box",
                }} />
              ))}
            </div>
          </div>
        )}
        {mode === "ai" && (
          <div>
            <label style={{ display: "block", color: "#94a3b8", marginBottom: 8, fontSize: "0.85rem" }}>DIFFICULTY</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["easy","medium","hard"].map(d => (
                <button key={d} onClick={() => setDiff(d)} style={{
                  padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: diff === d ? "#6366f1" : "#1e293b",
                  color: "#fff", fontWeight: 700, textTransform: "capitalize",
                }}>{d}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => setScreen("menu")} style={{
          padding: "14px 28px", borderRadius: 999, border: "none",
          background: "#374151", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>← Back</button>
        <button onClick={startGame} style={{
          padding: "14px 32px", borderRadius: 999, border: "none",
          background: "linear-gradient(135deg,#6366f1,#4f46e5)",
          color: "#fff", fontWeight: 800, fontSize: "1rem", cursor: "pointer",
        }}>🎮 Start Game</button>
      </div>
    </div>
  );

  // Game screen
  const actualP2Name = mode === "ai" ? `🤖 AI (${diff})` : p2Name;
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#0f172a,#1e1b4b)",
      fontFamily: "'Segoe UI', sans-serif", color: "#f1f5f9", padding: 16,
    }}>
      {/* Score panel */}
      <div style={{ display: "flex", gap: 24, marginBottom: 16, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: t1.a, margin: "0 auto 4px", boxShadow: `0 0 8px ${t1.a}` }} />
          <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{p1Name}</div>
          <div style={{ fontWeight: 800, fontSize: "1.4rem", color: t1.a }}>{scores.p1}</div>
        </div>
        <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
          <div>{scores.draws} draw{scores.draws !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: t2.a, margin: "0 auto 4px", boxShadow: `0 0 8px ${t2.a}` }} />
          <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{actualP2Name}</div>
          <div style={{ fontWeight: 800, fontSize: "1.4rem", color: t2.a }}>{scores.p2}</div>
        </div>
      </div>

      {/* Status */}
      <div style={{ minHeight: 36, marginBottom: 12, textAlign: "center", fontWeight: 700, fontSize: "1.1rem" }}>
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

      {/* Board */}
      <div style={{ background: "#1e3a8a", borderRadius: 16, padding: 12, boxShadow: "0 8px 40px #0006" }}>
        {/* Hover indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 4, height: 18 }}>
          {Array.from({ length: COLS }, (_, c) => (
            <div key={c} style={{ width: 48, display: "flex", justifyContent: "center" }}>
              {hoverCol === c && !status && !(mode === "ai" && current === 2) && (
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  background: playerColor(current), opacity: 0.8,
                }} />
              )}
            </div>
          ))}
        </div>

        {board.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 8 }}>
            {row.map((cell, c) => {
              const isWin = winCells.has(`${r},${c}`);
              return (
                <div key={c}
                  onClick={() => drop(c)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(-1)}
                  style={{
                    width: 48, height: 48, borderRadius: "50%", cursor: status || (mode === "ai" && current === 2) ? "default" : "pointer",
                    background: cell === 0
                      ? "rgba(255,255,255,0.08)"
                      : `radial-gradient(circle at 35% 30%,${cell === 1 ? t1.a : t2.a},${cell === 1 ? t1.b : t2.b})`,
                    boxShadow: cell === 0 ? "inset 0 2px 4px #0005"
                      : isWin ? `0 0 16px ${cell === 1 ? t1.a : t2.a}, 0 0 32px ${cell === 1 ? t1.a : t2.a}` : `0 2px 8px #0004`,
                    margin: 4,
                    transform: isWin ? "scale(1.08)" : "scale(1)",
                    transition: "all 0.15s",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={startGame} style={{
          padding: "12px 24px", borderRadius: 999, border: "none",
          background: "#1e293b", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>🔄 New Game</button>
        <button onClick={() => { setScreen("menu"); setScores({ p1: 0, p2: 0, draws: 0 }); }} style={{
          padding: "12px 24px", borderRadius: 999, border: "none",
          background: "#1e293b", color: "#94a3b8", fontWeight: 700, cursor: "pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );
}
