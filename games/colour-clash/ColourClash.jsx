import { useState, useEffect, useCallback, useRef } from "react";
import { useGame } from "@/lib/gameState";
import { playBeep } from "@/lib/sound/beep";

const COLOURS = [
  { id:"red",    label:"RED",    bg:"linear-gradient(135deg,#ef4444,#b91c1c)", sound:261 },
  { id:"blue",   label:"BLUE",   bg:"linear-gradient(135deg,#3b82f6,#1d4ed8)", sound:329 },
  { id:"green",  label:"GREEN",  bg:"linear-gradient(135deg,#22c55e,#15803d)", sound:392 },
  { id:"yellow", label:"YELLOW", bg:"linear-gradient(135deg,#fbbf24,#d97706)", sound:523 },
  { id:"purple", label:"PURPLE", bg:"linear-gradient(135deg,#a855f7,#7c3aed)", sound:440 },
  { id:"orange", label:"ORANGE", bg:"linear-gradient(135deg,#f97316,#c2410c)", sound:349 },
];

const MEMORY_MODES = [
  { id:"classic", label:"🎮 Classic", desc:"4 colours, 3 lives" },
  { id:"hard", label:"💀 Hard", desc:"6 colours, 1 life" },
  { id:"speed", label:"⚡ Speed", desc:"Fast sequences" },
];

const GAME_OPTIONS = [
  { id:"clash", label:"🎨 Colour Clash", desc:"Main game" },
  { id:"memory", label:"🧠 Memory Pattern", desc:"Classic reminder mode" },
];

