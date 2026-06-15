import { useState, useCallback } from "react";
import { useGame } from "@/lib/gameState";

const PAIRS = [
  { animal:"🐕", animalWord:"DOG",    food:"🦴", foodWord:"BONE" },
  { animal:"🐴", animalWord:"HORSE",  food:"🍎", foodWord:"APPLE" },
  { animal:"🐱", animalWord:"CAT",    food:"🐟", foodWord:"FISH" },
  { animal:"🐭", animalWord:"MOUSE",  food:"🧀", foodWord:"CHEESE" },
  { animal:"🐦", animalWord:"BIRD",   food:"🪱", foodWord:"WORM" },
  { animal:"🦁", animalWord:"LION",   food:"🍗", foodWord:"DRUMSTICK" },
  { animal:"🐰", animalWord:"RABBIT", food:"🥕", foodWord:"CARROT" },
  { animal:"🐵", animalWord:"MONKEY", food:"🍌", foodWord:"BANANA" },
];

const THEMES = [
  { name:"Gold",     bg:"linear-gradient(135deg,#c4a45a,#e8c97a)", color:"#7a4f00" },
  { name:"Emerald",  bg:"linear-gradient(135deg,#2ecc71,#1abc9c)", color:"#064e3b" },
  { name:"Sapphire", bg:"linear-gradient(135deg,#3498db,#2980b9)", color:"#1e3a5f" },
  { name:"Rose",     bg:"linear-gradient(135deg,#e91e63,#c2185b)", color:"#5b0020" },
  { name:"Violet",   bg:"linear-gradient(135deg,#9b59b6,#8e44ad)", color:"#3b0764" },
];

