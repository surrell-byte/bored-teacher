import { useState, useEffect, useCallback, useMemo } from "react";
import "./MemoryMatch.css";

/* =========================================================
   VOCABULARY CATEGORIES
========================================================= */
const VOCABULARY_SETS = {
  Animals: [
    { word: "Dog", emoji: "🐶" },
    { word: "Cat", emoji: "🐱" },
    { word: "Fish", emoji: "🐟" },
    { word: "Bird", emoji: "🐦" },
    { word: "Elephant", emoji: "🐘" },
    { word: "Lion", emoji: "🦁" },
    { word: "Monkey", emoji: "🐵" },
    { word: "Penguin", emoji: "🐧" },
  ],
  Food: [
    { word: "Apple", emoji: "🍎" },
    { word: "Banana", emoji: "🍌" },
    { word: "Pizza", emoji: "🍕" },
    { word: "Bread", emoji: "🍞" },
    { word: "Cheese", emoji: "🧀" },
    { word: "Milk", emoji: "🥛" },
    { word: "Watermelon", emoji: "🍉" },
    { word: "Cookie", emoji: "🍪" },
  ],
  Weather: [
    { word: "Sun", emoji: "☀️" },
    { word: "Moon", emoji: "🌙" },
    { word: "Cloud", emoji: "☁️" },
    { word: "Rain", emoji: "🌧️" },
    { word: "Rainbow", emoji: "🌈" },
    { word: "Lightning", emoji: "⚡" },
    { word: "Snow", emoji: "❄️" },
    { word: "Wind", emoji: "💨" },
  ],
  School: [
    { word: "Book", emoji: "📚" },
    { word: "Pencil", emoji: "✏️" },
    { word: "Bag", emoji: "🎒" },
    { word: "Ruler", emoji: "📏" },
    { word: "Pen", emoji: "🖊️" },
    { word: "Desk", emoji: "🪑" },
    { word: "Computer", emoji: "💻" },
    { word: "Clock", emoji: "⏰" },
  ],
  Home: [
    { word: "Chair", emoji: "🪑" },
    { word: "Bed", emoji: "🛏️" },
    { word: "Table", emoji: "🪵" },
    { word: "Lamp", emoji: "💡" },
    { word: "Door", emoji: "🚪" },
    { word: "Television", emoji: "📺" },
    { word: "Phone", emoji: "📱" },
    { word: "Cup", emoji: "☕" },
  ],
  Transport: [
    { word: "Car", emoji: "🚗" },
    { word: "Bus", emoji: "🚌" },
    { word: "Train", emoji: "🚂" },
    { word: "Plane", emoji: "✈️" },
    { word: "Bicycle", emoji: "🚴" },
    { word: "Boat", emoji: "🚤" },
    { word: "Motorcycle", emoji: "🏍️" },
    { word: "Truck", emoji: "🚚" },
  ],
};

/* =========================================================
   DIFFICULTY SETTINGS
========================================================= */
const DIFFICULTIES = {
  Easy: { pairs: 4, columns: 4, time: 0 },
  Medium: { pairs: 6, columns: 4, time: 120 },
  Hard: { pairs: 8, columns: 4, time: 90 },
};

/* =========================================================
   MATCH TYPES
========================================================= */
const MATCH_TYPES = [
  { id: "picture-picture", label: "Picture ↔ Picture", value: "picture" },
  { id: "picture-word", label: "Picture ↔ Word", value: "mixed" },
  { id: "word-word", label: "Word ↔ Word", value: "word" },
];

/* =========================================================
   UTILITIES
========================================================= */
function fisherYates(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getStars(accuracy) {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  return 1;
}

function speak(text) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
}

