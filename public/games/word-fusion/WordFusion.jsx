import { useState, useCallback } from "react";

const EASY = [
  { part1:"sun",   part2:"flower", answer:"sunflower",  options:["sunflower","sunlight","sundrop","sunhat"] },
  { part1:"tooth", part2:"brush",  answer:"toothbrush", options:["toothpaste","toothbrush","toothpick","toothache"] },
  { part1:"rain",  part2:"coat",   answer:"raincoat",   options:["rainbow","raincoat","raindrop","rainstorm"] },
  { part1:"bed",   part2:"room",   answer:"bedroom",    options:["bathroom","bedroom","livingroom","classroom"] },
  { part1:"foot",  part2:"ball",   answer:"football",   options:["football","baseball","basketball","volleyball"] },
  { part1:"snow",  part2:"man",    answer:"snowman",    options:["snowball","snowman","snowflake","snowplow"] },
  { part1:"note",  part2:"book",   answer:"notebook",   options:["notebook","textbook","storybook","cookbook"] },
  { part1:"cup",   part2:"cake",   answer:"cupcake",    options:["cupcake","pancake","cheesecake","milkshake"] },
  { part1:"air",   part2:"port",   answer:"airport",    options:["seaport","airport","spaceport","helipad"] },
  { part1:"play",  part2:"ground", answer:"playground", options:["playground","playhouse","playdate","playroom"] },
];

const MEDIUM = [
  { part1:"butter",  part2:"fly",   answer:"butterfly",  options:["butterfly","buttercup","buttermilk","butterbean"] },
  { part1:"back",    part2:"pack",  answer:"backpack",   options:["backpack","backyard","backbone","backfire"] },
  { part1:"hand",    part2:"shake", answer:"handshake",  options:["handshake","handprint","handstand","handrail"] },
  { part1:"fire",    part2:"fly",   answer:"firefly",    options:["firefly","firework","fireplace","fireman"] },
  { part1:"moon",    part2:"light", answer:"moonlight",  options:["moonlight","moonshine","moonwalk","moonbeam"] },
  { part1:"book",    part2:"shelf", answer:"bookshelf",  options:["bookshelf","bookstore","bookmark","bookworm"] },
  { part1:"star",    part2:"fish",  answer:"starfish",   options:["starfish","starlight","starfruit","stargaze"] },
  { part1:"over",    part2:"load",  answer:"overload",   options:["overload","overcome","overlook","overcast"] },
  { part1:"tooth",   part2:"paste", answer:"toothpaste", options:["toothpaste","toothbrush","toothpick","toothache"] },
  { part1:"rain",    part2:"storm", answer:"rainstorm",  options:["rainstorm","rainbow","raindrop","raincoat"] },
];

const HARD = [
  { part1:"under",  part2:"stand",  answer:"understand",   options:["understand","undertake","undermine","underline"] },
  { part1:"over",   part2:"whelm",  answer:"overwhelm",    options:["overwhelm","overcome","overtake","overrule"] },
  { part1:"earth",  part2:"quake",  answer:"earthquake",   options:["earthquake","earthworm","earthly","earthbound"] },
  { part1:"break",  part2:"through",answer:"breakthrough", options:["breakthrough","breakdown","breakaway","breakout"] },
  { part1:"light",  part2:"house",  answer:"lighthouse",   options:["lighthouse","lightbulb","lightyear","lamppost"] },
  { part1:"thunder",part2:"storm",  answer:"thunderstorm", options:["thunderstorm","thunderbolt","thunderclap","thunderous"] },
  { part1:"water",  part2:"fall",   answer:"waterfall",    options:["waterfall","watermark","waterway","watershed"] },
  { part1:"fire",   part2:"works",  answer:"fireworks",    options:["fireworks","fireplace","fireman","fireside"] },
  { part1:"sun",    part2:"flower", answer:"sunflower",    options:["sunflower","sunlight","sunrise","sunburn"] },
  { part1:"snow",   part2:"flake",  answer:"snowflake",    options:["snowflake","snowball","snowboard","snowstorm"] },
];

