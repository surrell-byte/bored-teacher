import { useState, useCallback, useEffect } from "react";

const TRACK_TOTAL = 20;
const EMOJIS = ["🏎","🚗","🚕","🚙","🚓","🚑","🏍","🚒"];
const COLORS  = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#a78bfa","#14b8a6","#f97316","#ec4899"];
const BASE_CARDS = [
  {delta:-1,label:"-1",desc:"Tire slip"},
  {delta:0,  label:"0", desc:"Pit stop"},
  {delta:1,  label:"+1",desc:"Overtake"},
  {delta:2,  label:"+2",desc:"DRS boost"},
  {delta:3,  label:"+3",desc:"Full throttle"},
];

function buildSpecials() {
  const s={};
  [3,6,10,13,16,19].forEach((pos,i) => {
    const effects=[
      {delta:-1,label:"🛢️ Oil Slick! -1"}, {delta:+2,label:"💨 Slipstream! +2"},
      {delta:-2,label:"💥 Crash! -2"}, {delta:+1,label:"🚦 Safety car ends +1"},
      {delta:+2,label:"⚡ DRS Zone! +2"}, {delta:-1,label:"🪨 Debris! -1"},
    ];
    s[pos]=effects[i];
  });
  return s;
}
const SPECIALS=buildSpecials();

function shuffle(arr) { return [...arr].sort(()=>Math.random()-0.5); }
function drawCards(n=3) { return shuffle([...BASE_CARDS,...BASE_CARDS]).slice(0,n); }

