import { useState, useCallback } from "react";

const LEVELS = [
  { name:"🌿 Sapling", ops:["+"], max:10, branches:6, reward:"🍌" },
  { name:"🌳 Canopy",  ops:["+","-"], max:20, branches:8, reward:"🥭" },
  { name:"🌴 Summit",  ops:["+","-","×"], max:50, branches:10, reward:"🏆" },
];

function genQuestion(ops, max) {
  const op = ops[Math.floor(Math.random()*ops.length)];
  let a, b, answer;
  if (op === "+") { a=Math.floor(Math.random()*max)+1; b=Math.floor(Math.random()*(max-a))+1; answer=a+b; }
  else if (op === "-") { a=Math.floor(Math.random()*max)+2; b=Math.floor(Math.random()*(a-1))+1; answer=a-b; }
  else { a=Math.floor(Math.random()*10)+2; b=Math.floor(Math.random()*10)+2; answer=a*b; }
  const opSym = op==="×"?"×":op;
  // Generate wrong options near answer
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const w = answer + (Math.floor(Math.random()*7)-3);
    if (w !== answer && w > 0) wrongs.add(w);
  }
  const options = [answer, ...Array.from(wrongs)].sort(()=>Math.random()-0.5);
  return { q:`${a} ${opSym} ${b} = ?`, answer, options };
}

