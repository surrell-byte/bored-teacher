'use client';

import { useState } from 'react';

const COLORS = [
  ['#f72585', '#b5179e'],
  ['#4361ee', '#3a0ca3'],
  ['#4cc9f0', '#0096c7'],
  ['#f8961e', '#f3722c'],
  ['#43aa8b', '#277da1'],
  ['#e63946', '#c1121f'],
];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeRound() {
  const start = randomBetween(1, 6);
  const count = randomBetween(4, 6);
  const numbers = Array.from({ length: count }, (_, index) => start + index).sort(() => Math.random() - 0.5);
  return { numbers, towerOrder: [] };
}

export default function BuildTower({ onComplete }) {
  const [round, setRound] = useState(1);
  const [numbers, setNumbers] = useState(() => makeRound().numbers);
  const [towerOrder, setTowerOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const restartRound = () => {
    const nextRound = makeRound();
    setNumbers(nextRound.numbers);
    setTowerOrder(nextRound.towerOrder);
    setFeedback('');
  };

  const moveToTower = (number) => {
    if (towerOrder.includes(number)) return;

    setNumbers((current) => current.filter((value) => value !== number));
    setTowerOrder((current) => [...current, number]);
    setFeedback('');
  };

  const removeFromTower = (index) => {
    const number = towerOrder[index];
    setTowerOrder((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setNumbers((current) => [...current, number]);
    setFeedback('');
  };

  const checkTower = () => {
    if (towerOrder.length < 2) {
      setFeedback('Add more blocks first!');
      return;
    }

    const sorted = [...towerOrder].sort((a, b) => a - b);
    const isCorrect = JSON.stringify(towerOrder) === JSON.stringify(sorted);

    if (isCorrect) {
      const nextScore = score + 10;
      setScore(nextScore);
      setFeedback('🎉 Perfect tower! Smallest to biggest!');
      onComplete?.(nextScore, 100);
      return;
    }

    setFeedback('🤔 Not quite! Try smallest first!');
  };

  return (
    <main className="build-tower-game">
      <style>{STYLES}</style>

      <div className="build-tower-shell">
        <h1>🏗️ Build the Tower</h1>
        <div className="build-tower-instruction">Click blocks to stack them from <strong>smallest → biggest</strong>!</div>
        <div className="build-tower-score">⭐ Score: {score}</div>

        <div className="build-tower-layout">
          <div className="build-tower-pool-panel">
            <div className="build-tower-label">🧱 Pick a block:</div>
            <div className="build-tower-pool">
              {numbers.map((number) => (
                <button key={number} type="button" className="build-tower-block" style={{ width: `${60 + number * 12}px`, height: `${44 + number * 4}px`, background: `linear-gradient(135deg, ${COLORS[number % COLORS.length][0]}, ${COLORS[number % COLORS.length][1]})` }} onClick={() => moveToTower(number)}>
                  {number}
                </button>
              ))}
            </div>
          </div>

          <div className="build-tower-tower-panel">
            <div className="build-tower-tower-label">🏰 Your Tower</div>
            <div className="build-tower-tower">
              {towerOrder.map((number, index) => (
                <button key={`${number}-${index}`} type="button" className="build-tower-block in-tower" style={{ width: `${60 + number * 12}px`, height: `${44 + number * 4}px`, background: `linear-gradient(135deg, ${COLORS[number % COLORS.length][0]}, ${COLORS[number % COLORS.length][1]})` }} onClick={() => removeFromTower(index)}>
                  {number}
                </button>
              ))}
            </div>
            <div className="build-tower-base" />
          </div>
        </div>

        <div className="build-tower-feedback">{feedback}</div>

        <div className="build-tower-actions">
          <button type="button" className="build-tower-check" onClick={checkTower}>Check Tower ✅</button>
          <button type="button" className="build-tower-new" onClick={() => { setRound((value) => value + 1); restartRound(); }}>New Blocks 🎲</button>
        </div>

        <div className="build-tower-round">Round {round}</div>
      </div>
    </main>
  );
}

const STYLES = `
.build-tower-game {
  min-height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #2c1654 0%, #4a0e8f 40%, #7b2ff7 100%);
  color: white;
  font-family: 'Nunito', var(--font-body), sans-serif;
}
.build-tower-shell {
  width: min(100%, 760px);
  padding: 20px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.build-tower-shell h1 {
  margin: 0 0 8px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #ffe66d;
  font-size: clamp(2rem, 3vw, 2.8rem);
  text-shadow: 3px 3px 0 #f72585;
}
.build-tower-instruction {
  color: #c8b6ff;
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 6px;
}
.build-tower-score,
.build-tower-round {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #ffe66d;
  font-size: 1.2rem;
  margin-top: 8px;
}
.build-tower-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 18px;
}
.build-tower-pool-panel,
.build-tower-tower-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.build-tower-label,
.build-tower-tower-label {
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.build-tower-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  align-items: flex-end;
  max-width: 400px;
  min-height: 120px;
  padding: 18px;
  background: rgba(255,255,255,0.08);
  border-radius: 20px;
  border: 2px dashed rgba(255,255,255,0.3);
}
.build-tower-tower {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 4px;
  min-height: 200px;
}
.build-tower-block {
  appearance: none;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.4rem;
  color: white;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  user-select: none;
}
.build-tower-block:hover { transform: scale(1.08); }
.build-tower-base {
  width: 160px;
  height: 16px;
  background: linear-gradient(135deg, #8b5e3c, #5d3a1a);
  border-radius: 8px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.4);
  margin-top: 6px;
}
.build-tower-feedback {
  min-height: 2rem;
  margin-top: 14px;
  font-size: 1.5rem;
  font-weight: 900;
}
.build-tower-actions {
  display: flex;
  gap: 1rem;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.build-tower-actions button {
  appearance: none;
  border: none;
  border-radius: 30px;
  padding: 10px 22px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.15rem;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.build-tower-actions button:hover { transform: scale(1.05); }
.build-tower-check {
  background: linear-gradient(135deg, #6be585, #2ecc71);
  color: #1a5c2a;
}
.build-tower-new {
  background: linear-gradient(135deg, #f72585, #b5179e);
  color: white;
}
`;