export default function WGrandPrix({ onComplete }) {
  const [screen, setScreen] = useState("setup");
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames] = useState(["Driver 1","Driver 2","Driver 3","Driver 4"]);
  const [positions, setPositions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [cards, setCards] = useState([]);
  const [log, setLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8);
  const [timerActive, setTimerActive] = useState(false);

  const playCard = useCallback((card) => {
    if (animating || winner) return;
    setTimerActive(false);
    setAnimating(true);

    setPositions(prev => {
      const next = [...prev];
      let pos = Math.min(prev[current] + card.delta, TRACK_TOTAL);
      const msgs = [`${EMOJIS[current]} ${names[current]}: played ${card.label} (${card.desc})`];
      const sp = SPECIALS[pos];
      if (sp && pos < TRACK_TOTAL) {
        pos = Math.max(0, Math.min(pos + sp.delta, TRACK_TOTAL));
        msgs.push(`  → ${sp.label} → now at ${pos}`);
      }
      next[current] = pos;
      setLog(l => [...msgs, ...l].slice(0, 16));
      if (pos >= TRACK_TOTAL) {
        setWinner(current);
        onComplete?.(100, 100);
      }
      return next;
    });

    setTimeout(() => {
      setAnimating(false);
      setCurrent(c => (c + 1) % numPlayers);
      setCards(drawCards(3));
      setTimeLeft(8);
      setTimerActive(!winner);
    }, 700);
  }, [animating, winner, current, names, numPlayers, onComplete]);

  useEffect(() => {
    if (!timerActive || winner) return;
    if (timeLeft <= 0) {
      const randomCard = cards[Math.floor(Math.random()*cards.length)];
      if (randomCard) playCard(randomCard);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t-1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft, winner, cards, playCard]);

  const startGame = () => {
    setPositions(Array(numPlayers).fill(0));
    setCurrent(0); setCards(drawCards(3)); setLog([]); setWinner(null);
    setAnimating(false); setTimeLeft(8); setTimerActive(true); setScreen("game");
  };

  if (screen === "setup") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#0f0f0f,#1a0f00,#0f0000)", fontFamily:"'Segoe UI', sans-serif", color:"#f1f5f9", padding:24, textAlign:"center" }}>
      <div style={{ fontSize:"3rem", marginBottom:8 }}>🏁</div>
      <h1 style={{ fontSize:"2.2rem", margin:"0 0 4px", color:"#f97316", letterSpacing:2 }}>W GRAND PRIX</h1>
      <p style={{ color:"#94a3b8", marginBottom:28 }}>Card-based racing championship</p>
      <div style={{ marginBottom:20 }}>Drivers: {[2,3,4].map(n => (<button key={n} onClick={() => setNumPlayers(n)} style={{ padding:"8px 18px", borderRadius:10, border:"none", marginRight:8, background: numPlayers===n ? "#f97316" : "#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>{n}</button>))}</div>
      {Array.from({length:numPlayers},(_,i) => (<div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:"1.4rem" }}>{EMOJIS[i]}</span><input value={names[i]} onChange={e => setNames(n => n.map((v,j)=>j===i?e.target.value:v))} style={{ padding:"8px 14px", borderRadius:10, border:"1px solid #374151", background:"#1e293b", color:"#fff", fontSize:"1rem", width:180 }} /></div>))}
      <button onClick={startGame} style={{ marginTop:16, padding:"14px 36px", borderRadius:999, border:"none", background:"linear-gradient(135deg,#f97316,#ea580c)", color:"#fff", fontWeight:800, fontSize:"1.1rem", cursor:"pointer" }}>🏁 Start Race!</button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", background:"linear-gradient(135deg,#0f0f0f,#1a0f00)", fontFamily:"'Segoe UI', sans-serif", color:"#f1f5f9", padding:16 }}>
      <h2 style={{ color:"#f97316", letterSpacing:2, margin:"12px 0 10px", fontSize:"1.4rem" }}>🏁 W GRAND PRIX</h2>
      <div style={{ display:"flex", flexWrap:"wrap", gap:3, maxWidth:440, justifyContent:"flex-start", background:"rgba(255,255,255,0.03)", borderRadius:12, padding:10, marginBottom:14, border:"1px solid rgba(255,255,255,0.07)" }}>
        {Array.from({length:TRACK_TOTAL+1},(_,i)=>i).map(i => {
          const ph = positions.reduce((acc,p,pi)=>{ if(p===i) acc.push(pi); return acc; },[]);
          return (<div key={i} style={{ width:36, height:36, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", background: i===TRACK_TOTAL?"#92400e": SPECIALS[i]?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.04)", border: SPECIALS[i]?"1px solid #ef444466":"1px solid rgba(255,255,255,0.06)", position:"relative", flexDirection:"column" }}>{ph.length>0 ? ph.map(pi=><span key={pi} style={{fontSize:"1rem",lineHeight:1}}>{EMOJIS[pi]}</span>) : <span style={{color:"rgba(255,255,255,0.25)"}}>{i===TRACK_TOTAL?"🏆":SPECIALS[i]?"⚡":i}</span>}</div>);
        })}
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap", justifyContent:"center" }}>
        {Array.from({length:numPlayers},(_,i)=>(<div key={i} style={{ padding:"6px 12px", borderRadius:10, background: i===current&&!winner?"rgba(249,115,22,0.15)":"rgba(255,255,255,0.04)", border:`1px solid ${i===current&&!winner?"#f97316":COLORS[i]}`, fontSize:"0.85rem" }}>{EMOJIS[i]} <span style={{color:COLORS[i],fontWeight:700}}>{names[i]}</span><span style={{color:"#94a3b8",marginLeft:6}}>{positions[i]}/{TRACK_TOTAL}</span></div>))}
      </div>
      {winner !== null ? (
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:"2.5rem", marginBottom:6 }}>🏆</div>
          <div style={{ color:"#f97316", fontWeight:800, fontSize:"1.3rem", marginBottom:12 }}>{EMOJIS[winner]} {names[winner]} wins!</div>
          <button onClick={() => setScreen("setup")} style={{ padding:"12px 28px", borderRadius:999, border:"none", background:"#f97316", color:"#fff", fontWeight:700, cursor:"pointer" }}>🔄 New Race</button>
        </div>
      ) : (
        <div style={{ textAlign:"center", marginBottom:12, width:"100%", maxWidth:440 }}>
          <p style={{ color:"#f97316", fontWeight:700, marginBottom:6 }}>{EMOJIS[current]} {names[current]}'s turn <span style={{ marginLeft:12, background:"rgba(249,115,22,0.2)", padding:"3px 12px", borderRadius:999, fontSize:"0.85rem", color: timeLeft<=3?"#f87171":"#f97316" }}>⏱ {timeLeft}s</span></p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            {cards.map((c,i) => (<button key={i} onClick={() => playCard(c)} disabled={animating} style={{ padding:"14px 18px", borderRadius:16, border:"none", background: animating?"#1e293b":`linear-gradient(135deg,${c.delta>=2?"#f97316":c.delta===1?"#22c55e":c.delta===0?"#64748b":"#ef4444"},${c.delta>=2?"#ea580c":c.delta===1?"#16a34a":c.delta===0?"#475569":"#dc2626"})`, color:"#fff", fontWeight:800, fontSize: "1.1rem", minWidth:80 }}><div style={{fontSize:"1.4rem"}}>{c.label}</div><div style={{fontSize:"0.7rem",opacity:0.8}}>{c.desc}</div></button>))}
          </div>
        </div>
      )}
      <div style={{ width:"100%", maxWidth:440, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"10px 14px", fontSize:"0.78rem", color:"#64748b", maxHeight:100, overflowY:"auto" }}>{log.map((l,i)=><div key={i} style={{marginBottom:2}}>{l}</div>)}</div>
    </div>
  );
}