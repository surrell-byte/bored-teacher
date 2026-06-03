import { useState, useCallback, useEffect } from "react";

// Country code → name pairs (subset of well-known countries with emoji flags)
const COUNTRIES = [
  ["US","United States"],["GB","United Kingdom"],["FR","France"],["DE","Germany"],
  ["JP","Japan"],["CN","China"],["IN","India"],["BR","Brazil"],["CA","Canada"],
  ["AU","Australia"],["IT","Italy"],["ES","Spain"],["MX","Mexico"],["KR","South Korea"],
  ["RU","Russia"],["ZA","South Africa"],["NG","Nigeria"],["EG","Egypt"],["TR","Turkey"],
  ["AR","Argentina"],["SA","Saudi Arabia"],["TH","Thailand"],["ID","Indonesia"],["PK","Pakistan"],
  ["PH","Philippines"],["VN","Vietnam"],["UA","Ukraine"],["PL","Poland"],["NL","Netherlands"],
  ["SE","Sweden"],["NO","Norway"],["FI","Finland"],["DK","Denmark"],["CH","Switzerland"],
  ["PT","Portugal"],["GR","Greece"],["CZ","Czechia"],["HU","Hungary"],["AT","Austria"],
  ["BE","Belgium"],["NZ","New Zealand"],["SG","Singapore"],["MY","Malaysia"],["NP","Nepal"],
  ["GH","Ghana"],["KE","Kenya"],["MA","Morocco"],["TN","Tunisia"],["ET","Ethiopia"],
  ["CO","Colombia"],["CL","Chile"],["PE","Peru"],["VE","Venezuela"],["CU","Cuba"],
  ["IE","Ireland"],["RO","Romania"],["BG","Bulgaria"],["HR","Croatia"],["RS","Serbia"],
  ["IL","Israel"],["IR","Iran"],["IQ","Iraq"],["AE","UAE"],["QA","Qatar"],
  ["JM","Jamaica"],["BO","Bolivia"],["PY","Paraguay"],["UY","Uruguay"],["EC","Ecuador"],
];

// Convert ISO code to flag emoji
function toFlag(code) {
  return code.toUpperCase().split("").map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("");
}

