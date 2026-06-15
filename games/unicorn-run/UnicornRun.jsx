import { useState, useCallback, useEffect } from "react";

const QUESTIONS_DB = {
  1: [
    { emoji:"✏️", sentence:"I write with a ______.", correct:"Pencil", options:["Pen","Pencil","Marker","Crayon"] },
    { emoji:"🍎", sentence:"A healthy red fruit is an ______.", correct:"Apple", options:["Orange","Apple","Banana","Grape"] },
    { emoji:"🐱", sentence:"A small furry pet that says meow is a ______.", correct:"Cat", options:["Dog","Cat","Mouse","Bird"] },
    { emoji:"🚗", sentence:"You drive on the road in a ______.", correct:"Car", options:["Bike","Car","Bus","Train"] },
    { emoji:"☀️", sentence:"The bright star in the sky is the ______.", correct:"Sun", options:["Moon","Sun","Star","Cloud"] },
    { emoji:"📚", sentence:"You read stories from a ______.", correct:"Book", options:["Notebook","Book","Magazine","Diary"] },
    { emoji:"🐟", sentence:"This animal lives in water and has fins: ______.", correct:"Fish", options:["Whale","Fish","Shark","Dolphin"] },
    { emoji:"🏠", sentence:"A place where families live is a ______.", correct:"House", options:["Apartment","House","Castle","Cottage"] },
    { emoji:"🍕", sentence:"Round, cheesy Italian dish: ______.", correct:"Pizza", options:["Burger","Pizza","Pasta","Salad"] },
    { emoji:"🎂", sentence:"You blow candles on a birthday ______.", correct:"Cake", options:["Pie","Cake","Cookie","Muffin"] },
  ],
  2: [
    { emoji:"🐶", sentence:"A loyal pet that barks is a ______.", correct:"Dog", options:["Cat","Dog","Rabbit","Hamster"] },
    { emoji:"✈️", sentence:"Flies in the sky, transports people: ______.", correct:"Airplane", options:["Helicopter","Airplane","Rocket","Drone"] },
    { emoji:"🎨", sentence:"You paint pictures with a ______.", correct:"Brush", options:["Pen","Brush","Crayon","Marker"] },
    { emoji:"🏀", sentence:"Sport played with an orange ball and hoop: ______.", correct:"Basketball", options:["Soccer","Basketball","Tennis","Baseball"] },
    { emoji:"🎵", sentence:"You listen to this with headphones: ______.", correct:"Music", options:["Radio","Music","Song","Melody"] },
    { emoji:"🌧️", sentence:"Water falling from clouds: ______.", correct:"Rain", options:["Snow","Rain","Hail","Fog"] },
    { emoji:"📱", sentence:"Smart device for calls and apps: ______.", correct:"Phone", options:["Tablet","Phone","Laptop","Watch"] },
    { emoji:"🌺", sentence:"A pretty plant that blooms in spring: ______.", correct:"Flower", options:["Tree","Flower","Bush","Grass"] },
    { emoji:"🐘", sentence:"The largest land animal with a trunk: ______.", correct:"Elephant", options:["Hippo","Elephant","Rhino","Giraffe"] },
    { emoji:"🌊", sentence:"A large body of salt water: ______.", correct:"Ocean", options:["Lake","Ocean","River","Sea"] },
  ],
  3: [
    { emoji:"🔭", sentence:"Scientists use this to study stars: ______.", correct:"Telescope", options:["Microscope","Telescope","Binoculars","Camera"] },
    { emoji:"🦋", sentence:"An insect that starts life as a caterpillar: ______.", correct:"Butterfly", options:["Moth","Butterfly","Dragonfly","Firefly"] },
    { emoji:"🌋", sentence:"A mountain that can erupt with lava: ______.", correct:"Volcano", options:["Mountain","Volcano","Hill","Cliff"] },
    { emoji:"🎭", sentence:"A building where plays are performed: ______.", correct:"Theatre", options:["Cinema","Theatre","Stadium","Gym"] },
    { emoji:"🧲", sentence:"A device that attracts iron and steel: ______.", correct:"Magnet", options:["Battery","Magnet","Compass","Wire"] },
    { emoji:"🌈", sentence:"Colourful arc seen after rain: ______.", correct:"Rainbow", options:["Aurora","Rainbow","Spectrum","Prism"] },
    { emoji:"🐠", sentence:"A coral reef ecosystem animal with stripes: ______.", correct:"Clownfish", options:["Goldfish","Clownfish","Angelfish","Swordfish"] },
    { emoji:"🧬", sentence:"The molecule that carries genetic information: ______.", correct:"DNA", options:["RNA","DNA","Protein","Cell"] },
    { emoji:"🌍", sentence:"The planet we live on: ______.", correct:"Earth", options:["Mars","Earth","Venus","Jupiter"] },
    { emoji:"⚡", sentence:"Static discharge during a thunderstorm: ______.", correct:"Lightning", options:["Thunder","Lightning","Storm","Wind"] },
  ],
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function UnicornRun({ onComplete }) {
  const [screen, setScreen] = useState("start");
  const [playerName, setPlayerName] = useState("");
  const [level, setLevel] = useState(1);
  const [unlocked, setUnlocked] = useState({ 1:true, 2:false, 3:false });
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("unicorn-run-v1");
    if (saved) {
      try { setUnlocked(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("unicorn-run-v1", JSON.stringify(unlocked));
  }, [unlocked]);

  const startLevel = useCallback((lvl) => {
    setLevel(lvl);
    setQuestions(shuffle(QUESTIONS_DB[lvl]));
    setIdx(0); setScore(0); setLives(3); setSelected(null); setAnswered(false); setScreen("game");
  }, []);

  const current = questions[idx];

  const answer = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.correct) {
      setScore(s => s + 10);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) { setTimeout(() => setScreen("gameover"), 900); }
    }
  };

  const next = () => {
    if (lives <= 0) return;
    if (idx + 1 >= questions.length) {
      if (QUESTIONS_DB[level + 1]) setUnlocked(u => ({ ...u, [level + 1]: true }));
      const accuracy = Math.round((score / (questions.length * 10)) * 100);
      onComplete?.(score, accuracy);
      setScreen("complete");
    } else {
      setIdx(i => i + 1); setSelected(null); setAnswered(false);
    }
  };

  const LEVEL_COLORS = { 1:"#ec4899", 2:"#8b5cf6", 3:"#f59e0b" };

  if (screen === "start") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#4a0072,#7b1fa2,#e91e63)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center" }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🦄</div>
      <h1 style={{ fontSize:"2rem", color:"#fce4ec" }}>🦄 Unicorn Run</h1>
      <p style={{ color:"#f8bbd0", marginBottom:20 }}>Vocabulary Adventure</p>
      <input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="Enter your magical name" style={{ padding:"12px 20px", borderRadius:12, border:"none", background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:"1rem", marginBottom:24, width:240, textAlign:"center" }} />
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        {[1,2,3].map(lvl => (
          <button key={lvl} onClick={() => unlocked[lvl] && startLevel(lvl)} style={{ padding:"14px 28px", borderRadius:16, border:"none", background: unlocked[lvl] ? LEVEL_COLORS[lvl] : "#374151", color:"#fff", fontWeight:800, fontSize:"1rem", cursor: unlocked[lvl] ? "pointer" : "not-allowed", boxShadow: unlocked[lvl] ? `0 4px 16px ${LEVEL_COLORS[lvl]}66` : "none" }}>{unlocked[lvl] ? `Level ${lvl}` : `🔒 Level ${lvl}`}</button>
        ))}
      </div>
    </div>
  );

  if (screen === "complete") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#4a0072,#7b1fa2)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center" }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>🌈</div>
      <h2 style={{ fontSize:"2rem", color:"#fce4ec", marginBottom:8 }}>Level {level} Complete!</h2>
      <p style={{ color:"#f8bbd0", fontSize:"1.2rem", marginBottom:24 }}>{playerName||"Player"}: {score} pts · {lives}❤️ left</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startLevel(level)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#6366f1", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Retry</button>
        {QUESTIONS_DB[level+1] && unlocked[level+1] && <button onClick={() => startLevel(level+1)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:LEVEL_COLORS[level+1], color:"#fff", fontWeight:700, cursor:"pointer" }}>🦄 Next Level</button>}
        <button onClick={() => setScreen("start")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (screen === "gameover") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#4a0072,#7b1fa2)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center" }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>💔</div>
      <h2 style={{ fontSize:"2rem", color:"#fce4ec", marginBottom:8 }}>Game Over!</h2>
      <p style={{ color:"#f8bbd0", marginBottom:24 }}>Score: {score} pts</p>
      <div style={{ display:"flex", gap:12 }}><button onClick={() => startLevel(level)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#ec4899", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 Try Again</button><button onClick={() => setScreen("start")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button></div>
    </div>
  );

  if (!current) return null;

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#4a0072,#7b1fa2,#e91e63)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24 }}>
      <div style={{ width:"100%", maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ background:LEVEL_COLORS[level], padding:"4px 14px", borderRadius:999, fontWeight:700, fontSize:"0.85rem" }}>LEVEL {level}</span>
          <span style={{ color:"#fce4ec", fontWeight:800 }}>🏆 {score}</span>
          <span>{Array.from({length:3},(_,i)=>i<lives?"❤️":"🖤").join("")}</span>
        </div>
        <div style={{ height:6, background:"rgba(255,255,255,0.2)", borderRadius:999, marginBottom:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(idx/questions.length)*100}%`, background:"#fce4ec", borderRadius:999, transition:"width 0.3s" }} />
        </div>
        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:24, padding:28, textAlign:"center", marginBottom:20, border:"1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ fontSize:"4rem", marginBottom:12 }}>{current.emoji}</div>
          <p style={{ fontSize:"1.15rem", fontWeight:600, lineHeight:1.6 }}>{current.sentence}</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {current.options.map(opt => {
            const isCorrect = answered && opt === current.correct;
            const isWrong = answered && opt === selected && opt !== current.correct;
            return (<button key={opt} onClick={() => answer(opt)} style={{ padding:"14px", borderRadius:14, border:"2px solid", borderColor: isCorrect?"#4ade80":isWrong?"#f87171":"rgba(255,255,255,0.2)", cursor: answered?"default":"pointer", fontWeight:700, fontSize:"0.95rem", background: isCorrect?"rgba(34,197,94,0.2)":isWrong?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.1)", color:"#fff", transition:"all 0.15s" }}>{opt}</button>);
          })}
        </div>
        {answered && (<div style={{ textAlign:"center", marginTop:16 }}><p style={{ fontWeight:700, color:selected===current.correct?"#4ade80":"#f87171", marginBottom:12 }}>{selected===current.correct ? "🌟 Magical! Correct!" : `❌ Answer: "${current.correct}"`}</p>{lives > 0 && (<button onClick={next} style={{ padding:"14px 32px", borderRadius:999, border:"none", background:"linear-gradient(135deg,#ec4899,#be185d)", color:"#fff", fontWeight:800, cursor:"pointer" }}>{idx+1 < questions.length ? "🦄 Next" : "🌈 Finish"}</button>)}</div>)}
      </div>
    </div>
  );
}