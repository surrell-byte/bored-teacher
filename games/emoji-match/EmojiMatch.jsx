import { useState, useEffect, useCallback } from "react";
import { useGame } from "@/lib/gameState";

const EMOJI_POOL = ["🦓","🐬","🦈","🐈","🥐","🐅","🍕","🦒","🐙","🦋","🐧","🍓","🌸","🦁","🦊","🐻","🍦","🎸"];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function EmojiMatch({ onComplete }) {
  const { completeGame } = useGame();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);
  const [pairs, setPairs] = useState(8);

  const startGame = useCallback((numPairs = pairs) => {
    const chosen = shuffle(EMOJI_POOL).slice(0, numPairs);
    const deck = shuffle([...chosen, ...chosen].map((e, i) => ({ emoji: e, id: i })));
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
    setWon(false);
  }, [pairs]);

  useEffect(() => { startGame(8); }, []);

  const flip = (idx) => {
    if (locked || flipped.includes(idx) || matched.has(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setLocked(true);
      setMoves(m => m + 1);
      const [a, b] = next.map(i => cards[i]);
      if (a.emoji === b.emoji) {
        setMatched(prev => {
          const s = new Set(prev);
          s.add(next[0]); s.add(next[1]);
          if (s.size === cards.length) {
            setTimeout(() => {
              setWon(true);
              const accuracy = Math.max(0, 100 - (moves - pairs) * 10);
              completeGame('emoji-match', accuracy, pairs);
            onComplete?.(accuracy, pairs);
            }, 300);
          }
          return s;
        });
        setFlipped([]);
        setLocked(false);
      } else {
        setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
      }
    }
  };

  const cols = pairs <= 6 ? 3 : pairs <= 9 ? 4 : 4;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg,#1e293b 0%,#0f172a 100%)",
      fontFamily: "'Segoe UI', sans-serif", padding: 20,
    }}>
      <h2 style={{
        fontSize: "2rem", margin: "0 0 8px", letterSpacing: 2,
        background: "linear-gradient(135deg,#FFE6B0,#FFB347)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>🐣 EMOJI MATCH</h2>

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#0f172aee", padding: "10px 22px", borderRadius: 60,
        margin: "8px 0 20px", width: "100%", maxWidth: "min(640px, calc(100vw - 56px))", boxSizing: "border-box",
        border: "1px solid #334155",
      }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#cbd5e6" }}>🎯 MOVES</span>
        <span style={{
          background: "#2d3a5e", padding: "6px 18px", borderRadius: 40,
          fontWeight: "bold", fontSize: "1.5rem", color: "#facc15",
          fontFamily: "monospace",
        }}>{String(moves).padStart(3, "0")}</span>
        <button onClick={() => startGame(pairs)} style={{
          background: "#ff9800", border: "none", fontSize: "0.95rem", fontWeight: "bold",
          padding: "8px 18px", borderRadius: 40, cursor: "pointer", color: "#0f172a",
          boxShadow: "0 4px 0 #b45f06",
        }}>🔄 New</button>
      </div>

      {/* Pair size selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[6,8,10].map(n => (
          <button key={n} onClick={() => { setPairs(n); startGame(n); }} style={{
            padding: "6px 16px", borderRadius: 999, border: "none", cursor: "pointer",
            background: pairs === n ? "#f97316" : "#1e293b",
            color: pairs === n ? "#fff" : "#94a3b8",
            fontWeight: 700, fontSize: "0.85rem",
          }}>{n} pairs</button>
        ))}
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 10, maxWidth: "min(640px, calc(100vw - 56px))",
      }}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.has(idx);
          const isMatched = matched.has(idx);
          return (
            <div key={idx} onClick={() => flip(idx)} style={{
              width: 72, height: 72, borderRadius: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isFlipped ? "2rem" : "1.6rem",
              background: isMatched
                ? "linear-gradient(135deg,#166534,#15803d)"
                : isFlipped
                  ? "linear-gradient(135deg,#1e40af,#1d4ed8)"
                  : "linear-gradient(135deg,#1e293b,#0f172a)",
              boxShadow: isMatched ? "0 0 14px #22c55e66" : "0 4px 12px #0006",
              border: isFlipped ? "1.5px solid rgba(255,255,255,0.15)" : "1.5px solid rgba(255,255,255,0.05)",
              transform: isFlipped ? "scale(1.05)" : "scale(1)",
              transition: "all 0.2s ease",
              userSelect: "none",
            }}>
              {isFlipped ? card.emoji : "?"}
            </div>
          );
        })}
      </div>

      {won && (
        <div style={{
          marginTop: 24, padding: "20px 36px", borderRadius: 20,
          background: "linear-gradient(135deg,#f59e0b,#d97706)",
          color: "#0f172a", fontWeight: 800, fontSize: "1.2rem", textAlign: "center",
        }}>
          🏆 Matched all in {moves} moves!
          <button onClick={() => startGame(pairs)} style={{
            display: "block", margin: "12px auto 0",
            padding: "10px 24px", borderRadius: 999, border: "none",
            background: "#0f172a", color: "#f59e0b", fontWeight: 700, cursor: "pointer",
          }}>🔄 Play Again</button>
        </div>
      )}
    </div>
  );
}
