import { useState, useCallback } from "react";

const QUESTIONS_DB = {
  1: [
    { emoji:"🏀", sentence:"He _______ basketball every Sunday.", correct:"plays", options:["play","plays","is playing","played"] },
    { emoji:"📖", sentence:"Right now, she _______ a book.", correct:"is reading", options:["reads","read","is reading","has read"] },
    { emoji:"🎂", sentence:"Yesterday, we _______ a birthday cake.", correct:"baked", options:["bake","bakes","baked","have baked"] },
    { emoji:"🏃", sentence:"They _______ to school every morning.", correct:"walk", options:["walk","walks","walking","walked"] },
    { emoji:"🎮", sentence:"Listen! The baby _______ in the room.", correct:"is crying", options:["cries","cry","is crying","cried"] },
    { emoji:"✈️", sentence:"She _______ to Paris last summer.", correct:"travelled", options:["travels","travelling","travelled","has travelled"] },
    { emoji:"🍕", sentence:"I usually _______ pizza for dinner.", correct:"eat", options:["eat","eats","am eating","ate"] },
    { emoji:"📱", sentence:"Look! It _______ outside.", correct:"is raining", options:["rains","rain","is raining","rained"] },
    { emoji:"🐱", sentence:"My cat _______ milk every morning.", correct:"drinks", options:["drink","drinks","is drinking","drank"] },
    { emoji:"🎬", sentence:"We _______ a great movie yesterday.", correct:"watched", options:["watch","watches","watching","watched"] },
  ],
  2: [
    { emoji:"🏆", sentence:"She _______ already finished her homework.", correct:"has", options:["have","has","had","is"] },
    { emoji:"🚀", sentence:"They _______ to the moon in the future.", correct:"will travel", options:["travel","travelled","will travel","are travelling"] },
    { emoji:"🎨", sentence:"He _______ a picture for two hours now.", correct:"has been painting", options:["paints","painted","has been painting","is painting"] },
    { emoji:"🏊", sentence:"I have never _______ such a big fish.", correct:"seen", options:["see","saw","seen","seeing"] },
    { emoji:"🏀", sentence:"Our team _______ the match last night!", correct:"won", options:["wins","is winning","won","has won"] },
    { emoji:"📞", sentence:"She _______ you back tomorrow.", correct:"will call", options:["calls","called","has called","will call"] },
    { emoji:"🌧️", sentence:"It _______ heavily when we arrived.", correct:"was raining", options:["rained","rains","was raining","is raining"] },
    { emoji:"📚", sentence:"By next year, they _______ their studies.", correct:"will have finished", options:["finish","finished","will finish","will have finished"] },
    { emoji:"🎸", sentence:"She _______ the guitar since she was eight.", correct:"has played", options:["plays","played","has played","is playing"] },
    { emoji:"🏋️", sentence:"He _______ every day before this injury.", correct:"trained", options:["trains","trained","is training","has trained"] },
  ],
  3: [
    { emoji:"🌍", sentence:"By 2050, scientists _______ many solutions.", correct:"will have found", options:["find","found","will find","will have found"] },
    { emoji:"🏙️", sentence:"While she _______, I cooked dinner.", correct:"was working", options:["worked","works","was working","is working"] },
    { emoji:"🎭", sentence:"If it _______, we'll cancel the event.", correct:"rains", options:["rained","rains","will rain","is raining"] },
    { emoji:"🧪", sentence:"The experiment _______ three times already.", correct:"has been repeated", options:["repeated","repeats","has been repeated","was repeated"] },
    { emoji:"🚂", sentence:"The train _______ before we arrived.", correct:"had already left", options:["left","has left","had already left","was leaving"] },
    { emoji:"📝", sentence:"She _______ the report all morning.", correct:"has been writing", options:["writes","wrote","has been writing","had written"] },
    { emoji:"🎯", sentence:"He _______ to become a professional player.", correct:"aspires", options:["aspired","aspires","is aspiring","has aspired"] },
    { emoji:"🌅", sentence:"They _______ the sunrise when we called.", correct:"were watching", options:["watch","watched","were watching","have watched"] },
    { emoji:"🔬", sentence:"The bacteria _______ slowly in the sample.", correct:"were multiplying", options:["multiply","multiplied","were multiplying","have multiplied"] },
    { emoji:"🏆", sentence:"By the time he retired, he _______ 50 games.", correct:"had won", options:["wins","won","has won","had won"] },
  ],
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function WarriorsGrammarSlam({ onComplete }) {
  const [screen, setScreen] = useState("start");
  const [playerName, setPlayerName] = useState("");
  const [level, setLevel] = useState(1);
  const [unlocked, setUnlocked] = useState({ 1: true, 2: false, 3: false });
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const startLevel = useCallback((lvl) => {
    setLevel(lvl);
    setQuestions(shuffle(QUESTIONS_DB[lvl]));
    setIdx(0);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setAnswered(false);
    setScreen("game");
  }, []);

  const current = questions[idx];

  const answer = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.correct) {
      const pts = 10 + (streak >= 2 ? 5 : 0);
      setScore(s => s + pts);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const nextLvl = level + 1;
      if (QUESTIONS_DB[nextLvl]) setUnlocked(u => ({ ...u, [nextLvl]: true }));
      const accuracy = Math.round((score / (questions.length * 10)) * 100);
      onComplete?.(score, accuracy);
      setScreen("complete");
    } else {
      setIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const LEVEL_COLORS = { 1: "#f59e0b", 2: "#3b82f6", 3: "#8b5cf6" };
  const LEVEL_NAMES = { 1: "Rookie", 2: "All-Star", 3: "MVP" };

  if (screen === "start") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",
      fontFamily: "'Segoe UI', sans-serif", color: "#f1f5f9", padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: "3.5rem", marginBottom: 8 }}>🏀</div>
      <h1 style={{ fontSize: "2rem", margin: "0 0 4px", color: "#fbbf24" }}>WARRIORS GRAMMAR SLAM</h1>
      <p style={{ color: "#93c5fd", marginBottom: 24 }}>Tense Championship</p>
      <input
        value={playerName}
        onChange={e => setPlayerName(e.target.value)}
        placeholder="Enter your player name"
        style={{
          padding: "12px 20px", borderRadius: 12, border: "1px solid #334155",
          background: "#1e293b", color: "#f1f5f9", fontSize: "1rem",
          marginBottom: 20, width: 240, textAlign: "center",
        }}
      />
      <div style={{ marginBottom: 20 }}>
        {[1, 2, 3].map(lvl => (
          <button key={lvl} onClick={() => { if (unlocked[lvl]) startLevel(lvl); }}
            style={{
              display: "block", width: 240, margin: "8px auto",
              padding: "14px 20px", borderRadius: 14, border: "none",
              background: unlocked[lvl] ? LEVEL_COLORS[lvl] : "#374151",
              color: "#fff", fontWeight: 800, fontSize: "1rem",
              cursor: unlocked[lvl] ? "pointer" : "not-allowed",
            }}>
            {unlocked[lvl] ? `⛹️ Level ${lvl}: ${LEVEL_NAMES[lvl]}` : `🔒 Level ${lvl}: ${LEVEL_NAMES[lvl]}`}
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "complete") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#1a1a2e,#16213e)",
      fontFamily: "'Segoe UI', sans-serif", color: "#f1f5f9", padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: 12 }}>🏆</div>
      <h2 style={{ fontSize: "2rem", color: "#fbbf24", marginBottom: 8 }}>Level {level} Complete!</h2>
      <p style={{ color: "#93c5fd", fontSize: "1.2rem", marginBottom: 24 }}>
        {playerName || "Player"}: {score} pts
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => startLevel(level)} style={{
          padding: "14px 28px", borderRadius: 999, border: "none",
          background: "#6366f1", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>🔄 Retry</button>
        {QUESTIONS_DB[level + 1] && unlocked[level + 1] && (
          <button onClick={() => startLevel(level + 1)} style={{
            padding: "14px 28px", borderRadius: 999, border: "none",
            background: LEVEL_COLORS[level + 1], color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>🏀 Next Level</button>
        )}
        <button onClick={() => setScreen("start")} style={{
          padding: "14px 28px", borderRadius: 999, border: "none",
          background: "#374151", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (!current) return null;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",
      fontFamily: "'Segoe UI', sans-serif", color: "#f1f5f9", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ background: LEVEL_COLORS[level], padding: "4px 14px", borderRadius: 999, fontWeight: 700, fontSize: "0.85rem" }}>
            {LEVEL_NAMES[level]}
          </span>
          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: "1.2rem" }}>{score}</span>
            <span style={{ color: "#64748b", fontSize: "0.85rem" }}> pts</span>
          </div>
          <span style={{ color: "#94a3b8" }}>{idx + 1}/{questions.length}</span>
        </div>

        {streak >= 2 && (
          <div style={{ textAlign: "center", color: "#f97316", fontWeight: 700, marginBottom: 8 }}>
            🔥 {streak} streak! +5 bonus
          </div>
        )}

        <div style={{ height: 6, background: "#1e293b", borderRadius: 999, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(idx / questions.length) * 100}%`, background: LEVEL_COLORS[level], borderRadius: 999, transition: "width 0.3s" }} />
        </div>

        <div style={{
          background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: 28, textAlign: "center",
          marginBottom: 20, border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>{current.emoji}</div>
          <p style={{ fontSize: "1.15rem", fontWeight: 600, color: "#e2e8f0", lineHeight: 1.6 }}>
            {current.sentence.replace("_______", "___")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {current.options.map(opt => {
            const isCorrect = answered && opt === current.correct;
            const isWrong = answered && opt === selected && opt !== current.correct;
            return (
              <button key={opt} onClick={() => answer(opt)} style={{
                padding: "14px 16px", borderRadius: 14, border: "none",
                cursor: answered ? "default" : "pointer",
                fontWeight: 700, fontSize: "0.95rem",
                background: isCorrect ? "#166534" : isWrong ? "#7f1d1d" : "rgba(255,255,255,0.1)",
                color: isCorrect ? "#4ade80" : isWrong ? "#fca5a5" : "#f1f5f9",
                border: isCorrect ? "2px solid #22c55e" : isWrong ? "2px solid #ef4444" : "2px solid transparent",
                transition: "all 0.15s",
              }}>{opt}</button>
            );
          })}
        </div>

        {answered && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <p style={{ fontWeight: 700, color: selected === current.correct ? "#4ade80" : "#f87171", marginBottom: 12 }}>
              {selected === current.correct ? "🏀 Slam dunk! Correct!" : `❌ The answer is "${current.correct}"`}
            </p>
            <button onClick={next} style={{
              padding: "14px 32px", borderRadius: 999, border: "none",
              background: "linear-gradient(135deg,#f59e0b,#d97706)",
              color: "#111", fontWeight: 800, cursor: "pointer",
            }}>➡️ Next Question</button>
          </div>
        )}
      </div>
    </div>
  );
}