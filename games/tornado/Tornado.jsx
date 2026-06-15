import { useState, useCallback } from "react";

const TILE_POOL = [
  { icon:"🌪️", label:"Tornado",  value:-500, cls:"legendary" },
  { icon:"🥷",  label:"Ninja",   value:"steal" },
  { icon:"🥷",  label:"Ninja",   value:"steal" },
  { icon:"💀",  label:"Skull",   value:-300 },
  { icon:"💸",  label:"Loss",    value:-200 },
  { icon:"💔",  label:"Ouch",    value:-100 },
  { icon:"✨",  label:"Gain",    value:100 },
  { icon:"🍀",  label:"Lucky",   value:200 },
  { icon:"🌟",  label:"Star",    value:300 },
  { icon:"🔥",  label:"Fire",    value:400 },
  { icon:"💰",  label:"Gold",    value:500 },
  { icon:"🎰",  label:"Jackpot", value:600 },
  { icon:"💎",  label:"Diamond", value:750 },
  { icon:"🏆",  label:"Trophy",  value:1000, cls:"legendary" },
];

function buildTiles() {
  const pool = [];
  while (pool.length < 16) {
    pool.push(...TILE_POOL.map(t => ({ ...t })));
  }
  return pool.sort(() => Math.random() - 0.5).slice(0, 16);
}

const TEAM_THEMES = [
  { label:"Team Blue", avatar:"🦁", color:"#3b82f6", bg:"#1e3a8a" },
  { label:"Team Red",  avatar:"🐲", color:"#ef4444", bg:"#7f1d1d" },
];

