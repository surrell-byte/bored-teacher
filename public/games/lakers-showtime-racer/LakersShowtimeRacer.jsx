import { useState, useCallback } from "react";

const BOARD_RAW = [
  "start",1,2,3,4,"mushroom",6,7,8,"ice",10,11,12,13,14,15,
  "mushroom",17,18,19,20,21,"bomb",23,24,25,"ice",27,28,29,"bomb",31,"finish"
];
const FINISH = BOARD_RAW.length - 1;

const SPECIALS = {
  5:  { label:"🍄 Boost!",    delta:+3 },
  9:  { label:"❄️ Ice slip!", delta:-2 },
  16: { label:"🍄 Turbo!",   delta:+3 },
  22: { label:"💣 Crash!",   delta:-3 },
  26: { label:"❄️ Freeze!",  delta:-2 },
  30: { label:"💣 Blowout!", delta:-3 },
};

const COLS = 7;
// Snaking visual positions
function buildGrid() {
  const grid = [];
  const rows = Math.ceil(BOARD_RAW.length / COLS);
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      const idx = r % 2 === 0 ? r * COLS + c : r * COLS + (COLS - 1 - c);
      row.push(idx < BOARD_RAW.length ? idx : null);
    }
    grid.push(row);
  }
  return grid.reverse(); // finish at top
}

const GRID = buildGrid();

const AVATARS = ["🏀","👟","🧑‍🚀","🐱","🐸","🐼","🧙‍♂️","🦊"];
const COLORS  = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#a78bfa","#14b8a6","#f97316","#ec4899"];

function rollDie() { return Math.floor(Math.random() * 6) + 1; }

function tileStyle(idx) {
  if (idx === 0) return { bg:"#1e3a8a", label:"🏁 START" };
  if (idx === FINISH) return { bg:"#713f12", label:"🏆" };
  const raw = BOARD_RAW[idx];
  if (raw === "mushroom") return { bg:"#166534", label:"🍄" };
  if (raw === "ice")      return { bg:"#0e4b70", label:"❄️" };
  if (raw === "bomb")     return { bg:"#7f1d1d", label:"💣" };
  return { bg:"#1e293b", label:String(idx) };
}

