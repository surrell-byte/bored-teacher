'use client';
import { useState, useCallback, useEffect, useRef } from "react";
import { useGame } from "@/lib/gameState";

const ROWS = 6, COLS = 7;

const THEMES = {
  crimson: { a: "#e8445a", b: "#8b1a2a", label: "Crimson" },
  amber:   { a: "#f5c842", b: "#a86d0a", label: "Amber" },
  cobalt:  { a: "#4d9aff", b: "#1a4db5", label: "Cobalt" },
  jade:    { a: "#3de8a0", b: "#0a7a4a", label: "Jade" },
  violet:  { a: "#b87dff", b: "#5c1fb5", label: "Violet" },
  coral:   { a: "#ff7c52", b: "#b53a1a", label: "Coral" },
  ice:     { a: "#dff6ff", b: "#4db8d4", label: "Ice" },
  sunset:  { a: "#ff9966", b: "#c43a20", label: "Sunset" },
  neon:    { a: "#39ff14", b: "#00852e", label: "Neon" },
  rose:    { a: "#ff85b0", b: "#b52060", label: "Rose" },
};
const THEME_KEYS = Object.keys(THEMES);

function emptyBoard() { return Array.from({ length: ROWS }, () => Array(COLS).fill(0)); }
function topRow(board, col) { for (let r = ROWS - 1; r >= 0; r--) if (!board[r][col]) return r; return -1; }
function colFull(board, col) { return topRow(board, col) < 0; }
function boardFull(board) { for (let c = 0; c < COLS; c++) if (!colFull(board, c)) return false; return true; }

function checkWinAt(board, row, col, p) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let cells = [{ row, col }];
    for (const s of [1, -1]) {
      let r = row + dr * s, c = col + dc * s;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === p) {
        cells.push({ row: r, col: c }); r += dr * s; c += dc * s;
      }
    }
    if (cells.length >= 4) return cells.slice(0, 4);
  }
  return null;
}

// ── AI: minimax with alpha-beta, same shape as the reference build ──
function evalBoard(board) {
  let score = 0;
  for (let r = 0; r < ROWS; r++) { if (board[r][3] === 2) score += 3; if (board[r][3] === 1) score -= 3; }
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) for (const [dr, dc] of dirs) {
    let ai = 0, hu = 0, dead = false;
    for (let i = 0; i < 4; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) { dead = true; break; }
      if (board[nr][nc] === 2) ai++; else if (board[nr][nc] === 1) hu++;
    }
    if (dead) continue;
    if (hu === 0) score += ai === 4 ? 100 : ai === 3 ? 5 : ai === 2 ? 2 : 0;
    if (ai === 0) score -= hu === 4 ? 100 : hu === 3 ? 5 : hu === 2 ? 2 : 0;
  }
  return score;
}
function minimax(board, depth, isMax, alpha, beta) {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (board[r][c] === 2 && checkWinAt(board, r, c, 2)) return 1000 + depth;
    if (board[r][c] === 1 && checkWinAt(board, r, c, 1)) return -(1000 + depth);
  }
  if (boardFull(board) || depth === 0) return evalBoard(board);
  if (isMax) {
    let v = -Infinity;
    for (let c = 0; c < COLS; c++) {
      if (colFull(board, c)) continue;
      const r = topRow(board, c); board[r][c] = 2;
      v = Math.max(v, minimax(board, depth - 1, false, alpha, beta));
      board[r][c] = 0;
      alpha = Math.max(alpha, v);
      if (alpha >= beta) break;
    }
    return v;
  } else {
    let v = Infinity;
    for (let c = 0; c < COLS; c++) {
      if (colFull(board, c)) continue;
      const r = topRow(board, c); board[r][c] = 1;
      v = Math.min(v, minimax(board, depth - 1, true, alpha, beta));
      board[r][c] = 0;
      beta = Math.min(beta, v);
      if (alpha >= beta) break;
    }
    return v;
  }
}
function bestMove(board, depth) {
  for (let c = 0; c < COLS; c++) {
    if (colFull(board, c)) continue;
    const r = topRow(board, c); board[r][c] = 2;
    const w = checkWinAt(board, r, c, 2); board[r][c] = 0;
    if (w) return c;
  }
  for (let c = 0; c < COLS; c++) {
    if (colFull(board, c)) continue;
    const r = topRow(board, c); board[r][c] = 1;
    const w = checkWinAt(board, r, c, 1); board[r][c] = 0;
    if (w) return c;
  }
  let best = -Infinity, bestCol = 3;
  for (let c = 0; c < COLS; c++) {
    if (colFull(board, c)) continue;
    const r = topRow(board, c);
    board[r][c] = 2;
    const score = minimax(board, depth - 1, false, -Infinity, Infinity);
    board[r][c] = 0;
    if (score > best) { best = score; bestCol = c; }
  }
  return bestCol;
}
function easyAI(board) {
  if (Math.random() < 0.4) return bestMove(board, 3);
  const avail = []; for (let c = 0; c < COLS; c++) if (!colFull(board, c)) avail.push(c);
  return avail[Math.floor(Math.random() * avail.length)];
}
function aiPickColumn(board, diff) {
  if (diff === "easy") return easyAI(board);
  if (diff === "hard") return bestMove(board, 7);
  return bestMove(board, 5);
}

