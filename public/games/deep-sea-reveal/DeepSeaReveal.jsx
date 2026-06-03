import { useState, useCallback, useEffect, useRef } from "react";

// Color sequence encoded as r=red, g=green, b=blue, y=yellow
const CREATURES = {
  shallow: [
    { name:"Clownfish",    emoji:"🐠", seq:"ryrbbr" },
    { name:"Sea Turtle",   emoji:"🐢", seq:"gbgbbg" },
    { name:"Dolphin",      emoji:"🐬", seq:"bbgbbg" },
    { name:"Crab",         emoji:"🦀", seq:"rryrry" },
    { name:"Starfish",     emoji:"⭐", seq:"yryrryr" },
    { name:"Seahorse",     emoji:"🦄", seq:"ygybgy" },
    { name:"Blowfish",     emoji:"🐡", seq:"bgbbbg" },
    { name:"Tropical Fish",emoji:"🐟", seq:"rbrbbr" },
  ],
  twilight: [
    { name:"Squid",     emoji:"🦑", seq:"brbbbr" },
    { name:"Octopus",   emoji:"🐙", seq:"rgrggr" },
    { name:"Jellyfish", emoji:"🪼", seq:"brbrrb" },
    { name:"Shark",     emoji:"🦈", seq:"bgbbbg" },
    { name:"Blue Whale",emoji:"🐳", seq:"bbgbbb" },
    { name:"Seal",      emoji:"🦭", seq:"gbgbbg" },
  ],
  midnight: [
    { name:"Anglerfish", emoji:"🎣", seq:"rbrbbr" },
    { name:"Sperm Whale",emoji:"🐋", seq:"bbbgbb" },
    { name:"Lobster",    emoji:"🦞", seq:"ryryyry" },
    { name:"Shrimp",     emoji:"🍤", seq:"rryrry" },
    { name:"Electric Eel",emoji:"🐍", seq:"gbgbgb" },
  ],
  hadal: [
    { name:"Sea Dragon",    emoji:"🐲", seq:"grgrrg" },
    { name:"Nautilus",      emoji:"🐚", seq:"ybybby" },
    { name:"Sea Urchin",    emoji:"🦔", seq:"rgrggr" },
    { name:"Horseshoe Crab",emoji:"🦀", seq:"brbrrb" },
    { name:"Dumbo Octopus", emoji:"🐙", seq:"bgbggb" },
  ],
};

const ZONES = [
  { id:"shallow",  name:"Shallow Zone",  depth:"0–200m",    icon:"🐠", time:40, basePoints:100 },
  { id:"twilight", name:"Twilight Zone",  depth:"200–1000m", icon:"🦑", time:30, basePoints:220 },
  { id:"midnight", name:"Midnight Zone",  depth:"1000–4000m",icon:"🦈", time:22, basePoints:380 },
  { id:"hadal",    name:"Hadal Trench",   depth:"4000m+",    icon:"👾", time:15, basePoints:550 },
];

