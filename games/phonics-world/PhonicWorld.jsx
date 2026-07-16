import { useState, useCallback } from "react";

const ISLANDS = {
  CH: {
    name: "CH Island", icon: "🏝️", color: "#f59e0b", bg: "#fffbeb",
    desc: "Words with CH sound",
    questions: [
      { q:"What do you sit on? 🪑", opts:["Chair","Stool","Bench","Couch"], correct:0 },
      { q:"Yellow food? 🧀", opts:["Butter","Cheese","Bread","Cracker"], correct:1 },
      { q:"Baby bird? 🐥", opts:["Bird","Duck","Hen","Chick"], correct:3 },
      { q:"Sweet treat? 🍫", opts:["Candy","Chocolate","Cookie","Cake"], correct:1 },
      { q:"Red fruit? 🍒", opts:["Apple","Berry","Cherry","Peach"], correct:2 },
      { q:"Building with cross? ⛪", opts:["House","Church","School","Castle"], correct:1 },
      { q:"Wrist timepiece? ⌚", opts:["Clock","Watch","Timer","Bracelet"], correct:1 },
      { q:"Spicy thing? 🌶️", opts:["Chili","Pepper","Spice","Tomato"], correct:0 },
      { q:"Sandy shore? 🏖️", opts:["Sand","Ocean","Beach","Island"], correct:2 },
      { q:"Kitchen boss? 👨‍🍳", opts:["Waiter","Chef","Baker","Farmer"], correct:1 },
    ],
  },
  SH: {
    name: "SH Island", icon: "🦈", color: "#3b82f6", bg: "#eff6ff",
    desc: "Words with SH sound",
    questions: [
      { q:"Underwater creature? 🦈", opts:["Whale","Shark","Fish","Eel"], correct:1 },
      { q:"Walk in store? 🛒", opts:["Browse","Shop","Buy","Look"], correct:1 },
      { q:"Sea dwelling mollusc? 🐚", opts:["Stone","Shell","Scale","Coral"], correct:1 },
      { q:"What keeps you warm? 🧥", opts:["Shirt","Jacket","Coat","Shawl"], correct:3 },
      { q:"Cut with scissors? ✂️", opts:["Slice","Shear","Cut","Trim"], correct:1 },
      { q:"What you sleep on? 🛏️", opts:["Pillow","Mattress","Sheet","Cover"], correct:2 },
      { q:"On a ship? 🚢", opts:["Dock","Shore","Boat","Ship"], correct:3 },
      { q:"A sparkle? ✨", opts:["Glow","Flash","Shine","Gleam"], correct:2 },
      { q:"Like a hut? 🏚️", opts:["Shack","House","Hut","Cabin"], correct:0 },
      { q:"The opposite of deep? 🌊", opts:["Light","Thin","Shallow","Small"], correct:2 },
    ],
  },
  TH: {
    name: "TH Island", icon: "🦁", color: "#8b5cf6", bg: "#faf5ff",
    desc: "Words with TH sound",
    questions: [
      { q:"Number after two? 3️⃣", opts:["Tree","Three","Free","Thee"], correct:1 },
      { q:"Appreciation word? 🙏", opts:["Please","Sorry","Thanks","Excuse"], correct:2 },
      { q:"Careful thought? 💭", opts:["Feeling","Think","Guess","Wonder"], correct:1 },
      { q:"Slim? 📏", opts:["Small","Narrow","Thin","Short"], correct:2 },
      { q:"Body part for tasting? 👅", opts:["Tooth","Throat","Tongue","Thumb"], correct:2 },
      { q:"Finger for hitchhiking? 👍", opts:["Thumb","Index","Pinky","Ring"], correct:0 },
      { q:"Be thankful? 😊", opts:["Thrill","Throb","Thank","Thrash"], correct:2 },
      { q:"Sharp point? 🌵", opts:["Spine","Thorn","Prick","Needle"], correct:1 },
      { q:"Number 30? 3️⃣0️⃣", opts:["Thirteen","Thirsty","Thirty","Fourteen"], correct:2 },
      { q:"In the direction of? ➡️", opts:["Through","Toward","Though","There"], correct:1 },
    ],
  },
  WH: {
    name: "WH Island", icon: "🐋", color: "#06b6d4", bg: "#ecfeff",
    desc: "Words with WH sound",
    questions: [
      { q:"Big ocean animal? 🐋", opts:["Walrus","Whale","Shark","Dolphin"], correct:1 },
      { q:"Turn around a point? ⚙️", opts:["Wheel","Rotate","Spin","Circle"], correct:0 },
      { q:"Pale colour? ⬜", opts:["Gray","Beige","White","Ivory"], correct:2 },
      { q:"Move air? 💨", opts:["Blow","Hiss","Whirl","Whoosh"], correct:2 },
      { q:"A question word? ❓", opts:["Why","How","Maybe","Because"], correct:0 },
      { q:"Cereal grain? 🌾", opts:["Oat","Corn","Wheat","Rye"], correct:2 },
      { q:"Dog sound? 🐶", opts:["Bark","Whimper","Growl","Howl"], correct:1 },
      { q:"Round spinning toy? 🪀", opts:["Wheel","Spinner","Whip","Whistler"], correct:0 },
      { q:"Make a sound with lips? 🎵", opts:["Sing","Hum","Whistle","Clap"], correct:2 },
      { q:"Very fast? 💨", opts:["Speedy","Whizz","Quick","Fast"], correct:1 },
    ],
  },
  PH: {
    name: "PH Island", icon: "📸", color: "#ec4899", bg: "#fdf2f8",
    desc: "Words with PH = F sound",
    questions: [
      { q:"A picture? 📸", opts:["Photo","Image","Sketch","Drawing"], correct:0 },
      { q:"Call on this? 📱", opts:["Phone","Radio","Device","Screen"], correct:0 },
      { q:"Study of matter? 🔬", opts:["Chemistry","Biology","Physics","Maths"], correct:2 },
      { q:"Elephant sound? 🐘", opts:["Roar","Trumpet","Hiss","Grunt"], correct:1 },
      { q:"Writing tool? ✏️", opts:["Pen","Pencil","Phat","Phantom"], correct:1 },
      { q:"Greek letter? 🇬🇷", opts:["Alpha","Phi","Beta","Gamma"], correct:1 },
      { q:"Sound system? 🔊", opts:["Speaker","Phonics","Audio","Sound"], correct:1 },
      { q:"A ghost? 👻", opts:["Spirit","Phantom","Shadow","Ghoul"], correct:1 },
      { q:"Type of word study? 📚", opts:["Grammar","Phonics","Syntax","Reading"], correct:1 },
      { q:"Sentence ending mark? ❗", opts:["Comma","Period","Phrase","Full stop"], correct:3 },
    ],
  },
};

