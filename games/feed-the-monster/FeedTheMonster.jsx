'use client';

import { useMemo, useState } from 'react';

const MONSTERS = ['👾', '🦖', '🐲', '👹', '🐊', '🦕'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createTray(target) {
  return Array.from({ length: target + randomBetween(0, 3) }, (_, index) => ({
    id: `${Date.now()}-${index}-${Math.random()}`,
    emoji: '🍪',
  }));
}

export default function FeedTheMonster({ onComplete }) {
  const [target, setTarget] = useState(() => randomBetween(2, 8));
  const [fed, setFed] = useState(0);
  const [monster, setMonster] = useState(MONSTERS[0]);
  const [feedback, setFeedback] = useState('');
  const [tray, setTray] = useState(() => createTray(randomBetween(2, 8)));
  const [score, setScore] = useState(0);

  const progress = useMemo(() => Array.from({ length: target }, (_, index) => index < fed), [fed, target]);

  const startRound = () => {
    const nextTarget = randomBetween(2, 8);
    setTarget(nextTarget);
    setFed(0);
    setFeedback('');
    setMonster(MONSTERS[randomBetween(0, MONSTERS.length - 1)]);
    setTray(createTray(nextTarget));
  };

  const handleFeed = (cookieId) => {
    if (fed >= target) return;

    const nextFed = fed + 1;
    setFed(nextFed);
    setTray((current) => current.filter((cookie) => cookie.id !== cookieId));

    if (nextFed === target) {
      setMonster('😄');
      setFeedback('Yummy! Perfect! 🎉');
      const nextScore = score + 10;
      setScore(nextScore);
      onComplete?.(nextScore, 100);
      return;
    }

    if (nextFed > target) {
      setMonster('😵');
      setFeedback('Too many! 😫');
      setFed(target);
      return;
    }

    setMonster('🙂');
    setFeedback('');
  };

  return (
    <main className="feed-monster-game">
      <style>{STYLES}</style>
      <div className="feed-monster-shell">
        <h1>🍪 Feed the Monster!</h1>
        <div className="feed-monster-prompt">Feed me {target} cookies! 🍪</div>

        <div className="feed-monster-area">
          <div className={`feed-monster-avatar ${feedback ? 'is-reactive' : ''}`}>{monster}</div>
        </div>

        <div className="feed-monster-tray">
          {tray.map((cookie) => (
            <button
              key={cookie.id}
              type="button"
              className="feed-monster-cookie"
              onClick={() => handleFeed(cookie.id)}
              aria-label="Feed cookie"
            >
              {cookie.emoji}
            </button>
          ))}
        </div>

        <div className="feed-monster-status">
          <div className="feed-monster-count">Fed: {fed} / {target}</div>
          <div className="feed-monster-progress" aria-label="Progress">
            {progress.map((filled, index) => (
              <span key={`progress-${index}`} className={filled ? 'filled' : ''} />
            ))}
          </div>
        </div>

        <div className={`feed-monster-feedback ${feedback ? 'show' : ''}`}>{feedback}</div>
        <button type="button" className="feed-monster-button" onClick={startRound}>New Round 🎲</button>
      </div>
    </main>
  );
}

const STYLES = `
.feed-monster-game {
  min-height: 100%;
  width: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  font-family: 'Nunito', var(--font-body), sans-serif;
  color: #fff;
}
.feed-monster-shell {
  width: min(100%, 620px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 40px;
  text-align: center;
}
.feed-monster-shell h1 {
  margin: 0 0 8px;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  color: #ffe66d;
  font-size: clamp(2.1rem, 3vw, 3rem);
  text-shadow: 3px 3px 0 #e84393;
}
.feed-monster-prompt {
  font-size: clamp(1.2rem, 2vw, 1.55rem);
  color: #a8edea;
  background: rgba(255,255,255,0.1);
  border-radius: 18px;
  padding: 8px 18px;
  margin-bottom: 16px;
}
.feed-monster-area {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: 16px;
}
.feed-monster-avatar {
  font-size: clamp(5rem, 10vw, 8rem);
  filter: drop-shadow(0 0 20px rgba(232,67,147,0.5));
  transition: transform 0.2s ease;
}
.feed-monster-avatar.is-reactive { animation: feed-monster-bounce 0.5s ease; }
.feed-monster-tray {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  max-width: 440px;
  min-height: 86px;
  background: rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 14px;
  margin-bottom: 18px;
}
.feed-monster-cookie {
  appearance: none;
  border: none;
  background: transparent;
  font-size: clamp(2rem, 4vw, 2.7rem);
  cursor: pointer;
  transition: transform 0.15s ease;
  user-select: none;
}
.feed-monster-cookie:hover { transform: scale(1.2) rotate(10deg); }
.feed-monster-cookie:active { cursor: grabbing; }
.feed-monster-status {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 8px;
}
.feed-monster-count {
  font-size: 1.25rem;
  color: #ffe66d;
  font-weight: 800;
}
.feed-monster-progress {
  display: flex;
  gap: 6px;
}
.feed-monster-progress span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  transition: background 0.3s ease;
}
.feed-monster-progress span.filled { background: #6be585; }
.feed-monster-feedback {
  min-height: 2rem;
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  font-weight: 800;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #6be585;
}
.feed-monster-feedback.show { opacity: 1; }
.feed-monster-button {
  appearance: none;
  font-family: 'Fredoka One', 'Trebuchet MS', sans-serif;
  background: linear-gradient(135deg, #e84393, #f8333c);
  color: white;
  border: none;
  border-radius: 40px;
  padding: 10px 30px;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(232,67,147,0.5);
  transition: transform 0.1s ease;
}
.feed-monster-button:hover { transform: scale(1.05); }
@keyframes feed-monster-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-18px); }
}
`;
