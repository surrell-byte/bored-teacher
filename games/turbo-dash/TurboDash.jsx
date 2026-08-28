import { useEffect, useMemo, useState } from 'react';
import './turboDash.css';

const AVATARS = ['🏎️', '🚗', '🚕', '🚙', '🏍️', '🚐', '🚌', '🚑', '🚒', '🛻', '🚓', '🛺'];
const MOVE_CARDS = [
  { value: 1, label: '+1', name: 'Quick Dash', icon: '⚡' },
  { value: 2, label: '+2', name: 'Overtake', icon: '🏎️' },
  { value: 3, label: '+3', name: 'Full Throttle', icon: '🔥' },
  { value: 6, label: '+6', name: 'Turbo Boost', icon: '🚀' },
];
const FINISH = 32;
const ZONES = {
  3: { icon: '🌴', label: 'SLOW ZONE', effect: -1 },
  7: { icon: '🌉', label: 'OPEN ROAD', effect: 1 },
  11: { icon: '🌉', label: 'BRIDGE BOOST', effect: 2 },
  18: { icon: '💧', label: 'POOL HAZARD', effect: -2 },
  27: { icon: '🌴', label: 'TREE ZONE', effect: -1 },
};
const MUSHROOMS = { 4: 1, 8: -2, 12: 1, 17: -2, 22: 1, 28: -2 };

function trackPoint(index) {
  const angle = (index / FINISH) * Math.PI * 2 - Math.PI / 2;
  return { left: `${50 + Math.cos(angle) * 39}%`, top: `${50 + Math.sin(angle) * 38}%` };
}

function applyLanding(position) {
  let next = Math.min(FINISH, position);
  const messages = [];
  const mushroom = MUSHROOMS[next];
  if (mushroom) {
    next = Math.max(0, Math.min(FINISH, next + mushroom));
    messages.push(mushroom > 0 ? 'GREEN MUSHROOM +1' : 'RED MUSHROOM -2');
  }
  const zone = ZONES[next];
  if (zone) {
    next = Math.max(0, Math.min(FINISH, next + zone.effect));
    messages.push(`${zone.label} ${zone.effect > 0 ? `+${zone.effect}` : zone.effect}`);
  }
  return { position: next, messages };
}

function PlayerCard({ player, index, active }) {
  return (
    <div className={`td-player-progress td-player-${index + 1} ${active ? 'active' : ''}`}>
      <div className="td-avatar-disc">{player.avatar}</div>
      <strong>{player.name}</strong>
      <div className="td-progress"><span style={{ width: `${(player.position / FINISH) * 100}%` }} /></div>
      <small>{player.position}/{FINISH}</small>
      {player.status ? <em>{player.status}</em> : null}
    </div>
  );
}

