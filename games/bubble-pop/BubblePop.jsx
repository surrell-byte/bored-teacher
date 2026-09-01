'use client';

import { useMemo, useState } from 'react';

const palette = [
  ['#ff6b6b', '#ff8e53'],
  ['#a29bfe', '#6c5ce7'],
  ['#74b9ff', '#0984e3'],
  ['#55efc4', '#00b894'],
  ['#fd79a8', '#e84393'],
  ['#ffeaa7', '#fdcb6e'],
  ['#fab1a0', '#e17055'],
  ['#81ecec', '#00cec9'],
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRound() {
  const target = randomBetween(2, 9);
  const totalBubbles = target + randomBetween(4, 8);
  const bubbles = Array.from({ length: totalBubbles }, (_, index) => ({
    id: `${Date.now()}-${index}-${Math.random()}`,
    value: index < target ? target : randomBetween(1, 10),
    isTarget: index < target,
    size: randomBetween(70, 100),
    left: Math.random() * 70 + 5,
    top: Math.random() * 55 + 8,
  }));

  return { target, bubbles, remaining: target };
}

export default function BubblePop({ onComplete }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [roundState, setRoundState] = useState(() => createRound());
  const [feedback, setFeedback] = useState('');
  const [won, setWon] = useState(false);

  const total = useMemo(() => roundState.bubbles.length, [roundState.bubbles.length]);

  const startRound = () => {
    setFeedback('');
    setWon(false);
    setRoundState(createRound());
  };

  const handlePop = (bubbleId, isTarget) => {
    if (won) return;

    if (isTarget) {
      const nextRemaining = roundState.remaining - 1;
      setRoundState((current) => ({
        ...current,
        bubbles: current.bubbles.filter((bubble) => bubble.id !== bubbleId),
        remaining: nextRemaining,
      }));
      setScore((current) => current + 10);
      setFeedback('💥 POP!');

      if (nextRemaining <= 0) {
        setWon(true);
        onComplete?.(score + 10, 100);
      }
      return;
    }

    setScore((current) => Math.max(0, current - 5));
    setFeedback('❌ Wrong!');
  };

  return (
    <main className="bubble-pop-game">
      <style>{STYLES}</style>

      <div className="bubble-pop-shell">
        <div className="bubble-pop-topbar">
          <h1>🫧 Bubble Pop!</h1>
          <div className="bubble-pop-stats">
            <div className="bubble-pop-stat">⭐ <span>{score}</span></div>
            <div className="bubble-pop-stat">💥 Left: <span>{roundState.remaining}</span></div>
          </div>
        </div>

        <div className="bubble-pop-instruction-box">
          <div className="bubble-pop-voice">🎤 Pop all the</div>
          <div className="bubble-pop-target" id="target-display">{roundState.target}</div>
          <div className="bubble-pop-voice">bubbles!</div>
        </div>

        <div className="bubble-pop-area">
          {roundState.bubbles.map((bubble) => {
            const paletteIndex = Math.floor(Math.random() * palette.length);
            const [from, to] = palette[paletteIndex];

            return (
              <button
                key={bubble.id}
                type="button"
                className="bubble-pop-bubble"
                onClick={() => handlePop(bubble.id, bubble.isTarget)}
                style={{
                  left: `${bubble.left}%`,
                  top: `${bubble.top}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  background: `radial-gradient(circle at 35% 35%, ${from}, ${to})`,
                }}
                aria-label={`Bubble ${bubble.value}`}
              >
                {bubble.value}
              </button>
            );
          })}
        </div>

        <div className={`bubble-pop-feedback ${feedback ? 'show' : ''}`}>{feedback}</div>

        {won && (
          <div className="bubble-pop-endcard">
            <h2>🎉 Round Clear!</h2>
            <p>You popped all the {roundState.target} bubbles! Score: {score}</p>
            <button type="button" onClick={() => { setRound((current) => current + 1); startRound(); }}>
              Play Again! 🫧
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

const STYLES = `
.bubble-pop-game {
  min-height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #0d1b4b 0%, #1a237e 60%, #283593 100%);
  font-family: 'Nunito', var(--font-body), sans-serif;
  color: white;
  overflow: hidden;
}
.bubble-pop-shell {
  width: min(100%, 820px);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.bubble-pop-topbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 18px 0;
}
.bubble-pop-shell h1 {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #ffe66d;
  font-size: clamp(2rem, 3vw, 2.5rem);
  text-shadow: 2px 2px 0 #e91e8c;
  margin: 0;
}
.bubble-pop-stats {
  display: flex;
  gap: 16px;
}
.bubble-pop-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: white;
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 4px 12px;
}
.bubble-pop-instruction-box {
  background: linear-gradient(135deg, rgba(233,30,140,0.8), rgba(156,39,176,0.8));
  border-radius: 20px;
  padding: 12px 18px;
  text-align: center;
  margin: 18px 0 10px;
}
.bubble-pop-voice {
  font-size: 1.2rem;
  color: white;
  font-weight: 900;
}
.bubble-pop-target {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.9rem, 3vw, 2.4rem);
  color: #ffe66d;
}
.bubble-pop-area {
  position: relative;
  width: 100%;
  min-height: 420px;
  overflow: hidden;
  border-radius: 18px;
  margin-top: 10px;
}
.bubble-pop-bubble {
  position: absolute;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  cursor: pointer;
  color: white;
  box-shadow: inset -4px -4px 12px rgba(0,0,0,0.2), inset 4px 4px 12px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.1);
  user-select: none;
  transition: transform 0.12s ease;
}
.bubble-pop-bubble:hover { transform: scale(1.1); }
.bubble-pop-feedback {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(2rem, 4vw, 2.7rem);
  color: #ffe66d;
  text-shadow: 0 0 18px gold;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 20;
}
.bubble-pop-feedback.show { opacity: 1; }
.bubble-pop-endcard {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 30;
  text-align: center;
}
.bubble-pop-endcard h2 {
  margin: 0;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(2.4rem, 5vw, 3rem);
  color: #ffe66d;
  text-shadow: 0 0 30px gold;
}
.bubble-pop-endcard p {
  margin: 0;
  font-size: 1.2rem;
  color: white;
}
.bubble-pop-endcard button {
  appearance: none;
  border: none;
  border-radius: 40px;
  background: linear-gradient(135deg, #e91e8c, #f44336);
  color: white;
  padding: 12px 26px;
  font-size: 1.4rem;
  cursor: pointer;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
}
`;