const AVATARS = ["🐶","🐼","🦊","🐯","🐸","🐧","🦁","🐨"];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function FindMyFood() {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("welcome");
  const [theme, setTheme] = useState(0);
  const [p1, setP1] = useState({ name:"Player 1", avatar:"🐶" });
  const [p2, setP2] = useState({ name:"Player 2", avatar:"🐼" });
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [locked, setLocked] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [scores, setScores] = useState({ 1:0, 2:0 });
  const [moveCount, setMoveCount] = useState(0);
  const [pairCount, setPairCount] = useState(4);

  const startGame = useCallback((numPairs) => {
    const chosen = shuffle(PAIRS).slice(0, numPairs);
    const deck = shuffle([
      ...chosen.map((p, i) => ({ id: i*2, pairId:i, emoji:p.animal, label:p.animalWord })),
      ...chosen.map((p, i) => ({ id: i*2+1, pairId:i, emoji:p.food,  label:p.foodWord })),
    ]);
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setLocked(false);
    setCurrentPlayer(1);
    setScores({ 1:0, 2:0 });
    setMoveCount(0);
    setScreen("game");
  }, []);

  const flip = (idx) => {
    const card = cards[idx];
    if (locked || flipped.includes(idx) || matched.has(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      setLocked(true);
      const nextMoves = moveCount + 1;
      setMoveCount(nextMoves);
      const [a, b] = next.map(i => cards[i]);
      if (a.pairId === b.pairId) {
        const newMatched = new Set([...matched, next[0], next[1]]);
        setMatched(newMatched);
        const nextScore = scores[currentPlayer] + 10;
        setScores(s => ({ ...s, [currentPlayer]: nextScore }));
        setFlipped([]);
        setLocked(false);
        if (newMatched.size === cards.length) {
          const finalScores = { ...scores, [currentPlayer]: nextScore };
          const accuracy = finalScores[1] > finalScores[2] ? 100 : finalScores[1] === finalScores[2] ? 50 : 0;
          completeGame('find-my-food', accuracy, nextMoves);
          setScreen("end");
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
          setCurrentPlayer(p => p === 1 ? 2 : 1);
        }, 1000);
      }
    }
  };

  const t = THEMES[theme];

  if (screen === "welcome") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#1c1c2e,#16213e)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🍖</div>
      <h1 style={{ fontSize:"2.2rem", color:"#fbbf24", margin:"0 0 4px" }}>Find My Food</h1>
      <p style={{ color:"#94a3b8", marginBottom:32 }}>Match each animal with its favourite food!</p>

      <div style={{ marginBottom:24 }}>
        <p style={{ color:"#64748b", marginBottom:12, fontSize:"0.9rem" }}>CHOOSE THEME</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          {THEMES.map((t, i) => (
            <div key={i} onClick={() => setTheme(i)} style={{
              width:44, height:44, borderRadius:12, background:t.bg, cursor:"pointer",
              border: theme===i?"3px solid #fff":"3px solid transparent", boxSizing:"border-box",
            }} />
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:24, marginBottom:32, flexWrap:"wrap", justifyContent:"center" }}>
        {[p1, p2].map((p, pi) => (
          <div key={pi} style={{ background:"rgba(255,255,255,0.06)", borderRadius:16, padding:"16px 20px", minWidth:180 }}>
            <p style={{ color:"#94a3b8", fontSize:"0.85rem", margin:"0 0 8px" }}>PLAYER {pi+1}</p>
            <input value={p.name} onChange={e => pi===0?setP1(x=>({...x,name:e.target.value})):setP2(x=>({...x,name:e.target.value}))}
              style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid #334155", background:"#1e293b", color:"#fff", fontSize:"0.95rem", boxSizing:"border-box", marginBottom:10 }} />
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {AVATARS.map(av => (
                <button key={av} onClick={() => pi===0?setP1(x=>({...x,avatar:av})):setP2(x=>({...x,avatar:av}))}
                  style={{ width:36, height:36, borderRadius:8, border:"2px solid", fontSize:"1.2rem",
                    borderColor: p.avatar===av?"#fbbf24":"transparent",
                    background:"rgba(255,255,255,0.06)", cursor:"pointer" }}>
                  {av}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        {[4,6,8].map(n => (
          <button key={n} onClick={() => { setPairCount(n); startGame(n); }} style={{
            padding:"14px 28px", borderRadius:16, border:"none",
            background:t.bg, color:"white", fontWeight:800, fontSize:"1rem", cursor:"pointer",
            boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
          }}>{n} Pairs</button>
        ))}
      </div>
    </div>
  );

  if (screen === "end") {
    const winner = scores[1] > scores[2] ? p1 : scores[2] > scores[1] ? p2 : null;
    return (
      <div style={{
        minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        background:"linear-gradient(135deg,#1c1c2e,#16213e)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:24, textAlign:"center",
      }}>
        <div style={{ fontSize:"4rem", marginBottom:12 }}>{winner ? winner.avatar : "🤝"}</div>
        <h2 style={{ fontSize:"2rem", color:"#fbbf24", marginBottom:8 }}>
          {winner ? `${winner.name} Wins!` : "It's a Tie!"}
        </h2>
        <div style={{ display:"flex", gap:24, marginBottom:24 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"2rem" }}>{p1.avatar}</div>
            <div style={{ color:"#94a3b8" }}>{p1.name}</div>
            <div style={{ color:"#fbbf24", fontWeight:800, fontSize:"1.5rem" }}>{scores[1]}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"2rem" }}>{p2.avatar}</div>
            <div style={{ color:"#94a3b8" }}>{p2.name}</div>
            <div style={{ color:"#fbbf24", fontWeight:800, fontSize:"1.5rem" }}>{scores[2]}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={() => startGame(pairCount)} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:t.bg, color:"white", fontWeight:700, cursor:"pointer" }}>🔄 Play Again</button>
          <button onClick={() => setScreen("welcome")} style={{ padding:"14px 28px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button>
        </div>
      </div>
    );
  }

  const cols = cards.length <= 8 ? 4 : 4;
  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#1c1c2e,#16213e)", fontFamily:"'Segoe UI',sans-serif", color:"#fff", padding:16,
    }}>
      {/* HUD */}
      <div style={{ display:"flex", gap:24, marginBottom:16, width:"100%", maxWidth:480, justifyContent:"space-between" }}>
        <div style={{ textAlign:"center", opacity: currentPlayer===1?1:0.5 }}>
          <div>{p1.avatar} {p1.name}</div>
          <div style={{ color:"#fbbf24", fontWeight:800, fontSize:"1.3rem" }}>{scores[1]}</div>
        </div>
        <div style={{ textAlign:"center", fontSize:"0.85rem", color:"#94a3b8", alignSelf:"center" }}>
          {currentPlayer===1?p1.avatar:p2.avatar} Turn
        </div>
        <div style={{ textAlign:"center", opacity: currentPlayer===2?1:0.5 }}>
          <div>{p2.avatar} {p2.name}</div>
          <div style={{ color:"#fbbf24", fontWeight:800, fontSize:"1.3rem" }}>{scores[2]}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:10, maxWidth:480 }}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.has(idx);
          const isMatched = matched.has(idx);
          return (
            <div key={idx} onClick={() => flip(idx)} style={{
              width:90, height:90, borderRadius:16, cursor: isMatched||isFlipped?"default":"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              background: isMatched ? "linear-gradient(135deg,#166534,#15803d)" : isFlipped ? t.bg : "rgba(255,255,255,0.06)",
              boxShadow: isMatched?"0 0 14px #22c55e44":"0 4px 12px rgba(0,0,0,0.3)",
              border: isFlipped&&!isMatched?"2px solid rgba(255,255,255,0.3)":"2px solid transparent",
              transform: isFlipped?"scale(1.04)":"scale(1)",
              transition:"all 0.2s", userSelect:"none",
            }}>
              {isFlipped ? (
                <>
                  <div style={{ fontSize:"1.8rem" }}>{card.emoji}</div>
                  <div style={{ fontSize:"0.55rem", fontWeight:800, color:isMatched?"#4ade80":"rgba(255,255,255,0.9)", marginTop:2, letterSpacing:0.5 }}>{card.label}</div>
                </>
              ) : <div style={{ fontSize:"1.8rem" }}>?</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