/* =========================================================
   CARD GENERATION
========================================================= */
function generateDeck(vocabulary, matchType, pairs) {
  const selected = vocabulary.slice(0, pairs);
  const cards = [];

  selected.forEach((item) => {
    if (matchType === "picture") {
      cards.push({ ...item, type: "emoji", id: Math.random() });
      cards.push({ ...item, type: "emoji", id: Math.random() });
    } else if (matchType === "mixed") {
      cards.push({ ...item, type: "emoji", id: Math.random() });
      cards.push({ ...item, type: "text", id: Math.random() });
    } else if (matchType === "word") {
      cards.push({ ...item, type: "text", id: Math.random() });
      cards.push({ ...item, type: "text", id: Math.random() });
    }
  });

  return fisherYates(cards);
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function MemoryMatch({ onComplete }) {
  // Game state
  const [gameState, setGameState] = useState("menu"); // menu, playing, won
  const [category, setCategory] = useState("Animals");
  const [difficulty, setDifficulty] = useState("Easy");
  const [matchType, setMatchType] = useState("mixed");

  // Gameplay state
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const settings = useMemo(() => DIFFICULTIES[difficulty], [difficulty]);
  const vocabulary = useMemo(() => VOCABULARY_SETS[category], [category]);

  // Initialize game
  const startGame = useCallback(() => {
    const timeLimit = settings.time;
    const deck = generateDeck(vocabulary, matchType, settings.pairs);
    setCards(deck);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
    setTimeLeft(timeLimit);
    setStartTime(Date.now());
    setGameState("playing");
    setFeedback(null);
  }, [vocabulary, matchType, settings]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing" || settings.time === 0) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, settings.time - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        setGameState("lost");
      }
    }, 100);
    return () => clearInterval(interval);
  }, [gameState, startTime, settings.time]);

  // Card flip handler
  const flip = useCallback(
    (idx) => {
      if (gameState !== "playing" || locked || flipped.includes(idx) || matched.has(idx)) return;
      
      const next = [...flipped, idx];
      setFlipped(next);
      
      // Announce card when flipped
      const card = cards[idx];
      speak(card.word);

      if (next.length === 2) {
        setLocked(true);
        const [cardA, cardB] = [cards[next[0]], cards[next[1]]];
        const isMatch = cardA.word === cardB.word;

        if (isMatch) {
          setFeedback({ type: "success", text: `Great! ${cardA.word}!` });
          setMatched((prev) => {
            const newMatched = new Set(prev);
            newMatched.add(next[0]);
            newMatched.add(next[1]);

            // Check win condition
            if (newMatched.size === cards.length) {
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              const totalPairs = cards.length / 2;
              const accuracy = Math.max(0, Math.round(100 - ((moves + 1 - totalPairs) / totalPairs) * 50));
              
              setTimeout(() => {
                setGameState("won");
                setFeedback({ type: "win", accuracy, time: elapsed });
              }, 800);
            }

            return newMatched;
          });
          setMoves((m) => m + 1);
          setTimeout(() => {
            setFlipped([]);
            setLocked(false);
            setFeedback(null);
          }, 800);
        } else {
          setFeedback({ type: "error", text: "Try again!" });
          setTimeout(() => {
            setFlipped([]);
            setLocked(false);
            setFeedback(null);
          }, 1200);
          setMoves((m) => m + 1);
        }
      }
    },
    [gameState, locked, flipped, matched, cards, startTime, moves]
  );

  // Render menu
  if (gameState === "menu") {
    return (
      <div className="memory-game memory-game--menu">
        <div className="memory-menu">
          <h1>🧠 Memory Match</h1>
          <p className="memory-menu-subtitle">Learn English vocabulary through interactive matching!</p>

          <div className="memory-menu-section">
            <h3>📚 Choose Category</h3>
            <div className="memory-menu-buttons">
              {Object.keys(VOCABULARY_SETS).map((cat) => (
                <button
                  key={cat}
                  className={`memory-menu-btn ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="memory-menu-section">
            <h3>⚙️ Choose Difficulty</h3>
            <div className="memory-menu-buttons">
              {Object.keys(DIFFICULTIES).map((diff) => (
                <button
                  key={diff}
                  className={`memory-menu-btn ${difficulty === diff ? "active" : ""}`}
                  onClick={() => setDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="memory-menu-section">
            <h3>🎯 Match Type</h3>
            <div className="memory-menu-buttons">
              {MATCH_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`memory-menu-btn ${matchType === type.value ? "active" : ""}`}
                  onClick={() => setMatchType(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame} className="memory-start-btn">
            🚀 Start Game
          </button>
        </div>
      </div>
    );
  }

  // Render game
  if (gameState === "playing") {
    return (
      <div className="memory-game">
        <div className="memory-header">
          <h1>🧠 Memory Match</h1>
          <div className="memory-hud">
            <div className="memory-hud-item">
              <span className="memory-hud-label">Moves</span>
              <span className="memory-hud-value">{moves}</span>
            </div>
            <div className="memory-hud-item">
              <span className="memory-hud-label">Matched</span>
              <span className="memory-hud-value">{matched.size / 2} / {cards.length / 2}</span>
            </div>
            {settings.time > 0 && (
              <div className="memory-hud-item">
                <span className="memory-hud-label">⏱ Time</span>
                <span className={`memory-hud-value ${timeLeft < 10 ? "warning" : ""}`}>
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
        </div>

        {feedback && (
          <div className={`memory-feedback memory-feedback--${feedback.type}`}>
            {feedback.text}
          </div>
        )}

        <div 
          className="memory-board"
          style={{ gridTemplateColumns: `repeat(${settings.columns}, 1fr)` }}
        >
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.has(idx);
            const isMatched = matched.has(idx);
            return (
              <button
                key={idx}
                onClick={() => flip(idx)}
                disabled={isMatched}
                className={`memory-card ${
                  isMatched
                    ? "memory-card--matched"
                    : isFlipped
                      ? "memory-card--flipped"
                      : "memory-card--hidden"
                }`}
                aria-label={`Card ${idx + 1}`}
              >
                <div className="memory-card-inner">
                  <div className="memory-card-front">❓</div>
                  <div className="memory-card-back">
                    {card.type === "emoji" ? (
                      <>
                        <span className="memory-card-emoji">{card.emoji}</span>
                      </>
                    ) : (
                      <>
                        <span className="memory-card-word">{card.word}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={() => setGameState("menu")} className="memory-back-btn">
          ← Back to Menu
        </button>
      </div>
    );
  }

  // Render win screen
  if (gameState === "won") {
    const accuracy = feedback?.accuracy || 0;
    const stars = getStars(accuracy);
    const time = feedback?.time || 0;

    return (
      <div className="memory-game memory-game--won">
        <div className="memory-win-screen">
          <div className="memory-win-title">🎉 EXCELLENT! 🎉</div>
          <p className="memory-win-subtitle">You matched all {cards.length / 2} pairs!</p>

          <div className="memory-stars">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`star ${i < stars ? "filled" : ""}`}>
                ⭐
              </span>
            ))}
          </div>

          <div className="memory-results">
            <div className="memory-result-row">
              <span className="memory-result-label">Pairs</span>
              <span className="memory-result-value">{cards.length / 2}</span>
            </div>
            <div className="memory-result-row">
              <span className="memory-result-label">Moves</span>
              <span className="memory-result-value">{moves}</span>
            </div>
            <div className="memory-result-row">
              <span className="memory-result-label">Time</span>
              <span className="memory-result-value">{time}s</span>
            </div>
            <div className="memory-result-row">
              <span className="memory-result-label">Accuracy</span>
              <span className="memory-result-value">{accuracy}%</span>
            </div>
          </div>

          <div className="memory-words-learned">
            <h3>📚 Words Learned</h3>
            <div className="memory-words-grid">
              {Array.from(new Set(cards.map((c) => c.word))).map((word) => {
                const card = cards.find((c) => c.word === word);
                return (
                  <div
                    key={word}
                    className="memory-word-badge"
                    onClick={() => speak(word)}
                  >
                    {card?.emoji} {word} 🔊
                  </div>
                );
              })}
            </div>
          </div>

          <div className="memory-win-buttons">
            <button onClick={startGame} className="memory-play-again-btn">
              🔄 Play Again
            </button>
            <button onClick={() => setGameState("menu")} className="memory-menu-btn-primary">
              📋 Change Settings
            </button>
          </div>
        </div>
      </div>
    );
  }
}