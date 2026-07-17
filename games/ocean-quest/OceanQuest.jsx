import { useState, useCallback } from "react";

const CREATURES = [
  { name:"Fish",      emoji:"🐠" }, { name:"Shark",    emoji:"🦈" },
  { name:"Octopus",  emoji:"🐙" }, { name:"Squid",    emoji:"🦑" },
  { name:"Jellyfish",emoji:"🪼" }, { name:"Shrimp",   emoji:"🦐" },
  { name:"Lobster",  emoji:"🦞" }, { name:"Crab",     emoji:"🦀" },
  { name:"Dolphin",  emoji:"🐬" }, { name:"Whale",    emoji:"🐋" },
  { name:"Seal",     emoji:"🦭" }, { name:"Otter",    emoji:"🦦" },
  { name:"Turtle",   emoji:"🐢" }, { name:"Penguin",  emoji:"🐧" },
];

// Level 1: Type the name from emoji (shown with tiles)
// Level 2: Multiple choice name
// Level 3: Reverse - given name, pick emoji

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildPool(name) {
  const needed = name.toUpperCase().split("");
  const extras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(l => !needed.includes(l));
  const extra = shuffle(extras).slice(0, Math.min(5, 12 - needed.length));
  return shuffle([...needed, ...extra].map((l, i) => ({ l, id: i, used: false })));
}