export default function TurboDash({ onComplete }) {
  const [screen, setScreen] = useState('title');
  const [names, setNames] = useState(['', '']);
  const [players, setPlayers] = useState([
    { name: 'P1', avatar: AVATARS[0], position: 0, status: '' },
    { name: 'P2', avatar: AVATARS[1], position: 0, status: '' },
  ]);
  const [current, setCurrent] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [moveMode, setMoveMode] = useState('dice');
  const [roll, setRoll] = useState(1);
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!rolling) return undefined;
    const timer = setInterval(() => setRoll(Math.floor(Math.random() * 6) + 1), 90);
    return () => clearInterval(timer);
  }, [rolling]);

  const trackCells = useMemo(() => Array.from({ length: FINISH + 1 }, (_, index) => index), []);

  function beginNames() {
    setScreen('names');
  }

  function beginVehicles() {
    if (!names[0].trim() || !names[1].trim()) return;
    setPlayers((previous) => previous.map((player, index) => ({ ...player, name: names[index].trim() })));
    setScreen('vehicles');
  }

  function beginRace() {
    setPlayers((previous) => previous.map((player) => ({ ...player, position: 0, status: '' })));
    setCurrent(0);
    setWinner(null);
    setMessage(`${players[0].avatar} ${players[0].name}'s turn. Press START to spin.`);
    setScreen('game');
  }

  function resolveMove(moveValue) {
    if (moveMode === 'dice' && !rolling) return;
    setRolling(false);
    const playerIndex = current;
    const player = players[playerIndex];
    const move = moveValue ?? roll;
    if (move === 4 || move === 5) {
      const target = move === 4 ? playerIndex : 1 - playerIndex;
      setPlayers((previous) => previous.map((item, index) => index === target ? { ...item, status: 'SKIP' } : item));
      setMessage(move === 4 ? `${player.name} skips their next turn!` : `${players[1 - playerIndex].name} skips their next turn!`);
      setTimeout(() => setCurrent((value) => (value + 1) % 2), 900);
      return;
    }
    const landing = applyLanding(player.position + move);
    setPlayers((previous) => previous.map((item, index) => index === playerIndex ? { ...item, position: landing.position, status: '' } : item));
    setMessage(`${player.name} moved ${move} and landed on square ${landing.position}. ${landing.messages.join(' ')}`);
    if (landing.position >= FINISH) {
      setWinner(playerIndex);
      setScreen('winner');
      onComplete?.(100, 100);
      return;
    }
    setTimeout(() => {
      setCurrent((value) => (value + 1) % 2);
      setMessage(`${players[(playerIndex + 1) % 2].name}'s turn. Press START to spin.`);
    }, 700);
  }

  function stopRoll() {
    if (!rolling) return;
    resolveMove(roll);
  }

  function playCard(card) {
    if (rolling) return;
    resolveMove(card.value);
  }

  function startRoll() {
    if (moveMode !== 'dice') return;
    const player = players[current];
    if (player.status === 'SKIP') {
      setPlayers((previous) => previous.map((item, index) => index === current ? { ...item, status: '' } : item));
      setMessage(`${player.name} skips this turn.`);
      setCurrent((value) => (value + 1) % 2);
      return;
    }
    setRolling(true);
    setMessage(`${player.name} is rolling. Stop when ready!`);
  }

  function reset() {
    setWinner(null);
    setRolling(false);
    setScreen('title');
    setNames(['', '']);
    setMoveMode('dice');
    setPlayers((previous) => previous.map((player, index) => ({ ...player, name: `P${index + 1}`, position: 0, status: '' })));
  }

  if (screen === 'title') return <div className="turbo-dash td-screen"><div className="td-title"><p>PREMIUM BOARD RACER</p><h1>TURBO<br />DASH</h1><div className="td-cars">🏎️ <span>🏁</span> 🚗</div><button className="td-start" onClick={beginNames}>TAP TO RACE</button><small>2 Players · Skill Dice · Landmarks · Powerups</small></div></div>;

  if (screen === 'names') return <div className="turbo-dash td-screen"><h2>ENTER YOUR <b>NAMES</b></h2><div className="td-name-cards">{[0, 1].map((index) => <label key={index} className={`td-name-card td-player-${index + 1}`}><b>PLAYER {index + 1}</b><span>{index ? '🔵' : '🔴'}</span><input value={names[index]} maxLength={14} placeholder="YOUR NAME" onChange={(event) => setNames((previous) => previous.map((name, nameIndex) => nameIndex === index ? event.target.value : name))} /></label>)}</div><button className="td-next" disabled={!names[0].trim() || !names[1].trim()} onClick={beginVehicles}>CHOOSE VEHICLES →</button></div>;

  if (screen === 'vehicles') return <div className="turbo-dash td-screen"><h2>PICK YOUR <b>VEHICLE</b></h2><div className="td-vehicle-section">{players.map((player, index) => <div className="td-vehicle-block" key={index}><div className={`td-preview td-player-${index + 1}`}>{player.avatar}</div><strong>{player.name.toUpperCase()}</strong><div className="td-avatar-grid">{AVATARS.map((avatar) => <button className={avatar === player.avatar ? 'selected' : ''} key={avatar} onClick={() => setPlayers((previous) => previous.map((item, playerIndex) => playerIndex === index ? { ...item, avatar } : item))}>{avatar}</button>)}</div></div>)}</div><button className="td-next" onClick={beginRace}>START RACE 🏁</button></div>;

  if (screen === 'winner') return <div className="turbo-dash td-screen"><div className="td-winner"><span>🎊🏆🎊</span><h1>{players[winner].name.toUpperCase()} WINS!</h1><p>{players[winner].avatar} First across the finish!</p><button className="td-next" onClick={reset}>PLAY AGAIN</button><button className="td-menu" onClick={reset}>MAIN MENU</button></div></div>;

  return <div className="turbo-dash td-game"><header><strong>TURBO DASH</strong><span>{players[current].name.toUpperCase()}'S TURN</span><button onClick={reset}>✕ QUIT</button></header><div className="td-progress-strip"><PlayerCard player={players[0]} index={0} active={current === 0} /><PlayerCard player={players[1]} index={1} active={current === 1} /></div><div className="td-mode-switch" role="group" aria-label="Movement mode"><button className={moveMode === 'dice' ? 'active' : ''} onClick={() => setMoveMode('dice')} disabled={rolling} type="button">🎲 DICE</button><button className={moveMode === 'cards' ? 'active' : ''} onClick={() => setMoveMode('cards')} disabled={rolling} type="button">🃏 CARDS</button></div><div className="td-arena"><main><div className="td-map"><div className="td-track" />{trackCells.map((cell) => <div className={`td-cell ${cell === FINISH ? 'finish' : ''} ${ZONES[cell] ? 'zone' : ''} ${MUSHROOMS[cell] ? 'mushroom' : ''}`} style={trackPoint(cell)} key={cell}>{ZONES[cell]?.icon || (MUSHROOMS[cell] ? '🍄' : cell === FINISH ? '🏆' : cell)}</div>)}{players.map((player, index) => <div className={`td-token token-${index}`} style={trackPoint(player.position)} key={index}>{player.avatar}</div>)}</div><div className="td-message">{message}</div>{moveMode === 'dice' ? <div className="td-controls"><button onClick={startRoll} disabled={rolling}>▶ START</button><div className={`td-die ${rolling ? 'spinning' : ''}`}>{rolling ? roll : roll === 1 ? '🎲' : roll}</div><button onClick={stopRoll} disabled={!rolling}>⏹ STOP</button></div> : <div className="td-card-hand">{MOVE_CARDS.map((card) => <button key={card.value} className="td-move-card" onClick={() => playCard(card)} type="button"><span>{card.icon}</span><strong>{card.label}</strong><small>{card.name}</small></button>)}</div>}</main></div></div>;
}