export default function Tornado({ onComplete }) {
  const [screen, setScreen] = useState("setup");
  const [teamNames, setTeamNames] = useState(["Team Blue","Team Red"]);
  const [tiles, setTiles] = useState([]);
  const [scores, setScores] = useState([0, 0]);
  const [cp, setCp] = useState(0); 
  const [revealed, setRevealed] = useState([]); 
  const [flash, setFlash] = useState(null); 
  const [roundOver, setRoundOver] = useState(false);

  const startGame = () => {
    setTiles(buildTiles());
    setScores([0, 0]);
    setCp(0);
    setRevealed([]);
    setFlash(null);
    setRoundOver(false);
    setScreen("game");
  };

  const revealTile = useCallback((idx) => {
    if (revealed.find(r => r.idx === idx)) return;
    if (flash) return;

    const tile = tiles[idx];
    const team = cp;
    const newRevealed = [...revealed, { idx, tile, team }];
    setRevealed(newRevealed);

    let msg = "", color = "#4ade80";

    if (tile.value === "steal") {
      const opp = 1 - cp;
      const stolen = Math.floor(scores[opp] / 2);
      const newScores = [...scores];
      newScores[cp] += stolen;
      newScores[opp] -= stolen;
      setScores(newScores);
      msg = `🥷 Ninja! ${teamNames[cp]} steals ${stolen} pts from ${teamNames[opp]}!`;
      color = "#f59e0b";
    } else if (typeof tile.value === "number") {
      const newScores = [...scores];
      newScores[cp] += tile.value;
      if (newScores[cp] < 0) newScores[cp] = 0;
      setScores(newScores);
      msg = tile.value >= 0
        ? `${tile.icon} ${tile.label}! ${teamNames[cp]} gets ${tile.value} pts!`
        : `${tile.icon} ${tile.label}! ${teamNames[cp]} loses ${Math.abs(tile.value)} pts!`;
      color = tile.value >= 0 ? "#4ade80" : "#f87171";
    }

    setFlash({ msg, color });

    setTimeout(() => {
      setFlash(null);
      if (newRevealed.length >= tiles.length) {
        setRoundOver(true);
        // Report to system - using winner's score for achievement check
        const winnerScore = Math.max(...scores);
        onComplete?.(winnerScore, 100);
      } else {
        setCp(p => 1 - p);
      }
    }, 1200);
  }, [revealed, flash, tiles, cp, scores, teamNames, onComplete]);

  const newRound = () => {
    setTiles(buildTiles());
    setRevealed([]);
    setFlash(null);
    setRoundOver(false);
    setCp(scores[0] > scores[1] ? 1 : 0);
  };

  if (screen === "setup") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f0f23,#1a0f2e)",
      fontFamily:"'Segoe UI', sans-serif", color:"#f1f5f9", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🌪️</div>
      <h1 style={{ fontSize:"2.2rem", margin:"0 0 4px", color:"#a78bfa", letterSpacing:2 }}>TORNADO</h1>
      <p style={{ color:"#7c3aed", marginBottom:30 }}>Tile Reveal Team Battle</p>

      {[0,1].map(i => (
        <div key={i} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:"1.6rem" }}>{TEAM_THEMES[i].avatar}</span>
          <input value={teamNames[i]} onChange={e => setTeamNames(n=>n.map((v,j)=>j===i?e.target.value:v))}
            style={{
              padding:"10px 16px", borderRadius:12, border:`1px solid ${TEAM_THEMES[i].color}`,
              background:"rgba(255,255,255,0.07)", color:"#fff",
              fontSize:"1rem", width:180, textAlign:"center",
            }} />
        </div>
      ))}

      <button onClick={startGame} style={{
        marginTop:8, padding:"14px 40px", borderRadius:999, border:"none",
        background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
        color:"#fff", fontWeight:800, fontSize:"1.1rem", cursor:"pointer",
        boxShadow:"0 4px 20px #7c3aed44",
      }}>🌪️ Start Game!</button>
    </div>
  );

  const col0 = TEAM_THEMES[0].color, col1 = TEAM_THEMES[1].color;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0f0f23,#1a0f2e)",
      fontFamily:"'Segoe UI', sans-serif", color:"#f1f5f9", padding:20,
    }}>
      <div style={{ display:"flex", gap:40, marginBottom:14, alignItems:"center" }}>
        {[0,1].map(i=>(
          <div key={i} style={{ textAlign:"center" }}>
            <div style={{ fontSize:"1.6rem" }}>{TEAM_THEMES[i].avatar}</div>
            <div style={{ color:TEAM_THEMES[i].color, fontWeight:700, fontSize:"0.9rem" }}>{teamNames[i]}</div>
            <div style={{ color:"#fbbf24", fontWeight:800, fontSize:"1.6rem" }}>{scores[i]}</div>
          </div>
        ))}
      </div>

      {!roundOver && (
        <div style={{
          margin:"0 0 12px", padding:"6px 20px", borderRadius:999,
          background:`rgba(${cp===0?"59,130,246":"239,68,68"},0.15)`,
          border:`1px solid ${cp===0?col0:col1}`,
          color:cp===0?col0:col1, fontWeight:700,
        }}>{TEAM_THEMES[cp].avatar} {teamNames[cp]}'s turn — pick a tile!</div>
      )}

      {flash && (
        <div style={{
          margin:"0 0 12px", padding:"10px 20px", borderRadius:12,
          background:"rgba(255,255,255,0.07)", color:flash.color,
          fontWeight:700, fontSize:"1rem", textAlign:"center", maxWidth:360,
        }}>{flash.msg}</div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
        {tiles.map((tile, i) => {
          const rev = revealed.find(r => r.idx === i);
          const isRevealed = !!rev;
          return (
            <div key={i} onClick={() => !isRevealed && revealTile(i)}
              style={{
                width:72, height:72, borderRadius:14, cursor:isRevealed?"default":"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                background: isRevealed
                  ? (rev.tile.value==="steal"?"rgba(245,158,11,0.15)":typeof rev.tile.value==="number"&&rev.tile.value>=0?"rgba(74,222,128,0.1)":"rgba(239,68,68,0.1)")
                  : "rgba(255,255,255,0.06)",
                border: isRevealed
                  ? `2px solid ${rev.tile.value==="steal"?"#f59e0b":typeof rev.tile.value==="number"&&rev.tile.value>=0?"#4ade80":"#ef4444"}`
                  : "2px solid rgba(255,255,255,0.1)",
                transition:"all 0.2s", transform: isRevealed?"scale(1.02)":"scale(1)",
                boxShadow: isRevealed && typeof rev.tile.value==="number" && rev.tile.value>=500?"0 0 16px #fbbf2466":"none",
              }}>
              {isRevealed ? (
                <><span style={{ fontSize:"1.6rem" }}>{rev.tile.icon}</span><span style={{ fontSize:"0.6rem", marginTop:2, color:"#94a3b8" }}>{typeof rev.tile.value==="number"?(rev.tile.value>=0?"+":"")+rev.tile.value:"STEAL"}</span><span style={{ fontSize:"0.5rem", color:TEAM_THEMES[rev.team].color }}>{TEAM_THEMES[rev.team].avatar}</span></>
              ) : (<span style={{ fontSize:"1.8rem" }}>❓</span>)}
            </div>
          );
        })}
      </div>

      {roundOver && (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"1.3rem", fontWeight:700, marginBottom:6, color:"#fbbf24" }}>🏆 {scores[0]>scores[1]?teamNames[0]:scores[1]>scores[0]?teamNames[1]:"TIE"} leads!</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button onClick={newRound} style={{ padding:"12px 24px", borderRadius:999, border:"none", background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", fontWeight:700, cursor:"pointer" }}>🌪️ New Round</button>
            <button onClick={() => setScreen("setup")} style={{ padding:"12px 24px", borderRadius:999, border:"none", background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer" }}>🏠 Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}