const ISLAND_KEYS = Object.keys(ISLANDS);
const ISLAND_COLORS = { CH:"#f59e0b", SH:"#3b82f6", TH:"#8b5cf6", WH:"#06b6d4", PH:"#ec4899" };

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function PhonicWorld({ onComplete }) {
  const [screen, setScreen] = useState("map"); // map | game | result
  const [island, setIsland] = useState(null);
  const [unlocked, setUnlocked] = useState({ CH:true, SH:false, TH:false, WH:false, PH:false });
  const [completed, setCompleted] = useState({ CH:false, SH:false, TH:false, WH:false, PH:false });
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const startIsland = useCallback((key) => {
    if (!unlocked[key]) return;
    const islandData = ISLANDS[key];
    setIsland(key);
    setQuestions(shuffle(islandData.questions).slice(0, 8));
    setQIdx(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setScreen("game");
  }, [unlocked]);

  const current = questions[qIdx];

  const answer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === current.correct) setScore(s => s + 10);
  };

  const next = () => {
    if (qIdx + 1 >= questions.length) {
      // unlock next island
      const islandIdx = ISLAND_KEYS.indexOf(island);
      if (islandIdx + 1 < ISLAND_KEYS.length) {
        setUnlocked(u => ({ ...u, [ISLAND_KEYS[islandIdx + 1]]: true }));
      }
      setCompleted(c => ({ ...c, [island]: true }));
      setScreen("result");
      onComplete?.(score, Math.round((score / (questions.length * 10)) * 100));
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const islandData = island ? ISLANDS[island] : null;

  if (screen === "map") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#0c4a6e,#075985,#0369a1)",
      fontFamily:"'Segoe UI', sans-serif", color:"#e0f2fe", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3rem", marginBottom:8 }}>🗺️</div>
      <h1 style={{ fontSize:"2.2rem", color:"#7dd3fc", margin:"0 0 4px" }}>Phonics World</h1>
      <p style={{ color:"#93c5fd", marginBottom:32 }}>Explore the digraph islands!</p>

      <div style={{
        display:"grid", gridTemplateColumns:"repeat(3, 1fr)",
        gap:12, maxWidth:440,
      }}>
        {ISLAND_KEYS.map((key, i) => {
          const isl = ISLANDS[key];
          const isUnlocked = unlocked[key];
          const isDone = completed[key];
          return (
            <button key={key} onClick={() => startIsland(key)} style={{
              padding:"18px 12px", borderRadius:20,
              background: isUnlocked
                ? `linear-gradient(135deg,${isl.color},${isl.color}cc)`
                : "rgba(255,255,255,0.05)",
              color:"#fff", cursor: isUnlocked ? "pointer" : "not-allowed",
              border: isDone ? "2px solid #fbbf24" : "2px solid transparent",
              opacity: isUnlocked ? 1 : 0.5,
            }}>
              <div style={{ fontSize:"1.8rem", marginBottom:4 }}>{isl.icon}</div>
              <div style={{ fontWeight:800, fontSize:"1.2rem" }}>{key}</div>
              <div style={{ fontSize:"0.7rem", opacity:0.85, marginTop:2 }}>
                {isUnlocked ? (isDone ? "✅ Done" : isl.desc) : "🔒 Locked"}
              </div>
            </button>
          );
        })}
      </div>

      <p style={{ color:"#7dd3fc", fontSize:"0.85rem", marginTop:24 }}>
        Complete each island to unlock the next!
      </p>
    </div>
  );

  if (screen === "result") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:`linear-gradient(135deg,${islandData.color}33,#0c4a6e)`,
      fontFamily:"'Segoe UI', sans-serif", color:"#e0f2fe", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8 }}>{islandData.icon}</div>
      <h2 style={{ fontSize:"2rem", color:islandData.color, marginBottom:8 }}>
        {islandData.name} Complete!
      </h2>
      <p style={{ color:"#93c5fd", fontSize:"1.3rem", marginBottom:24 }}>
        Score: {score} / {questions.length * 10}
      </p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startIsland(island)} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:islandData.color, color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🔄 Retry</button>
        <button onClick={() => setScreen("map")} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"rgba(255,255,255,0.1)", color:"#e0f2fe", fontWeight:700, cursor:"pointer",
        }}>🗺️ World Map</button>
      </div>
    </div>
  );

  if (!current || !islandData) return null;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:`linear-gradient(135deg,${islandData.color}22,#0c4a6e)`,
      fontFamily:"'Segoe UI', sans-serif", color:"#e0f2fe", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{
            background:islandData.color, padding:"4px 14px", borderRadius:999, fontWeight:800,
            fontSize:"1rem", letterSpacing:2,
          }}>{island}</span>
          <span style={{ color:"#fbbf24", fontWeight:700 }}>⭐ {score}</span>
          <span style={{ color:"#93c5fd" }}>{qIdx+1}/{questions.length}</span>
        </div>

        <div style={{ height:6, background:"rgba(255,255,255,0.1)", borderRadius:999, marginBottom:20, overflow:"hidden" }}>
          <div style={{
            height:"100%", width:`${(qIdx/questions.length)*100}%`,
            background:islandData.color, borderRadius:999, transition:"width 0.3s",
          }} />
        </div>

        <div style={{
          background:"rgba(255,255,255,0.07)", borderRadius:24, padding:"28px 24px",
          textAlign:"center", marginBottom:20,
          border:`1px solid ${islandData.color}44`,
        }}>
          {/* Highlight the digraph in each option */}
          <p style={{ fontSize:"1.2rem", fontWeight:700, color:"#e0f2fe", margin:0, lineHeight:1.6 }}>
            {current.q}
          </p>
          {answered && (
            <p style={{ marginTop:10, fontWeight:700, color: selected===current.correct?"#4ade80":"#f87171" }}>
              {selected===current.correct
                ? `✅ Correct! "${current.opts[current.correct]}" contains ${island}!`
                : `❌ It's "${current.opts[current.correct]}"`}
            </p>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {current.opts.map((opt, i) => {
            const isCorrect = answered && i === current.correct;
            const isWrong   = answered && i === selected && i !== current.correct;
            // Highlight the digraph in the word
            const diIdx = opt.toLowerCase().indexOf(island.toLowerCase());
            const highlighted = diIdx >= 0
              ? <>{opt.slice(0,diIdx)}<span style={{color:islandData.color,fontWeight:900}}>{opt.slice(diIdx,diIdx+2)}</span>{opt.slice(diIdx+2)}</>
              : opt;
            return (
              <button key={i} onClick={() => answer(i)} style={{
                padding:"14px 12px", borderRadius:14,
                cursor:answered?"default":"pointer",
                fontWeight:700, fontSize:"1rem",
                background: isCorrect?"#166534":isWrong?"#7f1d1d":"rgba(255,255,255,0.08)",
                color: isCorrect?"#4ade80":isWrong?"#fca5a5":"#e0f2fe",
                border:`2px solid ${isCorrect?"#22c55e":isWrong?"#ef4444":"rgba(255,255,255,0.1)"}`,
                transition:"all 0.15s",
              }}>{highlighted}</button>
            );
          })}
        </div>

        {answered && (
          <div style={{ textAlign:"center", marginTop:16 }}>
            <button onClick={next} style={{
              padding:"13px 32px", borderRadius:999, border:"none",
              background:`linear-gradient(135deg,${islandData.color},${islandData.color}cc)`,
              color:"#fff", fontWeight:800, cursor:"pointer",
            }}>➡️ Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
