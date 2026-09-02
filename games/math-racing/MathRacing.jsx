'use client';

import { useMemo, useState } from 'react';

const TOTAL = 15;
const AVATARS = ['🏎️', '🚀', '🦄', '🐉', '🐙', '🦊', '🐸', '🦖', '🐝', '👽', '🤖', '🐳'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion(round) {
  const difficulty = Math.min(Math.floor(round / 3), 2);
  const ops = ['+', '-', '×'];
  const op = ops[randomBetween(0, Math.min(ops.length - 1, difficulty))];
  let a = 0;
  let b = 0;
  let answer = 0;

  if (op === '+') {
    a = randomBetween(1, 10 * (difficulty + 1));
    b = randomBetween(1, 10);
    answer = a + b;
  } else if (op === '-') {
    b = randomBetween(1, 10);
    a = b + randomBetween(1, 10) + 1;
    answer = a - b;
  } else {
    a = randomBetween(2, 6);
    b = randomBetween(2, 5);
    answer = a * b;
  }

  return {
    text: `${a} ${op} ${b} = ?`,
    answer,
    options: [...new Set([answer, answer + 1, answer - 1, answer + 2])].filter((value) => value > 0).sort(() => Math.random() - 0.5),
  };
}

export default function MathRacing({ onComplete }) {
  const [avatar, setAvatar] = useState('🚀');
  const [playerProgress, setPlayerProgress] = useState(0);
  const [cpuProgress, setCpuProgress] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(() => makeQuestion(1));
  const [feedback, setFeedback] = useState('');
  const [answered, setAnswered] = useState(false);
  const [winner, setWinner] = useState('');

  const qNum = round;

  const startGame = () => {
    setPlayerProgress(0);
    setCpuProgress(0);
    setRound(1);
    setFeedback('');
    setScore(0);
    setAnswered(false);
    setWinner('');
    setQuestion(makeQuestion(1));
  };

  const movePlayer = (amount) => {
    setPlayerProgress((current) => {
      const next = Math.min(current + amount, 100);
      if (next >= 100) {
        setWinner('You Win!');
        onComplete?.(score + 10, 100);
      }
      return next;
    });
  };

  const moveCpu = (amount) => {
    setCpuProgress((current) => {
      const next = Math.min(current + amount, 100);
      if (next >= 100 && playerProgress < 100) {
        setWinner('CPU Wins!');
      }
      return next;
    });
  };

  const nextQuestion = () => {
    if (round >= TOTAL) {
      setWinner(playerProgress >= cpuProgress ? 'You Win!' : 'CPU Wins!');
      onComplete?.(score, Math.round((score / (TOTAL * 10)) * 100));
      return;
    }

    setRound((current) => current + 1);
    setAnswered(false);
    setFeedback('');
    const next = makeQuestion(round + 1);
    setQuestion(next);

    if (Math.random() < 0.45) {
      moveCpu(randomBetween(10, 15));
    }
  };

  const handleAnswer = (value) => {
    if (answered) return;
    if (value === question.answer) {
      setAnswered(true);
      setFeedback('✅ Correct! Vroom!');
      setScore((current) => current + 10);
      movePlayer(15);
      setTimeout(nextQuestion, 900);
      return;
    }

    setFeedback('❌ Try again!');
    moveCpu(5);
  };

  const playerWidth = `${playerProgress}%`;
  const cpuWidth = `${cpuProgress}%`;

  return (
    <main className="math-racing-game">
      <style>{STYLES}</style>
      <div className="math-racing-shell">
        <h1>🏁 Math Racing!</h1>

        <div className="math-racing-scorebar">
          <div className="math-racing-scoreitem">⭐ <span>{score}</span></div>
          <div className="math-racing-scoreitem">❓ Q: <span>{Math.min(round, TOTAL)}</span>/<span>{TOTAL}</span></div>
        </div>
        <div className="math-racing-avatar-picker" aria-label="Choose your racer">
          {AVATARS.map((item) => <button type="button" key={item} className={avatar === item ? 'selected' : ''} onClick={() => setAvatar(item)}>{item}</button>)}
        </div>

        <div className="math-racing-track-area">
          <div className="math-racing-track">
            <div className="math-racing-track-label">{avatar} You</div>
            <div className="math-racing-car">{avatar}</div>
            <div className="math-racing-progress-bar"><div className="math-racing-progress-fill player" style={{ width: playerWidth }} /></div>
            <div className="math-racing-finish-flag">🏁</div>
          </div>

          <div className="math-racing-track">
            <div className="math-racing-track-label">🤖 CPU</div>
            <div className="math-racing-car">🤖</div>
            <div className="math-racing-progress-bar"><div className="math-racing-progress-fill cpu" style={{ width: cpuWidth }} /></div>
            <div className="math-racing-finish-flag">🏁</div>
          </div>
        </div>

        <div className="math-racing-problem-box">
          <div className="math-racing-problem">{question.text}</div>
        </div>

        <div className="math-racing-choice-row">
          {question.options.map((option, index) => (
            <button key={`${option}-${index}`} type="button" className="math-racing-choice" onClick={() => handleAnswer(option)}>
              {option}
            </button>
          ))}
        </div>

        <div className="math-racing-feedback">{feedback}</div>

        {winner && (
          <div className="math-racing-winner-banner">
            <div className="math-racing-trophy">🏆</div>
            <h2>{winner}</h2>
            <p>Score: {score}</p>
            <button type="button" onClick={startGame}>Race Again! 🏎️</button>
          </div>
        )}
      </div>
    </main>
  );
}

const STYLES = `
.math-racing-game {
  min-height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
  background: #1a1a2e;
  color: white;
  font-family: 'Nunito', var(--font-body), sans-serif;
  overflow: hidden;
}
.math-racing-shell {
  width: min(100%, 740px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px 32px;
  text-align: center;
}
.math-racing-shell h1 {
  margin: 8px 0;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #ffe66d;
  font-size: clamp(2rem, 4vw, 2.6rem);
  text-shadow: 2px 2px 0 #e84393;
}
.math-racing-scorebar {
  display: flex;
  gap: 2rem;
  margin: 6px 0 10px;
}
.math-racing-scoreitem {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 1.2rem;
}
.math-racing-avatar-picker { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin: 2px 0 8px; }
.math-racing-avatar-picker button { border: 1px solid #ffffff22; border-radius: 9px; padding: 4px 7px; background: #ffffff0c; cursor: pointer; font-size: 1.2rem; }
.math-racing-avatar-picker button.selected { border-color: #ffe66d; background: #ffe66d22; transform: translateY(-2px); }
.math-racing-track-area {
  width: 100%;
  max-width: 700px;
  position: relative;
}
.math-racing-track {
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  border-radius: 16px;
  margin: 8px 0;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  border: 2px solid #333;
}
.math-racing-track::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: repeating-linear-gradient(90deg,#555 0,#555 10px,transparent 10px,transparent 20px);
  transform: translateY(-50%);
  opacity: 0.4;
}
.math-racing-track-label {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: 0.95rem;
  width: 70px;
  flex-shrink: 0;
}
.math-racing-car {
  font-size: 2.2rem;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}
.math-racing-progress-bar {
  flex: 1;
  height: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  overflow: hidden;
}
.math-racing-progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.4s ease;
  width: 0%;
}
.math-racing-progress-fill.player { background: linear-gradient(90deg,#e84393,#f8333c); }
.math-racing-progress-fill.cpu { background: linear-gradient(90deg,#4361ee,#4cc9f0); }
.math-racing-finish-flag {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.math-racing-problem-box {
  background: linear-gradient(135deg, #0f3460, #16213e);
  border-radius: 20px;
  padding: 1.2rem 2rem;
  text-align: center;
  margin: 0.5rem 0 1rem;
  border: 2px solid #e84393;
  box-shadow: 0 0 20px rgba(232,67,147,0.3);
}
.math-racing-problem {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  color: #ffe66d;
}
.math-racing-choice-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}
.math-racing-choice {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  border: none;
  border-radius: 16px;
  padding: 10px 28px;
  cursor: pointer;
  background: #ffd93d;
  box-shadow: 0 4px 14px rgba(0,0,0,0.3);
}
.math-racing-feedback {
  font-size: 1.4rem;
  font-weight: 900;
  min-height: 2rem;
  margin: 12px 0;
}
.math-racing-winner-banner {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.math-racing-trophy {
  font-size: 5rem;
  animation: math-racing-bounce 0.5s ease infinite alternate;
}
.math-racing-winner-banner h2 {
  margin: 0;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(2.3rem, 5vw, 3rem);
  color: #ffe66d;
  text-shadow: 0 0 30px gold;
}
.math-racing-winner-banner p {
  margin: 0;
  font-size: 1.2rem;
  color: #c8b6ff;
}
.math-racing-winner-banner button {
  appearance: none;
  border: none;
  border-radius: 40px;
  background: linear-gradient(135deg,#e84393,#f8333c);
  color: white;
  padding: 12px 28px;
  font-size: 1.5rem;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  cursor: pointer;
}
@keyframes math-racing-bounce {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
`;
