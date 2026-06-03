import { useState, useEffect, useCallback } from "react";

const FRUITS = ["🍎","🍌","🍇","🍊","🍓","🍉","🍍","🥝","🍑"];

export default function MissingFruit() {
  const [fruits, setFruits] = useState([]);
  const [missingIdx, setMissingIdx] = useState(-1);
  const [phase, setPhase] = useState("memorise"); // memorise | guess | result
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState(new Set());

  const startRound = useCallback(() => {
    const shuffled = [...FRUITS].sort(() => Math.random() - 0.5);
    const miss = Math.floor(Math.random() * shuffled.length);
    setFruits(shuffled);
    setMissingIdx(miss);
    setPhase("memorise");
    setResult(null);
    setWrong(new Set());
    setTimeout(() => setPhase("guess"), 5000);
  }, []);

  useEffect(() => { startRound(); }, []);

  const guess = (idx) => {
    if (phase !== "guess") return;
    if (idx === missingIdx) {
      setResult("correct");
      setScore(s => s + 10);
      setPhase("result");
    } else {
      setWrong(prev => new Set([...prev, idx]));
      setResult("wrong");
      setTimeout(() => setResult(null), 700);
    }
  };

  const next = () => { setRound(r => r + 1); startRound(); };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#fef3c7,#fed7aa,#fde68a)",
      fontFamily: "'Segoe UI', sans-serif", padding: 24,
    }}>
      <h1 style={{ fontSize: "2.2rem", margin: "0 0 4px", color: "#92400e" }}>🍎 What's Missing?</h1>
      <p style={{ color: "#b45309", margin: "0 0 8px", fontWeight: 600 }}>
        Score: <strong>{score}</strong> · Round {round + 1}
      </p>

      <div style={{
        background: "rgba(255,255,255,0.7)", borderRadius: 24, padding: "16px 20px",
        marginBottom: 16, backdropFilter: "blur(4px)", boxShadow: "0 8px 24px #0001",
      }}>
        <p style={{ textAlign: "center", fontWeight: 700, color: "#92400e", margin: "0 0 12px", fontSize: "1.1rem" }}>
          {phase === "memorise" ? "⏳ Memorise the fruits!" :
           phase === "guess" ? "🔍 Which fruit is missing?" :
           result === "correct" ? "🎉 Correct!" : ""}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 360 }}>
          {fruits.map((fruit, idx) => {
            const hidden = phase !== "memorise" && idx === missingIdx;
            const isWrong = wrong.has(idx);
            return (
              <div key={idx} onClick={() => guess(idx)} style={{
                width: 64, height: 64, borderRadius: 16, fontSize: "2rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: phase === "guess" && !hidden ? "pointer" : "default",
                background: hidden
                  ? "linear-gradient(135deg,#e5e7eb,#d1d5db)"
                  : isWrong
                    ? "#fee2e2"
                    : "white",
                border: isWrong ? "2px solid #ef4444" : "2px solid #fde68a",
                boxShadow: "0 4px 8px #0001",
                transition: "all 0.2s",
                transform: hidden ? "scale(0.9)" : "scale(1)",
              }}>
                {hidden ? "❓" : fruit}
              </div>
            );
          })}
        </div>
        {phase === "memorise" && (
          <div style={{
            marginTop: 12, height: 6, borderRadius: 999,
            background: "#fde68a", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: "#f59e0b",
              animation: "shrink 5s linear forwards",
            }} />
          </div>
        )}
      </div>

      {phase === "result" && result === "correct" && (
        <button onClick={next} style={{
          padding: "14px 36px", borderRadius: 999, border: "none",
          background: "linear-gradient(135deg,#22c55e,#16a34a)",
          color: "#fff", fontWeight: 800, fontSize: "1.1rem", cursor: "pointer",
          boxShadow: "0 4px 16px #22c55e44",
        }}>
          ➡️ Next Round
        </button>
      )}

      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
}
