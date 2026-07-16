import { useState, useCallback, useEffect } from "react";
import { useStorage } from "@/hooks/useStorage";

const QUESTIONS_DB = {
  1: [
    { emoji:"🏸", sentence:"We need thorough _______ before the badminton tournament.", correct:"preparation", options:["preparation","celebration","suggestion","attention"] },
    { emoji:"🎉", sentence:"After winning the match, the team had a huge _______.", correct:"celebration", options:["celebration","preparation","addition","direction"] },
    { emoji:"💡", sentence:"She gave a helpful _______ that improved our game strategy.", correct:"suggestion", options:["suggestion","protection","education","competition"] },
    { emoji:"🧠", sentence:"Please pay _______ to the coach's instructions.", correct:"attention", options:["attention","celebration","preparation","information"] },
    { emoji:"🧭", sentence:"We asked for _______ to the nearest badminton court.", correct:"direction", options:["direction","addition","competition","suggestion"] },
    { emoji:"➕", sentence:"The _______ of extra drills made our team stronger.", correct:"addition", options:["addition","celebration","preparation","attention"] },
    { emoji:"📚", sentence:"Physical _______ is important for young athletes.", correct:"education", options:["education","suggestion","protection","direction"] },
    { emoji:"🛡️", sentence:"Wearing goggles gives _______ for your eyes during fast smashes.", correct:"protection", options:["protection","celebration","preparation","addition"] },
    { emoji:"🏅", sentence:"The _______ between the two clubs was fierce and exciting.", correct:"competition", options:["competition","suggestion","attention","celebration"] },
    { emoji:"🎨", sentence:"The gym _______ included banners and shuttlecock posters.", correct:"decoration", options:["decoration","preparation","direction","education"] },
  ],
  2: [
    { emoji:"📦", sentence:"The _______ of several new drills helped us win the final.", correct:"combination", options:["combination","information","invention","invitation"] },
    { emoji:"📰", sentence:"Can you give me more _______ about the upcoming badminton camp?", correct:"information", options:["information","attention","celebration","direction"] },
    { emoji:"💡", sentence:"The _______ of the lightweight racket changed the game.", correct:"invention", options:["invention","suggestion","competition","preparation"] },
    { emoji:"💌", sentence:"We received an _______ to play at the national tournament.", correct:"invitation", options:["invitation","information","invention","combination"] },
    { emoji:"🌐", sentence:"There was strong _______ between all the visiting players.", correct:"communication", options:["communication","combination","competition","invitation"] },
    { emoji:"🏛️", sentence:"The club was founded with a clear _______ to promote sport.", correct:"intention", options:["intention","attention","direction","suggestion"] },
    { emoji:"🤔", sentence:"The coach made a quick _______ based on the score.", correct:"decision", options:["decision","celebration","direction","education"] },
    { emoji:"📋", sentence:"We had a long _______ about our training schedule.", correct:"discussion", options:["discussion","decision","direction","decoration"] },
    { emoji:"🎯", sentence:"Her _______ to win the championship kept her focused.", correct:"motivation", options:["motivation","invitation","combination","decoration"] },
    { emoji:"🌍", sentence:"The young player gained _______ from watching the pros.", correct:"inspiration", options:["inspiration","information","invitation","intention"] },
  ],
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function ShuttlecockSmash({ onComplete }) {
  const [screen, setScreen] = useState("start");
  const [playerName, setPlayerName] = useState("");
  const [level, setLevel] = useState(1);
  const [unlocked, setUnlocked] = useStorage("shuttlecock-smash-v1", { 1: true, 2: false });
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const startLevel = useCallback((lvl) => {
    setLevel(lvl);
    setQuestions(shuffle(QUESTIONS_DB[lvl]));
    setIdx(0);
    setScore(0);
    setCorrectCount(0);
    setSelected(null);
    setAnswered(false);
    setScreen("game");
  }, []);

  const current = questions[idx];

  const answer = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.correct) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      if (level === 1) setUnlocked(u => ({ ...u, 2: true }));
      const accuracy = Math.round((correctCount / questions.length) * 100);
      onComplete?.(score, accuracy);
      setScreen("complete");
    } else {
      setIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (screen === "start") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0c1445,#1a237e,#0d47a1)",
      fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🏸</div>
      <h1 style={{ fontSize:"1.9rem", margin:"0 0 4px", color:"#ffd54f" }}>SHUTTLECOCK SMASH</h1>
      <p style={{ color:"#90caf9", marginBottom:20 }}>The -tion Championship</p>
      <input value={playerName} onChange={e=>setPlayerName(e.target.value)}
        placeholder="Enter your player name"
        style={{ padding:"12px 20px", borderRadius:12, border:"1px solid #3949ab", background:"#1a237e", color:"#fff", fontSize:"1rem", marginBottom:20, width:240, textAlign:"center" }}
      />
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        {[1,2].map(lvl => (
          <button key={lvl} onClick={() => unlocked[lvl] && startLevel(lvl)} style={{
            padding:"14px 32px", borderRadius:16, border:"none",
            background: unlocked[lvl] ? (lvl===1?"#f59e0b":"#ef4444") : "#374151",
            color:"#fff", fontWeight:800, fontSize:"1rem",
            cursor: unlocked[lvl] ? "pointer" : "not-allowed",
          }}>
            {unlocked[lvl] ? `🏸 Level ${lvl}` : `🔒 Level ${lvl}`}
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "complete") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0c1445,#1a237e)",
      fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#ffd54f", marginBottom:8 }}>Level {level} Complete!</h2>
      <p style={{ color:"#90caf9", fontSize:"1.2rem", marginBottom:24 }}>
        {playerName || "Player"}: {score} / {questions.length * 10} pts
      </p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startLevel(level)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#6366f1", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Retry</button>
        {level===1 && unlocked[2] && <button onClick={() => startLevel(2)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#ef4444", color:"#fff", fontWeight:700, cursor:"pointer" }}>➡️ Level 2</button>}
        <button onClick={() => setScreen("start")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (!current) return null;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0c1445,#1a237e,#0d47a1)",
      fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ background: level===1?"#f59e0b":"#ef4444", padding:"4px 14px", borderRadius:999, fontWeight:700, fontSize:"0.85rem" }}>LEVEL {level}</span>
          <span style={{ color:"#ffd54f", fontWeight:800 }}>🏸 {score} pts</span>
          <span style={{ color:"#90caf9" }}>{idx+1}/{questions.length}</span>
        </div>
        <div style={{ height:6, background:"#1a237e", borderRadius:999, marginBottom:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(idx/questions.length)*100}%`, background:"#ffd54f", borderRadius:999, transition:"width 0.3s" }} />
        </div>

        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:24, padding:28, textAlign:"center", marginBottom:20, border:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize:"3.5rem", marginBottom:12 }}>{current.emoji}</div>
          <p style={{ fontSize:"1.1rem", fontWeight:600, color:"#e2e8f0", lineHeight:1.6 }}>
            {current.sentence}
          </p>
          <p style={{ fontSize:"0.85rem", color:"#90caf9", marginTop:8 }}>💡 Fill in the blank with a <strong>-tion</strong> word</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {current.options.map(opt => {
            const isCorrect = answered && opt === current.correct;
            const isWrong = answered && opt === selected && opt !== current.correct;
            return (
              <button key={opt} onClick={() => answer(opt)} style={{
                padding:"14px 16px", borderRadius:14, border:"2px solid",
                borderColor: isCorrect?"#22c55e":isWrong?"#ef4444":"rgba(255,255,255,0.1)",
                cursor: answered?"default":"pointer",
                fontWeight:700, fontSize:"0.9rem",
                background: isCorrect?"#166534":isWrong?"#7f1d1d":"rgba(255,255,255,0.08)",
                color: isCorrect?"#4ade80":isWrong?"#fca5a5":"#f1f5f9",
                transition:"all 0.15s",
              }}>{opt}</button>
            );
          })}
        </div>

        {answered && (
          <div style={{ textAlign:"center", marginTop:16 }}>
            <p style={{ fontWeight:700, color: selected===current.correct?"#4ade80":"#f87171", marginBottom:12 }}>
              {selected===current.correct ? "🏸 Smash! Correct!" : `❌ Answer: "${current.correct}"`}
            </p>
            <button onClick={next} style={{ padding:"14px 32px", borderRadius:999, border:"none", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#111", fontWeight:800, cursor:"pointer" }}>
              {idx+1 < questions.length ? "➡️ Next" : "🏆 Finish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