const DIFFICULTIES = [
  { id:"easy",   label:"🌍 Easy",   size:10, timer:20, color:"#22c55e" },
  { id:"medium", label:"🌎 Medium", size:20, timer:15, color:"#f59e0b" },
  { id:"hard",   label:"🌏 Hard",   size:40, timer:10, color:"#ef4444" },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildQuestion(pool) {
  const shuffled = shuffle(pool);
  const [code, name] = shuffled[0];
  const wrongs = shuffle(shuffled.slice(1)).slice(0, 3).map(([,n]) => n);
  return {
    code, name,
    options: shuffle([name, ...wrongs]),
    flag: toFlag(code),
  };
}

export default function Flagmaster() {
  const [screen, setScreen] = useState("welcome");
  const [diff, setDiff] = useState("easy");
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timedOut, setTimedOut] = useState(false);

  const diffDef = DIFFICULTIES.find(d => d.id === diff);

  const startGame = useCallback((diffId) => {
    const d = DIFFICULTIES.find(x => x.id === diffId);
    setDiff(diffId);
    const pool = shuffle(COUNTRIES).slice(0, d.size);
    setQuestions(pool.map(() => buildQuestion(shuffle(COUNTRIES).slice(0, d.size))));
    setIdx(0);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setAnswered(false);
    setTimedOut(false);
    setTimeLeft(d.timer);
    setScreen("game");
  }, []);

  const current = questions[idx];

  // Timer
  useEffect(() => {
    if (screen !== "game" || answered) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      setAnswered(true);
      setStreak(0);
      return;
    }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, timeLeft, answered]);

  const answer = (opt) => {
    if (answered || !current) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.name) {
      const bonus = streak >= 2 ? 5 : 0;
      setScore(s => s + 10 + bonus + Math.max(0, timeLeft));
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) { setScreen("complete"); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setAnswered(false);
    setTimedOut(false);
    setTimeLeft(diffDef.timer);
  };

  if (screen === "welcome") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)",
      fontFamily:"'Segoe UI',sans-serif", color:"#f1f5f9", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🌍</div>
      <h1 style={{ fontSize:"2.5rem", margin:"0 0 4px", color:"#fbbf24", letterSpacing:3 }}>FLAGMASTER</h1>
      <p style={{ color:"#818cf8", marginBottom:32 }}>World Expedition</p>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center" }}>
        {DIFFICULTIES.map(d => (
          <button key={d.id} onClick={() => startGame(d.id)} style={{
            padding:"18px 36px", borderRadius:16, border:"none",
            background:d.color, color:"#fff",
            fontWeight:800, fontSize:"1.1rem", cursor:"pointer",
            boxShadow:`0 4px 20px ${d.color}55`,
          }}>
            <div>{d.label}</div>
            <div style={{ fontSize:"0.75rem", opacity:0.8, marginTop:4 }}>{d.size} flags · {d.timer}s each</div>
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "complete") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f172a,#1e1b4b)",
      fontFamily:"'Segoe UI',sans-serif", color:"#f1f5f9", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#fbbf24", marginBottom:8 }}>Expedition Complete!</h2>
      <p style={{ color:"#818cf8", fontSize:"1.2rem", marginBottom:24 }}>Final Score: {score}</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startGame(diff)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:diffDef.color, color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Play Again</button>
        <button onClick={() => setScreen("welcome")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🌍 Change Difficulty</button>
      </div>
    </div>
  );

  if (!current) return null;

  const timerPct = (timeLeft / diffDef.timer) * 100;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)",
      fontFamily:"'Segoe UI',sans-serif", color:"#f1f5f9", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
          <span style={{ background:diffDef.color, padding:"4px 14px", borderRadius:999, fontWeight:700, fontSize:"0.85rem" }}>{diffDef.label}</span>
          <span style={{ color:"#fbbf24", fontWeight:800, fontSize:"1.1rem" }}>⭐ {score}</span>
          <span style={{ color:"#818cf8" }}>{idx+1}/{questions.length}</span>
        </div>

        {/* Timer bar */}
        <div style={{ height:8, background:"rgba(255,255,255,0.1)", borderRadius:999, marginBottom:8, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${timerPct}%`, borderRadius:999, transition:"width 1s linear",
            background: timerPct > 50 ? "#22c55e" : timerPct > 25 ? "#f59e0b" : "#ef4444" }} />
        </div>
        <div style={{ textAlign:"center", marginBottom:16, color: timeLeft <= 5 ? "#f87171" : "#94a3b8", fontSize:"0.9rem" }}>
          ⏱ {timeLeft}s
        </div>

        {streak >= 2 && (
          <div style={{ textAlign:"center", color:"#f97316", fontWeight:700, marginBottom:8 }}>🔥 {streak} streak!</div>
        )}

        {/* Flag display */}
        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:24, padding:"32px 24px", textAlign:"center", marginBottom:20, border:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:"7rem", lineHeight:1, marginBottom:8, filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>
            {current.flag}
          </div>
          <p style={{ color:"#64748b", fontSize:"0.9rem" }}>Which country is this flag from?</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {current.options.map(opt => {
            const isCorrect = answered && opt === current.name;
            const isWrong = answered && opt === selected && opt !== current.name;
            return (
              <button key={opt} onClick={() => answer(opt)} style={{
                padding:"14px 12px", borderRadius:14, border:"2px solid",
                borderColor: isCorrect?"#22c55e":isWrong?"#ef4444":"rgba(255,255,255,0.08)",
                cursor: answered?"default":"pointer",
                fontWeight:600, fontSize:"0.9rem", textAlign:"center",
                background: isCorrect?"rgba(34,197,94,0.15)":isWrong?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.05)",
                color: isCorrect?"#4ade80":isWrong?"#f87171":"#f1f5f9",
                transition:"all 0.15s",
              }}>{opt}</button>
            );
          })}
        </div>

        {answered && (
          <div style={{ textAlign:"center", marginTop:16 }}>
            {timedOut
              ? <p style={{ color:"#f87171", fontWeight:700, marginBottom:12 }}>⏰ Time's up! It's {current.name} {current.flag}</p>
              : <p style={{ fontWeight:700, color:selected===current.name?"#4ade80":"#f87171", marginBottom:12 }}>
                  {selected===current.name ? `🎯 Correct! +${10+Math.max(0,timeLeft)}pts` : `❌ It's ${current.name} ${current.flag}`}
                </p>
            }
            <button onClick={next} style={{ padding:"14px 32px", borderRadius:999, border:"none", background:diffDef.color, color:"#fff", fontWeight:800, cursor:"pointer" }}>
              {idx+1 < questions.length ? "🌍 Next Flag" : "🏆 Finish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
