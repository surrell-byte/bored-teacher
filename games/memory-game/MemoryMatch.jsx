import { useState, useEffect, useCallback } from "react";
import "./MemoryMatch.css";

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
    <div className="memory-game">
      <div className="memory-header">
        <h1>🧠 Memory Match</h1>
        <p className="memory-moves">Moves: <strong>{moves}</strong></p>
      </div>

      <div className="memory-board">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.has(idx);
          const isMatched = matched.has(idx);
          return (
            <div
              key={idx}
              onClick={() => flip(idx)}
              className={`memory-card ${
                isMatched
                  ? "memory-card--matched"
                  : isFlipped
                    ? "memory-card--flipped"
                    : "memory-card--hidden"
              }`}
            >
              {isFlipped ? (
                <>
                  <span className="memory-card-emoji">{card.emoji}</span>
                  <span className="memory-card-word">{card.word}</span>
                </>
              ) : "❓"}
            </div>
          );
        })}
      </div>

      {won && (
        <div className="memory-win">
          🎉 You won in {moves} moves!
        </div>
      )}

      <button onClick={startGame} className="memory-restart-btn">
        🔄 Restart
      </button>
    </div>
  );
}