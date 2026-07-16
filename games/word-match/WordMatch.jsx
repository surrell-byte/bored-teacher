import { useState, useEffect, useCallback } from "react";
import { useStorage } from "@/hooks/useStorage";

const DATA = [
  { word: "Apple", meaning: "A red or green fruit" },
  { word: "Dog", meaning: "A loyal pet animal" },
  { word: "Car", meaning: "A vehicle with four wheels" },
  { word: "Sun", meaning: "The star that gives us light" },
  { word: "Rain", meaning: "Water falling from clouds" },
  { word: "Book", meaning: "Pages bound together with stories" },
];

export default function WordMatch({ onComplete }) {
  const [shuffledMeanings, setShuffledMeanings] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [bestScore, setBestScore] = useStorage("word-match-best", 0);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = useCallback(() => {
    setShuffledMeanings([...DATA].sort(() => Math.random() - 0.5));
    setSelectedWord(null); setSelectedMeaning(null);
    setMatched(new Set()); setAttempts(0); setFeedback(""); setScore(0); setDone(false);
  }, []);

  useEffect(() => {
    if (!selectedWord || !selectedMeaning) return;
    setAttempts(a => a + 1);
    if (selectedWord === selectedMeaning) {
      const next = new Set([...matched, selectedWord]);
      setMatched(next);
      setFeedback("✅ Correct!");
      setScore(s => s + 1);
      if (next.size === DATA.length) {
        const accuracy = Math.round((DATA.length / (attempts + 1)) * 100);
        if (accuracy > bestScore) {
          setBestScore(accuracy);
        }
        onComplete?.(accuracy, accuracy);
        setDone(true);
        setFeedback("🎉 All matched!");
      }
    } else {
      setFeedback("❌ Try again!");
    }
    setSelectedWord(null); setSelectedMeaning(null);
  }, [selectedWord, selectedMeaning]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)", fontFamily: "'Segoe UI', sans-serif", padding: 24, color: "#f1f5f9" }}>
      <h1 style={{ fontSize: "2rem", margin: "0 0 4px", color: "#818cf8" }}>🔤 Word Match</h1>
      <p style={{ color: "#94a3b8" }}>Best Accuracy: {bestScore}%</p>
      <p style={{ color: "#94a3b8", margin: "4px 0" }}>Current Score: <strong style={{ color: "#f5c842" }}>{score}</strong> / {DATA.length}</p>
      <p style={{ margin: "0 0 20px", fontWeight: 700, color: feedback.startsWith("✅") || feedback.startsWith("🎉") ? "#4ade80" : "#f87171", minHeight: 24 }}>{feedback}</p>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 160 }}>
          <h3 style={{ margin: "0 0 8px", textAlign: "center", color: "#a5b4fc" }}>Words</h3>
          {DATA.map(({ word }) => {
            const isMatched = matched.has(word);
            const isSelected = selectedWord === word;
            return (<button key={word} onClick={() => !isMatched && setSelectedWord(word)} style={{ padding: "12px 20px", borderRadius: 12, border: "none", cursor: isMatched ? "default" : "pointer", fontWeight: 700, fontSize: "1rem", background: isMatched ? "#166534" : isSelected ? "#4f46e5" : "#1e293b", color: isMatched ? "#4ade80" : isSelected ? "#fff" : "#cbd5e1", transform: isSelected ? "scale(1.04)" : "scale(1)", transition: "all 0.15s", textDecoration: isMatched ? "line-through" : "none" }}>{word}</button>);
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 260 }}>
          <h3 style={{ margin: "0 0 8px", textAlign: "center", color: "#a5b4fc" }}>Meanings</h3>
          {shuffledMeanings.map(({ word, meaning }) => {
            const isMatched = matched.has(word);
            const isSelected = selectedMeaning === word;
            return (<button key={word} onClick={() => !isMatched && setSelectedMeaning(word)} style={{ padding: "12px 16px", borderRadius: 12, border: "none", cursor: isMatched ? "default" : "pointer", fontWeight: 500, fontSize: "0.9rem", textAlign: "left", background: isMatched ? "#166534" : isSelected ? "#4f46e5" : "#1e293b", color: isMatched ? "#4ade80" : isSelected ? "#fff" : "#cbd5e1", transform: isSelected ? "scale(1.02)" : "scale(1)", transition: "all 0.15s" }}>{meaning}</button>);
          })}
        </div>
      </div>
      {done && (<button onClick={startGame} style={{ marginTop: 28, padding: "14px 36px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", fontWeight: 800, fontSize: "1.1rem", cursor: "pointer" }}>🔄 Play Again</button>)}
    </div>
  );
}