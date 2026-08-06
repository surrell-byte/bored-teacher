#!/usr/bin/env bash
# Run this from the root of your bored-teacher-react project.
#
# What this does:
#   1. Backs up games/connect-4/Connect4.jsx and app/games/[game]/page.tsx
#   2. Rewrites Connect4.jsx:
#        - Bigger welcome screen (kid-visible on large screens, comfortable
#          top/bottom breathing room)
#        - Wider desktop customize screen, 12 colours, 12 avatars per player,
#          side-by-side pickers, and a live player-badge preview pane
#        - In-game HUD (player badges, reset/home) is handed off to the
#          GameShell navbar instead of living inside the play area, and the
#          board grows to fill the freed space (and is proportionally wider)
#   3. Patches app/games/[game]/page.tsx to render that HUD in the
#      GameShell's own controls bar for the connect4 route only — every
#      other game is completely unaffected.
set -e

if [ ! -f "app/globals.css" ] || [ ! -f "app/games/[game]/page.tsx" ] || [ ! -f "games/connect-4/Connect4.jsx" ]; then
  echo "Could not find expected project files — run this script from your project root."
  exit 1
fi

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup/connect4-navbar-revamp-$STAMP"
mkdir -p "$BACKUP_DIR"
cp "games/connect-4/Connect4.jsx" "$BACKUP_DIR/Connect4.jsx.bak"
cp "app/games/[game]/page.tsx" "$BACKUP_DIR/page.tsx.bak"
echo "Backed up existing files to $BACKUP_DIR"

# ── 1. Replace games/connect-4/Connect4.jsx wholesale ──────────────────
cat > "games/connect-4/Connect4.jsx" << 'CONNECT4_JSX_EOF'
'use client';
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
  teal:    { a: "#2dd4bf", b: "#0f766e", label: "Teal" },
  magenta: { a: "#ff4fd8", b: "#a8146e", label: "Magenta" },
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

const AVATARS = ["🦁", "🐯", "🐼", "🦊", "🐸", "🐵", "🦄", "🐧", "🐙", "🦖", "🐝", "🐳"];

// ── Shared player-badge visual — used in the setup preview AND the ──
// ── in-game top navbar, so what you configure is exactly what you get.
export function PlayerBadge({ name, avatar, theme, score, align = "left" }) {
  const isRight = align === "right";
  return (
    <div
      className={`c4-badge${isRight ? " c4-badge-right" : ""}`}
      style={{ "--badge-a": theme.a, "--badge-b": theme.b }}
    >
      <div className="c4-badge-avatar" style={{ background: `radial-gradient(circle at 35% 30%, ${theme.a}, ${theme.b})` }}>
        <span>{avatar}</span>
      </div>
      <div className="c4-badge-info">
        <div className="c4-badge-name">{name}</div>
        {score !== undefined && (
          <div className="c4-badge-score">{score} win{score !== 1 ? "s" : ""}</div>
        )}
      </div>
    </div>
  );
}

// ── Rendered inside the GameShell's own navbar (controls bar) while a ──
// ── match is in progress: P1 badge left, Home/Reset centre, P2 badge right.
export function Connect4Controls({ hud }) {
  if (!hud) return null;
  const { p1, p2, current, active, onReset, onHome } = hud;
  return (
    <div className="c4-navbar-hud">
      <div className={`c4-navbar-slot${active && current === 1 ? " turn" : ""}`} style={{ "--turn-a": p1.theme.a }}>
        <PlayerBadge name={p1.name} avatar={p1.avatar} theme={p1.theme} score={p1.score} align="left" />
      </div>
      <div className="c4-navbar-center">
        <button type="button" className="c4-navbar-btn" onClick={onReset} title="Reset match">⟳ Reset</button>
        <button type="button" className="c4-navbar-btn" onClick={onHome} title="Back to menu">⌂ Home</button>
      </div>
      <div className={`c4-navbar-slot${active && current === 2 ? " turn" : ""}`} style={{ "--turn-a": p2.theme.a }}>
        <PlayerBadge name={p2.name} avatar={p2.avatar} theme={p2.theme} score={p2.score} align="right" />
      </div>
    </div>
  );
}

