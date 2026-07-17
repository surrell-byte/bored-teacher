import { useState, useCallback } from "react";
import { useGame } from "@/lib/gameState";
import { playBeep as playTone } from "@/lib/sound/beep";

const EASY = [
  { name:"Frog",      emoji:"🐸", cls:"Amphibian" }, { name:"Cat",       emoji:"🐱", cls:"Mammal" },
  { name:"Parrot",    emoji:"🦜", cls:"Bird"      }, { name:"Goldfish",  emoji:"🐠", cls:"Fish" },
  { name:"Snake",     emoji:"🐍", cls:"Reptile"   }, { name:"Dog",       emoji:"🐶", cls:"Mammal" },
  { name:"Eagle",     emoji:"🦅", cls:"Bird"      }, { name:"Lizard",    emoji:"🦎", cls:"Reptile" },
  { name:"Trout",     emoji:"🐟", cls:"Fish"      }, { name:"Toad",      emoji:"🐸", cls:"Amphibian" },
  { name:"Cow",       emoji:"🐮", cls:"Mammal"    }, { name:"Penguin",   emoji:"🐧", cls:"Bird" },
];
const MEDIUM = [
  { name:"Bat",        emoji:"🦇", cls:"Mammal"    }, { name:"Turtle",    emoji:"🐢", cls:"Reptile" },
  { name:"Salamander", emoji:"🦎", cls:"Amphibian" }, { name:"Shark",     emoji:"🦈", cls:"Fish" },
  { name:"Ostrich",    emoji:"🐦", cls:"Bird"      }, { name:"Whale",     emoji:"🐋", cls:"Mammal" },
  { name:"Crocodile",  emoji:"🐊", cls:"Reptile"   }, { name:"Tuna",      emoji:"🐟", cls:"Fish" },
  { name:"Flamingo",   emoji:"🦩", cls:"Bird"      }, { name:"Axolotl",   emoji:"🦎", cls:"Amphibian" },
  { name:"Dolphin",    emoji:"🐬", cls:"Mammal"    }, { name:"Cobra",     emoji:"🐍", cls:"Reptile" },
];
const HARD = [
  { name:"Platypus",  emoji:"🦆", cls:"Mammal"    }, { name:"Tuatara",   emoji:"🦎", cls:"Reptile" },
  { name:"Cassowary", emoji:"🐦", cls:"Bird"       }, { name:"Lungfish",  emoji:"🐟", cls:"Fish" },
  { name:"Echidna",   emoji:"🦔", cls:"Mammal"    }, { name:"Caecilian", emoji:"🐛", cls:"Amphibian" },
  { name:"Gharial",   emoji:"🐊", cls:"Reptile"   }, { name:"Kakapo",    emoji:"🦜", cls:"Bird" },
  { name:"Coelacanth",emoji:"🐟", cls:"Fish"      }, { name:"Mudskipper",emoji:"🐟", cls:"Fish" },
  { name:"Olm",       emoji:"🦎", cls:"Amphibian" }, { name:"Narwhal",   emoji:"🦭", cls:"Mammal" },
];
const DB = { easy: EASY, medium: MEDIUM, hard: HARD };
const CLASSES = ["Mammal","Bird","Reptile","Amphibian","Fish"];
const COLS = { easy:"#22c55e", medium:"#f59e0b", hard:"#ef4444" };
const FACTS = {
  Mammal:"Warm-blooded, has fur or hair, feeds young with milk",
  Bird:"Has feathers, two wings, lays eggs",
  Reptile:"Cold-blooded, covered in scales",
  Amphibian:"Lives on land & water, moist skin",
  Fish:"Breathes through gills, lives in water",
};

function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }
function playBeep(type){
  playTone(type === "correct" ? 880 : 300, 0.25, type === "correct" ? 0.3 : 0.25);
}

