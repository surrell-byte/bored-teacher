'use client';

import { useEffect, useMemo, useState } from 'react';
import { isSoundEnabled, playBeep, setSoundEnabled } from '@/lib/sound/beep';

const TARGET_SCORE = 3;
const CHARACTER_OPTIONS = [
  { id: 'parachuter-1', name: 'Sky', src: '/assets/games/parachute-drop/parachuter-1.png' },
  { id: 'parachuter-2', name: 'Breeze', src: '/assets/games/parachute-drop/parachuter-2.png' },
  { id: 'parachuter-3', name: 'Cloud', src: '/assets/games/parachute-drop/parachuter-3.png' },
  { id: 'parachuter-4', name: 'Sunny', src: '/assets/games/parachute-drop/parachuter-4.png' },
];
const CARD_COLORS = [
  { id: 'red', label: 'Red', hex: '#ef4444' },
  { id: 'blue', label: 'Blue', hex: '#3b82f6' },
  { id: 'green', label: 'Green', hex: '#22c55e' },
  { id: 'yellow', label: 'Yellow', hex: '#facc15' },
];
const CARD_EFFECTS = ['cut', 'wind', 'safe', 'wild'];
const STARTING_LIVES = 10;

function pickFace() {
  return 1 + Math.floor(Math.random() * 6);
}

function getNextTurn(side) {
  return side === 'left' ? 'right' : 'left';
}

function resolveWinner(scoreState) {
  if (scoreState.left >= TARGET_SCORE) return 'left';
  if (scoreState.right >= TARGET_SCORE) return 'right';
  return null;
}

function dealCards() {
  const effects = [...CARD_EFFECTS].sort(() => Math.random() - 0.5);
  return [...CARD_COLORS].sort(() => Math.random() - 0.5).map((color, index) => ({
    ...color,
    effect: effects[index],
  }));
}

