import { useState, useCallback, useEffect, useRef } from "react";
import { useGame } from "@/lib/gameState";

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
const TARGET_SEQ_LENGTHS = { shallow: 5, twilight: 6, midnight: 8, hadal: 10 };

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeSeq(seq, zoneId) {
  const target = TARGET_SEQ_LENGTHS[zoneId] ?? seq.length;
  const chars = seq.split("");
  if (chars.length >= target) return chars.slice(0, target).join("");
  const result = [...chars];
  while (result.length < target) {
    result.push(chars[result.length % chars.length]);
  }
  return result.join("");
}

export default function DeepSeaReveal() {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("title"); // title | zone | game | result
  const [zone, setZone] = useState(null);
  const [unlocked, setUnlocked] = useState({ shallow:true, twilight:false, midnight:false, hadal:false });
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return Number(window.localStorage.getItem('deepsea-best')) || 0;
  });
  const [totalCorrectGuesses, setTotalCorrectGuesses] = useState(0);
  const [totalPossibleGuesses, setTotalPossibleGuesses] = useState(0);
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
  const multiplier = streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;

  useEffect(() => {
    if (score > bestScore) {
      window.localStorage.setItem('deepsea-best', String(score));
      setBestScore(score);
    }
  }, [score, bestScore]);

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
    setTotalCorrectGuesses(0);
    setTotalPossibleGuesses(0);
    setStreak(0);
    loadCreature(pool, 0, zoneId);
    setScreen("game");
  }, []);

  const loadCreature = (pool, idx, zoneId) => {
    if (idx >= pool.length) { setScreen("result"); return; }
    const c = pool[idx];
    setCurrent({ ...c, seq: normalizeSeq(c.seq, zoneId) });
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
            const zd = ZONES.find(z => z.id === zoneId);
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
    const isPerf = currentGuesses.length === seq.length && pct === 1;
    const perfBonus = isPerf ? 100 : 0;
    const pts = Math.round(pct * (zoneData?.basePoints || 100) * multiplier) + perfBonus;
    setTotalCorrectGuesses(prev => prev + correct);
    setTotalPossibleGuesses(prev => prev + seq.length);
    setScore(s => s + pts);
    if (isPerf) setStreak(s => s + 1); else setStreak(0);
    setFeedback({ correct, total: seq.length, pts, seq: creature.seq });
    setPhase("feedback");
  }, [zoneData, multiplier]);

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
      const accuracy = totalPossibleGuesses > 0 ? Math.round((totalCorrectGuesses / totalPossibleGuesses) * 100) : 0;
      completeGame('deep-sea-reveal', accuracy, totalPossibleGuesses);

      setScreen("result");
    } else {
      loadCreature(creatures, nextIdx, zone);
    }
  };

  if (screen === "title") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg, radial-gradient(circle at top, rgba(56,189,248,.25), transparent 40%), radial-gradient(circle at bottom, rgba(14,165,233,.15), transparent 50%), linear-gradient(180deg, #02111f 0%, #001d3d 35%, #000814 100%))",
      fontFamily:"'Segoe UI', sans-serif", color:"#bae6fd", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8, animation: "float 3s ease-in-out infinite" }}>🌊</div>
      <h1 style={{ fontSize:"2.2rem", margin:"0 0 4px", color:"#38bdf8", letterSpacing:2 }}>DEEP SEA REVEAL</h1>
      <p style={{ color:"#7dd3fc", marginBottom:32 }}>Memorise the creature's colour pattern, then recreate it!</p>
      <button onClick={() => setScreen("zone")} style={{
        padding:"16px 40px", borderRadius:999, border:"none",
        background:"linear-gradient(135deg,#38bdf8,#0284c7)",
        color:"#fff", fontWeight:800, fontSize:"1.1rem", cursor:"pointer",
        boxShadow:"0 4px 20px #0284c744, 0 0 30px rgba(56,189,248,.3)",
        transition: "all 0.3s",
      }}
      onMouseDown={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 24px #0284c766"; }}
      onMouseUp={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 20px #0284c744, 0 0 30px rgba(56,189,248,.3)"; }}>🤿 Dive In</button>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );

  if (screen === "zone") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg, radial-gradient(circle at top, rgba(56,189,248,.2), transparent 40%), radial-gradient(circle at bottom, rgba(14,165,233,.1), transparent 50%), linear-gradient(180deg, #02111f 0%, #001d3d 35%, #000814 100%))",
      fontFamily:"'Segoe UI', sans-serif", color:"#bae6fd", padding:24, textAlign:"center",
    }}>
      <h2 style={{ fontSize:"1.8rem", color:"#38bdf8", marginBottom:8 }}>Choose Your Zone</h2>
      <p style={{ color:"#7dd3fc", marginBottom:28 }}>Deeper = harder patterns, more points</p>
      <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:400 }}>
        {ZONES.map((z, i) => (
          <button key={z.id} onClick={() => unlocked[z.id] && startZone(z.id)} style={{
            padding:"16px 24px", borderRadius:16, border:"none",
            background: unlocked[z.id]
              ? `linear-gradient(135deg,rgba(2,132,199,${0.25+i*0.15}),rgba(3,105,161,${0.25+i*0.15}))`
              : "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: unlocked[z.id] ? "#e0f2fe" : "#475569",
            cursor: unlocked[z.id] ? "pointer" : "not-allowed",
            border: `1px solid ${unlocked[z.id] ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.08)"}`,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            boxShadow: unlocked[z.id] ? "0 8px 24px rgba(2,132,199,.2)" : "none",
            transition: "all 0.3s",
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
        background:"rgba(255,255,255,0.08)", color:"#7dd3fc", cursor:"pointer",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
        transition: "all 0.2s",
      }}>← Back</button>
    </div>
  );

  if (screen === "result") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(180deg, radial-gradient(circle at top, rgba(56,189,248,.2), transparent 40%), radial-gradient(circle at bottom, rgba(14,165,233,.1), transparent 50%), linear-gradient(180deg, #02111f 0%, #001d3d 35%, #000814 100%))",
      fontFamily:"'Segoe UI', sans-serif", color:"#bae6fd", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#38bdf8", marginBottom:8 }}>{zoneData?.name} Complete!</h2>
      <div style={{
        background:"rgba(255,255,255,0.08)",
        backdropFilter:"blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
        borderRadius:20,
        padding:"24px",
        border:"1px solid rgba(255,255,255,0.15)",
        boxShadow:"0 8px 32px rgba(0,0,0,.35)",
        marginBottom:24,
        minWidth:280,
      }}>
        <div style={{ color:"#fbbf24", fontWeight:800, fontSize:"1.8rem", marginBottom:8 }}>⭐ {score}</div>
        <div style={{ color:"#7dd3fc", fontSize:"1rem", marginBottom:4 }}>Best Streak: {streak}</div>
        <div style={{ color:"#a5f3fc", fontSize:"1rem" }}>🏆 Best Score: {bestScore}</div>
      </div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startZone(zone)} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"linear-gradient(135deg,#38bdf8,#0284c7)", color:"#fff", fontWeight:700, cursor:"pointer",
          boxShadow:"0 4px 16px rgba(56,189,248,.3)",
          transition:"all 0.2s",
        }}
        onMouseDown={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
        onMouseUp={e => { e.currentTarget.style.transform="translateY(0)"; }}>🔄 Retry</button>
        <button onClick={() => setScreen("zone")} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"rgba(255,255,255,0.08)", color:"#7dd3fc", fontWeight:700, cursor:"pointer",
          backdropFilter:"blur(12px)",
          WebkitBackdropFilter:"blur(12px)",
          border:"1px solid rgba(255,255,255,0.15)",
          transition:"all 0.2s",
        }}
        onMouseDown={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
        onMouseUp={e => { e.currentTarget.style.transform="translateY(0)"; }}>🌊 Zones</button>
      </div>
    </div>
  );

  if (!current) return null;
  const seq = current.seq.split("");

  const zoneThemes = {
    shallow: { bg: "linear-gradient(180deg, radial-gradient(circle at top, rgba(56,189,248,.3), transparent 40%), radial-gradient(circle at bottom, rgba(14,165,233,.1), transparent 50%), linear-gradient(180deg, #02111f 0%, #003d6d 50%, #0a1e3d 100%))", accentColor: "#38bdf8" },
    twilight: { bg: "linear-gradient(180deg, radial-gradient(circle at top, rgba(99,102,241,.25), transparent 40%), radial-gradient(circle at bottom, rgba(79,70,229,.12), transparent 50%), linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #1a0d35 100%))", accentColor: "#6366f1" },
    midnight: { bg: "linear-gradient(180deg, radial-gradient(circle at top, rgba(30,27,75,.3), transparent 40%), radial-gradient(circle at bottom, rgba(15,23,42,.15), transparent 50%), linear-gradient(180deg, #0f0a1d 0%, #1a0d35 50%, #0a051a 100%))", accentColor: "#312e81" },
    hadal: { bg: "linear-gradient(180deg, radial-gradient(circle at top, rgba(88,28,135,.35), transparent 40%), radial-gradient(circle at bottom, rgba(45,16,101,.15), transparent 50%), linear-gradient(180deg, #2d1065 0%, #581c87 50%, #220a4d 100%))", accentColor: "#a78bfa" },
  };

  const currentTheme = zoneThemes[zone] || zoneThemes.shallow;

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background: currentTheme.bg,
      fontFamily:"'Segoe UI', sans-serif", color:"#bae6fd", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:14 }}>
          <span style={{
            background:"rgba(2,132,199,0.3)", border:"1px solid #0284c7",
            padding:"4px 14px", borderRadius:999, fontWeight:700, fontSize:"0.85rem",
          }}>{zoneData?.name}</span>
          <span style={{ color:"#fbbf24", fontWeight:700 }}>⭐ {score}</span>
          <span style={{ color:"#7dd3fc" }}>{round+1}/{creatures.length}</span>
          <span style={{ color:"#a5f3fc", fontWeight:700, fontSize:"0.95rem" }}>🏆 Best Score: {bestScore}</span>
        </div>
        {multiplier > 1 && (
          <div style={{ marginBottom:12, color:"#fb923c", fontWeight:700, textAlign:"center" }}>
            🔥 x{multiplier} Combo
          </div>
        )}

        {phase === "reveal" && (
          <div style={{
            fontSize:"4rem", marginBottom:16,
            opacity: phase === "reveal" ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}>{current.emoji}</div>
        )}

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
          background:"rgba(255,255,255,0.08)", 
          backdropFilter:"blur(16px)",
          WebkitBackdropFilter:"blur(16px)",
          borderRadius:24, 
          padding:"24px",
          textAlign:"center", 
          marginBottom:20,
          border:"1px solid rgba(255,255,255,0.15)",
          boxShadow:"0 8px 32px rgba(0,0,0,.35), 0 0 20px rgba(56,189,248,.15)",
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
            <>
              {feedback.isPerf && (
                <div style={{
                  marginTop:12, padding:16, borderRadius:20,
                  background:"linear-gradient(135deg,#fbbf24,#f59e0b)",
                  color:"#061b31", fontWeight:900, fontSize:"1.2rem", textAlign:"center",
                  boxShadow:"0 0 30px rgba(251,191,36,0.5)",
                }}>
                  🌟 PERFECT MEMORY! 🌟<br />
                  <span style={{ fontSize:"0.9rem" }}>+100 Bonus</span>
                </div>
              )}
              <p style={{ marginTop:12, fontWeight:700, color: feedback.correct===feedback.total?"#4ade80":"#f59e0b" }}>
                {feedback.correct}/{feedback.total} correct · +{feedback.pts} pts
              </p>
              <div style={{ marginTop:12, padding:12, borderRadius:18, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ marginBottom:8, fontWeight:700, color:"#c7d2fe" }}>Correct Pattern</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
                  {feedback.seq.split("").map((c, i) => (
                    <div key={i} style={{
                      width:28, height:28, borderRadius:10,
                      background: COLOR_MAP[c], display:"flex", alignItems:"center", justifyContent:"center",
                      color:"#061b31", fontWeight:700, fontSize:"0.8rem",
                    }}>{c.toUpperCase()}</div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Color buttons */}
        {phase === "answer" && (
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            {Object.entries(COLOR_MAP).map(([key, color]) => (
              <button key={key} onClick={() => guessColor(key)} style={{
                width:70, height:70, borderRadius:16, border:"none",
                background: color, cursor:"pointer",
                boxShadow:`0 4px 16px ${color}55, 0 0 25px ${color}33`,
                fontWeight:700, color:"#fff", fontSize:"0.85rem",
                transition:"all 0.15s",
              }} 
              onMouseDown={e => { e.currentTarget.style.transform="scale(0.88)"; e.currentTarget.style.boxShadow=`0 2px 8px ${color}55`; }}
              onMouseUp={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow=`0 4px 16px ${color}55, 0 0 25px ${color}33`; }}>
                {COLOR_LABEL[key]}
              </button>
            ))}
          </div>
        )}

        {phase === "feedback" && (
          <div style={{ textAlign:"center", marginTop:16 }}>
            <button onClick={nextRound} style={{
              padding:"14px 32px", borderRadius:999, border:"none",
              background:`linear-gradient(135deg, ${currentTheme.accentColor}, rgba(56,189,248,0.7))`,
              color:"#fff", fontWeight:800, cursor:"pointer",
              boxShadow:`0 4px 20px ${currentTheme.accentColor}44`,
              transition:"all 0.2s",
            }}
            onMouseDown={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
            onMouseUp={e => { e.currentTarget.style.transform="translateY(0)"; }}>
              ➡️ Next Creature
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
