#!/usr/bin/env bash
# Run this from the root of your bored-teacher-react project.
set -e
TARGET="games/tictacroll/TicTacRoll.tsx"
if [ ! -f "$TARGET" ]; then
  echo "Could not find $TARGET — run this script from your project root."
  exit 1
fi
BACKUP_DIR="backup/tictacroll-theme-overhaul-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp "$TARGET" "$BACKUP_DIR/TicTacRoll.tsx.bak"
echo "Backed up existing file to $BACKUP_DIR"

cat > "$TARGET" << 'FILE_EOF'
'use client';
import { useState, useEffect, useCallback, useRef } from "react";

const AVATARS = ["🎮","🦁","🐺","🦊","🐸","🐧","🦄","🌟","⚡","🔥","🌙","💎"];

// Each theme carries its own X-crystal / O-ring colour pair plus a sand tone
// used for the carved-sandstone board.
const THEMES = [
  { id: "kalahari", name: "Kalahari Dawn", bg: "#FFF4D7", surface: "#FFE9BE", sand: "#E8B260", accent: "#FFBE3B", accent2: "#F07A2F", glow: "rgba(255,190,59,0.35)", card: "#FFE9BE", text: "#3B2A18", muted: "#8a7355", border: "rgba(224,164,74,0.35)", shadow: "0 8px 30px rgba(184,120,40,0.18)", xColor: "#3AB8FF", oColor: "#F07A2F", ok: "#42C97B" },
  { id: "mirage", name: "Sunset Mirage", bg: "#FFE6B3", surface: "#FFD9A0", sand: "#FFB95A", accent: "#FF7F4D", accent2: "#FF4D8D", glow: "rgba(255,79,141,0.32)", card: "#FFDEB0", text: "#503042", muted: "#8a5e6e", border: "rgba(166,94,255,0.3)", shadow: "0 8px 30px rgba(255,79,141,0.18)", xColor: "#A65EFF", oColor: "#FF7F4D", ok: "#FFB95A" },
  { id: "night", name: "Desert Night", bg: "#101928", surface: "#1E273B", sand: "#2A3550", accent: "#2D9CDB", accent2: "#8A5CFF", glow: "rgba(255,216,110,0.25)", card: "#1E273B", text: "#F7F7F7", muted: "#8b93a8", border: "rgba(138,92,255,0.35)", shadow: "0 8px 30px rgba(0,0,0,0.5)", xColor: "#2D9CDB", oColor: "#FFD86E", ok: "#4BE88B" },
  { id: "emerald", name: "Emerald Oasis", bg: "#FFF7E2", surface: "#FDEFCB", sand: "#E9C46A", accent: "#43AA8B", accent2: "#2E7D63", glow: "rgba(67,170,139,0.3)", card: "#FBEBC6", text: "#1f3d33", muted: "#6c8a7e", border: "rgba(67,170,139,0.3)", shadow: "0 8px 30px rgba(46,125,99,0.18)", xColor: "#57C7FF", oColor: "#43AA8B", ok: "#43AA8B" },
  { id: "crystal", name: "Crystal Dunes", bg: "#FFFDF8", surface: "#FFF4DE", sand: "#FFC857", accent: "#8B5CF6", accent2: "#FF5FA2", glow: "rgba(139,92,246,0.3)", card: "#FFF1D6", text: "#3a2a4d", muted: "#8d7fa3", border: "rgba(139,92,246,0.3)", shadow: "0 8px 30px rgba(139,92,246,0.18)", xColor: "#53D8FB", oColor: "#FF944D", ok: "#8B5CF6" },
  { id: "fire", name: "Fire & Sand", bg: "#FFF7D6", surface: "#FFEBB0", sand: "#B9782A", accent: "#F97316", accent2: "#EF4444", glow: "rgba(249,115,22,0.32)", card: "#FFE7A8", text: "#3a1d0a", muted: "#a37c56", border: "rgba(185,120,42,0.35)", shadow: "0 8px 30px rgba(185,120,42,0.2)", xColor: "#EF4444", oColor: "#FACC15", ok: "#F97316" },
  { id: "rainbow", name: "Rainbow Adventure", bg: "#FFFDF7", surface: "#FFF4E8", sand: "#FFD93D", accent: "#4DA3FF", accent2: "#8B5CF6", glow: "rgba(255,105,180,0.3)", card: "#FFF0DE", text: "#2a2036", muted: "#8a7fa0", border: "rgba(139,92,246,0.3)", shadow: "0 8px 30px rgba(255,159,67,0.2)", xColor: "#4DA3FF", oColor: "#FF9F43", ok: "#4CD964" },
  { id: "dice", name: "Magic Dice", bg: "#FFF9EE", surface: "#FFF1D2", sand: "#FFC83D", accent: "#59C6FF", accent2: "#8A5CFF", glow: "rgba(89,198,255,0.32)", card: "#FFF0CE", text: "#2e2a1c", muted: "#948a6e", border: "rgba(138,92,255,0.3)", shadow: "0 8px 30px rgba(138,92,255,0.18)", xColor: "#59C6FF", oColor: "#FFC83D", ok: "#8A5CFF" },
  { id: "ancient", name: "Ancient Desert", bg: "#EFE3C8", surface: "#E6D6AE", sand: "#D9A441", accent: "#46C6D8", accent2: "#C65D3B", glow: "rgba(70,198,216,0.3)", card: "#E8DAB4", text: "#3a2e18", muted: "#8c7c56", border: "rgba(156,122,77,0.35)", shadow: "0 8px 30px rgba(156,122,77,0.2)", xColor: "#46C6D8", oColor: "#EFC75E", ok: "#46C6D8" },
  { id: "neon", name: "Neon Oasis", bg: "#6ED8FF", surface: "#FFFDF7", sand: "#F8C75D", accent: "#9B5BFF", accent2: "#FF5DA8", glow: "rgba(155,91,255,0.35)", card: "#FFFDF7", text: "#1c2a3a", muted: "#5c7a94", border: "rgba(155,91,255,0.3)", shadow: "0 8px 30px rgba(58,213,255,0.25)", xColor: "#3AD5FF", oColor: "#FF8C3A", ok: "#79F24D" },
];

