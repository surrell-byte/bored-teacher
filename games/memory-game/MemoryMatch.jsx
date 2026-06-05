import { useState, useEffect, useCallback } from "react";

const WORDS = [
  { word: "Apple", emoji: "🍎" },
  { word: "Dog", emoji: "🐶" },
  { word: "Car", emoji: "🚗" },
  { word: "Sun", emoji: "☀️" },
  { word: "Fish", emoji: "🐟" },
  { word: "Moon", emoji: "🌙" },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MemoryMatch({ onComplete }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  const startGame = useCallback(() => {
    const deck = shuffle([...WORDS, ...WORDS].map((w, i) => ({ ...w, id: i })));
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
    setWon(false);
  }, []);

  useEffect(() => { startGame(); }, [startGame]);

  const flip = (id) => {
    if (locked || flipped.includes(id) || matched.has(id)) return;
    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      setLocked(true);
      setMoves(m => {
        const newMoves = m + 1;
        const [a, b] = next.map(idx => cards[idx]);
        if (a.word === b.word) {
          setMatched(prev => {
            const s = new Set(prev);
            s.add(next[0]); s.add(next[1]);
            if (s.size === cards.length) {
              setWon(true);
              const totalPairs = cards.length / 2;
              const accuracy = Math.max(0, Math.round(100 - ((newMoves - totalPairs) / totalPairs) * 50));
              setTimeout(() => onComplete?.(accuracy, accuracy), 800);
            }
            return s;
          });
          setFlipped([]);
          setLocked(false);
        } else {
          setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
        }
        return newMoves;
      });
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
      fontFamily: "'Segoe UI', sans-serif", padding: 20,
    }}>
      <h1 style={{ color: "#e2b96f", fontSize: "2rem", margin: "0 0 6px", letterSpacing: 2 }}>🧠 Memory Match</h1>
      <p style={{ color: "#94a3b8", margin: "0 0 18px" }}>Moves: <strong style={{ color: "#f5c842" }}>{moves}</strong></p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12, maxWidth: 440,
      }}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.has(idx);
          const isMatched = matched.has(idx);
          return (
            <div key={idx} onClick={() => flip(idx)} style={{
              width: 90, height: 90, borderRadius: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isFlipped ? "1.5rem" : "2rem",
              background: isMatched
                ? "linear-gradient(135deg,#22c55e,#16a34a)"
                : isFlipped
                  ? "linear-gradient(135deg,#3b82f6,#1d4ed8)"
                  : "linear-gradient(135deg,#334155,#1e293b)",
              color: "#fff",
              boxShadow: isMatched ? "0 0 16px #22c55e66" : "0 4px 12px #0005",
              transform: isFlipped ? "scale(1.04)" : "scale(1)",
              transition: "all 0.2s ease",
              userSelect: "none",
              flexDirection: "column", gap: 2,
              border: isFlipped ? "2px solid rgba(255,255,255,0.2)" : "2px solid transparent",
            }}>
              {isFlipped ? (
                <>
                  <span>{card.emoji}</span>
                  <span style={{ fontSize: "0.6rem", opacity: 0.9 }}>{card.word}</span>
                </>
              ) : "❓"}
            </div>
          );
        })}
      </div>

      {won && (
        <div style={{
          marginTop: 24, padding: "20px 36px", borderRadius: 20,
          background: "linear-gradient(135deg,#f5c842,#e2a02a)",
          color: "#111", fontWeight: 800, fontSize: "1.2rem", textAlign: "center",
        }}>
          🎉 You won in {moves} moves!
        </div>
      )}

      <button onClick={startGame} style={{
        marginTop: 20, padding: "12px 32px", borderRadius: 999, border: "none",
        background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff",
        fontWeight: 700, fontSize: "1rem", cursor: "pointer",
        boxShadow: "0 4px 12px #6366f144",
      }}>
        🔄 Restart
      </button>
    </div>
  );
}