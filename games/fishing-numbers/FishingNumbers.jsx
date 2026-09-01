'use client';

import { useEffect, useMemo, useState } from 'react';

const fishEmojis = ['🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🦐', '🦞'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildRound() {
  const target = randomBetween(5, 12);
  const correctPairs = [];
  for (let a = 1; a < target && correctPairs.length < 4; a += 1) {
    const b = target - a;
    if (b > 0 && b < 10) correctPairs.push(`${a}+${b}`);
  }
  const pairs = [...correctPairs].sort(() => Math.random() - 0.5).slice(0, randomBetween(3, 5));

  return { target, needed: pairs.length, pairs, fish: [...pairs, ...Array.from({ length: 5 }, () => `${randomBetween(1, 9)}+${randomBetween(1, 9)}`)] };
}

export default function FishingNumbers({ onComplete }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [data, setData] = useState(() => buildRound());
  const [caught, setCaught] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [complete, setComplete] = useState(false);

  const displayedFish = useMemo(() => {
    const results = data.fish.map((expr, index) => ({
      id: `${expr}-${index}-${Math.random()}`,
      expr,
      isCorrect: data.pairs.includes(expr),
      left: randomBetween(6, 72),
      top: randomBetween(12, 58),
      emoji: fishEmojis[randomBetween(0, fishEmojis.length - 1)],
    }));
    return results;
  }, [data]);

  useEffect(() => {
    setCaught(0);
    setFeedback('');
    setComplete(false);
  }, [data]);

  const handleCatch = (expr, isCorrect) => {
    if (complete) return;

    if (isCorrect) {
      const nextCaught = caught + 1;
      setCaught(nextCaught);
      setScore((current) => current + 10);
      setFeedback('🎣 Caught!');

      if (nextCaught >= data.needed) {
        setComplete(true);
        onComplete?.(score + 10, 100);
      }
      return;
    }

    setScore((current) => Math.max(0, current - 3));
    setFeedback('❌ Wrong fish!');
  };

  const startRound = () => {
    setRound((current) => current + 1);
    setData(buildRound());
  };

  return (
    <main className="fishing-numbers-game">
      <style>{STYLES}</style>

      <div className="fishing-numbers-shell">
        <div className="fishing-numbers-topbar">
          <h1>🎣 Fishing!</h1>
          <div className="fishing-numbers-stats">
            <div className="fishing-numbers-stat">🐟 <span>{caught}</span>/<span>{data.needed}</span></div>
            <div className="fishing-numbers-stat">⭐ <span>{score}</span></div>
          </div>
        </div>

        <div className="fishing-numbers-target-box">
          <div className="fishing-numbers-q">🎯 Catch fish that equal <strong>{data.target}</strong>!</div>
          <div className="fishing-numbers-hint">Click the fish with the right answer!</div>
        </div>

        <div className="fishing-numbers-water">
          <div className="fishing-numbers-rod-area">
            <div className="fishing-numbers-fisher">🧑‍🎣</div>
            <div className="fishing-numbers-line" />
            <div className="fishing-numbers-hook">🪝</div>
          </div>

          {displayedFish.map((fish) => (
            <button key={fish.id} type="button" className="fishing-numbers-fish" onClick={() => handleCatch(fish.expr, fish.isCorrect)} style={{ left: `${fish.left}%`, top: `${fish.top}%` }}>
              <span className="fishing-numbers-fish-emoji">{fish.emoji}</span>
              <span className="fishing-numbers-fish-label">{fish.expr}</span>
            </button>
          ))}

          <div id="score-fish" className="fishing-numbers-score-fish" />
          <div className={`fishing-numbers-feedback ${feedback ? 'show' : ''}`}>{feedback}</div>
        </div>

        {complete && (
          <div className="fishing-numbers-round-end">
            <div style={{ fontSize: '4rem' }}>🐟🎣🐟</div>
            <h2>Great Catch!</h2>
            <p>You caught all {data.needed} fish that equal {data.target}! Score: {score}</p>
            <button type="button" onClick={startRound}>Fish Again! 🎣</button>
          </div>
        )}
      </div>
    </main>
  );
}

const STYLES = `
.fishing-numbers-game {
  min-height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #87ceeb 0%, #87ceeb 30%, #006994 30%, #005580 100%);
  font-family: 'Nunito', var(--font-body), sans-serif;
  overflow: hidden;
}
.fishing-numbers-shell {
  width: min(100%, 720px);
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.fishing-numbers-topbar {
  width: 100%;
  max-width: 600px;
  padding: 10px 14px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}
.fishing-numbers-shell h1 {
  margin: 0;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #1a3c6e;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  text-shadow: 1px 1px 0 rgba(255,255,255,0.7);
}
.fishing-numbers-stats {
  display: flex;
  gap: 12px;
}
.fishing-numbers-stat {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.05rem;
  background: rgba(255,255,255,0.7);
  color: #1a3c6e;
  border-radius: 12px;
  padding: 4px 12px;
}
.fishing-numbers-target-box {
  background: linear-gradient(135deg, rgba(255,255,255,0.85), rgba(200,240,255,0.85));
  border-radius: 20px;
  padding: 10px 18px;
  text-align: center;
  z-index: 10;
  margin: 10px 0 8px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}
.fishing-numbers-q {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  color: #1a3c6e;
}
.fishing-numbers-hint {
  font-size: 0.95rem;
  color: #2c6e8a;
  font-weight: 700;
}
.fishing-numbers-water {
  position: relative;
  width: 100%;
  min-height: 430px;
  overflow: hidden;
  border-radius: 20px;
}
.fishing-numbers-rod-area {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
}
.fishing-numbers-fisher {
  font-size: 3.3rem;
}
.fishing-numbers-line {
  width: 2px;
  height: 0;
  background: rgba(255,255,255,0.6);
  margin: 0 auto;
  transition: height 0.3s ease;
}
.fishing-numbers-hook {
  font-size: 1.2rem;
  text-align: center;
}
.fishing-numbers-fish {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 30px;
  padding: 6px 12px;
  cursor: pointer;
  z-index: 10;
  color: white;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}
.fishing-numbers-fish-emoji {
  font-size: 2rem;
}
.fishing-numbers-fish-label {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.1rem;
  color: white;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}
.fishing-numbers-score-fish {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 400px;
}
.fishing-numbers-feedback {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.2rem);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  text-shadow: 0 0 20px currentColor;
  z-index: 20;
}
.fishing-numbers-feedback.show { opacity: 1; }
.fishing-numbers-round-end {
  position: absolute;
  inset: 0;
  background: rgba(0,0,50,0.85);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}
.fishing-numbers-round-end h2 {
  margin: 0;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(2rem, 4vw, 2.7rem);
  color: #ffd700;
  text-shadow: 0 0 20px gold;
}
.fishing-numbers-round-end p {
  margin: 0;
  font-size: 1.1rem;
  color: #c8e8ff;
}
.fishing-numbers-round-end button {
  appearance: none;
  border: none;
  border-radius: 40px;
  background: linear-gradient(135deg,#4cc9f0,#0096c7);
  color: white;
  padding: 12px 24px;
  font-size: 1.35rem;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  cursor: pointer;
}
`;
