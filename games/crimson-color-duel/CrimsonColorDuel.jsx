import { useState, useCallback, useEffect } from "react";
import { useGame } from "@/lib/gameState";

const COLOR_ITEMS = [
  { emoji:"🐄", name:"Cow",         color:"black and white" },
  { emoji:"🐖", name:"Pig",         color:"pink" },
  { emoji:"🐑", name:"Sheep",       color:"white" },
  { emoji:"🐓", name:"Chicken",     color:"white" },
  { emoji:"🐎", name:"Horse",       color:"brown" },
  { emoji:"🦆", name:"Duck",        color:"yellow" },
  { emoji:"🍎", name:"Apple",       color:"red" },
  { emoji:"🍌", name:"Banana",      color:"yellow" },
  { emoji:"🍊", name:"Orange",      color:"orange" },
  { emoji:"🍇", name:"Grapes",      color:"purple" },
  { emoji:"🥦", name:"Broccoli",    color:"green" },
  { emoji:"🍒", name:"Cherry",      color:"red" },
  { emoji:"🍉", name:"Watermelon",  color:"green" },
  { emoji:"🐐", name:"Goat",        color:"brown" },
  { emoji:"🫐", name:"Blueberries", color:"blue" },
  { emoji:"🍏", name:"Green Apple", color:"green" },
  { emoji:"🐙", name:"Octopus",     color:"red" },
  { emoji:"🥕", name:"Carrot",      color:"orange" },
  { emoji:"🍆", name:"Eggplant",    color:"purple" },
  { emoji:"🌶️", name:"Hot Pepper",  color:"red" },
  { emoji:"🐪", name:"Camel",       color:"brown" },
];

const ALL_COLORS = [...new Set(COLOR_ITEMS.map(i => i.color))];