const LEVELS = [
  { id:"easy",   label:"🌱 Easy",   color:"#22c55e", questions:EASY },
  { id:"medium", label:"⚡ Medium", color:"#f59e0b", questions:MEDIUM },
  { id:"hard",   label:"🔥 Hard",   color:"#ef4444", questions:HARD },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function WordFusion() {
  const [screen, setScreen] = useState("landing");
  const [playerName, setPlayerName] = useState("");
  const [levelId, setLevelId] = useState("easy");
  const [unlocked, setUnlocked] = useState({ easy:true, medium:false, hard:false });
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const currentLevelDef = LEVELS.find(l => l.id === levelId);

  const startLevel = useCallback((id) => {
    const lvl = LEVELS.find(l => l.id === id);
    setLevelId(id);
    setQuestions(shuffle(lvl.questions));
    setIdx(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setScreen("game");
  }, []);

  const current = questions[idx];

  const answer = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.answer) setScore(s => s + 10);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      // Unlock next level if score ≥ 70%
      const pct = ((score + (selected === current?.answer ? 10 : 0)) / (questions.length * 10)) * 100;
      if (levelId === "easy" && pct >= 70) setUnlocked(u => ({ ...u, medium:true }));
      if (levelId === "medium" && pct >= 70) setUnlocked(u => ({ ...u, hard:true }));
      setScreen("complete");
    } else {
      setIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (screen === "landing") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#e0f7fa,#b2ebf2,#e8f5e9)",
      fontFamily:"'Segoe UI',sans-serif", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🧩</div>
      <h1 style={{ fontSize:"2.2rem", color:"#00695c", margin:"0 0 8px" }}>WORD FUSION QUEST</h1>
      <p style={{ color:"#00796b", marginBottom:20 }}>Combine two words into one!</p>
      <input value={playerName} onChange={e=>setPlayerName(e.target.value)}
        placeholder="Enter your name to begin"
        style={{ padding:"12px 20px", borderRadius:12, border:"1px solid #80cbc4", background:"white", color:"#333", fontSize:"1rem", marginBottom:24, width:240, textAlign:"center" }}
      />
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        {LEVELS.map(lvl => (
          <button key={lvl.id} onClick={() => unlocked[lvl.id] && startLevel(lvl.id)} style={{
            padding:"14px 28px", borderRadius:16, border:"none",
            background: unlocked[lvl.id] ? lvl.color : "#e5e7eb",
            color: unlocked[lvl.id] ? "#fff" : "#9ca3af",
            fontWeight:800, fontSize:"1rem",
            cursor: unlocked[lvl.id] ? "pointer" : "not-allowed",
            boxShadow: unlocked[lvl.id] ? `0 4px 16px ${lvl.color}66` : "none",
          }}>{unlocked[lvl.id] ? lvl.label : `🔒 ${lvl.label}`}</button>
        ))}
      </div>
    </div>
  );

  if (screen === "complete") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#e0f7fa,#b2ebf2)",
      fontFamily:"'Segoe UI',sans-serif", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#00695c", marginBottom:8 }}>{currentLevelDef.label} Complete!</h2>
      <p style={{ color:"#00796b", fontSize:"1.2rem", marginBottom:8 }}>{playerName||"Player"}: {score} / {questions.length * 10}</p>
      <p style={{ color:"#4db6ac", fontSize:"0.9rem", marginBottom:24 }}>
        {score >= questions.length*7 ? "🌟 Great job! Next level unlocked!" : "Keep practicing to unlock the next level!"}
      </p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startLevel(levelId)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#6366f1", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Retry</button>
        {LEVELS.find(l=>l.id===levelId) && (() => { const nxt = LEVELS[LEVELS.findIndex(l=>l.id===levelId)+1]; return nxt && unlocked[nxt.id] ? <button onClick={() => startLevel(nxt.id)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:nxt.color, color:"#fff", fontWeight:700, cursor:"pointer" }}>➡️ {nxt.label}</button> : null; })()}
        <button onClick={() => setScreen("landing")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#94a3b8", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (!current) return null;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#e0f7fa,#b2ebf2,#e8f5e9)",
      fontFamily:"'Segoe UI',sans-serif", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ background:currentLevelDef.color, padding:"4px 14px", borderRadius:999, color:"#fff", fontWeight:700, fontSize:"0.85rem" }}>{currentLevelDef.label}</span>
          <span style={{ color:"#00695c", fontWeight:800 }}>🏆 {score}</span>
          <span style={{ color:"#64748b" }}>{idx+1}/{questions.length}</span>
        </div>
        <div style={{ height:6, background:"#b2dfdb", borderRadius:999, marginBottom:24, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(idx/questions.length)*100}%`, background:currentLevelDef.color, borderRadius:999, transition:"width 0.3s" }} />
        </div>

        {/* Word parts */}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:20, marginBottom:24, background:"white", borderRadius:24, padding:"24px 20px", boxShadow:"0 8px 24px #00695c22" }}>
          <div style={{ background:"#e0f2f1", padding:"14px 24px", borderRadius:16, fontWeight:800, fontSize:"1.8rem", color:"#00695c" }}>{current.part1}</div>
          <div style={{ fontSize:"1.8rem", color:"#94a3b8" }}>+</div>
          <div style={{ background:"#e8f5e9", padding:"14px 24px", borderRadius:16, fontWeight:800, fontSize:"1.8rem", color:"#2e7d32" }}>{current.part2}</div>
          <div style={{ fontSize:"1.8rem", color:"#94a3b8" }}>=</div>
          <div style={{ background:"#fef3c7", padding:"14px 24px", borderRadius:16, fontWeight:800, fontSize:"1.8rem", color:"#92400e", minWidth:120, textAlign:"center" }}>
            {answered ? current.answer : "❓"}
          </div>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", marginBottom:16 }}>
          {current.options.map(opt => {
            const isCorrect = answered && opt === current.answer;
            const isWrong = answered && opt === selected && opt !== current.answer;
            return (
              <button key={opt} onClick={() => answer(opt)} style={{
                padding:"12px 24px", borderRadius:999, border:"none",
                cursor: answered?"default":"pointer",
                fontWeight:700, fontSize:"0.95rem",
                background: isCorrect?"#22c55e":isWrong?"#ef4444":"#00695c",
                color:"#fff",
                boxShadow: isCorrect?"0 0 12px #22c55e88":isWrong?"none":`0 4px 0 #004d40`,
              }}>{opt}</button>
            );
          })}
        </div>

        {answered && (
          <div style={{ textAlign:"center" }}>
            <p style={{ fontWeight:700, color:selected===current.answer?"#16a34a":"#dc2626", marginBottom:12 }}>
              {selected===current.answer ? "🧩 Fused! Correct!" : `❌ Answer: "${current.answer}"`}
            </p>
            <button onClick={next} style={{ padding:"14px 32px", borderRadius:999, border:"none", background:"linear-gradient(135deg,#00695c,#00897b)", color:"#fff", fontWeight:800, cursor:"pointer" }}>
              {idx+1 < questions.length ? "➡️ Next" : "🏆 Finish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