export default function MonkeyTreeClimb({ onComplete }) {
  const [screen, setScreen] = useState("menu");
  const [lvlIdx, setLvlIdx] = useState(0);
  const [unlocked, setUnlocked] = useState([true,false,false]);
  const [height, setHeight] = useState(0); // branches climbed
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);

  const level = LEVELS[lvlIdx];

  const startLevel = useCallback((i) => {
    setLvlIdx(i);
    setHeight(0);
    setScore(0);
    setLives(3);
    setFeedback(null);
    setDone(false);
    setQuestion(genQuestion(LEVELS[i].ops, LEVELS[i].max));
    setScreen("game");
  }, []);

  const answer = (opt) => {
    if (feedback) return;
    if (opt === question.answer) {
      setFeedback("correct");
      setScore(s => s + 10);
      setTimeout(() => {
        setFeedback(null);
        const nextH = height + 1;
        if (nextH >= level.branches) {
          const nextLvl = lvlIdx + 1;
          if (nextLvl < LEVELS.length) setUnlocked(u => u.map((v,i)=>i===nextLvl?true:v));
          setDone(true);
          onComplete?.(score + 10, 100);
        } else {
          setHeight(nextH);
          setQuestion(genQuestion(level.ops, level.max));
        }
      }, 700);
    } else {
      setFeedback("wrong");
      setLives(l => {
        const next = l - 1;
        if (next <= 0) { setTimeout(() => setScreen("over"), 900); onComplete?.(score, Math.round((height / level.branches) * 100)); }
        return next;
      });
      setTimeout(() => {
        setFeedback(null);
        setQuestion(genQuestion(level.ops, level.max));
      }, 900);
    }
  };

  if (screen === "menu") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#0f4c2a 0%,#1a6636 50%,#22863f 100%)",
      fontFamily:"'Segoe UI', sans-serif", color:"#ecfdf5", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8 }}>🐒</div>
      <h1 style={{ fontSize:"2.2rem", margin:"0 0 8px", color:"#bbf7d0" }}>Monkey Tree Climb</h1>
      <p style={{ color:"#86efac", marginBottom:32 }}>Answer math questions to climb higher!</p>
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
        {LEVELS.map((lvl,i) => (
          <button key={i} onClick={() => unlocked[i] && startLevel(i)} style={{
            padding:"16px 28px", borderRadius:18, border:"none",
            background: unlocked[i] ? (i===0?"#22c55e":i===1?"#f59e0b":"#ef4444") : "#374151",
            color:"#fff", fontWeight:800, fontSize:"1rem", cursor: unlocked[i]?"pointer":"not-allowed",
            boxShadow: unlocked[i]?"0 4px 16px #0004":"none",
          }}>
            {unlocked[i] ? lvl.name : `🔒 ${lvl.name}`}
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "over") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#0f4c2a,#1a6636)",
      fontFamily:"'Segoe UI', sans-serif", color:"#ecfdf5", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>💀</div>
      <h2 style={{ fontSize:"2rem", color:"#f87171", marginBottom:8 }}>Monkey fell!</h2>
      <p style={{ color:"#86efac", marginBottom:24 }}>Score: {score} · Reached branch {height}</p>
      <div style={{ display:"flex", gap:12 }}>
        <button onClick={() => startLevel(lvlIdx)} style={{
          padding:"12px 28px", borderRadius:999, border:"none",
          background:"#22c55e", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🔄 Try Again</button>
        <button onClick={() => setScreen("menu")} style={{
          padding:"12px 28px", borderRadius:999, border:"none",
          background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (done) return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#0f4c2a,#1a6636)",
      fontFamily:"'Segoe UI', sans-serif", color:"#ecfdf5", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8 }}>{level.reward}</div>
      <h2 style={{ fontSize:"2rem", color:"#bbf7d0", marginBottom:8 }}>Top of the tree!</h2>
      <p style={{ color:"#86efac", fontSize:"1.2rem", marginBottom:24 }}>Score: {score}</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startLevel(lvlIdx)} style={{
          padding:"12px 28px", borderRadius:999, border:"none",
          background:"#22c55e", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🔄 Retry</button>
        {lvlIdx+1<LEVELS.length && unlocked[lvlIdx+1] && (
          <button onClick={() => startLevel(lvlIdx+1)} style={{
            padding:"12px 28px", borderRadius:999, border:"none",
            background:"#f59e0b", color:"#fff", fontWeight:700, cursor:"pointer",
          }}>🌴 Next Level</button>
        )}
        <button onClick={() => setScreen("menu")} style={{
          padding:"12px 28px", borderRadius:999, border:"none",
          background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );

  // Game screen - tree visualization
  const progress = height / level.branches;
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#0a3a1e 0%,#0f4c2a 60%,#1a6636 100%)",
      fontFamily:"'Segoe UI', sans-serif", color:"#ecfdf5", padding:24,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", width:"100%", maxWidth:"min(640px, calc(100vw - 56px))", marginBottom:14 }}>
        <span style={{ background:"#166534", padding:"4px 14px", borderRadius:999, fontWeight:700 }}>{level.name}</span>
        <span style={{ color:"#fbbf24", fontWeight:700 }}>🏆 {score}</span>
        <span>{Array.from({length:3},(_,i)=>i<lives?"❤️":"🖤").join("")}</span>
      </div>

      {/* Tree progress */}
      <div style={{
        width:60, height:280, background:"rgba(255,255,255,0.06)", borderRadius:30,
        position:"relative", marginBottom:20, border:"1px solid rgba(255,255,255,0.1)", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          height:`${progress*100}%`, background:"linear-gradient(0deg,#16a34a,#4ade80)",
          borderRadius:30, transition:"height 0.4s ease",
        }} />
        <div style={{
          position:"absolute", left:"50%", transform:"translateX(-50%)",
          bottom:`${progress*100}%`, fontSize:"1.6rem", transition:"bottom 0.4s ease",
          marginBottom:-4,
        }}>🐒</div>
        <div style={{ position:"absolute", top:4, left:"50%", transform:"translateX(-50%)", fontSize:"1.4rem" }}>🌿</div>
      </div>
      <p style={{ color:"#86efac", margin:"0 0 14px", fontSize:"0.9rem" }}>
        Branch {height+1} of {level.branches}
      </p>

      {/* Question card */}
      <div style={{
        background:"rgba(255,255,255,0.07)", borderRadius:24, padding:"clamp(20px,3vw,32px) clamp(24px,4vw,44px)",
        textAlign:"center", marginBottom:20, minWidth:280,
        border:`2px solid ${feedback==="correct"?"#4ade80":feedback==="wrong"?"#f87171":"rgba(255,255,255,0.1)"}`,
      }}>
        <div style={{ fontSize:"clamp(1.7rem, 3.4vw, 2.6rem)", fontWeight:800, color:"#bbf7d0", letterSpacing:2 }}>
          {question.q}
        </div>
        {feedback && (
          <p style={{ color:feedback==="correct"?"#4ade80":"#f87171", fontWeight:700, marginTop:10, marginBottom:0 }}>
            {feedback==="correct"?"🐒 Climb higher!":"💥 Whoops!"}
          </p>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"clamp(10px, 1.6vw, 18px)", maxWidth:"min(640px, calc(100vw - 56px))", width:"100%" }}>
        {question.options.map((opt,i) => {
          const isCorrect = feedback==="correct" && opt===question.answer;
          const isWrong = feedback==="wrong" && opt===question.answer; // reveal correct on wrong
          return (
            <button key={i} onClick={() => answer(opt)} style={{
              padding:"clamp(14px,2vw,22px)", borderRadius:14,
              cursor:feedback?"default":"pointer",
              fontWeight:800, fontSize:"clamp(1.1rem,2vw,1.5rem)",
              background: isCorrect?"#166534":isWrong?"#166534":feedback?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.1)",
              color: isCorrect||isWrong?"#4ade80":"#ecfdf5",
              border:`2px solid ${isCorrect||isWrong?"#22c55e":"transparent"}`,
            }}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}