const LEVELS = [
  { id:1, name:"Barn Basics",    tag:"BEGINNER", time:10, itemNames:["Cow","Pig","Sheep","Chicken","Duck","Horse"] },
  { id:2, name:"Tricky Orchard", tag:"ADVANCED", time:8,  itemNames:["Green Apple","Octopus","Carrot","Eggplant","Grapes","Camel"] },
  { id:3, name:"Chroma Finals",  tag:"MASTER",   time:6,  itemNames:["Broccoli","Hot Pepper","Cherry","Watermelon","Blueberries","Banana"] },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function getOptions(correctColor) {
  const distractors = shuffle(ALL_COLORS.filter(c => c !== correctColor)).slice(0, 3);
  return shuffle([correctColor, ...distractors]);
}

const COLOR_BG = {
  "red":"#fef2f2","blue":"#eff6ff","green":"#f0fdf4","yellow":"#fefce8",
  "purple":"#faf5ff","orange":"#fff7ed","pink":"#fdf2f8","brown":"#fdf8f3",
  "white":"#f9fafb","black and white":"#f8fafc",
};
const COLOR_SWATCH = {
  "red":"#ef4444","blue":"#3b82f6","green":"#22c55e","yellow":"#eab308",
  "purple":"#a855f7","orange":"#f97316","pink":"#ec4899","brown":"#92400e",
  "white":"#e5e7eb","black and white":"#374151",
};

export default function CrimsonColorDuel({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("menu"); // menu | game | result
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState([true, false, false]);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerActive, setTimerActive] = useState(false);

  const level = LEVELS[levelIdx];
  const current = questions[qIdx];

  useEffect(() => {
    if (!timerActive || answered || screen !== "game") return;
    if (timeLeft <= 0) {
      handleAnswer(null); // time out
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft, answered, screen]);

  const startLevel = useCallback((idx) => {
    const lvl = LEVELS[idx];
    const items = lvl.itemNames.map(n => COLOR_ITEMS.find(x => x.name === n)).filter(Boolean);
    const qs = shuffle(items).map(item => ({ ...item, options: getOptions(item.color) }));
    setLevelIdx(idx);
    setQuestions(qs);
    setQIdx(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setSelected(null);
    setAnswered(false);
    setTimeLeft(lvl.time);
    setTimerActive(true);
    setScreen("game");
  }, []);

  const handleAnswer = useCallback((opt) => {
    if (answered) return;
    setTimerActive(false);
    setSelected(opt);
    setAnswered(true);
    const isCorrect = opt === current?.color;
    if (isCorrect) {
      setScore(s => s + 10 + (streak >= 2 ? 5 : 0));
      setStreak(s => s + 1);
      setCorrectCount(c => c + 1);
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= questions.length) {
        const nextLvl = levelIdx + 1;
        if (nextLvl < LEVELS.length) setUnlocked(u => u.map((v, i) => i === nextLvl ? true : v));

        const accuracy = Math.round((correctCount / questions.length) * 100);
        completeGame('crimson-color-duel', accuracy, questions.length);
            onComplete?.(accuracy, questions.length);

        setScreen("result");
      } else {
        setQIdx(next);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(level.time);
        setTimerActive(true);
      }
    }, 900);
  }, [answered, current, streak, qIdx, questions.length, levelIdx, level, correctCount, completeGame]);

  if (screen === "menu") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#1a0a1e,#2d0b33,#1a0a1e)",
      fontFamily:"'Segoe UI', sans-serif", color:"#f3e8ff", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🎨</div>
      <h1 style={{ fontSize:"2.2rem", margin:"0 0 4px", color:"#e879f9", letterSpacing:2 }}>CRIMSON COLOR DUEL</h1>
      <p style={{ color:"#c084fc", marginBottom:32 }}>Name the color before time runs out!</p>
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
        {LEVELS.map((lvl, i) => (
          <button key={i} onClick={() => unlocked[i] && startLevel(i)} style={{
            padding:"18px 28px", borderRadius:18, border:"none",
            background: unlocked[i]
              ? i===0 ? "linear-gradient(135deg,#22c55e,#16a34a)"
                : i===1 ? "linear-gradient(135deg,#f59e0b,#d97706)"
                : "linear-gradient(135deg,#ef4444,#dc2626)"
              : "#374151",
            color:"#fff", fontWeight:800, fontSize:"1rem",
            cursor: unlocked[i] ? "pointer" : "not-allowed",
            boxShadow: unlocked[i] ? "0 4px 16px #0004" : "none",
          }}>
            <div>{unlocked[i] ? lvl.name : `🔒 ${lvl.name}`}</div>
            <div style={{ fontSize:"0.75rem", opacity:0.8, marginTop:2 }}>
              {lvl.tag} · {lvl.time}s
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "result") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#1a0a1e,#2d0b33)",
      fontFamily:"'Segoe UI', sans-serif", color:"#f3e8ff", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#e879f9", marginBottom:8 }}>{level.name} Complete!</h2>
      <p style={{ color:"#c084fc", fontSize:"1.3rem", marginBottom:24 }}>Score: {score}</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startLevel(levelIdx)} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"#7c3aed", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🔄 Retry</button>
        {levelIdx + 1 < LEVELS.length && unlocked[levelIdx + 1] && (
          <button onClick={() => startLevel(levelIdx + 1)} style={{
            padding:"14px 28px", borderRadius:999, border:"none",
            background:"#e879f9", color:"#fff", fontWeight:700, cursor:"pointer",
          }}>➡️ Next Level</button>
        )}
        <button onClick={() => setScreen("menu")} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (!current) return null;
  const timerPct = (timeLeft / level.time) * 100;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#1a0a1e,#2d0b33,#1a0a1e)",
      fontFamily:"'Segoe UI', sans-serif", color:"#f3e8ff", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{
            background: levelIdx===0?"#16a34a":levelIdx===1?"#d97706":"#dc2626",
            padding:"4px 14px", borderRadius:999, fontWeight:700, fontSize:"0.85rem",
          }}>{level.tag}</span>
          <span style={{ color:"#e879f9", fontWeight:800 }}>⭐ {score}</span>
          <span style={{ color:"#c084fc" }}>{qIdx+1}/{questions.length}</span>
        </div>

        {/* Streak */}
        {streak >= 2 && (
          <div style={{ textAlign:"center", color:"#fbbf24", fontWeight:700, marginBottom:8 }}>
            🔥 {streak} streak! +5 bonus
          </div>
        )}

        {/* Timer bar */}
        <div style={{ height:8, background:"rgba(255,255,255,0.1)", borderRadius:999, marginBottom:20, overflow:"hidden" }}>
          <div style={{
            height:"100%", width:`${timerPct}%`,
            background: timerPct > 50 ? "#22c55e" : timerPct > 25 ? "#f59e0b" : "#ef4444",
            borderRadius:999, transition:"width 1s linear",
          }} />
        </div>

        {/* Question card */}
        <div style={{
          background: COLOR_BG[current.color] || "#fff",
          borderRadius:24, padding:"32px 24px", textAlign:"center", marginBottom:20,
          boxShadow:"0 8px 32px #0004",
          border: answered
            ? `3px solid ${selected === current.color ? "#22c55e" : "#ef4444"}`
            : "3px solid transparent",
          transition:"border 0.2s",
        }}>
          <div style={{ fontSize:"6rem", marginBottom:10 }}>{current.emoji}</div>
          <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:"#1e293b", margin:"0 0 6px" }}>
            {current.name}
          </h2>
          <p style={{ color:"#64748b", margin:0 }}>What color is this?</p>
          {answered && (
            <p style={{ marginTop:10, fontWeight:700, color: selected===current.color?"#16a34a":"#dc2626" }}>
              {selected===current.color ? "🎨 Correct!" : `❌ It's ${current.color}`}
            </p>
          )}
        </div>

        {/* Options */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {current.options.map(opt => {
            const isCorrect = answered && opt === current.color;
            const isWrong   = answered && opt === selected && opt !== current.color;
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} style={{
                padding:"14px 12px", borderRadius:14,
                cursor: answered ? "default" : "pointer",
                fontWeight:700, fontSize:"0.95rem",
                display:"flex", alignItems:"center", gap:8, justifyContent:"center",
                background: isCorrect ? "#166534" : isWrong ? "#7f1d1d" : "rgba(255,255,255,0.08)",
                color: isCorrect ? "#4ade80" : isWrong ? "#fca5a5" : "#f3e8ff",
                border: `2px solid ${isCorrect?"#22c55e":isWrong?"#ef4444":"transparent"}`,
                transition:"all 0.15s",
              }}>
                <div style={{
                  width:16, height:16, borderRadius:"50%",
                  background: COLOR_SWATCH[opt] || "#94a3b8",
                  border:"2px solid rgba(255,255,255,0.3)", flexShrink:0,
                }} />
                {opt}
              </button>
            );
          })}
        </div>

        {/* Time left indicator */}
        <div style={{ textAlign:"center", marginTop:14, color:"#7c3aed", fontWeight:700 }}>
          ⏱ {timeLeft}s
        </div>
      </div>
    </div>
  );
}