export default function ColourClash({ onComplete, onHudUpdate }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("menu");
  const [gameType, setGameType] = useState("clash");
  const [memoryMode, setMemoryMode] = useState("classic");
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle|showing|input|correct|wrong|gameover
  const [lit, setLit] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const sequenceIntervalRef = useRef(null);
  const timersRef = useRef([]);

  const scheduleTimeout = useCallback((callback, delay) => {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(activeTimer => activeTimer !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const clearGameTimers = useCallback(() => {
    window.clearInterval(sequenceIntervalRef.current);
    sequenceIntervalRef.current = null;
    timersRef.current.forEach(timer => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const activeColours = gameType === "memory" ? (memoryMode === "hard" ? COLOURS : COLOURS.slice(0, 4)) : COLOURS;
  const startLives = gameType === "memory" ? (memoryMode === "hard" ? 1 : 3) : 3;

  const showSequence = useCallback((seq) => {
    setPhase("showing");
    const speed = gameType === "memory" && memoryMode === "speed" ? 400 : 600;
    let i = 0;
    const interval = window.setInterval(() => {
      if (i >= seq.length) {
        window.clearInterval(interval);
        sequenceIntervalRef.current = null;
        setLit(null);
        scheduleTimeout(() => setPhase("input"), 300);
        return;
      }
      const c = seq[i];
      setLit(c);
      const col = activeColours.find(x => x.id === c);
      if (col) playBeep(col.sound, 0.2);
      scheduleTimeout(() => setLit(null), speed * 0.6);
      i += 1;
    }, speed);
    sequenceIntervalRef.current = interval;
  }, [activeColours, gameType, memoryMode, scheduleTimeout]);

  useEffect(() => {
    const returnToMenu = () => {
      clearGameTimers();
      setScreen("menu");
      setPhase("idle");
      setLit(null);
      setPlayerSeq([]);
    };
    window.addEventListener("colour-clash:main-menu", returnToMenu);
    return () => window.removeEventListener("colour-clash:main-menu", returnToMenu);
  }, [clearGameTimers]);

  useEffect(() => {
    const sequenceLength = Math.max(sequence.length, 1);
    const sequenceProgress = phase === "showing" ? 0 : Math.min(playerSeq.length, sequenceLength);

    onHudUpdate?.(screen === "game" ? {
      round,
      score,
      lives,
      totalLives: startLives,
      phase,
      sequenceLength,
      sequenceProgress,
    } : null);
  }, [lives, onHudUpdate, phase, playerSeq.length, round, score, screen, sequence.length, startLives]);

  const startGame = useCallback(() => {
    clearGameTimers();
    const first = activeColours[Math.floor(Math.random() * activeColours.length)].id;
    const seq = [first];
    setSequence(seq);
    setPlayerSeq([]);
    setScore(0);
    setLives(startLives);
    setRound(1);
    setCorrectCount(0);
    setTotalQuestions(0);
    setScreen("game");
    showSequence(seq);
  }, [activeColours, clearGameTimers, showSequence, startLives]);

  const tap = (id) => {
    if (phase !== "input") return;
    const col = activeColours.find(c => c.id === id);
    if (col) playBeep(col.sound, 0.15);
    setLit(id);
    scheduleTimeout(() => setLit(null), 150);

    setTotalQuestions(q => q + 1);
    const nextPlayer = [...playerSeq, id];
    setPlayerSeq(nextPlayer);
    const pos = nextPlayer.length - 1;

    if (nextPlayer[pos] !== sequence[pos]) {
      playBeep(150, 0.5);
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setCorrectCount(currentCorrect => {
          setTotalQuestions(currentTotal => {
            const accuracy = currentTotal > 0 ? Math.round((currentCorrect / currentTotal) * 100) : 0;
            completeGame('colour-clash', accuracy, currentTotal);
            onComplete?.(accuracy, currentTotal);
            return currentTotal;
          });
          return currentCorrect;
        });
        setPhase("gameover");
        return;
      }

      setPhase("wrong");
      scheduleTimeout(() => {
        setPlayerSeq([]);
        showSequence(sequence);
      }, 1000);
      return;
    }

    setCorrectCount(c => c + 1);
    if (nextPlayer.length === sequence.length) {
      playBeep(800, 0.1);
      scheduleTimeout(() => playBeep(1000, 0.1), 120);
      setScore(s => s + sequence.length * 10);
      setPhase("correct");
      scheduleTimeout(() => {
        const next = [...sequence, activeColours[Math.floor(Math.random() * activeColours.length)].id];
        setSequence(next);
        setPlayerSeq([]);
        setRound(r => r + 1);
        showSequence(next);
      }, 800);
    }
  };

  useEffect(() => () => clearGameTimers(), [clearGameTimers]);

  if (screen === "menu") {
    return (
      <div style={{
        minHeight:"100vh",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        background:"radial-gradient(circle at top, #1e293b 0%, #0f172a 42%, #020817 100%)",
        fontFamily:"'Segoe UI',sans-serif",
        color:"#fff",
        padding:24,
        textAlign:"center",
      }}>
        <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🎨</div>
        <h1 style={{
          fontSize:"clamp(2.4rem, 5vw, 4rem)",
          margin:"0 0 4px",
          letterSpacing:3,
          background:"linear-gradient(90deg,#ef4444,#3b82f6,#22c55e,#fbbf24)",
          WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent",
        }}>COLOUR CLASH</h1>
        <p style={{ color:"#cbd5e1", marginBottom:30, fontSize:"1rem" }}>
          Match the pattern, keep the streak alive, and pick your challenge.
        </p>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:18 }}>
          {GAME_OPTIONS.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setGameType(option.id)}
              style={{
                padding:"16px 22px",
                borderRadius:18,
                border:`2px solid ${gameType === option.id ? '#a78bfa' : 'rgba(255,255,255,0.12)'}`,
                background: gameType === option.id ? "rgba(124, 58, 237, 0.28)" : "rgba(15,23,42,0.55)",
                color:"#f8fafc",
                fontWeight:800,
                minWidth:180,
                cursor:"pointer",
                boxShadow: gameType === option.id ? "0 10px 25px rgba(167,139,250,0.35)" : "none",
              }}
            >
              <div>{option.label}</div>
              <div style={{ fontSize:"0.72rem", opacity:0.75, marginTop:4 }}>{option.desc}</div>
            </button>
          ))}
        </div>

        {gameType === "memory" && (
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:24 }}>
            {MEMORY_MODES.map(mode => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setMemoryMode(mode.id)}
                style={{
                  padding:"14px 18px",
                  borderRadius:14,
                  border:`2px solid ${memoryMode === mode.id ? '#22d3ee' : 'rgba(255,255,255,0.12)'}`,
                  background: memoryMode === mode.id ? "rgba(34,211,238,0.16)" : "rgba(15,23,42,0.45)",
                  color:"#fff",
                  fontWeight:700,
                  minWidth:150,
                  cursor:"pointer",
                }}
              >
                <div>{mode.label}</div>
                <div style={{ fontSize:"0.7rem", opacity:0.7, marginTop:4 }}>{mode.desc}</div>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={startGame}
          style={{
            padding:"18px 52px",
            borderRadius:999,
            border:"none",
            background:"linear-gradient(135deg,#8b5cf6,#6366f1)",
            color:"#fff",
            fontWeight:800,
            fontSize:"1.2rem",
            cursor:"pointer",
            boxShadow:"0 10px 30px rgba(99,102,241,0.4)",
          }}
        >
          {gameType === "memory" ? "🧠 Start memory run" : "🎮 Start Colour Clash"}
        </button>
      </div>
    );
  }

  if (phase === "gameover") {
    return (
      <div style={{
        minHeight:"100vh",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        background:"radial-gradient(circle at top, #1e293b 0%, #0f172a 42%, #020817 100%)",
        fontFamily:"'Segoe UI',sans-serif",
        color:"#fff",
        padding:24,
        textAlign:"center",
      }}>
        <div style={{ fontSize:"4rem", marginBottom:12 }}>💥</div>
        <h2 style={{ fontSize:"2rem", color:"#f87171", marginBottom:8 }}>Game Over!</h2>
        <p style={{ color:"#cbd5e1", marginBottom:8 }}>Round {round} · Score {score}</p>
        <p style={{ color:"#94a3b8", marginBottom:24, fontSize:"0.9rem" }}>
          Sequence length: {sequence.length}
        </p>
        <div style={{ display:"flex", gap:12 }}>
          <button type="button" onClick={startGame} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#8b5cf6", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Try Again</button>
          <button type="button" onClick={() => setScreen("menu")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height:"100%",
      minHeight:0,
      boxSizing:"border-box",
      display:"flex",
      flexDirection:"column",
      alignItems:"center",
      justifyContent:"center",
      background:"radial-gradient(circle at top, #1e293b 0%, #0f172a 42%, #020817 100%)",
      fontFamily:"'Segoe UI',sans-serif",
      color:"#fff",
      padding:"clamp(12px, 2.2vh, 28px) clamp(16px, 3vw, 48px)",
    }}>
      <div style={{ width:"100%", maxWidth:900, display:"grid", gap:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", padding:"12px 16px", borderRadius:16, background:"rgba(15,23,42,0.5)", border:"1px solid rgba(148,163,184,0.2)" }}>
          <span style={{ fontWeight:800, letterSpacing:1.2 }}>MODE {gameType === "memory" ? "MEMORY" : "CLASH"}</span>
          <span style={{ fontWeight:700, color:"#a5f3fc" }}>Sequence {Math.min(playerSeq.length, sequence.length)}/{Math.max(sequence.length, 1)}</span>
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns: activeColours.length <= 4 ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
          gap:"clamp(10px, 2vw, 20px)",
          width:"100%",
        }}>
          {activeColours.map(col => (
            <button
              key={col.id}
              type="button"
              onClick={() => tap(col.id)}
              style={{
                height:"clamp(110px, 18vw, 220px)",
                borderRadius:"clamp(16px, 2vw, 28px)",
                border:"none",
                cursor: phase === "input" ? "pointer" : "default",
                background: lit === col.id ? "#fff" : col.bg,
                boxShadow: lit === col.id ? `0 0 30px rgba(255,255,255,0.75), 0 0 80px ${col.id === "yellow" ? "#fbbf24" : col.id}` : "0 8px 22px rgba(15,23,42,0.4)",
                transition:"all 0.12s ease",
                transform: lit === col.id ? "scale(1.03)" : "scale(1)",
                fontWeight:800,
                fontSize:"clamp(1rem, 2vw, 1.8rem)",
                color:"rgba(255,255,255,0.94)",
                letterSpacing:2,
              }}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