function winLen(n: number) { return n === 3 ? 3 : 4; }
function computeWinLines(n: number, w: number) {
  const lines: number[][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c <= n - w; c++) { const l: number[] = []; for (let k = 0; k < w; k++) l.push(r * n + c + k); lines.push(l); }
  for (let c = 0; c < n; c++) for (let r = 0; r <= n - w; r++) { const l: number[] = []; for (let k = 0; k < w; k++) l.push((r + k) * n + c); lines.push(l); }
  for (let r = 0; r <= n - w; r++) for (let c = 0; c <= n - w; c++) { const l: number[] = []; for (let k = 0; k < w; k++) l.push((r + k) * n + (c + k)); lines.push(l); }
  for (let r = 0; r <= n - w; r++) for (let c = w - 1; c < n; c++) { const l: number[] = []; for (let k = 0; k < w; k++) l.push((r + k) * n + (c - k)); lines.push(l); }
  return lines;
}

type Screen = "welcome" | "setup" | "menu" | "difficulty" | "game" | "howtoplay";
interface Props { onComplete: (score: number, accuracy: number) => void; }

export default function TicTacRoll({ onComplete }: Props) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [profile, setProfile] = useState({ name: "Player", avatar: "🎮", theme: "kalahari" as string });
  const [burst, setBurst] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const burstId = useRef(0);
  const [gridSize, setGridSize] = useState(3);
  const [gameMode, setGameMode] = useState<"classic" | "roll" | "ai">("classic");
  const [aiDiff, setAiDiff] = useState("easy");
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O">("X");
  const [soundOn, setSoundOn] = useState(true);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [gameActive, setGameActive] = useState(false);
  const [phase, setPhase] = useState<"play" | "roll" | "over">("play");
  const [rollVal, setRollVal] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [canConvert, setCanConvert] = useState(false);
  const [extraTurn, setExtraTurn] = useState(false);
  const [skipNext, setSkipNext] = useState({ X: 0, O: 0 });
  const [lastMove, setLastMove] = useState<string>("");
  const [status, setStatus] = useState({ main: "Your turn", hint: "Choose any empty tile" });
  const [showPause, setShowPause] = useState(false);
  const [wonLine, setWonLine] = useState<number[] | null>(null);
  const [htpTab, setHtpTab] = useState("classic");
  const rollTimer = useRef<number | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  const theme = THEMES.find(t => t.id === profile.theme) || THEMES[0];
  const X_COLOR = theme.xColor;
  const O_COLOR = theme.oColor;
  const winLines = computeWinLines(gridSize, winLen(gridSize));
  const totalCells = gridSize * gridSize;

  function getCtx() {
    if (!soundOn) return null;
    if (!audioCtx.current) { try { audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; } }
    if (audioCtx.current.state === "suspended") audioCtx.current.resume().catch(() => {});
    return audioCtx.current;
  }
  function tone(f: number, dur = 0.12, vol = 0.08, type: OscillatorType = "sine") {
    const ctx = getCtx(); if (!ctx) return;
    const t0 = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.start(t0); o.stop(t0 + dur);
  }
  const snd = { move: () => tone(700, 0.08, 0.08), win: () => { tone(620, 0.12, 0.12); setTimeout(() => tone(840, 0.2, 0.15), 120); }, draw: () => tone(380, 0.4, 0.08), reset: () => { tone(540, 0.07, 0.07); setTimeout(() => tone(480, 0.06, 0.06), 80); }, start: () => tone(860, 0.04, 0.06), stop: () => tone(640, 0.06, 0.07), skip: () => tone(320, 0.3, 0.08) };

  const getName = (p: string) => gameMode === "ai" && p === (playerSymbol === "X" ? "O" : "X") ? "AI" : (gameMode === "ai" ? profile.name : p);

  function buildBoard() {
    const newBoard: (string | null)[] = Array(totalCells).fill(null);
    setBoard(newBoard);
    setWonLine(null);
  }
  function resetGame() {
    if (rollTimer.current) { clearInterval(rollTimer.current); rollTimer.current = null; }
    setRolling(false);
    const b = Array(totalCells).fill(null);
    setBoard(b);
    setCurrentPlayer("X");
    setGameActive(true);
    setSkipNext({ X: 0, O: 0 });
    setCanConvert(false);
    setExtraTurn(false);
    setRollVal(1);
    setLastMove("");
    setWonLine(null);
    if (gameMode === "roll") { setPhase("roll"); setStatus({ main: "Player X's turn", hint: "Roll the dice to begin" }); }
    else if (gameMode === "ai") { setPhase("play"); setStatus({ main: profile.name + "'s turn", hint: "Choose a tile" }); }
    else { setPhase("play"); setStatus({ main: "Player X's turn", hint: "Choose any empty tile" }); }
    snd.reset();
  }

  function spawnBurst(idx: number, player: "X" | "O") {
    const col = gridSize;
    const cx = ((idx % col) + 0.5) / col * 100;
    const cy = (Math.floor(idx / col) + 0.5) / col * 100;
    const color = player === "X" ? theme.xColor : theme.oColor;
    const id = burstId.current++;
    setBurst(b => [...b, { id, x: cx, y: cy, color }]);
    setTimeout(() => setBurst(b => b.filter(p => p.id !== id)), 700);
  }

  function placeMove(idx: number, player: "X" | "O") {
    const newBoard = [...board];
    newBoard[idx] = player;
    setBoard(newBoard);
    setLastMove(`Player ${player} placed tile ${idx + 1}`);
    spawnBurst(idx, player);
    snd.move();
    const wl = getWinner(newBoard);
    if (wl) { setWonLine(wl); setGameActive(false); setPhase("over"); endGame("win", wl); return; }
    if (newBoard.every(v => v !== null)) { setGameActive(false); setPhase("over"); endGame("draw", null); return; }
    if (extraTurn) { setExtraTurn(false); setStatus({ main: `${getName(player)} earned another turn!`, hint: "Roll again" }); return; }
    nextTurn(player);
  }

  function nextTurn(from?: "X" | "O") {
    const prev = from || currentPlayer;
    const next = prev === "X" ? "O" : "X";
    setCurrentPlayer(next);
    if (skipNext[next] > 0) {
      const newSkip = { ...skipNext }; newSkip[next]--; setSkipNext(newSkip);
      setStatus({ main: `Player ${next} loses this turn`, hint: "Skipped by a roll of 2" });
      snd.skip();
      setTimeout(() => { if (gameActive && !showPause) nextTurn(next); }, 900);
      return;
    }
    if (gameMode === "roll") {
      setPhase("roll"); setRollVal(1); setCanConvert(false); setExtraTurn(false);
      setStatus({ main: `Player ${next}'s turn`, hint: "Roll the dice" });
    } else {
      setPhase("play");
      if (gameMode === "ai" && next === (playerSymbol === "X" ? "O" : "X")) {
        setStatus({ main: "AI is thinking...", hint: "" });
        setTimeout(() => { if (gameActive && !showPause) doAiMove(); }, 600);
      } else {
        setStatus({ main: `${getName(next)}'s turn`, hint: "Choose a tile" });
      }
    }
  }

  function handleCellClick(idx: number) {
    if (!gameActive || phase === "over" || phase === "roll") return;
    if (showPause) return;
    if (gameMode === "ai" && currentPlayer === (playerSymbol === "X" ? "O" : "X")) return;
    if (board[idx] !== null) return;
    if (gameMode === "roll" && canConvert) {
      if (board[idx] !== (currentPlayer === "X" ? "O" : "X")) return;
      setCanConvert(false);
      placeMove(idx, currentPlayer);
      return;
    }
    placeMove(idx, currentPlayer);
  }

  function getWinner(b: (string | null)[] = board) {
    for (const line of winLines) {
      const first = b[line[0]];
      if (first && line.every(i => b[i] === first)) return line;
    }
    return null;
  }

  function endGame(result: "win" | "draw", wl: number[] | null) {
    if (result === "win") {
      const newScores = { ...scores }; newScores[currentPlayer]++; setScores(newScores);
      setStatus({ main: `Player ${currentPlayer} wins!`, hint: "Congratulations!" });
      snd.win();
      if (gameMode === "ai") { const sc = currentPlayer === playerSymbol ? 100 : 0; setTimeout(() => onComplete(sc, sc === 100 ? 100 : 0), 600); }
      else { setTimeout(() => onComplete(currentPlayer === "X" ? 50 : 50, 50), 600); }
    } else {
      const newScores = { ...scores }; newScores.draw++; setScores(newScores);
      setStatus({ main: "Draw!", hint: "Press New Game to play again" });
      snd.draw();
      setTimeout(() => onComplete(25, 25), 600);
    }
  }

  function doAiMove() {
    const empty = board.reduce((a, v, i) => v === null ? [...a, i] : a, [] as number[]);
    if (!empty.length) return;
    const aiSym = playerSymbol === "X" ? "O" : "X";
    let move: number;
    if (aiDiff === "easy") {
      if (Math.random() < 0.2) { const b = findWinBlock(aiSym); if (b !== -1) move = b; else move = empty[Math.floor(Math.random() * empty.length)]; }
      else move = empty[Math.floor(Math.random() * empty.length)];
    } else if (aiDiff === "normal") {
      const w = findWinBlock(aiSym); if (w !== -1) move = w;
      else { const b = findWinBlock(playerSymbol); if (b !== -1) move = b; else move = empty[Math.floor(Math.random() * empty.length)]; }
    } else {
      if (gridSize === 3) move = minimax([...board], aiSym, 0).index;
      else {
        const best = heuristicBest(aiSym, playerSymbol);
        move = best;
      }
    }
    placeMove(move, aiSym);
  }

  function findWinBlock(sym: string) {
    const wl = winLen(gridSize);
    for (const line of winLines) {
      const vals = line.map(i => board[i]);
      const sc = vals.filter(v => v === sym).length;
      const nc = vals.filter(v => v === null).length;
      if (sc === wl - 1 && nc === 1) return line[vals.indexOf(null)];
    }
    return -1;
  }

  function minimax(b: (string | null)[], sym: string, depth: number) {
    for (const [a, c0, c1] of winLines as number[][]) { if (b[a] && b[a] === b[c0] && b[a] === b[c1]) return { score: b[a] === sym ? 10 - depth : depth - 10, index: a }; }
    const empty = b.reduce((a, v, i) => v === null ? [...a, i] : a, [] as number[]);
    if (!empty.length) return { score: 0, index: -1 };
    let best: { score: number; index: number } = { score: sym === currentPlayer ? -Infinity : Infinity, index: -1 };
    for (const idx of empty) {
      const nb = [...b]; nb[idx] = sym;
      const res = minimax(nb, sym === "X" ? "O" : "X", depth + 1);
      if (sym === currentPlayer) { if (res.score > best.score) best = { score: res.score, index: idx }; }
      else { if (res.score < best.score) best = { score: res.score, index: idx }; }
    }
    return best;
  }

  function heuristicBest(aiSym: string, plSym: string) {
    const empty = board.reduce((a, v, i) => v === null ? [...a, i] : a, [] as number[]);
    for (const i of empty) { board[i] = aiSym; if (getWinner()) { board[i] = null; return i; } board[i] = null; }
    for (const i of empty) { board[i] = plSym; if (getWinner()) { board[i] = null; return i; } board[i] = null; }
    let best = -1, bestScore = -Infinity;
    for (const i of empty) {
      let score = 0;
      for (const line of winLines) {
        if (!line.includes(i)) continue;
        const vals = line.map(j => board[j]);
        score += Math.pow(10, vals.filter(v => v === aiSym).length) + Math.pow(5, vals.filter(v => v === plSym).length);
      }
      if (score > bestScore) { bestScore = score; best = i; }
    }
    return best !== -1 ? best : empty[Math.floor(Math.random() * empty.length)];
  }

  function startRoll() {
    if (!gameActive || phase !== "roll" || rolling) return;
    setRolling(true); tone(860, 0.04, 0.06);
    rollTimer.current = window.setInterval(() => { setRollVal(Math.floor(Math.random() * 6) + 1); }, 65);
  }
  function stopRoll() {
    if (!rolling) return;
    if (rollTimer.current) { clearInterval(rollTimer.current); rollTimer.current = null; }
    setRolling(false); tone(640, 0.06, 0.07);
    const val = rollVal;
    switch (val) {
      case 1: case 3: case 5:
        setPhase("play"); setStatus({ main: `Player ${currentPlayer} rolled ${val}`, hint: "Place your mark" }); break;
      case 2:
        setSkipNext(prev => ({ ...prev, [currentPlayer === "X" ? "O" : "X"]: prev[currentPlayer === "X" ? "O" : "X"] + 1 }));
        setStatus({ main: `Player ${currentPlayer} rolled 2`, hint: "Opponent skips next turn" });
        snd.skip(); setTimeout(() => { if (gameActive) nextTurn(currentPlayer); }, 900);
        break;
      case 4:
        setCanConvert(true); setPhase("play");
        setStatus({ main: `Player ${currentPlayer} rolled 4`, hint: "Convert an opponent tile" }); break;
      case 6:
        setExtraTurn(true); setPhase("play");
        setStatus({ main: `Player ${currentPlayer} rolled 6`, hint: "Extra turn!" }); break;
    }
  }

  function togglePause() {
    if (!gameActive) return;
    setShowPause(!showPause);
  }

  function launchGame(mode: "classic" | "roll" | "ai", opts?: { difficulty?: string; symbol?: "X" | "O" }) {
    setGameMode(mode);
    if (mode === "ai") { setAiDiff(opts?.difficulty || "easy"); setPlayerSymbol(opts?.symbol || "X"); }
    setScores({ X: 0, O: 0, draw: 0 });
    buildBoard();
    setScreen("game");
    setTimeout(() => { resetGame(); }, 50);
  }

  function startNewGame() {
    if (rollTimer.current) { clearInterval(rollTimer.current); rollTimer.current = null; }
    setRolling(false); setShowPause(false);
    setScores({ X: 0, O: 0, draw: 0 });
    buildBoard();
    setTimeout(() => { resetGame(); }, 50);
  }

  const boardDisplay = board.map((v, i) => {
    const isWin = wonLine ? wonLine.includes(i) : false;
    return { idx: i, val: v, isWin, num: i + 1 };
  });

  const responsiveBoardStyle: React.CSSProperties = {
    position: "relative",
    width: "min(100%, 1000px)",
    margin: "auto",
    aspectRatio: "1 / 1",
    display: "grid",
    gap: "clamp(5px, 1.4vw, 12px)",
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    padding: "clamp(6px, 1.4vw, 12px)",
    borderRadius: "clamp(14px, 2vw, 22px)",
    background: `linear-gradient(160deg, ${theme.accent}, ${theme.accent2 || theme.accent})`,
    boxShadow: `0 0 40px ${theme.glow}, 0 12px 40px rgba(0,0,0,0.18)`,
  };

  const gameLayoutStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: window.innerWidth >= 1000 ? "340px 1fr" : "1fr",
    gap: "clamp(1rem, 2vw, 2rem)",
    width: "clamp(900px, 92vw, 1800px)",
    minHeight: "92vh",
    margin: "0 auto",
    padding: "clamp(1.2rem, 2vw, 2.5rem)",
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", transition: "background 0.4s, color 0.4s" }}>

      {/* WELCOME SCREEN */}
      {screen === "welcome" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(3rem, 8vw, 5rem)", marginBottom: "0.5rem" }}>🎲</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontWeight: 700, margin: "0 0 0.5rem", lineHeight: 1.1 }}>Tic·Tac·<em style={{ color: theme.accent }}>Roll</em></h1>
          <p style={{ color: theme.muted, fontSize: "clamp(0.9rem, 2vw, 1.1rem)", marginBottom: "2rem", letterSpacing: "0.05em" }}>Roll. Claim. Conquer.</p>
          <button onClick={() => { tone(500, 0.08, 0.07); setScreen("setup"); }} style={{ padding: "1rem 3rem", fontSize: "clamp(1rem, 2.5vw, 1.2rem)", fontWeight: 600, borderRadius: 50, border: "none", background: `linear-gradient(160deg, ${theme.accent}, ${theme.accent}dd)`, color: "#fff", cursor: "pointer", boxShadow: `0 4px 15px ${theme.glow}`, marginBottom: "1rem" }}>✦ Play Now</button>
          <br />
          <button onClick={() => { tone(500, 0.08, 0.07); setHtpTab("classic"); setScreen("howtoplay"); }} style={{ padding: "0.8rem 2.5rem", fontSize: "clamp(0.9rem, 2vw, 1rem)", fontWeight: 600, borderRadius: 50, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, cursor: "pointer" }}>◈ How to Play</button>
        </div>
      )}

      {/* SETUP SCREEN */}
      {screen === "setup" && (
        <div style={{ maxWidth: "clamp(400px, 60vw, 700px)", margin: "2rem auto", padding: "clamp(1.5rem, 3vw, 2.5rem)", background: theme.surface, borderRadius: "clamp(16px, 3vw, 24px)", border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          <button onClick={() => { tone(500, 0.08, 0.07); setScreen("welcome"); }} style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: "0.9rem", marginBottom: "1rem" }}>← Back</button>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", margin: "0 0 0.3rem" }}>Create Your Profile</h2>
          <p style={{ color: theme.muted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>Personalise your experience</p>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.muted, display: "block", marginBottom: "0.5rem" }}>Your Name</label>
          <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Enter your name..." maxLength={18} style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, fontSize: "1rem", marginBottom: "1.5rem", outline: "none" }} />
          <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.muted, display: "block", marginBottom: "0.5rem" }}>Choose Avatar</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {AVATARS.map(av => (
              <button key={av} onClick={() => setProfile({ ...profile, avatar: av })} style={{ fontSize: "1.5rem", padding: "0.6rem", borderRadius: 12, border: profile.avatar === av ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`, background: profile.avatar === av ? theme.glow : theme.card, cursor: "pointer", boxShadow: profile.avatar === av ? `0 0 0 3px ${theme.glow}` : "none" }}>{av}</button>
            ))}
          </div>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.muted, display: "block", marginBottom: "0.5rem" }}>Choose Theme</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setProfile({ ...profile, theme: t.id })} style={{ padding: "0.75rem", borderRadius: 12, border: profile.theme === t.id ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`, background: t.card, cursor: "pointer", textAlign: "left", boxShadow: profile.theme === t.id ? `0 0 0 3px ${theme.glow}` : "none" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: t.text }}>{t.name}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: t.bg, border: `1px solid ${t.accent}44` }} />
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: t.surface, border: `1px solid ${t.accent}44` }} />
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { tone(500, 0.08, 0.07); setScreen("menu"); }} style={{ width: "100%", padding: "1rem", fontSize: "1rem", fontWeight: 600, borderRadius: 50, border: "none", background: `linear-gradient(160deg, ${theme.accent}, ${theme.accent}dd)`, color: "#fff", cursor: "pointer", boxShadow: `0 4px 15px ${theme.glow}` }}>Continue →</button>
        </div>
      )}

      {/* MENU SCREEN */}
      {screen === "menu" && (
        <div style={{ maxWidth: "clamp(400px, 60vw, 700px)", margin: "2rem auto", padding: "clamp(1.5rem, 3vw, 2.5rem)", background: theme.surface, borderRadius: "clamp(16px, 3vw, 24px)", border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "2rem" }}>{profile.avatar}</span>
            <div><div style={{ fontWeight: 600 }}>{profile.name}</div><div style={{ fontSize: "0.8rem", color: theme.muted }}>Player</div></div>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", margin: "0 0 1.5rem" }}>Choose Your <em style={{ color: theme.accent }}>Mode</em></h2>
          <div style={{ display: "grid", gridTemplateColumns: window.innerWidth >= 600 ? "repeat(2, 1fr)" : "1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <button onClick={() => { tone(500, 0.08, 0.07); launchGame("classic"); }} style={{ padding: "1.5rem", borderRadius: 16, border: `1px solid ${theme.border}`, background: theme.card, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}><div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>◈</div><div style={{ fontWeight: 600 }}>Classic</div><div style={{ fontSize: "0.8rem", color: theme.muted }}>Standard tic-tac-toe</div></button>
            <button onClick={() => { tone(500, 0.08, 0.07); launchGame("roll"); }} style={{ padding: "1.5rem", borderRadius: 16, border: `1px solid ${theme.border}`, background: theme.card, cursor: "pointer", textAlign: "left" }}><div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚄</div><div style={{ fontWeight: 600 }}>Roll Mode</div><div style={{ fontSize: "0.8rem", color: theme.muted }}>Roll dice — odd plays, even skips</div></button>
            <button onClick={() => { tone(500, 0.08, 0.07); setScreen("difficulty"); }} style={{ padding: "1.5rem", borderRadius: 16, border: `1px solid ${theme.border}`, background: theme.card, cursor: "pointer", textAlign: "left" }}><div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🤖</div><div style={{ fontWeight: 600 }}>vs AI</div><div style={{ fontSize: "0.8rem", color: theme.muted }}>Challenge the computer</div></button>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <button onClick={() => { tone(500, 0.08, 0.07); setScreen("setup"); }} style={{ flex: 1, padding: "0.8rem", borderRadius: 50, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>✎ Edit Profile</button>
            <button onClick={() => { tone(500, 0.08, 0.07); setSoundOn(!soundOn); }} style={{ flex: 1, padding: "0.8rem", borderRadius: 50, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>{soundOn ? "♪ Sound" : "♩ Muted"}</button>
          </div>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.muted, display: "block", marginBottom: "0.5rem" }}>Grid Size</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[3, 5, 6, 7].map(s => (
              <button key={s} onClick={() => setGridSize(s)} style={{ flex: 1, padding: "0.6rem", borderRadius: 12, border: gridSize === s ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`, background: gridSize === s ? theme.glow : theme.card, cursor: "pointer", fontWeight: gridSize === s ? 700 : 400, color: theme.text, fontSize: "clamp(0.8rem, 2vw, 0.9rem)" }}>{s}×{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* DIFFICULTY SCREEN */}
      {screen === "difficulty" && (
        <div style={{ maxWidth: "clamp(400px, 60vw, 700px)", margin: "2rem auto", padding: "clamp(1.5rem, 3vw, 2.5rem)", background: theme.surface, borderRadius: "clamp(16px, 3vw, 24px)", border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          <button onClick={() => { tone(500, 0.08, 0.07); setScreen("menu"); }} style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: "0.9rem", marginBottom: "1rem" }}>← Main Menu</button>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", margin: "0 0 0.3rem" }}>vs AI</h2>
          <p style={{ color: theme.muted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>Select difficulty & your symbol</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {["easy", "normal", "hard"].map(d => (
              <button key={d} onClick={() => setAiDiff(d)} style={{ padding: "1rem", borderRadius: 16, border: aiDiff === d ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`, background: aiDiff === d ? theme.glow : theme.card, cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{d === "easy" ? "🌱" : d === "normal" ? "⚡" : "💀"}</div>
                <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{d}</div>
              </button>
            ))}
          </div>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.muted, display: "block", marginBottom: "0.5rem" }}>Your Symbol</label>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            {(["X", "O"] as const).map(s => (
              <button key={s} onClick={() => setPlayerSymbol(s)} style={{ flex: 1, padding: "1rem", borderRadius: 16, border: playerSymbol === s ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`, background: playerSymbol === s ? theme.glow : theme.card, cursor: "pointer", fontSize: "1.5rem", fontWeight: 700, color: s === "X" ? X_COLOR : O_COLOR, boxShadow: playerSymbol === s ? `0 0 0 3px ${theme.glow}` : "none" }}>{s}</button>
            ))}
          </div>
          <button onClick={() => { tone(500, 0.08, 0.07); launchGame("ai", { difficulty: aiDiff, symbol: playerSymbol }); }} style={{ width: "100%", padding: "1rem", fontSize: "1rem", fontWeight: 600, borderRadius: 50, border: "none", background: `linear-gradient(160deg, ${theme.accent}, ${theme.accent}dd)`, color: "#fff", cursor: "pointer", boxShadow: `0 4px 15px ${theme.glow}` }}>Start Game →</button>
        </div>
      )}

      {/* HOW TO PLAY */}
      {screen === "howtoplay" && (
        <div style={{ maxWidth: "clamp(400px, 60vw, 700px)", margin: "2rem auto", padding: "clamp(1.5rem, 3vw, 2.5rem)", background: theme.surface, borderRadius: "clamp(16px, 3vw, 24px)", border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
          <button onClick={() => { tone(500, 0.08, 0.07); setScreen(screen === "howtoplay" ? "welcome" : "menu"); }} style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: "0.9rem", marginBottom: "1rem" }}>← Back</button>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", margin: "0 0 1rem" }}>How to Play</h2>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {["classic", "roll", "ai", "grid"].map(t => (
              <button key={t} onClick={() => setHtpTab(t)} style={{ flex: 1, padding: "0.5rem", borderRadius: 50, border: htpTab === t ? "none" : `1px solid ${theme.border}`, background: htpTab === t ? theme.accent : theme.card, color: htpTab === t ? "#fff" : theme.text, cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>{t}</button>
            ))}
          </div>
          <div style={{ fontSize: "0.9rem", lineHeight: 1.7, color: theme.muted }}>
            {htpTab === "classic" && <><p>Take turns placing your mark on empty tiles. First player to get the required number in a row — horizontally, vertically, or diagonally — wins the round.</p><p style={{ marginTop: "0.75rem" }}>On 3×3, get 3 in a row. On larger grids, get 4 in a row.</p></>}
            {htpTab === "roll" && <><p>Each turn you roll the dice before placing your mark. The number determines what happens: 1,3,5 = play; 2 = skip opponent; 4 = convert tile; 6 = extra turn.</p></>}
            {htpTab === "ai" && <><p>Play solo against the computer. Easy = mostly random moves. Normal = blocks and seeks openings. Hard = unbeatable on 3×3, strong heuristics on larger grids.</p></>}
            {htpTab === "grid" && <><p>Choose from 3×3 (classic, need 3), 5×5 (medium, need 4), 6×6 (large, need 4), or 7×7 (epic, need 4) in the main menu before starting.</p></>}
          </div>
        </div>
      )}

      {/* GAME SCREEN */}
      {(screen === "game" || screen === "howtoplay") && (
        <div style={gameLayoutStyle}>

          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(0.75rem, 1.5vw, 1.2rem)", alignSelf: "start", position: "sticky", top: "clamp(1rem, 2vw, 2rem)" }}>
            {/* Player X Card */}
            <div style={{ padding: "clamp(1rem, 2vw, 1.5rem)", background: theme.card, borderRadius: "clamp(12px, 2vw, 16px)", border: `1px solid ${theme.border}`, boxShadow: theme.shadow, borderLeft: `4px solid ${currentPlayer === "X" && gameActive ? theme.accent : "transparent"}` }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.3rem" }}>Player X</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>😀</span>
                <span style={{ fontWeight: 600 }}>{getName("X")}</span>
              </div>
              <div style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: X_COLOR, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{scores.X}</div>
              <div style={{ fontSize: "0.7rem", color: theme.muted }}>wins</div>
            </div>
            {/* Player O Card */}
            <div style={{ padding: "clamp(1rem, 2vw, 1.5rem)", background: theme.card, borderRadius: "clamp(12px, 2vw, 16px)", border: `1px solid ${theme.border}`, boxShadow: theme.shadow, borderLeft: `4px solid ${currentPlayer === "O" && gameActive ? theme.accent : "transparent"}` }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.3rem" }}>Player O</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🐺</span>
                <span style={{ fontWeight: 600 }}>{getName("O")}</span>
              </div>
              <div style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: O_COLOR, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{scores.O}</div>
              <div style={{ fontSize: "0.7rem", color: theme.muted }}>wins</div>
            </div>
            {/* Status Card */}
            <div style={{ padding: "clamp(1rem, 2vw, 1.5rem)", background: theme.card, borderRadius: "clamp(12px, 2vw, 16px)", border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.muted, marginBottom: "0.5rem" }}>Status</div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{status.main}</div>
              <div style={{ fontSize: "0.85rem", color: theme.muted }}>{status.hint}</div>
              {lastMove && <div style={{ fontSize: "0.75rem", color: theme.muted, marginTop: "0.5rem", fontStyle: "italic" }}>Last move: {lastMove}</div>}
              {gameMode === "roll" && phase === "roll" && gameActive && (
                <div style={{ marginTop: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div style={{ width: "clamp(40px, 10vw, 56px)", height: "clamp(40px, 10vw, 56px)", background: theme.surface, borderRadius: "clamp(8px, 2vw, 12px)", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(1.2rem, 4vw, 1.8rem)", fontWeight: 700, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)", animation: rolling ? "diceRoll 0.15s linear infinite" : "none" }}>{rollVal}</div>
                    <div><div style={{ fontSize: "0.65rem", color: theme.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Last Roll</div><div style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", fontWeight: 700 }}>{rollVal}</div></div>
                  </div>
                  <button onClick={rolling ? stopRoll : startRoll} disabled={!gameActive || phase !== "roll"} style={{ width: "100%", padding: "0.9rem", borderRadius: 50, border: "none", background: rolling ? `linear-gradient(160deg, #e8a090, #c04030)` : `linear-gradient(160deg, ${theme.accent}, ${theme.accent}dd)`, color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: rolling ? "pointer" : "pointer", boxShadow: "0 3px 0 rgba(0,0,0,0.15)", opacity: (!gameActive || phase !== "roll") ? 0.5 : 1 }}>{rolling ? "■ Stop" : "▶ Start"}</button>
                </div>
              )}
            </div>
            {/* Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button onClick={() => { if (rollTimer.current) clearInterval(rollTimer.current); setRolling(false); setShowPause(false); launchGame(gameMode, gameMode === "ai" ? { difficulty: aiDiff, symbol: playerSymbol } : undefined); }} style={{ padding: "0.75rem", borderRadius: 50, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>New Game</button>
              <button onClick={() => { setScreen("menu"); setShowPause(false); }} style={{ padding: "0.75rem", borderRadius: 50, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>Main Menu</button>
              <button onClick={() => togglePause()} style={{ padding: "0.75rem", borderRadius: 50, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>{showPause ? "▶ Resume" : "⏸ Pause"}</button>
            </div>
          </div>

          {/* MAIN BOARD AREA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(0.75rem, 1.5vw, 1.2rem)" }}>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)", background: theme.card, borderRadius: "clamp(10px, 1.5vw, 14px)", border: `1px solid ${theme.border}`, boxShadow: theme.shadow, flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button onClick={() => { if (rollTimer.current) clearInterval(rollTimer.current); setRolling(false); setShowPause(false); setScreen("menu"); }} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, cursor: "pointer", fontSize: "1rem" }}>⌂</button>
                <button onClick={() => togglePause()} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, cursor: "pointer", fontSize: "1rem" }}>{showPause ? "▶" : "⏸"}</button>
              </div>
              <div style={{ fontWeight: 600, fontSize: "clamp(0.8rem, 2vw, 0.95rem)" }}>{gameMode === "ai" ? `vs AI · ${aiDiff.charAt(0).toUpperCase() + aiDiff.slice(1)}` : gameMode === "roll" ? "Roll Mode" : "Classic Mode"} {gridSize !== 3 ? ` · ${gridSize}×${gridSize}` : ""}</div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button onClick={() => { setHtpTab(gameMode === "roll" ? "roll" : gameMode === "ai" ? "ai" : "classic"); setScreen("howtoplay"); }} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, cursor: "pointer", fontSize: "1rem" }}>?</button>
                <button onClick={() => setSoundOn(!soundOn)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, cursor: "pointer", fontSize: "1rem" }}>{soundOn ? "♪" : "♩"}</button>
                <button onClick={() => startNewGame()} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, cursor: "pointer", fontSize: "1rem" }}>↺</button>
              </div>
            </div>

            {/* Board */}
            <div style={responsiveBoardStyle}>
              {boardDisplay.map(cell => (
                <button key={cell.idx} onClick={() => handleCellClick(cell.idx)} disabled={!gameActive || cell.val !== null} style={{
                  position: "relative",
                  borderRadius: "clamp(8px, 1.5vw, 14px)",
                  border: cell.isWin ? `2px solid ${theme.accent}` : `1px solid rgba(0,0,0,0.12)`,
                  background: `linear-gradient(155deg, ${theme.sand}, ${theme.sand}cc)`,
                  cursor: (!gameActive || cell.val !== null) ? "default" : "pointer",
                  boxShadow: cell.isWin
                    ? `0 0 0 3px ${theme.glow}, inset 0 2px 6px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.15)`
                    : `inset 0 2px 6px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.15)`,
                  transition: "all 0.15s",
                  animation: cell.isWin ? "winPulse 1.2s ease-in-out infinite" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {cell.val === "X" && (
                    <span style={{
                      position: "relative",
                      width: "clamp(1.4rem, 5vw, 2.6rem)",
                      height: "clamp(1.4rem, 5vw, 2.6rem)",
                      display: "inline-block",
                      animation: "pieceIn 0.25s ease-out",
                    }}>
                      <span style={{ position: "absolute", inset: 0, background: X_COLOR, clipPath: "polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%)", boxShadow: `0 0 12px ${X_COLOR}, 0 0 24px ${X_COLOR}88`, filter: "brightness(1.15)" }} />
                    </span>
                  )}
                  {cell.val === "O" && (
                    <span style={{
                      width: "clamp(1.3rem, 4.6vw, 2.4rem)",
                      height: "clamp(1.3rem, 4.6vw, 2.4rem)",
                      borderRadius: "50%",
                      display: "inline-block",
                      border: `clamp(4px, 1vw, 7px) solid ${O_COLOR}`,
                      background: `radial-gradient(circle, ${O_COLOR}22 40%, transparent 70%)`,
                      boxShadow: `0 0 14px ${O_COLOR}, 0 0 26px ${O_COLOR}77`,
                      animation: "pieceIn 0.25s ease-out",
                    }} />
                  )}
                  {!cell.val && <span style={{ opacity: 0.35, fontSize: "clamp(0.55rem, 2vw, 0.85rem)", color: theme.text }}>{cell.num}</span>}
                </button>
              ))}

              {/* Magical dust burst on move */}
              {burst.map(p => (
                <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: 0, height: 0, pointerEvents: "none", zIndex: 5 }}>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const ang = (i / 8) * Math.PI * 2;
                    const dist = 34;
                    return (
                      <span key={i} style={{
                        position: "absolute",
                        left: 0, top: 0,
                        width: 6, height: 6,
                        borderRadius: "50%",
                        background: p.color,
                        boxShadow: `0 0 8px ${p.color}`,
                        transform: `translate(-50%,-50%)`,
                        animation: `dustFly 0.6s ease-out forwards`,
                        // @ts-ignore custom props read by keyframes via CSS vars
                        ["--dx" as any]: `${Math.cos(ang) * dist}px`,
                        ["--dy" as any]: `${Math.sin(ang) * dist}px`,
                      }} />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {showPause && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ padding: "2rem", background: theme.surface, borderRadius: "clamp(16px, 3vw, 24px)", border: `1px solid ${theme.border}`, textAlign: "center", boxShadow: theme.shadow, minWidth: "280px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "0.5rem" }}>Paused</div>
            <div style={{ color: theme.muted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>Take a breather</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button onClick={() => togglePause()} style={{ padding: "0.9rem", borderRadius: 50, border: "none", background: `linear-gradient(160deg, ${theme.accent}, ${theme.accent}dd)`, color: "#fff", fontWeight: 600, cursor: "pointer" }}>▶ Resume</button>
              <button onClick={() => { setShowPause(false); setScreen("howtoplay"); }} style={{ padding: "0.9rem", borderRadius: 50, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, fontWeight: 600, cursor: "pointer" }}>◈ How to Play</button>
              <button onClick={() => { setShowPause(false); setScreen("menu"); }} style={{ padding: "0.9rem", borderRadius: 50, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, fontWeight: 600, cursor: "pointer" }}>⌂ Main Menu</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes winPulse { 0%,100% { box-shadow: 0 0 0 3px ${theme.glow}, inset 0 2px 4px rgba(0,0,0,0.05); } 50% { box-shadow: 0 0 0 8px ${theme.glow.replace("0.15","0.08")}, 0 0 20px ${theme.glow}; } }
        @keyframes diceRoll { 0% { transform: rotate(0deg) scale(1); } 25% { transform: rotate(6deg) scale(1.04); } 75% { transform: rotate(-6deg) scale(1.04); } 100% { transform: rotate(0deg) scale(1); } }
        @keyframes pieceIn { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes dustFly { 0% { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(-50%,-50%) translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; } }
      `}</style>
    </div>
  );
}
FILE_EOF

echo "TicTacRoll.tsx updated with the 10 desert/magic themes, crystal X / ring O pieces, and dust-burst effects."