export default function AnimalClassQuest({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen]     = useState("menu");
  const [level, setLevel]       = useState("easy");
  const [unlocked, setUnlocked] = useState({easy:true,medium:false,hard:false});
  const [questions, setQs]      = useState([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [streak, setStreak]     = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAns, setWrongAns] = useState(null);
  const [answered, setAnswered] = useState(false);

  const startLevel = useCallback((lvl)=>{
    setLevel(lvl); setQs(shuffle(DB[lvl])); setIdx(0); setScore(0); setStreak(0); setCorrectCount(0);
    setWrongAns(null); setAnswered(false); setScreen("game");
  },[]);

  const current = questions[idx];

  const answer = (cls) => {
    if(answered) return;
    setAnswered(true);
    if(cls===current.cls){
      playBeep("correct");
      setScore(s=>s+(10+(streak>=2?5:0)));
      setCorrectCount(c => c + 1);
      setStreak(s=>s+1);
    } else {
      playBeep("wrong");
      setWrongAns(cls);
      setStreak(0);
    }
  };

  const next = () => {
    const ni = idx+1;
    if(ni>=questions.length){
      const nxt = level==="easy"?"medium":level==="medium"?"hard":null;
      if(nxt) setUnlocked(u=>({...u,[nxt]:true}));

      const accuracy = Math.round((correctCount / questions.length) * 100);
      completeGame(
        'animal-quest',
        accuracy,
        questions.length
      );
            onComplete?.(accuracy, questions.length);

      setScreen("complete");
    } else {
      setIdx(ni); setAnswered(false); setWrongAns(null);
    }
  };

  /* ── MENU ── */
  if(screen==="menu") return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",background:"linear-gradient(135deg,#064e3b,#065f46,#047857)",
      fontFamily:"'Segoe UI',sans-serif",color:"#ecfdf5",padding:24,textAlign:"center"}}>
      <div style={{fontSize:"3.5rem",marginBottom:8}}>🐾</div>
      <h1 style={{fontSize:"2.2rem",margin:"0 0 6px",color:"#6ee7b7"}}>Animal Class Quest</h1>
      <p style={{color:"#a7f3d0",marginBottom:8}}>Classify every creature!</p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:32,fontSize:"0.8rem"}}>
        {CLASSES.map(c=>(
          <span key={c} style={{background:"rgba(255,255,255,0.1)",padding:"4px 12px",borderRadius:999,color:"#d1fae5"}}>{c}</span>
        ))}
      </div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center"}}>
        {["easy","medium","hard"].map(lvl=>(
          <button key={lvl} onClick={()=>unlocked[lvl]&&startLevel(lvl)} style={{
            padding:"16px 32px",borderRadius:16,border:"none",
            background:unlocked[lvl]?COLS[lvl]:"#374151",
            color:unlocked[lvl]?"#fff":"#9ca3af",
            fontWeight:800,fontSize:"1.1rem",
            cursor:unlocked[lvl]?"pointer":"not-allowed",
            boxShadow:unlocked[lvl]?`0 4px 16px ${COLS[lvl]}55`:"none",
            textTransform:"capitalize",
          }}>{unlocked[lvl]?lvl:`🔒 ${lvl}`}</button>
        ))}
      </div>
    </div>
  );

  /* ── COMPLETE ── */
  if(screen==="complete"){
    const nxt = level==="easy"?"medium":level==="medium"?"hard":null;
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",background:"linear-gradient(135deg,#064e3b,#065f46)",
        fontFamily:"'Segoe UI',sans-serif",color:"#ecfdf5",padding:24,textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:12}}>🏆</div>
        <h2 style={{fontSize:"2rem",color:"#fbbf24",marginBottom:8,textTransform:"capitalize"}}>{level} Complete!</h2>
        <p style={{color:"#a7f3d0",fontSize:"1.2rem",marginBottom:24}}>Score: {score}</p>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
          <button onClick={()=>startLevel(level)} style={{padding:"14px 28px",borderRadius:999,border:"none",background:"#6366f1",color:"#fff",fontWeight:700,cursor:"pointer"}}>🔄 Retry</button>
          {nxt&&unlocked[nxt]&&<button onClick={()=>startLevel(nxt)} style={{padding:"14px 28px",borderRadius:999,border:"none",background:COLS[nxt],color:"#fff",fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>➡️ {nxt}</button>}
          <button onClick={()=>setScreen("menu")} style={{padding:"14px 28px",borderRadius:999,border:"none",background:"#374151",color:"#fff",fontWeight:700,cursor:"pointer"}}>🏠 Menu</button>
        </div>
      </div>
    );
  }

  if(!current) return null;

  /* ── GAME ── */
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",background:"linear-gradient(135deg,#064e3b,#065f46,#047857)",
      fontFamily:"'Segoe UI',sans-serif",color:"#ecfdf5",padding:24}}>
      <div style={{width:"100%",maxWidth:"min(760px, calc(100vw - 56px))"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{background:COLS[level],padding:"4px 14px",borderRadius:999,fontWeight:700,fontSize:"0.85rem",textTransform:"capitalize"}}>{level}</span>
          <span style={{color:"#fbbf24",fontWeight:800}}>⭐ {score} {streak>=2&&`🔥×${streak}`}</span>
          <span style={{color:"#a7f3d0"}}>{idx+1}/{questions.length}</span>
        </div>
        <div style={{height:5,background:"rgba(255,255,255,0.1)",borderRadius:999,marginBottom:20,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(idx/questions.length)*100}%`,background:"#34d399",borderRadius:999,transition:"width 0.3s"}}/>
        </div>

        {/* Animal card */}
        <div style={{
          background:"rgba(255,255,255,0.08)",borderRadius:24,padding:28,textAlign:"center",marginBottom:20,
          border:`2px solid ${answered?(wrongAns?COLS.hard:"#22c55e"):"rgba(255,255,255,0.1)"}`,
          transition:"border 0.2s",
        }}>
          <div style={{fontSize:"clamp(3.2rem, 8vw, 6.5rem)",marginBottom:10}}>{current.emoji}</div>
          <h2 style={{fontSize:"2rem",margin:"0 0 6px",color:"#6ee7b7"}}>{current.name}</h2>
          {answered&&<p style={{color:"#a7f3d0",fontSize:"0.9rem",margin:0}}>{FACTS[current.cls]}</p>}
        </div>

        {/* Class buttons */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(10px, 1.6vw, 18px)"}}>
          {CLASSES.map(cls=>{
            const isRight=answered&&cls===current.cls;
            const isWrong=answered&&cls===wrongAns&&cls!==current.cls;
            return (
              <button key={cls} onClick={()=>answer(cls)} style={{
                padding:"clamp(13px,2vw,20px) clamp(16px,2vw,22px)",borderRadius:14,
                cursor:answered?"default":"pointer",fontWeight:700,fontSize:"clamp(0.95rem,1.6vw,1.25rem)",
                background:isRight?"#166534":isWrong?"#7f1d1d":"rgba(255,255,255,0.1)",
                color:isRight?"#4ade80":isWrong?"#fca5a5":"#ecfdf5",
                border:`2px solid ${isRight?"#22c55e":isWrong?"#ef4444":"transparent"}`,
                transition:"all 0.15s",
                gridColumn:CLASSES.length%2!==0&&cls===CLASSES[CLASSES.length-1]?"1 / -1":"auto",
              }}>{cls}</button>
            );
          })}
        </div>

        {answered&&(
          <div style={{textAlign:"center",marginTop:16}}>
            <p style={{fontWeight:700,color:wrongAns?"#f87171":"#4ade80",margin:"0 0 10px"}}>
              {wrongAns?`❌ It's a ${current.cls}!`:`✅ Correct! ${streak>=2?`🔥 ${streak} streak!`:""}`}
            </p>
            <button onClick={next} style={{
              padding:"13px 32px",borderRadius:999,border:"none",
              background:"linear-gradient(135deg,#059669,#047857)",
              color:"#fff",fontWeight:800,cursor:"pointer",
            }}>➡️ Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
