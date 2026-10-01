'use client';

import { useEffect, useState } from 'react';
import ProfileNameAutofill from '../shared/ProfileNameAutofill';

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

export default function BuildTower({ onComplete, profileName }) {
  const [screen, setScreen] = useState('welcome');
  const [playerName, setPlayerName] = useState(profileName || '');
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [numbers, setNumbers] = useState(() => makeRound().numbers);
  const [towerOrder, setTowerOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const menu = () => setScreen('welcome');
    window.addEventListener('build-tower:main-menu', menu);
    return () => window.removeEventListener('build-tower:main-menu', menu);
  }, []);

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

  if (screen === 'welcome') return <main className="build-tower-game build-tower-welcome" style={{ backgroundImage: "url('/assets/games/build-the-tower/build-the-tower-welcome-screen.png')" }}><style>{STYLES}</style><button className="build-tower-welcome-start" type="button" onClick={() => setScreen('player-info')}><span aria-hidden="true">▶</span> Start Building</button></main>;
  if (screen === 'player-info') return <main className="build-tower-game" style={{ backgroundImage: "linear-gradient(rgba(34,12,72,.28),rgba(34,12,72,.28)), url('/assets/games/build-the-tower/build-the-tower-floating-islands-bg.png')" }}><style>{STYLES}</style><div className="build-tower-menu"><div className="build-tower-menu-icon">👷</div><h2>Builder info</h2><label><span>Your name</span><input value={playerName} onChange={event => setPlayerName(event.target.value)} placeholder="Enter your name" /></label><ProfileNameAutofill name={profileName} onSelect={setPlayerName} /><button type="button" disabled={!playerName.trim()} onClick={() => setScreen('levels')}>Continue</button></div></main>;
  if (screen === 'levels') return <main className="build-tower-game" style={{ backgroundImage: "linear-gradient(rgba(34,12,72,.28),rgba(34,12,72,.28)), url('/assets/games/build-the-tower/build-the-tower-jungle-bg.png')" }}><style>{STYLES}</style><div className="build-tower-menu"><div className="build-tower-menu-icon">🎯</div><h2>Choose a level</h2><div className="build-tower-levels"><button type="button" onClick={() => { setLevel(1); setScreen('game'); restartRound(); }}>Level 1<small>Available now</small></button><button type="button" disabled>Level 2<small>Coming soon</small></button><button type="button" disabled>Level 3<small>Coming soon</small></button></div></div></main>;

  return (
    <main className="build-tower-game" style={{ backgroundImage: "linear-gradient(rgba(34,12,72,.28),rgba(34,12,72,.28)), url('/assets/games/build-the-tower/build-the-tower-game-bg.png')" }}>
      <style>{STYLES}</style>

      <div className="build-tower-shell">
        <div className="build-tower-instruction">Click blocks to stack them from <strong>smallest → biggest</strong>!</div>

        <div className="build-tower-layout">
          <div className={`build-tower-pool-panel${numbers.length === 0 ? ' is-empty' : ''}`}>
            <div className="build-tower-label">🧱 Pick a block:</div>
            <div className="build-tower-pool">
              {numbers.map((number) => (
                <button key={number} type="button" className="build-tower-block" style={{ width: `clamp(88px, ${60 + number * 16}px, 190px)`, height: `clamp(62px, ${44 + number * 7}px, 112px)`, background: `linear-gradient(135deg, ${COLORS[number % COLORS.length][0]}, ${COLORS[number % COLORS.length][1]})` }} onClick={() => moveToTower(number)}>
                  {number}
                </button>
              ))}
            </div>
          </div>

          <div className="build-tower-tower-panel">
            <div className="build-tower-tower-label">🏰 Your Tower</div>
            <div className="build-tower-tower">
              {towerOrder.map((number, index) => (
                <button key={`${number}-${index}`} type="button" className="build-tower-block in-tower" style={{ width: `clamp(88px, ${60 + number * 16}px, 190px)`, height: `clamp(62px, ${44 + number * 7}px, 112px)`, background: `linear-gradient(135deg, ${COLORS[number % COLORS.length][0]}, ${COLORS[number % COLORS.length][1]})` }} onClick={() => removeFromTower(index)}>
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
  width: min(96vw, 1480px);
  padding: 20px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.build-tower-welcome { position:relative; min-height:100%; background-position:center; background-size:cover; background-repeat:no-repeat; }
.build-tower-welcome-start { position:absolute; left:50%; bottom:5%; transform:translateX(-50%); width:min(48%,640px); min-height:64px; border:3px solid #fff1a8; border-radius:24px; padding:12px 24px; display:flex; align-items:center; justify-content:center; gap:14px; background:linear-gradient(180deg,rgba(255,207,79,.42),rgba(131,57,12,.48)); box-shadow:0 0 12px #fff2a8,0 0 32px rgba(255,174,42,.92),inset 0 0 20px rgba(255,247,190,.2); color:#fffdf0; font-family:'Fredoka One','Trebuchet MS',sans-serif; font-size:clamp(1.35rem,2.4vw,2.15rem); font-weight:900; text-shadow:0 3px 2px #6e3214,0 0 12px rgba(255,224,126,.8); cursor:pointer; transition:transform .18s ease,box-shadow .18s ease,background .18s ease; }
.build-tower-welcome-start:hover { transform:translateX(-50%) translateY(-3px) scale(1.02); background:linear-gradient(180deg,rgba(255,222,115,.56),rgba(159,74,17,.58)); box-shadow:0 0 16px #fff6c4,0 0 42px rgba(255,190,58,1),inset 0 0 24px rgba(255,247,190,.28); }
.build-tower-welcome-start:active { transform:translateX(-50%) scale(.99); }
.build-tower-welcome-start:focus-visible { outline:4px solid white; outline-offset:5px; }
.build-tower-menu { width:min(100%,560px); padding:36px 28px; border-radius:24px; background:rgba(255,255,255,.12); text-align:center; box-shadow:0 18px 50px rgba(0,0,0,.25); }
.build-tower-menu-icon { font-size:4rem; }
.build-tower-menu h2 { margin:8px 0; color:#ffe66d; font-size:2rem; }
.build-tower-menu p { color:#eadfff; }
.build-tower-menu label { display:grid; gap:8px; margin:20px 0; color:#fff; font-weight:700; text-align:left; }
.build-tower-menu input { padding:12px 14px; border:0; border-radius:10px; font:inherit; }
.build-tower-menu button { padding:12px 22px; border:0; border-radius:999px; background:#6be585; color:#174b27; font-weight:800; cursor:pointer; }
.build-tower-menu button:disabled { opacity:.45; cursor:not-allowed; }
.build-tower-levels { display:grid; gap:10px; margin:20px 0; }
.build-tower-levels button { display:grid; gap:3px; width:100%; }
.build-tower-levels small { font-weight:600; opacity:.75; }
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
  gap: clamp(2rem, 7vw, 8rem);
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
  max-width: min(48vw, 700px);
  min-height: clamp(200px, 34vh, 380px);
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
  min-height: clamp(260px, 42vh, 500px);
  width: min(38vw, 520px);
  justify-content: flex-start;
}
.build-tower-pool-panel.is-empty { display: none; }
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
@media(max-width:700px){.build-tower-shell{width:100%;}.build-tower-layout{gap:1.5rem}.build-tower-pool{max-width:94vw}.build-tower-tower{width:90vw;min-height:200px}.build-tower-welcome-start{width:72%;min-height:58px;bottom:6%;border-radius:18px;padding:10px 16px;font-size:1.45rem}}
`;
