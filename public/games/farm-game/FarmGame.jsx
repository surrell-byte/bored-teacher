import { useState, useCallback } from "react";

const ANIMALS = [
  { name:"Cow",     emoji:"🐄", sound:"Moo!",     fact:"Cows produce milk" },
  { name:"Sheep",   emoji:"🐑", sound:"Baa!",     fact:"Sheep grow wool coats" },
  { name:"Duck",    emoji:"🦆", sound:"Quack!",   fact:"Ducks love water" },
  { name:"Dog",     emoji:"🐕", sound:"Woof!",    fact:"Dogs are loyal pets" },
  { name:"Pig",     emoji:"🐖", sound:"Oink!",    fact:"Pigs are very smart" },
  { name:"Chicken", emoji:"🐓", sound:"Cluck!",   fact:"Chickens lay eggs" },
  { name:"Goat",    emoji:"🐐", sound:"Meh!",     fact:"Goats will eat almost anything" },
  { name:"Donkey",  emoji:"🫏", sound:"Hee-haw!", fact:"Donkeys carry heavy loads" },
  { name:"Horse",   emoji:"🐎", sound:"Neigh!",   fact:"Horses can run very fast" },
  { name:"Turkey",  emoji:"🦃", sound:"Gobble!",  fact:"Turkeys can fly short distances" },
];