export default function LakersShowtimeRacer() {
  const [screen, setScreen] = useState("setup");
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState(["Player 1","Player 2","Player 3","Player 4"]);
  const [positions, setPositions] = useState([]);
  const [currentP, setCurrentP] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const [log, setLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [diceAnim, setDiceAnim] = useState(null);

  const startGame = () => {
    setPositions(Array(numPlayers).fill(0));
    setCurrentP(0);
    setRolling(false);
    setLastRoll(null);
    setLog([]);
    setWinner(null);
    setScreen("game");
  };

  const roll = useCallback(() => {
    if (rolling || winner) return;
    setRolling(true);

    let flashes = 0;
    const animInterval = setInterval(() => {
      setDiceAnim(rollDie());
      flashes++;
      if (flashes >= 8) clearInterval(animInterval);
    }, 80);

    setTimeout(() => {
      const die = rollDie();
      setDiceAnim(die);
      setLastRoll(die);

      setPositions(prev => {
        const next = [...prev];
        let pos = Math.min(prev[currentP] + die, FINISH);
        const msgs = [`${AVATARS[currentP]} ${playerNames[currentP]} rolled ${die} → tile ${pos}`];

        // Special tile
        const sp = SPECIALS[pos];
        if (sp && pos !== FINISH) {
          pos = Math.max(0, Math.min(pos + sp.delta, FINISH));
          msgs.push(`  ${sp.label} → moves to ${pos}`);
        }
        next[currentP] = pos;
        setLog(l => [...msgs, ...l].slice(0, 12));

        if (pos >= FINISH) {
          setWinner(currentP);
        } else {
          setCurrentP(c => (c + 1) % numPlayers);
        }
        return next;
      });
      setRolling(false);
    }, 700);
  }, [rolling, winner, currentP, playerNames, numPlayers]);

  if (screen === "setup") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#0a0a0a,#1a0a00,#2a1500)",
      fontFamily:"'Segoe UI', sans-serif", color:"#FDB927", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>🏀</div>
      <h1 style={{ fontSize:"2.2rem", margin:"0 0 4px", letterSpacing:2 }}>LAKERS SHOWTIME RACER</h1>
      <p style={{ color:"#94a3b8", marginBottom:28 }}>Board Race to the Championship</p>

      <div style={{ marginBottom:20 }}>
        <label style={{ color:"#FDB927", fontWeight:700, marginRight:12 }}>Players:</label>
        {[2,3,4].map(n => (
          <button key={n} onClick={() => setNumPlayers(n)} style={{
            padding:"8px 18px", borderRadius:10, border:"none", marginRight:8,
            background: numPlayers===n ? "#FDB927" : "#374151",
            color: numPlayers===n ? "#000" : "#fff",
            fontWeight:700, cursor:"pointer",
          }}>{n}</button>
        ))}
      </div>

      {Array.from({length:numPlayers},(_,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:"1.5rem" }}>{AVATARS[i]}</span>
          <input value={playerNames[i]} onChange={e => setPlayerNames(n => n.map((v,j) => j===i?e.target.value:v))}
            style={{
              padding:"8px 14px", borderRadius:10, border:"1px solid #374151",
              background:"#1e293b", color:"#fff", fontSize:"1rem", width:180,
            }} />
        </div>
      ))}

      <button onClick={startGame} style={{
        marginTop:16, padding:"14px 36px", borderRadius:999, border:"none",
        background:"linear-gradient(135deg,#FDB927,#f59e0b)",
        color:"#000", fontWeight:800, fontSize:"1.1rem", cursor:"pointer",
      }}>🏀 Start Race!</button>
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center",
      background:"linear-gradient(135deg,#0a0a0a,#1a0a00)",
      fontFamily:"'Segoe UI', sans-serif", color:"#f1f5f9", padding:16,
    }}>
      <h2 style={{ color:"#FDB927", letterSpacing:2, margin:"12px 0 10px", fontSize:"1.4rem" }}>🏀 SHOWTIME RACER</h2>

      {/* Player status */}
      <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap", justifyContent:"center" }}>
        {Array.from({length:numPlayers},(_,i) => (
          <div key={i} style={{
            padding:"8px 14px", borderRadius:12,
            background: i===currentP && !winner ? "rgba(253,185,39,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${i===currentP && !winner ? "#FDB927" : COLORS[i]}`,
            fontSize:"0.85rem",
          }}>
            <span style={{ marginRight:6 }}>{AVATARS[i]}</span>
            <span style={{ color:COLORS[i], fontWeight:700 }}>{playerNames[i]}</span>
            <span style={{ color:"#94a3b8", marginLeft:6 }}>#{positions[i]}</span>
          </div>
        ))}
      </div>

      {/* Board grid */}
      <div style={{
        display:"inline-block", background:"rgba(255,255,255,0.03)",
        borderRadius:16, padding:8, marginBottom:14, border:"1px solid rgba(255,255,255,0.07)",
      }}>
        {GRID.map((row, ri) => (
          <div key={ri} style={{ display:"flex", gap:3, marginBottom:3 }}>
            {row.map((idx, ci) => {
              if (idx === null) return <div key={ci} style={{ width:44, height:44 }} />;
              const { bg, label } = tileStyle(idx);
              const playersHere = positions.reduce((acc, pos, pi) => { if (pos === idx) acc.push(pi); return acc; }, []);
              return (
                <div key={ci} style={{
                  width:44, height:44, borderRadius:8, background:bg,
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  fontSize:"0.6rem", color:"rgba(255,255,255,0.5)", position:"relative",
                  border: playersHere.length ? "1.5px solid #FDB927" : "1px solid rgba(255,255,255,0.06)",
                }}>
                  <span style={{ fontSize:playersHere.length ? "0" : "0.65rem" }}>{label}</span>
                  {playersHere.map(pi => (
                    <span key={pi} style={{ fontSize:"1rem", lineHeight:1 }}>{AVATARS[pi]}</span>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Controls */}
      {winner !== null ? (
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:"2.5rem", marginBottom:6 }}>🏆</div>
          <div style={{ color:"#FDB927", fontWeight:800, fontSize:"1.3rem", marginBottom:12 }}>
            {AVATARS[winner]} {playerNames[winner]} wins!
          </div>
          <button onClick={() => setScreen("setup")} style={{
            padding:"12px 28px", borderRadius:999, border:"none",
            background:"#FDB927", color:"#000", fontWeight:700, cursor:"pointer",
          }}>🔄 Play Again</button>
        </div>
      ) : (
        <div style={{ textAlign:"center", marginBottom:12 }}>
          <p style={{ color:"#FDB927", fontWeight:700, marginBottom:8 }}>
            {AVATARS[currentP]} {playerNames[currentP]}'s turn
          </p>
          <button onClick={roll} disabled={rolling} style={{
            padding:"14px 36px", borderRadius:999, border:"none",
            background: rolling ? "#374151" : "linear-gradient(135deg,#FDB927,#f59e0b)",
            color: rolling ? "#9ca3af" : "#000",
            fontWeight:800, fontSize:"1.2rem", cursor: rolling?"not-allowed":"pointer",
            boxShadow: rolling ? "none" : "0 4px 20px #FDB92755",
          }}>
            {rolling ? `🎲 ${diceAnim || "..."}` : `🎲 Roll Dice${lastRoll ? ` (last: ${lastRoll})` : ""}`}
          </button>
        </div>
      )}

      {/* Log */}
      <div style={{
        width:"100%", maxWidth:400, background:"rgba(255,255,255,0.03)",
        borderRadius:12, padding:"10px 14px", fontSize:"0.78rem", color:"#64748b",
        maxHeight:120, overflowY:"auto",
      }}>
        {log.map((l, i) => <div key={i} style={{ marginBottom:2 }}>{l}</div>)}
      </div>
    </div>
  );
}