export default function Connect4({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("welcome"); // welcome | setup | game | celeb
  const [mode, setMode] = useState("pvp");
  const [aiDiff, setAiDiff] = useState("medium");
  const [p1Theme, setP1Theme] = useState("crimson");
  const [p2Theme, setP2Theme] = useState("amber");
  const [p1Name, setP1Name] = useState("Crimson");
  const [p2Name, setP2Name] = useState("Amber");

  const [board, setBoard] = useState(emptyBoard());
  const [current, setCurrent] = useState(1);
  const [active, setActive] = useState(true);
  const [winCells, setWinCells] = useState([]);
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
  const [hoverCol, setHoverCol] = useState(-1);
  const [moveCount, setMoveCount] = useState(0);
  const [celeb, setCeleb] = useState({ icon: "🏆", title: "VICTORY", sub: "Exceptional play." });
  const [confetti, setConfetti] = useState([]);
  const aiTimer = useRef(null);

  const t1 = THEMES[p1Theme], t2 = THEMES[p2Theme];
  const displayName = (p) => p === 1 ? p1Name : p2Name;
  const playerColor = (p) => p === 1 ? t1.a : t2.a;

  useEffect(() => () => { if (aiTimer.current) clearTimeout(aiTimer.current); }, []);

  const openSetup = useCallback((m) => { setMode(m); setScreen("setup"); }, []);

  const launchConfetti = useCallback((colorA) => {
    const parts = Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.25,
      dur: 1.6 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 220,
      rot: Math.random() * 720 - 360,
      size: 6 + Math.random() * 7,
      color: Math.random() < 0.6 ? colorA : "#ffffff",
    }));
    setConfetti(parts);
    setTimeout(() => setConfetti([]), 3000);
  }, []);

  function finishRound(nb, row, col, mover) {
    const win = checkWinAt(nb, row, col, mover);
    const full = !win && boardFull(nb);
    const nextMoves = moveCount + 1;
    setMoveCount(nextMoves);
    setBoard(nb);

    if (win) {
      setActive(false);
      setWinCells(win);
      const isP1 = mover === 1;
      setScores(s => ({ ...s, [isP1 ? "p1" : "p2"]: s[isP1 ? "p1" : "p2"] + 1 }));
      const score = isP1 ? 100 : 0;
      completeGame('connect-4', score, nextMoves);
      onComplete?.(score, nextMoves);
      setTimeout(() => {
        launchConfetti(isP1 ? t1.a : t2.a);
        setCeleb({
          icon: isP1 ? "🏆" : (mode === "ai" ? "💀" : "🏆"),
          title: displayName(mover).toUpperCase(),
          sub: mode === "ai" && !isP1 ? "The AI wins this round." : "Exceptional play.",
        });
        setScreen("celeb");
      }, 900);
      return;
    }
    if (full) {
      setActive(false);
      setScores(s => ({ ...s, draws: s.draws + 1 }));
      completeGame('connect-4', 50, nextMoves);
      onComplete?.(50, nextMoves);
      setTimeout(() => {
        setCeleb({ icon: "🤝", title: "DRAW", sub: "An equal match." });
        setScreen("celeb");
      }, 700);
      return;
    }
    setCurrent(mover === 1 ? 2 : 1);
  }

  const humanDrop = useCallback((col) => {
    if (!active || screen !== "game") return;
    if (mode === "ai" && current === 2) return;
    const row = topRow(board, col);
    if (row < 0) return;
    const nb = board.map(r => [...r]);
    nb[row][col] = current;
    finishRound(nb, row, col, current);
  }, [board, current, active, mode, screen, moveCount]);

  // AI move
  useEffect(() => {
    if (screen !== "game" || mode !== "ai" || current !== 2 || !active) return;
    const delay = aiDiff === "easy" ? 900 : aiDiff === "hard" ? 350 : 600;
    aiTimer.current = setTimeout(() => {
      const col = aiPickColumn(board, aiDiff);
      const row = topRow(board, col);
      if (row < 0) return;
      const nb = board.map(r => [...r]);
      nb[row][col] = 2;
      finishRound(nb, row, col, 2);
    }, delay);
    return () => clearTimeout(aiTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, mode, current, active, board, aiDiff]);

  function initGame() {
    setBoard(emptyBoard());
    setCurrent(1);
    setActive(true);
    setWinCells([]);
    setMoveCount(0);
  }

  function startGame() {
    if (mode === "ai") {
      const keys = THEME_KEYS.filter(k => k !== p1Theme);
      const pick = keys[Math.floor(Math.random() * keys.length)];
      setP2Theme(pick);
      setP2Name("AI — " + THEMES[pick].label);
    }
    setScores({ p1: 0, p2: 0, draws: 0 });
    initGame();
    setScreen("game");
  }

  function playAgain() { initGame(); setScreen("game"); }
  function goHome() { if (aiTimer.current) clearTimeout(aiTimer.current); setScreen("welcome"); }
  function resetMatch() { if (aiTimer.current) clearTimeout(aiTimer.current); setScores({ p1: 0, p2: 0, draws: 0 }); initGame(); }

  const isWin = (r, c) => winCells.some(w => w.row === r && w.col === c);
  const previewRow = hoverCol >= 0 && active && !(mode === "ai" && current === 2) ? topRow(board, hoverCol) : -1;

  return (
    <div className="c4-root" style={{
      "--p1-a": t1.a, "--p1-b": t1.b, "--p2-a": t2.a, "--p2-b": t2.b,
      minHeight: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(circle at center, #0d1322 0%, #06080f 70%), #05070d",
      fontFamily: "'DM Sans', sans-serif", color: "#e8edf5", position: "relative", overflow: "hidden", padding: "1.5rem",
    }}>
      {/* ambient glow wash */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle at 20% 30%, rgba(0,140,255,0.10), transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,0,120,0.08), transparent 35%)",
        filter: "blur(80px)", animation: "c4Ambient 18s ease-in-out infinite alternate",
      }} />

      {screen === "welcome" && (
        <div className="c4-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>🔴🟡</div>
          <div className="c4-brand">CONNECT FOUR</div>
          <div className="c4-sub">Prestige Edition</div>
          <button className="c4-btn c4-btn-primary" onClick={() => openSetup("pvp")}>👥&nbsp; Two Players</button>
          <button className="c4-btn c4-btn-ghost" onClick={() => openSetup("ai")}>🤖&nbsp; Play vs AI</button>
        </div>
      )}

      {screen === "setup" && (
        <div className="c4-card">
          <div className="c4-brand" style={{ fontSize: "1.8rem" }}>CUSTOMIZE</div>
          <div className="c4-sub" style={{ marginBottom: "1.6rem" }}>configure your match</div>

          {mode === "ai" ? (
            <>
              <div className="c4-label">Your Name</div>
              <input className="c4-input" maxLength={14} value={p1Name} onChange={e => setP1Name(e.target.value)} placeholder="Your name" />
              <div className="c4-label">Your Colour</div>
              <div className="c4-swatches">
                {THEME_KEYS.map(k => (
                  <div key={k} className={`c4-swatch${p1Theme === k ? " picked" : ""}`}
                    style={{ background: `radial-gradient(circle at 35% 30%, ${THEMES[k].a}, ${THEMES[k].b})` }}
                    onClick={() => setP1Theme(k)} />
                ))}
              </div>
              <div className="c4-label">Difficulty</div>
              <div className="c4-diff-row">
                {["easy", "medium", "hard"].map(d => (
                  <button key={d} className={`c4-diff-btn${aiDiff === d ? " active" : ""}`} onClick={() => setAiDiff(d)}>{d}</button>
                ))}
              </div>
            </>
          ) : (
            <div className="c4-pvp-row">
              <div>
                <div className="c4-label">Player 1</div>
                <input className="c4-input" maxLength={12} value={p1Name} onChange={e => setP1Name(e.target.value)} placeholder="Name" />
                <div className="c4-label" style={{ marginBottom: "0.4rem" }}>Colour</div>
                <div className="c4-swatches">
                  {THEME_KEYS.map(k => (
                    <div key={k} className={`c4-swatch${p1Theme === k ? " picked" : ""}`}
                      style={{ background: `radial-gradient(circle at 35% 30%, ${THEMES[k].a}, ${THEMES[k].b})` }}
                      onClick={() => setP1Theme(k)} />
                  ))}
                </div>
              </div>
              <div>
                <div className="c4-label">Player 2</div>
                <input className="c4-input" maxLength={12} value={p2Name} onChange={e => setP2Name(e.target.value)} placeholder="Name" />
                <div className="c4-label" style={{ marginBottom: "0.4rem" }}>Colour</div>
                <div className="c4-swatches">
                  {THEME_KEYS.map(k => (
                    <div key={k} className={`c4-swatch${p2Theme === k ? " picked" : ""}`}
                      style={{ background: `radial-gradient(circle at 35% 30%, ${THEMES[k].a}, ${THEMES[k].b})` }}
                      onClick={() => setP2Theme(k)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <button className="c4-btn c4-btn-primary" onClick={startGame}>Launch Match</button>
          <button className="c4-btn c4-btn-ghost" onClick={() => setScreen("welcome")}>← Back</button>
        </div>
      )}

      {screen === "celeb" && (
        <div className="c4-card" style={{ textAlign: "center" }}>
          <span className="c4-celeb-icon">{celeb.icon}</span>
          <div className="c4-celeb-title">{celeb.title}</div>
          <div className="c4-celeb-sub">{celeb.sub}</div>
          <button className="c4-btn c4-btn-primary" onClick={playAgain}>Play Again</button>
          <button className="c4-btn c4-btn-ghost" onClick={goHome}>← Home</button>
        </div>
      )}

      {screen === "game" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative", zIndex: 1, width: "100%" }}>
          <div className="c4-hud">
            <div className="c4-player-card" style={{ "--active-color": t1.a, ...(current === 1 && active ? { borderColor: t1.a, boxShadow: `0 0 0 1px ${t1.a}, 0 4px 20px rgba(0,0,0,0.3)` } : {}) }}>
              <div className="c4-token" style={{ background: `radial-gradient(circle at 35% 30%, ${t1.a}, ${t1.b})`, boxShadow: `0 0 10px ${t1.a}55` }} />
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <div className="c4-player-name">{p1Name}</div>
                <div className="c4-player-score">{scores.p1} win{scores.p1 !== 1 ? "s" : ""}</div>
              </div>
            </div>
            <div className="c4-hud-center">
              <div className="c4-vs">VS</div>
              <div style={{ display: "flex", gap: 6 }}>
                <div className="c4-icon-btn" title="Reset" onClick={resetMatch}>⟳</div>
                <div className="c4-icon-btn" title="Home" onClick={goHome}>⌂</div>
              </div>
            </div>
            <div className="c4-player-card c4-p2" style={{ "--active-color": t2.a, ...(current === 2 && active ? { borderColor: t2.a, boxShadow: `0 0 0 1px ${t2.a}, 0 4px 20px rgba(0,0,0,0.3)` } : {}) }}>
              <div className="c4-token" style={{ background: `radial-gradient(circle at 35% 30%, ${t2.a}, ${t2.b})`, boxShadow: `0 0 10px ${t2.a}55` }} />
              <div style={{ minWidth: 0, overflow: "hidden", textAlign: "right" }}>
                <div className="c4-player-name">{p2Name}</div>
                <div className="c4-player-score">{scores.p2} win{scores.p2 !== 1 ? "s" : ""}</div>
              </div>
            </div>
          </div>

          <div className={`c4-board-frame${!active ? " over" : ""}`}>
            <div className="c4-board-grid">
              {board.map((row, r) => row.map((cell, c) => {
                const win_ = isWin(r, c);
                const isPreview = c === hoverCol && r === previewRow && cell === 0;
                const colHovered = c === hoverCol && cell === 0 && previewRow >= 0 && r !== previewRow;
                const rowLetter = String.fromCharCode(65 + r);
                return (
                  <div key={`${r}-${c}`}
                    className={`c4-cell${cell === 1 ? " p1" : cell === 2 ? " p2" : ""}${win_ ? " win" : ""}${isPreview ? " preview" : ""}${colHovered ? " colhover" : ""}`}
                    onClick={() => humanDrop(c)}
                    onMouseEnter={() => setHoverCol(c)}
                    onMouseLeave={() => setHoverCol(-1)}
                  >
                    {cell === 0 && <span className="c4-cell-label">{rowLetter}{c + 1}</span>}
                  </div>
                );
              }))}
            </div>
            <div className="c4-col-overlays">
              {Array.from({ length: COLS }, (_, c) => (
                <div key={c} className="c4-col-overlay"
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(-1)}
                  onClick={() => humanDrop(c)}>
                  {hoverCol === c && active && !(mode === "ai" && current === 2) && (
                    <div className="c4-drop-guide" style={{ borderTopColor: playerColor(current), filter: `drop-shadow(0 -2px 4px ${playerColor(current)})` }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confetti burst */}
      {confetti.length > 0 && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
          {confetti.map(p => (
            <span key={p.id} style={{
              position: "absolute", top: "-5%", left: `${p.x}%`,
              width: p.size, height: p.size * 0.4, background: p.color,
              // eslint-disable-next-line
              ["--drift"]: `${p.drift}px`, ["--rot"]: `${p.rot}deg`,
              animation: `c4Confetti ${p.dur}s ${p.delay}s ease-in forwards`,
              borderRadius: 2,
            }} />
          ))}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        .c4-root * { box-sizing: border-box; }

        .c4-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015)),
                      linear-gradient(160deg, rgba(17,24,39,0.94), rgba(8,11,18,0.98));
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 36px;
          padding: 2.8rem 2.4rem 3rem;
          width: min(92vw, 440px);
          backdrop-filter: blur(28px);
          box-shadow: 0 40px 120px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03);
          position: relative; z-index: 1; overflow: hidden;
          animation: c4ScreenEnter 0.7s cubic-bezier(0.16,1,0.3,1), c4CardFloat 7s ease-in-out 0.7s infinite;
        }
        .c4-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 8vw, 3.4rem);
          letter-spacing: 3px;
          background: linear-gradient(135deg, #d4a853 0%, #f0c46a 40%, #e8b55a 70%, #a07828 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          line-height: 1; margin-bottom: 0.2rem;
        }
        .c4-sub {
          font-family: 'DM Mono', monospace; font-size: 0.78rem; letter-spacing: 6px;
          color: #4a5568; opacity: 0.6; text-transform: uppercase; margin-bottom: 2.2rem;
        }
        .c4-btn {
          width: 100%; padding: 0.95rem 1.5rem; border-radius: 100px; border: none;
          font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.88rem; letter-spacing: 0.5px;
          cursor: pointer; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); margin-bottom: 0.7rem;
        }
        .c4-btn-primary { background: linear-gradient(135deg, #d4a853, #e8b55a); color: #0a0c10; box-shadow: 0 4px 18px rgba(212,168,83,0.18); }
        .c4-btn-primary:hover { box-shadow: 0 12px 32px rgba(212,168,83,0.35); transform: translateY(-1px); }
        .c4-btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.18); color: #8b98b0; }
        .c4-btn-ghost:hover { color: #e8edf5; border-color: rgba(255,255,255,0.3); }
        .c4-btn:active { transform: scale(0.98); }

        .c4-label { font-family: 'DM Mono', monospace; font-size: 0.62rem; letter-spacing: 4px; color: #4a5568; opacity: 0.7; text-transform: uppercase; margin-bottom: 0.8rem; }
        .c4-input {
          width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;
          color: #e8edf5; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 500; padding: 0.8rem 1rem;
          outline: none; margin-bottom: 1.5rem;
        }
        .c4-input:focus { border-color: #d4a853; }
        .c4-swatches { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .c4-swatch {
          width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2.5px solid transparent;
          transition: all 0.18s; position: relative; flex-shrink: 0;
          box-shadow: inset 0 2px 5px rgba(255,255,255,0.15), 0 6px 16px rgba(0,0,0,0.35);
        }
        .c4-swatch:hover { transform: scale(1.1); }
        .c4-swatch.picked { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.2), 0 0 16px rgba(255,255,255,0.1); transform: scale(1.12); }
        .c4-swatch.picked::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 900; color: rgba(255,255,255,0.9); text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
        .c4-pvp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .c4-diff-row { display: flex; gap: 8px; margin-bottom: 1.5rem; }
        .c4-diff-btn {
          flex: 1; padding: 0.55rem 0.4rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; color: #8b98b0; font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 1px;
          text-transform: uppercase; cursor: pointer; transition: all 0.18s;
        }
        .c4-diff-btn:hover { border-color: #d4a853; color: #d4a853; }
        .c4-diff-btn.active { background: rgba(212,168,83,0.12); border-color: #d4a853; color: #f0c46a; }

        .c4-celeb-icon { font-size: 4rem; display: block; margin-bottom: 0.5rem; animation: c4Float 2s ease-in-out infinite; }
        .c4-celeb-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.4rem; letter-spacing: 3px; color: #f0c46a; margin-bottom: 0.3rem; }
        .c4-celeb-sub { font-size: 0.85rem; color: #8b98b0; margin-bottom: 1.8rem; }

        .c4-hud { display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 640px; padding: 0.6rem clamp(0.6rem, 2vw, 1.2rem); gap: 0.8rem; }
        .c4-player-card {
          display: flex; align-items: center; gap: 10px; background: rgba(13,18,32,0.8);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 60px; padding: 0.5rem 1rem 0.5rem 0.5rem;
          transition: all 0.3s; flex: 1; min-width: 0;
        }
        .c4-p2 { flex-direction: row-reverse; justify-content: flex-start; }
        .c4-token { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; }
        .c4-player-name { font-weight: 800; font-size: clamp(0.85rem, 2vw, 1.25rem); letter-spacing: 0.5px; color: #e8edf5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .c4-player-score { font-family: 'DM Mono', monospace; font-size: 0.75rem; opacity: 0.55; color: #4a5568; letter-spacing: 1px; }
        .c4-hud-center { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; padding: 0 0.4rem; }
        .c4-vs { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: 2px; color: #4a5568; line-height: 1; }
        .c4-icon-btn {
          width: 30px; height: 30px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 50%; color: #8b98b0; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.18s;
        }
        .c4-icon-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.18); color: white; }

        .c4-board-frame {
          --cell: min(11vw, 11vh, 70px);
          --gap: calc(var(--cell) * 0.14);
          --pad: calc(var(--cell) * 0.28);
          background: linear-gradient(145deg, rgba(30,45,80,0.82), rgba(8,12,24,0.95));
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: var(--pad);
          box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -10px 30px rgba(0,0,0,0.5);
          position: relative; margin: 0.8rem auto 0;
        }
        .c4-board-grid {
          display: grid;
          grid-template-columns: repeat(7, var(--cell));
          grid-template-rows: repeat(6, var(--cell));
          gap: var(--gap);
        }
        .c4-cell {
          width: var(--cell); height: var(--cell); border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.04), rgba(0,0,0,0.88));
          box-shadow: inset 0 6px 12px rgba(255,255,255,0.04), inset 0 -10px 20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03);
          position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.08s;
        }
        .c4-cell.colhover { background: #0b1020; }
        .c4-cell.preview { background: rgba(255,255,255,0.06); box-shadow: inset 0 3px 8px rgba(0,0,0,0.7), 0 0 12px rgba(255,255,255,0.04); }
        .c4-cell.p1 { background: radial-gradient(circle at 35% 30%, #ff6b7f, var(--p1-a) 50%, var(--p1-b)); box-shadow: 0 0 12px var(--p1-a), inset 0 6px 10px rgba(255,255,255,0.35), inset 0 -10px 18px rgba(0,0,0,0.45); animation: c4DropIn 0.28s cubic-bezier(0.25,1.4,0.5,1); }
        .c4-cell.p2 { background: radial-gradient(circle at 35% 30%, #ffd966, var(--p2-a) 50%, var(--p2-b)); box-shadow: 0 0 12px var(--p2-a), inset 0 6px 10px rgba(255,255,255,0.35), inset 0 -10px 18px rgba(0,0,0,0.45); animation: c4DropIn 0.28s cubic-bezier(0.25,1.4,0.5,1); }
        .c4-cell.p1::before, .c4-cell.p2::before {
          content: ''; position: absolute; top: 14%; left: 18%; width: 38%; height: 38%; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%); filter: blur(4px); pointer-events: none;
        }
        .c4-cell.win { animation: c4WinBurst 0.6s ease-out forwards, c4WinPulse 1s 0.6s ease-in-out infinite; }
        .c4-board-frame.over .c4-cell:not(.p1):not(.p2) { opacity: 0.4; }
        .c4-board-frame.over .c4-col-overlay { pointer-events: none !important; }

        .c4-cell-label {
          font-family: 'DM Mono', monospace; font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.28);
          text-shadow: 0 0 8px rgba(255,255,255,0.12); pointer-events: none;
        }

        .c4-col-overlays {
          position: absolute; inset: var(--pad); pointer-events: none;
          display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--gap);
        }
        .c4-col-overlay { pointer-events: all; cursor: pointer; position: relative; border-radius: 100px; }
        .c4-drop-guide {
          position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
          width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 9px solid white;
        }

        @keyframes c4Ambient { from { transform: translateY(-20px) scale(1); } to { transform: translateY(20px) scale(1.08); } }
        @keyframes c4ScreenEnter { from { opacity: 0; transform: translateY(30px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes c4CardFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes c4Float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes c4DropIn { 0% { transform: scale(0.4) translateY(-8px); opacity: 0.3; } 70% { transform: scale(1.06); } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes c4WinBurst { 0% { transform: scale(1); } 30% { transform: scale(1.22); box-shadow: 0 0 0 6px rgba(255,215,0,0.5); } 60% { transform: scale(0.95); } 100% { transform: scale(1.05); box-shadow: 0 0 0 3px rgba(255,215,0,0.3); } }
        @keyframes c4WinPulse { 0%, 100% { box-shadow: 0 0 0 3px rgba(255,215,0,0.3), 0 0 20px rgba(255,215,0,0.15); } 50% { box-shadow: 0 0 0 5px rgba(255,215,0,0.5), 0 0 30px rgba(255,215,0,0.25); } }
        @keyframes c4Confetti {
          0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 110vh) rotate(var(--rot)); opacity: 0.9; }
        }

        @media (max-width: 520px) {
          .c4-board-frame { --cell: min(12vw, 52px); }
          .c4-player-card { padding: 0.4rem 0.7rem 0.4rem 0.4rem; }
          .c4-token { width: 26px; height: 26px; }
        }
      `}</style>
    </div>
  );
}