const LEVELS = [
  { name:"🐣 Barn Buddies",  animals:["Cow","Sheep","Duck","Dog"],             color:"#22c55e" },
  { name:"🐷 Pigpen Pals",   animals:["Pig","Chicken","Goat","Donkey"],        color:"#f59e0b" },
  { name:"🏆 Pasture Masters",animals:["Horse","Turkey","Donkey","Cow"],       color:"#ef4444" },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function getAnimal(name) { return ANIMALS.find(a => a.name === name); }

function buildQuestion(targetName, allNames) {
  const target = getAnimal(targetName);
  const wrong = shuffle(allNames.filter(n => n !== targetName)).slice(0, 3).map(getAnimal);
  const options = shuffle([target, ...wrong]);
  const type = Math.floor(Math.random() * 3); // 0=name→emoji, 1=emoji→name, 2=sound→name
  return { target, options, type };
}

export default function FarmGame() {
  const [screen, setScreen] = useState("welcome");
  const [playerName, setPlayerName] = useState("");
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState([true, false, false]);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const startLevel = useCallback((li) => {
    const lvl = LEVELS[li];
    const qs = shuffle(lvl.animals.flatMap(name => [
      buildQuestion(name, lvl.animals),
      buildQuestion(name, lvl.animals),
    ]));
    setLevelIdx(li);
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setScreen("game");
  }, []);

  const current = questions[idx];

  const answer = (optName) => {
    if (answered) return;
    setSelected(optName);
    setAnswered(true);
    if (optName === current.target.name) setScore(s => s + 10);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const nextLi = levelIdx + 1;
      if (nextLi < LEVELS.length) setUnlocked(u => u.map((v,i) => i===nextLi?true:v));
      setScreen("complete");
    } else {
      setIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const renderQuestion = () => {
    if (!current) return null;
    const { target, type } = current;
    if (type === 0) return (
      <div style={{ textAlign:"center" }}>
        <p style={{ color:"#92400e", fontSize:"1.1rem", fontWeight:700 }}>Which animal is this?</p>
        <div style={{ fontSize:"5rem", margin:"12px 0" }}>{target.emoji}</div>
      </div>
    );
    if (type === 1) return (
      <div style={{ textAlign:"center" }}>
        <p style={{ color:"#92400e", fontSize:"1.1rem", fontWeight:700 }}>Which animal says...</p>
        <div style={{ fontSize:"2.2rem", fontWeight:800, color:"#78350f", margin:"16px 0", background:"#fef3c7", padding:"12px 24px", borderRadius:16 }}>{target.sound}</div>
      </div>
    );
    return (
      <div style={{ textAlign:"center" }}>
        <p style={{ color:"#92400e", fontSize:"1.1rem", fontWeight:700 }}>Match the name to the animal!</p>
        <div style={{ fontSize:"2rem", fontWeight:800, color:"#78350f", margin:"16px 0" }}>{target.name}</div>
      </div>
    );
  };

  if (screen === "welcome") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#86efac 0%,#4ade80 30%,#86efac 60%,#fde68a 100%)",
      fontFamily:"'Segoe UI',sans-serif", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🌾</div>
      <h1 style={{ fontSize:"2.2rem", color:"#14532d", margin:"0 0 4px" }}>Farm World ESL</h1>
      <p style={{ color:"#166534", marginBottom:20 }}>Learn farm animals!</p>
      <input value={playerName} onChange={e=>setPlayerName(e.target.value)}
        placeholder="Enter your name"
        style={{ padding:"12px 20px", borderRadius:12, border:"2px solid #86efac", background:"white", color:"#333", fontSize:"1rem", marginBottom:24, width:240, textAlign:"center" }}
      />
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        {LEVELS.map((lvl, i) => (
          <button key={i} onClick={() => unlocked[i] && startLevel(i)} style={{
            padding:"16px 28px", borderRadius:16, border:"none",
            background: unlocked[i] ? lvl.color : "#d1d5db",
            color: unlocked[i] ? "#fff" : "#9ca3af",
            fontWeight:800, fontSize:"1rem", cursor: unlocked[i]?"pointer":"not-allowed",
          }}>
            {unlocked[i] ? lvl.name : `🔒 ${lvl.name}`}
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "complete") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#86efac,#4ade80)",
      fontFamily:"'Segoe UI',sans-serif", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#14532d", marginBottom:8 }}>{LEVELS[levelIdx].name} Complete!</h2>
      <p style={{ color:"#166534", fontSize:"1.2rem", marginBottom:24 }}>{playerName||"Farmer"}: {score} / {questions.length * 10} pts</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startLevel(levelIdx)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#6366f1", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Retry</button>
        {levelIdx+1 < LEVELS.length && unlocked[levelIdx+1] && (
          <button onClick={() => startLevel(levelIdx+1)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:LEVELS[levelIdx+1].color, color:"#fff", fontWeight:700, cursor:"pointer" }}>➡️ Next</button>
        )}
        <button onClick={() => setScreen("welcome")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (!current) return null;
  const { target, options, type } = current;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#86efac 0%,#4ade80 30%,#fde68a 100%)",
      fontFamily:"'Segoe UI',sans-serif", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ background:LEVELS[levelIdx].color, padding:"4px 14px", borderRadius:999, color:"#fff", fontWeight:700, fontSize:"0.85rem" }}>
            {LEVELS[levelIdx].name}
          </span>
          <span style={{ color:"#14532d", fontWeight:800 }}>🌾 {score}</span>
          <span style={{ color:"#166534" }}>{idx+1}/{questions.length}</span>
        </div>
        <div style={{ height:6, background:"rgba(0,0,0,0.1)", borderRadius:999, marginBottom:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(idx/questions.length)*100}%`, background:LEVELS[levelIdx].color, borderRadius:999, transition:"width 0.3s" }} />
        </div>

        <div style={{ background:"white", borderRadius:24, padding:28, textAlign:"center", marginBottom:20, boxShadow:"0 8px 24px rgba(0,0,0,0.1)", border:"2px solid #86efac" }}>
          {renderQuestion()}
          {answered && (
            <div style={{ background:"#f0fdf4", borderRadius:12, padding:"10px 16px", marginTop:12 }}>
              <p style={{ fontSize:"0.85rem", color:"#166534" }}>🌻 {target.fact}</p>
            </div>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {options.map(opt => {
            const isCorrect = answered && opt.name === target.name;
            const isWrong = answered && opt.name === selected && opt.name !== target.name;
            const display = type === 0 || type === 1 ? opt.name : opt.emoji;
            return (
              <button key={opt.name} onClick={() => answer(opt.name)} style={{
                padding:"16px", borderRadius:16, border:"2px solid",
                borderColor: isCorrect?"#22c55e":isWrong?"#ef4444":"#86efac",
                cursor: answered?"default":"pointer",
                fontWeight:700, fontSize: type===2?"2rem":"1rem",
                background: isCorrect?"#f0fdf4":isWrong?"#fef2f2":"white",
                color: isCorrect?"#166534":isWrong?"#dc2626":"#14532d",
                transition:"all 0.15s",
              }}>{display}</button>
            );
          })}
        </div>

        {answered && (
          <div style={{ textAlign:"center", marginTop:16 }}>
            <p style={{ fontWeight:700, color:selected===target.name?"#166534":"#dc2626", marginBottom:12 }}>
              {selected===target.name ? `🐄 Correct! ${target.sound}` : `❌ It's ${target.name} ${target.emoji}`}
            </p>
            <button onClick={next} style={{ padding:"14px 32px", borderRadius:999, border:"none", background:LEVELS[levelIdx].color, color:"#fff", fontWeight:800, cursor:"pointer" }}>
              {idx+1 < questions.length ? "🌾 Next" : "🏆 Finish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