export default function Connect4({ onComplete, onHudUpdate }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("welcome"); // welcome | setup | game | celeb
  const [mode, setMode] = useState("pvp");
  const [aiDiff, setAiDiff] = useState("medium");
  const [p1Theme, setP1Theme] = useState("crimson");
  const [p2Theme, setP2Theme] = useState("amber");
  const [p1Avatar, setP1Avatar] = useState(AVATARS[0]);
  const [p2Avatar, setP2Avatar] = useState(AVATARS[1]);
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

  const initGame = useCallback(() => {
    setBoard(emptyBoard());
    setCurrent(1);
    setActive(true);
    setWinCells([]);
    setMoveCount(0);
  }, []);

  function startGame() {
    if (mode === "ai") {
      const themeKeys = THEME_KEYS.filter(k => k !== p1Theme);
      const themePick = themeKeys[Math.floor(Math.random() * themeKeys.length)];
      setP2Theme(themePick);
      const avatarPool = AVATARS.filter(a => a !== p1Avatar);
      setP2Avatar(avatarPool[Math.floor(Math.random() * avatarPool.length)]);
      setP2Name("AI — " + THEMES[themePick].label);
    }
    setScores({ p1: 0, p2: 0, draws: 0 });
    initGame();
    setScreen("game");
  }

  const playAgain = useCallback(() => { initGame(); setScreen("game"); }, [initGame]);
  const goHome = useCallback(() => { if (aiTimer.current) clearTimeout(aiTimer.current); setScreen("welcome"); }, []);
  const resetMatch = useCallback(() => {
    if (aiTimer.current) clearTimeout(aiTimer.current);
    setScores({ p1: 0, p2: 0, draws: 0 });
    initGame();
  }, [initGame]);

  // ── Hand the in-game HUD off to the page's GameShell navbar so the ──
  // ── page.tsx can render player badges + reset/home outside the play area.
  const hud = useMemo(() => {
    if (screen !== "game") return null;
    return {
      active, current,
      p1: { name: p1Name, avatar: p1Avatar, theme: t1, score: scores.p1 },
      p2: { name: p2Name, avatar: p2Avatar, theme: t2, score: scores.p2 },
      onReset: resetMatch,
      onHome: goHome,
    };
  }, [screen, active, current, p1Name, p2Name, p1Avatar, p2Avatar, t1, t2, scores.p1, scores.p2, resetMatch, goHome]);

  useEffect(() => { onHudUpdate?.(hud); }, [hud, onHudUpdate]);
  useEffect(() => () => { onHudUpdate?.(null); }, [onHudUpdate]);

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
        <div className="c4-card c4-card-welcome" style={{ textAlign: "center" }}>
          <div className="c4-welcome-icon">🔴🟡</div>
          <div className="c4-brand">CONNECT FOUR</div>
          <div className="c4-sub">Prestige Edition</div>
          <button className="c4-btn c4-btn-primary" onClick={() => openSetup("pvp")}>👥&nbsp; Two Players</button>
          <button className="c4-btn c4-btn-ghost" onClick={() => openSetup("ai")}>🤖&nbsp; Play vs AI</button>
        </div>
      )}

      {screen === "setup" && (
        <div className="c4-card c4-card-setup">
          <div className="c4-brand" style={{ fontSize: "1.8rem" }}>CUSTOMIZE</div>
          <div className="c4-sub" style={{ marginBottom: "1.6rem" }}>configure your match</div>

          {mode === "ai" ? (
            <div className="c4-setup-cols">
              <div className="c4-setup-player">
                <div className="c4-label">Your Name</div>
                <input className="c4-input" maxLength={14} value={p1Name} onChange={e => setP1Name(e.target.value)} placeholder="Your name" />
                <div className="c4-picker-row">
                  <div className="c4-picker-col">
                    <div className="c4-label">Your Colour</div>
                    <div className="c4-swatches">
                      {THEME_KEYS.map(k => (
                        <div key={k} className={`c4-swatch${p1Theme === k ? " picked" : ""}`}
                          style={{ background: `radial-gradient(circle at 35% 30%, ${THEMES[k].a}, ${THEMES[k].b})` }}
                          title={THEMES[k].label}
                          onClick={() => setP1Theme(k)} />
                      ))}
                    </div>
                  </div>
                  <div className="c4-picker-col">
                    <div className="c4-label">Your Avatar</div>
                    <div className="c4-avatar-grid">
                      {AVATARS.map(a => (
                        <div key={a} className={`c4-avatar-btn${p1Avatar === a ? " picked" : ""}`} onClick={() => setP1Avatar(a)}>{a}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="c4-label">Difficulty</div>
                <div className="c4-diff-row">
                  {["easy", "medium", "hard"].map(d => (
                    <button key={d} className={`c4-diff-btn${aiDiff === d ? " active" : ""}`} onClick={() => setAiDiff(d)}>{d}</button>
                  ))}
                </div>
                <div className="c4-preview-wrap">
                  <div className="c4-label">Preview</div>
                  <PlayerBadge name={p1Name || "Player 1"} avatar={p1Avatar} theme={t1} align="left" />
                </div>
              </div>
            </div>
          ) : (
            <div className="c4-setup-cols">
              <div className="c4-setup-player">
                <div className="c4-label">Player 1</div>
                <input className="c4-input" maxLength={12} value={p1Name} onChange={e => setP1Name(e.target.value)} placeholder="Name" />
                <div className="c4-picker-row">
                  <div className="c4-picker-col">
                    <div className="c4-label">Colour</div>
                    <div className="c4-swatches">
                      {THEME_KEYS.map(k => (
                        <div key={k} className={`c4-swatch${p1Theme === k ? " picked" : ""}`}
                          style={{ background: `radial-gradient(circle at 35% 30%, ${THEMES[k].a}, ${THEMES[k].b})` }}
                          title={THEMES[k].label}
                          onClick={() => setP1Theme(k)} />
                      ))}
                    </div>
                  </div>
                  <div className="c4-picker-col">
                    <div className="c4-label">Avatar</div>
                    <div className="c4-avatar-grid">
                      {AVATARS.map(a => (
                        <div key={a} className={`c4-avatar-btn${p1Avatar === a ? " picked" : ""}`} onClick={() => setP1Avatar(a)}>{a}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="c4-preview-wrap">
                  <div className="c4-label">Preview</div>
                  <PlayerBadge name={p1Name || "Player 1"} avatar={p1Avatar} theme={t1} align="left" />
                </div>
              </div>
              <div className="c4-setup-player">
                <div className="c4-label">Player 2</div>
                <input className="c4-input" maxLength={12} value={p2Name} onChange={e => setP2Name(e.target.value)} placeholder="Name" />
                <div className="c4-picker-row">
                  <div className="c4-picker-col">
                    <div className="c4-label">Colour</div>
                    <div className="c4-swatches">
                      {THEME_KEYS.map(k => (
                        <div key={k} className={`c4-swatch${p2Theme === k ? " picked" : ""}`}
                          style={{ background: `radial-gradient(circle at 35% 30%, ${THEMES[k].a}, ${THEMES[k].b})` }}
                          title={THEMES[k].label}
                          onClick={() => setP2Theme(k)} />
                      ))}
                    </div>
                  </div>
                  <div className="c4-picker-col">
                    <div className="c4-label">Avatar</div>
                    <div className="c4-avatar-grid">
                      {AVATARS.map(a => (
                        <div key={a} className={`c4-avatar-btn${p2Avatar === a ? " picked" : ""}`} onClick={() => setP2Avatar(a)}>{a}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="c4-preview-wrap">
                  <div className="c4-label">Preview</div>
                  <PlayerBadge name={p2Name || "Player 2"} avatar={p2Avatar} theme={t2} align="right" />
                </div>
              </div>
            </div>
          )}

          <button className="c4-btn c4-btn-primary" style={{ marginTop: "2rem" }} onClick={startGame}>Launch Match</button>
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
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

        /* ── Welcome screen: enlarged for visibility on big screens, with a ── */
        /* ── comfortable top/bottom gap preserved by the flex-centred root.  */
        .c4-card-welcome {
          width: min(94vw, 680px);
          padding: clamp(3rem, 7vh, 5.5rem) clamp(2.4rem, 5vw, 4.5rem) clamp(3.2rem, 7vh, 6rem);
        }
        .c4-welcome-icon { font-size: clamp(3.2rem, 7vw, 5rem); margin-bottom: clamp(0.6rem, 2vh, 1.4rem); }
        .c4-card-welcome .c4-brand { font-size: clamp(3rem, 9vw, 5.6rem); margin-bottom: 0.4rem; }
        .c4-card-welcome .c4-sub { font-size: clamp(0.95rem, 1.7vw, 1.3rem); letter-spacing: 9px; margin-bottom: clamp(2.4rem, 6vh, 4rem); }
        .c4-card-welcome .c4-btn { padding: clamp(1.15rem, 2.6vh, 1.55rem) 1.8rem; font-size: clamp(1.05rem, 1.9vw, 1.35rem); border-radius: 130px; margin-bottom: 1.15rem; }

        .c4-label { font-family: 'DM Mono', monospace; font-size: 0.62rem; letter-spacing: 4px; color: #4a5568; opacity: 0.7; text-transform: uppercase; margin-bottom: 0.8rem; }
        .c4-input {
          width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;
          color: #e8edf5; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 500; padding: 0.8rem 1rem;
          outline: none; margin-bottom: 1.5rem;
        }
        .c4-input:focus { border-color: #d4a853; }
        .c4-swatches { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 1.3rem; }
        .c4-swatch {
          width: 34px; height: 34px; border-radius: 50%; cursor: pointer; border: 2.5px solid transparent;
          transition: all 0.18s; position: relative; flex-shrink: 0;
          box-shadow: inset 0 2px 5px rgba(255,255,255,0.15), 0 6px 16px rgba(0,0,0,0.35);
        }
        .c4-swatch:hover { transform: scale(1.1); }
        .c4-swatch.picked { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.2), 0 0 16px rgba(255,255,255,0.1); transform: scale(1.12); }
        .c4-swatch.picked::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 900; color: rgba(255,255,255,0.9); text-shadow: 0 1px 4px rgba(0,0,0,0.5); font-size: 0.7rem; }
        .c4-pvp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        /* ── Customize screen: wider container on desktop + colour/avatar pickers side by side ── */
        .c4-card-setup { width: min(92vw, 460px); }
        @media (min-width: 860px) {
          .c4-card-setup { width: min(94vw, 1180px); padding: 2.8rem 3.4rem 3.2rem; }
        }
        .c4-setup-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2.2rem; margin-bottom: 0.4rem; }
        .c4-setup-player { min-width: 0; }
        .c4-picker-row { display: flex; flex-wrap: wrap; gap: 1.6rem; }
        .c4-picker-col { flex: 1; min-width: 190px; }
        .c4-avatar-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 1.3rem; }
        .c4-avatar-btn {
          width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-size: 1.15rem; background: rgba(255,255,255,0.04); border: 2px solid rgba(255,255,255,0.08);
          cursor: pointer; transition: all 0.18s;
        }
        .c4-avatar-btn:hover { transform: scale(1.08); border-color: rgba(255,255,255,0.25); }
        .c4-avatar-btn.picked { border-color: #d4a853; background: rgba(212,168,83,0.16); box-shadow: 0 0 0 3px rgba(212,168,83,0.16); }

        .c4-preview-wrap { margin-top: 0.4rem; padding: 1rem 1.1rem; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }

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

        /* ── Player badge — shared by the setup preview and the in-game navbar ── */
        .c4-badge { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .c4-badge-right { flex-direction: row-reverse; }
        .c4-badge-avatar {
          width: clamp(38px, 4.4vw, 54px); height: clamp(38px, 4.4vw, 54px); border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: clamp(1.1rem, 2vw, 1.7rem);
          box-shadow: inset 0 3px 8px rgba(255,255,255,0.3), inset 0 -6px 12px rgba(0,0,0,0.35), 0 0 14px var(--badge-a, #d4a853)55;
        }
        .c4-badge-info { min-width: 0; }
        .c4-badge-right .c4-badge-info { text-align: right; }
        .c4-badge-name { font-weight: 800; font-size: clamp(0.9rem, 1.6vw, 1.15rem); color: #e8edf5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 34vw; }
        .c4-badge-score { font-family: 'DM Mono', monospace; font-size: 0.72rem; opacity: 0.6; color: #9aa7bd; letter-spacing: 0.5px; }

        /* ── In-game navbar HUD, rendered by the page via GameShell's controls bar ── */
        .c4-navbar-hud { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 14px; white-space: normal; }
        .c4-navbar-slot { border-radius: 100px; padding: 4px 12px 4px 4px; transition: box-shadow 0.2s; min-width: 0; }
        .c4-navbar-slot.turn { box-shadow: 0 0 0 2px var(--turn-a), 0 0 16px var(--turn-a)66; background: rgba(255,255,255,0.05); }
        .c4-navbar-hud .c4-badge-right.c4-badge { flex-direction: row-reverse; }
        .c4-navbar-center { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .c4-navbar-btn {
          display: inline-flex; align-items: center; gap: 4px; min-height: 32px; padding: 6px 12px;
          border-radius: 100px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06);
          color: #e8edf5; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.18s;
        }
        .c4-navbar-btn:hover { background: rgba(255,255,255,0.14); border-color: #d4a853; color: #f0c46a; }

        .c4-board-frame {
          --cell: min(13vw, 15vh, 108px);
          --gap-x: calc(var(--cell) * 0.22);
          --gap-y: calc(var(--cell) * 0.14);
          --pad-x: calc(var(--cell) * 0.42);
          --pad-y: calc(var(--cell) * 0.28);
          background: linear-gradient(145deg, rgba(30,45,80,0.82), rgba(8,12,24,0.95));
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: var(--pad-y) var(--pad-x);
          box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -10px 30px rgba(0,0,0,0.5);
          position: relative; margin: 0.8rem auto 0;
        }
        .c4-board-grid {
          display: grid;
          grid-template-columns: repeat(7, var(--cell));
          grid-template-rows: repeat(6, var(--cell));
          column-gap: var(--gap-x);
          row-gap: var(--gap-y);
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
          position: absolute; inset: var(--pad-y) var(--pad-x); pointer-events: none;
          display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--gap-x);
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
          .c4-navbar-hud { gap: 8px; }
          .c4-badge-avatar { width: 30px; height: 30px; font-size: 0.95rem; }
          .c4-badge-name { max-width: 20vw; font-size: 0.72rem; }
          .c4-badge-score { display: none; }
          .c4-navbar-btn span { display: none; }
        }
      `}</style>
    </div>
  );
}
CONNECT4_JSX_EOF
echo "Rewrote games/connect-4/Connect4.jsx"

# ── 2. Patch app/games/[game]/page.tsx ──────────────────────────────────
python3 << 'PYEOF'
import io

path = "app/games/[game]/page.tsx"
with io.open(path, "r", encoding="utf-8") as f:
    src = f.read()

def apply_replace(text, old, new, label):
    if old not in text:
        raise SystemExit(f"Could not find anchor for: {label}\nAborting without modifying {path} further.")
    return text.replace(old, new, 1)

src = apply_replace(
    src,
    "import DesktopControls from '@/components/ui/controls/DesktopControls';",
    "import DesktopControls from '@/components/ui/controls/DesktopControls';\n"
    "import { Connect4Controls } from '@/games/connect-4/Connect4.jsx';",
    "DesktopControls import",
)

src = apply_replace(
    src,
    "  const [result, setResult]   = useState<GameResult | null>(null);\n"
    "  const [gameSession, setGameSession] = useState(0);\n"
    "\n"
    "  const gameName  = GAME_NAMES[gameId] ?? 'Game';\n"
    "  const gameIcon  = GAME_ICONS[gameId] ?? '🎮';\n"
    "  const GameComp  = GAME_COMPONENTS[gameId];",
    "  const [result, setResult]   = useState<GameResult | null>(null);\n"
    "  const [gameSession, setGameSession] = useState(0);\n"
    "  // Connect 4 hands its in-match HUD (player badges + reset/home) up here so\n"
    "  // it can render inside the GameShell navbar instead of the play area.\n"
    "  const [c4Hud, setC4Hud] = useState<any>(null);\n"
    "\n"
    "  const gameName  = GAME_NAMES[gameId] ?? 'Game';\n"
    "  const gameIcon  = GAME_ICONS[gameId] ?? '🎮';\n"
    "  const GameComp  = GAME_COMPONENTS[gameId];\n"
    "  const isConnect4 = gameId === 'connect4';",
    "c4Hud state block",
)

src = apply_replace(
    src,
    "  function handleContinue() {\n"
    "    setResult(null);\n"
    "    setGameSession(session => session + 1);\n"
    "  }",
    "  function handleContinue() {\n"
    "    setResult(null);\n"
    "    setC4Hud(null);\n"
    "    setGameSession(session => session + 1);\n"
    "  }",
    "handleContinue",
)

src = apply_replace(
    src,
    "        controls={<DesktopControls />}",
    "        controls={isConnect4 ? (c4Hud ? <Connect4Controls hud={c4Hud} /> : null) : <DesktopControls />}",
    "controls prop",
)

src = apply_replace(
    src,
    "        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'auto' }}>\n"
    "          <GameComp key={gameSession} onComplete={handleComplete} />\n"
    "        </div>",
    "        <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'auto' }}>\n"
    "          <GameComp\n"
    "            key={gameSession}\n"
    "            onComplete={handleComplete}\n"
    "            {...(isConnect4 ? { onHudUpdate: setC4Hud } : {})}\n"
    "          />\n"
    "        </div>",
    "GameComp render",
)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("Patched app/games/[game]/page.tsx")
PYEOF

echo ""
echo "Done. What changed:"
echo "  • games/connect-4/Connect4.jsx  — bigger welcome screen, wider 12-colour/"
echo "    12-avatar customize screen with live badge preview, and an enlarged"
echo "    board with the HUD moved out of the play area"
echo "  • app/games/[game]/page.tsx     — renders Connect 4's player badges and"
echo "    reset/home buttons in the GameShell navbar (connect4 route only;"
echo "    every other game keeps its existing DesktopControls)"
echo ""
echo "Next: npm run dev (or your usual build) and open /games/connect4 to check it."