export default function ParachuteDrop({ onComplete }) {
  const [screen, setScreen] = useState('welcome');
  const [players, setPlayers] = useState({
    left: { name: 'Leo', character: CHARACTER_OPTIONS[0] },
    right: { name: 'Mia', character: CHARACTER_OPTIONS[1] },
  });
  const [current, setCurrent] = useState('left');
  const [lives, setLives] = useState({ left: STARTING_LIVES, right: STARTING_LIVES });
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [face, setFace] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [status, setStatus] = useState("Leo's turn - roll, then stop whenever you dare!");
  const [modal, setModal] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    const handler = () => setScreen('menu');
    window.addEventListener('parachute-game-home', handler);
    return () => window.removeEventListener('parachute-game-home', handler);
  }, []);

  useEffect(() => {
    if (!rolling) return undefined;
    const timer = setInterval(() => {
      const nextFace = pickFace();
      setFace(nextFace);
      if (soundOn) playBeep(540 + Math.random() * 160, 0.05, 0.04);
    }, 90);
    return () => clearInterval(timer);
  }, [rolling, soundOn]);

  const leftStats = useMemo(
    () => ({
      hearts: `${lives.left} lives`,
    }),
    [lives.left],
  );

  const rightStats = useMemo(
    () => ({
      hearts: `${lives.right} lives`,
    }),
    [lives.right],
  );

  function playTone(freq = 440) {
    if (soundOn) playBeep(freq, 0.08, 0.05);
  }

  function startRound(mode = 'roll') {
    setLives({ left: STARTING_LIVES, right: STARTING_LIVES });
    setScore({ left: 0, right: 0 });
    setFace(1);
    setRolling(false);
    setModal(null);
    setCurrent('left');
    setStatus(`${players.left.name}'s turn - roll, then stop whenever you dare!`);

    if (mode === 'card') {
      setScreen('card');
      setCards(dealCards());
      setStatus(`${players.left.name}'s turn — choose a card!`);
      return;
    }

    setScreen('roll');
  }

  function updateRoundWinner(nextScore) {
    const winner = resolveWinner(nextScore);
    if (!winner) return false;
    setModal({
      title: `${players[winner].name} wins! 🏆`,
      text: `Final score: ${nextScore.left} - ${nextScore.right}`,
    });
    onComplete?.(nextScore[winner] * 100, 100);
    return true;
  }

  function stopRoll() {
    if (!rolling || modal) return;
    const result = pickFace();
    setRolling(false);
    setFace(result);

    const side = result % 2 ? 'left' : 'right';
    const name = players[side].name;

    const nextLives = { ...lives, [side]: Math.max(0, lives[side] - 1) };
    setLives(nextLives);

    if (nextLives[side] <= 0) {
      const winner = side === 'left' ? 'right' : 'left';
      const nextScore = { ...score, [winner]: score[winner] + 1 };
      setScore(nextScore);
      setStatus(`${name} ran out of lives!`);
      playTone(680);
      if (updateRoundWinner(nextScore)) return;
      setLives({ left: STARTING_LIVES, right: STARTING_LIVES });
      setCurrent(winner);
      setStatus(`${players[winner].name} wins the round! Next round starts now with 10 lives.`);
      return;
    }

    playTone(540);
    setStatus(`Rolled a ${result} - ${name} loses a life.`);
    setCurrent((turn) => getNextTurn(turn));
  }

  function chooseCard(card) {
    const owner = current;
    const target = getNextTurn(owner);

    const effect = card.effect === 'wild'
      ? CARD_EFFECTS[Math.floor(Math.random() * 3)]
      : card.effect;
    const nextLives = { ...lives };

    if (effect === 'cut') {
      nextLives[target] = Math.max(0, nextLives[target] - 1);
      setStatus(`${players[owner].name} drew ${card.label}: cut! ${players[target].name} loses a life.`);
      playTone(620);
    } else if (effect === 'wind') {
      nextLives[owner] = Math.max(0, nextLives[owner] - 1);
      setStatus(`${players[owner].name} drew ${card.label}: wind pushes them down and costs a life.`);
      playTone(260);
    } else {
      setStatus(`${players[owner].name} drew ${card.label}: safe! They do not move.`);
      playTone(460);
    }

    setLives(nextLives);
    const defeated = nextLives.left <= 0 || nextLives.right <= 0;
    if (defeated) {
      const winner = nextLives.left <= 0 ? 'right' : 'left';
      const nextScore = { ...score, [winner]: score[winner] + 1 };
      setScore(nextScore);
      if (updateRoundWinner(nextScore)) return;
      setLives({ left: STARTING_LIVES, right: STARTING_LIVES });
    }

    setCurrent(target);
    setCards(dealCards());
    setStatus(`${players[target].name}'s turn — choose a mystery card!`);
    setScreen('card');
  }

  function restartGame() {
    setCurrent('left');
    setLives({ left: STARTING_LIVES, right: STARTING_LIVES });
    setScore({ left: 0, right: 0 });
    setFace(1);
    setRolling(false);
    setModal(null);
    setCards([]);
    setStatus(`${players.left.name}'s turn - roll, then stop whenever you dare!`);
    setScreen('menu');
  }

  const renderAvatarPicker = (side) => (
    <div className="pd-player-setup">
      <label className="pd-field-label">Player {side === 'left' ? '1' : '2'} name</label>
      <input
        className="pd-name-input"
        value={players[side].name}
        maxLength={12}
        onChange={(event) => {
          const value = event.target.value || (side === 'left' ? 'Leo' : 'Mia');
          setPlayers((prev) => ({ ...prev, [side]: { ...prev[side], name: value } }));
        }}
      />

      <label className="pd-field-label">Choose a character</label>
      <div className="pd-avatar-grid">
        {CHARACTER_OPTIONS.map((character) => (
          <button
            key={`${side}-${character.id}`}
            type="button"
            className={`pd-avatar-option${players[side].character.id === character.id ? ' selected' : ''}`}
            onClick={() => setPlayers((prev) => ({ ...prev, [side]: { ...prev[side], character } }))}
          >
            <img src={character.src} alt={character.name} />
            <span>{character.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="parachute-drop" style={{ background: "url('/assets/images/parachute-drop-game-screen-bg.webp') center/cover" }}>
      <style>{CSS}</style>

      {screen === 'welcome' && (
        <div className="pd-screen">
          <div className="pd-panel pd-panel-large">
            <div className="pd-logo">🪂 Parachute Drop</div>
            <h1>Ready to soar?</h1>
            <p>Race across the sky, dodge the snips, and outplay your rival in a bright two-player challenge.</p>
            <div className="pd-actions">
              <button className="pd-primary" onClick={() => setScreen('setup')}>Start game</button>
            </div>
          </div>
        </div>
      )}

      {screen === 'setup' && (
        <div className="pd-screen">
          <div className="pd-panel pd-panel-wide">
            <div className="pd-header-row">
              <button className="pd-link-button" onClick={() => setScreen('welcome')}>← Back</button>
              <h2>Players</h2>
            </div>

            <div className="pd-setup-grid">
              {renderAvatarPicker('left')}
              {renderAvatarPicker('right')}
            </div>

            <div className="pd-actions pd-actions-centered">
              <button className="pd-primary" onClick={() => setScreen('menu')}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {screen === 'menu' && (
        <div className="pd-screen">
          <div className="pd-panel pd-panel-medium">
            <div className="pd-logo">🪂 Parachute Drop</div>
            <h2>Choose a mode</h2>
            <div className="pd-mode-list">
              <button className="pd-mode-card" onClick={() => startRound('roll')}>
                <span className="pd-mode-icon">🎲</span>
                <div>
                  <strong>Roll Mode</strong>
                  <small>Take turns rolling and losing lives.</small>
                </div>
              </button>
              <button className="pd-mode-card" onClick={() => startRound('card')}>
                <span className="pd-mode-icon">🃏</span>
                <div>
                  <strong>Card Mode</strong>
                  <small>Pick a card to trigger a clever effect.</small>
                </div>
              </button>
              <button className="pd-mode-card" onClick={() => setScreen('howto')}>
                <span className="pd-mode-icon">📖</span>
                <div>
                  <strong>How to Play</strong>
                  <small>Learn the rules and match flow.</small>
                </div>
              </button>
            </div>
            <button className="pd-link-button pd-link-button-top" onClick={() => setScreen('setup')}>Edit players</button>
          </div>
        </div>
      )}

      {screen === 'howto' && (
        <div className="pd-screen">
          <div className="pd-panel pd-panel-medium">
            <div className="pd-header-row">
              <button className="pd-link-button" onClick={() => setScreen('menu')}>← Back</button>
              <h2>How to Play</h2>
            </div>
            <ul className="pd-rules">
              <li>Each player starts with 10 lives.</li>
              <li>In Roll Mode, each roll makes the parachuter lose one life.</li>
              <li>In Card Mode, choose a hidden red, blue, green, or yellow card.</li>
              <li>Cards randomly become Cut, Wind, Safe, or Wild each round.</li>
            </ul>
          </div>
        </div>
      )}

      {(screen === 'roll' || screen === 'card') && (
        <>
          <div className="pd-hud">
            <div className="pd-player-bar left">
              <div className="pd-player-meta">
                <span className="pd-avatar-lg"><img src={players.left.character.src} alt="" /></span>
                <div>
                  <strong>{players.left.name}</strong>
                  <small>{leftStats.hearts}</small>
                </div>
              </div>
              <div className="pd-score-box">
                <span>🏆</span>
                <b>{score.left}</b>
              </div>
            </div>

            <div className="pd-die">{face === 'shield' ? '🛡' : `⚄ ${face}`}</div>

            <div className="pd-player-bar right">
              <div className="pd-score-box">
                <span>🏆</span>
                <b>{score.right}</b>
              </div>
              <div className="pd-player-meta">
                <div>
                  <strong>{players.right.name}</strong>
                  <small>{rightStats.hearts}</small>
                </div>
                <span className="pd-avatar-lg"><img src={players.right.character.src} alt="" /></span>
              </div>
            </div>
          </div>

          <div className="pd-stage">
            <div className="pd-rig pd-left" style={{ '--fall-depth': `${(STARTING_LIVES - lives.left) * 12}px` }}>
              <img className="pd-rig-sprite" src={players.left.character.src} alt={`${players.left.name} parachuter`} />
            </div>

            <div className="pd-center">
              {screen === 'roll' && (
                <button className="pd-roll" onClick={() => (rolling ? stopRoll() : setRolling(true))} disabled={Boolean(modal)}>
                  {rolling ? '✋ Stop the die' : `🎲 Roll for ${players[current].name}`}
                </button>
              )}

              {screen === 'card' && (
                <div className="pd-card-grid">
                  {cards.map((card) => (
                    <button key={card.id} className="pd-card-button" style={{ borderColor: card.hex, boxShadow: `0 10px 20px ${card.hex}66` }} onClick={() => chooseCard(card)}>
                      <span className="pd-card-back" style={{ borderColor: card.hex, color: card.hex, backgroundColor: `${card.hex}22` }}>?</span>
                      <strong>{card.label} card</strong>
                    </button>
                  ))}
                </div>
              )}

              {screen === 'roll' && (
                <button className="pd-mute" onClick={() => setSoundOn((value) => !value)}>{soundOn ? '🔊 Sound on' : '🔇 Sound off'}</button>
              )}
              <p aria-live="polite">{status}</p>
            </div>

            <div className="pd-rig pd-right" style={{ '--fall-depth': `${(STARTING_LIVES - lives.right) * 12}px` }}>
              <img className="pd-rig-sprite" src={players.right.character.src} alt={`${players.right.name} parachuter`} />
            </div>
          </div>
          <div className="pd-shark-row" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <img key={index} src="/assets/games/parachute-drop/shark.png" alt="" style={{ '--shark-delay': `${index * -0.7}s` }} />
            ))}
          </div>
        </>
      )}

      {modal && (
        <div className="pd-modal">
          <div>
            <h2>{modal.title}</h2>
            <p>{modal.text}</p>
            <button className="pd-roll" onClick={restartGame}>🔄 Play again</button>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.parachute-drop { min-height: 100%; height: 100%; padding: 18px; color: #0b2942; font-family: var(--font-body, sans-serif); overflow: hidden; background: linear-gradient(#bfe9ff,#eaf9ff 62%,#168cc5); }
.pd-screen { display: grid; place-items: center; min-height: 100%; }
.pd-panel { background: rgba(255,255,255,0.9); border-radius: 30px; padding: 30px; box-shadow: 0 20px 50px rgba(17,44,74,0.15); }
.pd-panel-large { width: min(760px, 90vw); text-align: center; }
.pd-panel-medium { width: min(620px, 90vw); }
.pd-panel-wide { width: min(980px, 92vw); }
.pd-logo { font-size: clamp(1.5rem, 2vw, 2.2rem); font-weight: 900; margin-bottom: 10px; }
.pd-panel h1, .pd-panel h2 { margin: 0 0 12px; font-family: var(--font-display, sans-serif); }
.pd-panel p { margin: 0; font-size: 1.08rem; line-height: 1.6; color: rgba(11,41,66,0.82); }
.pd-actions { display: flex; justify-content: center; gap: 16px; margin-top: 24px; }
.pd-actions-centered { justify-content: center; }
.pd-primary, .pd-roll, .pd-mode-card, .pd-card-button, .pd-link-button, .pd-mute { cursor: pointer; }
.pd-primary, .pd-roll { border: 0; border-radius: 16px; padding: 16px 22px; font-weight: 900; background: linear-gradient(160deg,#3ddc84,#1f9d57); color: #06321a; box-shadow: 0 8px 18px rgba(31,157,87,0.28); }
.pd-link-button { background: transparent; border: none; color: #0b2942; font-weight: 700; padding: 8px 0; }
.pd-header-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.pd-setup-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.pd-player-setup { background: rgba(11,41,66,0.04); border: 1px solid rgba(11,41,66,0.08); border-radius: 22px; padding: 16px; }
.pd-field-label { display: block; margin: 0 0 8px; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; color: rgba(11,41,66,0.7); }
.pd-name-input { width: 100%; border: 1px solid rgba(11,41,66,0.12); border-radius: 12px; padding: 12px 14px; font-size: 1rem; background: white; }
.pd-avatar-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.pd-avatar-option { display: grid; place-items: center; gap: 4px; border: 1px solid rgba(11,41,66,0.12); background: rgba(255,255,255,0.8); border-radius: 12px; min-height: 92px; padding: 8px; cursor: pointer; }
.pd-avatar-option img { width: 58px; height: 58px; object-fit: contain; }
.pd-avatar-option span { font-size: 0.72rem; font-weight: 800; color: rgba(11,41,66,0.75); }
.pd-avatar-option.selected { background: linear-gradient(160deg,#d8fff0,#c0f1ff); border-color: rgba(19,122,61,0.6); box-shadow: inset 0 0 0 2px rgba(19,122,61,0.22); }
.pd-mode-list { display: grid; gap: 14px; margin-top: 20px; }
.pd-mode-card { display: flex; align-items: center; gap: 16px; width: 100%; border: 1px solid rgba(11,41,66,0.08); background: rgba(246,250,255,0.9); border-radius: 18px; padding: 16px 18px; box-shadow: 0 6px 18px rgba(17,44,74,0.08); }
.pd-mode-card div { display: flex; flex-direction: column; text-align: left; }
.pd-mode-icon { display: grid; place-items: center; width: 52px; height: 52px; background: linear-gradient(160deg,#dff7ff,#ccf4db); border-radius: 14px; font-size: 1.8rem; }
.pd-mode-card strong { font-size: 1.1rem; }
.pd-mode-card small { color: rgba(11,41,66,0.75); }
.pd-rules { display: grid; gap: 12px; margin: 10px 0 0; padding-left: 18px; color: rgba(11,41,66,0.8); line-height: 1.6; }
.pd-link-button-top { margin-top: 18px; }
.pd-hud { display: grid; grid-template-columns: 1fr auto 1fr; gap: 18px; align-items: center; margin-bottom: 18px; }
.pd-player-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; background: rgba(255,255,255,0.82); border-radius: 22px; box-shadow: 0 8px 22px rgba(11,41,66,0.12); min-height: 94px; }
.pd-player-meta { display: flex; align-items: center; gap: 12px; flex: 1; }
.pd-avatar-lg { display: grid; place-items: center; width: 58px; height: 58px; border-radius: 16px; background: rgba(198,235,255,0.8); overflow: hidden; }
.pd-avatar-lg img { width: 100%; height: 100%; object-fit: contain; }
.pd-player-bar strong { display: block; font-size: 1.2rem; }
.pd-player-bar small { display: block; font-size: 0.85rem; color: rgba(11,41,66,0.72); }
.pd-score-box { display: flex; align-items: center; justify-content: center; gap: 8px; min-width: 82px; height: 56px; background: linear-gradient(160deg,#ffe7a3,#ffd15d); border-radius: 18px; font-size: 1.5rem; font-weight: 900; }
.pd-die { display: grid; place-items: center; width: 96px; height: 96px; background: rgba(255,255,255,0.88); border-radius: 50%; font-size: 2rem; font-weight: 900; box-shadow: 0 8px 22px rgba(11,41,66,0.12); }
.pd-stage { display: grid; grid-template-columns: 1fr minmax(390px, 460px) 1fr; align-items: center; gap: 16px; height: calc(100% - 160px); }
.pd-rig { position: relative; top: -90px; display: grid; place-items: center; height: 260px; filter: drop-shadow(0 14px 8px rgba(11,41,66,0.25)); animation: pdfloat 2.7s ease-in-out infinite; }
.pd-rig-sprite { width: min(240px, 100%); height: 240px; object-fit: contain; }
.pd-right { animation-delay: -1.2s; }
.pd-center { display: grid; justify-items: center; align-content: center; gap: 16px; }
.pd-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; width: 100%; }
.pd-card-button { display: grid; justify-items: center; gap: 8px; min-height: 190px; padding: 18px 12px; border-radius: 16px; border: 3px solid rgba(11,41,66,0.12); background: linear-gradient(145deg, #164d78, #0a2948); color: white; text-align: center; }
.pd-card-button strong { font-size: 0.9rem; }
.pd-card-back { display: grid; place-items: center; width: 76px; height: 104px; border: 2px solid rgba(255,255,255,0.7); border-radius: 10px; background: repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 6px, transparent 6px 12px); color: #ffd15d; font-size: 3.2rem; font-weight: 900; }
.pd-mute { border: 0; border-radius: 12px; background: rgba(255,255,255,0.85); padding: 10px 16px; font-weight: 800; color: #0b2942; }
.pd-center p { margin: 0; width: 100%; padding: 14px 16px; border-radius: 16px; background: rgba(255,255,255,0.88); font-weight: 700; line-height: 1.4; text-align: center; }
.pd-shark-row { position: absolute; left: 0; right: 0; bottom: -12px; display: flex; align-items: flex-end; justify-content: space-around; height: 150px; padding: 0 2%; pointer-events: none; overflow: hidden; }
.pd-shark-row img { width: clamp(120px, 15vw, 220px); height: 145px; object-fit: contain; animation: pdshark 4.2s ease-in-out infinite; animation-delay: var(--shark-delay); }
.pd-modal { position: fixed; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(6,20,33,0.7); z-index: 5; }
.pd-modal > div { max-width: 420px; width: 100%; padding: 30px; text-align: center; border-radius: 26px; background: #fff; box-shadow: 0 22px 70px rgba(0,0,0,0.3); }
.pd-modal h2 { margin: 0 0 12px; }
.pd-modal p { margin: 0 0 20px; color: rgba(11,41,66,0.8); }
@keyframes pdfloat { 0%, 100% { transform: translate3d(-16px, var(--fall-depth), 0) rotate(-2deg); } 50% { transform: translate3d(16px, calc(var(--fall-depth) - 16px), 0) rotate(2deg); } }
@keyframes pdshark { 0%, 100% { transform: translateX(-34px) translateY(8px) rotate(-2deg) scaleX(1); } 45% { transform: translateX(34px) translateY(-10px) rotate(2deg) scaleX(1); } 50% { transform: translateX(34px) translateY(-10px) rotate(2deg) scaleX(-1); } 95% { transform: translateX(-34px) translateY(8px) rotate(-2deg) scaleX(-1); } }
@media (max-width: 900px) {
  .pd-hud { grid-template-columns: 1fr; }
  .pd-die { justify-self: center; }
  .pd-stage { grid-template-columns: 1fr; height: auto; }
  .pd-rig { top: -45px; height: 160px; }
  .pd-rig-sprite { width: 150px; height: 150px; }
  .pd-stage { grid-template-columns: 1fr; }
  .pd-card-grid { width: min(100%, 460px); }
  .pd-setup-grid { grid-template-columns: 1fr; }
}
`;
