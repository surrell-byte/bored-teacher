'use client';

import { useMemo, useState } from 'react';

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildPuzzle() {
  const start = randomBetween(1, 10);
  const length = Math.random() < 0.5 ? 5 : 6;
  const sequence = Array.from({ length }, (_, index) => start + index);
  const missingIndex = randomBetween(1, Math.max(1, length - 2));
  const missingValue = sequence[missingIndex];

  let wrongA = missingValue + (Math.random() < 0.5 ? 1 : -1);
  let wrongB = missingValue + (Math.random() < 0.5 ? 2 : -2);
  const options = [...new Set([missingValue, wrongA, wrongB].filter((value) => value > 0))];

  return {
    sequence,
    missingIndex,
    missingValue,
    options: [...options].sort(() => Math.random() - 0.5),
  };
}

export default function NumberClouds({ onComplete }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [puzzle, setPuzzle] = useState(() => buildPuzzle());
  const [feedback, setFeedback] = useState('');
  const [showNext, setShowNext] = useState(false);

  const renderedSequence = useMemo(() => {
    const items = [];
    puzzle.sequence.forEach((value, index) => {
      if (index > 0) items.push({ type: 'arrow', value: '→', key: `arrow-${index}` });
      items.push({
        type: 'cloud',
        value: index === puzzle.missingIndex ? '?' : value,
        key: `cloud-${index}`,
        isMissing: index === puzzle.missingIndex,
        isCorrect: false,
      });
    });
    return items;
  }, [puzzle]);

  const startRound = () => {
    setFeedback('');
    setShowNext(false);
    setPuzzle(buildPuzzle());
  };

  const checkAnswer = (value) => {
    if (value === puzzle.missingValue) {
      const nextScore = score + 1;
      setScore(nextScore);
      setFeedback('🎉 That\'s right!');
      setShowNext(true);
      onComplete?.(nextScore, 100);
      return;
    }

    setFeedback('Try again! 🤔');
  };

  return (
    <main className="number-clouds-game">
      <style>{STYLES}</style>
      <div className="sun">☀️</div>
      <div className="bird">🐦</div>
      <div className="bird bird-two">🦅</div>

      <div className="number-clouds-shell">
        <h1>☁️ Number Clouds</h1>
        <div className="number-clouds-instruction">Hop across the clouds!</div>

        <div className="number-clouds-row">
          {renderedSequence.map((item) =>
            item.type === 'arrow' ? (
              <span key={item.key} className="number-clouds-arrow">→</span>
            ) : (
              <div key={item.key} className="number-clouds-cloud-wrap">
                <div className={`number-clouds-cloud ${item.isMissing ? 'missing' : ''}`}>
                  {item.value}
                </div>
              </div>
            )
          )}
        </div>

        <div className="number-clouds-choices">
          {puzzle.options.map((option) => (
            <button key={option} type="button" className="number-clouds-choice" onClick={() => checkAnswer(option)}>
              {option}
            </button>
          ))}
        </div>

        <div className={`number-clouds-feedback ${feedback ? 'show' : ''}`}>{feedback}</div>
        {showNext && (
          <button type="button" className="number-clouds-next" onClick={() => { setRound((current) => current + 1); startRound(); }}>
            Next Cloud ➡️
          </button>
        )}
        <div className="number-clouds-score">⭐ Score: {score}</div>
        <div className="number-clouds-round">Round {round}</div>
      </div>
    </main>
  );
}

const STYLES = `
.number-clouds-game {
  min-height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #87ceeb 0%, #b0e0ff 40%, #e8f4fd 100%);
  font-family: 'Nunito', var(--font-body), sans-serif;
  color: #1a5276;
  position: relative;
  overflow: hidden;
}
.sun {
  position: absolute;
  top: 18px;
  right: 40px;
  font-size: 5.5rem;
  animation: number-clouds-spin 20s linear infinite;
}
.bird {
  position: absolute;
  left: -60px;
  top: 20%;
  font-size: 1.5rem;
  animation: number-clouds-fly 12s linear infinite;
}
.bird-two {
  top: 38%;
  animation-duration: 17s;
  animation-delay: -5s;
}
.number-clouds-shell {
  position: relative;
  z-index: 1;
  width: min(100%, 760px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 18px 32px;
  text-align: center;
}
.number-clouds-shell h1 {
  margin: 0 0 8px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #1a5276;
  font-size: clamp(2.2rem, 4vw, 3rem);
  text-shadow: 2px 2px 0 rgba(255,255,255,0.7);
}
.number-clouds-instruction {
  font-size: clamp(1.1rem, 2.2vw, 1.5rem);
  color: #2c5f8a;
  font-weight: 700;
  margin-bottom: 18px;
  background: rgba(255,255,255,0.6);
  padding: 8px 18px;
  border-radius: 20px;
}
.number-clouds-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 700px;
}
.number-clouds-cloud-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.number-clouds-cloud {
  position: relative;
  min-width: 80px;
  background: white;
  border-radius: 50px;
  padding: 18px 28px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  color: #1a5276;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  text-align: center;
}
.number-clouds-cloud::before {
  content: '';
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  border: 20px solid transparent;
  border-top-color: white;
}
.number-clouds-cloud.missing {
  background: #ffe66d;
  border: 3px dashed #e59400;
  color: #e59400;
  animation: number-clouds-pulse 1s ease infinite;
}
.number-clouds-cloud.missing::before { border-top-color: #ffe66d; }
.number-clouds-arrow {
  font-size: 1.8rem;
  color: #5b9bd5;
  font-weight: 900;
}
.number-clouds-choices {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}
.number-clouds-choice {
  appearance: none;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #4fc3f7, #0288d1);
  color: white;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.4rem, 2.7vw, 1.8rem);
  padding: 12px 28px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(2,136,209,0.4);
  transition: transform 0.15s ease;
}
.number-clouds-choice:hover { transform: scale(1.1); }
.number-clouds-feedback {
  min-height: 2.2rem;
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  font-weight: 900;
  margin-top: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.number-clouds-feedback.show { opacity: 1; }
.number-clouds-next {
  appearance: none;
  border: none;
  border-radius: 40px;
  background: linear-gradient(135deg, #66bb6a, #2e7d32);
  color: white;
  padding: 10px 24px;
  margin-top: 10px;
  cursor: pointer;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.3rem;
}
.number-clouds-score,
.number-clouds-round {
  margin-top: 12px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.2rem;
  color: #1a5276;
}
@keyframes number-clouds-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes number-clouds-fly {
  from { left: -60px; top: 20%; }
  to { left: 110vw; top: 15%; }
}
@keyframes number-clouds-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.07); }
}
`;