const COLOR_MAP = { r:"#ef4444", g:"#22c55e", b:"#3b82f6", y:"#eab308" };
const COLOR_LABEL = { r:"Red", g:"Green", b:"Blue", y:"Yellow" };

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function DeepSeaReveal() {
  const [screen, setScreen] = useState("title"); // title | zone | game | result
  const [zone, setZone] = useState(null);
  const [unlocked, setUnlocked] = useState({ shallow:true, twilight:false, midnight:false, hadal:false });
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [creatures, setCreatures] = useState([]);
  const [current, setCurrent] = useState(null);
  const [phase, setPhase] = useState("reveal"); // reveal | answer
  const [revealed, setRevealed] = useState([]); // indices revealed so far during show
  const [chosen, setChosen] = useState(null); // color chosen for current tile
  const [guesses, setGuesses] = useState([]); // array of guessed colors
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const revealTimer = useRef(null);

  const zoneData = zone ? ZONES.find(z => z.id === zone) : null;

  useEffect(() => {
    if (!timerActive || phase !== "answer") return;
    if (timeLeft <= 0) { finishRound(guesses, current); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft, phase]);

  const startZone = useCallback((zoneId) => {
    const pool = shuffle(CREATURES[zoneId]).slice(0, 5);
    setZone(zoneId);
    setCreatures(pool);
    setRound(0);
    setScore(0);
    setStreak(0);
    loadCreature(pool, 0);
    setScreen("game");
  }, []);

  const loadCreature = (pool, idx) => {
    if (idx >= pool.length) { setScreen("result"); return; }
    const c = pool[idx];
    setCurrent(c);
    setRevealed([]);
    setGuesses([]);
    setPhase("reveal");
    setFeedback(null);
    setRound(idx);

    // Reveal tiles one by one
    let i = 0;
    clearInterval(revealTimer.current);
    revealTimer.current = setInterval(() => {
      setRevealed(prev => {
        const next = [...prev, i];
        i++;
        if (i >= c.seq.length) {
          clearInterval(revealTimer.current);
          setTimeout(() => {
            setRevealed([]);
            setPhase("answer");
            const zd = ZONES.find(z => z.id === zone || z.id === zoneId);
            setTimeLeft(zd?.time || 30);
            setTimerActive(true);
          }, 600);
        }
        return next;
      });
    }, 500);
  };

  const finishRound = useCallback((currentGuesses, creature) => {
    setTimerActive(false);
    if (!creature) return;
    const seq = creature.seq.split("");
    const correct = currentGuesses.filter((g, i) => g === seq[i]).length;
    const pct = currentGuesses.length > 0 ? correct / seq.length : 0;
    const pts = Math.round((pct * (zoneData?.basePoints || 100)));
    setScore(s => s + pts);
    const allCorrect = currentGuesses.length === seq.length && pct === 1;
    if (allCorrect) setStreak(s => s + 1); else setStreak(0);
    setFeedback({ correct, total: seq.length, pts });
    setPhase("feedback");
  }, [zoneData]);

  const guessColor = useCallback((colorKey) => {
    if (phase !== "answer" || !current) return;
    const seq = current.seq.split("");
    const nextGuesses = [...guesses, colorKey];
    setGuesses(nextGuesses);

    if (nextGuesses.length >= seq.length) {
      finishRound(nextGuesses, current);
    }
  }, [phase, current, guesses, finishRound]);

  const nextRound = () => {
    const nextIdx = round + 1;
    if (nextIdx >= creatures.length) {
      const zoneIds = ZONES.map(z => z.id);
      const nextZoneIdx = zoneIds.indexOf(zone) + 1;
      if (nextZoneIdx < zoneIds.length) {
        setUnlocked(u => ({ ...u, [zoneIds[nextZoneIdx]]: true }));
      }
      setScreen("result");
    } else {
      loadCreature(creatures, nextIdx);
    }
  };

  if (screen === "title") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#000814,#001233)",
      fontFamily:"'Segoe UI', sans-serif", color:"#bae6fd", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8 }}>🌊</div>
      <h1 style={{ fontSize:"2.2rem", margin:"0 0 4px", color:"#38bdf8", letterSpacing:2 }}>DEEP SEA REVEAL</h1>
      <p style={{ color:"#7dd3fc", marginBottom:32 }}>Memorise the creature's colour pattern, then recreate it!</p>
      <button onClick={() => setScreen("zone")} style={{
        padding:"16px 40px", borderRadius:999, border:"none",
        background:"linear-gradient(135deg,#0284c7,#0369a1)",
        color:"#fff", fontWeight:800, fontSize:"1.1rem", cursor:"pointer",
        boxShadow:"0 4px 20px #0284c744",
      }}>🤿 Dive In</button>
    </div>
  );

  if (screen === "zone") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#000814,#001233)",
      fontFamily:"'Segoe UI', sans-serif", color:"#bae6fd", padding:24, textAlign:"center",
    }}>
      <h2 style={{ fontSize:"1.8rem", color:"#38bdf8", marginBottom:8 }}>Choose Your Zone</h2>
      <p style={{ color:"#7dd3fc", marginBottom:28 }}>Deeper = harder patterns, more points</p>
      <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:400 }}>
        {ZONES.map((z, i) => (
          <button key={z.id} onClick={() => unlocked[z.id] && startZone(z.id)} style={{
            padding:"16px 24px", borderRadius:16, border:"none",
            background: unlocked[z.id]
              ? `linear-gradient(135deg,rgba(2,132,199,${0.3+i*0.15}),rgba(3,105,161,${0.3+i*0.15}))`
              : "rgba(255,255,255,0.04)",
            color: unlocked[z.id] ? "#e0f2fe" : "#475569",
            cursor: unlocked[z.id] ? "pointer" : "not-allowed",
            border: `1px solid ${unlocked[z.id] ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.05)"}`,
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span style={{ fontSize:"1.6rem" }}>{z.icon}</span>
            <div style={{ textAlign:"left", flex:1, marginLeft:12 }}>
              <div style={{ fontWeight:800, fontSize:"1rem" }}>{unlocked[z.id] ? z.name : `🔒 ${z.name}`}</div>
              <div style={{ fontSize:"0.8rem", opacity:0.7 }}>{z.depth} · {z.time}s · {z.basePoints}pts</div>
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => setScreen("title")} style={{
        marginTop:20, padding:"10px 24px", borderRadius:999, border:"none",
        background:"rgba(255,255,255,0.06)", color:"#7dd3fc", cursor:"pointer",
      }}>← Back</button>
    </div>
  );

  if (screen === "result") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#000814,#001233)",
      fontFamily:"'Segoe UI', sans-serif", color:"#bae6fd", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#38bdf8", marginBottom:8 }}>{zoneData?.name} Complete!</h2>
      <p style={{ color:"#7dd3fc", fontSize:"1.3rem", marginBottom:24 }}>
        Score: {score} · Best streak: {streak}
      </p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startZone(zone)} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"#0284c7", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🔄 Retry</button>
        <button onClick={() => setScreen("zone")} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"rgba(255,255,255,0.08)", color:"#7dd3fc", fontWeight:700, cursor:"pointer",
        }}>🌊 Zones</button>
      </div>
    </div>
  );

  if (!current) return null;
  const seq = current.seq.split("");

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg,#000814,#001233,#000d26)",
      fontFamily:"'Segoe UI', sans-serif", color:"#bae6fd", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          <span style={{
            background:"rgba(2,132,199,0.3)", border:"1px solid #0284c7",
            padding:"4px 14px", borderRadius:999, fontWeight:700, fontSize:"0.85rem",
          }}>{zoneData?.name}</span>
          <span style={{ color:"#fbbf24", fontWeight:700 }}>⭐ {score}</span>
          <span style={{ color:"#7dd3fc" }}>{round+1}/{creatures.length}</span>
        </div>

        {/* Timer */}
        {phase === "answer" && (
          <div style={{ marginBottom:12 }}>
            <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:999, overflow:"hidden" }}>
              <div style={{
                height:"100%",
                width:`${(timeLeft/(zoneData?.time||30))*100}%`,
                background: timeLeft > 10 ? "#22c55e" : timeLeft > 5 ? "#f59e0b" : "#ef4444",
                borderRadius:999, transition:"width 1s linear",
              }} />
            </div>
            <div style={{ textAlign:"right", fontSize:"0.8rem", color:"#7dd3fc", marginTop:2 }}>⏱ {timeLeft}s</div>
          </div>
        )}

        {/* Creature card */}
        <div style={{
          background:"rgba(255,255,255,0.04)", borderRadius:24, padding:"24px",
          textAlign:"center", marginBottom:20,
          border:"1px solid rgba(56,189,248,0.15)",
        }}>
          <div style={{ fontSize:"4rem", marginBottom:8 }}>{current.emoji}</div>
          <h2 style={{ fontSize:"1.4rem", margin:"0 0 16px", color:"#e0f2fe" }}>{current.name}</h2>

          {/* Sequence tiles */}
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            {seq.map((c, i) => {
              const isRevealed = phase === "reveal" && revealed.includes(i);
              const guessColor = phase === "answer" || phase === "feedback" ? guesses[i] : null;
              const showCorrect = phase === "feedback";

              let bg = "rgba(255,255,255,0.06)";
              let border = "1px solid rgba(255,255,255,0.1)";
              let glow = "";

              if (isRevealed) { bg = COLOR_MAP[c]; glow = `0 0 12px ${COLOR_MAP[c]}`; }
              else if (showCorrect && guessColor) {
                bg = guessColor === c ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)";
                border = `1px solid ${guessColor === c ? "#4ade80" : "#ef4444"}`;
              } else if (guessColor) {
                bg = COLOR_MAP[guessColor] + "44";
                border = `1px solid ${COLOR_MAP[guessColor]}`;
              }

              return (
                <div key={i} style={{
                  width:44, height:44, borderRadius:10,
                  background: bg, border, boxShadow: glow,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"0.7rem", color:"rgba(255,255,255,0.5)",
                  transition:"all 0.2s",
                }}>
                  {isRevealed ? "" : (showCorrect && guessColor ? (guessColor===c?"✓":"✗") : i+1)}
                </div>
              );
            })}
          </div>

          {phase === "reveal" && (
            <p style={{ color:"#7dd3fc", marginTop:12, fontSize:"0.9rem" }}>Memorise the colour pattern...</p>
          )}
          {phase === "answer" && (
            <p style={{ color:"#7dd3fc", marginTop:12, fontSize:"0.9rem" }}>
              Tap the colours in order! ({guesses.length}/{seq.length})
            </p>
          )}
          {phase === "feedback" && feedback && (
            <p style={{ marginTop:12, fontWeight:700, color: feedback.correct===feedback.total?"#4ade80":"#f59e0b" }}>
              {feedback.correct}/{feedback.total} correct · +{feedback.pts} pts
            </p>
          )}
        </div>

        {/* Color buttons */}
        {phase === "answer" && (
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            {Object.entries(COLOR_MAP).map(([key, color]) => (
              <button key={key} onClick={() => guessColor(key)} style={{
                width:70, height:70, borderRadius:16, border:"none",
                background: color, cursor:"pointer",
                boxShadow:`0 4px 16px ${color}55`,
                fontWeight:700, color:"#fff", fontSize:"0.85rem",
                transition:"transform 0.1s",
              }} onMouseDown={e => e.currentTarget.style.transform="scale(0.92)"}
                 onMouseUp={e => e.currentTarget.style.transform="scale(1)"}>
                {COLOR_LABEL[key]}
              </button>
            ))}
          </div>
        )}

        {phase === "feedback" && (
          <div style={{ textAlign:"center", marginTop:16 }}>
            <button onClick={nextRound} style={{
              padding:"14px 32px", borderRadius:999, border:"none",
              background:"linear-gradient(135deg,#0284c7,#0369a1)",
              color:"#fff", fontWeight:800, cursor:"pointer",
            }}>➡️ Next Creature</button>
          </div>
        )}
      </div>
    </div>
  );
}
