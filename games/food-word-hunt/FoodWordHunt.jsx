import { useState, useCallback, useEffect } from "react";
import { useStorage } from "@/hooks/useStorage";

const CATEGORIES = {
  fruits: {
    label: "🍎 Fruits", color: "#ef4444",
    items: [
      { e:"🍎",n:"apple" },{ e:"🍌",n:"banana" },{ e:"🍊",n:"orange" },
      { e:"🍇",n:"grapes" },{ e:"🍓",n:"strawberry" },{ e:"🍉",n:"watermelon" },
      { e:"🥝",n:"kiwi" },{ e:"🥭",n:"mango" },{ e:"🍑",n:"peach" },{ e:"🍋",n:"lemon" },
    ],
  },
  veggies: {
    label: "🥕 Veggies", color: "#22c55e",
    items: [
      { e:"🥕",n:"carrot" },{ e:"🥦",n:"broccoli" },{ e:"🌽",n:"corn" },
      { e:"🥔",n:"potato" },{ e:"🍆",n:"eggplant" },{ e:"🧅",n:"onion" },
      { e:"🥒",n:"cucumber" },{ e:"🧄",n:"garlic" },
    ],
  },
  snacks: {
    label: "🍕 Snacks", color: "#f59e0b",
    items: [
      { e:"🍕",n:"pizza" },{ e:"🍔",n:"burger" },{ e:"🌮",n:"taco" },
      { e:"🍟",n:"fries" },{ e:"🥪",n:"sandwich" },{ e:"🌭",n:"hotdog" },
      { e:"🍩",n:"donut" },{ e:"🧁",n:"cupcake" },
    ],
  },
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildPool(word, extra = 4) {
  const needed = word.split("");
  const extras = Array.from({ length: extra }, () => ALPHABET[Math.floor(Math.random() * 26)]);
  return shuffle([...needed, ...extras].map((l, i) => ({ l, id: i, used: false })));
}

export default function FoodWordHunt({ onComplete }) {
  const [catKey, setCatKey] = useState(null);
  const [items, setItems] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [pool, setPool] = useState([]);
  const [typed, setTyped] = useState([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [completedCats, setCompletedCats] = useStorage("food-word-hunt-v1", []);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);

  const startCategory = useCallback((key) => {
    const cat = CATEGORIES[key];
    const shuffled = shuffle(cat.items);
    setCatKey(key);
    setItems(shuffled);
    setQIdx(0);
    setScore(0);
    setMistakes(0);
    setPool(buildPool(shuffled[0].n));
    setTyped([]);
    setFeedback("");
    setDone(false);
  }, []);

  const current = items[qIdx];
  const cat = catKey ? CATEGORIES[catKey] : null;

  const tap = (id) => {
    if (feedback) return;
    const tile = pool.find(t => t.id === id);
    if (!tile || tile.used) return;
    const nextTyped = [...typed, { l: tile.l, id }];
    setPool(p => p.map(t => t.id === id ? { ...t, used: true } : t));
    setTyped(nextTyped);

    if (nextTyped.length === current.n.length) {
      const guess = nextTyped.map(x => x.l).join("");
      if (guess === current.n) {
        setFeedback("correct");
        setScore(prev => prev + 10);
        setTimeout(() => {
          const next = qIdx + 1;
          if (next >= items.length) {
            const accuracy = Math.round((items.length / (items.length + mistakes)) * 100);
            onComplete?.(score + 10, accuracy);
            setCompletedCats(prev => Array.from(new Set([...prev, catKey])));
            setDone(true);
            return;
          }
          setQIdx(next);
          setPool(buildPool(items[next].n));
          setTyped([]);
          setFeedback("");
        }, 900);
      } else {
        setFeedback("wrong");
        setMistakes(prev => prev + 1);
        setTimeout(() => {
          setPool(p => p.map(t => ({ ...t, used: false })));
          setTyped([]);
          setFeedback("");
        }, 900);
      }
    }
  };

  const removeLast = () => {
    if (!typed.length || feedback) return;
    const last = typed[typed.length - 1];
    setPool(p => p.map(t => t.id === last.id ? { ...t, used: false } : t));
    setTyped(t => t.slice(0, -1));
  };

  // Menu
  if (!catKey) return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#fff7ed,#fef3c7,#fef9c3)",
      fontFamily:"'Segoe UI', sans-serif", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3rem", marginBottom:8 }}>🍽️</div>
      <h1 style={{ fontSize:"2.2rem", color:"#92400e", margin:"0 0 8px" }}>Food Word Hunt</h1>
      <p style={{ color:"#b45309", marginBottom:32 }}>Spell the food name from the tiles!</p>
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button key={key} onClick={() => startCategory(key)} style={{
            padding:"18px 32px", borderRadius:20, border: completedCats.includes(key) ? "2px solid #fbbf24" : "none",
            background: cat.color, color:"#fff",
            fontWeight:800, fontSize:"1.1rem", cursor:"pointer",
            boxShadow:`0 4px 16px ${cat.color}55`,
            position: "relative"
          }}>{cat.label} {completedCats.includes(key) && "✅"}</button>
        ))}
      </div>
    </div>
  );

  if (done) return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#fff7ed,#fef3c7)",
      fontFamily:"'Segoe UI', sans-serif", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#92400e", marginBottom:8 }}>{cat.label} Complete!</h2>
      <p style={{ color:"#b45309", fontSize:"1.2rem", marginBottom:24 }}>Score: {score} / {items.length * 10}</p>
      <div style={{ display:"flex", gap:12 }}>
        <button onClick={() => startCategory(catKey)} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:cat.color, color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🔄 Retry</button>
        <button onClick={() => setCatKey(null)} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"#9ca3af", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🏠 Categories</button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#fff7ed,#fef3c7,#fef9c3)",
      fontFamily:"'Segoe UI', sans-serif", padding:24,
    }}>
      <button onClick={() => setCatKey(null)} style={{
        position: "absolute", top: 20, left: 20, background: "none", border: "none",
        fontSize: "1.8rem", cursor: "pointer", color: "#b45309", padding: 8
      }}>✕</button>

      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{ background:cat.color, color:"#fff", padding:"4px 14px", borderRadius:999, fontWeight:700 }}>{cat.label}</span>
          <span style={{ color:"#92400e", fontWeight:700 }}>🏆 {score}</span>
          <span style={{ color:"#b45309" }}>{qIdx+1}/{items.length}</span>
        </div>

        <div style={{ height:6, background:"#fde68a", borderRadius:999, marginBottom:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(qIdx/items.length)*100}%`, background:cat.color, borderRadius:999, transition:"width 0.3s" }} />
        </div>

        <div style={{
          background:"#fff", borderRadius:24, padding:28, textAlign:"center", marginBottom:20,
          boxShadow:"0 8px 24px #0001",
          border:`2px solid ${feedback==="correct"?"#22c55e":feedback==="wrong"?"#ef4444":"#fde68a"}`,
        }}>
          <div style={{ fontSize:"5rem", marginBottom:14 }}>{current.e}</div>
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            {current.n.split("").map((_, i) => (
              <div key={i} style={{
                width:40, height:46, borderRadius:8, border:`2px solid ${cat.color}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"1.2rem", fontWeight:800, color:"#1e293b", background:"#fff7ed",
              }}>
                {typed[i]?.l || ""}
              </div>
            ))}
          </div>
          {feedback && (
            <p style={{ marginTop:12, fontWeight:700, color:feedback==="correct"?"#16a34a":"#dc2626" }}>
              {feedback==="correct" ? "🎉 Correct!" : `❌ It's "${current.n}"`}
            </p>
          )}
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:14 }}>
          {pool.map(tile => (
            <button key={tile.id} onClick={() => tap(tile.id)} disabled={tile.used || !!feedback}
              style={{
                width:44, height:44, borderRadius:10, border:"none",
                background: tile.used ? "#f1f5f9" : cat.color,
                color: tile.used ? "transparent" : "#fff",
                fontWeight:800, fontSize:"1.1rem", textTransform:"uppercase",
                cursor: tile.used ? "default" : "pointer",
                boxShadow: tile.used ? "none" : `0 3px 0 ${cat.color}cc`,
                transform: tile.used ? "translateY(2px)" : "translateY(0)",
                transition:"all 0.1s",
              }}>{tile.l}</button>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={removeLast} style={{
            padding:"10px 24px", borderRadius:12, border:"none",
            background:"#94a3b8", color:"#fff", fontWeight:700, cursor:"pointer",
          }}>⌫ Back</button>
          <button onClick={() => { setPool(p => p.map(t => ({...t, used:false}))); setTyped([]); }} style={{
            padding:"10px 24px", borderRadius:12, border:"none",
            background:"#94a3b8", color:"#fff", fontWeight:700, cursor:"pointer",
          }}>🔄 Clear</button>
        </div>
      </div>
    </div>
  );
}
