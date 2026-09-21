'use client';

import { useEffect, useState } from 'react';

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

export default function MathRacing({ onComplete, onHudUpdate }) {
  const [avatar, setAvatar] = useState('🚀');
  const [playerName, setPlayerName] = useState('');
  const [screen, setScreen] = useState('setup');
  const [playerProgress, setPlayerProgress] = useState(0);
  const [cpuProgress, setCpuProgress] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(() => makeQuestion(1));
  const [feedback, setFeedback] = useState('');
  const [answered, setAnswered] = useState(false);
  const [winner, setWinner] = useState('');

  useEffect(() => {
    onHudUpdate?.(screen === 'race' ? { score, question: `${Math.min(round, TOTAL)}/${TOTAL}` } : null);
  }, [onHudUpdate, round, score, screen]);

  const startGame = () => {
    setPlayerProgress(0);
    setCpuProgress(0);
    setRound(1);
    setFeedback('');
    setScore(0);
    setAnswered(false);
    setWinner('');
    setQuestion(makeQuestion(1));
    setScreen('race');
  };

  const startRace = (event) => {
    event.preventDefault();
    if (!playerName.trim()) return;
    startGame();
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
        {screen === 'setup' && (
          <form className="math-racing-setup" onSubmit={startRace}>
            <div className="math-racing-setup-icon" aria-hidden="true">🏁</div>
            <h1>Math Racing</h1>
            <p>Choose your racer and get ready to solve your way to the finish line.</p>
            <label htmlFor="math-racing-player-name">Your name</label>
            <input id="math-racing-player-name" value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Enter your name" maxLength={24} autoComplete="name" autoFocus required />
            <span className="math-racing-setup-label">Choose your racer</span>
            <div className="math-racing-avatar-picker" aria-label="Choose your racer">
              {AVATARS.map((item) => <button type="button" key={item} className={avatar === item ? 'selected' : ''} onClick={() => setAvatar(item)} aria-label={`Choose ${item} racer`}>{item}</button>)}
            </div>
            <button className="math-racing-start-button" type="submit">Start Race</button>
          </form>
        )}

        {screen === 'race' && (
          <>
            <section className="math-racing-header">
              <div className="math-racing-title-row">
                <h1>🏁 Math Racing!</h1>
              </div>
              <div className="math-racing-status">
                <span>⭐ {score}</span>
                <span>❓ Q: {Math.min(round, TOTAL)}/{TOTAL}</span>
              </div>
            </section>

            <div className="math-racing-avatar-picker math-racing-race-picker" aria-label="Choose your racer">
              {AVATARS.map((item) => (
                <button type="button" key={item} className={avatar === item ? 'selected' : ''} onClick={() => setAvatar(item)} aria-label={`Choose ${item} racer`}>
                  {item}
                </button>
              ))}
            </div>

            <div className="math-racing-progress-summary">
              <span>Race progress</span>
              <span>{Math.round(playerProgress)}%</span>
            </div>

            <div className="math-racing-track-area">
              <div className="math-racing-track">
                <div className="math-racing-track-label"><strong>{avatar}</strong><span>{playerName || 'You'}</span></div>
                <div className="math-racing-road">
                  <div className="math-racing-lane-fill player" style={{ width: playerWidth }} />
                  <div className="math-racing-car moving" style={{ left: playerWidth }}>{avatar}</div>
                  <div className="math-racing-finish-flag">🏁</div>
                </div>
              </div>

              <div className="math-racing-track">
                <div className="math-racing-track-label"><strong>🤖</strong><span>CPU</span></div>
                <div className="math-racing-road">
                  <div className="math-racing-lane-fill cpu" style={{ width: cpuWidth }} />
                  <div className="math-racing-car moving" style={{ left: cpuWidth }}>🤖</div>
                  <div className="math-racing-finish-flag">🏁</div>
                </div>
              </div>
            </div>

            <div className="math-racing-problem-box">
              <div className="math-racing-question-label">SOLVE TO MOVE!</div>
              <div className="math-racing-problem">{question.text}</div>
            </div>

            <div className="math-racing-choice-row">
              {question.options.map((option, index) => (
                <button key={`${option}-${index}`} type="button" className="math-racing-choice" onClick={() => handleAnswer(option)}>
                  {option}
                </button>
              ))}
            </div>
          </>
        )}

        {screen === 'race' && <div className="math-racing-feedback">{feedback}</div>}

        {screen === 'race' && winner && (
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
  width: min(1100px, 94vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 20px 36px;
  text-align: center;
}
.math-racing-setup {
  width: min(460px, 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 30px 28px;
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 24px;
  background: linear-gradient(145deg, #24244a, #111b38);
  box-shadow: 0 18px 50px rgba(0,0,0,0.28);
  text-align: left;
}
.math-racing-setup-icon,
.math-racing-setup h1,
.math-racing-setup p { text-align: center; }
.math-racing-setup-icon { font-size: 3.5rem; }
.math-racing-setup h1 {
  margin: 8px 0;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #ffe66d;
  font-size: clamp(2rem, 4vw, 2.6rem);
  text-shadow: 2px 2px 0 #e84393;
}
.math-racing-setup p { margin: 0 0 8px; color: #d5d7ef; line-height: 1.5; }
.math-racing-setup label,
.math-racing-setup-label { color: #ffe9b8; font-size: 0.85rem; font-weight: 800; }
.math-racing-setup input { border: 1px solid #ffffff30; border-radius: 10px; padding: 12px 14px; background: #11152c; color: white; font: inherit; outline-color: #ffe66d; }
.math-racing-avatar-picker { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
.math-racing-avatar-picker button { width: 48px; height: 48px; border: 1px solid #ffffff22; border-radius: 13px; padding: 0; background: #ffffff0c; cursor: pointer; font-size: 1.45rem; display: grid; place-items: center; transition: transform .16s ease, background .16s ease, border-color .16s ease, box-shadow .16s ease; }
.math-racing-avatar-picker button:hover { transform: translateY(-3px); background: #ffffff16; }
.math-racing-avatar-picker button.selected { border-color: #ffe66d; background: #ffe66d22; transform: translateY(-3px) scale(1.04); box-shadow: 0 0 0 3px #ffe66d18, 0 8px 18px rgba(255,214,61,.16); }
.math-racing-header { width: min(760px, 100%); display: flex; flex-direction: column; align-items: center; gap: 5px; margin-bottom: 2px; }
.math-racing-title-row h1 { margin: 0; font-family: 'Fredoka One', 'Trebuchet MS', sans-serif; font-size: clamp(2.5rem, 5vw, 3.7rem); line-height: 1; color: #ffe66d; text-shadow: 3px 3px 0 #e84393, 0 0 24px rgba(255,230,109,.15); }
.math-racing-status { display: flex; justify-content: center; gap: 24px; color: #f4f2ff; font-size: 1.05rem; font-weight: 800; }
.math-racing-status span { padding: 5px 11px; border-radius: 999px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.08); }
.math-racing-race-picker { margin: 12px 0 8px; }
.math-racing-progress-summary { width: min(1040px, 100%); display: flex; justify-content: space-between; align-items: center; margin: 4px 0 -2px; color: #aeb5d6; font-size: .8rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.math-racing-start-button { margin-top: 8px; border: 0; border-radius: 12px; padding: 12px 20px; background: linear-gradient(135deg,#e84393,#f8333c); color: white; font: 800 1.05rem 'Nunito', sans-serif; cursor: pointer; }
.math-racing-track-area {
  width: 100%;
  max-width: 1040px;
  position: relative;
}
.math-racing-track {
  min-height: 86px;
  background: linear-gradient(135deg, #2d2d2d, #1a1a1a);
  border-radius: 20px;
  margin: 10px 0;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,.10);
  box-shadow: 0 10px 24px rgba(0,0,0,.18);
}
.math-racing-track::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  height: auto;
  background: linear-gradient(180deg, rgba(255,255,255,.035), transparent 50%), repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 12px, transparent 12px 28px);
  transform: none;
  opacity: 1;
  pointer-events: none;
}
.math-racing-track-label {
  width: 112px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
  z-index: 2;
}
.math-racing-track-label strong { font-size: 1.65rem; }
.math-racing-track-label span { font-family: 'Fredoka One', 'Trebuchet MS', sans-serif; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.math-racing-road {
  height: 52px;
  flex: 1;
  position: relative;
  border-radius: 14px;
  background: #242424;
  border: 1px solid rgba(255,255,255,.07);
  overflow: visible;
  z-index: 1;
}
.math-racing-road::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 5px; transform: translateY(-50%); background: repeating-linear-gradient(90deg, #4a4a4a 0 16px, transparent 16px 30px); opacity: .55; }
.math-racing-lane-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 14px 0 0 14px; transition: width .45s cubic-bezier(.2,.8,.2,1); opacity: .35; }
.math-racing-lane-fill.player { background: linear-gradient(90deg, #e84393, #ff527e); }
.math-racing-lane-fill.cpu { background: linear-gradient(90deg, #4361ee, #4cc9f0); }
.math-racing-car { font-size: 2.5rem; position: absolute; top: 50%; z-index: 4; transform: translate(-50%, -50%); transition: left .45s cubic-bezier(.2,.8,.2,1); filter: drop-shadow(0 6px 7px rgba(0,0,0,.45)); line-height: 1; }
.math-racing-finish-flag { position: absolute; right: -2px; top: 50%; transform: translate(50%, -50%); font-size: 1.8rem; z-index: 5; filter: drop-shadow(0 3px 4px rgba(0,0,0,.4)); }
.math-racing-problem-box {
  width: min(650px, 92%);
  box-sizing: border-box;
  background: linear-gradient(135deg, #0f3460, #16213e);
  border-radius: 24px;
  padding: 18px 30px 22px;
  text-align: center;
  margin: 14px 0 14px;
  border: 2px solid #e84393;
  box-shadow: 0 0 20px rgba(232,67,147,0.3);
}
.math-racing-problem {
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(2.6rem, 5vw, 4rem);
  line-height: 1.05;
  color: #ffe66d;
}
.math-racing-question-label { margin-bottom: 3px; color: #ff9dc9; font-size: .72rem; font-weight: 900; letter-spacing: .14em; }
.math-racing-choice-row {
  width: min(650px, 92%);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  justify-content: center;
}
.math-racing-choice {
  min-height: 74px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  border: none;
  border-radius: 18px;
  padding: 10px 14px;
  cursor: pointer;
  background: linear-gradient(180deg, #ffe04a, #f4c52d);
  color: #25243a;
  box-shadow: 0 6px 0 #c99816, 0 12px 22px rgba(0,0,0,.20);
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
}
.math-racing-choice:hover { transform: translateY(-3px); filter: brightness(1.04); box-shadow: 0 9px 0 #c99816, 0 16px 25px rgba(0,0,0,.22); }
.math-racing-choice:active { transform: translateY(3px); box-shadow: 0 3px 0 #c99816, 0 7px 12px rgba(0,0,0,.18); }
.math-racing-feedback {
  font-size: 1.4rem;
  font-weight: 900;
  min-height: 2rem;
  margin: 12px 0;
}
@media (max-width: 700px) {
  .math-racing-shell { width: min(96vw, 620px); padding: 16px 10px 28px; }
  .math-racing-track { padding: 10px; gap: 8px; }
  .math-racing-track-label { width: 82px; }
  .math-racing-track-label span { font-size: .82rem; }
  .math-racing-track-label strong { font-size: 1.35rem; }
  .math-racing-car { font-size: 2rem; }
  .math-racing-choice-row { grid-template-columns: repeat(2, 1fr); }
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