export default function OceanQuest({ onComplete }) {
  const [screen, setScreen] = useState("welcome");
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [typed, setTyped] = useState([]);
  const [pool, setPool] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState("");

  const startLevel = useCallback((lvl) => {
    const qs = shuffle([...CREATURES]);
    setLevel(lvl);
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setAnswered(false);
    setSelected(null);
    setFeedback("");
    if (lvl === 1) { setPool(buildPool(qs[0].name)); setTyped([]); }
    setScreen("game");
  }, []);

  const current = questions[idx];

  // Level 1 logic (spelling)
  const tapLetter = (id) => {
    if (answered) return;
    const tile = pool.find(t => t.id === id);
    if (!tile || tile.used) return;
    const nextTyped = [...typed, { l: tile.l, id }];
    setPool(prev => prev.map(t => t.id === id ? { ...t, used: true } : t));
    setTyped(nextTyped);

    if (nextTyped.length === current.name.length) {
      const guess = nextTyped.map(x => x.l).join("");
      if (guess === current.name.toUpperCase()) {
        setFeedback("correct");
        setScore(s => s + 10);
        setAnswered(true);
      } else {
        setFeedback("wrong");
        setTimeout(() => {
          setPool(prev => prev.map(t => ({ ...t, used: false })));
          setTyped([]);
          setFeedback("");
        }, 800);
      }
    }
  };

  const removeLastL = () => {
    if (!typed.length || answered) return;
    const last = typed[typed.length - 1];
    setPool(prev => prev.map(t => t.id === last.id ? { ...t, used: false } : t));
    setTyped(prev => prev.slice(0, -1));
  };

  // Level 2/3 logic (multiple choice)
  const answerMC = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (level === 2 && opt === current.name) { setFeedback("correct"); setScore(s => s + 10); }
    else if (level === 3 && opt === current.emoji) { setFeedback("correct"); setScore(s => s + 10); }
    else setFeedback("wrong");
  };

  const next = () => {
    if (idx + 1 >= questions.length) { setScreen("complete"); onComplete?.(score, Math.round((score / (questions.length * 10)) * 100)); return; }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setAnswered(false);
    setSelected(null);
    setFeedback("");
    if (level === 1) { setPool(buildPool(questions[nextIdx].name)); setTyped([]); }
  };

  const getOptions = () => {
    if (level === 2) {
      const others = shuffle(CREATURES.filter(c => c.name !== current.name)).slice(0, 3);
      return shuffle([current.name, ...others.map(c => c.name)]);
    }
    if (level === 3) {
      const others = shuffle(CREATURES.filter(c => c.name !== current.name)).slice(0, 3);
      return shuffle([current.emoji, ...others.map(c => c.emoji)]);
    }
    return [];
  };

  if (screen === "welcome") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#0c4a6e 0%,#075985 40%,#0369a1 100%)",
      fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🌊</div>
      <h1 style={{ fontSize:"2.2rem", margin:"0 0 8px", color:"#bae6fd" }}>OCEAN QUEST</h1>
      <p style={{ color:"#7dd3fc", marginBottom:32 }}>Premium Sea Adventure</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        {[
          { lvl:1, label:"🔤 Spell It", desc:"Spell the creature's name" },
          { lvl:2, label:"📛 Name It", desc:"Identify from emoji" },
          { lvl:3, label:"🎯 Find It", desc:"Match name to emoji" },
        ].map(({ lvl, label, desc }) => (
          <button key={lvl} onClick={() => startLevel(lvl)} style={{
            padding:"18px 28px", borderRadius:16,
            background:"rgba(255,255,255,0.12)", color:"#fff",
            fontWeight:700, fontSize:"1rem", cursor:"pointer",
            border:"1px solid rgba(255,255,255,0.2)",
            backdropFilter:"blur(4px)", minWidth:160,
          }}>
            <div style={{ fontSize:"1.1rem", marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:"0.8rem", opacity:0.7 }}>{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "complete") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#0c4a6e,#075985)",
      fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#bae6fd", marginBottom:8 }}>Ocean Mastered!</h2>
      <p style={{ color:"#7dd3fc", fontSize:"1.2rem", marginBottom:24 }}>Score: {score} / {questions.length * 10}</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startLevel(level)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#0369a1", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Play Again</button>
        <button onClick={() => setScreen("welcome")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (!current) return null;
  const opts = (level === 2 || level === 3) ? getOptions() : [];

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#0c4a6e 0%,#075985 50%,#0369a1 100%)",
      fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24,
    }}>
      {/* Animated bubbles */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        {[20,40,60,80].map(l => (
          <div key={l} style={{ position:"absolute", left:`${l}%`, bottom:0, width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,0.15)", animation:`bubble 4s ${l/20}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bubble { 0%{transform:translateY(0);opacity:0.5} 100%{transform:translateY(-100vh);opacity:0} }`}</style>

      <div style={{ width:"100%", maxWidth:"min(760px, calc(100vw - 56px))", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ background:"rgba(255,255,255,0.15)", padding:"4px 14px", borderRadius:999, fontWeight:700, fontSize:"0.85rem" }}>
            {level===1?"Spell It":level===2?"Name It":"Find It"}
          </span>
          <span style={{ color:"#bae6fd", fontWeight:800 }}>🌊 {score}</span>
          <span style={{ color:"#7dd3fc" }}>{idx+1}/{questions.length}</span>
        </div>
        <div style={{ height:6, background:"rgba(255,255,255,0.1)", borderRadius:999, marginBottom:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(idx/questions.length)*100}%`, background:"#38bdf8", borderRadius:999, transition:"width 0.3s" }} />
        </div>

        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:24, padding:32, textAlign:"center", marginBottom:20, backdropFilter:"blur(4px)", border:"1px solid rgba(255,255,255,0.12)" }}>
          {level === 3 ? (
            <>
              <h3 style={{ fontSize:"clamp(1.6rem, 3.2vw, 2.4rem)", color:"#bae6fd", margin:"0 0 8px" }}>{current.name}</h3>
              <p style={{ color:"#7dd3fc" }}>Which emoji is this creature?</p>
            </>
          ) : (
            <>
              <div style={{ fontSize:"clamp(3.5rem, 8vw, 6rem)", marginBottom:8 }}>{current.emoji}</div>
              {level === 2 && <p style={{ color:"#7dd3fc" }}>What is this sea creature?</p>}
            </>
          )}

          {level === 1 && (
            <>
              {/* Slots */}
              <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:16, flexWrap:"wrap" }}>
                {current.name.toUpperCase().split("").map((_, i) => (
                  <div key={i} style={{
                    width:"clamp(32px, 6vw, 52px)", height:"clamp(38px, 7vw, 58px)", borderRadius:8, border:"2px solid",
                    borderColor: feedback==="correct"?"#4ade80":feedback==="wrong"?"#f87171":"rgba(255,255,255,0.3)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"clamp(1.1rem, 2.2vw, 1.5rem)", fontWeight:800, background:"rgba(255,255,255,0.1)",
                  }}>{typed[i]?.l||""}</div>
                ))}
              </div>
              {feedback && <p style={{ marginTop:10, fontWeight:700, color:feedback==="correct"?"#4ade80":"#f87171" }}>
                {feedback==="correct"?"🌊 Correct!":"❌ Try again!"}
              </p>}
            </>
          )}
        </div>

        {level === 1 && (
          <>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginBottom:12 }}>
              {pool.map(t => (
                <button key={t.id} onClick={() => tapLetter(t.id)} disabled={t.used||answered}
                  style={{ width:"clamp(36px, 6.5vw, 56px)", height:"clamp(36px, 6.5vw, 56px)", borderRadius:8, border:"none", fontWeight:800, fontSize:"clamp(1rem, 1.8vw, 1.3rem)", cursor:t.used?"default":"pointer",
                    background:t.used?"rgba(255,255,255,0.05)":"#0369a1", color:t.used?"transparent":"#fff",
                    boxShadow:t.used?"none":"0 3px 0 #01579b", transition:"all 0.1s" }}>
                  {t.l}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              <button onClick={removeLastL} style={{ padding:"8px 20px", borderRadius:10, border:"none", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, cursor:"pointer" }}>⌫</button>
              <button onClick={() => { setPool(buildPool(current.name)); setTyped([]); }} style={{ padding:"8px 20px", borderRadius:10, border:"none", background:"rgba(255,255,255,0.15)", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄</button>
            </div>
          </>
        )}

        {(level === 2 || level === 3) && (
          <div style={{ display:"grid", gridTemplateColumns: level===3?"repeat(4,1fr)":"1fr 1fr", gap:10 }}>
            {opts.map(opt => {
              const correctVal = level===2 ? current.name : current.emoji;
              const isCorrect = answered && opt === correctVal;
              const isWrong = answered && opt === selected && opt !== correctVal;
              return (
                <button key={opt} onClick={() => answerMC(opt)} style={{
                  padding: level===3?"clamp(18px,3vw,30px) clamp(8px,1.5vw,16px)":"clamp(14px,2vw,22px) clamp(14px,2vw,22px)", borderRadius:14, border:"2px solid",
                  borderColor: isCorrect?"#4ade80":isWrong?"#f87171":"rgba(255,255,255,0.15)",
                  cursor:answered?"default":"pointer",
                  fontWeight:700, fontSize: level===3?"clamp(1.6rem,3.4vw,2.4rem)":"clamp(0.95rem,1.6vw,1.2rem)",
                  background: isCorrect?"rgba(34,197,94,0.2)":isWrong?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.08)",
                  color:"#fff", transition:"all 0.15s",
                }}>{opt}</button>
              );
            })}
          </div>
        )}

        {answered && (
          <div style={{ textAlign:"center", marginTop:16 }}>
            <p style={{ fontWeight:700, color:feedback==="correct"?"#4ade80":"#f87171", marginBottom:12 }}>
              {feedback==="correct"?"🐬 Excellent!":level===2?`❌ It's ${current.name}`:`❌ It's ${current.emoji}`}
            </p>
            <button onClick={next} style={{ padding:"14px 32px", borderRadius:999, border:"none", background:"linear-gradient(135deg,#0369a1,#0284c7)", color:"#fff", fontWeight:800, cursor:"pointer" }}>
              {idx+1 < questions.length ? "🌊 Next" : "🏆 Finish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
