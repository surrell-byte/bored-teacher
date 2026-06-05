import { useState, useEffect, useCallback, useRef } from "react";

const COLOURS = [
  { id:"red",    label:"RED",    bg:"linear-gradient(135deg,#ef4444,#b91c1c)", sound:261 },
  { id:"blue",   label:"BLUE",   bg:"linear-gradient(135deg,#3b82f6,#1d4ed8)", sound:329 },
  { id:"green",  label:"GREEN",  bg:"linear-gradient(135deg,#22c55e,#15803d)", sound:392 },
  { id:"yellow", label:"YELLOW", bg:"linear-gradient(135deg,#fbbf24,#d97706)", sound:523 },
  { id:"purple", label:"PURPLE", bg:"linear-gradient(135deg,#a855f7,#7c3aed)", sound:440 },
  { id:"orange", label:"ORANGE", bg:"linear-gradient(135deg,#f97316,#c2410c)", sound:349 },
];

function playBeep(freq, duration = 0.2) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), 600);
  } catch(e) {}
}

const MODES = [
  { id:"classic", label:"🎮 Classic", desc:"4 colours, 3 lives" },
  { id:"hard",    label:"💀 Hard",    desc:"6 colours, 1 life" },
  { id:"speed",   label:"⚡ Speed",   desc:"Fast sequences" },
];

export default function ColourClash() {
  const [screen, setScreen] = useState("menu");
  const [mode, setMode] = useState("classic");
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle|showing|input|correct|wrong|gameover
  const [lit, setLit] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const colours = mode === "hard" ? COLOURS : COLOURS.slice(0, 4);
  const startLives = mode === "hard" ? 1 : 3;

  const showSequence = useCallback((seq) => {
    setPhase("showing");
    const speed = mode === "speed" ? 400 : 600;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(interval);
        setLit(null);
        setTimeout(() => setPhase("input"), 300);
        return;
      }
      const c = seq[i];
      setLit(c);
      const col = colours.find(x => x.id === c);
      if (col) playBeep(col.sound, 0.2);
      setTimeout(() => setLit(null), speed * 0.6);
      i++;
    }, speed);
  }, [mode, colours]);

  const startGame = useCallback(() => {
    const first = colours[Math.floor(Math.random() * colours.length)].id;
    const seq = [first];
    setSequence(seq);
    setPlayerSeq([]);
    setScore(0);
    setLives(startLives);
    setRound(1);
    showSequence(seq);
    setScreen("game");
  }, [colours, startLives, showSequence]);

  const tap = (id) => {
    if (phase !== "input") return;
    const col = colours.find(c => c.id === id);
    if (col) playBeep(col.sound, 0.15);
    setLit(id);
    setTimeout(() => setLit(null), 150);

    const nextPlayer = [...playerSeq, id];
    setPlayerSeq(nextPlayer);
    const pos = nextPlayer.length - 1;

    if (nextPlayer[pos] !== sequence[pos]) {
      // Wrong
      playBeep(150, 0.5);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setPhase("gameover");
      } else {
        setPhase("wrong");
        setTimeout(() => {
          setPlayerSeq([]);
          showSequence(sequence);
        }, 1000);
      }
      return;
    }

    if (nextPlayer.length === sequence.length) {
      // Correct full sequence
      playBeep(800, 0.1);
      setTimeout(() => playBeep(1000, 0.1), 120);
      setScore(s => s + sequence.length * 10);
      setPhase("correct");
      setTimeout(() => {
        const next = [...sequence, colours[Math.floor(Math.random() * colours.length)].id];
        setSequence(next);
        setPlayerSeq([]);
        setRound(r => r + 1);
        showSequence(next);
      }, 800);
    }
  };

  if (screen === "menu") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f172a,#1e1b4b)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🎨</div>
      <h1 style={{ fontSize:"2.5rem", margin:"0 0 4px", letterSpacing:3, background:"linear-gradient(90deg,#ef4444,#3b82f6,#22c55e,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>COLOUR CLASH</h1>
      <p style={{ color:"#94a3b8", marginBottom:32 }}>Simon says... can you remember?</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:24 }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            padding:"14px 24px", borderRadius:16, border:"2px solid", cursor:"pointer",
            borderColor: mode===m.id?"#6366f1":"rgba(255,255,255,0.1)",
            background: mode===m.id?"#312e81":"rgba(255,255,255,0.05)",
            color:"#fff", fontWeight:700, minWidth:140,
          }}>
            <div>{m.label}</div>
            <div style={{ fontSize:"0.75rem", opacity:0.7, marginTop:3 }}>{m.desc}</div>
          </button>
        ))}
      </div>
      <button onClick={startGame} style={{
        padding:"18px 48px", borderRadius:999, border:"none",
        background:"linear-gradient(135deg,#6366f1,#4f46e5)",
        color:"#fff", fontWeight:800, fontSize:"1.2rem", cursor:"pointer",
        boxShadow:"0 4px 20px #6366f155",
      }}>🎮 Play</button>
    </div>
  );

  if (phase === "gameover") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f172a,#1e1b4b)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>💥</div>
      <h2 style={{ fontSize:"2rem", color:"#f87171", marginBottom:8 }}>Game Over!</h2>
      <p style={{ color:"#94a3b8", marginBottom:8 }}>Round {round} · Score {score}</p>
      <p style={{ color:"#64748b", marginBottom:24, fontSize:"0.9rem" }}>
        Sequence length: {sequence.length}
      </p>
      <div style={{ display:"flex", gap:12 }}>
        <button onClick={startGame} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#6366f1", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Try Again</button>
        <button onClick={() => setScreen("menu")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f172a,#1e1b4b)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", width:"100%", maxWidth:400, marginBottom:16 }}>
        <span style={{ color:"#94a3b8" }}>Round {round}</span>
        <span style={{ color:"#fbbf24", fontWeight:800 }}>⭐ {score}</span>
        <span>{Array.from({length:startLives},(_,i)=>i<lives?"❤️":"🖤").join("")}</span>
      </div>

      <div style={{ marginBottom:12, fontWeight:700, minHeight:32, fontSize:"1rem", textAlign:"center",
        color: phase==="showing"?"#fbbf24":phase==="correct"?"#4ade80":phase==="wrong"?"#f87171":"#94a3b8"
      }}>
        {phase==="showing"?"👀 Watch carefully..."
        :phase==="input"?"👆 Your turn! Repeat the sequence"
        :phase==="correct"?"✅ Correct!"
        :phase==="wrong"?"❌ Wrong!"
        :""}
      </div>

      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr",
        gap:12, maxWidth:360, width:"100%",
      }}>
        {colours.map(col => (
          <button key={col.id} onClick={() => tap(col.id)} style={{
            height:100, borderRadius:20, border:"none", cursor: phase==="input"?"pointer":"default",
            background: lit===col.id ? "white" : col.bg,
            boxShadow: lit===col.id ? `0 0 40px white, 0 0 80px ${col.id==="yellow"?"#fbbf24":col.id}` : "0 4px 16px rgba(0,0,0,0.4)",
            transition:"all 0.1s ease",
            transform: lit===col.id ? "scale(1.05)" : "scale(1)",
            fontWeight:800, fontSize:"1rem", color:"rgba(255,255,255,0.9)",
            letterSpacing:2,
          }}>
            {col.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop:16, display:"flex", gap:6 }}>
        {sequence.map((_, i) => (
          <div key={i} style={{
            width:10, height:10, borderRadius:"50%",
            background: i < playerSeq.length ? "#4ade80" : "rgba(255,255,255,0.2)",
          }} />
        ))}
      </div>
    </div>
  );
}
